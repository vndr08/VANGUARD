"use client";

import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { motion } from "motion/react";
import dynamic from "next/dynamic";
import {
  ArrowLeft, MapPin, Truck, Clock, Route, Navigation, User,
  Gauge, Timer, CalendarDays, FileText, AlertCircle,
} from "lucide-react";
import { Button, IconButton } from "@/components/ui/Button";
import { TaskStatusBadge } from "@/components/ui/Badge";
import { useReducedMotion } from "@/hooks/useReducedMotion";
import { FLEET_VEHICLES } from "@/lib/fleet-data";
import { OPERATIONS_DATASET } from "@/lib/operations-data";

const TaskRouteMap = dynamic(() => import("@/components/map/TaskRouteMap"), {
  ssr: false,
  loading: () => (
    <div className="flex h-full w-full items-center justify-center bg-surface-2">
      <div className="flex flex-col items-center gap-3">
        <div className="h-8 w-8 rounded-full border-2 border-brand border-t-transparent animate-spin" />
        <p className="text-sm text-muted">Memuat peta...</p>
      </div>
    </div>
  ),
});

/* ─── Data Mapping ───────────────────────────────────────────────────────── */
const vehicleById = new Map(FLEET_VEHICLES.map((vehicle) => [vehicle.id, vehicle]));
const tripById = new Map(OPERATIONS_DATASET.trips.map((trip) => [trip.id, trip]));
const clockTime = new Intl.DateTimeFormat("id-ID", {
  timeZone: "Asia/Jakarta", hour: "2-digit", minute: "2-digit",
});
const fullDateTime = new Intl.DateTimeFormat("id-ID", {
  timeZone: "Asia/Jakarta", day: "2-digit", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit",
});

const STATUS_META: Record<string, { label: string; colorVar: string }> = {
  progress:   { label: "Berlangsung", colorVar: "var(--st-driving)" },
  unloading:  { label: "Bongkar",     colorVar: "var(--st-idle)" },
  assigned:   { label: "Ditugaskan",  colorVar: "var(--brand)" },
  waiting:    { label: "Menunggu",    colorVar: "var(--st-stop)" },
  completed:  { label: "Selesai",     colorVar: "var(--task-completed)" },
};

/* ─── Info Row Component ─────────────────────────────────────────────────── */
function InfoRow({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div className="flex items-center gap-2">
      <span className="text-muted shrink-0">{icon}</span>
      <span className="text-xs text-muted w-24 shrink-0">{label}</span>
      <span className="text-xs font-medium text-foreground truncate">{value}</span>
    </div>
  );
}

/* ─── Mini Stat Component ────────────────────────────────────────────────── */
function MiniStat({ label, value, color }: { label: string; value: string; color?: string }) {
  return (
    <div className="flex flex-col items-center p-2 rounded-lg bg-surface-2 border border-border">
      <span className="font-mono text-sm font-bold" style={{ color: color || "var(--foreground)" }}>{value}</span>
      <span className="text-[9px] uppercase tracking-wider text-muted mt-0.5">{label}</span>
    </div>
  );
}

