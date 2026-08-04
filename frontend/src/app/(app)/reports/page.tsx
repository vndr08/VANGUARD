"use client";

import { useMemo, useState } from "react";
import { motion } from "motion/react";
import {
  Activity,
  BarChart2,
  Calendar,
  Clock,
  Download,
  Droplet,
  FileText,
  Gauge,
  Globe,
  Heart,
  MapPin,
  Plus,
  Route,
  Search,
  Shield,
  Star,
  Trash2,
  X,
  Zap,
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
import { MOCK_VEHICLES } from "@/lib/mock-data";

/* ─── Types ─────────────────────────────────────────────────────────────────── */

type ReportCategory = "operasional" | "perjalanan" | "bahan_bakar" | "driver" | "keamanan" | "geofence";
type ReportFormat = "pdf" | "excel" | "csv";
type ReportStatus = "proses" | "selesai" | "gagal";
type GenerateStatus = "pending" | "running" | "done" | "error";

interface ReportType {
  id: string;
  name: string;
  description: string;
  category: ReportCategory;
  iconName: string;
}

interface GeneratedReport {
  id: string;
  typeId: string;
  typeName: string;
  category: ReportCategory;
  startDate: string;
  endDate: string;
  vehicleFilter: string;
  driverFilter: string;
  format: ReportFormat;
  status: GenerateStatus;
  createdAt: string;
}

/* ─── 15 Report Types ──────────────────────────────────────────────────────── */

const REPORT_TYPES: ReportType[] = [
  // Operasional
  { id: "ringkasan-armada", name: "Ringkasan Armada",       description: "Total kendaraan aktif, utilization rate, breakdown per status",        category: "operasional",   iconName: "Activity" },
  { id: "utilisasi-kendaraan", name: "Utilisasi Kendaraan", description: "Perbandingan utilisasi antar kendaraan dan tren harian",                  category: "operasional",   iconName: "BarChart2" },
  { id: "aktivitas-harian", name: "Aktivitas Harian",       description: "Rekap semua aktivitas kendaraan per hari kerja",                            category: "operasional",   iconName: "Calendar" },
  // Perjalanan
  { id: "riwayat-perjalanan", name: "Riwayat Perjalanan",   description: "Jarak, durasi, waktu mulai/selesai, kecepatan rata-rata per trip",       category: "perjalanan",    iconName: "Route" },
  { id: "jarak-tempuh", name: "Jarak Tempuh",             description: "Total odometer per kendaraan, ranking produktivitas mileage",             category: "perjalanan",    iconName: "Zap" },
  { id: "rekap-rute", name: "Rekap Rute",                 description: "Kemampuan rute vs rute planned, deviasi dan estimasi keterlambatan",     category: "perjalanan",    iconName: "Globe" },
  { id: "pelanggaran-kecepatan", name: "Pelanggaran Kecepatan", description: "Overspeed event dengan lokasi, waktu, dan kendaraan yang terlibat",    category: "perjalanan",    iconName: "Gauge" },
  // Bahan Bakar
  { id: "konsumsi-bbm", name: "Konsumsi BBM",              description: "Volume BBM terpakai, tren konsumsi, dan estimasi biaya operasional",         category: "bahan_bakar",  iconName: "Droplet" },
  { id: "efisiensi-bbm", name: "Efisiensi BBM",            description: "Km per liter, perbandingan antar kendaraan dan standar",                  category: "bahan_bakar",  iconName: "Activity" },
  // Driver
  { id: "kinerja-driver", name: "Kinerja Driver",          description: "Skor safety, trip completed, jam kerja, dan insiden",                     category: "driver",       iconName: "Star" },
  { id: "skor-mengemudi", name: "Skor Mengemudi",         description: "DIMS score — harsh brake, overspeed, fatigue, night driving",           category: "driver",       iconName: "Heart" },
  { id: "jam-kerja", name: "Jam Kerja",                   description: "Waktu kerja aktual, lembur, waktu istirahat, dan regulasi FIFO",           category: "driver",       iconName: "Clock" },
  // Keamanan
  { id: "log-kejadian", name: "Log Kejadian",              description: "Semua alarm event — panic, door, geofence, speeding",                    category: "keamanan",      iconName: "Shield" },
  { id: "insiden-kecelakaan", name: "Insiden/Kecelakaan",  description: "Rekam kejadian accident, sos button, dan bukti video",                 category: "keamanan",      iconName: "AlertTriangle" },
  // Geofence
  { id: "masuk-keluar-zona", name: "Masuk/Keluar Zona",   description: "Event geofence enter/exit per warehouse, depot, dan customer area",     category: "geofence",     iconName: "MapPin" },
];

const CATEGORY_LABELS: Record<ReportCategory, string> = {
  operasional: "Operasional",
  perjalanan: "Perjalanan",
  bahan_bakar: "Bahan Bakar",
  driver: "Driver",
  keamanan: "Keamanan",
  geofence: "Geofence",
};

const CATEGORY_BADGE: Record<ReportCategory, "brand" | "success" | "warning" | "danger" | "default"> = {
  operasional: "brand",
  perjalanan: "success",
  bahan_bakar: "warning",
  driver: "default",
  keamanan: "danger",
  geofence: "success",
};

const STATUS_LABELS: Record<GenerateStatus, string> = {
  pending: "Tertunda",
  running: "Proses",
  done: "Selesai",
  error: "Gagal",
};

const FORMAT_LABELS: Record<ReportFormat, string> = {
  pdf: "PDF",
  excel: "Excel",
  csv: "CSV",
};

/* ─── Icon helper ───────────────────────────────────────────────────────────── */

function getReportIcon(name: string) {
  const icons: Record<string, React.ReactNode> = {
    Activity: <Activity className="w-5 h-5" />,
    BarChart2: <BarChart2 className="w-5 h-5" />,
    Calendar: <Calendar className="w-5 h-5" />,
    Clock: <Clock className="w-5 h-5" />,
    Download: <Download className="w-5 h-5" />,
    Droplet: <Droplet className="w-5 h-5" />,
    FileText: <FileText className="w-5 h-5" />,
    Gauge: <Gauge className="w-5 h-5" />,
    Globe: <Globe className="w-5 h-5" />,
    Heart: <Heart className="w-5 h-5" />,
    MapPin: <MapPin className="w-5 h-5" />,
    Route: <Route className="w-5 h-5" />,
    Shield: <Shield className="w-5 h-5" />,
    Star: <Star className="w-5 h-5" />,
    Trash2: <Trash2 className="w-5 h-5" />,
    Zap: <Zap className="w-5 h-5" />,
  };
  return icons[name] ?? <FileText className="w-5 h-5" />;
}

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
  reportName,
  onConfirm,
  onCancel,
}: {
  reportName: string;
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
        Hapus <strong>{reportName}</strong>?
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

/* ─── Report Form ───────────────────────────────────────────────────────────── */

interface ReportFormData {
  typeId: string;
  startDate: string;
  endDate: string;
  vehicleFilter: string;
  driverFilter: string;
  format: ReportFormat;
}

const EMPTY_FORM: ReportFormData = {
  typeId: "",
  startDate: new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().split("T")[0],
  endDate: new Date().toISOString().split("T")[0],
  vehicleFilter: "",
  driverFilter: "",
  format: "pdf",
};

function ReportForm({
  onSubmit,
  onCancel,
}: {
  onSubmit: (data: ReportFormData) => void;
  onCancel: () => void;
}) {
  const [form, setForm] = useState<ReportFormData>(EMPTY_FORM);

  function set(field: keyof ReportFormData, value: string) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  return (
    <form onSubmit={(e) => { e.preventDefault(); onSubmit(form); }} className="flex flex-col h-full">
      <div className="flex-1 overflow-y-auto">
        <PanelSection title="Jenis Laporan">
          <div className="space-y-3">
            <FormField label="Pilih Jenis Laporan *" required>
              <select
                value={form.typeId}
                onChange={(e) => set("typeId", e.target.value)}
                className="form-input"
                autoFocus
              >
                <option value="">— Pilih jenis laporan —</option>
                {REPORT_TYPES.map((r) => (
                  <option key={r.id} value={r.id}>
                    [{CATEGORY_LABELS[r.category]}] {r.name}
                  </option>
                ))}
              </select>
            </FormField>

            <FormField label="Deskripsi">
              <p className="text-sm text-muted bg-surface-2 border border-border rounded-md px-3 py-2">
                {REPORT_TYPES.find((r) => r.id === form.typeId)?.description ?? "Pilih jenis laporan untuk melihat deskripsi."}
              </p>
            </FormField>
          </div>
        </PanelSection>

        <PanelDivider />

        <PanelSection title="Rentang Tanggal">
          <div className="grid grid-cols-2 gap-3">
            <FormField label="Tanggal Mulai *" required>
              <input
                type="date"
                value={form.startDate}
                onChange={(e) => set("startDate", e.target.value)}
                className="form-input"
              />
            </FormField>
            <FormField label="Tanggal Selesai *" required>
              <input
                type="date"
                value={form.endDate}
                onChange={(e) => set("endDate", e.target.value)}
                className="form-input"
              />
            </FormField>
          </div>
        </PanelSection>

        <PanelDivider />

        <PanelSection title="Filter (Opsional)">
          <div className="space-y-3">
            <FormField label="Kendaraan">
              <select
                value={form.vehicleFilter}
                onChange={(e) => set("vehicleFilter", e.target.value)}
                className="form-input"
              >
                <option value="">Semua Kendaraan</option>
                {MOCK_VEHICLES.slice(0, 10).map((v) => (
                  <option key={v.id} value={String(v.id)}>
                    {v.plate_number} — {v.brand}
                  </option>
                ))}
              </select>
            </FormField>

            <FormField label="Format Output">
              <select
                value={form.format}
                onChange={(e) => set("format", e.target.value)}
                className="form-input"
              >
                <option value="pdf">PDF</option>
                <option value="excel">Excel (.xlsx)</option>
                <option value="csv">CSV</option>
              </select>
            </FormField>
          </div>
        </PanelSection>
      </div>

      <div className="pt-4 border-t border-border flex items-center gap-2">
        <Button type="button" variant="ghost" onClick={onCancel} className="flex-1">
          Batal
        </Button>
        <Button type="submit" variant="primary" className="flex-1" icon={<Download className="w-4 h-4" />}>
          Generate Laporan
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

/* ─── Main Page ─────────────────────────────────────────────────────────────── */

export default function ReportsPage() {
  const { success, error, info } = useToast();
  const reducedMotion = useReducedMotion();

  const [search, setSearch] = useState("");
  const [filterCategory, setFilterCategory] = useState<ReportCategory | "all">("all");
  const [favorites, setFavorites] = useState<Set<string>>(new Set(["ringkasan-armada", "kinerja-driver", "konsumsi-bbm"]));
  const [history, setHistory] = useState<GeneratedReport[]>([]);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);

  // KPI counts
  const counts = useMemo(() => ({
    total: REPORT_TYPES.length,
    bulanIni: Math.max(1, history.length + 3),
    terjadwal: history.filter((h) => h.status === "running" || h.status === "pending").length,
    favorit: favorites.size,
  }), [history, favorites]);

  // Filtered report types
  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return REPORT_TYPES.filter((r) => {
      if (q && !r.name.toLowerCase().includes(q) && !r.description.toLowerCase().includes(q)) return false;
      if (filterCategory !== "all" && r.category !== filterCategory) return false;
      return true;
    });
  }, [search, filterCategory]);

  // Group filtered by category for display
  const grouped = useMemo(() => {
    const cats: Record<ReportCategory, ReportType[]> = {
      operasional: [], perjalanan: [], bahan_bakar: [], driver: [], keamanan: [], geofence: [],
    };
    filtered.forEach((r) => cats[r.category].push(r));
    return cats;
  }, [filtered]);

  function openDrawer() {
    setDrawerOpen(true);
  }

  function closeDrawer() {
    setDrawerOpen(false);
  }

  function handleSubmitForm(data: ReportFormData) {
    if (!data.typeId) { error("Jenis laporan wajib dipilih"); return; }
    if (!data.startDate || !data.endDate) { error("Rentang tanggal wajib diisi"); return; }

    const reportType = REPORT_TYPES.find((r) => r.id === data.typeId)!;
    const newReport: GeneratedReport = {
      id: String(Date.now()),
      typeId: data.typeId,
      typeName: reportType.name,
      category: reportType.category,
      startDate: data.startDate,
      endDate: data.endDate,
      vehicleFilter: data.vehicleFilter,
      driverFilter: data.driverFilter,
      format: data.format,
      status: "running",
      createdAt: new Date().toISOString(),
    };
    setHistory((prev) => [newReport, ...prev]);
    success("Laporan sedang diproses", reportType.name + " dalam antrean.");
    closeDrawer();

    // Mock: complete after 3 seconds
    setTimeout(() => {
      setHistory((prev) =>
        prev.map((h) => h.id === newReport.id ? { ...h, status: "done" as GenerateStatus } : h)
      );
      info("Laporan siap diunduh", reportType.name);
    }, 3000);
  }

  function handleDelete(id: string) {
    setHistory((prev) => prev.filter((h) => h.id !== id));
    setDeleteConfirm(null);
    success("Riwayat laporan dihapus");
  }

  function handleDownload(report: GeneratedReport) {
    info("Mengunduh laporan", `${report.typeName} (${FORMAT_LABELS[report.format]})`);
  }

  function toggleFavorite(id: string) {
    setFavorites((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id); else next.add(id);
      return next;
    });
  }

  function handleExport() {
    success("Export Semua", `Mengunduh arsip ${history.length} laporan...`);
  }

  function resetFilters() {
    setSearch("");
    setFilterCategory("all");
  }

  const isFiltered = search !== "" || filterCategory !== "all";

  const CATEGORIES: ReportCategory[] = ["operasional", "perjalanan", "bahan_bakar", "driver", "keamanan", "geofence"];

  return (
    <div className="h-[calc(100vh-4rem)] flex flex-col overflow-hidden">
      {/* ─── Header ─────────────────────────────────────────────────────────── */}
      <header className="shrink-0 px-6 pt-6 pb-4 border-b border-border bg-surface-1">
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-start gap-6">
            <div>
              <p className="text-label uppercase tracking-wide text-muted">Reporting</p>
              <h1 className="text-h1 font-semibold text-foreground mt-0.5">Pusat Laporan</h1>
              <p className="text-sm text-muted mt-0.5">Katalog laporan dan riwayat generate</p>
            </div>
            <div className="flex items-center gap-1 mt-6">
              <KpiStat label="Total Jenis" value={counts.total} />
              <KpiDivider />
              <KpiStat label="Bulan Ini" value={counts.bulanIni} accent="text-brand" />
              <KpiDivider />
              <KpiStat label="Terjadwal" value={counts.terjadwal} accent="text-st-idle" />
              <KpiDivider />
              <KpiStat label="Favorit" value={counts.favorit} accent="text-st-driving" />
            </div>
          </div>
          <div className="flex items-center gap-2 mt-1">
            <Button variant="secondary" size="sm" icon={<Download className="w-4 h-4" />} onClick={handleExport} aria-label="Export arsip laporan">
              Export
            </Button>
            <Button variant="primary" size="sm" icon={<Plus className="w-4 h-4" />} onClick={openDrawer} aria-label="Buat laporan baru">
              Buat Laporan
            </Button>
          </div>
        </div>
      </header>

      {/* ─── Toolbar ────────────────────────────────────────────────────────── */}
      <div className="shrink-0 px-6 py-3 border-b border-border bg-surface-1">
        <div className="flex flex-wrap items-center gap-3">
          <div className="relative flex-1 min-w-[200px] max-w-xs">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted pointer-events-none" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Cari laporan..."
              className="w-full pl-9 pr-3 py-1.5 text-sm bg-surface-2 border border-border rounded-lg placeholder:text-faint text-foreground focus-visible:outline-2 focus-visible:outline-brand focus-visible:outline-offset-0 transition-colors"
            />
          </div>

          {/* Category filter */}
          <div className="flex items-center gap-1">
            <span className="text-xs text-muted mr-1">Kategori:</span>
            <button
              onClick={() => setFilterCategory("all")}
              className={"px-2.5 py-1 rounded-md text-xs font-medium transition-colors focus-visible:outline-2 focus-visible:outline-brand " + (filterCategory === "all" ? "bg-brand text-white" : "bg-surface-2 text-muted hover:bg-surface-3 hover:text-foreground border border-border")}
            >
              Semua
            </button>
            {CATEGORIES.map((cat) => (
              <button
                key={cat}
                onClick={() => setFilterCategory(cat)}
                className={"px-2.5 py-1 rounded-md text-xs font-medium transition-colors focus-visible:outline-2 focus-visible:outline-brand " + (filterCategory === cat ? "bg-brand text-white" : "bg-surface-2 text-muted hover:bg-surface-3 hover:text-foreground border border-border")}
              >
                {CATEGORY_LABELS[cat]}
              </button>
            ))}
          </div>

          {isFiltered && (
            <button
              onClick={resetFilters}
              className="flex items-center gap-1 px-2.5 py-1.5 rounded-md text-xs font-medium bg-surface-2 border border-border text-muted hover:bg-surface-3 hover:text-foreground focus-visible:outline-2 focus-visible:outline-brand transition-colors"
            >
              <X className="w-3 h-3" />Reset
            </button>
          )}
        </div>
      </div>

      {/* ─── Body ─────────────────────────────────────────────────────────── */}
      <div className="flex-1 overflow-y-auto px-6 py-4">
        <div className="space-y-8">
          {/* ── Katalog Laporan ─────────────────────────────────────────── */}
          <section>
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-label uppercase tracking-wide text-muted">Katalog Laporan</h2>
              <span className="text-xs text-faint">{filtered.length} dari {REPORT_TYPES.length} jenis</span>
            </div>

            {filtered.length === 0 ? (
              <Card padding="md">
                <EmptyState
                  icon={<FileText className="w-8 h-8 opacity-40" />}
                  title="Tidak ada laporan"
                  description="Tidak ada laporan yang cocok dengan filter."
                  action={<Button variant="secondary" size="sm" onClick={resetFilters}>Reset Filter</Button>}
                />
              </Card>
            ) : (
              <div className="space-y-6">
                {CATEGORIES.map((cat) => {
                  const items = grouped[cat];
                  if (!items.length) return null;
                  return (
                    <div key={cat}>
                      <div className="flex items-center gap-2 mb-2">
                        <Badge variant={CATEGORY_BADGE[cat]}>{CATEGORY_LABELS[cat]}</Badge>
                        <div className="flex-1 h-px bg-border" />
                      </div>
                      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                        {items.map((r) => {
                          const isFav = favorites.has(r.id);
                          return (
                            <Card key={r.id} padding="md" className="group hover:border-border-strong transition-colors">
                              <div className="flex items-start justify-between gap-2">
                                <div className="w-9 h-9 rounded-lg bg-surface-2 flex items-center justify-center text-muted shrink-0">
                                  {getReportIcon(r.iconName)}
                                </div>
                                <button
                                  onClick={() => toggleFavorite(r.id)}
                                  className={"shrink-0 p-1 rounded transition-colors focus-visible:outline-2 focus-visible:outline-brand " + (isFav ? "text-st-driving" : "text-faint hover:text-foreground")}
                                  aria-label={isFav ? "Hapus dari favorit" : "Tambah ke favorit"}
                                >
                                  <Star className={"w-4 h-4 " + (isFav ? "fill-current" : "")} />
                                </button>
                              </div>
                              <h3 className="mt-3 text-sm font-semibold text-foreground">{r.name}</h3>
                              <p className="mt-1 text-xs text-muted leading-relaxed line-clamp-2">{r.description}</p>
                              <Button
                                variant="secondary"
                                size="sm"
                                className="mt-3 w-full"
                                icon={<Download className="w-3.5 h-3.5" />}
                                onClick={openDrawer}
                              >
                                Generate
                              </Button>
                            </Card>
                          );
                        })}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </section>

          {/* ── Riwayat Laporan ────────────────────────────────────────────── */}
          <section>
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-label uppercase tracking-wide text-muted">Riwayat Laporan</h2>
              <span className="text-xs text-faint">{history.length} laporan</span>
            </div>

            {history.length === 0 ? (
              <Card padding="none">
                <EmptyState
                  icon={<FileText className="w-8 h-8 opacity-40" />}
                  title="Belum ada riwayat laporan"
                  description="Generate laporan pertama menggunakan katalog di atas."
                  action={
                    <Button variant="primary" size="sm" icon={<Plus className="w-4 h-4" />} onClick={openDrawer}>
                      Buat Laporan
                    </Button>
                  }
                />
              </Card>
            ) : (
              <TableContainer>
                <TableHead>
                  <tr>
                    <TableHeadCell width={200}>Nama Laporan</TableHeadCell>
                    <TableHeadCell width={100}>Kategori</TableHeadCell>
                    <TableHeadCell width={160}>Rentang Tanggal</TableHeadCell>
                    <TableHeadCell width={80}>Format</TableHeadCell>
                    <TableHeadCell width={140}>Dibuat</TableHeadCell>
                    <TableHeadCell width={80}>Status</TableHeadCell>
                    <TableHeadCell width={90} className="text-right">Aksi</TableHeadCell>
                  </tr>
                </TableHead>
                <TableBody>
                  {history.map((h) => {
                    const isDeleteConfirming = deleteConfirm === h.id;
                    const isPending = h.status === "running" || h.status === "pending";
                    return (
                      <TableRow key={h.id} className="group">
                        {/* Nama */}
                        <TableCell>
                          <span className="text-sm font-medium text-foreground">{h.typeName}</span>
                        </TableCell>
                        {/* Kategori */}
                        <TableCell>
                          <Badge variant={CATEGORY_BADGE[h.category]}>{CATEGORY_LABELS[h.category]}</Badge>
                        </TableCell>
                        {/* Rentang */}
                        <TableCell>
                          <span className="text-xs font-mono tabular-nums text-muted">
                            {new Date(h.startDate).toLocaleDateString("id-ID", { day: "2-digit", month: "short" })} – {new Date(h.endDate).toLocaleDateString("id-ID", { day: "2-digit", month: "short", year: "2-digit" })}
                          </span>
                        </TableCell>
                        {/* Format */}
                        <TableCell>
                          <span className="text-xs font-mono text-muted">{FORMAT_LABELS[h.format]}</span>
                        </TableCell>
                        {/* Dibuat */}
                        <TableCell>
                          <span className="text-xs font-mono tabular-nums text-muted">
                            {new Date(h.createdAt).toLocaleDateString("id-ID", { day: "2-digit", month: "short", year: "2-digit", hour: "2-digit", minute: "2-digit" })}
                          </span>
                        </TableCell>
                        {/* Status */}
                        <TableCell>
                          <Badge variant={
                            h.status === "done" ? "success" :
                            h.status === "running" ? "warning" :
                            h.status === "error" ? "danger" : "default"
                          }>
                            {STATUS_LABELS[h.status]}
                          </Badge>
                        </TableCell>
                        {/* Aksi */}
                        <TableCell className="text-right">
                          <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                            {isDeleteConfirming ? (
                              <DeleteConfirm
                                reportName={h.typeName}
                                onConfirm={() => handleDelete(h.id)}
                                onCancel={() => setDeleteConfirm(null)}
                              />
                            ) : (
                              <>
                                <IconButton
                                  icon={<Download className="w-3.5 h-3.5" />}
                                  onClick={() => handleDownload(h)}
                                  variant="ghost"
                                  size="sm"
                                  aria-label={"Unduh " + h.typeName}
                                  disabled={isPending}
                                />
                                <IconButton
                                  icon={<Trash2 className="w-3.5 h-3.5" />}
                                  onClick={() => setDeleteConfirm(h.id)}
                                  variant="ghost"
                                  size="sm"
                                  aria-label={"Hapus " + h.typeName}
                                  className="hover:text-st-offline"
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
          </section>
        </div>
      </div>

      {/* ─── Drawer Panel ──────────────────────────────────────────────────── */}
      <Panel
        open={drawerOpen}
        onClose={closeDrawer}
        title="Buat Laporan"
        subtitle="Pilih jenis dan rentang tanggal"
        width={420}
      >
        <ReportForm onSubmit={handleSubmitForm} onCancel={closeDrawer} />
      </Panel>
    </div>
  );
}
