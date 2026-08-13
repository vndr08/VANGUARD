"use client";

import dynamic from "next/dynamic";
import { useEffect, useMemo, useState, useCallback, useRef } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { motion, AnimatePresence } from "motion/react";
import {
  Map,
  Table as TableIcon,
  Search,
  Filter,
  Maximize2,
  CircleDot,
  Hexagon,
  AlertTriangle,
  Navigation,
  Fuel,
  X,
  SortAsc,
  SortDesc,
  ChevronRight,
} from "lucide-react";
import { FLEET_VEHICLES, toMapVehicle } from "@/lib/fleet-data";
import type { Vehicle } from "@/types";
import { useReducedMotion } from "@/hooks/useReducedMotion";
import { useToast } from "@/components/ui/Toast";
import { StatusPill } from "@/components/ui/Badge";
import { Skeleton, EmptyState } from "@/components/ui/Card";
import {
  TableContainer,
  TableHead,
  TableHeadCell,
  TableBody,
  TableRow,
  TableCell,
} from "@/components/ui/Table";
import { Button } from "@/components/ui/Button";
import { useLayerVisibility } from "@/hooks/useMapHooks";
import { DEFAULT_LAYER_VISIBILITY } from "@/components/map/types";
import type { LayerVisibility } from "@/components/map/types";

/* ─── Map (lazy — browser only) ─────────────────────────────────────────── */
const TrackingMap = dynamic(() => import("@/components/map/TrackingMap"), {
  ssr: false,
  loading: () => (
    <div className="flex h-full w-full items-center justify-center bg-surface-2">
      <div className="flex flex-col items-center gap-3">
        <div className="h-8 w-8 rounded-full border-2 border-border border-t-brand animate-spin" />
        <p className="text-sm text-muted">Memuat peta...</p>
      </div>
    </div>
  ),
});

/* ─── Types ──────────────────────────────────────────────────────────────── */
import { toCanonicalStatus, CANONICAL_STATUSES } from "@/lib/status";
type FilterStatus = "all" | "driving" | "idle" | "stop" | "offline" | "delayed";

/* ─── Helpers ───────────────────────────────────────────────────────────── */
function timeAgo(iso?: string): string {
  if (!iso) return "—";
  const diff = Math.max(0, Math.floor((Date.now() - new Date(iso).getTime()) / 60000));
  if (diff < 1) return "Baru saja";
  if (diff < 60) return `${diff}m lalu`;
  if (diff < 1440) return `${Math.floor(diff / 60)}j lalu`;
  return `${Math.floor(diff / 1440)}d lalu`;
}

function toVehicleSlug(plateNumber: string): string {
  return plateNumber.toLowerCase().replace(/\s+/g, "");
}

/* ─── Inline status icons (match Badge.tsx) ─────────────────────────────── */
function PlayIcon() {
  return (
    <svg viewBox="0 0 16 16" fill="currentColor" className="w-full h-full">
      <path d="M4 3.5l9 4.5-9 4.5V3.5z" />
    </svg>
  );
}
function PauseIcon() {
  return (
    <svg viewBox="0 0 16 16" fill="currentColor" className="w-full h-full">
      <rect x="3" y="3" width="3.5" height="10" rx="0.5" />
      <rect x="9.5" y="3" width="3.5" height="10" rx="0.5" />
    </svg>
  );
}
function StopIcon() {
  return (
    <svg viewBox="0 0 16 16" fill="currentColor" className="w-full h-full">
      <rect x="3" y="3" width="10" height="10" rx="1" />
    </svg>
  );
}
function OfflineIcon() {
  return (
    <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-full h-full">
      <circle cx="8" cy="8" r="5.5" />
      <line x1="4" y1="4" x2="12" y2="12" />
    </svg>
  );
}
function DelayedIcon() {
  return (
    <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-full h-full">
      <circle cx="8" cy="8" r="5.5" />
      <path d="M8 4.5V8l2.5 2" />
    </svg>
  );
}

/* ─── STATUS_META ───────────────────────────────────────────────────────── */
const STATUS_META: Record<
  FilterStatus,
  { label: string; icon: React.ReactNode; colorVar: string }
