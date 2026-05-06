import uuid
from datetime import datetime
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select

from app.core.dependencies import get_admin_user
from app.database import get_db
from app.models.user import User
from app.models.content import BlogPost
from app.schemas.content import BlogPostCreate, BlogPostUpdate, BlogPostResponse

router = APIRouter()


@router.get("/", response_model=list[BlogPostResponse])
async def list_posts(
    published_only: bool = True,
    db: AsyncSession = Depends(get_db),
) -> list[BlogPost]:
    query = select(BlogPost).order_by(BlogPost.published_at.desc())
    if published_only:
        query = query.where(BlogPost.published == True)
    result = await db.execute(query)
    return list(result.scalars().all())


@router.get("/{slug}", response_model=BlogPostResponse)
async def get_post(slug: str, db: AsyncSession = Depends(get_db)) -> BlogPost:
    result = await db.execute(select(BlogPost).where(BlogPost.slug == slug))
    post = result.scalar_one_or_none()
    if not post:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Post not found")
    post.view_count += 1
    db.add(post)
    return post


@router.post("/", response_model=BlogPostResponse, status_code=status.HTTP_201_CREATED)
async def create_post(
    payload: BlogPostCreate,
    admin: User = Depends(get_admin_user),
    db: AsyncSession = Depends(get_db),
) -> BlogPost:
    post = BlogPost(**payload.model_dump(), author_id=admin.id)
    if payload.published:
        post.published_at = datetime.utcnow()
    db.add(post)
    await db.flush()
    return post


@router.patch("/{post_id}", response_model=BlogPostResponse)
async def update_post(
    post_id: uuid.UUID,
    payload: BlogPostUpdate,
    _: User = Depends(get_admin_user),
    db: AsyncSession = Depends(get_db),
) -> BlogPost:
    result = await db.execute(select(BlogPost).where(BlogPost.id == post_id))
    post = result.scalar_one_or_none()
    if not post:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Post not found")
    update_data = payload.model_dump(exclude_unset=True)
    if update_data.get("published") and not post.published:
        update_data["published_at"] = datetime.utcnow()
    for field, value in update_data.items():
        setattr(post, field, value)
    db.add(post)
    return post
