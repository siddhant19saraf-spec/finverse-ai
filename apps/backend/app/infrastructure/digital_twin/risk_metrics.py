from __future__ import annotations

import math
from decimal import Decimal

from app.domain.digital_twin.entities import RiskLevel, RiskMetrics
from app.domain.digital_twin.interfaces import RiskMetricsCalculator


class DefaultRiskMetricsCalculator(RiskMetricsCalculator):
    async def calculate(self, returns: list[Decimal], risk_free_rate: Decimal) -> RiskMetrics:
        if not returns:
            return RiskMetrics(
                value_at_risk_95=Decimal("0"),
                value_at_risk_99=Decimal("0"),
                sharpe_ratio=Decimal("0"),
                sortino_ratio=Decimal("0"),
                max_drawdown=Decimal("0"),
                volatility=Decimal("0"),
                risk_level=RiskLevel.LOW,
                beta=Decimal("1.00"),
            )

        mean_return = sum(returns) / Decimal(str(len(returns)))
        variance = sum((r - mean_return) ** 2 for r in returns) / Decimal(str(len(returns)))
        std_dev = Decimal(str(math.sqrt(float(variance))))

        sharpe = ((mean_return - risk_free_rate) / max(std_dev, Decimal("0.01"))).quantize(Decimal("0.01"))

        downside_returns = [r for r in returns if r < risk_free_rate]
        if downside_returns:
            downside_var = sum((r - risk_free_rate) ** 2 for r in downside_returns) / Decimal(str(len(returns)))
            downside_dev = Decimal(str(math.sqrt(float(downside_var))))
            sortino = ((mean_return - risk_free_rate) / max(downside_dev, Decimal("0.01"))).quantize(Decimal("0.01"))
        else:
            sortino = sharpe

        cumulative = Decimal("1")
        peak = Decimal("1")
        max_dd = Decimal("0")
        for r in returns:
            cumulative *= (1 + r / 100)
            if cumulative > peak:
                peak = cumulative
            dd = (peak - cumulative) / peak * 100
            if dd > max_dd:
                max_dd = dd

        var95 = (std_dev * Decimal("1.645")).quantize(Decimal("0.01"))
        var99 = (std_dev * Decimal("2.326")).quantize(Decimal("0.01"))

        if max_dd > 25:
            risk_level = RiskLevel.VERY_HIGH
        elif max_dd > 15:
            risk_level = RiskLevel.HIGH
        elif max_dd > 8:
            risk_level = RiskLevel.MEDIUM
        else:
            risk_level = RiskLevel.LOW

        return RiskMetrics(
            value_at_risk_95=var95,
            value_at_risk_99=var99,
            sharpe_ratio=sharpe,
            sortino_ratio=sortino,
            max_drawdown=max_dd.quantize(Decimal("0.01")),
            volatility=std_dev.quantize(Decimal("0.01")),
            risk_level=risk_level,
            beta=Decimal("1.00"),
        )
