from __future__ import annotations

from datetime import datetime
from decimal import Decimal
from typing import Optional

from pydantic import BaseModel, ConfigDict, Field


class BiasMetricResponse(BaseModel):
    metric_name: str
    value: Decimal
    threshold: Decimal
    passed: bool
    description: str


class FairnessReportResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    user_id: int
    overall_score: Decimal
    metrics: list[BiasMetricResponse]
    protected_attributes_checked: list[str]
    recommendations: list[str]
    timestamp: datetime


class GuardrailCheckResponse(BaseModel):
    check_name: str
    passed: bool
    severity: str
    message: str
    action_taken: Optional[str] = None


class RiskGuardrailResultResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    user_id: int
    all_passed: bool
    checks: list[GuardrailCheckResponse]
    blocked_reasons: list[str]
    warnings: list[str]
    timestamp: datetime


class ComplianceCheckResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    check_name: str
    regulation: str
    passed: bool
    details: str
    remediation: Optional[str] = None


class ResponsibleAIReportResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    user_id: int
    fairness: FairnessReportResponse
    guardrails: RiskGuardrailResultResponse
    compliance: list[ComplianceCheckResponse]
    overall_safe: bool
    timestamp: datetime


class ActionCheckRequest(BaseModel):
    action: str = Field(..., min_length=1, max_length=50)
    context: dict = Field(default_factory=dict)


class ActionCheckResponse(BaseModel):
    allowed: bool
    fairness_score: str
    guardrails_passed: bool
    compliance_passed: bool
    blocked_reasons: list[str]
    warnings: list[str]
