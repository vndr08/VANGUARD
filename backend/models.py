import enum
from datetime import datetime, timezone

from sqlalchemy import (
    Boolean,
    Column,
    DateTime,
    Float,
    ForeignKey,
    Integer,
    String,
)
from sqlalchemy.orm import relationship

from .database import Base


class VehicleStatus(str, enum.Enum):
    DRIVING = "driving"
    IDLE = "idle"
    STOPPED = "stopped"
    OFFLINE = "offline"


class Vehicle(Base):
    __tablename__ = "vehicles"

    id = Column(Integer, primary_key=True, index=True)
    plate_number = Column(String(20), unique=True, nullable=False, index=True)
    vehicle_type = Column(String(50))
    brand = Column(String(50))
    model = Column(String(100))
    year = Column(Integer)
    color = Column(String(30), default="White")
    status = Column(String(20), default=VehicleStatus.OFFLINE)
    driver_id = Column(Integer, ForeignKey("drivers.id"), nullable=True)
    speed = Column(Float, default=0)
    latitude = Column(Float, nullable=True)
    longitude = Column(Float, nullable=True)
    heading = Column(Float, default=0)
    engine_on = Column(Boolean, default=False)
    fuel_level = Column(Float, default=100)
    odometer = Column(Float, default=0)
    last_update = Column(DateTime, default=lambda: datetime.now(timezone.utc))
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))

    driver = relationship("Driver", back_populates="vehicle")
    telemetry_logs = relationship("TelemetryLog", back_populates="vehicle")


class Driver(Base):
    __tablename__ = "drivers"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(100), nullable=False)
    phone = Column(String(20))
    license_number = Column(String(50))
    license_type = Column(String(10), default="B2")
    rfid_tag = Column(String(50), unique=True, nullable=True)
    status = Column(String(20), default="active")
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))

    vehicle = relationship("Vehicle", back_populates="driver", uselist=False)


class TelemetryLog(Base):
    __tablename__ = "telemetry_logs"

    id = Column(Integer, primary_key=True, index=True)
    vehicle_id = Column(Integer, ForeignKey("vehicles.id"), nullable=False, index=True)
    latitude = Column(Float, nullable=False)
    longitude = Column(Float, nullable=False)
    speed = Column(Float, default=0)
    heading = Column(Float, default=0)
    engine_on = Column(Boolean, default=False)
    fuel_level = Column(Float, nullable=True)
    odometer = Column(Float, nullable=True)
    event_type = Column(String(30), nullable=True)
    timestamp = Column(DateTime, default=lambda: datetime.now(timezone.utc), index=True)

    vehicle = relationship("Vehicle", back_populates="telemetry_logs")


class Geofence(Base):
    __tablename__ = "geofences"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(100), nullable=False)
    description = Column(String(255), nullable=True)
    latitude = Column(Float, nullable=False)
    longitude = Column(Float, nullable=False)
    radius = Column(Float, nullable=False, default=500)
    fence_type = Column(String(20), default="checkpoint")
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))
