from __future__ import annotations

from dataclasses import dataclass, field
from datetime import datetime
from decimal import Decimal
from enum import Enum
from typing import Optional


class ScenarioType(str, Enum):
    CUSTOM = "custom"
    INFLATION = "inflation"
    SALARY_INCREASE = "salary_increase"
    SALARY_REDUCTION = "salary_reduction"
    MARKET_CORRECTION = "market_correction"
    MARKET_RALLY = "market_rally"
    HOME_PURCHASE = "home_purchase"
    RETIREMENT = "retirement"
    EDUCATION_FUNDING = "education_funding"
    EMERGENCY_EXPENSE = "emergency_expense"


class RiskLevel(str, Enum):
    LOW = "low"
    MEDIUM = "medium"
    HIGH = "high"
    VERY_HIGH = "very_high"


@dataclass(frozen=True)
class FinancialProfile:
    user_id: int
    annual_income: Decimal
    monthly_expenses: Decimal
    savings_rate: Decimal
    risk_tolerance: str
    investment_horizon_years: int
    dependents: int = 0
    has_insurance: bool = False
    has_emergency_fund: bool = False
    tax_regime: str = "new"
    current_portfolio: Decimal = Decimal("0")
    existing_emergency_fund: Decimal = Decimal("0")


@dataclass(frozen=True)
class FinancialGoal:
    id: Optional[int]
    user_id: int
    name: str
    target_amount: Decimal
    current_amount: Decimal
    monthly_contribution: Decimal
    target_date: datetime
    priority: str
    category: str
    expected_return_pct: Decimal
    on_track: bool = True
    shortfall: Decimal = Decimal("0")
    projected_completion: Optional[datetime] = None


@dataclass(frozen=True)
class ScenarioInput:
    scenario_type: ScenarioType = ScenarioType.CUSTOM
    monthly_income_change_pct: Decimal = Decimal("0")
    monthly_expense_change_pct: Decimal = Decimal("0")
    investment_return_pct: Decimal = Decimal("12")
    inflation_pct: Decimal = Decimal("6")
    new_monthly_investment: Optional[Decimal] = None
    years: int = 10
    one_time_expense: Decimal = Decimal("0")
    expense_year: int = 0
    monthly_income_post_event: Optional[Decimal] = None
    inflation_adjustment_pct: Optional[Decimal] = None


@dataclass(frozen=True)
class ConfidenceInterval:
    lower_5: Decimal
    lower_25: Decimal
    median: Decimal
    upper_75: Decimal
    upper_95: Decimal


@dataclass(frozen=True)
class RiskMetrics:
    value_at_risk_95: Decimal
    value_at_risk_99: Decimal
    sharpe_ratio: Decimal
    sortino_ratio: Decimal
    max_drawdown: Decimal
    volatility: Decimal
    risk_level: RiskLevel
    beta: Decimal


@dataclass(frozen=True)
class GoalAchievement:
    goal_name: str
    target_amount: Decimal
    probability: Decimal
    expected_value: Decimal
    shortfall_risk: Decimal
    recommended_monthly: Decimal
    on_track_probability: Decimal
    confidence_level: str


@dataclass(frozen=True)
class ChartDataPoint:
    year: int
    label: str
    optimistic: Decimal
    baseline: Decimal
    pessimistic: Decimal
    confidence_lower: Decimal
    confidence_upper: Decimal


@dataclass(frozen=True)
class ScenarioDisclaimer:
    assumptions: list[str]
    inputs_used: dict
    limitations: list[str]
    confidence_statement: str
    educational_note: str
    generated_at: datetime


@dataclass(frozen=True)
class YearlyProjection:
    year: int
    net_worth: Decimal
    portfolio_value: Decimal
    monthly_savings: Decimal
    cumulative_investment: Decimal
    confidence: Optional[ConfidenceInterval] = None


@dataclass(frozen=True)
class MonteCarloResult:
    iterations: int
    median_portfolio: Decimal
    confidence_interval: ConfidenceInterval
    probability_of_loss: Decimal
    expected_annual_return: Decimal
    percentile_5: Decimal
    percentile_95: Decimal


@dataclass(frozen=True)
class ScenarioResult:
    scenario_name: str
    scenario_type: ScenarioType
    projected_net_worth: Decimal
    projected_monthly_savings: Decimal
    projected_portfolio_value: Decimal
    inflation_adjusted_value: Decimal
    goal_achievement_probability: Decimal
    yearly_projections: list[YearlyProjection]
    monte_carlo: Optional[MonteCarloResult] = None
    risk_metrics: Optional[RiskMetrics] = None
    disclaimer: Optional[ScenarioDisclaimer] = None


@dataclass(frozen=True)
class ScenarioComparison:
    scenarios: list[ScenarioResult]
    best_scenario: str
    worst_scenario: str
    recommendation: str
    chart_data: list[ChartDataPoint]
    disclaimer: ScenarioDisclaimer


@dataclass(frozen=True)
class WhatIfResult:
    baseline: ScenarioResult
    optimistic: ScenarioResult
    pessimistic: ScenarioResult
    recommendation: str
    risk_score: Decimal
    comparison: Optional[ScenarioComparison] = None
    disclaimer: Optional[ScenarioDisclaimer] = None


@dataclass(frozen=True)
class UserProfileSummary:
    user_id: int
    total_net_worth: Decimal
    monthly_savings: Decimal
    savings_rate: Decimal
    financial_health_score: Decimal
    goals_on_track: int
    goals_total: int
    risk_alignment: str
    recommendations: list[str]


@dataclass(frozen=True)
class SimulationRequest:
    scenario_type: ScenarioType
    years: int = 10
    iterations: int = 1000
    custom_params: dict = field(default_factory=dict)
    goal_amount: Optional[Decimal] = None
    goal_date: Optional[datetime] = None
