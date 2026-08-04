"use client";

import {
  createContext,
  useContext,
  useState,
  useCallback,
  useMemo,
  type ReactNode,
} from "react";

export type TelemetriInterval = "5" | "10" | "30" | "60";

interface AppContextValue {
  // Notifikasi
  speedingAlertEnabled: boolean;
  setSpeedingAlertEnabled: (v: boolean) => void;

  // Telemetri refresh (ms)
  telemetriInterval: number;
  setTelemetriInterval: (v: TelemetriInterval) => void;
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
  const [speedingAlertEnabled, setSpeedingAlertEnabled] = useState(true);
  const [telemetriIntervalKey, setTelemetriIntervalKey] = useState<TelemetriInterval>("10");

  const setTelemetriInterval = useCallback((v: TelemetriInterval) => {
    setTelemetriIntervalKey(v);
  }, []);

  const telemetriInterval = INTERVAL_MS[telemetriIntervalKey];

  const value = useMemo(() => ({
    speedingAlertEnabled,
    setSpeedingAlertEnabled,
    telemetriInterval,
    setTelemetriInterval,
  }), [speedingAlertEnabled, telemetriInterval]);

  return (
    <AppContext.Provider value={value}>
      {children}
    </AppContext.Provider>
  );
}
