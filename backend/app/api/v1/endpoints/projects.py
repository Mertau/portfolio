import uuid
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, desc
import redis.asyncio as aioredis
import json

from app.core.dependencies import get_current_user, get_admin_user
from app.database import get_db
from app.redis_client import get_redis
from app.models.user import User
from app.models.content import Project
from app.schemas.content import ProjectCreate, ProjectUpdate, ProjectResponse

router = APIRouter()
CACHE_TTL = 300


@router.get("/", response_model=list[ProjectResponse])
async def list_projects(
    featured_only: bool = False,
    db: AsyncSession = Depends(get_db),
    redis: aioredis.Redis = Depends(get_redis),
) -> list[Project]:
    cache_key = f"cache:projects:{'featured' if featured_only else 'all'}"
    cached = await redis.get(cache_key)
    if cached:
        data = json.loads(cached)
        return [ProjectResponse(**p) for p in data]

    query = select(Project).order_by(Project.display_order.asc(), Project.created_at.desc())
    if featured_only:
        query = query.where(Project.featured == True)
    result = await db.execute(query)
    projects = result.scalars().all()

    await redis.setex(cache_key, CACHE_TTL, json.dumps([ProjectResponse.model_validate(p).model_dump(mode="json") for p in projects]))
    return list(projects)


@router.get("/{project_id}", response_model=ProjectResponse)
async def get_project(project_id: uuid.UUID, db: AsyncSession = Depends(get_db)) -> Project:
    result = await db.execute(select(Project).where(Project.id == project_id))
    project = result.scalar_one_or_none()
    if not project:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Project not found")
    return project


@router.post("/", response_model=ProjectResponse, status_code=status.HTTP_201_CREATED)
async def create_project(
    payload: ProjectCreate,
    _: User = Depends(get_admin_user),
    db: AsyncSession = Depends(get_db),
    redis: aioredis.Redis = Depends(get_redis),
) -> Project:
    project = Project(**payload.model_dump())
    db.add(project)
    await db.flush()
    await redis.delete("cache:projects:all", "cache:projects:featured")
    return project


@router.patch("/{project_id}", response_model=ProjectResponse)
async def update_project(
    project_id: uuid.UUID,
    payload: ProjectUpdate,
    _: User = Depends(get_admin_user),
    db: AsyncSession = Depends(get_db),
    redis: aioredis.Redis = Depends(get_redis),
) -> Project:
    result = await db.execute(select(Project).where(Project.id == project_id))
    project = result.scalar_one_or_none()
    if not project:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Project not found")
    for field, value in payload.model_dump(exclude_unset=True).items():
        setattr(project, field, value)
    db.add(project)
    await redis.delete("cache:projects:all", "cache:projects:featured")
    return project


@router.delete("/{project_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_project(
    project_id: uuid.UUID,
    _: User = Depends(get_admin_user),
    db: AsyncSession = Depends(get_db),
    redis: aioredis.Redis = Depends(get_redis),
) -> None:
    result = await db.execute(select(Project).where(Project.id == project_id))
    project = result.scalar_one_or_none()
    if not project:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Project not found")
    await db.delete(project)
    await redis.delete("cache:projects:all", "cache:projects:featured")
