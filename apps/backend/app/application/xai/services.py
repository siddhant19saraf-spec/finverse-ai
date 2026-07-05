from __future__ import annotations

from typing import Optional

from app.domain.xai.entities import (
    AuditEntry,
    Explanation,
    ExplanationRequest,
    ModelDecision,
)
from app.domain.xai.interfaces import AuditTrailRepository, ExplanationGenerator


class XAIService:
    def __init__(
        self,
        explanation_generator: ExplanationGenerator,
        audit_repo: AuditTrailRepository,
    ) -> None:
        self._generator = explanation_generator
        self._audit_repo = audit_repo

    async def explain(self, request: ExplanationRequest) -> Explanation:
        explanation = await self._generator.generate_explanation(request)
        decision = await self._generator.get_decision(request)
        await self._audit_repo.record(decision.audit_entry)
        return explanation

    async def get_decision(self, request: ExplanationRequest) -> ModelDecision:
        decision = await self._generator.get_decision(request)
        await self._audit_repo.record(decision.audit_entry)
        return decision

    async def get_audit_trail(self, user_id: int, limit: int = 50) -> list[AuditEntry]:
        return await self._audit_repo.get_entries(user_id, limit)

    async def get_audit_entry(self, entry_id: str) -> Optional[AuditEntry]:
        return await self._audit_repo.get_entry(entry_id)

    async def search_audit(self, action: Optional[str] = None, user_id: Optional[int] = None) -> list[AuditEntry]:
        return await self._audit_repo.search(action, user_id)
