import pytest
from datetime import datetime, timezone
from decimal import Decimal

from app.domain.digital_twin.entities import (
    FinancialProfile,
    ScenarioInput,
    ScenarioType,
)
from app.infrastructure.digital_twin.scenario_engine import EnhancedScenarioEngine
from app.infrastructure.digital_twin.goal_achievement import DefaultGoalAchievementCalculator
from app.infrastructure.digital_twin.risk_metrics import DefaultRiskMetricsCalculator
from app.infrastructure.digital_twin.chart_generator import DefaultChartDataGenerator
from app.infrastructure.digital_twin.disclaimer import DefaultDisclaimerGenerator


def _make_profile(**overrides) -> FinancialProfile:
    defaults = dict(
        user_id=1,
        annual_income=Decimal("1200000"),
        monthly_expenses=Decimal("50000"),
        savings_rate=Decimal("30"),
        risk_tolerance="moderate",
        investment_horizon_years=10,
        current_portfolio=Decimal("500000"),
        existing_emergency_fund=Decimal("200000"),
    )
    defaults.update(overrides)
    return FinancialProfile(**defaults)


# ── Scenario Engine ──────────────────────────────────────────────

@pytest.mark.asyncio
async def test_scenario_returns_projections():
    engine = EnhancedScenarioEngine(default_iterations=50)
    profile = _make_profile()
    inputs = ScenarioInput(years=5)
    result = await engine.run_scenario(profile, inputs)
    assert result.scenario_type == ScenarioType.CUSTOM
    assert len(result.yearly_projections) == 5
    assert result.projected_portfolio_value > 0


@pytest.mark.asyncio
async def test_scenario_higher_returns():
    engine = EnhancedScenarioEngine(default_iterations=50)
    profile = _make_profile()
    low = await engine.run_scenario(profile, ScenarioInput(investment_return_pct=Decimal("8"), years=5))
    high = await engine.run_scenario(profile, ScenarioInput(investment_return_pct=Decimal("20"), years=5))
    assert high.projected_portfolio_value > low.projected_portfolio_value


@pytest.mark.asyncio
async def test_monte_carlo_present():
    engine = EnhancedScenarioEngine(default_iterations=50)
    result = await engine.run_scenario(_make_profile(), ScenarioInput(years=5))
    assert result.monte_carlo is not None
    assert result.monte_carlo.iterations == 50
    assert result.monte_carlo.confidence_interval is not None


@pytest.mark.asyncio
async def test_risk_metrics_present():
    engine = EnhancedScenarioEngine(default_iterations=50)
    result = await engine.run_scenario(_make_profile(), ScenarioInput(years=5))
    assert result.risk_metrics is not None
    assert result.risk_metrics.volatility >= 0


@pytest.mark.asyncio
async def test_disclaimer_present():
    engine = EnhancedScenarioEngine(default_iterations=50)
    result = await engine.run_scenario(_make_profile(), ScenarioInput(years=5))
    assert result.disclaimer is not None
    assert len(result.disclaimer.assumptions) > 0
    assert len(result.disclaimer.limitations) > 0
    assert "scenario" in result.disclaimer.educational_note.lower()


@pytest.mark.asyncio
async def test_named_scenario_inflation():
    engine = EnhancedScenarioEngine(default_iterations=50)
    profile = _make_profile()
    result = await engine.run_named_scenario(profile, ScenarioType.INFLATION)
    assert result.scenario_type == ScenarioType.INFLATION
    assert result.inflation_adjusted_value > 0


@pytest.mark.asyncio
async def test_named_scenario_salary_increase():
    engine = EnhancedScenarioEngine(default_iterations=50)
    profile = _make_profile()
    result = await engine.run_named_scenario(profile, ScenarioType.SALARY_INCREASE)
    assert result.scenario_type == ScenarioType.SALARY_INCREASE
    assert result.projected_monthly_savings > 0


@pytest.mark.asyncio
async def test_named_scenario_market_correction():
    engine = EnhancedScenarioEngine(default_iterations=50)
    profile = _make_profile()
    result = await engine.run_named_scenario(profile, ScenarioType.MARKET_CORRECTION)
    assert result.scenario_type == ScenarioType.MARKET_CORRECTION


