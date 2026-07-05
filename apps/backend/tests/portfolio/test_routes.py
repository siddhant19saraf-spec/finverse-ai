import pytest
from httpx import ASGITransport, AsyncClient
from app.main import app


@pytest.fixture
def client():
    transport = ASGITransport(app=app)
    return AsyncClient(transport=transport, base_url="http://test")


@pytest.mark.asyncio
async def test_portfolio_summary_not_found(client):
    r = await client.get("/v1/portfolios/99999/summary")
    assert r.status_code == 404


@pytest.mark.asyncio
async def test_portfolio_allocation_not_found(client):
    r = await client.get("/v1/portfolios/99999/allocation")
    assert r.status_code == 404


@pytest.mark.asyncio
async def test_portfolio_risk_not_found(client):
    r = await client.get("/v1/portfolios/99999/risk")
    assert r.status_code == 404


@pytest.mark.asyncio
async def test_portfolio_performance_not_found(client):
    r = await client.get("/v1/portfolios/99999/performance")
    assert r.status_code == 404


@pytest.mark.asyncio
async def test_transaction_analysis_not_found(client):
    r = await client.get("/v1/portfolios/99999/transactions/analysis")
    assert r.status_code == 404


@pytest.mark.asyncio
async def test_value_history_empty(client):
    r = await client.get("/v1/portfolios/99999/value-history")
    assert r.status_code == 200
    assert r.json() == []


@pytest.mark.asyncio
async def test_health_still_works(client):
    r = await client.get("/health")
    assert r.status_code == 200
    assert r.json()["status"] == "ok"
