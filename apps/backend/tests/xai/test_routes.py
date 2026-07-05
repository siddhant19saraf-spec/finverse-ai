import pytest
from httpx import ASGITransport, AsyncClient
from app.main import app


@pytest.fixture
def client():
    transport = ASGITransport(app=app)
    return AsyncClient(transport=transport, base_url="http://test")


@pytest.mark.asyncio
async def test_explain_portfolio_rebalance(client):
    payload = {"recommendation_type": "portfolio_rebalance", "context": {"has_historical_data": True}}
    r = await client.post("/v1/xai/explain?user_id=1", json=payload)
    assert r.status_code == 200
    data = r.json()
    assert data["recommendation_type"] == "portfolio_rebalance"
    assert float(data["confidence_score"]) > 0
    assert len(data["features"]) > 0


@pytest.mark.asyncio
async def test_explain_investment(client):
    payload = {"recommendation_type": "investment_recommendation", "context": {}}
    r = await client.post("/v1/xai/explain?user_id=1", json=payload)
    assert r.status_code == 200
    assert r.json()["recommendation_type"] == "investment_recommendation"


@pytest.mark.asyncio
async def test_explain_risk(client):
    payload = {"recommendation_type": "risk_assessment", "context": {}}
    r = await client.post("/v1/xai/explain?user_id=1", json=payload)
    assert r.status_code == 200
    assert r.json()["recommendation_type"] == "risk_assessment"


@pytest.mark.asyncio
async def test_explain_invalid_type(client):
    payload = {"recommendation_type": "invalid_type", "context": {}}
    r = await client.post("/v1/xai/explain?user_id=1", json=payload)
    assert r.status_code == 422


@pytest.mark.asyncio
async def test_decision(client):
    payload = {"recommendation_type": "portfolio_rebalance", "context": {"has_historical_data": True}}
    r = await client.post("/v1/xai/decision?user_id=1", json=payload)
    assert r.status_code == 200
    data = r.json()
    assert data["decision"] != ""
    assert float(data["confidence"]["overall"]) > 0
    assert data["audit_entry"]["user_id"] == 1


@pytest.mark.asyncio
async def test_audit_trail(client):
    payload = {"recommendation_type": "portfolio_rebalance", "context": {}}
    await client.post("/v1/xai/explain?user_id=50", json=payload)
    await client.post("/v1/xai/explain?user_id=50", json=payload)

    r = await client.get("/v1/xai/audit/50")
    assert r.status_code == 200
    entries = r.json()
    assert len(entries) == 2
    assert entries[0]["user_id"] == 50


@pytest.mark.asyncio
async def test_audit_entry_not_found(client):
    r = await client.get("/v1/xai/audit/entry/nonexistent")
    assert r.status_code == 404


@pytest.mark.asyncio
async def test_search_audit(client):
    payload = {"recommendation_type": "portfolio_rebalance", "context": {}}
    await client.post("/v1/xai/explain?user_id=60", json=payload)

    r = await client.get("/v1/xai/audit?action=portfolio_rebalance&user_id=60")
    assert r.status_code == 200
    assert len(r.json()) >= 1


@pytest.mark.asyncio
async def test_health_still_works(client):
    r = await client.get("/health")
    assert r.status_code == 200
