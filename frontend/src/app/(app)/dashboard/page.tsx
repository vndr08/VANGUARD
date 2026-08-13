"use client";

import dynamic from "next/dynamic";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { MapPin } from "lucide-react";
import type { LayerVisibility } from "@/components/map/types";
import {
  selectDriverAssignment,
  selectFleetState,
  selectNeedsAttention,
  selectTelemetryHealth,
  type DashboardAttentionIssue,
  type DashboardAttentionRow,
  type FleetStateSummary,
} from "@/lib/dashboard-data";
import { formatFreshnessAge } from "@/lib/freshness";
import { FLEET_VEHICLES, toMapVehicle } from "@/lib/fleet-data";
import { OPERATIONS_DATASET } from "@/lib/operations-data";
import { selectOperationsPulse } from "@/lib/operations-selectors";

const LiveFleetMap = dynamic(
  () => import("@/components/map/MapView"),
  {
    ssr: false,
    loading: () => (
      <div className="flex h-full items-center justify-center bg-bg text-sm text-muted">
        Memuat peta armada
      </div>
    ),
  }
);

const OVERVIEW_MAP_VISIBILITY: LayerVisibility = {
  showTrack: false,
  plannedRoute: false,
  actualRoute: false,
  checkpoint: false,
  geofence: false,
  cluster: true,
};

const FLEET_STRIP: Array<{
  key: Exclude<keyof FleetStateSummary, "unknown">;
  label: string;
  color?: string;
}> = [
  { key: "total", label: "Total" },
  { key: "driving", label: "Berkendara", color: "var(--st-driving)" },
  { key: "idle", label: "Idle", color: "var(--st-idle)" },
  { key: "stopped", label: "Berhenti", color: "var(--st-stop)" },
  { key: "offline", label: "Offline", color: "var(--st-offline)" },
];

const ATTENTION_META: Record<
  Exclude<DashboardAttentionIssue, "unassigned-driver">,
  { label: string; color: string }
> = {
  "freshness-unknown": {
    label: "Data tidak diketahui",
    color: "var(--unknown)",
  },
  "not-transmitting": {
    label: "Tidak mengirim",
    color: "var(--critical)",
  },
  offline: { label: "Offline", color: "var(--offline)" },
  delayed: { label: "Tertunda", color: "var(--warning)" },
};

function attentionMetadata(row: DashboardAttentionRow): string {
  if (row.issue === "freshness-unknown") return "Waktu telemetri tidak tersedia";
  if (row.issue === "not-transmitting") {
    return `Tidak mengirim ${formatFreshnessAge(row.ageMs)}`;
  }
  if (row.issue === "delayed") {
    return `Tertunda ${formatFreshnessAge(row.ageMs)}`;
  }
  return "Status kendaraan offline";
}

function FleetSummaryStrip({ fleet }: { fleet: FleetStateSummary }) {
  return (
    <section
      aria-label="Ringkasan kondisi armada"
      className="grid grid-cols-5 border-y border-border bg-surface-1"
    >
      {FLEET_STRIP.map(({ key, label, color }, index) => (
        <div
          key={key}
          className={`group flex min-w-0 items-center justify-between gap-2 px-4 py-4 transition-colors hover:bg-surface-2 ${index > 0 ? "border-l border-border" : ""}`}
        >
          <div className="flex flex-col">
            <span className="text-xs font-medium uppercase tracking-wide text-muted">{label}</span>
            <span className="mt-1 font-mono text-2xl font-bold tabular-nums text-foreground">
              {fleet[key]}
            </span>
          </div>
          {color && (
            <span
              className="h-3 w-3 rounded-full opacity-60 group-hover:opacity-100 transition-opacity"
              style={{ background: color }}
              aria-hidden="true"
            />
          )}
        </div>
      ))}
    </section>
  );
}

