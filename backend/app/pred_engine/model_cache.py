"""Fitted models persisted to disk, so a process start is a read rather than a refit.

Fitting all five costs about 137 seconds, and every process paid it on boot: each
gunicorn worker, each `uvicorn --reload` restart, and each test that stands the app up.

Not every model is worth caching, and the deciding number is not the fit time. Measured
on this tree:

    model      fit      on disk    read
    champ_rf   41.0s     148 MB     0.7s
    item_rf    49.6s     355 MB     0.3s
    role_rf    22.6s     441 MB     0.4s
    skill_rf   19.1s     204 MB     0.2s
    knn         7.8s    5723 MB     1.3s warm, 4.3s from an idle NVMe

The four forests are slow to fit and small on disk, which is the whole case for a cache.
The KNN is the opposite: it is the cheapest of the five to fit and pickles to 5.4 GB,
because a bag of 100 neighbour regressors stores 100 bootstrap copies of the training
set. Reading that back beats refitting it only on a fast local disk, and loses badly on
the network-backed storage a container usually gets, for 5.4 GB of image or volume. So
it is fit in-process every time and `CACHED` is False for it.

Set `PRED_ENGINE_MODEL_CACHE` to move the cache elsewhere, e.g. onto a mounted volume.
"""

from __future__ import annotations

import hashlib
import logging
import os
import sys
from contextlib import contextmanager
from dataclasses import dataclass
from pathlib import Path
from typing import Any, Callable, Iterator

import joblib  # type: ignore
import sklearn  # type: ignore

import app.pred_engine.AI_models as ai  # type: ignore

logger = logging.getLogger(__name__)

DEFAULT_CACHE_DIR = Path(__file__).resolve().parent / "model_cache"

# Bump when the meaning of a cache entry changes in a way the fingerprint below would
# otherwise miss, such as a change to how the training data is converted before fitting.
CACHE_FORMAT_VERSION = 1


@dataclass(frozen=True)
class ModelSpec:
    """A model, the data it is fit on, and how to fit it."""

    name: str
    source: Path
    build: Callable[[], Any]
    cached: bool = True


SPECS: tuple[ModelSpec, ...] = (
    ModelSpec("champ_rf", ai.CHAMP_RF_CSV, ai.create_champ_rf),
    ModelSpec("item_rf", ai.ITEM_RF_CSV, ai.create_item_rf),
    ModelSpec("role_rf", ai.ROLE_RF_CSV, ai.create_role_rf),
    ModelSpec("skill_rf", ai.SKILL_RF_CSV, ai.create_skill_rf),
    # 5.4 GB on disk against a 7.8 second fit. See the module docstring.
    ModelSpec("knn", ai.KNN_CSV, ai.create_knn_model, cached=False),
)


def cache_dir() -> Path:
    return Path(os.getenv("PRED_ENGINE_MODEL_CACHE") or DEFAULT_CACHE_DIR)


def fingerprint(spec: ModelSpec) -> str:
    """Identifies what a cache entry was fit from, and what could stop it loading.

    The training data is hashed by content rather than stamped by mtime, because a
    checkout rewrites mtimes without changing a byte. A pickled estimator is also only
    readable by a close enough scikit-learn, so the versions that decide that are part
    of the identity: a mismatch misses the cache rather than raising on load.
    """
    digest = hashlib.blake2b(digest_size=16)
    header = "|".join(
        (
            str(CACHE_FORMAT_VERSION),
            spec.name,
            sklearn.__version__,
            f"{sys.version_info.major}.{sys.version_info.minor}",
        )
    )
    digest.update(header.encode())

    with spec.source.open("rb") as handle:
        for chunk in iter(lambda: handle.read(1 << 20), b""):
            digest.update(chunk)

    return digest.hexdigest()


def cache_path(spec: ModelSpec) -> Path:
    return cache_dir() / f"{spec.name}-{fingerprint(spec)}.joblib"


@contextmanager
def _build_lock(path: Path) -> Iterator[None]:
    """Holds the right to fit `path`, so co-starting workers fit it once between them.

    Whoever gets the lock fits and writes; the rest wait and then find it on disk. A
    platform without flock just runs unlocked, where the worst case is the duplicate
    work this avoids rather than a corrupt file, since writes land by atomic rename.
    """
    try:
        import fcntl
    except ImportError:
        yield
        return

    # One lock per model rather than per entry: a lock named after the fingerprint
    # would leave a file behind on every change to a training set, and would not hold
    # off a worker that wanted a different fingerprint of the same model.
    lock_path = path.parent / f"{path.name.split('-', 1)[0]}.lock"
    lock_path.parent.mkdir(parents=True, exist_ok=True)
    with lock_path.open("w") as handle:
        fcntl.flock(handle, fcntl.LOCK_EX)
        try:
            yield
        finally:
            fcntl.flock(handle, fcntl.LOCK_UN)


def _read(path: Path) -> Any | None:
    """The cached model, or None for any reason it could not be read.

    A cache is an optimisation, so nothing it does is allowed to be fatal: a truncated
    file from a killed build, or a pickle from a scikit-learn too far away, costs a
    refit rather than a failed boot.
    """
    if not path.exists():
        return None
    try:
        return joblib.load(path)
    except Exception as exc:
        logger.warning("Ignoring unreadable model cache %s: %s", path.name, exc)
        return None


def _write(model: Any, path: Path) -> None:
    """Publishes a fitted model by atomic rename, so a reader never sees a part of one."""
    path.parent.mkdir(parents=True, exist_ok=True)
    tmp = path.with_name(f"{path.name}.tmp-{os.getpid()}")
    try:
        joblib.dump(model, tmp)
        os.replace(tmp, path)
    except Exception as exc:
        logger.warning("Could not cache model %s: %s", path.name, exc)
        tmp.unlink(missing_ok=True)
        return

    _prune(path)


def _prune(current: Path) -> None:
    """Drops entries for the same model fit from training data no longer in the tree."""
    name = current.name.split("-", 1)[0]
    for stale in current.parent.glob(f"{name}-*.joblib"):
        if stale != current:
            stale.unlink(missing_ok=True)


def load_or_build(spec: ModelSpec) -> Any:
    """The model, from disk where that is worth doing and from a fresh fit otherwise."""
    if not spec.source.exists():
        # Matches what the builders do with a missing training file: no model, no crash.
        logger.warning("No training data at %s; %s unavailable", spec.source, spec.name)
        return spec.build()

    if not spec.cached:
        return spec.build()

    path = cache_path(spec)
    model = _read(path)
    if model is not None:
        logger.info("Loaded %s from cache", spec.name)
        return model

    with _build_lock(path):
        # Whoever held the lock before us may have just written the thing we want.
        model = _read(path)
        if model is not None:
            logger.info("Loaded %s from cache", spec.name)
            return model

        logger.info(
            "Fitting %s; this is slow and happens once per training set", spec.name
        )
        model = spec.build()
        if model is not None:
            _write(model, path)

    return model


def load_models() -> dict[str, Any]:
    """Every model, keyed by spec name."""
    return {spec.name: load_or_build(spec) for spec in SPECS}


def warm() -> None:
    """Fills the cache ahead of a first request. Run at image build time."""
    logging.basicConfig(level=logging.INFO, format="%(message)s")
    for spec in SPECS:
        if not spec.cached:
            logger.info("Skipping %s; it is fit in-process by design", spec.name)
            continue
        load_or_build(spec)
    logger.info("Model cache warm at %s", cache_dir())


if __name__ == "__main__":
    warm()
