/**
 * Canonical telemetry freshness model.
 *
 * Freshness is intentionally separate from vehicle movement status.
 * A vehicle can be driving while its telemetry is delayed.
 */

export const FRESHNESS_THRESHOLDS_MS = {
  delayed: 2 * 60_000,
  notTransmitting: 10 * 60_000,
} as const;

export type FreshnessState =
  | "fresh"
  | "delayed"
  | "not-transmitting"
  | "unknown";

export interface TelemetryFreshness {
  state: FreshnessState;
  ageMs: number | null;
  lastUpdateMs: number | null;
}

export function getTelemetryFreshness(
  lastUpdate: string | null | undefined,
  nowMs = Date.now()
): TelemetryFreshness {
  const lastUpdateMs = Date.parse(lastUpdate ?? "");

  if (!Number.isFinite(lastUpdateMs) || !Number.isFinite(nowMs)) {
    return {
      state: "unknown",
      ageMs: null,
      lastUpdateMs: null,
    };
  }

  const ageMs = Math.max(0, nowMs - lastUpdateMs);

  if (ageMs < FRESHNESS_THRESHOLDS_MS.delayed) {
    return {
      state: "fresh",
      ageMs,
      lastUpdateMs,
    };
  }

  if (ageMs <= FRESHNESS_THRESHOLDS_MS.notTransmitting) {
    return {
      state: "delayed",
      ageMs,
      lastUpdateMs,
    };
  }

  return {
    state: "not-transmitting",
    ageMs,
    lastUpdateMs,
  };
}

export function formatFreshnessAge(ageMs: number | null): string {
  if (ageMs === null || !Number.isFinite(ageMs)) {
    return "unknown";
  }

  const safeAgeMs = Math.max(0, ageMs);
  const seconds = Math.floor(safeAgeMs / 1_000);

  if (seconds < 60) {
    return `${seconds}s`;
  }

  const minutes = Math.floor(seconds / 60);

  if (minutes < 60) {
    return `${minutes}m`;
  }

  const hours = Math.floor(minutes / 60);
  return `${hours}h`;
}
