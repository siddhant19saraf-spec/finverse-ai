from fastapi import APIRouter, HTTPException
from typing import Dict
from app.schemas.identity import SessionCreateRequest
from app.services.session_store import SessionStore

router = APIRouter(prefix="/v1/sessions", tags=["sessions"])
store = SessionStore()


@router.post("/")
async def create_session(payload: SessionCreateRequest) -> Dict[str, str]:
    session_id = store.create_session(
        user_id=payload.user_id,
        ip_address=payload.ip_address,
        user_agent=payload.user_agent,
    )
    return {"session_id": session_id}


@router.get("/{session_id}")
async def get_session(session_id: str) -> Dict[str, object]:
    session = store.get_session(session_id)
    if not session:
        raise HTTPException(status_code=404, detail="Session not found")
    return session


@router.delete("/{session_id}")
async def revoke_session(session_id: str) -> Dict[str, bool]:
    revoked = store.revoke_session(session_id)
    return {"revoked": revoked}
