from pathlib import Path

from pydantic_settings import BaseSettings


PROJECT_ROOT = Path(__file__).resolve().parent.parent
DEFAULT_DATABASE_URL = f"sqlite+aiosqlite:///{PROJECT_ROOT / 'vanguard.db'}"


class Settings(BaseSettings):
    DATABASE_URL: str = DEFAULT_DATABASE_URL
    REDIS_URL: str = "redis://localhost:6379"
    CORS_ORIGINS: str = "http://localhost:3000,http://127.0.0.1:3000"
    APP_NAME: str = "VANGUARD Fleet Intelligence"
    VERSION: str = "1.0.0"

    model_config = {"env_file": ".env"}

    @property
    def cors_origins(self) -> list[str]:
        return [origin.strip() for origin in self.CORS_ORIGINS.split(",") if origin.strip()]


settings = Settings()
