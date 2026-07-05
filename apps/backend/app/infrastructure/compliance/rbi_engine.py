from __future__ import annotations

from datetime import datetime, timezone
from decimal import Decimal, InvalidOperation

from app.domain.compliance.entities import (
    ComplianceResult,
    Regulation,
    RuleViolation,
)
from app.domain.compliance.interfaces import ComplianceRuleEngine
from app.infrastructure.compliance.rules import RBI_RULES


class RBIComplianceEngine(ComplianceRuleEngine):
    def __init__(self) -> None:
        self._rules = {r.rule_id: r for r in RBI_RULES if r.enabled}

    def get_regulation(self) -> Regulation:
        return Regulation.RBI

    async def evaluate(self, user_id: int, context: dict) -> ComplianceResult:
        violations: list[RuleViolation] = []

        aml_verified = context.get("aml_verified", False)
        if not aml_verified:
            violations.append(
                RuleViolation(
                    rule_id="RBI-001",
                    regulation=Regulation.RBI,
                    category="aml",
                    severity=RBI_RULES[0].severity,
                    message="AML verification not completed",
                )
            )

        transaction_amount = self._parse_decimal(context.get("transaction_amount", "0"))
        rule_002 = self._rules.get("RBI-002")
        if rule_002 and rule_002.threshold and transaction_amount > rule_002.threshold:
            violations.append(
                RuleViolation(
                    rule_id="RBI-002",
                    regulation=Regulation.RBI,
                    category="transaction_limit",
                    severity=rule_002.severity,
                    message=f"Transaction {transaction_amount} exceeds limit {rule_002.threshold}",
                    actual_value=str(transaction_amount),
                    threshold_value=str(rule_002.threshold),
                )
            )

        data_stored_india = context.get("data_stored_india", True)
        if not data_stored_india:
            violations.append(
                RuleViolation(
                    rule_id="RBI-003",
                    regulation=Regulation.RBI,
                    category="data_localization",
                    severity=RBI_RULES[2].severity,
                    message="Payment data not stored within India",
                )
            )

        fraud_detected = context.get("fraud_detected", False)
        if fraud_detected:
            violations.append(
                RuleViolation(
                    rule_id="RBI-004",
                    regulation=Regulation.RBI,
                    category="fraud_monitoring",
                    severity=RBI_RULES[3].severity,
                    message="Fraudulent activity detected in transaction",
                )
            )

        return ComplianceResult(
            user_id=user_id,
            regulation=Regulation.RBI,
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
