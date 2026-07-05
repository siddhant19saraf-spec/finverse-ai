import pytest
from httpx import ASGITransport, AsyncClient
from app.main import app


@pytest.fixture
def client():
    transport = ASGITransport(app=app)
    return AsyncClient(transport=transport, base_url="http://test")


@pytest.mark.asyncio
async def test_generate_report(client):
    payload = {"action": "invest", "context": {"kyc_status": "verified", "registered_advisor": True, "data_consent": True, "risk_profile": "moderate", "product_risk": "moderate", "investment_pct": 10, "risk_level": "moderate", "risk_tolerance": "moderate", "trades_today": 3, "liquidity_ratio": 0.5}}
    r = await client.post("/v1/responsible-ai/report/1", json=payload)
    assert r.status_code == 200
    data = r.json()
    assert data["user_id"] == 1
    assert float(data["fairness"]["overall_score"]) > 0
    assert data["guardrails"]["all_passed"]


@pytest.mark.asyncio
async def test_check_action_allowed(client):
    payload = {"action": "invest", "context": {"kyc_status": "verified", "registered_advisor": True, "data_consent": True, "risk_profile": "moderate", "product_risk": "moderate", "investment_pct": 10, "risk_level": "moderate", "risk_tolerance": "moderate", "trades_today": 3, "liquidity_ratio": 0.5}}
    r = await client.post("/v1/responsible-ai/check/1", json=payload)
    assert r.status_code == 200
    data = r.json()
    assert data["allowed"] is True
    assert data["guardrails_passed"] is True


@pytest.mark.asyncio
async def test_check_action_blocked(client):
    payload = {"action": "invest", "context": {"kyc_status": "verified", "registered_advisor": True, "data_consent": True, "risk_profile": "moderate", "product_risk": "moderate", "investment_pct": 50, "risk_level": "moderate", "risk_tolerance": "moderate", "trades_today": 3, "liquidity_ratio": 0.5}}
    r = await client.post("/v1/responsible-ai/check/1", json=payload)
    assert r.status_code == 200
    data = r.json()
    assert data["allowed"] is False
    assert len(data["blocked_reasons"]) > 0


@pytest.mark.asyncio
async def test_report_includes_compliance(client):
    payload = {"action": "invest", "context": {"kyc_status": "verified", "registered_advisor": True, "data_consent": True, "risk_profile": "moderate", "product_risk": "moderate", "investment_pct": 10, "risk_level": "moderate", "risk_tolerance": "moderate", "trades_today": 3, "liquidity_ratio": 0.5}}
    r = await client.post("/v1/responsible-ai/report/1", json=payload)
    data = r.json()
    assert len(data["compliance"]) >= 4
    assert any(c["check_name"] == "kyc_verification" for c in data["compliance"])


@pytest.mark.asyncio
async def test_health_still_works(client):
    r = await client.get("/health")
    assert r.status_code == 200
