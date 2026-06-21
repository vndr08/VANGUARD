import type { Vehicle, TelemetryUpdate } from "@/types";
import type { MapVehicle, TaskInfo, RouteMarker, LngLat } from "@/components/map/types";

export const MOCK_VEHICLES: Vehicle[] = [
  { id: 1, plate_number: "B 1234 KJT", vehicle_type: "truck", brand: "Hino", model: "Ranger FL 235 JW", year: 2022, status: "driving", speed: 67.2, latitude: -6.2088, longitude: 106.8456, heading: 45, engine_on: true, fuel_level: 72.5, odometer: 145230, last_update: new Date().toISOString(), driver_name: "Ahmad Sudirman" },
  { id: 2, plate_number: "B 5678 TGP", vehicle_type: "truck", brand: "Mitsubishi", model: "Colt Diesel FE 74 HD", year: 2021, status: "driving", speed: 82.1, latitude: -6.3020, longitude: 107.1514, heading: 120, engine_on: true, fuel_level: 58.3, odometer: 203100, last_update: new Date().toISOString(), driver_name: "Budi Santoso" },
  { id: 3, plate_number: "B 9012 XYZ", vehicle_type: "truck", brand: "Isuzu", model: "Giga FVZ 34 P", year: 2023, status: "stopped", speed: 0, latitude: -6.9175, longitude: 107.6191, heading: 200, engine_on: false, fuel_level: 45.0, odometer: 89450, last_update: new Date().toISOString(), driver_name: "Cahyo Wibowo" },
  { id: 4, plate_number: "L 3456 ABC", vehicle_type: "truck", brand: "UD Trucks", model: "Quester CDE 280", year: 2022, status: "driving", speed: 55.8, latitude: -6.9666, longitude: 110.4196, heading: 310, engine_on: true, fuel_level: 81.2, odometer: 167800, last_update: new Date().toISOString(), driver_name: "Dedi Kurniawan" },
  { id: 5, plate_number: "L 7890 DEF", vehicle_type: "truck", brand: "Hino", model: "500 FM 260 JD", year: 2020, status: "idle", speed: 0, latitude: -7.2575, longitude: 112.7521, heading: 90, engine_on: true, fuel_level: 33.7, odometer: 312000, last_update: new Date().toISOString(), driver_name: "Eko Prasetyo" },
  { id: 6, plate_number: "H 2345 GHI", vehicle_type: "truck", brand: "Mercedes-Benz", model: "Actros 2645 LS", year: 2023, status: "driving", speed: 71.5, latitude: -6.7320, longitude: 108.5523, heading: 180, engine_on: true, fuel_level: 66.9, odometer: 54200, last_update: new Date().toISOString(), driver_name: "Fajar Ramadhan" },
  { id: 7, plate_number: "D 6789 JKL", vehicle_type: "truck", brand: "Mitsubishi", model: "Colt Diesel FE 71", year: 2019, status: "stopped", speed: 0, latitude: -6.3106, longitude: 107.3383, heading: 270, engine_on: false, fuel_level: 92.1, odometer: 410500, last_update: new Date().toISOString(), driver_name: "Gunawan Hadi" },
  { id: 8, plate_number: "B 1357 MNO", vehicle_type: "trailer", brand: "Hino", model: "Ranger FL 235 JW", year: 2021, status: "driving", speed: 48.3, latitude: -6.1850, longitude: 106.9020, heading: 35, engine_on: true, fuel_level: 55.4, odometer: 198700, last_update: new Date().toISOString(), driver_name: "Hendra Wijaya" },
  { id: 9, plate_number: "B 2468 PQR", vehicle_type: "truck", brand: "Isuzu", model: "Elf NMR 71 HD", year: 2022, status: "stopped", speed: 0, latitude: -6.2650, longitude: 106.7800, heading: 150, engine_on: false, fuel_level: 78.8, odometer: 122300, last_update: new Date().toISOString(), driver_name: "Irfan Hakim" },
  { id: 10, plate_number: "L 1122 STU", vehicle_type: "truck", brand: "Hino", model: "Dutro 130 MDL", year: 2020, status: "driving", speed: 63.7, latitude: -7.2800, longitude: 112.7200, heading: 220, engine_on: true, fuel_level: 41.2, odometer: 278900, last_update: new Date().toISOString(), driver_name: "Joko Susilo" },
  { id: 11, plate_number: "B 3344 VWX", vehicle_type: "truck", brand: "UD Trucks", model: "Kuzer RKE 150", year: 2023, status: "idle", speed: 0, latitude: -6.2200, longitude: 106.8800, heading: 0, engine_on: true, fuel_level: 88.5, odometer: 35600, last_update: new Date().toISOString(), driver_name: "Kurnia Adi" },
  { id: 12, plate_number: "H 5566 YZA", vehicle_type: "truck", brand: "Mitsubishi", model: "Colt Diesel FE 84G", year: 2021, status: "stopped", speed: 0, latitude: -6.9800, longitude: 110.4500, heading: 90, engine_on: false, fuel_level: 67.3, odometer: 187400, last_update: new Date().toISOString(), driver_name: "Lukman Hakim" },
  { id: 13, plate_number: "B 7788 BCD", vehicle_type: "pickup", brand: "Toyota", model: "Hilux Double Cab 4x4", year: 2023, status: "driving", speed: 45.2, latitude: -6.1750, longitude: 106.8270, heading: 315, engine_on: true, fuel_level: 60.1, odometer: 28900, last_update: new Date().toISOString(), driver_name: "Muhammad Rizki" },
  { id: 14, plate_number: "D 9900 EFG", vehicle_type: "truck", brand: "Isuzu", model: "Giga FVM 34 W", year: 2022, status: "stopped", speed: 0, latitude: -6.9300, longitude: 107.5800, heading: 45, engine_on: false, fuel_level: 75.6, odometer: 98200, last_update: new Date().toISOString(), driver_name: "Nur Hidayat" },
  { id: 15, plate_number: "B 1100 HIJ", vehicle_type: "truck", brand: "Hino", model: "Ranger FM 260 JD", year: 2020, status: "driving", speed: 73.9, latitude: -6.3500, longitude: 107.0800, heading: 160, engine_on: true, fuel_level: 49.8, odometer: 356100, last_update: new Date().toISOString(), driver_name: "Oscar Pranata" },
  { id: 16, plate_number: "L 2200 KLM", vehicle_type: "truck", brand: "Mercedes-Benz", model: "Atego 1623", year: 2021, status: "idle", speed: 0, latitude: -7.2400, longitude: 112.7800, heading: 270, engine_on: true, fuel_level: 52.4, odometer: 201300, last_update: new Date().toISOString(), driver_name: "Putra Mahendra" },
  { id: 17, plate_number: "B 3300 NOP", vehicle_type: "trailer", brand: "UD Trucks", model: "Quester GWE 370", year: 2023, status: "driving", speed: 58.6, latitude: -6.2400, longitude: 106.9500, heading: 80, engine_on: true, fuel_level: 71.2, odometer: 67800, last_update: new Date().toISOString(), driver_name: "Rudi Hartono" },
  { id: 18, plate_number: "H 4400 QRS", vehicle_type: "truck", brand: "Mitsubishi", model: "Colt Diesel FE 74S", year: 2022, status: "stopped", speed: 0, latitude: -6.9500, longitude: 110.3800, heading: 135, engine_on: false, fuel_level: 83.7, odometer: 134500, last_update: new Date().toISOString(), driver_name: "Sugeng Priyanto" },
  { id: 19, plate_number: "B 5500 TUV", vehicle_type: "truck", brand: "Isuzu", model: "Elf NLR 55 BLX", year: 2021, status: "driving", speed: 39.4, latitude: -6.1900, longitude: 106.8100, heading: 250, engine_on: true, fuel_level: 44.6, odometer: 189200, last_update: new Date().toISOString(), driver_name: "Teguh Waluyo" },
  { id: 20, plate_number: "D 6600 WXY", vehicle_type: "truck", brand: "Hino", model: "Dutro 110 LD", year: 2020, status: "offline", speed: 0, latitude: -6.9000, longitude: 107.6500, heading: 0, engine_on: false, fuel_level: 15.2, odometer: 425600, last_update: new Date(Date.now() - 86400000).toISOString(), driver_name: "Umar Faruq" },
  { id: 21, plate_number: "B 7700 ZAB", vehicle_type: "truck", brand: "UD Trucks", model: "Kuzer RKE 150", year: 2023, status: "driving", speed: 76.3, latitude: -6.2750, longitude: 106.7100, heading: 190, engine_on: true, fuel_level: 62.8, odometer: 42100, last_update: new Date().toISOString(), driver_name: null },
  { id: 22, plate_number: "L 8800 CDE", vehicle_type: "truck", brand: "Hino", model: "500 FG 235 JP", year: 2022, status: "stopped", speed: 0, latitude: -7.3000, longitude: 112.6900, heading: 45, engine_on: false, fuel_level: 56.9, odometer: 156700, last_update: new Date().toISOString(), driver_name: null },
  { id: 23, plate_number: "B 9900 FGH", vehicle_type: "pickup", brand: "Mitsubishi", model: "Triton DC HDX 4x4", year: 2023, status: "driving", speed: 52.1, latitude: -6.2300, longitude: 106.8700, heading: 340, engine_on: true, fuel_level: 79.3, odometer: 18500, last_update: new Date().toISOString(), driver_name: null },
  { id: 24, plate_number: "H 1010 IJK", vehicle_type: "truck", brand: "Isuzu", model: "Giga FVR 34 P", year: 2021, status: "stopped", speed: 0, latitude: -6.9900, longitude: 110.4800, heading: 270, engine_on: false, fuel_level: 38.4, odometer: 267800, last_update: new Date().toISOString(), driver_name: null },
  { id: 25, plate_number: "B 2020 LMN", vehicle_type: "truck", brand: "Mercedes-Benz", model: "Axor 2528 R", year: 2022, status: "idle", speed: 0, latitude: -6.3200, longitude: 107.1200, heading: 180, engine_on: true, fuel_level: 47.1, odometer: 112400, last_update: new Date().toISOString(), driver_name: null },
];

