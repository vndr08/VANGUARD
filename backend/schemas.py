from datetime import datetime
from typing import Optional

from pydantic import BaseModel

from .models import VehicleStatus


class VehicleBase(BaseModel):
    plate_number: str
    vehicle_type: str
    brand: str
    model: str
    year: int


class VehicleResponse(VehicleBase):
    id: int
    status: VehicleStatus
    speed: float
    latitude: Optional[float] = None
    longitude: Optional[float] = None
    heading: float = 0
    engine_on: bool = False
    fuel_level: float = 100
    odometer: float = 0
    last_update: datetime
    driver_name: Optional[str] = None

    model_config = {"from_attributes": True}


class TelemetryInput(BaseModel):
    vehicle_id: int
    latitude: float
    longitude: float
    speed: float = 0
    heading: float = 0
    engine_on: bool = False
    fuel_level: Optional[float] = None


class DashboardStats(BaseModel):
    total_vehicles: int
    driving: int
    idle: int
    stopped: int
    offline: int
    total_drivers: int
    avg_speed: float
    alerts: int


class GeofenceResponse(BaseModel):
    id: int
    name: str
    description: Optional[str] = None
    latitude: float
    longitude: float
    radius: float
    fence_type: str

    model_config = {"from_attributes": True}
