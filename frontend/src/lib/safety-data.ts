export type ZoneType = "Depot" | "Customer" | "Port" | "Checkpoint";
export type ZoneStatus = "active" | "inactive";
export type ZoneShape = "circle" | "polygon";

export interface GeofenceZone {
  id: string;
  name: string;
  type: ZoneType;
  shape: ZoneShape;
  lat: number;
  lng: number;
  radius: number;
  color: string;
  status: ZoneStatus;
  units: number;
  notes: string;
}

export interface SafetyIncident {
  id: number;
  vehicleId: number;
  driverName: string;
  dateTime: string;
  location: string;
  latitude: number;
  longitude: number;
  type: "Tabrakan" | "Selip" | "Ban Pecah" | "Mogok" | "Lainnya";
  severity: "Ringan" | "Sedang" | "Berat";
  status: "Baru" | "Ditangani" | "Selesai";
  description: string;
  hasVictim: boolean;
  estimatedLoss: number;
}

export const GEOFENCE_ZONES: GeofenceZone[] = [
  { id: "zone-001", name: "Warehouse Cikarang", type: "Depot", shape: "circle", lat: -6.4523, lng: 107.1234, radius: 650, color: "#10B981", status: "active", units: 7, notes: "Gudang utama Cikarang" },
  { id: "zone-002", name: "Jababeka Customer Area", type: "Customer", shape: "circle", lat: -6.4256, lng: 107.1567, radius: 420, color: "#3B82F6", status: "active", units: 4, notes: "Area customer Jababeka" },
  { id: "zone-003", name: "Tanjung Priok Gate 4", type: "Port", shape: "circle", lat: -6.0989, lng: 106.8901, radius: 900, color: "#8B5CF6", status: "active", units: 3, notes: "Gerbang masuk pelabuhan" },
  { id: "zone-004", name: "Rest Area KM57", type: "Checkpoint", shape: "circle", lat: -6.7234, lng: 108.4567, radius: 300, color: "#F59E0B", status: "inactive", units: 2, notes: "Rest area Km57 Tol Cipali" },
  { id: "zone-005", name: "MM2100 Industrial", type: "Customer", shape: "circle", lat: -6.3823, lng: 107.089, radius: 550, color: "#EF4444", status: "active", units: 5, notes: "Kawasan industri MM2100" },
  { id: "zone-006", name: "Sentul City Depot", type: "Depot", shape: "circle", lat: -6.5678, lng: 106.8234, radius: 400, color: "#EC4899", status: "active", units: 3, notes: "Depot Sentul City" },
  { id: "zone-007", name: "Bintaro Trade Center", type: "Customer", shape: "circle", lat: -6.2256, lng: 106.7456, radius: 350, color: "#06B6D4", status: "active", units: 6, notes: "Pusat niaga Bintaro" },
  { id: "zone-008", name: "Tangerang Logistik Hub", type: "Depot", shape: "circle", lat: -6.1789, lng: 106.6234, radius: 700, color: "#84CC16", status: "active", units: 9, notes: "Hub logistik Tangerang" },
];

export const SAFETY_INCIDENTS: SafetyIncident[] = [
  { id: 1, vehicleId: 1, driverName: "Ahmad Sudirman", dateTime: "2026-06-19T08:30:00Z", location: "Jl. Sudirman KM 45, Jakarta", latitude: -6.2146, longitude: 106.8222, type: "Tabrakan", severity: "Sedang", status: "Ditangani", description: "Tabrakan ringan dengan kendaraan pribadi saat maneuver di perempatan.", hasVictim: false, estimatedLoss: 2500000 },
  { id: 2, vehicleId: 3, driverName: "Cahyo Wibowo", dateTime: "2026-06-18T14:15:00Z", location: "Jl. Gatot Subroto KM 12, Bandung", latitude: -6.9175, longitude: 107.6191, type: "Selip", severity: "Ringan", status: "Selesai", description: "Kendaraan slip di tikungan jalan tol akibat hujan deras.", hasVictim: false, estimatedLoss: 500000 },
  { id: 3, vehicleId: 5, driverName: "Eko Prasetyo", dateTime: "2026-06-17T22:45:00Z", location: "Jl. Pantura KM 78, Cirebon", latitude: -6.732, longitude: 108.5523, type: "Ban Pecah", severity: "Ringan", status: "Selesai", description: "Ban depan kiri pecah saat beroperasi di jalan rusak.", hasVictim: false, estimatedLoss: 1200000 },
  { id: 4, vehicleId: 2, driverName: "Budi Santoso", dateTime: "2026-06-20T06:00:00Z", location: "Jl. Tol Jakarta-Cikampek KM 35", latitude: -6.302, longitude: 107.1514, type: "Tabrakan", severity: "Berat", status: "Baru", description: "Tabrakan beruntun di jalan tol. Kerusakan berat di bagian depan dan samping kanan.", hasVictim: true, estimatedLoss: 15000000 },
  { id: 5, vehicleId: 8, driverName: "Hendra Wijaya", dateTime: "2026-06-16T11:20:00Z", location: "Jl. Surabaya-Malang KM 25", latitude: -7.2575, longitude: 112.7521, type: "Mogok", severity: "Sedang", status: "Ditangani", description: "Mesin mati total akibat masalah sistem bahan bakar.", hasVictim: false, estimatedLoss: 3500000 },
  { id: 6, vehicleId: 4, driverName: "Dedi Kurniawan", dateTime: "2026-06-15T09:10:00Z", location: "Jl. Yos Sudarso, Semarang", latitude: -6.9666, longitude: 110.4196, type: "Tabrakan", severity: "Sedang", status: "Selesai", description: "Hantaman dari belakang oleh kendaraan ringan saat berhenti di lampu merah.", hasVictim: false, estimatedLoss: 4200000 },
  { id: 7, vehicleId: 6, driverName: "Fajar Ramadhan", dateTime: "2026-06-14T16:30:00Z", location: "Jl. Medan-Banda Aceh KM 120", latitude: -6.732, longitude: 108.5523, type: "Selip", severity: "Ringan", status: "Selesai", description: "Slip di area parkir yang basah.", hasVictim: false, estimatedLoss: 800000 },
  { id: 8, vehicleId: 7, driverName: "Gunawan Hadi", dateTime: "2026-06-13T08:00:00Z", location: "Jl. Balikpapan-Samarinda KM 55", latitude: -6.3106, longitude: 107.3383, type: "Lainnya", severity: "Sedang", status: "Ditangani", description: "Benda tajam menancap di ban saat melewati jalan konstruksi.", hasVictim: false, estimatedLoss: 1800000 },
  { id: 9, vehicleId: 10, driverName: "Joko Susilo", dateTime: "2026-06-12T19:45:00Z", location: "Jl. Makassar-Toraja KM 88", latitude: -7.28, longitude: 112.72, type: "Mogok", severity: "Ringan", status: "Selesai", description: "Akumulator soak dan tidak bisa di-hidupkan.", hasVictim: false, estimatedLoss: 600000 },
  { id: 10, vehicleId: 9, driverName: "Irfan Hakim", dateTime: "2026-06-11T13:25:00Z", location: "Jl. Denpasar-Singaraja KM 42", latitude: -6.265, longitude: 106.78, type: "Ban Pecah", severity: "Sedang", status: "Selesai", description: "Ban belakang kanan pecah di jalan berbatu.", hasVictim: false, estimatedLoss: 950000 },
];

export const SAFETY_REFERENCE_TIME_MS = Date.parse("2026-06-20T12:00:00+07:00");
