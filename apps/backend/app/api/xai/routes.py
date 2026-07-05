from __future__ import annotations

from fastapi import APIRouter, HTTPException, Query

from app.api.xai.schemas import (
    AuditEntryResponse,
    ExplanationRequestSchema,
    ExplanationResponse,
    ModelDecisionResponse,
)
from app.application.xai.services import XAIService
from app.domain.xai.entities import ExplanationRequest
from app.infrastructure.xai.audit_repository import InMemoryAuditTrailRepository
from app.infrastructure.xai.explanation_engine import DefaultExplanationGenerator

router = APIRouter(prefix="/v1/xai", tags=["xai"])

_generator = DefaultExplanationGenerator()
_audit_repo = InMemoryAuditTrailRepository()
_svc = XAIService(_generator, _audit_repo)


@router.post("/explain", response_model=ExplanationResponse)
async def explain_recommendation(payload: ExplanationRequestSchema, user_id: int = 1):
    request = ExplanationRequest(
        recommendation_type=payload.recommendation_type,
        context=payload.context,
        user_id=user_id,
        model_version=payload.model_version,
    )
    return await _svc.explain(request)


@router.post("/decision", response_model=ModelDecisionResponse)
async def get_model_decision(payload: ExplanationRequestSchema, user_id: int = 1):
    request = ExplanationRequest(
        recommendation_type=payload.recommendation_type,
        context=payload.context,
        user_id=user_id,
        model_version=payload.model_version,
    )
    return await _svc.get_decision(request)


@router.get("/audit/{user_id}", response_model=list[AuditEntryResponse])
async def get_audit_trail(user_id: int, limit: int = Query(50, ge=1, le=200)):
    return await _svc.get_audit_trail(user_id, limit)


@router.get("/audit/entry/{entry_id}", response_model=AuditEntryResponse)
async def get_audit_entry(entry_id: str):
    entry = await _svc.get_audit_entry(entry_id)
    if not entry:
        raise HTTPException(status_code=404, detail="Audit entry not found")
    return entry


@router.get("/audit", response_model=list[AuditEntryResponse])
async def search_audit(
    action: str = Query(None, description="Filter by action type"),
    user_id: int = Query(None, description="Filter by user ID"),
):
    return await _svc.search_audit(action, user_id)
