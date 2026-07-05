from __future__ import annotations

import logging
from typing import Optional

from fastapi import APIRouter, HTTPException, Query, WebSocket, WebSocketDisconnect

from app.api.market.schemas import (
    CorporateActionResponse,
    GainerLoserResponse,
    HistoricalResponse,
    IndexResponse,
    MarketStatusResponse,
    OHLCVResponse,
    ProviderStatusResponse,
    QuoteBulkRequest,
    QuoteResponse,
    SearchRequest,
    SearchResultResponse,
    SectorResponse,
    SymbolResponse,
    WatchlistResponse,
)
from app.application.market.services import (
    CorporateActionService,
    HistoricalService,
    IndexService,
    QuoteService,
    SectorService,
    SymbolSearchService,
)
from app.domain.market.enums import AssetType, Exchange, Interval
from app.infrastructure.market.cache import MarketCache
from app.infrastructure.market.providers.factory import FallbackMarketDataProvider
from app.infrastructure.market.providers.mock import MockMarketDataProvider
from app.infrastructure.market.providers.yahoo import YahooFinanceProvider
from app.infrastructure.market.repositories.cached_quote_repo import CachedQuoteRepository
from app.infrastructure.market.repositories.market_data_repo import (
    CachedHistoricalRepository,
    CachedIndexRepository,
    CachedSearchRepository,
    CachedSectorRepository,
    DBCorporateActionRepository,
    DBSymbolRepository,
)
from app.infrastructure.market.websocket import manager as ws_manager
from app.api.market.market_data import _commodity_rates, _bank_rates, _market_news

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/v1/market", tags=["market"])

_provider = FallbackMarketDataProvider(
    primary=YahooFinanceProvider(),
    fallback=MockMarketDataProvider(),
    failure_threshold=3,
    recovery_timeout=300,
)
_cache = MarketCache()

_quote_repo = CachedQuoteRepository(_provider, _cache)
_historical_repo = CachedHistoricalRepository(_provider, _cache)
_search_repo = CachedSearchRepository(_provider, _cache)
_symbol_repo = DBSymbolRepository(_provider)
_sector_repo = CachedSectorRepository(_provider, _cache)
_index_repo = CachedIndexRepository(_provider, _cache)
_action_repo = DBCorporateActionRepository(_provider)

_quote_svc = QuoteService(_quote_repo)
_historical_svc = HistoricalService(_historical_repo)
_search_svc = SymbolSearchService(_search_repo, _symbol_repo)
_sector_svc = SectorService(_sector_repo)
_index_svc = IndexService(_index_repo)
_action_svc = CorporateActionService(_action_repo)


@router.get("/status", response_model=MarketStatusResponse)
async def market_status():
    return MarketStatusResponse(
        status="open",
        provider=_provider.get_active_provider(),
        provider_status=_provider.get_status(),
    )


@router.get("/provider", response_model=ProviderStatusResponse)
async def provider_status():
    return ProviderStatusResponse(
        active_provider=_provider.get_active_provider(),
        primary="yahoo",
        fallback="mock",
        failure_count=_provider._failure_count,
        primary_healthy=_provider._use_primary,
    )


@router.get("/indices", response_model=list[IndexResponse])
async def list_indices():
    return await _index_svc.list_indices()


@router.get("/indices/{symbol}", response_model=IndexResponse)
async def get_index(symbol: str):
    data = await _index_svc.get_index(symbol)
    if not data:
        raise HTTPException(status_code=404, detail=f"Index not found: {symbol}")
    return data


@router.get("/quote/{symbol}", response_model=QuoteResponse)
async def get_quote(symbol: str):
    quote = await _quote_svc.get_quote(symbol)
    if not quote:
        raise HTTPException(status_code=404, detail=f"Quote not found: {symbol}")
    return quote


@router.post("/quotes", response_model=list[QuoteResponse])
async def get_quotes_bulk(payload: QuoteBulkRequest):
    return await _quote_svc.get_quotes(payload.symbols)


@router.get("/historical/{symbol}", response_model=HistoricalResponse)
async def get_historical(
    symbol: str,
    interval: str = Query("1d", description="Interval: 1m,5m,15m,30m,1h,1d,1w,1M"),
    period: str = Query("1y", description="Period: 1d,5d,1mo,3mo,6mo,1y,2y,5y,max"),
):
    try:
        iv = Interval(interval)
    except ValueError:
        raise HTTPException(status_code=400, detail=f"Invalid interval: {interval}")
    data = await _historical_svc.get_historical(symbol, iv, period)
    return HistoricalResponse(
        symbol=data.symbol,
        interval=data.interval.value,
        data=[OHLCVResponse(
            timestamp=d.timestamp, open=d.open, high=d.high,
            low=d.low, close=d.close, volume=d.volume,
        ) for d in data.data],
    )


@router.get("/search", response_model=list[SearchResultResponse])
async def search_symbols(
    q: str = Query("", max_length=100, description="Search query"),
    asset_type: Optional[str] = Query(None, description="Filter: EQUITY,ETF,INDEX"),
):
    at = None
    if asset_type:
        try:
            at = AssetType(asset_type.upper())
        except ValueError:
            raise HTTPException(status_code=400, detail=f"Invalid asset_type: {asset_type}")
    results = await _search_svc.search(q, at)
    return [SearchResultResponse(
        ticker=r.ticker, name=r.name, asset_type=r.asset_type.value,
        exchange=r.exchange.value, sector=r.sector,
    ) for r in results]


