# FINVERSE AI

FINVERSE AI — India's Responsible AI Wealth Operating System.

This repository is a production-grade monorepo scaffold for FINVERSE AI. It uses Clean Architecture and Domain-Driven Design to structure frontend and backend services, shared UI packages, infrastructure as code, CI/CD, and documentation.

Phased work:
- Phase 1: Monorepo scaffold, architecture, CI/CD, Docker, design system.
- Phase 2+: Feature development (authentication, portfolio intelligence, AI agents, etc.).

See `docs/ARCHITECTURE.md` for the architecture overview and next steps.

Completed Phase 2.1-2.3 authentication work:
- WebAuthn passwordless flow with challenge lifecycle, credential binding, assertion, and replay protection
- OAuth 2.1 authorization request generation with PKCE for Google and GitHub
- TOTP MFA plus backup-code support and Redis-backed session management
- Security telemetry and documentation coverage
