"use client";

import { useMemo, useState } from "react";
import dynamic from "next/dynamic";
import {
  ArrowDownUp,
  Calendar,
  ChevronDown,
  Clock,
  Download,
  Filter,
  Map,
  MapPin,
  Navigation,
  Plus,
  RefreshCw,
  Search,
  Table,
  Truck,
  Users,
  ZoomIn,
} from "lucide-react";
import { useToast } from "@/components/ui/Toast";
import type { TaskRouteData } from "@/components/map/TaskRouteMap";

const TaskRouteMap = dynamic(() => import("@/components/map/TaskRouteMap"), {
  ssr: false,
  loading: () => (
    <div className="flex h-full w-full items-center justify-center bg-zinc-100 text-sm font-medium text-zinc-500">
      Loading map...
    </div>
  ),
});

interface Task {
  id: string;
  vehicle: string;
  driver: string;
  group: string;
  time: string;
  tripType: "Pre-Task" | "Main Task" | "Return";
  status: "progress" | "unloading" | "waiting" | "assigned";
  task: string;
  taskRef: string;
  trip: string;
  origin: string;
  destination: string;
  originCoords: [number, number];
  destCoords: [number, number];
  currentCoords: [number, number];
  distance: number;
  traveled: number;
  avgSpeed: number;
  eta: string;
  schedule: string;
  startAt: string;
}

