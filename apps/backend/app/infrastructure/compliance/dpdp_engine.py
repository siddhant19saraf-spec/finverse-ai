from __future__ import annotations

from datetime import datetime, timezone
from decimal import Decimal, InvalidOperation

from app.domain.compliance.entities import (
    ComplianceResult,
    Regulation,
    RuleViolation,
)
from app.domain.compliance.interfaces import ComplianceRuleEngine
from app.infrastructure.compliance.rules import DPDP_RULES


class DPDPComplianceEngine(ComplianceRuleEngine):
    def __init__(self) -> None:
        self._rules = {r.rule_id: r for r in DPDP_RULES if r.enabled}

    def get_regulation(self) -> Regulation:
        return Regulation.DPDP

    async def evaluate(self, user_id: int, context: dict) -> ComplianceResult:
        violations: list[RuleViolation] = []

        consent_given = context.get("consent_given", False)
        if not consent_given:
            violations.append(
                RuleViolation(
                    rule_id="DPDP-001",
                    regulation=Regulation.DPDP,
                    category="consent",
                    severity=DPDP_RULES[0].severity,
                    message="Explicit consent not obtained for data processing",
                )
            )

        has_excess_data = context.get("excess_data_collected", False)
        if has_excess_data:
            violations.append(
                RuleViolation(
                    rule_id="DPDP-002",
                    regulation=Regulation.DPDP,
                    category="data_minimization",
                    severity=DPDP_RULES[1].severity,
                    message="Data collection exceeds stated purpose (data minimization violation)",
                )
            )

        breach_reported = context.get("breach_reported", True)
        if not breach_reported:
            violations.append(
                RuleViolation(
                    rule_id="DPDP-003",
                    regulation=Regulation.DPDP,
                    category="breach_notification",
                    severity=DPDP_RULES[2].severity,
                    message="Data breach not reported within 72-hour window",
                )
            )

        erasure_requested = context.get("erasure_requested", False)
        erasure_completed = context.get("erasure_completed", True)
        if erasure_requested and not erasure_completed:
            violations.append(
                RuleViolation(
                    rule_id="DPDP-004",
                    regulation=Regulation.DPDP,
                    category="right_to_erasure",
                    severity=DPDP_RULES[3].severity,
                    message="Data erasure request not fulfilled",
                )
            )

        cross_border = context.get("cross_border_transfer", False)
        has_adequate_protection = context.get("adequate_protection", True)
        if cross_border and not has_adequate_protection:
            violations.append(
                RuleViolation(
                    rule_id="DPDP-005",
                    regulation=Regulation.DPDP,
                    category="cross_border_transfer",
                    severity=DPDP_RULES[4].severity,
                    message="Cross-border data transfer without adequate protection",
                )
            )

        return ComplianceResult(
            user_id=user_id,
            regulation=Regulation.DPDP,
            passed=len(violations) == 0,
            violations=violations,
            checked_at=datetime.now(timezone.utc),
        )

    @staticmethod
    def _parse_decimal(value: str | int | float | Decimal) -> Decimal:
        try:
            return Decimal(str(value))
        except (InvalidOperation, ValueError):
            return Decimal("0")
