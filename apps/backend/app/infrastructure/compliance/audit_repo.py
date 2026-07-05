from __future__ import annotations

from datetime import datetime

from app.domain.compliance.entities import AuditEntry, Regulation
from app.domain.compliance.interfaces import AuditRepository


class InMemoryAuditRepository(AuditRepository):
    def __init__(self) -> None:
        self._entries: list[AuditEntry] = []

    async def record(self, entry: AuditEntry) -> None:
        self._entries.append(entry)

    async def query(
        self,
        regulation: Regulation,
        date_from: datetime,
        date_to: datetime,
    ) -> list[AuditEntry]:
        return [
            e
            for e in self._entries
            if e.timestamp >= date_from and e.timestamp <= date_to
        ]
