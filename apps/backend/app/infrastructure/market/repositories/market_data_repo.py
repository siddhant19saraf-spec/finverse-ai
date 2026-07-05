from __future__ import annotations

from typing import Optional

from app.domain.market.entities import (
    CorporateAction,
    HistoricalData,
    IndexData,
    SearchResult,
    SectorData,
    Symbol,
)
from app.domain.market.enums import AssetType, Exchange, Interval
from app.domain.market.interfaces import (
    CorporateActionRepository,
    HistoricalRepository,
    IndexRepository,
    SearchRepository,
    SectorRepository,
    SymbolRepository,
)
from app.infrastructure.market.cache import MarketCache
from app.infrastructure.market.providers.base import MarketDataProvider


class CachedHistoricalRepository(HistoricalRepository):
    def __init__(self, provider: MarketDataProvider, cache: MarketCache) -> None:
        self._provider = provider
        self._cache = cache

    async def get_historical(
        self, symbol: str, interval: Interval, period: str = "1y"
    ) -> HistoricalData:
        cache_key = f"historical:{symbol}:{interval.value}:{period}"
        cached = await self._cache.get_json(cache_key)
        if cached:
            from app.domain.market.entities import OHLCV
            from datetime import datetime
            data = [
                OHLCV(
                    timestamp=datetime.fromisoformat(d["timestamp"]),
                    open=d["open"], high=d["high"], low=d["low"],
                    close=d["close"], volume=d["volume"],
                )
                for d in cached.get("data", [])
            ]
            return HistoricalData(symbol=symbol, interval=interval, data=data)
        result = await self._provider.get_historical(symbol, interval, period)
        await self._cache.set_json(cache_key, {
            "symbol": result.symbol,
            "interval": result.interval.value,
            "data": [
                {
                    "timestamp": d.timestamp.isoformat(),
                    "open": str(d.open), "high": str(d.high),
                    "low": str(d.low), "close": str(d.close),
                    "volume": d.volume,
                }
                for d in result.data
            ],
        }, ttl=await self._cache.get_historical_ttl())
        return result


class CachedSearchRepository(SearchRepository):
    def __init__(self, provider: MarketDataProvider, cache: MarketCache) -> None:
        self._provider = provider
        self._cache = cache

    async def search(self, query: str, asset_type: Optional[AssetType] = None) -> list[SearchResult]:
        cache_key = f"search:{query}:{asset_type.value if asset_type else 'all'}"
        cached = await self._cache.get_json(cache_key)
        if cached:
            from app.domain.market.enums import AssetType as AT, Exchange as EX
            return [
                SearchResult(
                    ticker=r["ticker"], name=r["name"],
                    asset_type=AT(r["asset_type"]), exchange=EX(r["exchange"]),
                    sector=r.get("sector"),
                )
                for r in cached
            ]
        results = await self._provider.search(query, asset_type)
        await self._cache.set_json(cache_key, [
            {"ticker": r.ticker, "name": r.name, "asset_type": r.asset_type.value,
             "exchange": r.exchange.value, "sector": r.sector}
            for r in results
        ], ttl=await self._cache.get_search_ttl())
        return results


class DBSymbolRepository(SymbolRepository):
    def __init__(self, provider: MarketDataProvider) -> None:
        self._provider = provider

    async def get_symbol(self, ticker: str) -> Optional[Symbol]:
        return await self._provider.get_symbol(ticker)

    async def list_symbols(
        self, exchange: Optional[Exchange] = None, asset_type: Optional[AssetType] = None
    ) -> list[Symbol]:
        return await self._provider.list_symbols(exchange, asset_type)


class CachedSectorRepository(SectorRepository):
    def __init__(self, provider: MarketDataProvider, cache: MarketCache) -> None:
        self._provider = provider
        self._cache = cache

    async def get_sector(self, sector: str) -> Optional[SectorData]:
        cache_key = f"sector:{sector}"
        cached = await self._cache.get_json(cache_key)
        if cached:
            return SectorData(
                sector=cached["sector"], change_pct=cached["change_pct"],
                market_cap=cached["market_cap"],
                top_gainers=cached.get("top_gainers", []),
                top_losers=cached.get("top_losers", []),
            )
        result = await self._provider.get_sector(sector)
        if result:
            await self._cache.set_json(cache_key, {
                "sector": result.sector, "change_pct": str(result.change_pct),
                "market_cap": str(result.market_cap),
                "top_gainers": result.top_gainers, "top_losers": result.top_losers,
            }, ttl=600)
        return result

    async def list_sectors(self) -> list[SectorData]:
        return await self._provider.list_sectors()


class CachedIndexRepository(IndexRepository):
    def __init__(self, provider: MarketDataProvider, cache: MarketCache) -> None:
        self._provider = provider
        self._cache = cache

    async def get_index(self, symbol: str) -> Optional[IndexData]:
        cache_key = f"index:{symbol}"
        cached = await self._cache.get_json(cache_key)
        if cached:
            return IndexData(
                symbol=cached["symbol"], name=cached["name"],
                value=cached["value"], change=cached["change"],
                change_pct=cached["change_pct"],
                components=cached.get("components", []),
            )
        result = await self._provider.get_index(symbol)
        if result:
            await self._cache.set_json(cache_key, {
                "symbol": result.symbol, "name": result.name,
                "value": str(result.value), "change": str(result.change),
                "change_pct": str(result.change_pct),
                "components": result.components,
            }, ttl=300)
        return result

    async def list_indices(self) -> list[IndexData]:
        return await self._provider.list_indices()


class DBCorporateActionRepository(CorporateActionRepository):
    def __init__(self, provider: MarketDataProvider) -> None:
        self._provider = provider

    async def get_actions(self, symbol: str) -> list[CorporateAction]:
        return await self._provider.get_corporate_actions(symbol)

    async def get_actions_by_date(self, start: str, end: str) -> list[CorporateAction]:
        all_actions: list[CorporateAction] = []
        from datetime import datetime, timezone
        start_dt = datetime.fromisoformat(start)
        end_dt = datetime.fromisoformat(end)
        if start_dt.tzinfo is None:
            start_dt = start_dt.replace(tzinfo=timezone.utc)
        if end_dt.tzinfo is None:
            end_dt = end_dt.replace(tzinfo=timezone.utc)
        for ticker in ["RELIANCE.NS", "TCS.NS", "HDFCBANK.NS"]:
            actions = await self._provider.get_corporate_actions(ticker)
            for a in actions:
                if start_dt <= a.ex_date <= end_dt:
                    all_actions.append(a)
        return all_actions
