"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import {
  Download,
  Search,
  Truck,
  X,
} from "lucide-react";
import { useAppContext } from "@/components/context/AppContext";
import { StatusPill } from "@/components/ui/Badge";
import {
  TableContainer,
  TableHead,
  TableHeadCell,
  TableBody,
  TableRow,
  TableCell,
  PlateCell,
  StatusCell,
} from "@/components/ui/Table";
import { Button } from "@/components/ui/Button";
import { Card, EmptyState } from "@/components/ui/Card";
import { downloadCsv } from "@/lib/csv";

/* ─── Types ─────────────────────────────────────────────────────────────────── */

type VehicleStatus = "driving" | "idle" | "stopped" | "offline";

type SortField = "plate_number" | "brand" | "status" | "odometer";
type SortDir = "asc" | "desc" | "none";

type FilterStatus = "all" | VehicleStatus;
type FilterType = "all" | "truck" | "van" | "pickup" | "trailer";

/** Map API Vehicle.status → Badge VehicleStatus */
function toBadgeStatus(s: VehicleStatus): "driving" | "idle" | "stop" | "offline" {
  return s === "stopped" ? "stop" : (s as "driving" | "idle" | "offline");
}

function formatVehicleType(type: FilterType): string {
  const labels: Record<FilterType, string> = {
    all: "Semua tipe",
    truck: "Truk",
    van: "Van",
    pickup: "Pickup",
    trailer: "Trailer",
  };
  return labels[type];
}

/* ─── Fuel Mini Bar ─────────────────────────────────────────────────────────── */

function FuelMiniBar({ level }: { level: number }) {
  const color =
    level > 60 ? "bg-st-driving" :
    level > 25 ? "bg-st-idle" :
    "bg-st-offline";
  return (
    <div className="flex items-center gap-2">
      <div className="w-12 h-1.5 rounded-full bg-surface-3 overflow-hidden">
        <div
          className={`h-full rounded-full ${color} transition-all`}
          style={{ width: `${Math.min(100, Math.max(0, level))}%` }}
        />
      </div>
      <span className="text-xs tabular-nums text-muted w-8 text-right">
        {Math.round(level)}%
      </span>
    </div>
  );
}

/* ─── Main Page ─────────────────────────────────────────────────────────────── */

