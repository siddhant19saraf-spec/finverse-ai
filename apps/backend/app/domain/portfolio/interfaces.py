from __future__ import annotations

from abc import ABC, abstractmethod
from typing import Optional

from app.domain.portfolio.entities import (
    PortfolioAllocation,
    PortfolioPerformance,
    PortfolioSummary,
    RiskMetrics,
    TransactionAnalysis,
)


class PortfolioAnalyticsRepository(ABC):
    @abstractmethod
    async def get_summary(self, portfolio_id: int) -> Optional[PortfolioSummary]: ...

    @abstractmethod
    async def get_allocation(self, portfolio_id: int) -> Optional[PortfolioAllocation]: ...

    @abstractmethod
    async def get_risk_metrics(self, portfolio_id: int) -> Optional[RiskMetrics]: ...

    @abstractmethod
    async def get_performance(self, portfolio_id: int) -> Optional[PortfolioPerformance]: ...

    @abstractmethod
    async def get_transaction_analysis(self, portfolio_id: int) -> Optional[TransactionAnalysis]: ...

    @abstractmethod
    async def get_portfolio_value_history(self, portfolio_id: int, days: int = 30) -> list[dict]: ...
