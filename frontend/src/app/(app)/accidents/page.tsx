"use client";

import { useState, useMemo, useCallback } from "react";
import { motion } from "motion/react";
import {
  AlertTriangle,
  Plus,
  Search,
  Filter,
  RotateCcw,
  MapPin,
  Calendar,
  Truck,
  User,
  FileText,
  Eye,
  Pencil,
  Trash2,
  Clock,
  CheckCircle,
  ShieldAlert,
} from "lucide-react";

import { useToast } from "@/components/ui";
import { useReducedMotion } from "@/hooks/useReducedMotion";
import { Button, IconButton } from "@/components/ui";
import { Badge } from "@/components/ui";
import { Panel, PanelSection, PanelDivider } from "@/components/ui";
import {
  TableContainer,
  TableHead,
  TableHeadCell,
  TableBody,
  TableRow,
  TableCell,
} from "@/components/ui";
import { Card, EmptyState } from "@/components/ui";
import { MOCK_VEHICLES } from "@/lib/mock-data";
interface Incident {
  id: number;
  vehicleId: number;
  driverName: string;
  dateTime: string;
  location: string;
  type: "Tabrakan" | "Selip" | "Ban Pecah" | "Mogok" | "Lainnya";
  severity: "Ringan" | "Sedang" | "Berat";
  status: "Baru" | "Ditangani" | "Selesai";
  description: string;
  hasVictim: boolean;
  estimatedLoss: number;
}

const MOCK_INCIDENTS: Incident[] = [
  {
    id: 1,
    vehicleId: 1,
    driverName: "Budi Santoso",
    dateTime: "2026-06-19T08:30:00Z",
    location: "Jl. Sudirman KM 45, Jakarta",
    type: "Tabrakan",
    severity: "Sedang",
    status: "Ditangani",
    description: "Tabrakan ringan dengan kendaraan pribadi saat maneuver di perempatan.",
    hasVictim: false,
    estimatedLoss: 2500000,
  },
  {
    id: 2,
    vehicleId: 3,
    driverName: "Ahmad Hidayat",
    dateTime: "2026-06-18T14:15:00Z",
    location: "Jl. Gatot Subroto KM 12, Bandung",
    type: "Selip",
    severity: "Ringan",
    status: "Selesai",
    description: "Kendaraan slip di tikungan jalan tol akibat hujan deras.",
    hasVictim: false,
    estimatedLoss: 500000,
  },
  {
    id: 3,
    vehicleId: 5,
    driverName: "Dedi Kurniawan",
    dateTime: "2026-06-17T22:45:00Z",
    location: "Jl. Pantura KM 78, Cirebon",
    type: "Ban Pecah",
    severity: "Ringan",
    status: "Selesai",
    description: "Ban depan kiri pecah saat beroperasi di jalan rusak.",
    hasVictim: false,
    estimatedLoss: 1200000,
  },
  {
    id: 4,
    vehicleId: 2,
    driverName: "Eko Prasetyo",
    dateTime: "2026-06-20T06:00:00Z",
    location: "Jl. Tol Jakarta-Cikampek KM 35",
    type: "Tabrakan",
    severity: "Berat",
    status: "Baru",
    description: "Tabrakan beruntun di jalan tol. Kerusakan berat di bagian depan dan samping kanan.",
    hasVictim: true,
    estimatedLoss: 15000000,
  },
  {
    id: 5,
    vehicleId: 8,
    driverName: "Fajar Nugroho",
    dateTime: "2026-06-16T11:20:00Z",
    location: "Jl. Surabaya-Malang KM 25",
    type: "Mogok",
    severity: "Sedang",
    status: "Ditangani",
    description: "Mesin mati total akibat masalah sistem bahan bakar.",
    hasVictim: false,
    estimatedLoss: 3500000,
  },
  {
    id: 6,
    vehicleId: 4,
    driverName: "Gunawan Wijaya",
    dateTime: "2026-06-15T09:10:00Z",
    location: "Jl. Yos Sudarso, Semarang",
    type: "Tabrakan",
    severity: "Sedang",
    status: "Selesai",
    description: "Hantaman dari belakang oleh kendaraan ringan saat berhenti di lampu merah.",
    hasVictim: false,
    estimatedLoss: 4200000,
  },
  {
    id: 7,
    vehicleId: 6,
    driverName: "Hendra Kusuma",
    dateTime: "2026-06-14T16:30:00Z",
    location: "Jl. Medan-Banda Aceh KM 120",
    type: "Selip",
    severity: "Ringan",
    status: "Selesai",
    description: "Slip di area parkir yang basah.",
    hasVictim: false,
    estimatedLoss: 800000,
  },
  {
    id: 8,
    vehicleId: 7,
    driverName: "Irfan Hakim",
    dateTime: "2026-06-13T08:00:00Z",
    location: "Jl. Balikpapan-Samarinda KM 55",
    type: "Lainnya",
    severity: "Sedang",
    status: "Ditangani",
    description: "Benda tajam menancap di ban saat melewati jalan konstruksi.",
    hasVictim: false,
    estimatedLoss: 1800000,
  },
  {
    id: 9,
    vehicleId: 10,
    driverName: "Joko Widodo",
    dateTime: "2026-06-12T19:45:00Z",
    location: "Jl. Makassar-Toraja KM 88",
    type: "Mogok",
    severity: "Ringan",
    status: "Selesai",
    description: "Akumulator soak dan tidak bisa di-hydrol.",
    hasVictim: false,
    estimatedLoss: 600000,
  },
  {
    id: 10,
    vehicleId: 9,
    driverName: "Kurniawan Adi",
    dateTime: "2026-06-11T13:25:00Z",
    location: "Jl. Denpasar-Singaraja KM 42",
    type: "Ban Pecah",
    severity: "Sedang",
    status: "Selesai",
    description: "Ban belakang kanan pecah di jalan berbatu.",
    hasVictim: false,
    estimatedLoss: 950000,
  },
];

