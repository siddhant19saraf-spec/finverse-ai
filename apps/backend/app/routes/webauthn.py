from fastapi import APIRouter, Depends, HTTPException, Request
from typing import Dict, List
from app.core.config import settings
from app.services.webauthn import WebAuthnService

router = APIRouter(prefix="/v1/webauthn", tags=["webauthn"])
service = WebAuthnService()


@router.post("/register/challenge")
async def register_challenge(payload: Dict[str, object]):
    user_id = int(payload.get("user_id", 0))
    authenticator_name = str(payload.get("authenticator_name", "default"))
    return service.begin_registration(user_id=user_id, authenticator_name=authenticator_name)


@router.post("/register/complete")
async def register_complete(payload: Dict[str, object]):
    result = service.finish_registration(
        challenge_id=str(payload.get("challenge_id")),
        user_id=int(payload.get("user_id", 0)),
        authenticator_name=str(payload.get("authenticator_name", "default")),
        credential_id=str(payload.get("credential_id")),
        public_key=str(payload.get("public_key")),
        sign_count=int(payload.get("sign_count", 0)),
    )
    if not result["verified"]:
        raise HTTPException(status_code=400, detail="Registration failed")
    return result


@router.post("/assertion/challenge")
async def assertion_challenge(payload: Dict[str, object]):
    user_id = int(payload.get("user_id", 0))
    return service.begin_assertion(user_id=user_id)


@router.post("/assertion/complete")
async def assertion_complete(payload: Dict[str, object]):
    result = service.finish_assertion(
        challenge_id=str(payload.get("challenge_id")),
        user_id=int(payload.get("user_id", 0)),
        credential_id=str(payload.get("credential_id")),
        signature=str(payload.get("signature")),
    )
    if not result["verified"]:
        raise HTTPException(status_code=400, detail="Assertion failed")
    return result


@router.get("/credentials/{user_id}")
async def list_credentials(user_id: int) -> List[Dict[str, object]]:
    return service.list_credentials(user_id=user_id)


@router.delete("/credentials/{user_id}/{credential_id}")
async def delete_credential(user_id: int, credential_id: str) -> Dict[str, bool]:
    removed = service.remove_credential(user_id=user_id, credential_id=credential_id)
    return {"removed": removed}
