from app.core.config import settings
from redis import Redis
from typing import Optional

redis = Redis.from_url(settings.REDIS_URL, decode_responses=True)

async def create_session(user_id: int, data: dict, ttl: int = 3600) -> str:
    key = f"session:{user_id}:{data.get('sid') or ''}"
    await redis.hset(key, mapping=data)
    await redis.expire(key, ttl)
    return key

async def get_session(key: str) -> Optional[dict]:
    data = await redis.hgetall(key)
    return data if data else None

async def revoke_session(key: str):
    await redis.delete(key)
