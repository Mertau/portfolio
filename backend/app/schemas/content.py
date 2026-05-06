import uuid
from datetime import datetime
from pydantic import BaseModel, HttpUrl
from typing import Any


class ProjectBase(BaseModel):
    title: str
    description: str | None = None
    content: dict[str, Any] | None = None
    tech_stack: list[str] | None = None
    github_url: str | None = None
    live_url: str | None = None
    featured: bool = False
    display_order: int | None = None


class ProjectCreate(ProjectBase):
    pass


class ProjectUpdate(ProjectBase):
    title: str | None = None


class ProjectResponse(ProjectBase):
    id: uuid.UUID
    created_at: datetime
    updated_at: datetime

    model_config = {"from_attributes": True}


class BlogPostBase(BaseModel):
    title: str
    slug: str
    content: dict[str, Any] | None = None
    published: bool = False
    tags: list[str] | None = None


class BlogPostCreate(BlogPostBase):
    pass


class BlogPostUpdate(BlogPostBase):
    title: str | None = None
    slug: str | None = None


class BlogPostResponse(BlogPostBase):
    id: uuid.UUID
    author_id: uuid.UUID | None
    published_at: datetime | None
    view_count: int
    created_at: datetime
    updated_at: datetime

    model_config = {"from_attributes": True}


class ContactSubmissionCreate(BaseModel):
    name: str
    email: str
    subject: str | None = None
    message: str


class ContactSubmissionResponse(BaseModel):
    id: uuid.UUID
    name: str
    email: str
    subject: str | None
    status: str
    created_at: datetime

    model_config = {"from_attributes": True}
