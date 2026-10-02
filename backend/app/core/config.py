import os
from typing import List, Union
from pydantic import field_validator
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    PROJECT_NAME: str = "EcoVision"
    VERSION: str = "1.0.0"
    DESCRIPTION: str = "AI-Assisted Biodiversity Monitoring Platform"
    API_V1_STR: str = "/api"

    HOST: str = "0.0.0.0"
    PORT: int = 8000
    DEBUG: bool = True
    ENVIRONMENT: str = "development"

    # CORS
    ALLOWED_ORIGINS: Union[str, List[str]] = [
        "http://localhost:5173",
        "http://localhost:3000",
        "http://127.0.0.1:5173",
        "http://localhost:4173",
    ]

    @field_validator("ALLOWED_ORIGINS", mode="before")
    def parse_allowed_origins(cls, v):
        if isinstance(v, str):
            return [i.strip() for i in v.split(",") if i.strip()]
        return v

    # Supabase credentials
    SUPABASE_URL: str = "https://noloxywukfmeeevvmtsf.supabase.co"
    SUPABASE_ANON_KEY: str = ""
    SUPABASE_SERVICE_ROLE_KEY: str = ""
    STORAGE_BUCKET_NAME: str = "bird-observations"

    # ML Inference Settings
    MODEL_ARCHITECTURE: str = "resnet50"
    MODEL_WEIGHTS_PATH: str = ""
    CONFIDENCE_HIGH_THRESHOLD: float = 0.80
    CONFIDENCE_MEDIUM_THRESHOLD: float = 0.50
    MAX_UPLOAD_SIZE_MB: int = 10

    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        extra="ignore",
    )


settings = Settings()
