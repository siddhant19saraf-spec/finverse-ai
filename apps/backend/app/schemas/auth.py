from pydantic import BaseModel, ConfigDict, EmailStr
from typing import Optional, List
from datetime import datetime


class Token(BaseModel):
    access_token: str
    token_type: str = "bearer"
    refresh_token: Optional[str] = None
    expires_in: int


class TokenPayload(BaseModel):
    sub: str
    exp: int
    scopes: List[str] = []


class UserCreate(BaseModel):
    email: EmailStr
    password: str
    full_name: Optional[str] = None


class UserRead(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    email: EmailStr
    full_name: Optional[str] = None
    is_active: bool


class RefreshRequest(BaseModel):
    refresh_token: str


class WebAuthnAssertionOptions(BaseModel):
    challenge: str


class WebAuthnRegistrationResponse(BaseModel):
    id: str
    rawId: str
    response: dict
    type: str