function AttentionList({ nowMs }: { nowMs: number | null }) {
  const driver = useMemo(() => selectDriverAssignment(FLEET_VEHICLES), []);
  const rows = useMemo(
    () =>
      nowMs === null
        ? null
        : selectNeedsAttention(FLEET_VEHICLES, nowMs, FLEET_VEHICLES.length)
            .filter((row) => row.issue !== "unassigned-driver")
            .slice(0, 4),
    [nowMs]
  );

  return (
    <section className="flex min-h-0 flex-col" aria-labelledby="attention-title">
      <header className="flex h-14 shrink-0 items-center justify-between border-b border-border px-5">
        <div>
          <h2 id="attention-title" className="text-base font-semibold text-foreground">
            Perlu perhatian
          </h2>
          <p className="text-xs text-muted">Prioritas data saat ini</p>
        </div>
        {rows && (
          <span className="flex h-6 items-center rounded-full bg-surface-2 px-2.5 font-mono text-xs font-medium text-muted">
            {rows.length + (driver.unassigned > 0 ? 1 : 0)}
          </span>
        )}
      </header>

      <div className="min-h-0 flex-1 overflow-y-auto">
        {rows === null ? (
          <div className="flex flex-col items-center justify-center py-8 text-muted">
            <div className="h-6 w-6 animate-spin rounded-full border-2 border-brand border-t-transparent" />
            <p className="mt-3 text-sm">Memeriksa kondisi...</p>
          </div>
        ) : rows.length === 0 && driver.unassigned === 0 ? (
          <div className="flex flex-col items-center justify-center py-8">
            <span className="text-4xl">✅</span>
            <p className="mt-2 text-sm font-medium text-foreground">Semua berjalan normal</p>
            <p className="text-xs text-muted">Tidak ada yang perlu diperhatikan</p>
          </div>
        ) : (
          <ul className="divide-y divide-border">
            {rows.map((row) => {
              const meta = ATTENTION_META[row.issue as Exclude<DashboardAttentionIssue, "unassigned-driver">];
              return (
                <li key={row.id}>
                  <Link
                    href={row.href}
                    className="group flex items-center gap-3 px-5 py-3.5 transition-colors hover:bg-surface-2/50 focus-visible:outline-2 focus-visible:outline-brand"
                    aria-label={`${row.plateNumber}: ${attentionMetadata(row)}`}
                  >
                    <span
                      className="h-2.5 w-2.5 shrink-0 rounded-full shadow-sm"
                      style={{ background: meta.color }}
                      aria-hidden="true"
                    />
                    <span className="min-w-0 flex-1">
                      <div className="flex items-baseline justify-between gap-2">
                        <span className="font-mono text-sm font-bold tabular-nums text-foreground">
                          {row.plateNumber}
                        </span>
                        <span className="text-xs font-medium text-muted">
                          {meta.label}
                        </span>
                      </div>
                      <p className="mt-0.5 text-xs text-muted">
                        {attentionMetadata(row)}
                      </p>
                    </span>
                  </Link>
                </li>
              );
            })}
            {driver.unassigned > 0 && (
              <li className="flex items-center gap-3 px-5 py-3.5">
                <span className="h-2.5 w-2.5 shrink-0 rounded-full bg-blue-500 shadow-sm" aria-hidden="true" />
                <span className="min-w-0 flex-1">
                  <div className="flex items-baseline justify-between gap-2">
                    <span className="text-sm font-semibold text-foreground">Driver belum ditugaskan</span>
                    <span className="font-mono text-xs font-semibold tabular-nums text-foreground">
                      {driver.unassigned} unit
                    </span>
                  </div>
                  <p className="mt-0.5 text-xs text-muted">Unit membutuhkan penugasan driver</p>
                </span>
              </li>
            )}
          </ul>
        )}
      </div>

      <footer className="shrink-0 border-t border-border px-5 py-3">
        <Link
          href="/tracking"
          className="inline-flex items-center gap-1.5 rounded-md px-3 py-1.5 text-sm font-medium text-brand hover:bg-brand/10 transition-colors focus-visible:outline-2 focus-visible:outline-brand"
        >
          Buka Realtime Monitor
          <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </Link>
      </footer>
    </section>
  );
}

