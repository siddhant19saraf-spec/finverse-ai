from __future__ import annotations

import random as _random
from decimal import Decimal

from app.domain.digital_twin.entities import FinancialProfile, GoalAchievement
from app.domain.digital_twin.interfaces import GoalAchievementCalculator


class DefaultGoalAchievementCalculator(GoalAchievementCalculator):
    async def calculate(
        self,
        profile: FinancialProfile,
        goal_amount: Decimal,
        years: int,
        expected_return_pct: Decimal,
        monthly_contribution: Decimal,
    ) -> GoalAchievement:
        monthly_rate = expected_return_pct / 100 / 12
        months = years * 12

        fv_contributions = Decimal("0")
        for m in range(months):
            fv_contributions = (fv_contributions + monthly_contribution) * (1 + monthly_rate)

        portfolio_fv = profile.current_portfolio * ((1 + expected_return_pct / 100) ** years)
        total_expected = portfolio_fv + fv_contributions

        probability = min(Decimal("99"), max(Decimal("1"), (total_expected / goal_amount * 100).quantize(Decimal("0.01"))))

        shortfall = max(Decimal("0"), goal_amount - total_expected)

        iterations = 500
        successes = 0
        for _ in range(iterations):
            port = profile.current_portfolio
            for y in range(years):
                annual_return = Decimal(str(_random.gauss(float(expected_return_pct), 8))) / 100
                annual_return = max(annual_return, Decimal("-0.30"))
                port = port * (1 + annual_return) + monthly_contribution * 12
            if port >= goal_amount:
                successes += 1

        mc_probability = (Decimal(str(successes)) / Decimal(str(iterations)) * 100).quantize(Decimal("0.01"))

        if probability < 50:
            recommended = (goal_amount / Decimal(str(months))).quantize(Decimal("1"))
        elif probability < 80:
            recommended = (monthly_contribution * Decimal("1.3")).quantize(Decimal("1"))
        else:
            recommended = monthly_contribution

        return GoalAchievement(
            goal_name="Financial Goal",
            target_amount=goal_amount,
            probability=probability,
            expected_value=total_expected.quantize(Decimal("1")),
            shortfall_risk=shortfall.quantize(Decimal("1")),
            recommended_monthly=recommended,
            on_track_probability=mc_probability,
            confidence_level="monte_carlo_500_iterations",
        )
