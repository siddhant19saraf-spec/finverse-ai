from fastapi import APIRouter, Depends, HTTPException, status, Request
from sqlalchemy.ext.asyncio import AsyncSession
from app.db.session import get_db
from app.schemas.auth import UserCreate, Token, RefreshRequest, UserRead
from app.models.user import User, RefreshToken, AuditLog
from app.services.password import hash_password, verify_password
from app.services.tokens import create_access_token, create_refresh_token, decode_token
from sqlalchemy.future import select
from datetime import datetime
from app.core.config import settings
import hashlib

router = APIRouter(prefix="/v1/auth", tags=["auth"]) 

@router.post('/signup', response_model=UserRead, status_code=201)
async def signup(payload: UserCreate, db: AsyncSession = Depends(get_db), request: Request = None):
    q = await db.execute(select(User).filter(User.email == payload.email))
    existing = q.scalar_one_or_none()
    if existing:
        raise HTTPException(status_code=400, detail="Email already registered")
    user = User(email=payload.email, full_name=payload.full_name, hashed_password=hash_password(payload.password))
    db.add(user)
    await db.commit()
    await db.refresh(user)
    # audit
    audit = AuditLog(user_id=user.id, event="signup", details=f"User signed up: {user.email}")
    db.add(audit)
    await db.commit()
    return user

@router.post('/login', response_model=Token)
async def login(form: UserCreate, db: AsyncSession = Depends(get_db), request: Request = None):
    q = await db.execute(select(User).filter(User.email == form.email))
    user: User = q.scalar_one_or_none()
    if not user or not user.hashed_password:
        raise HTTPException(status_code=401, detail="Invalid credentials")
    if not verify_password(form.password, user.hashed_password):
        # audit failed login
        audit = AuditLog(user_id=user.id if user else None, event="failed_login", details=f"Failed login for {form.email}")
        db.add(audit)
        await db.commit()
        raise HTTPException(status_code=401, detail="Invalid credentials")
    access_token, expires_in = create_access_token(subject=str(user.id))
    refresh_raw = create_refresh_token()
    refresh_hash = hashlib.sha256(refresh_raw.encode()).hexdigest()
    r = RefreshToken(user_id=user.id, token_hash=refresh_hash)
    db.add(r)
    await db.commit()
    # audit
    audit = AuditLog(user_id=user.id, event="login", details="Password login")
    db.add(audit)
    await db.commit()
    return Token(access_token=access_token, token_type="bearer", refresh_token=refresh_raw, expires_in=expires_in)

@router.post('/token/refresh', response_model=Token)
async def refresh_token(payload: RefreshRequest, db: AsyncSession = Depends(get_db)):
    # find hashed token
    token_hash = hashlib.sha256(payload.refresh_token.encode()).hexdigest()
    q = await db.execute(select(RefreshToken).filter(RefreshToken.token_hash == token_hash, RefreshToken.revoked == False))
    rt: RefreshToken = q.scalar_one_or_none()
    if not rt:
        raise HTTPException(status_code=401, detail="Invalid refresh token")
    # rotate: revoke old and issue new
    rt.revoked = True
    new_refresh = create_refresh_token()
    new_hash = hashlib.sha256(new_refresh.encode()).hexdigest()
    new_rt = RefreshToken(user_id=rt.user_id, token_hash=new_hash)
    db.add(new_rt)
    await db.commit()
    access_token, expires_in = create_access_token(subject=str(rt.user_id))
    return Token(access_token=access_token, token_type="bearer", refresh_token=new_refresh, expires_in=expires_in)

@router.post('/logout')
async def logout(payload: RefreshRequest, db: AsyncSession = Depends(get_db)):
    token_hash = hashlib.sha256(payload.refresh_token.encode()).hexdigest()
    q = await db.execute(select(RefreshToken).filter(RefreshToken.token_hash == token_hash))
    rt: RefreshToken = q.scalar_one_or_none()
    if rt:
        rt.revoked = True
        await db.commit()
    return {"status": "logged_out"}