// Utility functions
function formatDate(isoString: string): string {
  return new Date(isoString).toLocaleDateString("id-ID", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function formatCurrency(amount: number): string {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
  }).format(amount);
}

function getSeverityVariant(severity: Incident["severity"]) {
  switch (severity) {
    case "Ringan": return "success";
    case "Sedang": return "warning";
    case "Berat": return "danger";
    default: return "default";
  }
}

function getStatusVariant(status: Incident["status"]) {
  switch (status) {
    case "Baru": return "danger";
    case "Ditangani": return "warning";
    case "Selesai": return "success";
    default: return "default";
  }
}

// Mini Map Placeholder Component
interface MiniMapPlaceholderProps {
  location: string;
}

function MiniMapPlaceholder({ location }: MiniMapPlaceholderProps) {
  return (
    <div className="aspect-video w-full rounded-lg bg-gradient-to-br from-surface-2 to-surface-3 flex flex-col items-center justify-center relative overflow-hidden">
      <MapPin className="w-12 h-12 text-brand mb-2" />
      <p className="text-sm text-muted-foreground text-center px-4">{location}</p>
      <p className="absolute bottom-2 text-xs text-muted-foreground/60">Lokasi Kejadian</p>
    </div>
  );
}

// Delete Confirm Component
interface DeleteConfirmProps {
  onConfirm: () => void;
  onCancel: () => void;
  useReducedMotion: boolean;
}

function DeleteConfirm({ onConfirm, onCancel, useReducedMotion }: DeleteConfirmProps) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: useReducedMotion ? 0 : 0.15 }}
      className="absolute inset-0 bg-background/95 backdrop-blur-sm flex flex-col items-center justify-center p-6 z-10 rounded-lg">
      <div className="w-12 h-12 rounded-full bg-danger/10 flex items-center justify-center mb-4">
        <AlertTriangle className="w-6 h-6 text-danger" />
      </div>
      <h3 className="text-lg font-semibold mb-2">Hapus Insiden?</h3>
      <p className="text-sm text-muted-foreground text-center mb-6">
        Anda yakin ingin menghapus insiden ini? Tindakan ini tidak dapat dibatalkan.
      </p>
      <div className="flex gap-3 w-full">
        <Button variant="secondary" onClick={onCancel} className="flex-1">
          Batal
        </Button>
        <Button variant="danger" onClick={onConfirm} className="flex-1">
          Hapus
        </Button>
      </div>
    </motion.div>
  );
}

