from __future__ import annotations

from datetime import datetime
from decimal import Decimal
from typing import Optional

from pydantic import BaseModel, ConfigDict


class PortfolioWidget(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    total_value: Decimal
    day_change: Decimal
    day_change_pct: Decimal
    total_pnl: Decimal
    holdings_count: int
    top_gainers: list[dict]
    top_losers: list[dict]


class RiskWidget(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    overall_score: Decimal
    risk_level: str
    sharpe_ratio: Decimal
    max_drawdown: Decimal
    var_95: Decimal
    diversification_score: Decimal


class GoalWidget(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    goals_on_track: int
    goals_total: int
    total_target: Decimal
    total_current: Decimal
    overall_progress_pct: Decimal
    goals: list[dict]


class MarketWidget(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    indices: list[dict]
    top_gainers: list[dict]
    top_losers: list[dict]
    market_status: str
    last_updated: datetime


class DigitalTwinWidget(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    financial_health_score: Decimal
    projected_net_worth: Decimal
    savings_rate: Decimal
    risk_alignment: str
    recommendations: list[str]


class AIInsightWidget(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    recent_insights: list[dict]
    insight_count: int
    confidence_avg: Decimal


class ComplianceWidget(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    overall_compliant: bool
    regulations_checked: int
    violations_count: int
    critical_violations: int
    last_check: Optional[datetime] = None


class NotificationWidget(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    unread_count: int
    alerts: list[dict]


class DashboardResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    user_id: int
    portfolio: PortfolioWidget
    risk: RiskWidget
    goals: GoalWidget
    market: MarketWidget
    digital_twin: DigitalTwinWidget
    ai_insights: AIInsightWidget
    compliance: ComplianceWidget
    notifications: NotificationWidget
    generated_at: datetime
