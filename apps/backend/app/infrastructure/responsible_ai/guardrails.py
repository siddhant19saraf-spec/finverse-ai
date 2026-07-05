from __future__ import annotations

from datetime import datetime, timezone
from decimal import Decimal

from app.domain.responsible_ai.entities import GuardrailCheck, RiskGuardrailResult
from app.domain.responsible_ai.interfaces import RiskGuardrails


class DefaultRiskGuardrails(RiskGuardrails):
    MAX_SINGLE_INVESTMENT_PCT = Decimal("25")
    MAX_LEVERAGE = Decimal("2")
    MAX_CONCENTRATION_PCT = Decimal("40")

    async def evaluate(self, user_id: int, action: str, context: dict) -> RiskGuardrailResult:
        checks: list[GuardrailCheck] = []
        blocked: list[str] = []
        warnings: list[str] = []

        investment_check = self._check_investment_limits(context)
        checks.append(investment_check)
        if not investment_check.passed:
            blocked.append(investment_check.message)

        concentration_check = self._check_concentration(context)
        checks.append(concentration_check)
        if not concentration_check.passed:
            warnings.append(concentration_check.message)

        risk_tolerance_check = self._check_risk_tolerance(context)
        checks.append(risk_tolerance_check)
        if not risk_tolerance_check.passed:
            warnings.append(risk_tolerance_check.message)

        frequency_check = self._check_trading_frequency(context)
        checks.append(frequency_check)
        if not frequency_check.passed:
            warnings.append(frequency_check.message)

        liquidity_check = self._check_liquidity(context)
        checks.append(liquidity_check)
        if not liquidity_check.passed:
            warnings.append(liquidity_check.message)

        all_passed = all(c.passed for c in checks)

        return RiskGuardrailResult(
            user_id=user_id, all_passed=all_passed, checks=checks,
            blocked_reasons=blocked, warnings=warnings,
            timestamp=datetime.now(timezone.utc),
        )

    def _check_investment_limits(self, context: dict) -> GuardrailCheck:
        investment_pct = context.get("investment_pct", Decimal("0"))
        passed = investment_pct <= self.MAX_SINGLE_INVESTMENT_PCT
        return GuardrailCheck(
            check_name="investment_limits", passed=passed,
            severity="critical" if not passed else "low",
            message=f"Investment at {investment_pct}% exceeds {self.MAX_SINGLE_INVESTMENT_PCT}% limit" if not passed else "Investment within limits",
        )

    def _check_concentration(self, context: dict) -> GuardrailCheck:
        concentration = context.get("sector_concentration", Decimal("0"))
        passed = concentration <= self.MAX_CONCENTRATION_PCT
        return GuardrailCheck(
            check_name="concentration_limit", passed=passed,
            severity="high" if not passed else "low",
            message=f"Sector concentration at {concentration}% exceeds {self.MAX_CONCENTRATION_PCT}%" if not passed else "Concentration within limits",
        )

    def _check_risk_tolerance(self, context: dict) -> GuardrailCheck:
        risk_level = context.get("risk_level", "moderate")
        tolerance = context.get("risk_tolerance", "moderate")
        risk_map = {"conservative": 1, "moderate": 2, "aggressive": 3}
        risk_val = risk_map.get(risk_level, 2)
        tol_val = risk_map.get(tolerance, 2)
        passed = risk_val <= tol_val
        return GuardrailCheck(
            check_name="risk_tolerance_match", passed=passed,
            severity="high" if not passed else "low",
            message=f"Risk level '{risk_level}' exceeds tolerance '{tolerance}'" if not passed else "Risk level within tolerance",
        )

    def _check_trading_frequency(self, context: dict) -> GuardrailCheck:
        trades_today = context.get("trades_today", 0)
        passed = trades_today <= 10
        return GuardrailCheck(
            check_name="trading_frequency", passed=passed,
            severity="medium" if not passed else "low",
            message=f"{trades_today} trades today exceeds daily limit" if not passed else "Trading frequency normal",
        )

    def _check_liquidity(self, context: dict) -> GuardrailCheck:
        liquidity_ratio = context.get("liquidity_ratio", Decimal("1"))
        passed = liquidity_ratio >= Decimal("0.1")
        return GuardrailCheck(
            check_name="liquidity_check", passed=passed,
            severity="high" if not passed else "low",
            message=f"Liquidity ratio {liquidity_ratio} below 10% minimum" if not passed else "Liquidity sufficient",
        )
