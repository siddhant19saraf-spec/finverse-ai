from __future__ import annotations

from datetime import datetime
from decimal import Decimal
from typing import Any, Optional

from pydantic import BaseModel, ConfigDict, Field


class QuoteResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    symbol: str
    price: Decimal
    change: Decimal
    change_pct: Decimal
    open: Decimal
    high: Decimal
    low: Decimal
    previous_close: Decimal
    volume: int
    avg_volume: int = 0
    market_cap: Optional[Decimal] = None
    pe_ratio: Optional[Decimal] = None
    eps: Optional[Decimal] = None
    week_52_high: Optional[Decimal] = None
    week_52_low: Optional[Decimal] = None
    dividend_yield: Optional[Decimal] = None
    timestamp: Optional[datetime] = None
    provider: str = ""


class OHLCVResponse(BaseModel):
    timestamp: datetime
    open: Decimal
    high: Decimal
    low: Decimal
    close: Decimal
    volume: int


class HistoricalResponse(BaseModel):
    symbol: str
    interval: str
    data: list[OHLCVResponse]


class SearchResultResponse(BaseModel):
    ticker: str
    name: str
    asset_type: str
    exchange: str
    sector: Optional[str] = None


class SymbolResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    ticker: str
    name: str
    asset_type: str
    exchange: str
    sector: Optional[str] = None
    industry: Optional[str] = None
    isin: Optional[str] = None
    currency: str = "INR"


class SectorResponse(BaseModel):
    sector: str
    change_pct: Decimal
    market_cap: Decimal
    top_gainers: list[str] = []
    top_losers: list[str] = []


class IndexResponse(BaseModel):
    symbol: str
    name: str
    value: Decimal
    change: Decimal
    change_pct: Decimal
    components: list[str] = []
    timestamp: Optional[datetime] = None


class CorporateActionResponse(BaseModel):
    symbol: str
    action_type: str
    ex_date: datetime
    record_date: Optional[datetime] = None
    value: Optional[Decimal] = None
    ratio: Optional[str] = None
    description: Optional[str] = None


class QuoteBulkRequest(BaseModel):
    symbols: list[str] = Field(..., min_length=1, max_length=50)


class HistoricalRequest(BaseModel):
    interval: str = "1d"
    period: str = "1y"


class SearchRequest(BaseModel):
    query: str = Field(..., min_length=1, max_length=100)
    asset_type: Optional[str] = None


class GainerLoserResponse(BaseModel):
    symbol: str
    price: Decimal
    change: Decimal
    change_pct: Decimal
    volume: int = 0


class MarketStatusResponse(BaseModel):
    status: str
    provider: str
    provider_status: dict[str, Any] = {}


class ProviderStatusResponse(BaseModel):
    active_provider: str
    primary: str
    fallback: str
    failure_count: int
    primary_healthy: bool


class WatchlistResponse(BaseModel):
    user_id: int
    symbols: list[QuoteResponse] = []
