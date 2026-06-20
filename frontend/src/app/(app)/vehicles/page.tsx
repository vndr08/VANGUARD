"use client";

import { useEffect, useMemo, useState } from "react";
import {
  ArrowDownUp,
  Calendar,
  Download,
  Filter,
  Plus,
  Search,
  Truck,
  Wrench,
} from "lucide-react";
import { MOCK_VEHICLES } from "@/lib/mock-data";
import type { Vehicle } from "@/types";
import { useToast } from "@/components/ui/Toast";

type RegistryRow = Vehicle & {
  deviceId: string;
  simNumber: string;
  vendor: string;
  ownership: "Company" | "Vendor";
  kirDue: string;
  serviceDueKm: number;
  deviceHealth: "online" | "delayed" | "offline";
};

type SortField = "plate_number" | "year" | "odometer";
type FilterKey = "all" | "company" | "vendor" | "attention";

const vendors = ["VISI Logistic", "Tramos GPS", "AIN Telematics", "Internal Pool"];

function addRegistryData(vehicle: Vehicle): RegistryRow {
  const days = 18 + ((vehicle.id * 13) % 180);
  const kirDue = new Date(Date.now() + days * 24 * 60 * 60 * 1000).toISOString();
  const minutesSinceUpdate = vehicle.last_update
    ? Math.floor((Date.now() - new Date(vehicle.last_update).getTime()) / 60000)
    : 9999;

  return {
    ...vehicle,
    deviceId: `VG-${String(vehicle.id).padStart(4, "0")}`,
    simNumber: `8981-${String(220000000 + vehicle.id * 7731).slice(0, 9)}`,
    vendor: vendors[vehicle.id % vendors.length],
    ownership: vehicle.id % 4 === 0 ? "Vendor" : "Company",
    kirDue,
    serviceDueKm: Math.max(750, Math.round(5000 - (vehicle.odometer % 5000))),
    deviceHealth:
      vehicle.status === "offline" ? "offline" : minutesSinceUpdate > 30 ? "delayed" : "online",
  };
}

function dueLabel(iso: string) {
  const days = Math.ceil((new Date(iso).getTime() - Date.now()) / (24 * 60 * 60 * 1000));
  if (days <= 0) return "Expired";
  if (days < 30) return `${days} days`;
  return new Date(iso).toLocaleDateString("id-ID", { day: "2-digit", month: "short", year: "numeric" });
}

