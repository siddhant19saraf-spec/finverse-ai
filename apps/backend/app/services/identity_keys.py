from __future__ import annotations

from dataclasses import dataclass
from datetime import datetime, timedelta, timezone
from typing import Dict, List, Optional
from uuid import uuid4

from cryptography.hazmat.primitives import serialization
from cryptography.hazmat.primitives.asymmetric import rsa
from jose import JWTError, jwt

from app.core.config import settings
from app.core.secrets import secrets_manager


@dataclass
class SigningKey:
    key_id: str
    private_key_pem: str
    public_key_pem: str
    created_at: str
    active: bool = True


class JWTKeyManager:
    def __init__(self) -> None:
        self._keys: Dict[str, SigningKey] = {}
        self._active_key_id: Optional[str] = None
        self._initialize()

    def _initialize(self) -> None:
        private_key_pem = secrets_manager.get("jwt_private_key_pem") or settings.JWT_PRIVATE_KEY_PEM
        public_key_pem = secrets_manager.get("jwt_public_key_pem") or settings.JWT_PUBLIC_KEY_PEM
        if private_key_pem and public_key_pem:
            self._keys["active"] = SigningKey(
                key_id="active",
                private_key_pem=private_key_pem,
                public_key_pem=public_key_pem,
                created_at=datetime.now(timezone.utc).isoformat(),
            )
            self._active_key_id = "active"
            return

        private_key = rsa.generate_private_key(public_exponent=65537, key_size=2048)
        private_key_pem = private_key.private_bytes(
            encoding=serialization.Encoding.PEM,
            format=serialization.PrivateFormat.PKCS8,
            encryption_algorithm=serialization.NoEncryption(),
        ).decode("utf-8")
        public_key_pem = private_key.public_key().public_bytes(
            encoding=serialization.Encoding.PEM,
            format=serialization.PublicFormat.SubjectPublicKeyInfo,
        ).decode("utf-8")

        key_id = str(uuid4())
        self._keys[key_id] = SigningKey(
            key_id=key_id,
            private_key_pem=private_key_pem,
            public_key_pem=public_key_pem,
            created_at=datetime.now(timezone.utc).isoformat(),
        )
        self._active_key_id = key_id

    def get_current_key(self) -> SigningKey:
        if self._active_key_id is None:
            raise RuntimeError("No active signing key")
        return self._keys[self._active_key_id]

    def rotate_key(self) -> SigningKey:
        private_key = rsa.generate_private_key(public_exponent=65537, key_size=2048)
        private_key_pem = private_key.private_bytes(
            encoding=serialization.Encoding.PEM,
            format=serialization.PrivateFormat.PKCS8,
            encryption_algorithm=serialization.NoEncryption(),
        ).decode("utf-8")
        public_key_pem = private_key.public_key().public_bytes(
            encoding=serialization.Encoding.PEM,
            format=serialization.PublicFormat.SubjectPublicKeyInfo,
        ).decode("utf-8")
        key_id = str(uuid4())
        self._keys[key_id] = SigningKey(
            key_id=key_id,
            private_key_pem=private_key_pem,
            public_key_pem=public_key_pem,
            created_at=datetime.now(timezone.utc).isoformat(),
        )
        self._active_key_id = key_id
        return self._keys[key_id]

    def create_access_token(self, subject: str, scopes: Optional[List[str]] = None) -> tuple[str, int]:
        key = self.get_current_key()
        now = datetime.now(timezone.utc)
        expire = now + timedelta(minutes=settings.JWT_ACCESS_TOKEN_EXPIRE_MINUTES)
        claims = {
            "sub": str(subject),
            "exp": int(expire.timestamp()),
            "iat": int(now.timestamp()),
            "iss": settings.APP_NAME,
            "jti": str(uuid4()),
        }
        if scopes:
            claims["scopes"] = scopes
        token = jwt.encode(
            claims,
            key.private_key_pem,
            algorithm="RS256",
            headers={"kid": key.key_id},
        )
        return token, int(settings.JWT_ACCESS_TOKEN_EXPIRE_MINUTES * 60)

    def decode_token(self, token: str) -> Dict[str, object]:
        last_error: Optional[Exception] = None
        for key in self._keys.values():
            try:
                return jwt.decode(
                    token,
                    key.public_key_pem,
                    algorithms=["RS256"],
                    issuer=settings.APP_NAME,
                )
            except JWTError as exc:
                last_error = exc
        if last_error is not None:
            raise last_error
        raise JWTError("No verification keys available")

    def public_jwks(self) -> Dict[str, object]:
        keys: List[Dict[str, object]] = []
        for key in self._keys.values():
            public_key = serialization.load_pem_public_key(key.public_key_pem.encode("utf-8"))
            numbers = public_key.public_numbers()
            modulus = numbers.n.to_bytes((numbers.n.bit_length() + 7) // 8, "big")
            exponent = numbers.e.to_bytes((numbers.e.bit_length() + 7) // 8, "big")
            import base64

            keys.append(
                {
                    "kty": "RSA",
                    "use": "sig",
                    "alg": "RS256",
                    "kid": key.key_id,
                    "n": base64.urlsafe_b64encode(modulus).rstrip(b"=").decode("ascii"),
                    "e": base64.urlsafe_b64encode(exponent).rstrip(b"=").decode("ascii"),
                }
            )
        return {"keys": keys}


jwt_key_manager = JWTKeyManager()