const mockTasks: Task[] = [
  { id: "1", vehicle: "B 9068 NU (ECFS)", driver: "Nana Sutrisna", group: "CDDL BEKASI", time: "Jun 01, 18:10:24", tripType: "Main Task", status: "unloading", task: "PLI - DEPOK", taskRef: "5410295521", trip: "PLI - DEPOK", origin: "PLI DMG", destination: "PTT DPK", originCoords: [-6.1751, 106.8650], destCoords: [-6.4023, 106.7947], currentCoords: [-6.4010, 106.7950], distance: 28.5, traveled: 27.2, avgSpeed: 42, eta: "18:45", schedule: "08:00 - 20:00", startAt: "08:15" },
  { id: "2", vehicle: "B 9218 GV", driver: "Ahmad Dahlan", group: "CDE BEKASI", time: "Jun 01, 17:55:10", tripType: "Main Task", status: "progress", task: "TNF - BEKASI", taskRef: "5410295522", trip: "TNF - BEKASI", origin: "TNF Warehouse", destination: "Bekasi DC", originCoords: [-6.2388, 106.9200], destCoords: [-6.2339, 106.9920], currentCoords: [-6.2350, 106.9500], distance: 15.2, traveled: 9.8, avgSpeed: 55, eta: "18:30", schedule: "07:00 - 19:00", startAt: "07:20" },
  { id: "3", vehicle: "B 9544 SYO", driver: "Budi Santoso", group: "FULL BOX BEKASI", time: "Jun 01, 16:40:00", tripType: "Main Task", status: "progress", task: "PLI - JKT1", taskRef: "5410295523", trip: "PLI - JKT1", origin: "PLI Central", destination: "JKT1 Hub", originCoords: [-6.1751, 106.8650], destCoords: [-6.1500, 106.8200], currentCoords: [-6.1650, 106.8400], distance: 8.5, traveled: 5.2, avgSpeed: 38, eta: "17:30", schedule: "06:00 - 18:00", startAt: "06:30" },
  { id: "4", vehicle: "BA 8329 QY (ECFS)", driver: "Cahyo Wibowo", group: "CDDL BEKASI", time: "Jun 01, 15:20:00", tripType: "Return", status: "waiting", task: "BKS - LAMPUNG", taskRef: "5410295524", trip: "BKS - LAMPUNG", origin: "BKS Pool", destination: "Lampung Port", originCoords: [-6.2500, 106.9900], destCoords: [-5.4500, 105.2700], currentCoords: [-6.2500, 106.9900], distance: 285.0, traveled: 0, avgSpeed: 0, eta: "20:00", schedule: "05:00 - 22:00", startAt: "Pending" },
  { id: "5", vehicle: "B 9001 SXS", driver: "Dedi Kurniawan", group: "CDE BEKASI", time: "Jun 01, 14:10:00", tripType: "Pre-Task", status: "progress", task: "CIK - KEDIRI", taskRef: "5410295525", trip: "CIK - KEDIRI", origin: "Cikarang", destination: "Kediri", originCoords: [-6.4500, 107.1500], destCoords: [-7.8480, 112.0170], currentCoords: [-6.8000, 108.5000], distance: 450.0, traveled: 180.5, avgSpeed: 62, eta: "23:00", schedule: "00:00 - 24:00", startAt: "00:30" },
  { id: "6", vehicle: "B 9002 SXS", driver: "Eko Prasetyo", group: "FULL BOX PALEMBANG", time: "Jun 01, 13:00:00", tripType: "Main Task", status: "unloading", task: "KLN - SURABAYA", taskRef: "5410295526", trip: "KLN - SURABAYA", origin: "KALINDAK", destination: "Surabaya DC", originCoords: [-3.0500, 114.9200], destCoords: [-7.2500, 112.7500], currentCoords: [-7.2480, 112.7520], distance: 520.0, traveled: 518.5, avgSpeed: 58, eta: "Completed", schedule: "12:00 - 18:00", startAt: "12:30" },
  { id: "7", vehicle: "B 9997 SXR", driver: "Fajar Ramadhan", group: "CDDL BEKASI", time: "Jun 01, 12:30:00", tripType: "Main Task", status: "progress", task: "BKS - PURBALINGGA", taskRef: "5410295527", trip: "BKS - PURBALINGGA", origin: "Bekasi", destination: "Purbalingga", originCoords: [-6.2339, 106.9920], destCoords: [-7.4300, 109.3600], currentCoords: [-6.9000, 108.2000], distance: 185.0, traveled: 95.0, avgSpeed: 48, eta: "19:30", schedule: "08:00 - 20:00", startAt: "08:45" },
  { id: "8", vehicle: "BG 8221 NK (BDL)", driver: "Gunawan Hadi", group: "CDE BEKASI", time: "Jun 01, 11:15:00", tripType: "Main Task", status: "assigned", task: "CIK - JOGJA", taskRef: "5410295528", trip: "CIK - JOGJA", origin: "Cikarang", destination: "Yogyakarta", originCoords: [-6.4500, 107.1500], destCoords: [-7.7970, 110.3610], currentCoords: [-6.4500, 107.1500], distance: 420.0, traveled: 0, avgSpeed: 0, eta: "22:00", schedule: "10:00 - 23:00", startAt: "Pending" },
  { id: "9", vehicle: "BG 8292 NK (BDL)", driver: "Hendra Wijaya", group: "FULL BOX BEKASI", time: "Jun 01, 10:00:00", tripType: "Main Task", status: "progress", task: "TNG - SEMARANG", taskRef: "5410295529", trip: "TNG - SEMARANG", origin: "Tangerang", destination: "Semarang", originCoords: [-6.1780, 106.6300], destCoords: [-6.9670, 110.4200], currentCoords: [-6.5000, 108.3000], distance: 380.0, traveled: 175.0, avgSpeed: 65, eta: "20:00", schedule: "06:00 - 21:00", startAt: "06:30" },
  { id: "10", vehicle: "B 9068 NU", driver: "Irfan Hakim", group: "CDDL BEKASI", time: "Jun 01, 09:00:00", tripType: "Main Task", status: "unloading", task: "JKT - BANDUNG", taskRef: "5410295530", trip: "JKT - BANDUNG", origin: "Jakarta", destination: "Bandung", originCoords: [-6.1751, 106.8650], destCoords: [-6.9175, 107.6190], currentCoords: [-6.9180, 107.6200], distance: 125.0, traveled: 123.5, avgSpeed: 52, eta: "Completed", schedule: "07:00 - 12:00", startAt: "07:15" },
];

function taskToRouteData(task: Task): TaskRouteData {
  const traveledRoute: [number, number][] = [];
  if (task.traveled > 0) {
    const ratio = Math.min(task.traveled / task.distance, 1);
    traveledRoute.push(task.originCoords);
    const midLat = task.originCoords[0] + (task.destCoords[0] - task.originCoords[0]) * ratio;
    const midLng = task.originCoords[1] + (task.destCoords[1] - task.originCoords[1]) * ratio;
    traveledRoute.push([midLat, midLng]);
    traveledRoute.push(task.currentCoords);
  }
  return {
    vehicle: task.vehicle,
    driver: task.driver,
    task: task.task,
    status: task.status,
    speed: task.avgSpeed,
    origin: { label: task.origin, coord: task.originCoords },
    destination: { label: task.destination, coord: task.destCoords },
    current: { label: task.task, coord: task.currentCoords },
    plannedRoute: [task.originCoords, task.destCoords],
    traveledRoute,
  };
}

const statusConfig = {
  progress: { label: "Progress", class: "badge-info" },
  unloading: { label: "Unloading", class: "badge-success" },
  waiting: { label: "Waiting", class: "badge-warning" },
  assigned: { label: "Assigned", class: "badge-neutral" },
};

