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
import { MOCK_VEHICLES, toMapVehicle } from "@/lib/mock-data";
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
          className={`flex min-w-0 items-center justify-between gap-2 px-3 py-3 sm:px-4 ${index > 0 ? "border-l border-border" : ""}`}
        >
          <span className="truncate text-sm text-muted">{label}</span>
          <span className="flex items-center gap-2 font-mono text-sm font-semibold tabular-nums text-[var(--text)]">
            {color && (
              <span
                className="hidden h-2 w-2 rounded-full sm:block"
                style={{ background: color }}
                aria-hidden="true"
              />
            )}
            {fleet[key]}
          </span>
        </div>
      ))}
    </section>
  );
}

function AttentionList({ nowMs }: { nowMs: number | null }) {
  const driver = useMemo(() => selectDriverAssignment(MOCK_VEHICLES), []);
  const rows = useMemo(
    () =>
      nowMs === null
        ? null
        : selectNeedsAttention(MOCK_VEHICLES, nowMs, MOCK_VEHICLES.length)
            .filter((row) => row.issue !== "unassigned-driver")
            .slice(0, 3),
    [nowMs]
  );

  return (
    <section className="flex min-h-0 flex-col" aria-labelledby="attention-title">
      <header className="flex h-14 shrink-0 items-center justify-between border-b border-border px-4">
        <div>
          <h2 id="attention-title" className="text-base font-semibold text-[var(--text)]">
            Perlu perhatian
          </h2>
          <p className="text-sm text-muted">Prioritas dari data kendaraan saat ini</p>
        </div>
        {rows && (
          <span className="font-mono text-sm tabular-nums text-muted">
            {rows.length + (driver.unassigned > 0 ? 1 : 0)} isu
          </span>
        )}
      </header>

      <div className="min-h-0 flex-1 overflow-y-auto">
        {rows === null ? (
          <p className="px-4 py-5 text-sm text-muted" role="status">
            Memeriksa kondisi telemetri
          </p>
        ) : rows.length === 0 && driver.unassigned === 0 ? (
          <p className="px-4 py-5 text-sm text-muted">
            Tidak ada kondisi yang membutuhkan perhatian.
          </p>
        ) : (
          <ul className="divide-y divide-border">
            {rows.map((row) => {
              const meta = ATTENTION_META[row.issue as Exclude<DashboardAttentionIssue, "unassigned-driver">];
              return (
                <li key={row.id}>
                  <Link
                    href={row.href}
                    className="grid grid-cols-[8px_minmax(0,1fr)] gap-3 px-4 py-3 hover:bg-surface-2 focus-visible:outline-2 focus-visible:outline-brand focus-visible:outline-offset-[-2px]"
                    aria-label={`${row.plateNumber}: ${attentionMetadata(row)}`}
                  >
                    <span
                      className="mt-1.5 h-2 w-2 rounded-full"
                      style={{ background: meta.color }}
                      aria-hidden="true"
                    />
                    <span className="min-w-0">
                      <span className="flex flex-wrap items-baseline justify-between gap-x-3 gap-y-1">
                        <span className="font-mono text-sm font-semibold tabular-nums text-[var(--text)]">
                          {row.plateNumber}
                        </span>
                        <span className="text-sm font-medium text-[var(--text)]">
                          {meta.label}
                        </span>
                      </span>
                      <span className="mt-0.5 block text-sm text-muted">
                        {attentionMetadata(row)}
                      </span>
                    </span>
                  </Link>
                </li>
              );
            })}
            {driver.unassigned > 0 && (
              <li className="grid grid-cols-[8px_minmax(0,1fr)] gap-3 px-4 py-3">
                <span className="mt-1.5 h-2 w-2 rounded-full bg-information" aria-hidden="true" />
                <span className="min-w-0">
                  <span className="flex flex-wrap items-baseline justify-between gap-x-3 gap-y-1">
                    <span className="text-sm font-semibold text-[var(--text)]">Penugasan driver</span>
                    <span className="font-mono text-sm font-semibold tabular-nums text-[var(--text)]">
                      {driver.unassigned} unit
                    </span>
                  </span>
                  <span className="mt-0.5 block text-sm text-muted">Belum memiliki driver</span>
                </span>
              </li>
            )}
          </ul>
        )}
      </div>

      <footer className="shrink-0 border-t border-border px-4 py-3">
        <Link
          href="/tracking"
          className="inline-flex rounded-sm text-sm font-medium text-brand hover:text-brand-hover focus-visible:outline-2 focus-visible:outline-brand focus-visible:outline-offset-2"
        >
          Buka Realtime Monitor →
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
    <section aria-labelledby="condition-title" className="min-w-0 px-4 py-4">
      <h2 id="condition-title" className="text-base font-semibold text-[var(--text)]">
        Distribusi kondisi
      </h2>
      <div className="mt-4 flex h-2 overflow-hidden rounded-sm bg-surface-3">
        {visible.map(([key, label, color]) => (
          <span
            key={key}
            aria-label={`${label}: ${fleet[key]}`}
            style={{
              width: fleet.total ? `${(fleet[key] / fleet.total) * 100}%` : "0%",
              background: color,
            }}
          />
        ))}
      </div>
      <dl className="mt-4 grid grid-cols-2 gap-x-4 gap-y-2">
        {visible.map(([key, label, color]) => (
          <div key={key} className="flex items-center justify-between gap-2 text-sm">
            <dt className="flex min-w-0 items-center gap-2 text-muted">
              <span className="h-2 w-2 shrink-0 rounded-full" style={{ background: color }} />
              <span className="truncate">{label}</span>
            </dt>
            <dd className="font-mono font-semibold tabular-nums text-[var(--text)]">{fleet[key]}</dd>
          </div>
        ))}
      </dl>
    </section>
  );
}

