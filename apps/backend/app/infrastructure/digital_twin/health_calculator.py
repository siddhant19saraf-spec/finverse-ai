from __future__ import annotations

from decimal import Decimal, ROUND_HALF_UP

from app.domain.digital_twin.entities import (
    FinancialGoal,
    FinancialProfile,
    UserProfileSummary,
)
from app.domain.digital_twin.interfaces import FinancialHealthCalculator


class DefaultFinancialHealthCalculator(FinancialHealthCalculator):
    async def calculate_health_score(
        self, profile: FinancialProfile, goals: list[FinancialGoal]
    ) -> UserProfileSummary:
        score = Decimal("0")

        if profile.savings_rate >= 30:
            score += Decimal("25")
        elif profile.savings_rate >= 20:
            score += Decimal("20")
        elif profile.savings_rate >= 10:
            score += Decimal("10")

        if profile.has_emergency_fund:
            score += Decimal("15")
        if profile.has_insurance:
            score += Decimal("10")

        if profile.investment_horizon_years >= 10:
            score += Decimal("10")
        elif profile.investment_horizon_years >= 5:
            score += Decimal("5")

        goals_on_track = sum(1 for g in goals if g.on_track)
        goals_total = len(goals)
        if goals_total > 0:
            goal_score = (Decimal(str(goals_on_track)) / Decimal(str(goals_total))) * Decimal("20")
            score += goal_score.quantize(Decimal("0.01"))

        if profile.risk_tolerance in ("aggressive", "moderate"):
            score += Decimal("10")
        elif profile.risk_tolerance == "conservative":
            score += Decimal("5")

        if profile.dependents > 0 and profile.has_insurance:
            score += Decimal("10")

        score = min(Decimal("100"), max(Decimal("0"), score))

        if score >= 80:
            health = "excellent"
        elif score >= 60:
            health = "good"
        elif score >= 40:
            health = "fair"
        else:
            health = "needs_improvement"

        recommendations = []
        if profile.savings_rate < 20:
            recommendations.append("Increase your savings rate to at least 20%.")
        if not profile.has_emergency_fund:
            recommendations.append("Build an emergency fund covering 3-6 months of expenses.")
        if not profile.has_insurance:
            recommendations.append("Consider getting life and health insurance.")
        if profile.dependents > 0 and not profile.has_insurance:
            recommendations.append("With dependents, life insurance is critical.")

        monthly_savings = (profile.annual_income / 12) - profile.monthly_expenses

        return UserProfileSummary(
            user_id=profile.user_id,
            total_net_worth=monthly_savings * 12 * Decimal(str(profile.investment_horizon_years)),
            monthly_savings=monthly_savings.quantize(Decimal("1")),
            savings_rate=profile.savings_rate.quantize(Decimal("0.01")),
            financial_health_score=score.quantize(Decimal("0.01")),
            goals_on_track=goals_on_track,
            goals_total=goals_total,
            risk_alignment=health,
            recommendations=recommendations,
        )
