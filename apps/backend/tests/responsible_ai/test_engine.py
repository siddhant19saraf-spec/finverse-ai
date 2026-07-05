import pytest
from decimal import Decimal
from app.infrastructure.responsible_ai.bias_detector import DefaultBiasDetector
from app.infrastructure.responsible_ai.guardrails import DefaultRiskGuardrails
from app.infrastructure.responsible_ai.compliance import DefaultComplianceEngine


@pytest.fixture
def bias_detector():
    return DefaultBiasDetector()


@pytest.fixture
def guardrails():
    return DefaultRiskGuardrails()


@pytest.fixture
def compliance():
    return DefaultComplianceEngine()


@pytest.mark.asyncio
async def test_bias_detection_passes(bias_detector):
    data = {"income_ratio": Decimal("1.0"), "age_group": "middle", "risk_score": Decimal("0.5"), "portfolio_size": Decimal("100000"), "recommendation_count": 3}
    report = await bias_detector.detect_bias(1, data)
    assert report.user_id == 1
    assert report.overall_score >= 75
    assert all(m.passed for m in report.metrics)


@pytest.mark.asyncio
async def test_bias_detection_fails_income(bias_detector):
    data = {"income_ratio": Decimal("0.5"), "age_group": "middle", "risk_score": Decimal("0.5"), "portfolio_size": Decimal("100000"), "recommendation_count": 3}
    report = await bias_detector.detect_bias(1, data)
    assert not report.metrics[0].passed
    assert len(report.recommendations) > 0


@pytest.mark.asyncio
async def test_guardrails_pass(guardrails):
    context = {"investment_pct": Decimal("10"), "sector_concentration": Decimal("20"), "risk_level": "moderate", "risk_tolerance": "moderate", "trades_today": 3, "liquidity_ratio": Decimal("0.5")}
    result = await guardrails.evaluate(1, "invest", context)
    assert result.all_passed
    assert len(result.blocked_reasons) == 0


@pytest.mark.asyncio
async def test_guardrails_blocks_high_investment(guardrails):
    context = {"investment_pct": Decimal("50"), "risk_level": "moderate", "risk_tolerance": "moderate", "trades_today": 3, "liquidity_ratio": Decimal("0.5")}
    result = await guardrails.evaluate(1, "invest", context)
    assert not result.all_passed
    assert len(result.blocked_reasons) > 0


@pytest.mark.asyncio
async def test_guardrails_warns_concentration(guardrails):
    context = {"investment_pct": Decimal("10"), "sector_concentration": Decimal("50"), "risk_level": "moderate", "risk_tolerance": "moderate", "trades_today": 3, "liquidity_ratio": Decimal("0.5")}
    result = await guardrails.evaluate(1, "invest", context)
    assert len(result.warnings) > 0


@pytest.mark.asyncio
async def test_compliance_kyc_verified(compliance):
    context = {"kyc_status": "verified", "registered_advisor": True, "data_consent": True, "risk_profile": "moderate", "product_risk": "moderate"}
    checks = await compliance.check_compliance(1, "invest", context)
    assert all(c.passed for c in checks)


@pytest.mark.asyncio
async def test_compliance_kyc_fails(compliance):
    context = {"kyc_status": "pending", "registered_advisor": True, "data_consent": True, "risk_profile": "moderate", "product_risk": "moderate"}
    checks = await compliance.check_compliance(1, "invest", context)
    kyc_check = next(c for c in checks if c.check_name == "kyc_verification")
    assert not kyc_check.passed
    assert kyc_check.remediation is not None


@pytest.mark.asyncio
async def test_compliance_suitability_fails(compliance):
    context = {"kyc_status": "verified", "registered_advisor": True, "data_consent": True, "risk_profile": "conservative", "product_risk": "aggressive"}
    checks = await compliance.check_compliance(1, "invest", context)
    suitability = next(c for c in checks if c.check_name == "product_suitability")
    assert not suitability.passed
