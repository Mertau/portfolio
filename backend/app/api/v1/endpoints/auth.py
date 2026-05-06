import uuid
from datetime import datetime, timedelta, timezone

from fastapi import APIRouter, Depends, HTTPException, Request, Response, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
import redis.asyncio as aioredis

from app.core.security import (
    hash_password,
    verify_password,
    create_access_token,
    create_refresh_token,
    decode_token,
    hash_token,
    generate_reset_token,
)
from app.core.rate_limiter import sliding_window_rate_limit, get_client_ip
from app.core.dependencies import get_current_user
from app.database import get_db
from app.redis_client import get_redis
from app.models.user import User
from app.schemas.auth import (
    UserRegister,
    UserLogin,
    TokenResponse,
    RefreshRequest,
    PasswordResetRequest,
    PasswordResetConfirm,
    UserResponse,
)
from app.config import settings

router = APIRouter()

FAILED_LOGIN_KEY = "failed_login:{}"
ACCOUNT_LOCKOUT_THRESHOLD = 5
ACCOUNT_LOCKOUT_SECONDS = 900


@router.post("/register", response_model=UserResponse, status_code=status.HTTP_201_CREATED)
async def register(
    payload: UserRegister,
    request: Request,
    db: AsyncSession = Depends(get_db),
    redis: aioredis.Redis = Depends(get_redis),
) -> User:
    ip = get_client_ip(request)
    await sliding_window_rate_limit(redis, f"ratelimit:register:{ip}", settings.RATE_LIMIT_AUTH)

    existing = await db.execute(select(User).where(User.email == payload.email))
    if existing.scalar_one_or_none():
        raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail="Account already exists")

    existing_username = await db.execute(select(User).where(User.username == payload.username))
    if existing_username.scalar_one_or_none():
        raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail="Username already taken")

    user = User(
        email=payload.email,
        username=payload.username,
        password_hash=hash_password(payload.password),
        full_name=payload.full_name,
    )
    db.add(user)
    await db.flush()
    return user


@router.post("/login", response_model=TokenResponse)
async def login(
    payload: UserLogin,
    request: Request,
    response: Response,
    db: AsyncSession = Depends(get_db),
    redis: aioredis.Redis = Depends(get_redis),
) -> dict:
    ip = get_client_ip(request)
    await sliding_window_rate_limit(redis, f"ratelimit:login:{ip}", settings.RATE_LIMIT_AUTH)

    result = await db.execute(select(User).where(User.email == payload.email))
    user = result.scalar_one_or_none()

    lockout_key = FAILED_LOGIN_KEY.format(payload.email)
    failed_count = await redis.get(lockout_key)
    if failed_count and int(failed_count) >= ACCOUNT_LOCKOUT_THRESHOLD:
        raise HTTPException(status_code=status.HTTP_429_TOO_MANY_REQUESTS, detail="Account temporarily locked")

    if not user or not verify_password(payload.password, user.password_hash):
        await redis.incr(lockout_key)
        await redis.expire(lockout_key, ACCOUNT_LOCKOUT_SECONDS)
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid credentials")

    if not user.is_active:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Account is disabled")

    await redis.delete(lockout_key)

    access_token = create_access_token(str(user.id), user.role)
    refresh_token = create_refresh_token(str(user.id))

    response.set_cookie(
        key="refresh_token",
        value=refresh_token,
        httponly=True,
        secure=settings.ENVIRONMENT == "production",
        samesite="strict",
        max_age=settings.REFRESH_TOKEN_EXPIRE_DAYS * 86400,
        path="/api/v1/auth",
    )

    return {
        "access_token": access_token,
        "refresh_token": refresh_token,
        "token_type": "bearer",
        "expires_in": settings.ACCESS_TOKEN_EXPIRE_MINUTES * 60,
    }


@router.post("/refresh", response_model=TokenResponse)
async def refresh_token(
    payload: RefreshRequest,
    db: AsyncSession = Depends(get_db),
    redis: aioredis.Redis = Depends(get_redis),
) -> dict:
    try:
        token_data = decode_token(payload.refresh_token)
    except ValueError:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid refresh token")

    if token_data.get("type") != "refresh":
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid token type")

    jti = token_data.get("jti")
    if jti and await redis.exists(f"blacklist:jwt:{jti}"):
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Token revoked")

    if jti:
        expire = token_data.get("exp", 0) - int(datetime.now(timezone.utc).timestamp())
        if expire > 0:
            await redis.setex(f"blacklist:jwt:{jti}", expire, "1")

    result = await db.execute(select(User).where(User.id == uuid.UUID(token_data["sub"])))
    user = result.scalar_one_or_none()
    if not user or not user.is_active:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="User not found")

    new_access = create_access_token(str(user.id), user.role)
    new_refresh = create_refresh_token(str(user.id))

    return {
        "access_token": new_access,
        "refresh_token": new_refresh,
        "token_type": "bearer",
        "expires_in": settings.ACCESS_TOKEN_EXPIRE_MINUTES * 60,
    }


@router.post("/logout", status_code=status.HTTP_204_NO_CONTENT)
async def logout(
    response: Response,
    current_user: User = Depends(get_current_user),
    redis: aioredis.Redis = Depends(get_redis),
) -> None:
    response.delete_cookie("refresh_token", path="/api/v1/auth")


@router.get("/me", response_model=UserResponse)
async def get_me(current_user: User = Depends(get_current_user)) -> User:
    return current_user
