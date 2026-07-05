import pytest
from httpx import ASGITransport, AsyncClient

from app.main import app


@pytest.fixture
def anyio_backend():
    return "asyncio"


@pytest.mark.anyio
async def test_dashboard_full():
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as client:
        r = await client.get("/v1/dashboard/1")
        assert r.status_code == 200
        data = r.json()
        assert "portfolio" in data
        assert "risk" in data
        assert "goals" in data
        assert "market" in data
        assert "digital_twin" in data
        assert "ai_insights" in data
        assert "compliance" in data
        assert "notifications" in data
        assert data["user_id"] == 1


@pytest.mark.anyio
async def test_dashboard_portfolio_widget():
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as client:
        r = await client.get("/v1/dashboard/1/portfolio")
        assert r.status_code == 200
        data = r.json()
        assert "total_value" in data
        assert "day_change" in data
        assert "holdings_count" in data


@pytest.mark.anyio
async def test_dashboard_risk_widget():
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as client:
        r = await client.get("/v1/dashboard/1/risk")
        assert r.status_code == 200
        data = r.json()
        assert "overall_score" in data
        assert "risk_level" in data


@pytest.mark.anyio
async def test_dashboard_goals_widget():
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as client:
        r = await client.get("/v1/dashboard/1/goals")
        assert r.status_code == 200
        data = r.json()
        assert "goals_on_track" in data
        assert "overall_progress_pct" in data


@pytest.mark.anyio
async def test_dashboard_market_widget():
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as client:
        r = await client.get("/v1/dashboard/1/market")
        assert r.status_code == 200
        data = r.json()
        assert "indices" in data
        assert "market_status" in data


@pytest.mark.anyio
async def test_dashboard_digital_twin_widget():
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as client:
        r = await client.get("/v1/dashboard/1/digital-twin")
        assert r.status_code == 200
        data = r.json()
        assert "financial_health_score" in data
        assert "recommendations" in data


@pytest.mark.anyio
async def test_dashboard_ai_insights_widget():
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as client:
        r = await client.get("/v1/dashboard/1/ai-insights")
        assert r.status_code == 200
        data = r.json()
        assert "recent_insights" in data
        assert "insight_count" in data


@pytest.mark.anyio
async def test_dashboard_compliance_widget():
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as client:
        r = await client.get("/v1/dashboard/1/compliance")
        assert r.status_code == 200
        data = r.json()
        assert "overall_compliant" in data
        assert "regulations_checked" in data


@pytest.mark.anyio
async def test_dashboard_notifications_widget():
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as client:
        r = await client.get("/v1/dashboard/1/notifications")
        assert r.status_code == 200
        data = r.json()
        assert "unread_count" in data
        assert "alerts" in data
