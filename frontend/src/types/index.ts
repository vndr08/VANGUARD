export interface Vehicle {
  id: number;
  plate_number: string;
  vehicle_type: string;
  brand: string;
  model: string;
  year: number;
  status: "driving" | "idle" | "stopped" | "offline";
  speed: number;
  latitude: number | null;
  longitude: number | null;
  heading: number;
  engine_on: boolean;
  fuel_level: number;
  odometer: number;
  last_update: string;
  driver_name: string | null;
}

export interface DashboardStats {
  total_vehicles: number;
  driving: number;
  idle: number;
  stopped: number;
  offline: number;
  total_drivers: number;
  avg_speed: number;
  alerts: number;
}

export interface TelemetryUpdate {
  vehicle_id: number;
  plate_number: string;
  latitude: number;
  longitude: number;
  speed: number;
  heading: number;
  status: string;
  engine_on: boolean;
  fuel_level: number;
  last_update: string;
}
