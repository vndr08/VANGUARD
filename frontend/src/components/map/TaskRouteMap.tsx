"use client";

import { useEffect, useRef, useMemo, useState } from "react";
import maplibregl, { Map as MLMap, Marker } from "maplibre-gl";
import "maplibre-gl/dist/maplibre-gl.css";
import { GRAPHITE_DARK_RASTER } from "./types";
import { toLngLat, toLngLatArray, isValidLngLat, buildFitBounds } from "@/lib/geo";

/* ─── TaskRouteMap ──────────────────────────────────────────────────────── */
export interface TaskRoutePoint {
  label: string;
  coord: { lng: number; lat: number };
}

export interface TaskRouteData {
  vehicle: string;
  driver: string;
  task: string;
  status: string;
  speed: number;
  origin: TaskRoutePoint;
  destination: TaskRoutePoint;
  current: TaskRoutePoint;
  plannedRoute: { lng: number; lat: number }[];
  traveledRoute: { lng: number; lat: number }[];
}

interface TaskRouteMapProps {
  task: TaskRouteData;
}

/* ─── Marker colors ─────────────────────────────────────────────────────── */
const MARKER_COLORS = {
  start: "#22C55E",   // green
  current: "#F97316", // orange
  end: "#3B82F6",     // brand blue
};

export default function TaskRouteMap({ task }: TaskRouteMapProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<MLMap | null>(null);
  const [isReady, setIsReady] = useState(false);
  const markersRef = useRef<Marker[]>([]);

  /* ── Init ─────────────────────────────────────────────────────────────── */
  useEffect(() => {
    if (!containerRef.current || mapRef.current) return;

    // Gather all points for bounds
    const allPoints = [task.origin.coord, task.destination.coord, task.current.coord];
    const fitResult = buildFitBounds(allPoints, 64, 14);

    // Compute a reasonable center from first point
    const firstValid = allPoints.find(isValidLngLat);
    const defaultCenter: [number, number] = firstValid
      ? [firstValid.lng, firstValid.lat]
      : [107.0, -6.5];

    const map = new MLMap({
      container: containerRef.current,
      style: GRAPHITE_DARK_RASTER,
      center: defaultCenter,
      zoom: 10,
      maxZoom: 18,
      minZoom: 4,
    });

    map.addControl(new maplibregl.NavigationControl(), "top-right" as maplibregl.ControlPosition);

    map.on("load", () => {
      // Fit bounds AFTER load so tiles are ready (not in constructor — v3 compatibility)
      if (fitResult) {
        map.fitBounds(fitResult.bounds, fitResult.options);
      }

      // ── Planned route (dashed gray) ───────────────────────────────
      if (task.plannedRoute.length > 0) {
        const plannedCoords = toLngLatArray(task.plannedRoute);
        map.addSource("planned-route", {
          type: "geojson",
          data: {
            type: "Feature",
            geometry: {
              type: "LineString",
              coordinates: plannedCoords,
            },
            properties: {},
          },
        });

        map.addLayer({
          id: "planned-route-line",
          type: "line",
          source: "planned-route",
          paint: {
            "line-color": "#5E6773",
            "line-width": 3,
            "line-opacity": 0.7,
            "line-dasharray": [4, 4],
          },
        });
      }

      // ── Actual route (solid green) ─────────────────────────
      if (task.traveledRoute.length > 0) {
        const traveledCoords = toLngLatArray(task.traveledRoute);
        map.addSource("actual-route", {
          type: "geojson",
          data: {
            type: "Feature",
            geometry: {
              type: "LineString",
              coordinates: traveledCoords,
            },
            properties: {},
          },
        });

        map.addLayer({
          id: "actual-route-line",
          type: "line",
          source: "actual-route",
          paint: {
            "line-color": "#10B981",
            "line-width": 4,
            "line-opacity": 0.9,
          },
        });
      }

      // ── Route markers [START] [END] ─────────────────────────────
      const addMarker = (coord: { lng: number; lat: number }, label: string, type: "start" | "end" | "current") => {
        const ll = toLngLat(coord);
        if (!ll) return; // skip invalid coords (toLngLat already warned)

        const el = document.createElement("div");
        const color = type === "start" ? MARKER_COLORS.start
          : type === "end" ? MARKER_COLORS.end
          : MARKER_COLORS.current;

        el.style.cssText = `
          display: flex;
          align-items: center;
          gap: 4px;
          background: var(--surface-1, #14181D);
          border: 2px solid ${color};
          border-radius: 6px;
          padding: 4px 10px;
          font-family: var(--font-mono, monospace);
          font-size: 10px;
          font-weight: 700;
          color: ${color};
          white-space: nowrap;
          box-shadow: 0 4px 16px rgba(0,0,0,0.5);
          cursor: pointer;
        `;
        el.innerHTML = `<span style="opacity:0.6;font-weight:400;">[</span>${label}<span style="opacity:0.6;font-weight:400;">]</span>`;

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const marker = new Marker({ element: el, anchor: "center" }).setLngLat(ll as any).addTo(map);

        markersRef.current.push(marker);
      };

      addMarker(task.origin.coord, task.origin.label, "start");
      addMarker(task.destination.coord, task.destination.label, "end");
      addMarker(task.current.coord, task.vehicle, "current");

      setIsReady(true);
    });

    mapRef.current = map;

    return () => {
      markersRef.current.forEach((m) => m.remove());
      markersRef.current = [];
      map.remove();
      mapRef.current = null;
    };
  }, [task]);

  return (
    <div className="relative h-full w-full overflow-hidden">
      <div ref={containerRef} className="absolute inset-0" />

      {/* Loading */}
      {!isReady && (
        <div className="absolute inset-0 flex items-center justify-center bg-bg">
          <div className="flex flex-col items-center gap-3">
            <div className="h-8 w-8 rounded-full border-2 border-brand border-t-transparent animate-spin" />
            <span className="text-sm text-muted">Loading route...</span>
          </div>
        </div>
      )}

      {/* Route legend */}
      {isReady && (
        <div className="absolute bottom-4 left-4 z-dock">
          <div className="glass rounded-lg border border-border px-3 py-2 space-y-1.5">
            <LegendRow color="#10B981" label="Traveled Route" />
            <LegendRow color="#5E6773" label="Planned Route" dashed />
          </div>
        </div>
      )}
    </div>
  );
}

function LegendRow({ color, label, dashed = false }: { color: string; label: string; dashed?: boolean }) {
  return (
    <div className="flex items-center gap-2">
      <span
        className="h-0.5 flex-1 rounded-full"
        style={{
          background: dashed
            ? `repeating-linear-gradient(to right, ${color} 0, ${color} 4px, transparent 4px, transparent 8px)`
            : color,
        }}
      />
      <span className="text-[10px] text-muted w-24">{label}</span>
    </div>
  );
}
