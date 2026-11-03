"use client";

import dynamic from "next/dynamic";
import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";
import { CheckCircle2, Video } from "lucide-react";
import { useAppContext } from "@/components/context/AppContext";
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
import { FLEET_VEHICLES } from "@/lib/fleet-data";
import { OPERATIONS_DATASET } from "@/lib/operations-data";
import { toOperationalMapVehicle } from "@/lib/operations-map";
import { selectOperationsPulse } from "@/lib/operations-selectors";
import { useReducedMotion } from "@/hooks/useReducedMotion";

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

function AnimatedNumber({ value, suffix = "" }: { value: number; suffix?: string }) {
  const reducedMotion = useReducedMotion();
  const previous = useRef(value);
  const [display, setDisplay] = useState(value);

  useEffect(() => {
    const from = previous.current;
    previous.current = value;
    if (reducedMotion || from === value) {
      setDisplay(value);
      return;
    }

    const startedAt = performance.now();
    const duration = 420;
    let frame = 0;
    const tick = (now: number) => {
      const progress = Math.min(1, (now - startedAt) / duration);
      const eased = 1 - Math.pow(1 - progress, 4);
      setDisplay(Math.round(from + (value - from) * eased));
      if (progress < 1) frame = requestAnimationFrame(tick);
    };
    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [reducedMotion, value]);

  return <>{display}{suffix}</>;
}

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
      className="grid grid-cols-5 border-y border-border"
      style={{ background: "var(--surface-1)" }}
    >
      {FLEET_STRIP.map(({ key, label, color }, index) => (
        <div
          key={key}
          className={`group flex min-w-0 items-center justify-between gap-2 px-4 py-4 transition-colors ${index > 0 ? "border-l" : ""}`}
          style={{ borderColor: "var(--line)" }}
        >
          <div className="flex flex-col">
            <span className="label">{label}</span>
            <span className="mt-1 font-mono text-2xl font-bold tabular-nums" style={{ color: "var(--ink)" }}>
              <AnimatedNumber value={fleet[key]} />
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

function VisualArchivePreview() {
  const reducedMotion = useReducedMotion();

  return (
    <Link
      href="/snapshots"
      className="group absolute bottom-3 right-3 z-20 hidden w-56 overflow-hidden border border-border bg-surface-1 shadow-lg transition-colors hover:border-brand focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand md:block"
      aria-label="Buka arsip visual kamera"
    >
      <div className="relative aspect-video bg-surface-2">
        <video
          autoPlay={!reducedMotion}
          muted
          loop
          playsInline
          preload="metadata"
          poster="/media/truck/driver-dashboard.jpg"
          className="h-full w-full object-cover"
        >
          <source src="/media/truck/cabin-navigation.webm" type="video/webm" />
        </video>
        <span className="absolute left-2 top-2 inline-flex items-center gap-1 border border-white/30 bg-black/70 px-1.5 py-1 text-[10px] font-semibold uppercase tracking-wide text-white">
          <Video className="h-3 w-3" aria-hidden="true" />
          Arsip visual
        </span>
      </div>
      <div className="flex items-center justify-between gap-2 border-t border-border px-2.5 py-2 text-xs">
        <span className="text-muted">Rekaman kabin</span>
        <span className="font-medium text-brand">Lihat bukti</span>
      </div>
    </Link>
  );
}

function AttentionList({ nowMs, vehicles }: { nowMs: number | null; vehicles: typeof FLEET_VEHICLES }) {
  const driver = useMemo(() => selectDriverAssignment(vehicles), [vehicles]);
  const rows = useMemo(
    () =>
      nowMs === null
        ? null
        : selectNeedsAttention(vehicles, nowMs, vehicles.length)
            .filter((row) => row.issue !== "unassigned-driver")
            .slice(0, 4),
    [nowMs, vehicles]
  );

  return (
    <section className="flex h-full min-h-0 flex-col" aria-labelledby="attention-title">
      <header className="flex h-14 shrink-0 items-center justify-between border-b px-5" style={{ borderColor: "var(--line)" }}>
        <div>
          <h2 id="attention-title" className="text-base font-semibold" style={{ color: "var(--ink)" }}>
            Perlu perhatian
          </h2>
          <p className="text-xs" style={{ color: "var(--muted)" }}>Prioritas data saat ini</p>
        </div>
        {rows && (
          <span className="flex h-6 items-center rounded-full px-2.5 font-mono text-xs font-medium" style={{ background: "var(--surface-2)", color: "var(--muted)" }}>
            {rows.length + (driver.unassigned > 0 ? 1 : 0)}
          </span>
        )}
      </header>

      <div className="min-h-0 flex-1 overflow-y-auto">
        {rows === null ? (
          <div className="flex flex-col items-center justify-center py-8">
            <div className="h-6 w-6 rounded-full border-2 animate-spin" style={{ borderColor: "var(--signal)", borderTopColor: "transparent" }} />
            <p className="mt-3 text-sm" style={{ color: "var(--muted)" }}>Memeriksa kondisi...</p>
          </div>
        ) : rows.length === 0 && driver.unassigned === 0 ? (
          <div className="flex flex-col items-center justify-center py-8">
            <CheckCircle2 className="h-8 w-8 text-st-driving" aria-hidden="true" />
            <p className="mt-2 text-sm font-medium" style={{ color: "var(--ink)" }}>Semua berjalan normal</p>
            <p className="text-xs" style={{ color: "var(--muted)" }}>Tidak ada yang perlu diperhatikan</p>
          </div>
        ) : (
          <ul>
            {rows.map((row) => {
              const meta = ATTENTION_META[row.issue as Exclude<DashboardAttentionIssue, "unassigned-driver">];
              return (
                <li key={row.id}>
                  <Link
                    href={row.href}
                    className="group flex items-center gap-3 px-5 py-3.5 transition-colors"
                    style={{ borderBottom: "1px solid var(--line)" }}
                    aria-label={`${row.plateNumber}: ${attentionMetadata(row)}`}
                  >
                    <span
                      className="h-2.5 w-2.5 shrink-0 rounded-full"
                      style={{ background: meta.color }}
                      aria-hidden="true"
                    />
                    <span className="min-w-0 flex-1">
                      <div className="flex items-baseline justify-between gap-2">
                        <span className="plate">{row.plateNumber}</span>
                        <span className="text-xs font-medium" style={{ color: "var(--muted)" }}>
                          {meta.label}
                        </span>
                      </div>
                      <p className="mt-0.5 text-xs" style={{ color: "var(--muted)" }}>
                        {attentionMetadata(row)}
                      </p>
                    </span>
                  </Link>
                </li>
              );
            })}
            {driver.unassigned > 0 && (
              <li className="flex items-center gap-3 px-5 py-3.5" style={{ borderBottom: "1px solid var(--line)" }}>
                <span className="h-2.5 w-2.5 shrink-0 rounded-full" style={{ background: "var(--information)" }} aria-hidden="true" />
                <span className="min-w-0 flex-1">
                  <div className="flex items-baseline justify-between gap-2">
                    <span className="text-sm font-semibold" style={{ color: "var(--ink)" }}>Driver belum ditugaskan</span>
                    <span className="font-mono text-xs font-semibold tabular-nums" style={{ color: "var(--ink)" }}>
                      {driver.unassigned} unit
                    </span>
                  </div>
                  <p className="mt-0.5 text-xs" style={{ color: "var(--muted)" }}>Unit membutuhkan penugasan driver</p>
                </span>
              </li>
            )}
          </ul>
        )}
      </div>

      <footer className="shrink-0 border-t px-5 py-3" style={{ borderColor: "var(--line)" }}>
        <Link
          href="/tracking"
          className="group/link inline-flex items-center gap-1.5 text-sm font-medium transition-colors"
          style={{ color: "var(--signal)" }}
        >
          Buka Realtime Monitor
          <svg className="h-4 w-4 transition-transform group-hover/link:translate-x-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5l7 7-7 7" />
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
        <h2 id="condition-title" className="label">Distribusi Kondisi</h2>
        <span className="font-mono text-lg font-bold" style={{ color: "var(--ink)" }}>{fleet.total}</span>
      </div>
      <div className="mt-4 flex h-2.5 overflow-hidden rounded-full" style={{ background: "var(--surface-3)" }}>
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
          <div key={key} className="flex items-center justify-between rounded-sm px-3 py-2" style={{ background: "var(--surface-2)" }}>
            <dt className="flex items-center gap-2">
              <span className="h-2.5 w-2.5 shrink-0 rounded-full" style={{ background: color }} />
              <span className="text-sm" style={{ color: "var(--muted)" }}>{label}</span>
            </dt>
            <dd className="font-mono text-base font-bold tabular-nums" style={{ color: "var(--ink)" }}>{fleet[key]}</dd>
          </div>
        ))}
      </dl>
    </section>
  );
}

function TelemetryHealth({ nowMs, vehicles }: { nowMs: number | null; vehicles: typeof FLEET_VEHICLES }) {
  const health = useMemo(
    () => (nowMs === null ? null : selectTelemetryHealth(vehicles, nowMs)),
    [nowMs, vehicles]
  );
  const states = health
    ? [
        ["Segar", health.fresh, "var(--healthy)", "var(--healthy)"],
        ["Tertunda", health.delayed, "var(--warning)", "var(--warning)"],
        ["Tidak mengirim", health.notTransmitting, "var(--critical)", "var(--critical)"],
        ["Tidak diketahui", health.unknown, "var(--unknown)", "var(--unknown)"],
      ] as const
    : [];

  return (
    <section aria-labelledby="telemetry-title" className="min-w-0 border-t p-5 lg:border-l lg:border-t-0" style={{ borderColor: "var(--line)" }}>
      <h2 id="telemetry-title" className="label">Kesehatan Data</h2>
      {health ? (
        <dl className="mt-5 space-y-3">
          {states.map(([label, value, color]) => (
            <div key={label} className="flex items-center justify-between rounded-sm px-3 py-2" style={{ background: "var(--surface-2)" }}>
              <dt className="flex items-center gap-2">
                <span className="h-2.5 w-2.5 shrink-0 rounded-full" style={{ background: color }} />
                <span className="text-sm" style={{ color: "var(--muted)" }}>{label}</span>
              </dt>
              <dd className="font-mono text-base font-bold tabular-nums" style={{ color: "var(--ink)" }}>{value}</dd>
            </div>
          ))}
        </dl>
      ) : (
        <div className="mt-5 flex flex-col items-center py-4">
          <div className="h-5 w-5 animate-spin rounded-full" style={{ border: "2px solid var(--signal)", borderTopColor: "transparent" }} />
          <p className="mt-2 text-xs" style={{ color: "var(--muted)" }}>Memeriksa...</p>
        </div>
      )}
    </section>
  );
}

function DriverCoverage({ vehicles }: { vehicles: typeof FLEET_VEHICLES }) {
  const driver = useMemo(() => selectDriverAssignment(vehicles), [vehicles]);
  const coverage = driver.total ? Math.round((driver.assigned / driver.total) * 100) : 0;

  return (
    <section aria-labelledby="driver-title" className="min-w-0 border-t p-5 lg:border-l lg:border-t-0" style={{ borderColor: "var(--line)" }}>
      <h2 id="driver-title" className="label">Cakupan Driver</h2>
      <div className="mt-5">
        <div className="flex items-baseline justify-between">
          <p className="text-sm" style={{ color: "var(--muted)" }}>Driver ditugaskan</p>
          <p className="font-mono text-2xl font-bold" style={{ color: "var(--ink)" }}>{coverage}%</p>
        </div>
        <div className="mt-3 h-2.5 overflow-hidden rounded-full" style={{ background: "var(--surface-3)" }}>
          <span
            className="block h-full rounded-full transition-all duration-500"
            style={{ width: `${coverage}%`, background: "var(--st-driving)" }}
          />
        </div>
      </div>
      <dl className="mt-5 grid grid-cols-2 gap-3">
        <div className="rounded-sm px-3 py-3 text-center" style={{ background: "var(--surface-2)" }}>
          <dt className="text-xs" style={{ color: "var(--muted)" }}>Ditugaskan</dt>
          <dd className="mt-1 font-mono text-xl font-bold" style={{ color: "var(--st-driving)" }}>{driver.assigned}</dd>
        </div>
        <div className="rounded-sm px-3 py-3 text-center" style={{ background: "var(--surface-2)" }}>
          <dt className="text-xs" style={{ color: "var(--muted)" }}>Belum</dt>
          <dd className="mt-1 font-mono text-xl font-bold" style={{ color: "var(--st-idle)" }}>{driver.unassigned}</dd>
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

function OperationsOverview({ vehicles }: { vehicles: typeof FLEET_VEHICLES }) {
  const vehicleById = useMemo(
    () => new Map(vehicles.map((vehicle) => [vehicle.id, vehicle])),
    [vehicles]
  );

  return (
    <section className="overflow-hidden border border-border" style={{ background: "var(--surface-1)" }} aria-labelledby="operations-title">
      <div className="border-b px-5 py-4" style={{ background: "var(--header-ink)", borderColor: "var(--line)" }}>
        <div className="flex items-center justify-between">
          <div>
            <h2 id="operations-title" className="text-base font-semibold text-white">
              Operasi
            </h2>
            <p className="text-xs text-[#aeb8b0]">{operationDate} · {operationTime.format(OPERATIONS_DATASET.referenceTimeMs)}</p>
          </div>
          <Link
            href="/tasks"
            className="text-sm font-medium transition-colors"
            style={{ color: "var(--signal)" }}
          >
            Lihat semua →
          </Link>
        </div>
      </div>
      <div className="grid lg:grid-cols-[minmax(0,3fr)_minmax(280px,2fr)]">
        <div className="border-b px-5 py-4 lg:border-b-0 lg:border-r" style={{ borderColor: "var(--line)" }}>
          <dl className="grid grid-cols-2 gap-4 sm:grid-cols-5">
            {OPERATION_METRICS.map((metric, index) => (
              <div
                key={metric.label}
                className={`text-center ${index > 0 ? "border-l pl-4" : ""}`}
                style={{ borderColor: "var(--line)" }}
              >
                <dt className="text-xs font-medium" style={{ color: "var(--muted)" }}>{metric.label}</dt>
                <dd className="mt-1 font-mono text-2xl font-bold tabular-nums" style={{ color: "var(--ink)" }}>
                  {metric.value}
                </dd>
              </div>
            ))}
          </dl>
        </div>

        <div className="px-5 py-4">
          <h3 className="label">Peristiwa Terbaru</h3>
          <ul className="mt-3 space-y-2">
            {OPERATIONS_PULSE.recentEvents.map((event) => (
              <li key={event.id}>
                <Link
                  href={event.href}
                  className="group flex items-start gap-3 rounded-sm px-3 py-2 transition-colors"
                  style={{}}
                >
                  <span className="mt-1 h-2 w-2 shrink-0 rounded-full" style={{ background: "var(--signal)" }} />
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-sm font-medium transition-colors" style={{ color: "var(--ink)" }}>
                      {event.title}
                    </span>
                    <span className="block truncate text-xs" style={{ color: "var(--muted)" }}>
                      {vehicleById.get(event.vehicleId)?.plate_number ?? event.tripId} · {event.metadata}
                    </span>
                  </span>
                  <time className="shrink-0 font-mono text-xs tabular-nums" style={{ color: "var(--muted)" }} dateTime={event.occurredAt}>
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
    FLEET_VEHICLES.map(toOperationalMapVehicle)
  );
  const { vehicles } = useAppContext();
  const displayVehicles = vehicles.length > 0 ? vehicles : FLEET_VEHICLES;
  const fleet = useMemo(() => selectFleetState(displayVehicles), [displayVehicles]);

  // Update map vehicles when API data changes
  useEffect(() => {
    if (vehicles.length > 0) {
      setMapVehicles(vehicles.map(toOperationalMapVehicle));
    }
  }, [vehicles]);

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

      <div className="grid gap-4 lg:grid-cols-[minmax(0,2fr)_minmax(320px,1fr)]">
        <section className="v2-frame min-w-0 overflow-hidden border border-border bg-surface-1" aria-labelledby="live-map-title">
          <header className="flex h-14 items-center justify-between border-b border-border px-5">
            <div>
              <h2 id="live-map-title" className="text-base font-semibold text-foreground">Armada langsung</h2>
              <p className="text-xs text-muted">Posisi terkini · cakupan Jawa</p>
            </div>
            <div className="flex items-center gap-4">
              <span className="flex items-center gap-2 font-mono text-xs text-muted">
                <span className="h-2 w-2 rounded-full bg-st-driving" aria-hidden="true" />
                {fleet.driving} bergerak
              </span>
              <Link
                href="/tracking"
                className="text-sm font-medium text-brand transition-colors hover:text-brand-hover focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand"
              >
                Buka monitor
              </Link>
            </div>
          </header>
          <div className="relative h-[324px]">
            <LiveFleetMap
              vehicles={mapVehicles}
              center={[107.0, -6.5]}
              zoom={6.2}
              pitch={0}
              visibility={OVERVIEW_MAP_VISIBILITY}
              overviewMode
              onMapReady={() => {
                if (displayVehicles.length > 0) setMapVehicles(displayVehicles.map(toOperationalMapVehicle));
              }}
            />
            <VisualArchivePreview />
          </div>
        </section>

        <div className="v2-frame h-[260px] overflow-hidden border border-border bg-surface-1 lg:h-[380px]">
          <AttentionList nowMs={nowMs} vehicles={displayVehicles} />
        </div>
      </div>

      <div className="v2-frame grid overflow-hidden border border-border bg-surface-1 lg:grid-cols-3">
        <ConditionDistribution fleet={fleet} />
        <TelemetryHealth nowMs={nowMs} vehicles={displayVehicles} />
        <div className="border-t border-border lg:border-t-0">
          <DriverCoverage vehicles={displayVehicles} />
        </div>
      </div>

      <OperationsOverview vehicles={displayVehicles} />
    </div>
  );
}
