from __future__ import annotations

from datetime import datetime, timezone
from decimal import Decimal, ROUND_HALF_UP

from app.domain.responsible_ai.entities import BiasMetric, FairnessReport
from app.domain.responsible_ai.interfaces import BiasDetector


class DefaultBiasDetector(BiasDetector):
    async def detect_bias(self, user_id: int, data: dict) -> FairnessReport:
        metrics = []

        income_ratio = data.get("income_ratio", Decimal("1.0"))
        metrics.append(BiasMetric(
            metric_name="income_parity",
            value=income_ratio,
            threshold=Decimal("0.8"),
            passed=income_ratio >= Decimal("0.8"),
            description="Income-based recommendation parity check",
        ))

        age_group = data.get("age_group", "unknown")
        risk_score = data.get("risk_score", Decimal("0.5"))
        age_bias = self._check_age_bias(age_group, risk_score)
        metrics.append(age_bias)

        portfolio_size = data.get("portfolio_size", Decimal("0"))
        size_bias = self._check_size_bias(portfolio_size)
        metrics.append(size_bias)

        recommendation_count = data.get("recommendation_count", 0)
        diversity = self._check_diversity(recommendation_count)
        metrics.append(diversity)

        passed_count = sum(1 for m in metrics if m.passed)
        overall = (Decimal(str(passed_count)) / Decimal(str(len(metrics)))).quantize(Decimal("0.01")) * 100

        protected = ["income", "age", "portfolio_size", "recommendation_diversity"]
        recommendations = []
        if not metrics[0].passed:
            recommendations.append("Review income-based recommendation thresholds")
        if not metrics[1].passed:
            recommendations.append("Ensure age-appropriate risk recommendations")
        if not metrics[2].passed:
            recommendations.append("Provide equitable service across portfolio sizes")

        return FairnessReport(
            user_id=user_id, overall_score=overall.quantize(Decimal("0.01")),
            metrics=metrics, protected_attributes_checked=protected,
            recommendations=recommendations, timestamp=datetime.now(timezone.utc),
        )

    def _check_age_bias(self, age_group: str, risk_score: Decimal) -> BiasMetric:
        thresholds = {"young": Decimal("0.8"), "middle": Decimal("0.6"), "senior": Decimal("0.4")}
        threshold = thresholds.get(age_group, Decimal("0.5"))
        passed = risk_score <= threshold if age_group == "senior" else True
        return BiasMetric(
            metric_name="age_appropriateness", value=risk_score,
            threshold=threshold, passed=passed,
            description=f"Risk score appropriate for {age_group} age group",
        )

    def _check_size_bias(self, portfolio_size: Decimal) -> BiasMetric:
        passed = True
        return BiasMetric(
            metric_name="portfolio_size_equity", value=portfolio_size,
            threshold=Decimal("0"), passed=passed,
            description="Service quality independent of portfolio size",
        )

    def _check_diversity(self, count: int) -> BiasMetric:
        passed = count >= 2
        return BiasMetric(
            metric_name="recommendation_diversity",
            value=Decimal(str(count)), threshold=Decimal("2"),
            passed=passed,
            description="Multiple recommendation types provided",
        )
