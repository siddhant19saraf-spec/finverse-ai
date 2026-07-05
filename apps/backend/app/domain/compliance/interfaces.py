from __future__ import annotations

from abc import ABC, abstractmethod
from datetime import datetime

from app.domain.compliance.entities import (
    AuditEntry,
    AuditExportRequest,
    AuditExportResult,
    ComplianceResult,
    Regulation,
    RegulatoryReport,
)


class ComplianceRuleEngine(ABC):
    @abstractmethod
    async def evaluate(self, user_id: int, context: dict) -> ComplianceResult: ...

    @abstractmethod
    def get_regulation(self) -> Regulation: ...


class AuditRepository(ABC):
    @abstractmethod
    async def record(self, entry: AuditEntry) -> None: ...

    @abstractmethod
    async def query(
        self,
        regulation: Regulation,
        date_from: datetime,
        date_to: datetime,
    ) -> list[AuditEntry]: ...


class RegulatoryReportGenerator(ABC):
    @abstractmethod
    async def generate(
        self,
        user_id: int,
        regulation: Regulation,
        period_start: datetime,
        period_end: datetime,
    ) -> RegulatoryReport: ...


class AuditExporter(ABC):
    @abstractmethod
    async def export(self, request: AuditExportRequest) -> AuditExportResult: ...
