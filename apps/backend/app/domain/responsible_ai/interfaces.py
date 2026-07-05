from __future__ import annotations

from abc import ABC, abstractmethod

from app.domain.responsible_ai.entities import (
    ComplianceCheck,
    FairnessReport,
    RiskGuardrailResult,
)


class BiasDetector(ABC):
    @abstractmethod
    async def detect_bias(self, user_id: int, data: dict) -> FairnessReport: ...


class RiskGuardrails(ABC):
    @abstractmethod
    async def evaluate(self, user_id: int, action: str, context: dict) -> RiskGuardrailResult: ...


class ComplianceEngine(ABC):
    @abstractmethod
    async def check_compliance(self, user_id: int, action: str, context: dict) -> list[ComplianceCheck]: ...
