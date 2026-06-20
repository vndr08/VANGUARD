import logging
from contextlib import asynccontextmanager

from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from sqlalchemy import text

from .database import async_session, init_db
from .routers import dashboard, telemetry, vehicles, ws

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(name)s: %(message)s",
)


@asynccontextmanager
async def lifespan(app: FastAPI):
    await init_db()
    yield


app = FastAPI(
    title="VANGUARD Fleet Intelligence",
    version="1.0.0",
    lifespan=lifespan,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(vehicles.router, prefix="/api/vehicles", tags=["vehicles"])
app.include_router(telemetry.router, prefix="/api/telemetry", tags=["telemetry"])
app.include_router(dashboard.router, prefix="/api/dashboard", tags=["dashboard"])
app.include_router(ws.router, prefix="/ws", tags=["websocket"])


@app.exception_handler(Exception)
async def unhandled_exception_handler(request: Request, exc: Exception):
    logging.getLogger(__name__).exception("Unhandled error on %s", request.url.path)
    return JSONResponse(
        status_code=500,
        content={
            "status": "error",
            "message": "Unexpected server error",
            "path": request.url.path,
        },
    )


@app.get("/api/health")
async def health():
    database = "unknown"
    try:
        async with async_session() as session:
            await session.execute(text("SELECT 1"))
        database = "online"
    except Exception:
        logging.getLogger(__name__).exception("Health check database probe failed")
        database = "degraded"

    return {
        "status": "operational" if database == "online" else "degraded",
        "service": "VANGUARD Fleet Intelligence",
        "database": database,
        "websocket_clients": len(ws.connected_clients),
    }
