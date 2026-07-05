from fastapi import APIRouter
from app.services.revocation import RevocationStore

router = APIRouter(prefix="/v1/revocation", tags=["revocation"])
store = RevocationStore()


@router.post("/token")
async def revoke_token(payload: dict) -> dict:
    entry = store.revoke(str(payload.get("token_id")), str(payload.get("reason", "manual")))
    return {"status": "revoked", "token_id": entry.token_id, "reason": entry.reason}


@router.get("/token")
async def list_revocations() -> dict:
    return {"revocations": [entry.__dict__ for entry in store.list()]}
