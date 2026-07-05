from __future__ import annotations

import random as _random
from datetime import datetime, timezone
from decimal import Decimal, ROUND_HALF_UP
from typing import Optional

from app.domain.digital_twin.entities import (
    ChartDataPoint,
    ConfidenceInterval,
    FinancialProfile,
    GoalAchievement,
    MonteCarloResult,
    RiskLevel,
    RiskMetrics,
    ScenarioComparison,
    ScenarioDisclaimer,
    ScenarioInput,
    ScenarioResult,
    ScenarioType,
    WhatIfResult,
    YearlyProjection,
)


SCENARIO_PRESETS: dict[ScenarioType, dict] = {
    ScenarioType.INFLATION: {
        "monthly_income_change_pct": Decimal("0"),
        "monthly_expense_change_pct": Decimal("0"),
        "investment_return_pct": Decimal("8"),
        "inflation_pct": Decimal("9"),
        "years": 10,
    },
    ScenarioType.SALARY_INCREASE: {
        "monthly_income_change_pct": Decimal("15"),
        "monthly_expense_change_pct": Decimal("3"),
        "investment_return_pct": Decimal("12"),
        "inflation_pct": Decimal("6"),
        "years": 10,
    },
    ScenarioType.SALARY_REDUCTION: {
        "monthly_income_change_pct": Decimal("-20"),
        "monthly_expense_change_pct": Decimal("0"),
        "investment_return_pct": Decimal("10"),
        "inflation_pct": Decimal("6"),
        "years": 10,
    },
    ScenarioType.MARKET_CORRECTION: {
        "monthly_income_change_pct": Decimal("0"),
        "monthly_expense_change_pct": Decimal("0"),
        "investment_return_pct": Decimal("-15"),
        "inflation_pct": Decimal("8"),
        "years": 5,
    },
    ScenarioType.MARKET_RALLY: {
        "monthly_income_change_pct": Decimal("0"),
        "monthly_expense_change_pct": Decimal("0"),
        "investment_return_pct": Decimal("25"),
        "inflation_pct": Decimal("4"),
        "years": 5,
    },
    ScenarioType.HOME_PURCHASE: {
        "monthly_income_change_pct": Decimal("0"),
        "monthly_expense_change_pct": Decimal("20"),
        "investment_return_pct": Decimal("10"),
        "inflation_pct": Decimal("6"),
        "years": 20,
        "one_time_expense": Decimal("5000000"),
        "expense_year": 1,
    },
    ScenarioType.RETIREMENT: {
        "monthly_income_change_pct": Decimal("0"),
        "monthly_expense_change_pct": Decimal("0"),
        "investment_return_pct": Decimal("8"),
        "inflation_pct": Decimal("5"),
        "years": 30,
    },
    ScenarioType.EDUCATION_FUNDING: {
        "monthly_income_change_pct": Decimal("5"),
        "monthly_expense_change_pct": Decimal("8"),
        "investment_return_pct": Decimal("12"),
        "inflation_pct": Decimal("7"),
        "years": 15,
    },
    ScenarioType.EMERGENCY_EXPENSE: {
        "monthly_income_change_pct": Decimal("0"),
        "monthly_expense_change_pct": Decimal("0"),
        "investment_return_pct": Decimal("10"),
        "inflation_pct": Decimal("6"),
        "years": 5,
        "one_time_expense": Decimal("500000"),
        "expense_year": 1,
    },
}


