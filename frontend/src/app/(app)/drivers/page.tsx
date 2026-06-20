"use client";

import { useState, useMemo } from "react";
import {
  ArrowDownUp,
  CheckCircle,
  Filter,
  Plus,
  Search,
  Star,
  Users,
} from "lucide-react";
import { useToast } from "@/components/ui/Toast";

interface Driver {
  id: string;
  name: string;
  phone: string;
  license: string;
  status: "active" | "off-duty" | "on-leave";
  safetyScore: number;
  tripsToday: number;
  totalKm: number;
  experience: string;
  incidents: number;
  vehicle: string;
}

const mockDrivers: Driver[] = [
  { id: "D01", name: "Ahmad Sudirman", phone: "0812-3456-7890", license: "SIM B2", status: "active", safetyScore: 94, tripsToday: 2, totalKm: 45600, experience: "5 tahun", incidents: 0, vehicle: "B 1234 KJT" },
  { id: "D02", name: "Budi Santoso", phone: "0813-4567-8901", license: "SIM B2", status: "active", safetyScore: 88, tripsToday: 1, totalKm: 32800, experience: "3 tahun", incidents: 1, vehicle: "L 3456 ABC" },
  { id: "D03", name: "Cahyo Wibowo", phone: "0814-5678-9012", license: "SIM B2", status: "active", safetyScore: 72, tripsToday: 1, totalKm: 51200, experience: "7 tahun", incidents: 3, vehicle: "B 5678 TGP" },
  { id: "D04", name: "Dedi Kurniawan", phone: "0815-6789-0123", license: "SIM B2", status: "active", safetyScore: 96, tripsToday: 3, totalKm: 28900, experience: "2 tahun", incidents: 0, vehicle: "L 7890 DEF" },
  { id: "D05", name: "Eko Prasetyo", phone: "0816-7890-1234", license: "SIM B2", status: "off-duty", safetyScore: 91, tripsToday: 0, totalKm: 67300, experience: "8 tahun", incidents: 1, vehicle: "H 2345 GHI" },
  { id: "D06", name: "Fajar Ramadhan", phone: "0817-8901-2345", license: "SIM B2", status: "active", safetyScore: 85, tripsToday: 2, totalKm: 41500, experience: "4 tahun", incidents: 2, vehicle: "D 6789 JKL" },
  { id: "D07", name: "Gunawan Hadi", phone: "0818-9012-3456", license: "SIM B2", status: "on-leave", safetyScore: 90, tripsToday: 0, totalKm: 78200, experience: "10 tahun", incidents: 0, vehicle: "B 1357 MNO" },
  { id: "D08", name: "Hendra Wijaya", phone: "0819-0123-4567", license: "SIM B2", status: "active", safetyScore: 78, tripsToday: 1, totalKm: 23400, experience: "1 tahun", incidents: 2, vehicle: "B 2468 PQR" },
  { id: "D09", name: "Irfan Hakim", phone: "0811-1234-5678", license: "SIM B2", status: "active", safetyScore: 93, tripsToday: 2, totalKm: 39800, experience: "6 tahun", incidents: 0, vehicle: "L 1122 STU" },
  { id: "D10", name: "Joko Susilo", phone: "0822-2345-6789", license: "SIM B1", status: "active", safetyScore: 81, tripsToday: 1, totalKm: 18700, experience: "2 tahun", incidents: 1, vehicle: "B 3300 NOP" },
];

const statusConfig = {
  active: { label: "Aktif", class: "badge-success" },
  "off-duty": { label: "Off Duty", class: "badge-info" },
  "on-leave": { label: "Cuti", class: "badge-warning" },
};

type SortField = "name" | "safetyScore" | "tripsToday" | "totalKm";
type StatusFilter = "all" | "active" | "off-duty" | "on-leave";

