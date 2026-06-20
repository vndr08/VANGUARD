import logging

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import func, select
from sqlalchemy.ext.asyncio import AsyncSession

from ..database import get_db
from ..models import Driver, Vehicle, VehicleStatus
from ..schemas import DashboardStats

logger = logging.getLogger(__name__)
router = APIRouter()


@router.get("/stats", response_model=DashboardStats)
async def get_stats(db: AsyncSession = Depends(get_db)):
    try:
        total = await db.scalar(select(func.count(Vehicle.id))) or 0
        driving = (
            await db.scalar(
                select(func.count(Vehicle.id)).where(
                    Vehicle.status == VehicleStatus.DRIVING
                )
            )
            or 0
        )
        idle = (
            await db.scalar(
                select(func.count(Vehicle.id)).where(Vehicle.status == VehicleStatus.IDLE)
            )
            or 0
        )
        stopped = (
            await db.scalar(
                select(func.count(Vehicle.id)).where(
                    Vehicle.status == VehicleStatus.STOPPED
                )
            )
            or 0
        )
        offline = (
            await db.scalar(
                select(func.count(Vehicle.id)).where(
                    Vehicle.status == VehicleStatus.OFFLINE
                )
            )
            or 0
        )
        total_drivers = await db.scalar(select(func.count(Driver.id))) or 0
        avg_speed_result = await db.scalar(
            select(func.avg(Vehicle.speed)).where(Vehicle.status == VehicleStatus.DRIVING)
        )
    except Exception:
        logger.exception("Failed to fetch dashboard stats")
        raise HTTPException(status_code=500, detail="Failed to fetch dashboard statistics")

    return DashboardStats(
        total_vehicles=total,
        driving=driving,
        idle=idle,
        stopped=stopped,
        offline=offline,
        total_drivers=total_drivers,
        avg_speed=round(avg_speed_result or 0, 1),
        alerts=0,
    )
