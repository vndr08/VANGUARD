"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import MapView, { type MapViewRef } from "./MapView";
import { LayerControlPanel } from "./LayerControlPanel";
import { DetailPanel } from "./DetailPanel";
import type { Vehicle } from "@/types";
import { toMapVehicle } from "@/lib/mock-data";
import type { LayerVisibility } from "./types";

/* ─── TrackingMap ─────────────────────────────────────────────────────── */
/**
 * Main realtime tracking map for VANGUARD.
 * Receives toolbar state from the parent page and wires it through to MapView.
 */
export type MapLayerType = "basemap" | "satellite" | "traffic";

interface TrackingMapProps {
  vehicles: Vehicle[];
  selectedId?: number | null;
  onSelectVehicle?: (id: number | null) => void;
  /** Layer visibility — SINGLE SOURCE OF TRUTH (passed from page level) */
  visibility: LayerVisibility;
  /** Toggle a layer visibility key */
  toggleLayer: (key: keyof LayerVisibility) => void;
  /** Active basemap: "basemap" | "satellite" | "traffic" */
  mapLayer?: MapLayerType;
  /** Register the real MapView fitAll command with the parent toolbar. */
  onFitAllReady?: (fitAll: (() => void) | null) => void;
}

export default function TrackingMap({
  vehicles,
  selectedId,
  onSelectVehicle,
  visibility,
  toggleLayer,
  mapLayer = "basemap",
  onFitAllReady,
}: TrackingMapProps) {
  const [internalSelected, setInternalSelected] =
    useState<number | null>(null);

  const isSelectionControlled =
    selectedId !== undefined;

  const selected = isSelectionControlled
    ? selectedId ?? null
    : internalSelected;

  const mapRef = useRef<MapViewRef>(null);
  const [isMapReady, setIsMapReady] = useState(false);
  const hasAutoFittedRef = useRef(false);
  const previousScopeKeyRef = useRef("");
  const previousSelectedRef = useRef<number | null>(selected);

  // Convert to MapVehicle (with display positions) — memoized so the reference
  // stays stable unless the vehicles array actually changes. This prevents MapView's
  // marker effects from being triggered by unrelated parent re-renders.
  const mapVehicles = useMemo(
    () => vehicles.map((vehicle) => toMapVehicle(vehicle)),
    [vehicles]
  );

  // The viewport scope changes only when the represented vehicle set changes.
  // Normal telemetry position updates with the same IDs do not force the camera.
  const vehicleScopeKey = useMemo(
    () =>
      mapVehicles
        .map((vehicle) => vehicle.id)
        .sort((a, b) => a - b)
        .join(","),
    [mapVehicles]
  );

  const fitAll = useCallback(() => {
    mapRef.current?.fitAll();
  }, []);

  const handleMapReady = useCallback(() => {
    setIsMapReady(true);
  }, []);

  useEffect(() => {
    if (!isMapReady) {
      onFitAllReady?.(null);
      return;
    }

    onFitAllReady?.(fitAll);

    return () => {
      onFitAllReady?.(null);
    };
  }, [fitAll, isMapReady, onFitAllReady]);

  useEffect(() => {
    const scopeChanged =
      previousScopeKeyRef.current !== vehicleScopeKey;

    const selectionClosed =
      previousSelectedRef.current !== null && selected === null;

    previousScopeKeyRef.current = vehicleScopeKey;
    previousSelectedRef.current = selected;

    if (
      !isMapReady ||
      selected !== null ||
      mapVehicles.length === 0
    ) {
      return;
    }

    if (
      hasAutoFittedRef.current &&
      !scopeChanged &&
      !selectionClosed
    ) {
      return;
    }

    const frame = window.requestAnimationFrame(() => {
      mapRef.current?.fitAll();
      hasAutoFittedRef.current = true;
    });

    return () => {
      window.cancelAnimationFrame(frame);
    };
  }, [
    isMapReady,
    mapVehicles.length,
    selected,
    vehicleScopeKey,
  ]);

  // Resolve selected vehicle
  const selectedVehicle = selected != null
    ? mapVehicles.find((v) => v.id === selected) ?? null
    : null;

  const handleSelect = useCallback(
    (id: number) => {
      if (!isSelectionControlled) {
        setInternalSelected(id);
      }

      onSelectVehicle?.(id);
    },
    [isSelectionControlled, onSelectVehicle]
  );

  const handleClose = useCallback(() => {
    if (!isSelectionControlled) {
      setInternalSelected(null);
    }

    onSelectVehicle?.(null);
  }, [isSelectionControlled, onSelectVehicle]);

  return (
    <div className="relative h-full w-full overflow-hidden">
      <MapView
        ref={mapRef}
        vehicles={mapVehicles}
        selectedId={selected}
        onSelectVehicle={handleSelect}
        visibility={visibility}
        onToggleLayer={toggleLayer}
        mapLayer={mapLayer}
        onMapReady={handleMapReady}
        pitch={0}
        center={[107.0, -6.5]}
        zoom={9}
        overviewMode
      >
        {/* Layer controls — glass dock top-right */}
        {selectedVehicle && (
          <LayerControlPanel
            visibility={visibility}
            onToggle={toggleLayer}
          />
        )}

        {/* Detail panel — slides in from right when vehicle selected */}
        <DetailPanel
          vehicle={selectedVehicle}
          visibility={visibility}
          onToggleLayer={toggleLayer}
          onClose={handleClose}
        />
      </MapView>

      {/* Route legend is relevant only for a selected vehicle. */}
      {selectedVehicle &&
        (visibility.actualRoute ||
          visibility.plannedRoute) && (
          <div className="absolute bottom-4 left-4 z-dock">
            <div className="rounded-lg border border-border bg-surface-1/95 px-3 py-2 shadow-elev-2 space-y-1.5">
              {visibility.actualRoute && (
                <LegendItem
                  color="#10B981"
                  label="Rute aktual"
                  dashed={false}
                />
              )}
              {visibility.plannedRoute && (
                <LegendItem
                  color="#5E6773"
                  label="Rute rencana"
                  dashed
                />
              )}
              {visibility.actualRoute && (
                <LegendItem
                  color="#F97316"
                  label="Penyimpangan"
                  dot
                />
              )}
            </div>
          </div>
        )}
    </div>
  );
}

/* ─── Route legend ─────────────────────────────────────────────────────── */
function LegendItem({
  color,
  label,
  dashed = false,
  dot = false,
}: {
  color: string;
  label: string;
  dashed?: boolean;
  dot?: boolean;
}) {
  if (dot) {
    return (
      <div className="flex items-center gap-2">
        <span className="h-3 w-3 rounded-full" style={{ background: color }} />
        <span className="text-[10px] text-muted">{label}</span>
      </div>
    );
  }
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
      <span className="text-[10px] text-muted w-20">{label}</span>
    </div>
  );
}
