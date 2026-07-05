from fastapi import APIRouter, HTTPException
from app.services.security_telemetry import SecurityTelemetry

router = APIRouter(prefix="/v1/security", tags=["security"])
telemetry = SecurityTelemetry()


@router.get("/telemetry")
async def list_telemetry():
    return {"events": [e.__dict__ for e in telemetry.list_events()]}


@router.post("/telemetry")
async def record_telemetry(payload: dict):
    telemetry.record(payload.get("event_type", "unknown"), payload.get("user_id"), payload.get("details"))
    return {"status": "recorded"}
