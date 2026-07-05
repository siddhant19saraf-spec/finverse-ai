from __future__ import annotations

from abc import ABC, abstractmethod
from typing import Optional

from app.domain.xai.entities import (
    AuditEntry,
    Explanation,
    ExplanationRequest,
    ModelDecision,
)


class ExplanationGenerator(ABC):
    @abstractmethod
    async def generate_explanation(self, request: ExplanationRequest) -> Explanation: ...

    @abstractmethod
    async def get_decision(self, request: ExplanationRequest) -> ModelDecision: ...


class AuditTrailRepository(ABC):
    @abstractmethod
    async def record(self, entry: AuditEntry) -> None: ...

    @abstractmethod
    async def get_entries(self, user_id: int, limit: int = 50) -> list[AuditEntry]: ...

    @abstractmethod
    async def get_entry(self, entry_id: str) -> Optional[AuditEntry]: ...

    @abstractmethod
    async def search(self, action: Optional[str] = None, user_id: Optional[int] = None) -> list[AuditEntry]: ...
