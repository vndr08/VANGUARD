import { FLEET_VEHICLES } from "@/lib/fleet-data";

export type OperationalTaskStatus =
  | "waiting"
  | "assigned"
  | "progress"
  | "unloading"
  | "completed"
  | "cancelled";

export type OperationalTripStatus =
  | "planned"
  | "progress"
  | "unloading"
  | "completed"
  | "cancelled";

export interface RouteStop {
  name: string;
  latitude: number;
  longitude: number;
}

export interface TripTrackPoint {
  recordedAt: string;
  latitude: number;
  longitude: number;
  heading: number;
  speedKph: number;
  state: "driving" | "idle" | "stopped";
}

export interface OperationalTask {
  id: `task-${string}`;
  reference: string;
  vehicleId: number;
  primaryTripId: `trip-${string}`;
  name: string;
  group: string;
  status: OperationalTaskStatus;
  plannedStartAt: string;
  plannedEndAt: string;
  actualStartAt: string | null;
  actualEndAt: string | null;
  createdAt: string;
}

export interface OperationalTrip {
  id: `trip-${string}`;
  taskId: OperationalTask["id"];
  vehicleId: number;
  type: "pre-trip" | "main-trip" | "return";
  status: OperationalTripStatus;
  origin: RouteStop;
  destination: RouteStop;
  plannedDepartureAt: string;
  plannedArrivalAt: string;
  actualDepartureAt: string | null;
  actualArrivalAt: string | null;
  distanceKm: number;
  traveledKm: number;
  averageSpeedKph: number | null;
  track: TripTrackPoint[];
}

type OperationalEventType =
  | "assigned"
  | "departed"
  | "geofence-entered"
  | "geofence-exited"
  | "delayed"
  | "arrived"
  | "unloading-started"
  | "completed";

interface OperationalEventBase {
  id: `event-${string}`;
  taskId: OperationalTask["id"];
  tripId: OperationalTrip["id"];
  vehicleId: number;
  occurredAt: string;
  location?: RouteStop;
}

export type OperationalEvent = OperationalEventBase &
  (
    | {
        type: "delayed";
        payload: { kind: "delay"; delayMinutes: number };
      }
    | {
        type: Exclude<OperationalEventType, "delayed">;
        payload?: never;
      }
  );

export interface OperationsDataset {
  referenceTimeMs: number;
  tasks: OperationalTask[];
  trips: OperationalTrip[];
  events: OperationalEvent[];
}

export const OPERATIONS_REFERENCE_TIME_MS = Date.UTC(2026, 5, 20, 12, 0, 0);

const hour = 60 * 60 * 1000;
const minute = 60 * 1000;
const ACTIVE_LIFECYCLE_STATUSES = new Set<OperationalTaskStatus>([
  "waiting",
  "assigned",
  "progress",
  "unloading",
]);

function at(referenceTimeMs: number, offsetMs: number): string {
  return new Date(referenceTimeMs + offsetMs).toISOString();
}

function stop(name: string, latitude: number, longitude: number): RouteStop {
  return { name, latitude, longitude };
}

function track(
  referenceTimeMs: number,
  points: Array<[number, number, number, number, number]>
): TripTrackPoint[] {
  return points.map(([offsetMs, latitude, longitude, heading, speedKph], index) => ({
    recordedAt: at(referenceTimeMs, offsetMs),
    latitude,
    longitude,
    heading,
    speedKph,
    state: index === points.length - 1 && speedKph === 0 ? "stopped" : "driving",
  }));
}

