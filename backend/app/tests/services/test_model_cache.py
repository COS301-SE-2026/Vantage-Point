"""Disk persistence for the fitted models.

Everything here uses a stand-in estimator: the real ones cost minutes to fit, and none
of the behaviour under test depends on what is being cached.
"""

import sys
from types import SimpleNamespace

import joblib
import pytest
import sklearn

from app.pred_engine import model_cache
from app.pred_engine.model_cache import ModelSpec, load_or_build


class Stub:
    """Stands in for an estimator, and counts how often it had to be built."""

    builds = 0

    def __init__(self, tag: str):
        self.tag = tag

    def __eq__(self, other):
        return isinstance(other, Stub) and other.tag == self.tag


@pytest.fixture
def cache(tmp_path, monkeypatch):
    monkeypatch.setenv("PRED_ENGINE_MODEL_CACHE", str(tmp_path / "cache"))
    return tmp_path / "cache"


@pytest.fixture
def spec(tmp_path):
    source = tmp_path / "training.csv"
    source.write_text("x,y\n1,2\n")

    Stub.builds = 0

    def build():
        Stub.builds += 1
        return Stub("fitted")

    return ModelSpec("stub", source, build)


class TestLoadOrBuild:
    def test_first_call_fits_and_leaves_it_on_disk(self, cache, spec):
        model = load_or_build(spec)

        assert model == Stub("fitted")
        assert Stub.builds == 1
        assert list(cache.glob("stub-*.joblib"))

    def test_second_call_reads_rather_than_refits(self, cache, spec):
        load_or_build(spec)
        model = load_or_build(spec)

        assert model == Stub("fitted")
        assert Stub.builds == 1

    def test_a_model_marked_uncached_is_always_fitted(self, cache, spec):
        uncached = ModelSpec(spec.name, spec.source, spec.build, cached=False)

        load_or_build(uncached)
        load_or_build(uncached)

        assert Stub.builds == 2
        assert not cache.exists()

    def test_missing_training_data_is_left_to_the_builder(self, cache, spec):
        spec.source.unlink()

        # The builders answer None rather than raising, and that has to survive the
        # cache: a missing csv is a model that is unavailable, not a failed boot.
        assert load_or_build(ModelSpec("stub", spec.source, lambda: None)) is None
        assert not cache.exists()


class TestInvalidation:
    def test_changed_training_data_is_refitted(self, cache, spec):
        load_or_build(spec)
        spec.source.write_text("x,y\n3,4\n")

        load_or_build(spec)

        assert Stub.builds == 2

    def test_the_entry_it_replaces_is_pruned(self, cache, spec):
        load_or_build(spec)
        spec.source.write_text("x,y\n3,4\n")
        load_or_build(spec)

        # Otherwise every edit to a training set leaves another 150 MB behind.
        assert len(list(cache.glob("stub-*.joblib"))) == 1

    def test_a_different_sklearn_does_not_read_the_old_pickle(
        self, cache, spec, monkeypatch
    ):
        load_or_build(spec)
        monkeypatch.setattr(sklearn, "__version__", f"{sklearn.__version__}.99")

        load_or_build(spec)

        assert Stub.builds == 2

    def test_a_different_python_does_not_read_the_old_pickle(
        self, cache, spec, monkeypatch
    ):
        before = model_cache.cache_path(spec)
        bumped = SimpleNamespace(
            major=sys.version_info.major, minor=sys.version_info.minor + 1
        )
        monkeypatch.setattr(sys, "version_info", bumped)

        assert model_cache.cache_path(spec) != before


class TestCorruptEntries:
    def test_an_unreadable_entry_costs_a_refit_not_a_crash(self, cache, spec):
        load_or_build(spec)
        path = next(cache.glob("stub-*.joblib"))
        path.write_bytes(b"not a pickle")

        assert load_or_build(spec) == Stub("fitted")
        assert Stub.builds == 2

    def test_a_truncated_entry_costs_a_refit_not_a_crash(self, cache, spec):
        load_or_build(spec)
        path = next(cache.glob("stub-*.joblib"))
        path.write_bytes(path.read_bytes()[:64])

        assert load_or_build(spec) == Stub("fitted")
        assert Stub.builds == 2

    def test_a_failed_write_leaves_no_temp_file_behind(self, cache, spec, monkeypatch):
        def explode(*_args, **_kwargs):
            raise OSError("disk full")

        monkeypatch.setattr(joblib, "dump", explode)

        # The model is still returned; only its persistence failed.
        assert load_or_build(spec) == Stub("fitted")
        assert not list(cache.glob("*.tmp-*"))


class TestCoStartingWorkers:
    """Gunicorn starts its workers together, and they all want the same model."""

    def test_a_model_written_while_we_waited_for_the_lock_is_not_refitted(
        self, cache, spec, monkeypatch
    ):
        import contextlib

        # Stand in for another worker finishing its fit while this one blocked on the
        # lock. Without the re-read inside the lock, this one would fit it all over
        # again and overwrite a perfectly good entry.
        @contextlib.contextmanager
        def lock_that_another_worker_held(path):
            model_cache._write(Stub("from the other worker"), path)
            yield

        monkeypatch.setattr(model_cache, "_build_lock", lock_that_another_worker_held)

        model = load_or_build(spec)

        assert model == Stub("from the other worker")
        assert Stub.builds == 0


class TestSpecs:
    def test_every_shipped_model_is_covered(self):
        assert {spec.name for spec in model_cache.SPECS} == {
            "champ_rf",
            "item_rf",
            "role_rf",
            "skill_rf",
            "knn",
        }

    def test_the_knn_is_the_one_left_uncached(self):
        # 5.4 GB on disk against a 7.8 second fit; see the module docstring.
        uncached = {spec.name for spec in model_cache.SPECS if not spec.cached}
        assert uncached == {"knn"}

    def test_each_spec_points_at_training_data_that_exists(self):
        for spec in model_cache.SPECS:
            assert spec.source.exists(), spec.source
