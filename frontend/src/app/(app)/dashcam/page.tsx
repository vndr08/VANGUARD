"use client";

import { Suspense, useEffect, useMemo, useRef, useState } from "react";
import { useSearchParams } from "next/navigation";
import {
  Camera,
  Maximize2,
  Minimize2,
  Search,
  Video,
  X,
} from "lucide-react";
import { StatusPill } from "@/components/ui/Badge";
import { Button, IconButton } from "@/components/ui/Button";
import { EmptyState } from "@/components/ui/Card";
import { useReducedMotion } from "@/hooks/useReducedMotion";
import { FLEET_VEHICLES } from "@/lib/fleet-data";
import { DASHCAM_ARCHIVES, type DashcamArchive } from "@/lib/evidence-data";
import type { Vehicle } from "@/types";

/* ─── Types ─────────────────────────────────────────────────────────────────── */

type CameraPos = "Depan" | "Kabin" | "Belakang";
type ViewMode = "grid" | "focus";

/** Unit with available cameras */
interface CameraUnit {
  vehicle: Vehicle;
  archive: DashcamArchive;
  cameras: Record<CameraPos, boolean>; // available
}

/** Map Vehicle.status ("stopped") → StatusPill ("stop") */
function toBadgeStatus(s: Vehicle["status"]): "driving" | "idle" | "stop" | "offline" {
  return s === "stopped" ? "stop" : (s as "driving" | "idle" | "offline");
}

/* ─── Build camera units from FLEET_VEHICLES ──────────────────────────────────── */

const vehicleById = new Map(FLEET_VEHICLES.map((vehicle) => [vehicle.id, vehicle]));
const CAMERA_UNIT_LIST: CameraUnit[] = DASHCAM_ARCHIVES.flatMap((archive) => {
  const vehicle = vehicleById.get(archive.vehicleId);
  return vehicle ? [{
    vehicle,
    archive,
    cameras: {
      Depan: true,
      Kabin: vehicle.status !== "offline",
      Belakang: vehicle.status !== "offline",
    },
  }] : [];
});

function SummaryItem({ label, value, color }: { label: string; value: number; color?: string }) {
  return (
    <div className="flex items-baseline gap-2 px-3 first:pl-0 last:pr-0">
      <span className="text-[10px] font-semibold uppercase tracking-widest text-muted">{label}</span>
      <span className="font-mono text-sm font-semibold tabular-nums" style={color ? { color } : undefined}>{value}</span>
    </div>
  );
}

/* ─── Camera Feed Placeholder ───────────────────────────────────────────────── */

