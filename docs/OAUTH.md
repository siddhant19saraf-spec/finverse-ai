# OAuth 2.1 Authorization Code Flow with PKCE

FINVERSE AI includes an OAuth service abstraction for provider-driven sign-in.

## Supported providers

- Google
- GitHub

## Flow

1. Client calls `/v1/oauth/authorize` with a provider and redirect URI.
2. The service returns a URL containing PKCE challenge values and a code verifier.
3. Provider redirects the browser back to the configured callback URL.
4. The server validates the callback at `/v1/oauth/callback` and binds the provider identity to the local account.

## Security notes

- Use PKCE and state validation for all callback exchanges.
- Do not log raw OAuth tokens.
- Rotate refresh tokens and store them securely.
- Link provider accounts to existing users only after verifying ownership.
