import pytest
from httpx import ASGITransport, AsyncClient

from app.main import app


@pytest.fixture
def anyio_backend():
    return "asyncio"


@pytest.mark.anyio
async def test_profile_not_found():
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as client:
        r = await client.get("/v1/digital-twin/profile/9999")
        assert r.status_code == 404


@pytest.mark.anyio
async def test_create_and_get_profile():
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as client:
        payload = {
            "annual_income": 1200000, "monthly_expenses": 50000,
            "savings_rate": 30, "risk_tolerance": "moderate",
            "investment_horizon_years": 10, "current_portfolio": 500000,
        }
        r = await client.post("/v1/digital-twin/profile?user_id=100", json=payload)
        assert r.status_code == 200
        assert r.json()["user_id"] == 100

        r2 = await client.get("/v1/digital-twin/profile/100")
        assert r2.status_code == 200
        assert float(r2.json()["current_portfolio"]) == 500000


@pytest.mark.anyio
async def test_goals_crud():
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as client:
        goal = {
            "name": "Retirement", "target_amount": 5000000,
            "monthly_contribution": 30000,
            "target_date": "2035-01-01T00:00:00Z",
            "priority": "high", "category": "retirement",
            "expected_return_pct": 12,
        }
        r = await client.post("/v1/digital-twin/goals?user_id=100", json=goal)
        assert r.status_code == 201

        r2 = await client.get("/v1/digital-twin/goals/100")
        assert r2.status_code == 200
        assert len(r2.json()) >= 1


@pytest.mark.anyio
async def test_scenario_no_profile():
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as client:
        r = await client.post("/v1/digital-twin/scenario/9999", json={"years": 5})
        assert r.status_code == 404


@pytest.mark.anyio
async def test_scenario_with_profile():
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as client:
        await client.post("/v1/digital-twin/profile?user_id=200", json={
            "annual_income": 1200000, "monthly_expenses": 50000,
            "savings_rate": 30, "risk_tolerance": "moderate",
            "investment_horizon_years": 10, "current_portfolio": 500000,
        })
        r = await client.post("/v1/digital-twin/scenario/200", json={
            "scenario_type": "custom", "years": 5,
        })
        assert r.status_code == 200
        data = r.json()
        assert "yearly_projections" in data
        assert "monte_carlo" in data
        assert "risk_metrics" in data
        assert "disclaimer" in data


@pytest.mark.anyio
async def test_what_if():
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as client:
        await client.post("/v1/digital-twin/profile?user_id=201", json={
            "annual_income": 1200000, "monthly_expenses": 50000,
            "savings_rate": 30, "risk_tolerance": "moderate",
            "investment_horizon_years": 10, "current_portfolio": 500000,
        })
        r = await client.post("/v1/digital-twin/what-if/201", json={"years": 5})
        assert r.status_code == 200
        data = r.json()
        assert "baseline" in data
        assert "optimistic" in data
        assert "pessimistic" in data
        assert "comparison" in data


@pytest.mark.anyio
async def test_financial_health():
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as client:
        await client.post("/v1/digital-twin/profile?user_id=202", json={
            "annual_income": 1200000, "monthly_expenses": 50000,
            "savings_rate": 30, "risk_tolerance": "moderate",
            "investment_horizon_years": 10, "has_emergency_fund": True,
            "has_insurance": True, "current_portfolio": 500000,
        })
        r = await client.get("/v1/digital-twin/health/202")
        assert r.status_code == 200
        assert "financial_health_score" in r.json()


@pytest.mark.anyio
async def test_health_still_works():
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as client:
        r = await client.get("/health")
        assert r.status_code == 200


# ── Named Scenarios ──────────────────────────────────────────────

@pytest.mark.anyio
async def test_named_scenario_inflation():
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as client:
        await client.post("/v1/digital-twin/profile?user_id=300", json={
            "annual_income": 1200000, "monthly_expenses": 50000,
            "savings_rate": 30, "risk_tolerance": "moderate",
            "investment_horizon_years": 10, "current_portfolio": 500000,
        })
        r = await client.post("/v1/digital-twin/named-scenario/300/inflation?iterations=50")
        assert r.status_code == 200
        assert r.json()["scenario_type"] == "inflation"


