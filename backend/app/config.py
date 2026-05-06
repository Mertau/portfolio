from pydantic_settings import BaseSettings, SettingsConfigDict
from typing import List


class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file=".env", extra="ignore")

    ENVIRONMENT: str = "development"
    DEBUG: bool = True
    SECRET_KEY: str = "change-me-in-production"
    ALLOWED_ORIGINS: List[str] = ["http://localhost:3000"]

    DATABASE_URL: str = "postgresql+asyncpg://postgres:postgres@localhost:5432/portfolio"
    REDIS_URL: str = "redis://localhost:6379/0"

    JWT_SECRET_KEY: str = "change-me-in-production"
    JWT_ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 15
    REFRESH_TOKEN_EXPIRE_DAYS: int = 7

    GOOGLE_CLIENT_ID: str = ""
    GOOGLE_CLIENT_SECRET: str = ""
    GITHUB_CLIENT_ID: str = ""
    GITHUB_CLIENT_SECRET: str = ""

    SENTRY_DSN: str = ""

    ADMIN_EMAIL: str = "admin@example.com"
    ADMIN_PASSWORD: str = "change-me-in-production"

    RATE_LIMIT_AUTH: int = 10
    RATE_LIMIT_API: int = 100
    MAX_WS_CONNECTIONS_PER_USER: int = 3
    WS_TIMEOUT_SECONDS: int = 1800


settings = Settings()
