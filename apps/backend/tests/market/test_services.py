import pytest
from app.application.market.services import (
    QuoteService,
    HistoricalService,
    SymbolSearchService,
    SectorService,
    IndexService,
    CorporateActionService,
)
from app.infrastructure.market.providers.mock import MockMarketDataProvider
from app.infrastructure.market.cache import MarketCache
from app.infrastructure.market.repositories.cached_quote_repo import CachedQuoteRepository
from app.infrastructure.market.repositories.market_data_repo import (
    CachedHistoricalRepository,
    CachedIndexRepository,
    CachedSearchRepository,
    CachedSectorRepository,
    DBCorporateActionRepository,
    DBSymbolRepository,
)
from app.domain.market.enums import AssetType, Exchange, Interval


@pytest.fixture
def provider():
    return MockMarketDataProvider()


@pytest.fixture
def cache():
    return MarketCache()


@pytest.fixture
def quote_svc(provider, cache):
    repo = CachedQuoteRepository(provider, cache)
    return QuoteService(repo)


@pytest.fixture
def historical_svc(provider, cache):
    repo = CachedHistoricalRepository(provider, cache)
    return HistoricalService(repo)


@pytest.fixture
def search_svc(provider, cache):
    search_repo = CachedSearchRepository(provider, cache)
    symbol_repo = DBSymbolRepository(provider)
    return SymbolSearchService(search_repo, symbol_repo)


@pytest.fixture
def sector_svc(provider, cache):
    repo = CachedSectorRepository(provider, cache)
    return SectorService(repo)


@pytest.fixture
def index_svc(provider, cache):
    repo = CachedIndexRepository(provider, cache)
    return IndexService(repo)


@pytest.fixture
def action_svc(provider):
    repo = DBCorporateActionRepository(provider)
    return CorporateActionService(repo)


@pytest.mark.asyncio
async def test_quote_service_get_quote(quote_svc):
    quote = await quote_svc.get_quote("reliance.ns")
    assert quote is not None
    assert quote.symbol == "RELIANCE.NS"


@pytest.mark.asyncio
async def test_quote_service_get_quotes(quote_svc):
    quotes = await quote_svc.get_quotes(["RELIANCE.NS", "TCS.NS"])
    assert len(quotes) == 2


@pytest.mark.asyncio
async def test_historical_service(historical_svc):
    data = await historical_svc.get_historical("RELIANCE.NS", Interval.ONE_DAY, "1y")
    assert len(data.data) > 0


@pytest.mark.asyncio
async def test_search_service(search_svc):
    results = await search_svc.search("TCS")
    assert len(results) >= 1
    assert results[0].ticker == "TCS.NS"


@pytest.mark.asyncio
async def test_search_service_with_type(search_svc):
    results = await search_svc.search("", AssetType.INDEX)
    assert all(r.asset_type == AssetType.INDEX for r in results)


@pytest.mark.asyncio
async def test_get_symbol(search_svc):
    sym = await search_svc.get_symbol("HDFCBANK.NS")
    assert sym is not None
    assert sym.name == "HDFC Bank Ltd"


@pytest.mark.asyncio
async def test_list_symbols(search_svc):
    symbols = await search_svc.list_symbols()
    assert len(symbols) >= 4


@pytest.mark.asyncio
async def test_list_symbols_by_exchange(search_svc):
    symbols = await search_svc.list_symbols(exchange=Exchange.NSE)
    assert all(s.exchange == Exchange.NSE for s in symbols)


@pytest.mark.asyncio
async def test_sector_service_list(sector_svc):
    sectors = await sector_svc.list_sectors()
    assert len(sectors) >= 1


@pytest.mark.asyncio
async def test_sector_service_get(sector_svc):
    sector = await sector_svc.get_sector("Technology")
    assert sector is not None


@pytest.mark.asyncio
async def test_index_service_list(index_svc):
    indices = await index_svc.list_indices()
    assert len(indices) >= 1


@pytest.mark.asyncio
async def test_index_service_get(index_svc):
    idx = await index_svc.get_index("NIFTY50.NS")
    assert idx is not None
    assert idx.value > 0


@pytest.mark.asyncio
async def test_corporate_action_service(action_svc):
    actions = await action_svc.get_actions("RELIANCE.NS")
    assert len(actions) >= 1


@pytest.mark.asyncio
async def test_corporate_action_service_by_date(action_svc):
    actions = await action_svc.get_actions_by_date("2025-01-01", "2026-12-31")
    assert len(actions) >= 1
