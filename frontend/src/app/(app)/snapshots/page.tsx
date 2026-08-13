"use client";

import { useMemo, useState } from "react";
import { motion } from "motion/react";
import {
  Camera,
  Download,
  Plus,
  Search,
  Trash2,
  X,
} from "lucide-react";
import { useToast } from "@/components/ui/Toast";
import { Badge } from "@/components/ui/Badge";
import { Button, IconButton } from "@/components/ui/Button";
import { Panel, PanelSection, PanelDivider } from "@/components/ui/Panel";
import { Card, Skeleton, EmptyState } from "@/components/ui/Card";
import { useReducedMotion } from "@/hooks/useReducedMotion";
import { FLEET_VEHICLES } from "@/lib/fleet-data";

/* ─── Types ─────────────────────────────────────────────────────────────────── */

type CameraPos = "Depan" | "Kabin" | "Belakang";
type SnapshotStatus = "Tersedia" | "Memproses" | "Gagal";

interface Snapshot {
  id: string;
  vehicleId: number;
  camera: CameraPos;
  timestamp: string;
  status: SnapshotStatus;
  event: string;
  address: string;
}

/* ─── Status config ─────────────────────────────────────────────────────────── */

const STATUS_BADGE: Record<SnapshotStatus, "success" | "warning" | "danger"> = {
  Tersedia: "success",
  Memproses: "warning",
  Gagal: "danger",
};

const CAMERA_GRADIENTS: Record<CameraPos, string> = {
  Depan: "from-surface-2 to-surface-3",
  Kabin: "from-surface-3 to-surface-2",
  Belakang: "from-surface-2 to-bg",
};

const CAMERA_ICON_BG: Record<CameraPos, string> = {
  Depan: "bg-brand",
  Kabin: "bg-st-idle",
  Belakang: "bg-st-driving",
};

/* ─── Mock data ─────────────────────────────────────────────────────────────── */

