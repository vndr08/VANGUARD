import type { OperationalTask, OperationalTrip } from "@/lib/operations-data";

export type CameraPosition = "Depan" | "Kabin" | "Belakang";
export type EvidenceStatus = "Tersedia" | "Gagal";

export interface EvidenceSnapshot {
  id: `snapshot-${string}`;
  vehicleId: number;
  taskId: OperationalTask["id"];
  tripId: OperationalTrip["id"];
  incidentId?: number;
  camera: CameraPosition;
  recordedAt: string;
  status: EvidenceStatus;
  event: string;
  location: string;
  imageSrc: string;
}

export interface DashcamArchive {
  id: `archive-${string}`;
  vehicleId: number;
  taskId: OperationalTask["id"];
  tripId: OperationalTrip["id"];
  incidentId?: number;
  videoSrc: string;
}

export const EVIDENCE_SNAPSHOTS: EvidenceSnapshot[] = [
  { id: "snapshot-001", vehicleId: 1, taskId: "task-001", tripId: "trip-001", camera: "Depan", recordedAt: "2026-06-20T09:42:00+07:00", status: "Tersedia", event: "Bukti kedatangan", location: "Jababeka Gate 2, Bekasi", imageSrc: "/media/truck/driver-dashboard.jpg" },
  { id: "snapshot-002", vehicleId: 2, taskId: "task-002", tripId: "trip-002", incidentId: 4, camera: "Depan", recordedAt: "2026-06-20T06:00:00Z", status: "Tersedia", event: "Dokumentasi insiden", location: "Jl. Tol Jakarta-Cikampek KM 35", imageSrc: "/media/truck/driver-wheel.jpg" },
  { id: "snapshot-003", vehicleId: 10, taskId: "task-010", tripId: "trip-010", camera: "Kabin", recordedAt: "2026-06-20T08:51:00+07:00", status: "Tersedia", event: "Berhenti bahan bakar", location: "SPBU Cikampek", imageSrc: "/media/truck/cabin-coffee.jpg" },
  { id: "snapshot-004", vehicleId: 6, taskId: "task-005", tripId: "trip-005", camera: "Belakang", recordedAt: "2026-06-20T08:35:00+07:00", status: "Tersedia", event: "Mesin mati", location: "Rest Area KM 57", imageSrc: "/media/truck/driver-rest.jpg" },
  { id: "snapshot-005", vehicleId: 13, taskId: "task-013", tripId: "trip-013", camera: "Depan", recordedAt: "2026-06-20T07:58:00+07:00", status: "Tersedia", event: "Gerbang pelanggan", location: "Bekasi Timur", imageSrc: "/media/truck/driver-seat.jpeg" },
  { id: "snapshot-006", vehicleId: 7, taskId: "task-008", tripId: "trip-008", camera: "Belakang", recordedAt: "2026-06-20T07:12:00+07:00", status: "Tersedia", event: "Masuk geofence", location: "Gedebage, Bandung", imageSrc: "/media/truck/route-review.jpg" },
  { id: "snapshot-007", vehicleId: 4, taskId: "task-004", tripId: "trip-004", camera: "Kabin", recordedAt: "2026-06-20T06:45:00+07:00", status: "Tersedia", event: "Bukti kedatangan", location: "Rungkut Industrial", imageSrc: "/media/truck/driver-vest.jpg" },
  { id: "snapshot-008", vehicleId: 3, taskId: "task-003", tripId: "trip-003", camera: "Depan", recordedAt: "2026-06-20T06:22:00+07:00", status: "Tersedia", event: "Masuk geofence", location: "Pelabuhan Tanjung Priok", imageSrc: "/media/truck/cabin-entry.jpeg" },
  { id: "snapshot-009", vehicleId: 8, taskId: "task-006", tripId: "trip-006", camera: "Belakang", recordedAt: "2026-06-19T18:10:00+07:00", status: "Tersedia", event: "Keluar geofence", location: "Warehouse Cikarang", imageSrc: "/media/truck/cabin-driver.jpg" },
  { id: "snapshot-010", vehicleId: 14, taskId: "task-014", tripId: "trip-014", camera: "Kabin", recordedAt: "2026-06-19T17:45:00+07:00", status: "Tersedia", event: "Peringatan kecepatan", location: "Tol Cipularang KM 25", imageSrc: "/media/truck/driver-side.jpg" },
  { id: "snapshot-011", vehicleId: 11, taskId: "task-011", tripId: "trip-011", camera: "Depan", recordedAt: "2026-06-19T16:30:00+07:00", status: "Gagal", event: "Kamera offline", location: "Sentul City", imageSrc: "/media/truck/cabin-rest.webp" },
  { id: "snapshot-012", vehicleId: 12, taskId: "task-012", tripId: "trip-012", camera: "Belakang", recordedAt: "2026-06-19T15:05:00+07:00", status: "Tersedia", event: "Bukti pengiriman", location: "Tangerang Logistics Hub", imageSrc: "/media/truck/driver-hivis.jpg" },
];

const DASHCAM_MEDIA = [
  "/media/truck/front-road.webm", "/media/truck/cabin-navigation.webm", "/media/truck/rear-entry.webm",
  "/media/truck/pretrip-paperwork.webm", "/media/truck/navigation-phone.webm", "/media/truck/waiting-coffee.webm",
  "/media/truck/gps-delivery.webm", "/media/truck/route-check.webm", "/media/truck/delivery-list.webm",
  "/media/truck/cabin-cleaning.webm", "/media/truck/cabin-phone.webm", "/media/truck/cabin-paperwork.webm",
] as const;

const ARCHIVE_RELATIONSHIPS: Array<[number, OperationalTask["id"], OperationalTrip["id"], number?]> = [
  [1, "task-001", "trip-001"], [2, "task-002", "trip-002", 4], [3, "task-003", "trip-003"],
  [4, "task-004", "trip-004"], [5, "task-007", "trip-007"], [6, "task-005", "trip-005"],
  [7, "task-008", "trip-008"], [8, "task-006", "trip-006"], [9, "task-009", "trip-009"],
  [10, "task-010", "trip-010"], [11, "task-011", "trip-011"], [12, "task-012", "trip-012"],
  [13, "task-013", "trip-013"], [14, "task-014", "trip-014"], [20, "task-015", "trip-015"],
];

export const DASHCAM_ARCHIVES: DashcamArchive[] = ARCHIVE_RELATIONSHIPS.map(([vehicleId, taskId, tripId, incidentId], index) => ({
  id: `archive-${String(index + 1).padStart(3, "0")}`,
  vehicleId,
  taskId,
  tripId,
  ...(incidentId ? { incidentId } : {}),
  videoSrc: DASHCAM_MEDIA[index % DASHCAM_MEDIA.length],
}));

export function getEvidenceSnapshots(query: { taskId?: string | null; tripId?: string | null; incidentId?: string | number | null }) {
  return EVIDENCE_SNAPSHOTS.filter((snapshot) =>
    (query.taskId == null || snapshot.taskId === query.taskId)
    && (query.tripId == null || snapshot.tripId === query.tripId)
    && (query.incidentId == null || snapshot.incidentId === Number(query.incidentId))
  );
}

export function getDashcamArchive(query: { vehicleId?: number; tripId?: string | null; incidentId?: string | number | null }) {
  return DASHCAM_ARCHIVES.find((archive) =>
    (query.vehicleId == null || archive.vehicleId === query.vehicleId)
    && (query.tripId == null || archive.tripId === query.tripId)
    && (query.incidentId == null || archive.incidentId === Number(query.incidentId))
  );
}
