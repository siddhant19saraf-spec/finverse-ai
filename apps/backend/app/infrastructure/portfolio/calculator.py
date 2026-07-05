from __future__ import annotations

import math
from datetime import datetime, timezone
from decimal import Decimal, ROUND_HALF_UP
from typing import Optional

from app.domain.portfolio.entities import (
    AllocationBreakdown,
    HoldingAnalytics,
    PerformancePeriod,
    PortfolioAllocation,
    PortfolioPerformance,
    PortfolioSummary,
    RiskMetrics,
    TransactionAnalysis,
)


class PortfolioCalculator:
    @staticmethod
    def calculate_holding_analytics(
        symbol: str,
        quantity: Decimal,
        avg_buy_price: Decimal,
        current_price: Decimal,
        day_change: Decimal,
        total_portfolio_value: Decimal,
    ) -> HoldingAnalytics:
        market_value = quantity * current_price
        cost_basis = quantity * avg_buy_price
        unrealized_pnl = market_value - cost_basis
        unrealized_pnl_pct = (unrealized_pnl / cost_basis * 100).quantize(Decimal("0.01"), ROUND_HALF_UP) if cost_basis > 0 else Decimal("0")
        day_change_pct = (day_change / current_price * 100).quantize(Decimal("0.01"), ROUND_HALF_UP) if current_price > 0 else Decimal("0")
        weight_pct = (market_value / total_portfolio_value * 100).quantize(Decimal("0.01"), ROUND_HALF_UP) if total_portfolio_value > 0 else Decimal("0")

        return HoldingAnalytics(
            symbol=symbol, quantity=quantity, avg_buy_price=avg_buy_price,
            current_price=current_price, market_value=market_value,
            cost_basis=cost_basis, unrealized_pnl=unrealized_pnl,
            unrealized_pnl_pct=unrealized_pnl_pct, day_change=day_change,
            day_change_pct=day_change_pct, weight_pct=weight_pct,
        )

    @staticmethod
    def calculate_portfolio_summary(
        portfolio_id: int,
        holdings: list[HoldingAnalytics],
        currency: str = "INR",
    ) -> PortfolioSummary:
        total_value = sum(h.market_value for h in holdings)
        total_cost = sum(h.cost_basis for h in holdings)
        total_pnl = total_value - total_cost
        total_pnl_pct = (total_pnl / total_cost * 100).quantize(Decimal("0.01"), ROUND_HALF_UP) if total_cost > 0 else Decimal("0")
        day_change = sum(h.day_change * h.quantity for h in holdings)
        day_change_pct = (day_change / total_value * 100).quantize(Decimal("0.01"), ROUND_HALF_UP) if total_value > 0 else Decimal("0")

        return PortfolioSummary(
            portfolio_id=portfolio_id, total_value=total_value,
            total_cost=total_cost, total_pnl=total_pnl,
            total_pnl_pct=total_pnl_pct, day_change=day_change,
            day_change_pct=day_change_pct, holding_count=len(holdings),
            currency=currency, as_of=datetime.now(timezone.utc),
        )

    @staticmethod
    def calculate_allocation(
        portfolio_id: int,
        holdings: list[HoldingAnalytics],
        sector_map: dict[str, str],
        asset_type_map: dict[str, str],
        exchange_map: dict[str, str],
    ) -> PortfolioAllocation:
        total_value = sum(h.market_value for h in holdings)
        if total_value == 0:
            total_value = Decimal("1")

        sector_agg: dict[str, Decimal] = {}
        type_agg: dict[str, Decimal] = {}
        exchange_agg: dict[str, Decimal] = {}
        sector_count: dict[str, int] = {}
        type_count: dict[str, int] = {}
        exchange_count: dict[str, int] = {}

        for h in holdings:
            sector = sector_map.get(h.symbol, "Unknown")
            sector_agg[sector] = sector_agg.get(sector, Decimal("0")) + h.market_value
            sector_count[sector] = sector_count.get(sector, 0) + 1

            at = asset_type_map.get(h.symbol, "EQUITY")
            type_agg[at] = type_agg.get(at, Decimal("0")) + h.market_value
            type_count[at] = type_count.get(at, 0) + 1

            ex = exchange_map.get(h.symbol, "NSE")
            exchange_agg[ex] = exchange_agg.get(ex, Decimal("0")) + h.market_value
            exchange_count[ex] = exchange_count.get(ex, 0) + 1

        def _breakdown(agg: dict[str, Decimal], counts: dict[str, int]) -> list[AllocationBreakdown]:
            return sorted([
                AllocationBreakdown(
                    category=k, value=v,
                    weight_pct=(v / total_value * 100).quantize(Decimal("0.01"), ROUND_HALF_UP),
                    count=counts.get(k, 0),
                )
                for k, v in agg.items()
            ], key=lambda x: x.weight_pct, reverse=True)

        top = sorted(holdings, key=lambda h: h.market_value, reverse=True)[:5]
        top_holdings = [
            AllocationBreakdown(
                category=h.symbol, value=h.market_value,
                weight_pct=h.weight_pct, count=1,
            )
            for h in top
        ]

        return PortfolioAllocation(
            portfolio_id=portfolio_id,
            by_sector=_breakdown(sector_agg, sector_count),
            by_asset_type=_breakdown(type_agg, type_count),
            by_exchange=_breakdown(exchange_agg, exchange_count),
            top_holdings=top_holdings,
        )

    @staticmethod
    def calculate_risk_metrics(
        portfolio_id: int,
        returns: list[Decimal],
        benchmark_returns: Optional[list[Decimal]] = None,
        risk_free_rate: Decimal = Decimal("0.065"),
    ) -> RiskMetrics:
        n = len(returns)
        if n < 2:
            return RiskMetrics(
                portfolio_id=portfolio_id, beta=Decimal("0"),
                sharpe_ratio=Decimal("0"), volatility=Decimal("0"),
                max_drawdown=Decimal("0"), var_95=Decimal("0"), var_99=Decimal("0"),
            )

        mean_ret = sum(returns) / n
        variance = sum((r - mean_ret) ** 2 for r in returns) / (n - 1)
        volatility = Decimal(str(math.sqrt(float(variance))))

        annualized_vol = volatility * Decimal(str(math.sqrt(252)))
        annualized_return = mean_ret * 252

        daily_rf = risk_free_rate / 252
        excess = mean_ret - daily_rf
        sharpe = (excess / volatility * Decimal(str(math.sqrt(252)))) if volatility > 0 else Decimal("0")

        downside = [min(Decimal("0"), r - daily_rf) for r in returns]
        downside_var = sum(d ** 2 for d in downside) / n
        downside_vol = Decimal(str(math.sqrt(float(downside_var)))) * Decimal(str(math.sqrt(252)))
        sortino = (annualized_return - risk_free_rate) / downside_vol if downside_vol > 0 else Decimal("0")

        cumulative = Decimal("1")
        peak = Decimal("1")
        max_dd = Decimal("0")
        for r in returns:
            cumulative *= (1 + r)
            if cumulative > peak:
                peak = cumulative
            dd = (peak - cumulative) / peak
            if dd > max_dd:
                max_dd = dd

        sorted_returns = sorted(returns)
        var_95_idx = max(0, int(n * 0.05) - 1)
        var_99_idx = max(0, int(n * 0.01) - 1)
        var_95 = abs(sorted_returns[var_95_idx]) if var_95_idx < n else Decimal("0")
        var_99 = abs(sorted_returns[var_99_idx]) if var_99_idx < n else Decimal("0")

        beta = Decimal("1")
        treynor = None
        if benchmark_returns and len(benchmark_returns) == n:
            bm_mean = sum(benchmark_returns) / n
            cov = sum((r - mean_ret) * (br - bm_mean) for r, br in zip(returns, benchmark_returns)) / (n - 1)
            bm_var = sum((br - bm_mean) ** 2 for br in benchmark_returns) / (n - 1)
            if bm_var > 0:
                beta = Decimal(str(float(cov) / float(bm_var)))
            if beta != 0:
                treynor = (annualized_return - risk_free_rate) / beta

        return RiskMetrics(
            portfolio_id=portfolio_id, beta=beta.quantize(Decimal("0.01")),
            sharpe_ratio=sharpe.quantize(Decimal("0.01")),
            volatility=annualized_vol.quantize(Decimal("0.01")),
            max_drawdown=(max_dd * 100).quantize(Decimal("0.01")),
            var_95=(var_95 * 100).quantize(Decimal("0.01")),
            var_99=(var_99 * 100).quantize(Decimal("0.01")),
            sortino_ratio=sortino.quantize(Decimal("0.01")),
            treynor_ratio=treynor.quantize(Decimal("0.01")) if treynor is not None else None,
        )

    @staticmethod
    def calculate_performance(
        portfolio_id: int,
        returns: list[Decimal],
        benchmark_returns: Optional[list[Decimal]] = None,
    ) -> PortfolioPerformance:
        n = len(returns)
        if n == 0:
            return PortfolioPerformance(
                portfolio_id=portfolio_id, periods=[],
                annualized_return=Decimal("0"),
            )

        periods = []

        def _period_return(data: list[Decimal], label: str) -> PerformancePeriod:
            if not data:
                return PerformancePeriod(label=label, return_pct=Decimal("0"))
            cumulative = Decimal("1")
            for r in data:
                cumulative *= (1 + r)
            ret = (cumulative - 1) * 100
            bm_ret = None
            alpha = None
            if benchmark_returns:
                bm_slice = benchmark_returns[:len(data)]
                if bm_slice:
                    bm_cum = Decimal("1")
                    for r in bm_slice:
                        bm_cum *= (1 + r)
                    bm_ret = (bm_cum - 1) * 100
                    alpha = ret - bm_ret
            return PerformancePeriod(
                label=label, return_pct=ret.quantize(Decimal("0.01")),
                benchmark_return_pct=bm_ret.quantize(Decimal("0.01")) if bm_ret is not None else None,
                alpha=alpha.quantize(Decimal("0.01")) if alpha is not None else None,
            )

        if n >= 5:
            periods.append(_period_return(returns[-5:], "1W"))
        if n >= 22:
            periods.append(_period_return(returns[-22:], "1M"))
        if n >= 66:
            periods.append(_period_return(returns[-66:], "3M"))
        if n >= 126:
            periods.append(_period_return(returns[-126:], "6M"))
        periods.append(_period_return(returns, "YTD"))

        cumulative = Decimal("1")
        for r in returns:
            cumulative *= (1 + r)
        annualized = ((cumulative ** (Decimal("252") / n)) - 1) * 100 if n > 0 else Decimal("0")

        return PortfolioPerformance(
            portfolio_id=portfolio_id, periods=periods,
            annualized_return=annualized.quantize(Decimal("0.01")),
        )

    @staticmethod
    def calculate_transaction_analysis(
        trades: list[dict],
    ) -> TransactionAnalysis:
        total = len(trades)
        buys = sum(1 for t in trades if t.get("side") == "BUY")
        sells = total - buys
        fees = sum(Decimal(str(t.get("fees", 0))) for t in trades)

        win_count = 0
        periods: list[int] = []
        buy_prices: dict[str, list[Decimal]] = {}

        for t in trades:
            sym = t.get("symbol", "")
            side = t.get("side", "")
            price = Decimal(str(t.get("price", 0)))
            if side == "BUY":
                buy_prices.setdefault(sym, []).append(price)
            elif side == "SELL" and buy_prices.get(sym):
                avg_buy = sum(buy_prices[sym]) / len(buy_prices[sym])
                if price > avg_buy:
                    win_count += 1
                buy_prices[sym].pop(0)

        win_rate = (Decimal(str(win_count)) / Decimal(str(sells)) * 100) if sells > 0 else None

        return TransactionAnalysis(
            total_trades=total, buy_trades=buys, sell_trades=sells,
            total_fees=fees, win_rate=win_rate.quantize(Decimal("0.01")) if win_rate is not None else None,
        )
