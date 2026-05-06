import asyncio
from sqlalchemy.ext.asyncio import AsyncSession
from app.database import AsyncSessionLocal, engine, Base
from app.models.user import User
from app.models.content import Project
from app.core.security import hash_password
from app.config import settings


async def seed_database() -> None:
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)

    async with AsyncSessionLocal() as db:
        from sqlalchemy import select
        existing = await db.execute(select(User).where(User.email == settings.ADMIN_EMAIL))
        if existing.scalar_one_or_none():
            print("Database already seeded.")
            return

        admin = User(
            email=settings.ADMIN_EMAIL,
            username="admin",
            password_hash=hash_password(settings.ADMIN_PASSWORD),
            full_name="Admin User",
            role="admin",
            is_active=True,
            email_verified=True,
        )
        db.add(admin)

        projects = [
            Project(
                title="Portfolio Website",
                description="Over-engineered personal portfolio built with Next.js 15, FastAPI, and WebSockets.",
                tech_stack=["Next.js", "FastAPI", "PostgreSQL", "Redis", "Docker"],
                featured=True,
                display_order=1,
            ),
            Project(
                title="Real-Time Data Visualizer",
                description="WebSocket-powered live data visualization with D3.js and Three.js.",
                tech_stack=["WebSocket", "D3.js", "Three.js", "Python", "Redis"],
                featured=True,
                display_order=2,
            ),
            Project(
                title="Algorithm Visualizer",
                description="Step-by-step sorting and pathfinding algorithm visualization.",
                tech_stack=["Canvas API", "TypeScript", "FastAPI"],
                featured=False,
                display_order=3,
            ),
        ]
        for p in projects:
            db.add(p)

        await db.commit()
        print("Database seeded successfully.")


if __name__ == "__main__":
    asyncio.run(seed_database())
