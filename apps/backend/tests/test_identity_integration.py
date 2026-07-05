import pytest
from fastapi.testclient import TestClient
from app.main import app


client = TestClient(app)


def test_oauth_authorize_and_callback_flow():
    authorize_response = client.post(
        "/v1/oauth/authorize",
        json={"provider": "google", "redirect_uri": "https://app.example/callback"},
    )
    assert authorize_response.status_code == 200
    assert "code_challenge" in authorize_response.json()["url"]

    callback_response = client.post(
        "/v1/oauth/callback",
        json={"provider": "google", "state": "state-123", "code": "code-456"},
    )
    assert callback_response.status_code == 200
    assert callback_response.json()["provider"] == "google"


def test_sessions_and_revocation_endpoints():
    session_response = client.post(
        "/v1/sessions/",
        json={"user_id": 77, "ip_address": "10.0.0.1", "user_agent": "pytest"},
    )
    assert session_response.status_code == 200
    session_id = session_response.json()["session_id"]

    get_response = client.get(f"/v1/sessions/{session_id}")
    assert get_response.status_code == 200

    revoke_response = client.delete(f"/v1/sessions/{session_id}")
    assert revoke_response.status_code == 200


def test_identity_endpoints_expose_jwks_and_revocation():
    jwks_response = client.get("/v1/identity/jwks")
    assert jwks_response.status_code == 200
    assert "keys" in jwks_response.json()

    revoke_response = client.post(
        "/v1/revocation/token",
        json={"token_id": "token-123", "reason": "rotation"},
    )
    assert revoke_response.status_code == 200
