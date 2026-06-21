"use client";

import { useEffect, useRef, useMemo, useState } from "react";
import maplibregl, { Map as MLMap, Marker } from "maplibre-gl";
import "maplibre-gl/dist/maplibre-gl.css";
import {
  GRAPHITE_DARK_STYLE,
  LngLat,
} from "./types";

/* ─── TaskRouteMap ──────────────────────────────────────────────────────── */
export interface TaskRoutePoint {
  label: string;
  coord: [number, number];
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
  plannedRoute: [number, number][];
  traveledRoute: [number, number][];
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

    const bounds: [number, number, number, number] = [
      Math.min(task.origin.coord[0], task.destination.coord[0], task.current.coord[0]) - 0.1,
      Math.min(task.origin.coord[1], task.destination.coord[1], task.current.coord[1]) - 0.1,
      Math.max(task.origin.coord[0], task.destination.coord[0], task.current.coord[0]) + 0.1,
      Math.max(task.origin.coord[1], task.destination.coord[1], task.current.coord[1]) + 0.1,
    ];

    const map = new MLMap({
      container: containerRef.current,
      style: GRAPHITE_DARK_STYLE,
      bounds,
      fitBoundsOptions: { padding: 64, maxZoom: 12 },
    });

    map.addControl(new maplibregl.NavigationControl(), "top-right" as maplibregl.ControlPosition);

    map.on("load", () => {
      // ── Planned route (dashed gray) ───────────────────────────────
      if (task.plannedRoute.length > 0) {
        map.addSource("planned-route", {
          type: "geojson",
          data: {
            type: "Feature",
            geometry: {
              type: "LineString",
              coordinates: task.plannedRoute,
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

      // ── Actual route (solid green → cyan) ─────────────────────────
      if (task.traveledRoute.length > 0) {
        map.addSource("actual-route", {
          type: "geojson",
          data: {
            type: "Feature",
            geometry: {
              type: "LineString",
              coordinates: task.traveledRoute,
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

        // Animate draw-on for actual route (stroke-dashoffset)
        const totalLength = (document.querySelector("#actual-route-line") as SVGPathElement)?.getTotalLength?.() ?? 1000;
        map.setPaintProperty("actual-route-line", "line-dasharray", [0, totalLength]);
        map.setPaintProperty("actual-route-line", "line-dasharray", [0, 2, totalLength]);
      }

      // ── Route markers [START] [END] ─────────────────────────────
      const addMarker = (coord: [number, number], label: string, type: "start" | "end" | "current") => {
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

        const marker = new Marker({ element: el, anchor: "center" })
          .setLngLat(coord)
          .addTo(map);

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
