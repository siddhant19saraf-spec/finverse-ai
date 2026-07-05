import pytest
from decimal import Decimal
from app.infrastructure.market.providers.mock import MockMarketDataProvider
from app.domain.market.enums import AssetType, Exchange, Interval


@pytest.fixture
def provider():
    return MockMarketDataProvider()


@pytest.mark.asyncio
async def test_get_quote_returns_valid_quote(provider):
    quote = await provider.get_quote("RELIANCE.NS")
    assert quote is not None
    assert quote.symbol == "RELIANCE.NS"
    assert quote.price > 0
    assert quote.volume > 0
    assert quote.provider == "mock"


@pytest.mark.asyncio
async def test_get_quote_unknown_symbol_returns_none(provider):
    quote = await provider.get_quote("UNKNOWN.NS")
    assert quote is None


@pytest.mark.asyncio
async def test_get_quotes_multiple(provider):
    quotes = await provider.get_quotes(["RELIANCE.NS", "TCS.NS", "HDFCBANK.NS"])
    assert len(quotes) == 3
    symbols = {q.symbol for q in quotes}
    assert "RELIANCE.NS" in symbols
    assert "TCS.NS" in symbols


@pytest.mark.asyncio
async def test_get_quotes_filters_unknown(provider):
    quotes = await provider.get_quotes(["RELIANCE.NS", "UNKNOWN.NS"])
    assert len(quotes) == 1
    assert quotes[0].symbol == "RELIANCE.NS"


@pytest.mark.asyncio
async def test_get_historical_returns_data(provider):
    data = await provider.get_historical("RELIANCE.NS", Interval.ONE_DAY, "1y")
    assert data.symbol == "RELIANCE.NS"
    assert data.interval == Interval.ONE_DAY
    assert len(data.data) > 0
    first = data.data[0]
    assert first.open > 0
    assert first.high >= first.low
    assert first.volume >= 0


@pytest.mark.asyncio
async def test_search_finds_existing(provider):
    results = await provider.search("RELIANCE")
    assert len(results) >= 1
    assert any(r.ticker == "RELIANCE.NS" for r in results)


@pytest.mark.asyncio
async def test_search_case_insensitive(provider):
    results = await provider.search("reliance")
    assert len(results) >= 1


@pytest.mark.asyncio
async def test_search_no_results(provider):
    results = await provider.search("NONEXISTENTXYZ")
    assert len(results) == 0


@pytest.mark.asyncio
async def test_search_with_asset_type_filter(provider):
    results = await provider.search("", AssetType.ETF)
    assert all(r.asset_type == AssetType.ETF for r in results)


@pytest.mark.asyncio
async def test_get_symbol(provider):
    sym = await provider.get_symbol("RELIANCE.NS")
    assert sym is not None
    assert sym.ticker == "RELIANCE.NS"
    assert sym.asset_type == AssetType.EQUITY
    assert sym.exchange == Exchange.NSE


@pytest.mark.asyncio
async def test_list_symbols(provider):
    symbols = await provider.list_symbols()
    assert len(symbols) >= 4


@pytest.mark.asyncio
async def test_list_symbols_filter_exchange(provider):
    symbols = await provider.list_symbols(exchange=Exchange.NSE)
    assert all(s.exchange == Exchange.NSE for s in symbols)


@pytest.mark.asyncio
async def test_list_symbols_filter_type(provider):
    symbols = await provider.list_symbols(asset_type=AssetType.ETF)
    assert all(s.asset_type == AssetType.ETF for s in symbols)


@pytest.mark.asyncio
async def test_get_sector(provider):
    sector = await provider.get_sector("Energy")
    assert sector is not None
    assert sector.sector == "Energy"


@pytest.mark.asyncio
async def test_list_sectors(provider):
    sectors = await provider.list_sectors()
    assert len(sectors) >= 1


@pytest.mark.asyncio
async def test_get_index(provider):
    idx = await provider.get_index("NIFTY50.NS")
    assert idx is not None
    assert idx.value > 0


@pytest.mark.asyncio
async def test_list_indices(provider):
    indices = await provider.list_indices()
    assert len(indices) >= 1


@pytest.mark.asyncio
async def test_get_corporate_actions(provider):
    actions = await provider.get_corporate_actions("RELIANCE.NS")
    assert len(actions) >= 1
    assert actions[0].symbol == "RELIANCE.NS"
    assert actions[0].action_type in ("dividend", "split")


@pytest.mark.asyncio
async def test_get_corporate_actions_unknown_symbol(provider):
    actions = await provider.get_corporate_actions("UNKNOWN.NS")
    assert len(actions) == 0
