from fastapi import APIRouter, HTTPException
from typing import Dict
from app.schemas.identity import OAuthRequest, OAuthCallback
from app.services.oauth import OAuthService, OAuthProviderConfig

router = APIRouter(prefix="/v1/oauth", tags=["oauth"])
service = OAuthService(
    providers={
        "google": OAuthProviderConfig(
            name="google",
            client_id="",
            authorize_url="https://accounts.google.com/o/oauth2/v2/auth",
            token_url="https://oauth2.googleapis.com/token",
        ),
        "github": OAuthProviderConfig(
            name="github",
            client_id="",
            authorize_url="https://github.com/login/oauth/authorize",
            token_url="https://github.com/login/oauth/access_token",
        ),
    }
)


@router.post("/authorize")
async def authorize(payload: OAuthRequest) -> Dict[str, str]:
    return service.create_authorization_request(payload.provider, payload.redirect_uri)


@router.post("/callback")
async def callback(payload: OAuthCallback) -> Dict[str, str]:
    try:
        return service.validate_callback(payload.provider, payload.state, payload.code)
    except ValueError as exc:
        raise HTTPException(status_code=400, detail=str(exc)) from exc
