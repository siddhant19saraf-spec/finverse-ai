from __future__ import annotations

from abc import ABC, abstractmethod
from datetime import datetime
from decimal import Decimal
from typing import Optional

from app.domain.digital_twin.entities import (
    FinancialGoal,
    FinancialProfile,
    GoalAchievement,
    RiskMetrics,
    ScenarioComparison,
    ScenarioDisclaimer,
    ScenarioInput,
    ScenarioResult,
    SimulationRequest,
    UserProfileSummary,
    WhatIfResult,
)


class FinancialProfileRepository(ABC):
    @abstractmethod
    async def get_profile(self, user_id: int) -> Optional[FinancialProfile]: ...

    @abstractmethod
    async def save_profile(self, profile: FinancialProfile) -> FinancialProfile: ...


class FinancialGoalRepository(ABC):
    @abstractmethod
    async def get_goals(self, user_id: int) -> list[FinancialGoal]: ...

    @abstractmethod
    async def get_goal(self, goal_id: int) -> Optional[FinancialGoal]: ...

    @abstractmethod
    async def create_goal(self, goal: FinancialGoal) -> FinancialGoal: ...

    @abstractmethod
    async def update_goal(self, goal: FinancialGoal) -> FinancialGoal: ...

    @abstractmethod
    async def delete_goal(self, goal_id: int) -> bool: ...


class ScenarioEngine(ABC):
    @abstractmethod
    async def run_scenario(self, profile: FinancialProfile, inputs: ScenarioInput) -> ScenarioResult: ...

    @abstractmethod
    async def run_what_if(self, profile: FinancialProfile, base_inputs: ScenarioInput) -> WhatIfResult: ...


class MonteCarloSimulator(ABC):
    @abstractmethod
    async def simulate(
        self,
        profile: FinancialProfile,
        inputs: ScenarioInput,
        iterations: int,
    ) -> ScenarioResult: ...


class GoalAchievementCalculator(ABC):
    @abstractmethod
    async def calculate(
        self,
        profile: FinancialProfile,
        goal_amount: Decimal,
        years: int,
        expected_return_pct: Decimal,
        monthly_contribution: Decimal,
    ) -> GoalAchievement: ...


class RiskMetricsCalculator(ABC):
    @abstractmethod
    async def calculate(
        self,
        returns: list[Decimal],
        risk_free_rate: Decimal,
    ) -> RiskMetrics: ...


class ScenarioComparator(ABC):
    @abstractmethod
    async def compare(
        self,
        scenarios: list[ScenarioResult],
    ) -> ScenarioComparison: ...


class ChartDataGenerator(ABC):
    @abstractmethod
    async def generate(
        self,
        scenarios: list[ScenarioResult],
    ) -> list: ...


class DisclaimerGenerator(ABC):
    @abstractmethod
    async def generate(
        self,
        scenario_type: str,
        inputs: dict,
        assumptions: list[str],
    ) -> ScenarioDisclaimer: ...


class FinancialHealthCalculator(ABC):
    @abstractmethod
    async def calculate_health_score(
        self, profile: FinancialProfile, goals: list[FinancialGoal]
    ) -> UserProfileSummary: ...
