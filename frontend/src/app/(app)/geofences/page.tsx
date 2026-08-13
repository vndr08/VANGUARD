"use client";

import { useMemo, useState } from "react";
import dynamic from "next/dynamic";
import { motion } from "motion/react";
import {
  Download,
  Edit2,
  Eye,
  EyeOff,
  MapPin,
  MapPinned,
  Plus,
  Search,
  Trash2,
  X,
} from "lucide-react";
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

type ZoneType = "Depot" | "Customer" | "Port" | "Checkpoint";
type ZoneStatus = "active" | "inactive";
type ZoneShape = "circle" | "polygon";

interface Geofence {
  id: string;
  name: string;
  type: ZoneType;
  shape: ZoneShape;
  lat: number;
  lng: number;
  radius: number; // meters
  color: string;
  status: ZoneStatus;
  units: number;
  notes: string;
}

/* ─── Type config ───────────────────────────────────────────────────────────── */

const TYPE_COLORS: Record<ZoneType, string> = {
  Depot: "bg-st-driving",
  Customer: "bg-brand",
  Port: "bg-st-idle",
  Checkpoint: "bg-st-stop",
};

const ZONE_COLORS = [
  "#10B981",
  "#3B82F6",
  "#8B5CF6",
  "#F59E0B",
  "#EF4444",
  "#EC4899",
  "#06B6D4",
  "#84CC16",
];

/* ─── Initial mock data ─────────────────────────────────────────────────────── */

