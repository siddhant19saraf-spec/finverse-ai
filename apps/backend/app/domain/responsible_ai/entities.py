from __future__ import annotations

from dataclasses import dataclass, field
from datetime import datetime
from decimal import Decimal
from typing import Optional


@dataclass(frozen=True)
class BiasMetric:
    metric_name: str
    value: Decimal
    threshold: Decimal
    passed: bool
    description: str


@dataclass(frozen=True)
class FairnessReport:
    user_id: int
    overall_score: Decimal
    metrics: list[BiasMetric]
    protected_attributes_checked: list[str]
    recommendations: list[str]
    timestamp: datetime


@dataclass(frozen=True)
class GuardrailCheck:
    check_name: str
    passed: bool
    severity: str  # critical, high, medium, low
    message: str
    action_taken: Optional[str] = None


@dataclass(frozen=True)
class RiskGuardrailResult:
    user_id: int
    all_passed: bool
    checks: list[GuardrailCheck]
    blocked_reasons: list[str]
    warnings: list[str]
    timestamp: datetime


@dataclass(frozen=True)
class ComplianceCheck:
    check_name: str
    regulation: str
    passed: bool
    details: str
    remediation: Optional[str] = None


@dataclass(frozen=True)
class ResponsibleAIReport:
    user_id: int
    fairness: FairnessReport
    guardrails: RiskGuardrailResult
    compliance: list[ComplianceCheck]
    overall_safe: bool
    timestamp: datetime