export function createOperationsDataset(referenceTimeMs: number): OperationsDataset {
  if (!Number.isFinite(referenceTimeMs)) {
    throw new Error("referenceTimeMs must be finite");
  }

  const tasks: OperationalTask[] = [
    { id: "task-001", reference: "OPS-2026-001", vehicleId: 1, primaryTripId: "trip-001", name: "Jakarta - Bekasi", group: "Distribusi Jabodetabek", status: "progress", plannedStartAt: at(referenceTimeMs, -5 * hour), plannedEndAt: at(referenceTimeMs, hour), actualStartAt: at(referenceTimeMs, -5 * hour + 10 * minute), actualEndAt: null, createdAt: at(referenceTimeMs, -7 * hour) },
    { id: "task-002", reference: "OPS-2026-002", vehicleId: 2, primaryTripId: "trip-002", name: "Bekasi - Tangerang", group: "Distribusi Jabodetabek", status: "progress", plannedStartAt: at(referenceTimeMs, -4 * hour), plannedEndAt: at(referenceTimeMs, -30 * minute), actualStartAt: at(referenceTimeMs, -4 * hour + 15 * minute), actualEndAt: null, createdAt: at(referenceTimeMs, -6 * hour) },
    { id: "task-003", reference: "OPS-2026-003", vehicleId: 3, primaryTripId: "trip-003", name: "Bandung - Cimahi", group: "Distribusi Jawa Barat", status: "unloading", plannedStartAt: at(referenceTimeMs, -3 * hour), plannedEndAt: at(referenceTimeMs, -20 * minute), actualStartAt: at(referenceTimeMs, -3 * hour + 5 * minute), actualEndAt: null, createdAt: at(referenceTimeMs, -5 * hour) },
    { id: "task-004", reference: "OPS-2026-004", vehicleId: 4, primaryTripId: "trip-004", name: "Semarang - Solo", group: "Distribusi Jawa Tengah", status: "completed", plannedStartAt: at(referenceTimeMs, -7 * hour), plannedEndAt: at(referenceTimeMs, -2 * hour), actualStartAt: at(referenceTimeMs, -7 * hour + 5 * minute), actualEndAt: at(referenceTimeMs, -2 * hour - 15 * minute), createdAt: at(referenceTimeMs, -9 * hour) },
    { id: "task-005", reference: "OPS-2026-005", vehicleId: 6, primaryTripId: "trip-005", name: "Cirebon - Bogor", group: "Distribusi Jawa Barat", status: "completed", plannedStartAt: at(referenceTimeMs, -8 * hour), plannedEndAt: at(referenceTimeMs, -3 * hour), actualStartAt: at(referenceTimeMs, -8 * hour + 10 * minute), actualEndAt: at(referenceTimeMs, -2 * hour - 40 * minute), createdAt: at(referenceTimeMs, -10 * hour) },
    { id: "task-006", reference: "OPS-2026-006", vehicleId: 8, primaryTripId: "trip-006", name: "Jakarta - Serang", group: "Distribusi Banten", status: "assigned", plannedStartAt: at(referenceTimeMs, 30 * minute), plannedEndAt: at(referenceTimeMs, 5 * hour), actualStartAt: null, actualEndAt: null, createdAt: at(referenceTimeMs, -hour) },
    { id: "task-007", reference: "OPS-2026-007", vehicleId: 5, primaryTripId: "trip-007", name: "Surabaya - Gresik", group: "Distribusi Jawa Timur", status: "waiting", plannedStartAt: at(referenceTimeMs, hour), plannedEndAt: at(referenceTimeMs, 6 * hour), actualStartAt: null, actualEndAt: null, createdAt: at(referenceTimeMs, -50 * minute) },
    { id: "task-008", reference: "OPS-2026-008", vehicleId: 7, primaryTripId: "trip-008", name: "Karawang - Cikarang", group: "Distribusi Jabodetabek", status: "progress", plannedStartAt: at(referenceTimeMs, -2 * hour), plannedEndAt: at(referenceTimeMs, 2 * hour), actualStartAt: at(referenceTimeMs, -2 * hour + 10 * minute), actualEndAt: null, createdAt: at(referenceTimeMs, -3 * hour) },
    { id: "task-009", reference: "OPS-2026-009", vehicleId: 9, primaryTripId: "trip-009", name: "Jakarta Barat - Depok", group: "Distribusi Jabodetabek", status: "assigned", plannedStartAt: at(referenceTimeMs, 45 * minute), plannedEndAt: at(referenceTimeMs, 4 * hour), actualStartAt: null, actualEndAt: null, createdAt: at(referenceTimeMs, -40 * minute) },
    { id: "task-010", reference: "OPS-2026-010", vehicleId: 10, primaryTripId: "trip-010", name: "Surabaya - Sidoarjo", group: "Distribusi Jawa Timur", status: "completed", plannedStartAt: at(referenceTimeMs, -5 * hour), plannedEndAt: at(referenceTimeMs, -hour), actualStartAt: at(referenceTimeMs, -5 * hour + 5 * minute), actualEndAt: at(referenceTimeMs, -70 * minute), createdAt: at(referenceTimeMs, -6 * hour) },
    { id: "task-011", reference: "OPS-2026-011", vehicleId: 11, primaryTripId: "trip-011", name: "Jakarta Pusat - Cengkareng", group: "Distribusi Jabodetabek", status: "unloading", plannedStartAt: at(referenceTimeMs, -3 * hour), plannedEndAt: at(referenceTimeMs, 15 * minute), actualStartAt: at(referenceTimeMs, -3 * hour + 10 * minute), actualEndAt: null, createdAt: at(referenceTimeMs, -4 * hour) },
    { id: "task-012", reference: "OPS-2026-012", vehicleId: 12, primaryTripId: "trip-012", name: "Semarang - Salatiga", group: "Distribusi Jawa Tengah", status: "assigned", plannedStartAt: at(referenceTimeMs, 2 * hour), plannedEndAt: at(referenceTimeMs, 7 * hour), actualStartAt: null, actualEndAt: null, createdAt: at(referenceTimeMs, -30 * minute) },
    { id: "task-013", reference: "OPS-2026-013", vehicleId: 13, primaryTripId: "trip-013", name: "Jakarta - Bogor", group: "Distribusi Jabodetabek", status: "progress", plannedStartAt: at(referenceTimeMs, -3 * hour), plannedEndAt: at(referenceTimeMs, 90 * minute), actualStartAt: at(referenceTimeMs, -3 * hour + 10 * minute), actualEndAt: null, createdAt: at(referenceTimeMs, -4 * hour) },
    { id: "task-014", reference: "OPS-2026-014", vehicleId: 14, primaryTripId: "trip-014", name: "Bandung - Garut", group: "Distribusi Jawa Barat", status: "completed", plannedStartAt: at(referenceTimeMs, -6 * hour), plannedEndAt: at(referenceTimeMs, -3 * hour), actualStartAt: at(referenceTimeMs, -6 * hour + 10 * minute), actualEndAt: at(referenceTimeMs, -2 * hour), createdAt: at(referenceTimeMs, -7 * hour) },
    { id: "task-015", reference: "OPS-2026-015", vehicleId: 20, primaryTripId: "trip-015", name: "Bandung - Purwakarta", group: "Distribusi Jawa Barat", status: "waiting", plannedStartAt: at(referenceTimeMs, 3 * hour), plannedEndAt: at(referenceTimeMs, 8 * hour), actualStartAt: null, actualEndAt: null, createdAt: at(referenceTimeMs, -20 * minute) },
  ];

  const trips: OperationalTrip[] = [
    { id: "trip-001", taskId: "task-001", vehicleId: 1, type: "main-trip", status: "progress", origin: stop("Jakarta Hub", -6.2088, 106.8456), destination: stop("Bekasi DC", -6.2339, 106.992), plannedDepartureAt: at(referenceTimeMs, -5 * hour), plannedArrivalAt: at(referenceTimeMs, hour), actualDepartureAt: at(referenceTimeMs, -5 * hour + 10 * minute), actualArrivalAt: null, distanceKm: 31.4, traveledKm: 22.8, averageSpeedKph: 46, track: track(referenceTimeMs, [[-5 * hour + 10 * minute, -6.2088, 106.8456, 80, 0], [-3 * hour, -6.22, 106.91, 82, 43], [-30 * minute, -6.228, 106.97, 84, 38]]) },
    { id: "trip-002", taskId: "task-002", vehicleId: 2, type: "main-trip", status: "progress", origin: stop("Bekasi DC", -6.2339, 106.992), destination: stop("Tangerang Hub", -6.178, 106.63), plannedDepartureAt: at(referenceTimeMs, -4 * hour), plannedArrivalAt: at(referenceTimeMs, -30 * minute), actualDepartureAt: at(referenceTimeMs, -4 * hour + 15 * minute), actualArrivalAt: null, distanceKm: 54.2, traveledKm: 47.6, averageSpeedKph: 39, track: track(referenceTimeMs, [[-4 * hour + 15 * minute, -6.2339, 106.992, 265, 0], [-2 * hour, -6.2, 106.81, 270, 51], [-10 * minute, -6.185, 106.67, 275, 27]]) },
    { id: "trip-003", taskId: "task-003", vehicleId: 3, type: "main-trip", status: "unloading", origin: stop("Bandung DC", -6.9175, 107.6191), destination: stop("Cimahi Hub", -6.8722, 107.5425), plannedDepartureAt: at(referenceTimeMs, -3 * hour), plannedArrivalAt: at(referenceTimeMs, -20 * minute), actualDepartureAt: at(referenceTimeMs, -3 * hour + 5 * minute), actualArrivalAt: at(referenceTimeMs, -10 * minute), distanceKm: 14.8, traveledKm: 14.8, averageSpeedKph: 31, track: track(referenceTimeMs, [[-3 * hour + 5 * minute, -6.9175, 107.6191, 300, 0], [-hour, -6.89, 107.57, 305, 35], [-10 * minute, -6.8722, 107.5425, 305, 0]]) },
    { id: "trip-004", taskId: "task-004", vehicleId: 4, type: "main-trip", status: "completed", origin: stop("Semarang Hub", -6.9666, 110.4196), destination: stop("Solo DC", -7.5755, 110.8243), plannedDepartureAt: at(referenceTimeMs, -7 * hour), plannedArrivalAt: at(referenceTimeMs, -2 * hour), actualDepartureAt: at(referenceTimeMs, -7 * hour + 5 * minute), actualArrivalAt: at(referenceTimeMs, -2 * hour - 15 * minute), distanceKm: 108.6, traveledKm: 108.6, averageSpeedKph: 48, track: track(referenceTimeMs, [[-7 * hour + 5 * minute, -6.9666, 110.4196, 145, 0], [-4 * hour, -7.25, 110.61, 150, 56], [-2 * hour - 15 * minute, -7.5755, 110.8243, 150, 0]]) },
    { id: "trip-005", taskId: "task-005", vehicleId: 6, type: "main-trip", status: "completed", origin: stop("Cirebon Hub", -6.732, 108.5523), destination: stop("Bogor DC", -6.595, 106.8166), plannedDepartureAt: at(referenceTimeMs, -8 * hour), plannedArrivalAt: at(referenceTimeMs, -3 * hour), actualDepartureAt: at(referenceTimeMs, -8 * hour + 10 * minute), actualArrivalAt: at(referenceTimeMs, -2 * hour - 40 * minute), distanceKm: 212.3, traveledKm: 212.3, averageSpeedKph: 44, track: track(referenceTimeMs, [[-8 * hour + 10 * minute, -6.732, 108.5523, 275, 0], [-5 * hour, -6.61, 107.68, 280, 52], [-2 * hour - 40 * minute, -6.595, 106.8166, 280, 0]]) },
    { id: "trip-006", taskId: "task-006", vehicleId: 8, type: "main-trip", status: "planned", origin: stop("Jakarta Hub", -6.185, 106.902), destination: stop("Serang DC", -6.12, 106.15), plannedDepartureAt: at(referenceTimeMs, 30 * minute), plannedArrivalAt: at(referenceTimeMs, 5 * hour), actualDepartureAt: null, actualArrivalAt: null, distanceKm: 87.5, traveledKm: 0, averageSpeedKph: null, track: [] },
    { id: "trip-007", taskId: "task-007", vehicleId: 5, type: "main-trip", status: "planned", origin: stop("Surabaya Hub", -7.2575, 112.7521), destination: stop("Gresik DC", -7.1568, 112.6561), plannedDepartureAt: at(referenceTimeMs, hour), plannedArrivalAt: at(referenceTimeMs, 6 * hour), actualDepartureAt: null, actualArrivalAt: null, distanceKm: 31.6, traveledKm: 0, averageSpeedKph: null, track: [] },
    { id: "trip-008", taskId: "task-008", vehicleId: 7, type: "main-trip", status: "progress", origin: stop("Karawang Hub", -6.3106, 107.3383), destination: stop("Cikarang DC", -6.2885, 107.1724), plannedDepartureAt: at(referenceTimeMs, -2 * hour), plannedArrivalAt: at(referenceTimeMs, 2 * hour), actualDepartureAt: at(referenceTimeMs, -2 * hour + 10 * minute), actualArrivalAt: null, distanceKm: 29.8, traveledKm: 18.2, averageSpeedKph: 38, track: track(referenceTimeMs, [[-2 * hour + 10 * minute, -6.3106, 107.3383, 270, 0], [-hour, -6.3, 107.26, 268, 41], [-12 * minute, -6.292, 107.21, 267, 34]]) },
    { id: "trip-009", taskId: "task-009", vehicleId: 9, type: "main-trip", status: "planned", origin: stop("Jakarta Barat Hub", -6.265, 106.78), destination: stop("Depok DC", -6.4025, 106.7942), plannedDepartureAt: at(referenceTimeMs, 45 * minute), plannedArrivalAt: at(referenceTimeMs, 4 * hour), actualDepartureAt: null, actualArrivalAt: null, distanceKm: 27.4, traveledKm: 0, averageSpeedKph: null, track: [] },
    { id: "trip-010", taskId: "task-010", vehicleId: 10, type: "main-trip", status: "completed", origin: stop("Surabaya Hub", -7.28, 112.72), destination: stop("Sidoarjo DC", -7.4478, 112.7183), plannedDepartureAt: at(referenceTimeMs, -5 * hour), plannedArrivalAt: at(referenceTimeMs, -hour), actualDepartureAt: at(referenceTimeMs, -5 * hour + 5 * minute), actualArrivalAt: at(referenceTimeMs, -70 * minute), distanceKm: 24.8, traveledKm: 24.8, averageSpeedKph: 42, track: track(referenceTimeMs, [[-5 * hour + 5 * minute, -7.28, 112.72, 180, 0], [-3 * hour, -7.35, 112.72, 180, 45], [-70 * minute, -7.4478, 112.7183, 180, 0]]) },
    { id: "trip-011", taskId: "task-011", vehicleId: 11, type: "main-trip", status: "unloading", origin: stop("Jakarta Pusat Hub", -6.22, 106.88), destination: stop("Cengkareng DC", -6.137, 106.735), plannedDepartureAt: at(referenceTimeMs, -3 * hour), plannedArrivalAt: at(referenceTimeMs, 15 * minute), actualDepartureAt: at(referenceTimeMs, -3 * hour + 10 * minute), actualArrivalAt: at(referenceTimeMs, -5 * minute), distanceKm: 25.2, traveledKm: 25.2, averageSpeedKph: 29, track: track(referenceTimeMs, [[-3 * hour + 10 * minute, -6.22, 106.88, 300, 0], [-hour, -6.17, 106.8, 300, 36], [-5 * minute, -6.137, 106.735, 300, 0]]) },
    { id: "trip-012", taskId: "task-012", vehicleId: 12, type: "main-trip", status: "planned", origin: stop("Semarang Hub", -6.98, 110.45), destination: stop("Salatiga DC", -7.3319, 110.493), plannedDepartureAt: at(referenceTimeMs, 2 * hour), plannedArrivalAt: at(referenceTimeMs, 7 * hour), actualDepartureAt: null, actualArrivalAt: null, distanceKm: 49.7, traveledKm: 0, averageSpeedKph: null, track: [] },
    { id: "trip-013", taskId: "task-013", vehicleId: 13, type: "main-trip", status: "progress", origin: stop("Jakarta Hub", -6.175, 106.827), destination: stop("Bogor Hub", -6.595, 106.8166), plannedDepartureAt: at(referenceTimeMs, -3 * hour), plannedArrivalAt: at(referenceTimeMs, 90 * minute), actualDepartureAt: at(referenceTimeMs, -3 * hour + 10 * minute), actualArrivalAt: null, distanceKm: 61.4, traveledKm: 35.9, averageSpeedKph: 43, track: track(referenceTimeMs, [[-3 * hour + 10 * minute, -6.175, 106.827, 180, 0], [-hour, -6.36, 106.82, 182, 47], [-8 * minute, -6.49, 106.818, 182, 39]]) },
    { id: "trip-014", taskId: "task-014", vehicleId: 14, type: "main-trip", status: "completed", origin: stop("Bandung Hub", -6.93, 107.58), destination: stop("Garut DC", -7.2279, 107.9087), plannedDepartureAt: at(referenceTimeMs, -6 * hour), plannedArrivalAt: at(referenceTimeMs, -3 * hour), actualDepartureAt: at(referenceTimeMs, -6 * hour + 10 * minute), actualArrivalAt: at(referenceTimeMs, -2 * hour), distanceKm: 58.4, traveledKm: 58.4, averageSpeedKph: 39, track: track(referenceTimeMs, [[-6 * hour + 10 * minute, -6.93, 107.58, 135, 0], [-4 * hour, -7.08, 107.74, 135, 44], [-2 * hour, -7.2279, 107.9087, 135, 0]]) },
    { id: "trip-015", taskId: "task-015", vehicleId: 20, type: "main-trip", status: "planned", origin: stop("Bandung Hub", -6.9, 107.65), destination: stop("Purwakarta DC", -6.5569, 107.4432), plannedDepartureAt: at(referenceTimeMs, 3 * hour), plannedArrivalAt: at(referenceTimeMs, 8 * hour), actualDepartureAt: null, actualArrivalAt: null, distanceKm: 65.3, traveledKm: 0, averageSpeedKph: null, track: [] },
  ];

  const events: OperationalEvent[] = [
    { id: "event-001", taskId: "task-001", tripId: "trip-001", vehicleId: 1, type: "assigned", occurredAt: at(referenceTimeMs, -6 * hour) },
    { id: "event-002", taskId: "task-001", tripId: "trip-001", vehicleId: 1, type: "departed", occurredAt: at(referenceTimeMs, -5 * hour + 10 * minute), location: stop("Jakarta Hub", -6.2088, 106.8456) },
    { id: "event-003", taskId: "task-002", tripId: "trip-002", vehicleId: 2, type: "delayed", occurredAt: at(referenceTimeMs, -30 * minute), location: stop("Tangerang", -6.185, 106.67), payload: { kind: "delay", delayMinutes: 30 } },
    { id: "event-004", taskId: "task-003", tripId: "trip-003", vehicleId: 3, type: "arrived", occurredAt: at(referenceTimeMs, -10 * minute), location: stop("Cimahi Hub", -6.8722, 107.5425) },
    { id: "event-005", taskId: "task-003", tripId: "trip-003", vehicleId: 3, type: "unloading-started", occurredAt: at(referenceTimeMs, -8 * minute), location: stop("Cimahi Hub", -6.8722, 107.5425) },
    { id: "event-006", taskId: "task-004", tripId: "trip-004", vehicleId: 4, type: "completed", occurredAt: at(referenceTimeMs, -2 * hour - 15 * minute), location: stop("Solo DC", -7.5755, 110.8243) },
    { id: "event-007", taskId: "task-005", tripId: "trip-005", vehicleId: 6, type: "delayed", occurredAt: at(referenceTimeMs, -3 * hour), location: stop("Bogor", -6.595, 106.8166), payload: { kind: "delay", delayMinutes: 20 } },
    { id: "event-008", taskId: "task-005", tripId: "trip-005", vehicleId: 6, type: "completed", occurredAt: at(referenceTimeMs, -2 * hour - 40 * minute), location: stop("Bogor DC", -6.595, 106.8166) },
    { id: "event-009", taskId: "task-006", tripId: "trip-006", vehicleId: 8, type: "assigned", occurredAt: at(referenceTimeMs, -45 * minute) },
    { id: "event-010", taskId: "task-007", tripId: "trip-007", vehicleId: 5, type: "assigned", occurredAt: at(referenceTimeMs, -50 * minute) },
    { id: "event-011", taskId: "task-008", tripId: "trip-008", vehicleId: 7, type: "departed", occurredAt: at(referenceTimeMs, -2 * hour + 10 * minute), location: stop("Karawang Hub", -6.3106, 107.3383) },
    { id: "event-012", taskId: "task-010", tripId: "trip-010", vehicleId: 10, type: "completed", occurredAt: at(referenceTimeMs, -70 * minute), location: stop("Sidoarjo DC", -7.4478, 112.7183) },
    { id: "event-013", taskId: "task-011", tripId: "trip-011", vehicleId: 11, type: "unloading-started", occurredAt: at(referenceTimeMs, -4 * minute), location: stop("Cengkareng DC", -6.137, 106.735) },
    { id: "event-014", taskId: "task-013", tripId: "trip-013", vehicleId: 13, type: "departed", occurredAt: at(referenceTimeMs, -3 * hour + 10 * minute), location: stop("Jakarta Hub", -6.175, 106.827) },
    { id: "event-015", taskId: "task-014", tripId: "trip-014", vehicleId: 14, type: "completed", occurredAt: at(referenceTimeMs, -2 * hour), location: stop("Garut DC", -7.2279, 107.9087) },
    { id: "event-016", taskId: "task-015", tripId: "trip-015", vehicleId: 20, type: "assigned", occurredAt: at(referenceTimeMs, -20 * minute) },
  ];

  const dataset = { referenceTimeMs, tasks, trips, events };
  assertOperationsIntegrity(dataset);
  return dataset;
}

