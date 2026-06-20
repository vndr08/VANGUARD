from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from ..database import get_db
from ..models import Driver, Vehicle
from ..schemas import VehicleResponse

router = APIRouter()


@router.get("/", response_model=list[VehicleResponse])
async def get_vehicles(db: AsyncSession = Depends(get_db)):
    result = await db.execute(
        select(Vehicle, Driver.name)
        .outerjoin(Driver, Vehicle.driver_id == Driver.id)
        .order_by(Vehicle.plate_number)
    )
    vehicles = []
    for row in result.all():
        v = row[0]
        vehicles.append(
            VehicleResponse(
                id=v.id,
                plate_number=v.plate_number,
                vehicle_type=v.vehicle_type or "",
                brand=v.brand or "",
                model=v.model or "",
                year=v.year or 0,
                status=v.status,
                speed=v.speed or 0,
                latitude=v.latitude,
                longitude=v.longitude,
                heading=v.heading or 0,
                engine_on=v.engine_on or False,
                fuel_level=v.fuel_level or 0,
                odometer=v.odometer or 0,
                last_update=v.last_update,
                driver_name=row[1],
            )
        )
    return vehicles


@router.get("/{vehicle_id}", response_model=VehicleResponse)
async def get_vehicle(vehicle_id: int, db: AsyncSession = Depends(get_db)):
    result = await db.execute(
        select(Vehicle, Driver.name)
        .outerjoin(Driver, Vehicle.driver_id == Driver.id)
        .where(Vehicle.id == vehicle_id)
    )
    row = result.first()
    if not row:
        raise HTTPException(status_code=404, detail="Vehicle not found")
    v = row[0]
    return VehicleResponse(
        id=v.id,
        plate_number=v.plate_number,
        vehicle_type=v.vehicle_type or "",
        brand=v.brand or "",
        model=v.model or "",
        year=v.year or 0,
        status=v.status,
        speed=v.speed or 0,
        latitude=v.latitude,
        longitude=v.longitude,
        heading=v.heading or 0,
        engine_on=v.engine_on or False,
        fuel_level=v.fuel_level or 0,
        odometer=v.odometer or 0,
        last_update=v.last_update,
        driver_name=row[1],
    )
