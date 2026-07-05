from __future__ import annotations

from fastapi import APIRouter, Depends, HTTPException, Query

from app.api.portfolio.schemas import (
    PortfolioAllocationResponse,
    PortfolioPerformanceResponse,
    PortfolioSummaryResponse,
    RiskMetricsResponse,
    TransactionAnalysisResponse,
    ValueHistoryPoint,
)
from app.application.portfolio.services import PortfolioAnalyticsService
from app.db.session import get_db
from sqlalchemy.ext.asyncio import AsyncSession

router = APIRouter(prefix="/v1/portfolios", tags=["portfolios"])


def _get_service(db: AsyncSession = Depends(get_db)) -> PortfolioAnalyticsService:
    from app.infrastructure.portfolio.repository import DBPortfolioAnalyticsRepository
    repo = DBPortfolioAnalyticsRepository(db)
    return PortfolioAnalyticsService(repo)


@router.get("/{portfolio_id}/summary", response_model=PortfolioSummaryResponse)
async def get_portfolio_summary(
    portfolio_id: int,
    svc: PortfolioAnalyticsService = Depends(_get_service),
):
    summary = await svc.get_summary(portfolio_id)
    if not summary:
        raise HTTPException(status_code=404, detail=f"Portfolio {portfolio_id} not found")
    return summary


@router.get("/{portfolio_id}/allocation", response_model=PortfolioAllocationResponse)
async def get_portfolio_allocation(
    portfolio_id: int,
    svc: PortfolioAnalyticsService = Depends(_get_service),
):
    allocation = await svc.get_allocation(portfolio_id)
    if not allocation:
        raise HTTPException(status_code=404, detail=f"Portfolio {portfolio_id} not found")
    return allocation


@router.get("/{portfolio_id}/risk", response_model=RiskMetricsResponse)
async def get_portfolio_risk(
    portfolio_id: int,
    svc: PortfolioAnalyticsService = Depends(_get_service),
):
    risk = await svc.get_risk_metrics(portfolio_id)
    if not risk:
        raise HTTPException(status_code=404, detail=f"Portfolio {portfolio_id} not found")
    return risk


@router.get("/{portfolio_id}/performance", response_model=PortfolioPerformanceResponse)
async def get_portfolio_performance(
    portfolio_id: int,
    svc: PortfolioAnalyticsService = Depends(_get_service),
):
    perf = await svc.get_performance(portfolio_id)
    if not perf:
        raise HTTPException(status_code=404, detail=f"Portfolio {portfolio_id} not found")
    return perf


@router.get("/{portfolio_id}/transactions/analysis", response_model=TransactionAnalysisResponse)
async def get_transaction_analysis(
    portfolio_id: int,
    svc: PortfolioAnalyticsService = Depends(_get_service),
):
    analysis = await svc.get_transaction_analysis(portfolio_id)
    if not analysis:
        raise HTTPException(status_code=404, detail=f"Portfolio {portfolio_id} not found")
    return analysis


@router.get("/{portfolio_id}/value-history", response_model=list[ValueHistoryPoint])
async def get_value_history(
    portfolio_id: int,
    days: int = Query(30, ge=1, le=365),
    svc: PortfolioAnalyticsService = Depends(_get_service),
):
    return await svc.get_value_history(portfolio_id, days)
