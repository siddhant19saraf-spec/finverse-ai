from __future__ import annotations

from fastapi import APIRouter, HTTPException

from app.api.compliance.schemas import (
    AuditExportRequestSchema,
    AuditExportResponse,
    ComplianceCheckRequest,
    ComplianceResultResponse,
    RegulatoryReportResponse,
    ReportGenerateRequest,
)
from app.application.compliance.services import ComplianceService
from app.domain.compliance.entities import Regulation
from app.infrastructure.compliance.audit_exporter import DefaultAuditExporter
from app.infrastructure.compliance.audit_repo import InMemoryAuditRepository
from app.infrastructure.compliance.dpdp_engine import DPDPComplianceEngine
from app.infrastructure.compliance.report_generator import DefaultReportGenerator
from app.infrastructure.compliance.rbi_engine import RBIComplianceEngine
from app.infrastructure.compliance.sebi_engine import SEBIComplianceEngine

router = APIRouter(prefix="/v1/compliance", tags=["compliance"])

_audit_repo = InMemoryAuditRepository()
_engines = [SEBIComplianceEngine(), RBIComplianceEngine(), DPDPComplianceEngine()]
_report_gen = DefaultReportGenerator(_engines)
_audit_exporter = DefaultAuditExporter(_audit_repo)
_svc = ComplianceService(_engines, _audit_repo, _report_gen, _audit_exporter)


@router.post("/check/{user_id}", response_model=list[ComplianceResultResponse])
async def check_all_regulations(user_id: int, payload: ComplianceCheckRequest):
    results = await _svc.check_all(user_id, payload.context)
    return results


@router.post("/check/{user_id}/{regulation}", response_model=ComplianceResultResponse)
async def check_single_regulation(user_id: int, regulation: str, payload: ComplianceCheckRequest):
    try:
        reg = Regulation(regulation)
    except ValueError:
        raise HTTPException(status_code=400, detail=f"Invalid regulation: {regulation}")
    return await _svc.check_single(user_id, reg, payload.context)


@router.post("/report/{user_id}", response_model=RegulatoryReportResponse)
async def generate_report(user_id: int, payload: ReportGenerateRequest):
    try:
        reg = Regulation(payload.regulation)
    except ValueError:
        raise HTTPException(status_code=400, detail=f"Invalid regulation: {payload.regulation}")
    return await _svc.generate_report(user_id, reg, payload.period_start, payload.period_end)


@router.post("/audit/export", response_model=AuditExportResponse)
async def export_audit(payload: AuditExportRequestSchema):
    from app.domain.compliance.entities import AuditExportRequest
    request = AuditExportRequest(
        regulation=Regulation(payload.regulation),
        date_from=payload.date_from,
        date_to=payload.date_to,
        format=payload.format,
    )
    return await _svc.export_audit(request)


@router.get("/regulations")
async def list_regulations():
    return {"regulations": _svc.get_supported_regulations()}
