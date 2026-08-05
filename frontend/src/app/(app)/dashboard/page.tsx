"use client";

import {
  AlertTriangle,
  ChevronRight,
  CircleHelp,
  Clock3,
  Database,
  RadioTower,
  UserRoundX,
  WifiOff,
} from "lucide-react";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import {
  selectFleetState,
  selectNeedsAttention,
  type DashboardAttentionIssue,
  type DashboardAttentionRow,
  type FleetStateSummary,
} from "@/lib/dashboard-data";
import { formatFreshnessAge } from "@/lib/freshness";
import { MOCK_VEHICLES } from "@/lib/mock-data";

const ATTENTION_META: Record<
  DashboardAttentionIssue,
  {
    label: string;
    icon: typeof AlertTriangle;
    className: string;
  }
> = {
  "freshness-unknown": {
    label: "Data tidak diketahui",
    icon: CircleHelp,
    className: "bg-unknown-soft text-unknown",
  },
  "not-transmitting": {
    label: "Tidak mengirim",
    icon: RadioTower,
    className: "bg-critical-soft text-critical",
  },
  offline: {
    label: "Offline",
    icon: WifiOff,
    className: "bg-surface-3 text-muted",
  },
  delayed: {
    label: "Tertunda",
    icon: Clock3,
    className: "bg-warning-soft text-warning",
  },
  "unassigned-driver": {
    label: "Driver kosong",
    icon: UserRoundX,
    className: "bg-information-soft text-information",
  },
};

const FLEET_STATE_META: Array<{
  key: Exclude<keyof FleetStateSummary, "total">;
  label: string;
  color: string;
}> = [
  { key: "driving", label: "Berkendara", color: "var(--st-driving)" },
  { key: "idle", label: "Idle", color: "var(--st-idle)" },
  { key: "stopped", label: "Berhenti", color: "var(--st-stop)" },
  { key: "offline", label: "Offline", color: "var(--st-offline)" },
  { key: "unknown", label: "Tidak diketahui", color: "var(--unknown)" },
];

function getAttentionFact(row: DashboardAttentionRow): string {
  if (row.issue === "freshness-unknown") {
    return "Waktu telemetri tidak tersedia";
  }

  if (row.issue === "not-transmitting") {
    return `Tidak mengirim data ${formatFreshnessAge(row.ageMs)}`;
  }

  if (row.issue === "offline") {
    return "Status kendaraan offline";
  }

  if (row.issue === "delayed") {
    return `Data tertunda ${formatFreshnessAge(row.ageMs)}`;
  }

  return "Driver belum ditetapkan";
}

