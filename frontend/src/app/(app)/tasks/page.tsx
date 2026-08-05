"use client";

import dynamic from "next/dynamic";
import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import { motion } from "motion/react";
import {
  Search, Filter, Navigation, MapPin, Truck, Clock, Route, X,
} from "lucide-react";
import { useToast } from "@/components/ui/Toast";
import { TaskStatusBadge } from "@/components/ui/Badge";
import { Skeleton, EmptyState } from "@/components/ui/Card";
import { useReducedMotion } from "@/hooks/useReducedMotion";
import { useAnimatedNumber } from "@/lib/motion";
import type { TaskRouteData } from "@/components/map/TaskRouteMap";
import { MOCK_VEHICLES } from "@/lib/mock-data";
import {
  OPERATIONS_DATASET,
  type OperationalTaskStatus,
} from "@/lib/operations-data";

const TaskRouteMap = dynamic(() => import("@/components/map/TaskRouteMap"), {
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

type TaskStatus = Exclude<OperationalTaskStatus, "cancelled">;

interface Task {
  id: string; vehicle: string; driver: string; group: string; time: string;
  tripType: "Pre-Task" | "Main Task" | "Return"; status: TaskStatus;
  task: string; taskRef: string; trip: string; origin: string;
  destination: string; originCoords: [number, number];
  destCoords: [number, number]; currentCoords: [number, number];
  distance: number; traveled: number; avgSpeed: number;
  eta: string; schedule: string; startAt: string;
}

const vehicleById = new Map(MOCK_VEHICLES.map((vehicle) => [vehicle.id, vehicle]));
const tripById = new Map(OPERATIONS_DATASET.trips.map((trip) => [trip.id, trip]));
const dateTime = new Intl.DateTimeFormat("id-ID", {
  timeZone: "Asia/Jakarta", day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit",
});
const clockTime = new Intl.DateTimeFormat("id-ID", {
  timeZone: "Asia/Jakarta", hour: "2-digit", minute: "2-digit",
});

const TASK_ROWS: Task[] = OPERATIONS_DATASET.tasks
  .filter((task): task is typeof task & { status: TaskStatus } => task.status !== "cancelled")
  .map((task) => {
    const trip = tripById.get(task.primaryTripId);
    const vehicle = vehicleById.get(task.vehicleId);
    if (!trip || !vehicle) throw new Error(`${task.id} projection is incomplete`);
    const lastPoint = trip.track.at(-1);
    const currentCoords: [number, number] = lastPoint
      ? [lastPoint.latitude, lastPoint.longitude]
      : [trip.origin.latitude, trip.origin.longitude];
    const tripType = trip.type === "pre-trip" ? "Pre-Task" : trip.type === "return" ? "Return" : "Main Task";
    return {
      id: task.id,
      vehicle: vehicle.plate_number,
      driver: vehicle.driver_name?.trim() ? `${vehicle.driver_name} (saat ini)` : "Driver saat ini belum ditetapkan",
      group: task.group,
      time: dateTime.format(Date.parse(task.createdAt)),
      tripType,
      status: task.status,
      task: task.name,
      taskRef: task.reference,
      trip: trip.id,
      origin: trip.origin.name,
      destination: trip.destination.name,
      originCoords: [trip.origin.latitude, trip.origin.longitude],
      destCoords: [trip.destination.latitude, trip.destination.longitude],
      currentCoords,
      distance: trip.distanceKm,
      traveled: trip.traveledKm,
      avgSpeed: trip.averageSpeedKph ?? 0,
      eta: clockTime.format(Date.parse(trip.plannedArrivalAt)),
      schedule: `${clockTime.format(Date.parse(task.plannedStartAt))} - ${clockTime.format(Date.parse(task.plannedEndAt))}`,
      startAt: task.actualStartAt ? clockTime.format(Date.parse(task.actualStartAt)) : "Belum dimulai",
    };
  });

function toRouteData(task: Task): TaskRouteData {
  // Task data uses [lat, lng] format — convert to {lng, lat} for TaskRouteData
  const [origLat, origLng] = task.originCoords;
  const [destLat, destLng] = task.destCoords;
  const [curLat, curLng] = task.currentCoords;

  const traveledRoute: { lng: number; lat: number }[] = [];
  if (task.traveled > 0) {
    const ratio = Math.min(task.traveled / task.distance, 1);
    traveledRoute.push({ lng: origLng, lat: origLat });
    traveledRoute.push({ lng: origLng + (destLng - origLng) * ratio, lat: origLat + (destLat - origLat) * ratio });
    traveledRoute.push({ lng: curLng, lat: curLat });
  }

  return {
    vehicle: task.vehicle, driver: task.driver, task: task.task,
    status: task.status, speed: task.avgSpeed,
    origin: { label: task.origin, coord: { lng: origLng, lat: origLat } },
    destination: { label: task.destination, coord: { lng: destLng, lat: destLat } },
    current: { label: task.task, coord: { lng: curLng, lat: curLat } },
    plannedRoute: [{ lng: origLng, lat: origLat }, { lng: destLng, lat: destLat }],
    traveledRoute,
  };
}

const STATUS_ORDER: TaskStatus[] = ["progress", "unloading", "assigned", "waiting", "completed"];

const STATUS_META: Record<TaskStatus, { label: string; colorVar: string; dotColor: string }> = {
  progress:   { label: "Berlangsung", colorVar: "var(--st-driving)", dotColor: "var(--st-driving)" },
  unloading:  { label: "Bongkar",     colorVar: "var(--st-idle)",   dotColor: "var(--st-idle)" },
  assigned:   { label: "Ditugaskan",  colorVar: "var(--brand)",     dotColor: "var(--brand)" },
  waiting:    { label: "Menunggu",   colorVar: "var(--st-stop)",   dotColor: "var(--st-stop)" },
  completed:  { label: "Selesai",    colorVar: "var(--task-completed)", dotColor: "var(--task-completed)" },
};

type SortKey = "time" | "vehicle" | "status" | "distance";

export default function TasksPage() {
  const { info } = useToast();
  const searchParams = useSearchParams();
  const reducedMotion = useReducedMotion();
  const tasks = TASK_ROWS;
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<TaskStatus | "all">("all");
  const [sortKey, setSortKey] = useState<SortKey>("time");
  const [sortDir, setSortDir] = useState<"asc" | "desc">("desc");

  useEffect(() => {
    const requestedTaskId = searchParams.get("task");
    if (requestedTaskId && tasks.some((task) => task.id === requestedTaskId)) {
      setSelectedId(requestedTaskId);
      setFilter("all");
      setSearch("");
    }
  }, [searchParams, tasks]);

  /* ── KPI count-up (Geist Mono tabular-nums) ─────────────────────────────── */
  const total = useAnimatedNumber(tasks.length, 900);
  const sedang = useAnimatedNumber(tasks.filter(t => t.status === "progress" || t.status === "unloading").length, 900);
  const selesai = useAnimatedNumber(tasks.filter(t => t.status === "completed").length, 900);
  const menunggu = useAnimatedNumber(tasks.filter(t => t.status === "waiting" || t.status === "assigned").length, 900);

  /* ── Filtered + sorted ──────────────────────────────────────────────────── */
  const filtered = useMemo(() => {
    let r = tasks.filter(t => {
      const q = search.trim().toLowerCase();
      const matchSearch = !q || t.vehicle.toLowerCase().includes(q) || t.driver.toLowerCase().includes(q)
        || t.task.toLowerCase().includes(q) || t.taskRef.includes(q)
        || t.origin.toLowerCase().includes(q) || t.destination.toLowerCase().includes(q);
      const matchFilter = filter === "all" || t.status === filter;
      return matchSearch && matchFilter;
    });
    r.sort((a, b) => {
      let av = "", bv = "";
      if (sortKey === "time")     { av = a.time; bv = b.time; }
      else if (sortKey === "vehicle")  { av = a.vehicle; bv = b.vehicle; }
      else if (sortKey === "status")  { av = a.status; bv = b.status; }
      else                           { av = String(a.distance); bv = String(b.distance); }
      const cmp = av.localeCompare(bv, "id");
      return sortDir === "asc" ? cmp : -cmp;
    });
    return r;
  }, [tasks, search, filter, sortKey, sortDir]);

  const counts = useMemo(() => {
    const c: Record<TaskStatus | "all", number> = { all: tasks.length, waiting: 0, assigned: 0, progress: 0, unloading: 0, completed: 0 };
    tasks.forEach(t => { c[t.status]++; });
    return c;
  }, [tasks]);

  const grouped = useMemo(() => {
    const g: Record<string, Task[]> = {};
    filtered.forEach(t => {
      if (!g[t.status]) g[t.status] = [];
      g[t.status].push(t);
    });
    return g;
  }, [filtered]);

  const selectedTask = selectedId ? filtered.find(t => t.id === selectedId) ?? null : null;
  const routeData = selectedTask ? toRouteData(selectedTask) : null;

  /* ── Handlers ───────────────────────────────────────────────────────────── */
  function handleSort(key: SortKey) {
    if (sortKey === key) setSortDir(d => d === "asc" ? "desc" : "desc");
    else { setSortKey(key); setSortDir("asc"); }
  }

  function handleSelect(id: string) {
    setSelectedId(id);
    const t = tasks.find(t => t.id === id);
    if (t) info("Tugas dipilih", `${t.vehicle} — ${t.task}`);
  }

  function handleDoubleClick(id: string) {
    setSelectedId(id);
  }

  const progress = selectedTask ? Math.round((selectedTask.traveled / selectedTask.distance) * 100) : 0;

  /* ───────────────────────────────────────────────────────────────────────── */
  return (
    <div className="flex h-[calc(100vh-4rem)] flex-col overflow-hidden">

      {/* ── HEADER: KPI count-up ───────────────────────────────────────────── */}
      <header className="flex items-center justify-between gap-4 border-b border-border bg-surface-1 px-4 py-2.5 shrink-0">
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-brand text-white">
              <Route className="h-4 w-4" />
            </div>
            <div>
              <h1 className="text-sm font-semibold text-foreground leading-none">Task Monitor</h1>
              <p className="text-xs text-muted mt-0.5 tabular-nums">{counts.all} tugas</p>
            </div>
          </div>
          {/* KPI pills */}
          <div className="flex items-center gap-1">
            <KpiPill label="Total" value={total} mono />
            <KpiPill label="Berlangsung" value={sedang} color="var(--st-driving)" />
            <KpiPill label="Selesai" value={selesai} color="var(--task-completed)" />
            <KpiPill label="Belum mulai" value={menunggu} color="var(--st-stop)" />
          </div>
        </div>

      </header>

      {/* ── FILTER BAR ──────────────────────────────────────────────────────── */}
      <div className="flex items-center gap-2 border-b border-border bg-surface-1 px-4 py-2 shrink-0">
        <Filter className="h-3.5 w-3.5 text-muted shrink-0" />
        <span className="text-[10px] font-semibold uppercase tracking-widest text-muted mr-1">Status:</span>
        <button
          onClick={() => { setFilter("all"); info("Filter", "Semua status"); }}
          className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold transition-all duration-100 focus-visible:outline-2 focus-visible:outline-brand ${
            filter === "all" ? "bg-foreground text-background" : "bg-surface-2 text-muted hover:bg-surface-3 hover:text-foreground"
          }`}
        >
          Semua<span className="tabular-nums opacity-60">({counts.all})</span>
        </button>
        {STATUS_ORDER.map(s => (
          <button
            key={s}
            onClick={() => { setFilter(s); info("Filter status", STATUS_META[s].label); }}
            className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold transition-all duration-100 focus-visible:outline-2 focus-visible:outline-brand ${
              filter === s ? "bg-foreground text-background" : "bg-surface-2 text-muted hover:bg-surface-3 hover:text-foreground"
            }`}
          >
            <span className="w-2 h-2 rounded-full" style={{ background: STATUS_META[s].dotColor }} />
            {STATUS_META[s].label}<span className="tabular-nums opacity-60">({counts[s]})</span>
          </button>
        ))}
      </div>

      {/* ── CONTENT: 2-column ──────────────────────────────────────────────── */}
      <div className="grid flex-1 grid-cols-[380px_1fr] overflow-hidden">

        {/* ── KIRI: Task List ───────────────────────────────────────────────── */}
        <aside className="flex flex-col border-r border-border overflow-hidden bg-surface-1">

          {/* Search */}
          <div className="border-b border-border p-3 shrink-0">
            <div className="relative">
              <Search className="absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted pointer-events-none" />
              <input
                type="search"
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder="Cari plat, driver, rute..."
                className="w-full h-8 pl-8 pr-3 rounded-lg border border-border bg-surface-1 text-xs text-foreground placeholder:text-faint focus:outline-none focus:border-brand focus:ring-2 focus:ring-brand-soft transition-colors"
              />
            </div>
          </div>

          {/* Grouped task list */}
          <div className="flex-1 overflow-y-auto">
            {STATUS_ORDER.filter(g => grouped[g]?.length).map((groupKey, gi) => (
              <div key={groupKey}>
                {/* Group header */}
                <div className="sticky top-0 z-10 bg-surface-2 border-b border-border px-3 py-1.5">
                  <p className="flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-widest" style={{ color: STATUS_META[groupKey as TaskStatus].colorVar }}>
                    <span className="w-1.5 h-1.5 rounded-full" style={{ background: STATUS_META[groupKey as TaskStatus].dotColor }} />
                    {gi + 1}. {STATUS_META[groupKey as TaskStatus].label}
                    <span className="tabular-nums opacity-60">({grouped[groupKey].length})</span>
                  </p>
                </div>
                {/* Task rows */}
                {grouped[groupKey].map(task => {
                  const isSelected = selectedId === task.id;
                  const pct = Math.round((task.traveled / task.distance) * 100);
                  return (
                    <button
                      key={task.id}
                      onClick={() => handleSelect(task.id)}
                      onDoubleClick={() => handleDoubleClick(task.id)}
                      className={`w-full border-b border-border px-3 py-2.5 text-left transition-colors focus-visible:outline-2 focus-visible:outline-brand focus-visible:outline-inset ${
                        isSelected ? "bg-brand-soft border-l-2 border-l-brand" : "hover:bg-surface-2"
                      }`}
                    >
                      {/* Top row: plate + status */}
                      <div className="flex items-center justify-between gap-2">
                        <span className={`font-mono text-sm font-semibold tabular-nums ${isSelected ? "text-brand" : "text-foreground"}`}>
                          {task.vehicle}
                        </span>
                        <TaskStatusBadge status={task.status} />
                      </div>
                      {/* Task */}
                      <p className={`mt-0.5 text-xs truncate ${isSelected ? "text-brand/70" : "text-muted"}`}>
                        {task.task}
                      </p>
                      {/* Route */}
                      <p className={`mt-0.5 text-[11px] truncate ${isSelected ? "text-brand/60" : "text-faint"}`}>
                        {task.origin} → {task.destination}
                      </p>
                      {/* Progress bar */}
                      <div className="mt-1.5 flex items-center gap-2">
                        <div className="flex-1 h-1 rounded-full bg-surface-3 overflow-hidden">
                          <motion.div
                            className="h-full rounded-full"
                            style={{ background: STATUS_META[task.status].colorVar }}
                            initial={false}
                            animate={{ width: `${pct}%` }}
                            transition={reducedMotion ? { duration: 0 } : { duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
                          />
                        </div>
                        <span className={`font-mono text-[10px] tabular-nums shrink-0 ${isSelected ? "text-brand/60" : "text-faint"}`}>
                          {pct}%
                        </span>
                      </div>
                    </button>
                  );
                })}
              </div>
            ))}

            {filtered.length === 0 && (
              <div className="p-6">
                <EmptyState
                  title="Tidak ada tugas"
                  description="Coba ubah filter atau kata kunci pencarian."
                />
              </div>
            )}
          </div>
        </aside>

        {/* ── KANAN: Map + Detail ───────────────────────────────────────────── */}
        <main className="relative flex flex-col overflow-hidden">
          {routeData ? (
            <>
              <div className="flex-1 relative">
                <TaskRouteMap task={routeData} />
              </div>

              {/* Trip Detail Overlay */}
              <motion.div
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={reducedMotion ? { duration: 0 } : { type: "spring", stiffness: 320, damping: 30 }}
                className="shrink-0 border-t border-border bg-surface-1 px-4 py-3"
              >
                {/* Trip header */}
                <div className="flex items-start justify-between gap-4 mb-3">
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-sm font-semibold tabular-nums text-foreground">{selectedTask?.vehicle}</span>
                      <TaskStatusBadge status={selectedTask!.status} />
                    </div>
                    <p className="text-xs text-muted mt-0.5 truncate">{selectedTask?.task} · {selectedTask?.tripType}</p>
                  </div>
                  <button
                    onClick={() => setSelectedId(null)}
                    className="shrink-0 p-1.5 rounded-lg text-muted hover:bg-surface-2 hover:text-foreground transition-colors focus-visible:outline-2 focus-visible:outline-brand"
                    aria-label="Tutup detail"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>

                {/* Stats row */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mb-3">
                  <MetricCell icon={<Navigation className="h-3.5 w-3.5" />} label="Jarak" value={`${selectedTask?.distance} km`} mono />
                  <MetricCell icon={<Route className="h-3.5 w-3.5" />} label="Tempuh" value={`${selectedTask?.traveled} km`} mono />
                  <MetricCell icon={<Clock className="h-3.5 w-3.5" />} label="Target tiba" value={selectedTask?.eta ?? "—"} mono />
                  <MetricCell icon={<Truck className="h-3.5 w-3.5" />} label="Kecep. Rata" value={`${selectedTask?.avgSpeed} km/j`} mono />
                </div>

                <div className="flex items-center justify-between border-t border-border pt-2 text-xs">
                  <span className="text-muted">Jenis perjalanan</span>
                  <span className="font-medium text-foreground">{selectedTask?.tripType}</span>
                </div>
              </motion.div>
            </>
          ) : (
            <div className="flex flex-1 items-center justify-center bg-surface-2">
              <EmptyState
                icon={<MapPin className="w-10 h-10" />}
                title="Pilih tugas untuk lihat rute"
                description="Klik tugas di panel kiri untuk melihat rute perjalanan dan detail trip."
              />
            </div>
          )}
        </main>
      </div>

    </div>
  );
}

/* ─── KPI Pill ────────────────────────────────────────────────────────────── */
function KpiPill({ label, value, color = "var(--text)", mono = false }: {
  label: string; value: number; color?: string; mono?: boolean;
}) {
  return (
    <div className="flex items-center gap-1.5 rounded-full bg-surface-2 border border-border px-2.5 py-1">
      <span className="text-[10px] font-semibold uppercase tracking-widest text-muted">{label}</span>
      <span
        className={`font-mono text-sm font-bold tabular-nums ${mono ? "" : ""}`}
        style={{ color }}
      >
        {value}
      </span>
    </div>
  );
}

/* ─── Metric Cell ──────────────────────────────────────────────────────────── */
function MetricCell({ icon, label, value, mono = false }: {
  icon: React.ReactNode; label: string; value: string; mono?: boolean;
}) {
  return (
    <div className="flex items-center gap-2 rounded-lg bg-surface-2 px-2.5 py-1.5 border border-border">
      <span className="text-muted shrink-0">{icon}</span>
      <div className="min-w-0">
        <p className="text-[9px] font-semibold uppercase tracking-widest text-muted leading-none">{label}</p>
        <p className={`font-mono text-xs font-semibold tabular-nums text-foreground mt-0.5 ${mono ? "" : ""}`}>{value}</p>
      </div>
    </div>
  );
}
