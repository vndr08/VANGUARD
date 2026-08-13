"use client";

import { useMemo, useState } from "react";
import dynamic from "next/dynamic";
import { useRouter } from "next/navigation";
import { motion } from "motion/react";
import {
  Crosshair,
  History,
  MapPin,
  MessageSquare,
  Navigation,
  Radio,
  Search,
  Truck,
  X,
} from "lucide-react";
import { FLEET_VEHICLES, toMapVehicle } from "@/lib/fleet-data";
import type { Vehicle } from "@/types";
import { useToast } from "@/components/ui/Toast";
import { StatusPill } from "@/components/ui/Badge";
import { Button, IconButton } from "@/components/ui/Button";
import { Card, EmptyState } from "@/components/ui/Card";
import { useReducedMotion } from "@/hooks/useReducedMotion";

/* ─── Types ─────────────────────────────────────────────────────────────────── */

type FilterStatus = "all" | Vehicle["status"];
type VehicleStatus = "driving" | "idle" | "stopped" | "offline";

/** Vehicle.status ("stopped") → StatusPill ("stop") */
function toBadgeStatus(s: VehicleStatus): "driving" | "idle" | "stop" | "offline" {
  return s === "stopped" ? "stop" : (s as "driving" | "idle" | "offline");
}

/* ─── KPI Components ─────────────────────────────────────────────────────────── */

