"use client";

import dynamic from "next/dynamic";
import { useMemo, useState, useCallback } from "react";
import { motion } from "motion/react";
import {
  Map, Table, RefreshCw, Search, Filter, Navigation,
  MapPin, Truck, User, Clock, Route, Play, Square, X,
  ChevronDown, ChevronRight, SortAsc, SortDesc,
} from "lucide-react";
import { useToast } from "@/components/ui/Toast";
import { TaskStatusBadge } from "@/components/ui/Badge";
import { Skeleton, EmptyState } from "@/components/ui/Card";
import { useReducedMotion } from "@/hooks/useReducedMotion";
import { useAnimatedNumber } from "@/lib/motion";
import { Panel } from "@/components/ui/Panel";
import type { TaskRouteData } from "@/components/map/TaskRouteMap";

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

type TaskStatus = "waiting" | "assigned" | "progress" | "unloading" | "completed";

interface Task {
  id: string; vehicle: string; driver: string; group: string; time: string;
  tripType: "Pre-Task" | "Main Task" | "Return"; status: TaskStatus;
  task: string; taskRef: string; trip: string; origin: string;
  destination: string; originCoords: [number, number];
  destCoords: [number, number]; currentCoords: [number, number];
  distance: number; traveled: number; avgSpeed: number;
  eta: string; schedule: string; startAt: string;
}