function TelemetryHealth({ nowMs }: { nowMs: number | null }) {
  const health = useMemo(
    () => (nowMs === null ? null : selectTelemetryHealth(MOCK_VEHICLES, nowMs)),
    [nowMs]
  );
  const states = health
    ? [
        ["Segar", health.fresh, "var(--healthy)"],
        ["Tertunda", health.delayed, "var(--warning)"],
        ["Tidak mengirim", health.notTransmitting, "var(--critical)"],
        ["Tidak diketahui", health.unknown, "var(--unknown)"],
      ] as const
    : [];

  return (
    <section aria-labelledby="telemetry-title" className="min-w-0 border-t border-border px-4 py-4 md:border-l md:border-t-0">
      <h2 id="telemetry-title" className="text-base font-semibold text-[var(--text)]">Kesehatan data</h2>
      {health ? (
        <dl className="mt-4 space-y-2">
          {states.map(([label, value, color]) => (
            <div key={label} className="flex items-center justify-between gap-3 text-sm">
              <dt className="flex items-center gap-2 text-muted">
                <span className="h-2 w-2 rounded-full" style={{ background: color }} />
                {label}
              </dt>
              <dd className="font-mono font-semibold tabular-nums text-[var(--text)]">{value}</dd>
            </div>
          ))}
        </dl>
      ) : (
        <p className="mt-4 text-sm text-muted" role="status">Memeriksa data telemetri</p>
      )}
    </section>
  );
}

