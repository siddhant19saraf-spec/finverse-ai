from __future__ import annotations

import asyncio
import json
from datetime import datetime, timezone
from typing import Any

from fastapi import WebSocket


class ConnectionManager:
    def __init__(self) -> None:
        self._subscriptions: dict[str, set[WebSocket]] = {}
        self._connections: set[WebSocket] = set()
        self._lock = asyncio.Lock()

    async def connect(self, websocket: WebSocket) -> None:
        await websocket.accept()
        async with self._lock:
            self._connections.add(websocket)

    async def disconnect(self, websocket: WebSocket) -> None:
        async with self._lock:
            self._connections.discard(websocket)
            for subs in self._subscriptions.values():
                subs.discard(websocket)

    async def subscribe(self, websocket: WebSocket, symbols: list[str]) -> None:
        async with self._lock:
            for symbol in symbols:
                key = symbol.upper()
                if key not in self._subscriptions:
                    self._subscriptions[key] = set()
                self._subscriptions[key].add(websocket)

    async def unsubscribe(self, websocket: WebSocket, symbols: list[str]) -> None:
        async with self._lock:
            for symbol in symbols:
                key = symbol.upper()
                if key in self._subscriptions:
                    self._subscriptions[key].discard(websocket)

    async def broadcast(self, symbol: str, data: dict[str, Any]) -> None:
        message = json.dumps({
            "type": "quote",
            "symbol": symbol,
            "data": data,
            "timestamp": datetime.now(timezone.utc).isoformat(),
        }, default=str)
        subscribers = self._subscriptions.get(symbol.upper(), set()).copy()
        dead: list[WebSocket] = []
        for ws in subscribers:
            try:
                await ws.send_text(message)
            except Exception:
                dead.append(ws)
        for ws in dead:
            await self.disconnect(ws)

    async def broadcast_multiple(self, updates: dict[str, dict[str, Any]]) -> None:
        for symbol, data in updates.items():
            await self.broadcast(symbol, data)

    @property
    def active_connections(self) -> int:
        return len(self._connections)

    @property
    def subscription_count(self) -> int:
        return sum(len(subs) for subs in self._subscriptions.values())


manager = ConnectionManager()
