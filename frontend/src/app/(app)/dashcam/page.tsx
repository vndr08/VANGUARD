"use client";

import { useMemo, useState } from "react";
import { motion } from "motion/react";
import {
  Camera,
  Circle,
  Maximize2,
  Minimize2,
  Radio,
  Search,
  Square,
  Video,
  X,
} from "lucide-react";
import { useToast } from "@/components/ui/Toast";
import { StatusPill } from "@/components/ui/Badge";
import { Button, IconButton } from "@/components/ui/Button";
import { Card, EmptyState } from "@/components/ui/Card";
import { useReducedMotion } from "@/hooks/useReducedMotion";
import { FLEET_VEHICLES } from "@/lib/fleet-data";
import type { Vehicle } from "@/types";

/* ─── Types ─────────────────────────────────────────────────────────────────── */

type CameraPos = "Depan" | "Kabin" | "Belakang";
type ViewMode = "grid" | "focus";

/** Unit with available cameras */
interface CameraUnit {
  vehicle: Vehicle;
  cameras: Record<CameraPos, boolean>; // available
  isRecording: boolean;
}

/** Map Vehicle.status ("stopped") → StatusPill ("stop") */
function toBadgeStatus(s: Vehicle["status"]): "driving" | "idle" | "stop" | "offline" {
  return s === "stopped" ? "stop" : (s as "driving" | "idle" | "offline");
}

/* ─── Build camera units from FLEET_VEHICLES ──────────────────────────────────── */

const CAMERA_UNIT_LIST: CameraUnit[] = FLEET_VEHICLES.slice(0, 15).map((v) => ({
  vehicle: v,
  cameras: {
    Depan: true,
    Kabin: v.status !== "offline",
    Belakang: v.status !== "offline",
  },
  isRecording: v.status === "driving",
}));

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

/* ─── Camera Feed Placeholder ───────────────────────────────────────────────── */