function ConditionDistribution({ fleet }: { fleet: FleetStateSummary }) {
  const states = [
    ["driving", "Berkendara", "var(--st-driving)"],
    ["idle", "Idle", "var(--st-idle)"],
    ["stopped", "Berhenti", "var(--st-stop)"],
    ["offline", "Offline", "var(--st-offline)"],
    ["unknown", "Tidak diketahui", "var(--unknown)"],
  ] as const;
  const visible = states.filter(([key]) => key !== "unknown" || fleet.unknown > 0);

  return (
    <section aria-labelledby="condition-title" className="min-w-0 p-5">
      <div className="flex items-center justify-between">
        <h2 id="condition-title" className="text-sm font-semibold uppercase tracking-wide text-muted">
          Distribusi Kondisi
        </h2>
        <span className="font-mono text-lg font-bold text-foreground">{fleet.total}</span>
      </div>
      <div className="mt-4 flex h-2.5 overflow-hidden rounded-full bg-surface-2 shadow-inner">
        {visible.map(([key, label, color]) => (
          <span
            key={key}
            aria-label={`${label}: ${fleet[key]}`}
            className="transition-all duration-500"
            style={{
              width: fleet.total ? `${(fleet[key] / fleet.total) * 100}%` : "0%",
              background: color,
            }}
          />
        ))}
      </div>
      <dl className="mt-5 grid grid-cols-2 gap-3">
        {visible.map(([key, label, color]) => (
          <div key={key} className="flex items-center justify-between rounded-lg bg-surface-2/50 px-3 py-2">
            <dt className="flex items-center gap-2">
              <span className="h-2.5 w-2.5 shrink-0 rounded-full shadow-sm" style={{ background: color }} />
              <span className="text-sm text-muted">{label}</span>
            </dt>
            <dd className="font-mono text-base font-bold tabular-nums text-foreground">{fleet[key]}</dd>
          </div>
        ))}
      </dl>
    </section>
  );
}

function TelemetryHealth({ nowMs }: { nowMs: number | null }) {
  const health = useMemo(
    () => (nowMs === null ? null : selectTelemetryHealth(FLEET_VEHICLES, nowMs)),
    [nowMs]
  );
  const states = health
    ? [
        ["Segar", health.fresh, "var(--healthy)", "bg-green-500"],
        ["Tertunda", health.delayed, "var(--warning)", "bg-yellow-500"],
        ["Tidak mengirim", health.notTransmitting, "var(--critical)", "bg-red-500"],
        ["Tidak diketahui", health.unknown, "var(--unknown)", "bg-gray-500"],
      ] as const
    : [];

  return (
    <section aria-labelledby="telemetry-title" className="min-w-0 border-t border-border p-5 md:border-l md:border-t-0">
      <h2 id="telemetry-title" className="text-sm font-semibold uppercase tracking-wide text-muted">
        Kesehatan Data
      </h2>
      {health ? (
        <dl className="mt-5 space-y-3">
          {states.map(([label, value, color, dotClass]) => (
            <div key={label} className="flex items-center justify-between rounded-lg bg-surface-2/50 px-3 py-2">
              <dt className="flex items-center gap-2">
                <span className={`h-2.5 w-2.5 shrink-0 rounded-full ${dotClass}`} />
                <span className="text-sm text-muted">{label}</span>
              </dt>
              <dd className="font-mono text-base font-bold tabular-nums text-foreground">{value}</dd>
            </div>
          ))}
        </dl>
      ) : (
        <div className="mt-5 flex flex-col items-center py-4">
          <div className="h-5 w-5 animate-spin rounded-full border-2 border-brand border-t-transparent" />
          <p className="mt-2 text-xs text-muted">Memeriksa...</p>
        </div>
      )}
    </section>
  );
}

