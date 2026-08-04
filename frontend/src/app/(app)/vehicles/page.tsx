"use client";

import { useMemo, useState } from "react";
import { motion } from "motion/react";
import {
  Download,
  Edit2,
  Plus,
  Search,
  Trash2,
  Truck,
  X,
} from "lucide-react";
import { MOCK_VEHICLES } from "@/lib/mock-data";
import type { Vehicle } from "@/types";
import { useToast } from "@/components/ui/Toast";
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
import { Button, IconButton } from "@/components/ui/Button";
import { Panel, PanelSection, PanelDivider } from "@/components/ui/Panel";
import { Card, Skeleton, EmptyState } from "@/components/ui/Card";
import { useReducedMotion } from "@/hooks/useReducedMotion";

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

/* ─── KPI Helpers ───────────────────────────────────────────────────────────── */

function KpiValue({ value }: { value: number }) {
  return (
    <span className="tabular-nums font-semibold text-foreground">
      {value}
    </span>
  );
}

/* ─── Fuel Mini Bar ─────────────────────────────────────────────────────────── */

function FuelMiniBar({ level }: { level: number }) {
  const color =
    level > 60 ? "bg-st-driving" :
    level > 25 ? "bg-st-idle" :
    "bg-st-offline";
  return (
    <div className="flex items-center gap-2">
      <div className="w-14 h-1.5 rounded-full bg-surface-3 overflow-hidden">
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

/* ─── Confirm Dialog (inline) ───────────────────────────────────────────────── */

function DeleteConfirm({
  vehiclePlate: plate,
  onConfirm,
  onCancel,
}: {
  vehiclePlate: string;
  onConfirm: () => void;
  onCancel: () => void;
}) {
  const reducedMotion = useReducedMotion();
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={reducedMotion ? { duration: 0 } : { duration: 0.15 }}
      className="flex items-center gap-3 p-3 bg-surface-2 border border-border rounded-lg"
    >
      <span className="text-sm text-foreground flex-1">
        Hapus <span className="font-semibold font-mono">{plate}</span>?
      </span>
      <Button size="sm" variant="danger" onClick={onConfirm} aria-label="Konfirmasi hapus">
        Ya
      </Button>
      <Button size="sm" variant="ghost" onClick={onCancel} aria-label="Batal hapus">
        Batal
      </Button>
    </motion.div>
  );
}

/* ─── Vehicle Form ──────────────────────────────────────────────────────────── */

interface VehicleFormData {
  plate_number: string;
  brand: string;
  model: string;
  vehicle_type: string;
  year: number;
  driver_name: string;
  status: VehicleStatus;
  fuel_level: number;
  odometer: number;
}

const DRIVER_NAMES = [
  "Ahmad Sudirman", "Budi Santoso", "Cahyo Wibowo", "Dedi Kurniawan",
  "Eko Prasetyo", "Fajar Ramadhan", "Gunawan Hadi", "Hendra Wijaya",
  "Irfan Hakim", "Joko Susilo", "Kurnia Adi", "Lukman Hakim",
  "Muhammad Rizki", "Nur Hidayat", "Oscar Pranata", "Putra Mahendra",
  "Rudi Hartono", "Sugeng Priyanto", "Teguh Waluyo", "Umar Faruq",
];

const EMPTY_FORM: VehicleFormData = {
  plate_number: "",
  brand: "",
  model: "",
  vehicle_type: "truck",
  year: new Date().getFullYear(),
  driver_name: "",
  status: "stopped",
  fuel_level: 50,
  odometer: 0,
};

function VehicleForm({
  initial,
  onSubmit,
  onCancel,
  title,
}: {
  initial?: VehicleFormData;
  onSubmit: (data: VehicleFormData) => void;
  onCancel: () => void;
  title: string;
}) {
  const [form, setForm] = useState<VehicleFormData>(initial ?? EMPTY_FORM);

  function set(field: keyof VehicleFormData, value: string | number) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    onSubmit(form);
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col h-full">
      {/* Panel body scrollable */}
      <div className="flex-1 overflow-y-auto">
        <PanelSection title="Info Kendaraan">
          <div className="space-y-3">
            <FormField label="Plat Nomor *" required>
              <input
                type="text"
                value={form.plate_number}
                onChange={(e) => set("plate_number", e.target.value.toUpperCase())}
                placeholder="B 1234 KJT"
                className="form-input"
                autoFocus
              />
            </FormField>

            <div className="grid grid-cols-2 gap-3">
              <FormField label="Brand *">
                <input
                  type="text"
                  value={form.brand}
                  onChange={(e) => set("brand", e.target.value)}
                  placeholder="Hino"
                  className="form-input"
                />
              </FormField>
              <FormField label="Model">
                <input
                  type="text"
                  value={form.model}
                  onChange={(e) => set("model", e.target.value)}
                  placeholder="Ranger FL"
                  className="form-input"
                />
              </FormField>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <FormField label="Tipe">
                <select
                  value={form.vehicle_type}
                  onChange={(e) => set("vehicle_type", e.target.value)}
                  className="form-input"
                >
                  <option value="truck">Truck</option>
                  <option value="van">Van</option>
                  <option value="pickup">Pickup</option>
                  <option value="trailer">Trailer</option>
                </select>
              </FormField>
              <FormField label="Tahun">
                <input
                  type="number"
                  value={form.year}
                  onChange={(e) => set("year", parseInt(e.target.value) || 0)}
                  min={1990}
                  max={2030}
                  className="form-input"
                />
              </FormField>
            </div>
          </div>
        </PanelSection>

        <PanelDivider />

        <PanelSection title="Operasional">
          <div className="space-y-3">
            <FormField label="Driver">
              <select
                value={form.driver_name}
                onChange={(e) => set("driver_name", e.target.value)}
                className="form-input"
              >
                <option value="">— Belum Ditugaskan —</option>
                {DRIVER_NAMES.map((d) => (
                  <option key={d} value={d}>{d}</option>
                ))}
              </select>
            </FormField>

            <FormField label="Status">
              <select
                value={form.status}
                onChange={(e) => set("status", e.target.value as VehicleStatus)}
                className="form-input"
              >
                <option value="driving">Driving</option>
                <option value="idle">Idle</option>
                <option value="stopped">Stop</option>
                <option value="offline">Offline</option>
              </select>
            </FormField>

            <div className="grid grid-cols-2 gap-3">
              <FormField label="Kapasitas BBM (%)">
                <input
                  type="number"
                  value={form.fuel_level}
                  onChange={(e) => set("fuel_level", Math.min(100, Math.max(0, parseInt(e.target.value) || 0)))}
                  min={0}
                  max={100}
                  className="form-input"
                />
              </FormField>
              <FormField label="Odometer (km)">
                <input
                  type="number"
                  value={form.odometer}
                  onChange={(e) => set("odometer", Math.max(0, parseInt(e.target.value) || 0))}
                  min={0}
                  className="form-input"
                />
              </FormField>
            </div>
          </div>
        </PanelSection>
      </div>

      {/* Panel footer — sticky */}
      <div className="pt-4 border-t border-border flex items-center gap-2">
        <Button type="button" variant="ghost" onClick={onCancel} className="flex-1">
          Batal
        </Button>
        <Button type="submit" variant="primary" className="flex-1">
          {initial ? "Simpan Perubahan" : "Tambah Kendaraan"}
        </Button>
      </div>
    </form>
  );
}

