import pytest
from httpx import AsyncClient


@pytest.mark.asyncio
async def test_register_success(client: AsyncClient) -> None:
    response = await client.post("/api/v1/auth/register", json={
        "email": "test@example.com",
        "username": "testuser",
        "password": "SecurePass1",
        "full_name": "Test User",
    })
    assert response.status_code == 201
    data = response.json()
    assert data["email"] == "test@example.com"
    assert data["role"] == "user"


@pytest.mark.asyncio
async def test_register_duplicate_email(client: AsyncClient) -> None:
    payload = {"email": "dup@example.com", "username": "dupuser1", "password": "SecurePass1"}
    await client.post("/api/v1/auth/register", json=payload)
    payload2 = {"email": "dup@example.com", "username": "dupuser2", "password": "SecurePass1"}
    response = await client.post("/api/v1/auth/register", json=payload2)
    assert response.status_code == 409


@pytest.mark.asyncio
async def test_health_check(client: AsyncClient) -> None:
    response = await client.get("/health")
    assert response.status_code == 200
    assert response.json()["status"] == "healthy"
