# FINVERSE AI — Architecture Overview

Principles:
- Clean Architecture + Domain-Driven Design
- Separation of concerns: Presentation, Application, Domain, Infrastructure
- Scalable microservices, event-driven pipelines for AI ingestion, RAG, and evaluation
- Secure by design: RBAC, MFA, passkeys, audit logs

High-level components:
- Frontend: Next.js (apps/frontend), design system (`packages/ui`)
- Backend: FastAPI (apps/backend) with async SQLAlchemy, PostgreSQL, Redis, Celery
- AI infra: RAG pipeline, vector DB, prompt/versioning, model governance cluster
- Ingress & hosting: CloudFront + CloudFront Functions (edge), EKS + ALB
- Storage: S3 for artifacts, Terraform-managed infra
- CI/CD: GitHub Actions for build/test, GitHub Actions + Terraform Cloud for infra

Folders:
- `apps/` — deployable services
- `packages/` — workspace-shared packages (UI, config, types)
- `infra/` — IaC (terraform, k8s manifests)
- `docs/` — design docs, API contracts, runbooks

Next steps:
- Complete infra Terraform modules
- Add OpenAPI specs and API gateway design
- Create design system tokens & Tailwind config