@pytest.mark.asyncio
async def test_named_scenario_market_rally():
    engine = EnhancedScenarioEngine(default_iterations=50)
    profile = _make_profile()
    result = await engine.run_named_scenario(profile, ScenarioType.MARKET_RALLY)
    assert result.scenario_type == ScenarioType.MARKET_RALLY


@pytest.mark.asyncio
async def test_named_scenario_home_purchase():
    engine = EnhancedScenarioEngine(default_iterations=50)
    profile = _make_profile()
    result = await engine.run_named_scenario(profile, ScenarioType.HOME_PURCHASE)
    assert result.scenario_type == ScenarioType.HOME_PURCHASE
    assert result.projected_portfolio_value >= 0


@pytest.mark.asyncio
async def test_named_scenario_retirement():
    engine = EnhancedScenarioEngine(default_iterations=50)
    profile = _make_profile(investment_horizon_years=30)
    result = await engine.run_named_scenario(profile, ScenarioType.RETIREMENT)
    assert result.scenario_type == ScenarioType.RETIREMENT


@pytest.mark.asyncio
async def test_named_scenario_education():
    engine = EnhancedScenarioEngine(default_iterations=50)
    profile = _make_profile()
    result = await engine.run_named_scenario(profile, ScenarioType.EDUCATION_FUNDING)
    assert result.scenario_type == ScenarioType.EDUCATION_FUNDING


@pytest.mark.asyncio
async def test_named_scenario_emergency():
    engine = EnhancedScenarioEngine(default_iterations=50)
    profile = _make_profile()
    result = await engine.run_named_scenario(profile, ScenarioType.EMERGENCY_EXPENSE)
    assert result.scenario_type == ScenarioType.EMERGENCY_EXPENSE
    assert result.projected_portfolio_value >= 0


@pytest.mark.asyncio
async def test_named_scenario_salary_reduction():
    engine = EnhancedScenarioEngine(default_iterations=50)
    profile = _make_profile()
    result = await engine.run_named_scenario(profile, ScenarioType.SALARY_REDUCTION)
    assert result.scenario_type == ScenarioType.SALARY_REDUCTION


@pytest.mark.asyncio
async def test_what_if_returns_three_scenarios():
    engine = EnhancedScenarioEngine(default_iterations=50)
    profile = _make_profile()
    result = await engine.run_what_if(profile, ScenarioInput(years=5))
    assert result.baseline is not None
    assert result.optimistic is not None
    assert result.pessimistic is not None
    assert result.comparison is not None


@pytest.mark.asyncio
async def test_what_if_optimistic_beats_pessimistic():
    engine = EnhancedScenarioEngine(default_iterations=50)
    profile = _make_profile()
    result = await engine.run_what_if(profile, ScenarioInput(years=5))
    assert result.optimistic.projected_portfolio_value >= result.pessimistic.projected_portfolio_value


@pytest.mark.asyncio
async def test_health_score_excellent():
    from app.infrastructure.digital_twin.health_calculator import DefaultFinancialHealthCalculator
    calc = DefaultFinancialHealthCalculator()
    profile = _make_profile(savings_rate=Decimal("35"), has_emergency_fund=True, has_insurance=True)
    result = await calc.calculate_health_score(profile, [])
    assert result.financial_health_score >= 60


@pytest.mark.asyncio
async def test_health_score_low_savings():
    from app.infrastructure.digital_twin.health_calculator import DefaultFinancialHealthCalculator
    calc = DefaultFinancialHealthCalculator()
    profile = _make_profile(savings_rate=Decimal("5"), has_emergency_fund=False, has_insurance=False)
    result = await calc.calculate_health_score(profile, [])
    assert result.financial_health_score < 60


# ── Goal Achievement ──────────────────────────────────────────────

