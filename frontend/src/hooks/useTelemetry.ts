"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import { FLEET_VEHICLES, createFleetVehicles } from "@/lib/fleet-data";
import type { Vehicle } from "@/types";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
const WS_BASE_URL = process.env.NEXT_PUBLIC_WS_URL || "ws://localhost:8000";
export const TELEMETRY_WS_URL = WS_BASE_URL.endsWith("/ws/tracking")
  ? WS_BASE_URL
  : `${WS_BASE_URL.replace(/\/$/, "")}/ws/tracking`;

/* ─── API Types ─────────────────────────────────────────── */
interface DashboardStats {
  total_vehicles: number;
  driving: number;
  idle: number;
  stopped: number;
  offline: number;
  total_drivers: number;
  avg_speed: number;
  alerts: number;
}

interface WsVehicleUpdate {
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

/* ─── API Functions ────────────────────────────────────── */
async function fetchApi<T>(endpoint: string): Promise<T | null> {
  try {
    const res = await fetch(`${API_URL}${endpoint}`, { cache: "no-store" });
    if (!res.ok) return null;
    return res.json();
  } catch {
    return null;
  }
}

export async function getVehicles(): Promise<Vehicle[]> {
  const data = await fetchApi<Vehicle[]>("/api/vehicles/");
  return data ?? FLEET_VEHICLES;
}

export async function getVehicle(id: number): Promise<Vehicle | null> {
  const data = await fetchApi<Vehicle>(`/api/vehicles/${id}`);
  return data ?? FLEET_VEHICLES.find(v => v.id === id) ?? null;
}

export async function getDashboardStats(): Promise<DashboardStats | null> {
  return fetchApi<DashboardStats>("/api/dashboard/stats");
}

/* ─── WebSocket Hook ──────────────────────────────────── */
export interface UseTelemetryOptions {
  onVehicleUpdate?: (update: WsVehicleUpdate) => void;
  onConnect?: () => void;
  onDisconnect?: () => void;
}

export function useTelemetryWebSocket(options: UseTelemetryOptions = {}) {
  const { onVehicleUpdate, onConnect, onDisconnect } = options;
  const wsRef = useRef<WebSocket | null>(null);
  const reconnectTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [connectionError, setConnectionError] = useState<string | null>(null);

  const connect = useCallback(() => {
    if (wsRef.current?.readyState === WebSocket.OPEN) return;

    try {
      const ws = new WebSocket(TELEMETRY_WS_URL);

      ws.onopen = () => {
        setIsConnected(true);
        setConnectionError(null);
        onConnect?.();
      };

      ws.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data) as WsVehicleUpdate;
          onVehicleUpdate?.(data);
        } catch {
          // Ignore non-JSON messages
        }
      };

      ws.onerror = () => {
        setConnectionError("WebSocket connection error");
      };

      ws.onclose = () => {
        setIsConnected(false);
        onDisconnect?.();

        // Auto-reconnect after 3 seconds
        reconnectTimeoutRef.current = setTimeout(() => {
          connect();
        }, 3000);
      };

      wsRef.current = ws;
    } catch (err) {
      setConnectionError(String(err));
    }
  }, [onVehicleUpdate, onConnect, onDisconnect]);

  const disconnect = useCallback(() => {
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current);
      reconnectTimeoutRef.current = null;
    }
    wsRef.current?.close();
    wsRef.current = null;
    setIsConnected(false);
  }, []);

  useEffect(() => {
    return () => {
      disconnect();
    };
  }, [disconnect]);

  return {
    connect,
    disconnect,
    isConnected,
    connectionError,
  };
}

/* ─── Vehicle State Hook ──────────────────────────────── */
export interface UseVehiclesOptions {
  autoRefresh?: boolean;
  refreshInterval?: number;
  useApi?: boolean;
}

export function useVehicles(options: UseVehiclesOptions = {}) {
  const { autoRefresh = true, refreshInterval = 10000, useApi = false } = options;
  const [vehicles, setVehicles] = useState<Vehicle[]>(FLEET_VEHICLES);
  const [isLoading, setIsLoading] = useState(true);
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null);
  const wsRef = useRef<WebSocket | null>(null);
  const reconnectTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [isConnected, setIsConnected] = useState(false);

  // Handle real-time update from WebSocket
  const handleVehicleUpdate = useCallback((update: WsVehicleUpdate) => {
    setVehicles(prev => prev.map(v => {
      if (v.id === update.vehicle_id) {
        return {
          ...v,
          latitude: update.latitude,
          longitude: update.longitude,
          speed: update.speed,
          heading: update.heading,
          status: update.status as Vehicle["status"],
          engine_on: update.engine_on,
          fuel_level: update.fuel_level,
          last_update: update.last_update,
        };
      }
      return v;
    }));
    setLastUpdate(new Date());
  }, []);

  // Connect to WebSocket
  const connect = useCallback(() => {
    if (wsRef.current?.readyState === WebSocket.OPEN) return;

    try {
      const ws = new WebSocket(TELEMETRY_WS_URL);

      ws.onopen = () => {
        setIsConnected(true);
      };

      ws.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data) as WsVehicleUpdate;
          handleVehicleUpdate(data);
        } catch {
          // Ignore non-JSON messages
        }
      };

      ws.onclose = () => {
        setIsConnected(false);
        // Auto-reconnect after 3 seconds
        reconnectTimeoutRef.current = setTimeout(() => {
          connect();
        }, 3000);
      };

      wsRef.current = ws;
    } catch {
      // WebSocket connection failed
    }
  }, [handleVehicleUpdate]);

  // Disconnect WebSocket
  const disconnect = useCallback(() => {
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current);
      reconnectTimeoutRef.current = null;
    }
    wsRef.current?.close();
    wsRef.current = null;
    setIsConnected(false);
  }, []);

  // Initialize WebSocket if using API
  useEffect(() => {
    if (!useApi) return;

    connect();

    return () => {
      disconnect();
    };
  }, [useApi, connect, disconnect]);

  // Fetch vehicles from API
  const fetchVehicles = useCallback(async () => {
    setIsLoading(true);
    try {
      const data = await getVehicles();
      setVehicles(data);
      setLastUpdate(new Date());
    } catch {
      // Keep using mock data on error
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Initial fetch
  useEffect(() => {
    if (useApi) {
      fetchVehicles();
    } else {
      setVehicles(FLEET_VEHICLES);
      setLastUpdate(new Date());
      setIsLoading(false);
    }
  }, [useApi, fetchVehicles]);

  // Auto-refresh
  useEffect(() => {
    if (!autoRefresh || !useApi) return;

    const interval = setInterval(fetchVehicles, refreshInterval);
    return () => clearInterval(interval);
  }, [autoRefresh, useApi, refreshInterval, fetchVehicles]);

  return {
    vehicles,
    isLoading,
    lastUpdate,
    isConnected,
    refetch: fetchVehicles,
    updateVehicle: handleVehicleUpdate,
  };
}
