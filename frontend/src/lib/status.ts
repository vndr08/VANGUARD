/**
 * VANGUARD Canonical Status System
 *
 * Problem: Vehicle.status from API/mock uses "stopped" but StatusPill expects "stop".
 * Solution: Define ONE canonical type and normalize all incoming values through it.
 *
 * Canonical Status (DESIGN.md §2.3):
 *   driving | idle | stop | offline | delayed
 *
 * Safe lookup: ALL consumers should use toCanonicalStatus(raw) instead of raw strings.
 * The canonical type is the single source of truth for the UI layer.
 */

import type { VehicleStatus } from "@/components/ui/Badge";

/** All valid canonical statuses */
export const CANONICAL_STATUSES: VehicleStatus[] = [
  "driving",
  "idle",
  "stop",
  "offline",
  "delayed",
];

/** Maps raw/unnormalized status strings to canonical VehicleStatus.
 * Handles all known variants: "stopped" → "stop", "delayed" → "delayed", etc.
 * Falls back to "stop" for unknown values (safe default — not an error state). */
export function toCanonicalStatus(raw: string | null | undefined): VehicleStatus {
  const key = (raw ?? "").toLowerCase().trim() as keyof typeof STATUS_MAP;

  if (key in STATUS_MAP) {
    const canonical = STATUS_MAP[key];
    if (canonical !== undefined) return canonical;
  }

  // Unknown → safe fallback, log warning
  console.warn(`[status] Unknown status "${raw}" — falling back to "stop". Known: ${Object.keys(STATUS_MAP).join(", ")}`);
  return "stop";
}

/** Reverse lookup: canonical status → display label */
export const STATUS_LABELS: Record<VehicleStatus, string> = {
  driving: "Berkendara",
  idle: "Idle",
  stop: "Berhenti",
  offline: "Offline",
  delayed: "Terlambat",
};

/** Status → CSS variable color (for inline styles) */
export const STATUS_CSS: Record<VehicleStatus, string> = {
  driving: "var(--st-driving)",
  idle: "var(--st-idle)",
  stop: "var(--st-stop)",
  offline: "var(--st-offline)",
  delayed: "var(--st-delayed)",
};

/** Status → background CSS variable */
export const STATUS_BG_CSS: Record<VehicleStatus, string> = {
  driving: "var(--st-driving-bg)",
  idle: "var(--st-idle-bg)",
  stop: "var(--st-stop-bg)",
  offline: "var(--st-offline-bg)",
  delayed: "var(--st-delayed-bg)",
};

/* ─── Internal map ──────────────────────────────────────────────────────── */
const STATUS_MAP: Record<string, VehicleStatus | undefined> = {
  // Canonical names
  driving: "driving",
  idle: "idle",
  stop: "stop",
  offline: "offline",
  delayed: "delayed",

  // Common variants from API/mock data
  stopped: "stop",     // ← THIS IS THE MISMATCH (vehicle.status = "stopped")
  stopped_engaged: "stop",
  parking: "stop",
  idle_engine: "idle",
  moving: "driving",
  active: "driving",
  online: "driving",
};