@router.get("/symbols/{ticker}", response_model=SymbolResponse)
async def get_symbol(ticker: str):
    sym = await _search_svc.get_symbol(ticker)
    if not sym:
        raise HTTPException(status_code=404, detail=f"Symbol not found: {ticker}")
    return sym


@router.get("/symbols", response_model=list[SymbolResponse])
async def list_symbols(
    exchange: Optional[str] = Query(None, description="NSE,BSE,NYSE,NASDAQ"),
    asset_type: Optional[str] = Query(None, description="EQUITY,ETF,INDEX"),
):
    ex = Exchange(exchange) if exchange else None
    at = AssetType(asset_type) if asset_type else None
    return await _search_svc.list_symbols(ex, at)


@router.get("/sectors", response_model=list[SectorResponse])
async def list_sectors():
    return await _sector_svc.list_sectors()


@router.get("/sectors/{sector}", response_model=SectorResponse)
async def get_sector(sector: str):
    data = await _sector_svc.get_sector(sector)
    if not data:
        raise HTTPException(status_code=404, detail=f"Sector not found: {sector}")
    return data


@router.get("/gainers", response_model=list[GainerLoserResponse])
async def top_gainers(
    limit: int = Query(10, ge=1, le=50),
):
    all_sectors = await _sector_svc.list_sectors()
    all_tickers = []
    for s in all_sectors:
        all_tickers.extend(s.top_gainers)
    all_tickers = list(set(all_tickers))[:20]

    if not all_tickers:
        all_tickers = [
            "ADANIENT.NS", "TATASTEEL.NS", "BAJAJFINSV.NS", "LT.NS", "TCS.NS",
            "RELIANCE.NS", "INFY.NS", "HCLTECH.NS", "WIPRO.NS", "BHARTIARTL.NS",
        ]

    quotes = await _quote_svc.get_quotes(all_tickers)
    sorted_q = sorted(quotes, key=lambda q: q.change_pct, reverse=True)
    return [GainerLoserResponse(
        symbol=q.symbol, price=q.price, change=q.change,
        change_pct=q.change_pct, volume=q.volume,
    ) for q in sorted_q[:limit]]


@router.get("/losers", response_model=list[GainerLoserResponse])
async def top_losers(
    limit: int = Query(10, ge=1, le=50),
):
    all_sectors = await _sector_svc.list_sectors()
    all_tickers = []
    for s in all_sectors:
        all_tickers.extend(s.top_losers)
    all_tickers = list(set(all_tickers))[:20]

    if not all_tickers:
        all_tickers = [
            "BAJFINANCE.NS", "AXISBANK.NS", "HDFCLIFE.NS", "SBILIFE.NS",
            "INDUSINDBK.NS", "TATAMOTORS.NS", "M&M.NS", "MARUTI.NS",
        ]

    quotes = await _quote_svc.get_quotes(all_tickers)
    sorted_q = sorted(quotes, key=lambda q: q.change_pct)
    return [GainerLoserResponse(
        symbol=q.symbol, price=q.price, change=q.change,
        change_pct=q.change_pct, volume=q.volume,
    ) for q in sorted_q[:limit]]


@router.get("/watchlist", response_model=WatchlistResponse)
async def get_watchlist(
    user_id: int = Query(1, description="User ID"),
):
    default_symbols = [
        "RELIANCE.NS", "TCS.NS", "HDFCBANK.NS", "INFY.NS", "ICICIBANK.NS",
    ]
    quotes = await _quote_svc.get_quotes(default_symbols)
    return WatchlistResponse(
        user_id=user_id,
        symbols=[QuoteResponse(
            symbol=q.symbol, price=q.price, change=q.change,
            change_pct=q.change_pct, open=q.open, high=q.high,
            low=q.low, previous_close=q.previous_close,
            volume=q.volume, market_cap=q.market_cap,
            pe_ratio=q.pe_ratio, week_52_high=q.week_52_high,
            week_52_low=q.week_52_low, timestamp=q.timestamp,
            provider=q.provider,
        ) for q in quotes],
    )


@router.get("/corporate-actions/{symbol}", response_model=list[CorporateActionResponse])
async def get_corporate_actions(symbol: str):
    return await _action_svc.get_actions(symbol)


@router.get("/corporate-actions", response_model=list[CorporateActionResponse])
async def get_corporate_actions_by_date(
    start: str = Query(..., description="Start date ISO format"),
    end: str = Query(..., description="End date ISO format"),
):
    return await _action_svc.get_actions_by_date(start, end)


@router.websocket("/ws")
async def websocket_quotes(websocket: WebSocket):
    await ws_manager.connect(websocket)
    try:
        while True:
            data = await websocket.receive_json()
            action = data.get("action")
            symbols = data.get("symbols", [])
            if action == "subscribe":
                await ws_manager.subscribe(websocket, symbols)
                await websocket.send_json({"status": "subscribed", "symbols": symbols})
            elif action == "unsubscribe":
                await ws_manager.unsubscribe(websocket, symbols)
                await websocket.send_json({"status": "unsubscribed", "symbols": symbols})
    except WebSocketDisconnect:
        await ws_manager.disconnect(websocket)


@router.get("/commodities", response_model=list)
async def get_commodity_rates():
    return _commodity_rates()


@router.get("/bank-rates", response_model=list)
async def get_bank_rates():
    return _bank_rates()


@router.get("/news", response_model=list)
async def get_market_news():
    return _market_news()
