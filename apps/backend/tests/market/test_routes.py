import pytest
from httpx import ASGITransport, AsyncClient
from app.main import app


@pytest.fixture
def client():
    transport = ASGITransport(app=app)
    return AsyncClient(transport=transport, base_url="http://test")


@pytest.mark.asyncio
async def test_get_quote(client):
    r = await client.get("/v1/market/quote/RELIANCE.NS")
    assert r.status_code == 200
    data = r.json()
    assert data["symbol"] == "RELIANCE.NS"
    assert float(data["price"]) > 0


@pytest.mark.asyncio
async def test_get_quote_not_found(client):
    r = await client.get("/v1/market/quote/UNKNOWN.NS")
    assert r.status_code == 404


@pytest.mark.asyncio
async def test_get_quotes_bulk(client):
    r = await client.post("/v1/market/quotes", json={"symbols": ["RELIANCE.NS", "TCS.NS"]})
    assert r.status_code == 200
    assert len(r.json()) == 2


@pytest.mark.asyncio
async def test_get_historical(client):
    r = await client.get("/v1/market/historical/RELIANCE.NS?interval=1d&period=1y")
    assert r.status_code == 200
    data = r.json()
    assert data["symbol"] == "RELIANCE.NS"
    assert len(data["data"]) > 0


@pytest.mark.asyncio
async def test_get_historical_invalid_interval(client):
    r = await client.get("/v1/market/historical/RELIANCE.NS?interval=invalid")
    assert r.status_code == 400


@pytest.mark.asyncio
async def test_search(client):
    r = await client.get("/v1/market/search?q=RELIANCE")
    assert r.status_code == 200
    results = r.json()
    assert len(results) >= 1
    tickers = [item["ticker"] for item in results]
    assert any("RELIANCE" in t for t in tickers)


@pytest.mark.asyncio
async def test_search_with_asset_type(client):
    r = await client.get("/v1/market/search?q=&asset_type=ETF")
    assert r.status_code == 200
    results = r.json()
    assert all(r["asset_type"] == "ETF" for r in results)


@pytest.mark.asyncio
async def test_search_invalid_asset_type(client):
    r = await client.get("/v1/market/search?q=test&asset_type=INVALID")
    assert r.status_code == 400


@pytest.mark.asyncio
async def test_get_symbol(client):
    r = await client.get("/v1/market/symbols/TCS.NS")
    assert r.status_code == 200
    data = r.json()
    assert data["ticker"] == "TCS.NS"


@pytest.mark.asyncio
async def test_get_symbol_not_found(client):
    r = await client.get("/v1/market/symbols/UNKNOWN.NS")
    assert r.status_code == 404


@pytest.mark.asyncio
async def test_list_symbols(client):
    r = await client.get("/v1/market/symbols")
    assert r.status_code == 200
    assert len(r.json()) >= 4


@pytest.mark.asyncio
async def test_list_symbols_by_exchange(client):
    r = await client.get("/v1/market/symbols?exchange=NSE")
    assert r.status_code == 200
    symbols = r.json()
    assert all(s["exchange"] == "NSE" for s in symbols)


@pytest.mark.asyncio
async def test_list_sectors(client):
    r = await client.get("/v1/market/sectors")
    assert r.status_code == 200
    assert len(r.json()) >= 1


@pytest.mark.asyncio
async def test_get_sector(client):
    r = await client.get("/v1/market/sectors/Energy")
    assert r.status_code == 200
    assert r.json()["sector"] == "Energy"


@pytest.mark.asyncio
async def test_get_sector_not_found(client):
    r = await client.get("/v1/market/sectors/Nonexistent")
    assert r.status_code == 404


@pytest.mark.asyncio
async def test_list_indices(client):
    r = await client.get("/v1/market/indices")
    assert r.status_code == 200
    assert len(r.json()) >= 1


@pytest.mark.asyncio
async def test_get_index(client):
    r = await client.get("/v1/market/indices/NIFTY50.NS")
    assert r.status_code == 200
    assert float(r.json()["value"]) > 0


@pytest.mark.asyncio
async def test_get_index_not_found(client):
    r = await client.get("/v1/market/indices/UNKNOWN.NS")
    assert r.status_code == 404


@pytest.mark.asyncio
async def test_get_corporate_actions(client):
    r = await client.get("/v1/market/corporate-actions/RELIANCE.NS")
    assert r.status_code == 200
    assert len(r.json()) >= 1


@pytest.mark.asyncio
async def test_get_corporate_actions_by_date(client):
    r = await client.get("/v1/market/corporate-actions?start=2025-01-01&end=2026-12-31")
    assert r.status_code == 200
    assert len(r.json()) >= 1


@pytest.mark.asyncio
async def test_health_still_works(client):
    r = await client.get("/health")
    assert r.status_code == 200
    assert r.json()["status"] == "ok"
