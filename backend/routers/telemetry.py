import logging
from datetime import datetime, timezone

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from ..database import get_db
from ..models import TelemetryLog, Vehicle, VehicleStatus
from ..schemas import TelemetryInput

logger = logging.getLogger(__name__)
router = APIRouter()


@router.post("/")
async def receive_telemetry(data: TelemetryInput, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(Vehicle).where(Vehicle.id == data.vehicle_id))
    vehicle = result.scalar_one_or_none()
    if not vehicle:
        raise HTTPException(status_code=404, detail="Vehicle not found")

    vehicle.latitude = data.latitude
    vehicle.longitude = data.longitude
    vehicle.speed = data.speed
    vehicle.heading = data.heading
    vehicle.engine_on = data.engine_on
    vehicle.last_update = datetime.now(timezone.utc)

    if data.fuel_level is not None:
        vehicle.fuel_level = data.fuel_level

    if data.speed > 5:
        vehicle.status = VehicleStatus.DRIVING
    elif data.engine_on:
        vehicle.status = VehicleStatus.IDLE
    else:
        vehicle.status = VehicleStatus.STOPPED

    log = TelemetryLog(
        vehicle_id=data.vehicle_id,
        latitude=data.latitude,
        longitude=data.longitude,
        speed=data.speed,
        heading=data.heading,
        engine_on=data.engine_on,
        fuel_level=data.fuel_level,
        timestamp=datetime.now(timezone.utc),
    )
    db.add(log)

    try:
        await db.commit()
    except Exception:
        await db.rollback()
        logger.exception("Failed to commit telemetry for vehicle %d", data.vehicle_id)
        raise HTTPException(status_code=500, detail="Failed to save telemetry")

    from .ws import broadcast_vehicle_update

    await broadcast_vehicle_update(
        {
            "vehicle_id": vehicle.id,
            "plate_number": vehicle.plate_number,
            "latitude": data.latitude,
            "longitude": data.longitude,
            "speed": data.speed,
            "heading": data.heading,
            "status": vehicle.status.value,
            "engine_on": data.engine_on,
            "fuel_level": vehicle.fuel_level,
            "last_update": vehicle.last_update.isoformat(),
        }
    )

    return {"status": "ok"}


@router.get("/history/{vehicle_id}")
async def get_telemetry_history(
    vehicle_id: int, limit: int = 100, db: AsyncSession = Depends(get_db)
):
    result = await db.execute(
        select(TelemetryLog)
        .where(TelemetryLog.vehicle_id == vehicle_id)
        .order_by(TelemetryLog.timestamp.desc())
        .limit(limit)
    )
    logs = result.scalars().all()
    return [
        {
            "id": log.id,
            "latitude": log.latitude,
            "longitude": log.longitude,
            "speed": log.speed,
            "heading": log.heading,
            "engine_on": log.engine_on,
            "fuel_level": log.fuel_level,
            "timestamp": log.timestamp.isoformat(),
        }
        for log in logs
    ]