// KPI Stat Component
interface KpiStatProps {
  label: string;
  value: number | string;
  icon: React.ReactNode;
  useReducedMotion: boolean;
  delay?: number;
}

function KpiStat({ label, value, icon, useReducedMotion, delay = 0 }: KpiStatProps) {
  return (
    <div className="flex items-center gap-3">
      <div className="w-10 h-10 rounded-lg bg-brand/10 flex items-center justify-center text-brand shrink-0">
        {icon}
      </div>
      <div>
        <motion.span
          className="text-2xl font-bold"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: useReducedMotion ? 0 : 0.3, delay: delay * 0.05 }}
        >
          {value}
        </motion.span>
        <p className="text-xs text-muted-foreground">{label}</p>
      </div>
    </div>
  );
}

// KPI Divider
function KpiDivider() {
  return <div className="w-px h-8 bg-border mx-2" />;
}

// Incident Form Component
interface IncidentFormProps {
  incident?: Incident | null;
  vehicleMap: Map<number, typeof MOCK_VEHICLES[0]>;
  onSave: (data: Omit<Incident, "id">) => void;
  onDelete?: () => void;
  onStatusChange?: (status: Incident["status"]) => void;
  useReducedMotion: boolean;
}

function IncidentForm({ incident, vehicleMap, onSave, onDelete, onStatusChange, useReducedMotion }: IncidentFormProps) {
  const toast = useToast();
  const [formData, setFormData] = useState({
    vehicleId: incident?.vehicleId ?? 0,
    dateTime: incident?.dateTime ?? new Date().toISOString(),
    type: incident?.type ?? "Tabrakan" as Incident["type"],
    severity: incident?.severity ?? "Sedang" as Incident["severity"],
    location: incident?.location ?? "",
    description: incident?.description ?? "",
    hasVictim: incident?.hasVictim ?? false,
    estimatedLoss: incident?.estimatedLoss ?? 0,
  });
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const driverName = useMemo(() => {
    if (!formData.vehicleId) return "";
    const vehicle = vehicleMap.get(formData.vehicleId);
    return vehicle?.driver_name ?? "";
  }, [formData.vehicleId, vehicleMap]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.vehicleId) {
      toast.error("Unit kendaraan harus dipilih");
      return;
    }
    if (!formData.dateTime) {
      toast.error("Tanggal dan waktu harus diisi");
      return;
    }
    if (!formData.type) {
      toast.error("Jenis insiden harus dipilih");
      return;
    }
    if (!formData.severity) {
      toast.error("Tingkat keparahan harus dipilih");
      return;
    }
    onSave({
      ...formData,
      driverName,
    } as Omit<Incident, "id">);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <PanelSection>
        <h3 className="text-sm font-medium mb-3">Informasi Unit</h3>
        <select
          value={formData.vehicleId}
          onChange={(e) => setFormData({ ...formData, vehicleId: Number(e.target.value) })}
          className="w-full px-3 py-2 rounded-lg border border-border bg-background text-sm focus:outline-none focus-visible:outline-2 focus-visible:outline-brand"
          aria-label="Pilih Unit Kendaraan"
        >
          <option value={0}>-- Pilih Unit --</option>
          {MOCK_VEHICLES.map((v) => (
            <option key={v.id} value={v.id}>
              {v.plate_number} - {v.driver_name ?? "Tanpa driver"}
            </option>
          ))}
        </select>
        {driverName && (
          <p className="text-xs text-muted-foreground mt-1 flex items-center gap-1">
            <User className="w-3 h-3" /> Driver: {driverName}
          </p>
        )}
      </PanelSection>

      <PanelDivider />

      <PanelSection>
        <h3 className="text-sm font-medium mb-3">Detail Kejadian</h3>
        <div className="space-y-3">
          <div>
            <label className="text-xs text-muted-foreground mb-1 block">Tanggal & Waktu</label>
            <input
              type="datetime-local"
              value={formData.dateTime.slice(0, 16)}
              onChange={(e) => setFormData({ ...formData, dateTime: new Date(e.target.value).toISOString() })}
              className="w-full px-3 py-2 rounded-lg border border-border bg-background text-sm focus:outline-none focus-visible:outline-2 focus-visible:outline-brand"
              aria-label="Tanggal dan Waktu Kejadian"
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs text-muted-foreground mb-1 block">Jenis</label>
              <select
                value={formData.type}
                onChange={(e) => setFormData({ ...formData, type: e.target.value as Incident["type"] })}
                className="w-full px-3 py-2 rounded-lg border border-border bg-background text-sm focus:outline-none focus-visible:outline-2 focus-visible:outline-brand"
              >
                <option value="Tabrakan">Tabrakan</option>
                <option value="Selip">Selip</option>
                <option value="Ban Pecah">Ban Pecah</option>
                <option value="Mogok">Mogok</option>
                <option value="Lainnya">Lainnya</option>
              </select>
            </div>
            <div>
              <label className="text-xs text-muted-foreground mb-1 block">Severity</label>
              <select
                value={formData.severity}
                onChange={(e) => setFormData({ ...formData, severity: e.target.value as Incident["severity"] })}
                className="w-full px-3 py-2 rounded-lg border border-border bg-background text-sm focus:outline-none focus-visible:outline-2 focus-visible:outline-brand"
              >
                <option value="Ringan">Ringan</option>
                <option value="Sedang">Sedang</option>
                <option value="Berat">Berat</option>
              </select>
            </div>
          </div>
          <div>
            <label className="text-xs text-muted-foreground mb-1 block">Lokasi</label>
            <input
              type="text"
              value={formData.location}
              onChange={(e) => setFormData({ ...formData, location: e.target.value })}
              placeholder="Contoh: Jl. Sudirman KM 45"
              className="w-full px-3 py-2 rounded-lg border border-border bg-background text-sm focus:outline-none focus-visible:outline-2 focus-visible:outline-brand"
              aria-label="Lokasi Kejadian"
            />
          </div>
          <div>
            <label className="text-xs text-muted-foreground mb-1 block">Deskripsi</label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Jelaskan kronologi kejadian..."
              rows={3}
              className="w-full px-3 py-2 rounded-lg border border-border bg-background text-sm resize-none focus:outline-none focus-visible:outline-2 focus-visible:outline-brand"
              aria-label="Deskripsi Kejadian"
            />
          </div>
        </div>
      </PanelSection>

      <PanelDivider />

      <PanelSection>
        <h3 className="text-sm font-medium mb-3">Informasi Tambahan</h3>
        <div className="space-y-3">
          <label className="flex items-center gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={formData.hasVictim}
              onChange={(e) => setFormData({ ...formData, hasVictim: e.target.checked })}
              className="w-4 h-4 rounded border-border text-brand focus:ring-brand"
              aria-label="Ada Korban"
            />
            <div className="flex items-center gap-2">
              <ShieldAlert className="w-4 h-4 text-danger" />
              <span className="text-sm">Ada Korban</span>
            </div>
          </label>
          <div>
            <label className="text-xs text-muted-foreground mb-1 block">Estimasi Kerugian (Rp)</label>
            <input
              type="number"
              value={formData.estimatedLoss}
              onChange={(e) => setFormData({ ...formData, estimatedLoss: Number(e.target.value) })}
              min={0}
              step={1000}
              className="w-full px-3 py-2 rounded-lg border border-border bg-background text-sm focus:outline-none focus-visible:outline-2 focus-visible:outline-brand"
              aria-label="Estimasi Kerugian"
            />
          </div>
        </div>
      </PanelSection>

      {incident && onStatusChange && (
        <>
          <PanelDivider />
          <PanelSection>
            <h3 className="text-sm font-medium mb-3">Ubah Status</h3>
            <select
              value={incident.status}
              onChange={(e) => {
                const newStatus = e.target.value as Incident["status"];
                if (newStatus !== incident.status) {
                  onStatusChange(newStatus);
                }
              }}
              className="w-full px-3 py-2 rounded-lg border border-border bg-background text-sm focus:outline-none focus-visible:outline-2 focus-visible:outline-brand"
              aria-label="Ubah Status Insiden"
            >
              <option value="Baru">Baru</option>
              <option value="Ditangani">Ditangani</option>
              <option value="Selesai">Selesai</option>
            </select>
          </PanelSection>
        </>
      )}

      <PanelDivider />

      <PanelSection>
        <div className="flex gap-3 relative">
          <Button type="submit" variant="primary" className="flex-1">
            <CheckCircle className="w-4 h-4 mr-2" />
            Simpan
          </Button>
          {onDelete && !showDeleteConfirm && (
            <Button
              type="button"
              variant="danger"
              onClick={() => setShowDeleteConfirm(true)}
              aria-label="Hapus Insiden"
            >
              <Trash2 className="w-4 h-4" />
            </Button>
          )}
          {showDeleteConfirm && (
            <DeleteConfirm
              onConfirm={onDelete!}
              onCancel={() => setShowDeleteConfirm(false)}
              useReducedMotion={useReducedMotion}
            />
          )}
        </div>
      </PanelSection>
    </form>
  );
}

