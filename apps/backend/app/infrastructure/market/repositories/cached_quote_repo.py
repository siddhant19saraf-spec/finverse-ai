from __future__ import annotations

from typing import Optional

from app.domain.market.entities import Quote
from app.domain.market.interfaces import QuoteRepository
from app.infrastructure.market.cache import MarketCache
from app.infrastructure.market.providers.base import MarketDataProvider


class CachedQuoteRepository(QuoteRepository):
    def __init__(self, provider: MarketDataProvider, cache: MarketCache) -> None:
        self._provider = provider
        self._cache = cache

    async def get_quote(self, symbol: str) -> Optional[Quote]:
        cache_key = f"quote:{symbol}"
        cached = await self._cache.get_json(cache_key)
        if cached:
            from decimal import Decimal
            from datetime import datetime, timezone
            return Quote(
                symbol=cached["symbol"],
                price=Decimal(cached["price"]),
                change=Decimal(cached["change"]),
                change_pct=Decimal(cached["change_pct"]),
                open=Decimal(cached.get("open", "0")),
                high=Decimal(cached.get("high", "0")),
                low=Decimal(cached.get("low", "0")),
                previous_close=Decimal(cached.get("previous_close", "0")),
                volume=int(cached.get("volume", 0)),
                timestamp=datetime.now(timezone.utc) if not cached.get("timestamp") else datetime.fromisoformat(cached["timestamp"]),
                provider="cache",
            )
        quote = await self._provider.get_quote(symbol)
        if quote:
            await self._cache.set_json(cache_key, {
                "symbol": quote.symbol,
                "price": str(quote.price),
                "change": str(quote.change),
                "change_pct": str(quote.change_pct),
                "open": str(quote.open),
                "high": str(quote.high),
                "low": str(quote.low),
                "previous_close": str(quote.previous_close),
                "volume": quote.volume,
                "timestamp": quote.timestamp.isoformat() if quote.timestamp else None,
            }, ttl=await self._cache.get_quote_ttl())
        return quote

    async def get_quotes(self, symbols: list[str]) -> list[Quote]:
        results: list[Quote] = []
        uncached: list[str] = []
        for symbol in symbols:
            cache_key = f"quote:{symbol}"
            cached = await self._cache.get_json(cache_key)
            if cached:
                from decimal import Decimal
                from datetime import datetime, timezone
                results.append(Quote(
                    symbol=cached["symbol"],
                    price=Decimal(cached["price"]),
                    change=Decimal(cached["change"]),
                    change_pct=Decimal(cached["change_pct"]),
                    open=Decimal(cached.get("open", "0")),
                    high=Decimal(cached.get("high", "0")),
                    low=Decimal(cached.get("low", "0")),
                    previous_close=Decimal(cached.get("previous_close", "0")),
                    volume=int(cached.get("volume", 0)),
                    timestamp=datetime.now(timezone.utc),
                    provider="cache",
                ))
            else:
                uncached.append(symbol)
        if uncached:
            fresh = await self._provider.get_quotes(uncached)
            for quote in fresh:
                cache_key = f"quote:{quote.symbol}"
                await self._cache.set_json(cache_key, {
                    "symbol": quote.symbol,
                    "price": str(quote.price),
                    "change": str(quote.change),
                    "change_pct": str(quote.change_pct),
                    "volume": quote.volume,
                    "timestamp": quote.timestamp.isoformat() if quote.timestamp else None,
                }, ttl=await self._cache.get_quote_ttl())
                results.append(quote)
        return results
