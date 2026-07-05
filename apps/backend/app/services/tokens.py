from datetime import datetime, timedelta
from typing import Optional
from jose import JWTError
from app.core.config import settings
import secrets
from app.services.identity_keys import jwt_key_manager

ALGORITHM = settings.JWT_ALGORITHM
ACCESS_EXPIRE = timedelta(minutes=settings.JWT_ACCESS_TOKEN_EXPIRE_MINUTES)
REFRESH_EXPIRE = timedelta(days=settings.JWT_REFRESH_TOKEN_EXPIRE_DAYS)


def create_access_token(subject: str, scopes: Optional[list] = None) -> tuple[str, int]:
    return jwt_key_manager.create_access_token(subject, scopes)


def create_refresh_token() -> str:
    return secrets.token_urlsafe(64)


def decode_token(token: str) -> dict:
    try:
        return jwt_key_manager.decode_token(token)
    except JWTError as exc:
        raise exc
