from __future__ import annotations

from typing import Optional

from app.domain.digital_twin.entities import FinancialGoal, FinancialProfile
from app.domain.digital_twin.interfaces import (
    FinancialGoalRepository,
    FinancialProfileRepository,
)


class InMemoryProfileRepository(FinancialProfileRepository):
    def __init__(self) -> None:
        self._profiles: dict[int, FinancialProfile] = {}

    async def get_profile(self, user_id: int) -> Optional[FinancialProfile]:
        return self._profiles.get(user_id)

    async def save_profile(self, profile: FinancialProfile) -> FinancialProfile:
        self._profiles[profile.user_id] = profile
        return profile


class InMemoryGoalRepository(FinancialGoalRepository):
    def __init__(self) -> None:
        self._goals: dict[int, FinancialGoal] = {}
        self._next_id = 1

    async def get_goals(self, user_id: int) -> list[FinancialGoal]:
        return [g for g in self._goals.values() if g.user_id == user_id]

    async def get_goal(self, goal_id: int) -> Optional[FinancialGoal]:
        return self._goals.get(goal_id)

    async def create_goal(self, goal: FinancialGoal) -> FinancialGoal:
        new_goal = FinancialGoal(
            id=self._next_id, user_id=goal.user_id, name=goal.name,
            target_amount=goal.target_amount, current_amount=goal.current_amount,
            monthly_contribution=goal.monthly_contribution,
            target_date=goal.target_date, priority=goal.priority,
            category=goal.category, expected_return_pct=goal.expected_return_pct,
            on_track=goal.on_track, shortfall=goal.shortfall,
            projected_completion=goal.projected_completion,
        )
        self._goals[self._next_id] = new_goal
        self._next_id += 1
        return new_goal

    async def update_goal(self, goal: FinancialGoal) -> FinancialGoal:
        if goal.id and goal.id in self._goals:
            self._goals[goal.id] = goal
        return goal

    async def delete_goal(self, goal_id: int) -> bool:
        if goal_id in self._goals:
            del self._goals[goal_id]
            return True
        return False
