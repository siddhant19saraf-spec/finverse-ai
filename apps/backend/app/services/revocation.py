from __future__ import annotations

from dataclasses import dataclass
from typing import Dict, List, Optional
from uuid import uuid4


@dataclass
class RevocationEntry:
    token_id: str
    reason: str
    created_at: str


class RevocationStore:
    def __init__(self) -> None:
        self._revocations: Dict[str, RevocationEntry] = {}

    def revoke(self, token_id: str, reason: str = "manual") -> RevocationEntry:
        entry = RevocationEntry(token_id=token_id, reason=reason, created_at="now")
        self._revocations[token_id] = entry
        return entry

    def is_revoked(self, token_id: str) -> bool:
        return token_id in self._revocations

    def list(self) -> List[RevocationEntry]:
        return list(self._revocations.values())