function CameraFeed({
  camera,
  unit,
  isMain,
  onFullscreen,
  onSwap,
}: {
  camera: CameraPos;
  unit: CameraUnit;
  isMain: boolean;
  onFullscreen: () => void;
  onSwap?: () => void;
}) {
  const reducedMotion = useReducedMotion();
  const mediaSource = unit.archive.videoSrc;

  return (
    <div
      className={
        "v2-camera-feed relative flex w-full flex-col bg-black " +
        (isMain ? "aspect-[16/10]" : "aspect-video")
      }
      onClick={onSwap}
      role={onSwap ? "button" : undefined}
      tabIndex={onSwap ? 0 : undefined}
      aria-label={onSwap ? `Jadikan ${camera} utama` : undefined}
    >
      <video
        key={mediaSource}
        autoPlay={!reducedMotion}
        muted
        loop
        playsInline
        preload="metadata"
        poster="/media/truck/driver-dashboard.jpg"
        className="absolute inset-0 h-full w-full object-cover"
        aria-hidden="true"
      >
        <source src={mediaSource} type="video/webm" />
      </video>

      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/20 pointer-events-none" />

      {/* Top overlay: unit identity */}
      <div className="absolute top-0 inset-x-0 flex items-center justify-between px-3 py-2 pointer-events-none">
        <div className="flex items-center gap-2">
          <span className="px-2 py-0.5 rounded bg-black/70 backdrop-blur-sm text-[10px] font-bold text-white uppercase tracking-wider">
            {camera}
          </span>
          <span className="border border-white/25 bg-black/60 px-1.5 py-0.5 text-[9px] font-semibold uppercase tracking-wide text-white/80">Arsip visual</span>
          <span className="font-mono text-xs font-semibold text-white/90">
            {unit.vehicle.plate_number}
          </span>
        </div>
      </div>

      {/* Bottom overlay: timestamp */}
      <div className="absolute bottom-0 inset-x-0 flex items-center justify-between px-3 py-2 pointer-events-none">
        <span className="font-mono text-[10px] text-white/70 tabular-nums">
          Rekaman referensi
        </span>
        <span className="font-mono text-[10px] text-white/70 tabular-nums">
          Loop
        </span>
      </div>

      {/* Controls overlay (on hover) */}
      <div className="absolute inset-0 flex items-center justify-center gap-2 opacity-0 hover:opacity-100 focus-within:opacity-100 bg-black/30 transition-opacity pointer-events-auto">
        <IconButton
          icon={<Maximize2 className="w-4 h-4" />}
          onClick={(e) => { e.stopPropagation(); onFullscreen(); }}
          variant="secondary"
          size="sm"
          aria-label="Fullscreen"
          className="bg-black/70 border-white/20 text-white hover:bg-black/90"
        />
      </div>
    </div>
  );
}

/* ─── Main Page ─────────────────────────────────────────────────────────────── */

