import pytest
from datetime import datetime, timezone
from httpx import ASGITransport, AsyncClient

from app.main import app


@pytest.fixture
def anyio_backend():
    return "asyncio"


@pytest.mark.anyio
async def test_check_all_regulations():
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as client:
        resp = await client.post("/v1/compliance/check/1", json={"context": {"kyc_verified": True}})
        assert resp.status_code == 200
        data = resp.json()
        assert isinstance(data, list)
        assert len(data) == 3


@pytest.mark.anyio
async def test_check_single_regulation_sebi():
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as client:
        resp = await client.post(
            "/v1/compliance/check/1/sebi",
            json={"context": {"kyc_verified": True}},
        )
        assert resp.status_code == 200
        data = resp.json()
        assert data["regulation"] == "sebi"


@pytest.mark.anyio
async def test_check_single_regulation_rbi():
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as client:
        resp = await client.post(
            "/v1/compliance/check/1/rbi",
            json={"context": {"aml_verified": True}},
        )
        assert resp.status_code == 200
        assert resp.json()["regulation"] == "rbi"


@pytest.mark.anyio
async def test_check_single_regulation_dpdp():
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as client:
        resp = await client.post(
            "/v1/compliance/check/1/dpdp",
            json={"context": {"consent_given": True}},
        )
        assert resp.status_code == 200
        assert resp.json()["regulation"] == "dpdp"


@pytest.mark.anyio
async def test_check_invalid_regulation():
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as client:
        resp = await client.post(
            "/v1/compliance/check/1/invalid",
            json={"context": {}},
        )
        assert resp.status_code == 400


@pytest.mark.anyio
async def test_generate_report_sebi():
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as client:
        resp = await client.post(
            "/v1/compliance/report/1",
            json={
                "regulation": "sebi",
                "period_start": "2025-01-01T00:00:00Z",
                "period_end": "2025-12-31T23:59:59Z",
            },
        )
        assert resp.status_code == 200
        data = resp.json()
        assert data["regulation"] == "sebi"
        assert data["report_id"] is not None
        assert data["summary"] is not None


@pytest.mark.anyio
async def test_generate_report_rbi():
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as client:
        resp = await client.post(
            "/v1/compliance/report/1",
            json={
                "regulation": "rbi",
                "period_start": "2025-01-01T00:00:00Z",
                "period_end": "2025-12-31T23:59:59Z",
            },
        )
        assert resp.status_code == 200
        assert resp.json()["regulation"] == "rbi"


@pytest.mark.anyio
async def test_generate_report_dpdp():
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as client:
        resp = await client.post(
            "/v1/compliance/report/1",
            json={
                "regulation": "dpdp",
                "period_start": "2025-01-01T00:00:00Z",
                "period_end": "2025-12-31T23:59:59Z",
            },
        )
        assert resp.status_code == 200
        assert resp.json()["regulation"] == "dpdp"


@pytest.mark.anyio
async def test_generate_report_invalid_regulation():
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as client:
        resp = await client.post(
            "/v1/compliance/report/1",
            json={
                "regulation": "invalid",
                "period_start": "2025-01-01T00:00:00Z",
                "period_end": "2025-12-31T23:59:59Z",
            },
        )
        assert resp.status_code == 422


@pytest.mark.anyio
async def test_export_audit():
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as client:
        resp = await client.post(
            "/v1/compliance/audit/export",
            json={
                "regulation": "sebi",
                "date_from": "2025-01-01T00:00:00Z",
                "date_to": "2025-12-31T23:59:59Z",
                "format": "json",
            },
        )
        assert resp.status_code == 200
        data = resp.json()
        assert data["regulation"] == "sebi"
        assert data["format"] == "json"
        assert data["export_id"] is not None
        assert isinstance(data["entries"], list)


@pytest.mark.anyio
async def test_list_regulations():
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as client:
        resp = await client.get("/v1/compliance/regulations")
        assert resp.status_code == 200
        data = resp.json()
        assert "sebi" in data["regulations"]
        assert "rbi" in data["regulations"]
        assert "dpdp" in data["regulations"]


@pytest.mark.anyio
async def test_check_with_violations_records_audit():
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as client:
        resp = await client.post(
            "/v1/compliance/check/1",
            json={"context": {"kyc_verified": False, "aml_verified": False, "consent_given": False}},
        )
        assert resp.status_code == 200
        data = resp.json()
        total_violations = sum(len(r["violations"]) for r in data)
        assert total_violations >= 3
