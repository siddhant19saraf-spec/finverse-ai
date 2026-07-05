from __future__ import annotations

import logging
import time
from typing import Optional

from app.domain.market.entities import (
    CorporateAction,
    HistoricalData,
    IndexData,
    Quote,
    SearchResult,
    SectorData,
    Symbol,
)
from app.domain.market.enums import AssetType, Exchange, Interval
from app.infrastructure.market.providers.base import MarketDataProvider

logger = logging.getLogger(__name__)


class FallbackMarketDataProvider(MarketDataProvider):
    """Provider that tries primary, falls back to secondary on failure.

    Architecture:
        MarketDataProvider (Interface)
            ├── FallbackMarketDataProvider (primary=Yahoo, fallback=Mock)
            ├── YahooFinanceProvider
            └── MockMarketDataProvider

    Business logic depends ONLY on MarketDataProvider interface.
    The fallback wrapper is invisible to consumers.
    """

    def __init__(
        self,
        primary: MarketDataProvider,
        fallback: MarketDataProvider,
        failure_threshold: int = 3,
        recovery_timeout: int = 300,
    ) -> None:
        self._primary = primary
        self._fallback = fallback
        self._failure_count = 0
        self._failure_threshold = failure_threshold
        self._recovery_timeout = recovery_timeout
        self._last_failure_time: float = 0
        self._use_primary = True
        self._provider_name = "yahoo"

    def _check_primary_health(self) -> bool:
        if not self._use_primary:
            elapsed = time.time() - self._last_failure_time
            if elapsed > self._recovery_timeout:
                self._use_primary = True
                self._failure_count = 0
                logger.info("Primary provider recovery attempted after %ds", elapsed)
                return True
            return False
        return True

    def _record_failure(self) -> None:
        self._failure_count += 1
        self._last_failure_time = time.time()
        if self._failure_count >= self._failure_threshold:
            self._use_primary = False
            logger.warning(
                "Primary provider failed %d times, switching to fallback",
                self._failure_count,
            )

    def _record_success(self) -> None:
        self._failure_count = 0

    async def _try_primary(self, method_name: str, *args, **kwargs):
        if not self._check_primary_health():
            logger.debug("Using fallback for %s (primary degraded)", method_name)
            return None

        try:
            method = getattr(self._primary, method_name)
            result = await method(*args, **kwargs)
            self._record_success()
            return result
        except Exception as e:
            logger.warning("Primary provider %s failed: %s", method_name, e)
            self._record_failure()
            return None

    async def get_quote(self, symbol: str) -> Optional[Quote]:
        result = await self._try_primary("get_quote", symbol)
        if result is not None:
            return result
        return await self._fallback.get_quote(symbol)

    async def get_quotes(self, symbols: list[str]) -> list[Quote]:
        result = await self._try_primary("get_quotes", symbols)
        if result:
            return result
        return await self._fallback.get_quotes(symbols)

    async def get_historical(
        self, symbol: str, interval: Interval, period: str = "1y"
    ) -> HistoricalData:
        result = await self._try_primary("get_historical", symbol, interval, period)
        if result is not None and result.data:
            return result
        return await self._fallback.get_historical(symbol, interval, period)

    async def search(self, query: str, asset_type: Optional[AssetType] = None) -> list[SearchResult]:
        result = await self._try_primary("search", query, asset_type)
        if result:
            return result
        return await self._fallback.search(query, asset_type)

    async def get_symbol(self, ticker: str) -> Optional[Symbol]:
        result = await self._try_primary("get_symbol", ticker)
        if result is not None:
            return result
        return await self._fallback.get_symbol(ticker)

    async def list_symbols(
        self, exchange: Optional[Exchange] = None, asset_type: Optional[AssetType] = None
    ) -> list[Symbol]:
        result = await self._try_primary("list_symbols", exchange, asset_type)
        if result:
            return result
        return await self._fallback.list_symbols(exchange, asset_type)

    async def get_sector(self, sector: str) -> Optional[SectorData]:
        result = await self._try_primary("get_sector", sector)
        if result is not None:
            return result
        return await self._fallback.get_sector(sector)

    async def list_sectors(self) -> list[SectorData]:
        result = await self._try_primary("list_sectors")
        if result:
            return result
        return await self._fallback.list_sectors()

    async def get_index(self, symbol: str) -> Optional[IndexData]:
        result = await self._try_primary("get_index", symbol)
        if result is not None:
            return result
        return await self._fallback.get_index(symbol)

    async def list_indices(self) -> list[IndexData]:
        result = await self._try_primary("list_indices")
        if result:
            return result
        return await self._fallback.list_indices()

    async def get_corporate_actions(self, symbol: str) -> list[CorporateAction]:
        result = await self._try_primary("get_corporate_actions", symbol)
        if result:
            return result
        return await self._fallback.get_corporate_actions(symbol)

    def get_active_provider(self) -> str:
        if self._use_primary and self._failure_count == 0:
            return self._provider_name
        return "mock"

    def get_status(self) -> dict:
        return {
            "primary": self._provider_name,
            "fallback": "mock",
            "active": self.get_active_provider(),
            "failure_count": self._failure_count,
            "primary_healthy": self._use_primary,
        }
