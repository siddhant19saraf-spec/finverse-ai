import pytest
from app.services.webauthn import WebAuthnService
from app.services.oauth import OAuthService, OAuthProviderConfig
from app.services.mfa import MFAService
from app.services.session_store import SessionStore


def test_webauthn_challenge_lifecycle_and_replay():
    service = WebAuthnService()
    challenge = service.begin_registration(user_id=42, authenticator_name="iPhone")
    assert challenge["challenge_id"]
    credential = service.finish_registration(
        challenge_id=challenge["challenge_id"],
        user_id=42,
        authenticator_name="iPhone",
        credential_id="cred-1",
        public_key="pk-1",
        sign_count=0,
    )
    assert credential["credential_id"] == "cred-1"

    assertion = service.begin_assertion(user_id=42)
    result = service.finish_assertion(
        challenge_id=assertion["challenge_id"],
        user_id=42,
        credential_id="cred-1",
        signature="sig-1",
    )
    assert result["verified"] is True

    replay = service.finish_assertion(
        challenge_id=assertion["challenge_id"],
        user_id=42,
        credential_id="cred-1",
        signature="sig-1",
    )
    assert replay["verified"] is False


def test_oauth_authorization_request_contains_pkce():
    provider = OAuthProviderConfig(name="google", client_id="client", authorize_url="https://accounts.google.com/o/oauth2/v2/auth", token_url="https://oauth2.googleapis.com/token")
    service = OAuthService(providers={"google": provider})
    result = service.create_authorization_request("google", redirect_uri="https://app.example/callback")
    assert "code_challenge" in result["url"]
    assert "code_challenge_method=S256" in result["url"]
    assert "response_type=code" in result["url"]


def test_mfa_backup_codes_and_session_lifecycle():
    mfa = MFAService()
    secret = mfa.generate_secret()
    backup_codes = mfa.generate_backup_codes()
    assert len(backup_codes) == 8
    assert mfa.verify_backup_code(backup_codes[0], backup_codes) is True

    store = SessionStore()
    session_id = store.create_session(user_id=7, ip_address="127.0.0.1", user_agent="test")
    assert store.get_session(session_id)["user_id"] == 7
    store.revoke_session(session_id)
    assert store.get_session(session_id) is None
