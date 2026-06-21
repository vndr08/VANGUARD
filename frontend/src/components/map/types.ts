/**
 * VANGUARD Map Types
 * Source: DESIGN.md §7, §2.3, §3
 */

import type { Vehicle } from "@/types";

/* ─── Vehicle Status (from DESIGN.md §2.3) ──────────────────────────────── */
export type VehicleStatus = "driving" | "idle" | "stop" | "offline" | "delayed";

/* ─── Status colors (DESIGN.md §2.3) ─────────────────────────────────── */
export const STATUS_COLORS: Record<VehicleStatus, string> = {
  driving: "#10B981",   // emerald
  idle:    "#F59E0B",   // amber
  stop:    "#64748B",   // slate
  offline: "#EF4444",   // red
  delayed: "#F97316",   // orange
};

export const STATUS_BG: Record<VehicleStatus, string> = {
  driving: "rgba(16, 185, 129, 0.12)",
  idle:    "rgba(245, 158, 11, 0.12)",
  stop:    "rgba(100, 116, 139, 0.12)",
  offline: "rgba(239, 68, 68, 0.12)",
  delayed: "rgba(249, 115, 22, 0.12)",
};

/* ─── LngLat point ────────────────────────────────────────────────────── */
export interface LngLat {
  lng: number;
  lat: number;
}

/* ─── Extended vehicle with map-specific data ─────────────────────────── */
export interface MapVehicle extends Vehicle {
  /** Smoothed/interpolated position for animation */
  displayLng: number;
  displayLat: number;
  displayHeading: number;
  /** Interpolated or raw status */
  displayStatus: VehicleStatus;
  /** Current task label */
  taskLabel?: string;
  /** Route coordinates for this vehicle */
  routePlanned?: LngLat[];
  routeActual?: LngLat[];
  /** Deviation points (speeding locations) */
  deviationPoints?: LngLat[];
  /** Cluster count (if clustered) */
  clusterCount?: number;
}

/* ─── Task / Trip data (TRAMOS §8.7) ─────────────────────────────────── */
export interface TripInfo {
  tripName: string;
  tripType: "Main Task" | "Pre Task";
  origin: string;        // e.g. "DC BEKASI"
  destination: string;   // e.g. "PTT BDG2"
  distance: number;      // km
  status: "Waiting" | "Progress" | "Completed";
}

export interface TaskInfo {
  taskRef: string;
  taskName: string;
  scheduleStart: string;
  scheduleEnd: string;
  vehiclePlate: string;
  vehicleBrand: string;
  driverName: string;
  trips: TripInfo[];
}

export interface VehicleDetail {
  vehicle: MapVehicle;
  task?: TaskInfo;
  traveled: {
    distance: number;       // km traveled
    duration: string;       // e.g. "4h 23m"
    avgSpeed: number;       // km/h
  };
  estimated: {
    distanceLeft: number;   // km
    timeLeft: string;       // e.g. "1h 18m"
    arriveAt: string;        // e.g. "14:32"
  };
}

/* ─── Route point markers ──────────────────────────────────────────────── */
export interface RouteMarker {
  type: "start" | "end";
  label: string;
  coord: LngLat;
}

/* ─── Layer visibility ────────────────────────────────────────────────── */
export interface LayerVisibility {
  showTrack: boolean;        // Current vehicle trail
  plannedRoute: boolean;      // Dashed planned route
  actualRoute: boolean;       // Solid actual route
  checkpoint: boolean;        // Start/End markers
  geofence: boolean;          // Geofence polygons
  cluster: boolean;           // Vehicle clusters
}

/* ─── Map config ──────────────────────────────────────────────────────── */
export const DEFAULT_LAYER_VISIBILITY: LayerVisibility = {
  showTrack: true,
  plannedRoute: true,
  actualRoute: true,
  checkpoint: true,
  geofence: false,
  cluster: true,
};