function DashcamPageContent() {
  const searchParams = useSearchParams();
  const [search, setSearch] = useState("");
  const [searchOpen, setSearchOpen] = useState(false);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const [filterStatus, setFilterStatus] = useState<"all" | Vehicle["status"]>("all");
  const [selectedVehicleId, setSelectedVehicleId] = useState<number | null>(CAMERA_UNIT_LIST[0]?.vehicle.id ?? null);
  const [viewMode, setViewMode] = useState<ViewMode>("grid");
  const [fullscreenFeed, setFullscreenFeed] = useState<CameraPos | null>(null);

  useEffect(() => {
    if (searchOpen) searchInputRef.current?.focus();
  }, [searchOpen]);
  useEffect(() => {
    const tripId = searchParams.get("trip");
    const archive = DASHCAM_ARCHIVES.find((item) => item.tripId === tripId);
    if (!archive) return;
    if (CAMERA_UNIT_LIST.some((unit) => unit.vehicle.id === archive.vehicleId)) {
      setSelectedVehicleId(archive.vehicleId);
      setViewMode("focus");
    }
  }, [searchParams]);
  // KPI counts
  const counts = useMemo(() => ({
    unitOnline: CAMERA_UNIT_LIST.filter((u) => u.vehicle.status !== "offline").length,
    kameraAktif: CAMERA_UNIT_LIST.reduce((sum, u) => sum + Object.values(u.cameras).filter(Boolean).length, 0),
    offline: CAMERA_UNIT_LIST.filter((u) => u.vehicle.status === "offline").length,
  }), []);

  // Filtered units
  const rows = useMemo(() => {
    const q = search.trim().toLowerCase();
    return CAMERA_UNIT_LIST.filter((u) => {
      if (q && !u.vehicle.plate_number.toLowerCase().includes(q)
        && !(u.vehicle.driver_name ?? "").toLowerCase().includes(q)) return false;
      if (filterStatus !== "all" && u.vehicle.status !== filterStatus) return false;
      return true;
    });
  }, [search, filterStatus]);

  const selectedUnit = rows.find((unit) => unit.vehicle.id === selectedVehicleId) ?? rows[0] ?? null;

  function handleSelectUnit(vehicleId: number) {
    setSelectedVehicleId(vehicleId);
  }

  function handleFullscreen(camera: CameraPos) {
    setFullscreenFeed(camera === fullscreenFeed ? null : camera);
  }

  function resetFilters() {
    setSearch("");
    setFilterStatus("all");
  }

  const isFiltered = search !== "" || filterStatus !== "all";

  const CAMERA_ORDER: CameraPos[] = ["Depan", "Kabin", "Belakang"];

  return (
    <div className="flex h-[calc(100dvh-3.625rem)] max-h-[calc(100dvh-3.625rem)] min-h-0 flex-col overflow-hidden">
      <header className="flex h-12 shrink-0 items-center gap-4 overflow-x-auto border-b border-border bg-surface-1 px-4">
        <div className="flex shrink-0 items-baseline gap-2">
          <h1 className="text-sm font-semibold text-foreground">Dashcam</h1>
          <span className="font-mono text-xs tabular-nums text-muted">{CAMERA_UNIT_LIST.length} unit</span>
        </div>
        <div className="flex shrink-0 items-center divide-x divide-border">
          <SummaryItem label="Online" value={counts.unitOnline} color="var(--st-driving)" />
          <SummaryItem label="Kamera" value={counts.kameraAktif} color="var(--brand)" />
          <SummaryItem label="Offline" value={counts.offline} color="var(--st-offline)" />
        </div>
        <div className="ml-auto flex shrink-0 items-center">
            <div className="flex h-8 items-center border border-border bg-surface-2 p-0.5">
              <button
                onClick={() => setViewMode("grid")}
                className={"flex h-7 items-center gap-1.5 px-2.5 text-xs font-medium transition-colors focus-visible:outline-2 focus-visible:outline-brand " +
                  (viewMode === "grid"
                    ? "bg-surface-1 text-foreground"
                    : "text-muted hover:text-foreground")}
                aria-pressed={viewMode === "grid"}
              >
                <Video className="h-3.5 w-3.5" />
                Grid
              </button>
              <button
                onClick={() => setViewMode("focus")}
                className={"flex h-7 items-center gap-1.5 px-2.5 text-xs font-medium transition-colors focus-visible:outline-2 focus-visible:outline-brand " +
                  (viewMode === "focus"
                    ? "bg-surface-1 text-foreground"
                    : "text-muted hover:text-foreground")}
                aria-pressed={viewMode === "focus"}
              >
                <Maximize2 className="h-3.5 w-3.5" />
                Fokus
              </button>
            </div>
        </div>
      </header>

      {/* ─── Body ─────────────────────────────────────────────────────────── */}
      <div className="flex-1 overflow-hidden flex">
        {/* ── LEFT: Unit list ──────────────────────────────────────────────── */}
        <div className="w-[320px] shrink-0 border-r border-border flex flex-col overflow-hidden bg-surface-1">

          {/* Search */}
          <div className="flex h-11 shrink-0 items-center gap-1 overflow-x-auto border-b border-border px-3">
            {searchOpen ? (
              <div className="relative flex min-w-0 flex-1 items-center gap-1">
              <Search className="pointer-events-none absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted" />
              <input
                ref={searchInputRef}
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                onKeyDown={(event) => { if (event.key === "Escape") { setSearch(""); setSearchOpen(false); } }}
                placeholder="Plat atau driver..."
                className="h-8 min-w-0 flex-1 border border-border bg-surface-2 pl-8 pr-3 text-xs
                           placeholder:text-faint text-foreground
                           focus-visible:outline-2 focus-visible:outline-brand focus-visible:outline-offset-0
                           transition-colors"
                aria-label="Cari unit"
              />
                <button type="button" onClick={() => { setSearch(""); setSearchOpen(false); }} className="flex h-8 w-8 shrink-0 items-center justify-center text-muted hover:bg-surface-2 hover:text-foreground focus-visible:outline-2 focus-visible:outline-brand" aria-label="Tutup pencarian"><X className="h-4 w-4" /></button>
              </div>
            ) : (
              <>
                <button type="button" onClick={() => setSearchOpen(true)} className="flex h-8 w-8 shrink-0 items-center justify-center text-muted hover:bg-surface-2 hover:text-foreground focus-visible:outline-2 focus-visible:outline-brand" aria-label="Cari unit"><Search className="h-4 w-4" /></button>
              {([
                { key: "all" as const, label: "Semua" },
                { key: "driving" as const, label: "Driving" },
                { key: "idle" as const, label: "Idle" },
                { key: "offline" as const, label: "Offline" },
              ]).map((f) => (
                <button
                  key={f.key}
                  onClick={() => setFilterStatus(f.key)}
                  className={"h-7 shrink-0 border border-border px-2.5 text-xs font-medium transition-colors focus-visible:outline-2 focus-visible:outline-brand " +
                    (filterStatus === f.key
                      ? "bg-brand text-slate-950"
                      : "text-muted hover:bg-surface-2 hover:text-foreground")}
                >
                  {f.label}
                </button>
              ))}
              </>
            )}
          </div>

          {/* Count */}
          <div className="shrink-0 border-b border-border px-3 py-1">
            <p className="text-xs text-muted">
              {rows.length} unit
              {isFiltered && (
                <button onClick={resetFilters} className="ml-2 text-brand hover:underline focus-visible:outline-2 focus-visible:outline-brand">
                  Reset
                </button>
              )}
            </p>
          </div>

          {/* List */}
          <div className="flex-1 overflow-y-auto">
            {rows.length === 0 ? (
              <div className="flex items-center justify-center h-full p-4">
                <EmptyState
                  icon={<Video className="w-8 h-8 opacity-40" />}
                  title="Unit tidak ditemukan"
                  description="Tidak ada unit yang cocok dengan pencarian."
                  action={
                    <Button variant="secondary" size="sm" onClick={resetFilters}>
                      Reset
                    </Button>
                  }
                />
              </div>
            ) : (
              <div className="p-2 space-y-1">
                {rows.map((unit) => {
                  const isSelected = selectedUnit?.vehicle.id === unit.vehicle.id;
                  const camCount = Object.values(unit.cameras).filter(Boolean).length;

                  return (
                    <button
                      key={unit.vehicle.id}
                      onClick={() => handleSelectUnit(unit.vehicle.id)}
                      className={
                        "w-full rounded-lg border px-3 py-2 text-left transition-colors focus-visible:outline-2 focus-visible:outline-brand " +
                        (isSelected
                          ? "bg-brand/10 border-brand"
                          : "bg-surface-2 border-border hover:bg-surface-3 hover:border-border-strong")
                      }
                      aria-pressed={isSelected}
                      aria-label={"Pilih unit " + unit.vehicle.plate_number}
                    >
                      {/* Unit identity */}
                      <div className="flex items-center justify-between">
                        <span className={"font-mono text-sm font-semibold tabular-nums " + (isSelected ? "text-brand" : "text-foreground")}>
                          {unit.vehicle.plate_number}
                        </span>
                      </div>

                      {/* Driver */}
                      <p className={"mt-0.5 text-xs " + (isSelected ? "text-brand/70" : "text-muted")}>
                        {unit.vehicle.driver_name || "— belum ditugaskan"}
                      </p>

                      {/* Status + cameras */}
                      <div className="mt-1 flex items-center gap-2">
                        <StatusPill
                          status={toBadgeStatus(unit.vehicle.status)}
                          showIcon={false}
                          showDot={true}
                          live={unit.vehicle.status === "driving"}
                          className={"px-2 py-0.5 text-[10px] " + (isSelected ? "bg-brand/20 text-brand" : "")}
                        />
                        <span className={"text-[10px] " + (isSelected ? "text-brand/60" : "text-muted")}>
                          {camCount} kamera
                        </span>
                      </div>
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* ── RIGHT: Video wall ────────────────────────────────────────────── */}
        <div className="flex-1 overflow-hidden bg-bg flex flex-col">
          {!selectedUnit ? (
            <div className="flex-1 flex items-center justify-center">
              <EmptyState
                icon={<Video className="w-8 h-8 opacity-40" />}
                title="Pilih unit untuk melihat feed"
                description="Klik unit di panel kiri untuk menampilkan feed kamera."
              />
            </div>
          ) : (
            <>
              {/* Wall toolbar */}
              <div className="shrink-0 px-4 py-2 border-b border-border bg-surface-1 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="font-mono font-semibold text-base text-foreground">{selectedUnit.vehicle.plate_number}</span>
                  <span className="text-sm text-muted">&middot;</span>
                  <span className="text-sm text-muted">
                    {selectedUnit.vehicle.driver_name || "Belum ditugaskan"}
                  </span>
                </div>
              </div>

              {/* Feeds */}
              <div className="flex-1 overflow-y-auto p-3">
                {viewMode === "grid" ? (
                  /* Grid: 3 equal panels */
                  <div className="grid grid-cols-3 gap-3">
                    {CAMERA_ORDER.map((camera) => {
                      const available = selectedUnit.cameras[camera];
                      if (!available) return null;
                      return (
                        <div key={camera} className="overflow-hidden rounded-lg border border-border">
                          <CameraFeed
                            camera={camera}
                            unit={selectedUnit}
                            isMain={true}
                            onFullscreen={() => handleFullscreen(camera)}
                          />
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  /* Focus: 1 main + 2 thumbnails */
                  <div className="grid grid-cols-5 gap-3">
                    {/* Main: col-span-3 */}
                    <div className="col-span-3 overflow-hidden rounded-lg border border-border">
                      <CameraFeed
                        camera="Depan"
                        unit={selectedUnit}
                        isMain={true}
                        onFullscreen={() => handleFullscreen("Depan")}
                      />
                    </div>
                    {/* Thumbnails: col-span-2, stacked */}
                    <div className="col-span-2 flex flex-col gap-3">
                      {(["Kabin", "Belakang"] as CameraPos[]).map((cam) => {
                        const available = selectedUnit.cameras[cam];
                        if (!available) return null;
                        return (
                          <div key={cam} className="overflow-hidden rounded-lg border border-border cursor-pointer hover:border-brand transition-colors">
                            <CameraFeed
                              camera={cam}
                              unit={selectedUnit}
                              isMain={false}
                              onFullscreen={() => handleFullscreen(cam)}
                            />
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>
            </>
          )}
        </div>
      </div>

      {/* ─── Fullscreen Overlay ─────────────────────────────────────────── */}
      {fullscreenFeed && selectedUnit && (
        <div
          className="fixed inset-0 z-50 bg-black flex items-center justify-center"
          role="dialog"
          aria-modal="true"
          aria-label={"Fullscreen " + fullscreenFeed + " - " + selectedUnit.vehicle.plate_number}
        >
          <div className="relative w-full h-full max-w-7xl max-h-screen">
            <CameraFeed
              camera={fullscreenFeed}
              unit={selectedUnit}
              isMain={true}
              onFullscreen={() => setFullscreenFeed(null)}
            />
          </div>
          {/* Close button */}
          <button
            onClick={() => setFullscreenFeed(null)}
            className="absolute top-4 right-4 p-2 rounded-lg bg-black/60 text-white hover:bg-black/80
                       focus-visible:outline-2 focus-visible:outline-brand transition-colors"
            aria-label="Tutup fullscreen"
          >
            <Minimize2 className="w-5 h-5" />
          </button>
        </div>
      )}
    </div>
  );
}

export default function DashcamPage() {
  return (
    <Suspense fallback={null}>
      <DashcamPageContent />
    </Suspense>
  );
}
