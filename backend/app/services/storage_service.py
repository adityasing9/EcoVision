"""
Supabase Storage Service for EcoVision.
Handles secure upload, validation, and public URL generation for bird observation imagery.
"""

import io
import logging
import uuid
from typing import Tuple
from PIL import Image
from fastapi import UploadFile, HTTPException, status
from app.core.config import settings
from app.db.supabase import get_supabase_client

logger = logging.getLogger("ecovision.storage")

ALLOWED_MIME_TYPES = {
    "image/jpeg": ".jpg",
    "image/jpg": ".jpg",
    "image/png": ".png",
    "image/webp": ".webp",
}
MAX_FILE_BYTES = settings.MAX_UPLOAD_SIZE_MB * 1024 * 1024


class StorageService:
    def __init__(self):
        self.bucket = settings.STORAGE_BUCKET_NAME

    def validate_image_file(self, file_bytes: bytes, content_type: str) -> str:
        """Validates file size, MIME type, and image structure."""
        if len(file_bytes) > MAX_FILE_BYTES:
            raise HTTPException(
                status_code=status.HTTP_413_REQUEST_ENTITY_TOO_LARGE,
                detail=f"File exceeds maximum allowed size of {settings.MAX_UPLOAD_SIZE_MB}MB.",
            )

        if content_type not in ALLOWED_MIME_TYPES:
            raise HTTPException(
                status_code=status.HTTP_415_UNSUPPORTED_MEDIA_TYPE,
                detail=f"Unsupported format '{content_type}'. Supported formats: JPEG, PNG, WebP.",
            )

        try:
            with Image.open(io.BytesIO(file_bytes)) as img:
                img.verify()
        except Exception:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Malformed or corrupt image file.",
            )

        return ALLOWED_MIME_TYPES[content_type]

    def upload_observation_image(self, file_bytes: bytes, content_type: str, user_id: str = "anonymous") -> str:
        """
        Uploads an image to Supabase Storage and returns its publicly accessible URL.
        """
        ext = self.validate_image_file(file_bytes, content_type)
        file_id = f"{user_id}/{uuid.uuid4().hex}{ext}"
        supabase = get_supabase_client()

        try:
            res = supabase.storage.from_(self.bucket).upload(
                path=file_id,
                file=file_bytes,
                file_options={"content-type": content_type, "upsert": "true"},
            )
            # Retrieve public URL
            public_url = supabase.storage.from_(self.bucket).get_public_url(file_id)
            # Strip trailing query params if present
            clean_url = public_url.split("?")[0] if "?" in public_url else public_url
            logger.info(f"Image successfully uploaded to {clean_url}")
            return clean_url
        except Exception as e:
            logger.error(f"Failed to upload image to Supabase Storage: {e}")
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail=f"Failed to store observation image: {str(e)}",
            )


storage_service = StorageService()
