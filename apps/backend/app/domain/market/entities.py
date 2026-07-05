from __future__ import annotations

from dataclasses import dataclass, field
from datetime import datetime
from decimal import Decimal
from typing import Optional

from app.domain.market.enums import AssetType, Exchange, Interval


@dataclass(frozen=True)
class Symbol:
    ticker: str
    name: str
    asset_type: AssetType
    exchange: Exchange
    sector: Optional[str] = None
    industry: Optional[str] = None
    isin: Optional[str] = None
    currency: str = "INR"


@dataclass(frozen=True)
class Quote:
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


@dataclass(frozen=True)
class OHLCV:
    timestamp: datetime
    open: Decimal
    high: Decimal
    low: Decimal
    close: Decimal
    volume: int
    adjusted_close: Optional[Decimal] = None


@dataclass(frozen=True)
class HistoricalData:
    symbol: str
    interval: Interval
    data: list[OHLCV] = field(default_factory=list)


@dataclass(frozen=True)
class SearchResult:
    ticker: str
    name: str
    asset_type: AssetType
    exchange: Exchange
    sector: Optional[str] = None


@dataclass(frozen=True)
class SectorData:
    sector: str
    change_pct: Decimal
    market_cap: Decimal
    top_gainers: list[str] = field(default_factory=list)
    top_losers: list[str] = field(default_factory=list)


@dataclass(frozen=True)
class IndexData:
    symbol: str
    name: str
    value: Decimal
    change: Decimal
    change_pct: Decimal
    components: list[str] = field(default_factory=list)
    timestamp: Optional[datetime] = None


@dataclass(frozen=True)
class CorporateAction:
    symbol: str
    action_type: str
    ex_date: datetime
    record_date: Optional[datetime] = None
    value: Optional[Decimal] = None
    ratio: Optional[str] = None
    description: Optional[str] = None