function KpiStat({ label, value, accent }: { label: string; value: number; accent?: string }) {
  const reducedMotion = useReducedMotion();
  return (
    <div className="flex flex-col items-center px-4 py-2 rounded-lg bg-surface-2 border border-border min-w-[72px]">
      <motion.span
        key={value}
        initial={{ opacity: 0.6, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={reducedMotion ? { duration: 0 } : { duration: 0.2 }}
        className={"text-xl font-bold tabular-nums " + (accent ?? "text-foreground")}
      >
        {value}
      </motion.span>
      <span className="text-label text-muted">{label}</span>
    </div>
  );
}

function KpiDivider() {
  return <div className="w-px h-8 bg-border self-center" />;
}

/* ─── Lazy Map ─────────────────────────────────────────────────────────────── */

const LocateMap = dynamic(() => import("@/components/map/MapView").then((m) => m.default), {
  ssr: false,
  loading: () => (
    <div className="w-full h-full flex items-center justify-center bg-bg">
      <div className="flex flex-col items-center gap-3">
        <div className="h-8 w-8 rounded-full border-2 border-brand border-t-transparent animate-spin" />
        <span className="text-sm text-muted">Loading map...</span>
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
  if (diff < 60) return `${diff}d ago`;
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  return `${Math.floor(diff / 86400)}d ago`;
}

/* ─── Main Page ─────────────────────────────────────────────────────────────── */

export default function LocatePage() {
  const { success } = useToast();

  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState<FilterStatus>("all");
  const [selected, setSelected] = useState<Vehicle | null>(FLEET_VEHICLES[0]);
  // Store map imperative commands (fitAll) — populated via onMapReady callback
  const [mapCommands, setMapCommands] = useState<{ fitAll: () => void } | null>(null);

  // KPI counts
  const counts = useMemo(() => ({
    total: FLEET_VEHICLES.length,
    online: FLEET_VEHICLES.filter((v) => v.status !== "offline").length,
    moving: FLEET_VEHICLES.filter((v) => v.status === "driving").length,
    offline: FLEET_VEHICLES.filter((v) => v.status === "offline").length,
  }), []);

  // Filtered list
  const rows = useMemo(() => {
    const q = search.trim().toLowerCase();
    return FLEET_VEHICLES.filter((v) => {
      if (q && !v.plate_number.toLowerCase().includes(q)
        && !(v.driver_name ?? "").toLowerCase().includes(q)
        && !v.brand.toLowerCase().includes(q)
        && !String(v.id).includes(q)) return false;
      if (filterStatus !== "all" && v.status !== filterStatus) return false;
      return true;
    });
  }, [search, filterStatus]);

  // Map vehicles
  const mapVehicles = useMemo(() => FLEET_VEHICLES.map(toMapVehicle), []);

  function handleSelect(v: Vehicle) {
    setSelected(v);
  }

  function handleFitAll() {
    mapCommands?.fitAll();
  }

  const router = useRouter();

  function handleRealtime() {
    if (!selected) return;
    router.push(`/tracking?vehicle=${selected.plate_number.toLowerCase().replace(/\s+/g, "")}`);
  }

  function handleHistory() {
    // Riwayat dapat diakses dari tracking
  }

  function handleMessage() {
    // Fitur pesan dalam pengembangan
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
    <div className="h-[calc(100vh-4rem)] flex flex-col overflow-hidden">
      {/* ─── Header ─────────────────────────────────────────────────────────── */}
      <header className="shrink-0 px-6 pt-6 pb-4 border-b border-border bg-surface-1">
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-start gap-6">
            <div>
              <p className="text-label uppercase tracking-wide text-muted">Fleet Management</p>
              <h1 className="text-h1 font-semibold text-foreground mt-0.5">Cari &amp; Lacak Unit</h1>
              <p className="text-sm text-muted mt-0.5">Ketik plat, driver, atau ID untuk menemukan unit</p>
            </div>
            <div className="flex items-center gap-1 mt-6">
              <KpiStat label="Total Unit" value={counts.total} />
              <KpiDivider />
              <KpiStat label="Online" value={counts.online} accent="text-st-driving" />
              <KpiDivider />
              <KpiStat label="Bergerak" value={counts.moving} accent="text-brand" />
              <KpiDivider />
              <KpiStat label="Offline" value={counts.offline} accent="text-st-offline" />
            </div>
          </div>
        </div>
      </header>

      {/* ─── Body: 2-column ────────────────────────────────────────────── */}
      <div className="flex-1 overflow-hidden flex">
        {/* ── LEFT: Search + List ──────────────────────────────────────── */}
        <div className="w-[360px] shrink-0 border-r border-border flex flex-col overflow-hidden bg-surface-1">

          {/* Search */}
          <div className="shrink-0 px-4 py-3 border-b border-border">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted pointer-events-none" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Plat, driver, atau ID..."
                className="w-full pl-9 pr-3 py-1.5 text-sm bg-surface-2 border border-border rounded-lg
                           placeholder:text-faint text-foreground
                           focus-visible:outline-2 focus-visible:outline-brand focus-visible:outline-offset-0
                           transition-colors"
                aria-label="Cari unit"
              />
              {search && (
                <button
                  onClick={() => setSearch("")}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 p-0.5 rounded text-muted
                             hover:text-foreground focus-visible:outline-2 focus-visible:outline-brand"
                  aria-label="Hapus pencarian"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            {/* Status filter */}
            <div className="flex items-center gap-1 mt-2.5">
              <span className="text-sm text-muted mr-2">Status:</span>
              {([
                { key: "all" as FilterStatus, label: "Semua" },
                { key: "driving" as FilterStatus, label: "Driving" },
                { key: "idle" as FilterStatus, label: "Idle" },
                { key: "stopped" as FilterStatus, label: "Stop" },
                { key: "offline" as FilterStatus, label: "Offline" },
              ]).map((f) => (
                <button
                  key={f.key}
                  onClick={() => setFilterStatus(f.key)}
                  className={"px-3 py-1.5 rounded-md text-sm font-medium transition-colors focus-visible:outline-2 focus-visible:outline-brand " +
                    (filterStatus === f.key
                      ? "bg-brand text-white"
                      : "bg-surface-2 text-muted hover:bg-surface-3 hover:text-foreground border border-border")}
                >
                  {f.label}
                </button>
              ))}
            </div>
          </div>

          {/* Results count */}
          <div className="shrink-0 px-4 py-2 border-b border-border">
            <p className="text-sm text-muted">
              {rows.length} unit ditemukan
              {isFiltered && (
                <button onClick={resetFilters} className="ml-2 text-brand hover:underline focus-visible:outline-2 focus-visible:outline-brand">
                  Reset
                </button>
              )}
            </p>
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
              <div className="p-3 space-y-2">
                {rows.map((v) => {
                  const isSelected = selected?.id === v.id;
                  return (
                    <button
                      key={v.id}
                      onClick={() => handleSelect(v)}
                      aria-label={`Pilih unit ${v.plate_number}`}
                      className={
                        "w-full rounded-lg border p-3 text-left transition-all focus-visible:outline-2 focus-visible:outline-brand " +
                        (isSelected
                          ? "bg-brand border-brand text-white"
                          : "bg-surface-2 border-border hover:bg-surface-3 hover:border-border-strong")
                      }
                    >
                      {/* Plat + speed */}
                      <div className="flex items-center justify-between">
                        <span className={"font-mono font-bold text-base tabular-nums " + (isSelected ? "text-white" : "text-foreground")}>
                          {v.plate_number}
                        </span>
                        <span className={"text-sm font-semibold tabular-nums " + (isSelected ? "text-white/70" : "text-muted")}>
                          {v.speed > 0 ? Math.round(v.speed) + " km/h" : "— km/h"}
                        </span>
                      </div>
                      {/* Driver */}
                      <p className={"mt-1 text-sm " + (isSelected ? "text-white/70" : "text-muted")}>
                        {v.driver_name || "— belum ditugaskan"}
                      </p>
                      {/* Status + heading + update */}
                      <div className="mt-1.5 flex items-center gap-3">
                        {isSelected ? (
                          <StatusPill
                            status={toBadgeStatus(v.status as VehicleStatus)}
                            showIcon={false}
                            showDot={true}
                            live={v.status === "driving"}
                            className="bg-white/20 text-white text-xs px-2 py-0.5"
                          />
                        ) : (
                          <span className={"inline-flex items-center gap-1 text-sm font-medium " +
                            (v.status === "driving" ? "text-st-driving" :
                             v.status === "idle" ? "text-st-idle" :
                             v.status === "offline" ? "text-st-offline" : "text-muted")}>
                            <Radio className="w-4 h-4" />
                            {v.status.charAt(0).toUpperCase() + v.status.slice(1)}
                          </span>
                        )}
                        <span className={"flex items-center gap-1.5 text-sm " + (isSelected ? "text-white/60" : "text-muted")}>
                          <Navigation className="w-4 h-4" />
                          {Math.round(v.heading)}&deg;
                        </span>
                        <span className={"ml-auto text-sm " + (isSelected ? "text-white/50" : "text-muted")}>
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
            zoom={9}
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
                  <Button
                    size="sm"
                    variant="secondary"
                    icon={<History className="w-3.5 h-3.5" />}
                    onClick={handleHistory}
                    aria-label="Lihat riwayat unit"
                  >
                    Riwayat
                  </Button>
                  <Button
                    size="sm"
                    variant="secondary"
                    icon={<MessageSquare className="w-3.5 h-3.5" />}
                    onClick={handleMessage}
                    aria-label="Kirim pesan ke driver"
                  >
                    Pesan
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
