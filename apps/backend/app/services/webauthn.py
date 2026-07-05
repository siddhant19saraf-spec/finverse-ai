from __future__ import annotations

from dataclasses import dataclass, field
from typing import Dict, List, Optional, Any
from uuid import uuid4
import hashlib
import secrets


@dataclass
class WebAuthnChallenge:
    challenge_id: str
    user_id: int
    challenge: str
    kind: str
    created_at: str
    used: bool = False
    metadata: Dict[str, Any] = field(default_factory=dict)


class WebAuthnService:
    def __init__(self) -> None:
        self._challenges: Dict[str, WebAuthnChallenge] = {}
        self._credentials: Dict[str, Dict[str, Any]] = {}

    def begin_registration(self, user_id: int, authenticator_name: str) -> Dict[str, Any]:
        challenge_id = str(uuid4())
        challenge = secrets.token_urlsafe(32)
        self._challenges[challenge_id] = WebAuthnChallenge(
            challenge_id=challenge_id,
            user_id=user_id,
            challenge=challenge,
            kind="registration",
            created_at="now",
            metadata={"authenticator_name": authenticator_name},
        )
        return {"challenge_id": challenge_id, "challenge": challenge, "rp_id": "localhost"}

    def finish_registration(
        self,
        challenge_id: str,
        user_id: int,
        authenticator_name: str,
        credential_id: str,
        public_key: str,
        sign_count: int,
    ) -> Dict[str, Any]:
        challenge = self._challenges.get(challenge_id)
        if not challenge or challenge.user_id != user_id or challenge.kind != "registration" or challenge.used:
            return {"verified": False, "credential_id": None}
        challenge.used = True
        self._credentials[credential_id] = {
            "credential_id": credential_id,
            "user_id": user_id,
            "authenticator_name": authenticator_name,
            "public_key": public_key,
            "sign_count": sign_count,
            "replay_protected": True,
        }
        return {"verified": True, "credential_id": credential_id}

    def begin_assertion(self, user_id: int) -> Dict[str, Any]:
        challenge_id = str(uuid4())
        challenge = secrets.token_urlsafe(32)
        self._challenges[challenge_id] = WebAuthnChallenge(
            challenge_id=challenge_id,
            user_id=user_id,
            challenge=challenge,
            kind="assertion",
            created_at="now",
            metadata={"credential_ids": list(self._credentials.keys())},
        )
        return {"challenge_id": challenge_id, "challenge": challenge}

    def finish_assertion(
        self,
        challenge_id: str,
        user_id: int,
        credential_id: str,
        signature: str,
    ) -> Dict[str, Any]:
        challenge = self._challenges.get(challenge_id)
        if not challenge or challenge.user_id != user_id or challenge.kind != "assertion" or challenge.used:
            return {"verified": False, "credential_id": credential_id}
        challenge.used = True
        cred = self._credentials.get(credential_id)
        if not cred or cred["user_id"] != user_id:
            return {"verified": False, "credential_id": credential_id}
        # Replay protection via challenge single-use semantics
        return {"verified": True, "credential_id": credential_id, "signature": signature}

    def list_credentials(self, user_id: int) -> List[Dict[str, Any]]:
        return [c for c in self._credentials.values() if c["user_id"] == user_id]

    def remove_credential(self, user_id: int, credential_id: str) -> bool:
        cred = self._credentials.get(credential_id)
        if cred and cred["user_id"] == user_id:
            del self._credentials[credential_id]
            return True
        return False
