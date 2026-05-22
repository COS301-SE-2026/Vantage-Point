from pathlib import Path

from fastapi import HTTPException, UploadFile, status

BACKEND_ROOT = Path(__file__).resolve().parents[2]
UPLOADS_DIR = BACKEND_ROOT / "uploads"
AVATARS_DIR = UPLOADS_DIR / "avatars"

MAX_AVATAR_BYTES = 2 * 1024 * 1024

ALLOWED_CONTENT_TYPES: dict[str, str] = {
    "image/jpeg": ".jpg",
    "image/png": ".png",
    "image/webp": ".webp",
}


def avatar_public_path(user_id: str, ext: str) -> str:
    return f"/uploads/avatars/{user_id}{ext}"


def avatar_file_path(user_id: str, ext: str) -> Path:
    return AVATARS_DIR / f"{user_id}{ext}"


def ensure_avatar_dir() -> None:
    AVATARS_DIR.mkdir(parents=True, exist_ok=True)


def delete_avatar_files(user_id: str) -> None:
    if not AVATARS_DIR.exists():
        return
    for path in AVATARS_DIR.glob(f"{user_id}.*"):
        path.unlink(missing_ok=True)


async def save_avatar(user_id: str, file: UploadFile) -> str:
    content_type = (file.content_type or "").split(";")[0].strip().lower()
    ext = ALLOWED_CONTENT_TYPES.get(content_type)
    if not ext:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Avatar must be JPEG, PNG, or WebP",
        )

    data = await file.read()
    if not data:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Empty file",
        )
    if len(data) > MAX_AVATAR_BYTES:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Avatar must be 2 MB or smaller",
        )

    ensure_avatar_dir()
    delete_avatar_files(user_id)
    dest = avatar_file_path(user_id, ext)
    dest.write_bytes(data)
    return avatar_public_path(user_id, ext)
