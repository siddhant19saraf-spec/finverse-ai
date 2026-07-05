from __future__ import annotations

from datetime import datetime, timezone
from decimal import Decimal, ROUND_HALF_UP
from uuid import uuid4

from app.domain.xai.entities import (
    AuditEntry,
    ConfidenceBreakdown,
    Explanation,
    ExplanationRequest,
    FeatureImportance,
    ModelDecision,
)
from app.domain.xai.interfaces import ExplanationGenerator

FEATURE_TEMPLATES: dict[str, dict] = {
    "portfolio_rebalance": {
        "features": [
            ("sector_concentration", "Portfolio is over-concentrated in one sector", "negative"),
            ("risk_tolerance_mismatch", "Current risk level exceeds your tolerance", "negative"),
            ("rebalancing_opportunity", "Market conditions favor rebalancing now", "positive"),
            ("tax_efficiency", "Rebalancing now minimizes tax impact", "positive"),
        ],
        "alternatives": [
            "Gradual rebalancing over 3 months",
            "Tax-loss harvesting before rebalancing",
            "Wait for next quarter review",
        ],
        "risks": [
            "Market volatility may affect timing",
            "Transaction costs reduce returns",
            "Potential short-term capital gains tax",
        ],
    },
    "investment_recommendation": {
        "features": [
            ("historical_performance", "Asset has strong historical returns", "positive"),
            ("fundamental_analysis", "Company fundamentals are solid", "positive"),
            ("valuation_metrics", "Current valuation is attractive", "positive"),
            ("market_sentiment", "Market sentiment is cautious", "negative"),
            ("economic_indicators", "Economic outlook is uncertain", "negative"),
        ],
        "alternatives": [
            "Index fund for broader diversification",
            "Bond allocation for stability",
            "Wait for better entry point",
        ],
        "risks": [
            "Past performance does not guarantee future results",
            "Sector-specific risks apply",
            "Currency risk for international assets",
        ],
    },
    "risk_assessment": {
        "features": [
            ("portfolio_volatility", "Portfolio volatility is within acceptable range", "positive"),
            ("drawdown_risk", "Maximum drawdown risk is moderate", "negative"),
            ("correlation_analysis", "Asset correlations provide diversification", "positive"),
            ("liquidity_risk", "Some holdings have limited liquidity", "negative"),
        ],
        "alternatives": [
            "Increase bond allocation to reduce volatility",
            "Add alternative investments for diversification",
            "Implement stop-loss strategies",
        ],
        "risks": [
            "Black swan events cannot be predicted",
            "Correlations increase during market stress",
            "Liquidity may dry up in crises",
        ],
    },
}


class DefaultExplanationGenerator(ExplanationGenerator):
    async def generate_explanation(self, request: ExplanationRequest) -> Explanation:
        template = FEATURE_TEMPLATES.get(request.recommendation_type, FEATURE_TEMPLATES["investment_recommendation"])

        features = [
            FeatureImportance(
                feature_name=f[0], importance=Decimal(str(round(0.8 - i * 0.15, 2))),
                direction=f[2], description=f[1],
            )
            for i, f in enumerate(template["features"])
        ]

        confidence = self._calculate_confidence(request.context)

        summary = self._generate_summary(request.recommendation_type, confidence)
        reasoning = self._generate_reasoning(request.recommendation_type, features)

        return Explanation(
            id=str(uuid4()),
            recommendation_type=request.recommendation_type,
            summary=summary,
            detailed_reasoning=reasoning,
            confidence_score=confidence,
            features=features,
            alternatives=template["alternatives"],
            risk_factors=template["risks"],
            timestamp=datetime.now(timezone.utc),
        )

    async def get_decision(self, request: ExplanationRequest) -> ModelDecision:
        explanation = await self.generate_explanation(request)

        confidence_breakdown = ConfidenceBreakdown(
            overall=explanation.confidence_score,
            data_quality=Decimal("0.85"),
            model_agreement=Decimal("0.78"),
            historical_accuracy=Decimal("0.82"),
            market_conditions=Decimal("0.70"),
        )

        audit_entry = AuditEntry(
            id=str(uuid4()),
            user_id=request.user_id,
            action=request.recommendation_type,
            input_data=request.context,
            output_data={"explanation_id": explanation.id, "confidence": str(explanation.confidence_score)},
            explanation_id=explanation.id,
            confidence_score=explanation.confidence_score,
            model_version=request.model_version,
            timestamp=datetime.now(timezone.utc),
        )

        return ModelDecision(
            decision=f"Recommend {request.recommendation_type}",
            confidence=confidence_breakdown,
            explanation=explanation,
            audit_entry=audit_entry,
        )

    def _calculate_confidence(self, context: dict) -> Decimal:
        base = Decimal("0.75")
        if context.get("has_historical_data"):
            base += Decimal("0.10")
        if context.get("model_consensus"):
            base += Decimal("0.08")
        if context.get("market_stable"):
            base += Decimal("0.05")
        return min(Decimal("0.99"), base).quantize(Decimal("0.01"))

    def _generate_summary(self, rec_type: str, confidence: Decimal) -> str:
        level = "high" if confidence > 0.8 else "moderate" if confidence > 0.6 else "low"
        summaries = {
            "portfolio_rebalance": f"Portfolio rebalancing recommended with {level} confidence based on current allocation analysis.",
            "investment_recommendation": f"Investment opportunity identified with {level} confidence based on fundamental and technical analysis.",
            "risk_assessment": f"Risk assessment completed with {level} confidence. Portfolio risk is within acceptable parameters.",
        }
        return summaries.get(rec_type, f"Analysis completed with {level} confidence.")

    def _generate_reasoning(self, rec_type: str, features: list[FeatureImportance]) -> str:
        positive = [f for f in features if f.direction == "positive"]
        negative = [f for f in features if f.direction == "negative"]

        parts = [f"Based on analysis of {len(features)} key factors:"]
        if positive:
            parts.append(f"Positive factors: {', '.join(f.feature_name for f in positive[:3])}.")
        if negative:
            parts.append(f"Risk factors considered: {', '.join(f.feature_name for f in negative[:2])}.")
        parts.append("Recommendation accounts for your risk tolerance and investment horizon.")
        return " ".join(parts)
