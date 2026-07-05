# MFA and Redis-backed Sessions

FINVERSE AI supports enterprise-grade MFA and session management.

## MFA

- TOTP enrollment via `/v1/mfa/enroll`
- Backup code generation via `/v1/mfa/backup-codes`
- Session risk evaluation and challenge escalation can be added on top of this service layer

## Session management

- Session creation via `/v1/sessions/`
- Session lookup via `/v1/sessions/{session_id}`
- Session revocation via `/v1/sessions/{session_id}`

## Production guidance

- Persist sessions in Redis and rotate them aggressively.
- Track login history, IP address changes, and device fingerprints.
- Revoke sessions immediately on suspicious activity or password reset.
