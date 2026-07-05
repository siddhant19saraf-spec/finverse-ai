import pytest
from decimal import Decimal
from app.infrastructure.xai.explanation_engine import DefaultExplanationGenerator
from app.domain.xai.entities import ExplanationRequest


@pytest.fixture
def engine():
    return DefaultExplanationGenerator()


@pytest.mark.asyncio
async def test_generate_explanation_portfolio_rebalance(engine):
    request = ExplanationRequest(
        recommendation_type="portfolio_rebalance",
        context={"has_historical_data": True, "model_consensus": True},
        user_id=1,
    )
    explanation = await engine.generate_explanation(request)
    assert explanation.recommendation_type == "portfolio_rebalance"
    assert explanation.confidence_score > 0
    assert len(explanation.features) > 0
    assert len(explanation.alternatives) > 0
    assert len(explanation.risk_factors) > 0
    assert explanation.summary != ""


@pytest.mark.asyncio
async def test_generate_explanation_investment(engine):
    request = ExplanationRequest(
        recommendation_type="investment_recommendation",
        context={"market_stable": True},
        user_id=1,
    )
    explanation = await engine.generate_explanation(request)
    assert explanation.recommendation_type == "investment_recommendation"
    assert len(explanation.features) == 5


@pytest.mark.asyncio
async def test_generate_explanation_risk_assessment(engine):
    request = ExplanationRequest(
        recommendation_type="risk_assessment",
        context={},
        user_id=1,
    )
    explanation = await engine.generate_explanation(request)
    assert explanation.recommendation_type == "risk_assessment"
    assert explanation.confidence_score <= Decimal("0.99")


@pytest.mark.asyncio
async def test_get_decision(engine):
    request = ExplanationRequest(
        recommendation_type="portfolio_rebalance",
        context={"has_historical_data": True},
        user_id=1,
    )
    decision = await engine.get_decision(request)
    assert decision.decision != ""
    assert decision.confidence.overall > 0
    assert decision.explanation.id != ""
    assert decision.audit_entry.user_id == 1


@pytest.mark.asyncio
async def test_confidence_with_all_signals(engine):
    request = ExplanationRequest(
        recommendation_type="portfolio_rebalance",
        context={"has_historical_data": True, "model_consensus": True, "market_stable": True},
        user_id=1,
    )
    explanation = await engine.generate_explanation(request)
    assert explanation.confidence_score >= Decimal("0.85")


@pytest.mark.asyncio
async def test_confidence_without_signals(engine):
    request = ExplanationRequest(
        recommendation_type="portfolio_rebalance",
        context={},
        user_id=1,
    )
    explanation = await engine.generate_explanation(request)
    assert explanation.confidence_score == Decimal("0.75")
