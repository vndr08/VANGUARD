"use client";

import { AnimatePresence, motion } from "motion/react";
import Link from "next/link";
import {
  Check,
  Compass,
  Fuel,
  Layers,
  MapPin,
  Route,
  Truck,
  User,
  X,
} from "lucide-react";
import { useReducedMotion } from "@/hooks/useReducedMotion";
import { OPERATIONS_DATASET } from "@/lib/operations-data";
import { STATUS_BG, STATUS_COLORS } from "./types";
import type { LayerVisibility, MapVehicle } from "./types";

interface DetailPanelProps {
  vehicle: MapVehicle | null;
  visibility: LayerVisibility;
  onToggleLayer: (key: keyof LayerVisibility) => void;
  onClose: () => void;
  className?: string;
}

const TASK_STATUS_LABELS: Record<string, string> = {
  waiting: "Menunggu",
  assigned: "Ditugaskan",
  progress: "Berjalan",
  unloading: "Bongkar",
  completed: "Selesai",
  cancelled: "Dibatalkan",
};

const TRIP_STATUS_LABELS: Record<string, string> = {
  planned: "Direncanakan",
  progress: "Berjalan",
  unloading: "Bongkar",
  completed: "Selesai",
  cancelled: "Dibatalkan",
};

export function DetailPanel({
  vehicle,
  visibility,
  onToggleLayer,
  onClose,
  className = "",
}: DetailPanelProps) {
  const reducedMotion = useReducedMotion();

  if (!vehicle) return null;

  const color = STATUS_COLORS[vehicle.displayStatus];
  const bgColor = STATUS_BG[vehicle.displayStatus];
  const task =
    OPERATIONS_DATASET.tasks.find(
      (item) =>
        item.vehicleId === vehicle.id &&
        !["completed", "cancelled"].includes(item.status)
    ) ??
    OPERATIONS_DATASET.tasks.find((item) => item.vehicleId === vehicle.id);
  const trip = task
    ? OPERATIONS_DATASET.trips.find((item) => item.id === task.primaryTripId)
    : undefined;

  return (
    <AnimatePresence>
      <motion.aside
        initial={reducedMotion ? false : { opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        exit={reducedMotion ? { opacity: 0 } : { opacity: 0, x: 20 }}
        transition={
          reducedMotion
            ? { duration: 0 }
            : { duration: 0.2, ease: [0.2, 0.8, 0.2, 1] }
        }
        id="tracking-detail-panel"
        aria-label={`Detail unit ${vehicle.plate_number}`}
        className={`absolute bottom-0 right-0 top-0 z-dock flex w-[360px] max-w-full flex-col overflow-hidden border-l border-border bg-surface-1 shadow-elev-2 ${className}`}
      >
        <header className="shrink-0 border-b border-border px-4 py-3">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <span
                  className="h-2 w-2 shrink-0 rounded-full"
                  style={{ background: color }}
                />
                <h2 className="truncate font-mono text-base font-bold tabular-nums text-foreground">
                  {vehicle.plate_number}
                </h2>
                <span
                  className="shrink-0 rounded-full px-2 py-0.5 text-[10px] font-semibold"
                  style={{ background: bgColor, color }}
                >
                  {formatVehicleStatus(vehicle.displayStatus)}
                </span>
              </div>
              <p className="mt-1 truncate text-xs text-muted">
                {vehicle.driver_name?.trim() || "Belum ditugaskan"} ·{" "}
                {vehicle.brand} {vehicle.model}
              </p>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="flex h-8 w-8 shrink-0 items-center justify-center text-muted transition-colors hover:bg-surface-2 hover:text-foreground focus-visible:outline-2 focus-visible:outline-brand"
              aria-label="Tutup detail kendaraan"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </header>

        <div className="grid shrink-0 grid-cols-3 divide-x divide-border border-b border-border">
          <SummaryMetric label="Kecepatan" value={`${vehicle.speed} km/j`} />
          <SummaryMetric
            label="BBM"
            value={`${vehicle.fuel_level}%`}
            icon={<Fuel className="h-3 w-3" />}
          />
          <SummaryMetric
            label="Pembaruan"
            value={formatTimestamp(vehicle.last_update)}
          />
        </div>

        <div className="min-h-0 flex-1 overflow-y-auto">
          <InspectorSection
            title="Posisi sekarang"
            icon={<MapPin className="h-3.5 w-3.5" />}
          >
            <DetailRow
              label="Status"
              value={formatVehicleStatus(vehicle.displayStatus)}
              color={color}
            />
            <DetailRow
              label="Arah"
              value={`${vehicle.heading.toFixed(0)}°`}
              mono
              icon={<Compass className="h-3 w-3" />}
            />
            <DetailRow
              label="Koordinat"
              value={`${vehicle.latitude?.toFixed(5) ?? "—"}, ${vehicle.longitude?.toFixed(5) ?? "—"}`}
              mono
            />
            <DetailRow
              label="Odometer"
              value={`${vehicle.odometer.toLocaleString("id-ID")} km`}
              mono
            />
          </InspectorSection>

          {task && trip && (
            <InspectorSection
              title="Operasi"
              icon={<Route className="h-3.5 w-3.5" />}
            >
              <DetailRow label="Referensi" value={task.reference} mono />
              <DetailRow label="Tugas" value={task.name} />
              <DetailRow
                label="Status tugas"
                value={TASK_STATUS_LABELS[task.status]}
              />
              <DetailRow
                label="Rute"
                value={`${trip.origin.name} → ${trip.destination.name}`}
              />
              <DetailRow
                label="Status perjalanan"
                value={TRIP_STATUS_LABELS[trip.status]}
              />
              <DetailRow
                label="Jarak"
                value={`${trip.traveledKm} / ${trip.distanceKm} km`}
                mono
              />
              <div className="mt-2 flex flex-wrap gap-x-3 gap-y-1 border-t border-border pt-2 text-xs">
                <Link href={`/tasks/${task.id}`} className="text-brand hover:underline focus-visible:outline-2 focus-visible:outline-brand">Detail tugas</Link>
                <Link href={`/history?trip=${trip.id}`} className="text-brand hover:underline focus-visible:outline-2 focus-visible:outline-brand">Riwayat</Link>
                <Link href={`/snapshots?trip=${trip.id}`} className="text-brand hover:underline focus-visible:outline-2 focus-visible:outline-brand">Snapshot</Link>
              </div>
            </InspectorSection>
          )}

          <InspectorSection
            title="Identitas"
            icon={<Truck className="h-3.5 w-3.5" />}
          >
            <DetailRow
              label="Kendaraan"
              value={`${vehicle.brand} ${vehicle.model}`}
            />
            <DetailRow
              label="Pengemudi saat ini"
              value={vehicle.driver_name?.trim() || "Belum ditugaskan"}
              icon={<User className="h-3 w-3" />}
            />
          </InspectorSection>

          <InspectorSection
            title="Lapisan peta"
            icon={<Layers className="h-3.5 w-3.5" />}
          >
            <div className="grid grid-cols-2 gap-px overflow-hidden border border-border bg-border">
              {(
                [
                  ["cluster", "Cluster kendaraan"],
                  ["plannedRoute", "Rute rencana"],
                  ["actualRoute", "Rute aktual"],
                  ["geofence", "Zona / geofence"],
                ] as [keyof LayerVisibility, string][]
              ).map(([key, label]) => (
                <button
                  key={key}
                  type="button"
                  onClick={() => onToggleLayer(key)}
                  className="flex min-h-9 items-center gap-2 bg-surface-1 px-2.5 text-left text-xs text-foreground transition-colors hover:bg-surface-2 focus-visible:outline-2 focus-visible:outline-brand focus-visible:outline-inset"
                  aria-pressed={visibility[key]}
                >
                  <span
                    className={`flex h-4 w-4 shrink-0 items-center justify-center border ${
                      visibility[key]
                        ? "border-brand bg-brand text-slate-950"
                        : "border-border-strong text-transparent"
                    }`}
                  >
                    <Check className="h-3 w-3" />
                  </span>
                  <span>{label}</span>
                </button>
              ))}
            </div>
          </InspectorSection>
        </div>
      </motion.aside>
    </AnimatePresence>
  );
}

function InspectorSection({
  title,
  icon,
  children,
}: {
  title: string;
  icon: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <section className="border-b border-border px-4 py-3">
      <h3 className="mb-2 flex items-center gap-2 text-xs font-semibold text-muted">
        {icon}
        {title}
      </h3>
      {children}
    </section>
  );
}

function SummaryMetric({
  label,
  value,
  icon,
}: {
  label: string;
  value: string;
  icon?: React.ReactNode;
}) {
  return (
    <div className="min-w-0 px-3 py-2.5">
      <p className="text-[10px] font-medium text-muted">{label}</p>
      <p className="mt-0.5 flex min-w-0 items-center gap-1 truncate font-mono text-xs font-semibold tabular-nums text-foreground">
        {icon}
        <span className="truncate">{value}</span>
      </p>
    </div>
  );
}

function DetailRow({
  label,
  value,
  mono = false,
  color,
  icon,
}: {
  label: string;
  value: string;
  mono?: boolean;
  color?: string;
  icon?: React.ReactNode;
}) {
  return (
    <div className="grid grid-cols-[116px_minmax(0,1fr)] items-start gap-3 py-1">
      <span className="text-xs text-muted">{label}</span>
      <span
        className={`flex min-w-0 items-center justify-end gap-1 text-right text-xs font-medium text-foreground ${
          mono ? "font-mono tabular-nums" : ""
        }`}
        style={color ? { color } : undefined}
      >
        {icon}
        <span className="min-w-0 break-words">{value}</span>
      </span>
    </div>
  );
}

function formatVehicleStatus(status: string): string {
  const labels: Record<string, string> = {
    driving: "Berkendara",
    idle: "Diam",
    stop: "Berhenti",
    stopped: "Berhenti",
    offline: "Offline",
    delayed: "Terlambat",
  };

  return labels[status.toLowerCase()] ?? status;
}

function formatTimestamp(value: string): string {
  const timestamp = Date.parse(value);
  if (!Number.isFinite(timestamp)) return "—";

  return new Intl.DateTimeFormat("id-ID", {
    hour: "2-digit",
    minute: "2-digit",
    timeZone: "Asia/Jakarta",
  }).format(timestamp);
}
