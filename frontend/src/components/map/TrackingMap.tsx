"use client";

import { useState, useCallback, useMemo } from "react";
import MapView from "./MapView";
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
  onSelectVehicle?: (id: number) => void;
  /** Layer visibility — SINGLE SOURCE OF TRUTH (passed from page level) */
  visibility: LayerVisibility;
  /** Toggle a layer visibility key */
  toggleLayer: (key: keyof LayerVisibility) => void;
  /** Active basemap: "basemap" | "satellite" | "traffic" */
  mapLayer?: MapLayerType;
}

export default function TrackingMap({
  vehicles,
  selectedId,
  onSelectVehicle,
  visibility,
  toggleLayer,
  mapLayer = "basemap",
}: TrackingMapProps) {
  const [internalSelected, setInternalSelected] = useState<number | null>(null);
  const selected = selectedId ?? internalSelected;

  // Convert to MapVehicle (with display positions) — memoized so the reference
  // stays stable unless the vehicles array actually changes. This prevents MapView's
  // marker effects from being triggered by unrelated parent re-renders.
  const mapVehicles = useMemo(() => vehicles.map((v) => toMapVehicle(v)), [vehicles]);

  // Resolve selected vehicle
  const selectedVehicle = selected != null
    ? mapVehicles.find((v) => v.id === selected) ?? null
    : null;

  const handleSelect = useCallback((id: number) => {
    setInternalSelected(id);
    onSelectVehicle?.(id);
  }, [onSelectVehicle]);

  const handleClose = useCallback(() => {
    setInternalSelected(null);
    onSelectVehicle?.(null as unknown as number);
  }, [onSelectVehicle]);

  return (
    <div className="relative h-full w-full overflow-hidden">
      <MapView
        vehicles={mapVehicles}
        selectedId={selected}
        onSelectVehicle={handleSelect}
        visibility={visibility}
        onToggleLayer={toggleLayer}
        mapLayer={mapLayer}
        pitch={45}
        center={[107.0, -6.5]}
        zoom={9}
      >
        {/* Layer controls — glass dock top-right */}
        <LayerControlPanel
          visibility={visibility}
          onToggle={toggleLayer}
        />

        {/* Detail panel — slides in from right when vehicle selected */}
        <DetailPanel
          vehicle={selectedVehicle}
          visibility={visibility}
          onToggleLayer={toggleLayer}
          onClose={handleClose}
        />
      </MapView>

      {/* Route legend — bottom-left */}
      <div className="absolute bottom-4 left-4 z-dock">
        <div className="glass rounded-lg border border-border px-3 py-2 space-y-1.5">
          <LegendItem color="#10B981" label="Actual Route" dashed={false} />
          <LegendItem color="#5E6773" label="Planned Route" dashed />
          <LegendItem color="#F97316" label="Deviation" dot />
        </div>
      </div>
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