@pytest.mark.anyio
async def test_named_scenario_salary_increase():
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as client:
        await client.post("/v1/digital-twin/profile?user_id=301", json={
            "annual_income": 1200000, "monthly_expenses": 50000,
            "savings_rate": 30, "risk_tolerance": "moderate",
            "investment_horizon_years": 10, "current_portfolio": 500000,
        })
        r = await client.post("/v1/digital-twin/named-scenario/301/salary_increase?iterations=50")
        assert r.status_code == 200
        assert r.json()["scenario_type"] == "salary_increase"


@pytest.mark.anyio
async def test_named_scenario_market_correction():
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as client:
        await client.post("/v1/digital-twin/profile?user_id=302", json={
            "annual_income": 1200000, "monthly_expenses": 50000,
            "savings_rate": 30, "risk_tolerance": "moderate",
            "investment_horizon_years": 10, "current_portfolio": 500000,
        })
        r = await client.post("/v1/digital-twin/named-scenario/302/market_correction?iterations=50")
        assert r.status_code == 200
        assert r.json()["scenario_type"] == "market_correction"


@pytest.mark.anyio
async def test_named_scenario_home_purchase():
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as client:
        await client.post("/v1/digital-twin/profile?user_id=303", json={
            "annual_income": 1200000, "monthly_expenses": 50000,
            "savings_rate": 30, "risk_tolerance": "moderate",
            "investment_horizon_years": 20, "current_portfolio": 500000,
        })
        r = await client.post("/v1/digital-twin/named-scenario/303/home_purchase?iterations=50")
        assert r.status_code == 200
        assert r.json()["scenario_type"] == "home_purchase"


@pytest.mark.anyio
async def test_named_scenario_retirement():
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as client:
        await client.post("/v1/digital-twin/profile?user_id=304", json={
            "annual_income": 1200000, "monthly_expenses": 50000,
            "savings_rate": 30, "risk_tolerance": "moderate",
            "investment_horizon_years": 30, "current_portfolio": 500000,
        })
        r = await client.post("/v1/digital-twin/named-scenario/304/retirement?iterations=50")
        assert r.status_code == 200
        assert r.json()["scenario_type"] == "retirement"


@pytest.mark.anyio
async def test_named_scenario_education():
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as client:
        await client.post("/v1/digital-twin/profile?user_id=305", json={
            "annual_income": 1200000, "monthly_expenses": 50000,
            "savings_rate": 30, "risk_tolerance": "moderate",
            "investment_horizon_years": 15, "current_portfolio": 500000,
        })
        r = await client.post("/v1/digital-twin/named-scenario/305/education_funding?iterations=50")
        assert r.status_code == 200
        assert r.json()["scenario_type"] == "education_funding"


@pytest.mark.anyio
async def test_named_scenario_emergency():
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as client:
        await client.post("/v1/digital-twin/profile?user_id=306", json={
            "annual_income": 1200000, "monthly_expenses": 50000,
            "savings_rate": 30, "risk_tolerance": "moderate",
            "investment_horizon_years": 5, "current_portfolio": 500000,
        })
        r = await client.post("/v1/digital-twin/named-scenario/306/emergency_expense?iterations=50")
        assert r.status_code == 200
        assert r.json()["scenario_type"] == "emergency_expense"


@pytest.mark.anyio
async def test_named_scenario_salary_reduction():
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as client:
        await client.post("/v1/digital-twin/profile?user_id=307", json={
            "annual_income": 1200000, "monthly_expenses": 50000,
            "savings_rate": 30, "risk_tolerance": "moderate",
            "investment_horizon_years": 10, "current_portfolio": 500000,
        })
        r = await client.post("/v1/digital-twin/named-scenario/307/salary_reduction?iterations=50")
        assert r.status_code == 200
        assert r.json()["scenario_type"] == "salary_reduction"


@pytest.mark.anyio
async def test_named_scenario_market_rally():
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as client:
        await client.post("/v1/digital-twin/profile?user_id=308", json={
            "annual_income": 1200000, "monthly_expenses": 50000,
            "savings_rate": 30, "risk_tolerance": "moderate",
            "investment_horizon_years": 5, "current_portfolio": 500000,
        })
        r = await client.post("/v1/digital-twin/named-scenario/308/market_rally?iterations=50")
        assert r.status_code == 200
        assert r.json()["scenario_type"] == "market_rally"


