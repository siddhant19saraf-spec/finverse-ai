from __future__ import annotations

from decimal import Decimal

from fastapi import APIRouter, HTTPException

from app.api.digital_twin.schemas import (
    FinancialProfileRequest,
    FinancialProfileResponse,
    GoalAchievementRequest,
    GoalAchievementResponse,
    GoalRequest,
    GoalResponse,
    RiskMetricsRequest,
    RiskMetricsResponse,
    ScenarioRequest,
    ScenarioResponse,
    SimulationRequestSchema,
    WhatIfResponse,
    UserProfileSummaryResponse,
)
from app.application.digital_twin.services import DigitalTwinService
from app.domain.digital_twin.entities import FinancialGoal, FinancialProfile, ScenarioInput, ScenarioType, SimulationRequest
from app.infrastructure.digital_twin.chart_generator import DefaultChartDataGenerator
from app.infrastructure.digital_twin.disclaimer import DefaultDisclaimerGenerator
from app.infrastructure.digital_twin.goal_achievement import DefaultGoalAchievementCalculator
from app.infrastructure.digital_twin.health_calculator import DefaultFinancialHealthCalculator
from app.infrastructure.digital_twin.repositories import InMemoryGoalRepository, InMemoryProfileRepository
from app.infrastructure.digital_twin.risk_metrics import DefaultRiskMetricsCalculator
from app.infrastructure.digital_twin.scenario_engine import EnhancedScenarioEngine

router = APIRouter(prefix="/v1/digital-twin", tags=["digital-twin"])

_profile_repo = InMemoryProfileRepository()
_goal_repo = InMemoryGoalRepository()
_scenario_engine = EnhancedScenarioEngine()
_health_calc = DefaultFinancialHealthCalculator()
_goal_calc = DefaultGoalAchievementCalculator()
_risk_calc = DefaultRiskMetricsCalculator()
_chart_gen = DefaultChartDataGenerator()
_disclaimer_gen = DefaultDisclaimerGenerator()
_svc = DigitalTwinService(
    _profile_repo, _goal_repo, _scenario_engine, _health_calc,
    _goal_calc, _risk_calc, _chart_gen, _disclaimer_gen,
)


@router.get("/profile/{user_id}", response_model=FinancialProfileResponse)
async def get_profile(user_id: int):
    profile = await _svc.get_profile(user_id)
    if not profile:
        raise HTTPException(status_code=404, detail="Profile not found")
    return profile


@router.post("/profile", response_model=FinancialProfileResponse)
async def save_profile(payload: FinancialProfileRequest, user_id: int = 1):
    profile = FinancialProfile(user_id=user_id, **payload.model_dump())
    return await _svc.save_profile(profile)


@router.get("/goals/{user_id}", response_model=list[GoalResponse])
async def get_goals(user_id: int):
    return await _svc.get_goals(user_id)


@router.post("/goals", response_model=GoalResponse, status_code=201)
async def create_goal(payload: GoalRequest, user_id: int = 1):
    goal = FinancialGoal(id=None, user_id=user_id, **payload.model_dump(),
                         on_track=True, shortfall=0)
    return await _svc.create_goal(goal)


@router.delete("/goals/{goal_id}")
async def delete_goal(goal_id: int):
    deleted = await _svc.delete_goal(goal_id)
    if not deleted:
        raise HTTPException(status_code=404, detail="Goal not found")
    return {"status": "deleted"}


@router.post("/scenario/{user_id}", response_model=ScenarioResponse)
async def run_scenario(user_id: int, payload: ScenarioRequest):
    inputs = ScenarioInput(
        scenario_type=ScenarioType(payload.scenario_type),
        monthly_income_change_pct=payload.monthly_income_change_pct,
        monthly_expense_change_pct=payload.monthly_expense_change_pct,
        investment_return_pct=payload.investment_return_pct,
        inflation_pct=payload.inflation_pct,
        new_monthly_investment=payload.new_monthly_investment,
        years=payload.years,
        one_time_expense=payload.one_time_expense,
        expense_year=payload.expense_year,
    )
    result = await _svc.run_scenario(user_id, inputs)
    if not result:
        raise HTTPException(status_code=404, detail="Profile not found. Create one first.")
    return result


@router.post("/what-if/{user_id}", response_model=WhatIfResponse)
async def run_what_if(user_id: int, payload: ScenarioRequest):
    inputs = ScenarioInput(
        scenario_type=ScenarioType(payload.scenario_type),
        monthly_income_change_pct=payload.monthly_income_change_pct,
        monthly_expense_change_pct=payload.monthly_expense_change_pct,
        investment_return_pct=payload.investment_return_pct,
        inflation_pct=payload.inflation_pct,
        new_monthly_investment=payload.new_monthly_investment,
        years=payload.years,
        one_time_expense=payload.one_time_expense,
        expense_year=payload.expense_year,
    )
    result = await _svc.run_what_if(user_id, inputs)
    if not result:
        raise HTTPException(status_code=404, detail="Profile not found. Create one first.")
    return result


@router.post("/simulate/{user_id}", response_model=ScenarioResponse)
async def run_simulation(user_id: int, payload: SimulationRequestSchema):
    request = SimulationRequest(
        scenario_type=ScenarioType(payload.scenario_type),
        years=payload.years,
        iterations=payload.iterations,
        custom_params=payload.custom_params,
        goal_amount=payload.goal_amount,
        goal_date=payload.goal_date,
    )
    result = await _svc.run_simulation(user_id, request)
    if not result:
        raise HTTPException(status_code=404, detail="Profile not found. Create one first.")
    return result


@router.post("/named-scenario/{user_id}/{scenario_type}", response_model=ScenarioResponse)
async def run_named_scenario(
    user_id: int,
    scenario_type: str,
    iterations: int = 1000,
):
    try:
        st = ScenarioType(scenario_type)
    except ValueError:
        raise HTTPException(status_code=400, detail=f"Invalid scenario type: {scenario_type}")
    result = await _svc.run_named_scenario(user_id, st, iterations=iterations)
    if not result:
        raise HTTPException(status_code=404, detail="Profile not found. Create one first.")
    return result


@router.post("/goal-achievement/{user_id}", response_model=GoalAchievementResponse)
async def calculate_goal_achievement(user_id: int, payload: GoalAchievementRequest):
    result = await _svc.calculate_goal_achievement(
        user_id, payload.goal_amount, payload.years,
        payload.expected_return_pct, payload.monthly_contribution,
    )
    if not result:
        raise HTTPException(status_code=404, detail="Profile not found. Create one first.")
    return result


@router.post("/risk-metrics", response_model=RiskMetricsResponse)
async def calculate_risk_metrics(payload: RiskMetricsRequest):
    result = await _svc.calculate_risk_metrics(payload.returns, payload.risk_free_rate)
    return result


@router.get("/health/{user_id}", response_model=UserProfileSummaryResponse)
async def get_financial_health(user_id: int):
    result = await _svc.get_financial_health(user_id)
    if not result:
        raise HTTPException(status_code=404, detail="Profile not found. Create one first.")
    return result


@router.get("/scenarios")
async def list_scenarios():
    scenarios = await _svc.get_available_scenarios()
    return {"scenarios": scenarios, "total": len(scenarios)}
