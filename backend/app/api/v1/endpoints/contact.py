from fastapi import APIRouter, Depends, Request, status
from sqlalchemy.ext.asyncio import AsyncSession
import redis.asyncio as aioredis

from app.core.rate_limiter import sliding_window_rate_limit, get_client_ip
from app.database import get_db
from app.redis_client import get_redis
from app.models.content import ContactSubmission
from app.schemas.content import ContactSubmissionCreate, ContactSubmissionResponse
from app.config import settings

router = APIRouter()


@router.post("/", response_model=ContactSubmissionResponse, status_code=status.HTTP_201_CREATED)
async def submit_contact(
    payload: ContactSubmissionCreate,
    request: Request,
    db: AsyncSession = Depends(get_db),
    redis: aioredis.Redis = Depends(get_redis),
) -> ContactSubmission:
    ip = get_client_ip(request)
    await sliding_window_rate_limit(redis, f"ratelimit:contact:{ip}", 5, window_seconds=3600)

    submission = ContactSubmission(
        name=payload.name,
        email=payload.email,
        subject=payload.subject,
        message=payload.message,
        user_agent=request.headers.get("User-Agent"),
        ip_address=ip,
    )
    db.add(submission)
    await db.flush()
    return submission