export default function TaskDetailPage() {
  const params = useParams();
  const router = useRouter();
  const reducedMotion = useReducedMotion();
  const taskId = params.id as string;

  const task = OPERATIONS_DATASET.tasks.find((t) => t.id === taskId);
  const trip = task ? tripById.get(task.primaryTripId) : null;
  const vehicle = task ? vehicleById.get(task.vehicleId) : null;

  if (!task || !trip || !vehicle) {
    return (
      <div className="flex h-[calc(100vh-4rem)] flex-col items-center justify-center gap-4 bg-surface-1">
        <AlertCircle className="w-12 h-12 text-st-stop" />
        <h1 className="text-lg font-semibold text-foreground">Tugas Tidak Ditemukan</h1>
        <p className="text-sm text-muted">Tugas dengan ID &ldquo;{taskId}&rdquo; tidak ditemukan.</p>
        <Button variant="primary" size="sm" icon={<ArrowLeft className="w-4 h-4" />} onClick={() => router.push("/tasks")}>
          Kembali ke Task Monitor
        </Button>
      </div>
    );
  }

  const lastPoint = trip.track.at(-1);
  const currentCoords: [number, number] = lastPoint
    ? [lastPoint.latitude, lastPoint.longitude]
    : [trip.origin.latitude, trip.origin.longitude];
  const tripType = trip.type === "pre-trip" ? "Pre-Task" : trip.type === "return" ? "Return" : "Main Task";
  const pct = Math.round((trip.traveledKm / trip.distanceKm) * 100);
  const remaining = trip.distanceKm - trip.traveledKm;

  const routeData = {
    vehicle: vehicle.plate_number,
    driver: vehicle.driver_name?.trim() ? `${vehicle.driver_name} (saat ini)` : "Driver saat ini belum ditetapkan",
    task: task.name,
    status: task.status,
    speed: trip.averageSpeedKph ?? 0,
    origin: { label: trip.origin.name, coord: { lng: trip.origin.longitude, lat: trip.origin.latitude } },
    destination: { label: trip.destination.name, coord: { lng: trip.destination.longitude, lat: trip.destination.latitude } },
    current: { label: task.name, coord: { lng: currentCoords[1], lat: currentCoords[0] } },
    plannedRoute: [
      { lng: trip.origin.longitude, lat: trip.origin.latitude },
      { lng: trip.destination.longitude, lat: trip.destination.latitude }
    ],
    traveledRoute: trip.traveledKm > 0 ? [
      { lng: trip.origin.longitude, lat: trip.origin.latitude },
      { lng: currentCoords[1], lat: currentCoords[0] }
    ] : [],
  };

  return (
    <div className="flex h-[calc(100vh-4rem)] flex-col overflow-hidden">
      {/* ── Header ─────────────────────────────────────────────────────── */}
      <header className="shrink-0 border-b border-border bg-surface-1 px-4 py-3">
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <IconButton
              icon={<ArrowLeft className="w-4 h-4" />}
              onClick={() => router.push("/tasks")}
              variant="ghost"
              aria-label="Kembali"
            />
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-brand flex items-center justify-center">
                <Route className="w-4 h-4 text-white" />
              </div>
              <div className="flex items-center gap-2">
                <h1 className="text-sm font-bold text-foreground">Detail Tugas</h1>
                <span className="text-muted">•</span>
                <span className="font-mono text-sm font-semibold text-foreground">{vehicle.plate_number}</span>
                <TaskStatusBadge status={task.status as any} />
              </div>
            </div>
          </div>
          <Button variant="ghost" size="sm" onClick={() => router.push("/tasks")}>
            <ArrowLeft className="w-4 h-4 mr-1" />
            Kembali
          </Button>
        </div>
      </header>

      {/* ── Content ────────────────────────────────────────────────────── */}
      <div className="flex-1 flex overflow-hidden">
        {/* ── Left Panel: Compact Info ──────────────────────────────── */}
        <div className="w-72 shrink-0 border-r border-border bg-surface-1 overflow-y-auto">
          <div className="p-4 space-y-3">

            {/* Task Name */}
            <div className="pb-3 border-b border-border">
              <p className="text-sm font-medium text-foreground mb-1">{task.name}</p>
              <p className="text-xs text-muted">{task.reference}</p>
            </div>

            {/* Progress */}
            <div className="p-3 rounded-lg bg-surface-2 border border-border">
              <div className="flex items-center justify-between mb-2">
                <span className="text-[10px] font-semibold uppercase tracking-wider text-muted">Progress</span>
                <span className="font-mono text-sm font-bold" style={{ color: STATUS_META[task.status]?.colorVar }}>
                  {pct}%
                </span>
              </div>
              <div className="h-1.5 rounded-full bg-surface-3 overflow-hidden mb-2">
                <motion.div
                  className="h-full rounded-full"
                  style={{ background: STATUS_META[task.status]?.colorVar }}
                  initial={{ width: 0 }}
                  animate={{ width: `${pct}%` }}
                  transition={reducedMotion ? { duration: 0 } : { duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
                />
              </div>
              <div className="grid grid-cols-3 gap-2">
                <MiniStat label="Tempuh" value={`${trip.traveledKm}km`} />
                <MiniStat label="Sisa" value={`${remaining}km`} />
                <MiniStat label="Total" value={`${trip.distanceKm}km`} />
              </div>
            </div>

            {/* Vehicle Info */}
            <div className="p-3 rounded-lg bg-surface-2 border border-border">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 rounded-lg bg-brand-soft flex items-center justify-center">
                  <Truck className="w-5 h-5 text-brand" />
                </div>
                <div>
                  <span className="font-mono text-base font-bold text-foreground">{vehicle.plate_number}</span>
                  <p className="text-xs text-muted">{vehicle.brand} {vehicle.model}</p>
                </div>
              </div>
              <div className="space-y-1.5">
                <InfoRow icon={<User className="w-3.5 h-3.5" />} label="Driver" value={vehicle.driver_name || "Belum ditugaskan"} />
                <InfoRow icon={<CalendarDays className="w-3.5 h-3.5" />} label="Dibuat" value={fullDateTime.format(Date.parse(task.createdAt))} />
              </div>
            </div>

            {/* Route */}
            <div className="p-3 rounded-lg bg-surface-2 border border-border">
              <div className="flex items-center gap-2 mb-3">
                <MapPin className="w-3.5 h-3.5 text-brand" />
                <span className="text-[10px] font-semibold uppercase tracking-wider text-muted">Rute</span>
              </div>
              <div className="space-y-2">
                <div className="flex items-start gap-2">
                  <div className="w-5 h-5 rounded-full bg-st-driving/20 flex items-center justify-center shrink-0 mt-0.5">
                    <div className="w-2 h-2 rounded-full bg-st-driving" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-[10px] text-muted">Asal</p>
                    <p className="text-xs font-medium text-foreground truncate">{trip.origin.name}</p>
                  </div>
                </div>
                <div className="ml-2.5 border-l border-dashed border-border h-3" />
                <div className="flex items-start gap-2">
                  <div className="w-5 h-5 rounded-full bg-brand/20 flex items-center justify-center shrink-0 mt-0.5">
                    <div className="w-2 h-2 rounded-full bg-brand" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-[10px] text-muted">Tujuan</p>
                    <p className="text-xs font-medium text-foreground truncate">{trip.destination.name}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Trip Info Grid */}
            <div className="p-3 rounded-lg bg-surface-2 border border-border">
              <div className="grid grid-cols-2 gap-2">
                <div className="flex items-center gap-2 p-2 rounded bg-surface-1">
                  <Navigation className="w-4 h-4 text-muted shrink-0" />
                  <div>
                    <p className="text-[9px] text-muted">Kecepatan</p>
                    <p className="font-mono text-xs font-semibold text-foreground">{trip.averageSpeedKph ?? 0} km/j</p>
                  </div>
                </div>
                <div className="flex items-center gap-2 p-2 rounded bg-surface-1">
                  <Timer className="w-4 h-4 text-muted shrink-0" />
                  <div>
                    <p className="text-[9px] text-muted">Target Tiba</p>
                    <p className="font-mono text-xs font-semibold text-foreground">{clockTime.format(Date.parse(trip.plannedArrivalAt))}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2 p-2 rounded bg-surface-1">
                  <Clock className="w-4 h-4 text-muted shrink-0" />
                  <div>
                    <p className="text-[9px] text-muted">Jenis Trip</p>
                    <p className="text-xs font-semibold text-foreground">{tripType}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2 p-2 rounded bg-surface-1">
                  <Route className="w-4 h-4 text-muted shrink-0" />
                  <div>
                    <p className="text-[9px] text-muted">Group</p>
                    <p className="text-xs font-semibold text-foreground truncate">{task.group}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Reference */}
            <div className="p-3 rounded-lg bg-surface-2 border border-border">
              <div className="flex items-center gap-2 mb-2">
                <FileText className="w-3.5 h-3.5 text-brand" />
                <span className="text-[10px] font-semibold uppercase tracking-wider text-muted">Referensi</span>
              </div>
              <div className="space-y-1">
                <div className="flex justify-between text-xs">
                  <span className="text-muted">Reference</span>
                  <span className="font-mono text-foreground">{task.reference}</span>
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-muted">Jadwal</span>
                  <span className="text-foreground">{clockTime.format(Date.parse(task.plannedStartAt))} - {clockTime.format(Date.parse(task.plannedEndAt))}</span>
                </div>
                <div className="flex items-center justify-between gap-2 border-t border-border pt-2 text-xs">
                  <span className="text-muted">Bukti visual</span>
                  <div className="flex items-center gap-2">
                    <Link href={`/snapshots?task=${task.id}`} className="text-brand hover:underline focus-visible:outline-2 focus-visible:outline-brand">Snapshot</Link>
                    <Link href={`/dashcam?trip=${trip.id}`} className="text-brand hover:underline focus-visible:outline-2 focus-visible:outline-brand">Dashcam</Link>
                  </div>
                </div>
              </div>
            </div>

          </div>
        </div>

        {/* ── Right Panel: Map ─────────────────────────────────────────── */}
        <main className="flex-1 relative">
          <TaskRouteMap task={routeData} />
        </main>
      </div>
    </div>
  );
}
