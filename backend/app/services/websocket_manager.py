import uuid
import logging
import redis.asyncio as aioredis
from fastapi import WebSocket

logger = logging.getLogger(__name__)


class ConnectionManager:
    def __init__(self) -> None:
        self.active_connections: dict[str, WebSocket] = {}

    async def connect(self, websocket: WebSocket, user_id: str, redis: aioredis.Redis) -> str:
        await websocket.accept()
        conn_id = str(uuid.uuid4())
        self.active_connections[conn_id] = websocket
        await redis.sadd(f"ws:connections:{user_id}", conn_id)
        logger.info(f"WebSocket connected: user={user_id} conn={conn_id}")
        return conn_id

    async def disconnect(self, conn_id: str, user_id: str, redis: aioredis.Redis) -> None:
        self.active_connections.pop(conn_id, None)
        await redis.srem(f"ws:connections:{user_id}", conn_id)
        logger.info(f"WebSocket disconnected: user={user_id} conn={conn_id}")

    async def broadcast(self, message: str, user_id: str | None = None) -> None:
        disconnected = []
        for conn_id, ws in self.active_connections.items():
            try:
                await ws.send_text(message)
            except Exception:
                disconnected.append(conn_id)
        for conn_id in disconnected:
            self.active_connections.pop(conn_id, None)
