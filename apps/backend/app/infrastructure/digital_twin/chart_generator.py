from __future__ import annotations

from decimal import Decimal

from app.domain.digital_twin.entities import ChartDataPoint, ScenarioResult
from app.domain.digital_twin.interfaces import ChartDataGenerator


class DefaultChartDataGenerator(ChartDataGenerator):
    async def generate(self, scenarios: list[ScenarioResult]) -> list[ChartDataPoint]:
        if not scenarios:
            return []

        max_years = max(len(s.yearly_projections) for s in scenarios)
        baseline = scenarios[0] if scenarios else None
        optimistic = scenarios[1] if len(scenarios) > 1 else None
        pessimistic = scenarios[2] if len(scenarios) > 2 else None

        chart_data: list[ChartDataPoint] = []
        for i in range(max_years):
            base_val = baseline.yearly_projections[i].portfolio_value if baseline and i < len(baseline.yearly_projections) else Decimal("0")
            opt_val = optimistic.yearly_projections[i].portfolio_value if optimistic and i < len(optimistic.yearly_projections) else Decimal("0")
            pess_val = pessimistic.yearly_projections[i].portfolio_value if pessimistic and i < len(pessimistic.yearly_projections) else Decimal("0")

            conf_lower = base_val * Decimal("0.6")
            conf_upper = base_val * Decimal("1.5")
            if baseline and i < len(baseline.yearly_projections) and baseline.yearly_projections[i].confidence:
                conf_lower = baseline.yearly_projections[i].confidence.lower_5
                conf_upper = baseline.yearly_projections[i].confidence.upper_95

            chart_data.append(ChartDataPoint(
                year=i + 1,
                label=f"Year {i + 1}",
                optimistic=opt_val.quantize(Decimal("1")),
                baseline=base_val.quantize(Decimal("1")),
                pessimistic=pess_val.quantize(Decimal("1")),
                confidence_lower=conf_lower.quantize(Decimal("1")),
                confidence_upper=conf_upper.quantize(Decimal("1")),
            ))

        return chart_data
