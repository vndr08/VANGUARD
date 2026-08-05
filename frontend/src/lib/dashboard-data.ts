import {
  getTelemetryFreshness,
  type FreshnessState,
} from "@/lib/freshness";
import type { Vehicle } from "@/types";

export type DashboardAttentionIssue =
  | "freshness-unknown"
  | "not-transmitting"
  | "offline"
  | "delayed"
  | "unassigned-driver";

export interface DashboardAttentionRow {
  id: string;
  vehicleId: number;
  plateNumber: string;
  issue: DashboardAttentionIssue;
  freshnessState: FreshnessState;
  ageMs: number | null;
  href: string;
}

export interface FleetStateSummary {
  total: number;
  driving: number;
  idle: number;
  stopped: number;
  offline: number;
  unknown: number;
}

const ISSUE_PRIORITY: Record<DashboardAttentionIssue, number> = {
  "freshness-unknown": 5,
  "not-transmitting": 4,
  offline: 3,
  delayed: 2,
  "unassigned-driver": 1,
};

const FRESHNESS_ISSUES = new Set<DashboardAttentionIssue>([
  "freshness-unknown",
  "not-transmitting",
  "delayed",
]);

function getVehicleIssue(
  vehicle: Vehicle,
  nowMs: number
): Omit<DashboardAttentionRow, "id" | "href"> | null {
  const freshness = getTelemetryFreshness(
    vehicle.last_update,
    nowMs
  );

  let issue: DashboardAttentionIssue | null = null;

  if (freshness.state === "unknown") {
    issue = "freshness-unknown";
  } else if (freshness.state === "not-transmitting") {
    issue = "not-transmitting";
  } else if (vehicle.status === "offline") {
    issue = "offline";
  } else if (freshness.state === "delayed") {
    issue = "delayed";
  } else if (!vehicle.driver_name?.trim()) {
    issue = "unassigned-driver";
  }

  if (!issue) return null;

  return {
    vehicleId: vehicle.id,
    plateNumber: vehicle.plate_number,
    issue,
    freshnessState: freshness.state,
    ageMs: freshness.ageMs,
  };
}

export function selectNeedsAttention(
  vehicles: readonly Vehicle[],
  nowMs: number,
  limit = 5
): DashboardAttentionRow[] {
  if (!Number.isFinite(nowMs) || limit <= 0) return [];

  return vehicles
    .map((vehicle) => {
      const row = getVehicleIssue(vehicle, nowMs);

      if (!row) return null;

      return {
        ...row,
        id: `vehicle:${vehicle.id}`,
        href: `/tracking?focus=${vehicle.id}`,
      };
    })
    .filter((row): row is DashboardAttentionRow => row !== null)
    .sort((a, b) => {
      const priorityDifference =
        ISSUE_PRIORITY[b.issue] - ISSUE_PRIORITY[a.issue];

      if (priorityDifference !== 0) return priorityDifference;

      if (
        FRESHNESS_ISSUES.has(a.issue) &&
        FRESHNESS_ISSUES.has(b.issue)
      ) {
        const ageDifference = (b.ageMs ?? -1) - (a.ageMs ?? -1);
        if (ageDifference !== 0) return ageDifference;
      }

      const plateDifference = a.plateNumber.localeCompare(
        b.plateNumber,
        "id"
      );

      return plateDifference !== 0
        ? plateDifference
        : a.vehicleId - b.vehicleId;
    })
    .slice(0, limit);
}

export function selectFleetState(
  vehicles: readonly Vehicle[]
): FleetStateSummary {
  const summary: FleetStateSummary = {
    total: vehicles.length,
    driving: 0,
    idle: 0,
    stopped: 0,
    offline: 0,
    unknown: 0,
  };

  for (const vehicle of vehicles) {
    const status = (vehicle as { status?: unknown }).status;

    if (status === "driving") summary.driving += 1;
    else if (status === "idle") summary.idle += 1;
    else if (status === "stopped") summary.stopped += 1;
    else if (status === "offline") summary.offline += 1;
    else summary.unknown += 1;
  }

  return summary;
}