function FormField({
  label,
  required,
  children,
}: {
  label: string;
  required?: boolean;
  children: React.ReactNode;
}) {
  return (
    <div>
      <label className="block text-sm font-medium text-muted mb-1.5">
        {label}
        {required && <span className="text-st-offline ml-0.5">*</span>}
      </label>
      {children}
    </div>
  );
}

/* ─── Main Page ─────────────────────────────────────────────────────────────── */

export default function VehiclesPage() {
  const { success, error } = useToast();
  const reducedMotion = useReducedMotion();

  // Vehicle list state
  const [vehicles, setVehicles] = useState<Vehicle[]>(MOCK_VEHICLES);

  // UI state
  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState<FilterStatus>("all");
  const [filterType, setFilterType] = useState<FilterType>("all");
  const [sortField, setSortField] = useState<SortField>("plate_number");
  const [sortDir, setSortDir] = useState<SortDir>("asc");

  // Drawer state
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [drawerMode, setDrawerMode] = useState<"add" | "edit">("add");
  const [editVehicle, setEditVehicle] = useState<Vehicle | null>(null);

  // Delete confirm state — keyed by vehicle id
  const [deleteConfirm, setDeleteConfirm] = useState<number | null>(null);

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

  // ─── Open add drawer
  function openAdd() {
    setDrawerMode("add");
    setEditVehicle(null);
    setDrawerOpen(true);
  }

  // ─── Open edit drawer
  function openEdit(v: Vehicle) {
    setDrawerMode("edit");
    setEditVehicle(v);
    setDrawerOpen(true);
  }

  // ─── Close drawer
  function closeDrawer() {
    setDrawerOpen(false);
    setEditVehicle(null);
  }

  // ─── Submit form
  function handleSubmitForm(data: VehicleFormData) {
    if (!data.plate_number.trim()) {
      error("Plat Nomor wajib diisi");
      return;
    }
    if (!data.brand.trim()) {
      error("Brand wajib diisi");
      return;
    }

    if (drawerMode === "add") {
      const newVehicle: Vehicle = {
        id: Math.max(...vehicles.map((v) => v.id), 0) + 1,
        plate_number: data.plate_number.trim(),
        brand: data.brand.trim(),
        model: data.model.trim(),
        vehicle_type: data.vehicle_type,
        year: data.year,
        driver_name: data.driver_name || null,
        status: data.status,
        speed: 0,
        latitude: null,
        longitude: null,
        heading: 0,
        engine_on: data.status !== "offline",
        fuel_level: data.fuel_level,
        odometer: data.odometer,
        last_update: new Date().toISOString(),
      };
      setVehicles((prev) => [...prev, newVehicle]);
      success(`Kendaraan ${newVehicle.plate_number} ditambahkan`);
      closeDrawer();
    } else if (editVehicle) {
      setVehicles((prev) =>
        prev.map((v) =>
          v.id === editVehicle.id
            ? {
                ...v,
                plate_number: data.plate_number.trim(),
                brand: data.brand.trim(),
                model: data.model.trim(),
                vehicle_type: data.vehicle_type,
                year: data.year,
                driver_name: data.driver_name || null,
                status: data.status,
                engine_on: data.status !== "offline",
                fuel_level: data.fuel_level,
                odometer: data.odometer,
                last_update: new Date().toISOString(),
              }
            : v
        )
      );
      success(`Kendaraan ${data.plate_number} diperbarui`);
      closeDrawer();
    }
  }

  // ─── Delete vehicle
  function handleDelete(v: Vehicle) {
    setVehicles((prev) => prev.filter((x) => x.id !== v.id));
    setDeleteConfirm(null);
    success(`Kendaraan ${v.plate_number} dihapus`);
  }

  // ─── Export
  function handleExport() {
    success("Export CSV", `Mengunduh data ${vehicles.length} kendaraan...`);
  }

  // ─── Reset filters
  function resetFilters() {
    setSearch("");
    setFilterStatus("all");
    setFilterType("all");
  }

  const isFiltered = search !== "" || filterStatus !== "all" || filterType !== "all";

  return (
    <div className="h-[calc(100vh-4rem)] flex flex-col overflow-hidden">
      {/* ─── Header ─────────────────────────────────────────────────────────── */}
      <header className="shrink-0 px-6 pt-6 pb-4 border-b border-border bg-surface-1">
        <div className="flex items-start justify-between gap-4">
          {/* Title + KPIs */}
          <div className="flex items-start gap-6">
            <div>
              <p className="text-label uppercase tracking-wide text-muted">
                Fleet Management
              </p>
              <h1 className="text-h1 font-semibold text-foreground mt-0.5">
                Manajemen Kendaraan
              </h1>
              <p className="text-sm text-muted mt-0.5">
                Master data kendaraan dan aset armada
              </p>
            </div>

            {/* KPI inline */}
            <div className="flex items-center gap-1 mt-6">
              <KpiStat label="Total" value={counts.total} />
              <KpiDivider />
              <KpiStat label="Aktif" value={counts.aktif} accent="text-st-driving" />
              <KpiDivider />
              <KpiStat label="Stop" value={counts.maintenance} accent="text-st-stop" />
              <KpiDivider />
              <KpiStat label="Offline" value={counts.offline} accent="text-st-offline" />
            </div>
          </div>

          {/* CTA */}
          <div className="flex items-center gap-2 mt-1">
            <Button
              variant="secondary"
              size="sm"
              icon={<Download className="w-4 h-4" />}
              onClick={handleExport}
              aria-label="Export data kendaraan"
            >
              Export
            </Button>
            <Button
              variant="primary"
              size="sm"
              icon={<Plus className="w-4 h-4" />}
              onClick={openAdd}
              aria-label="Tambah kendaraan baru"
            >
              Tambah Kendaraan
            </Button>
          </div>
        </div>
      </header>

      {/* ─── Toolbar ────────────────────────────────────────────────────────── */}
      <div className="shrink-0 px-6 py-3 border-b border-border bg-surface-1">
        <div className="flex flex-wrap items-center gap-3">
          {/* Search */}
          <div className="relative flex-1 min-w-[200px] max-w-xs">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted pointer-events-none" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Cari plat, brand, model, driver..."
              className="w-full pl-9 pr-3 py-1.5 text-sm bg-surface-2 border border-border rounded-lg
                         placeholder:text-faint text-foreground
                         focus-visible:outline-2 focus-visible:outline-brand focus-visible:outline-offset-0
                         transition-colors"
            />
          </div>

          {/* Status filter */}
          <div className="flex items-center gap-1">
            <span className="text-xs text-muted mr-1">Status:</span>
            {([
              { key: "all", label: "Semua" },
              { key: "driving", label: "Driving" },
              { key: "idle", label: "Idle" },
              { key: "stopped", label: "Stop" },
              { key: "offline", label: "Offline" },
            ] as { key: FilterStatus; label: string }[]).map((f) => (
              <button
                key={f.key}
                onClick={() => setFilterStatus(f.key)}
                className={`px-2.5 py-1 rounded-md text-xs font-medium transition-colors
                  focus-visible:outline-2 focus-visible:outline-brand
                  ${filterStatus === f.key
                    ? "bg-brand text-white"
                    : "bg-surface-2 text-muted hover:bg-surface-3 hover:text-foreground border border-border"}`}
              >
                {f.label}
              </button>
            ))}
          </div>

          {/* Type filter */}
          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value as FilterType)}
            className="text-xs bg-surface-2 border border-border rounded-md px-2.5 py-1.5
                       text-foreground focus-visible:outline-2 focus-visible:outline-brand
                       cursor-pointer"
          >
            <option value="all">Semua Tipe</option>
            <option value="truck">Truck</option>
            <option value="van">Van</option>
            <option value="pickup">Pickup</option>
            <option value="trailer">Trailer</option>
          </select>

          {isFiltered && (
            <button
              onClick={resetFilters}
              className="flex items-center gap-1 px-2.5 py-1.5 rounded-md text-xs font-medium
                         bg-surface-2 border border-border text-muted
                         hover:bg-surface-3 hover:text-foreground
                         focus-visible:outline-2 focus-visible:outline-brand transition-colors"
            >
              <X className="w-3 h-3" />
              Reset
            </button>
          )}
        </div>
      </div>

      {/* ─── Table ─────────────────────────────────────────────────────────── */}
      <div className="flex-1 overflow-y-auto px-6 py-4">
        {sorted.length === 0 ? (
          <Card padding="none">
            <EmptyState
              icon={<Truck className="w-8 h-8 opacity-40" />}
              title={isFiltered ? "Tidak ada kendaraan" : "Belum ada kendaraan"}
              description={
                isFiltered
                  ? "Tidak ada kendaraan yang cocok dengan filter."
                  : "Tambahkan kendaraan pertama ke armada."
              }
              action={
                isFiltered ? (
                  <Button variant="secondary" size="sm" onClick={resetFilters}>
                    Reset Filter
                  </Button>
                ) : (
                  <Button variant="primary" size="sm" icon={<Plus className="w-4 h-4" />} onClick={openAdd}>
                    Tambah Kendaraan
                  </Button>
                )
              }
            />
          </Card>
        ) : (
          <TableContainer>
            <TableHead>
              <tr>
                <TableHeadCell
                  sortable
                  sorted={sortField === "plate_number" ? sortDir !== "none" ? sortDir : false : false}
                  onClick={() => handleSort("plate_number")}
                  width={140}
                >
                  Plat
                </TableHeadCell>
                <TableHeadCell
                  sortable
                  sorted={sortField === "brand" ? sortDir !== "none" ? sortDir : false : false}
                  onClick={() => handleSort("brand")}
                >
                  Brand / Model
                </TableHeadCell>
                <TableHeadCell width={90}>Tipe</TableHeadCell>
                <TableHeadCell width={140}>Driver</TableHeadCell>
                <TableHeadCell
                  sortable
                  sorted={sortField === "status" ? sortDir !== "none" ? sortDir : false : false}
                  onClick={() => handleSort("status")}
                  width={110}
                >
                  Status
                </TableHeadCell>
                <TableHeadCell width={120}>BBM</TableHeadCell>
                <TableHeadCell
                  sortable
                  sorted={sortField === "odometer" ? sortDir !== "none" ? sortDir : false : false}
                  onClick={() => handleSort("odometer")}
                  className="text-right"
                  width={120}
                >
                  Odometer
                </TableHeadCell>
                <TableHeadCell width={90}>Tahun</TableHeadCell>
                <TableHeadCell width={90} className="text-right">Aksi</TableHeadCell>
              </tr>
            </TableHead>
            <TableBody>
              {sorted.map((v) => {
                const isDeleteConfirming = deleteConfirm === v.id;
                return (
                  <TableRow
                    key={v.id}
                    selectable
                    onClick={() => !isDeleteConfirming && openEdit(v)}
                    className="group"
                  >
                    <PlateCell>
                      <span className="font-mono text-sm font-semibold tabular-nums text-foreground">
                        {v.plate_number}
                      </span>
                    </PlateCell>
                    <TableCell>
                      <span className="text-sm font-medium text-foreground">
                        {v.brand}
                      </span>
                      {v.model && (
                        <span className="text-muted"> · {v.model}</span>
                      )}
                    </TableCell>
                    <TableCell>
                      <span className="text-xs font-medium uppercase text-muted">
                        {v.vehicle_type}
                      </span>
                    </TableCell>
                    <TableCell>
                      <span className="text-sm text-muted">
                        {v.driver_name || "—"}
                      </span>
                    </TableCell>
                    <StatusCell>
                      <StatusPill status={toBadgeStatus(v.status as VehicleStatus)} />
                    </StatusCell>
                    <TableCell>
                      <FuelMiniBar level={v.fuel_level} />
                    </TableCell>
                    <TableCell className="text-right">
                      <span className="text-sm tabular-nums font-mono text-muted">
                        {Math.round(v.odometer).toLocaleString("id-ID")} km
                      </span>
                    </TableCell>
                    <TableCell>
                      <span className="text-sm tabular-nums font-mono text-muted">
                        {v.year}
                      </span>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        {isDeleteConfirming ? (
                          <DeleteConfirm
                            vehiclePlate={v.plate_number}
                            onConfirm={() => handleDelete(v)}
                            onCancel={() => setDeleteConfirm(null)}
                          />
                        ) : (
                          <>
                            <IconButton
                              icon={<Edit2 className="w-3.5 h-3.5" />}
                              onClick={(e) => { e.stopPropagation(); openEdit(v); }}
                              variant="ghost"
                              size="sm"
                              aria-label={`Edit ${v.plate_number}`}
                            />
                            <IconButton
                              icon={<Trash2 className="w-3.5 h-3.5" />}
                              onClick={(e) => { e.stopPropagation(); setDeleteConfirm(v.id); }}
                              variant="ghost"
                              size="sm"
                              aria-label={`Hapus ${v.plate_number}`}
                              className="hover:text-st-offline focus-visible:outline-st-offline"
                            />
                          </>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </TableContainer>
        )}
      </div>

      {/* ─── Drawer Panel ──────────────────────────────────────────────────── */}
      <Panel
        open={drawerOpen}
        onClose={closeDrawer}
        title={drawerMode === "add" ? "Tambah Kendaraan" : "Edit Kendaraan"}
        subtitle={drawerMode === "edit" && editVehicle ? editVehicle.plate_number : undefined}
        width={420}
      >
        <VehicleForm
          initial={
            drawerMode === "edit" && editVehicle
              ? {
                  plate_number: editVehicle.plate_number,
                  brand: editVehicle.brand,
                  model: editVehicle.model,
                  vehicle_type: editVehicle.vehicle_type,
                  year: editVehicle.year,
                  driver_name: editVehicle.driver_name ?? "",
                  status: editVehicle.status as VehicleStatus,
                  fuel_level: editVehicle.fuel_level,
                  odometer: editVehicle.odometer,
                }
              : undefined
          }
          onSubmit={handleSubmitForm}
          onCancel={closeDrawer}
          title={drawerMode === "add" ? "Tambah Kendaraan" : "Edit Kendaraan"}
        />
      </Panel>
    </div>
  );
}

/* ─── KPI Stat Components ─────────────────────────────────────────────────── */

function KpiStat({ label, value, accent }: { label: string; value: number; accent?: string }) {
  const reducedMotion = useReducedMotion();
  return (
    <div className="flex flex-col items-center px-4 py-2 rounded-lg bg-surface-2 border border-border min-w-[72px]">
      <motion.span
        key={value}
        initial={{ opacity: 0.6, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={reducedMotion ? { duration: 0 } : { duration: 0.2 }}
        className={`text-xl font-bold tabular-nums ${accent ?? "text-foreground"}`}
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
