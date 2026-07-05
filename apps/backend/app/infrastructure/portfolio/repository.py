from __future__ import annotations

import logging
from datetime import datetime, timedelta, timezone
from decimal import Decimal
from typing import Optional

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.exc import OperationalError

from app.domain.portfolio.entities import (
    AllocationBreakdown,
    PortfolioAllocation,
    PortfolioPerformance,
    PortfolioSummary,
    RiskMetrics,
    TransactionAnalysis,
)
from app.domain.portfolio.interfaces import PortfolioAnalyticsRepository
from app.infrastructure.portfolio.calculator import PortfolioCalculator
from app.models.portfolio import Holding, Portfolio, Transaction

logger = logging.getLogger(__name__)


class DBPortfolioAnalyticsRepository(PortfolioAnalyticsRepository):
    def __init__(self, db: AsyncSession) -> None:
        self._db = db

    async def get_summary(self, portfolio_id: int) -> Optional[PortfolioSummary]:
        try:
            q = await self._db.execute(select(Portfolio).filter(Portfolio.id == portfolio_id))
            portfolio = q.scalar_one_or_none()
            if not portfolio:
                return None

            hq = await self._db.execute(select(Holding).filter(Holding.portfolio_id == portfolio_id))
            holdings = hq.scalars().all()

            if not holdings:
                return PortfolioSummary(
                    portfolio_id=portfolio_id, total_value=Decimal("0"),
                    total_cost=Decimal("0"), total_pnl=Decimal("0"),
                    total_pnl_pct=Decimal("0"), day_change=Decimal("0"),
                    day_change_pct=Decimal("0"), holding_count=0,
                    currency=portfolio.currency, as_of=datetime.now(timezone.utc),
                )

            total_value = sum((h.quantity * (h.current_price or h.avg_buy_price)) for h in holdings)
            total_cost = sum((h.quantity * h.avg_buy_price) for h in holdings)
            total_pnl = total_value - total_cost
            total_pnl_pct = (total_pnl / total_cost * 100).quantize(Decimal("0.01")) if total_cost > 0 else Decimal("0")

            return PortfolioSummary(
                portfolio_id=portfolio_id, total_value=total_value,
                total_cost=total_cost, total_pnl=total_pnl,
                total_pnl_pct=total_pnl_pct, day_change=Decimal("0"),
                day_change_pct=Decimal("0"), holding_count=len(holdings),
                currency=portfolio.currency, as_of=datetime.now(timezone.utc),
            )
        except OperationalError:
            return None

    async def get_allocation(self, portfolio_id: int) -> Optional[PortfolioAllocation]:
        try:
            q = await self._db.execute(select(Portfolio).filter(Portfolio.id == portfolio_id))
            portfolio = q.scalar_one_or_none()
            if not portfolio:
                return None

            hq = await self._db.execute(select(Holding).filter(Holding.portfolio_id == portfolio_id))
            holdings = hq.scalars().all()

            total_value = sum((h.quantity * (h.current_price or h.avg_buy_price)) for h in holdings)
            if total_value == 0:
                total_value = Decimal("1")

            sector_agg: dict[str, Decimal] = {}
            type_agg: dict[str, Decimal] = {}
            sector_count: dict[str, int] = {}
            type_count: dict[str, int] = {}

            for h in holdings:
                mv = h.quantity * (h.current_price or h.avg_buy_price)
                sector = h.asset_type or "EQUITY"
                sector_agg[sector] = sector_agg.get(sector, Decimal("0")) + mv
                sector_count[sector] = sector_count.get(sector, 0) + 1
                at = h.asset_type or "EQUITY"
                type_agg[at] = type_agg.get(at, Decimal("0")) + mv
                type_count[at] = type_count.get(at, 0) + 1

            def _bd(agg: dict[str, Decimal], counts: dict[str, int]):
                return sorted([
                    AllocationBreakdown(
                        category=k, value=v,
                        weight_pct=(v / total_value * 100).quantize(Decimal("0.01")),
                        count=counts.get(k, 0),
                    )
                    for k, v in agg.items()
                ], key=lambda x: x.weight_pct, reverse=True)

            return PortfolioAllocation(
                portfolio_id=portfolio_id, by_sector=_bd(sector_agg, sector_count),
                by_asset_type=_bd(type_agg, type_count), by_exchange=[], top_holdings=[],
            )
        except OperationalError:
            return None

    async def get_risk_metrics(self, portfolio_id: int) -> Optional[RiskMetrics]:
        try:
            tq = await self._db.execute(
                select(Transaction).filter(Transaction.portfolio_id == portfolio_id).order_by(Transaction.executed_at)
            )
            transactions = tq.scalars().all()
            if len(transactions) < 2:
                return PortfolioCalculator.calculate_risk_metrics(portfolio_id, [])

            returns = []
            for i in range(1, len(transactions)):
                prev_price = transactions[i - 1].price
                curr_price = transactions[i].price
                if prev_price > 0:
                    ret = (curr_price - prev_price) / prev_price
                    returns.append(ret)

            return PortfolioCalculator.calculate_risk_metrics(portfolio_id, returns)
        except OperationalError:
            return None

    async def get_performance(self, portfolio_id: int) -> Optional[PortfolioPerformance]:
        try:
            tq = await self._db.execute(
                select(Transaction).filter(Transaction.portfolio_id == portfolio_id).order_by(Transaction.executed_at)
            )
            transactions = tq.scalars().all()
            if len(transactions) < 2:
                return PortfolioCalculator.calculate_performance(portfolio_id, [])

            returns = []
            for i in range(1, len(transactions)):
                prev = transactions[i - 1].price
                curr = transactions[i].price
                if prev > 0:
                    returns.append((curr - prev) / prev)

            return PortfolioCalculator.calculate_performance(portfolio_id, returns)
        except OperationalError:
            return None

    async def get_transaction_analysis(self, portfolio_id: int) -> Optional[TransactionAnalysis]:
        try:
            tq = await self._db.execute(
                select(Transaction).filter(Transaction.portfolio_id == portfolio_id)
            )
            transactions = tq.scalars().all()
            trades = [
                {"symbol": t.symbol, "side": t.side, "price": str(t.price), "fees": str(t.fees)}
                for t in transactions
            ]
            return PortfolioCalculator.calculate_transaction_analysis(trades)
        except OperationalError:
            return None

    async def get_portfolio_value_history(self, portfolio_id: int, days: int = 30) -> list[dict]:
        try:
            tq = await self._db.execute(
                select(Transaction)
                .filter(Transaction.portfolio_id == portfolio_id)
                .order_by(Transaction.executed_at)
            )
            transactions = tq.scalars().all()
            if not transactions:
                return []

            history = []
            cumulative = Decimal("0")
            for t in transactions:
                if t.side == "BUY":
                    cumulative += t.total_amount
                else:
                    cumulative -= t.total_amount
                history.append({
                    "date": t.executed_at.isoformat(),
                    "value": str(cumulative),
                })
            return history[-days:]
        except OperationalError:
            return []
