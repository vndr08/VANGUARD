"use client";

import { useState, useMemo, useCallback, useEffect, useRef } from "react";
import Link from "next/link";
import dynamic from "next/dynamic";
import { motion } from "motion/react";
import {
  AlertTriangle,
  Search,
  RotateCcw,
  MapPin,
  Truck,
  User,
  Eye,
  CheckCircle,
  ShieldAlert,
} from "lucide-react";

import { useReducedMotion } from "@/hooks/useReducedMotion";
import { IconButton } from "@/components/ui";
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
import { EmptyState } from "@/components/ui";
import { FLEET_VEHICLES } from "@/lib/fleet-data";
import { toOperationalMapVehicle } from "@/lib/operations-map";
import { getEvidenceSnapshots } from "@/lib/evidence-data";
import {
  SAFETY_INCIDENTS,
  SAFETY_REFERENCE_TIME_MS,
  type SafetyIncident,
} from "@/lib/safety-data";
import type { Vehicle } from "@/types";

type Incident = SafetyIncident;

const IncidentMapPreview = dynamic(() => import("@/components/map/MapView").then((module) => {
  return function IncidentMapInner({ incident, vehicle }: { incident: Incident; vehicle: Vehicle | undefined }) {
    if (!vehicle) return null;
    const mapVehicle = toOperationalMapVehicle(vehicle);
    const incidentVehicle = {
      ...mapVehicle,
      latitude: incident.latitude,
      longitude: incident.longitude,
      displayLat: incident.latitude,
      displayLng: incident.longitude,
    };

    return (
      <module.default
        key={incident.id}
        vehicles={[incidentVehicle]}
        selectedId={incidentVehicle.id}
        center={[incident.longitude, incident.latitude]}
        zoom={12}
        pitch={0}
        overviewMode
        className="h-full w-full"
      />
    );
  };
}), { ssr: false });

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

