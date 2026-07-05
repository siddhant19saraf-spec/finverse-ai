import pytest
from httpx import ASGITransport, AsyncClient

from app.main import app


@pytest.fixture
def anyio_backend():
    return "asyncio"


@pytest.mark.anyio
async def test_copilot_capabilities():
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as client:
        r = await client.get("/v1/copilot/capabilities")
        assert r.status_code == 200
        data = r.json()
        assert "capabilities" in data
        assert len(data["capabilities"]) >= 5
        assert "modules_connected" in data
        assert "disclaimer" in data


@pytest.mark.anyio
async def test_copilot_portfolio_query():
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as client:
        r = await client.post("/v1/copilot/chat/1", json={
            "message": "Analyze my portfolio risk",
            "context": {"portfolio_value": 2500000, "annual_income": 1200000},
        })
        assert r.status_code == 200
        data = r.json()
        assert "response" in data
        assert "answer" in data["response"]
        assert "reasoning" in data["response"]
        assert "confidence" in data["response"]
        assert "disclaimer" in data["response"]
        assert "cards" in data["response"]
        assert len(data["response"]["cards"]) > 0
        assert "conversation_id" in data


@pytest.mark.anyio
async def test_copilot_scenario_inflation():
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as client:
        r = await client.post("/v1/copilot/chat/1", json={
            "message": "What if inflation becomes 8%?",
            "context": {"annual_income": 1200000, "portfolio_value": 2500000},
        })
        assert r.status_code == 200
        data = r.json()
        assert "scenario" in data["response"]["answer"].lower() or "inflation" in data["response"]["answer"].lower()
        assert len(data["response"]["sources"]) > 0


@pytest.mark.anyio
async def test_copilot_risk_query():
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as client:
        r = await client.post("/v1/copilot/chat/1", json={
            "message": "What is my portfolio risk level?",
        })
        assert r.status_code == 200
        data = r.json()
        assert "risk" in data["response"]["answer"].lower()


@pytest.mark.anyio
async def test_copilot_goal_query():
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as client:
        r = await client.post("/v1/copilot/chat/1", json={
            "message": "Am I on track for retirement?",
            "context": {"annual_income": 1200000, "savings_rate": 30},
        })
        assert r.status_code == 200
        data = r.json()
        assert "goal" in data["response"]["answer"].lower() or "retirement" in data["response"]["answer"].lower()


@pytest.mark.anyio
async def test_copilot_compliance_query():
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as client:
        r = await client.post("/v1/copilot/chat/1", json={
            "message": "Check my SEBI compliance",
            "context": {"kyc_verified": True},
        })
        assert r.status_code == 200
        data = r.json()
        assert "compliance" in data["response"]["answer"].lower() or "sebi" in data["response"]["answer"].lower()


@pytest.mark.anyio
async def test_copilot_market_query():
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as client:
        r = await client.post("/v1/copilot/chat/1", json={
            "message": "How is the market today?",
        })
        assert r.status_code == 200
        data = r.json()
        assert "market" in data["response"]["answer"].lower()


@pytest.mark.anyio
async def test_copilot_general_query():
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as client:
        r = await client.post("/v1/copilot/chat/1", json={
            "message": "Hello",
        })
        assert r.status_code == 200
        data = r.json()
        assert "copilot" in data["response"]["answer"].lower() or "help" in data["response"]["answer"].lower()


@pytest.mark.anyio
async def test_copilot_query_endpoint():
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as client:
        r = await client.post("/v1/copilot/query", json={
            "message": "Show me market data",
        })
        assert r.status_code == 200
        assert "answer" in r.json()


@pytest.mark.anyio
async def test_copilot_all_responses_have_disclaimer():
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as client:
        for msg in ["portfolio", "inflation", "risk", "retirement", "compliance", "market", "hello"]:
            r = await client.post("/v1/copilot/chat/1", json={"message": msg})
            assert r.status_code == 200
            resp = r.json()["response"]
            assert resp["disclaimer"], f"Missing disclaimer for: {msg}"
            assert float(resp["confidence"]) > 0


@pytest.mark.anyio
async def test_api_root():
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as client:
        r = await client.get("/v1")
        assert r.status_code == 200
        data = r.json()
        assert "modules" in data
        assert "copilot" in data["modules"]
        assert "dashboard" in data["modules"]