function AttentionRow({ row }: { row: DashboardAttentionRow }) {
  const meta = ATTENTION_META[row.issue];
  const Icon = meta.icon;

  return (
    <li>
      <Link
        href={row.href}
        className="grid min-h-14 grid-cols-[auto_minmax(0,1fr)_auto] items-center gap-3 px-4 py-3 transition-colors hover:bg-surface-2 focus-visible:outline-2 focus-visible:outline-brand focus-visible:outline-offset-[-2px] sm:px-5"
        aria-label={`${row.plateNumber}: ${getAttentionFact(row)}`}
      >
        <span
          className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-md ${meta.className}`}
          aria-hidden="true"
        >
          <Icon className="h-4 w-4" />
        </span>

        <span className="min-w-0">
          <span className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
            <span className="font-mono text-sm font-semibold tabular-nums text-[var(--text)]">
              {row.plateNumber}
            </span>
            <span className="text-sm font-medium text-[var(--text)]">
              {meta.label}
            </span>
          </span>
          <span className="mt-0.5 block text-sm text-muted">
            {getAttentionFact(row)}
          </span>
        </span>

        <ChevronRight
          className="h-4 w-4 shrink-0 text-faint"
          aria-hidden="true"
        />
      </Link>
    </li>
  );
}

function NeedsAttention({ nowMs }: { nowMs: number | null }) {
  const rows = useMemo(
    () =>
      nowMs === null
        ? null
        : selectNeedsAttention(MOCK_VEHICLES, nowMs),
    [nowMs]
  );

  return (
    <section aria-labelledby="needs-attention-title">
      <div className="flex min-h-12 items-center justify-between gap-4 border-b border-border px-4 py-3 sm:px-5">
        <div>
          <h2
            id="needs-attention-title"
            className="text-base font-semibold text-[var(--text)]"
          >
            Perlu perhatian
          </h2>
          <p className="mt-0.5 text-sm text-muted">
            Kondisi kendaraan yang dapat diturunkan dari data saat ini
          </p>
        </div>
        {rows && rows.length > 0 && (
          <span className="font-mono text-sm font-semibold tabular-nums text-[var(--text)]">
            {rows.length}
          </span>
        )}
      </div>

      {rows === null ? (
        <div
          className="flex min-h-40 items-center gap-3 px-4 py-6 text-sm text-muted sm:px-5"
          role="status"
        >
          <Clock3 className="h-4 w-4 shrink-0" />
          Memeriksa kondisi telemetri
        </div>
      ) : rows.length > 0 ? (
        <ul className="divide-y divide-border">
          {rows.map((row) => (
            <AttentionRow key={row.id} row={row} />
          ))}
        </ul>
      ) : (
        <div className="flex min-h-40 items-center gap-3 px-4 py-6 sm:px-5">
          <CircleHelp className="h-5 w-5 shrink-0 text-muted" />
          <p className="max-w-2xl text-sm text-muted">
            Tidak ada kondisi kendaraan yang membutuhkan perhatian dari data
            yang tersedia.
          </p>
        </div>
      )}
    </section>
  );
}

function FleetState() {
  const fleet = useMemo(
    () => selectFleetState(MOCK_VEHICLES),
    []
  );
  const visibleStates = FLEET_STATE_META.filter(
    ({ key }) => key !== "unknown" || fleet.unknown > 0
  );
  const countedTotal = FLEET_STATE_META.reduce(
    (sum, { key }) => sum + fleet[key],
    0
  );

  return (
    <section
      className="border-t border-border px-4 py-4 sm:px-5"
      aria-labelledby="fleet-state-title"
    >
      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <div>
          <h2
            id="fleet-state-title"
            className="text-base font-semibold text-[var(--text)]"
          >
            Kondisi armada
          </h2>
          <p className="mt-0.5 text-sm text-muted">
            Distribusi status dari seluruh kendaraan
          </p>
        </div>
        <p className="text-sm text-muted">
          Total{" "}
          <span className="font-mono font-semibold tabular-nums text-[var(--text)]">
            {fleet.total}
          </span>{" "}
          unit
        </p>
      </div>

      <div className="mt-4 flex h-2 w-full overflow-hidden rounded-sm bg-surface-3">
        {visibleStates.map(({ key, label, color }) => (
          <span
            key={key}
            style={{
              width:
                fleet.total > 0
                  ? `${(fleet[key] / fleet.total) * 100}%`
                  : "0%",
              background: color,
            }}
            aria-label={`${label}: ${fleet[key]}`}
          />
        ))}
      </div>

      <dl className="mt-4 grid grid-cols-2 gap-x-5 gap-y-3 sm:grid-cols-3 lg:grid-cols-5">
        {visibleStates.map(({ key, label, color }) => (
          <div key={key} className="flex items-center justify-between gap-3">
            <dt className="flex min-w-0 items-center gap-2 text-sm text-muted">
              <span
                className="h-2 w-2 shrink-0 rounded-full"
                style={{ background: color }}
                aria-hidden="true"
              />
              <span>{label}</span>
            </dt>
            <dd className="font-mono text-sm font-semibold tabular-nums text-[var(--text)]">
              {fleet[key]}
            </dd>
          </div>
        ))}
      </dl>

      {countedTotal !== fleet.total && (
        <p className="mt-3 text-sm font-medium text-critical" role="alert">
          Jumlah status tidak sesuai dengan total armada.
        </p>
      )}
    </section>
  );
}

function OperationsPulse() {
  return (
    <section
      className="border-t border-border px-4 py-4 sm:px-5"
      aria-labelledby="operations-pulse-title"
    >
      <h2
        id="operations-pulse-title"
        className="text-base font-semibold text-[var(--text)]"
      >
        Ringkasan operasi
      </h2>
      <div className="mt-3 flex min-h-16 items-center gap-3 rounded-md bg-surface-2 px-4 py-3">
        <Database className="h-5 w-5 shrink-0 text-muted" aria-hidden="true" />
        <div>
          <p className="text-sm font-medium text-[var(--text)]">
            Data operasional task belum tersedia
          </p>
          <p className="mt-0.5 text-sm text-muted">
            Ringkasan akan tampil setelah sumber task dan trip tersedia.
          </p>
        </div>
      </div>
    </section>
  );
}

export default function DashboardPage() {
  const [nowMs, setNowMs] = useState<number | null>(null);

  useEffect(() => {
    const updateNow = () => setNowMs(Date.now());

    updateNow();
    window.addEventListener("vanguard:telemetri-refresh", updateNow);

    return () => {
      window.removeEventListener("vanguard:telemetri-refresh", updateNow);
    };
  }, []);

  return (
    <div className="mx-auto w-full max-w-[1600px] p-4 sm:p-6">
      <div className="overflow-hidden rounded-lg border border-border bg-surface-1">
        <NeedsAttention nowMs={nowMs} />
        <FleetState />
        <OperationsPulse />
      </div>
    </div>
  );
}