export default function VehiclesPage() {
  const { vehicles: contextVehicles } = useAppContext();
  const vehicles = contextVehicles;

  // UI state
  const [search, setSearch] = useState("");
  const [searchOpen, setSearchOpen] = useState(false);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const [filterStatus, setFilterStatus] = useState<FilterStatus>("all");
  const [filterType, setFilterType] = useState<FilterType>("all");
  const [sortField, setSortField] = useState<SortField>("plate_number");
  const [sortDir, setSortDir] = useState<SortDir>("asc");

  useEffect(() => {
    if (searchOpen) searchInputRef.current?.focus();
  }, [searchOpen]);


  // ─── KPI counts
  const counts = useMemo(() => ({
    total: vehicles.length,
    aktif: vehicles.filter((v) => v.status === "driving" || v.status === "idle").length,
    maintenance: vehicles.filter((v) => v.status === "stopped").length,
    offline: vehicles.filter((v) => v.status === "offline").length,
  }), [vehicles]);

  // ─── Filtered & sorted rows
  const rows = useMemo(() => {
    const q = search.trim().toLowerCase();
    return vehicles.filter((v) => {
      if (q && !v.plate_number.toLowerCase().includes(q)
        && !v.brand.toLowerCase().includes(q)
        && !v.model.toLowerCase().includes(q)
        && !(v.driver_name ?? "").toLowerCase().includes(q)) return false;
      if (filterStatus !== "all" && v.status !== filterStatus) return false;
      if (filterType !== "all" && v.vehicle_type !== filterType) return false;
      return true;
    });
  }, [vehicles, search, filterStatus, filterType]);

  const sorted = useMemo(() => {
    const arr = [...rows];
    if (sortDir === "none") return arr;
    arr.sort((a, b) => {
      let cmp = 0;
      if (sortField === "plate_number") cmp = a.plate_number.localeCompare(b.plate_number);
      if (sortField === "brand") cmp = a.brand.localeCompare(b.brand);
      if (sortField === "status") cmp = a.status.localeCompare(b.status);
      if (sortField === "odometer") cmp = a.odometer - b.odometer;
      return sortDir === "asc" ? cmp : -cmp;
    });
    return arr;
  }, [rows, sortField, sortDir]);

  // ─── Sort handler
  function handleSort(field: SortField) {
    if (field === sortField) {
      setSortDir((prev) => (prev === "asc" ? "desc" : prev === "desc" ? "none" : "asc"));
    } else {
      setSortField(field);
      setSortDir("asc");
    }
  }

  // ─── Export
  function handleExport() {
    downloadCsv(
      "vanguard-kendaraan.csv",
      ["id", "plate_number", "brand", "model", "vehicle_type", "year", "driver_name", "status", "fuel_level", "odometer"],
      sorted.map((vehicle) => [
        vehicle.id,
        vehicle.plate_number,
        vehicle.brand,
        vehicle.model,
        vehicle.vehicle_type,
        vehicle.year,
        vehicle.driver_name,
        vehicle.status,
        vehicle.fuel_level,
        vehicle.odometer,
      ])
    );
  }

  // ─── Reset filters
  function resetFilters() {
    setSearch("");
    setFilterStatus("all");
    setFilterType("all");
  }

  const isFiltered = search !== "" || filterStatus !== "all" || filterType !== "all";

  return (
    <div className="flex h-[calc(100dvh-3.625rem)] max-h-[calc(100dvh-3.625rem)] min-h-0 flex-col overflow-hidden">
      {/* ─── Compact fleet summary ─────────────────────────────────────────── */}
      <header className="flex h-12 shrink-0 items-center gap-4 overflow-x-auto border-b border-border bg-surface-1 px-4">
        <div className="flex shrink-0 items-baseline gap-2">
          <h1 className="text-sm font-semibold text-foreground">Kendaraan</h1>
          <span className="font-mono text-xs tabular-nums text-muted">{counts.total} unit</span>
        </div>
        <div className="flex shrink-0 items-center divide-x divide-border text-xs">
          <SummaryItem label="Total" value={counts.total} />
          <SummaryItem label="Aktif" value={counts.aktif} color="var(--st-driving)" />
          <SummaryItem label="Berhenti" value={counts.maintenance} color="var(--st-stop)" />
          <SummaryItem label="Offline" value={counts.offline} color="var(--st-offline)" />
        </div>
        <div className="ml-auto flex shrink-0 items-center">
          <Button
            variant="secondary"
            size="sm"
            icon={<Download className="h-4 w-4" />}
            onClick={handleExport}
            aria-label="Export data kendaraan"
          >
            Export
          </Button>
        </div>
      </header>

      {/* ─── Compact toolbar ───────────────────────────────────────────────── */}
      <div className="flex h-11 shrink-0 min-w-0 items-center gap-2 overflow-x-auto border-b border-border bg-surface-1 px-4">
        {searchOpen ? (
          <div className="relative flex w-80 shrink-0 items-center gap-2">
            <Search className="pointer-events-none absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted" />
            <input
              ref={searchInputRef}
              type="text"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              onKeyDown={(event) => {
                if (event.key === "Escape") {
                  setSearch("");
                  setSearchOpen(false);
                }
              }}
              placeholder="Cari plat, brand, model, atau pengemudi..."
              className="h-8 min-w-0 flex-1 border border-border bg-surface-1 pl-8 pr-3 text-xs text-foreground placeholder:text-faint focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand/20"
              aria-label="Cari kendaraan"
            />
            <button
              type="button"
              onClick={() => {
                setSearch("");
                setSearchOpen(false);
              }}
              className="flex h-8 w-8 shrink-0 items-center justify-center text-muted transition-colors hover:bg-surface-2 hover:text-foreground focus-visible:outline-2 focus-visible:outline-brand"
              aria-label="Tutup pencarian"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        ) : (
          <button
            type="button"
            onClick={() => setSearchOpen(true)}
            className="flex h-8 w-8 shrink-0 items-center justify-center text-muted transition-colors hover:bg-surface-2 hover:text-foreground focus-visible:outline-2 focus-visible:outline-brand"
            aria-label="Cari kendaraan"
          >
            <Search className="h-4 w-4" />
          </button>
        )}

        <div className="flex shrink-0 items-center gap-1">
          {!searchOpen && <span className="mr-1 text-[10px] font-semibold uppercase tracking-widest text-muted">Status</span>}
            {([
              { key: "all", label: "Semua" },
              { key: "driving", label: "Berkendara" },
              { key: "idle", label: "Diam" },
              { key: "stopped", label: "Berhenti" },
              { key: "offline", label: "Offline" },
            ] as { key: FilterStatus; label: string }[]).map((f) => (
              <button
                key={f.key}
                onClick={() => setFilterStatus(f.key)}
                className={`h-7 shrink-0 border border-border px-2.5 text-xs font-medium transition-colors focus-visible:outline-2 focus-visible:outline-brand
                  ${filterStatus === f.key
                    ? "bg-brand text-slate-950"
                    : "text-muted hover:bg-surface-2 hover:text-foreground"}`}
                aria-pressed={filterStatus === f.key}
              >
                {f.label}
              </button>
            ))}

        </div>

        <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value as FilterType)}
            className="h-7 shrink-0 border border-border bg-surface-1 px-2 text-xs text-foreground focus-visible:outline-2 focus-visible:outline-brand"
          >
            <option value="all">Semua Tipe</option>
            <option value="truck">Truck</option>
            <option value="van">Van</option>
            <option value="pickup">Pickup</option>
            <option value="trailer">Trailer</option>
        </select>

        {isFiltered && (
          <button
            type="button"
            onClick={resetFilters}
            className="flex h-7 shrink-0 items-center gap-1 border border-border px-2.5 text-xs font-medium text-muted transition-colors hover:bg-surface-2 hover:text-foreground focus-visible:outline-2 focus-visible:outline-brand"
          >
            <X className="h-3 w-3" />
            Reset
          </button>
        )}
      </div>

      {/* ─── Table ─────────────────────────────────────────────────────────── */}
      <div className="flex-1 overflow-y-auto px-4 py-3">
        {sorted.length === 0 ? (
          <Card padding="none">
            <EmptyState
              icon={<Truck className="w-8 h-8 opacity-40" />}
              title={isFiltered ? "Tidak ada kendaraan" : "Belum ada kendaraan"}
              description={
                isFiltered
                  ? "Tidak ada kendaraan yang cocok dengan filter."
                  : "Belum ada kendaraan dalam sumber data armada."
              }
              action={
                isFiltered ? (
                  <Button variant="secondary" size="sm" onClick={resetFilters}>
                    Reset Filter
                  </Button>
                ) : undefined
              }
            />
          </Card>
        ) : (
          <TableContainer className="v2-vehicle-table">
            <TableHead>
              <tr>
                <TableHeadCell
                  sortable
                  sorted={sortField === "plate_number" ? sortDir !== "none" ? sortDir : false : false}
                  onClick={() => handleSort("plate_number")}
                  width={140}
                  className="!h-9 !px-3 !py-0"
                >
                  Plat
                </TableHeadCell>
                <TableHeadCell
                  sortable
                  sorted={sortField === "brand" ? sortDir !== "none" ? sortDir : false : false}
                  onClick={() => handleSort("brand")}
                  className="!h-9 !px-3 !py-0"
                >
                  Brand / Model
                </TableHeadCell>
                <TableHeadCell width={84} className="!h-9 !px-3 !py-0">Tipe</TableHeadCell>
                <TableHeadCell width={132} className="!h-9 !px-3 !py-0">Pengemudi</TableHeadCell>
                <TableHeadCell
                  sortable
                  sorted={sortField === "status" ? sortDir !== "none" ? sortDir : false : false}
                  onClick={() => handleSort("status")}
                  width={120}
                  className="!h-9 !px-3 !py-0"
                >
                  Status
                </TableHeadCell>
                <TableHeadCell width={112} className="!h-9 !px-3 !py-0">BBM</TableHeadCell>
                <TableHeadCell
                  sortable
                  sorted={sortField === "odometer" ? sortDir !== "none" ? sortDir : false : false}
                  onClick={() => handleSort("odometer")}
                  className="!h-9 !px-3 !py-0 text-right"
                  width={120}
                >
                  Odometer
                </TableHeadCell>
                <TableHeadCell width={78} className="!h-9 !px-3 !py-0">Tahun</TableHeadCell>
              </tr>
            </TableHead>
            <TableBody>
              {sorted.map((v) => {
                return (
                  <TableRow key={v.id}>
                    <PlateCell className="!px-3 !py-2 whitespace-nowrap">
                      <Link href={`/tracking?focus=${v.id}`} className="font-mono text-xs font-semibold tabular-nums text-foreground hover:text-brand focus-visible:outline-2 focus-visible:outline-brand">
                        {v.plate_number}
                      </Link>
                    </PlateCell>
                    <TableCell className="!px-3 !py-2 whitespace-nowrap">
                      <span className="text-sm font-medium text-foreground">
                        {v.brand}
                      </span>
                      {v.model && (
                        <span className="text-sm text-muted"> · {v.model}</span>
                      )}
                    </TableCell>
                    <TableCell className="!px-3 !py-2 whitespace-nowrap">
                      <span className="text-xs font-medium text-muted">
                        {formatVehicleType(v.vehicle_type as FilterType)}
                      </span>
                    </TableCell>
                    <TableCell className="!px-3 !py-2 whitespace-nowrap">
                      <span className="text-sm text-muted">
                        {v.driver_name || "—"}
                      </span>
                    </TableCell>
                    <StatusCell className="!px-3 !py-2 whitespace-nowrap">
                      <StatusPill
                        status={toBadgeStatus(v.status as VehicleStatus)}
                        showIcon={false}
                        className="!px-2 !py-0.5 !text-xs"
                      />
                    </StatusCell>
                    <TableCell className="!px-3 !py-2">
                      <FuelMiniBar level={v.fuel_level} />
                    </TableCell>
                    <TableCell className="!px-3 !py-2 text-right whitespace-nowrap">
                      <span className="text-xs tabular-nums font-mono text-muted">
                        {Math.round(v.odometer).toLocaleString("id-ID")} km
                      </span>
                    </TableCell>
                    <TableCell className="!px-3 !py-2 whitespace-nowrap">
                      <span className="text-xs tabular-nums font-mono text-muted">
                        {v.year}
                      </span>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </TableContainer>
        )}
      </div>

    </div>
  );
}

function SummaryItem({ label, value, color = "var(--text)" }: {
  label: string;
  value: number;
  color?: string;
}) {
  return (
    <div className="flex items-center gap-1.5 px-3">
      <span className="text-[10px] font-semibold uppercase tracking-wide text-muted">{label}</span>
      <span className="font-mono text-sm font-bold tabular-nums" style={{ color }}>
        {value}
      </span>
    </div>
  );
}
