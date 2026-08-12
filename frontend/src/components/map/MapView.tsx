"use client";

import { useEffect, useRef, useState, useCallback, forwardRef, useImperativeHandle } from "react";
import maplibregl, { Map as MLMap, Marker } from "maplibre-gl";
import type { Feature, Polygon } from "geojson";
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
  /** Compact marker treatment for overview surfaces. Existing map behavior is the default. */
  overviewMode?: boolean;
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
  overviewMode = false,
}: MapViewProps, _forwardedRef) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<MLMap | null>(null);
  const activeMapLayerRef = useRef<
    NonNullable<MapViewProps["mapLayer"]>
  >("basemap");
  /** Vehicle markers — NEVER removed from this ref; only shown/hidden for cluster toggle */
  const vehicleMarkersRef = useRef<Map<number, Marker>>(new Map());
  /** Cluster bubble markers — created when cluster mode is ON */
  const clusterBubbleRefs = useRef<Map<number, Marker>>(new Map());
  const routeLayerIds = useRef<Set<string>>(new Set());
  const routeSources = useRef<Set<string>>(new Set());
  const zoneLayerIds = useRef<Set<string>>(new Set());
  const zoneSources = useRef<Set<string>>(new Set());

  const [isReady, setIsReady] = useState(false);
  const [mapZoom, setMapZoom] = useState(zoom);
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

    // Tangkap koleksi untuk lifecycle instance map ini.
    // Cleanup tidak membaca ulang ref yang mungkin telah berpindah
    // ke lifecycle MapLibre lain setelah remount atau HMR.
    const vehicleMarkers =
      vehicleMarkersRef.current;
    const clusterBubbles =
      clusterBubbleRefs.current;
    const routeLayers =
      routeLayerIds.current;
    const routeSourceIds =
      routeSources.current;
    const zoneLayers =
      zoneLayerIds.current;
    const zoneSourceIds =
      zoneSources.current;

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
        // Cleanup instance lama tidak boleh menghapus map baru
        // yang telah dibuat oleh remount atau HMR.
        if (mapRef.current !== map) {
          return;
        }

        if (readyTimeout) {
          clearTimeout(readyTimeout);
          readyTimeout = null;
        }

        vehicleMarkers.forEach(
          (marker) => marker.remove()
        );
        vehicleMarkers.clear();

        clusterBubbles.forEach(
          (marker) => marker.remove()
        );
        clusterBubbles.clear();

        routeLayers.forEach((id) => {
          if (map.getLayer(id)) {
            map.removeLayer(id);
          }
        });

        routeSourceIds.forEach((id) => {
          if (map.getSource(id)) {
            map.removeSource(id);
          }
        });

        zoneLayers.forEach((id) => {
          if (map.getLayer(id)) {
            map.removeLayer(id);
          }
        });

        zoneSourceIds.forEach((id) => {
          if (map.getSource(id)) {
            map.removeSource(id);
          }
        });

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


      if (currentMarkers.has(v.id)) {
        // Existing marker — update position. Also re-add if removed by cluster effect
        // by checking a custom flag (marker._added = false after remove())
        const marker = currentMarkers.get(v.id);
        if (!marker) {
          currentMarkers.delete(v.id);
          return;
        }
        if (
          !(marker as any)._added &&
          !effectiveVisibility.cluster
        ) {
          marker.addTo(map);
          (marker as any)._added = true;
        }

        marker.setLngLat([v.lng, v.lat]); // [lng, lat] ✓

        // Update selected ring
        const el = marker.getElement();

        // MapLibre menggerakkan root marker dengan transform.
        // Root harus absolute agar transform tidak memperbesar dokumen.
        el.style.position = "absolute";
        el.style.top = "0";
        el.style.left = "0";
        el.style.willChange = "transform";

        const hasRing = el.querySelector(".marker-selected-ring");
        const shouldHaveRing = v.id === selectedId;
        el.dataset.selected =
          String(shouldHaveRing);
        el.style.zIndex =
          shouldHaveRing ? "20" : "3";
        if (overviewMode) {
          const plateLabel = el.querySelector<HTMLElement>(".marker-plate-label");
          if (plateLabel) plateLabel.style.opacity = shouldHaveRing ? "1" : "0";
        }
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
        const el = createTruckMarkerElement(v, v.id === selectedId, overviewMode);
        // Restore pointer-events so the click handler fires.
        // Posisi geografis diterapkan oleh MapLibre melalui transform.
        el.style.pointerEvents = "auto";
        el.style.position = "absolute";
        el.style.top = "0";
        el.style.left = "0";
        el.style.willChange = "transform";
        el.style.zIndex =
          v.id === selectedId ? "20" : "3";

        try {
          const marker = new Marker({ element: el, anchor: "center" })
            .setLngLat([v.lng, v.lat])
            .addTo(map);
          (marker as any)._added = true;
          currentMarkers.set(v.id, marker);
        } catch (err) {
          console.error("[MapView] ❌ Marker addTo failed:", v.id, err);
          return; // skip to next vehicle in forEach
        }

        el.addEventListener(
          "click",
          () => {
            // Perpindahan kamera ditangani satu kali oleh
            // effect selectedId di bawah.
            onSelectVehicle?.(v.id);
          }
        );
      }
    });

    } catch (err) {
      console.error("[MapView] Marker effect error:", err);
    }
  }, [
    isReady,
    interpolatedVehicles,
    selectedId,
    onSelectVehicle,
    overviewMode,
    effectiveVisibility.cluster,
  ]); // heading intentionally excluded — rotation handled in updateHeading effect

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
  const lastFocusedVehicleRef =
    useRef<string | null>(null);

  useEffect(() => {
    const map = mapRef.current;

    if (!isReady || !map) {
      return;
    }

    const container =
      map.getContainer();

    if (selectedId == null) {
      lastFocusedVehicleRef.current =
        null;

      delete container.dataset
        .selectedCameraMode;
      delete container.dataset
        .selectedCameraPitch;
      delete container.dataset
        .selectedCameraZoom;
      delete container.dataset
        .selectedCameraOffsetX;

      return;
    }

    const vehicle =
      interpolatedVehicles.find(
        (item) =>
          item.id === selectedId
      );

    if (
      !vehicle ||
      !isValidLngLat(vehicle)
    ) {
      return;
    }

    const selectedStatus =
      vehicles.find(
        (item) =>
          item.id === selectedId
      )?.displayStatus ?? "offline";

    const focusKey =
      `${selectedId}:${selectedStatus}`;

    // Interpolasi posisi memperbarui array kendaraan setiap frame.
    // Kamera hanya berubah saat kendaraan atau statusnya berubah.
    if (
      lastFocusedVehicleRef.current ===
      focusKey
    ) {
      return;
    }

    lastFocusedVehicleRef.current =
      focusKey;

    const isMoving =
      selectedStatus === "driving";

    const cameraZoom =
      isMoving ? 14 : 13;

    const cameraPitch =
      isMoving ? 45 : 0;

    // DetailPanel menutupi sisi kanan map. Offset membuat marker
    // berada di tengah area peta yang masih benar-benar terlihat.
    const panel =
      document.getElementById(
        "tracking-detail-panel"
      );

    const mapWidth =
      container.clientWidth;

    const measuredPanelWidth =
      panel
        ?.getBoundingClientRect()
        .width ?? 0;

    const fallbackPanelWidth =
      overviewMode ? 360 : 0;

    const requestedPanelWidth =
      measuredPanelWidth ||
      fallbackPanelWidth;

    // Pada viewport sempit, jangan menggeser kamera terlalu jauh.
    const usablePanelWidth =
      mapWidth >= 720
        ? Math.min(
            requestedPanelWidth,
            Math.max(
              0,
              mapWidth - 480
            )
          )
        : 0;

    const offsetX =
      -Math.round(
        usablePanelWidth / 2
      );

    container.dataset
      .selectedCameraMode =
      isMoving
        ? "moving"
        : "stationary";

    container.dataset
      .selectedCameraPitch =
      String(cameraPitch);

    container.dataset
      .selectedCameraZoom =
      String(cameraZoom);

    container.dataset
      .selectedCameraOffsetX =
      String(offsetX);

    map.easeTo({
      center: [
        vehicle.lng,
        vehicle.lat,
      ],
      zoom: cameraZoom,
      pitch: cameraPitch,
      offset: [
        offsetX,
        0,
      ],
      duration: 550,
    });
  }, [
    selectedId,
    isReady,
    interpolatedVehicles,
    overviewMode,
    vehicles,
  ]);

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
          } as Feature,
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
          } as Feature,
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
  }, [
    isReady,
    selectedId,
    effectiveVisibility,
    interpolatedVehicles,
    vehicles,
  ]);

  /* ── Basemap switching (Peta / Satelit / Lalu Lintas) ───────────────── */
  useEffect(() => {
    if (!isReady || !mapRef.current) return;

    // Map pertama kali selalu dibuat menggunakan basemap graphite.
    // Jangan menjalankan setStyle ulang saat initial load.
    if (activeMapLayerRef.current === mapLayer) return;

    const map = mapRef.current;
    const newStyle = BASEMAP_STYLES[mapLayer];

    activeMapLayerRef.current = mapLayer;

    // Style-bound layers/sources akan hilang saat setStyle.
    // Bersihkan bookkeeping-nya agar dapat dibuat ulang setelah style.load.
    routeLayerIds.current.clear();
    routeSources.current.clear();
    zoneLayerIds.current.clear();
    zoneSources.current.clear();

    const onStyleLoad = () => {
      if (mapLayer === "basemap") {
        applyGraphiteOverrides(map);
      }

      // Perubahan false → true menjalankan ulang efek route,
      // geofence, marker, dan cluster pada style yang baru.
      setIsReady(true);
    };

    map.once("style.load", onStyleLoad);

    // Marker dan cluster adalah DOM overlay MapLibre.
    // Jangan hapus ref/marker ketika hanya mengganti basemap.
    setIsReady(false);
    map.setStyle(newStyle);
  }, [isReady, mapLayer]);

  // Cluster density follows the actual camera zoom.
  useEffect(() => {
    if (!isReady || !mapRef.current) return;

    const map = mapRef.current;

    const syncZoom = () => {
      setMapZoom(map.getZoom());
    };

    syncZoom();
    map.on("zoomend", syncZoom);

    return () => {
      map.off("zoomend", syncZoom);
    };
  }, [isReady]);

  // Fleet overview yang terlalu jauh harus selalu diringkas.
  // Ketika pengguna mematikan Cluster di bawah zoom 9,
  // aktifkan kembali agar marker individual tidak memenuhi peta.
  useEffect(() => {
    if (
      !isReady ||
      !overviewMode ||
      mapZoom >= 9 ||
      effectiveVisibility.cluster
    ) {
      return;
    }

    effectiveToggle("cluster");
  }, [
    isReady,
    overviewMode,
    mapZoom,
    effectiveVisibility.cluster,
    effectiveToggle,
  ]);

  /* ── Cluster toggle — uses effectiveVisibility.cluster (from page state) ────── */
  useEffect(() => {
    if (!isReady || !mapRef.current) return;
    const map = mapRef.current;

    // Remove cluster bubbles
    clusterBubbleRefs.current.forEach((m) => m.remove());
    clusterBubbleRefs.current.clear();

    const shouldRenderClusters =
      effectiveVisibility.cluster &&
      mapZoom < 13;

    if (!shouldRenderClusters) {
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

      // Kendaraan terpilih harus tetap terlihat meskipun cluster aktif.
      if (selectedId != null) {
        const selectedMarker =
          vehicleMarkersRef.current.get(selectedId);

        if (
          selectedMarker &&
          !(selectedMarker as any)._added
        ) {
          selectedMarker.addTo(map);
          (selectedMarker as any)._added = true;
        }
      }

      // Overview luas memakai kelompok besar; kelompok mengecil
      // secara bertahap ketika operator memperbesar peta.
      const GRID =
        mapZoom < 6
          ? 2
          : mapZoom < 7.5
            ? 1
            : mapZoom < 9
              ? 0.4
              : mapZoom < 11
                ? 0.08
                : 0.02;
      const clusters = new Map<string, (typeof interpolatedVehicles)[number][]>();

      interpolatedVehicles.forEach((vehicle) => {
        // Unit terpilih ditampilkan secara individual, bukan dihitung dua kali.
        if (vehicle.id === selectedId) return;

        // Invalid coordinates must not create phantom clusters around [0, 0].
        if (
          !isValidLngLat(vehicle) ||
          (vehicle.lng === 0 &&
            vehicle.lat === 0)
        ) {
          return;
        }

        const cx = Math.floor(vehicle.lng / GRID) * GRID;
        const cy = Math.floor(vehicle.lat / GRID) * GRID;
        const key = `${cx},${cy}`;

        if (!clusters.has(key)) {
          clusters.set(key, []);
        }

        clusters.get(key)!.push(vehicle);
      });

      clusters.forEach((group) => {
        // Saat Cluster aktif, setiap kelompok ditampilkan sebagai bubble,
        // termasuk kelompok yang hanya berisi satu kendaraan.
        const centerLng =
          group.reduce(
            (sum, vehicle) =>
              sum + vehicle.lng,
            0
          ) / group.length;

        const centerLat =
          group.reduce(
            (sum, vehicle) =>
              sum + vehicle.lat,
            0
          ) / group.length;

        const isSingleton =
          group.length === 1;
        const bubbleSize =
          isSingleton ? 14 : 34;

        const el =
          document.createElement("div");

        el.style.cssText = `
          width: ${bubbleSize}px;
          height: ${bubbleSize}px;
          position: absolute;
          top: 0;
          left: 0;
          border-radius: 50%;
          background: ${
            isSingleton
              ? "#2563EB"
              : "rgba(255,255,255,0.96)"
          };
          border: ${
            isSingleton
              ? "2px solid rgba(255,255,255,0.95)"
              : "2px solid #2563EB"
          };
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: ${
            isSingleton ? "0" : "12px"
          };
          font-weight: 700;
          color: #172033;
          font-family: inherit;
          box-shadow: 0 2px 7px rgba(15,23,42,0.18);
          cursor: pointer;
          z-index: 2;
        `;
        el.dataset.clusterSize =
          String(group.length);
        el.textContent =
          isSingleton
            ? ""
            : group.length > 9
              ? "9+"
              : String(group.length);
        el.title = overviewMode
          ? `${group.length} unit dalam area`
          : `${group.length} units in cluster`;
        el.setAttribute("role", "button");
        el.setAttribute(
          "aria-label",
          `Buka kelompok ${group.length} unit`
        );
        el.tabIndex = 0;

        const openCluster = () => {
          map.easeTo({
            center: [centerLng, centerLat],
            zoom: Math.min(
              map.getZoom() + 2,
              15
            ),
            duration: 450,
          });
        };

        el.addEventListener(
          "click",
          openCluster
        );

        el.addEventListener(
          "keydown",
          (event) => {
            if (
              event.key === "Enter" ||
              event.key === " "
            ) {
              event.preventDefault();
              openCluster();
            }
          }
        );

        const bubble = new Marker({
          element: el,
          anchor: "center",
        })
          .setLngLat([
            centerLng,
            centerLat,
          ])
          .addTo(map);
        clusterBubbleRefs.current.set(group[0].id, bubble);
      });
    }
  }, [
    isReady,
    effectiveVisibility,
    overviewMode,
    interpolatedVehicles,
    selectedId,
    mapZoom,
  ]);

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
    const mockGeofences: Feature<Polygon>[] = [
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
  isSelected: boolean,
  overviewMode: boolean
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
  wrap.dataset.selected = String(isSelected);

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
  if (vehicle.status === "driving" && !overviewMode) {
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

  // Compact top-view truck glyph.
  // Parent .marker-inner rotates according to vehicle heading.
  const svg = document.createElementNS(
    "http://www.w3.org/2000/svg",
    "svg"
  );

  svg.setAttribute("viewBox", "0 0 32 32");
  svg.setAttribute(
    "width",
    overviewMode ? "22" : "26"
  );
  svg.setAttribute(
    "height",
    overviewMode ? "22" : "26"
  );
  svg.setAttribute("aria-hidden", "true");
  svg.setAttribute(
    "data-marker-glyph",
    "truck"
  );
  svg.style.display = "block";
  svg.style.overflow = "visible";
  svg.style.pointerEvents = "none";

  // Glow hanya digunakan pada konteks detail.
  // Overview armada harus tetap tenang.
  if (
    vehicle.status === "driving" &&
    !overviewMode
  ) {
    const defs = document.createElementNS(
      "http://www.w3.org/2000/svg",
      "defs"
    );
    const filter = document.createElementNS(
      "http://www.w3.org/2000/svg",
      "filter"
    );
    const shadow = document.createElementNS(
      "http://www.w3.org/2000/svg",
      "feDropShadow"
    );

    filter.setAttribute(
      "id",
      `glow-${vehicle.id}`
    );

    shadow.setAttribute("dx", "0");
    shadow.setAttribute("dy", "0");
    shadow.setAttribute(
      "stdDeviation",
      "2"
    );
    shadow.setAttribute(
      "flood-color",
      "#22D3EE"
    );
    shadow.setAttribute(
      "flood-opacity",
      "0.4"
    );

    filter.appendChild(shadow);
    defs.appendChild(filter);
    svg.appendChild(defs);

    svg.setAttribute(
      "filter",
      `url(#glow-${vehicle.id})`
    );
  }

  const stroke = isSelected
    ? "#2563EB"
    : "rgba(255,255,255,0.92)";

  const strokeWidth = isSelected
    ? "2"
    : "1.25";

  // Cargo box.
  const cargo = document.createElementNS(
    "http://www.w3.org/2000/svg",
    "rect"
  );

  cargo.setAttribute("x", "9");
  cargo.setAttribute("y", "13");
  cargo.setAttribute("width", "14");
  cargo.setAttribute("height", "15");
  cargo.setAttribute("rx", "2.5");
  cargo.setAttribute("fill", color);
  cargo.setAttribute("stroke", stroke);
  cargo.setAttribute(
    "stroke-width",
    strokeWidth
  );
  svg.appendChild(cargo);

  // Cabin; front vehicle points upward.
  const cabin = document.createElementNS(
    "http://www.w3.org/2000/svg",
    "path"
  );

  cabin.setAttribute(
    "d",
    "M9 13V8.5C9 5.8 11.1 4 13.5 4H18.5C20.9 4 23 5.8 23 8.5V13Z"
  );
  cabin.setAttribute("fill", color);
  cabin.setAttribute("stroke", stroke);
  cabin.setAttribute(
    "stroke-width",
    strokeWidth
  );
  cabin.setAttribute(
    "stroke-linejoin",
    "round"
  );
  svg.appendChild(cabin);

  // Windshield.
  const windshield =
    document.createElementNS(
      "http://www.w3.org/2000/svg",
      "rect"
    );

  windshield.setAttribute("x", "11.5");
  windshield.setAttribute("y", "6.5");
  windshield.setAttribute("width", "9");
  windshield.setAttribute("height", "3");
  windshield.setAttribute("rx", "1");
  windshield.setAttribute(
    "fill",
    "rgba(255,255,255,0.82)"
  );
  svg.appendChild(windshield);

  // Divider between cabin and cargo.
  const divider = document.createElementNS(
    "http://www.w3.org/2000/svg",
    "line"
  );

  divider.setAttribute("x1", "10.5");
  divider.setAttribute("x2", "21.5");
  divider.setAttribute("y1", "16");
  divider.setAttribute("y2", "16");
  divider.setAttribute(
    "stroke",
    "rgba(255,255,255,0.42)"
  );
  divider.setAttribute(
    "stroke-width",
    "1"
  );
  svg.appendChild(divider);

  const wheelPositions: Array<
    [number, number]
  > = [
    [6.5, 9],
    [23, 9],
    [6.5, 20],
    [23, 20],
  ];

  wheelPositions.forEach(([x, y]) => {
    const wheel =
      document.createElementNS(
        "http://www.w3.org/2000/svg",
        "rect"
      );

    wheel.setAttribute("x", String(x));
    wheel.setAttribute("y", String(y));
    wheel.setAttribute("width", "2.5");
    wheel.setAttribute("height", "5");
    wheel.setAttribute("rx", "1");
    wheel.setAttribute(
      "fill",
      "rgba(15,23,42,0.96)"
    );

    svg.appendChild(wheel);
  });

  inner.appendChild(svg);

  // Label chip
  const label = document.createElement("div");
  label.className = "marker-plate-label";
  label.style.cssText = `
    position: absolute; top: calc(100% + 4px); left: 50%; transform: translateX(-50%);
    background: #14181D; border: 1px solid #262C34; border-radius: 4px;
    padding: 2px 6px; white-space: nowrap;
    font-family: monospace; font-size: 9px; font-weight: 600;
    color: #E6EAEF; letter-spacing: 0.02em; pointer-events: none;
    box-shadow: 0 2px 8px rgba(0,0,0,0.4); z-index: 20;
    opacity: ${overviewMode && !isSelected ? "0" : "1"};
  `;
  label.textContent = vehicle.plate;
  // Label must stay horizontal. Only the vehicle glyph rotates.
  wrap.appendChild(label);

  if (overviewMode) {
    wrap.addEventListener("mouseenter", () => {
      label.style.opacity = "1";
    });
    wrap.addEventListener("mouseleave", () => {
      label.style.opacity = wrap.dataset.selected === "true" ? "1" : "0";
    });
  }

  // Task sub-label
  if (vehicle.taskLabel && !overviewMode) {
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
