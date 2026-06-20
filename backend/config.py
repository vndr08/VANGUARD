from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    DATABASE_URL: str = "sqlite+aiosqlite:///./vanguard.db"
    REDIS_URL: str = "redis://localhost:6379"
    APP_NAME: str = "VANGUARD Fleet Intelligence"
    VERSION: str = "1.0.0"

    model_config = {"env_file": ".env"}


settings = Settings()
