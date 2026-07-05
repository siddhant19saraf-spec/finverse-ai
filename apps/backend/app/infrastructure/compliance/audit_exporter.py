from __future__ import annotations

from datetime import datetime, timezone
from uuid import uuid4

from app.domain.compliance.entities import AuditExportRequest, AuditExportResult
from app.domain.compliance.interfaces import AuditExporter, AuditRepository


class DefaultAuditExporter(AuditExporter):
    def __init__(self, audit_repo: AuditRepository) -> None:
        self._repo = audit_repo

    async def export(self, request: AuditExportRequest) -> AuditExportResult:
        entries = await self._repo.query(
            regulation=request.regulation,
            date_from=request.date_from,
            date_to=request.date_to,
        )

        return AuditExportResult(
            export_id=str(uuid4()),
            regulation=request.regulation,
            format=request.format,
            date_from=request.date_from,
            date_to=request.date_to,
            entries=entries,
            total_count=len(entries),
            generated_at=datetime.now(timezone.utc),
        )