function DriverCoverage() {
  const driver = useMemo(() => selectDriverAssignment(FLEET_VEHICLES), []);
  const coverage = driver.total ? Math.round((driver.assigned / driver.total) * 100) : 0;

  return (
    <section aria-labelledby="driver-title" className="min-w-0 border-t border-border p-5 md:border-l md:border-t-0">
      <h2 id="driver-title" className="text-sm font-semibold uppercase tracking-wide text-muted">
        Cakupan Driver
      </h2>
      <div className="mt-5">
        <div className="flex items-baseline justify-between">
          <p className="text-sm text-muted">Driver ditugaskan</p>
          <p className="font-mono text-2xl font-bold text-foreground">{coverage}%</p>
        </div>
        <div className="mt-3 h-2.5 overflow-hidden rounded-full bg-surface-2 shadow-inner">
          <span
            className="block h-full rounded-full bg-gradient-to-r from-brand to-green-500 transition-all duration-500"
            style={{ width: `${coverage}%` }}
          />
        </div>
      </div>
      <dl className="mt-5 grid grid-cols-2 gap-3">
        <div className="rounded-lg bg-surface-2/50 px-3 py-3 text-center">
          <dt className="text-xs text-muted">Ditugaskan</dt>
          <dd className="mt-1 font-mono text-xl font-bold text-green-500">{driver.assigned}</dd>
        </div>
        <div className="rounded-lg bg-surface-2/50 px-3 py-3 text-center">
          <dt className="text-xs text-muted">Belum</dt>
          <dd className="mt-1 font-mono text-xl font-bold text-orange-500">{driver.unassigned}</dd>
        </div>
      </dl>
    </section>
  );
}

const OPERATIONS_PULSE = selectOperationsPulse(
  OPERATIONS_DATASET,
  OPERATIONS_DATASET.referenceTimeMs,
  3
);

const OPERATION_METRICS = [
  { label: "Tugas aktif", value: OPERATIONS_PULSE.activeTaskCount },
  { label: "Tugas terlambat", value: OPERATIONS_PULSE.lateTaskCount },
  { label: "Selesai", value: OPERATIONS_PULSE.completedTodayCount },
  { label: "Perjalanan berjalan", value: OPERATIONS_PULSE.runningTripCount },
  { label: "Tepat waktu", value: OPERATIONS_PULSE.onTimeRate === null ? "-" : `${OPERATIONS_PULSE.onTimeRate}%` },
] as const;

const operationTime = new Intl.DateTimeFormat("id-ID", {
  timeZone: "Asia/Jakarta",
  hour: "2-digit",
  minute: "2-digit",
});
const operationDate = new Intl.DateTimeFormat("id-ID", {
  timeZone: "Asia/Jakarta",
  day: "2-digit",
  month: "short",
  year: "numeric",
}).format(OPERATIONS_DATASET.referenceTimeMs);