const TASKS: Task[] = [
  { id: "1", vehicle: "B 9068 NU", driver: "Nana Sutrisna", group: "CDDL BEKASI", time: "Jun 01, 18:10", tripType: "Main Task", status: "unloading", task: "PLI - DEPOK", taskRef: "5410295521", trip: "PLI - DEPOK", origin: "PLI DMG", destination: "PTT DPK", originCoords: [-6.1751, 106.8650], destCoords: [-6.4023, 106.7947], currentCoords: [-6.4010, 106.7950], distance: 28.5, traveled: 27.2, avgSpeed: 42, eta: "18:45", schedule: "08:00 - 20:00", startAt: "08:15" },
  { id: "2", vehicle: "B 9218 GV", driver: "Ahmad Dahlan", group: "CDE BEKASI", time: "Jun 01, 17:55", tripType: "Main Task", status: "progress", task: "TNF - BEKASI", taskRef: "5410295522", trip: "TNF - BEKASI", origin: "TNF Warehouse", destination: "Bekasi DC", originCoords: [-6.2388, 106.9200], destCoords: [-6.2339, 106.9920], currentCoords: [-6.2350, 106.9500], distance: 15.2, traveled: 9.8, avgSpeed: 55, eta: "18:30", schedule: "07:00 - 19:00", startAt: "07:20" },
  { id: "3", vehicle: "B 9544 SYO", driver: "Budi Santoso", group: "FULL BOX BEKASI", time: "Jun 01, 16:40", tripType: "Main Task", status: "progress", task: "PLI - JKT1", taskRef: "5410295523", trip: "PLI - JKT1", origin: "PLI Central", destination: "JKT1 Hub", originCoords: [-6.1751, 106.8650], destCoords: [-6.1500, 106.8200], currentCoords: [-6.1650, 106.8400], distance: 8.5, traveled: 5.2, avgSpeed: 38, eta: "17:30", schedule: "06:00 - 18:00", startAt: "06:30" },
  { id: "4", vehicle: "BA 8329 QY", driver: "Cahyo Wibowo", group: "CDDL BEKASI", time: "Jun 01, 15:20", tripType: "Return", status: "waiting", task: "BKS - LAMPUNG", taskRef: "5410295524", trip: "BKS - LAMPUNG", origin: "BKS Pool", destination: "Lampung Port", originCoords: [-6.2500, 106.9900], destCoords: [-5.4500, 105.2700], currentCoords: [-6.2500, 106.9900], distance: 285.0, traveled: 0, avgSpeed: 0, eta: "20:00", schedule: "05:00 - 22:00", startAt: "Pending" },
  { id: "5", vehicle: "B 9001 SXS", driver: "Dedi Kurniawan", group: "CDE BEKASI", time: "Jun 01, 14:10", tripType: "Pre-Task", status: "progress", task: "CIK - KEDIRI", taskRef: "5410295525", trip: "CIK - KEDIRI", origin: "Cikarang", destination: "Kediri", originCoords: [-6.4500, 107.1500], destCoords: [-7.8480, 112.0170], currentCoords: [-6.8000, 108.5000], distance: 450.0, traveled: 180.5, avgSpeed: 62, eta: "23:00", schedule: "00:00 - 24:00", startAt: "00:30" },
  { id: "6", vehicle: "B 9002 SXS", driver: "Eko Prasetyo", group: "FULL BOX PALEMBANG", time: "Jun 01, 13:00", tripType: "Main Task", status: "unloading", task: "KLN - SURABAYA", taskRef: "5410295526", trip: "KLN - SURABAYA", origin: "KALINDAK", destination: "Surabaya DC", originCoords: [-3.0500, 114.9200], destCoords: [-7.2500, 112.7500], currentCoords: [-7.2480, 112.7520], distance: 520.0, traveled: 518.5, avgSpeed: 58, eta: "Completed", schedule: "12:00 - 18:00", startAt: "12:30" },
  { id: "7", vehicle: "B 9997 SXR", driver: "Fajar Ramadhan", group: "CDDL BEKASI", time: "Jun 01, 12:30", tripType: "Main Task", status: "progress", task: "BKS - PURBALINGGA", taskRef: "5410295527", trip: "BKS - PURBALINGGA", origin: "Bekasi", destination: "Purbalingga", originCoords: [-6.2339, 106.9920], destCoords: [-7.4300, 109.3600], currentCoords: [-6.9000, 108.2000], distance: 185.0, traveled: 95.0, avgSpeed: 48, eta: "19:30", schedule: "08:00 - 20:00", startAt: "08:45" },
  { id: "8", vehicle: "BG 8221 NK", driver: "Gunawan Hadi", group: "CDE BEKASI", time: "Jun 01, 11:15", tripType: "Main Task", status: "assigned", task: "CIK - JOGJA", taskRef: "5410295528", trip: "CIK - JOGJA", origin: "Cikarang", destination: "Yogyakarta", originCoords: [-6.4500, 107.1500], destCoords: [-7.7970, 110.3610], currentCoords: [-6.4500, 107.1500], distance: 420.0, traveled: 0, avgSpeed: 0, eta: "22:00", schedule: "10:00 - 23:00", startAt: "Pending" },
  { id: "9", vehicle: "BG 8292 NK", driver: "Hendra Wijaya", group: "FULL BOX BEKASI", time: "Jun 01, 10:00", tripType: "Main Task", status: "progress", task: "TNG - SEMARANG", taskRef: "5410295529", trip: "TNG - SEMARANG", origin: "Tangerang", destination: "Semarang", originCoords: [-6.1780, 106.6300], destCoords: [-6.9670, 110.4200], currentCoords: [-6.5000, 108.3000], distance: 380.0, traveled: 175.0, avgSpeed: 65, eta: "20:00", schedule: "06:00 - 21:00", startAt: "06:30" },
  { id: "10", vehicle: "B 9068 NU", driver: "Irfan Hakim", group: "CDDL BEKASI", time: "Jun 01, 09:00", tripType: "Main Task", status: "completed", task: "JKT - BANDUNG", taskRef: "5410295530", trip: "JKT - BANDUNG", origin: "Jakarta", destination: "Bandung", originCoords: [-6.1751, 106.8650], destCoords: [-6.9175, 107.6190], currentCoords: [-6.9180, 107.6200], distance: 125.0, traveled: 123.5, avgSpeed: 52, eta: "Completed", schedule: "07:00 - 12:00", startAt: "07:15" },
];

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
  const { success, info } = useToast();
  const reducedMotion = useReducedMotion();
  const [tasks] = useState<Task[]>(TASKS);
  const [showAddPanel, setShowAddPanel] = useState(false);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [newTask, setNewTask] = useState<{
    vehicle: string; driver: string; group: string; task: string; taskRef: string;
    origin: string; destination: string; schedule: string;
    tripType: "Pre-Task" | "Main Task" | "Return";
  }>({
    vehicle: "", driver: "", group: "", task: "", taskRef: "",
    origin: "", destination: "", schedule: "", tripType: "Main Task",
  });

  const handleAddTask = () => {
    if (!newTask.vehicle || !newTask.task || !newTask.origin || !newTask.destination) {
      return;
    }
    success("Tugas ditambahkan", `Tugas ${newTask.task} untuk ${newTask.vehicle} berhasil dibuat.`);
    setShowAddPanel(false);
    setNewTask({ vehicle: "", driver: "", group: "", task: "", taskRef: "", origin: "", destination: "", schedule: "", tripType: "Main Task" });
  };
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<TaskStatus | "all">("all");
  const [lastRefresh, setLastRefresh] = useState(new Date());
  const [sortKey, setSortKey] = useState<SortKey>("time");
  const [sortDir, setSortDir] = useState<"asc" | "desc">("desc");
  const [refreshing, setRefreshing] = useState(false);

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

  function handleRefresh() {
    setRefreshing(true);
    setTimeout(() => { setLastRefresh(new Date()); setRefreshing(false); success("Data diperbarui", `${tasks.length} tugas dimuat`); }, 800);
  }

  function handleSelect(id: string) {
    setSelectedId(id);
    const t = tasks.find(t => t.id === id);
    if (t) info("Tugas dipilih", `${t.vehicle} — ${t.task}`);
  }

  function handleDoubleClick(id: string) {
    setSelectedId(id);
  }

  function handleStartTrip(taskId: string, etape: string) {
    success("Trip dimulai", `${etape} — ${tasks.find(t => t.id === taskId)?.vehicle ?? ""}`);
  }

  function handleEndTrip(taskId: string, etape: string) {
    success("Trip selesai", `${etape} — ${tasks.find(t => t.id === taskId)?.vehicle ?? ""}`);
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
              <p className="text-xs text-muted mt-0.5 tabular-nums">{counts.all} tugas aktif</p>
            </div>
          </div>
          {/* KPI pills */}
          <div className="flex items-center gap-1">
            <KpiPill label="Total" value={total} mono />
            <KpiPill label="Berlangsung" value={sedang} color="var(--st-driving)" />
            <KpiPill label="Selesai" value={selesai} color="var(--task-completed)" />
            <KpiPill label="Menunggu" value={menunggu} color="var(--st-stop)" />
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Refresh */}
          <button
            onClick={handleRefresh}
            disabled={refreshing}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-border bg-surface-2 text-xs font-medium text-foreground hover:bg-surface-3 hover:border-border-strong transition-colors disabled:opacity-50 focus-visible:outline-2 focus-visible:outline-brand"
          >
            <RefreshCw className={`h-3.5 w-3.5 ${refreshing ? "animate-spin" : ""}`} />
            <span className="tabular-nums">{lastRefresh.toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" })}</span>
          </button>
          {/* Add task */}
          <button
            onClick={() => setShowAddPanel(true)}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-foreground text-background text-xs font-semibold hover:opacity-90 transition-opacity focus-visible:outline-2 focus-visible:outline-brand"
            aria-label="Tambah tugas baru"
          >
            <Play className="h-3.5 w-3.5" /> Tugas Baru
          </button>
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
                  <MetricCell icon={<Clock className="h-3.5 w-3.5" />} label="ETA" value={selectedTask?.eta ?? "—"} mono />
                  <MetricCell icon={<Truck className="h-3.5 w-3.5" />} label="Kecep. Rata" value={`${selectedTask?.avgSpeed} km/j`} mono />
                </div>

                {/* Trip timeline (Pre-Trip / Main-Trip / Return) */}
                <div className="flex items-center gap-2">
                  <TimelineButton label="Pre-Trip" active={selectedTask?.tripType === "Pre-Task"} onStart={() => handleStartTrip(selectedTask!.id, "Pre-Trip")} onEnd={() => handleEndTrip(selectedTask!.id, "Pre-Trip")} />
                  <div className="flex-1 h-px bg-border" />
                  <TimelineButton label="Main-Trip" active={selectedTask?.tripType === "Main Task"} onStart={() => handleStartTrip(selectedTask!.id, "Main-Trip")} onEnd={() => handleEndTrip(selectedTask!.id, "Main-Trip")} />
                  <div className="flex-1 h-px bg-border" />
                  <TimelineButton label="Return" active={selectedTask?.tripType === "Return"} onStart={() => handleStartTrip(selectedTask!.id, "Return")} onEnd={() => handleEndTrip(selectedTask!.id, "Return")} />
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

      {/* ── Add Task Panel ─────────────────────────────────────────────── */}
      <Panel
        open={showAddPanel}
        onClose={() => setShowAddPanel(false)}
        title="Tugas Baru"
        subtitle="Tambah misi pengiriman"
        width={420}
        footer={
          <div className="flex justify-end gap-2">
            <button
              onClick={() => setShowAddPanel(false)}
              className="px-4 py-2 rounded-lg border border-border text-sm text-foreground hover:bg-surface-2 transition-colors focus-visible:outline-2 focus-visible:outline-brand"
            >
              Batal
            </button>
            <button
              onClick={handleAddTask}
              disabled={!newTask.vehicle || !newTask.task}
              className="px-4 py-2 rounded-lg bg-foreground text-background text-sm font-semibold hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed focus-visible:outline-2 focus-visible:outline-brand"
            >
              Simpan
            </button>
          </div>
        }
      >
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-foreground mb-1.5">Plat Nomor *</label>
            <input
              type="text"
              value={newTask.vehicle}
              onChange={e => setNewTask(t => ({ ...t, vehicle: e.target.value }))}
              placeholder="B 1234 KJT"
              className="w-full px-3 py-2 rounded-lg bg-surface-2 border border-border text-sm text-foreground font-mono placeholder:text-faint focus-visible:outline-2 focus-visible:outline-brand"
              aria-label="Plat nomor kendaraan"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-foreground mb-1.5">Driver</label>
            <input
              type="text"
              value={newTask.driver}
              onChange={e => setNewTask(t => ({ ...t, driver: e.target.value }))}
              placeholder="Nama driver"
              className="w-full px-3 py-2 rounded-lg bg-surface-2 border border-border text-sm text-foreground placeholder:text-faint focus-visible:outline-2 focus-visible:outline-brand"
              aria-label="Nama driver"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-foreground mb-1.5">Group / Pool</label>
            <input
              type="text"
              value={newTask.group}
              onChange={e => setNewTask(t => ({ ...t, group: e.target.value }))}
              placeholder="CDDL BEKASI"
              className="w-full px-3 py-2 rounded-lg bg-surface-2 border border-border text-sm text-foreground placeholder:text-faint focus-visible:outline-2 focus-visible:outline-brand"
              aria-label="Group atau pool"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-foreground mb-1.5">Nama Tugas *</label>
            <input
              type="text"
              value={newTask.task}
              onChange={e => setNewTask(t => ({ ...t, task: e.target.value }))}
              placeholder="PLI - DEPOK"
              className="w-full px-3 py-2 rounded-lg bg-surface-2 border border-border text-sm text-foreground placeholder:text-faint focus-visible:outline-2 focus-visible:outline-brand"
              aria-label="Nama tugas"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-foreground mb-1.5">Trip Type</label>
            <div className="flex gap-2">
              {(["Pre-Task", "Main Task", "Return"] as const).map(t => (
                <button
                  key={t}
                  onClick={() => setNewTask(prev => ({ ...prev, tripType: t as "Pre-Task" | "Main Task" | "Return" }))}
                  aria-pressed={newTask.tripType === t}
                  className={`flex-1 px-3 py-2 rounded-lg border text-sm font-medium transition-colors focus-visible:outline-2 focus-visible:outline-brand ${
                    newTask.tripType === t
                      ? "bg-foreground text-background border-foreground"
                      : "bg-surface-2 border-border text-muted hover:bg-surface-3"
                  }`}
                >
                  {t}
                </button>
              ))}
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-foreground mb-1.5">Origin *</label>
            <input
              type="text"
              value={newTask.origin}
              onChange={e => setNewTask(t => ({ ...t, origin: e.target.value }))}
              placeholder="PLI DMG"
              className="w-full px-3 py-2 rounded-lg bg-surface-2 border border-border text-sm text-foreground placeholder:text-faint focus-visible:outline-2 focus-visible:outline-brand"
              aria-label="Lokasi asal"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-foreground mb-1.5">Destination *</label>
            <input
              type="text"
              value={newTask.destination}
              onChange={e => setNewTask(t => ({ ...t, destination: e.target.value }))}
              placeholder="PTT DPK"
              className="w-full px-3 py-2 rounded-lg bg-surface-2 border border-border text-sm text-foreground placeholder:text-faint focus-visible:outline-2 focus-visible:outline-brand"
              aria-label="Lokasi tujuan"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-foreground mb-1.5">Jadwal</label>
            <input
              type="text"
              value={newTask.schedule}
              onChange={e => setNewTask(t => ({ ...t, schedule: e.target.value }))}
              placeholder="08:00 - 20:00"
              className="w-full px-3 py-2 rounded-lg bg-surface-2 border border-border text-sm text-foreground font-mono placeholder:text-faint focus-visible:outline-2 focus-visible:outline-brand"
              aria-label="Jadwal pengiriman"
            />
          </div>
        </div>
      </Panel>
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

/* ─── Timeline Button ──────────────────────────────────────────────────────── */
function TimelineButton({ label, active, onStart, onEnd }: {
  label: string; active: boolean;
  onStart: () => void; onEnd: () => void;
}) {
  return (
    <div className="flex flex-col items-center gap-1">
      <span className={`text-[9px] font-semibold uppercase tracking-widest ${active ? "text-brand" : "text-muted"}`}>
        {label}
      </span>
      <div className="flex items-center gap-1">
        <button
          onClick={onStart}
          className="flex items-center gap-1 rounded px-1.5 py-0.5 text-[9px] font-semibold bg-st-driving-bg text-st-driving hover:opacity-80 transition-opacity focus-visible:outline-2 focus-visible:outline-brand"
          title={`Mulai ${label}`}
        >
          <Play className="h-2.5 w-2.5" /> START
        </button>
        <button
          onClick={onEnd}
          className="flex items-center gap-1 rounded px-1.5 py-0.5 text-[9px] font-semibold bg-surface-3 text-muted hover:bg-surface-2 transition-colors focus-visible:outline-2 focus-visible:outline-brand"
          title={`Akhiri ${label}`}
        >
          <Square className="h-2.5 w-2.5" /> END
        </button>
      </div>
    </div>
  );
}
