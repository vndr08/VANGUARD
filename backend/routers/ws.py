import json
import logging

from fastapi import APIRouter, WebSocket, WebSocketDisconnect

logger = logging.getLogger(__name__)
router = APIRouter()

connected_clients: list[WebSocket] = []


@router.websocket("/tracking")
async def websocket_endpoint(websocket: WebSocket):
    await websocket.accept()
    connected_clients.append(websocket)
    logger.info("WebSocket client connected (%d total)", len(connected_clients))
    try:
        while True:
            await websocket.receive_text()
    except WebSocketDisconnect:
        if websocket in connected_clients:
            connected_clients.remove(websocket)
        logger.info("WebSocket client disconnected (%d remaining)", len(connected_clients))
    except Exception:
        if websocket in connected_clients:
            connected_clients.remove(websocket)
        logger.exception("WebSocket error")


async def broadcast_vehicle_update(data: dict):
    if not connected_clients:
        return
    disconnected = []
    message = json.dumps(data)
    for client in connected_clients:
        try:
            await client.send_text(message)
        except Exception:
            disconnected.append(client)
    for client in disconnected:
        if client in connected_clients:
            connected_clients.remove(client)
    if disconnected:
        logger.info("Removed %d disconnected WebSocket clients", len(disconnected))
