from __future__ import annotations

from datetime import datetime
from decimal import Decimal
from typing import Optional

from app.domain.digital_twin.entities import (
    ChartDataPoint,
    FinancialGoal,
    FinancialProfile,
    GoalAchievement,
    RiskMetrics,
    ScenarioComparison,
    ScenarioDisclaimer,
    ScenarioInput,
    ScenarioResult,
    ScenarioType,
    SimulationRequest,
    UserProfileSummary,
    WhatIfResult,
)
from app.domain.digital_twin.interfaces import (
    ChartDataGenerator,
    DisclaimerGenerator,
    FinancialGoalRepository,
    FinancialHealthCalculator,
    FinancialProfileRepository,
    GoalAchievementCalculator,
    RiskMetricsCalculator,
    ScenarioEngine,
)


class DigitalTwinService:
    def __init__(
        self,
        profile_repo: FinancialProfileRepository,
        goal_repo: FinancialGoalRepository,
        scenario_engine: ScenarioEngine,
        health_calculator: FinancialHealthCalculator,
        goal_calculator: Optional[GoalAchievementCalculator] = None,
        risk_calculator: Optional[RiskMetricsCalculator] = None,
        chart_generator: Optional[ChartDataGenerator] = None,
        disclaimer_generator: Optional[DisclaimerGenerator] = None,
    ) -> None:
        self._profile_repo = profile_repo
        self._goal_repo = goal_repo
        self._scenario_engine = scenario_engine
        self._health_calc = health_calculator
        self._goal_calc = goal_calculator
        self._risk_calc = risk_calculator
        self._chart_gen = chart_generator
        self._disclaimer_gen = disclaimer_generator

    async def get_profile(self, user_id: int) -> Optional[FinancialProfile]:
        return await self._profile_repo.get_profile(user_id)

    async def save_profile(self, profile: FinancialProfile) -> FinancialProfile:
        return await self._profile_repo.save_profile(profile)

    async def get_goals(self, user_id: int) -> list[FinancialGoal]:
        return await self._goal_repo.get_goals(user_id)

    async def create_goal(self, goal: FinancialGoal) -> FinancialGoal:
        return await self._goal_repo.create_goal(goal)

    async def update_goal(self, goal: FinancialGoal) -> FinancialGoal:
        return await self._goal_repo.update_goal(goal)

    async def delete_goal(self, goal_id: int) -> bool:
        return await self._goal_repo.delete_goal(goal_id)

    async def run_scenario(self, user_id: int, inputs: ScenarioInput) -> Optional[ScenarioResult]:
        profile = await self._profile_repo.get_profile(user_id)
        if not profile:
            return None
        return await self._scenario_engine.run_scenario(profile, inputs)

    async def run_what_if(self, user_id: int, inputs: ScenarioInput) -> Optional[WhatIfResult]:
        profile = await self._profile_repo.get_profile(user_id)
        if not profile:
            return None
        return await self._scenario_engine.run_what_if(profile, inputs)

    async def get_financial_health(self, user_id: int) -> Optional[UserProfileSummary]:
        profile = await self._profile_repo.get_profile(user_id)
        if not profile:
            return None
        goals = await self._goal_repo.get_goals(user_id)
        return await self._health_calc.calculate_health_score(profile, goals)

    async def run_named_scenario(
        self,
        user_id: int,
        scenario_type: ScenarioType,
        custom_params: Optional[dict] = None,
        iterations: int = 1000,
    ) -> Optional[ScenarioResult]:
        profile = await self._profile_repo.get_profile(user_id)
        if not profile:
            return None
        if hasattr(self._scenario_engine, "run_named_scenario"):
            return await self._scenario_engine.run_named_scenario(profile, scenario_type, custom_params, iterations)
        preset = ScenarioInput(scenario_type=scenario_type)
        if custom_params:
            preset = ScenarioInput(scenario_type=scenario_type, **custom_params)
        return await self._scenario_engine.run_scenario(profile, preset)

    async def run_simulation(
        self,
        user_id: int,
        request: SimulationRequest,
    ) -> Optional[ScenarioResult]:
        profile = await self._profile_repo.get_profile(user_id)
        if not profile:
            return None
        if hasattr(self._scenario_engine, "run_simulation"):
            return await self._scenario_engine.run_simulation(profile, request)
        inputs = ScenarioInput(
            scenario_type=request.scenario_type,
            years=request.years,
            **request.custom_params,
        )
        return await self._scenario_engine.run_scenario(profile, inputs)

    async def calculate_goal_achievement(
        self,
        user_id: int,
        goal_amount: Decimal,
        years: int,
        expected_return_pct: Decimal,
        monthly_contribution: Decimal,
    ) -> Optional[GoalAchievement]:
        if not self._goal_calc:
            return None
        profile = await self._profile_repo.get_profile(user_id)
        if not profile:
            return None
        return await self._goal_calc.calculate(
            profile, goal_amount, years, expected_return_pct, monthly_contribution
        )

    async def calculate_risk_metrics(
        self,
        returns: list[Decimal],
        risk_free_rate: Decimal = Decimal("6"),
    ) -> RiskMetrics:
        if not self._risk_calc:
            return RiskMetrics(
                value_at_risk_95=Decimal("0"),
                value_at_risk_99=Decimal("0"),
                sharpe_ratio=Decimal("0"),
                sortino_ratio=Decimal("0"),
                max_drawdown=Decimal("0"),
                volatility=Decimal("0"),
                risk_level="low",
                beta=Decimal("1.00"),
            )
        return await self._risk_calc.calculate(returns, risk_free_rate)

    async def generate_chart_data(
        self,
        scenarios: list[ScenarioResult],
    ) -> list[ChartDataPoint]:
        if not self._chart_gen:
            return []
        return await self._chart_gen.generate(scenarios)

    async def generate_disclaimer(
        self,
        scenario_type: str,
        inputs: dict,
        assumptions: Optional[list[str]] = None,
    ) -> Optional[ScenarioDisclaimer]:
        if not self._disclaimer_gen:
            return None
        return await self._disclaimer_gen.generate(scenario_type, inputs, assumptions or [])

    async def get_available_scenarios(self) -> list[dict]:
        return [
            {"type": st.value, "name": st.value.replace("_", " ").title()}
            for st in ScenarioType
        ]
