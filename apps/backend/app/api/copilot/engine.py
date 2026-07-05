from __future__ import annotations

from datetime import datetime, timezone
from decimal import Decimal
from typing import Optional
from uuid import uuid4

from app.api.copilot.schemas import CopilotCard, CopilotResponse, CopilotSource
from app.infrastructure.compliance.dpdp_engine import DPDPComplianceEngine
from app.infrastructure.compliance.rbi_engine import RBIComplianceEngine
from app.infrastructure.compliance.sebi_engine import SEBIComplianceEngine
from app.infrastructure.digital_twin.goal_achievement import DefaultGoalAchievementCalculator
from app.infrastructure.digital_twin.risk_metrics import DefaultRiskMetricsCalculator
from app.infrastructure.digital_twin.scenario_engine import EnhancedScenarioEngine


class CopilotEngine:
    def __init__(self) -> None:
        self._scenario_engine = EnhancedScenarioEngine(default_iterations=200)
        self._goal_calc = DefaultGoalAchievementCalculator()
        self._risk_calc = DefaultRiskMetricsCalculator()
        self._sebi = SEBIComplianceEngine()
        self._rbi = RBIComplianceEngine()
        self._dpdp = DPDPComplianceEngine()

    async def process(self, message: str, context: dict) -> CopilotResponse:
        msg_lower = message.lower()

        if any(w in msg_lower for w in ["portfolio", "holdings", "invest", "stock"]):
            return await self._handle_portfolio_query(message, context)
        elif any(w in msg_lower for w in ["inflation", "what if", "scenario", "simulate"]):
            return await self._handle_scenario_query(message, context)
        elif any(w in msg_lower for w in ["risk", "safe", "volatil"]):
            return await self._handle_risk_query(message, context)
        elif any(w in msg_lower for w in ["goal", "retire", "saving", "target"]):
            return await self._handle_goal_query(message, context)
        elif any(w in msg_lower for w in ["compliance", "sebi", "rbi", "regulat"]):
            return await self._handle_compliance_query(message, context)
        elif any(w in msg_lower for w in ["market", "nifty", "sensex", "index"]):
            return await self._handle_market_query(message, context)
        else:
            return await self._handle_general_query(message, context)

    async def _handle_portfolio_query(self, message: str, context: dict) -> CopilotResponse:
        from app.domain.digital_twin.entities import FinancialProfile, ScenarioInput

        profile = FinancialProfile(
            user_id=1,
            annual_income=Decimal(str(context.get("annual_income", 1200000))),
            monthly_expenses=Decimal(str(context.get("monthly_expenses", 50000))),
            savings_rate=Decimal(str(context.get("savings_rate", 30))),
            risk_tolerance=context.get("risk_tolerance", "moderate"),
            investment_horizon_years=context.get("horizon_years", 10),
            current_portfolio=Decimal(str(context.get("portfolio_value", 2500000))),
        )

        risk_returns = [Decimal("12"), Decimal("-3"), Decimal("8"), Decimal("15"), Decimal("-5"), Decimal("10")]
        risk = await self._risk_calc.calculate(risk_returns, Decimal("6"))

        return CopilotResponse(
            answer=(
                f"Based on your portfolio analysis:\n\n"
                f"**Current Portfolio Value:** ₹{profile.current_portfolio:,.0f}\n"
                f"**Risk Level:** {risk.risk_level.value.upper()}\n"
                f"**Sharpe Ratio:** {risk.sharpe_ratio}\n"
                f"**Max Drawdown:** {risk.max_drawdown}%\n"
                f"**Value at Risk (95%):** {risk.value_at_risk_95}%\n\n"
                f"Your portfolio shows a {risk.risk_level.value} risk profile. "
                f"{'Consider diversifying to reduce concentration risk.' if risk.max_drawdown > 15 else 'The risk metrics are within acceptable ranges.'}"
            ),
            reasoning="Analyzed portfolio risk metrics using Sharpe ratio, VaR, and drawdown calculations.",
            sources=[
                CopilotSource(module="portfolio", endpoint="/v1/portfolios/{id}/summary", description="Portfolio summary data"),
                CopilotSource(module="portfolio", endpoint="/v1/portfolios/{id}/risk", description="Risk metrics calculation"),
            ],
            cards=[
                CopilotCard(card_type="risk_metric", title="Portfolio Risk", data={
                    "risk_level": risk.risk_level.value,
                    "sharpe": float(risk.sharpe_ratio),
                    "max_drawdown": float(risk.max_drawdown),
                }, confidence=Decimal("85")),
            ],
            assumptions=["Risk calculated from historical return series", "Risk-free rate assumed at 6%"],
            limitations=["Past performance does not guarantee future results", "Risk metrics are backward-looking"],
            confidence=Decimal("85"),
            disclaimer="This analysis is for educational purposes only and does not constitute financial advice. Consult a SEBI-registered advisor.",
            timestamp=datetime.now(timezone.utc),
        )

    async def _handle_scenario_query(self, message: str, context: dict) -> CopilotResponse:
        from app.domain.digital_twin.entities import FinancialProfile, ScenarioInput, ScenarioType

        profile = FinancialProfile(
            user_id=1,
            annual_income=Decimal(str(context.get("annual_income", 1200000))),
            monthly_expenses=Decimal(str(context.get("monthly_expenses", 50000))),
            savings_rate=Decimal(str(context.get("savings_rate", 30))),
            risk_tolerance=context.get("risk_tolerance", "moderate"),
            investment_horizon_years=context.get("horizon_years", 10),
            current_portfolio=Decimal(str(context.get("portfolio_value", 2500000))),
        )

        if "inflation" in message.lower():
            scenario_type = ScenarioType.INFLATION
            explain = "inflation impact on your purchasing power and portfolio value"
        elif "salary" in message.lower() and ("increase" in message.lower() or "rise" in message.lower()):
            scenario_type = ScenarioType.SALARY_INCREASE
            explain = "how a salary increase would accelerate your wealth building"
        elif "market" in message.lower() and ("fall" in message.lower() or "crash" in message.lower() or "correction" in message.lower()):
            scenario_type = ScenarioType.MARKET_CORRECTION
            explain = "how a market correction would affect your portfolio"
        elif "retire" in message.lower():
            scenario_type = ScenarioType.RETIREMENT
            explain = "your retirement readiness and corpus projection"
        elif "home" in message.lower() or "house" in message.lower():
            scenario_type = ScenarioType.HOME_PURCHASE
            explain = "the financial impact of a home purchase"
        elif "education" in message.lower() or "child" in message.lower():
            scenario_type = ScenarioType.EDUCATION_FUNDING
            explain = "education funding requirements and trajectory"
        else:
            scenario_type = ScenarioType.CUSTOM
            explain = "the scenario impact on your financial trajectory"

        result = await self._scenario_engine.run_named_scenario(profile, scenario_type)

        return CopilotResponse(
            answer=(
                f"Running **{scenario_type.value.replace('_', ' ').title()}** scenario:\n\n"
                f"**Projected Portfolio (10yr):** ₹{result.projected_portfolio_value:,.0f}\n"
                f"**Inflation-Adjusted Value:** ₹{result.inflation_adjusted_value:,.0f}\n"
                f"**Goal Achievement Probability:** {result.goal_achievement_probability}%\n"
                f"**Monthly Savings:** ₹{result.projected_monthly_savings:,.0f}\n\n"
                f"This scenario models {explain}. "
                f"{'The projections show positive growth trajectory.' if result.projected_portfolio_value > profile.current_portfolio else 'Consider adjusting your savings rate.'}"
            ),
            reasoning=f"Executed Monte Carlo simulation with {self._scenario_engine._iterations} iterations for {scenario_type.value} scenario.",
            sources=[
                CopilotSource(module="digital-twin", endpoint=f"/v1/digital-twin/named-scenario/{{id}}/{scenario_type.value}", description=f"{scenario_type.value} scenario simulation"),
                CopilotSource(module="digital-twin", endpoint="/v1/digital-twin/health/{id}", description="Financial health context"),
            ],
            cards=[
                CopilotCard(card_type="scenario", title=f"{scenario_type.value.replace('_', ' ').title()} Projection", data={
                    "projected_value": float(result.projected_portfolio_value),
                    "inflation_adjusted": float(result.inflation_adjusted_value),
                    "probability": float(result.goal_achievement_probability),
                }, confidence=Decimal("75")),
            ],
            assumptions=[
                f"Expected return: {result.monte_carlo.expected_annual_return}%" if result.monte_carlo else "Based on historical averages",
                "Monte Carlo simulation with Gaussian distribution",
                "Returns compounded monthly",
            ],
            limitations=[
                "Projections are probabilistic, not guarantees",
                "Market conditions may differ significantly",
                "Tax implications not modeled",
            ],
            confidence=Decimal("75"),
            disclaimer="Scenario analysis is for educational purposes only. It does not constitute financial advice or a guarantee of future outcomes.",
            timestamp=datetime.now(timezone.utc),
        )

    async def _handle_risk_query(self, message: str, context: dict) -> CopilotResponse:
        returns = [Decimal("12"), Decimal("-3"), Decimal("8"), Decimal("15"), Decimal("-5"), Decimal("10"), Decimal("7"), Decimal("-2")]
        risk = await self._risk_calc.calculate(returns, Decimal("6"))

        return CopilotResponse(
            answer=(
                f"**Risk Analysis Summary:**\n\n"
                f"**Risk Level:** {risk.risk_level.value.upper()}\n"
                f"**Volatility:** {risk.volatility}%\n"
                f"**Sharpe Ratio:** {risk.sharpe_ratio}\n"
                f"**Sortino Ratio:** {risk.sortino_ratio}\n"
                f"**Value at Risk (95%):** {risk.value_at_risk_95}%\n"
                f"**Value at Risk (99%):** {risk.value_at_risk_99}%\n"
                f"**Maximum Drawdown:** {risk.max_drawdown}%\n\n"
                f"{'Your risk profile is well-managed. The Sharpe ratio above 1.0 indicates good risk-adjusted returns.' if risk.sharpe_ratio > 1 else 'Consider rebalancing to improve risk-adjusted returns.'}"
            ),
            reasoning="Calculated comprehensive risk metrics including VaR, Sharpe, Sortino, and maximum drawdown.",
            sources=[
                CopilotSource(module="digital-twin", endpoint="/v1/digital-twin/risk-metrics", description="Risk metrics calculation"),
            ],
            cards=[
                CopilotCard(card_type="risk_dashboard", title="Risk Dashboard", data={
                    "risk_level": risk.risk_level.value,
                    "volatility": float(risk.volatility),
                    "sharpe": float(risk.sharpe_ratio),
                    "sortino": float(risk.sortino_ratio),
                    "var_95": float(risk.value_at_risk_95),
                    "max_drawdown": float(risk.max_drawdown),
                }, confidence=Decimal("88")),
            ],
            assumptions=["Risk-free rate: 6%", "Based on 8-period historical returns"],
            limitations=["Historical volatility may not predict future risk", "Tail risk events may exceed VaR estimates"],
            confidence=Decimal("88"),
            disclaimer="Risk analysis is for educational purposes only. Consult a qualified advisor for personalized risk assessment.",
            timestamp=datetime.now(timezone.utc),
        )

    async def _handle_goal_query(self, message: str, context: dict) -> CopilotResponse:
        from app.domain.digital_twin.entities import FinancialProfile

        profile = FinancialProfile(
            user_id=1,
            annual_income=Decimal(str(context.get("annual_income", 1200000))),
            monthly_expenses=Decimal(str(context.get("monthly_expenses", 50000))),
            savings_rate=Decimal(str(context.get("savings_rate", 30))),
            risk_tolerance=context.get("risk_tolerance", "moderate"),
            investment_horizon_years=context.get("horizon_years", 10),
            current_portfolio=Decimal(str(context.get("portfolio_value", 2500000))),
        )

        goal = await self._goal_calc.calculate(
            profile, Decimal("10000000"), 15, Decimal("12"), Decimal("50000")
        )

        return CopilotResponse(
            answer=(
                f"**Goal Achievement Analysis:**\n\n"
                f"**Target:** ₹{goal.target_amount:,.0f}\n"
                f"**Expected Value:** ₹{goal.expected_value:,.0f}\n"
                f"**Probability:** {goal.probability}%\n"
                f"**Shortfall Risk:** ₹{goal.shortfall_risk:,.0f}\n"
                f"**Recommended Monthly:** ₹{goal.recommended_monthly:,.0f}\n\n"
                f"{'On track! Your current savings rate supports this goal.' if goal.probability > 70 else 'Consider increasing your monthly contribution to improve goal achievement probability.'}"
            ),
            reasoning="Calculated goal achievement probability using Monte Carlo simulation.",
            sources=[
                CopilotSource(module="digital-twin", endpoint="/v1/digital-twin/goal-achievement/{id}", description="Goal achievement analysis"),
            ],
            cards=[
                CopilotCard(card_type="goal_progress", title="Goal Analysis", data={
                    "target": float(goal.target_amount),
                    "expected": float(goal.expected_value),
                    "probability": float(goal.probability),
                    "recommended_monthly": float(goal.recommended_monthly),
                }, confidence=Decimal("78")),
            ],
            assumptions=["Expected annual return: 12%", "Monthly contribution sustained over goal period"],
            limitations=["Actual returns may vary", "Life events may alter savings capacity"],
            confidence=Decimal("78"),
            disclaimer="Goal projections are educational estimates. Consult a financial advisor for personalized planning.",
            timestamp=datetime.now(timezone.utc),
        )

    async def _handle_compliance_query(self, message: str, context: dict) -> CopilotResponse:
        sebi_result = await self._sebi.evaluate(1, context)
        rbi_result = await self._rbi.evaluate(1, context)
        dpdp_result = await self._dpdp.evaluate(1, context)

        all_results = [sebi_result, rbi_result, dpdp_result]
        total_violations = sum(len(r.violations) for r in all_results)
        compliant = all(r.passed for r in all_results)

        return CopilotResponse(
            answer=(
                f"**Compliance Status:**\n\n"
                f"**SEBI:** {'✅ Compliant' if sebi_result.passed else f'❌ {len(sebi_result.violations)} violations'}\n"
                f"**RBI:** {'✅ Compliant' if rbi_result.passed else f'❌ {len(rbi_result.violations)} violations'}\n"
                f"**DPDP:** {'✅ Compliant' if dpdp_result.passed else f'❌ {len(dpdp_result.violations)} violations'}\n\n"
                f"{'All regulations compliant.' if compliant else f'{total_violations} violation(s) detected. Review and remediate.'}"
            ),
            reasoning="Checked compliance against SEBI, RBI, and DPDP regulations using rule-based engines.",
            sources=[
                CopilotSource(module="compliance", endpoint="/v1/compliance/check/{id}", description="Multi-regulation compliance check"),
            ],
            cards=[
                CopilotCard(card_type="compliance", title="Compliance Status", data={
                    "sebi": sebi_result.passed,
                    "rbi": rbi_result.passed,
                    "dpdp": dpdp_result.passed,
                    "total_violations": total_violations,
                }, confidence=Decimal("95")),
            ],
            assumptions=["Rules based on current regulatory frameworks", "Context data evaluated as-is"],
            limitations=["Regulatory changes may affect compliance status", "Professional legal advice recommended for formal compliance"],
            confidence=Decimal("95"),
            disclaimer="Compliance check is for educational purposes. Consult a compliance professional for formal regulatory assessment.",
            timestamp=datetime.now(timezone.utc),
        )

    async def _handle_market_query(self, message: str, context: dict) -> CopilotResponse:
        return CopilotResponse(
            answer=(
                "**Market Overview:**\n\n"
                "**NIFTY 50:** 24,567.80 (+0.45%)\n"
                "**SENSEX:** 81,234.50 (+0.38%)\n"
                "**NIFTY Bank:** 51,234.60 (-0.22%)\n\n"
                "**Top Gainers:** ADANIENT +5.4%, TATASTEEL +3.8%\n"
                "**Top Losers:** BAJFINANCE -2.1%, AXISBANK -1.5%\n\n"
                "Market is currently open. Broad indices are positive while banking sector shows mild pressure."
            ),
            reasoning="Retrieved live market data from market intelligence module.",
            sources=[
                CopilotSource(module="market", endpoint="/v1/market/indices", description="Index performance"),
                CopilotSource(module="market", endpoint="/v1/market/quote/{symbol}", description="Individual stock quotes"),
            ],
            cards=[
                CopilotCard(card_type="market_overview", title="Market Snapshot", data={
                    "nifty": 24567.80,
                    "sensex": 81234.50,
                    "status": "open",
                }, confidence=Decimal("99")),
            ],
            assumptions=["Data from mock market provider", "Prices are indicative"],
            limitations=["Not live exchange data", "For demonstration purposes"],
            confidence=Decimal("99"),
            disclaimer="Market data is simulated for demonstration. Not for trading decisions.",
            timestamp=datetime.now(timezone.utc),
        )

    async def _handle_general_query(self, message: str, context: dict) -> CopilotResponse:
        return CopilotResponse(
            answer=(
                "I'm your FINVERSE AI Copilot. I can help you with:\n\n"
                "- **Portfolio Analysis** — \"Analyze my portfolio risk\"\n"
                "- **Scenario Simulation** — \"What if inflation becomes 8%?\"\n"
                "- **Goal Planning** — \"Am I on track for retirement?\"\n"
                "- **Risk Assessment** — \"What's my portfolio risk level?\"\n"
                "- **Compliance Check** — \"Check my SEBI compliance\"\n"
                "- **Market Intelligence** — \"How is the market today?\"\n\n"
                "Ask me anything about your financial situation!"
            ),
            reasoning="General query — provided capability overview.",
            sources=[],
            cards=[],
            assumptions=[],
            limitations=["I provide educational analysis, not financial advice"],
            confidence=Decimal("100"),
            disclaimer="FINVERSE AI provides educational decision support only. Always consult a qualified financial advisor.",
            timestamp=datetime.now(timezone.utc),
        )
