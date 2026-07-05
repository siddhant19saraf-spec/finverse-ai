from __future__ import annotations

import logging
from contextlib import asynccontextmanager

from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from slowapi import Limiter, _rate_limit_exceeded_handler
from slowapi.errors import RateLimitExceeded
from slowapi.util import get_remote_address

from app.core.config import settings
from app.middleware.security import SecureHeadersMiddleware

logger = logging.getLogger(__name__)


def _create_limiter() -> Limiter:
    try:
        return Limiter(key_func=get_remote_address, storage_uri=settings.REDIS_URL)
    except Exception:
        logger.warning("Redis unavailable — rate limiter disabled")
        return Limiter(key_func=get_remote_address)


@asynccontextmanager
async def lifespan(app: FastAPI):
    logger.info("FINVERSE AI starting — env=%s", settings.ENV)
    yield
    logger.info("FINVERSE AI shutting down")


app = FastAPI(
    title=settings.APP_NAME,
    version="1.0.0",
    description="India's Responsible AI Wealth Operating System",
    docs_url="/docs" if settings.ENV == "development" else None,
    redoc_url="/redoc" if settings.ENV == "development" else None,
    lifespan=lifespan,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ALLOW_ORIGINS,
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "DELETE", "PATCH"],
    allow_headers=["Authorization", "Content-Type"],
)
app.add_middleware(SecureHeadersMiddleware)

limiter = _create_limiter()
app.state.limiter = limiter
app.add_exception_handler(RateLimitExceeded, _rate_limit_exceeded_handler)


@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception):
    logger.exception("Unhandled exception: %s", exc)
    return JSONResponse(status_code=500, content={"detail": "Internal server error"})


from app.routes import auth, webauthn, oauth, mfa, sessions, security, identity, revocation  # noqa: E402
from app.api.market.routes import router as market_router  # noqa: E402
from app.api.portfolio.routes import router as portfolio_router  # noqa: E402
from app.api.digital_twin.routes import router as digital_twin_router  # noqa: E402
from app.api.xai.routes import router as xai_router  # noqa: E402
from app.api.responsible_ai.routes import router as responsible_ai_router  # noqa: E402
from app.api.compliance.routes import router as compliance_router  # noqa: E402
from app.api.dashboard.routes import router as dashboard_router  # noqa: E402
from app.api.copilot.routes import router as copilot_router  # noqa: E402

app.include_router(auth.router)
app.include_router(webauthn.router)
app.include_router(oauth.router)
app.include_router(mfa.router)
app.include_router(sessions.router)
app.include_router(security.router)
app.include_router(identity.router)
app.include_router(revocation.router)
app.include_router(market_router)
app.include_router(portfolio_router)
app.include_router(digital_twin_router)
app.include_router(xai_router)
app.include_router(responsible_ai_router)
app.include_router(compliance_router)
app.include_router(dashboard_router)
app.include_router(copilot_router)


@app.get("/health", tags=["system"])
async def health():
    return {"status": "ok", "env": settings.ENV, "version": "1.0.0"}


@app.get("/v1", tags=["system"])
async def api_root():
    return {
        "name": settings.APP_NAME,
        "version": "1.0.0",
        "docs": "/docs",
        "modules": [
            "auth", "market", "portfolio", "digital-twin",
            "xai", "responsible-ai", "compliance", "dashboard", "copilot",
        ],
    }
