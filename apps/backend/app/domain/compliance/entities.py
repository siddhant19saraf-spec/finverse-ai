from __future__ import annotations

from dataclasses import dataclass, field
from datetime import datetime
from decimal import Decimal
from enum import Enum
from typing import Optional


class Regulation(str, Enum):
    SEBI = "sebi"
    RBI = "rbi"
    DPDP = "dpdp"


class Severity(str, Enum):
    CRITICAL = "critical"
    HIGH = "high"
    MEDIUM = "medium"
    LOW = "low"


class ReportStatus(str, Enum):
    DRAFT = "draft"
    GENERATED = "generated"
    SUBMITTED = "submitted"
    FAILED = "failed"


@dataclass(frozen=True)
class ComplianceRule:
    rule_id: str
    regulation: Regulation
    category: str
    description: str
    severity: Severity
    threshold: Optional[Decimal] = None
    enabled: bool = True


@dataclass(frozen=True)
class RuleViolation:
    rule_id: str
    regulation: Regulation
    category: str
    severity: Severity
    message: str
    actual_value: Optional[str] = None
    threshold_value: Optional[str] = None


@dataclass(frozen=True)
class ComplianceResult:
    user_id: int
    regulation: Regulation
    passed: bool
    violations: list[RuleViolation]
    checked_at: datetime


@dataclass(frozen=True)
class AuditEntry:
    entry_id: str
    entity_type: str
    entity_id: str
    action: str
    user_id: int
    timestamp: datetime
    details: dict = field(default_factory=dict)
    ip_address: Optional[str] = None


@dataclass(frozen=True)
class AuditExportRequest:
    regulation: Regulation
    date_from: datetime
    date_to: datetime
    format: str = "json"


@dataclass(frozen=True)
class AuditExportResult:
    export_id: str
    regulation: Regulation
    format: str
    date_from: datetime
    date_to: datetime
    entries: list[AuditEntry]
    total_count: int
    generated_at: datetime


@dataclass(frozen=True)
class RegulatoryReport:
    report_id: str
    user_id: int
    regulation: Regulation
    period_start: datetime
    period_end: datetime
    status: ReportStatus
    findings: list[ComplianceResult]
    summary: dict
    generated_at: datetime
