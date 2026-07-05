import pytest
from decimal import Decimal
from app.infrastructure.portfolio.calculator import PortfolioCalculator


class TestHoldingAnalytics:
    def test_basic_calculation(self):
        result = PortfolioCalculator.calculate_holding_analytics(
            symbol="RELIANCE.NS", quantity=Decimal("10"),
            avg_buy_price=Decimal("2000"), current_price=Decimal("2500"),
            day_change=Decimal("25"), total_portfolio_value=Decimal("50000"),
        )
        assert result.symbol == "RELIANCE.NS"
        assert result.market_value == Decimal("25000")
        assert result.cost_basis == Decimal("20000")
        assert result.unrealized_pnl == Decimal("5000")
        assert result.unrealized_pnl_pct == Decimal("25.00")
        assert result.weight_pct == Decimal("50.00")

    def test_zero_cost_basis(self):
        result = PortfolioCalculator.calculate_holding_analytics(
            symbol="TEST", quantity=Decimal("0"),
            avg_buy_price=Decimal("0"), current_price=Decimal("100"),
            day_change=Decimal("0"), total_portfolio_value=Decimal("0"),
        )
        assert result.unrealized_pnl_pct == Decimal("0")
        assert result.weight_pct == Decimal("0")


class TestPortfolioSummary:
    def test_summary_calculation(self):
        from app.domain.portfolio.entities import HoldingAnalytics
        holdings = [
            HoldingAnalytics(
                symbol="A", quantity=Decimal("10"), avg_buy_price=Decimal("100"),
                current_price=Decimal("120"), market_value=Decimal("1200"),
                cost_basis=Decimal("1000"), unrealized_pnl=Decimal("200"),
                unrealized_pnl_pct=Decimal("20.00"), day_change=Decimal("5"),
                day_change_pct=Decimal("0.42"), weight_pct=Decimal("60.00"),
            ),
            HoldingAnalytics(
                symbol="B", quantity=Decimal("5"), avg_buy_price=Decimal("160"),
                current_price=Decimal("160"), market_value=Decimal("800"),
                cost_basis=Decimal("800"), unrealized_pnl=Decimal("0"),
                unrealized_pnl_pct=Decimal("0"), day_change=Decimal("0"),
                day_change_pct=Decimal("0"), weight_pct=Decimal("40.00"),
            ),
        ]
        summary = PortfolioCalculator.calculate_portfolio_summary(
            portfolio_id=1, holdings=holdings, currency="INR",
        )
        assert summary.portfolio_id == 1
        assert summary.total_value == Decimal("2000")
        assert summary.total_cost == Decimal("1800")
        assert summary.total_pnl == Decimal("200")
        assert summary.holding_count == 2
        assert summary.currency == "INR"


class TestRiskMetrics:
    def test_risk_with_returns(self):
        returns = [Decimal("0.01"), Decimal("-0.005"), Decimal("0.02"), Decimal("-0.01"), Decimal("0.015")]
        risk = PortfolioCalculator.calculate_risk_metrics(portfolio_id=1, returns=returns)
        assert risk.portfolio_id == 1
        assert risk.volatility > 0
        assert risk.sharpe_ratio != 0

    def test_risk_empty_returns(self):
        risk = PortfolioCalculator.calculate_risk_metrics(portfolio_id=1, returns=[])
        assert risk.beta == Decimal("0")
        assert risk.volatility == Decimal("0")

    def test_risk_single_return(self):
        risk = PortfolioCalculator.calculate_risk_metrics(portfolio_id=1, returns=[Decimal("0.01")])
        assert risk.volatility == Decimal("0")


class TestPerformance:
    def test_performance_periods(self):
        returns = [Decimal("0.01")] * 30 + [Decimal("-0.005")] * 20
        perf = PortfolioCalculator.calculate_performance(portfolio_id=1, returns=returns)
        assert perf.portfolio_id == 1
        assert len(perf.periods) >= 1
        assert perf.annualized_return != 0

    def test_performance_empty(self):
        perf = PortfolioCalculator.calculate_performance(portfolio_id=1, returns=[])
        assert len(perf.periods) == 0


class TestTransactionAnalysis:
    def test_analysis(self):
        trades = [
            {"symbol": "A", "side": "BUY", "price": "100", "fees": "5"},
            {"symbol": "A", "side": "SELL", "price": "120", "fees": "5"},
            {"symbol": "B", "side": "BUY", "price": "200", "fees": "10"},
        ]
        analysis = PortfolioCalculator.calculate_transaction_analysis(trades)
        assert analysis.total_trades == 3
        assert analysis.buy_trades == 2
        assert analysis.sell_trades == 1
        assert analysis.total_fees == Decimal("20")
        assert analysis.win_rate == Decimal("100.00")

    def test_analysis_empty(self):
        analysis = PortfolioCalculator.calculate_transaction_analysis([])
        assert analysis.total_trades == 0
        assert analysis.win_rate is None