function OperationsOverview() {
  const vehicleById = useMemo(
    () => new Map(FLEET_VEHICLES.map((vehicle) => [vehicle.id, vehicle])),
    []
  );

  return (
    <section className="overflow-hidden rounded-lg border border-border bg-surface-1" aria-labelledby="operations-title">
      <div className="border-b border-border bg-gradient-to-r from-surface-1 to-surface-2 px-5 py-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 id="operations-title" className="text-base font-semibold text-foreground">
              Operasi
            </h2>
            <p className="text-xs text-muted">{operationDate} · {operationTime.format(OPERATIONS_DATASET.referenceTimeMs)}</p>
          </div>
          <Link
            href="/tasks"
            className="text-sm font-medium text-brand hover:text-brand-hover transition-colors"
          >
            Lihat semua →
          </Link>
        </div>
      </div>
      <div className="grid lg:grid-cols-[minmax(0,3fr)_minmax(280px,2fr)]">
        <div className="border-b border-border px-5 py-4 lg:border-b-0 lg:border-r lg:border-border">
          <dl className="grid grid-cols-2 gap-4 sm:grid-cols-5">
            {OPERATION_METRICS.map((metric, index) => (
              <div
                key={metric.label}
                className={`text-center ${index > 0 ? "border-l border-border pl-4" : ""}`}
              >
                <dt className="text-xs font-medium text-muted">{metric.label}</dt>
                <dd className="mt-1 font-mono text-2xl font-bold tabular-nums text-foreground">
                  {metric.value}
                </dd>
              </div>
            ))}
          </dl>
        </div>

        <div className="px-5 py-4">
          <h3 className="text-sm font-semibold text-muted uppercase tracking-wide">Peristiwa Terbaru</h3>
          <ul className="mt-3 space-y-2">
            {OPERATIONS_PULSE.recentEvents.map((event) => (
              <li key={event.id}>
                <Link
                  href={event.href}
                  className="group flex items-start gap-3 rounded-lg px-3 py-2 transition-colors hover:bg-surface-2"
                >
                  <span className="mt-1 h-2 w-2 shrink-0 rounded-full bg-brand" />
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-sm font-medium text-foreground group-hover:text-brand transition-colors">
                      {event.title}
                    </span>
                    <span className="block truncate text-xs text-muted">
                      {vehicleById.get(event.vehicleId)?.plate_number ?? event.tripId} · {event.metadata}
                    </span>
                  </span>
                  <time className="shrink-0 font-mono text-xs tabular-nums text-muted" dateTime={event.occurredAt}>
                    {operationTime.format(Date.parse(event.occurredAt))}
                  </time>
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}

export default function DashboardPage() {
  const [nowMs, setNowMs] = useState<number | null>(null);
  const [mapVehicles, setMapVehicles] = useState(() =>
    FLEET_VEHICLES.map(toMapVehicle)
  );
  const fleet = useMemo(() => selectFleetState(FLEET_VEHICLES), []);

  useEffect(() => {
    const updateNow = () => setNowMs(new Date().valueOf());
    updateNow();
    window.addEventListener("vanguard:telemetri-refresh", updateNow);
    return () => window.removeEventListener("vanguard:telemetri-refresh", updateNow);
  }, []);

  return (
    <div
      className="mx-auto w-full max-w-[1600px] space-y-4 p-4 sm:p-6"
      data-dashboard-command-overview
    >
      {/* Fleet Summary Strip */}
      <FleetSummaryStrip fleet={fleet} />

      {/* Map + Attention Section */}
      <div className="grid min-h-[380px] overflow-hidden rounded-xl border border-border bg-surface-1 shadow-sm lg:grid-cols-[minmax(0,2fr)_minmax(300px,1fr)]">
        <section className="min-w-0 border-b border-border lg:border-b-0 lg:border-r" aria-labelledby="live-map-title">
          <header className="flex h-14 items-center justify-between border-b border-border bg-gradient-to-r from-surface-1 to-surface-2 px-5">
            <div>
              <h2 id="live-map-title" className="text-base font-semibold text-foreground">Armada Langsung</h2>
              <p className="text-xs text-muted">{fleet.total} unit aktif</p>
            </div>
            <div className="flex items-center gap-2 rounded-full bg-surface-2 px-3 py-1.5">
              <span className="relative flex h-2 w-2">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-green-400 opacity-75" />
                <span className="relative inline-flex h-2 w-2 rounded-full bg-green-500" />
              </span>
              <span className="text-sm font-medium text-foreground">{fleet.driving} bergerak</span>
            </div>
          </header>
          <div className="h-[320px] lg:h-[322px]">
            <LiveFleetMap
              vehicles={mapVehicles}
              center={[107.0, -6.5]}
              zoom={8}
              pitch={0}
              visibility={OVERVIEW_MAP_VISIBILITY}
              overviewMode
              onMapReady={() => setMapVehicles(FLEET_VEHICLES.map(toMapVehicle))}
            />
          </div>
        </section>
        <AttentionList nowMs={nowMs} />
      </div>

      {/* Stats Cards */}
      <div className="grid overflow-hidden rounded-xl border border-border bg-surface-1 shadow-sm md:grid-cols-3">
        <ConditionDistribution fleet={fleet} />
        <TelemetryHealth nowMs={nowMs} />
        <DriverCoverage />
      </div>

      {/* Operations Overview */}
      <OperationsOverview />
    </div>
  );
}
