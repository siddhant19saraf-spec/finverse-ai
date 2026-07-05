from __future__ import annotations

from datetime import datetime
from decimal import Decimal
from typing import Optional

from pydantic import BaseModel, ConfigDict, Field


class FeatureImportanceResponse(BaseModel):
    feature_name: str
    importance: Decimal
    direction: str
    description: str


class ExplanationResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: str
    recommendation_type: str
    summary: str
    detailed_reasoning: str
    confidence_score: Decimal
    features: list[FeatureImportanceResponse]
    alternatives: list[str]
    risk_factors: list[str]
    timestamp: datetime


class ConfidenceBreakdownResponse(BaseModel):
    overall: Decimal
    data_quality: Decimal
    model_agreement: Decimal
    historical_accuracy: Decimal
    market_conditions: Decimal


class AuditEntryResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: str
    user_id: int
    action: str
    input_data: dict
    output_data: dict
    explanation_id: Optional[str] = None
    confidence_score: Optional[Decimal] = None
    model_version: str
    timestamp: datetime
    ip_address: Optional[str] = None


class ModelDecisionResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    decision: str
    confidence: ConfidenceBreakdownResponse
    explanation: ExplanationResponse
    audit_entry: AuditEntryResponse


class ExplanationRequestSchema(BaseModel):
    recommendation_type: str = Field(..., pattern="^(portfolio_rebalance|investment_recommendation|risk_assessment)$")
    context: dict = Field(default_factory=dict)
    model_version: str = "v1.0"
