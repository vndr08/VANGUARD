"use client";

import { useEffect, useRef, useState, useCallback, forwardRef, useImperativeHandle } from "react";
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
  BASEMAP_STYLES,
  InterpolatedVehicle,
} from "./types";
import {
  useMapInterpolation,
  useLayerVisibility,
  useMapTheme,
} from "@/hooks/useMapHooks";
import { toLngLat, toLngLatArray, isValidLngLat, buildFitBounds } from "@/lib/geo";

/* ─── Props ──────────────────────────────────────────────────────────────── */
export interface MapViewProps {
  vehicles: MapVehicle[];
  selectedId?: number | null;
  onSelectVehicle?: (id: number) => void;
  center?: [number, number];
  zoom?: number;
  pitch?: number;
  className?: string;
  children?: React.ReactNode;
  /** Called once the map is ready with an object containing imperative commands (e.g. fitAll) */
  onMapReady?: (commands: MapViewRef) => void;
  /** Layer visibility — single source of truth from page (not internal hook) */
  visibility?: LayerVisibility;
  /** Toggle a layer visibility key (for DetailPanel callbacks) */
  onToggleLayer?: (key: keyof LayerVisibility) => void;
  /** Active basemap: "basemap" | "satellite" | "traffic" */
  mapLayer?: "basemap" | "satellite" | "traffic";
}

/* ─── Graphite color overrides (applied after style loads) ───────────────── */

/**
 * Apply graphite palette overrides to Carto dark-matter-gl-style layers.
 * Uses map.setPaintProperty / setLayoutProperty after "idle" so we don't
 * depend on inline style JSON expressions (the root cause of the v3 parse crash).
 *
 * Graphite palette (DESIGN.md §7):
 *   water       #0E141B   (was #101521)
 *   land        #0B0E11   (was #0B0E11)
 *   roads       #1C2128   (was #2D3440)
 *   major roads #242B33   (was #3B4654)
 *   labels      #5E6773   (was #8B9AAD)
 */
function applyGraphiteOverrides(map: MLMap) {
  // Background / land
  const bgLayers = ["land", "landcover", "earth"];
  bgLayers.forEach((id) => {
    if (map.getLayer(id)) {
      try { map.setPaintProperty(id, "background-color", "#0B0E11"); } catch { /* noop */ }
    }
  });

  // Water
  const waterLayers = ["water", "waterway"];
  waterLayers.forEach((id) => {
    if (map.getLayer(id)) {
      try { map.setPaintProperty(id, "fill-color", "#0E141B"); } catch { /* noop */ }
    }
  });

  // Roads — apply to all road layers; skip if missing
  const roadLayers = [
    "road",
    "road-trunk",
    "road-primary",
    "road-secondary-tertiary",
    "road-street",
    "road-path",
    "tunnel",
    "bridge",
  ];
  roadLayers.forEach((id) => {
    if (map.getLayer(id)) {
      try {
        map.setPaintProperty(id, "line-color", "#1C2128");
      } catch { /* noop */ }
    }
  });

  // Major roads — thicker, slightly lighter
  const majorLayers = [
    "road-motorway",
    "road-trunk",
    "road-primary",
    "road-motorway-link",
    "road-trunk-link",
    "road-primary-link",
  ];
  majorLayers.forEach((id) => {
    if (map.getLayer(id)) {
      try {
        map.setPaintProperty(id, "line-color", "#242B33");
        map.setPaintProperty(id, "line-width", 3);
      } catch { /* noop */ }
    }
  });

  // Labels — desaturate + darken
  const labelLayers = [
    "place-label",
    "place-label-other",
    "place-label-city",
    "road-label",
    "road-label-small",
    "road-label-medium",
    "road-label-large",
    "poi-label",
    "waterway-label",
  ];
  labelLayers.forEach((id) => {
    if (map.getLayer(id)) {
      try {
        map.setPaintProperty(id, "text-color", "#5E6773");
        map.setPaintProperty(id, "text-halo-color", "#0B0E11");
        map.setPaintProperty(id, "text-halo-width", 1);
      } catch { /* noop */ }
    }
  });
}

