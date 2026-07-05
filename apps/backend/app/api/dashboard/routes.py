from __future__ import annotations

from datetime import datetime, timezone
from decimal import Decimal

from fastapi import APIRouter

from app.api.dashboard.schemas import (
    AIInsightWidget,
    ComplianceWidget,
    DashboardResponse,
    DigitalTwinWidget,
    GoalWidget,
    MarketWidget,
    NotificationWidget,
    PortfolioWidget,
    RiskWidget,
)

router = APIRouter(prefix="/v1/dashboard", tags=["dashboard"])


def _portfolio_widget() -> PortfolioWidget:
    return PortfolioWidget(
        total_value=Decimal("2458750"),
        day_change=Decimal("12450"),
        day_change_pct=Decimal("0.51"),
        total_pnl=Decimal("458750"),
        holdings_count=12,
        top_gainers=[
            {"symbol": "RELIANCE", "change_pct": 3.2, "value": Decimal("285000")},
            {"symbol": "TCS", "change_pct": 2.1, "value": Decimal("195000")},
        ],
        top_losers=[
            {"symbol": "HDFCBANK", "change_pct": -1.2, "value": Decimal("320000")},
            {"symbol": "ICICIBANK", "change_pct": -0.8, "value": Decimal("185000")},
        ],
    )


def _risk_widget() -> RiskWidget:
    return RiskWidget(
        overall_score=Decimal("72"),
        risk_level="moderate",
        sharpe_ratio=Decimal("1.25"),
        max_drawdown=Decimal("12.5"),
        var_95=Decimal("8.3"),
        diversification_score=Decimal("68"),
    )


def _goal_widget() -> GoalWidget:
    return GoalWidget(
        goals_on_track=3,
        goals_total=5,
        total_target=Decimal("15000000"),
        total_current=Decimal("6750000"),
        overall_progress_pct=Decimal("45.0"),
        goals=[
            {"name": "Retirement", "progress": 62, "on_track": True, "target": Decimal("10000000")},
            {"name": "Child Education", "progress": 35, "on_track": True, "target": Decimal("3000000")},
            {"name": "Home Purchase", "progress": 18, "on_track": False, "target": Decimal("2000000")},
        ],
    )


def _market_widget() -> MarketWidget:
    return MarketWidget(
        indices=[
            {"name": "NIFTY 50", "value": Decimal("24567.80"), "change_pct": 0.45},
            {"name": "SENSEX", "value": Decimal("81234.50"), "change_pct": 0.38},
            {"name": "NIFTY Bank", "value": Decimal("51234.60"), "change_pct": -0.22},
        ],
        top_gainers=[
            {"symbol": "ADANIENT", "change_pct": 5.4},
            {"symbol": "TATASTEEL", "change_pct": 3.8},
        ],
        top_losers=[
            {"symbol": "BAJFINANCE", "change_pct": -2.1},
            {"symbol": "AXISBANK", "change_pct": -1.5},
        ],
        market_status="open",
        last_updated=datetime.now(timezone.utc),
    )


def _digital_twin_widget() -> DigitalTwinWidget:
    return DigitalTwinWidget(
        financial_health_score=Decimal("78"),
        projected_net_worth=Decimal("12500000"),
        savings_rate=Decimal("32"),
        risk_alignment="good",
        recommendations=[
            "Consider increasing SIP in equity mutual funds",
            "Review home loan prepayment options",
            "Build emergency fund to 6 months of expenses",
        ],
    )


def _ai_insights_widget() -> AIInsightWidget:
    return AIInsightWidget(
        recent_insights=[
            {
                "type": "rebalance",
                "summary": "Portfolio rebalance recommended — increase debt allocation by 8%",
                "confidence": 87,
                "timestamp": datetime.now(timezone.utc).isoformat(),
            },
            {
                "type": "alert",
                "summary": "RELIANCE showing strong momentum — consider adding position",
                "confidence": 72,
                "timestamp": datetime.now(timezone.utc).isoformat(),
            },
        ],
        insight_count=12,
        confidence_avg=Decimal("79.5"),
    )


def _compliance_widget() -> ComplianceWidget:
    return ComplianceWidget(
        overall_compliant=True,
        regulations_checked=3,
        violations_count=0,
        critical_violations=0,
        last_check=datetime.now(timezone.utc),
    )


def _notifications_widget() -> NotificationWidget:
    return NotificationWidget(
        unread_count=3,
        alerts=[
            {"type": "info", "message": "Monthly portfolio report is ready", "time": "2h ago"},
            {"type": "warning", "message": "Goal 'Home Purchase' falling behind target", "time": "1d ago"},
            {"type": "success", "message": "KYC verification completed successfully", "time": "3d ago"},
        ],
    )


@router.get("/{user_id}", response_model=DashboardResponse)
async def get_dashboard(user_id: int):
    return DashboardResponse(
        user_id=user_id,
        portfolio=_portfolio_widget(),
        risk=_risk_widget(),
        goals=_goal_widget(),
        market=_market_widget(),
        digital_twin=_digital_twin_widget(),
        ai_insights=_ai_insights_widget(),
        compliance=_compliance_widget(),
        notifications=_notifications_widget(),
        generated_at=datetime.now(timezone.utc),
    )


@router.get("/{user_id}/portfolio", response_model=PortfolioWidget)
async def get_portfolio_widget(user_id: int):
    return _portfolio_widget()


@router.get("/{user_id}/risk", response_model=RiskWidget)
async def get_risk_widget(user_id: int):
    return _risk_widget()


@router.get("/{user_id}/goals", response_model=GoalWidget)
async def get_goals_widget(user_id: int):
    return _goal_widget()


@router.get("/{user_id}/market", response_model=MarketWidget)
async def get_market_widget(user_id: int):
    return _market_widget()


@router.get("/{user_id}/digital-twin", response_model=DigitalTwinWidget)
async def get_digital_twin_widget(user_id: int):
    return _digital_twin_widget()


@router.get("/{user_id}/ai-insights", response_model=AIInsightWidget)
async def get_ai_insights_widget(user_id: int):
    return _ai_insights_widget()


@router.get("/{user_id}/compliance", response_model=ComplianceWidget)
async def get_compliance_widget(user_id: int):
    return _compliance_widget()


@router.get("/{user_id}/notifications", response_model=NotificationWidget)
async def get_notifications_widget(user_id: int):
    return _notifications_widget()