export const MOCK_STATS = {
  total_vehicles: 25,
  driving: MOCK_VEHICLES.filter((v) => v.status === "driving").length,
  idle: MOCK_VEHICLES.filter((v) => v.status === "idle").length,
  stopped: MOCK_VEHICLES.filter((v) => v.status === "stopped").length,
  offline: MOCK_VEHICLES.filter((v) => v.status === "offline").length,
  total_drivers: 20,
  avg_speed: Math.round(MOCK_VEHICLES.filter((v) => v.status === "driving").reduce((sum, v) => sum + v.speed, 0) / MOCK_VEHICLES.filter((v) => v.status === "driving").length * 10) / 10,
  alerts: 3,
};

/* ─── Extended mock: MapVehicle (with interpolated positions) ─────────────── */
export function toMapVehicle(v: Vehicle): MapVehicle {
  return {
    ...v,
    displayLng: v.longitude ?? 0,
    displayLat: v.latitude ?? 0,
    displayHeading: v.heading,
    displayStatus: v.status as MapVehicle["displayStatus"],
    taskLabel: getTaskLabel(v.id),
    routePlanned: VEHICLE_ROUTES[v.id]?.planned,
    routeActual: VEHICLE_ROUTES[v.id]?.actual,
    deviationPoints: VEHICLE_ROUTES[v.id]?.deviation,
  };
}

