from __future__ import annotations

from datetime import datetime, timezone
from decimal import Decimal

from app.domain.responsible_ai.entities import ResponsibleAIReport
from app.domain.responsible_ai.interfaces import BiasDetector, ComplianceEngine, RiskGuardrails


class ResponsibleAIService:
    def __init__(
        self,
        bias_detector: BiasDetector,
        guardrails: RiskGuardrails,
        compliance: ComplianceEngine,
    ) -> None:
        self._bias = bias_detector
        self._guardrails = guardrails
        self._compliance = compliance

    async def generate_report(self, user_id: int, action: str, context: dict) -> ResponsibleAIReport:
        fairness = await self._bias.detect_bias(user_id, context)
        guardrail_result = await self._guardrails.evaluate(user_id, action, context)
        compliance_checks = await self._compliance.check_compliance(user_id, action, context)

        overall_safe = (
            fairness.overall_score >= Decimal("60")
            and guardrail_result.all_passed
            and all(c.passed for c in compliance_checks)
        )

        return ResponsibleAIReport(
            user_id=user_id, fairness=fairness,
            guardrails=guardrail_result, compliance=compliance_checks,
            overall_safe=overall_safe, timestamp=datetime.now(timezone.utc),
        )

    async def check_action(self, user_id: int, action: str, context: dict) -> dict:
        report = await self.generate_report(user_id, action, context)
        return {
            "allowed": report.overall_safe,
            "fairness_score": str(report.fairness.overall_score),
            "guardrails_passed": report.guardrails.all_passed,
            "compliance_passed": all(c.passed for c in report.compliance),
            "blocked_reasons": report.guardrails.blocked_reasons,
            "warnings": report.guardrails.warnings,
        }