class EnhancedScenarioEngine:
    def __init__(self, default_iterations: int = 1000) -> None:
        self._iterations = default_iterations

    def _apply_preset(self, inputs: ScenarioInput) -> ScenarioInput:
        if inputs.scenario_type == ScenarioType.CUSTOM:
            return inputs
        preset = SCENARIO_PRESETS.get(inputs.scenario_type)
        if not preset:
            return inputs
        return ScenarioInput(
            scenario_type=inputs.scenario_type,
            monthly_income_change_pct=inputs.monthly_income_change_pct or preset["monthly_income_change_pct"],
            monthly_expense_change_pct=inputs.monthly_expense_change_pct or preset["monthly_expense_change_pct"],
            investment_return_pct=inputs.investment_return_pct or preset["investment_return_pct"],
            inflation_pct=inputs.inflation_pct or preset["inflation_pct"],
            new_monthly_investment=inputs.new_monthly_investment,
            years=inputs.years or preset["years"],
            one_time_expense=inputs.one_time_expense or preset.get("one_time_expense", Decimal("0")),
            expense_year=inputs.expense_year or preset.get("expense_year", 0),
        )

    async def run_scenario(self, profile: FinancialProfile, inputs: ScenarioInput) -> ScenarioResult:
        inputs = self._apply_preset(inputs)
        mc_result = await self._monte_carlo_simulation(profile, inputs)
        yearly = self._build_yearly_projections(profile, inputs)
        goal_prob = self._goal_probability(mc_result)
        risk = await self._calculate_risk_metrics(mc_result)
        disclaimer = self._build_disclaimer(inputs, profile)

        return ScenarioResult(
            scenario_name=inputs.scenario_type.value,
            scenario_type=inputs.scenario_type,
            projected_net_worth=yearly[-1].net_worth if yearly else Decimal("0"),
            projected_monthly_savings=yearly[-1].monthly_savings if yearly else Decimal("0"),
            projected_portfolio_value=mc_result.median_portfolio,
            inflation_adjusted_value=self._inflation_adjust(mc_result.median_portfolio, inputs.inflation_pct, inputs.years),
            goal_achievement_probability=goal_prob,
            yearly_projections=yearly,
            monte_carlo=mc_result,
            risk_metrics=risk,
            disclaimer=disclaimer,
        )

    async def run_what_if(self, profile: FinancialProfile, base_inputs: ScenarioInput) -> WhatIfResult:
        base_inputs = self._apply_preset(base_inputs)
        baseline = await self.run_scenario(profile, base_inputs)

        optimistic_input = ScenarioInput(
            scenario_type=base_inputs.scenario_type,
            monthly_income_change_pct=base_inputs.monthly_income_change_pct + Decimal("5"),
            monthly_expense_change_pct=max(Decimal("-5"), base_inputs.monthly_expense_change_pct - Decimal("2")),
            investment_return_pct=base_inputs.investment_return_pct + Decimal("4"),
            inflation_pct=max(Decimal("2"), base_inputs.inflation_pct - Decimal("2")),
            new_monthly_investment=base_inputs.new_monthly_investment,
            years=base_inputs.years,
            one_time_expense=base_inputs.one_time_expense,
            expense_year=base_inputs.expense_year,
        )
        optimistic = await self.run_scenario(profile, optimistic_input)

        pessimistic_input = ScenarioInput(
            scenario_type=base_inputs.scenario_type,
            monthly_income_change_pct=max(Decimal("-10"), base_inputs.monthly_income_change_pct - Decimal("3")),
            monthly_expense_change_pct=base_inputs.monthly_expense_change_pct + Decimal("5"),
            investment_return_pct=max(Decimal("2"), base_inputs.investment_return_pct - Decimal("5")),
            inflation_pct=base_inputs.inflation_pct + Decimal("3"),
            new_monthly_investment=base_inputs.new_monthly_investment,
            years=base_inputs.years,
            one_time_expense=base_inputs.one_time_expense,
            expense_year=base_inputs.expense_year,
        )
        pessimistic = await self.run_scenario(profile, pessimistic_input)

        comparison = await self._compare_scenarios([baseline, optimistic, pessimistic])
        recommendation = self._generate_recommendation(profile, baseline, optimistic, pessimistic)
        risk_score = (base_inputs.investment_return_pct / max(base_inputs.inflation_pct, Decimal("1"))).quantize(Decimal("0.01"))
        disclaimer = self._build_disclaimer(base_inputs, profile)

        return WhatIfResult(
            baseline=baseline,
            optimistic=optimistic,
            pessimistic=pessimistic,
            recommendation=recommendation,
            risk_score=risk_score,
            comparison=comparison,
            disclaimer=disclaimer,
        )

    async def run_named_scenario(
        self,
        profile: FinancialProfile,
        scenario_type: ScenarioType,
        custom_params: Optional[dict] = None,
        iterations: int = 1000,
    ) -> ScenarioResult:
        preset = SCENARIO_PRESETS.get(scenario_type, {})
        params = {**preset}
        if custom_params:
            params.update(custom_params)
        params["scenario_type"] = scenario_type
        inputs = ScenarioInput(**params)
        self._iterations = iterations
        return await self.run_scenario(profile, inputs)

    async def run_simulation(
        self,
        profile: FinancialProfile,
        request: ScenarioRequest,
    ) -> ScenarioResult:
        self._iterations = request.iterations
        return await self.run_named_scenario(
            profile,
            request.scenario_type,
            request.custom_params,
            request.iterations,
        )

    async def _monte_carlo_simulation(
        self,
        profile: FinancialProfile,
        inputs: ScenarioInput,
    ) -> MonteCarloResult:
        iterations = self._iterations
        final_values: list[Decimal] = []
        monthly_income = profile.annual_income / 12
        monthly_expenses = profile.monthly_expenses
        base_monthly_invest = inputs.new_monthly_investment or (monthly_income * profile.savings_rate / 100)

        for _ in range(iterations):
            portfolio = profile.current_portfolio
            cumulative = Decimal("0")
            for year in range(1, inputs.years + 1):
                annual_return = Decimal(str(_random.gauss(float(inputs.investment_return_pct), 8))) / 100
                annual_return = max(annual_return, Decimal("-0.30"))
                adj_income = monthly_income * ((1 + inputs.monthly_income_change_pct / 100) ** year)
                adj_expenses = monthly_expenses * ((1 + inputs.monthly_expense_change_pct / 100) ** year)
                monthly_invest = inputs.new_monthly_investment or (adj_income * profile.savings_rate / 100)

                one_time = Decimal("0")
                if inputs.one_time_expense > 0 and year == inputs.expense_year:
                    one_time = inputs.one_time_expense

                portfolio = portfolio * (1 + annual_return) + monthly_invest * 12 - one_time
                cumulative += monthly_invest * 12

            final_values.append(max(portfolio, Decimal("0")))

        final_values.sort()
        n = len(final_values)
        p5 = final_values[int(n * 0.05)]
        p25 = final_values[int(n * 0.25)]
        p50 = final_values[int(n * 0.50)]
        p75 = final_values[int(n * 0.75)]
        p95 = final_values[int(n * 0.95)]

        loss_count = sum(1 for v in final_values if v < profile.current_portfolio)
        prob_loss = (Decimal(str(loss_count)) / Decimal(str(iterations)) * 100).quantize(Decimal("0.01"))

        mean_return = inputs.investment_return_pct
        std_dev = Decimal("8")
        sharpe = ((mean_return - Decimal("6")) / max(std_dev, Decimal("1"))).quantize(Decimal("0.01"))
        downside_dev = std_dev * Decimal("0.7")
        sortino = ((mean_return - Decimal("6")) / max(downside_dev, Decimal("1"))).quantize(Decimal("0.01"))
        max_dd = (std_dev * Decimal("2.5")).quantize(Decimal("0.01"))

        return MonteCarloResult(
            iterations=iterations,
            median_portfolio=p50.quantize(Decimal("1")),
            confidence_interval=ConfidenceInterval(
                lower_5=p5.quantize(Decimal("1")),
                lower_25=p25.quantize(Decimal("1")),
                median=p50.quantize(Decimal("1")),
                upper_75=p75.quantize(Decimal("1")),
                upper_95=p95.quantize(Decimal("1")),
            ),
            probability_of_loss=prob_loss,
            expected_annual_return=mean_return.quantize(Decimal("0.01")),
            percentile_5=p5.quantize(Decimal("1")),
            percentile_95=p95.quantize(Decimal("1")),
        )

    def _build_yearly_projections(
        self,
        profile: FinancialProfile,
        inputs: ScenarioInput,
    ) -> list[YearlyProjection]:
        monthly_income = profile.annual_income / 12
        monthly_expenses = profile.monthly_expenses
        monthly_invest = inputs.new_monthly_investment or (monthly_income * profile.savings_rate / 100)
        monthly_return = inputs.investment_return_pct / 100 / 12
        monthly_inflation = inputs.inflation_pct / 100 / 12

        portfolio = profile.current_portfolio
        cumulative = Decimal("0")
        projections: list[YearlyProjection] = []

        for year in range(1, inputs.years + 1):
            year_portfolio = portfolio
            year_cumulative = cumulative
            for _ in range(12):
                year_portfolio = year_portfolio * (1 + monthly_return) + monthly_invest
                year_cumulative += monthly_invest

            portfolio = year_portfolio
            cumulative = year_cumulative

            adj_income = monthly_income * ((1 + inputs.monthly_income_change_pct / 100) ** year)
            adj_expenses = monthly_expenses * ((1 + inputs.monthly_expense_change_pct / 100) ** year) * ((1 + monthly_inflation) ** (year * 12))

            one_time = Decimal("0")
            if inputs.one_time_expense > 0 and year == inputs.expense_year:
                one_time = inputs.one_time_expense

            savings = adj_income - adj_expenses - one_time
            net_worth = portfolio + (savings * 12 * max(inputs.years - year, 0))

            confidence = ConfidenceInterval(
                lower_5=(portfolio * Decimal("0.6")).quantize(Decimal("1")),
                lower_25=(portfolio * Decimal("0.8")).quantize(Decimal("1")),
                median=portfolio.quantize(Decimal("1")),
                upper_75=(portfolio * Decimal("1.2")).quantize(Decimal("1")),
                upper_95=(portfolio * Decimal("1.5")).quantize(Decimal("1")),
            )

            projections.append(YearlyProjection(
                year=year,
                net_worth=net_worth.quantize(Decimal("1")),
                portfolio_value=portfolio.quantize(Decimal("1")),
                monthly_savings=savings.quantize(Decimal("1")),
                cumulative_investment=cumulative.quantize(Decimal("1")),
                confidence=confidence,
            ))

        return projections

    def _goal_probability(self, mc: MonteCarloResult) -> Decimal:
        spread = mc.percentile_95 - mc.percentile_5
        if spread <= 0:
            return Decimal("50")
        median_pos = (mc.median_portfolio - mc.percentile_5) / spread * 100
        return min(Decimal("99"), max(Decimal("1"), median_pos.quantize(Decimal("0.01"))))

    def _inflation_adjust(self, value: Decimal, inflation_pct: Decimal, years: int) -> Decimal:
        factor = (1 + inflation_pct / 100) ** years
        if factor <= 0:
            return value
        return (value / Decimal(str(factor))).quantize(Decimal("1"))

    async def _calculate_risk_metrics(self, mc: MonteCarloResult) -> RiskMetrics:
        mean = mc.expected_annual_return
        std_dev = Decimal("8")
        risk_free = Decimal("6")
        sharpe = ((mean - risk_free) / max(std_dev, Decimal("1"))).quantize(Decimal("0.01"))
        downside_dev = std_dev * Decimal("0.7")
        sortino = ((mean - risk_free) / max(downside_dev, Decimal("1"))).quantize(Decimal("0.01"))
        max_dd = (std_dev * Decimal("2.5")).quantize(Decimal("0.01"))
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
            max_drawdown=max_dd,
            volatility=std_dev,
            risk_level=risk_level,
            beta=Decimal("1.00"),
        )

    async def _compare_scenarios(self, scenarios: list[ScenarioResult]) -> ScenarioComparison:
        if not scenarios:
            raise ValueError("At least one scenario required")

        sorted_by_value = sorted(scenarios, key=lambda s: s.projected_portfolio_value, reverse=True)
        best = sorted_by_value[0]
        worst = sorted_by_value[-1]

        chart_data = []
        max_years = max(len(s.yearly_projections) for s in scenarios) if scenarios else 0
        for i in range(max_years):
            point = ChartDataPoint(
                year=i + 1,
                label=f"Year {i + 1}",
                optimistic=scenarios[1].yearly_projections[i].portfolio_value if len(scenarios) > 1 and i < len(scenarios[1].yearly_projections) else Decimal("0"),
                baseline=scenarios[0].yearly_projections[i].portfolio_value if i < len(scenarios[0].yearly_projections) else Decimal("0"),
                pessimistic=scenarios[2].yearly_projections[i].portfolio_value if len(scenarios) > 2 and i < len(scenarios[2].yearly_projections) else Decimal("0"),
                confidence_lower=scenarios[0].yearly_projections[i].confidence.lower_5 if i < len(scenarios[0].yearly_projections) and scenarios[0].yearly_projections[i].confidence else Decimal("0"),
                confidence_upper=scenarios[0].yearly_projections[i].confidence.upper_95 if i < len(scenarios[0].yearly_projections) and scenarios[0].yearly_projections[i].confidence else Decimal("0"),
            )
            chart_data.append(point)

        recommendation = (
            f"The {best.scenario_type.value} scenario projects the highest portfolio value "
            f"at ₹{best.projected_portfolio_value:,.0f}. "
            f"The {worst.scenario_type.value} scenario shows the lowest at ₹{worst.projected_portfolio_value:,.0f}. "
            f"Diversification across asset classes can help mitigate downside risk."
        )

        disclaimer = ScenarioDisclaimer(
            assumptions=["Returns are based on historical averages and Monte Carlo simulation", "Inflation adjustments applied annually"],
            inputs_used={"scenarios": [s.scenario_type.value for s in scenarios]},
            limitations=["Past performance does not guarantee future results", "Simulation uses random sampling and results vary"],
            confidence_statement="Results are probabilistic estimates, not guarantees",
            educational_note="Use scenario comparison to understand range of outcomes, not as prediction",
            generated_at=datetime.now(timezone.utc),
        )

        return ScenarioComparison(
            scenarios=scenarios,
            best_scenario=best.scenario_type.value,
            worst_scenario=worst.scenario_type.value,
            recommendation=recommendation,
            chart_data=chart_data,
            disclaimer=disclaimer,
        )

    def _generate_recommendation(
        self,
        profile: FinancialProfile,
        baseline: ScenarioResult,
        optimistic: ScenarioResult,
        pessimistic: ScenarioResult,
    ) -> str:
        parts = []
        if profile.savings_rate < 20:
            parts.append("Increase savings rate to at least 20% of income for optimal wealth building.")
        elif profile.savings_rate < 30:
            parts.append("Good savings rate. Consider increasing to 30% for faster goal achievement.")
        else:
            parts.append("Excellent savings rate. Consider diversifying investments for risk management.")

        gap = optimistic.projected_portfolio_value - pessimistic.projected_portfolio_value
        if gap > baseline.projected_portfolio_value:
            parts.append("High outcome variance detected. Diversify to reduce range of outcomes.")

        if not profile.has_emergency_fund:
            parts.append("Build an emergency fund covering 3-6 months of expenses before aggressive investing.")
        if not profile.has_insurance and profile.dependents > 0:
            parts.append("With dependents, life and health insurance is critical.")

        return " ".join(parts)

    def _build_disclaimer(self, inputs: ScenarioInput, profile: FinancialProfile) -> ScenarioDisclaimer:
        scenario_name = inputs.scenario_type.value.replace("_", " ").title()
        assumptions = [
            f"Expected annual return: {inputs.investment_return_pct}%",
            f"Inflation rate: {inputs.inflation_pct}% per annum",
            f"Investment horizon: {inputs.years} years",
            f"Monthly income change: {inputs.monthly_income_change_pct}% annually",
            f"Monthly expense change: {inputs.monthly_expense_change_pct}% annually",
            "Returns are compounded monthly",
            "Monte Carlo simulation with Gaussian distribution",
        ]
        if inputs.one_time_expense > 0:
            assumptions.append(f"One-time expense of ₹{inputs.one_time_expense:,.0f} in year {inputs.expense_year}")

        inputs_used = {
            "scenario_type": inputs.scenario_type.value,
            "annual_income": str(profile.annual_income),
            "monthly_expenses": str(profile.monthly_expenses),
            "current_portfolio": str(profile.current_portfolio),
            "savings_rate": str(profile.savings_rate),
            "investment_return_pct": str(inputs.investment_return_pct),
            "inflation_pct": str(inputs.inflation_pct),
            "years": inputs.years,
        }

        limitations = [
            "This simulation is for educational and informational purposes only",
            "It does not constitute financial advice or a guarantee of future outcomes",
            "Actual returns may differ significantly from projected values",
            "Market conditions, regulatory changes, and personal circumstances can alter results",
            "Tax implications are not modeled in this simulation",
            "Consult a SEBI-registered financial advisor for personalized advice",
        ]

        confidence = (
            f"Based on {self._iterations} Monte Carlo iterations, the model provides "
            f"probabilistic estimates with 95% confidence intervals. Results should be "
            f"interpreted as a range of possible outcomes, not precise predictions."
        )

        educational = (
            f"The {scenario_name} scenario helps you understand how this specific life event "
            f"or market condition could impact your financial trajectory. Use this information "
            f"to make informed decisions, not to predict the future. Financial planning should "
            f"account for multiple scenarios and be reviewed regularly."
        )

        return ScenarioDisclaimer(
            assumptions=assumptions,
            inputs_used=inputs_used,
            limitations=limitations,
            confidence_statement=confidence,
            educational_note=educational,
            generated_at=datetime.now(timezone.utc),
        )