function getTaskLabel(id: number): string | undefined {
  const labels: Record<number, string> = {
    1: "[PLI - DEPOK]",
    2: "[BDG - BEKASI]",
    4: "[SMG - SOLO]",
    6: "[TSM - BGR]",
    8: "[CKG - JKT]",
    13: "[BKS - JKT]",
    15: "[KTA - JKT]",
    17: "[PWT - JKT]",
    19: "[MLG - JKT]",
    21: "[DPK - JKT]",
    23: "[CLG - JKT]",
  };
  return labels[id];
}

/* ─── Route data per vehicle ─────────────────────────────────────────────── */
interface VehicleRoute {
  planned: LngLat[];
  actual: LngLat[];
  deviation: LngLat[];
}

export const VEHICLE_ROUTES: Record<number, VehicleRoute> = {
  1: {
    planned: [
      { lng: 106.8825, lat: -6.4021 },
      { lng: 106.8440, lat: -6.3038 },
      { lng: 106.8456, lat: -6.2088 },
      { lng: 106.9911, lat: -6.1432 },
      { lng: 106.9178, lat: -6.2356 },
      { lng: 106.8305, lat: -6.4021 },
    ],
    actual: [
      { lng: 106.8825, lat: -6.4021 },
      { lng: 106.8500, lat: -6.3600 },
      { lng: 106.8440, lat: -6.3038 },
      { lng: 106.8456, lat: -6.2088 },
    ],
    deviation: [{ lng: 106.8456, lat: -6.2530 }],
  },
  2: {
    planned: [
      { lng: 107.1514, lat: -6.3020 },
      { lng: 107.0200, lat: -6.2400 },
      { lng: 106.8800, lat: -6.2000 },
      { lng: 106.7600, lat: -6.1800 },
      { lng: 106.6500, lat: -6.1500 },
    ],
    actual: [
      { lng: 107.1514, lat: -6.3020 },
      { lng: 107.0200, lat: -6.2400 },
    ],
    deviation: [],
  },
  4: {
    planned: [
      { lng: 110.4196, lat: -6.9666 },
      { lng: 110.3000, lat: -7.0100 },
      { lng: 110.1500, lat: -7.0800 },
      { lng: 110.0500, lat: -7.1500 },
      { lng: 110.4196, lat: -7.5756 },
    ],
    actual: [
      { lng: 110.4196, lat: -6.9666 },
      { lng: 110.3000, lat: -7.0100 },
      { lng: 110.1500, lat: -7.0800 },
    ],
    deviation: [{ lng: 110.2000, lat: -7.0150 }],
  },
  6: {
    planned: [
      { lng: 108.5523, lat: -6.7320 },
      { lng: 108.4000, lat: -6.6000 },
      { lng: 108.2000, lat: -6.4500 },
      { lng: 108.0000, lat: -6.3500 },
      { lng: 106.8500, lat: -6.2088 },
    ],
    actual: [
      { lng: 108.5523, lat: -6.7320 },
      { lng: 108.4000, lat: -6.6000 },
    ],
    deviation: [],
  },
  8: {
    planned: [
      { lng: 106.9020, lat: -6.1850 },
      { lng: 106.8700, lat: -6.2000 },
      { lng: 106.8000, lat: -6.2100 },
      { lng: 106.7200, lat: -6.1800 },
      { lng: 106.6500, lat: -6.1500 },
    ],
    actual: [
      { lng: 106.9020, lat: -6.1850 },
      { lng: 106.8700, lat: -6.2000 },
    ],
    deviation: [],
  },
};

