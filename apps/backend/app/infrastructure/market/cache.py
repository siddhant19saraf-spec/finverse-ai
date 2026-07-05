from __future__ import annotations

import json
import logging
from typing import Any, Optional

from app.core.config import settings

logger = logging.getLogger(__name__)


class MarketCache:
    PREFIX = "market:"

    def __init__(self, redis_client: Any = None) -> None:
        self._redis = redis_client
        self._available: Optional[bool] = None

    async def _get_redis(self) -> Optional[Any]:
        if self._available is False:
            return None
        if self._redis is None:
            try:
                import redis.asyncio as aioredis
                self._redis = aioredis.from_url(
                    settings.REDIS_URL, encoding="utf-8", decode_responses=True
                )
                await self._redis.ping()
                self._available = True
            except Exception:
                self._available = False
                logger.debug("Redis unavailable, cache disabled")
                return None
        return self._redis

    async def get(self, key: str) -> Optional[str]:
        r = await self._get_redis()
        if r is None:
            return None
        try:
            return await r.get(f"{self.PREFIX}{key}")
        except Exception:
            return None

    async def set(self, key: str, value: str, ttl: int = 300) -> None:
        r = await self._get_redis()
        if r is None:
            return
        try:
            await r.set(f"{self.PREFIX}{key}", value, ex=ttl)
        except Exception:
            pass

    async def get_json(self, key: str) -> Optional[Any]:
        raw = await self.get(key)
        if raw:
            return json.loads(raw)
        return None

    async def set_json(self, key: str, value: Any, ttl: int = 300) -> None:
        await self.set(key, json.dumps(value, default=str), ttl=ttl)

    async def delete(self, key: str) -> None:
        r = await self._get_redis()
        if r is None:
            return
        try:
            await r.delete(f"{self.PREFIX}{key}")
        except Exception:
            pass

    async def invalidate_pattern(self, pattern: str) -> int:
        r = await self._get_redis()
        if r is None:
            return 0
        try:
            keys = []
            async for key in r.scan_iter(f"{self.PREFIX}{pattern}"):
                keys.append(key)
            if keys:
                return await r.delete(*keys)
        except Exception:
            pass
        return 0

    async def get_quote_ttl(self) -> int:
        return 15

    async def get_historical_ttl(self) -> int:
        return 3600

    async def get_search_ttl(self) -> int:
        return 600
