"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { useReducedMotion } from "motion/react";
import type { MapVehicle, LayerVisibility, InterpolatedVehicle } from "@/components/map/types";

/* ─── useMapInterpolation ──────────────────────────────────────────────── */
/**
 * Smoothly interpolates vehicle positions and headings using lerp.
 * Falls back to instant position when prefers-reduced-motion is active.
 */
export function useMapInterpolation(vehicles: MapVehicle[]): (InterpolatedVehicle & { lng: number; lat: number })[] {
  const reduceMotion = useReducedMotion();
  const prevRef = useRef<Map<number, { lng: number; lat: number; heading: number }>>(new Map());
  const [interpolated, setInterpolated] = useState<(InterpolatedVehicle & { lng: number; lat: number })[]>(() =>
    vehicles.map((v) => ({
      id: v.id,
      lng: v.longitude ?? 0,
      lat: v.latitude ?? 0,
      heading: v.heading,
      status: v.displayStatus,
      speed: v.speed,
      plate: v.plate_number,
      taskLabel: v.taskLabel,
      isMoving: v.status === "driving",
    }))
  );

  useEffect(() => {
    if (reduceMotion) {
      // Instant fallback
      setInterpolated(
        vehicles.map((v) => ({
          id: v.id,
          lng: v.longitude ?? 0,
          lat: v.latitude ?? 0,
          heading: v.heading,
          status: v.displayStatus,
          speed: v.speed,
          plate: v.plate_number,
          taskLabel: v.taskLabel,
          isMoving: v.status === "driving",
        }))
      );
      return;
    }

    let rafId: number;
    let startTime: number | null = null;
    const LERP_DURATION = 600; // ms

    function animate(timestamp: number) {
      if (!startTime) startTime = timestamp;
      const elapsed = timestamp - startTime;
      const t = Math.min(elapsed / LERP_DURATION, 1);
      // ease-out cubic
      const ease = 1 - Math.pow(1 - t, 3);

      setInterpolated((prev) => {
        return vehicles.map((v) => {
          const prevPos = prevRef.current.get(v.id);
          const targetLng = v.longitude ?? 0;
          const targetLat = v.latitude ?? 0;
          const targetHeading = v.heading;

          if (!prevPos) {
            prevRef.current.set(v.id, { lng: targetLng, lat: targetLat, heading: targetHeading });
            return {
              id: v.id,
              lng: targetLng,
              lat: targetLat,
              heading: targetHeading,
              status: v.displayStatus,
              speed: v.speed,
              plate: v.plate_number,
              taskLabel: v.taskLabel,
              isMoving: v.status === "driving",
            };
          }

          // Lerp position
          const lng = lerp(prevPos.lng, targetLng, ease);
          const lat = lerp(prevPos.lat, targetLat, ease);
          // Lerp heading (shortest path)
          const heading = lerpAngle(prevPos.heading, targetHeading, ease);

          if (t >= 1) {
            prevRef.current.set(v.id, { lng: targetLng, lat: targetLat, heading: targetHeading });
          } else {
            prevRef.current.set(v.id, { lng, lat, heading });
          }

          return {
            id: v.id,
            lng,
            lat,
            heading,
            status: v.displayStatus,
            speed: v.speed,
            plate: v.plate_number,
            taskLabel: v.taskLabel,
            isMoving: v.status === "driving",
          };
        });
      });

      if (vehicles.every((v) => {
        const p = prevRef.current.get(v.id);
        return p && Math.abs(p.lng - (v.longitude ?? 0)) < 0.00001 && Math.abs(p.lat - (v.latitude ?? 0)) < 0.00001;
      })) {
        startTime = null;
        return;
      }

      if (t < 1) {
        rafId = requestAnimationFrame(animate);
      } else {
        startTime = null;
      }
    }

    rafId = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(rafId);
  }, [vehicles, reduceMotion]);

  return interpolated;
}

function lerp(a: number, b: number, t: number): number {
  return a + (b - a) * t;
}

/** Shortest-path angle lerp (handles 360° wrap) */
function lerpAngle(a: number, b: number, t: number): number {
  let diff = ((b - a + 540) % 360) - 180;
  return (a + diff * t + 360) % 360;
}

/* ─── useLayerVisibility ───────────────────────────────────────────────── */
export function useLayerVisibility(initial: LayerVisibility) {
  const [visibility, setVisibility] = useState<LayerVisibility>(initial);

  const toggle = useCallback((key: keyof LayerVisibility) => {
    setVisibility((prev) => ({ ...prev, [key]: !prev[key] }));
  }, []);

  const set = useCallback((key: keyof LayerVisibility, value: boolean) => {
    setVisibility((prev) => ({ ...prev, [key]: value }));
  }, []);

  return { visibility, toggle, set };
}

/* ─── useMapTheme ──────────────────────────────────────────────────────── */
/** Tracks dark mode state for map style switching */
export function useMapTheme(): boolean {
  const [isDark, setIsDark] = useState(() =>
    document.documentElement.classList.contains("dark")
  );

  useEffect(() => {
    const observer = new MutationObserver(() => {
      setIsDark(document.documentElement.classList.contains("dark"));
    });
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["class"],
    });
    return () => observer.disconnect();
  }, []);

  return isDark;
}

/* ─── useVehicleDetail ─────────────────────────────────────────────────── */
/** Fetches or computes vehicle detail panel data */
export function useVehicleDetail(
  vehicleId: number | null,
  vehicles: MapVehicle[]
): (MapVehicle & {
  task?: import("@/components/map/types").TaskInfo;
  traveled: { distance: number; duration: string; avgSpeed: number };
  estimated: { distanceLeft: number; timeLeft: string; arriveAt: string };
}) | null {
  const vehicle = vehicles.find((v) => v.id === vehicleId) ?? null;

  if (!vehicle) return null;

  // TODO: replace with real API call
  const task = vehicleId ? import("@/lib/mock-data").then(m => m.MOCK_TASKS[vehicleId]) : null;

  const traveled = {
    distance: vehicle.odometer / 1000,
    duration: formatDuration(vehicle.last_update),
    avgSpeed: vehicle.status === "driving" ? vehicle.speed : 0,
  };

  const estimated = {
    distanceLeft: (vehicle.routePlanned?.length ?? 0) * 5,
    timeLeft: "~18m",
    arriveAt: "14:32",
  };

  return {
    ...vehicle,
    task: undefined,
    traveled,
    estimated,
  } as ReturnType<typeof useVehicleDetail>;
}

function formatDuration(lastUpdate: string): string {
  const diff = Date.now() - new Date(lastUpdate).getTime();
  const h = Math.floor(diff / 3600000);
  const m = Math.floor((diff % 3600000) / 60000);
  return h > 0 ? `${h}h ${m}m` : `${m}m`;
}
