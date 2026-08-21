from pathlib import Path
from typing import Literal

from fastapi import HTTPException, UploadFile, status

BACKEND_ROOT = Path(__file__).resolve().parents[2]
UPLOADS_DIR = BACKEND_ROOT / "uploads"
ASSETS_DIR = UPLOADS_DIR / "assets"

AssetKind = Literal["maps", "champions"]

MAX_ASSET_BYTES = 5 * 1024 * 1024

ALLOWED_CONTENT_TYPES: dict[str, str] = {
    "image/jpeg": ".jpg",
    "image/png": ".png",
    "image/webp": ".webp",
}


def _kind_dir(kind: AssetKind) -> Path:
    return ASSETS_DIR / kind


def asset_public_path(kind: AssetKind, asset_id: str, ext: str) -> str:
    return f"/uploads/assets/{kind}/{asset_id}{ext}"


def asset_file_path(kind: AssetKind, asset_id: str, ext: str) -> Path:
    return _kind_dir(kind) / f"{asset_id}{ext}"


def ensure_asset_dirs() -> None:
    _kind_dir("maps").mkdir(parents=True, exist_ok=True)
    _kind_dir("champions").mkdir(parents=True, exist_ok=True)


def delete_asset_files(kind: AssetKind, asset_id: str) -> None:
    directory = _kind_dir(kind)
    if not directory.exists():
        return
    for path in directory.glob(f"{asset_id}.*"):
        path.unlink(missing_ok=True)


async def save_asset(kind: AssetKind, asset_id: str, file: UploadFile) -> str:
    """Validate + persist an uploaded asset image, returning its public /uploads path."""
    content_type = (file.content_type or "").split(";")[0].strip().lower()
    ext = ALLOWED_CONTENT_TYPES.get(content_type)
    if not ext:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Image must be JPEG, PNG, or WebP",
        )

    data = await file.read()
    if not data:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Empty file",
        )
    if len(data) > MAX_ASSET_BYTES:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Image must be 5 MB or smaller",
        )

    ensure_asset_dirs()
    delete_asset_files(kind, asset_id)
    dest = asset_file_path(kind, asset_id, ext)
    dest.write_bytes(data)
    return asset_public_path(kind, asset_id, ext)