const INITIAL_SNAPSHOTS: Snapshot[] = [
  { id: "1",  vehicleId: 1,  camera: "Depan",   timestamp: "2026-06-20T09:42:00", status: "Tersedia", event: "Bukti arrival",           address: "Jababeka Gate 2, Bekasi" },
  { id: "2",  vehicleId: 2,  camera: "Depan",   timestamp: "2026-06-20T09:28:00", status: "Tersedia", event: "Peringatan kecepatan",    address: "Tol Cikampek KM32" },
  { id: "3",  vehicleId: 10, camera: "Kabin",   timestamp: "2026-06-20T08:51:00", status: "Tersedia", event: "Berhenti BBM",            address: "SPBU Cikampek" },
  { id: "4",  vehicleId: 6,  camera: "Belakang",timestamp: "2026-06-20T08:35:00", status: "Tersedia", event: "Mesin mati",             address: "Rest Area KM57" },
  { id: "5",  vehicleId: 13, camera: "Depan",   timestamp: "2026-06-20T07:58:00", status: "Tersedia", event: "Gate customer",            address: "Bekasi Timur" },
  { id: "6",  vehicleId: 7,  camera: "Belakang",timestamp: "2026-06-20T07:12:00", status: "Tersedia", event: "Masuk geofence",          address: "Gedebage, Bandung" },
  { id: "7",  vehicleId: 4,  camera: "Kabin",   timestamp: "2026-06-20T06:45:00", status: "Tersedia", event: "Bukti arrival",           address: "Rungkut Industrial" },
  { id: "8",  vehicleId: 3,  camera: "Depan",   timestamp: "2026-06-20T06:22:00", status: "Tersedia", event: "Masuk geofence",          address: "Tanjung Priok Port" },
  { id: "9",  vehicleId: 8,  camera: "Belakang",timestamp: "2026-06-19T18:10:00", status: "Tersedia", event: "Keluar geofence",         address: "Warehouse Cikarang" },
  { id: "10", vehicleId: 15, camera: "Kabin",   timestamp: "2026-06-19T17:45:00", status: "Tersedia", event: "Peringatan kecepatan",    address: "Tol Cipularang KM25" },
  { id: "11", vehicleId: 17, camera: "Depan",   timestamp: "2026-06-19T16:30:00", status: "Gagal",    event: "Kamera offline",          address: "Sentul City" },
  { id: "12", vehicleId: 19, camera: "Belakang",timestamp: "2026-06-19T15:05:00", status: "Tersedia", event: "Bukti delivery",          address: "Tangerang Logistik Hub" },
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
        className={"text-xl font-bold tabular-nums " + (accent ?? "text-foreground")}
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

/* ─── Thumbnail placeholder ─────────────────────────────────────────────────── */

function SnapshotThumb({ camera, status }: { camera: CameraPos; status: SnapshotStatus }) {
  return (
    <div className={"relative w-full aspect-video bg-gradient-to-br " + CAMERA_GRADIENTS[camera]}>
      {/* Gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
      {/* Camera icon centered */}
      <div className="absolute inset-0 flex items-center justify-center">
        <div className={"w-12 h-12 rounded-full " + CAMERA_ICON_BG[camera] + " flex items-center justify-center"}>
          <Camera className="w-6 h-6 text-white" />
        </div>
      </div>
      {/* Camera position badge */}
      <div className="absolute top-2.5 left-2.5">
        <span className="inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-bold bg-black/60 text-white backdrop-blur-sm uppercase tracking-wide">
          {camera}
        </span>
      </div>
      {/* Status badge */}
      {status === "Memproses" && (
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-black/70 backdrop-blur-sm">
            <div className="w-3 h-3 rounded-full border-2 border-white/60 border-t-white animate-spin" />
            <span className="text-xs font-semibold text-white">Memproses...</span>
          </div>
        </div>
      )}
      {status === "Gagal" && (
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-st-offline/80 backdrop-blur-sm">
            <X className="w-3.5 h-3.5 text-white" />
            <span className="text-xs font-semibold text-white">Gagal</span>
          </div>
        </div>
      )}
    </div>
  );
}

/* ─── Delete Confirm ─────────────────────────────────────────────────────────── */

function DeleteConfirm({
  snapshotId,
  onConfirm,
  onCancel,
}: {
  snapshotId: string;
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
        Hapus snapshot ini?
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

/* ─── Take Snapshot Form ─────────────────────────────────────────────────────── */

interface SnapshotFormData {
  vehicleId: string;
  camera: CameraPos;
}

function SnapshotForm({
  onSubmit,
  onCancel,
}: {
  onSubmit: (data: SnapshotFormData) => void;
  onCancel: () => void;
}) {
  const [form, setForm] = useState<SnapshotFormData>({ vehicleId: "", camera: "Depan" });

  return (
    <form onSubmit={(e) => { e.preventDefault(); onSubmit(form); }} className="flex flex-col h-full">
      <div className="flex-1 overflow-y-auto">
        <PanelSection title="Pilih Kendaraan">
          <div className="space-y-3">
            <FormField label="Unit *" required>
              <select
                value={form.vehicleId}
                onChange={(e) => setForm((p) => ({ ...p, vehicleId: e.target.value }))}
                className="form-input"
                autoFocus
              >
                <option value="">— Pilih kendaraan —</option>
                {FLEET_VEHICLES.map((v) => (
                  <option key={v.id} value={String(v.id)}>
                    {v.plate_number} — {v.brand} {v.model}
                  </option>
                ))}
              </select>
            </FormField>
          </div>
        </PanelSection>

        <PanelDivider />

        <PanelSection title="Posisi Kamera">
          <div className="space-y-3">
            <FormField label="Kamera *" required>
              <div className="grid grid-cols-3 gap-2">
                {(["Depan", "Kabin", "Belakang"] as CameraPos[]).map((pos) => (
                  <button
                    key={pos}
                    type="button"
                    onClick={() => setForm((p) => ({ ...p, camera: pos }))}
                    className={
                      "flex flex-col items-center gap-1.5 px-3 py-3 rounded-lg border text-sm font-semibold transition-all focus-visible:outline-2 focus-visible:outline-brand " +
                      (form.camera === pos
                        ? "bg-brand border-brand text-white"
                        : "bg-surface-2 border-border text-muted hover:bg-surface-3 hover:text-foreground")
                    }
                    aria-pressed={form.camera === pos}
                  >
                    <Camera className="w-5 h-5" />
                    {pos}
                  </button>
                ))}
              </div>
            </FormField>
          </div>
        </PanelSection>
      </div>

      <div className="pt-4 border-t border-border flex items-center gap-2">
        <Button type="button" variant="ghost" onClick={onCancel} className="flex-1">
          Batal
        </Button>
        <Button type="submit" variant="primary" className="flex-1" icon={<Camera className="w-4 h-4" />}>
          Ambil Snapshot
        </Button>
      </div>
    </form>
  );
}

function FormField({ label, required, children }: { label: string; required?: boolean; children: React.ReactNode }) {
  return (
    <div>
      <label className="block text-sm font-medium text-muted mb-1.5">
        {label}{required && <span className="text-st-offline ml-0.5">*</span>}
      </label>
      {children}
    </div>
  );
}

/* ─── Lightbox ─────────────────────────────────────────────────────────────── */

function Lightbox({
  snapshot,
  vehicle,
  onClose,
  onDownload,
}: {
  snapshot: Snapshot;
  vehicle: { plate_number: string; driver_name: string | null };
  onClose: () => void;
  onDownload: () => void;
}) {
  const time = new Date(snapshot.timestamp);
  const dateStr = time.toLocaleDateString("id-ID", { day: "2-digit", month: "short", year: "numeric" });
  const hourStr = time.toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" });

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4"
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
      role="dialog"
      aria-modal="true"
      aria-label={"Pratinjau snapshot " + vehicle.plate_number}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.15 }}
        className="w-full max-w-3xl bg-surface-1 border border-border rounded-xl shadow-2xl overflow-hidden"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-border">
          <div>
            <p className="text-label uppercase tracking-wide text-muted">Pratinjau Snapshot</p>
            <h2 className="text-lg font-semibold text-foreground mt-0.5">
              {vehicle.plate_number} — {snapshot.event}
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-lg text-muted hover:bg-surface-2 hover:text-foreground
                       focus-visible:outline-2 focus-visible:outline-brand transition-colors"
            aria-label="Tutup pratinjau"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Image placeholder */}
        <div className="relative w-full aspect-video bg-gradient-to-br from-surface-2 to-surface-3 flex items-center justify-center">
          <div className={"w-16 h-16 rounded-full " + CAMERA_ICON_BG[snapshot.camera] + " flex items-center justify-center"}>
            <Camera className="w-8 h-8 text-white" />
          </div>
          {/* Time overlay */}
          <div className="absolute bottom-3 left-4">
            <span className="px-2.5 py-1 rounded-md bg-black/70 backdrop-blur-sm text-xs font-bold text-white font-mono tabular-nums">
              {dateStr} {hourStr}
            </span>
          </div>
          {/* Camera badge */}
          <div className="absolute top-3 right-4">
            <span className={"px-2.5 py-1 rounded-md text-xs font-bold text-white " + CAMERA_ICON_BG[snapshot.camera]}>
              Kamera {snapshot.camera}
            </span>
          </div>
        </div>

        {/* Metadata */}
        <div className="px-5 py-4">
          <div className="grid grid-cols-2 gap-3">
            <div className="rounded bg-surface-2 border border-border px-3 py-2">
              <p className="text-[9px] font-semibold uppercase tracking-widest text-muted">Unit</p>
              <p className="text-sm font-semibold font-mono text-foreground mt-0.5">{vehicle.plate_number}</p>
            </div>
            <div className="rounded bg-surface-2 border border-border px-3 py-2">
              <p className="text-[9px] font-semibold uppercase tracking-widest text-muted">Driver</p>
              <p className="text-sm font-semibold text-foreground mt-0.5">{vehicle.driver_name || "—"}</p>
            </div>
            <div className="rounded bg-surface-2 border border-border px-3 py-2">
              <p className="text-[9px] font-semibold uppercase tracking-widest text-muted">Event</p>
              <p className="text-sm font-semibold text-foreground mt-0.5">{snapshot.event}</p>
            </div>
            <div className="rounded bg-surface-2 border border-border px-3 py-2">
              <p className="text-[9px] font-semibold uppercase tracking-widest text-muted">Lokasi</p>
              <p className="text-xs font-semibold text-foreground mt-0.5 truncate">{snapshot.address}</p>
            </div>
          </div>
          <div className="mt-3 flex items-center gap-2">
            <Button
              variant="primary"
              size="sm"
              icon={<Download className="w-4 h-4" />}
              onClick={onDownload}
              className="flex-1"
              aria-label="Unduh snapshot"
            >
              Unduh Full Resolution
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={onClose}
              aria-label="Tutup pratinjau"
            >
              Tutup
            </Button>
          </div>
        </div>
      </motion.div>
    </div>
  );
}

