"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  X,
  Truck,
  User,
  Gauge,
  Compass,
  MapPin,
  Navigation,
  Route,
  Clock,
  ChevronDown,
  ChevronRight,
  Layers,
  Fuel,
} from "lucide-react";
import { STATUS_COLORS, STATUS_BG } from "./types";
import type { MapVehicle, TaskInfo, VehicleDetail, LayerVisibility } from "./types";
import { MOCK_TASKS } from "@/lib/mock-data";

/* ─── Props ──────────────────────────────────────────────────────────────── */
interface DetailPanelProps {
  vehicle: MapVehicle | null;
  visibility: LayerVisibility;
  onToggleLayer: (key: keyof LayerVisibility) => void;
  onClose: () => void;
  className?: string;
}

/* ─── DetailPanel ──────────────────────────────────────────────────────── */
export function DetailPanel({ vehicle, visibility, onToggleLayer, onClose, className = "" }: DetailPanelProps) {
  const [expandedSections, setExpandedSections] = useState<Set<string>>(
    new Set(["identity", "task", "traveled", "estimated", "layers"])
  );
  const [detail, setDetail] = useState<VehicleDetail | null>(null);

  useEffect(() => {
    if (!vehicle) {
      setDetail(null);
      return;
    }

    // Build detail from mock data (replace with real API)
    const task = MOCK_TASKS[vehicle.id];
    const status = vehicle.displayStatus;

    setDetail({
      vehicle,
      task,
      traveled: {
        distance: vehicle.odometer / 1000,
        duration: formatDuration(vehicle.last_update),
        avgSpeed: status === "driving" ? Math.round(vehicle.speed) : 0,
      },
      estimated: {
        distanceLeft: 23.4,
        timeLeft: "~18m",
        arriveAt: "14:32",
      },
    });
  }, [vehicle]);

  function toggleSection(key: string) {
    setExpandedSections((prev) => {
      const next = new Set(prev);
      next.has(key) ? next.delete(key) : next.add(key);
      return next;
    });
  }

  if (!vehicle) return null;

  const color = STATUS_COLORS[vehicle.displayStatus];
  const bgColor = STATUS_BG[vehicle.displayStatus];

  return (
    <AnimatePresence>
      {vehicle && (
        <motion.div
          key={vehicle.id}
          initial={{ opacity: 0, x: 24 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: 24 }}
          transition={{ type: "spring", stiffness: 320, damping: 30 }}
          className={`glass absolute top-0 right-0 bottom-0 z-dock flex w-[380px] max-w-full flex-col overflow-hidden border-l border-border shadow-elev-3 ${className}`}
          style={{ backdropFilter: "blur(12px)" }}
        >
          {/* ── Header ──────────────────────────────────────── */}
          <div className="flex shrink-0 items-center justify-between border-b border-border px-4 py-3">
            <div className="flex items-center gap-2 min-w-0">
              {/* Status dot */}
              <span
                className="h-2.5 w-2.5 shrink-0 rounded-full"
                style={{ background: color }}
              />
              <h2 className="font-mono text-sm font-semibold tabular-nums text-foreground truncate">
                {vehicle.plate_number}
              </h2>
              <span
                className="shrink-0 rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide"
                style={{ background: bgColor, color }}
              >
                {vehicle.displayStatus}
              </span>
            </div>
            <button
              onClick={onClose}
              className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg text-muted transition-colors hover:bg-surface-2 hover:text-foreground focus-visible:outline-2 focus-visible:outline-brand"
              aria-label="Close detail panel"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          {/* ── Scrollable body ─────────────────────────────── */}
          <div className="flex-1 overflow-y-auto py-2">

            {/* Identity */}
            <Section
              title="Identity"
              icon={<Truck className="h-3.5 w-3.5" />}
              expanded={expandedSections.has("identity")}
              onToggle={() => toggleSection("identity")}
            >
              <DetailRow label="Vehicle" value={`${vehicle.brand} ${vehicle.model}`} mono={false} />
              <DetailRow label="Driver" value={vehicle.driver_name ?? "—"} mono={false} />
              <DetailRow label="State" value={vehicle.displayStatus} color={color} />
              <DetailRow label="Speed" value={`${vehicle.speed} km/h`} mono />
              <DetailRow label="Direction" value={`${vehicle.heading.toFixed(0)}°`} mono icon={<Compass className="h-3 w-3" />} />
              <DetailRow label="Location" value={`${vehicle.latitude?.toFixed(5)}, ${vehicle.longitude?.toFixed(5)}`} mono />
            </Section>

            {/* Task Info */}
            {detail?.task && (
              <Section
                title="Task Info"
                icon={<Layers className="h-3.5 w-3.5" />}
                expanded={expandedSections.has("task")}
                onToggle={() => toggleSection("task")}
              >
                <DetailRow label="Ref" value={detail.task.taskRef} mono />
                <DetailRow label="Task" value={detail.task.taskName} />
                <DetailRow label="Schedule" value={detail.task.scheduleStart} mono />
                <div className="border-t border-border mt-2 pt-2">
                  {detail.task.trips.map((trip, i) => (
                    <div key={i} className="mb-2">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-[10px] font-semibold uppercase tracking-widest text-muted">
                          {trip.tripType}
                        </span>
                        <span
                          className="rounded-full px-1.5 py-0.5 text-[9px] font-semibold"
                          style={{ background: STATUS_BG[trip.status === "Completed" ? "driving" : "idle"], color: trip.status === "Completed" ? STATUS_COLORS.driving : STATUS_COLORS.idle }}
                        >
                          {trip.status}
                        </span>
                      </div>
                      <DetailRow label="Origin" value={trip.origin} mono={false} />
                      <DetailRow label="Destination" value={trip.destination} mono={false} />
                      <DetailRow label="Distance" value={`${trip.distance} km`} mono />
                    </div>
                  ))}
                </div>
              </Section>
            )}

            {/* Traveled */}
            <Section
              title="Traveled"
              icon={<Route className="h-3.5 w-3.5" />}
              expanded={expandedSections.has("traveled")}
              onToggle={() => toggleSection("traveled")}
            >
              <div className="grid grid-cols-3 gap-2">
                <MetricCell label="Distance" value={detail ? (detail.traveled.distance / 1000).toFixed(1) : "—"} unit="km" />
                <MetricCell label="Duration" value={detail?.traveled.duration ?? "—"} unit="" />
                <MetricCell label="Avg Speed" value={detail ? String(detail.traveled.avgSpeed) : "—"} unit="km/h" />
              </div>
            </Section>

            {/* Estimated */}
            <Section
              title="Estimated"
              icon={<Clock className="h-3.5 w-3.5" />}
              expanded={expandedSections.has("estimated")}
              onToggle={() => toggleSection("estimated")}
            >
              <div className="grid grid-cols-3 gap-2">
                <MetricCell label="Distance Left" value={detail ? detail.estimated.distanceLeft.toFixed(1) : "—"} unit="km" />
                <MetricCell label="Time Left" value={detail?.estimated.timeLeft ?? "—"} unit="" />
                <MetricCell label="Arrive at" value={detail?.estimated.arriveAt ?? "—"} unit="" />
              </div>
            </Section>

            {/* Layers */}
            <Section
              title="Layers"
              icon={<Layers className="h-3.5 w-3.5" />}
              expanded={expandedSections.has("layers")}
              onToggle={() => toggleSection("layers")}
            >
              <div className="space-y-1.5">
                {([
                  ["cluster", "Show Cluster"],
                  ["plannedRoute", "Planned Route"],
                  ["actualRoute", "Actual Route"],
                  ["checkpoint", "Checkpoint"],
                  ["geofence", "Geofence"],
                ] as [keyof LayerVisibility, string][]).map(([key, label]) => (
                  <button
                    key={key}
                    onClick={() => onToggleLayer(key)}
                    className="flex w-full items-center gap-2 rounded-lg px-2 py-1.5 text-left transition-colors hover:bg-surface-2"
                  >
                    <span
                      className="flex h-4 w-4 items-center justify-center rounded border text-[8px] font-bold transition-colors"
                      style={{
                        borderColor: visibility[key] ? "var(--brand)" : "var(--border-strong)",
                        background: visibility[key] ? "var(--brand)" : "transparent",
                        color: visibility[key] ? "white" : "var(--text-muted)",
                      }}
                    >
                      {visibility[key] ? "✓" : ""}
                    </span>
                    <span className="text-xs text-foreground">{label}</span>
                  </button>
                ))}
              </div>
            </Section>

            {/* Footer: fuel + odometer */}
            <div className="mx-4 mt-2 rounded-lg border border-border bg-surface-2 px-3 py-2.5">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <p className="text-[10px] font-semibold uppercase tracking-widest text-muted mb-0.5">Fuel</p>
                  <div className="flex items-center gap-1.5">
                    <div className="flex-1 h-1.5 rounded-full bg-surface-3 overflow-hidden">
                      <div
                        className="h-full rounded-full transition-all"
                        style={{
                          width: `${vehicle.fuel_level}%`,
                          background: vehicle.fuel_level < 25 ? "var(--st-offline)" : "var(--st-driving)",
                        }}
                      />
                    </div>
                    <span className="font-mono text-xs tabular-nums font-semibold text-foreground">
                      {vehicle.fuel_level}%
                    </span>
                  </div>
                </div>
                <div>
                  <p className="text-[10px] font-semibold uppercase tracking-widest text-muted mb-0.5">Odometer</p>
                  <p className="font-mono text-xs tabular-nums font-semibold text-foreground">
                    {vehicle.odometer.toLocaleString()} km
                  </p>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

/* ─── Sub-components ──────────────────────────────────────────────────── */
function Section({
  title,
  icon,
  expanded,
  onToggle,
  children,
}: {
  title: string;
  icon: React.ReactNode;
  expanded: boolean;
  onToggle: () => void;
  children: React.ReactNode;
}) {
  return (
    <div className="border-b border-border">
      <button
        onClick={onToggle}
        className="flex w-full items-center gap-2 px-4 py-2.5 text-left transition-colors hover:bg-surface-2"
        aria-expanded={expanded}
      >
        <span className="text-muted shrink-0">{icon}</span>
        <span className="flex-1 text-[10px] font-semibold uppercase tracking-widest text-muted">
          {title}
        </span>
        {expanded ? (
          <ChevronDown className="h-3.5 w-3.5 text-faint shrink-0" />
        ) : (
          <ChevronRight className="h-3.5 w-3.5 text-faint shrink-0" />
        )}
      </button>
      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ type: "spring", stiffness: 400, damping: 32 }}
            className="overflow-hidden px-4 pb-3"
          >
            {children}
          </motion.div>
        )}
      </AnimatePresence>
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
    <div className="flex items-center justify-between py-1">
      <span className="text-xs text-muted">{label}</span>
      <span
        className={`flex items-center gap-1 text-xs font-medium ${mono ? "font-mono tabular-nums" : ""}`}
        style={{ color: color ?? "var(--text)" }}
      >
        {icon}
        {value}
      </span>
    </div>
  );
}

function MetricCell({ label, value, unit }: { label: string; value: string; unit: string }) {
  return (
    <div>
      <p className="text-[10px] uppercase tracking-widest text-muted mb-0.5">{label}</p>
      <p className="font-mono text-sm font-semibold tabular-nums text-foreground leading-tight">
        {value}
        {unit && <span className="text-[10px] text-muted ml-0.5">{unit}</span>}
      </p>
    </div>
  );
}

/* ─── Helpers ──────────────────────────────────────────────────────────── */
function formatDuration(lastUpdate: string): string {
  const diff = Date.now() - new Date(lastUpdate).getTime();
  const h = Math.floor(diff / 3600000);
  const m = Math.floor((diff % 3600000) / 60000);
  if (h > 0) return `${h}h ${m}m`;
  return `${m}m`;
}
