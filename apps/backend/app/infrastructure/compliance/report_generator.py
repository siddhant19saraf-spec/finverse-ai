from __future__ import annotations

from datetime import datetime, timezone
from uuid import uuid4

from app.domain.compliance.entities import (
    ComplianceResult,
    Regulation,
    RegulatoryReport,
    ReportStatus,
)
from app.domain.compliance.interfaces import ComplianceRuleEngine, RegulatoryReportGenerator


class DefaultReportGenerator(RegulatoryReportGenerator):
    def __init__(self, engines: list[ComplianceRuleEngine]) -> None:
        self._engines = {e.get_regulation(): e for e in engines}

    async def generate(
        self,
        user_id: int,
        regulation: Regulation,
        period_start: datetime,
        period_end: datetime,
    ) -> RegulatoryReport:
        engine = self._engines.get(regulation)
        if engine is None:
            raise ValueError(f"No compliance engine for regulation: {regulation.value}")

        result = await engine.evaluate(user_id, context={})

        total_rules = len(result.violations) + (1 if result.passed else 0)
        critical_count = sum(1 for v in result.violations if v.severity.value == "critical")
        high_count = sum(1 for v in result.violations if v.severity.value == "high")

        summary = {
            "total_checks": max(total_rules, 1),
            "passed": result.passed,
            "critical_violations": critical_count,
            "high_violations": high_count,
            "compliance_score": "100.00" if result.passed else f"{max(0, 100 - critical_count * 25 - high_count * 10):.2f}",
        }

        return RegulatoryReport(
            report_id=str(uuid4()),
            user_id=user_id,
            regulation=regulation,
            period_start=period_start,
            period_end=period_end,
            status=ReportStatus.GENERATED if result.passed else ReportStatus.FAILED,
            findings=[result],
            summary=summary,
            generated_at=datetime.now(timezone.utc),
        )