function DriverCoverage() {
  const driver = useMemo(() => selectDriverAssignment(MOCK_VEHICLES), []);
  const coverage = driver.total ? Math.round((driver.assigned / driver.total) * 100) : 0;

  return (
    <section aria-labelledby="driver-title" className="min-w-0 border-t border-border px-4 py-4 md:border-l md:border-t-0">
      <h2 id="driver-title" className="text-base font-semibold text-[var(--text)]">Cakupan driver</h2>
      <div className="mt-4 flex items-baseline justify-between gap-4">
        <p className="text-sm text-muted">Unit dengan driver</p>
        <p className="font-mono text-sm font-semibold tabular-nums text-[var(--text)]">{coverage}%</p>
      </div>
      <div className="mt-2 h-2 overflow-hidden rounded-sm bg-surface-3">
        <span className="block h-full bg-information" style={{ width: `${coverage}%` }} />
      </div>
      <dl className="mt-4 grid grid-cols-2 gap-4 text-sm">
        <div><dt className="text-muted">Ditugaskan</dt><dd className="mt-1 font-mono font-semibold text-[var(--text)]">{driver.assigned}</dd></div>
        <div><dt className="text-muted">Belum ditugaskan</dt><dd className="mt-1 font-mono font-semibold text-[var(--text)]">{driver.unassigned}</dd></div>
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
    () => new Map(MOCK_VEHICLES.map((vehicle) => [vehicle.id, vehicle])),
    []
  );

  return (
    <section className="border-y border-border bg-surface-1" aria-labelledby="operations-title">
      <div className="grid lg:grid-cols-[minmax(0,3fr)_minmax(320px,2fr)]">
        <div className="min-w-0 px-4 py-4 lg:border-r lg:border-border">
          <h2 id="operations-title" className="text-base font-semibold text-[var(--text)]">
            Operasi · {operationDate}
          </h2>
          <dl className="mt-4 grid grid-cols-2 sm:grid-cols-5">
            {OPERATION_METRICS.map((metric, index) => (
              <div
                key={metric.label}
                className={`min-w-0 px-3 py-2 first:pl-0 ${index > 0 ? "border-l border-border" : ""}`}
              >
                <dt className="text-sm text-muted">{metric.label}</dt>
                <dd className="mt-1 font-mono text-lg font-semibold tabular-nums text-[var(--text)]">
                  {metric.value}
                </dd>
              </div>
            ))}
          </dl>
        </div>

        <div className="min-w-0 border-t border-border px-4 py-4 lg:border-t-0">
          <h3 className="text-sm font-semibold text-[var(--text)]">Peristiwa terbaru</h3>
          <ul className="mt-2 divide-y divide-border">
            {OPERATIONS_PULSE.recentEvents.map((event) => (
              <li key={event.id}>
                <Link
                  href={event.href}
                  className="grid grid-cols-[minmax(0,1fr)_auto] gap-3 py-2 text-sm hover:text-brand focus-visible:outline-2 focus-visible:outline-brand focus-visible:outline-offset-2"
                >
                  <span className="min-w-0">
                    <span className="block truncate font-medium text-[var(--text)]">{event.title}</span>
                    <span className="block truncate text-muted">
                      {vehicleById.get(event.vehicleId)?.plate_number ?? event.tripId} · {event.metadata}
                    </span>
                  </span>
                  <time className="font-mono tabular-nums text-muted" dateTime={event.occurredAt}>
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
    MOCK_VEHICLES.map(toMapVehicle)
  );
  const fleet = useMemo(() => selectFleetState(MOCK_VEHICLES), []);

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
      <FleetSummaryStrip fleet={fleet} />

      <div className="grid min-h-[340px] overflow-hidden rounded-lg border border-border bg-surface-1 lg:grid-cols-[minmax(0,2fr)_minmax(300px,1fr)]">
        <section className="min-w-0 border-b border-border lg:border-b-0 lg:border-r" aria-labelledby="live-map-title">
          <header className="flex h-14 items-center justify-between border-b border-border px-4">
            <div>
              <h2 id="live-map-title" className="text-base font-semibold text-[var(--text)]">Armada langsung</h2>
              <p className="text-sm text-muted">Posisi terkini dari {fleet.total} unit</p>
            </div>
            <span className="flex items-center gap-2 text-sm text-muted"><MapPin className="h-4 w-4" />{fleet.driving} bergerak</span>
          </header>
          <div className="h-[300px] lg:h-[306px]">
            <LiveFleetMap
              vehicles={mapVehicles}
              center={[107.0, -6.5]}
              zoom={8}
              pitch={0}
              visibility={OVERVIEW_MAP_VISIBILITY}
              overviewMode
              onMapReady={() => setMapVehicles(MOCK_VEHICLES.map(toMapVehicle))}
            />
          </div>
        </section>
        <AttentionList nowMs={nowMs} />
      </div>

      <div className="grid overflow-hidden rounded-lg border border-border bg-surface-1 md:grid-cols-3">
        <ConditionDistribution fleet={fleet} />
        <TelemetryHealth nowMs={nowMs} />
        <DriverCoverage />
      </div>

      <OperationsOverview />
    </div>
  );
}
