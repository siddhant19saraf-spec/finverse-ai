from __future__ import annotations

from dataclasses import dataclass
from typing import Dict, Any
from datetime import datetime, timezone


@dataclass
class SecurityEvent:
    event_type: str
    user_id: int | None
    details: Dict[str, Any]
    timestamp: str


class SecurityTelemetry:
    def __init__(self) -> None:
        self._events: list[SecurityEvent] = []

    def record(self, event_type: str, user_id: int | None, details: Dict[str, Any] | None = None) -> None:
        self._events.append(
            SecurityEvent(
                event_type=event_type,
                user_id=user_id,
                details=details or {},
                timestamp=datetime.now(timezone.utc).isoformat(),
            )
        )

    def list_events(self) -> list[SecurityEvent]:
        return list(self._events)
