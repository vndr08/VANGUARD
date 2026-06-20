"""
VANGUARD GPS Simulator
Simulates 25 trucks moving around Java, Indonesia.
Sends telemetry data to the backend every 3 seconds.
"""

import asyncio
import math
import random

import httpx

API_URL = "http://localhost:8000/api/telemetry/"

ROUTES = [
    {"name": "Jakarta", "center": (-6.2088, 106.8456), "radius": 0.08},
    {"name": "Cikarang", "center": (-6.3020, 107.1514), "radius": 0.04},
    {"name": "Bandung", "center": (-6.9175, 107.6191), "radius": 0.05},
    {"name": "Semarang", "center": (-6.9666, 110.4196), "radius": 0.04},
    {"name": "Surabaya", "center": (-7.2575, 112.7521), "radius": 0.06},
    {"name": "Cirebon", "center": (-6.7320, 108.5523), "radius": 0.03},
    {"name": "Karawang", "center": (-6.3106, 107.3383), "radius": 0.03},
]


class TruckSimulator:
    def __init__(self, vehicle_id: int, route_idx: int):
        self.vehicle_id = vehicle_id
        route = ROUTES[route_idx % len(ROUTES)]
        self.lat = route["center"][0] + random.uniform(
            -route["radius"], route["radius"]
        )
        self.lng = route["center"][1] + random.uniform(
            -route["radius"], route["radius"]
        )
        self.heading = random.uniform(0, 360)
        self.speed = random.uniform(0, 80)
        self.engine_on = random.choice([True, True, True, False])
        self.fuel = random.uniform(30, 100)
        self.route_center = route["center"]
        self.route_radius = route["radius"]

    def update(self):
        if not self.engine_on:
            if random.random() < 0.08:
                self.engine_on = True
            self.speed = 0
            return

        if random.random() < 0.03:
            self.engine_on = False
            self.speed = 0
            return

        # Steer back towards route center if too far
        dx = self.route_center[1] - self.lng
        dy = self.route_center[0] - self.lat
        dist_from_center = math.sqrt(dx * dx + dy * dy)

        if dist_from_center > self.route_radius * 0.8:
            target_heading = math.degrees(math.atan2(dx, dy))
            self.heading += (target_heading - self.heading) * 0.3
        else:
            self.heading += random.uniform(-20, 20)

        self.heading = self.heading % 360

        target_speed = random.uniform(30, 85)
        self.speed += (target_speed - self.speed) * 0.15
        self.speed = max(0, min(110, self.speed))

        distance = self.speed / 3600 / 111
        self.lat += distance * math.cos(math.radians(self.heading))
        self.lng += distance * math.sin(math.radians(self.heading))

        self.fuel = max(5, self.fuel - random.uniform(0, 0.03))


async def run_simulator():
    trucks = [TruckSimulator(i, i) for i in range(1, 26)]
    print(f"🚛 VANGUARD GPS Simulator started — {len(trucks)} trucks")
    print(f"📡 Sending to {API_URL}")

    async with httpx.AsyncClient(timeout=5.0) as client:
        cycle = 0
        while True:
            cycle += 1
            success = 0
            for truck in trucks:
                truck.update()
                try:
                    await client.post(
                        API_URL,
                        json={
                            "vehicle_id": truck.vehicle_id,
                            "latitude": round(truck.lat, 6),
                            "longitude": round(truck.lng, 6),
                            "speed": round(truck.speed, 1),
                            "heading": round(truck.heading, 1),
                            "engine_on": truck.engine_on,
                            "fuel_level": round(truck.fuel, 1),
                        },
                    )
                    success += 1
                except Exception:
                    pass

            if cycle % 10 == 1:
                driving = sum(1 for t in trucks if t.engine_on and t.speed > 5)
                idle = sum(1 for t in trucks if t.engine_on and t.speed <= 5)
                stopped = sum(1 for t in trucks if not t.engine_on)
                print(
                    f"  Cycle {cycle}: {success}/{len(trucks)} sent | "
                    f"🟢 {driving} driving | 🟡 {idle} idle | 🔴 {stopped} stopped"
                )

            await asyncio.sleep(3)


if __name__ == "__main__":
    asyncio.run(run_simulator())
