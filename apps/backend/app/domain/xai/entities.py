from __future__ import annotations

from dataclasses import dataclass, field
from datetime import datetime
from decimal import Decimal
from typing import Optional


@dataclass(frozen=True)
class FeatureImportance:
    feature_name: str
    importance: Decimal
    direction: str  # positive or negative
    description: str


@dataclass(frozen=True)
class Explanation:
    id: str
    recommendation_type: str
    summary: str
    detailed_reasoning: str
    confidence_score: Decimal
    features: list[FeatureImportance]
    alternatives: list[str]
    risk_factors: list[str]
    timestamp: datetime


@dataclass(frozen=True)
class AuditEntry:
    id: str
    user_id: int
    action: str
    input_data: dict
    output_data: dict
    explanation_id: Optional[str]
    confidence_score: Optional[Decimal]
    model_version: str
    timestamp: datetime
    ip_address: Optional[str] = None


@dataclass(frozen=True)
class ConfidenceBreakdown:
    overall: Decimal
    data_quality: Decimal
    model_agreement: Decimal
    historical_accuracy: Decimal
    market_conditions: Decimal


@dataclass(frozen=True)
class ModelDecision:
    decision: str
    confidence: ConfidenceBreakdown
    explanation: Explanation
    audit_entry: AuditEntry


@dataclass(frozen=True)
class ExplanationRequest:
    recommendation_type: str
    context: dict
    user_id: int
    model_version: str = "v1.0"