@pytest.mark.asyncio
async def test_goal_achievement_basic():
    calc = DefaultGoalAchievementCalculator()
    profile = _make_profile()
    result = await calc.calculate(
        profile, Decimal("5000000"), 10, Decimal("12"), Decimal("30000")
    )
    assert result.probability > 0
    assert result.expected_value > 0
    assert result.target_amount == Decimal("5000000")


@pytest.mark.asyncio
async def test_goal_achievement_high_amount_low_probability():
    calc = DefaultGoalAchievementCalculator()
    profile = _make_profile(annual_income=Decimal("600000"))
    result = await calc.calculate(
        profile, Decimal("50000000"), 5, Decimal("10"), Decimal("10000")
    )
    assert result.probability < 50
    assert result.shortfall_risk > 0


@pytest.mark.asyncio
async def test_goal_achievement_recommended_monthly():
    calc = DefaultGoalAchievementCalculator()
    profile = _make_profile()
    result = await calc.calculate(
        profile, Decimal("5000000"), 10, Decimal("12"), Decimal("30000")
    )
    assert result.recommended_monthly > 0


# ── Risk Metrics ──────────────────────────────────────────────────

@pytest.mark.asyncio
async def test_risk_metrics_with_returns():
    calc = DefaultRiskMetricsCalculator()
    returns = [Decimal("12"), Decimal("-5"), Decimal("8"), Decimal("15"), Decimal("-3"), Decimal("10")]
    result = await calc.calculate(returns, Decimal("6"))
    assert result.volatility > 0
    assert result.sharpe_ratio is not None
    assert result.max_drawdown >= 0


@pytest.mark.asyncio
async def test_risk_metrics_empty():
    calc = DefaultRiskMetricsCalculator()
    result = await calc.calculate([], Decimal("6"))
    assert result.volatility == Decimal("0")
    assert result.max_drawdown == Decimal("0")


@pytest.mark.asyncio
async def test_risk_metrics_var():
    calc = DefaultRiskMetricsCalculator()
    returns = [Decimal("12"), Decimal("-5"), Decimal("8"), Decimal("15"), Decimal("-3")]
    result = await calc.calculate(returns, Decimal("6"))
    assert result.value_at_risk_95 > 0
    assert result.value_at_risk_99 > result.value_at_risk_95


# ── Chart Data ───────────────────────────────────────────────────

@pytest.mark.asyncio
async def test_chart_data_generation():
    engine = EnhancedScenarioEngine(default_iterations=50)
    profile = _make_profile()
    baseline = await engine.run_scenario(profile, ScenarioInput(years=5))
    optimistic = await engine.run_scenario(profile, ScenarioInput(investment_return_pct=Decimal("20"), years=5))
    pessimistic = await engine.run_scenario(profile, ScenarioInput(investment_return_pct=Decimal("5"), years=5))

    gen = DefaultChartDataGenerator()
    chart = await gen.generate([baseline, optimistic, pessimistic])
    assert len(chart) == 5
    assert chart[0].year == 1


@pytest.mark.asyncio
async def test_chart_data_empty():
    gen = DefaultChartDataGenerator()
    chart = await gen.generate([])
    assert len(chart) == 0


# ── Disclaimer ───────────────────────────────────────────────────

@pytest.mark.asyncio
async def test_disclaimer_generation():
    gen = DefaultDisclaimerGenerator()
    result = await gen.generate(
        "inflation",
        {"inflation_pct": "9"},
        ["High inflation environment"],
    )
    assert "Inflation" in result.educational_note
    assert len(result.limitations) > 0
    assert "educational" in result.confidence_statement.lower() or "probabilistic" in result.confidence_statement.lower()


# ── Custom Scenario with One-Time Expense ────────────────────────

@pytest.mark.asyncio
async def test_scenario_with_one_time_expense():
    engine = EnhancedScenarioEngine(default_iterations=50)
    profile = _make_profile(current_portfolio=Decimal("5000000"))
    inputs = ScenarioInput(
        one_time_expense=Decimal("2000000"),
        expense_year=2,
        years=5,
    )
    result = await engine.run_scenario(profile, inputs)
    assert result.projected_portfolio_value >= 0