function CameraFeed({
  camera,
  unit,
  isRecording,
  isMain,
  onSnapshot,
  onToggleRec,
  onFullscreen,
  onSwap,
}: {
  camera: CameraPos;
  unit: CameraUnit;
  isRecording: boolean;
  isMain: boolean;
  onSnapshot: () => void;
  onToggleRec: () => void;
  onFullscreen: () => void;
  onSwap?: () => void;
}) {
  const CAMERA_GRADIENTS: Record<CameraPos, string> = {
    Depan: "from-zinc-900 via-zinc-800 to-zinc-950",
    Kabin: "from-zinc-800 via-zinc-900 to-zinc-950",
    Belakang: "from-zinc-950 via-zinc-800 to-zinc-900",
  };

  const CAMERA_ICON_BG: Record<CameraPos, string> = {
    Depan: "bg-brand",
    Kabin: "bg-st-idle",
    Belakang: "bg-st-driving",
  };

  const now = new Date();
  const timeStr = now.toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit", second: "2-digit" });
  const dateStr = now.toLocaleDateString("id-ID", { day: "2-digit", month: "short" });

  return (
    <div
      className={
        "relative w-full flex flex-col bg-gradient-to-br " + CAMERA_GRADIENTS[camera] +
        (isMain ? " aspect-[16/10]" : " aspect-video")
      }
      onClick={onSwap}
      role={onSwap ? "button" : undefined}
      tabIndex={onSwap ? 0 : undefined}
      aria-label={onSwap ? `Jadikan ${camera} utama` : undefined}
    >
      {/* Overlay gradient */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/20 pointer-events-none" />

      {/* Top overlay: unit name + REC */}
      <div className="absolute top-0 inset-x-0 flex items-center justify-between px-3 py-2 pointer-events-none">
        <div className="flex items-center gap-2">
          <span className="px-2 py-0.5 rounded bg-black/70 backdrop-blur-sm text-[10px] font-bold text-white uppercase tracking-wider">
            {camera}
          </span>
          <span className="font-mono text-xs font-semibold text-white/90">
            {unit.vehicle.plate_number}
          </span>
        </div>
        {isRecording && (
          <div className="flex items-center gap-1.5 px-2 py-0.5 rounded bg-st-offline/80 backdrop-blur-sm">
            <span className="w-2 h-2 rounded-full bg-white animate-pulse" />
            <span className="text-[10px] font-bold text-white uppercase tracking-widest">REC</span>
          </div>
        )}
      </div>

      {/* Center: camera icon */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
        <div className={"w-12 h-12 rounded-full " + CAMERA_ICON_BG[camera] + " flex items-center justify-center opacity-50"}>
          <Camera className="w-6 h-6 text-white" />
        </div>
      </div>

      {/* Bottom overlay: timestamp */}
      <div className="absolute bottom-0 inset-x-0 flex items-center justify-between px-3 py-2 pointer-events-none">
        <span className="font-mono text-[10px] text-white/70 tabular-nums">
          {dateStr}
        </span>
        <span className="font-mono text-[10px] text-white/70 tabular-nums">
          {timeStr}
        </span>
      </div>

      {/* Controls overlay (on hover) */}
      <div className="absolute inset-0 flex items-center justify-center gap-2 opacity-0 hover:opacity-100 focus-within:opacity-100 bg-black/30 transition-opacity pointer-events-auto">
        <IconButton
          icon={<Camera className="w-4 h-4" />}
          onClick={(e) => { e.stopPropagation(); onSnapshot(); }}
          variant="secondary"
          size="sm"
          aria-label={"Snapshot " + unit.vehicle.plate_number + " " + camera}
          className="bg-black/70 border-white/20 text-white hover:bg-black/90"
        />
        <IconButton
          icon={isRecording
            ? <Square className="w-4 h-4 fill-current" />
            : <Circle className="w-4 h-4" />
          }
          onClick={(e) => { e.stopPropagation(); onToggleRec(); }}
          variant={isRecording ? "danger" : "secondary"}
          size="sm"
          aria-label={isRecording ? "Stop rekam" : "Mulai rekam"}
          className={isRecording ? "bg-st-offline/80 text-white hover:bg-st-offline" : "bg-black/70 border-white/20 text-white hover:bg-black/90"}
        />
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

export default function DashcamPage() {
  const { success } = useToast();

  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState<"all" | Vehicle["status"]>("all");
  const [selectedIdx, setSelectedIdx] = useState<number>(0);
  const [viewMode, setViewMode] = useState<ViewMode>("grid");
  const [fullscreenFeed, setFullscreenFeed] = useState<CameraPos | null>(null);
  const [recording, setRecording] = useState<Record<string, boolean>>(
    Object.fromEntries(CAMERA_UNIT_LIST.filter((u) => u.isRecording).map((u) => [String(u.vehicle.id), true]))
  );

  // KPI counts
  const counts = useMemo(() => ({
    unitOnline: CAMERA_UNIT_LIST.filter((u) => u.vehicle.status !== "offline").length,
    kameraAktif: CAMERA_UNIT_LIST.reduce((sum, u) => sum + Object.values(u.cameras).filter(Boolean).length, 0),
    merekam: Object.values(recording).filter(Boolean).length,
    offline: CAMERA_UNIT_LIST.filter((u) => u.vehicle.status === "offline").length,
  }), [recording]);

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

  const selectedUnit = rows[selectedIdx] ?? rows[0] ?? null;

  function handleSelectUnit(idx: number) {
    setSelectedIdx(idx);
  }

  function handleSnapshotAll() {
    // Snapshot all functionality in development
  }

  function handleSnapshotFeed(camera: CameraPos) {
    // Snapshot functionality in development
  }

  function handleToggleRec(camera: CameraPos) {
    if (!selectedUnit) return;
    const key = String(selectedUnit.vehicle.id);
    const isOn = !!recording[key + camera];
    setRecording((prev) => ({ ...prev, [key + camera]: !isOn }));
  }

  function handleFullscreen(camera: CameraPos) {
    setFullscreenFeed(camera === fullscreenFeed ? null : camera);
  }

  function handleSwapFeed(camera: CameraPos) {
    // Swap functionality in focus mode
  }

  function resetFilters() {
    setSearch("");
    setFilterStatus("all");
  }

  const isFiltered = search !== "" || filterStatus !== "all";

  const CAMERA_ORDER: CameraPos[] = ["Depan", "Kabin", "Belakang"];

  return (
    <div className="h-[calc(100vh-4rem)] flex flex-col overflow-hidden">
      {/* ─── Header ─────────────────────────────────────────────────────────── */}
      <header className="shrink-0 px-6 pt-6 pb-4 border-b border-border bg-surface-1">
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-start gap-6">
            <div>
              <p className="text-label uppercase tracking-wide text-muted">Fleet Management</p>
              <h1 className="text-h1 font-semibold text-foreground mt-0.5">Dashcam Monitor</h1>
              <p className="text-sm text-muted mt-0.5">Live feed multi-kamera kendaraan armada</p>
            </div>
            <div className="flex items-center gap-1 mt-6">
              <KpiStat label="Unit Online" value={counts.unitOnline} accent="text-st-driving" />
              <KpiDivider />
              <KpiStat label="Kamera Aktif" value={counts.kameraAktif} accent="text-brand" />
              <KpiDivider />
              <KpiStat label="Merekam" value={counts.merekam} accent={counts.merekam > 0 ? "text-st-offline" : undefined} />
              <KpiDivider />
              <KpiStat label="Offline" value={counts.offline} accent="text-st-offline" />
            </div>
          </div>

          {/* View mode toggle */}
          <div className="flex items-center gap-2 mt-1">
            <div className="flex items-center rounded-lg bg-surface-2 p-0.5">
              <button
                onClick={() => setViewMode("grid")}
                className={"flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm font-medium transition-all focus-visible:outline-2 focus-visible:outline-brand " +
                  (viewMode === "grid"
                    ? "bg-surface-1 text-foreground shadow-sm"
                    : "text-muted hover:text-foreground")}
                aria-pressed={viewMode === "grid"}
              >
                <Video className="w-3.5 h-3.5" />
                Grid
              </button>
              <button
                onClick={() => setViewMode("focus")}
                className={"flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm font-medium transition-all focus-visible:outline-2 focus-visible:outline-brand " +
                  (viewMode === "focus"
                    ? "bg-surface-1 text-foreground shadow-sm"
                    : "text-muted hover:text-foreground")}
                aria-pressed={viewMode === "focus"}
              >
                <Maximize2 className="w-3.5 h-3.5" />
                Fokus
              </button>
            </div>
            <Button
              variant="primary"
              size="sm"
              icon={<Camera className="w-4 h-4" />}
              onClick={handleSnapshotAll}
              disabled={!selectedUnit}
              aria-label="Snapshot semua kamera unit terpilih"
            >
              Snapshot Semua
            </Button>
          </div>
        </div>
      </header>

      {/* ─── Body ─────────────────────────────────────────────────────────── */}
      <div className="flex-1 overflow-hidden flex">
        {/* ── LEFT: Unit list ──────────────────────────────────────────────── */}
        <div className="w-[320px] shrink-0 border-r border-border flex flex-col overflow-hidden bg-surface-1">

          {/* Search */}
          <div className="shrink-0 px-4 py-3 border-b border-border">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted pointer-events-none" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Plat atau driver..."
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
            <div className="flex items-center gap-1 mt-2">
              {([
                { key: "all" as const, label: "Semua" },
                { key: "driving" as const, label: "Driving" },
                { key: "idle" as const, label: "Idle" },
                { key: "offline" as const, label: "Offline" },
              ]).map((f) => (
                <button
                  key={f.key}
                  onClick={() => setFilterStatus(f.key)}
                  className={"px-2 py-0.5 rounded-md text-xs font-medium transition-colors focus-visible:outline-2 focus-visible:outline-brand " +
                    (filterStatus === f.key
                      ? "bg-brand text-white"
                      : "bg-surface-2 text-muted hover:bg-surface-3 hover:text-foreground border border-border")}
                >
                  {f.label}
                </button>
              ))}
            </div>
          </div>

          {/* Count */}
          <div className="shrink-0 px-4 py-2 border-b border-border">
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
                {rows.map((unit, idx) => {
                  const listIdx = idx;
                  const isSelected = selectedUnit?.vehicle.id === unit.vehicle.id;
                  const isRec = Object.entries(unit.cameras).some(
                    ([pos, avail]) => avail && recording[String(unit.vehicle.id) + pos]
                  );
                  const camCount = Object.values(unit.cameras).filter(Boolean).length;

                  return (
                    <button
                      key={unit.vehicle.id}
                      onClick={() => handleSelectUnit(listIdx)}
                      className={
                        "w-full rounded-lg border p-3 text-left transition-all focus-visible:outline-2 focus-visible:outline-brand " +
                        (isSelected
                          ? "bg-brand/10 border-brand"
                          : "bg-surface-2 border-border hover:bg-surface-3 hover:border-border-strong")
                      }
                      aria-pressed={isSelected}
                      aria-label={"Pilih unit " + unit.vehicle.plate_number}
                    >
                      {/* Plat + REC */}
                      <div className="flex items-center justify-between">
                        <span className={"font-mono font-bold text-sm tabular-nums " + (isSelected ? "text-brand" : "text-foreground")}>
                          {unit.vehicle.plate_number}
                        </span>
                        {isRec && (
                          <span className="flex items-center gap-1">
                            <span className="w-1.5 h-1.5 rounded-full bg-st-offline animate-pulse" />
                            <span className="text-[9px] font-bold text-st-offline uppercase tracking-widest">REC</span>
                          </span>
                        )}
                      </div>

                      {/* Driver */}
                      <p className={"mt-0.5 text-xs " + (isSelected ? "text-brand/70" : "text-muted")}>
                        {unit.vehicle.driver_name || "— belum ditugaskan"}
                      </p>

                      {/* Status + cameras */}
                      <div className="mt-1.5 flex items-center gap-2">
                        <StatusPill
                          status={toBadgeStatus(unit.vehicle.status)}
                          showIcon={false}
                          showDot={true}
                          live={unit.vehicle.status === "driving"}
                          className={"text-[10px] px-1.5 py-0.5 " + (isSelected ? "bg-brand/20 text-brand" : "")}
                        />
                        <span className={"text-[10px] " + (isSelected ? "text-brand/60" : "text-faint")}>
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
                  <span className="font-mono font-semibold text-sm text-foreground">{selectedUnit.vehicle.plate_number}</span>
                  <span className="text-xs text-muted">&middot;</span>
                  <span className="text-xs text-muted">
                    {selectedUnit.vehicle.driver_name || "Belum ditugaskan"}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    variant="secondary"
                    size="sm"
                    icon={<Camera className="w-3.5 h-3.5" />}
                    onClick={handleSnapshotAll}
                    aria-label="Snapshot semua kamera"
                  >
                    Snapshot
                  </Button>
                </div>
              </div>

              {/* Feeds */}
              <div className="flex-1 overflow-hidden p-3">
                {viewMode === "grid" ? (
                  /* Grid: 3 equal panels */
                  <div className="grid grid-cols-3 gap-3 h-full">
                    {CAMERA_ORDER.map((camera) => {
                      const available = selectedUnit.cameras[camera];
                      const isRec = !!recording[String(selectedUnit.vehicle.id) + camera];
                      if (!available) return null;
                      return (
                        <div key={camera} className="flex flex-col overflow-hidden rounded-lg border border-border">
                          <CameraFeed
                            camera={camera}
                            unit={selectedUnit}
                            isRecording={isRec}
                            isMain={true}
                            onSnapshot={() => handleSnapshotFeed(camera)}
                            onToggleRec={() => handleToggleRec(camera)}
                            onFullscreen={() => handleFullscreen(camera)}
                          />
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  /* Focus: 1 main + 2 thumbnails */
                  <div className="grid grid-cols-5 gap-3 h-full">
                    {/* Main: col-span-3 */}
                    <div className="col-span-3 flex flex-col overflow-hidden rounded-lg border border-border">
                      <CameraFeed
                        camera="Depan"
                        unit={selectedUnit}
                        isRecording={!!recording[String(selectedUnit.vehicle.id) + "Depan"]}
                        isMain={true}
                        onSnapshot={() => handleSnapshotFeed("Depan")}
                        onToggleRec={() => handleToggleRec("Depan")}
                        onFullscreen={() => handleFullscreen("Depan")}
                      />
                    </div>
                    {/* Thumbnails: col-span-2, stacked */}
                    <div className="col-span-2 flex flex-col gap-3">
                      {(["Kabin", "Belakang"] as CameraPos[]).map((cam) => {
                        const available = selectedUnit.cameras[cam];
                        if (!available) return null;
                        return (
                          <div key={cam} className="flex-1 flex flex-col overflow-hidden rounded-lg border border-border cursor-pointer hover:border-brand transition-colors">
                            <CameraFeed
                              camera={cam}
                              unit={selectedUnit}
                              isRecording={!!recording[String(selectedUnit.vehicle.id) + cam]}
                              isMain={false}
                              onSnapshot={() => handleSnapshotFeed(cam)}
                              onToggleRec={() => handleToggleRec(cam)}
                              onFullscreen={() => handleFullscreen(cam)}
                              onSwap={() => handleSwapFeed(cam)}
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
              isRecording={!!recording[String(selectedUnit.vehicle.id) + fullscreenFeed]}
              isMain={true}
              onSnapshot={() => { handleSnapshotFeed(fullscreenFeed); }}
              onToggleRec={() => handleToggleRec(fullscreenFeed)}
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