const INITIAL_ZONES: Geofence[] = [
  { id: "1", name: "Warehouse Cikarang",    type: "Depot",      shape: "circle", lat: -6.4523, lng: 107.1234, radius: 650,  color: "#10B981", status: "active",   units: 7, notes: "Gudang utama Cikarang" },
  { id: "2", name: "Jababeka Customer Area", type: "Customer",  shape: "circle", lat: -6.4256, lng: 107.1567, radius: 420,  color: "#3B82F6", status: "active",   units: 4, notes: "Area customer Jababeka" },
  { id: "3", name: "Tanjung Priok Gate 4",   type: "Port",      shape: "circle", lat: -6.0989, lng: 106.8901, radius: 900,  color: "#8B5CF6", status: "active",   units: 3, notes: "Gerbang masuk pelabuhan" },
  { id: "4", name: "Rest Area KM57",          type: "Checkpoint",shape: "circle", lat: -6.7234, lng: 108.4567, radius: 300,  color: "#F59E0B", status: "inactive", units: 2, notes: "Rest area Km57 Tol Cipali" },
  { id: "5", name: "MM2100 Industrial",       type: "Customer",  shape: "circle", lat: -6.3823, lng: 107.0890, radius: 550,  color: "#EF4444", status: "active",   units: 5, notes: "Kawasan industri MM2100" },
  { id: "6", name: "Sentul City Depot",       type: "Depot",     shape: "circle", lat: -6.5678, lng: 106.8234, radius: 400,  color: "#EC4899", status: "active",   units: 3, notes: "Depot Sentul City" },
  { id: "7", name: "Bintaro Trade Center",    type: "Customer",  shape: "circle", lat: -6.2256, lng: 106.7456, radius: 350,  color: "#06B6D4", status: "active",   units: 6, notes: "Pusat niaga Bintaro" },
  { id: "8", name: "Tangerang Logistik Hub",  type: "Depot",     shape: "circle", lat: -6.1789, lng: 106.6234, radius: 700,  color: "#84CC16", status: "active",   units: 9, notes: "Hub logistik Tangerang" },
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

/* ─── Delete Confirm ─────────────────────────────────────────────────────────── */

function DeleteConfirm({
  zoneName,
  onConfirm,
  onCancel,
}: {
  zoneName: string;
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
      <span className="text-sm text-foreground flex-1 truncate">
        Hapus <strong>{zoneName}</strong>?
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

/* ─── Zone Form ─────────────────────────────────────────────────────────────── */

interface ZoneFormData {
  name: string;
  type: ZoneType;
  shape: ZoneShape;
  lat: string;
  lng: string;
  radius: string;
  color: string;
  status: ZoneStatus;
  notes: string;
}

const EMPTY_FORM: ZoneFormData = {
  name: "", type: "Depot", shape: "circle",
  lat: "-6.2000", lng: "106.8000", radius: "500",
  color: "#10B981", status: "active", notes: "",
};

function ZoneForm({
  initial,
  onSubmit,
  onCancel,
}: {
  initial?: ZoneFormData;
  onSubmit: (data: ZoneFormData) => void;
  onCancel: () => void;
}) {
  const [form, setForm] = useState<ZoneFormData>(initial ?? EMPTY_FORM);

  function set(field: keyof ZoneFormData, value: string) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  return (
    <form onSubmit={(e) => { e.preventDefault(); onSubmit(form); }} className="flex flex-col h-full">
      <div className="flex-1 overflow-y-auto">
        <PanelSection title="Info Zona">
          <div className="space-y-3">
            <FormField label="Nama Zona *" required>
              <input type="text" value={form.name} onChange={(e) => set("name", e.target.value)}
                placeholder="cth: Warehouse Cikarang" className="form-input" autoFocus />
            </FormField>
            <div className="grid grid-cols-2 gap-3">
              <FormField label="Tipe">
                <select value={form.type} onChange={(e) => set("type", e.target.value)} className="form-input">
                  <option value="Depot">Depot</option>
                  <option value="Customer">Customer</option>
                  <option value="Port">Port</option>
                  <option value="Checkpoint">Checkpoint</option>
                </select>
              </FormField>
              <FormField label="Bentuk">
                <select value={form.shape} onChange={(e) => set("shape", e.target.value)} className="form-input">
                  <option value="circle">Lingkaran</option>
                  <option value="polygon">Poligon</option>
                </select>
              </FormField>
            </div>
            <div className="grid grid-cols-3 gap-3">
              <FormField label="Latitude *">
                <input type="number" step="0.0001" value={form.lat}
                  onChange={(e) => set("lat", e.target.value)} className="form-input" />
              </FormField>
              <FormField label="Longitude *">
                <input type="number" step="0.0001" value={form.lng}
                  onChange={(e) => set("lng", e.target.value)} className="form-input" />
              </FormField>
              <FormField label="Radius (m)">
                <input type="number" min="1" value={form.radius}
                  onChange={(e) => set("radius", e.target.value)} className="form-input" />
              </FormField>
            </div>
          </div>
        </PanelSection>

        <PanelDivider />

        <PanelSection title="Tampilan">
          <div className="space-y-3">
            <FormField label="Warna Zona">
              <div className="flex flex-wrap gap-2">
                {ZONE_COLORS.map((c) => (
                  <button key={c} type="button"
                    onClick={() => set("color", c)}
                    className={"w-7 h-7 rounded-full border-2 transition-all " + (form.color === c ? "border-foreground scale-110" : "border-border hover:scale-105")}
                    style={{ backgroundColor: c }}
                    aria-label={"Pilih warna " + c}
                  />
                ))}
              </div>
            </FormField>
            <FormField label="Status">
              <select value={form.status} onChange={(e) => set("status", e.target.value)} className="form-input">
                <option value="active">Aktif</option>
                <option value="inactive">Nonaktif</option>
              </select>
            </FormField>
            <FormField label="Catatan">
              <textarea value={form.notes} onChange={(e) => set("notes", e.target.value)}
                placeholder="Keterangan tambahan..." rows={2} className="form-input resize-none" />
            </FormField>
          </div>
        </PanelSection>
      </div>

      <div className="pt-4 border-t border-border flex items-center gap-2">
        <Button type="button" variant="ghost" onClick={onCancel} className="flex-1">Batal</Button>
        <Button type="submit" variant="primary" className="flex-1">
          {initial ? "Simpan Perubahan" : "Tambah Zona"}
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

/* ─── Geofence Map Preview (lazy, SSR-safe) ─────────────────────────────────── */

const GeofenceMapPreview = dynamic(() => import("@/components/map/MapView").then((m) => {
  return function GeofenceMapInner({ zones, selectedId }: { zones: Geofence[]; selectedId: string | null }) {
    // Convert zones to MapVehicle shape — cast to any to bypass strict Vehicle extension fields
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const vehicles: any[] = zones
      .filter((z) => z.status === "active")
      .map((z) => ({
        id: parseInt(z.id) || 0,
        plate_number: z.name.slice(0, 12),
        status: "stop" as const,
        displayStatus: "stop" as const,
        lat: z.lat,
        lng: z.lng,
        displayLat: z.lat,
        displayLng: z.lng,
        heading: 0,
        displayHeading: 0,
        speed: 0,
        fuel_level: 0,
        odometer: 0,
        vehicle_type: "truck",
        brand: z.type,
        model: "",
        year: 2024,
        latitude: z.lat,
        longitude: z.lng,
        engine_on: false,
        last_update: "",
        driver_name: null,
      }));

    return (
      <m.default
        vehicles={vehicles}
        selectedId={selectedId ? parseInt(selectedId) : null}
        className="w-full h-full"
        zoom={10}
        pitch={30}
      />
    );
  };
}), { ssr: false });

/* ─── Main Page ─────────────────────────────────────────────────────────────── */

export default function GeofencesPage() {
  const { success, error } = useToast();
  const reducedMotion = useReducedMotion();

  const [zones, setZones] = useState<Geofence[]>(INITIAL_ZONES);
  const [selected, setSelected] = useState<Geofence | null>(null);
  const [search, setSearch] = useState("");
  const [filterType, setFilterType] = useState<ZoneType | "all">("all");
  const [filterStatus, setFilterStatus] = useState<ZoneStatus | "all">("all");
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [drawerMode, setDrawerMode] = useState<"add" | "edit">("add");
  const [editZone, setEditZone] = useState<Geofence | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);

  const counts = useMemo(() => ({
    total: zones.length,
    aktif: zones.filter((z) => z.status === "active").length,
    circle: zones.filter((z) => z.shape === "circle").length,
    polygon: zones.filter((z) => z.shape === "polygon").length,
  }), [zones]);

  const rows = useMemo(() => {
    const q = search.trim().toLowerCase();
    return zones.filter((z) => {
      if (q && !z.name.toLowerCase().includes(q)) return false;
      if (filterType !== "all" && z.type !== filterType) return false;
      if (filterStatus !== "all" && z.status !== filterStatus) return false;
      return true;
    });
  }, [zones, search, filterType, filterStatus]);

  function openAdd() {
    setDrawerMode("add");
    setEditZone(null);
    setDrawerOpen(true);
  }

  function openEdit(z: Geofence) {
    setDrawerMode("edit");
    setEditZone(z);
    setDrawerOpen(true);
  }

  function closeDrawer() {
    setDrawerOpen(false);
    setEditZone(null);
  }

  function handleSubmitForm(data: ZoneFormData) {
    if (!data.name.trim()) { error("Nama zona wajib diisi"); return; }
    const lat = parseFloat(data.lat);
    const lng = parseFloat(data.lng);
    if (isNaN(lat) || isNaN(lng)) { error("Koordinat pusat wajib diisi"); return; }

    if (drawerMode === "add") {
      const newZone: Geofence = {
        id: String(zones.length + 1),
        name: data.name.trim(),
        type: data.type,
        shape: data.shape,
        lat, lng,
        radius: parseInt(data.radius) || 500,
        color: data.color,
        status: data.status,
        units: 0,
        notes: data.notes.trim(),
      };
      setZones((prev) => [...prev, newZone]);
      success("Zona " + newZone.name + " ditambahkan");
      closeDrawer();
    } else if (editZone) {
      setZones((prev) =>
        prev.map((z) =>
          z.id === editZone.id
            ? { ...z, name: data.name.trim(), type: data.type, shape: data.shape, lat, lng, radius: parseInt(data.radius) || 500, color: data.color, status: data.status, notes: data.notes.trim() }
            : z
        )
      );
      success("Zona " + data.name + " diperbarui");
      closeDrawer();
    }
  }

  function handleDelete(z: Geofence) {
    setZones((prev) => prev.filter((x) => x.id !== z.id));
    if (selected?.id === z.id) setSelected(null);
    setDeleteConfirm(null);
    success("Zona " + z.name + " dihapus");
  }

  function handleToggle(z: Geofence) {
    const newStatus: ZoneStatus = z.status === "active" ? "inactive" : "active";
    setZones((prev) => prev.map((x) => x.id === z.id ? { ...x, status: newStatus } : x));
  }

  function handleExport() {
    // Export functionality in development
  }

  function resetFilters() {
    setSearch("");
    setFilterType("all");
    setFilterStatus("all");
  }

  const isFiltered = search !== "" || filterType !== "all" || filterStatus !== "all";

  return (
    <div className="h-[calc(100vh-4rem)] flex flex-col overflow-hidden">
      {/* ─── Header ─────────────────────────────────────────────────────────── */}
      <header className="shrink-0 px-6 pt-6 pb-4 border-b border-border bg-surface-1">
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-start gap-6">
            <div>
              <p className="text-label uppercase tracking-wide text-muted">Fleet Management</p>
              <h1 className="text-h1 font-semibold text-foreground mt-0.5">Manajemen Geofence</h1>
              <p className="text-sm text-muted mt-0.5">Zona monitoring arrival, departure &amp; dwell time</p>
            </div>
            <div className="flex items-center gap-1 mt-6">
              <KpiStat label="Total" value={counts.total} />
              <KpiDivider />
              <KpiStat label="Aktif" value={counts.aktif} accent="text-st-driving" />
              <KpiDivider />
              <KpiStat label="Lingkaran" value={counts.circle} />
              <KpiDivider />
              <KpiStat label="Poligon" value={counts.polygon} />
            </div>
          </div>
          <div className="flex items-center gap-2 mt-1">
            <Button variant="secondary" size="sm" icon={<Download className="w-4 h-4" />} onClick={handleExport} aria-label="Export data geofence">
              Export
            </Button>
            <Button variant="primary" size="sm" icon={<Plus className="w-4 h-4" />} onClick={openAdd} aria-label="Tambah zona baru">
              Tambah Zona
            </Button>
          </div>
        </div>
      </header>

      {/* ─── Toolbar ────────────────────────────────────────────────────────── */}
      <div className="shrink-0 px-6 py-3 border-b border-border bg-surface-1">
        <div className="flex flex-wrap items-center gap-3">
          <div className="relative flex-1 min-w-[200px] max-w-xs">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted pointer-events-none" />
            <input type="text" value={search} onChange={(e) => setSearch(e.target.value)}
              placeholder="Cari nama zona..."
              className="w-full pl-9 pr-3 py-1.5 text-sm bg-surface-2 border border-border rounded-lg placeholder:text-faint text-foreground focus-visible:outline-2 focus-visible:outline-brand focus-visible:outline-offset-0 transition-colors" />
          </div>

          {/* Type filter */}
          <div className="flex items-center gap-1">
            <span className="text-sm text-muted mr-2">Tipe:</span>
            {(["all", "Depot", "Customer", "Port", "Checkpoint"] as (ZoneType | "all")[]).map((f) => (
              <button key={f} onClick={() => setFilterType(f)}
                className={"px-3 py-1.5 rounded-md text-sm font-medium transition-colors focus-visible:outline-2 focus-visible:outline-brand " + (filterType === f ? "bg-brand text-white" : "bg-surface-2 text-muted hover:bg-surface-3 hover:text-foreground border border-border")}>
                {f === "all" ? "Semua" : f}
              </button>
            ))}
          </div>

          {/* Status filter */}
          <div className="flex items-center gap-1">
            <span className="text-sm text-muted mr-2">Status:</span>
            {(["all", "active", "inactive"] as (ZoneStatus | "all")[]).map((f) => (
              <button key={f} onClick={() => setFilterStatus(f)}
                className={"px-3 py-1.5 rounded-md text-sm font-medium transition-colors focus-visible:outline-2 focus-visible:outline-brand " + (filterStatus === f ? "bg-brand text-white" : "bg-surface-2 text-muted hover:bg-surface-3 hover:text-foreground border border-border")}>
                {f === "all" ? "Semua" : f === "active" ? "Aktif" : "Nonaktif"}
              </button>
            ))}
          </div>

          {isFiltered && (
            <button onClick={resetFilters}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm font-medium bg-surface-2 border border-border text-muted hover:bg-surface-3 hover:text-foreground focus-visible:outline-2 focus-visible:outline-brand transition-colors">
              <X className="w-4 h-4" />Reset
            </button>
          )}
        </div>
      </div>

      {/* ─── Content: 2-column ────────────────────────────────────────────── */}
      <div className="flex-1 overflow-hidden flex">
        {/* ── LEFT: Zone list ──────────────────────────────────────────────── */}
        <div className="w-[420px] shrink-0 border-r border-border flex flex-col overflow-hidden bg-surface-1">
          {rows.length === 0 ? (
            <div className="flex-1 flex items-center justify-center p-6">
              <EmptyState
                icon={<MapPinned className="w-8 h-8 opacity-40" />}
                title={isFiltered ? "Tidak ada zona" : "Belum ada zona"}
                description={isFiltered ? "Tidak ada zona yang cocok dengan filter." : "Tambahkan zona pertama."}
                action={isFiltered ? (
                  <Button variant="secondary" size="sm" onClick={resetFilters}>Reset Filter</Button>
                ) : (
                  <Button variant="primary" size="sm" icon={<Plus className="w-4 h-4" />} onClick={openAdd}>Tambah Zona</Button>
                )}
              />
            </div>
          ) : (
            <div className="flex-1 overflow-y-auto">
              <TableContainer scrollable={false} className="[&_td]:!py-4 [&_th]:!py-4">
                <TableHead>
                  <tr>
                    <TableHeadCell width={160}>Nama Zona</TableHeadCell>
                    <TableHeadCell width={80}>Tipe</TableHeadCell>
                    <TableHeadCell width={80}>Radius</TableHeadCell>
                    <TableHeadCell width={60} className="text-right">Unit</TableHeadCell>
                    <TableHeadCell width={50} className="text-right">Aksi</TableHeadCell>
                  </tr>
                </TableHead>
                <TableBody>
                  {rows.map((z) => {
                    const isDeleteConfirming = deleteConfirm === z.id;
                    return (
                      <TableRow
                        key={z.id}
                        selectable
                        selected={selected?.id === z.id}
                        onClick={() => setSelected(isDeleteConfirming ? null : (selected?.id === z.id ? null : z))}
                        className="group"
                      >
                        {/* Nama */}
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: z.color }} />
                            <div className="min-w-0">
                              <p className="text-base font-bold text-foreground truncate">{z.name}</p>
                              <p className="text-sm font-mono tabular-nums text-muted">
                                {z.lat.toFixed(4)}, {z.lng.toFixed(4)}
                              </p>
                            </div>
                          </div>
                        </TableCell>
                        {/* Tipe */}
                        <TableCell>
                          <Badge variant={TYPE_COLORS[z.type].replace("bg-", "") as "brand" | "success" | "warning" | "default"} className="text-sm font-medium">
                            {z.type}
                          </Badge>
                        </TableCell>
                        {/* Radius */}
                        <TableCell>
                          <span className="text-sm font-mono tabular-nums font-medium text-foreground">{z.radius}m</span>
                        </TableCell>
                        {/* Units */}
                        <TableCell className="text-right">
                          <span className="text-sm font-mono tabular-nums font-semibold text-foreground">{z.units}</span>
                        </TableCell>
                        {/* Aksi */}
                        <TableCell className="text-right">
                          <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                            {isDeleteConfirming ? (
                              <DeleteConfirm
                                zoneName={z.name}
                                onConfirm={() => handleDelete(z)}
                                onCancel={() => setDeleteConfirm(null)}
                              />
                            ) : (
                              <>
                                <IconButton
                                  icon={<Edit2 className="w-4 h-4" />}
                                  onClick={(e) => { e.stopPropagation(); openEdit(z); }}
                                  variant="ghost" size="sm" aria-label={"Edit " + z.name}
                                />
                                <IconButton
                                  icon={<Trash2 className="w-4 h-4" />}
                                  onClick={(e) => { e.stopPropagation(); setDeleteConfirm(z.id); }}
                                  variant="ghost" size="sm" aria-label={"Hapus " + z.name}
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
            </div>
          )}
        </div>

        {/* ── RIGHT: Map preview ─────────────────────────────────────────── */}
        <div className="flex-1 relative overflow-hidden bg-bg">
          {selected ? (
            <>
              <GeofenceMapPreview zones={zones} selectedId={selected.id} />
              {/* Selected zone overlay card */}
              <div className="absolute top-4 right-4 z-dock w-[320px]">
                <Card padding="md">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-2 min-w-0">
                      <span className="w-3 h-3 rounded-full shrink-0" style={{ backgroundColor: selected.color }} />
                      <h3 className="text-sm font-semibold text-foreground truncate">{selected.name}</h3>
                    </div>
                    <button onClick={() => setSelected(null)} className="shrink-0 p-1 rounded text-muted hover:bg-surface-2 focus-visible:outline-2 focus-visible:outline-brand" aria-label="Tutup pratinjau">
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                  <div className="mt-3 grid grid-cols-2 gap-2">
                    <div className="rounded bg-surface-2 border border-border px-2.5 py-1.5">
                      <p className="text-[9px] font-semibold uppercase tracking-widest text-muted">Tipe</p>
                      <p className="text-xs font-medium text-foreground mt-0.5">{selected.type}</p>
                    </div>
                    <div className="rounded bg-surface-2 border border-border px-2.5 py-1.5">
                      <p className="text-[9px] font-semibold uppercase tracking-widest text-muted">Radius</p>
                      <p className="text-xs font-mono tabular-nums font-medium text-foreground mt-0.5">{selected.radius}m</p>
                    </div>
                    <div className="rounded bg-surface-2 border border-border px-2.5 py-1.5">
                      <p className="text-[9px] font-semibold uppercase tracking-widest text-muted">Unit</p>
                      <p className="text-xs font-semibold text-foreground mt-0.5">{selected.units} kendaraan</p>
                    </div>
                    <div className="rounded bg-surface-2 border border-border px-2.5 py-1.5">
                      <p className="text-[9px] font-semibold uppercase tracking-widest text-muted">Status</p>
                      <Badge variant={selected.status === "active" ? "success" : "default"} className="mt-0.5">
                        {selected.status === "active" ? "Aktif" : "Nonaktif"}
                      </Badge>
                    </div>
                  </div>
                  <div className="mt-2 rounded bg-surface-2 border border-border px-2.5 py-1.5">
                    <p className="text-[9px] font-semibold uppercase tracking-widest text-muted">Koordinat</p>
                    <p className="text-xs font-mono tabular-nums text-foreground mt-0.5">
                      {selected.lat.toFixed(6)}, {selected.lng.toFixed(6)}
                    </p>
                  </div>
                  {selected.notes && (
                    <div className="mt-2 rounded bg-surface-2 border border-border px-2.5 py-1.5">
                      <p className="text-[9px] font-semibold uppercase tracking-widest text-muted">Catatan</p>
                      <p className="text-xs text-muted mt-0.5">{selected.notes}</p>
                    </div>
                  )}
                  <div className="mt-3 flex items-center gap-2">
                    <Button size="sm" variant="primary" icon={<Edit2 className="w-3.5 h-3.5" />} onClick={() => openEdit(selected)} className="flex-1">
                      Edit
                    </Button>
                    <IconButton
                      icon={selected.status === "active" ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                      onClick={() => handleToggle(selected)}
                      variant="ghost" size="sm"
                      aria-label={selected.status === "active" ? "Nonaktifkan zona" : "Aktifkan zona"}
                    />
                    <IconButton
                      icon={<Trash2 className="w-3.5 h-3.5" />}
                      onClick={() => setDeleteConfirm(selected.id)}
                      variant="ghost" size="sm"
                      aria-label={"Hapus " + selected.name}
                      className="hover:text-st-offline"
                    />
                  </div>
                </Card>
              </div>
            </>
          ) : (
            <div className="absolute inset-0 flex items-center justify-center">
              <EmptyState
                icon={<MapPin className="w-8 h-8 opacity-40" />}
                title="Pilih zona untuk pratinjau"
                description="Klik zona di daftar untuk melihat lokasi di peta."
                action={
                  <Button variant="primary" size="sm" icon={<Plus className="w-4 h-4" />} onClick={openAdd}>
                    Tambah Zona
                  </Button>
                }
              />
            </div>
          )}
        </div>
      </div>

      {/* ─── Drawer Panel ──────────────────────────────────────────────────── */}
      <Panel
        open={drawerOpen}
        onClose={closeDrawer}
        title={drawerMode === "add" ? "Tambah Zona" : "Edit Zona"}
        subtitle={drawerMode === "edit" && editZone ? editZone.name : undefined}
        width={420}
      >
        <ZoneForm
          initial={
            drawerMode === "edit" && editZone
              ? {
                  name: editZone.name,
                  type: editZone.type,
                  shape: editZone.shape,
                  lat: String(editZone.lat),
                  lng: String(editZone.lng),
                  radius: String(editZone.radius),
                  color: editZone.color,
                  status: editZone.status,
                  notes: editZone.notes,
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