@pytest.mark.anyio
async def test_named_scenario_invalid():
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as client:
        r = await client.post("/v1/digital-twin/named-scenario/300/invalid_type?iterations=50")
        assert r.status_code == 400


@pytest.mark.anyio
async def test_simulate_endpoint():
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as client:
        await client.post("/v1/digital-twin/profile?user_id=400", json={
            "annual_income": 1200000, "monthly_expenses": 50000,
            "savings_rate": 30, "risk_tolerance": "moderate",
            "investment_horizon_years": 10, "current_portfolio": 500000,
        })
        r = await client.post("/v1/digital-twin/simulate/400", json={
            "scenario_type": "retirement", "years": 10, "iterations": 100,
            "custom_params": {},
        })
        assert r.status_code == 200
        assert r.json()["scenario_type"] == "retirement"


@pytest.mark.anyio
async def test_goal_achievement_endpoint():
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as client:
        await client.post("/v1/digital-twin/profile?user_id=500", json={
            "annual_income": 1200000, "monthly_expenses": 50000,
            "savings_rate": 30, "risk_tolerance": "moderate",
            "investment_horizon_years": 10, "current_portfolio": 500000,
        })
        r = await client.post("/v1/digital-twin/goal-achievement/500", json={
            "goal_amount": 5000000, "years": 10,
            "expected_return_pct": 12, "monthly_contribution": 30000,
        })
        assert r.status_code == 200
        data = r.json()
        assert "probability" in data
        assert "expected_value" in data
        assert "shortfall_risk" in data
        assert "recommended_monthly" in data


@pytest.mark.anyio
async def test_risk_metrics_endpoint():
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as client:
        r = await client.post("/v1/digital-twin/risk-metrics", json={
            "returns": [12, -5, 8, 15, -3, 10],
            "risk_free_rate": 6,
        })
        assert r.status_code == 200
        data = r.json()
        assert "sharpe_ratio" in data
        assert "max_drawdown" in data
        assert "risk_level" in data


@pytest.mark.anyio
async def test_list_scenarios():
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as client:
        r = await client.get("/v1/digital-twin/scenarios")
        assert r.status_code == 200
        data = r.json()
        assert data["total"] == 10
        types = [s["type"] for s in data["scenarios"]]
        assert "inflation" in types
        assert "retirement" in types
        assert "home_purchase" in types


@pytest.mark.anyio
async def test_scenario_response_includes_all_fields():
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as client:
        await client.post("/v1/digital-twin/profile?user_id=600", json={
            "annual_income": 1200000, "monthly_expenses": 50000,
            "savings_rate": 30, "risk_tolerance": "moderate",
            "investment_horizon_years": 10, "current_portfolio": 500000,
        })
        r = await client.post("/v1/digital-twin/scenario/600", json={"years": 5})
        data = r.json()
        assert "projected_net_worth" in data
        assert "projected_portfolio_value" in data
        assert "inflation_adjusted_value" in data
        assert "goal_achievement_probability" in data
        assert "monte_carlo" in data
        assert "risk_metrics" in data
        assert "disclaimer" in data
        assert "assumptions" in data["disclaimer"]
        assert "limitations" in data["disclaimer"]
        assert "educational_note" in data["disclaimer"]


@pytest.mark.anyio
async def test_disclaimer_all_scenarios():
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as client:
        await client.post("/v1/digital-twin/profile?user_id=700", json={
            "annual_income": 1200000, "monthly_expenses": 50000,
            "savings_rate": 30, "risk_tolerance": "moderate",
            "investment_horizon_years": 10, "current_portfolio": 500000,
        })
        for st in ["inflation", "salary_increase", "market_correction", "retirement"]:
            r = await client.post(f"/v1/digital-twin/named-scenario/700/{st}?iterations=50")
            data = r.json()
            assert data["disclaimer"] is not None
            assert len(data["disclaimer"]["limitations"]) > 0
            assert "financial" in data["disclaimer"]["educational_note"].lower()
