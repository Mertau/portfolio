import asyncio
import json
import logging
import psutil
from datetime import datetime

from fastapi import APIRouter, WebSocket, WebSocketDisconnect, Depends
import redis.asyncio as aioredis

from app.core.security import decode_token
from app.redis_client import get_redis
from app.config import settings
from app.services.websocket_manager import ConnectionManager

router = APIRouter()
logger = logging.getLogger(__name__)
manager = ConnectionManager()


async def authenticate_ws(websocket: WebSocket, redis: aioredis.Redis) -> str | None:
    token = websocket.query_params.get("token")
    if not token:
        await websocket.close(code=4001, reason="Missing token")
        return None
    try:
        payload = decode_token(token)
        if payload.get("type") != "access":
            await websocket.close(code=4001, reason="Invalid token type")
            return None
        jti = payload.get("jti")
        if jti and await redis.exists(f"blacklist:jwt:{jti}"):
            await websocket.close(code=4001, reason="Token revoked")
            return None
        return payload.get("sub")
    except ValueError:
        await websocket.close(code=4001, reason="Invalid token")
        return None


@router.websocket("/metrics")
async def metrics_websocket(websocket: WebSocket, redis: aioredis.Redis = Depends(get_redis)) -> None:
    user_id = await authenticate_ws(websocket, redis)
    if not user_id:
        return

    conn_count = await redis.scard(f"ws:connections:{user_id}")
    if conn_count >= settings.MAX_WS_CONNECTIONS_PER_USER:
        await websocket.close(code=4029, reason="Too many connections")
        return

    conn_id = await manager.connect(websocket, user_id, redis)
    try:
        while True:
            try:
                data = await asyncio.wait_for(websocket.receive_text(), timeout=30.0)
                msg = json.loads(data)
                if msg.get("type") == "ping":
                    await websocket.send_text(json.dumps({"type": "pong", "timestamp": datetime.utcnow().isoformat()}))
            except asyncio.TimeoutError:
                metrics = {
                    "type": "metrics",
                    "timestamp": datetime.utcnow().isoformat(),
                    "cpu_percent": psutil.cpu_percent(interval=None),
                    "memory_percent": psutil.virtual_memory().percent,
                    "disk_percent": psutil.disk_usage("/").percent,
                }
                await websocket.send_text(json.dumps(metrics))
    except WebSocketDisconnect:
        logger.info(f"WebSocket disconnected: user={user_id}")
    finally:
        await manager.disconnect(conn_id, user_id, redis)


@router.websocket("/algorithms")
async def algorithms_websocket(websocket: WebSocket, redis: aioredis.Redis = Depends(get_redis)) -> None:
    user_id = await authenticate_ws(websocket, redis)
    if not user_id:
        return

    conn_id = await manager.connect(websocket, user_id, redis)
    try:
        while True:
            data = await asyncio.wait_for(websocket.receive_text(), timeout=settings.WS_TIMEOUT_SECONDS)
            msg = json.loads(data)
            algo = msg.get("algorithm", "bubble_sort")
            array_size = min(int(msg.get("size", 20)), 100)
            await stream_algorithm(websocket, algo, array_size)
    except (WebSocketDisconnect, asyncio.TimeoutError):
        pass
    finally:
        await manager.disconnect(conn_id, user_id, redis)


async def stream_algorithm(websocket: WebSocket, algorithm: str, size: int) -> None:
    import random
    arr = list(range(1, size + 1))
    random.shuffle(arr)

    await websocket.send_text(json.dumps({"type": "init", "array": arr, "algorithm": algorithm}))

    steps: list[dict] = []

    if algorithm == "bubble_sort":
        a = arr.copy()
        for i in range(len(a)):
            for j in range(0, len(a) - i - 1):
                if a[j] > a[j + 1]:
                    a[j], a[j + 1] = a[j + 1], a[j]
                    steps.append({"type": "swap", "i": j, "j": j + 1, "array": a.copy()})
    elif algorithm == "selection_sort":
        a = arr.copy()
        for i in range(len(a)):
            min_idx = i
            for j in range(i + 1, len(a)):
                if a[j] < a[min_idx]:
                    min_idx = j
                steps.append({"type": "compare", "i": j, "j": min_idx, "array": a.copy()})
            a[i], a[min_idx] = a[min_idx], a[i]
            steps.append({"type": "swap", "i": i, "j": min_idx, "array": a.copy()})

    for step in steps:
        await websocket.send_text(json.dumps(step))
        await asyncio.sleep(0.05)

    await websocket.send_text(json.dumps({"type": "done", "array": steps[-1]["array"] if steps else arr}))
