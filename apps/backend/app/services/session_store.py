from __future__ import annotations

from typing import Dict, Optional
from uuid import uuid4
from redis import Redis
from app.core.config import settings


class SessionStore:
    def __init__(self) -> None:
        self._client = Redis.from_url(settings.REDIS_URL, decode_responses=True)
        self._sessions: Dict[str, Dict[str, object]] = {}

    def create_session(self, user_id: int, ip_address: str, user_agent: str) -> str:
        session_id = str(uuid4())
        session_data = {
            "session_id": session_id,
            "user_id": user_id,
            "ip_address": ip_address,
            "user_agent": user_agent,
            "active": True,
        }
        self._sessions[session_id] = session_data
        try:
            self._client.set(f"session:{session_id}", str(session_data), ex=3600)
        except Exception:
            pass
        return session_id

    def get_session(self, session_id: str) -> Optional[Dict[str, object]]:
        session = self._sessions.get(session_id)
        if session and session.get("active"):
            return session
        return None

    def revoke_session(self, session_id: str) -> bool:
        session = self._sessions.get(session_id)
        if session:
            session["active"] = False
            try:
                self._client.delete(f"session:{session_id}")
            except Exception:
                pass
            return True
        return False
