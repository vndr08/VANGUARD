/**
 * VANGUARD API — WebSocket + REST structure
 *
 * Current: Mock data (lib/mock-data.ts)
 * Target: Real WebSocket telemetry + REST endpoints
 *
 * WebSocket endpoint: wss://api.vanguard.local/ws/telemetry
 * REST base: https://api.vanguard.local/v1
 */

import type { WsTelemetryMessage, WsAlertMessage, TaskInfo } from "@/components/map/types";

/* ─── REST helpers ──────────────────────────────────────────────────────── */
const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

async function fetchApi<T>(endpoint: string): Promise<T | null> {
  try {
    const res = await fetch(`${API_URL}${endpoint}`, { cache: "no-store" });
    if (!res.ok) return null;
    return res.json();
  } catch {
    return null;
  }
}

/* ─── REST API ──────────────────────────────────────────────────────────── */
export const API = {
  vehicles: {
    list: async (): Promise<import("@/types").Vehicle[]> => {
      // TODO: GET /v1/vehicles → replace mock
      const { MOCK_VEHICLES } = await import("@/lib/mock-data");
      return MOCK_VEHICLES;
    },
    get: async (id: number): Promise<import("@/types").Vehicle | null> => {
      // TODO: GET /v1/vehicles/:id → replace mock
      const { MOCK_VEHICLES } = await import("@/lib/mock-data");
      return MOCK_VEHICLES.find((v) => v.id === id) ?? null;
    },
  },
  tasks: {
    list: async (): Promise<TaskInfo[]> => {
      // TODO: GET /v1/tasks → replace mock
      const { MOCK_TASKS } = await import("@/lib/mock-data");
      return Object.values(MOCK_TASKS);
    },
    get: async (vehicleId: number): Promise<TaskInfo | null> => {
      // TODO: GET /v1/tasks?vehicle_id=:id → replace mock
      const { MOCK_TASKS } = await import("@/lib/mock-data");
      return MOCK_TASKS[vehicleId] ?? null;
    },
  },
  alerts: {
    list: async (): Promise<WsAlertMessage[]> => {
      // TODO: GET /v1/alerts
      return [];
    },
  },
};

/* ─── Backward compat ─────────────────────────────────────────────────── */
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

/* ─── WebSocket client ─────────────────────────────────────────────────── */
export type WsMessage = WsTelemetryMessage | WsAlertMessage;
export type WsConnectionState = "connecting" | "connected" | "disconnected" | "error";

export interface WsClient {
  connect: () => void;
  disconnect: () => void;
  subscribe: (handler: (msg: WsMessage) => void) => () => void;
  connectionState: () => WsConnectionState;
}

/**
 * Create a WebSocket client for VANGUARD telemetry.
 * Subscribe returns an unsubscribe function.
 * Auto-reconnects on disconnect.
 */
export function createTelemetryClient(
  url: string = `ws://${API_URL.replace("http://", "")}/ws/telemetry`
): WsClient {
  let ws: WebSocket | null = null;
  let state: WsConnectionState = "disconnected";
  const handlers = new Set<(msg: WsMessage) => void>();
  let reconnectTimer: ReturnType<typeof setTimeout> | null = null;
  const reconnectDelay = 3000;

  function emit(msg: WsMessage) {
    handlers.forEach((h) => h(msg));
  }

  function connect() {
    if (ws && (ws.readyState === WebSocket.OPEN || ws.readyState === WebSocket.CONNECTING)) return;
    state = "connecting";

    try {
      ws = new WebSocket(url);

      ws.onopen = () => {
        state = "connected";
        console.info("[TelemetryWS] Connected");
      };

      ws.onmessage = (event) => {
        try {
          const msg = JSON.parse(event.data) as WsMessage;
          emit(msg);
        } catch {
          console.warn("[TelemetryWS] Failed to parse message", event.data);
        }
      };

      ws.onerror = () => {
        state = "error";
        console.error("[TelemetryWS] Error");
      };

      ws.onclose = () => {
        state = "disconnected";
        console.info("[TelemetryWS] Disconnected, reconnecting in", reconnectDelay);
        reconnectTimer = setTimeout(connect, reconnectDelay);
      };
    } catch {
      state = "error";
    }
  }

  function disconnect() {
    if (reconnectTimer) clearTimeout(reconnectTimer);
    ws?.close();
    ws = null;
    state = "disconnected";
  }

  function subscribe(handler: (msg: WsMessage) => void): () => void {
    handlers.add(handler);
    return () => handlers.delete(handler);
  }

  return { connect, disconnect, subscribe, connectionState: () => state };
}
