from __future__ import annotations

from dataclasses import dataclass
from typing import Dict, Optional
from urllib.parse import urlencode, parse_qsl
import hashlib
import secrets


@dataclass(frozen=True)
class OAuthProviderConfig:
    name: str
    client_id: str
    authorize_url: str
    token_url: str
    scope: str = "openid email profile"


class OAuthService:
    def __init__(self, providers: Optional[Dict[str, OAuthProviderConfig]] = None) -> None:
        self._providers = providers or {}

    def create_authorization_request(self, provider_name: str, redirect_uri: str) -> Dict[str, str]:
        provider = self._providers.get(provider_name)
        if not provider:
            raise ValueError(f"Unsupported provider: {provider_name}")
        code_verifier = secrets.token_urlsafe(64)
        code_challenge = hashlib.sha256(code_verifier.encode("utf-8")).digest()
        challenge_b64 = __import__("base64").urlsafe_b64encode(code_challenge).decode("ascii").rstrip("=")
        params = {
            "client_id": provider.client_id,
            "redirect_uri": redirect_uri,
            "response_type": "code",
            "scope": provider.scope,
            "code_challenge": challenge_b64,
            "code_challenge_method": "S256",
        }
        return {"url": f"{provider.authorize_url}?{urlencode(params)}", "code_verifier": code_verifier}

    def validate_callback(self, provider_name: str, state: str, code: str) -> Dict[str, str]:
        provider = self._providers.get(provider_name)
        if not provider:
            raise ValueError(f"Unsupported provider: {provider_name}")
        if not state or not code:
            raise ValueError("state and code are required")
        return {"provider": provider_name, "state": state, "code": code}
