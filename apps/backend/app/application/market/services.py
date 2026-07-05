from __future__ import annotations

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
from app.domain.market.interfaces import (
    CorporateActionRepository,
    HistoricalRepository,
    IndexRepository,
    QuoteRepository,
    SearchRepository,
    SectorRepository,
    SymbolRepository,
)


class QuoteService:
    def __init__(self, repo: QuoteRepository) -> None:
        self._repo = repo

    async def get_quote(self, symbol: str) -> Optional[Quote]:
        return await self._repo.get_quote(symbol.upper())

    async def get_quotes(self, symbols: list[str]) -> list[Quote]:
        return await self._repo.get_quotes([s.upper() for s in symbols])


class HistoricalService:
    def __init__(self, repo: HistoricalRepository) -> None:
        self._repo = repo

    async def get_historical(
        self, symbol: str, interval: Interval = Interval.ONE_DAY, period: str = "1y"
    ) -> HistoricalData:
        return await self._repo.get_historical(symbol.upper(), interval, period)


class SymbolSearchService:
    def __init__(self, search_repo: SearchRepository, symbol_repo: SymbolRepository) -> None:
        self._search_repo = search_repo
        self._symbol_repo = symbol_repo

    async def search(self, query: str, asset_type: Optional[AssetType] = None) -> list[SearchResult]:
        return await self._search_repo.search(query, asset_type)

    async def get_symbol(self, ticker: str) -> Optional[Symbol]:
        return await self._symbol_repo.get_symbol(ticker.upper())

    async def list_symbols(
        self, exchange: Optional[Exchange] = None, asset_type: Optional[AssetType] = None
    ) -> list[Symbol]:
        return await self._symbol_repo.list_symbols(exchange, asset_type)


class SectorService:
    def __init__(self, repo: SectorRepository) -> None:
        self._repo = repo

    async def get_sector(self, sector: str) -> Optional[SectorData]:
        return await self._repo.get_sector(sector)

    async def list_sectors(self) -> list[SectorData]:
        return await self._repo.list_sectors()


class IndexService:
    def __init__(self, repo: IndexRepository) -> None:
        self._repo = repo

    async def get_index(self, symbol: str) -> Optional[IndexData]:
        return await self._repo.get_index(symbol.upper())

    async def list_indices(self) -> list[IndexData]:
        return await self._repo.list_indices()


class CorporateActionService:
    def __init__(self, repo: CorporateActionRepository) -> None:
        self._repo = repo

    async def get_actions(self, symbol: str) -> list[CorporateAction]:
        return await self._repo.get_actions(symbol.upper())

    async def get_actions_by_date(self, start: str, end: str) -> list[CorporateAction]:
        return await self._repo.get_actions_by_date(start, end)
