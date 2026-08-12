"use client";

import {
  AlertTriangle,
  CircleHelp,
  Clock3,
  Wifi,
} from "lucide-react";
import {
  useEffect,
  useMemo,
  useState,
} from "react";
import type { Vehicle } from "@/types";
import {
  formatFreshnessAge,
  getFleetFreshness,
  type FleetFreshnessSummary,
  type FreshnessState,
} from "@/lib/freshness";

type FreshnessVehicle = Pick<
  Vehicle,
  "plate_number" | "last_update"
>;

interface FreshnessIndicatorProps {
  vehicles: readonly FreshnessVehicle[];
  refreshIntervalMs?: number;
  suppressSourcePlate?: string | null;
}

const STATE_STYLES: Record<FreshnessState, string> = {
  fresh: "bg-healthy-soft text-healthy",
  delayed: "bg-warning-soft text-warning",
  "not-transmitting": "bg-critical-soft text-critical",
  unknown: "bg-unknown-soft text-unknown",
};

function FreshnessIcon({
  state,
}: {
  state: FreshnessState;
}) {
  const className = "h-4 w-4 shrink-0";

  if (state === "fresh") {
    return <Wifi className={className} />;
  }

  if (state === "delayed") {
    return <Clock3 className={className} />;
  }

  if (state === "not-transmitting") {
    return <AlertTriangle className={className} />;
  }

  return <CircleHelp className={className} />;
}

function getFreshnessCopy(
  summary: FleetFreshnessSummary<FreshnessVehicle>
): {
  full: string;
  compact: string;
  title: string;
} {
  const age = formatFreshnessAge(summary.ageMs);
  const plate = summary.source?.plate_number;
  const unit = plate ?? "Unit";

  if (summary.state === "fresh") {
    return {
      full: `Data armada diperbarui ${age} lalu`,
      compact: `Diperbarui ${age}`,
      title: `Seluruh data armada diperbarui ${age} lalu`,
    };
  }

  if (summary.state === "delayed") {
    return {
      full: `${unit} · Data tertunda ${age}`,
      compact: `Tertunda ${age}`,
      title: `${unit} · Data tertunda ${age}`,
    };
  }

  if (summary.state === "not-transmitting") {
    return {
      full: `${unit} · Tidak kirim ${age}`,
      compact: `Tidak kirim ${age}`,
      title: `${unit} · Posisi terakhir ${age} lalu`,
    };
  }

  return {
    full: `${unit} · Data tidak diketahui`,
    compact: "Data tidak diketahui",
    title: `${unit} · Timestamp telemetri tidak valid`,
  };
}

export function FreshnessIndicator({
  vehicles,
  refreshIntervalMs = 10_000,
  suppressSourcePlate = null,
}: FreshnessIndicatorProps) {
  const [nowMs, setNowMs] = useState<number | null>(null);

  useEffect(() => {
    const updateNow = () => {
      setNowMs(Date.now());
    };

    updateNow();

    const intervalId = window.setInterval(
      updateNow,
      refreshIntervalMs
    );

    return () => {
      window.clearInterval(intervalId);
    };
  }, [refreshIntervalMs]);

  const summary = useMemo(() => {
    if (nowMs === null) {
      return null;
    }

    const fleetSummary =
      getFleetFreshness(
        vehicles,
        nowMs
      );

    const normalizedSuppressedPlate =
      suppressSourcePlate
        ?.toLowerCase()
        .replace(/\s+/g, "") ??
      null;

    const normalizedSourcePlate =
      fleetSummary.source
        ?.plate_number
        .toLowerCase()
        .replace(/\s+/g, "") ??
      null;

    if (
      !normalizedSuppressedPlate ||
      normalizedSourcePlate !==
        normalizedSuppressedPlate
    ) {
      return fleetSummary;
    }

    const fallbackVehicles =
      vehicles.filter(
        (vehicle) =>
          vehicle.plate_number
            .toLowerCase()
            .replace(/\s+/g, "") !==
          normalizedSuppressedPlate
      );

    if (
      fallbackVehicles.length === 0
    ) {
      return null;
    }

    const fallbackSummary =
      getFleetFreshness(
        fallbackVehicles,
        nowMs
      );

    return fallbackSummary.state ===
      "fresh"
      ? null
      : fallbackSummary;
  }, [
    nowMs,
    suppressSourcePlate,
    vehicles,
  ]);

  if (nowMs === null) {
    return (
      <div
        className="inline-flex h-8 items-center gap-2 rounded-md border border-border bg-surface-2 px-2.5 text-sm text-muted"
        role="status"
        aria-label="Memeriksa data armada"
      >
        <Clock3 className="h-4 w-4 shrink-0" />
        <span className="hidden 2xl:inline">
          Memeriksa data armada
        </span>
        <span className="2xl:hidden">
          Memeriksa
        </span>
      </div>
    );
  }

  if (!summary) {
    return null;
  }

  const copy = getFreshnessCopy(summary);

  return (
    <div
      className={`inline-flex h-8 max-w-80 items-center gap-2 rounded-md border border-border px-2.5 text-sm font-medium ${STATE_STYLES[summary.state]}`}
      role="status"
      aria-live="polite"
      aria-label={copy.full}
      title={copy.title}
      data-freshness-state={summary.state}
    >
      <FreshnessIcon state={summary.state} />
      <span className="hidden whitespace-nowrap 2xl:inline">
        {copy.full}
      </span>
      <span className="truncate 2xl:hidden">
        {copy.compact}
      </span>
    </div>
  );
}
