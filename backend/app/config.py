from pydantic_settings import BaseSettings, SettingsConfigDict  # type: ignore[import-not-found]
from pydantic import field_validator
from functools import lru_cache
from typing import Any, List, Optional


class Settings(BaseSettings):
    """Application settings loaded from .env file"""

    # ============ Riot API Configuration ============
    riot_api_key: str = ""
    riot_region: str = "americas"
    riot_platform: str = "na1"

    # ============ AWS Cognito Configuration ============
    aws_region: str = "eu-west-1"
    cognito_user_pool_id: str = ""
    cognito_client_id: str = ""
    cognito_client_secret: str = ""

    # ============ Server Configuration ============
    debug: bool = True
    host: str = "0.0.0.0"
    port: int = 8000
    secret_key: str = "your-secret-key-change-in-production"

    # ============ Rate Limiting ============
    rate_limit_requests: int = 20
    rate_limit_seconds: int = 1
    rate_limit_per_2min: int = 100

    # ============ Cache Configuration ============
    # one day based on api life cycle
    cache_ttl: int = 3600  # 1 hour
    redis_url: Optional[str] = "redis://localhost:6379"
    use_redis: bool = False

    # ============ CORS Configuration ============
    allowed_origins: List[str] = [
        "http://localhost:3000",
        "http://localhost:5173",
        "http://localhost:8080",
    ]

    # ============ Logging ============
    log_level: str = "INFO"

    @field_validator("debug", mode="before")
    @classmethod
    def parse_debug(cls, value: Any) -> Any:
        if isinstance(value, str) and value.lower() in {"release", "prod", "production"}:
            return False
        return value

    model_config = SettingsConfigDict(
        env_file=".env", env_file_encoding="utf-8", case_sensitive=False, extra="ignore"
    )


@lru_cache()
def get_settings() -> Settings:
    return Settings()
