# WebAuthn Passwordless Authentication

FINVERSE AI implements a production-oriented passwordless authentication core that supports:

- Challenge lifecycle management for registration and assertion
- Multiple authenticators per user
- Credential binding and listing
- Challenge replay protection via single-use semantics
- Recovery via device management and revocation endpoints

## Flow

1. Client calls `/v1/webauthn/register/challenge` with a user_id and authenticator label.
2. Server returns a challenge ID and challenge token.
3. Client completes registration and calls `/v1/webauthn/register/complete`.
4. For passwordless sign-in, client calls `/v1/webauthn/assertion/challenge` and `/v1/webauthn/assertion/complete`.

## Security considerations

- Enforce origin validation and RP ID matching in production.
- Store credential material in a dedicated secure store.
- Bind authenticator metadata to user identity and audit it.
- Implement device recovery flows and account recovery procedures.
