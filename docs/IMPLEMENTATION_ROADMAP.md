# FINVERSE AI — Implementation Roadmap

## 1. Current State Assessment

### Completed (Phase 1 + 2.1–2.3)
| Layer | Component | Status |
|-------|-----------|--------|
| Backend | Auth (signup/login/refresh/logout) | Done |
| Backend | WebAuthn passwordless flow | Done |
| Backend | OAuth 2.1 + PKCE (Google, GitHub) | Done |
| Backend | TOTP MFA + backup codes | Done |
| Backend | JWT RS256 key rotation + JWKS | Done |
| Backend | Redis rate limiting + session mgmt | Done |
| Backend | Secure headers + CSP middleware | Done |
| Backend | Security telemetry + audit logs | Done |
| Backend | RBAC role model | Done |
| Backend | Secrets abstraction layer | Done |
| Infra | Docker Compose | Done |
| Infra | GitHub Actions CI | Done |

### Missing — Blocks Core Functionality
| Layer | Component | Priority |
|-------|-----------|----------|
| Backend | Alembic DB migrations | Critical |
| Backend | Financial domain models | Critical |
| Backend | Portfolio/holding/transaction APIs | Critical |
| Backend | Market data service | Critical |
| Backend | AI/RAG pipeline | High |
| Backend | WebSocket real-time feed | High |
| Frontend | Entire app (empty) | Critical |
| Shared | Design system + types | High |
| Infra | Terraform modules | Medium |
| Infra | K8s manifests | Medium |

---

## 2. Architectural Risks

| Risk | Impact | Mitigation |
|------|--------|------------|
| Frontend is empty — no UI at all | User cannot interact | Module 4 prioritizes auth shell + layout |
| No DB migrations — schema drifts | Data integrity | Module 1 adds Alembic + financial models |
| In-memory stores (WebAuthn, Revocation, Sessions) lose data on restart | State loss in prod | Replace with Redis/DB-backed stores before prod |
| No financial domain models | Cannot implement features | Module 1 defines the data layer |
| AI pipeline not started | Core differentiator missing | Module 3 builds RAG after domain is stable |
| `next.config.mjs` uses `@nx/next` which isn't installed | Build will fail | Remove Nx dependency, use plain Next.js config |
| No `.env` files or env templates | Dev onboarding blocked | Add `.env.example` with required vars |
| Pydantic v1-style `Config` class in schemas | Deprecation warning with Pydantic v2 | Update to `model_config = ConfigDict(...)` |
| `slowapi` storage_uri may not support async Redis | Runtime error | Verify and switch to `aioredis` if needed |

---

## 3. Module Boundaries

```
┌─────────────────────────────────────────────────────────┐
│                    FINVERSE AI                           │
├──────────────┬──────────────┬──────────────┬────────────┤
│  Frontend    │   Backend    │  AI Service  │  Infra     │
│  (Next.js)   │  (FastAPI)   │  (Pipeline)  │  (Terraform│
│              │              │              │   + K8s)    │
├──────────────┼──────────────┼──────────────┼────────────┤
│ Auth UI      │ Auth API     │ RAG Engine   │ VPC/EKS    │
│ Dashboard    │ Finance API  │ Vector DB    │ RDS/PG     │
│ Portfolio    │ Market Data  │ Prompt Mgmt  │ Redis      │
│ AI Assistant │ AI Gateway   │ Model Gov    │ S3/CDN     │
└──────────────┴──────────────┴──────────────┴────────────┘
```

### Module Dependency Graph
```
Module 1 (DB + Models)
  └─→ Module 2 (Finance APIs)
        └─→ Module 3 (AI/RAG)
              └─→ Module 6 (AI Frontend)

Module 1 (DB + Models)
  └─→ Module 4 (Frontend Auth Shell)
        └─→ Module 5 (Dashboard/Portfolio)
```

---

## 4. Contracts

### 4.1 Backend → Frontend Contract (OpenAPI)

All API routes are prefixed `/v1/` and return JSON.

**Auth endpoints** (existing):
- `POST /v1/auth/signup` → `UserRead`
- `POST /v1/auth/login` → `Token`
- `POST /v1/auth/token/refresh` → `Token`
- `POST /v1/auth/logout` → `{"status": "logged_out"}`

