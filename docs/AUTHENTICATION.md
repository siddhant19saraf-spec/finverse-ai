# Authentication & Security Design

This document describes the authentication architecture for FINVERSE AI.

Key features:
- OAuth 2.1 support (Authorization Code + PKCE) for third-party providers
- Passkeys / WebAuthn for passwordless authentication
- JWT access tokens + rotating refresh tokens
- RBAC with `Role` model and `user_has_role` utility
- MFA via TOTP (pyotp)
- Audit logs for security-relevant events
- Rate limiting using Redis + slowapi
- Secure headers and CSP via middleware

Operational notes:
- Store secrets (JWT secret, OAuth client secrets) in a secrets manager (AWS Secrets Manager / HashiCorp Vault)
- Use HTTPS and strict TLS settings in load balancer
- Configure WebAuthn origins and RP ID in environment variables
- Rotate JWT secret and manage token versioning for revocation

Testing:
- Unit tests for token logic and MFA
- Integration tests against test DB and Redis
