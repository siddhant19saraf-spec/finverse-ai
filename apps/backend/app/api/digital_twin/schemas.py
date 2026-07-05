from __future__ import annotations

from datetime import datetime
from decimal import Decimal
from typing import Optional

from pydantic import BaseModel, ConfigDict, Field


class FinancialProfileRequest(BaseModel):
    annual_income: Decimal
    monthly_expenses: Decimal
    savings_rate: Decimal = Field(..., ge=0, le=100)
    risk_tolerance: str = Field(..., pattern="^(conservative|moderate|aggressive)$")
    investment_horizon_years: int = Field(..., ge=1, le=50)
    dependents: int = Field(default=0, ge=0)
    has_insurance: bool = False
    has_emergency_fund: bool = False
    tax_regime: str = "new"
    current_portfolio: Decimal = Decimal("0")
    existing_emergency_fund: Decimal = Decimal("0")


class FinancialProfileResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    user_id: int
    annual_income: Decimal
    monthly_expenses: Decimal
    savings_rate: Decimal
    risk_tolerance: str
    investment_horizon_years: int
    dependents: int
    has_insurance: bool
    has_emergency_fund: bool
    tax_regime: str
    current_portfolio: Decimal
    existing_emergency_fund: Decimal


class GoalRequest(BaseModel):
    name: str = Field(..., min_length=1, max_length=100)
    target_amount: Decimal = Field(..., gt=0)
    current_amount: Decimal = Field(default=Decimal("0"), ge=0)
    monthly_contribution: Decimal = Field(..., gt=0)
    target_date: datetime
    priority: str = Field(..., pattern="^(high|medium|low)$")
    category: str = Field(..., min_length=1, max_length=50)
    expected_return_pct: Decimal = Field(default=Decimal("12"), ge=0, le=50)


class GoalResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: Optional[int] = None
    user_id: int
    name: str
    target_amount: Decimal
    current_amount: Decimal
    monthly_contribution: Decimal
    target_date: datetime
    priority: str
    category: str
    expected_return_pct: Decimal
    on_track: bool
    shortfall: Decimal
    projected_completion: Optional[datetime] = None


class ScenarioRequest(BaseModel):
    scenario_type: str = Field(default="custom")
    monthly_income_change_pct: Decimal = Decimal("0")
    monthly_expense_change_pct: Decimal = Decimal("0")
    investment_return_pct: Decimal = Decimal("12")
    inflation_pct: Decimal = Decimal("6")
    new_monthly_investment: Optional[Decimal] = None
    years: int = Field(default=10, ge=1, le=50)
    one_time_expense: Decimal = Decimal("0")
    expense_year: int = 0


class SimulationRequestSchema(BaseModel):
    scenario_type: str = Field(..., pattern="^(custom|inflation|salary_increase|salary_reduction|market_correction|market_rally|home_purchase|retirement|education_funding|emergency_expense)$")
    years: int = Field(default=10, ge=1, le=50)
    iterations: int = Field(default=1000, ge=100, le=10000)
    custom_params: dict = Field(default_factory=dict)
    goal_amount: Optional[Decimal] = None
    goal_date: Optional[datetime] = None


class GoalAchievementRequest(BaseModel):
    goal_amount: Decimal = Field(..., gt=0)
    years: int = Field(..., ge=1, le=50)
    expected_return_pct: Decimal = Field(default=Decimal("12"), ge=0, le=50)
    monthly_contribution: Decimal = Field(..., gt=0)


class ConfidenceIntervalResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    lower_5: Decimal
    lower_25: Decimal
    median: Decimal
    upper_75: Decimal
    upper_95: Decimal


class YearlyProjectionResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    year: int
    net_worth: Decimal
    portfolio_value: Decimal
    monthly_savings: Decimal
    cumulative_investment: Decimal
    confidence: Optional[ConfidenceIntervalResponse] = None


class MonteCarloResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    iterations: int
    median_portfolio: Decimal
    confidence_interval: ConfidenceIntervalResponse
    probability_of_loss: Decimal
    expected_annual_return: Decimal
    percentile_5: Decimal
    percentile_95: Decimal


class RiskMetricsResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    value_at_risk_95: Decimal
    value_at_risk_99: Decimal
    sharpe_ratio: Decimal
    sortino_ratio: Decimal
    max_drawdown: Decimal
    volatility: Decimal
    risk_level: str
    beta: Decimal


class DisclaimerResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    assumptions: list[str]
    inputs_used: dict
    limitations: list[str]
    confidence_statement: str
    educational_note: str
    generated_at: datetime


class ScenarioResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    scenario_name: str
    scenario_type: str
    projected_net_worth: Decimal
    projected_monthly_savings: Decimal
    projected_portfolio_value: Decimal
    inflation_adjusted_value: Decimal
    goal_achievement_probability: Decimal
    yearly_projections: list[YearlyProjectionResponse]
    monte_carlo: Optional[MonteCarloResponse] = None
    risk_metrics: Optional[RiskMetricsResponse] = None
    disclaimer: Optional[DisclaimerResponse] = None


class ChartDataPointResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    year: int
    label: str
    optimistic: Decimal
    baseline: Decimal
    pessimistic: Decimal
    confidence_lower: Decimal
    confidence_upper: Decimal


class ScenarioComparisonResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    scenarios: list[ScenarioResponse]
    best_scenario: str
    worst_scenario: str
    recommendation: str
    chart_data: list[ChartDataPointResponse]
    disclaimer: DisclaimerResponse


class WhatIfResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    baseline: ScenarioResponse
    optimistic: ScenarioResponse
    pessimistic: ScenarioResponse
    recommendation: str
    risk_score: Decimal
    comparison: Optional[ScenarioComparisonResponse] = None
    disclaimer: Optional[DisclaimerResponse] = None


class GoalAchievementResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    goal_name: str
    target_amount: Decimal
    probability: Decimal
    expected_value: Decimal
    shortfall_risk: Decimal
    recommended_monthly: Decimal
    on_track_probability: Decimal
    confidence_level: str


class UserProfileSummaryResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    user_id: int
    total_net_worth: Decimal
    monthly_savings: Decimal
    savings_rate: Decimal
    financial_health_score: Decimal
    goals_on_track: int
    goals_total: int
    risk_alignment: str
    recommendations: list[str]


class ScenarioTypeResponse(BaseModel):
    type: str
    name: str


class RiskMetricsRequest(BaseModel):
    returns: list[Decimal]
    risk_free_rate: Decimal = Decimal("6")
