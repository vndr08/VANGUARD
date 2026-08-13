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
  User,
  X,
} from "lucide-react";
import { FLEET_VEHICLES } from "@/lib/fleet-data";
import { useToast } from "@/components/ui/Toast";
import { Badge } from "@/components/ui/Badge";
import {
  TableContainer,
  TableHead,
  TableHeadCell,
  TableBody,
  TableRow,
  TableCell,
} from "@/components/ui/Table";
import { Button, IconButton } from "@/components/ui/Button";
import { Panel, PanelSection, PanelDivider } from "@/components/ui/Panel";
import { Card, EmptyState } from "@/components/ui/Card";
import { useReducedMotion } from "@/hooks/useReducedMotion";

/* ─── Types ─────────────────────────────────────────────────────────────────── */

type DriverStatus = "active" | "off-duty" | "on-leave" | "inactive";

interface Driver {
  id: string;
  name: string;
  sim_number: string;
  phone: string;
  address: string;
  birth_date: string;
  vehicle_id: number | null;
  status: DriverStatus;
  join_date: string;
}

/* ─── Badge mapping ─────────────────────────────────────────────────────────── */

function toBadgeVariant(s: DriverStatus): "success" | "brand" | "warning" | "default" {
  if (s === "active") return "success";
  if (s === "off-duty") return "brand";
  if (s === "on-leave") return "warning";
  return "default";
}

function statusLabel(s: DriverStatus): string {
  if (s === "active") return "Aktif";
  if (s === "off-duty") return "Bertugas";
  if (s === "on-leave") return "Cuti";
  return "Nonaktif";
}

/* ─── Initial mock data ────────────────────────────────────────────────────── */

const INITIAL_DRIVERS: Driver[] = [
  { id: "D01", name: "Ahmad Sudirman",  sim_number: "SIM B2 1234-5678-9012", phone: "0812-3456-7890", address: "Jl. Merdeka No. 10, Jakarta",  birth_date: "1985-03-15", vehicle_id: 1,  status: "active",   join_date: "2020-01-15" },
  { id: "D02", name: "Budi Santoso",    sim_number: "SIM B2 2345-6789-0123", phone: "0813-4567-8901", address: "Jl. Sudirman No. 22, Bandung",  birth_date: "1988-07-22", vehicle_id: 2,  status: "active",   join_date: "2021-03-08" },
  { id: "D03", name: "Cahyo Wibowo",   sim_number: "SIM B2 3456-7890-1234", phone: "0814-5678-9012", address: "Jl. Asia Afrika No. 5, Bandung", birth_date: "1980-11-03", vehicle_id: 3,  status: "active",   join_date: "2018-06-20" },
  { id: "D04", name: "Dedi Kurniawan", sim_number: "SIM B2 4567-8901-2345", phone: "0815-6789-0123", address: "Jl. Gatot Subroto, Semarang",   birth_date: "1992-01-30", vehicle_id: 5,  status: "active",   join_date: "2022-09-01" },
  { id: "D05", name: "Eko Prasetyo",   sim_number: "SIM B2 5678-9012-3456", phone: "0816-7890-1234", address: "Jl. Pahlawan No. 8, Surabaya",   birth_date: "1978-05-18", vehicle_id: 6,  status: "off-duty", join_date: "2017-04-12" },
  { id: "D06", name: "Fajar Ramadhan",  sim_number: "SIM B2 6789-0123-4567", phone: "0817-8901-2345", address: "Jl. Ahmad Yani No. 15, Bekasi",  birth_date: "1990-08-09", vehicle_id: 7,  status: "active",   join_date: "2020-11-25" },
  { id: "D07", name: "Gunawan Hadi",   sim_number: "SIM B2 7890-1234-5678", phone: "0818-9012-3456", address: "Jl. Diponegoro No. 33, Bandung", birth_date: "1975-12-01", vehicle_id: 8,  status: "on-leave", join_date: "2015-02-14" },
  { id: "D08", name: "Hendra Wijaya",   sim_number: "SIM B2 8901-2345-6789", phone: "0819-0123-4567", address: "Jl. Thamrin No. 12, Jakarta",   birth_date: "1995-04-25", vehicle_id: 9,  status: "active",   join_date: "2023-07-30" },
  { id: "D09", name: "Irfan Hakim",     sim_number: "SIM B2 9012-3456-7890", phone: "0811-1234-5678", address: "Jl. Merdeka Timur, Malang",     birth_date: "1987-09-14", vehicle_id: 10, status: "active",   join_date: "2019-08-05" },
  { id: "D10", name: "Joko Susilo",     sim_number: "SIM B1 0123-4567-8901", phone: "0822-2345-6789", address: "Jl. Asia No. 7, Bandung",       birth_date: "1993-02-28", vehicle_id: 17, status: "active",   join_date: "2022-05-17" },
  { id: "D11", name: "Kurnia Adi",      sim_number: "SIM B2 1122-3344-5566", phone: "0823-3456-7890", address: "Jl. Boulevard, Jakarta",        birth_date: "1989-06-11", vehicle_id: 11, status: "off-duty", join_date: "2020-10-22" },
  { id: "D12", name: "Lukman Hakim",   sim_number: "SIM B2 2233-4455-6677", phone: "0824-4567-8901", address: "Jl. Braga No. 4, Bandung",      birth_date: "1983-10-07", vehicle_id: 12, status: "inactive", join_date: "2016-03-19" },
  { id: "D13", name: "Muhammad Rizki",  sim_number: "SIM B2 3344-5566-7788", phone: "0825-5678-9012", address: "Jl. Sudirman Barat, Jakarta",    birth_date: "1996-01-20", vehicle_id: 13, status: "active",   join_date: "2023-09-01" },
  { id: "D14", name: "Nur Hidayat",      sim_number: "SIM B2 4455-6677-8899", phone: "0826-6789-0123", address: "Jl. Dago No. 18, Bandung",       birth_date: "1984-07-15", vehicle_id: 14, status: "inactive", join_date: "2017-12-08" },
  { id: "D15", name: "Oscar Pranata",   sim_number: "SIM B2 5566-7788-9900", phone: "0827-7890-1234", address: "Jl. Pemuda No. 25, Semarang",   birth_date: "1981-03-03", vehicle_id: 15, status: "active",   join_date: "2019-05-14" },
];

