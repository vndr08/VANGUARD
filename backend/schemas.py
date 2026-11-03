from datetime import datetime
from typing import Optional

from pydantic import BaseModel, Field

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
    vehicle_id: int = Field(gt=0)
    latitude: float = Field(ge=-90, le=90)
    longitude: float = Field(ge=-180, le=180)
    speed: float = Field(default=0, ge=0, le=300)
    heading: float = Field(default=0, ge=0, lt=360)
    engine_on: bool = False
    fuel_level: Optional[float] = Field(default=None, ge=0, le=100)


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
