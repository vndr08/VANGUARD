"use client";

import {
  createContext,
  useContext,
  useState,
  useCallback,
  useMemo,
  useEffect,
  useRef,
  type ReactNode,
} from "react";
import { FLEET_VEHICLES } from "@/lib/fleet-data";
import { getVehicles, TELEMETRY_WS_URL } from "@/hooks/useTelemetry";
import type { Vehicle } from "@/types";

export type TelemetriInterval = "5" | "10" | "30" | "60";
export type Accent = "yellow" | "orange" | "steel";

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

interface AppContextValue {
  // Vehicles
  vehicles: Vehicle[];
  setVehicles: (v: Vehicle[]) => void;
  selectedVehicleId: number | null;
  setSelectedVehicleId: (id: number | null) => void;

  // Notifikasi
  speedingAlertEnabled: boolean;
  setSpeedingAlertEnabled: (v: boolean) => void;

  // Telemetri refresh (ms)
  telemetriInterval: number;
  setTelemetriInterval: (v: TelemetriInterval) => void;

  // Connection status
  isConnected: boolean;
  setIsConnected: (v: boolean) => void;
}

const AppContext = createContext<AppContextValue | null>(null);

export function useAppContext(): AppContextValue {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error("useAppContext must be used within AppContextProvider");
  return ctx;
}

const INTERVAL_MS: Record<TelemetriInterval, number> = {
  "5":  5_000,
  "10": 10_000,
  "30": 30_000,
  "60": 60_000,
};

export function AppContextProvider({ children }: { children: ReactNode }) {
  const [vehicles, setVehiclesState] = useState<Vehicle[]>(FLEET_VEHICLES);
  const [selectedVehicleId, setSelectedVehicleId] = useState<number | null>(null);
  const [speedingAlertEnabled, setSpeedingAlertEnabled] = useState(true);
  const [telemetriIntervalKey, setTelemetriIntervalKey] = useState<TelemetriInterval>("10");
  const [isConnected, setIsConnected] = useState(false);
  const wsRef = useRef<WebSocket | null>(null);
  const reconnectTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const shouldReconnectRef = useRef(false);

  // Fetch vehicles from API
  const fetchVehicles = useCallback(async () => {
    try {
      const data = await getVehicles();
      if (data && data.length > 0) {
        const apiByPlate = new Map(
          data.map((vehicle) => [vehicle.plate_number.trim().toUpperCase(), vehicle])
        );
        setVehiclesState((current) =>
          current.map((vehicle) => {
            const apiVehicle = apiByPlate.get(
              vehicle.plate_number.trim().toUpperCase()
            );

            if (!apiVehicle) return vehicle;

            return {
              ...vehicle,
              ...apiVehicle,
              id: vehicle.id,
              plate_number: vehicle.plate_number,
            };
          })
        );
      }
    } catch {
      // Keep using mock data on error
    }
  }, []);

  // Connect to WebSocket for real-time updates
  const connectWebSocket = useCallback(() => {
    if (!shouldReconnectRef.current) return;
    if (wsRef.current?.readyState === WebSocket.OPEN) return;

    try {
      const ws = new WebSocket(TELEMETRY_WS_URL);

      ws.onopen = () => {
        setIsConnected(true);
      };

      ws.onmessage = (event) => {
        try {
          const update = JSON.parse(event.data) as WsVehicleUpdate;
          setVehiclesState(prev => prev.map(v => {
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
        } catch {
          // Ignore non-JSON messages
        }
      };

      ws.onclose = () => {
        setIsConnected(false);
        wsRef.current = null;
        if (shouldReconnectRef.current) {
          reconnectTimeoutRef.current = setTimeout(() => {
            connectWebSocket();
          }, 5000);
        }
      };

      ws.onerror = () => {
        setIsConnected(false);
      };

      wsRef.current = ws;
    } catch {
      // WebSocket connection failed
    }
  }, []);

  // Disconnect WebSocket
  const disconnectWebSocket = useCallback(() => {
    shouldReconnectRef.current = false;
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current);
      reconnectTimeoutRef.current = null;
    }
    if (wsRef.current) {
      wsRef.current.onclose = null;
      wsRef.current.close();
    }
    wsRef.current = null;
    setIsConnected(false);
  }, []);

  // Connect to WebSocket on mount
  useEffect(() => {
    shouldReconnectRef.current = true;
    connectWebSocket();
    return () => {
      disconnectWebSocket();
    };
  }, [connectWebSocket, disconnectWebSocket]);

  // Refresh vehicles data periodically as backup
  useEffect(() => {
    // Initial fetch
    fetchVehicles();

    const id = setInterval(fetchVehicles, INTERVAL_MS[telemetriIntervalKey]);
    return () => clearInterval(id);
  }, [telemetriIntervalKey, fetchVehicles]);

  const setTelemetriInterval = useCallback((v: TelemetriInterval) => {
    setTelemetriIntervalKey(v);
  }, []);

  const setVehicles = useCallback((v: Vehicle[]) => {
    setVehiclesState(v);
  }, []);

  const value = useMemo(() => ({
    vehicles,
    setVehicles,
    selectedVehicleId,
    setSelectedVehicleId,
    speedingAlertEnabled,
    setSpeedingAlertEnabled,
    telemetriInterval: INTERVAL_MS[telemetriIntervalKey],
    setTelemetriInterval,
    isConnected,
    setIsConnected,
  }), [
    vehicles,
    setVehicles,
    selectedVehicleId,
    speedingAlertEnabled,
    telemetriIntervalKey,
    setTelemetriInterval,
    isConnected,
  ]);

  return (
    <AppContext.Provider value={value}>
      {children}
    </AppContext.Provider>
  );
}
