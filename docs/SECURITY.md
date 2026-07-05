# Security Overview

FINVERSE AI backend security features implemented:

- Transport: TLS 1.3 expected at LB; HSTS header set by middleware.
- Authentication: JWT access tokens with rotating refresh tokens; WebAuthn passkeys; OAuth2 client integrations.
- MFA: TOTP-based MFA using `pyotp`.
- RBAC: Role model and helper to check roles.
- Audit logging: `AuditLog` model records security events.
- Rate limiting: Redis-backed rate limiter using `slowapi`.
- Secure Headers & CSP: middleware sets HTTP security headers.
- Secrets: `app.core.secrets` provides an abstraction layer; connect to AWS Secrets Manager / Vault in production.
- OWASP: Input validation via Pydantic models; avoid SQL injection using SQLAlchemy; CSP/XSS protections via headers.

Operational guidance:
- Enforce strong CSP and CSP reporting for production.
- Enable WAF and API gateway throttling.
- Regularly rotate JWT secret and audit refresh tokens.