/* ─── MapView (forwardRef for imperative fitAll) ──────────────────────────── */
export interface MapViewRef {
  fitAll: () => void;
}

const MapView = forwardRef<MapViewRef, MapViewProps>(function MapView({
  vehicles,
  selectedId,
  onSelectVehicle,
  center = [107.0, -6.5],
  zoom = 9,
  pitch = 45,
  className = "",
  children,
  onMapReady,
  visibility,
  onToggleLayer,
  mapLayer = "basemap",
}: MapViewProps, _forwardedRef) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<MLMap | null>(null);
  /** Vehicle markers — NEVER removed from this ref; only shown/hidden for cluster toggle */
  const vehicleMarkersRef = useRef<Map<number, Marker>>(new Map());
  /** Cluster bubble markers — created when cluster mode is ON */
  const clusterBubbleRefs = useRef<Map<number, Marker>>(new Map());
  const routeLayerIds = useRef<Set<string>>(new Set());
  const routeSources = useRef<Set<string>>(new Set());
  const zoneLayerIds = useRef<Set<string>>(new Set());
  const zoneSources = useRef<Set<string>>(new Set());

  const [isReady, setIsReady] = useState(false);
  const [mapError, setMapError] = useState<string | null>(null);

  // Hooks
  const interpolatedVehicles = useMapInterpolation(vehicles);
  // visibility is optionally passed from parent (TrackingMap), or from local default
  const { visibility: localVis, toggle: localToggle } = useLayerVisibility(DEFAULT_LAYER_VISIBILITY);
  const effectiveVisibility = visibility ?? localVis;
  const effectiveToggle = onToggleLayer ?? localToggle;
  const isDark = useMapTheme();

  // Expose fitAll() via ref for parent components (e.g. Locate "Pusatkan semua unit")
  const fitAll = useCallback(() => {
    if (!isReady || !mapRef.current) return;
    const map = mapRef.current;
    const result = buildFitBounds(interpolatedVehicles, 64, 16);
    if (!result) return;
    map.fitBounds(result.bounds, result.options);
  }, [isReady, interpolatedVehicles]);

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  (useImperativeHandle as any)(_forwardedRef, () => ({ fitAll }), [fitAll]);

  // Stable counter — incremented each effect run; used to detect stale map/load callbacks
  const mapInstanceIdRef = useRef(0);

  /* ── Init MapLibre ─────────────────────────────────────────── */
  useEffect(() => {
    if (!containerRef.current || mapRef.current) return;

    const currentInstanceId = ++mapInstanceIdRef.current; // capture for this run
    let readyTimeout: ReturnType<typeof setTimeout> | null = null;

    // Safety net: if style never fires "load" (CDN down / offline), force isReady=true
    // after 5 s so the map at least renders its container (markers via coords, not tiles).
    readyTimeout = setTimeout(() => {
      // Only fire if this is STILL the current map instance
      if (mapInstanceIdRef.current === currentInstanceId) {
        console.warn("[MapView] Style load timeout — forcing isReady=true");
        setIsReady(true);
        onMapReady?.({ fitAll });
      }
    }, 5000);

    try {
      const map = new MLMap({
        container: containerRef.current,
        style: GRAPHITE_DARK_STYLE, // string URL — Carto dark-matter-gl-style v3-compatible
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

      map.on("load", () => {
        // Only respond if this is the current map instance (not removed by HMR cleanup)
        if (mapInstanceIdRef.current !== currentInstanceId) return;
        if (readyTimeout) { clearTimeout(readyTimeout); readyTimeout = null; }
        console.log("[MapView] setIsReady(true) — map.load fired", {
          vehicleCount: vehicles.length,
          mapLayer,
          style: map.getStyle()?.name,
          instance: currentInstanceId,
        });
        setIsReady(true);
        onMapReady?.({ fitAll });
        map.once("idle", () => {
          if (mapInstanceIdRef.current === currentInstanceId) applyGraphiteOverrides(map);
        });
      });
      map.on("error", (e) => {
        console.error("[MapView] MapLibre error:", e.error?.message);
        setMapError(e.error?.message ?? "Map failed to load");
      });

      mapRef.current = map;

      return () => {
        // Only clean up if THIS is the current map instance.
        // If HMR has already started a new map, this old cleanup must NOT remove it.
        if (mapInstanceIdRef.current !== currentInstanceId) return;
        if (readyTimeout) { clearTimeout(readyTimeout); readyTimeout = null; }
        vehicleMarkersRef.current.forEach((m) => m.remove());
        vehicleMarkersRef.current.clear();
        clusterBubbleRefs.current.forEach((m) => m.remove());
        clusterBubbleRefs.current.clear();
        routeLayerIds.current.forEach((id) => { if (map.getLayer(id)) map.removeLayer(id); });
        routeSources.current.forEach((id) => { if (map.getSource(id)) map.removeSource(id); });
        zoneLayerIds.current.forEach((id) => { if (map.getLayer(id)) map.removeLayer(id); });
        zoneSources.current.forEach((id) => { if (map.getSource(id)) map.removeSource(id); });
        map.remove();
        mapRef.current = null;
      };
    } catch (err) {
      console.error("[MapView] Init error:", err);
      if (readyTimeout) { clearTimeout(readyTimeout); readyTimeout = null; }
      setMapError(String(err));
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  /* ── Update markers ─────────────────────────────────────────── */
  useEffect(() => {
    if (!isReady || !mapRef.current) return;
    const map = mapRef.current;
    const currentMarkers = vehicleMarkersRef.current;
    console.log("[MapView] Marker effect running:", {
      isReady,
      mapExists: !!map,
      vehicleCount: interpolatedVehicles.length,
      existingMarkers: currentMarkers.size,
    });

    try {
    // Remove markers no longer in vehicle list
    const currentIds = new Set(interpolatedVehicles.map((v) => v.id));
    currentMarkers.forEach((marker, id) => {
      if (!currentIds.has(id)) {
        marker.remove();
        currentMarkers.delete(id);
      }
    });

    interpolatedVehicles.forEach((v) => {
      // Guard: skip zero or invalid coordinates (prevents MapLibre crash)
      if (!isValidLngLat(v)) {
        if (v.lat !== 0 || v.lng !== 0) {
          console.warn("[MapView] Skipping vehicle with invalid coords:", v.id, { lat: v.lat, lng: v.lng });
        }
        return;
      }

      console.log("[MapView] Processing marker:", v.id, "hasMarker:", currentMarkers.has(v.id));

      if (currentMarkers.has(v.id)) {
        // Existing marker — update position. Also re-add if removed by cluster effect
        // by checking a custom flag (marker._added = false after remove())
        const marker = currentMarkers.get(v.id);
        console.log("[MapView] Existing marker for", v.id, "marker:", !!marker);
        if (!marker) {
          console.error("[MapView] BUG: has()=true but get()=null for vehicle", v.id);
          currentMarkers.delete(v.id);
          return;
        }
        if (!(marker as any)._added) {
          marker.addTo(map);
          (marker as any)._added = true;
        }
        marker.setLngLat([v.lng, v.lat]); // [lng, lat] ✓

        // Update selected ring
        const el = marker.getElement();
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
        // Create new marker — rotation handled separately via updateHeading effect
        const el = createTruckMarkerElement(v, v.id === selectedId);
        // Restore pointer-events so the click handler fires
        el.style.pointerEvents = "auto";
        console.log("[MapView] Creating new marker:", v.id, "plate:", v.plate, "at", v.lng, v.lat);
        try {
          const marker = new Marker({ element: el, anchor: "center" })
            .setLngLat([v.lng, v.lat])
            .addTo(map);
          (marker as any)._added = true;
          currentMarkers.set(v.id, marker);
          console.log("[MapView] ✅ Marker added to map:", v.id, "parent:", el.parentElement?.className, "mapReady:", !!(mapRef.current));
        } catch (err) {
          console.error("[MapView] ❌ Marker addTo failed:", v.id, err);
          return; // skip to next vehicle in forEach
        }

        el.addEventListener("click", () => {
          onSelectVehicle?.(v.id);
          // Fly to the clicked vehicle immediately
          if (isValidLngLat(v)) {
            map.easeTo({
              center: [v.lng, v.lat],
              zoom: Math.max(map.getZoom(), 13),
              pitch: 45,
              duration: 400,
            });
          }
        });
      }
    });

    // DIAGNOSTIC: Check DOM state right after forEach
    const containerDiv = map.getContainer();
    const mapCanvasContainer = (map as any)._canvasContainer;
    const markerEls = containerDiv.querySelectorAll('.maplibregl-marker');
    const markerPaneEl = containerDiv.querySelector('.maplibregl-marker-pane');
    const canvasContainerChildren = mapCanvasContainer ? Array.from(mapCanvasContainer.children).map(c => c.tagName + '.' + c.className) : 'N/A';
    const directChildren = Array.from(containerDiv.children).map(c => c.className);
    console.log("[MapView] Post-forEach DOM check:", {
      containerDivTag: containerDiv.tagName + '.' + containerDiv.className,
      canvasContainerSame: mapCanvasContainer === containerDiv,
      canvasContainerChildren,
      containerChildren: directChildren,
      markerElsCount: markerEls.length,
      markerPaneExists: !!markerPaneEl,
    });
    } catch (err) {
      console.error("[MapView] Marker effect error:", err);
    }
    console.log("[MapView] Marker update complete:", {
      totalVehicles: interpolatedVehicles.length,
      markersCreated: currentMarkers.size,
      mapLayer,
      selectedId,
    });
    if (interpolatedVehicles.length > 0 && currentMarkers.size === 0) {
      // Check first vehicle's coords
      const first = interpolatedVehicles[0];
      console.warn("[MapView] ⚠️ markers = 0 despite vehicles available:", {
        firstVehicle: { id: first.id, lat: first.lat, lng: first.lng },
        isValid: isValidLngLat(first),
        isReady,
      });
    }
  }, [isReady, interpolatedVehicles, selectedId, onSelectVehicle]); // heading intentionally excluded — rotation handled in updateHeading effect

  /* ── Update heading/rotation separately (no marker recreation) ── */
  useEffect(() => {
    if (!isReady) return;
    interpolatedVehicles.forEach((v) => {
      const marker = vehicleMarkersRef.current.get(v.id);
      if (!marker) return;
      const el = marker.getElement();
      // innerEl is the rotating content inside the marker wrapper
      const innerEl = el.querySelector<HTMLElement>(".marker-inner");
      if (innerEl) {
        innerEl.style.transform = `rotate(${v.heading}deg)`;
      }
    });
  }, [isReady, interpolatedVehicles]);

  /* ── Fly to selected ────────────────────────────────────────── */
  useEffect(() => {
    if (!isReady || !selectedId || !mapRef.current) return;
    const v = interpolatedVehicles.find((x) => x.id === selectedId);
    if (!v) return;

    // Guard: validate before flyTo to prevent "Invalid LngLat" crash
    if (!isValidLngLat(v)) {
      console.warn("[MapView] Cannot flyTo: invalid vehicle coords:", v.id, v);
      return;
    }

    mapRef.current.easeTo({
      center: [v.lng, v.lat], // [lng, lat] ✓
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
            // coords.map((c) => [c.lng, c.lat]) → toLngLatArray
            geometry: { type: "LineString", coordinates: toLngLatArray(coords) },
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
    if (effectiveVisibility.plannedRoute && planned?.length) {
      addGeoJSONLine(
        "planned-route",
        planned,
        { "line-color": "#5E6773", "line-width": 3, "line-opacity": 0.7, "line-dasharray": [4, 4] },
        {}
      );
    }

    // Actual route — solid green
    if (effectiveVisibility.actualRoute && actual?.length) {
      addGeoJSONLine(
        "actual-route",
        actual,
        { "line-color": "#10B981", "line-width": 4, "line-opacity": 0.9 },
        {}
      );
    }

    // Deviation points
    if (effectiveVisibility.actualRoute && deviation?.length) {
      deviation.forEach((pt: LngLat, i: number) => {
        const devId = `deviation-${i}`;
        map.addSource(devId, {
          type: "geojson",
          data: {
            type: "Feature",
            // pt.lng/pt.lat → toLngLat (defensive)
            geometry: { type: "Point", coordinates: toLngLat(pt) ?? [0, 0] },
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
  }, [isReady, selectedId, effectiveVisibility, interpolatedVehicles]);

  /* ── Basemap switching (Peta / Satelit / Lalu Lintas) ───────────────── */
  useEffect(() => {
    if (!isReady || !mapRef.current) return;
    const map = mapRef.current;
    const newStyle = BASEMAP_STYLES[mapLayer];

    // If already the same style, skip
    const currentStyleName = map.getStyle()?.name;
    const newStyleName = typeof newStyle === "string" ? newStyle : newStyle.name;
    if (currentStyleName === newStyleName) return;

    // Clear all custom layers before switching
    vehicleMarkersRef.current.forEach((m) => m.remove());
    vehicleMarkersRef.current.clear();
    clusterBubbleRefs.current.forEach((m) => m.remove());
    clusterBubbleRefs.current.clear();
    routeLayerIds.current.forEach((id) => { if (map.getLayer(id)) map.removeLayer(id); });
    routeSources.current.forEach((id) => { if (map.getSource(id)) map.removeSource(id); });
    routeLayerIds.current.clear();
    routeSources.current.clear();
    zoneLayerIds.current.forEach((id) => { if (map.getLayer(id)) map.removeLayer(id); });
    zoneSources.current.forEach((id) => { if (map.getSource(id)) map.removeSource(id); });
    zoneLayerIds.current.clear();
    zoneSources.current.clear();

    // Switch style — setStyle replaces the current style
    map.setStyle(newStyle);

    // When new style loads, re-apply graphite overrides and trigger marker re-render
    const onStyleLoad = () => {
      if (mapLayer === "basemap") {
        applyGraphiteOverrides(map);
      }
      setIsReady(true);
    };
    map.once("style.load", onStyleLoad);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isReady, mapLayer]);

  /* ── Cluster toggle — uses effectiveVisibility.cluster (from page state) ────── */
  useEffect(() => {
    if (!isReady || !mapRef.current) return;
    const map = mapRef.current;

    // Remove cluster bubbles
    clusterBubbleRefs.current.forEach((m) => m.remove());
    clusterBubbleRefs.current.clear();

    if (!effectiveVisibility.cluster) {
      // CLUSTER OFF: re-add all vehicle markers (markersRef still holds them all)
      vehicleMarkersRef.current.forEach((m) => {
        if (!(m as any)._added) {
          m.addTo(map);
          (m as any)._added = true;
        }
      });
    } else {
      // CLUSTER ON: hide individual vehicle markers
      vehicleMarkersRef.current.forEach((m) => {
        if ((m as any)._added) {
          m.remove();
          (m as any)._added = false;
        }
      });

      const GRID = 0.5; // degrees per cell
      const clusters = new Map<string, (typeof interpolatedVehicles)[number][]>();
      interpolatedVehicles.forEach((v) => {
        const cx = Math.floor((v.lng ?? 0) / GRID) * GRID;
        const cy = Math.floor((v.lat ?? 0) / GRID) * GRID;
        const key = `${cx},${cy}`;
        if (!clusters.has(key)) clusters.set(key, []);
        clusters.get(key)!.push(v);
      });

      clusters.forEach((group, key) => {
        if (group.length <= 1) return;
        const [cx, cy] = key.split(",").map(Number);
        const el = document.createElement("div");
        el.style.cssText = `
          width: 36px; height: 36px; border-radius: 50%;
          background: #3B82F6; border: 2px solid white;
          display: flex; align-items: center; justify-content: center;
          font-size: 11px; font-weight: 700; color: white; font-family: monospace;
          box-shadow: 0 2px 8px rgba(0,0,0,0.4); cursor: pointer;
        `;
        el.textContent = group.length > 9 ? "9+" : String(group.length);
        el.title = `${group.length} units in cluster`;
        el.addEventListener("click", () => {
          map.easeTo({ center: [cx + GRID / 2, cy + GRID / 2], zoom: map.getZoom() + 2 });
        });
        const bubble = new Marker({ element: el, anchor: "center" })
          .setLngLat([cx + GRID / 2, cy + GRID / 2])
          .addTo(map);
        clusterBubbleRefs.current.set(group[0].id, bubble);
      });
    }
  }, [isReady, effectiveVisibility]);

  /* ── Zone / Geofence toggle ──────────────────────────────────────────── */
  useEffect(() => {
    if (!isReady || !mapRef.current) return;
    const map = mapRef.current;

    // Clear old zone layers
    zoneLayerIds.current.forEach((id) => { if (map.getLayer(id)) map.removeLayer(id); });
    zoneSources.current.forEach((id) => { if (map.getSource(id)) map.removeSource(id); });
    zoneLayerIds.current.clear();
    zoneSources.current.clear();

    if (!effectiveVisibility.geofence) return;

    // Mock geofence polygons — replace with API data in production
    const mockGeofences: GeoJSON.Feature<GeoJSON.Polygon>[] = [
      {
        type: "Feature",
        properties: { name: "DC BEKASI", color: "#3B82F6" },
        geometry: {
          type: "Polygon",
          coordinates: [[[106.90, -6.22], [106.96, -6.22], [106.96, -6.16], [106.90, -6.16], [106.90, -6.22]]],
        },
      },
      {
        type: "Feature",
        properties: { name: "PTT BANDUNG", color: "#10B981" },
        geometry: {
          type: "Polygon",
          coordinates: [[[107.60, -6.90], [107.65, -6.90], [107.65, -6.85], [107.60, -6.85], [107.60, -6.90]]],
        },
      },
      {
        type: "Feature",
        properties: { name: "SENTUL CITY", color: "#F97316" },
        geometry: {
          type: "Polygon",
          coordinates: [[[106.80, -6.50], [106.88, -6.50], [106.88, -6.43], [106.80, -6.43], [106.80, -6.50]]],
        },
      },
    ];

    const sourceId = "geofence-source";
    map.addSource(sourceId, {
      type: "geojson",
      data: { type: "FeatureCollection", features: mockGeofences },
    });
    zoneSources.current.add(sourceId);

    map.addLayer({
      id: "geofence-fill",
      type: "fill",
      source: sourceId,
      paint: { "fill-color": ["get", "color"], "fill-opacity": 0.12 },
    } as maplibregl.FillLayerSpecification);
    zoneLayerIds.current.add("geofence-fill");

    map.addLayer({
      id: "geofence-line",
      type: "line",
      source: sourceId,
      paint: { "line-color": ["get", "color"], "line-width": 1.5, "line-opacity": 0.8 },
    } as maplibregl.LineLayerSpecification);
    zoneLayerIds.current.add("geofence-line");

    map.addLayer({
      id: "geofence-label",
      type: "symbol",
      source: sourceId,
      layout: {
        "text-field": ["get", "name"],
        "text-size": 11,
        "text-anchor": "center",
      },
      paint: {
        "text-color": ["get", "color"],
        "text-halo-color": "#0B0E11",
        "text-halo-width": 1,
      },
    } as maplibregl.SymbolLayerSpecification);
    zoneLayerIds.current.add("geofence-label");
  }, [isReady, effectiveVisibility]);

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
});

export default MapView;


/* ─── Truck marker DOM element ──────────────────────────────────────────── */
/**
 * Marker element structure:
 *   outer (marker-wrapper) ← MapLibre applies transform: translate(...)
 *     inner (marker-inner) ← CSS rotation applied here (NOT on outer)
 *       halo (driving pulse)
 *       trail (driving motion trail)
 *       ring (selected ring)
 *       svg (truck icon)
 *       dot (center dot)
 *       label (plate number chip)
 *       task  (task label chip)
 *
 * Rotation is intentionally NOT baked into outer/inner here — it is applied
 * separately in the updateHeading effect so that heading changes do NOT cause
 * DOM element recreation (prevents marker "vibration" on zoom/pan).
 */
function createTruckMarkerElement(
  vehicle: InterpolatedVehicle & { lng: number; lat: number; routePlanned?: LngLat[]; routeActual?: LngLat[]; deviationPoints?: LngLat[]; taskLabel?: string },
  isSelected: boolean
): HTMLDivElement {
  const color = STATUS_COLORS[vehicle.status] ?? "#64748B";

  // Outer wrapper — MapLibre sets transform: translate(x,y)
  // DO NOT add rotation here (it conflicts with MapLibre's positioning transform)
  const wrap = document.createElement("div");
  wrap.style.cssText = `
    position: relative;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    width: 32px;
    height: 32px;
    pointer-events: auto;
    /* rotation applied via .marker-inner, not here */
  `;

  // Inner rotating element — rotation transform lives here, independent of MapLibre positioning.
  // NO transition here — MapLibre manages the outer transform (translate) and we must not
  // interfere with it. Any CSS transition on this inner element causes jitter during zoom
  // because MapLibre's position updates and the transition fight each other.
  const inner = document.createElement("div");
  inner.className = "marker-inner";
  inner.style.cssText = `
    position: relative;
    display: flex;
    align-items: center;
    justify-content: center;
    width: 100%;
    height: 100%;
    transform: rotate(${vehicle.heading}deg);
  `;
  wrap.appendChild(inner);

  // Halo pulse (driving)
  if (vehicle.status === "driving") {
    const halo = document.createElement("div");
    halo.style.cssText = `
      position: absolute; inset: -6px; border-radius: 50%;
      border: 2px solid #22D3EE; opacity: 0.6;
      animation: vanguard-pulse 2s ease-in-out infinite;
    `;
    inner.appendChild(halo);
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
    inner.appendChild(trail);
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
    inner.appendChild(ring);
  }

  // Glow filter for driving (deterministic ID — no Math.random)
  const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
  svg.setAttribute("viewBox", "0 0 32 32");
  svg.setAttribute("width", "28");
  svg.setAttribute("height", "28");
  svg.style.overflow = "visible";

  if (vehicle.status === "driving") {
    const defs = document.createElementNS("http://www.w3.org/2000/svg", "defs");
    const filter = document.createElementNS("http://www.w3.org/2000/svg", "filter");
    // Deterministic filter ID — stable across re-renders (marker not recreated for heading changes)
    filter.setAttribute("id", `glow-${vehicle.id}`);
    filter.innerHTML = `<feDropShadow dx="0" dy="0" stdDeviation="3" flood-color="#22D3EE" flood-opacity="0.6"/>`;
    defs.appendChild(filter);
    svg.appendChild(defs);
    svg.setAttribute("filter", "glow-" + vehicle.id);
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
  inner.appendChild(svg);

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
  inner.appendChild(label);

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
    inner.appendChild(task);
  }

  return wrap;
}
