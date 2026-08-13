"use client";

import { useEffect, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useAppContext } from "@/components/context/AppContext";
import { useToast } from "@/components/ui/Toast";
import { useReducedMotion } from "@/hooks/useReducedMotion";
import { FLEET_VEHICLES } from "@/lib/fleet-data";

function randomBetween(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function mockAddress(lat: number, lng: number): string {
  // Generate a plausible Jakarta-area road name from coordinates
  const latBand = Math.abs(Math.round(lat * 100)) % 20;
  const lngBand = Math.abs(Math.round(lng * 100)) % 20;
  const roads = [
    "Jl. Tol Jakarta-Cikampek", "Jl. Gatot Subroto", "Jl. Sudirman",
    "Jl. HR Rasuna Said", "Jl. Thamrin", "Jl. Diponegoro",
    "Jl. Ahmad Yani", "Jl. Ir. Sukarno", "Jl. Jend. Sudirman",
    "Jl. Pangeran Antasari", "Jl. TB Simatupang", "Jl. Cempaka Putih",
    "Jl. Daan Mogot", "Jl. KS Tubun", "Jl. Petojo Enkleng",
  ];
  return `${roads[latBand % roads.length]}, Jakarta`;
}

export function useSpeedingMonitor() {
  const { speedingAlertEnabled } = useAppContext();
  const { warning } = useToast();
  const router = useRouter();
  const reducedMotion = useReducedMotion();
  const intervalRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const fire = useCallback(() => {
    const driving = FLEET_VEHICLES.filter(v => v.status === "driving");
    if (driving.length === 0) return;

    const vehicle = driving[randomBetween(0, driving.length - 1)];
    const speedLimit = randomBetween(60, 90);
    const actualSpeed = randomBetween(speedLimit + 2, speedLimit + 30);

    warning(
      `Melebihi Batas Kecepatan (${actualSpeed} Km/j)`,
      `${vehicle.plate_number} · ${mockAddress(vehicle.latitude ?? 0, vehicle.longitude ?? 0)}`
    );
  }, [warning]);

  const scheduleNext = useCallback(() => {
    if (intervalRef.current) clearTimeout(intervalRef.current);
    const delay = randomBetween(8000, 15000);
    intervalRef.current = setTimeout(() => {
      fire();
      scheduleNext();
    }, delay);
  }, [fire]);

  useEffect(() => {
    if (!speedingAlertEnabled) {
      if (intervalRef.current) {
        clearTimeout(intervalRef.current);
        intervalRef.current = null;
      }
      return;
    }

    // Small initial delay so page can settle
    const init = setTimeout(scheduleNext, 3000);
    return () => {
      clearTimeout(init);
      if (intervalRef.current) clearTimeout(intervalRef.current);
    };
  }, [speedingAlertEnabled, scheduleNext]);
}
