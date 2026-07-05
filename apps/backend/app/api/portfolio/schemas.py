from __future__ import annotations

from datetime import datetime
from decimal import Decimal
from typing import Optional

from pydantic import BaseModel, ConfigDict


class HoldingAnalyticsResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

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


class PortfolioSummaryResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

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


class AllocationBreakdownResponse(BaseModel):
    category: str
    value: Decimal
    weight_pct: Decimal
    count: int


class PortfolioAllocationResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    portfolio_id: int
    by_sector: list[AllocationBreakdownResponse]
    by_asset_type: list[AllocationBreakdownResponse]
    by_exchange: list[AllocationBreakdownResponse]
    top_holdings: list[AllocationBreakdownResponse]


class RiskMetricsResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    portfolio_id: int
    beta: Decimal
    sharpe_ratio: Decimal
    volatility: Decimal
    max_drawdown: Decimal
    var_95: Decimal
    var_99: Decimal
    sortino_ratio: Optional[Decimal] = None
    treynor_ratio: Optional[Decimal] = None


class PerformancePeriodResponse(BaseModel):
    label: str
    return_pct: Decimal
    benchmark_return_pct: Optional[Decimal] = None
    alpha: Optional[Decimal] = None


class PortfolioPerformanceResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    portfolio_id: int
    periods: list[PerformancePeriodResponse]
    annualized_return: Decimal
    inception_date: Optional[datetime] = None


class TransactionAnalysisResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    total_trades: int
    buy_trades: int
    sell_trades: int
    total_fees: Decimal
    avg_holding_period_days: Optional[Decimal] = None
    win_rate: Optional[Decimal] = None


class ValueHistoryPoint(BaseModel):
    date: str
    value: str
