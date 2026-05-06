from fastapi import APIRouter
from app.api.v1.endpoints import auth, users, projects, blog, contact, websocket

api_router = APIRouter()

api_router.include_router(auth.router, prefix="/auth", tags=["Authentication"])
api_router.include_router(users.router, prefix="/users", tags=["Users"])
api_router.include_router(projects.router, prefix="/projects", tags=["Projects"])
api_router.include_router(blog.router, prefix="/blog", tags=["Blog"])
api_router.include_router(contact.router, prefix="/contact", tags=["Contact"])
api_router.include_router(websocket.router, prefix="/ws", tags=["WebSocket"])
