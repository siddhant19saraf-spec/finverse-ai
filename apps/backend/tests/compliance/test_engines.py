import pytest
from datetime import datetime, timezone

from app.infrastructure.compliance.sebi_engine import SEBIComplianceEngine
from app.infrastructure.compliance.rbi_engine import RBIComplianceEngine
from app.infrastructure.compliance.dpdp_engine import DPDPComplianceEngine
from app.domain.compliance.entities import Regulation


@pytest.mark.asyncio
async def test_sebi_all_pass():
    engine = SEBIComplianceEngine()
    result = await engine.evaluate(1, {
        "kyc_verified": True,
        "daily_investment": "100000",
        "has_derivatives": True,
        "risk_profiled": True,
        "transaction_amount": "500000",
    })
    assert result.passed is True
    assert result.regulation == Regulation.SEBI
    assert len(result.violations) == 0


@pytest.mark.asyncio
async def test_sebi_kyc_fail():
    engine = SEBIComplianceEngine()
    result = await engine.evaluate(1, {"kyc_verified": False})
    assert result.passed is False
    assert any(v.rule_id == "SEBI-001" for v in result.violations)


@pytest.mark.asyncio
async def test_sebi_investment_limit():
    engine = SEBIComplianceEngine()
    result = await engine.evaluate(1, {
        "kyc_verified": True,
        "daily_investment": "600000",
    })
    assert result.passed is False
    assert any(v.rule_id == "SEBI-002" for v in result.violations)


@pytest.mark.asyncio
async def test_sebi_derivatives_without_risk():
    engine = SEBIComplianceEngine()
    result = await engine.evaluate(1, {
        "kyc_verified": True,
        "has_derivatives": True,
        "risk_profiled": False,
    })
    assert result.passed is False
    assert any(v.rule_id == "SEBI-004" for v in result.violations)


@pytest.mark.asyncio
async def test_sebi_suspicious_transaction():
    engine = SEBIComplianceEngine()
    result = await engine.evaluate(1, {
        "kyc_verified": True,
        "transaction_amount": "1500000",
    })
    assert result.passed is False
    assert any(v.rule_id == "SEBI-005" for v in result.violations)


@pytest.mark.asyncio
async def test_rbi_all_pass():
    engine = RBIComplianceEngine()
    result = await engine.evaluate(1, {
        "aml_verified": True,
        "transaction_amount": "500000",
        "data_stored_india": True,
        "fraud_detected": False,
    })
    assert result.passed is True
    assert result.regulation == Regulation.RBI


@pytest.mark.asyncio
async def test_rbi_aml_fail():
    engine = RBIComplianceEngine()
    result = await engine.evaluate(1, {"aml_verified": False})
    assert result.passed is False
    assert any(v.rule_id == "RBI-001" for v in result.violations)


@pytest.mark.asyncio
async def test_rbi_transaction_limit():
    engine = RBIComplianceEngine()
    result = await engine.evaluate(1, {
        "aml_verified": True,
        "transaction_amount": "3000000",
    })
    assert result.passed is False
    assert any(v.rule_id == "RBI-002" for v in result.violations)


@pytest.mark.asyncio
async def test_rbi_data_localization():
    engine = RBIComplianceEngine()
    result = await engine.evaluate(1, {
        "aml_verified": True,
        "data_stored_india": False,
    })
    assert result.passed is False
    assert any(v.rule_id == "RBI-003" for v in result.violations)


@pytest.mark.asyncio
async def test_rbi_fraud_detected():
    engine = RBIComplianceEngine()
    result = await engine.evaluate(1, {
        "aml_verified": True,
        "fraud_detected": True,
    })
    assert result.passed is False
    assert any(v.rule_id == "RBI-004" for v in result.violations)


@pytest.mark.asyncio
async def test_dpdp_all_pass():
    engine = DPDPComplianceEngine()
    result = await engine.evaluate(1, {
        "consent_given": True,
        "excess_data_collected": False,
        "breach_reported": True,
        "erasure_requested": False,
        "cross_border_transfer": False,
    })
    assert result.passed is True
    assert result.regulation == Regulation.DPDP


@pytest.mark.asyncio
async def test_dpdp_no_consent():
    engine = DPDPComplianceEngine()
    result = await engine.evaluate(1, {"consent_given": False})
    assert result.passed is False
    assert any(v.rule_id == "DPDP-001" for v in result.violations)


@pytest.mark.asyncio
async def test_dpdp_excess_data():
    engine = DPDPComplianceEngine()
    result = await engine.evaluate(1, {
        "consent_given": True,
        "excess_data_collected": True,
    })
    assert result.passed is False
    assert any(v.rule_id == "DPDP-002" for v in result.violations)


@pytest.mark.asyncio
async def test_dpdp_breach_not_reported():
    engine = DPDPComplianceEngine()
    result = await engine.evaluate(1, {
        "consent_given": True,
        "breach_reported": False,
    })
    assert result.passed is False
    assert any(v.rule_id == "DPDP-003" for v in result.violations)


@pytest.mark.asyncio
async def test_dpdp_erasure_pending():
    engine = DPDPComplianceEngine()
    result = await engine.evaluate(1, {
        "consent_given": True,
        "erasure_requested": True,
        "erasure_completed": False,
    })
    assert result.passed is False
    assert any(v.rule_id == "DPDP-004" for v in result.violations)


@pytest.mark.asyncio
async def test_dpdp_cross_border_no_protection():
    engine = DPDPComplianceEngine()
    result = await engine.evaluate(1, {
        "consent_given": True,
        "cross_border_transfer": True,
        "adequate_protection": False,
    })
    assert result.passed is False
    assert any(v.rule_id == "DPDP-005" for v in result.violations)


def test_sebi_regulation():
    assert SEBIComplianceEngine().get_regulation() == Regulation.SEBI


def test_rbi_regulation():
    assert RBIComplianceEngine().get_regulation() == Regulation.RBI


def test_dpdp_regulation():
    assert DPDPComplianceEngine().get_regulation() == Regulation.DPDP