**Finance endpoints** (Module 2):
- `POST /v1/portfolios` → `Portfolio`
- `GET /v1/portfolios` → `List[Portfolio]`
- `GET /v1/portfolios/{id}` → `Portfolio`
- `POST /v1/portfolios/{id}/holdings` → `Holding`
- `GET /v1/portfolios/{id}/holdings` → `List[Holding]`
- `POST /v1/transactions` → `Transaction`
- `GET /v1/transactions?portfolio_id=` → `List[Transaction]`
- `GET /v1/market/quotes?symbols=` → `List[Quote]`

**AI endpoints** (Module 3):
- `POST /v1/ai/chat` → streaming SSE response
- `GET /v1/ai/conversations` → `List[Conversation]`
- `GET /v1/ai/conversations/{id}/messages` → `List[Message]`

### 4.2 Backend → Database Contract

- All models inherit from `app.db.base.Base`
- Async SQLAlchemy with PostgreSQL (`asyncpg`)
- Alembic for migrations, environment-aware
- Naming convention: `{table_name}` snake_case

### 4.3 Frontend → Backend Contract

- Frontend uses generated TypeScript types from OpenAPI spec
- Auth: `Authorization: Bearer <access_token>` header
- Refresh: `POST /v1/auth/token/refresh` with `refresh_token` body
- Base URL configurable via `NEXT_PUBLIC_API_URL`

### 4.4 AI Service → Backend Contract

- AI pipeline runs as Celery tasks or standalone service
- Backend exposes internal `/v1/internal/ai/*` endpoints
- Vector DB (pgvector or Pinecone) accessed by AI service directly
- Market data fetched by backend, cached in Redis

---

## 5. Implementation Plan

### Module 1: Alembic + Financial Domain Models (NEXT)
**Files to create/modify:**
- `apps/backend/alembic.ini`
- `apps/backend/alembic/env.py`
- `apps/backend/alembic/versions/`
- `apps/backend/app/models/portfolio.py`
- `apps/backend/app/models/transaction.py`
- `apps/backend/app/models/market.py`
- `apps/backend/app/models/__init__.py`
- `apps/backend/app/db/base.py` (update import)
- `apps/backend/requirements.txt` (add alembic)
- `.env.example`

**Acceptance criteria:**
- `alembic upgrade head` creates all tables
- Financial models have proper relationships and indexes
- Existing auth models still work
- Tests pass

### Module 2: Financial Core Services + API Routes
**Files to create:**
- `apps/backend/app/services/portfolio.py`
- `apps/backend/app/services/market_data.py`
- `apps/backend/app/services/transaction.py`
- `apps/backend/app/routes/portfolio.py`
- `apps/backend/app/routes/market.py`
- `apps/backend/app/routes/transaction.py`
- `apps/backend/app/schemas/finance.py`

**Acceptance criteria:**
- CRUD for portfolios, holdings, transactions
- Market data lookup (mock or API)
- All routes registered in `main.py`
- Unit tests for services

### Module 3: AI/RAG Pipeline Service
**Files to create:**
- `apps/backend/app/services/ai_pipeline.py`
- `apps/backend/app/services/vector_store.py`
- `apps/backend/app/services/prompt_manager.py`
- `apps/backend/app/routes/ai.py`
- `apps/backend/app/schemas/ai.py`
- `apps/backend/app/tasks/` (Celery tasks)

### Module 4: Frontend Auth Shell + Layout
**Files to create:**
- `apps/frontend/src/app/layout.tsx`
- `apps/frontend/src/app/page.tsx`
- `apps/frontend/src/app/login/page.tsx`
- `apps/frontend/src/app/signup/page.tsx`
- `apps/frontend/src/lib/api.ts`
- `apps/frontend/src/lib/auth.ts`
- `apps/frontend/src/components/ui/` (shared components)
- `packages/ui/src/` (design tokens + base components)

---

## 6. Conventions

- **Backend**: Python 3.11+, FastAPI, async SQLAlchemy, Pydantic v2
- **Frontend**: Next.js 14 (App Router), TypeScript, Tailwind CSS
- **Shared**: pnpm workspaces, TypeScript
- **Testing**: pytest (backend), vitest (frontend)
- **Linting**: ruff (Python), eslint (TypeScript)
- **Git**: conventional commits, feature branches
