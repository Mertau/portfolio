import asyncio
import pytest
import pytest_asyncio
from httpx import AsyncClient, ASGITransport
from sqlalchemy.ext.asyncio import create_async_engine, async_sessionmaker, AsyncSession
from unittest.mock import AsyncMock

from main import app
from app.database import get_db, Base
from app.redis_client import get_redis

TEST_DB_URL = "sqlite+aiosqlite:///./test.db"

test_engine = create_async_engine(TEST_DB_URL, echo=False)
TestSessionLocal = async_sessionmaker(test_engine, class_=AsyncSession, expire_on_commit=False)


@pytest_asyncio.fixture(scope="session")
async def setup_db():
    async with test_engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
    yield
    async with test_engine.begin() as conn:
        await conn.run_sync(Base.metadata.drop_all)


@pytest_asyncio.fixture
async def db_session(setup_db):
    async with TestSessionLocal() as session:
        yield session
        await session.rollback()


@pytest_asyncio.fixture
async def mock_redis():
    redis = AsyncMock()
    redis.get.return_value = None
    redis.set.return_value = True
    redis.setex.return_value = True
    redis.exists.return_value = 0
    redis.incr.return_value = 1
    redis.expire.return_value = True
    redis.delete.return_value = 1
    redis.zremrangebyscore.return_value = 0
    redis.zadd.return_value = 1
    redis.zcard.return_value = 0
    redis.pipeline.return_value.__aenter__ = AsyncMock(return_value=redis)
    redis.pipeline.return_value.__aexit__ = AsyncMock(return_value=False)
    redis.pipeline.return_value.execute = AsyncMock(return_value=[0, 1, 0, True])
    return redis


@pytest_asyncio.fixture
async def client(db_session, mock_redis):
    async def override_db():
        yield db_session

    async def override_redis():
        return mock_redis

    app.dependency_overrides[get_db] = override_db
    app.dependency_overrides[get_redis] = override_redis

    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as ac:
        yield ac

    app.dependency_overrides.clear()