export default function VehiclesPage() {
  const { addToast } = useToast();
  const [vehicles] = useState<Vehicle[]>(MOCK_VEHICLES);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<FilterKey>("all");
  const [sortField, setSortField] = useState<SortField>("plate_number");
  const [sortDir, setSortDir] = useState<"asc" | "desc">("asc");

  const rows = useMemo(() => vehicles.map(addRegistryData), [vehicles]);

  const counts = useMemo(() => {
    const attention = rows.filter(
      (v) =>
        v.deviceHealth !== "online" ||
        v.serviceDueKm < 1200 ||
        new Date(v.kirDue).getTime() - Date.now() < 30 * 24 * 60 * 60 * 1000
    ).length;

    return {
      total: rows.length,
      company: rows.filter((v) => v.ownership === "Company").length,
      vendor: rows.filter((v) => v.ownership === "Vendor").length,
      attention,
      gpsOnline: rows.filter((v) => v.deviceHealth === "online").length,
    };
  }, [rows]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    const result = rows.filter((v) => {
      const matchSearch =
        !q ||
        v.plate_number.toLowerCase().includes(q) ||
        v.driver_name?.toLowerCase().includes(q) ||
        v.brand.toLowerCase().includes(q) ||
        v.deviceId.toLowerCase().includes(q);

      const needsAttention =
        v.deviceHealth !== "online" ||
        v.serviceDueKm < 1200 ||
        new Date(v.kirDue).getTime() - Date.now() < 30 * 24 * 60 * 60 * 1000;

      const matchFilter =
        filter === "all" ||
        (filter === "company" && v.ownership === "Company") ||
        (filter === "vendor" && v.ownership === "Vendor") ||
        (filter === "attention" && needsAttention);

      return matchSearch && matchFilter;
    });

    result.sort((a, b) => {
      let cmp = 0;
      if (sortField === "plate_number") cmp = a.plate_number.localeCompare(b.plate_number);
      if (sortField === "year") cmp = a.year - b.year;
      if (sortField === "odometer") cmp = a.odometer - b.odometer;
      return sortDir === "asc" ? cmp : -cmp;
    });

    return result;
  }, [rows, search, filter, sortField, sortDir]);

  function handleSort(field: SortField) {
    if (field === sortField) {
      setSortDir((prev) => (prev === "asc" ? "desc" : "asc"));
    } else {
      setSortField(field);
      setSortDir("asc");
    }
  }

  function handleExport() {
    addToast("info", "Exporting vehicle registry...");
  }

  function handleAdd() {
    addToast("info", "Add vehicle form would open here");
  }

  return (
    <div className="min-h-full bg-zinc-50 dark:bg-zinc-950">
      {/* Header */}
      <header className="border-b border-zinc-200 bg-white px-8 py-6 dark:border-zinc-800 dark:bg-zinc-900">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-sm font-medium text-zinc-500">Asset Management</p>
            <h1 className="mt-1 text-2xl font-bold text-zinc-900 dark:text-white">
              Vehicle Registry
            </h1>
            <p className="mt-1 text-sm text-zinc-500">
              Master data kendaraan, GPS device, dan dokumentasi
            </p>
          </div>
          <div className="flex gap-3">
            <button onClick={handleExport} className="btn btn-secondary">
              <Download className="h-4 w-4" />
              Export
            </button>
            <button onClick={handleAdd} className="btn btn-primary">
              <Plus className="h-4 w-4" />
              Add Vehicle
            </button>
          </div>
        </div>
      </header>

      <div className="p-8">
        {/* Stats */}
        <div className="mb-6 grid grid-cols-2 gap-4 lg:grid-cols-4">
          <StatCard label="Total Assets" value={counts.total} icon={Truck} />
          <StatCard label="GPS Online" value={counts.gpsOnline} icon={Wrench} color="text-emerald-600" />
          <StatCard label="Company" value={counts.company} icon={Filter} />
          <StatCard label="Needs Check" value={counts.attention} icon={Calendar} color={counts.attention > 0 ? "text-red-600" : ""} />
        </div>

        {/* Filters */}
        <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
          <div className="flex gap-2">
            {[
              { key: "all", label: "All", value: counts.total },
              { key: "company", label: "Company", value: counts.company },
              { key: "vendor", label: "Vendor", value: counts.vendor },
              { key: "attention", label: "Needs Check", value: counts.attention },
            ].map((item) => (
              <button
                key={item.key}
                onClick={() => setFilter(item.key as FilterKey)}
                className={`rounded-full px-4 py-1.5 text-sm font-medium transition-colors ${
                  filter === item.key
                    ? "bg-zinc-900 text-white dark:bg-white dark:text-zinc-900"
                    : "border border-zinc-200 text-zinc-600 hover:bg-zinc-50 dark:border-zinc-800 dark:text-zinc-400 dark:hover:bg-zinc-800"
                }`}
              >
                {item.label} ({item.value})
              </button>
            ))}
          </div>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-400" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search plate, GPS ID, driver..."
              className="w-72 rounded-lg border border-zinc-200 bg-white py-2 pl-10 pr-4 text-sm dark:border-zinc-800 dark:bg-zinc-900 dark:text-white"
            />
          </div>
        </div>

        {/* Table */}
        <div className="card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-zinc-50 text-left text-xs font-semibold uppercase tracking-wider text-zinc-500 dark:bg-zinc-900">
                <tr className="border-b border-zinc-200 dark:border-zinc-800">
                  <SortTh label="Unit" field="plate_number" active={sortField} onSort={handleSort} />
                  <th className="px-4 py-3">GPS Device</th>
                  <th className="px-4 py-3">Assignment</th>
                  <th className="px-4 py-3">Ownership</th>
                  <SortTh label="Year" field="year" active={sortField} onSort={handleSort} />
                  <SortTh label="Odometer" field="odometer" active={sortField} onSort={handleSort} align="right" />
                  <th className="px-4 py-3">KIR Due</th>
                  <th className="px-4 py-3 text-right">Service Due</th>
                  <th className="px-4 py-3">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800">
                {filtered.map((v) => {
                  const kirSoon = new Date(v.kirDue).getTime() - Date.now() < 30 * 24 * 60 * 60 * 1000;
                  const serviceSoon = v.serviceDueKm < 1200;
                  return (
                    <tr key={v.id} className="transition-colors hover:bg-zinc-50 dark:hover:bg-zinc-900">
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-zinc-100 dark:bg-zinc-800">
                            <Truck className="h-5 w-5 text-zinc-500" />
                          </div>
                          <div>
                            <p className="font-semibold text-zinc-900 dark:text-white">
                              {v.plate_number}
                            </p>
                            <p className="text-sm text-zinc-500">{v.brand} {v.model}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <p className="font-medium text-zinc-700 dark:text-zinc-300">{v.deviceId}</p>
                        <p className="text-xs text-zinc-500">{v.simNumber}</p>
                      </td>
                      <td className="px-4 py-3 text-sm text-zinc-600 dark:text-zinc-400">
                        {v.driver_name || "—"}
                      </td>
                      <td className="px-4 py-3">
                        <span className="badge badge-neutral">{v.ownership}</span>
                        <p className="mt-1 text-xs text-zinc-500">{v.vendor}</p>
                      </td>
                      <td className="px-4 py-3 font-mono text-sm text-zinc-700 dark:text-zinc-300">
                        {v.year}
                      </td>
                      <td className="px-4 py-3 text-right font-mono text-sm text-zinc-700 dark:text-zinc-300">
                        {Math.round(v.odometer).toLocaleString("id-ID")} km
                      </td>
                      <td className="px-4 py-3">
                        <span className={`badge ${kirSoon ? "badge-warning" : "badge-neutral"}`}>
                          <Calendar className="h-3 w-3" />
                          {dueLabel(v.kirDue)}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-right">
                        <span className={`badge ${serviceSoon ? "badge-danger" : "badge-neutral"}`}>
                          <Wrench className="h-3 w-3" />
                          {v.serviceDueKm.toLocaleString("id-ID")} km
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <span className={`badge ${
                          v.deviceHealth === "online" ? "badge-success" :
                          v.deviceHealth === "delayed" ? "badge-warning" : "badge-danger"
                        }`}>
                          {v.deviceHealth}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}

function StatCard({
  label,
  value,
  icon: Icon,
  color = "text-zinc-900",
}: {
  label: string;
  value: number;
  icon: any;
  color?: string;
}) {
  return (
    <div className="card p-5">
      <div className="flex items-center justify-between">
        <span className="text-xs font-medium uppercase tracking-wider text-zinc-500">
          {label}
        </span>
        <Icon className="h-5 w-5 text-zinc-400" />
      </div>
      <p className={`mt-2 text-3xl font-bold ${color} dark:text-white`}>{value}</p>
    </div>
  );
}

function SortTh({
  label,
  field,
  active,
  onSort,
  align = "left",
}: {
  label: string;
  field: SortField;
  active: SortField;
  onSort: (field: SortField) => void;
  align?: "left" | "right";
}) {
  return (
    <th className={`px-4 py-3 ${align === "right" ? "text-right" : "text-left"}`}>
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