/* ─── Main Page ─────────────────────────────────────────────────────────────── */

export default function SnapshotsPage() {
  const { success, error, info } = useToast();
  const reducedMotion = useReducedMotion();

  const [snapshots, setSnapshots] = useState<Snapshot[]>(INITIAL_SNAPSHOTS);
  const [search, setSearch] = useState("");
  const [filterCamera, setFilterCamera] = useState<CameraPos | "all">("all");
  const [filterVehicle, setFilterVehicle] = useState<string>("all");
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
  const [lightbox, setLightbox] = useState<Snapshot | null>(null);

  // Vehicle lookup map
  const vehicleMap = useMemo(() => {
    const m = new Map<number, typeof FLEET_VEHICLES[0]>();
    FLEET_VEHICLES.forEach((v) => m.set(v.id, v));
    return m;
  }, []);

  // KPI counts
  const counts = useMemo(() => ({
    total: snapshots.length,
    hariIni: snapshots.filter((s) => s.timestamp.startsWith("2026-06-20")).length,
    aktifKamera: new Set(snapshots.filter((s) => s.status === "Tersedia").map((s) => s.vehicleId)).size,
    tertunda: snapshots.filter((s) => s.status === "Memproses").length,
  }), [snapshots]);

  // Filtered rows
  const rows = useMemo(() => {
    const q = search.trim().toLowerCase();
    return snapshots.filter((s) => {
      const v = vehicleMap.get(s.vehicleId);
      if (q && v && !v.plate_number.toLowerCase().includes(q)
        && !(v.driver_name ?? "").toLowerCase().includes(q)
        && !s.event.toLowerCase().includes(q)) return false;
      if (filterCamera !== "all" && s.camera !== filterCamera) return false;
      if (filterVehicle !== "all" && String(s.vehicleId) !== filterVehicle) return false;
      return true;
    });
  }, [snapshots, search, filterCamera, filterVehicle, vehicleMap]);

  function openDrawer() {
    setDrawerOpen(true);
  }

  function closeDrawer() {
    setDrawerOpen(false);
  }

  function handleTakeSnapshot(data: SnapshotFormData) {
    if (!data.vehicleId) { error("Kendaraan wajib dipilih"); return; }

    const vehicleId = parseInt(data.vehicleId);
    const newSnapshot: Snapshot = {
      id: String(Date.now()),
      vehicleId,
      camera: data.camera,
      timestamp: new Date().toISOString(),
      status: "Memproses",
      event: "Snapshot manual",
      address: "Lokasi saat ini",
    };
    setSnapshots((prev) => [newSnapshot, ...prev]);
    success("Snapshot diambil", `${vehicleMap.get(vehicleId)?.plate_number ?? ""} — Kamera ${data.camera}`);
    closeDrawer();

    // Mock: complete after 2.5s
    setTimeout(() => {
      setSnapshots((prev) =>
        prev.map((s) => s.id === newSnapshot.id ? { ...s, status: "Tersedia" as SnapshotStatus } : s)
      );
      info("Snapshot siap", `${vehicleMap.get(vehicleId)?.plate_number ?? ""} — Kamera ${data.camera}`);
    }, 2500);
  }

  function handleDelete(s: Snapshot) {
    setSnapshots((prev) => prev.filter((x) => x.id !== s.id));
    if (lightbox?.id === s.id) setLightbox(null);
    setDeleteConfirm(null);
    success("Snapshot dihapus");
  }

  function handleDownload(s: Snapshot) {
    const v = vehicleMap.get(s.vehicleId);
    info("Mengunduh snapshot", `${v?.plate_number ?? ""} — ${s.event}`);
  }

  function handleLightboxDownload() {
    if (!lightbox) return;
    handleDownload(lightbox);
  }

  function resetFilters() {
    setSearch("");
    setFilterCamera("all");
    setFilterVehicle("all");
  }

  const isFiltered = search !== "" || filterCamera !== "all" || filterVehicle !== "all";

  return (
    <div className="h-[calc(100vh-4rem)] flex flex-col overflow-hidden">
      {/* ─── Header ─────────────────────────────────────────────────────────── */}
      <header className="shrink-0 px-6 pt-6 pb-4 border-b border-border bg-surface-1">
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-start gap-6">
            <div>
              <p className="text-label uppercase tracking-wide text-muted">Fleet Management</p>
              <h1 className="text-h1 font-semibold text-foreground mt-0.5">Camera Snapshot</h1>
              <p className="text-sm text-muted mt-0.5">Ambil dan galeri foto bukti dari kamera unit armada</p>
            </div>
            <div className="flex items-center gap-1 mt-6">
              <KpiStat label="Total" value={counts.total} />
              <KpiDivider />
              <KpiStat label="Hari Ini" value={counts.hariIni} accent="text-brand" />
              <KpiDivider />
              <KpiStat label="Unit Aktif" value={counts.aktifKamera} accent="text-st-driving" />
              <KpiDivider />
              <KpiStat label="Tertunda" value={counts.tertunda} accent={counts.tertunda > 0 ? "text-st-idle" : undefined} />
            </div>
          </div>
          <div className="flex items-center gap-2 mt-1">
            <Button
              variant="primary"
              size="sm"
              icon={<Camera className="w-4 h-4" />}
              onClick={openDrawer}
              aria-label="Ambil snapshot baru"
            >
              Ambil Snapshot
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
              placeholder="Plat, driver, atau event..."
              className="w-full pl-9 pr-3 py-1.5 text-sm bg-surface-2 border border-border rounded-lg
                         placeholder:text-faint text-foreground
                         focus-visible:outline-2 focus-visible:outline-brand focus-visible:outline-offset-0
                         transition-colors"
              aria-label="Cari snapshot"
            />
          </div>

          {/* Camera filter */}
          <div className="flex items-center gap-1">
            <span className="text-xs text-muted mr-1">Kamera:</span>
            {(["all", "Depan", "Kabin", "Belakang"] as (CameraPos | "all")[]).map((f) => (
              <button
                key={f}
                onClick={() => setFilterCamera(f)}
                className={"px-2.5 py-1 rounded-md text-xs font-medium transition-colors focus-visible:outline-2 focus-visible:outline-brand " +
                  (filterCamera === f
                    ? "bg-brand text-white"
                    : "bg-surface-2 text-muted hover:bg-surface-3 hover:text-foreground border border-border")}
              >
                {f === "all" ? "Semua" : f}
              </button>
            ))}
          </div>

          {/* Vehicle filter */}
          <select
            value={filterVehicle}
            onChange={(e) => setFilterVehicle(e.target.value)}
            className="text-xs bg-surface-2 border border-border rounded-md px-2.5 py-1.5
                       text-foreground focus-visible:outline-2 focus-visible:outline-brand cursor-pointer"
            aria-label="Filter unit"
          >
            <option value="all">Semua Unit</option>
            {FLEET_VEHICLES.slice(0, 15).map((v) => (
              <option key={v.id} value={String(v.id)}>{v.plate_number}</option>
            ))}
          </select>

          {isFiltered && (
            <button
              onClick={resetFilters}
              className="flex items-center gap-1 px-2.5 py-1.5 rounded-md text-xs font-medium
                         bg-surface-2 border border-border text-muted
                         hover:bg-surface-3 hover:text-foreground
                         focus-visible:outline-2 focus-visible:outline-brand transition-colors"
            >
              <X className="w-3 h-3" />Reset
            </button>
          )}
        </div>
      </div>

      {/* ─── Gallery ─────────────────────────────────────────────────────── */}
      <div className="flex-1 overflow-y-auto px-6 py-4">
        {rows.length === 0 ? (
          <Card padding="none">
            <EmptyState
              icon={<Camera className="w-8 h-8 opacity-40" />}
              title={isFiltered ? "Tidak ada snapshot" : "Belum ada snapshot"}
              description={
                isFiltered
                  ? "Tidak ada snapshot yang cocok dengan filter."
                  : "Ambil snapshot pertama dari kamera unit armada."
              }
              action={
                isFiltered ? (
                  <Button variant="secondary" size="sm" onClick={resetFilters}>Reset Filter</Button>
                ) : (
                  <Button variant="primary" size="sm" icon={<Camera className="w-4 h-4" />} onClick={openDrawer}>
                    Ambil Snapshot
                  </Button>
                )
              }
            />
          </Card>
        ) : (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {rows.map((s) => {
              const v = vehicleMap.get(s.vehicleId);
              const isDeleteConfirming = deleteConfirm === s.id;
              const time = new Date(s.timestamp);
              const dateStr = time.toLocaleDateString("id-ID", { day: "2-digit", month: "short", year: "numeric" });
              const hourStr = time.toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" });

              return (
                <Card key={s.id} padding="none" className="overflow-hidden group">
                  {/* Thumbnail */}
                  <SnapshotThumb camera={s.camera} status={s.status} />

                  {/* Info */}
                  <div className="p-3 space-y-2">
                    {/* Plat + Status */}
                    <div className="flex items-center justify-between gap-2">
                      <span className="font-mono font-bold text-sm text-foreground truncate">
                        {v?.plate_number ?? "Unit #" + s.vehicleId}
                      </span>
                      <Badge variant={STATUS_BADGE[s.status]} className="shrink-0">
                        {s.status}
                      </Badge>
                    </div>

                    {/* Camera + Event */}
                    <p className="text-xs text-muted truncate">
                      Kamera {s.camera} &middot; {s.event}
                    </p>

                    {/* Driver */}
                    <p className="text-xs text-faint truncate">
                      {v?.driver_name || "—"}
                    </p>

                    {/* Timestamp */}
                    <p className="text-xs font-mono tabular-nums text-faint">
                      {dateStr} {hourStr}
                    </p>

                    {/* Actions */}
                    <div className="flex items-center gap-1.5 pt-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      {isDeleteConfirming ? (
                        <DeleteConfirm
                          snapshotId={s.id}
                          onConfirm={() => handleDelete(s)}
                          onCancel={() => setDeleteConfirm(null)}
                        />
                      ) : (
                        <>
                          <Button
                            size="sm"
                            variant="secondary"
                            icon={<Camera className="w-3.5 h-3.5" />}
                            onClick={() => setLightbox(s)}
                            aria-label={"Lihat snapshot " + (v?.plate_number ?? "")}
                            className="flex-1"
                          >
                            Lihat
                          </Button>
                          <IconButton
                            icon={<Download className="w-3.5 h-3.5" />}
                            onClick={() => handleDownload(s)}
                            variant="ghost"
                            size="sm"
                            aria-label={"Unduh snapshot " + (v?.plate_number ?? "")}
                            disabled={s.status !== "Tersedia"}
                          />
                          <IconButton
                            icon={<Trash2 className="w-3.5 h-3.5" />}
                            onClick={() => setDeleteConfirm(s.id)}
                            variant="ghost"
                            size="sm"
                            aria-label={"Hapus snapshot " + (v?.plate_number ?? "")}
                            className="hover:text-st-offline"
                          />
                        </>
                      )}
                    </div>
                  </div>
                </Card>
              );
            })}
          </div>
        )}
      </div>

      {/* ─── Take Snapshot Drawer ────────────────────────────────────────── */}
      <Panel
        open={drawerOpen}
        onClose={closeDrawer}
        title="Ambil Snapshot"
        subtitle="Pilih unit dan posisi kamera"
        width={420}
      >
        <SnapshotForm onSubmit={handleTakeSnapshot} onCancel={closeDrawer} />
      </Panel>

      {/* ─── Lightbox ─────────────────────────────────────────────────────── */}
      {lightbox && (
        <Lightbox
          snapshot={lightbox}
          vehicle={{
            plate_number: vehicleMap.get(lightbox.vehicleId)?.plate_number ?? "Unit #" + lightbox.vehicleId,
            driver_name: vehicleMap.get(lightbox.vehicleId)?.driver_name ?? null,
          }}
          onClose={() => setLightbox(null)}
          onDownload={handleLightboxDownload}
        />
      )}
    </div>
  );
}
