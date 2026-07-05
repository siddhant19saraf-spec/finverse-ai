from fastapi import APIRouter, HTTPException
from typing import Dict, List
from app.schemas.identity import MFAEnrollment, BackupCodeRequest
from app.services.mfa import MFAService

router = APIRouter(prefix="/v1/mfa", tags=["mfa"])
mfa_service = MFAService()


@router.post("/enroll")
async def enroll(payload: MFAEnrollment) -> Dict[str, str]:
    if not payload.token:
        raise HTTPException(status_code=400, detail="Token is required")
    secret = payload.secret or mfa_service.generate_secret()
    return {"secret": secret, "uri": mfa_service.get_totp_uri(secret, "finverse")}


@router.post("/backup-codes")
async def backup_codes(payload: BackupCodeRequest) -> Dict[str, List[str]]:
    return {"backup_codes": payload.backup_codes or mfa_service.generate_backup_codes()}
