from __future__ import annotations

from datetime import datetime, timezone
from uuid import uuid4

from app.domain.compliance.entities import (
    AuditEntry,
    AuditExportRequest,
    AuditExportResult,
    ComplianceResult,
    Regulation,
    RegulatoryReport,
)
from app.domain.compliance.interfaces import (
    AuditExporter,
    AuditRepository,
    ComplianceRuleEngine,
    RegulatoryReportGenerator,
)


class ComplianceService:
    def __init__(
        self,
        engines: list[ComplianceRuleEngine],
        audit_repo: AuditRepository,
        report_generator: RegulatoryReportGenerator,
        audit_exporter: AuditExporter,
    ) -> None:
        self._engines = {e.get_regulation(): e for e in engines}
        self._audit_repo = audit_repo
        self._report_generator = report_generator
        self._audit_exporter = audit_exporter

    async def check_all(self, user_id: int, context: dict) -> list[ComplianceResult]:
        results: list[ComplianceResult] = []
        for engine in self._engines.values():
            result = await engine.evaluate(user_id, context)
            results.append(result)

            for violation in result.violations:
                await self._audit_repo.record(
                    AuditEntry(
                        entry_id=str(uuid4()),
                        entity_type="compliance_check",
                        entity_id=violation.rule_id,
                        action="violation_detected",
                        user_id=user_id,
                        timestamp=datetime.now(timezone.utc),
                        details={
                            "rule_id": violation.rule_id,
                            "regulation": violation.regulation.value,
                            "category": violation.category,
                            "severity": violation.severity.value,
                            "message": violation.message,
                        },
                    )
                )
        return results

    async def check_single(self, user_id: int, regulation: Regulation, context: dict) -> ComplianceResult:
        engine = self._engines.get(regulation)
        if engine is None:
            raise ValueError(f"No compliance engine for regulation: {regulation.value}")
        return await engine.evaluate(user_id, context)

    async def generate_report(
        self,
        user_id: int,
        regulation: Regulation,
        period_start: datetime,
        period_end: datetime,
    ) -> RegulatoryReport:
        return await self._report_generator.generate(
            user_id, regulation, period_start, period_end
        )

    async def export_audit(self, request: AuditExportRequest) -> AuditExportResult:
        return await self._audit_exporter.export(request)

    async def record_audit_entry(self, entry: AuditEntry) -> None:
        await self._audit_repo.record(entry)

    def get_supported_regulations(self) -> list[str]:
        return [r.value for r in self._engines.keys()]
