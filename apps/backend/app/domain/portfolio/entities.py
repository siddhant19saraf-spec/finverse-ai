from __future__ import annotations

from dataclasses import dataclass, field
from datetime import datetime
from decimal import Decimal
from typing import Optional


@dataclass(frozen=True)
class HoldingAnalytics:
    symbol: str
    quantity: Decimal
    avg_buy_price: Decimal
    current_price: Decimal
    market_value: Decimal
    cost_basis: Decimal
    unrealized_pnl: Decimal
    unrealized_pnl_pct: Decimal
    day_change: Decimal
    day_change_pct: Decimal
    weight_pct: Decimal


@dataclass(frozen=True)
class PortfolioSummary:
    portfolio_id: int
    total_value: Decimal
    total_cost: Decimal
    total_pnl: Decimal
    total_pnl_pct: Decimal
    day_change: Decimal
    day_change_pct: Decimal
    holding_count: int
    currency: str
    as_of: datetime


@dataclass(frozen=True)
class AllocationBreakdown:
    category: str
    value: Decimal
    weight_pct: Decimal
    count: int


@dataclass(frozen=True)
class PortfolioAllocation:
    portfolio_id: int
    by_sector: list[AllocationBreakdown]
    by_asset_type: list[AllocationBreakdown]
    by_exchange: list[AllocationBreakdown]
    top_holdings: list[AllocationBreakdown]


@dataclass(frozen=True)
class RiskMetrics:
    portfolio_id: int
    beta: Decimal
    sharpe_ratio: Decimal
    volatility: Decimal
    max_drawdown: Decimal
    var_95: Decimal
    var_99: Decimal
    sortino_ratio: Optional[Decimal] = None
    treynor_ratio: Optional[Decimal] = None


@dataclass(frozen=True)
class PerformancePeriod:
    label: str
    return_pct: Decimal
    benchmark_return_pct: Optional[Decimal] = None
    alpha: Optional[Decimal] = None


@dataclass(frozen=True)
class PortfolioPerformance:
    portfolio_id: int
    periods: list[PerformancePeriod]
    annualized_return: Decimal
    inception_date: Optional[datetime] = None


@dataclass(frozen=True)
class TransactionAnalysis:
    total_trades: int
    buy_trades: int
    sell_trades: int
    total_fees: Decimal
    avg_holding_period_days: Optional[Decimal] = None
    win_rate: Optional[Decimal] = None
