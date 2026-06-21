"use client";

import { useEffect, useRef, useState } from "react";
import maplibregl, { Map as MLMap, Marker } from "maplibre-gl";
import "maplibre-gl/dist/maplibre-gl.css";
import { motion } from "motion/react";
import {
  MapVehicle,
  LayerVisibility,
  DEFAULT_LAYER_VISIBILITY,
  STATUS_COLORS,
  LngLat,
  GRAPHITE_DARK_STYLE,
  InterpolatedVehicle,
} from "./types";
import {
  useMapInterpolation,
  useLayerVisibility,
  useMapTheme,
} from "@/hooks/useMapHooks";

/* ─── Props ──────────────────────────────────────────────────────────────── */
interface MapViewProps {
  vehicles: MapVehicle[];
  selectedId?: number | null;
  onSelectVehicle?: (id: number) => void;
  center?: [number, number];
  zoom?: number;
  pitch?: number;
  className?: string;
  children?: React.ReactNode;
}

/* ─── MapView ─────────────────────────────────────────────────────────── */
export default function MapView({
  vehicles,
  selectedId,
  onSelectVehicle,
  center = [107.0, -6.5],
  zoom = 9,
  pitch = 45,
  className = "",
  children,
}: MapViewProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<MLMap | null>(null);
  const markersRef = useRef<Map<number, Marker>>(new Map());
  const routeLayerIds = useRef<Set<string>>(new Set());
  const routeSources = useRef<Set<string>>(new Set());

  const [isReady, setIsReady] = useState(false);
  const [mapError, setMapError] = useState<string | null>(null);

  // Hooks
  const interpolatedVehicles = useMapInterpolation(vehicles);
  const { visibility, toggle } = useLayerVisibility(DEFAULT_LAYER_VISIBILITY);
  const isDark = useMapTheme();

  /* ── Init MapLibre ─────────────────────────────────────────── */
  useEffect(() => {
    if (!containerRef.current || mapRef.current) return;

    try {
      const map = new MLMap({
        container: containerRef.current,
        style: GRAPHITE_DARK_STYLE as maplibregl.StyleSpecification,
        center,
        zoom,
        pitch,
        bearing: 0,
        maxZoom: 18,
        minZoom: 4,
      });

      map.addControl(
        new maplibregl.NavigationControl({ visualizePitch: true }),
        "top-right" as maplibregl.ControlPosition
      );

      map.on("load", () => setIsReady(true));
      map.on("error", (e) => {
        console.error("[MapView] MapLibre error:", e.error?.message);
        setMapError(e.error?.message ?? "Map failed to load");
      });

      mapRef.current = map;

      return () => {
        markersRef.current.forEach((m) => m.remove());
        markersRef.current.clear();
        routeLayerIds.current.forEach((id) => { if (map.getLayer(id)) map.removeLayer(id); });
        routeSources.current.forEach((id) => { if (map.getSource(id)) map.removeSource(id); });
        map.remove();
        mapRef.current = null;
      };
    } catch (err) {
      console.error("[MapView] Init error:", err);
      setMapError(String(err));
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  /* ── Update markers ─────────────────────────────────────────── */
  useEffect(() => {
    if (!isReady || !mapRef.current) return;
    const map = mapRef.current;
    const currentMarkers = markersRef.current;
    const selectedVehicle = vehicles.find((v) => v.id === selectedId);

    // Remove markers no longer in vehicle list
    const currentIds = new Set(interpolatedVehicles.map((v) => v.id));
    currentMarkers.forEach((marker, id) => {
      if (!currentIds.has(id)) {
        marker.remove();
        currentMarkers.delete(id);
      }
    });

    interpolatedVehicles.forEach((v) => {
      if (v.lat === 0 && v.lng === 0) return;

      if (currentMarkers.has(v.id)) {
        // Update position + rotation
        const marker = currentMarkers.get(v.id)!;
        marker.setLngLat([v.lng, v.lat]);
        const el = marker.getElement();
        el.style.transform = `rotate(${v.heading}deg)`;
        // Update selected ring
        const hasRing = el.querySelector(".marker-selected-ring");
        const shouldHaveRing = v.id === selectedId;
        if (shouldHaveRing && !hasRing) {
          const ring = document.createElement("div");
          ring.className = "marker-selected-ring";
          ring.style.cssText = `
            position: absolute; inset: -4px; border-radius: 50%;
            border: 2px solid #3B82F6;
            box-shadow: 0 0 0 4px rgba(59,130,246,0.2);
            pointer-events: none;
          `;
          el.appendChild(ring);
        } else if (!shouldHaveRing && hasRing) {
          hasRing.remove();
        }
      } else {
        // Create new marker
        const el = createTruckMarkerElement(v, v.id === selectedId);
        const marker = new Marker({ element: el, anchor: "center" })
          .setLngLat([v.lng, v.lat])
          .addTo(map);

        el.addEventListener("click", () => {
          onSelectVehicle?.(v.id);
        });

        currentMarkers.set(v.id, marker);
      }
    });
  }, [isReady, interpolatedVehicles, selectedId, onSelectVehicle]);

  /* ── Fly to selected ────────────────────────────────────────── */
  useEffect(() => {
    if (!isReady || !selectedId || !mapRef.current) return;
    const v = interpolatedVehicles.find((x) => x.id === selectedId);
    if (!v) return;

    mapRef.current.easeTo({
      center: [v.lng, v.lat],
      zoom: 14,
      pitch: 45,
      duration: 600,
    });
  }, [selectedId, isReady, interpolatedVehicles]);

  /* ── Render routes when visibility/selection changes ─────────── */
  useEffect(() => {
    if (!isReady || !mapRef.current) return;
    const map = mapRef.current;

    // Clear old route layers and sources
    routeLayerIds.current.forEach((id) => { if (map.getLayer(id)) map.removeLayer(id); });
    routeSources.current.forEach((id) => { if (map.getSource(id)) map.removeSource(id); });
    routeLayerIds.current.clear();
    routeSources.current.clear();

    const selected = interpolatedVehicles.find((v) => v.id === selectedId);
    if (!selected) return;

    // Add GeoJSON line
    const addGeoJSONLine = (
      id: string,
      coords: LngLat[],
      paint: Record<string, unknown>,
      layout: Record<string, unknown> = {}
    ) => {
      if (!map.getSource(id)) {
        map.addSource(id, {
          type: "geojson",
          data: {
            type: "Feature",
            geometry: { type: "LineString", coordinates: coords.map((c) => [c.lng, c.lat]) },
            properties: {},
          } as GeoJSON.Feature,
        });
        map.addLayer({ id, type: "line", source: id, paint, layout } as maplibregl.LayerSpecification);
        routeLayerIds.current.add(id);
        routeSources.current.add(id);
      }
    };

    // Look up original vehicle for route data
    const originalVehicle = vehicles.find((v) => v.id === selectedId);
    if (!originalVehicle) return;

    const planned = (originalVehicle as MapVehicle).routePlanned;
    const actual = (originalVehicle as MapVehicle).routeActual;
    const deviation = (originalVehicle as MapVehicle).deviationPoints;

    // Planned route — dashed gray
    if (visibility.plannedRoute && planned?.length) {
      addGeoJSONLine(
        "planned-route",
        planned,
        { "line-color": "#5E6773", "line-width": 3, "line-opacity": 0.7, "line-dasharray": [4, 4] },
        {}
      );
    }

    // Actual route — solid green
    if (visibility.actualRoute && actual?.length) {
      addGeoJSONLine(
        "actual-route",
        actual,
        { "line-color": "#10B981", "line-width": 4, "line-opacity": 0.9 },
        {}
      );
    }

    // Deviation points
    if (visibility.actualRoute && deviation?.length) {
      deviation.forEach((pt: LngLat, i: number) => {
        const devId = `deviation-${i}`;
        map.addSource(devId, {
          type: "geojson",
          data: {
            type: "Feature",
            geometry: { type: "Point", coordinates: [pt.lng, pt.lat] },
            properties: {},
          } as GeoJSON.Feature,
        });
        map.addLayer({
          id: devId,
          type: "circle",
          source: devId,
          paint: {
            "circle-radius": 6,
            "circle-color": "#F97316",
            "circle-opacity": 0.9,
            "circle-stroke-width": 2,
            "circle-stroke-color": "#fff",
          },
        } as maplibregl.CircleLayerSpecification);
        routeLayerIds.current.add(devId);
        routeSources.current.add(devId);
      });
    }
  }, [isReady, selectedId, visibility, interpolatedVehicles]);

  return (
    <div className={`relative w-full h-full ${className}`}>
      <div ref={containerRef} className="absolute inset-0" />

      {!isReady && !mapError && (
        <div className="absolute inset-0 flex items-center justify-center bg-bg">
          <div className="flex flex-col items-center gap-3">
            <div className="h-8 w-8 rounded-full border-2 border-brand border-t-transparent animate-spin" />
            <span className="text-sm text-muted">Loading map...</span>
          </div>
        </div>
      )}

      {mapError && (
        <div className="absolute inset-0 flex items-center justify-center bg-bg">
          <div className="text-center">
            <p className="text-sm font-semibold text-st-offline mb-1">Map failed to load</p>
            <p className="text-xs text-muted">{mapError}</p>
          </div>
        </div>
      )}

      {isReady && children}
    </div>
  );
}

/* ─── Truck marker DOM element ──────────────────────────────────────────── */
function createTruckMarkerElement(
  vehicle: InterpolatedVehicle & { lng: number; lat: number; routePlanned?: LngLat[]; routeActual?: LngLat[]; deviationPoints?: LngLat[]; taskLabel?: string },
  isSelected: boolean
): HTMLDivElement {
  const color = STATUS_COLORS[vehicle.status] ?? "#64748B";
  const wrap = document.createElement("div");
  wrap.style.cssText = `
    position: relative;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    width: 32px;
    height: 32px;
    transform: rotate(${vehicle.heading}deg);
    transition: transform 0.3s ease-out;
  `;

  // Halo pulse (driving)
  if (vehicle.status === "driving") {
    const halo = document.createElement("div");
    halo.style.cssText = `
      position: absolute; inset: -6px; border-radius: 50%;
      border: 2px solid #22D3EE; opacity: 0.6;
      animation: vanguard-pulse 2s ease-in-out infinite;
    `;
    wrap.appendChild(halo);
  }

  // Offline dim
  if (vehicle.status === "offline") {
    wrap.style.opacity = "0.55";
  }

  // Motion trail (driving)
  if (vehicle.status === "driving") {
    const trail = document.createElement("div");
    trail.style.cssText = `
      position: absolute; left: 50%; bottom: -8px; transform: translateX(-50%) rotate(180deg);
      width: 2px; height: 10px; border-radius: 1px;
      background: linear-gradient(to bottom, ${color}, transparent); opacity: 0.5;
    `;
    wrap.appendChild(trail);
  }

  // Selected ring
  if (isSelected) {
    const ring = document.createElement("div");
    ring.className = "marker-selected-ring";
    ring.style.cssText = `
      position: absolute; inset: -4px; border-radius: 50%;
      border: 2px solid #3B82F6;
      box-shadow: 0 0 0 4px rgba(59,130,246,0.2);
      pointer-events: none;
    `;
    wrap.appendChild(ring);
  }

  // Glow filter for driving
  const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
  svg.setAttribute("viewBox", "0 0 32 32");
  svg.setAttribute("width", "28");
  svg.setAttribute("height", "28");
  svg.style.overflow = "visible";

  if (vehicle.status === "driving") {
    const defs = document.createElementNS("http://www.w3.org/2000/svg", "defs");
    const filter = document.createElementNS("http://www.w3.org/2000/svg", "filter");
    filter.setAttribute("id", `glow-${vehicle.id}-${Math.random().toString(36).slice(2)}`);
    filter.innerHTML = `<feDropShadow dx="0" dy="0" stdDeviation="3" flood-color="#22D3EE" flood-opacity="0.6"/>`;
    defs.appendChild(filter);
    svg.appendChild(defs);
    svg.setAttribute("filter", filter.getAttribute("id")!);
  }

  const path = document.createElementNS("http://www.w3.org/2000/svg", "path");
  path.setAttribute("d", "M16 3 L24 28 L16 24 L8 28 Z");
  path.setAttribute("fill", color);
  path.setAttribute("stroke", isSelected ? "#3B82F6" : "rgba(0,0,0,0.3)");
  path.setAttribute("stroke-width", "1.5");
  svg.appendChild(path);

  const dot = document.createElementNS("http://www.w3.org/2000/svg", "circle");
  dot.setAttribute("cx", "16");
  dot.setAttribute("cy", "16");
  dot.setAttribute("r", "3");
  dot.setAttribute("fill", "rgba(255,255,255,0.9)");
  svg.appendChild(dot);
  wrap.appendChild(svg);

  // Label chip
  const label = document.createElement("div");
  label.style.cssText = `
    position: absolute; top: calc(100% + 4px); left: 50%; transform: translateX(-50%);
    background: #14181D; border: 1px solid #262C34; border-radius: 4px;
    padding: 2px 6px; white-space: nowrap;
    font-family: monospace; font-size: 9px; font-weight: 600;
    color: #E6EAEF; letter-spacing: 0.02em; pointer-events: none;
    box-shadow: 0 2px 8px rgba(0,0,0,0.4); z-index: 20;
  `;
  label.textContent = vehicle.plate;
  wrap.appendChild(label);

  // Task sub-label
  if (vehicle.taskLabel) {
    const task = document.createElement("div");
    task.style.cssText = `
      position: absolute; top: calc(100% + 22px); left: 50%; transform: translateX(-50%);
      background: rgba(20,24,29,0.85); border: 1px solid #262C34; border-radius: 4px;
      padding: 1px 5px; white-space: nowrap;
      font-family: monospace; font-size: 8px; color: #9AA4B2; pointer-events: none; z-index: 20;
    `;
    task.textContent = vehicle.taskLabel;
    wrap.appendChild(task);
  }

  return wrap;
}
