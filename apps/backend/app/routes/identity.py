from fastapi import APIRouter
from app.services.identity_keys import jwt_key_manager

router = APIRouter(prefix="/v1/identity", tags=["identity"])


@router.get("/jwks")
async def jwks() -> dict:
    return jwt_key_manager.public_jwks()


@router.post("/keys/rotate")
async def rotate_key() -> dict:
    key = jwt_key_manager.rotate_key()
    return {"key_id": key.key_id, "status": "rotated"}
