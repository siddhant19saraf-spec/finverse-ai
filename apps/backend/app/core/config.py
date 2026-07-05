import secrets
from pydantic import AnyHttpUrl, Field
from pydantic_settings import BaseSettings, SettingsConfigDict
from typing import List


class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file=".env", env_file_encoding="utf-8", extra="ignore")

    ENV: str = Field(default="development", validation_alias="ENV")
    APP_NAME: str = "FINVERSE AI Backend"

    DATABASE_URL: str = "sqlite+aiosqlite:///:memory:"
    REDIS_URL: str = "redis://localhost:6379/0"

    # JWT
    JWT_ALGORITHM: str = "HS256"
    JWT_ACCESS_TOKEN_EXPIRE_MINUTES: int = 15
    JWT_REFRESH_TOKEN_EXPIRE_DAYS: int = 30
    JWT_SECRET_KEY: str = Field(default_factory=lambda: secrets.token_hex(32))
    JWT_PRIVATE_KEY_PEM: str = ""
    JWT_PUBLIC_KEY_PEM: str = ""

    # OAuth clients (example structure)
    OAUTH_REDIRECT_URLS: List[AnyHttpUrl] = []

    # WebAuthn
    WEBAUTHN_RP_ID: str = "localhost"
    WEBAUTHN_ORIGINS: List[AnyHttpUrl] = []

    # Security
    RATE_LIMIT_REQUESTS_PER_MINUTE: int = 60

    # CORS
    CORS_ALLOW_ORIGINS: List[str] = Field(
        default_factory=lambda: [
            "http://localhost:3000",
            "http://localhost:3001",
            "http://127.0.0.1:3000",
        ]
    )


settings = Settings()
