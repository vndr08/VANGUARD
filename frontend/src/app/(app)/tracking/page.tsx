"use client";

import dynamic from "next/dynamic";
import { useEffect, useMemo, useState } from "react";
import {
  Filter,
  Fuel,
  Layers,
  Map,
  Navigation,
  RefreshCw,
  Search,
  Table,
  Wifi,
} from "lucide-react";
import { MOCK_VEHICLES } from "@/lib/mock-data";
import type { Vehicle } from "@/types";
import { useToast } from "@/components/ui/Toast";

const TrackingMap = dynamic(() => import("@/components/map/TrackingMap"), {
  ssr: false,
  loading: () => (
    <div className="flex h-full w-full items-center justify-center bg-zinc-100 text-sm font-medium text-zinc-500">
      Loading map...
    </div>
  ),
});

const statusConfig = {
  driving: { label: "Driving", color: "bg-emerald-500", text: "text-emerald-600" },
  idle: { label: "Idle", color: "bg-amber-500", text: "text-amber-600" },
  stopped: { label: "Parking", color: "bg-zinc-400", text: "text-zinc-500" },
  offline: { label: "Offline", color: "bg-red-500", text: "text-red-600" },
};

type FilterStatus = "all" | "driving" | "idle" | "stopped" | "offline";

function timeAgo(iso?: string) {
  if (!iso) return "No data";
  const diff = Math.max(0, Math.floor((Date.now() - new Date(iso).getTime()) / 60000));
  if (diff < 1) return "Just now";
  if (diff < 60) return `${diff}m ago`;
  if (diff < 1440) return `${Math.floor(diff / 60)}h ago`;
  return `${Math.floor(diff / 1440)}d ago`;
}

