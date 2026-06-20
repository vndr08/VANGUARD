const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

async function fetchApi<T>(endpoint: string): Promise<T | null> {
  try {
    const res = await fetch(`${API_URL}${endpoint}`, {
      cache: "no-store",
    });
    if (!res.ok) return null;
    return res.json();
  } catch {
    return null;
  }
}

export async function getVehicles() {
  return fetchApi<import("@/types").Vehicle[]>("/api/vehicles");
}

export async function getDashboardStats() {
  return fetchApi<import("@/types").DashboardStats>("/api/dashboard/stats");
}

export async function getVehicle(id: number) {
  return fetchApi<import("@/types").Vehicle>(`/api/vehicles/${id}`);
}

export { API_URL };
