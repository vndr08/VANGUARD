"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import {
  Download,
  Search,
  Truck,
  User,
  X,
} from "lucide-react";
import { useAppContext } from "@/components/context/AppContext";
import { Badge } from "@/components/ui/Badge";
import {
  TableContainer,
  TableHead,
  TableHeadCell,
  TableBody,
  TableRow,
  TableCell,
} from "@/components/ui/Table";
import { Button } from "@/components/ui/Button";
import { Card, EmptyState } from "@/components/ui/Card";
import { downloadCsv } from "@/lib/csv";
import { selectDrivers, type DriverStatus } from "@/lib/driver-data";

/* ─── Types ─────────────────────────────────────────────────────────────────── */

/* ─── Badge mapping ─────────────────────────────────────────────────────────── */

function toBadgeVariant(s: DriverStatus): "success" | "brand" | "warning" | "default" {
  if (s === "active") return "success";
  if (s === "off-duty") return "brand";
  if (s === "on-leave") return "warning";
  return "default";
}

function statusLabel(s: DriverStatus): string {
  if (s === "active") return "Aktif";
  if (s === "off-duty") return "Lepas tugas";
  if (s === "on-leave") return "Cuti";
  return "Nonaktif";
}

function SummaryItem({ label, value, color }: { label: string; value: number; color?: string }) {
  return (
    <div className="flex items-baseline gap-2 px-3 first:pl-0 last:pr-0">
      <span className="text-[10px] font-semibold uppercase tracking-widest text-muted">{label}</span>
      <span className="font-mono text-sm font-semibold tabular-nums" style={color ? { color } : undefined}>{value}</span>
    </div>
  );
}

/* ─── Avatar initials ───────────────────────────────────────────────────────── */

function Avatar({ name, size = "md" }: { name: string; size?: "sm" | "md" }) {
  const initials = name
    .split(" ")
    .slice(0, 2)
    .map((w) => w[0])
    .join("")
    .toUpperCase();
  const colors = [
    "bg-st-driving",
    "bg-st-idle",
    "bg-brand",
    "bg-st-stop",
  ];
  const colorIdx = name.charCodeAt(0) % colors.length;
  const sizeClass = size === "sm" ? "w-7 h-7 text-[10px]" : "w-9 h-9 text-xs";
  return (
    <span
      className={`inline-flex items-center justify-center rounded-full text-white font-semibold shrink-0 ${sizeClass} ${colors[colorIdx]}`}
    >
      {initials}
    </span>
  );
}

/* ─── Main Page ─────────────────────────────────────────────────────────────── */