export default function TrackingPage() {
  const { addToast } = useToast();
  const [vehicles, setVehicles] = useState<Vehicle[]>(MOCK_VEHICLES);
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<FilterStatus>("all");
  const [viewMode, setViewMode] = useState<"map" | "table">("map");
  const [lastRefresh, setLastRefresh] = useState(new Date());

  useEffect(() => {
    fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000"}/api/vehicles`)
      .then((r) => (r.ok ? r.json() : null))
      .then((data) => Array.isArray(data) && data.length > 0 && setVehicles(data))
      .catch(() => {});
  }, []);

  const filteredVehicles = useMemo(() => {
    const q = search.trim().toLowerCase();
    return vehicles.filter((v) => {
      const matchesFilter = filter === "all" || v.status === filter;
      const matchesSearch =
        !q ||
        v.plate_number.toLowerCase().includes(q) ||
        v.driver_name?.toLowerCase().includes(q);
      return matchesFilter && matchesSearch;
    });
  }, [vehicles, filter, search]);

  const selected = vehicles.find((v) => v.id === selectedId);

  const counts = useMemo(() => {
    const c = { all: vehicles.length, driving: 0, idle: 0, stopped: 0, offline: 0 };
    vehicles.forEach((v) => {
      c[v.status as keyof typeof c]++;
    });
    return c;
  }, [vehicles]);

  function handleRefresh() {
    setLastRefresh(new Date());
    addToast("info", "Data refreshed");
  }

  return (
    <div className="flex h-[calc(100vh-4rem)] flex-col">
      {/* Toolbar */}
      <div className="flex items-center justify-between border-b border-zinc-200 bg-white px-6 py-4 dark:border-zinc-800 dark:bg-zinc-900">
        <div className="flex items-center gap-4">
          <h1 className="text-lg font-semibold text-zinc-900 dark:text-white">
            Realtime Monitor
          </h1>
          <span className="text-sm text-zinc-500">
            {counts.all} units · {counts.driving} driving
          </span>
        </div>

        <div className="flex items-center gap-3">
          {/* View Toggle */}
          <div className="flex rounded-lg border border-zinc-200 dark:border-zinc-800">
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
          </div>

          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-400" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search unit or driver..."
              className="w-64 rounded-lg border border-zinc-200 bg-white py-2 pl-10 pr-4 text-sm dark:border-zinc-800 dark:bg-zinc-800 dark:text-white"
            />
          </div>

          {/* Refresh */}
          <button
            onClick={handleRefresh}
            className="btn btn-secondary"
          >
            <RefreshCw className="h-4 w-4" />
            <span className="text-xs">{lastRefresh.toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" })}</span>
          </button>
        </div>
      </div>

      {/* Filter Pills */}
      <div className="flex items-center gap-2 border-b border-zinc-200 bg-white px-6 py-3 dark:border-zinc-800 dark:bg-zinc-900">
        <Filter className="h-4 w-4 text-zinc-400" />
        {(["all", "driving", "idle", "stopped", "offline"] as const).map((key) => (
          <button
            key={key}
            onClick={() => setFilter(key)}
            className={`rounded-full px-4 py-1.5 text-xs font-semibold transition-colors ${
              filter === key
                ? "bg-zinc-900 text-white dark:bg-white dark:text-zinc-900"
                : "border border-zinc-200 text-zinc-600 hover:bg-zinc-50 dark:border-zinc-800 dark:text-zinc-400 dark:hover:bg-zinc-800"
            }`}
          >
            {key === "all" ? "All" : statusConfig[key].label} ({counts[key]})
          </button>
        ))}
      </div>

      {/* Content */}
      {viewMode === "table" ? (
        <div className="flex-1 overflow-auto">
          <table className="w-full">
            <thead className="sticky top-0 bg-zinc-50 text-left text-xs font-semibold uppercase tracking-wider text-zinc-500 dark:bg-zinc-900">
              <tr className="border-b border-zinc-200 dark:border-zinc-800">
                <th className="px-6 py-3">Unit</th>
                <th className="px-6 py-3">Driver</th>
                <th className="px-6 py-3">Vehicle</th>
                <th className="px-6 py-3 text-right">Speed</th>
                <th className="px-6 py-3 text-right">Fuel</th>
                <th className="px-6 py-3">Status</th>
                <th className="px-6 py-3">Last Update</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800">
              {filteredVehicles.map((v) => {
                const cfg = statusConfig[v.status];
                return (
                  <tr
                    key={v.id}
                    onClick={() => setSelectedId(v.id)}
                    className="cursor-pointer transition-colors hover:bg-zinc-50 dark:hover:bg-zinc-900"
                  >
                    <td className="px-6 py-4">
                      <p className="font-semibold text-zinc-900 dark:text-white">
                        {v.plate_number}
                      </p>
                    </td>
                    <td className="px-6 py-4 text-sm text-zinc-600 dark:text-zinc-400">
                      {v.driver_name || "—"}
                    </td>
                    <td className="px-6 py-4 text-sm text-zinc-600 dark:text-zinc-400">
                      {v.brand} {v.model}
                    </td>
                    <td className="px-6 py-4 text-right font-mono text-sm font-semibold text-zinc-900 dark:text-white">
                      {v.speed} km/h
                    </td>
                    <td className="px-6 py-4 text-right font-mono text-sm text-zinc-600 dark:text-zinc-400">
                      {v.fuel_level}%
                    </td>
                    <td className="px-6 py-4">
                      <span className={`badge ${v.status === "driving" ? "badge-success" : v.status === "idle" ? "badge-warning" : v.status === "offline" ? "badge-danger" : "badge-neutral"}`}>
                        {cfg.label}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-zinc-500">
                      {timeAgo(v.last_update)}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="grid flex-1 grid-cols-[300px_1fr]">
          {/* Vehicle List */}
          <aside className="flex flex-col border-r border-zinc-200 dark:border-zinc-800">
            <div className="border-b border-zinc-200 p-4 dark:border-zinc-800">
              <p className="text-xs font-semibold uppercase tracking-wider text-zinc-500">
                Vehicles ({filteredVehicles.length})
              </p>
            </div>
            <div className="flex-1 overflow-y-auto">
              {filteredVehicles.map((v) => {
                const cfg = statusConfig[v.status];
                const isSelected = selectedId === v.id;
                return (
                  <button
                    key={v.id}
                    onClick={() => setSelectedId(v.id)}
                    className={`w-full border-b border-zinc-100 p-4 text-left transition-colors dark:border-zinc-800 ${
                      isSelected
                        ? "bg-zinc-900 text-white dark:bg-white dark:text-zinc-900"
                        : "hover:bg-zinc-50 dark:hover:bg-zinc-900"
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <p className={`font-semibold ${isSelected ? "" : "text-zinc-900 dark:text-white"}`}>
                        {v.plate_number}
                      </p>
                      <span className={`badge ${v.status === "driving" ? "badge-success" : v.status === "idle" ? "badge-warning" : v.status === "offline" ? "badge-danger" : "badge-neutral"}`}>
                        {cfg.label}
                      </span>
                    </div>
                    <p className={`mt-1 text-sm ${isSelected ? "text-white/70" : "text-zinc-500"}`}>
                      {v.driver_name || "No driver"}
                    </p>
                    <div className={`mt-2 flex gap-4 text-xs ${isSelected ? "text-white/60" : "text-zinc-400"}`}>
                      <span className="flex items-center gap-1">
                        <Navigation className="h-3 w-3" /> {v.speed} km/h
                      </span>
                      <span className="flex items-center gap-1">
                        <Fuel className="h-3 w-3" /> {v.fuel_level}%
                      </span>
                    </div>
                  </button>
                );
              })}
            </div>
          </aside>

          {/* Map */}
          <main className="relative">
            <TrackingMap
              vehicles={filteredVehicles}
              selectedId={selectedId}
              onSelectVehicle={setSelectedId}
            />

            {/* Map Info */}
            <div className="absolute left-4 top-4 rounded-lg border border-zinc-200 bg-white/95 px-4 py-3 shadow-sm backdrop-blur dark:border-zinc-800 dark:bg-zinc-900/95">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-zinc-900 dark:bg-white">
                  <Map className="h-5 w-5 text-white dark:text-zinc-900" />
                </div>
                <div>
                  <p className="font-semibold text-zinc-900 dark:text-white">
                    Live Map
                  </p>
                  <p className="text-xs text-zinc-500">
                    {counts.driving} driving · {counts.idle} idle · {counts.offline} offline
                  </p>
                </div>
              </div>
            </div>

            {/* Selected Vehicle Info */}
            {selected && (
              <div className="absolute bottom-4 left-4 right-4 rounded-lg border border-zinc-200 bg-white p-4 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-lg font-semibold text-zinc-900 dark:text-white">
                      {selected.plate_number}
                    </p>
                    <p className="text-sm text-zinc-500">
                      {selected.brand} {selected.model} · {selected.driver_name || "No driver"}
                    </p>
                  </div>
                  <span className={`badge ${selected.status === "driving" ? "badge-success" : selected.status === "idle" ? "badge-warning" : selected.status === "offline" ? "badge-danger" : "badge-neutral"}`}>
                    {statusConfig[selected.status].label}
                  </span>
                </div>
                <div className="mt-4 grid grid-cols-4 gap-4">
                  <InfoBox label="Speed" value={`${selected.speed} km/h`} />
                  <InfoBox label="Fuel" value={`${selected.fuel_level}%`} />
                  <InfoBox label="Heading" value={`${Math.round(selected.heading)}°`} />
                  <InfoBox label="Last Update" value={timeAgo(selected.last_update)} />
                </div>
              </div>
            )}
          </main>
        </div>
      )}
    </div>
  );
}

function InfoBox({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg bg-zinc-50 p-3 dark:bg-zinc-800">
      <p className="text-xs font-medium uppercase tracking-wider text-zinc-500">
        {label}
      </p>
      <p className="mt-1 font-semibold text-zinc-900 dark:text-white">{value}</p>
    </div>
  );
}
