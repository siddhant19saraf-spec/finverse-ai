from __future__ import annotations

from abc import ABC, abstractmethod
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
from app.domain.market.enums import AssetType, DataProvider, Exchange, Interval


class QuoteRepository(ABC):
    @abstractmethod
    async def get_quote(self, symbol: str) -> Optional[Quote]: ...

    @abstractmethod
    async def get_quotes(self, symbols: list[str]) -> list[Quote]: ...


class HistoricalRepository(ABC):
    @abstractmethod
    async def get_historical(
        self, symbol: str, interval: Interval, period: str = "1y"
    ) -> HistoricalData: ...


class SearchRepository(ABC):
    @abstractmethod
    async def search(self, query: str, asset_type: Optional[AssetType] = None) -> list[SearchResult]: ...


class SymbolRepository(ABC):
    @abstractmethod
    async def get_symbol(self, ticker: str) -> Optional[Symbol]: ...

    @abstractmethod
    async def list_symbols(
        self, exchange: Optional[Exchange] = None, asset_type: Optional[AssetType] = None
    ) -> list[Symbol]: ...


class SectorRepository(ABC):
    @abstractmethod
    async def get_sector(self, sector: str) -> Optional[SectorData]: ...

    @abstractmethod
    async def list_sectors(self) -> list[SectorData]: ...


class IndexRepository(ABC):
    @abstractmethod
    async def get_index(self, symbol: str) -> Optional[IndexData]: ...

    @abstractmethod
    async def list_indices(self) -> list[IndexData]: ...


class CorporateActionRepository(ABC):
    @abstractmethod
    async def get_actions(self, symbol: str) -> list[CorporateAction]: ...

    @abstractmethod
    async def get_actions_by_date(
        self, start: str, end: str
    ) -> list[CorporateAction]: ...
