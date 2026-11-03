"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import dynamic from "next/dynamic";
import { useRouter } from "next/navigation";
import {
  Crosshair,
  MapPin,
  Navigation,
  Radio,
  Search,
  Truck,
  X,
} from "lucide-react";
import { FLEET_VEHICLES, toMapVehicle } from "@/lib/fleet-data";
import { useAppContext } from "@/components/context/AppContext";
import type { Vehicle } from "@/types";
import { useToast } from "@/components/ui/Toast";
import { StatusPill } from "@/components/ui/Badge";
import { Button, IconButton } from "@/components/ui/Button";
import { Card, EmptyState } from "@/components/ui/Card";

/* ─── Types ─────────────────────────────────────────────────────────────────── */

type FilterStatus = "all" | Vehicle["status"];
type VehicleStatus = "driving" | "idle" | "stopped" | "offline";

/** Vehicle.status ("stopped") → StatusPill ("stop") */
function toBadgeStatus(s: VehicleStatus): "driving" | "idle" | "stop" | "offline" {
  return s === "stopped" ? "stop" : (s as "driving" | "idle" | "offline");
}

/* ─── Lazy Map ─────────────────────────────────────────────────────────────── */

const LocateMap = dynamic(() => import("@/components/map/MapView").then((m) => m.default), {
  ssr: false,
  loading: () => (
    <div className="w-full h-full flex items-center justify-center bg-bg">
      <div className="flex flex-col items-center gap-3">
        <div className="h-8 w-8 rounded-full border-2 border-brand border-t-transparent animate-spin" />
        <span className="text-sm text-muted">Memuat peta...</span>
      </div>
    </div>
  ),
});

/* ─── Mock address resolver ─────────────────────────────────────────────── */

function getMockAddress(lat: number | null, lng: number | null): string {
  if (!lat || !lng) return "Koordinat tidak tersedia";
  if (lat < -6.3 && lng > 107.0) return "Kawasan Industri Cikarang, Bekasi";
  if (lat < -6.15 && lng < 106.85) return "Area Jakarta Pusat";
  if (lat < -6.2 && lng < 106.75) return "Tanjung Priok, Jakarta";
  if (lat < -6.9 && lng > 107.5) return "Kota Bandung, Jawa Barat";
  if (lat < -7.2 && lng > 112.6) return "Surabaya, Jawa Timur";
  if (lat < -6.5 && lng < 106.8) return "Sentul City, Bogor";
  return "Jawa Barat, Indonesia";
}