// Status Timeline Component
interface StatusTimelineProps {
  currentStatus: Incident["status"];
  createdAt: string;
  useReducedMotion: boolean;
}

function StatusTimeline({ currentStatus, createdAt, useReducedMotion }: StatusTimelineProps) {
  const statuses: Incident["status"][] = ["Baru", "Ditangani", "Selesai"];
  const currentIndex = statuses.indexOf(currentStatus);

  return (
    <div className="space-y-2">
      {statuses.map((status, index) => {
        const isCompleted = index <= currentIndex;
        const isCurrent = index === currentIndex;
        return (
          <div key={status} className="flex items-center gap-3">
            <div className="flex flex-col items-center">
              <motion.div
                initial={useReducedMotion ? {} : { scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ duration: 0.2, delay: index * 0.1 }}
                className={`w-6 h-6 rounded-full flex items-center justify-center ${isCompleted ? "bg-green-500 text-white" : "bg-border"}`}
              >
                {isCompleted && <CheckCircle className="w-4 h-4" />}
              </motion.div>
              {index < statuses.length - 1 && (
                <div className={`w-0.5 h-6 ${isCompleted ? "bg-green-500" : "bg-border"}`} />
              )}
            </div>
            <div>
              <p className={`text-sm font-medium ${isCurrent ? "text-foreground" : "text-muted-foreground"}`}>
                {status}
              </p>
              {isCurrent && (
                <p className="text-xs text-muted-foreground">
                  {formatDate(createdAt)}
                </p>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}

// Main Page Component
export default function AccidentsPage() {
  const [incidents, setIncidents] = useState<Incident[]>(MOCK_INCIDENTS);
  const [searchQuery, setSearchQuery] = useState("");
  const [severityFilter, setSeverityFilter] = useState<Incident["severity"] | "Semua">("Semua");
  const [statusFilter, setStatusFilter] = useState<Incident["status"] | "Semua">("Semua");
  const [selectedIncident, setSelectedIncident] = useState<Incident | null>(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [isFormMode, setIsFormMode] = useState(false);
  const toast = useToast();
  const reducedMotion = useReducedMotion();

  const vehicleMap = useMemo(() => {
    return new Map(MOCK_VEHICLES.map((v) => [v.id, v]));
  }, []);

  const filteredIncidents = useMemo(() => {
    return incidents.filter((incident) => {
      const vehicle = vehicleMap.get(incident.vehicleId);
      const matchesSearch =
        searchQuery === "" ||
        vehicle?.plate_number.toLowerCase().includes(searchQuery.toLowerCase()) ||
        incident.location.toLowerCase().includes(searchQuery.toLowerCase()) ||
        incident.driverName.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesSeverity = severityFilter === "Semua" || incident.severity === severityFilter;
      const matchesStatus = statusFilter === "Semua" || incident.status === statusFilter;
      return matchesSearch && matchesSeverity && matchesStatus;
    });
  }, [incidents, searchQuery, severityFilter, statusFilter, vehicleMap]);

  const stats = useMemo(() => {
    const now = new Date();
    const thisMonth = incidents.filter((i) => {
      const date = new Date(i.dateTime);
      return date.getMonth() === now.getMonth() && date.getFullYear() === now.getFullYear();
    });
    return {
      total: incidents.length,
      thisMonth: thisMonth.length,
      unhandled: incidents.filter((i) => i.status === "Baru").length,
      completed: incidents.filter((i) => i.status === "Selesai").length,
    };
  }, [incidents]);

  const handleRowClick = useCallback((incident: Incident) => {
    setSelectedIncident(incident);
    setIsFormMode(false);
    setIsDrawerOpen(true);
  }, []);

  const handleNewIncident = useCallback(() => {
    setSelectedIncident(null);
    setIsFormMode(true);
    setIsDrawerOpen(true);
  }, []);

  const handleSave = useCallback((data: Omit<Incident, "id">) => {
    if (selectedIncident) {
      setIncidents((prev) =>
        prev.map((i) => (i.id === selectedIncident.id ? { ...data, id: selectedIncident.id } : i))
      );
      toast.success("Insiden berhasil diperbarui");
      setSelectedIncident({ ...data, id: selectedIncident.id });
      setIsFormMode(false);
    } else {
      const newId = Math.max(...incidents.map((i) => i.id)) + 1;
      setIncidents((prev) => [...prev, { ...data, id: newId }]);
      toast.success("Insiden berhasil ditambahkan");
      setIsDrawerOpen(false);
    }
  }, [selectedIncident, incidents, toast]);

  const handleDelete = useCallback(() => {
    if (selectedIncident) {
      setIncidents((prev) => prev.filter((i) => i.id !== selectedIncident.id));
      toast.success("Insiden berhasil dihapus");
      setIsDrawerOpen(false);
      setSelectedIncident(null);
    }
  }, [selectedIncident, toast]);

  const handleStatusChange = useCallback((newStatus: Incident["status"]) => {
    if (selectedIncident) {
      setIncidents((prev) =>
        prev.map((i) => (i.id === selectedIncident.id ? { ...i, status: newStatus } : i))
      );
      toast.info(`Status diubah menjadi ${newStatus}`);
      setSelectedIncident((prev) => (prev ? { ...prev, status: newStatus } : null));
    }
  }, [selectedIncident, toast]);

  const handleReset = useCallback(() => {
    setSearchQuery("");
    setSeverityFilter("Semua");
    setStatusFilter("Semua");
  }, []);

  return (
    <div className="h-[calc(100vh-4rem)] flex flex-col">

      {/* Header */}
      <div className="px-6 pt-6 pb-4">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-danger/10 flex items-center justify-center">
              <AlertTriangle className="w-5 h-5 text-danger" />
            </div>
            <h1 className="text-xl font-semibold">Log Kejadian</h1>
          </div>
          <Button onClick={handleNewIncident} aria-label="Lapor Insiden Baru">
            <Plus className="w-4 h-4 mr-2" />
            Lapor Insiden
          </Button>
        </div>

        {/* KPI Stats */}
        <div className="flex items-center gap-4 overflow-x-auto pb-2">
          <KpiStat
            label="Total Insiden"
            value={stats.total}
            icon={<FileText className="w-5 h-5" />}
            useReducedMotion={reducedMotion}
            delay={0}
          />
          <KpiDivider />
          <KpiStat
            label="Bulan Ini"
            value={stats.thisMonth}
            icon={<Calendar className="w-5 h-5" />}
            useReducedMotion={reducedMotion}
            delay={1}
          />
          <KpiDivider />
          <KpiStat
            label="Belum Ditangani"
            value={stats.unhandled}
            icon={<Clock className="w-5 h-5" />}
            useReducedMotion={reducedMotion}
            delay={2}
          />
          <KpiDivider />
          <KpiStat
            label="Selesai"
            value={stats.completed}
            icon={<CheckCircle className="w-5 h-5" />}
            useReducedMotion={reducedMotion}
            delay={3}
          />
        </div>
      </div>

      {/* Toolbar */}
      <div className="px-6 pb-4">
        <div className="flex flex-wrap items-center gap-3">
          <div className="relative flex-1 min-w-[200px] max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <input
              type="text"
              placeholder="Cari plat, lokasi, driver..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 rounded-lg border border-border bg-background text-sm focus:outline-none focus-visible:outline-2 focus-visible:outline-brand"
              aria-label="Cari insiden"
            />
          </div>
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-muted-foreground" />
            <select
              value={severityFilter}
              onChange={(e) => setSeverityFilter(e.target.value as Incident["severity"] | "Semua")}
              className="px-3 py-2 rounded-lg border border-border bg-background text-sm focus:outline-none focus-visible:outline-2 focus-visible:outline-brand"
              aria-label="Filter Severity"
            >
              <option value="Semua">Semua Severity</option>
              <option value="Ringan">Ringan</option>
              <option value="Sedang">Sedang</option>
              <option value="Berat">Berat</option>
            </select>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as Incident["status"] | "Semua")}
              className="px-3 py-2 rounded-lg border border-border bg-background text-sm focus:outline-none focus-visible:outline-2 focus-visible:outline-brand"
              aria-label="Filter Status"
            >
              <option value="Semua">Semua Status</option>
              <option value="Baru">Baru</option>
              <option value="Ditangani">Ditangani</option>
              <option value="Selesai">Selesai</option>
            </select>
            <IconButton
              variant="ghost"
              onClick={handleReset}
              aria-label="Reset filter"
              icon={<RotateCcw className="w-4 h-4" />}
            />
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="flex-1 px-6 pb-6 overflow-auto">
        <Card className="overflow-hidden">
          {filteredIncidents.length === 0 ? (
            <EmptyState
              icon={<AlertTriangle className="w-12 h-12" />}
              title="Tidak ada insiden"
              description="Tidak ada insiden yang sesuai dengan filter atau belum ada data insiden."
            />
          ) : (
            <TableContainer>
              <TableHead>
                <tr>
                  <TableHeadCell>Tanggal</TableHeadCell>
                  <TableHeadCell>Unit</TableHeadCell>
                  <TableHeadCell>Driver</TableHeadCell>
                  <TableHeadCell>Jenis</TableHeadCell>
                  <TableHeadCell>Severity</TableHeadCell>
                  <TableHeadCell>Lokasi</TableHeadCell>
                  <TableHeadCell>Status</TableHeadCell>
                  <TableHeadCell>Aksi</TableHeadCell>
                </tr>
              </TableHead>
              <TableBody>
                {filteredIncidents.map((incident) => {
                  const vehicle = vehicleMap.get(incident.vehicleId);
                  return (
                    <TableRow
                      key={incident.id}
                      onClick={() => handleRowClick(incident)}
                      className="cursor-pointer hover:bg-muted/50 transition-colors">
                      <TableCell className="font-mono text-sm whitespace-nowrap">
                        {formatDate(incident.dateTime)}
                      </TableCell>
                      <TableCell className="font-mono font-medium">
                        {vehicle?.plate_number ?? "-"}
                      </TableCell>
                      <TableCell>{incident.driverName}</TableCell>
                      <TableCell>
                        <Badge variant="default">{incident.type}</Badge>
                      </TableCell>
                      <TableCell>
                        <Badge variant={getSeverityVariant(incident.severity)}>
                          {incident.severity}
                        </Badge>
                      </TableCell>
                      <TableCell className="max-w-[150px] truncate">
                        {incident.location}
                      </TableCell>
                      <TableCell>
                        <Badge variant={getStatusVariant(incident.status)}>
                          {incident.status}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1" onClick={(e) => e.stopPropagation()}>
                          <IconButton
                            size="sm"
                            variant="ghost"
                            onClick={() => {
                              setSelectedIncident(incident);
                              setIsFormMode(false);
                              setIsDrawerOpen(true);
                            }}
                            aria-label="Lihat Detail"
                            icon={<Eye className="w-4 h-4" />}
                          />
                          <IconButton
                            size="sm"
                            variant="ghost"
                            onClick={() => {
                              setSelectedIncident(incident);
                              setIsFormMode(true);
                              setIsDrawerOpen(true);
                            }}
                            aria-label="Edit"
                            icon={<Pencil className="w-4 h-4" />}
                          />
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </TableContainer>
          )}
        </Card>
      </div>

      {/* Detail Drawer */}
      <Panel
        open={isDrawerOpen}
        onClose={() => setIsDrawerOpen(false)}
        title={isFormMode ? (selectedIncident ? "Edit Insiden" : "Lapor Insiden Baru") : "Detail Insiden"}
        width={420}
      >
        {isFormMode ? (
          <IncidentForm
            incident={selectedIncident}
            vehicleMap={vehicleMap}
            onSave={handleSave}
            onDelete={selectedIncident ? handleDelete : undefined}
            onStatusChange={selectedIncident ? handleStatusChange : undefined}
            useReducedMotion={reducedMotion}
          />
        ) : selectedIncident ? (
          <div className="flex-1 overflow-y-auto">
            <PanelSection>
              <MiniMapPlaceholder location={selectedIncident.location} />
            </PanelSection>

            <PanelDivider />

            <PanelSection>
              <h3 className="text-sm font-medium mb-3">Informasi Kendaraan</h3>
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm">
                  <Truck className="w-4 h-4 text-muted-foreground" />
                  <span className="font-mono">{vehicleMap.get(selectedIncident.vehicleId)?.plate_number ?? "-"}</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <User className="w-4 h-4 text-muted-foreground" />
                  <span>{selectedIncident.driverName}</span>
                </div>
              </div>
            </PanelSection>

            <PanelDivider />

            <PanelSection>
              <h3 className="text-sm font-medium mb-3">Detail Kejadian</h3>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Tanggal</span>
                  <span className="text-sm font-mono">{formatDate(selectedIncident.dateTime)}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Jenis</span>
                  <Badge variant="default">{selectedIncident.type}</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Severity</span>
                  <Badge variant={getSeverityVariant(selectedIncident.severity)}>
                    {selectedIncident.severity}
                  </Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Lokasi</span>
                  <span className="text-sm text-right max-w-[200px]">{selectedIncident.location}</span>
                </div>
                <div className="pt-2 border-t border-border">
                  <p className="text-sm text-muted-foreground mb-1">Deskripsi</p>
                  <p className="text-sm">{selectedIncident.description || "-"}</p>
                </div>
                {selectedIncident.hasVictim && (
                  <div className="flex items-center gap-2 text-danger">
                    <ShieldAlert className="w-4 h-4" />
                    <span className="text-sm font-medium">Ada Korban</span>
                  </div>
                )}
                <div className="flex items-center justify-between pt-2 border-t border-border">
                  <span className="text-sm text-muted-foreground">Estimasi Kerugian</span>
                  <span className="text-sm font-semibold text-danger">
                    {formatCurrency(selectedIncident.estimatedLoss)}
                  </span>
                </div>
              </div>
            </PanelSection>

            <PanelDivider />

            <PanelSection>
              <h3 className="text-sm font-medium mb-3">Status</h3>
              <StatusTimeline
                currentStatus={selectedIncident.status}
                createdAt={selectedIncident.dateTime}
                useReducedMotion={reducedMotion}
              />
            </PanelSection>

            <PanelDivider />

            <PanelSection>
              <div className="flex gap-3">
                <Button
                  variant="secondary"
                  className="flex-1"
                  onClick={() => setIsFormMode(true)}
                  icon={<Pencil className="w-4 h-4" />}>
                  Ubah
                </Button>
                <Button
                  variant="danger"
                  onClick={handleDelete}
                  icon={<Trash2 className="w-4 h-4" />}>
                  Hapus
                </Button>
              </div>
            </PanelSection>
          </div>
        ) : null}
      </Panel>
    </div>
  );
}
