from __future__ import annotations

from datetime import datetime
from typing import Optional

from pydantic import BaseModel, ConfigDict, Field


class ComplianceCheckRequest(BaseModel):
    context: dict = Field(default_factory=dict)


class RuleViolationResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    rule_id: str
    regulation: str
    category: str
    severity: str
    message: str
    actual_value: Optional[str] = None
    threshold_value: Optional[str] = None


class ComplianceResultResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    user_id: int
    regulation: str
    passed: bool
    violations: list[RuleViolationResponse]
    checked_at: datetime


class RegulatoryReportResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    report_id: str
    user_id: int
    regulation: str
    period_start: datetime
    period_end: datetime
    status: str
    findings: list[ComplianceResultResponse]
    summary: dict
    generated_at: datetime


class ReportGenerateRequest(BaseModel):
    regulation: str = Field(..., pattern="^(sebi|rbi|dpdp)$")
    period_start: datetime
    period_end: datetime


class AuditExportRequestSchema(BaseModel):
    regulation: str = Field(..., pattern="^(sebi|rbi|dpdp)$")
    date_from: datetime
    date_to: datetime
    format: str = Field(default="json", pattern="^(json|csv)$")


class AuditEntryResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    entry_id: str
    entity_type: str
    entity_id: str
    action: str
    user_id: int
    timestamp: datetime
    details: dict
    ip_address: Optional[str] = None


class AuditExportResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    export_id: str
    regulation: str
    format: str
    date_from: datetime
    date_to: datetime
    entries: list[AuditEntryResponse]
    total_count: int
    generated_at: datetime