export default function DriversPage() {
  const { addToast } = useToast();
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");
  const [sortField, setSortField] = useState<SortField>("name");
  const [sortDir, setSortDir] = useState<"asc" | "desc">("asc");
  const [selectedDriver, setSelectedDriver] = useState<Driver | null>(null);

  const filtered = useMemo(() => {
    let result = mockDrivers.filter((d) => {
      const matchSearch =
        !search ||
        d.name.toLowerCase().includes(search.toLowerCase()) ||
        d.license.toLowerCase().includes(search.toLowerCase()) ||
        d.vehicle.toLowerCase().includes(search.toLowerCase());
      const matchStatus = statusFilter === "all" || d.status === statusFilter;
      return matchSearch && matchStatus;
    });

    result.sort((a, b) => {
      let cmp = 0;
      if (sortField === "name") cmp = a.name.localeCompare(b.name);
      if (sortField === "safetyScore") cmp = a.safetyScore - b.safetyScore;
      if (sortField === "tripsToday") cmp = a.tripsToday - b.tripsToday;
      if (sortField === "totalKm") cmp = a.totalKm - b.totalKm;
      return sortDir === "asc" ? cmp : -cmp;
    });

    return result;
  }, [search, statusFilter, sortField, sortDir]);

  const avgSafety = (mockDrivers.reduce((s, d) => s + d.safetyScore, 0) / mockDrivers.length).toFixed(1);
  const activeCount = mockDrivers.filter((d) => d.status === "active").length;
  const totalIncidents = mockDrivers.reduce((s, d) => s + d.incidents, 0);

  const counts = {
    all: mockDrivers.length,
    active: mockDrivers.filter((d) => d.status === "active").length,
    "off-duty": mockDrivers.filter((d) => d.status === "off-duty").length,
    "on-leave": mockDrivers.filter((d) => d.status === "on-leave").length,
  };

  function handleSort(field: SortField) {
    if (field === sortField) {
      setSortDir((prev) => (prev === "asc" ? "desc" : "asc"));
    } else {
      setSortField(field);
      setSortDir("asc");
    }
  }

  function handleAddDriver() {
    addToast("info", "Add driver form would open here");
  }

  return (
    <div className="min-h-full bg-zinc-50 dark:bg-zinc-950">
      {/* Header */}
      <header className="border-b border-zinc-200 bg-white px-8 py-6 dark:border-zinc-800 dark:bg-zinc-900">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-sm font-medium text-zinc-500">Driver Management</p>
            <h1 className="mt-1 text-2xl font-bold text-zinc-900 dark:text-white">
              Driver Registry
            </h1>
            <p className="mt-1 text-sm text-zinc-500">
              Kelola data supir, safety score, dan performa harian
            </p>
          </div>
          <button onClick={handleAddDriver} className="btn btn-primary">
            <Plus className="h-4 w-4" />
            Add Driver
          </button>
        </div>
      </header>

      <div className="p-8">
        {/* Stats */}
        <div className="mb-6 grid grid-cols-2 gap-4 lg:grid-cols-4">
          <StatCard label="Total Supir" value={mockDrivers.length} icon={Users} />
          <StatCard label="Aktif" value={activeCount} icon={CheckCircle} color="text-emerald-600" />
          <StatCard label="Avg Safety" value={Number(avgSafety)} icon={Star} />
          <StatCard label="Total Insiden" value={totalIncidents} icon={Filter} color={totalIncidents > 0 ? "text-red-600" : ""} />
        </div>

        {/* Filters */}
        <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
          <div className="flex gap-2">
            {(["all", "active", "off-duty", "on-leave"] as const).map((s) => (
              <button
                key={s}
                onClick={() => setStatusFilter(s)}
                className={`rounded-full px-4 py-1.5 text-sm font-medium transition-colors ${
                  statusFilter === s
                    ? "bg-zinc-900 text-white dark:bg-white dark:text-zinc-900"
                    : "border border-zinc-200 text-zinc-600 hover:bg-zinc-50 dark:border-zinc-800 dark:text-zinc-400 dark:hover:bg-zinc-800"
                }`}
              >
                {s === "all" ? "Semua" : statusConfig[s].label} ({counts[s]})
              </button>
            ))}
          </div>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Cari nama, SIM, kendaraan..."
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
                  <th className="px-4 py-3">ID</th>
                  <SortTh label="Name" field="name" active={sortField} onSort={handleSort} />
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3">Vehicle</th>
                  <SortTh label="Safety" field="safetyScore" active={sortField} onSort={handleSort} align="right" />
                  <th className="px-4 py-3">Phone</th>
                  <th className="px-4 py-3">License</th>
                  <th className="px-4 py-3">Experience</th>
                  <SortTh label="Trips" field="tripsToday" active={sortField} onSort={handleSort} align="right" />
                  <SortTh label="Total KM" field="totalKm" active={sortField} onSort={handleSort} align="right" />
                  <th className="px-4 py-3 text-right">Insiden</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800">
                {filtered.map((driver) => {
                  const { label, class: className } = statusConfig[driver.status];
                  const isSelected = selectedDriver?.id === driver.id;
                  return (
                    <tr
                      key={driver.id}
                      onClick={() => setSelectedDriver(isSelected ? null : driver)}
                      className={`cursor-pointer transition-colors hover:bg-zinc-50 dark:hover:bg-zinc-900 ${isSelected ? "bg-zinc-100 dark:bg-zinc-900" : ""}`}
                    >
                      <td className="px-4 py-3 font-mono text-sm text-zinc-500">{driver.id}</td>
                      <td className="px-4 py-3 font-semibold text-zinc-900 dark:text-white">{driver.name}</td>
                      <td className="px-4 py-3">
                        <span className={`badge ${className}`}>{label}</span>
                      </td>
                      <td className="px-4 py-3 text-sm text-zinc-600 dark:text-zinc-400">{driver.vehicle || "—"}</td>
                      <td className="px-4 py-3 text-right">
                        <span className={`font-bold ${
                          driver.safetyScore >= 90 ? "text-emerald-600" :
                          driver.safetyScore >= 75 ? "text-amber-600" : "text-red-600"
                        }`}>
                          {driver.safetyScore}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-sm text-zinc-600 dark:text-zinc-400">{driver.phone}</td>
                      <td className="px-4 py-3 text-sm text-zinc-600 dark:text-zinc-400">{driver.license}</td>
                      <td className="px-4 py-3 text-sm text-zinc-600 dark:text-zinc-400">{driver.experience}</td>
                      <td className="px-4 py-3 text-right font-mono text-sm text-zinc-700 dark:text-zinc-300">{driver.tripsToday}</td>
                      <td className="px-4 py-3 text-right font-mono text-sm text-zinc-700 dark:text-zinc-300">{(driver.totalKm / 1000).toFixed(0)}k</td>
                      <td className="px-4 py-3 text-right">
                        <span className={`font-bold ${driver.incidents > 0 ? "text-red-600" : "text-emerald-600"}`}>
                          {driver.incidents}
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

      {/* Detail Panel */}
      {selectedDriver && (
        <div className="fixed right-0 top-0 z-50 h-full w-[400px] border-l border-zinc-200 bg-white shadow-xl dark:border-zinc-800 dark:bg-zinc-900">
          <div className="flex items-center justify-between border-b border-zinc-200 p-5 dark:border-zinc-800">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-zinc-500">Driver Detail</p>
              <h2 className="mt-1 text-xl font-semibold text-zinc-900 dark:text-white">{selectedDriver.name}</h2>
            </div>
            <button onClick={() => setSelectedDriver(null)} className="rounded-lg p-2 text-zinc-500 hover:bg-zinc-100 dark:hover:bg-zinc-800">
              ✕
            </button>
          </div>
          <div className="p-5 space-y-5">
            <div className="grid grid-cols-2 gap-4">
              <InfoItem label="ID" value={selectedDriver.id} />
              <InfoItem label="Status" value={statusConfig[selectedDriver.status].label} />
              <InfoItem label="Phone" value={selectedDriver.phone} />
              <InfoItem label="License" value={selectedDriver.license} />
              <InfoItem label="Vehicle" value={selectedDriver.vehicle || "—"} />
              <InfoItem label="Experience" value={selectedDriver.experience} />
            </div>
            <div className="rounded-lg border border-zinc-200 p-4 dark:border-zinc-800">
              <p className="text-xs font-semibold uppercase tracking-wider text-zinc-500">Safety Score</p>
              <div className="mt-2 flex items-end gap-3">
                <span className={`text-3xl font-bold ${
                  selectedDriver.safetyScore >= 90 ? "text-emerald-600" :
                  selectedDriver.safetyScore >= 75 ? "text-amber-600" : "text-red-600"
                }`}>
                  {selectedDriver.safetyScore}
                </span>
                <span className="text-sm text-zinc-500">/ 100</span>
              </div>
              <div className="mt-3 h-2 rounded-full bg-zinc-100 dark:bg-zinc-800 overflow-hidden">
                <div
                  className={`h-full rounded-full ${
                    selectedDriver.safetyScore >= 90 ? "bg-emerald-500" :
                    selectedDriver.safetyScore >= 75 ? "bg-amber-500" : "bg-red-500"
                  }`}
                  style={{ width: `${selectedDriver.safetyScore}%` }}
                />
              </div>
            </div>
            <div className="grid grid-cols-3 gap-3">
              <div className="rounded-lg bg-zinc-50 p-3 text-center dark:bg-zinc-800">
                <p className="text-xl font-bold text-zinc-900 dark:text-white">{selectedDriver.tripsToday}</p>
                <p className="text-xs text-zinc-500">Trip Hari Ini</p>
              </div>
              <div className="rounded-lg bg-zinc-50 p-3 text-center dark:bg-zinc-800">
                <p className="text-xl font-bold text-zinc-900 dark:text-white">{(selectedDriver.totalKm / 1000).toFixed(0)}k</p>
                <p className="text-xs text-zinc-500">Total KM</p>
              </div>
              <div className="rounded-lg bg-zinc-50 p-3 text-center dark:bg-zinc-800">
                <p className={`text-xl font-bold ${selectedDriver.incidents > 0 ? "text-red-600" : "text-emerald-600"}`}>
                  {selectedDriver.incidents}
                </p>
                <p className="text-xs text-zinc-500">Insiden</p>
              </div>
            </div>
          </div>
        </div>
      )}
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
        <span className="text-xs font-medium uppercase tracking-wider text-zinc-500">{label}</span>
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

function InfoItem({ label, value }: { label: string; value: string }) {
  return (
    <div className="space-y-1">
      <p className="text-[10px] font-semibold uppercase tracking-wider text-zinc-500">{label}</p>
      <p className="font-medium text-zinc-900 dark:text-white">{value}</p>
    </div>
  );
}
