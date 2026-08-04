"use client";

import dynamic from "next/dynamic";
import { useEffect, useMemo, useState, useCallback } from "react";
import { useSearchParams } from "next/navigation";
import { motion, AnimatePresence } from "motion/react";
import {
  Map,
  Table as TableIcon,
  RefreshCw,
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
import { MOCK_VEHICLES, toMapVehicle } from "@/lib/mock-data";
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
  const { success, warning, info } = useToast();
  const searchParams = useSearchParams();
  const reducedMotion = useReducedMotion();

  /* ── State ──────────────────────────────────────────────────────────────── */
  const [vehicles, setVehicles] = useState<Vehicle[]>(MOCK_VEHICLES);
  const [loading, setLoading] = useState(false);
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<FilterStatus>("all");
  const [viewMode, setViewMode] = useState<"map" | "table">("map");
  const [lastRefresh, setLastRefresh] = useState(new Date());

  /* Map toolbar state */
  const [mapLayer, setMapLayer] = useState<"basemap" | "satellite" | "traffic">("basemap");
  const [refreshing, setRefreshing] = useState(false);

  /** Layer visibility — single source of truth shared between toolbar, panel, and MapView */
  const { visibility, toggle } = useLayerVisibility(DEFAULT_LAYER_VISIBILITY);

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

  /* ── Focus from query param ─────────────────────────────────────────────── */
  useEffect(() => {
    const focus = searchParams.get("focus");
    if (focus) {
      const id = parseInt(focus, 10);
      if (!isNaN(id)) {
        setSelectedId(id);
        setViewMode("map");
      }
    }
  }, [searchParams]);

  /* ── Refresh data ──────────────────────────────────────────────────────── */
  useEffect(() => {
    fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000"}/api/vehicles`)
      .then((r) => (r.ok ? r.json() : null))
      .then((data) => Array.isArray(data) && data.length > 0 && setVehicles(data))
      .catch(() => {});
  }, []);

  /* ── Speeding detection (mock: first driving unit > 80) ────────────────── */
  useEffect(() => {
    const fast = vehicles.find((v) => toCanonicalStatus(v.status) === "driving" && v.speed > 80);
    if (fast) {
      setSpeeding({
        plate_number: fast.plate_number,
        speed: fast.speed,
        address: "Jl. tol dalam kota, Jakarta",
      });
      const t = setTimeout(() => setSpeeding(null), 6000);
      return () => clearTimeout(t);
    } else {
      setSpeeding(null);
    }
  }, [vehicles]);

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
  const handleSelect = useCallback((id: number) => {
    setSelectedId(id);
    if (viewMode === "table") setViewMode("map");
  }, [viewMode]);

  const handleDoubleClick = useCallback((id: number) => {
    setSelectedId(id);
  }, []);

  /* ── Toolbar handlers ───────────────────────────────────────────────────── */
  function handleModeToggle(mode: "map" | "table") {
    setViewMode(mode);
    info("Mode tampilan", mode === "map" ? "Beralih ke tampilan Peta" : "Beralih ke tampilan Tabel");
  }

  function handleLayerChange(layer: typeof mapLayer) {
    setMapLayer(layer);
    success("Layer aktif", `${layer === "basemap" ? "Peta dasar" : layer === "satellite" ? "Satelit" : "Lalu lintas"}`);
  }

  function handleRefresh() {
    setRefreshing(true);
    setTimeout(() => {
      setLastRefresh(new Date());
      setRefreshing(false);
      success("Data diperbarui", `${vehicles.length} unit dimuat`);
    }, 800);
  }

  function handleFind() {
    if (!search.trim()) {
      warning("Cari unit", "Ketik plat nomor atau nama driver untuk mencari");
    }
  }

  function handleZoomToFit() {
    info("Zoom to fit", "Semua unit ditampikan di peta");
  }

  function handleClusterToggle() {
    toggle("cluster");
    success("Cluster", visibility.cluster ? "D Sembunyikan" : "✓ Tampilkan");
  }

  function handleZoneToggle() {
    toggle("geofence");
    success("Zone/Geofence", visibility.geofence ? "D Sembunyikan" : "✓ Tampilkan");
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
    <div className="flex h-[calc(100vh-4rem)] flex-col overflow-hidden">
      {/* ── TOOLBAR ────────────────────────────────────────────────────────── */}
      <header
        className="flex items-center justify-between gap-4 border-b border-border bg-surface-1 px-4 py-2 shrink-0"
        role="toolbar"
        aria-label="Kontrol Realtime Monitor"
      >
        {/* Left: title + counts */}
        <div className="flex items-center gap-4 min-w-0">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-brand text-white">
              <Map className="h-4 w-4" />
            </div>
            <div>
              <h1 className="text-sm font-semibold text-foreground leading-none">
                Realtime Monitor
              </h1>
              <p className="text-xs text-muted mt-0.5 tabular-nums">
                {counts.all} unit ·{" "}
                <span className="text-st-driving">{counts.driving} berkendara</span>
              </p>
            </div>
          </div>
        </div>

        {/* Center: mode toggle */}
        <div className="flex items-center rounded-lg bg-surface-2 p-0.5 shrink-0">
          <button
            id="tsb-mode-map"
            onClick={() => handleModeToggle("map")}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm font-medium transition-all duration-100 focus-visible:outline-2 focus-visible:outline-brand ${
              viewMode === "map"
                ? "bg-surface-1 text-foreground shadow-sm"
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
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm font-medium transition-all duration-100 focus-visible:outline-2 focus-visible:outline-brand ${
              viewMode === "table"
                ? "bg-surface-1 text-foreground shadow-sm"
                : "text-muted hover:text-foreground"
            }`}
            aria-pressed={viewMode === "table"}
          >
            <TableIcon className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">Tabel</span>
          </button>
        </div>

        {/* Right: all toolbar buttons */}
        <div className="flex items-center gap-2 flex-wrap justify-end">
          {/* Map layer switcher */}
          <div className="flex items-center rounded-lg bg-surface-2 p-0.5 gap-0.5">
            {(["basemap", "satellite", "traffic"] as const).map((layer) => (
              <button
                key={layer}
                id={`tsb-map-layer-${layer}`}
                onClick={() => handleLayerChange(layer)}
                className={`px-2.5 py-1 rounded-md text-xs font-medium transition-all duration-100 focus-visible:outline-2 focus-visible:outline-brand ${
                  mapLayer === layer
                    ? "bg-surface-1 text-foreground shadow-sm"
                    : "text-muted hover:text-foreground"
                }`}
                aria-pressed={mapLayer === layer}
              >
                {layer === "basemap" ? "Peta" : layer === "satellite" ? "Satelit" : "Lalu Lintas"}
              </button>
            ))}
          </div>

          {/* Search */}
          <div className="relative">
            <Search className="absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted pointer-events-none" />
            <input
              id="tsb-find"
              type="search"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleFind()}
              placeholder="Cari plat / driver..."
              className="h-8 w-40 pl-8 pr-3 rounded-lg border border-border bg-surface-1 text-xs text-foreground placeholder:text-faint focus:outline-none focus:border-brand focus:ring-2 focus:ring-brand-soft transition-colors"
            />
          </div>

          {/* Filter */}
          <Button
            id="tsb-filter"
            variant="secondary"
            size="sm"
            onClick={() => {
              const allFilters: FilterStatus[] = ["all", "driving", "idle", "stop", "offline"];
              const currentIdx = allFilters.indexOf(filter);
              const next = allFilters[(currentIdx + 1) % allFilters.length];
              setFilter(next);
              info("Filter", `Status: ${STATUS_META[next].label}`);
            }}
            icon={<Filter className="h-3.5 w-3.5" />}
          >
            {STATUS_META[filter].label}
          </Button>

          {/* Refresh */}
          <Button
            id="tsb-reload"
            variant="secondary"
            size="sm"
            onClick={handleRefresh}
            disabled={refreshing}
            icon={
              <RefreshCw
                className={`h-3.5 w-3.5 ${refreshing ? "animate-spin" : ""}`}
              />
            }
            aria-label="Refresh data"
          >
            <span className="tabular-nums text-xs">
              {lastRefresh.toLocaleTimeString("id-ID", {
                hour: "2-digit",
                minute: "2-digit",
              })}
            </span>
          </Button>

          {/* Zoom to fit */}
          <Button
            id="tsb-zoom"
            variant="ghost"
            size="icon"
            onClick={handleZoomToFit}
            icon={<Maximize2 className="h-3.5 w-3.5" />}
            aria-label="Zoom to fit semua unit"
          />

          {/* Cluster toggle */}
          <Button
            id="tsb-cluster"
            variant={visibility.cluster ? "secondary" : "ghost"}
            size="sm"
            onClick={handleClusterToggle}
            icon={<CircleDot className="h-3.5 w-3.5" />}
            aria-pressed={visibility.cluster}
          >
            Cluster
          </Button>

          {/* Zone / geofence toggle */}
          <Button
            id="tsb-zone"
            variant={visibility.geofence ? "secondary" : "ghost"}
            size="sm"
            onClick={handleZoneToggle}
            icon={<Hexagon className="h-3.5 w-3.5" />}
            aria-pressed={visibility.geofence}
          >
            Zone
          </Button>
        </div>
      </header>

      {/* ── FILTER BAR ──────────────────────────────────────────────────────── */}
      <div className="flex items-center gap-2 border-b border-border bg-surface-1 px-4 py-2 shrink-0">
        <Filter className="h-3.5 w-3.5 text-muted shrink-0" />
        <span className="text-xs font-semibold uppercase tracking-widest text-muted mr-1">
          Status:
        </span>
        {(Object.keys(STATUS_META) as FilterStatus[]).map((key) => (
          <button
            key={key}
            onClick={() => {
              setFilter(key);
              if (key !== "all") info("Filter status", STATUS_META[key].label);
            }}
            className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold transition-all duration-100 focus-visible:outline-2 focus-visible:outline-brand ${
              filter === key
                ? "bg-foreground text-background"
                : "bg-surface-2 text-muted hover:bg-surface-3 hover:text-foreground"
            }`}
            aria-pressed={filter === key}
          >
            {key !== "all" && (
              <span className="w-2.5 h-2.5">{STATUS_META[key].icon}</span>
            )}
            {STATUS_META[key].label}
            <span className="tabular-nums opacity-60">({counts[key]})</span>
          </button>
        ))}
      </div>

      {/* ── CONTENT ────────────────────────────────────────────────────────── */}
      {viewMode === "map" ? (
        <div className="grid flex-1 grid-cols-[280px_1fr] overflow-hidden">
          {/* ── LEFT: Vehicle List ─────────────────────────────────────────── */}
          <aside className="flex flex-col border-r border-border overflow-hidden bg-surface-1">
            <div className="border-b border-border px-3 py-2 shrink-0">
              <p className="text-[10px] font-semibold uppercase tracking-widest text-muted">
                Unit ({filteredVehicles.length})
              </p>
            </div>

            <div className="flex-1 overflow-y-auto">
              {GROUP_ORDER.filter((g) => groupedVehicles[g]?.length).map((groupKey) => {
                const isCollapsed = collapsedGroups.has(groupKey);
                return (
                  <div key={groupKey}>
                    {/* Group header — clickable to collapse/expand */}
                    <button
                      onClick={() => toggleGroup(groupKey)}
                      className="sticky top-0 z-10 w-full flex items-center gap-2 bg-surface-2 border-b border-border px-3 py-1.5 text-left transition-colors hover:bg-surface-3 focus-visible:outline-2 focus-visible:outline-brand"
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
                      <span className="text-[10px] font-semibold uppercase tracking-widest text-muted flex-1">
                        {STATUS_META[groupKey].label}
                      </span>
                      <span className="tabular-nums text-[10px] text-muted">
                        {groupedVehicles[groupKey].length}
                      </span>
                    </button>

                    {/* Vehicles in group — hidden when collapsed */}
                    {!isCollapsed && (
                      <>
                        {groupedVehicles[groupKey].map((v) => {
                          const isSelected = selectedId === v.id;
                          return (
                            <button
                              key={v.id}
                              id={`group-${groupKey}`}
                              onClick={() => handleSelect(v.id)}
                              onDoubleClick={() => handleDoubleClick(v.id)}
                              className={`w-full border-b border-border px-3 py-2.5 text-left transition-colors focus-visible:outline-2 focus-visible:outline-brand focus-visible:outline-inset ${
                                isSelected
                                  ? "bg-brand-soft border-l-2 border-l-brand"
                                  : "hover:bg-surface-2"
                              }`}
                              aria-selected={isSelected}
                            >
                              {/* Plate */}
                              <div className="flex items-center justify-between gap-2">
                                <p className={`font-mono text-sm font-semibold tabular-nums ${isSelected ? "text-brand" : "text-foreground"}`}>
                                  {v.plate_number}
                                </p>
                                <StatusPill
                                  status={v.status as any}
                                  showIcon={false}
                                  showDot={true}
                                  className="text-[10px]"
                                />
                              </div>
                              {/* Driver */}
                              <p className={`mt-0.5 text-xs truncate ${isSelected ? "text-brand/70" : "text-muted"}`}>
                                {v.driver_name || "Tanpa driver"}
                              </p>
                              {/* Speed + fuel */}
                              <div className={`mt-1 flex gap-3 text-[11px] ${isSelected ? "text-brand/60" : "text-faint"}`}>
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
                      </>
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
          <main className="relative overflow-hidden">
            <TrackingMap
              vehicles={filteredVehicles}
              selectedId={selectedId}
              onSelectVehicle={handleSelect}
              visibility={visibility}
              toggleLayer={toggle}
              mapLayer={mapLayer}
            />
          </main>
        </div>
      ) : (
        /* ── TABLE VIEW ─────────────────────────────────────────────────── */
        <div className="flex-1 overflow-auto">
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
                    Driver
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
            className="fixed bottom-6 right-6 z-toast flex items-start gap-3 rounded-xl border border-st-delayed/40 bg-surface-1 px-4 py-3 shadow-elev-3 max-w-xs"
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