> = {
  all:       { label: "Semua",      icon: null,            colorVar: "var(--text)" },
  driving:   { label: "Berkendara",  icon: <PlayIcon />,    colorVar: "var(--st-driving)" },
  idle:      { label: "Diam",        icon: <PauseIcon />,   colorVar: "var(--st-idle)" },
  stop:      { label: "Berhenti",    icon: <StopIcon />,    colorVar: "var(--st-stop)" },
  offline:   { label: "Offline",     icon: <OfflineIcon />, colorVar: "var(--st-offline)" },
  delayed:   { label: "Terlambat",  icon: <DelayedIcon />, colorVar: "var(--st-delayed)" },
};

/* ─── Table sort ─────────────────────────────────────────────────────────── */
type SortKey = "plate_number" | "driver_name" | "status" | "speed" | "last_update";
type SortDir = "asc" | "desc" | false;

/* ─── SpeedingInfo ──────────────────────────────────────────────────────── */
interface SpeedingInfo {
  plate_number: string;
  speed: number;
  address: string;
}

/* ─── Main Page ──────────────────────────────────────────────────────────── */
export default function TrackingPage() {
  const { warning } = useToast();
  const router = useRouter();
  const searchParams = useSearchParams();
  const reducedMotion = useReducedMotion();
  const fitAllRef = useRef<(() => void) | null>(null);

  const handleFitAllReady = useCallback(
    (fitAll: (() => void) | null) => {
      fitAllRef.current = fitAll;
    },
    []
  );

  /* ── State ──────────────────────────────────────────────────────────────── */
  const [vehicles, setVehicles] = useState<Vehicle[]>(FLEET_VEHICLES);
  const [loading, setLoading] = useState(false);
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<FilterStatus>("all");
  const [viewMode, setViewMode] = useState<"map" | "table">("map");

  /* Map style selected by the operator. */
  const [mapLayer, setMapLayer] = useState<
    "basemap" | "satellite" | "traffic"
  >("basemap");

  /** Layer visibility — single source of truth shared between toolbar, panel, and MapView */
  const { visibility, toggle } = useLayerVisibility({
    ...DEFAULT_LAYER_VISIBILITY,
    cluster: true,
    showTrack: false,
    plannedRoute: false,
    actualRoute: false,
    checkpoint: false,
    geofence: false,
  });

  /* Table sort */
  const [sortKey, setSortKey] = useState<SortKey>("plate_number");
  const [sortDir, setSortDir] = useState<SortDir>("asc");

  /** Track which status groups are collapsed (true = collapsed/hidden) */
  const [collapsedGroups, setCollapsedGroups] = useState<Set<string>>(new Set());

  function toggleGroup(key: string) {
    setCollapsedGroups((prev) => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });
  }

  /* Speeding popup */
  const [speeding, setSpeeding] = useState<SpeedingInfo | null>(null);

  /* ── Vehicle selection from canonical/legacy URL ───────────────────────── */
  useEffect(() => {
    const vehicleSlug = searchParams.get("vehicle");
    const focus = searchParams.get("focus");

    let selectedVehicle: Vehicle | undefined;

    if (vehicleSlug) {
      const normalizedSlug = vehicleSlug.toLowerCase().replace(/\s+/g, "");

      selectedVehicle = vehicles.find(
        (vehicle) =>
          toVehicleSlug(vehicle.plate_number) === normalizedSlug
      );
    } else if (focus) {
      const id = Number.parseInt(focus, 10);

      if (!Number.isNaN(id)) {
        selectedVehicle = vehicles.find((vehicle) => vehicle.id === id);
      }
    }

    setSelectedId(selectedVehicle?.id ?? null);

    if (selectedVehicle) {
      setViewMode("map");
    }

    const canonicalSlug = selectedVehicle
      ? toVehicleSlug(selectedVehicle.plate_number)
      : null;

    // Normalisasi legacy focus, kapitalisasi, dan spasi ke satu URL canonical.
    if (
      selectedVehicle &&
      canonicalSlug &&
      (focus !== null || vehicleSlug !== canonicalSlug)
    ) {
      const params = new URLSearchParams(searchParams.toString());

      params.set("vehicle", canonicalSlug);
      params.delete("focus");

      const query = params.toString();

      router.replace(
        query ? `/tracking?${query}` : "/tracking",
        { scroll: false }
      );
    }
  }, [router, searchParams, vehicles]);

  /* ── Refresh data ──────────────────────────────────────────────────────── */
  useEffect(() => {
    fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000"}/api/vehicles`)
      .then((r) => (r.ok ? r.json() : null))
      .then((data) => Array.isArray(data) && data.length > 0 && setVehicles(data))
      .catch(() => {});
  }, []);

  /* ── Speeding detection ────────────────────────────────────────────────── */
  const speedingInitializedRef =
    useRef(false);

  const speedingVehicleIdsRef =
    useRef<Set<number>>(new Set());

  useEffect(() => {
    const currentSpeedingIds =
      new Set(
        vehicles
          .filter(
            (vehicle) =>
              toCanonicalStatus(
                vehicle.status
              ) === "driving" &&
              vehicle.speed > 80
          )
          .map(
            (vehicle) =>
              vehicle.id
          )
      );

    // Jangan menampilkan alert mock hanya karena halaman baru dibuka.
    if (
      !speedingInitializedRef.current
    ) {
      speedingInitializedRef.current =
        true;

      speedingVehicleIdsRef.current =
        currentSpeedingIds;

      return;
    }

    const newlySpeeding =
      vehicles.find(
        (vehicle) =>
          currentSpeedingIds.has(
            vehicle.id
          ) &&
          !speedingVehicleIdsRef.current.has(
            vehicle.id
          )
      );

    speedingVehicleIdsRef.current =
      currentSpeedingIds;

    if (!newlySpeeding) {
      return;
    }

    setSpeeding({
      plate_number:
        newlySpeeding.plate_number,
      speed:
        newlySpeeding.speed,
      address:
        "Lokasi kendaraan sedang diperbarui",
    });

  }, [vehicles]);

  useEffect(() => {
    if (!speeding) {
      return;
    }

    const timer =
      window.setTimeout(
        () => {
          setSpeeding(null);
        },
        6000
      );

    return () => {
      window.clearTimeout(timer);
    };
  }, [speeding]);

  /* ── Filtered + sorted vehicles ────────────────────────────────────────── */
  const filteredVehicles = useMemo(() => {
    const q = search.trim().toLowerCase();
    return vehicles.filter((v) => {
      // Normalize status so "stopped" → "stop" matches filter "stop"
      const canonical = toCanonicalStatus(v.status);
      const matchesFilter = filter === "all" || canonical === filter;
      const matchesSearch =
        !q ||
        v.plate_number.toLowerCase().includes(q) ||
        (v.driver_name ?? "").toLowerCase().includes(q);
      return matchesFilter && matchesSearch;
    });
  }, [vehicles, filter, search]);

  const sortedVehicles = useMemo(() => {
    return [...filteredVehicles].sort((a, b) => {
      if (!sortDir) return 0;
      let av = "", bv = "";
      switch (sortKey) {
        case "plate_number":  av = a.plate_number; bv = b.plate_number; break;
        case "driver_name":   av = a.driver_name ?? ""; bv = b.driver_name ?? ""; break;
        case "status":        av = a.status; bv = b.status; break;
        case "speed":         av = String(a.speed); bv = String(b.speed); break;
        case "last_update":   av = a.last_update; bv = b.last_update; break;
      }
      const cmp = av.localeCompare(bv, "id");
      return sortDir === "asc" ? cmp : -cmp;
    });
  }, [filteredVehicles, sortKey, sortDir]);

  /* ── Counts per status ─────────────────────────────────────────────────── */
  const counts = useMemo(() => {
    const c: Record<FilterStatus, number> = {
      all: vehicles.length, driving: 0, idle: 0, stop: 0, offline: 0, delayed: 0,
    };
    vehicles.forEach((v) => {
      const canonical = toCanonicalStatus(v.status);
      if (canonical in c) c[canonical]++;
    });
    return c;
  }, [vehicles]);

  /* ── Grouped vehicle list for map sidebar ──────────────────────────────── */
  const groupedVehicles = useMemo(() => {
    const groups: Record<string, Vehicle[]> = {};
    filteredVehicles.forEach((v) => {
      const canonical = toCanonicalStatus(v.status);
      if (!groups[canonical]) groups[canonical] = [];
      groups[canonical].push(v);
    });
    return groups;
  }, [filteredVehicles]);

  const GROUP_ORDER: FilterStatus[] = ["driving", "idle", "stop", "offline", "delayed"];

  /* ── Select handlers ────────────────────────────────────────────────────── */
  const handleSelect = useCallback((id: number | null) => {
    const params = new URLSearchParams(searchParams.toString());

    params.delete("focus");

    if (id === null) {
      params.delete("vehicle");
    } else {
      const selectedVehicle = vehicles.find(
        (vehicle) => vehicle.id === id
      );

      if (!selectedVehicle) return;

      params.set(
        "vehicle",
        toVehicleSlug(selectedVehicle.plate_number)
      );
    }

    setSelectedId(id);

    if (id !== null && viewMode === "table") {
      setViewMode("map");
    }

    const query = params.toString();

    router.push(
      query ? `/tracking?${query}` : "/tracking",
      { scroll: false }
    );
  }, [router, searchParams, vehicles, viewMode]);

  useEffect(() => {
    if (selectedId === null) {
      return;
    }

    const selectionStillVisible =
      filteredVehicles.some(
        (vehicle) =>
          vehicle.id === selectedId
      );

    if (selectionStillVisible) {
      return;
    }

    const params =
      new URLSearchParams(
        searchParams.toString()
      );

    params.delete("vehicle");
    params.delete("focus");

    setSelectedId(null);

    const query =
      params.toString();

    router.replace(
      query
        ? `/tracking?${query}`
        : "/tracking",
      {
        scroll: false,
      }
    );
  }, [
    filteredVehicles,
    router,
    searchParams,
    selectedId,
  ]);

  /* ── Toolbar handlers ───────────────────────────────────────────────────── */
  function handleModeToggle(
    mode: "map" | "table"
  ) {
    setViewMode(mode);
  }

  function handleLayerChange(
    layer: typeof mapLayer
  ) {
    setMapLayer(layer);
  }

  function handleZoomToFit() {
    if (!fitAllRef.current) {
      warning("Peta belum siap", "Tunggu hingga peta selesai dimuat");
      return;
    }

    fitAllRef.current();
  }

  function handleClusterToggle() {
    toggle("cluster");
  }

  function handleZoneToggle() {
    toggle("geofence");
  }

  /* ── Sort handler ──────────────────────────────────────────────────────── */
  function handleSort(key: SortKey) {
    if (sortKey === key) {
      setSortDir((d) => (d === "asc" ? "desc" : d === "desc" ? false : "asc"));
    } else {
      setSortKey(key);
      setSortDir("asc");
    }
  }

  function sortIcon(key: SortKey) {
    if (sortKey !== key || !sortDir) {
      return <SortAsc className="w-3 h-3 opacity-30" />;
    }
    return sortDir === "asc"
      ? <SortAsc className="w-3 h-3" />
      : <SortDesc className="w-3 h-3" />;
  }

  /* ──────────────────────────────────────────────────────────────────────── */
  return (
    <div className="flex h-[calc(100vh-4rem)] max-h-[calc(100vh-4rem)] min-h-0 flex-col overflow-hidden">
      {/* ── TOOLBAR ────────────────────────────────────────────────────────── */}
      <header
        className="flex shrink-0 items-center gap-3 border-b border-border bg-surface-1 px-3 py-2"
        role="toolbar"
        aria-label="Kontrol Realtime Monitor"
      >
        {/* Center: mode toggle */}
        <div className="flex h-9 shrink-0 items-center rounded-md border border-border bg-surface-1 p-0.5">
          <button
            id="tsb-mode-map"
            onClick={() => handleModeToggle("map")}
            className={`flex h-8 items-center gap-1.5 rounded px-3 text-sm font-medium transition-colors focus-visible:outline-2 focus-visible:outline-brand ${
              viewMode === "map"
                ? "bg-brand-soft text-brand"
                : "text-muted hover:text-foreground"
            }`}
            aria-pressed={viewMode === "map"}
          >
            <Map className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">Peta</span>
          </button>
          <button
            id="tsb-mode-tbl"
            onClick={() => handleModeToggle("table")}
            className={`flex h-8 items-center gap-1.5 rounded px-3 text-sm font-medium transition-colors focus-visible:outline-2 focus-visible:outline-brand ${
              viewMode === "table"
                ? "bg-brand-soft text-brand"
                : "text-muted hover:text-foreground"
            }`}
            aria-pressed={viewMode === "table"}
          >
            <TableIcon className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">Tabel</span>
          </button>
        </div>

        {/* Right: all toolbar buttons */}
        <div className="ml-auto flex min-w-0 items-center justify-end gap-1.5 overflow-x-auto whitespace-nowrap">
          {viewMode === "map" && (
            <div
              className="
                flex
                h-9
                shrink-0
                items-center
                rounded-md
                border
                border-border
                bg-surface-1
                p-0.5
              "
              role="group"
              aria-label="Jenis peta"
            >
              {(
                [
                  ["basemap", "Standar"],
                  ["satellite", "Satelit"],
                  ["traffic", "Lalu Lintas"],
                ] as const
              ).map(([layer, label]) => {
                const active =
                  mapLayer === layer;

                return (
                  <button
                    key={layer}
                    id={`tsb-map-layer-${layer}`}
                    type="button"
                    onClick={() =>
                      handleLayerChange(layer)
                    }
                    className={`
                      h-8
                      rounded
                      px-3
                      text-sm
                      font-medium
                      transition-colors
                      focus-visible:outline
                      focus-visible:outline-2
                      focus-visible:outline-brand
                      ${
                        active
                          ? "bg-brand-soft text-brand"
                          : "text-muted hover:bg-surface-3 hover:text-foreground"
                      }
                    `}
                    aria-pressed={active}
                  >
                    {label}
                  </button>
                );
              })}
            </div>
          )}

          {viewMode === "table" && (
            <div className="relative">
              <Search className="pointer-events-none absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted" />
              <input
                id="tsb-find"
                type="search"
                value={search}
                onChange={(event) =>
                  setSearch(event.target.value)
                }
                placeholder="Cari plat atau pengemudi"
                className="h-9 w-56 rounded-md border border-border bg-surface-1 pl-8 pr-3 text-sm text-foreground placeholder:text-faint transition-colors focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand-soft"
              />
            </div>
          )}

          {viewMode === "map" && (
            <div className="flex h-9 items-center gap-1 border-l border-border pl-1.5">
              <Button
                id="tsb-zoom"
                variant="ghost"
                size="icon"
                onClick={handleZoomToFit}
                icon={<Maximize2 className="h-3.5 w-3.5" />}
                aria-label="Tampilkan seluruh unit"
                title="Tampilkan seluruh unit"
              />

              <Button
                id="tsb-cluster"
                variant={visibility.cluster ? "secondary" : "ghost"}
                size="sm"
                onClick={handleClusterToggle}
                icon={<CircleDot className="h-3.5 w-3.5" />}
                aria-pressed={visibility.cluster}
                aria-label="Aktifkan atau nonaktifkan cluster kendaraan"
                title="Cluster digunakan pada overview; kendaraan tampil satu per satu ketika zoom dekat"
              >
                Cluster
              </Button>

              <Button
                id="tsb-zone"
                variant={visibility.geofence ? "secondary" : "ghost"}
                size="sm"
                onClick={handleZoneToggle}
                icon={<Hexagon className="h-3.5 w-3.5" />}
                aria-pressed={visibility.geofence}
              >
                Zona
              </Button>
            </div>
          )}
        </div>
      </header>

      {/* ── STATUS FILTER ───────────────────────────────────────────────────── */}
      <div
        id="tracking-status-filter"
        className="flex h-11 shrink-0 items-stretch gap-1 overflow-x-auto border-b border-border bg-surface-1 px-4"
        aria-label="Filter status armada"
      >
        <div className="mr-2 flex shrink-0 items-center gap-2 text-sm font-medium text-muted">
          <Filter className="h-3.5 w-3.5" />
          <span>Status armada</span>
        </div>

        {(Object.keys(STATUS_META) as FilterStatus[]).map((key) => (
          <button
            key={key}
            data-status-filter={key}
            onClick={() =>
              setFilter(key)
            }
            className={`inline-flex h-full shrink-0 items-center gap-1.5 border-b-2 px-3 text-sm font-medium transition-colors focus-visible:outline-2 focus-visible:outline-brand ${
              filter === key
                ? "border-brand text-foreground"
                : "border-transparent text-muted hover:text-foreground"
            }`}
            aria-pressed={filter === key}
          >
            {key !== "all" && (
              <span
                className="h-2 w-2 rounded-full"
                style={{
                  background:
                    STATUS_META[key].colorVar,
                }}
              />
            )}

            <span>{STATUS_META[key].label}</span>

            <span className="text-xs tabular-nums text-faint">
              {counts[key]}
            </span>
          </button>
        ))}
      </div>

      {/* ── CONTENT ────────────────────────────────────────────────────────── */}
      {viewMode === "map" ? (
        <div className="grid min-h-0 flex-1 grid-cols-[320px_minmax(0,1fr)] overflow-hidden">
          {/* ── LEFT: Vehicle List ─────────────────────────────────────────── */}
          <aside
            id="tracking-vehicle-list"
            className="flex min-h-0 flex-col overflow-hidden border-r border-border bg-surface-1"
            aria-label="Daftar kendaraan"
          >
            <div className="shrink-0 border-b border-border p-3">
              <div className="mb-2.5 flex items-center justify-between">
                <p className="text-sm font-semibold text-foreground">
                  Armada
                </p>

                <span className="text-sm tabular-nums text-muted">
                  {filteredVehicles.length} unit
                </span>
              </div>

              <div className="relative">
                <Search className="pointer-events-none absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted" />
                <input
                  id="tsb-find"
                  type="search"
                  value={search}
                  onChange={(event) =>
                    setSearch(event.target.value)
                  }
                  placeholder="Cari plat atau pengemudi"
                  className="h-9 w-full rounded-md border border-border bg-surface-1 pl-8 pr-3 text-sm text-foreground placeholder:text-faint transition-colors focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand-soft"
                />
              </div>
            </div>

            <div
              id="tracking-vehicle-scroll"
              className="min-h-0 flex-1 overflow-x-hidden overflow-y-auto overscroll-contain [contain:layout_paint]"
            >
              {GROUP_ORDER.filter((g) => groupedVehicles[g]?.length).map((groupKey) => {
                const isCollapsed = collapsedGroups.has(groupKey);
                return (
                  <div key={groupKey}>
                    {/* Group header — clickable to collapse/expand */}
                    <button
                      onClick={() => toggleGroup(groupKey)}
                      className="sticky top-0 z-10 flex h-9 w-full items-center gap-2 border-b border-border bg-surface-1 px-4 text-left transition-colors hover:bg-surface-2 focus-visible:outline-2 focus-visible:outline-brand"
                      aria-expanded={!isCollapsed}
                      aria-controls={`group-${groupKey}`}
                    >
                      {/* Collapse/expand chevron */}
                      <ChevronRight
                        className={`h-3.5 w-3.5 text-muted shrink-0 transition-transform ${!isCollapsed ? "rotate-90" : ""}`}
                      />
                      <span
                        className="w-1.5 h-1.5 rounded-full shrink-0"
                        style={{ background: STATUS_META[groupKey].colorVar }}
                      />
                      <span className="flex-1 text-sm font-medium text-muted">
                        {STATUS_META[groupKey].label}
                      </span>
                      <span className="text-xs tabular-nums text-faint">
                        {groupedVehicles[groupKey].length}
                      </span>
                    </button>

                    {/* Vehicles in group — hidden when collapsed */}
                    {!isCollapsed && (
                      <div id={`group-${groupKey}`}>
                        {groupedVehicles[groupKey].map((v) => {
                          const isSelected =
                            selectedId === v.id;
                          const canonicalStatus =
                            toCanonicalStatus(v.status);
                          return (
                            <button
                              key={v.id}
                              onClick={() => handleSelect(v.id)}
                              className={`group w-full border-b border-border px-4 py-3 text-left transition-colors focus-visible:outline-2 focus-visible:outline-brand focus-visible:outline-inset ${
                                isSelected
                                  ? "border-l-[3px] border-l-brand bg-brand-soft"
                                  : "border-l-[3px] border-l-transparent hover:bg-surface-2"
                              }`}
                              aria-pressed={isSelected}
                            >
                              {/* Plate */}
                              <div className="flex items-center justify-between gap-2">
                                <p className={`font-mono text-sm font-semibold tabular-nums ${isSelected ? "text-brand" : "text-foreground"}`}>
                                  {v.plate_number}
                                </p>
                                <span
                                  className="inline-flex h-5 w-5 shrink-0 items-center justify-center"
                                  title={
                                    STATUS_META[
                                      canonicalStatus
                                    ].label
                                  }
                                >
                                  <span
                                    className="h-2 w-2 rounded-full"
                                    style={{
                                      background:
                                        STATUS_META[
                                          canonicalStatus
                                        ].colorVar,
                                    }}
                                  />
                                  <span className="sr-only">
                                    {
                                      STATUS_META[
                                        canonicalStatus
                                      ].label
                                    }
                                  </span>
                                </span>
                              </div>
                              {/* Driver */}
                              <p className="mt-1 truncate text-sm text-muted">
                                {v.driver_name || "Tanpa driver"}
                              </p>
                              {/* Speed + fuel */}
                              <div className="mt-1.5 flex gap-4 text-xs text-faint">
                                <span className="flex items-center gap-1">
                                  <Navigation className="h-3 w-3" />
                                  <span className="tabular-nums">{v.speed} km/j</span>
                                </span>
                                <span className="flex items-center gap-1">
                                  <Fuel className="h-3 w-3" />
                                  <span className="tabular-nums">{v.fuel_level}%</span>
                                </span>
                              </div>
                            </button>
                          );
                        })}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            {filteredVehicles.length === 0 && (
              <div className="p-6">
                <EmptyState
                  title="Tidak ada unit"
                  description="Coba ubah filter atau kata kunci pencarian."
                />
              </div>
            )}
          </aside>

          {/* ── RIGHT: Map ──────────────────────────────────────────────────── */}
          <main className="relative min-h-0 overflow-hidden">
            <TrackingMap
              vehicles={filteredVehicles}
              selectedId={selectedId}
              onSelectVehicle={handleSelect}
              visibility={visibility}
              toggleLayer={toggle}
              mapLayer={mapLayer}
              onFitAllReady={handleFitAllReady}
            />
          </main>
        </div>
      ) : (
        /* ── TABLE VIEW ─────────────────────────────────────────────────── */
        <div className="flex-1 overflow-auto bg-surface-2/40 p-3">
          {loading ? (
            <div className="p-4 space-y-3">
              {Array.from({ length: 6 }).map((_, i) => (
                <Skeleton key={i} height={52} rounded="lg" />
              ))}
            </div>
          ) : sortedVehicles.length === 0 ? (
            <EmptyState
              icon={<Search className="w-8 h-8" />}
              title="Tidak ada unit ditemukan"
              description="Periksa filter atau kata kunci pencarian Anda."
            />
          ) : (
            <div
              id="tracking-operational-table"
              className="
                min-w-[980px]
                overflow-hidden
                rounded-lg
                border
                border-border
                bg-surface-1
                shadow-none
                [&_table]:w-full
                [&_table]:border-collapse
                [&_thead]:sticky
                [&_thead]:top-0
                [&_thead]:z-20
                [&_thead]:bg-surface-2
                [&_th]:border-b
                [&_th]:border-r
                [&_th]:border-border
                [&_th]:bg-surface-2
                [&_th]:px-4
                [&_th]:py-3
                [&_td]:border-b
                [&_td]:border-r
                [&_td]:border-border
                [&_td]:px-4
                [&_td]:py-3
                [&_th:last-child]:border-r-0
                [&_td:last-child]:border-r-0
                [&_tbody_tr]:transition-colors
                [&_tbody_tr:hover]:bg-surface-2/70
              "
            >
              <TableContainer scrollable>
              <TableHead>
                <tr>
                  <TableHeadCell
                    id="th-plate"
                    sortable
                    sorted={sortKey === "plate_number" ? sortDir ?? false : false}
                    onClick={() => handleSort("plate_number")}
                  >
                    Plat
                  </TableHeadCell>
                  <TableHeadCell
                    id="th-driver"
                    sortable
                    sorted={sortKey === "driver_name" ? sortDir ?? false : false}
                    onClick={() => handleSort("driver_name")}
                  >
                    Pengemudi
                  </TableHeadCell>
                  <TableHeadCell>Kendaraan</TableHeadCell>
                  <TableHeadCell
                    className="text-right"
                    sortable
                    sorted={sortKey === "speed" ? sortDir ?? false : false}
                    onClick={() => handleSort("speed")}
                  >
                    Kecepatan
                  </TableHeadCell>
                  <TableHeadCell>BBM</TableHeadCell>
                  <TableHeadCell
                    sortable
                    sorted={sortKey === "status" ? sortDir ?? false : false}
                    onClick={() => handleSort("status")}
                  >
                    Status
                  </TableHeadCell>
                  <TableHeadCell
                    sortable
                    sorted={sortKey === "last_update" ? sortDir ?? false : false}
                    onClick={() => handleSort("last_update")}
                  >
                    Update Terakhir
                  </TableHeadCell>
                </tr>
              </TableHead>
              <TableBody>
                {sortedVehicles.map((v) => {
                  const isSelected = selectedId === v.id;
                  return (
                    <TableRow
                      key={v.id}
                      selectable
                      selected={isSelected}
                      onClick={() => handleSelect(v.id)}
                    >
                      <TableCell>
                        <span className="font-mono text-sm font-semibold tabular-nums">
                          {v.plate_number}
                        </span>
                      </TableCell>
                      <TableCell className="text-muted">
                        {v.driver_name || "—"}
                      </TableCell>
                      <TableCell className="text-muted">
                        {v.brand} {v.model}
                      </TableCell>
                      <TableCell numeric>
                        <span className="font-mono text-sm tabular-nums">
                          {v.speed} <span className="text-muted">km/j</span>
                        </span>
                      </TableCell>
                      <TableCell numeric>
                        <div className="flex items-center justify-end gap-1.5">
                          <div className="w-10 h-1.5 rounded-full bg-surface-3 overflow-hidden">
                            <div
                              className="h-full rounded-full"
                              style={{
                                width: `${v.fuel_level}%`,
                                background: v.fuel_level < 25
                                  ? "var(--st-offline)"
                                  : "var(--st-driving)",
                              }}
                            />
                          </div>
                          <span className="font-mono text-xs tabular-nums text-muted w-8 text-right">
                            {v.fuel_level}%
                          </span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <StatusPill status={v.status as any} />
                      </TableCell>
                      <TableCell>
                        <span className="font-mono text-xs tabular-nums text-muted">
                          {timeAgo(v.last_update)}
                        </span>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
              </TableContainer>
            </div>
          )}
        </div>
      )}

      {/* ── SPEEDING POPUP ─────────────────────────────────────────────────── */}
      <AnimatePresence>
        {speeding && (
          <motion.div
            id="speeding-popup"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 16 }}
            transition={
              reducedMotion
                ? { duration: 0 }
                : { type: "spring", stiffness: 400, damping: 30 }
            }
            className={`fixed bottom-4 z-toast flex max-w-xs items-start gap-3 rounded-lg border border-st-delayed/40 bg-surface-1 px-4 py-3 shadow-elev-2 ${
              viewMode === "map" && selectedId
                ? "right-[376px]"
                : "right-4"
            }`}
            role="alert"
            aria-live="polite"
          >
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-st-delayed/10">
              <AlertTriangle className="h-5 w-5 text-st-delayed" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-foreground">
                Melebihi batas kecepatan
              </p>
              <p className="mt-0.5 font-mono text-sm tabular-nums font-semibold" style={{ color: "var(--st-delayed)" }}>
                {speeding.plate_number} · {speeding.speed} km/j
              </p>
              <p className="mt-0.5 text-xs text-muted truncate">
                {speeding.address}
              </p>
            </div>
            <button
              onClick={() => setSpeeding(null)}
              className="shrink-0 p-1 rounded text-muted hover:text-foreground hover:bg-surface-2 transition-colors"
              aria-label="Tutup peringatan"
            >
              <X className="h-4 w-4" />
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
