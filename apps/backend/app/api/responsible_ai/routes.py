from __future__ import annotations

from fastapi import APIRouter

from app.api.responsible_ai.schemas import (
    ActionCheckRequest,
    ActionCheckResponse,
    ResponsibleAIReportResponse,
)
from app.application.responsible_ai.services import ResponsibleAIService
from app.infrastructure.responsible_ai.bias_detector import DefaultBiasDetector
from app.infrastructure.responsible_ai.compliance import DefaultComplianceEngine
from app.infrastructure.responsible_ai.guardrails import DefaultRiskGuardrails

router = APIRouter(prefix="/v1/responsible-ai", tags=["responsible-ai"])

_bias = DefaultBiasDetector()
_guardrails = DefaultRiskGuardrails()
_compliance = DefaultComplianceEngine()
_svc = ResponsibleAIService(_bias, _guardrails, _compliance)


@router.post("/report/{user_id}", response_model=ResponsibleAIReportResponse)
async def generate_report(user_id: int, payload: ActionCheckRequest):
    return await _svc.generate_report(user_id, payload.action, payload.context)


@router.post("/check/{user_id}", response_model=ActionCheckResponse)
async def check_action(user_id: int, payload: ActionCheckRequest):
    return await _svc.check_action(user_id, payload.action, payload.context)
