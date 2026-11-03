import unittest

from pydantic import ValidationError

from backend.config import Settings
from backend.main import app
from backend.schemas import TelemetryInput


class TelemetryInputContractTests(unittest.TestCase):
    def test_accepts_valid_payload(self):
        payload = TelemetryInput(
            vehicle_id=1,
            latitude=-6.2,
            longitude=106.8,
            speed=42.5,
            heading=180,
            engine_on=True,
            fuel_level=55,
        )
        self.assertEqual(payload.vehicle_id, 1)

    def test_rejects_invalid_coordinates(self):
        with self.assertRaises(ValidationError):
            TelemetryInput(vehicle_id=1, latitude=-91, longitude=181)

    def test_rejects_invalid_vehicle_metrics(self):
        with self.assertRaises(ValidationError):
            TelemetryInput(
                vehicle_id=0,
                latitude=-6.2,
                longitude=106.8,
                speed=-1,
                heading=360,
                fuel_level=101,
            )


class ApplicationContractTests(unittest.TestCase):
    def test_required_routes_are_registered(self):
        routes = {route.path for route in app.routes}
        self.assertTrue(
            {
                "/api/health",
                "/api/vehicles/",
                "/api/telemetry/",
                "/api/dashboard/stats",
                "/ws/tracking",
            }.issubset(routes)
        )

    def test_cors_origins_are_configurable(self):
        settings = Settings(CORS_ORIGINS="https://ops.example.com, https://backup.example.com")
        self.assertEqual(
            settings.cors_origins,
            ["https://ops.example.com", "https://backup.example.com"],
        )


if __name__ == "__main__":
    unittest.main()