function SummaryItem({ label, value, color }: { label: string; value: number; color?: string }) {
  return (
    <div className="flex items-baseline gap-2 px-3 first:pl-0 last:pr-0">
      <span className="text-[10px] font-semibold uppercase tracking-widest text-muted">{label}</span>
      <span className="font-mono text-sm font-semibold tabular-nums" style={color ? { color } : undefined}>{value}</span>
    </div>
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
  const incidents = SAFETY_INCIDENTS;
  const [searchQuery, setSearchQuery] = useState("");
  const [searchOpen, setSearchOpen] = useState(false);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const [severityFilter, setSeverityFilter] = useState<Incident["severity"] | "Semua">("Semua");
  const [statusFilter, setStatusFilter] = useState<Incident["status"] | "Semua">("Semua");
  const [selectedIncident, setSelectedIncident] = useState<Incident | null>(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const reducedMotion = useReducedMotion();

  useEffect(() => {
    if (searchOpen) searchInputRef.current?.focus();
  }, [searchOpen]);

  const vehicleMap = useMemo((): Map<number, Vehicle> => {
    return new Map(FLEET_VEHICLES.map((v: Vehicle) => [v.id, v]));
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
    const now = new Date(SAFETY_REFERENCE_TIME_MS);
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
    setIsDrawerOpen(true);
  }, []);

  const handleReset = useCallback(() => {
    setSearchQuery("");
    setSeverityFilter("Semua");
    setStatusFilter("Semua");
  }, []);

  return (
    <div className="flex h-[calc(100dvh-3.625rem)] max-h-[calc(100dvh-3.625rem)] min-h-0 flex-col overflow-hidden">
      <header className="flex h-12 shrink-0 items-center gap-4 overflow-x-auto border-b border-border bg-surface-1 px-4">
        <div className="flex shrink-0 items-baseline gap-2">
          <h1 className="text-sm font-semibold text-foreground">Kejadian</h1>
          <span className="font-mono text-xs tabular-nums text-muted">{stats.total} insiden</span>
        </div>
        <div className="flex shrink-0 items-center divide-x divide-border">
          <SummaryItem label="Total" value={stats.total} />
          <SummaryItem label="Bulan ini" value={stats.thisMonth} />
          <SummaryItem label="Baru" value={stats.unhandled} color="var(--st-offline)" />
          <SummaryItem label="Selesai" value={stats.completed} color="var(--st-driving)" />
        </div>
      </header>

      <div className="flex h-11 shrink-0 min-w-0 items-center gap-2 overflow-x-auto border-b border-border bg-surface-1 px-4">
        {searchOpen ? (
          <div className="relative flex w-80 shrink-0 items-center gap-2">
            <Search className="pointer-events-none absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted" />
            <input ref={searchInputRef} type="text" placeholder="Cari plat, lokasi, atau pengemudi..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} onKeyDown={(event) => { if (event.key === "Escape") { setSearchQuery(""); setSearchOpen(false); } }} className="h-8 min-w-0 flex-1 border border-border bg-surface-1 pl-8 pr-3 text-xs text-foreground placeholder:text-faint focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand/20" aria-label="Cari insiden" />
            <button type="button" onClick={() => { setSearchQuery(""); setSearchOpen(false); }} className="flex h-8 w-8 shrink-0 items-center justify-center text-muted transition-colors hover:bg-surface-2 hover:text-foreground focus-visible:outline-2 focus-visible:outline-brand" aria-label="Tutup pencarian"><RotateCcw className="h-3.5 w-3.5" /></button>
          </div>
        ) : (
          <button type="button" onClick={() => setSearchOpen(true)} className="flex h-8 w-8 shrink-0 items-center justify-center text-muted transition-colors hover:bg-surface-2 hover:text-foreground focus-visible:outline-2 focus-visible:outline-brand" aria-label="Cari insiden"><Search className="h-4 w-4" /></button>
        )}
        <div className="flex shrink-0 items-center gap-1">
          {!searchOpen && <span className="mr-1 text-[10px] font-semibold uppercase tracking-widest text-muted">Tingkat</span>}
          <select value={severityFilter} onChange={(e) => setSeverityFilter(e.target.value as Incident["severity"] | "Semua")} className="h-7 border border-border bg-surface-1 px-2 text-xs font-medium text-foreground focus-visible:outline-2 focus-visible:outline-brand" aria-label="Filter tingkat insiden">
            <option value="Semua">Semua</option><option value="Ringan">Ringan</option><option value="Sedang">Sedang</option><option value="Berat">Berat</option>
          </select>
        </div>
        <div className="flex shrink-0 items-center gap-1 border-l border-border pl-2">
          <span className="mr-1 text-[10px] font-semibold uppercase tracking-widest text-muted">Status</span>
          <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value as Incident["status"] | "Semua")} className="h-7 border border-border bg-surface-1 px-2 text-xs font-medium text-foreground focus-visible:outline-2 focus-visible:outline-brand" aria-label="Filter status insiden">
            <option value="Semua">Semua</option><option value="Baru">Baru</option><option value="Ditangani">Ditangani</option><option value="Selesai">Selesai</option>
          </select>
          <IconButton variant="ghost" onClick={handleReset} aria-label="Reset filter" icon={<RotateCcw className="h-4 w-4" />} />
        </div>
      </div>

      {/* Table */}
      <div className="flex-1 overflow-auto px-4 py-3">
          {filteredIncidents.length === 0 ? (
            <EmptyState
              icon={<AlertTriangle className="w-12 h-12" />}
              title="Tidak ada insiden"
              description="Tidak ada insiden yang sesuai dengan filter atau belum ada data insiden."
            />
          ) : (
            <TableContainer className="v2-accident-table [&_td]:!px-3 [&_td]:!py-2 [&_th]:!h-9 [&_th]:!px-3 [&_th]:!py-0">
              <TableHead>
                <tr>
                  <TableHeadCell width={128}>Waktu</TableHeadCell>
                  <TableHeadCell width={105}>Unit</TableHeadCell>
                  <TableHeadCell width={150}>Pengemudi</TableHeadCell>
                  <TableHeadCell width={100}>Jenis</TableHeadCell>
                  <TableHeadCell width={88}>Tingkat</TableHeadCell>
                  <TableHeadCell>Lokasi</TableHeadCell>
                  <TableHeadCell width={100}>Status</TableHeadCell>
                  <TableHeadCell width={44} className="text-right"><span className="sr-only">Detail</span></TableHeadCell>
                </tr>
              </TableHead>
              <TableBody>
                {filteredIncidents.map((incident) => {
                  const vehicle = vehicleMap.get(incident.vehicleId);
                  return (
                    <TableRow
                      key={incident.id}
                      onClick={() => handleRowClick(incident)}
                      className="cursor-pointer">
                      <TableCell className="font-mono text-xs font-medium text-foreground whitespace-nowrap">
                        {formatDate(incident.dateTime)}
                      </TableCell>
                      <TableCell className="font-mono text-xs font-semibold text-foreground whitespace-nowrap">
                        {vehicle?.plate_number ?? "-"}
                      </TableCell>
                      <TableCell className="text-xs font-medium text-foreground whitespace-nowrap">
                        {incident.driverName}
                      </TableCell>
                      <TableCell>
                        <Badge variant="default" className="whitespace-nowrap px-2 py-0.5 text-[10px]">{incident.type}</Badge>
                      </TableCell>
                      <TableCell>
                        <Badge variant={getSeverityVariant(incident.severity)} className="whitespace-nowrap px-2 py-0.5 text-[10px]">
                          {incident.severity}
                        </Badge>
                      </TableCell>
                      <TableCell className="max-w-[220px] truncate text-xs font-medium text-foreground">
                        {incident.location}
                      </TableCell>
                      <TableCell>
                        <Badge variant={getStatusVariant(incident.status)} className="whitespace-nowrap px-2 py-0.5 text-[10px]">
                          {incident.status}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end" onClick={(e) => e.stopPropagation()}>
                          <IconButton
                            size="sm"
                            variant="ghost"
                            onClick={() => {
                              setSelectedIncident(incident);
                              setIsDrawerOpen(true);
                            }}
                            aria-label="Lihat Detail"
                            icon={<Eye className="w-4 h-4" />}
                          />
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </TableContainer>
          )}
      </div>

      {/* Detail Drawer */}
      <Panel
        open={isDrawerOpen}
        onClose={() => setIsDrawerOpen(false)}
        title="Detail Insiden"
        width={420}
      >
        {selectedIncident ? (
          <div className="flex-1 overflow-y-auto">
            <PanelSection>
              <div className="relative aspect-video overflow-hidden border border-border bg-surface-2">
                <IncidentMapPreview incident={selectedIncident} vehicle={vehicleMap.get(selectedIncident.vehicleId)} />
                <div className="pointer-events-none absolute bottom-2 left-2 z-10 border border-border bg-surface-1/95 px-2 py-1 text-[11px] text-muted">
                  {selectedIncident.location}
                </div>
              </div>
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
                {getEvidenceSnapshots({ incidentId: selectedIncident.id }).length > 0 && (
                  <div className="flex items-center justify-between border-t border-border pt-2 text-sm">
                    <span className="text-muted-foreground">Bukti visual</span>
                    <Link href={`/snapshots?incident=${selectedIncident.id}`} className="text-brand hover:underline focus-visible:outline-2 focus-visible:outline-brand">
                      Lihat snapshot
                    </Link>
                  </div>
                )}
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

          </div>
        ) : null}
      </Panel>
    </div>
  );
}
