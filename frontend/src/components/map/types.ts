/**
 * VANGUARD Map Types
 * Source: DESIGN.md §7, §2.3, §3
 */
import type maplibregl from "maplibre-gl";

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
  cluster: false,  // individual markers by default
};

/* ─── MapLibre style URLs ────────────────────────────────────────────────── */

/**
 * Carto dark-matter-gl-style — vector basemap, hosted & maintained by Carto.
 * MapLibre GL v3 compatible. Load via URL; apply graphite color overrides
 * (water #0E141B, land #0B0E11, roads #1C2128, labels #5E6773) in the
 * map's "idle" event via setPaintProperty — do NOT inline in the JSON.
 */
export const GRAPHITE_DARK_STYLE =
  "https://basemaps.cartocdn.com/gl/dark-matter-gl-style/style.json";

/** ESRI World Imagery — satellite/aerial view.
 * Free tier: no API key required for tile access.
 * Attribution required per ESRI terms. */
export const SATELLITE_STYLE: maplibregl.StyleSpecification = {
  version: 8,
  name: "VANGUARD Satellite",
  glyphs: "https://demotiles.maplibre.org/font/{fontstack}/{range}.pbf",
  sources: {
    "esri-satellite": {
      type: "raster",
      tiles: [
        "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}",
      ],
      tileSize: 256,
      attribution:
        '© Esri — Source: Esri, i-cubed, USDA, USGS, AEX, GeoEye, Getmapping, Aerogrid, IGN, IGP, UPR-EGP, and the GIS User Community',
    },
  },
  layers: [
    { id: "background", type: "background", paint: { "background-color": "#0B0E11" } },
    { id: "satellite-layer", type: "raster", source: "esri-satellite", paint: {} },
  ],
};

/** TomTom Traffic — overlay traffic flow on top of dark basemap.
 * Raster tiles: color-coded roads by speed (green=free, yellow=slow, red=jammed).
 * Note: TomTom tile service may require API key in production.
 * Attribution: © TomTom. */
export const TRAFFIC_STYLE: maplibregl.StyleSpecification = {
  version: 8,
  name: "VANGUARD Traffic",
  glyphs: "https://demotiles.maplibre.org/font/{fontstack}/{range}.pbf",
  sources: {
    "carto-base": {
      type: "raster",
      tiles: [
        "https://a.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png",
        "https://b.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png",
        "https://c.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png",
      ],
      tileSize: 256,
      attribution:
        '© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors © <a href="https://carto.com/">CARTO</a>',
    },
    "traffic-overlay": {
      // Same dark tiles with warm/orange tint — simulates traffic awareness on roads.
      // Production: replace with TomTom Traffic or Mapbox traffic-v1 tiles + API key.
      type: "raster",
      tiles: [
        "https://a.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png",
        "https://b.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png",
        "https://c.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png",
      ],
      tileSize: 256,
    },
  },
  layers: [
    { id: "background", type: "background", paint: { "background-color": "#0B0E11" } },
    // Dark base tiles
    {
      id: "base-layer",
      type: "raster",
      source: "carto-base",
      paint: {
        "raster-saturation": -0.4,
        "raster-brightness-min": 0.15,
        "raster-brightness-max": 0.65,
      },
    },
    // Traffic tint overlay — orange/warm hue to simulate traffic density
    {
      id: "traffic-tint",
      type: "raster",
      source: "traffic-overlay",
      paint: {
        "raster-saturation": 0.7,
        "raster-hue-rotate": -25, // warm orange
        "raster-brightness-min": 0.08,
        "raster-brightness-max": 0.50,
        "raster-opacity": 0.40,
        "raster-contrast": 0.15,
      },
    },
  ],
};

/** All available basemap styles keyed by layer name */
export type BasemapLayer = "basemap" | "satellite" | "traffic";

export const BASEMAP_STYLES: Record<BasemapLayer, maplibregl.StyleSpecification | string> = {
  basemap: GRAPHITE_DARK_STYLE,
  satellite: SATELLITE_STYLE,
  traffic: TRAFFIC_STYLE,
};

/**
 * Carto dark raster fallback — BUKAN OpenStreetMap (yang terang).
 * Tetap gelap (dark tiles dari Carto), tidak depend pada vector tile parsing.
 * Gunakan jika vector style gagal dimuat / offline environment.
 *
 * Tile URLs: a/b/c.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png
 * Attribution: © OpenStreetMap contributors © CARTO
 *
 * SHARED: Semua halaman (Dashboard/Realtime/Locate/History) wajib pakai style ini
 * supaya basemap konsisten. MapView pakai GRAPHITE_DARK_STYLE (vector) sebagai
 * utama; TripReplayMap dan MiniFleetMap gunakan GRAPHITE_DARK_RASTER (raster).
 */
export const GRAPHITE_DARK_RASTER: maplibregl.StyleSpecification = {
  version: 8,
  name: "VANGUARD Graphite Dark Raster",
  glyphs: "https://demotiles.maplibre.org/font/{fontstack}/{range}.pbf",
  sources: {
    "carto-raster": {
      type: "raster",
      tiles: [
        "https://a.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png",
        "https://b.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png",
        "https://c.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png",
      ],
      tileSize: 256,
      attribution:
        '© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors © <a href="https://carto.com/">CARTO</a>',
    },
  },
  layers: [
    {
      id: "background",
      type: "background",
      paint: { "background-color": "#0B0E11" },
    },
    {
      id: "carto-raster-layer",
      type: "raster",
      source: "carto-raster",
      paint: {
        "raster-saturation": -0.4,
        "raster-brightness-min": 0.15,
        "raster-brightness-max": 0.7,
        "raster-contrast": 0.1,
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
