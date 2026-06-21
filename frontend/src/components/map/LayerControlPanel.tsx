"use client";

import { motion } from "motion/react";
import {
  Layers,
  Eye,
  EyeOff,
  Route,
  MapPin,
  CircleDot,
  Hexagon,
  Maximize2,
} from "lucide-react";
import type { LayerVisibility } from "./types";

/* ─── Props ──────────────────────────────────────────────────────────────── */
interface LayerControlPanelProps {
  visibility: LayerVisibility;
  onToggle: (key: keyof LayerVisibility) => void;
  className?: string;
}

/* ─── Layer metadata ────────────────────────────────────────────────────── */
const LAYERS: { key: keyof LayerVisibility; label: string; icon: React.ReactNode }[] = [
  { key: "cluster",       label: "Cluster",         icon: <CircleDot className="h-3.5 w-3.5" /> },
  { key: "showTrack",     label: "Show Track",      icon: <Maximize2 className="h-3.5 w-3.5" /> },
  { key: "plannedRoute",  label: "Planned Route",   icon: <Route className="h-3.5 w-3.5" /> },
  { key: "actualRoute",   label: "Actual Route",    icon: <Route className="h-3.5 w-3.5" style={{ strokeDasharray: "3 2" }} /> },
  { key: "checkpoint",    label: "Checkpoint",       icon: <MapPin className="h-3.5 w-3.5" /> },
  { key: "geofence",      label: "Geofence",         icon: <Hexagon className="h-3.5 w-3.5" /> },
];

/* ─── LayerControlPanel ───────────────────────────────────────────────── */
/**
 * Glass dock panel (INI satu-satunya glass selain header).
 * Positioned top-right of the map.
 */
export function LayerControlPanel({ visibility, onToggle, className = "" }: LayerControlPanelProps) {
  return (
    <motion.div
      initial={{ opacity: 0, x: 16 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ type: "spring", stiffness: 320, damping: 30, delay: 0.1 }}
      className={`glass absolute top-4 right-4 z-dock flex flex-col rounded-xl border border-border overflow-hidden shadow-elev-2 ${className}`}
      style={{ minWidth: 160 }}
      aria-label="Map layer controls"
    >
      {/* Header */}
      <div className="flex items-center gap-2 border-b border-border px-3 py-2.5">
        <Layers className="h-3.5 w-3.5 text-muted shrink-0" />
        <span className="text-[10px] font-semibold uppercase tracking-widest text-muted">
          Layers
        </span>
      </div>

      {/* Layer toggles */}
      <div className="flex flex-col py-1">
        {LAYERS.map(({ key, label, icon }) => {
          const isOn = visibility[key];
          return (
            <button
              key={key}
              onClick={() => onToggle(key)}
              className="flex items-center gap-2.5 px-3 py-2 text-left transition-colors hover:bg-surface-2 focus-visible:outline-2 focus-visible:outline-brand"
              aria-pressed={isOn}
              aria-label={`${isOn ? "Hide" : "Show"} ${label}`}
            >
              <span
                className="flex h-5 w-5 items-center justify-center shrink-0 transition-colors"
                style={{ color: isOn ? "var(--brand)" : "var(--text-muted)" }}
              >
                {isOn ? icon : <EyeOff className="h-3.5 w-3.5" />}
              </span>
              <span
                className="flex-1 text-xs font-medium transition-colors"
                style={{ color: isOn ? "var(--text)" : "var(--text-muted)" }}
              >
                {label}
              </span>
              {/* Toggle indicator */}
              <span
                className="flex h-1.5 w-1.5 shrink-0 rounded-full transition-colors"
                style={{ background: isOn ? "var(--brand)" : "var(--border-strong)" }}
              />
            </button>
          );
        })}
      </div>
    </motion.div>
  );
}