function assertUniqueIds(collection: Array<{ id: string }>, label: string): void {
  const ids = new Set(collection.map((entity) => entity.id));
  if (ids.size !== collection.length) throw new Error(`${label} IDs must be unique`);
}

export function assertOperationsIntegrity(dataset: OperationsDataset): void {
  assertUniqueIds(dataset.tasks, "Task");
  assertUniqueIds(dataset.trips, "Trip");
  assertUniqueIds(dataset.events, "Event");
  assertUniqueIds([...dataset.tasks, ...dataset.trips, ...dataset.events], "Entity");

  const vehicleIds = new Set(FLEET_VEHICLES.map((vehicle) => vehicle.id));
  const taskById = new Map(dataset.tasks.map((task) => [task.id, task]));
  const tripById = new Map(dataset.trips.map((trip) => [trip.id, trip]));

  for (const task of dataset.tasks) {
    const trip = tripById.get(task.primaryTripId);
    if (!trip) throw new Error(`${task.id} primary trip is missing`);
    if (trip.taskId !== task.id) throw new Error(`${task.id} primary trip points to another task`);
    if (trip.vehicleId !== task.vehicleId) throw new Error(`${task.id} vehicle differs from primary trip`);
    if (!vehicleIds.has(task.vehicleId)) throw new Error(`${task.id} vehicle is missing`);
    if (Date.parse(task.plannedStartAt) > Date.parse(task.plannedEndAt)) {
      throw new Error(`${task.id} planned lifecycle is invalid`);
    }
    if (task.actualStartAt && task.actualEndAt && Date.parse(task.actualStartAt) > Date.parse(task.actualEndAt)) {
      throw new Error(`${task.id} actual lifecycle is invalid`);
    }
    if (task.status === "completed" && (!task.actualStartAt || !task.actualEndAt)) {
      throw new Error(`${task.id} completed lifecycle is incomplete`);
    }
    if (ACTIVE_LIFECYCLE_STATUSES.has(task.status) && task.actualEndAt) {
      throw new Error(`${task.id} active lifecycle has an end timestamp`);
    }
  }

  for (const trip of dataset.trips) {
    const task = taskById.get(trip.taskId);
    if (!task) throw new Error(`${trip.id} task is missing`);
    if (task.vehicleId !== trip.vehicleId) throw new Error(`${trip.id} vehicle differs from task`);
    if (!vehicleIds.has(trip.vehicleId)) throw new Error(`${trip.id} vehicle is missing`);
    if (Date.parse(trip.plannedDepartureAt) > Date.parse(trip.plannedArrivalAt)) {
      throw new Error(`${trip.id} planned lifecycle is invalid`);
    }
    if (trip.actualDepartureAt && trip.actualArrivalAt && Date.parse(trip.actualDepartureAt) > Date.parse(trip.actualArrivalAt)) {
      throw new Error(`${trip.id} actual lifecycle is invalid`);
    }
    if (trip.status === "completed" && (!trip.actualDepartureAt || !trip.actualArrivalAt)) {
      throw new Error(`${trip.id} completed lifecycle is incomplete`);
    }
    const lowerBound = Date.parse(trip.actualDepartureAt ?? trip.plannedDepartureAt);
    const upperBound = trip.actualArrivalAt
      ? Date.parse(trip.actualArrivalAt)
      : trip.status === "progress" || trip.status === "unloading"
        ? dataset.referenceTimeMs
        : Date.parse(trip.plannedArrivalAt);
    for (const point of trip.track) {
      const recordedAt = Date.parse(point.recordedAt);
      if (recordedAt < lowerBound || recordedAt > upperBound) {
        throw new Error(`${trip.id} track point is outside trip bounds`);
      }
    }
  }

  for (const event of dataset.events) {
    const task = taskById.get(event.taskId);
    const trip = tripById.get(event.tripId);
    if (!task || !trip) throw new Error(`${event.id} relationship is missing`);
    if (trip.taskId !== task.id || task.vehicleId !== event.vehicleId || trip.vehicleId !== event.vehicleId) {
      throw new Error(`${event.id} relationships are inconsistent`);
    }
  }
}

export const OPERATIONS_DATASET = createOperationsDataset(OPERATIONS_REFERENCE_TIME_MS);
