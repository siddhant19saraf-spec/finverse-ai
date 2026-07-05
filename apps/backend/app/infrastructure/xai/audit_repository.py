from __future__ import annotations

from typing import Optional

from app.domain.xai.entities import AuditEntry
from app.domain.xai.interfaces import AuditTrailRepository


class InMemoryAuditTrailRepository(AuditTrailRepository):
    def __init__(self) -> None:
        self._entries: dict[str, AuditEntry] = {}

    async def record(self, entry: AuditEntry) -> None:
        self._entries[entry.id] = entry

    async def get_entries(self, user_id: int, limit: int = 50) -> list[AuditEntry]:
        user_entries = [e for e in self._entries.values() if e.user_id == user_id]
        return sorted(user_entries, key=lambda e: e.timestamp, reverse=True)[:limit]

    async def get_entry(self, entry_id: str) -> Optional[AuditEntry]:
        return self._entries.get(entry_id)

    async def search(self, action: Optional[str] = None, user_id: Optional[int] = None) -> list[AuditEntry]:
        results = list(self._entries.values())
        if action:
            results = [e for e in results if e.action == action]
        if user_id is not None:
            results = [e for e in results if e.user_id == user_id]
        return sorted(results, key=lambda e: e.timestamp, reverse=True)