/* ─── Task info (TRAMOS §8.7 pattern) ──────────────────────────────────── */
export const MOCK_TASKS: Record<number, TaskInfo> = {
  1: {
    taskRef: "5410297202",
    taskName: "PLI - DEPOK",
    scheduleStart: "2026-06-20 08:00",
    scheduleEnd: "2026-06-20 18:00",
    vehiclePlate: "B 1234 KJT",
    vehicleBrand: "Hino Ranger FL 235 JW",
    driverName: "Ahmad Sudirman",
    trips: [
      {
        tripName: "PLI - DEPOK",
        tripType: "Main Task",
        origin: "PTT PLI",
        destination: "DC DEPOK",
        distance: 23.4,
        status: "Progress",
      },
    ],
  },
  2: {
    taskRef: "5410297203",
    taskName: "BDG - BEKASI",
    scheduleStart: "2026-06-20 07:00",
    scheduleEnd: "2026-06-20 16:00",
    vehiclePlate: "B 5678 TGP",
    vehicleBrand: "Mitsubishi Colt Diesel FE 74 HD",
    driverName: "Budi Santoso",
    trips: [
      {
        tripName: "BDG2 - BEKASI",
        tripType: "Pre Task",
        origin: "PTT BDG2",
        destination: "DC BEKASI",
        distance: 124.85,
        status: "Progress",
      },
    ],
  },
};

/* ─── Route markers per vehicle ──────────────────────────────────────────── */
export function getRouteMarkers(vehicleId: number): RouteMarker[] {
  const route = VEHICLE_ROUTES[vehicleId];
  if (!route || route.planned.length < 2) return [];
  const task = MOCK_TASKS[vehicleId];
  return [
    { type: "start", label: task?.trips[0].origin ?? "Origin", coord: route.planned[0] },
    { type: "end", label: task?.trips[0].destination ?? "Destination", coord: route.planned[route.planned.length - 1] },
  ];
}

/* ─── Telemetry update generator (for WebSocket simulation) ──────────────── */
export function generateTelemetryUpdate(vehicle: Vehicle): TelemetryUpdate {
  const drift = () => (Math.random() - 0.5) * 0.001;
  return {
    vehicle_id: vehicle.id,
    plate_number: vehicle.plate_number,
    latitude: (vehicle.latitude ?? 0) + drift(),
    longitude: (vehicle.longitude ?? 0) + drift(),
    speed: vehicle.status === "driving" ? Math.max(30, vehicle.speed + (Math.random() - 0.5) * 10) : vehicle.speed,
    heading: (vehicle.heading + (Math.random() - 0.5) * 5 + 360) % 360,
    status: vehicle.status,
    engine_on: vehicle.engine_on,
    fuel_level: Math.max(0, vehicle.fuel_level - Math.random() * 0.1),
    last_update: new Date().toISOString(),
  };
}
