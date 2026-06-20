"""
Seed script: populates the database with 25 vehicles and 20 drivers.
Run: python -m backend.seed
"""

import asyncio
import random

from backend.database import Base, async_session, engine
from backend.models import Driver, Vehicle, VehicleStatus

VEHICLES_DATA = [
    ("B 1234 KJT", "truck", "Hino", "Ranger FL 235 JW", 2022, "White"),
    ("B 5678 TGP", "truck", "Mitsubishi", "Colt Diesel FE 74 HD", 2021, "Blue"),
    ("B 9012 XYZ", "truck", "Isuzu", "Giga FVZ 34 P", 2023, "White"),
    ("L 3456 ABC", "truck", "UD Trucks", "Quester CDE 280", 2022, "Red"),
    ("L 7890 DEF", "truck", "Hino", "500 FM 260 JD", 2020, "White"),
    ("H 2345 GHI", "truck", "Mercedes-Benz", "Actros 2645 LS", 2023, "Silver"),
    ("D 6789 JKL", "truck", "Mitsubishi", "Colt Diesel FE 71", 2019, "Yellow"),
    ("B 1357 MNO", "trailer", "Hino", "Ranger FL 235 JW", 2021, "White"),
    ("B 2468 PQR", "truck", "Isuzu", "Elf NMR 71 HD", 2022, "Blue"),
    ("L 1122 STU", "truck", "Hino", "Dutro 130 MDL", 2020, "Green"),
    ("B 3344 VWX", "truck", "UD Trucks", "Kuzer RKE 150", 2023, "White"),
    ("H 5566 YZA", "truck", "Mitsubishi", "Colt Diesel FE 84G", 2021, "Red"),
    ("B 7788 BCD", "pickup", "Toyota", "Hilux Double Cab 4x4", 2023, "Black"),
    ("D 9900 EFG", "truck", "Isuzu", "Giga FVM 34 W", 2022, "White"),
    ("B 1100 HIJ", "truck", "Hino", "Ranger FM 260 JD", 2020, "Blue"),
    ("L 2200 KLM", "truck", "Mercedes-Benz", "Atego 1623", 2021, "Silver"),
    ("B 3300 NOP", "trailer", "UD Trucks", "Quester GWE 370", 2023, "White"),
    ("H 4400 QRS", "truck", "Mitsubishi", "Colt Diesel FE 74S", 2022, "Yellow"),
    ("B 5500 TUV", "truck", "Isuzu", "Elf NLR 55 BLX", 2021, "White"),
    ("D 6600 WXY", "truck", "Hino", "Dutro 110 LD", 2020, "Green"),
    ("B 7700 ZAB", "truck", "UD Trucks", "Kuzer RKE 150", 2023, "White"),
    ("L 8800 CDE", "truck", "Hino", "500 FG 235 JP", 2022, "Blue"),
    ("B 9900 FGH", "pickup", "Mitsubishi", "Triton DC HDX 4x4", 2023, "Black"),
    ("H 1010 IJK", "truck", "Isuzu", "Giga FVR 34 P", 2021, "White"),
    ("B 2020 LMN", "truck", "Mercedes-Benz", "Axor 2528 R", 2022, "Silver"),
]

DRIVERS_DATA = [
    ("Ahmad Sudirman", "081234567890", "SIM-B2-001", "B2"),
    ("Budi Santoso", "081234567891", "SIM-B2-002", "B2"),
    ("Cahyo Wibowo", "081234567892", "SIM-B2-003", "B2"),
    ("Dedi Kurniawan", "081234567893", "SIM-B2-004", "B2"),
    ("Eko Prasetyo", "081234567894", "SIM-B2-005", "B2"),
    ("Fajar Ramadhan", "081234567895", "SIM-B2-006", "B2"),
    ("Gunawan Hadi", "081234567896", "SIM-B2-007", "B2"),
    ("Hendra Wijaya", "081234567897", "SIM-A-008", "A"),
    ("Irfan Hakim", "081234567898", "SIM-B2-009", "B2"),
    ("Joko Susilo", "081234567899", "SIM-B2-010", "B2"),
    ("Kurnia Adi", "081234567900", "SIM-B2-011", "B2"),
    ("Lukman Hakim", "081234567901", "SIM-B2-012", "B2"),
    ("Muhammad Rizki", "081234567902", "SIM-A-013", "A"),
    ("Nur Hidayat", "081234567903", "SIM-B2-014", "B2"),
    ("Oscar Pranata", "081234567904", "SIM-B2-015", "B2"),
    ("Putra Mahendra", "081234567905", "SIM-B2-016", "B2"),
    ("Rudi Hartono", "081234567906", "SIM-B2-017", "B2"),
    ("Sugeng Priyanto", "081234567907", "SIM-A-018", "A"),
    ("Teguh Waluyo", "081234567908", "SIM-B2-019", "B2"),
    ("Umar Faruq", "081234567909", "SIM-B2-020", "B2"),
]

ROUTES = [
    (-6.2088, 106.8456),
    (-6.3020, 107.1514),
    (-6.9175, 107.6191),
    (-6.9666, 110.4196),
    (-7.2575, 112.7521),
    (-6.7320, 108.5523),
    (-6.3106, 107.3383),
]


async def seed():
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.drop_all)
        await conn.run_sync(Base.metadata.create_all)
    print("✅ Tables created")

    async with async_session() as session:
        drivers = []
        for name, phone, license_num, license_type in DRIVERS_DATA:
            driver = Driver(
                name=name,
                phone=phone,
                license_number=license_num,
                license_type=license_type,
                rfid_tag=f"RFID-{license_num[-3:]}",
            )
            session.add(driver)
            drivers.append(driver)
        await session.flush()
        print(f"✅ {len(drivers)} drivers created")

        for i, (plate, vtype, brand, model, year, color) in enumerate(VEHICLES_DATA):
            route = ROUTES[i % len(ROUTES)]
            lat = route[0] + random.uniform(-0.05, 0.05)
            lng = route[1] + random.uniform(-0.05, 0.05)
            driver = drivers[i] if i < len(drivers) else None
            statuses = [
                VehicleStatus.DRIVING,
                VehicleStatus.DRIVING,
                VehicleStatus.STOPPED,
                VehicleStatus.IDLE,
                VehicleStatus.STOPPED,
            ]

            vehicle = Vehicle(
                plate_number=plate,
                vehicle_type=vtype,
                brand=brand,
                model=model,
                year=year,
                color=color,
                status=random.choice(statuses),
                driver_id=driver.id if driver else None,
                speed=round(random.uniform(0, 80), 1) if random.random() > 0.3 else 0,
                latitude=round(lat, 6),
                longitude=round(lng, 6),
                heading=round(random.uniform(0, 360), 1),
                engine_on=random.choice([True, True, False]),
                fuel_level=round(random.uniform(20, 100), 1),
                odometer=round(random.uniform(10000, 500000), 0),
            )
            session.add(vehicle)

        await session.commit()
        print(f"✅ {len(VEHICLES_DATA)} vehicles created")
        print("🚀 Seed complete!")


if __name__ == "__main__":
    asyncio.run(seed())