export default function DriversPage() {
  const { vehicles: contextVehicles } = useAppContext();
  const vehicles = contextVehicles;

  const drivers = useMemo(() => selectDrivers(vehicles), [vehicles]);
  const [search, setSearch] = useState("");
  const [searchOpen, setSearchOpen] = useState(false);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const [filterStatus, setFilterStatus] = useState<DriverStatus | "all">("all");
  const [sortField, setSortField] = useState<"name" | "status">("name");
  const [sortDir, setSortDir] = useState<"asc" | "desc" | "none">("asc");

  useEffect(() => {
    if (searchOpen) searchInputRef.current?.focus();
  }, [searchOpen]);

  // KPI counts
  const counts = useMemo(() => ({
    total: drivers.length,
    aktif: drivers.filter((d) => d.status === "active").length,
    bertugas: drivers.filter((d) => d.status === "off-duty").length,
    nonaktif: drivers.filter((d) => d.status === "on-leave" || d.status === "inactive").length,
  }), [drivers]);

  // Filtered rows
  const rows = useMemo(() => {
    const q = search.trim().toLowerCase();
    return drivers.filter((d) => {
      if (q && !d.name.toLowerCase().includes(q)
        && !d.sim_number.toLowerCase().includes(q)
        && !d.phone.toLowerCase().includes(q)
        && !d.address.toLowerCase().includes(q)) return false;
      if (filterStatus !== "all" && d.status !== filterStatus) return false;
      return true;
    });
  }, [drivers, search, filterStatus]);

  const sorted = useMemo(() => {
    const arr = [...rows];
    if (sortDir === "none") return arr;
    arr.sort((a, b) => {
      let cmp = 0;
      if (sortField === "name") cmp = a.name.localeCompare(b.name);
      if (sortField === "status") cmp = a.status.localeCompare(b.status);
      return sortDir === "asc" ? cmp : -cmp;
    });
    return arr;
  }, [rows, sortField, sortDir]);

  function handleSort(field: "name" | "status") {
    if (field === sortField) {
      setSortDir((p) => (p === "asc" ? "desc" : p === "desc" ? "none" : "asc"));
    } else {
      setSortField(field);
      setSortDir("asc");
    }
  }

  function handleExport() {
    downloadCsv(
      "vanguard-pengemudi.csv",
      ["id", "name", "sim_number", "phone", "vehicle_id", "status", "join_date"],
      sorted.map((driver) => [
        driver.id,
        driver.name,
        driver.sim_number,
        driver.phone,
        driver.vehicle_id,
        driver.status,
        driver.join_date,
      ])
    );
  }

  function resetFilters() {
    setSearch("");
    setFilterStatus("all");
  }

  const isFiltered = search !== "" || filterStatus !== "all";

  // Map driver vehicle_id → plate_number for display
  const vehicleMap = useMemo(() => {
    const m = new Map<number, string>();
    vehicles.forEach((v) => m.set(v.id, v.plate_number));
    return m;
  }, [vehicles]);

  return (
    <div className="flex h-[calc(100dvh-3.625rem)] max-h-[calc(100dvh-3.625rem)] min-h-0 flex-col overflow-hidden">
      <header className="flex h-12 shrink-0 items-center gap-4 overflow-x-auto border-b border-border bg-surface-1 px-4">
        <div className="flex shrink-0 items-baseline gap-2">
          <h1 className="text-sm font-semibold text-foreground">Driver</h1>
          <span className="font-mono text-xs tabular-nums text-muted">{counts.total} pengemudi</span>
        </div>
        <div className="flex shrink-0 items-center divide-x divide-border">
          <SummaryItem label="Total" value={counts.total} />
          <SummaryItem label="Aktif" value={counts.aktif} color="var(--st-driving)" />
          <SummaryItem label="Lepas tugas" value={counts.bertugas} color="var(--brand)" />
          <SummaryItem label="Nonaktif" value={counts.nonaktif} color="var(--text-muted)" />
        </div>
        <div className="ml-auto flex shrink-0 items-center">
          <Button variant="secondary" size="sm" icon={<Download className="h-4 w-4" />} onClick={handleExport} aria-label="Export data driver">
            Export
          </Button>
        </div>
      </header>

      {/* ─── Toolbar ────────────────────────────────────────────────────────── */}
      <div className="flex h-11 shrink-0 min-w-0 items-center gap-2 overflow-x-auto border-b border-border bg-surface-1 px-4">
        {searchOpen ? (
          <div className="relative flex w-80 shrink-0 items-center gap-2">
            <Search className="pointer-events-none absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted" />
            <input
              ref={searchInputRef}
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              onKeyDown={(event) => {
                if (event.key === "Escape") {
                  setSearch("");
                  setSearchOpen(false);
                }
              }}
              placeholder="Cari nama, SIM, atau telepon..."
              className="h-8 min-w-0 flex-1 border border-border bg-surface-1 pl-8 pr-3 text-xs text-foreground placeholder:text-faint focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand/20"
              aria-label="Cari pengemudi"
            />
            <button type="button" onClick={() => { setSearch(""); setSearchOpen(false); }} className="flex h-8 w-8 shrink-0 items-center justify-center text-muted transition-colors hover:bg-surface-2 hover:text-foreground focus-visible:outline-2 focus-visible:outline-brand" aria-label="Tutup pencarian">
              <X className="h-4 w-4" />
            </button>
          </div>
        ) : (
          <button type="button" onClick={() => setSearchOpen(true)} className="flex h-8 w-8 shrink-0 items-center justify-center text-muted transition-colors hover:bg-surface-2 hover:text-foreground focus-visible:outline-2 focus-visible:outline-brand" aria-label="Cari pengemudi">
            <Search className="h-4 w-4" />
          </button>
        )}

        <div className="flex shrink-0 items-center gap-1">
            {!searchOpen && <span className="mr-1 text-[10px] font-semibold uppercase tracking-widest text-muted">Status</span>}
            {([
              { key: "all", label: "Semua" },
              { key: "active", label: "Aktif" },
              { key: "off-duty", label: "Lepas tugas" },
              { key: "on-leave", label: "Cuti" },
              { key: "inactive", label: "Nonaktif" },
            ] as { key: DriverStatus | "all"; label: string }[]).map((f) => (
              <button
                key={f.key}
                onClick={() => setFilterStatus(f.key as DriverStatus | "all")}
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

          {isFiltered && (
            <button
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
              icon={<User className="w-8 h-8 opacity-40" />}
              title={isFiltered ? "Tidak ada driver" : "Belum ada driver"}
              description={
                isFiltered
                  ? "Tidak ada driver yang cocok dengan filter."
                  : "Belum ada driver dalam sumber data armada."
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
          <TableContainer className="v2-driver-table [&_td]:!px-3 [&_td]:!py-2 [&_th]:!h-9 [&_th]:!px-3 [&_th]:!py-0">
            <TableHead>
              <tr>
                <TableHeadCell width={220}
                  sortable sorted={sortField === "name" ? sortDir !== "none" ? sortDir : false : false}
                  onClick={() => handleSort("name")}
                >
                  Nama
                </TableHeadCell>
                <TableHeadCell width={190}>No. SIM</TableHeadCell>
                <TableHeadCell width={150}>Telepon</TableHeadCell>
                <TableHeadCell width={150}>Kendaraan</TableHeadCell>
                <TableHeadCell width={112}
                  sortable sorted={sortField === "status" ? sortDir !== "none" ? sortDir : false : false}
                  onClick={() => handleSort("status")}
                >
                  Status
                </TableHeadCell>
                <TableHeadCell width={108}>Bergabung</TableHeadCell>
              </tr>
            </TableHead>
            <TableBody>
              {sorted.map((d) => {
                const assignedVehicle = d.vehicle_id ? vehicleMap.get(d.vehicle_id) : null;
                return (
                  <TableRow key={d.id}>
                    {/* Nama + avatar */}
                    <TableCell>
                      <div className="flex items-center gap-2.5 whitespace-nowrap">
                        <Avatar name={d.name} size="sm" />
                        <div className="flex min-w-0 items-baseline gap-2">
                          <p className="text-sm font-semibold text-foreground truncate">{d.name}</p>
                          <p className="shrink-0 text-[11px] text-muted font-mono">{d.id}</p>
                        </div>
                      </div>
                    </TableCell>
                    {/* No SIM */}
                    <TableCell>
                      <span className="font-mono text-xs font-medium text-foreground whitespace-nowrap">{d.sim_number}</span>
                    </TableCell>
                    {/* Telepon */}
                    <TableCell>
                      <span className="text-xs font-medium text-foreground whitespace-nowrap">{d.phone || "—"}</span>
                    </TableCell>
                    {/* Kendaraan */}
                    <TableCell>
                      {assignedVehicle ? (
                        <Link href={`/tracking?focus=${d.vehicle_id}`} className="inline-flex items-center gap-1.5 whitespace-nowrap text-xs font-semibold font-mono text-foreground hover:text-brand focus-visible:outline-2 focus-visible:outline-brand">
                          <Truck className="h-3.5 w-3.5 text-muted shrink-0" />
                          {assignedVehicle}
                        </Link>
                      ) : (
                        <span className="text-xs text-muted">—</span>
                      )}
                    </TableCell>
                    {/* Status badge */}
                    <TableCell>
                      <Badge variant={toBadgeVariant(d.status)} className="whitespace-nowrap px-2 py-0.5 text-[10px]">
                        {statusLabel(d.status)}
                      </Badge>
                    </TableCell>
                    {/* Bergabung */}
                    <TableCell>
                      <span className="whitespace-nowrap text-xs tabular-nums font-mono font-medium text-foreground">
                        {d.join_date ? new Date(d.join_date).toLocaleDateString("id-ID", { day: "2-digit", month: "short", year: "2-digit" }) : "—"}
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