/* ─── MapLibre dark basemap (Graphite Command palette) ────────────────── */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const GRAPHITE_DARK_STYLE: any = {
  version: 8,
  name: "VANGUARD Graphite Dark",
  sources: {
    "carto-dark": {
      type: "vector",
      url: "https://basemaps.cartocdn.com/gl/dark-matter-gl-style/style.json",
    },
  },
  layers: [
    {
      id: "background",
      type: "background",
      paint: { "background-color": "#0B0E11" },
    },
    {
      id: "water",
      type: "background",
      filter: ["==", "$type", "Polygon"],
      paint: { "background-color": "#0E141B" },
    },
    {
      id: "carto-water",
      type: "fill",
      source: "carto-dark",
      "source-layer": "water",
      paint: { "fill-color": "#0E141B" },
    },
    {
      id: "carto-land",
      type: "fill",
      source: "carto-dark",
      "source-layer": "landuse",
      paint: { "fill-color": "#0B0E11" },
    },
    {
      id: "carto-road",
      type: "line",
      source: "carto-dark",
      "source-layer": "road",
      paint: {
        "line-color": "#1C2128",
        "line-width": ["interpolate", ["linear"], ["zoom"], [5, 0.5], [10, 2], [14, 6]],
      },
    },
    {
      id: "carto-road-major",
      type: "line",
      source: "carto-dark",
      "source-layer": "road",
      filter: ["in", ["get", "class"], ["literal", ["motorway", "trunk", "primary"]]],
      paint: {
        "line-color": "#242B33",
        "line-width": ["interpolate", ["linear"], ["zoom"], [5, 1], [10, 3], [14, 8]],
      },
    },
    {
      id: "carto-label-place",
      type: "symbol",
      source: "carto-dark",
      "source-layer": "place",
      layout: {
        "text-field": ["get", "name"],
        "text-size": ["interpolate", ["linear"], ["zoom"], [4, 10], [10, 14]],
        "text-font": ["Noto Sans Regular"],
      },
      paint: {
        "text-color": "#5E6773",
        "text-halo-color": "#0B0E11",
        "text-halo-width": 1,
      },
    },
    {
      id: "carto-label-road",
      type: "symbol",
      source: "carto-dark",
      "source-layer": "road",
      filter: ["in", ["get", "class"], ["literal", ["motorway", "trunk", "primary"]]],
      layout: {
        "symbol-placement": "line",
        "text-field": ["get", "name"],
        "text-size": 11,
        "text-font": ["Noto Sans Regular"],
      },
      paint: {
        "text-color": "#5E6773",
        "text-halo-color": "#0B0E11",
        "text-halo-width": 1,
      },
    },
    {
      id: "carto-poi",
      type: "symbol",
      source: "carto-dark",
      "source-layer": "poi",
      layout: {
        "text-field": ["get", "name"],
        "text-size": 10,
        "text-font": ["Noto Sans Regular"],
      },
      paint: {
        "text-color": "#3D4852",
        "text-halo-color": "#0B0E11",
        "text-halo-width": 0.5,
      },
    },
  ],
};

/* ─── Interpolated vehicle state ──────────────────────────────────────── */
export interface InterpolatedVehicle {
  id: number;
  /** Lerped from previous to current */
  lng: number;
  lat: number;
  /** Lerped heading (0–360°) */
  heading: number;
  status: VehicleStatus;
  speed: number;
  plate: string;
  taskLabel?: string;
  isMoving: boolean;
}

/* ─── WebSocket message types (for real-time) ─────────────────────────── */
export interface WsTelemetryMessage {
  type: "telemetry";
  vehicleId: number;
  lat: number;
  lng: number;
  heading: number;
  speed: number;
  status: VehicleStatus;
  timestamp: string;
}

export interface WsAlertMessage {
  type: "alert";
  vehicleId: number;
  plate: string;
  alertType: "speeding" | "geofence" | "gps_delayed" | "offline";
  speed?: number;
  location?: string;
  timestamp: string;
}
