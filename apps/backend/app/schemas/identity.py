from pydantic import BaseModel, Field
from typing import List, Optional


class OAuthRequest(BaseModel):
    provider: str
    redirect_uri: str


class OAuthCallback(BaseModel):
    provider: str
    state: str
    code: str


class MFAEnrollment(BaseModel):
    secret: str
    token: str


class BackupCodeRequest(BaseModel):
    backup_codes: List[str]


class SessionCreateRequest(BaseModel):
    user_id: int
    ip_address: str = Field(default="127.0.0.1")
    user_agent: str = Field(default="unknown")
