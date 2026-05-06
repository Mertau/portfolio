import time
from typing import Optional
import redis.asyncio as aioredis
from fastapi import Request, HTTPException, status
from app.config import settings


async def sliding_window_rate_limit(
    redis: aioredis.Redis,
    key: str,
    limit: int,
    window_seconds: int = 60,
) -> None:
    now = time.time()
    window_start = now - window_seconds
    pipe = redis.pipeline()
    pipe.zremrangebyscore(key, 0, window_start)
    pipe.zadd(key, {str(now): now})
    pipe.zcard(key)
    pipe.expire(key, window_seconds)
    results = await pipe.execute()
    count = results[2]
    if count > limit:
        raise HTTPException(
            status_code=status.HTTP_429_TOO_MANY_REQUESTS,
            detail="Rate limit exceeded. Please try again later.",
        )


def get_client_ip(request: Request) -> str:
    forwarded = request.headers.get("X-Forwarded-For")
    if forwarded:
        return forwarded.split(",")[0].strip()
    if request.client:
        return request.client.host
    return "unknown"
