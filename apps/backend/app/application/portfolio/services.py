from __future__ import annotations

from typing import Optional

from app.domain.portfolio.entities import (
    PortfolioAllocation,
    PortfolioPerformance,
    PortfolioSummary,
    RiskMetrics,
    TransactionAnalysis,
)
from app.domain.portfolio.interfaces import PortfolioAnalyticsRepository


class PortfolioAnalyticsService:
    def __init__(self, repo: PortfolioAnalyticsRepository) -> None:
        self._repo = repo

    async def get_summary(self, portfolio_id: int) -> Optional[PortfolioSummary]:
        return await self._repo.get_summary(portfolio_id)

    async def get_allocation(self, portfolio_id: int) -> Optional[PortfolioAllocation]:
        return await self._repo.get_allocation(portfolio_id)

    async def get_risk_metrics(self, portfolio_id: int) -> Optional[RiskMetrics]:
        return await self._repo.get_risk_metrics(portfolio_id)

    async def get_performance(self, portfolio_id: int) -> Optional[PortfolioPerformance]:
        return await self._repo.get_performance(portfolio_id)

    async def get_transaction_analysis(self, portfolio_id: int) -> Optional[TransactionAnalysis]:
        return await self._repo.get_transaction_analysis(portfolio_id)

    async def get_value_history(self, portfolio_id: int, days: int = 30) -> list[dict]:
        return await self._repo.get_portfolio_value_history(portfolio_id, days)