function formatLastUpdate(iso: string): string {
  const d = new Date(iso);
  const now = Date.now();
  const diff = Math.floor((now - d.getTime()) / 1000);
  if (diff < 60) return "Baru saja";
  if (diff < 3600) return `${Math.floor(diff / 60)}m lalu`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}j lalu`;
  return `${Math.floor(diff / 86400)} hari lalu`;
}

/* ─── Main Page ─────────────────────────────────────────────────────────────── */

export default function LocatePage() {
  const { success } = useToast();
  const { vehicles: contextVehicles } = useAppContext();
  const vehicles = contextVehicles.length > 0 ? contextVehicles : FLEET_VEHICLES;

  const [search, setSearch] = useState("");
  const [searchOpen, setSearchOpen] = useState(false);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const [filterStatus, setFilterStatus] = useState<FilterStatus>("all");
  const [selected, setSelected] = useState<Vehicle | null>(() => vehicles[0] ?? null);
  // Store map imperative commands (fitAll) — populated via onMapReady callback
  const [mapCommands, setMapCommands] = useState<{ fitAll: () => void } | null>(null);

  useEffect(() => {
    if (searchOpen) searchInputRef.current?.focus();
  }, [searchOpen]);

  // KPI counts
  const counts = useMemo(() => ({
    all: vehicles.length,
    driving: vehicles.filter((v) => v.status === "driving").length,
    idle: vehicles.filter((v) => v.status === "idle").length,
    stopped: vehicles.filter((v) => v.status === "stopped").length,
    offline: vehicles.filter((v) => v.status === "offline").length,
  }), [vehicles]);

  // Filtered list
  const rows = useMemo(() => {
    const q = search.trim().toLowerCase();
    return vehicles.filter((v) => {
      if (q && !v.plate_number.toLowerCase().includes(q)
        && !(v.driver_name ?? "").toLowerCase().includes(q)
        && !v.brand.toLowerCase().includes(q)
        && !String(v.id).includes(q)) return false;
      if (filterStatus !== "all" && v.status !== filterStatus) return false;
      return true;
    });
  }, [vehicles, search, filterStatus]);

  // Map vehicles
  const mapVehicles = useMemo(() => vehicles.map(toMapVehicle), [vehicles]);

  function handleSelect(v: Vehicle) {
    setSelected(v);
  }

  function handleFitAll() {
    mapCommands?.fitAll();
  }

  const router = useRouter();

  function handleRealtime() {
    if (!selected) return;
    router.push(`/tracking?focus=${selected.id}`);
  }

  function handleCopyCoords() {
    if (!selected?.latitude || !selected?.longitude) return;
    const coord = `${selected.latitude.toFixed(6)}, ${selected.longitude.toFixed(6)}`;
    navigator.clipboard.writeText(coord).then(() => {
      success("Koordinat disalin ke clipboard");
    }).catch(() => {
      // Clipboard access denied
    });
  }

  function resetFilters() {
    setSearch("");
    setFilterStatus("all");
  }

  const isFiltered = search !== "" || filterStatus !== "all";

  return (
    <div className="flex h-[calc(100dvh-3.625rem)] max-h-[calc(100dvh-3.625rem)] min-h-0 flex-col overflow-hidden">
      {/* ─── Body: 2-column ────────────────────────────────────────────── */}
      <div className="flex-1 overflow-hidden flex">
        {/* ── LEFT: Search + List ──────────────────────────────────────── */}
        <div className="flex w-[340px] shrink-0 flex-col overflow-hidden border-r border-border bg-surface-1">
          {/* Compact list header / search */}
          <div className="flex h-14 shrink-0 items-center border-b border-border px-4">
            {searchOpen ? (
              <div className="relative flex w-full items-center gap-2">
                <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" />
                <input
                  ref={searchInputRef}
                  type="text"
                  value={search}
                  onChange={(event) => setSearch(event.target.value)}
                  onKeyDown={(event) => {
                    if (event.key === "Escape") {
                      setSearch("");
                      setSearchOpen(false);
                    }
                  }}
                  placeholder="Cari plat, pengemudi, atau ID..."
                  className="h-8 min-w-0 flex-1 border border-border bg-surface-1 pl-9 pr-3 text-sm text-foreground placeholder:text-faint focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand/20"
                  aria-label="Cari unit"
                />
                <button
                  type="button"
                  onClick={() => {
                    setSearch("");
                    setSearchOpen(false);
                  }}
                  className="flex h-8 w-8 shrink-0 items-center justify-center text-muted transition-colors hover:bg-surface-2 hover:text-foreground focus-visible:outline-2 focus-visible:outline-brand"
                  aria-label="Tutup pencarian"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            ) : (
              <>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-semibold text-foreground">Daftar Unit</p>
                  <p className="mt-0.5 text-xs text-muted">{rows.length} dari {vehicles.length} unit</p>
                </div>
                {isFiltered && (
                  <button
                    type="button"
                    onClick={resetFilters}
                    className="mr-1 h-7 px-2 text-xs font-medium text-brand hover:bg-brand/10 focus-visible:outline-2 focus-visible:outline-brand"
                  >
                    Reset
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => setSearchOpen(true)}
                  className="flex h-8 w-8 shrink-0 items-center justify-center text-muted transition-colors hover:bg-surface-2 hover:text-foreground focus-visible:outline-2 focus-visible:outline-brand"
                  aria-label="Cari unit"
                >
                  <Search className="h-4 w-4" />
                </button>
              </>
            )}
          </div>

          {/* Status filter */}
          <div className="flex h-10 shrink-0 items-stretch overflow-x-auto border-b border-border" aria-label="Filter status unit">
            {([
              { key: "all" as FilterStatus, label: "Semua" },
              { key: "driving" as FilterStatus, label: "Jalan" },
              { key: "idle" as FilterStatus, label: "Diam" },
              { key: "stopped" as FilterStatus, label: "Berhenti" },
              { key: "offline" as FilterStatus, label: "Offline" },
            ]).map((item) => (
              <button
                key={item.key}
                type="button"
                onClick={() => setFilterStatus(item.key)}
                className={`flex min-w-0 flex-1 items-center justify-center gap-1 border-r border-border px-1.5 text-xs font-medium transition-colors focus-visible:outline-2 focus-visible:outline-brand ${
                  filterStatus === item.key
                    ? "bg-brand text-slate-950"
                    : "text-muted hover:bg-surface-2 hover:text-foreground"
                }`}
                aria-pressed={filterStatus === item.key}
              >
                <span>{item.label}</span>
                <span className="font-mono text-[11px] tabular-nums opacity-70">{counts[item.key]}</span>
              </button>
            ))}
          </div>

          {/* Unit list */}
          <div className="flex-1 overflow-y-auto">
            {rows.length === 0 ? (
              <div className="flex items-center justify-center h-full p-6">
                <EmptyState
                  icon={<Truck className="w-8 h-8 opacity-40" />}
                  title="Unit tidak ditemukan"
                  description="Tidak ada unit yang cocok dengan pencarian."
                  action={
                    <Button variant="secondary" size="sm" onClick={resetFilters}>
                      Reset Pencarian
                    </Button>
                  }
                />
              </div>
            ) : (
              <div>
                {rows.map((v) => {
                  const isSelected = selected?.id === v.id;
                  return (
                    <button
                      key={v.id}
                      onClick={() => handleSelect(v)}
                      aria-label={`Pilih unit ${v.plate_number}`}
                      className={
                        "w-full border-b border-border px-4 py-3 text-left transition-colors focus-visible:outline-2 focus-visible:outline-brand focus-visible:outline-inset " +
                        (isSelected
                          ? "border-l-[3px] border-l-brand bg-brand/10"
                          : "border-l-[3px] border-l-transparent hover:bg-surface-2")
                      }
                    >
                      {/* Unit identity */}
                      <div className="flex min-w-0 items-baseline gap-2.5">
                        <span className={`shrink-0 whitespace-nowrap font-mono text-base font-bold tabular-nums ${isSelected ? "text-brand" : "text-foreground"}`}>
                          {v.plate_number}
                        </span>
                        <span className="min-w-0 flex-1 truncate text-sm text-muted">
                          {v.driver_name || "Belum ditugaskan"}
                        </span>
                      </div>
                      {/* Status + heading + update */}
                      <div className="mt-2 flex items-center gap-3 text-xs text-muted">
                        <span className="inline-flex items-center gap-1 font-medium">
                          <span className={`h-1.5 w-1.5 rounded-full ${
                            v.status === "driving" ? "bg-st-driving" :
                            v.status === "idle" ? "bg-st-idle" :
                            v.status === "offline" ? "bg-st-offline" : "bg-st-stop"
                          }`} />
                          {v.status === "driving" ? "Berkendara" : v.status === "idle" ? "Diam" : v.status === "stopped" ? "Berhenti" : "Offline"}
                        </span>
                        <span className="font-mono font-medium tabular-nums">
                          {v.speed > 0 ? `${Math.round(v.speed)} km/j` : "0 km/j"}
                        </span>
                        <span className="flex items-center gap-1">
                          <Navigation className="h-3.5 w-3.5" />
                          {Math.round(v.heading)}&deg;
                        </span>
                        <span className="ml-auto whitespace-nowrap">
                          {formatLastUpdate(v.last_update)}
                        </span>
                      </div>
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* ── RIGHT: Map ─────────────────────────────────────────────── */}
        <div className="flex-1 relative overflow-hidden bg-bg">
          <LocateMap
            vehicles={mapVehicles}
            selectedId={selected?.id ?? null}
            onMapReady={setMapCommands}
            className="w-full h-full"
            zoom={7.2}
            pitch={45}
          />

          {/* Map overlay: info chip top-left */}
          <div className="absolute top-4 left-4 z-dock">
            <Card padding="sm">
              <div className="flex items-center gap-2.5">
                <div className="w-10 h-10 rounded-lg bg-brand flex items-center justify-center">
                  <Truck className="w-5 h-5 text-white" />
                </div>
                <div>
                  <p className="text-base font-bold text-foreground">
                    {selected ? selected.plate_number : "Pilih unit"}
                  </p>
                  <p className="text-sm text-muted">
                    {selected ? `${selected.brand} ${selected.model}` : "Klik unit di daftar"}
                  </p>
                </div>
                <Button
                  size="sm"
                  variant="secondary"
                  icon={<Crosshair className="w-3.5 h-3.5" />}
                  onClick={handleFitAll}
                  aria-label="Pusatkan ke semua unit"
                  className="ml-2"
                >
                  Semua
                </Button>
              </div>
            </Card>
          </div>

          {/* Detail card bottom */}
          {selected ? (
            <div className="absolute bottom-4 left-4 right-4 z-dock">
              <Card padding="md">
                {/* Header row */}
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-10 h-10 rounded-lg bg-surface-2 border border-border flex items-center justify-center shrink-0">
                      <Truck className="w-5 h-5 text-muted" />
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="font-mono font-bold text-lg text-foreground">{selected.plate_number}</span>
                        <StatusPill
                          status={toBadgeStatus(selected.status as VehicleStatus)}
                          showIcon={false}
                          showDot={true}
                          live={selected.status === "driving"}
                          className="text-xs px-1.5 py-0.5"
                        />
                      </div>
                      <p className="text-sm text-muted mt-1">
                        {selected.driver_name || "Belum ditugaskan"} &middot; {selected.brand} {selected.model}
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => setSelected(null)}
                    className="shrink-0 p-1 rounded text-muted hover:bg-surface-2 hover:text-foreground
                               focus-visible:outline-2 focus-visible:outline-brand transition-colors"
                    aria-label="Tutup detail unit"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>

                {/* Stats grid */}
                <div className="mt-3 grid grid-cols-4 gap-2">
                  <div className="rounded bg-surface-2 border border-border px-3 py-2">
                    <p className="text-[9px] font-semibold uppercase tracking-widest text-muted">Kecepatan</p>
                    <p className="text-sm font-bold font-mono tabular-nums text-foreground mt-0.5">
                      {selected.speed > 0 ? Math.round(selected.speed) + " km/h" : "—"}
                    </p>
                  </div>
                  <div className="rounded bg-surface-2 border border-border px-3 py-2">
                    <p className="text-[9px] font-semibold uppercase tracking-widest text-muted">Heading</p>
                    <p className="text-sm font-bold font-mono tabular-nums text-foreground mt-0.5">
                      {Math.round(selected.heading)}&deg;
                    </p>
                  </div>
                  <div className="rounded bg-surface-2 border border-border px-3 py-2">
                    <p className="text-[9px] font-semibold uppercase tracking-widest text-muted">GPS</p>
                    <p className="text-sm font-semibold text-foreground mt-0.5">
                      <span className={"inline-flex items-center gap-1 " + (selected.status !== "offline" ? "text-st-driving" : "text-st-offline")}>
                        <span className={"w-1.5 h-1.5 rounded-full " + (selected.status !== "offline" ? "bg-st-driving animate-live-pulse" : "bg-st-offline")} />
                        {selected.status !== "offline" ? "Online" : "Offline"}
                      </span>
                    </p>
                  </div>
                  <div className="rounded bg-surface-2 border border-border px-3 py-2">
                    <p className="text-[9px] font-semibold uppercase tracking-widest text-muted">Update</p>
                    <p className="text-xs font-semibold text-muted mt-0.5">
                      {formatLastUpdate(selected.last_update)}
                    </p>
                  </div>
                </div>

                {/* Coordinates */}
                <div className="mt-2 rounded bg-surface-2 border border-border px-3 py-2 flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-muted shrink-0" />
                  <span className="text-sm font-mono tabular-nums text-foreground flex-1">
                    {selected.latitude?.toFixed(6) ?? "—"}, {selected.longitude?.toFixed(6) ?? "—"}
                  </span>
                  <span className="text-sm text-muted truncate max-w-[160px]">
                    {getMockAddress(selected.latitude, selected.longitude)}
                  </span>
                </div>

                {/* Quick actions */}
                <div className="mt-3 flex items-center gap-2">
                  <Button
                    size="sm"
                    variant="primary"
                    icon={<Radio className="w-3.5 h-3.5" />}
                    onClick={handleRealtime}
                    aria-label="Lacak realtime unit"
                    className="flex-1"
                  >
                    Lacak Realtime
                  </Button>
                  <IconButton
                    icon={<MapPin className="w-3.5 h-3.5" />}
                    onClick={handleCopyCoords}
                    variant="ghost"
                    size="sm"
                    aria-label="Salin koordinat"
                  />
                </div>
              </Card>
            </div>
          ) : (
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <Card padding="md" className="pointer-events-auto">
                <div className="flex items-center gap-3">
                  <Truck className="w-6 h-6 text-muted" />
                  <div>
                    <p className="text-sm font-semibold text-foreground">Tidak ada unit dipilih</p>
                    <p className="text-xs text-muted">Klik unit di panel kiri untuk melihat detail.</p>
                  </div>
                </div>
              </Card>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
