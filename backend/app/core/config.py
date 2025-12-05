from pydantic_settings import BaseSettings
from functools import lru_cache


class Settings(BaseSettings):
    # App
    app_name: str = "Infinity8 API"
    debug: bool = False

    # Database
    database_url: str = "postgresql+asyncpg://infinity8:infinity8_secret@localhost:5432/infinity8_db"

    # Supabase Auth
    supabase_jwt_secret: str = "your-supabase-jwt-secret"
    algorithm: str = "HS256"

    # Legacy JWT settings (kept for backwards compatibility)
    secret_key: str = "your-super-secret-key-change-in-production"
    access_token_expire_minutes: int = 60 * 24  # 24 hours

    class Config:
        env_file = ".env"


@lru_cache()
def get_settings() -> Settings:
    return Settings()


settings = get_settings()