/* ─── KPI Components ────────────────────────────────────────────────────────── */

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

/* ─── Safety Score ──────────────────────────────────────────────────────────── */

function SafetyScore({ score }: { score: number }) {
  const color =
    score >= 90 ? "text-st-driving" :
    score >= 75 ? "text-st-idle" :
    "text-st-offline";
  return (
    <span className={`font-mono text-sm font-semibold tabular-nums ${color}`}>
      {score}
    </span>
  );
}

/* ─── Delete Confirm ─────────────────────────────────────────────────────────── */

function DeleteConfirm({
  driverName,
  onConfirm,
  onCancel,
}: {
  driverName: string;
  onConfirm: () => void;
  onCancel: () => void;
}) {
  const reducedMotion = useReducedMotion();
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={reducedMotion ? { duration: 0 } : { duration: 0.15 }}
      className="flex items-center gap-2 p-2 bg-surface-2 border border-border rounded-lg"
    >
      <span className="text-xs text-foreground flex-1 truncate">
        Hapus <strong>{driverName}</strong>?
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

/* ─── Driver Form ───────────────────────────────────────────────────────────── */

interface DriverFormData {
  name: string;
  sim_number: string;
  phone: string;
  address: string;
  birth_date: string;
  vehicle_id: number | null;
  status: DriverStatus;
  join_date: string;
}

const EMPTY_FORM: DriverFormData = {
  name: "",
  sim_number: "",
  phone: "",
  address: "",
  birth_date: "",
  vehicle_id: null,
  status: "active",
  join_date: new Date().toISOString().split("T")[0],
};

function DriverForm({
  initial,
  onSubmit,
  onCancel,
}: {
  initial?: DriverFormData;
  onSubmit: (data: DriverFormData) => void;
  onCancel: () => void;
}) {
  const [form, setForm] = useState<DriverFormData>(initial ?? EMPTY_FORM);

  function set(field: keyof DriverFormData, value: string | number | null) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  return (
    <form
      onSubmit={(e) => { e.preventDefault(); onSubmit(form); }}
      className="flex flex-col h-full"
    >
      <div className="flex-1 overflow-y-auto">
        <PanelSection title="Identitas">
          <div className="space-y-3">
            <FormField label="Nama Lengkap *" required>
              <input
                type="text"
                value={form.name}
                onChange={(e) => set("name", e.target.value)}
                placeholder="Masukkan nama lengkap"
                className="form-input"
                autoFocus
              />
            </FormField>

            <FormField label="No SIM *" required>
              <input
                type="text"
                value={form.sim_number}
                onChange={(e) => set("sim_number", e.target.value)}
                placeholder="SIM B2 1234-5678-9012"
                className="form-input"
              />
            </FormField>

            <FormField label="No Telepon">
              <input
                type="tel"
                value={form.phone}
                onChange={(e) => set("phone", e.target.value)}
                placeholder="0812-3456-7890"
                className="form-input"
              />
            </FormField>

            <FormField label="Alamat">
              <textarea
                value={form.address}
                onChange={(e) => set("address", e.target.value)}
                placeholder="Jl. Merdeka No. 10, Jakarta"
                rows={2}
                className="form-input resize-none"
              />
            </FormField>

            <div className="grid grid-cols-2 gap-3">
              <FormField label="Tanggal Lahir">
                <input
                  type="date"
                  value={form.birth_date}
                  onChange={(e) => set("birth_date", e.target.value)}
                  className="form-input"
                />
              </FormField>
              <FormField label="Tanggal Bergabung">
                <input
                  type="date"
                  value={form.join_date}
                  onChange={(e) => set("join_date", e.target.value)}
                  className="form-input"
                />
              </FormField>
            </div>
          </div>
        </PanelSection>

        <PanelDivider />

        <PanelSection title="Penugasan">
          <div className="space-y-3">
            <FormField label="Kendaraan Ditugaskan">
              <select
                value={form.vehicle_id ?? ""}
                onChange={(e) => set("vehicle_id", e.target.value ? parseInt(e.target.value) : null)}
                className="form-input"
              >
                <option value="">— Belum Ditugaskan —</option>
                {FLEET_VEHICLES.map((v) => (
                  <option key={v.id} value={v.id}>
                    {v.plate_number} — {v.brand} {v.model}
                  </option>
                ))}
              </select>
            </FormField>

            <FormField label="Status">
              <select
                value={form.status}
                onChange={(e) => set("status", e.target.value as DriverStatus)}
                className="form-input"
              >
                <option value="active">Aktif</option>
                <option value="off-duty">Bertugas</option>
                <option value="on-leave">Cuti</option>
                <option value="inactive">Nonaktif</option>
              </select>
            </FormField>
          </div>
        </PanelSection>
      </div>

      <div className="pt-4 border-t border-border flex items-center gap-2">
        <Button type="button" variant="ghost" onClick={onCancel} className="flex-1">
          Batal
        </Button>
        <Button type="submit" variant="primary" className="flex-1">
          {initial ? "Simpan Perubahan" : "Tambah Driver"}
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

export default function DriversPage() {
  const { success, error } = useToast();
  const reducedMotion = useReducedMotion();

  const [drivers, setDrivers] = useState<Driver[]>(INITIAL_DRIVERS);
  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState<DriverStatus | "all">("all");
  const [sortField, setSortField] = useState<"name" | "status" | "score">("name");
  const [sortDir, setSortDir] = useState<"asc" | "desc" | "none">("asc");
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [drawerMode, setDrawerMode] = useState<"add" | "edit">("add");
  const [editDriver, setEditDriver] = useState<Driver | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);

  // KPI counts
  const counts = useMemo(() => ({
    total: drivers.length,
    aktif: drivers.filter((d) => d.status === "active").length,
    bertugas: drivers.filter((d) => d.status === "off-duty").length,
    nonaktif: drivers.filter((d) => d.status === "on-leave" || d.status === "inactive").length,
  }), [drivers]);

  // Simulate safety score from driver id
  function getSafetyScore(id: string): number {
    const map: Record<string, number> = {
      D01: 94, D02: 88, D03: 72, D04: 96, D05: 91,
      D06: 85, D07: 90, D08: 78, D09: 93, D10: 81,
      D11: 87, D12: 95, D13: 91, D14: 88, D15: 79,
    };
    return map[id] ?? 80;
  }

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
      if (sortField === "score") cmp = getSafetyScore(a.id) - getSafetyScore(b.id);
      return sortDir === "asc" ? cmp : -cmp;
    });
    return arr;
  }, [rows, sortField, sortDir]);

  function handleSort(field: "name" | "status" | "score") {
    if (field === sortField) {
      setSortDir((p) => (p === "asc" ? "desc" : p === "desc" ? "none" : "asc"));
    } else {
      setSortField(field);
      setSortDir("asc");
    }
  }

  function openAdd() {
    setDrawerMode("add");
    setEditDriver(null);
    setDrawerOpen(true);
  }

  function openEdit(d: Driver) {
    setDrawerMode("edit");
    setEditDriver(d);
    setDrawerOpen(true);
  }

  function closeDrawer() {
    setDrawerOpen(false);
    setEditDriver(null);
  }

  function handleSubmitForm(data: DriverFormData) {
    if (!data.name.trim()) { error("Nama wajib diisi"); return; }
    if (!data.sim_number.trim()) { error("No SIM wajib diisi"); return; }

    if (drawerMode === "add") {
      const newDriver: Driver = {
        id: `D${String(drivers.length + 1).padStart(2, "0")}`,
        name: data.name.trim(),
        sim_number: data.sim_number.trim(),
        phone: data.phone.trim(),
        address: data.address.trim(),
        birth_date: data.birth_date,
        vehicle_id: data.vehicle_id,
        status: data.status,
        join_date: data.join_date,
      };
      setDrivers((prev) => [...prev, newDriver]);
      success(`Driver ${newDriver.name} ditambahkan`);
      closeDrawer();
    } else if (editDriver) {
      setDrivers((prev) =>
        prev.map((d) =>
          d.id === editDriver.id
            ? { ...d, name: data.name.trim(), sim_number: data.sim_number.trim(), phone: data.phone.trim(), address: data.address.trim(), birth_date: data.birth_date, vehicle_id: data.vehicle_id, status: data.status, join_date: data.join_date }
            : d
        )
      );
      success(`Driver ${data.name} diperbarui`);
      closeDrawer();
    }
  }

  function handleDelete(d: Driver) {
    setDrivers((prev) => prev.filter((x) => x.id !== d.id));
    setDeleteConfirm(null);
    success(`Driver ${d.name} dihapus`);
  }

  function handleExport() {
    success("Export CSV", `Mengunduh data ${drivers.length} driver...`);
  }

  function resetFilters() {
    setSearch("");
    setFilterStatus("all");
  }

  const isFiltered = search !== "" || filterStatus !== "all";

  // Map driver vehicle_id → plate_number for display
  const vehicleMap = useMemo(() => {
    const m = new Map<number, string>();
    FLEET_VEHICLES.forEach((v) => m.set(v.id, v.plate_number));
    return m;
  }, []);

  return (
    <div className="h-[calc(100vh-4rem)] flex flex-col overflow-hidden">
      {/* ─── Header ─────────────────────────────────────────────────────────── */}
      <header className="shrink-0 px-6 pt-6 pb-4 border-b border-border bg-surface-1">
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-start gap-6">
            <div>
              <p className="text-label uppercase tracking-wide text-muted">Fleet Management</p>
              <h1 className="text-h1 font-semibold text-foreground mt-0.5">Manajemen Driver</h1>
              <p className="text-sm text-muted mt-0.5">Master data supir dan penugasan kendaraan</p>
            </div>
            {/* KPI inline */}
            <div className="flex items-center gap-1 mt-6">
              <KpiStat label="Total" value={counts.total} />
              <KpiDivider />
              <KpiStat label="Aktif" value={counts.aktif} accent="text-st-driving" />
              <KpiDivider />
              <KpiStat label="Bertugas" value={counts.bertugas} accent="text-brand" />
              <KpiDivider />
              <KpiStat label="Nonaktif" value={counts.nonaktif} accent="text-muted" />
            </div>
          </div>
          <div className="flex items-center gap-2 mt-1">
            <Button variant="secondary" size="sm" icon={<Download className="w-4 h-4" />} onClick={handleExport} aria-label="Export data driver">
              Export
            </Button>
            <Button variant="primary" size="sm" icon={<Plus className="w-4 h-4" />} onClick={openAdd} aria-label="Tambah driver baru">
              Tambah Driver
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
              placeholder="Cari nama, SIM, telepon..."
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
              { key: "active", label: "Aktif" },
              { key: "off-duty", label: "Bertugas" },
              { key: "on-leave", label: "Cuti" },
              { key: "inactive", label: "Nonaktif" },
            ] as { key: DriverStatus | "all"; label: string }[]).map((f) => (
              <button
                key={f.key}
                onClick={() => setFilterStatus(f.key as DriverStatus | "all")}
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
              icon={<User className="w-8 h-8 opacity-40" />}
              title={isFiltered ? "Tidak ada driver" : "Belum ada driver"}
              description={
                isFiltered
                  ? "Tidak ada driver yang cocok dengan filter."
                  : "Tambahkan driver pertama ke armada."
              }
              action={
                isFiltered ? (
                  <Button variant="secondary" size="sm" onClick={resetFilters}>
                    Reset Filter
                  </Button>
                ) : (
                  <Button variant="primary" size="sm" icon={<Plus className="w-4 h-4" />} onClick={openAdd}>
                    Tambah Driver
                  </Button>
                )
              }
            />
          </Card>
        ) : (
          <TableContainer>
            <TableHead>
              <tr>
                <TableHeadCell width={200}
                  sortable sorted={sortField === "name" ? sortDir !== "none" ? sortDir : false : false}
                  onClick={() => handleSort("name")}
                >
                  Nama
                </TableHeadCell>
                <TableHeadCell width={180}>No SIM</TableHeadCell>
                <TableHeadCell width={140}>Telepon</TableHeadCell>
                <TableHeadCell width={130}>Kendaraan</TableHeadCell>
                <TableHeadCell width={100}
                  sortable sorted={sortField === "status" ? sortDir !== "none" ? sortDir : false : false}
                  onClick={() => handleSort("status")}
                >
                  Status
                </TableHeadCell>
                <TableHeadCell width={90}
                  sortable sorted={sortField === "score" ? sortDir !== "none" ? sortDir : false : false}
                  onClick={() => handleSort("score")}
                >
                  Skor
                </TableHeadCell>
                <TableHeadCell width={110}>Bergabung</TableHeadCell>
                <TableHeadCell width={90} className="text-right">Aksi</TableHeadCell>
              </tr>
            </TableHead>
            <TableBody>
              {sorted.map((d) => {
                const isDeleteConfirming = deleteConfirm === d.id;
                const assignedVehicle = d.vehicle_id ? vehicleMap.get(d.vehicle_id) : null;
                return (
                  <TableRow
                    key={d.id}
                    selectable
                    onClick={() => !isDeleteConfirming && openEdit(d)}
                    className="group"
                  >
                    {/* Nama + avatar */}
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <Avatar name={d.name} />
                        <div className="min-w-0">
                          <p className="text-sm font-semibold text-foreground truncate">{d.name}</p>
                          <p className="text-xs text-muted font-mono">{d.id}</p>
                        </div>
                      </div>
                    </TableCell>
                    {/* No SIM */}
                    <TableCell>
                      <span className="font-mono text-xs text-muted">{d.sim_number}</span>
                    </TableCell>
                    {/* Telepon */}
                    <TableCell>
                      <span className="text-sm text-muted">{d.phone || "—"}</span>
                    </TableCell>
                    {/* Kendaraan */}
                    <TableCell>
                      {assignedVehicle ? (
                        <span className="inline-flex items-center gap-1.5 text-xs font-mono font-medium text-foreground">
                          <Truck className="w-3 h-3 text-muted shrink-0" />
                          {assignedVehicle}
                        </span>
                      ) : (
                        <span className="text-xs text-faint">—</span>
                      )}
                    </TableCell>
                    {/* Status badge */}
                    <TableCell>
                      <Badge variant={toBadgeVariant(d.status)}>
                        {statusLabel(d.status)}
                      </Badge>
                    </TableCell>
                    {/* Skor */}
                    <TableCell>
                      <SafetyScore score={getSafetyScore(d.id)} />
                    </TableCell>
                    {/* Bergabung */}
                    <TableCell>
                      <span className="text-xs tabular-nums font-mono text-muted">
                        {d.join_date ? new Date(d.join_date).toLocaleDateString("id-ID", { day: "2-digit", month: "short", year: "2-digit" }) : "—"}
                      </span>
                    </TableCell>
                    {/* Aksi */}
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        {isDeleteConfirming ? (
                          <DeleteConfirm
                            driverName={d.name}
                            onConfirm={() => handleDelete(d)}
                            onCancel={() => setDeleteConfirm(null)}
                          />
                        ) : (
                          <>
                            <IconButton
                              icon={<Edit2 className="w-3.5 h-3.5" />}
                              onClick={(e) => { e.stopPropagation(); openEdit(d); }}
                              variant="ghost"
                              size="sm"
                              aria-label={`Edit ${d.name}`}
                            />
                            <IconButton
                              icon={<Trash2 className="w-3.5 h-3.5" />}
                              onClick={(e) => { e.stopPropagation(); setDeleteConfirm(d.id); }}
                              variant="ghost"
                              size="sm"
                              aria-label={`Hapus ${d.name}`}
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
        title={drawerMode === "add" ? "Tambah Driver" : "Edit Driver"}
        subtitle={drawerMode === "edit" && editDriver ? editDriver.name : undefined}
        width={420}
      >
        <DriverForm
          initial={
            drawerMode === "edit" && editDriver
              ? {
                  name: editDriver.name,
                  sim_number: editDriver.sim_number,
                  phone: editDriver.phone,
                  address: editDriver.address,
                  birth_date: editDriver.birth_date,
                  vehicle_id: editDriver.vehicle_id,
                  status: editDriver.status,
                  join_date: editDriver.join_date,
                }
              : undefined
          }
          onSubmit={handleSubmitForm}
          onCancel={closeDrawer}
        />
      </Panel>
    </div>
  );
}
