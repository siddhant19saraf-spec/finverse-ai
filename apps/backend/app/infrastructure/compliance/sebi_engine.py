from __future__ import annotations

from datetime import datetime, timezone
from decimal import Decimal, InvalidOperation

from app.domain.compliance.entities import (
    ComplianceResult,
    Regulation,
    RuleViolation,
)
from app.domain.compliance.interfaces import ComplianceRuleEngine
from app.infrastructure.compliance.rules import SEBI_RULES


class SEBIComplianceEngine(ComplianceRuleEngine):
    def __init__(self) -> None:
        self._rules = {r.rule_id: r for r in SEBI_RULES if r.enabled}

    def get_regulation(self) -> Regulation:
        return Regulation.SEBI

    async def evaluate(self, user_id: int, context: dict) -> ComplianceResult:
        violations: list[RuleViolation] = []

        if not context.get("kyc_verified", False):
            violations.append(
                RuleViolation(
                    rule_id="SEBI-001",
                    regulation=Regulation.SEBI,
                    category="kyc",
                    severity=SEBI_RULES[0].severity,
                    message="KYC verification not completed",
                )
            )

        daily_investment = self._parse_decimal(context.get("daily_investment", "0"))
        rule_002 = self._rules.get("SEBI-002")
        if rule_002 and rule_002.threshold and daily_investment > rule_002.threshold:
            violations.append(
                RuleViolation(
                    rule_id="SEBI-002",
                    regulation=Regulation.SEBI,
                    category="investment_limit",
                    severity=rule_002.severity,
                    message=f"Daily investment {daily_investment} exceeds limit {rule_002.threshold}",
                    actual_value=str(daily_investment),
                    threshold_value=str(rule_002.threshold),
                )
            )

        has_derivatives = context.get("has_derivatives", False)
        risk_profiled = context.get("risk_profiled", False)
        if has_derivatives and not risk_profiled:
            violations.append(
                RuleViolation(
                    rule_id="SEBI-004",
                    regulation=Regulation.SEBI,
                    category="risk_assessment",
                    severity=SEBI_RULES[3].severity,
                    message="Risk profiling not completed for derivatives access",
                )
            )

        transaction_amount = self._parse_decimal(context.get("transaction_amount", "0"))
        rule_005 = self._rules.get("SEBI-005")
        if rule_005 and rule_005.threshold and transaction_amount > rule_005.threshold:
            violations.append(
                RuleViolation(
                    rule_id="SEBI-005",
                    regulation=Regulation.SEBI,
                    category="transaction_monitoring",
                    severity=rule_005.severity,
                    message=f"Transaction {transaction_amount} exceeds suspicious threshold {rule_005.threshold}",
                    actual_value=str(transaction_amount),
                    threshold_value=str(rule_005.threshold),
                )
            )

        return ComplianceResult(
            user_id=user_id,
            regulation=Regulation.SEBI,
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
