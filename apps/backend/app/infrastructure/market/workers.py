from __future__ import annotations

import asyncio
import logging
from typing import Any, Optional

from app.domain.market.enums import Interval
from app.infrastructure.market.cache import MarketCache
from app.infrastructure.market.providers.base import MarketDataProvider
from app.infrastructure.market.websocket import manager as ws_manager

logger = logging.getLogger(__name__)


class MarketDataWorker:
    def __init__(
        self,
        provider: MarketDataProvider,
        cache: MarketCache,
        symbols: Optional[list[str]] = None,
        quote_interval: int = 30,
        snapshot_interval: int = 300,
    ) -> None:
        self._provider = provider
        self._cache = cache
        self._symbols = symbols or ["RELIANCE.NS", "TCS.NS", "HDFCBANK.NS"]
        self._quote_interval = quote_interval
        self._snapshot_interval = snapshot_interval
        self._running = False
        self._task: Optional[asyncio.Task[None]] = None

    async def start(self) -> None:
        if self._running:
            return
        self._running = True
        self._task = asyncio.create_task(self._run_loop())
        logger.info("Market data worker started")

    async def stop(self) -> None:
        self._running = False
        if self._task:
            self._task.cancel()
            try:
                await self._task
            except asyncio.CancelledError:
                pass
        logger.info("Market data worker stopped")

    async def _run_loop(self) -> None:
        snapshot_counter = 0
        while self._running:
            try:
                await self._refresh_quotes()
                snapshot_counter += 1
                if snapshot_counter >= (self._snapshot_interval // self._quote_interval):
                    await self._refresh_snapshots()
                    snapshot_counter = 0
            except asyncio.CancelledError:
                break
            except Exception as exc:
                logger.error("Market data worker error: %s", exc)
            await asyncio.sleep(self._quote_interval)

    async def _refresh_quotes(self) -> None:
        quotes = await self._provider.get_quotes(self._symbols)
        updates: dict[str, dict[str, Any]] = {}
        for quote in quotes:
            cache_key = f"quote:{quote.symbol}"
            await self._cache.set_json(cache_key, {
                "symbol": quote.symbol,
                "price": str(quote.price),
                "change": str(quote.change),
                "change_pct": str(quote.change_pct),
                "volume": quote.volume,
                "timestamp": quote.timestamp.isoformat() if quote.timestamp else None,
            }, ttl=self._quote_interval + 10)
            updates[quote.symbol] = {
                "price": str(quote.price),
                "change": str(quote.change),
                "change_pct": str(quote.change_pct),
                "volume": quote.volume,
            }
        if updates:
            await ws_manager.broadcast_multiple(updates)

    async def _refresh_snapshots(self) -> None:
        for symbol in self._symbols:
            historical = await self._provider.get_historical(
                symbol, Interval.ONE_DAY, period="1mo"
            )
            cache_key = f"snapshot:{symbol}"
            await self._cache.set_json(cache_key, {
                "symbol": symbol,
                "interval": "1d",
                "data_count": len(historical.data),
            }, ttl=self._snapshot_interval + 60)


worker: Optional[MarketDataWorker] = None


def get_worker() -> Optional[MarketDataWorker]:
    return worker


def create_worker(
    provider: MarketDataProvider,
    cache: MarketCache,
    symbols: Optional[list[str]] = None,
) -> MarketDataWorker:
    global worker
    worker = MarketDataWorker(provider, cache, symbols)
    return worker