const tripTypeConfig = {
  "Pre-Task": "badge-info",
  "Main Task": "badge-success",
  Return: "badge-warning",
};

type ViewMode = "table" | "map";
type SortField = "time" | "vehicle" | "status" | "distance";

export default function TasksPage() {
  const { addToast } = useToast();
  const [tasks] = useState<Task[]>(mockTasks);
  const [viewMode, setViewMode] = useState<ViewMode>("table");
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [sortField, setSortField] = useState<SortField>("time");
  const [sortDir, setSortDir] = useState<"asc" | "desc">("desc");
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [lastRefresh, setLastRefresh] = useState(new Date());

  const filtered = useMemo(() => {
    let result = tasks.filter((t) => {
      const matchSearch =
        !search ||
        t.vehicle.toLowerCase().includes(search.toLowerCase()) ||
        t.driver.toLowerCase().includes(search.toLowerCase()) ||
        t.task.toLowerCase().includes(search.toLowerCase()) ||
        t.taskRef.includes(search) ||
        t.origin.toLowerCase().includes(search.toLowerCase()) ||
        t.destination.toLowerCase().includes(search.toLowerCase());
      const matchStatus = statusFilter === "all" || t.status === statusFilter;
      return matchSearch && matchStatus;
    });

    result.sort((a, b) => {
      let cmp = 0;
      if (sortField === "time") cmp = a.time.localeCompare(b.time);
      if (sortField === "vehicle") cmp = a.vehicle.localeCompare(b.vehicle);
      if (sortField === "status") cmp = a.status.localeCompare(b.status);
      if (sortField === "distance") cmp = a.distance - b.distance;
      return sortDir === "asc" ? cmp : -cmp;
    });

    return result;
  }, [tasks, search, statusFilter, sortField, sortDir]);

  const counts = useMemo(() => {
    const c = { all: tasks.length, progress: 0, unloading: 0, waiting: 0, assigned: 0 };
    tasks.forEach((t) => c[t.status as keyof typeof c]++);
    return c;
  }, [tasks]);

  function handleSort(field: SortField) {
    if (field === sortField) {
      setSortDir((prev) => (prev === "asc" ? "desc" : "asc"));
    } else {
      setSortField(field);
      setSortDir("asc");
    }
  }

  function handleRefresh() {
    setLastRefresh(new Date());
    addToast("info", "Task data refreshed");
  }

  function handleRowClick(task: Task) {
    setSelectedTask(task);
  }

  function handleRowDoubleClick(task: Task) {
    setSelectedTask(task);
    setViewMode("map");
    addToast("info", `Opening ${task.vehicle} on map`);
  }

  return (
    <div className="flex h-[calc(100vh-4rem)] flex-col">
      {/* Toolbar */}
      <div className="flex items-center justify-between border-b border-zinc-200 bg-white px-6 py-4 dark:border-zinc-800 dark:bg-zinc-900">
        <div className="flex items-center gap-4">
          <h1 className="text-lg font-semibold text-zinc-900 dark:text-white">Task Monitor</h1>
          <span className="text-sm text-zinc-500">
            {counts.all} tasks · {counts.progress} progress · {counts.unloading} unloading
          </span>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex rounded-lg border border-zinc-200 dark:border-zinc-800">
            <button
              onClick={() => setViewMode("table")}
              className={`flex items-center gap-2 px-4 py-2 text-sm font-medium transition-colors ${
                viewMode === "table"
                  ? "bg-zinc-900 text-white dark:bg-white dark:text-zinc-900"
                  : "text-zinc-600 hover:bg-zinc-50 dark:text-zinc-400 dark:hover:bg-zinc-800"
              }`}
            >
              <Table className="h-4 w-4" /> Table
            </button>
            <button
              onClick={() => setViewMode("map")}
              className={`flex items-center gap-2 px-4 py-2 text-sm font-medium transition-colors ${
                viewMode === "map"
                  ? "bg-zinc-900 text-white dark:bg-white dark:text-zinc-900"
                  : "text-zinc-600 hover:bg-zinc-50 dark:text-zinc-400 dark:hover:bg-zinc-800"
              }`}
            >
              <Map className="h-4 w-4" /> Map
            </button>
          </div>
          <button onClick={handleRefresh} className="btn btn-secondary">
            <RefreshCw className="h-4 w-4" />
            <span className="text-xs">{lastRefresh.toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" })}</span>
          </button>
        </div>
      </div>

      {/* Filter Pills */}
      <div className="flex items-center gap-2 border-b border-zinc-200 bg-white px-6 py-3 dark:border-zinc-800 dark:bg-zinc-900">
        <Filter className="h-4 w-4 text-zinc-400" />
        {(["all", "progress", "unloading", "waiting", "assigned"] as const).map((s) => (
          <button
            key={s}
            onClick={() => setStatusFilter(s)}
            className={`rounded-full px-4 py-1.5 text-xs font-semibold transition-colors ${
              statusFilter === s
                ? "bg-zinc-900 text-white dark:bg-white dark:text-zinc-900"
                : "border border-zinc-200 text-zinc-600 hover:bg-zinc-50 dark:border-zinc-800 dark:text-zinc-400 dark:hover:bg-zinc-800"
            }`}
          >
            {s === "all" ? "All" : statusConfig[s].label} ({counts[s]})
          </button>
        ))}
      </div>

      {/* Content */}
      {viewMode === "table" ? (
        <div className="flex-1 overflow-auto">
          <table className="w-full">
            <thead className="sticky top-0 bg-zinc-50 text-left text-xs font-semibold uppercase tracking-wider text-zinc-500 dark:bg-zinc-900">
              <tr className="border-b border-zinc-200 dark:border-zinc-800">
                <th className="px-4 py-3">#</th>
                <SortTh label="Vehicle" field="vehicle" active={sortField} onSort={handleSort} />
                <th className="px-4 py-3">Driver</th>
                <th className="px-4 py-3">Group</th>
                <SortTh label="Time" field="time" active={sortField} onSort={handleSort} />
                <th className="px-4 py-3">Trip Type</th>
                <SortTh label="Status" field="status" active={sortField} onSort={handleSort} />
                <th className="px-4 py-3">Task</th>
                <th className="px-4 py-3">Task Ref</th>
                <th className="px-4 py-3">Origin</th>
                <th className="px-4 py-3">Destination</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800">
              {filtered.map((task, i) => {
                const { label, class: className } = statusConfig[task.status];
                const isSelected = selectedTask?.id === task.id;
                return (
                  <tr
                    key={task.id}
                    onClick={() => handleRowClick(task)}
                    onDoubleClick={() => handleRowDoubleClick(task)}
                    className={`cursor-pointer transition-colors hover:bg-zinc-50 dark:hover:bg-zinc-900 ${isSelected ? "bg-zinc-100 dark:bg-zinc-900" : ""}`}
                  >
                    <td className="px-4 py-3 text-sm text-zinc-500">{i + 1}</td>
                    <td className="px-4 py-3 font-semibold text-zinc-900 dark:text-white">{task.vehicle}</td>
                    <td className="px-4 py-3 text-sm text-zinc-600 dark:text-zinc-400">{task.driver}</td>
                    <td className="px-4 py-3 text-sm text-zinc-600 dark:text-zinc-400">{task.group}</td>
                    <td className="px-4 py-3 text-sm text-zinc-500">{task.time}</td>
                    <td className="px-4 py-3">
                      <span className={`badge ${tripTypeConfig[task.tripType]}`}>{task.tripType}</span>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`badge ${className}`}>{label}</span>
                    </td>
                    <td className="px-4 py-3 font-medium text-zinc-900 dark:text-white">{task.task}</td>
                    <td className="px-4 py-3 font-mono text-sm text-zinc-600 dark:text-zinc-400">{task.taskRef}</td>
                    <td className="px-4 py-3 text-sm text-zinc-600 dark:text-zinc-400">{task.origin}</td>
                    <td className="px-4 py-3 text-sm text-zinc-600 dark:text-zinc-400">{task.destination}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="grid flex-1 grid-cols-[380px_1fr]">
          {/* Task List */}
          <aside className="flex flex-col border-r border-zinc-200 dark:border-zinc-800">
            <div className="border-b border-zinc-200 p-4 dark:border-zinc-800">
              <p className="text-xs font-semibold uppercase tracking-wider text-zinc-500">
                Tasks ({filtered.length})
              </p>
            </div>
            <div className="flex-1 overflow-y-auto">
              {filtered.map((task) => {
                const { label, class: className } = statusConfig[task.status];
                const isSelected = selectedTask?.id === task.id;
                return (
                  <button
                    key={task.id}
                    onClick={() => setSelectedTask(task)}
                    className={`w-full border-b border-zinc-100 p-4 text-left transition-colors dark:border-zinc-800 ${
                      isSelected
                        ? "bg-zinc-900 text-white dark:bg-white dark:text-zinc-900"
                        : "hover:bg-zinc-50 dark:hover:bg-zinc-900"
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <p className={`font-semibold ${isSelected ? "" : "text-zinc-900 dark:text-white"}`}>
                        {task.vehicle}
                      </p>
                      <span className={`badge ${className}`}>{label}</span>
                    </div>
                    <p className={`mt-1 text-sm ${isSelected ? "text-white/70" : "text-zinc-500"}`}>
                      {task.task}
                    </p>
                    <div className={`mt-2 flex items-center gap-4 text-xs ${isSelected ? "text-white/60" : "text-zinc-400"}`}>
                      <span>{task.origin} → {task.destination}</span>
                    </div>
                  </button>
                );
              })}
            </div>
          </aside>

          {/* Map */}
          <main className="relative">
            <TaskRouteMap task={taskToRouteData(selectedTask || mockTasks[0])} />
          </main>
        </div>
      )}

      {/* Detail Panel */}
      {selectedTask && viewMode === "table" && (
        <div className="fixed right-0 top-0 z-50 h-full w-[420px] border-l border-zinc-200 bg-white shadow-xl dark:border-zinc-800 dark:bg-zinc-900">
          <div className="flex items-center justify-between border-b border-zinc-200 p-5 dark:border-zinc-800">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-zinc-500">Task Detail</p>
              <h2 className="mt-1 text-xl font-semibold text-zinc-900 dark:text-white">{selectedTask.task}</h2>
            </div>
            <button onClick={() => setSelectedTask(null)} className="rounded-lg p-2 text-zinc-500 hover:bg-zinc-100 dark:hover:bg-zinc-800">
              ✕
            </button>
          </div>
          <div className="p-5 space-y-5">
            <div className="grid grid-cols-2 gap-4">
              <InfoItem label="Vehicle" value={selectedTask.vehicle} />
              <InfoItem label="Driver" value={selectedTask.driver} />
              <InfoItem label="Group" value={selectedTask.group} />
              <InfoItem label="Trip Type" value={selectedTask.tripType} />
            </div>
            <div className="rounded-lg border border-zinc-200 p-4 dark:border-zinc-800">
              <p className="text-xs font-semibold uppercase tracking-wider text-zinc-500">Status</p>
              <div className="mt-2 flex items-center gap-3">
                <span className={`badge ${statusConfig[selectedTask.status].class}`}>
                  {statusConfig[selectedTask.status].label}
                </span>
                <span className="text-sm text-zinc-500">{selectedTask.time}</span>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <InfoItem label="Origin" value={selectedTask.origin} />
              <InfoItem label="Destination" value={selectedTask.destination} />
              <InfoItem label="Schedule" value={selectedTask.schedule} />
              <InfoItem label="Start At" value={selectedTask.startAt} />
            </div>
            <div className="grid grid-cols-3 gap-3">
              <div className="rounded-lg bg-zinc-50 p-3 text-center dark:bg-zinc-800">
                <p className="text-xl font-bold text-zinc-900 dark:text-white">{selectedTask.distance} km</p>
                <p className="text-xs text-zinc-500">Distance</p>
              </div>
              <div className="rounded-lg bg-zinc-50 p-3 text-center dark:bg-zinc-800">
                <p className="text-xl font-bold text-zinc-900 dark:text-white">{selectedTask.traveled} km</p>
                <p className="text-xs text-zinc-500">Traveled</p>
              </div>
              <div className="rounded-lg bg-zinc-50 p-3 text-center dark:bg-zinc-800">
                <p className="text-xl font-bold text-zinc-900 dark:text-white">{selectedTask.avgSpeed} km/h</p>
                <p className="text-xs text-zinc-500">Avg Speed</p>
              </div>
            </div>
            <div className="rounded-lg border border-zinc-200 p-4 dark:border-zinc-800">
              <p className="text-xs font-semibold uppercase tracking-wider text-zinc-500">ETA</p>
              <p className="mt-1 text-2xl font-bold text-zinc-900 dark:text-white">{selectedTask.eta}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function SortTh({
  label,
  field,
  active,
  onSort,
}: {
  label: string;
  field: SortField;
  active: SortField;
  onSort: (field: SortField) => void;
}) {
  return (
    <th className="px-4 py-3">
      <button
        onClick={() => onSort(field)}
        className={`inline-flex items-center gap-1.5 ${active === field ? "text-zinc-900 dark:text-white" : "text-zinc-500"}`}
      >
        {label}
        <ArrowDownUp className="h-3 w-3" />
      </button>
    </th>
  );
}

function InfoItem({ label, value }: { label: string; value: string }) {
  return (
    <div className="space-y-1">
      <p className="text-[10px] font-semibold uppercase tracking-wider text-zinc-500">{label}</p>
      <p className="font-medium text-zinc-900 dark:text-white">{value}</p>
    </div>
  );
}
