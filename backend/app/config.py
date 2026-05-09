from pydantic_settings import BaseSettings
from functools import lru_cache
from typing import Optional

class Settings(BaseSettings):
    """Application settings loaded from .env file"""
    
    # ============ Riot API Configuration ============
    # need to change region later on chosen region. For now just use this. As regionhas affect
    riot_api_key: str
    riot_region: str = "americas"
    riot_platform: str = "na1"
    
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
    allowed_origins: list = ["http://localhost:3000", "http://localhost:5173", "http://localhost:8080"]
    
    # ============ Logging ============
    log_level: str = "INFO"
    
    class Config:
        env_file = ".env"
        env_file_encoding = "utf-8"
        case_sensitive = False

@lru_cache()
def get_settings() -> Settings:
    """
    Returns cached settings instance.
    Using lru_cache ensures settings are loaded only once.
    """
    return Settings()