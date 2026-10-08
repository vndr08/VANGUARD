import { FLEET_VEHICLES } from "@/lib/fleet-data";
import type { Vehicle } from "@/types";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
const WS_BASE_URL = process.env.NEXT_PUBLIC_WS_URL || "ws://localhost:8000";

export const TELEMETRY_WS_URL = WS_BASE_URL.endsWith("/ws/tracking")
  ? WS_BASE_URL
  : `${WS_BASE_URL.replace(/\/$/, "")}/ws/tracking`;

async function fetchApi<T>(endpoint: string): Promise<T | null> {
  try {
    const response = await fetch(`${API_URL}${endpoint}`, { cache: "no-store" });
    if (!response.ok) return null;
    return response.json();
  } catch {
    return null;
  }
}

export async function getVehicles(): Promise<Vehicle[]> {
  return (await fetchApi<Vehicle[]>("/api/vehicles/")) ?? FLEET_VEHICLES;
}
