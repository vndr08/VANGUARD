"use client";

import dynamic from "next/dynamic";
import { useEffect, useMemo, useState, useCallback } from "react";
import Link from "next/link";
import {
  Radio,
  AlertTriangle,
  WifiOff,
  Gauge,
  Fuel,
  Clock,
  ArrowUpRight,
  ArrowDownRight,
  RefreshCw,
  Truck,
  Activity,
  Map,
  ChevronRight,
  ShieldAlert,
  Zap,
} from "lucide-react";
import { motion } from "motion/react";
import {
  Card,
  CardHeader,
  StatCard,
  Skeleton,
  EmptyState,
} from "@/components/ui/Card";
import { StatusPill } from "@/components/ui/Badge";
import { MOCK_STATS, MOCK_VEHICLES, toMapVehicle } from "@/lib/mock-data";
import { useAnimatedNumber } from "@/lib/motion";
import { useLiveClock } from "@/hooks/useLiveClock";
import type { Vehicle } from "@/types";
import type { DashboardStats } from "@/types";
import { MapVehicle } from "@/components/map/types";

/* ─── Data fetch (replace with real API) ─────────────────────────────────── */
async function fetchDashboardData(): Promise<{ stats: DashboardStats; vehicles: Vehicle[] }> {
  // TODO: replace with real API call via lib/api.ts
  await new Promise((r) => setTimeout(r, 400)); // simulate network
  return { stats: MOCK_STATS, vehicles: MOCK_VEHICLES };
}

/* ─── Page ─────────────────────────────────────────────────────────────── */
export default function DashboardPage() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);

  const load = useCallback(async () => {
    setLoading(true);
    setError(false);
    try {
      const data = await fetchDashboardData();
      setStats(data.stats);
      setVehicles(data.vehicles);
    } catch {
      setError(true);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  // Derive metrics
  const total = stats?.total_vehicles ?? vehicles.length;
  const driving = stats?.driving ?? vehicles.filter((v) => v.status === "driving").length;
  const idle = stats?.idle ?? vehicles.filter((v) => v.status === "idle").length;
  const stopped = stats?.stopped ?? vehicles.filter((v) => v.status === "stopped").length;
  const offline = stats?.offline ?? vehicles.filter((v) => v.status === "offline").length;
  const delayedCount = vehicles.filter((v) => {
    if (!v.last_update) return false;
    return Date.now() - new Date(v.last_update).getTime() > 1000 * 60 * 30;
  }).length;
  const lowFuelCount = vehicles.filter((v) => v.fuel_level < 25).length;
  const speedingCount = vehicles.filter((v) => v.speed >= 75).length;
  const activeTasks = Math.floor(total * 0.68); // mock
  const onTimeRate = 87.4; // mock %

  // Map vehicles for mini-map
  const mapVehicles = useMemo(() => vehicles.map(toMapVehicle), [vehicles]);

  // Exceptions requiring attention
  const exceptions = useMemo(() => {
    const items: Array<{
      id: number;
      type: "offline" | "delayed" | "lowfuel" | "speeding";
      plate: string;
      driver: string;
      message: string;
      speed?: number;
    }> = [];

    vehicles.filter((v) => v.status === "offline").slice(0, 3).forEach((v) => {
      items.push({ id: v.id, type: "offline", plate: v.plate_number, driver: v.driver_name ?? "—", message: "GPS signal lost" });
    });
    vehicles.filter((v) => {
      if (!v.last_update) return true;
      return Date.now() - new Date(v.last_update).getTime() > 1000 * 60 * 30;
    }).slice(0, 3).forEach((v) => {
      items.push({ id: v.id, type: "delayed", plate: v.plate_number, driver: v.driver_name ?? "—", message: "GPS delayed > 30 min" });
    });
    vehicles.filter((v) => v.fuel_level < 25).slice(0, 3).forEach((v) => {
      items.push({ id: v.id, type: "lowfuel", plate: v.plate_number, driver: v.driver_name ?? "—", message: `Low fuel: ${v.fuel_level}%` });
    });
    vehicles.filter((v) => v.speed >= 75).slice(0, 3).forEach((v) => {
      items.push({ id: v.id, type: "speeding", plate: v.plate_number, driver: v.driver_name ?? "—", message: `Overspeed: ${v.speed} km/h`, speed: v.speed });
    });

    return items.slice(0, 8);
  }, [vehicles]);

  // Recent activity feed (mock)
  const activityFeed = useMemo(() => [
    { id: 1, type: "task_complete", unit: "B 5678 TGP", message: "Trip BDG - BEKASI completed", time: "12 min ago", icon: <Activity className="h-3.5 w-3.5" /> },
    { id: 2, type: "alert", unit: "B 1234 KJT", message: "Speeding in public area (82 km/h)", time: "28 min ago", icon: <Gauge className="h-3.5 w-3.5" />, alert: true },
    { id: 3, type: "task_start", unit: "L 3456 ABC", message: "Trip SMG - SOLO started", time: "1h ago", icon: <Truck className="h-3.5 w-3.5" /> },
    { id: 4, type: "geofence", unit: "H 2345 GHI", message: "Entered zone: PTT TSG", time: "2h ago", icon: <Map className="h-3.5 w-3.5" /> },
    { id: 5, type: "task_complete", unit: "B 9012 XYZ", message: "Trip KTA - JKT completed", time: "3h ago", icon: <Activity className="h-3.5 w-3.5" /> },
    { id: 6, type: "alert", unit: "B 1357 MNO", message: "Low fuel warning: 18%", time: "4h ago", icon: <Fuel className="h-3.5 w-3.5" />, alert: true },
  ], []);

  // Loading skeleton
  if (loading) {
    return (
      <div className="p-6 space-y-6">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => <Skeleton key={i} height={100} rounded="lg" />)}
        </div>
        <div className="grid lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-4">
            <Skeleton height={200} rounded="lg" />
            <Skeleton height={200} rounded="lg" />
          </div>
          <Skeleton height={420} rounded="lg" />
        </div>
      </div>
    );
  }

  // Error state
  if (error || !stats) {
    return (
      <EmptyState
        icon={<AlertTriangle className="w-12 h-12" />}
        title="Failed to load dashboard"
        description="Unable to fetch fleet data. Check your connection and try again."
        action={
          <button
            onClick={load}
            className="btn btn-secondary mt-4"
          >
            <RefreshCw className="h-4 w-4" />
            Retry
          </button>
        }
      />
    );
  }

  return (
    <motion.div
      className="p-6 space-y-6 max-w-[1600px]"
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
    >
      {/* ── KPI Hero Row ──────────────────────────────────────────── */}
      <section aria-label="Fleet KPI overview">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <KPIStatCard label="Total Units" value={total} icon={<Truck className="h-5 w-5" />} />
          <KPIStatCard label="Driving" value={driving} icon={<Activity className="h-5 w-5" />} accent="driving" />
          <KPIStatCard label="Idle" value={idle} icon={<Clock className="h-5 w-5" />} accent="idle" />
          <KPIStatCard label="Offline" value={offline} icon={<WifiOff className="h-5 w-5" />} accent={offline > 0 ? "offline" : undefined} />
        </div>
      </section>

      {/* ── Main Grid ───────────────────────────────────────────── */}
      <section className="grid lg:grid-cols-3 gap-6">
        {/* Left column */}
        <div className="lg:col-span-2 space-y-6">

          {/* Status Distribution + Mini Map */}
          <div className="grid sm:grid-cols-2 gap-6">
            {/* Status Distribution */}
            <Card padding="md">
              <CardHeader
                title="Status Distribution"
                subtitle={`${total} units total`}
                className="mb-4"
              />
              <StatusDistribution
                total={total}
                driving={driving}
                idle={idle}
                stopped={stopped}
                offline={offline}
              />
            </Card>

            {/* Mini Live Map */}
            <Card padding="none" className="overflow-hidden">
              <div className="px-4 py-3 border-b border-border flex items-start justify-between gap-4">
                <div>
                  <h3 className="text-h2 font-semibold text-foreground">Live Fleet</h3>
                  <div className="flex items-center gap-1.5 mt-0.5">
                    <span className="relative flex h-2 w-2">
                      <span className="absolute inline-flex h-full w-full rounded-full animate-live-pulse" style={{ background: "var(--hud)", opacity: 0.75 }} />
                      <span className="relative inline-flex h-2 w-2 rounded-full" style={{ background: "var(--hud)" }} />
                    </span>
                    <span className="font-mono text-xs tabular-nums text-muted">{driving} units driving</span>
                  </div>
                </div>
              </div>
              <MiniFleetMap vehicles={mapVehicles} />
            </Card>
          </div>

          {/* Exception Monitor */}
          <Card padding="none">
            <div className="flex items-center justify-between px-4 pt-4 pb-3 border-b border-border">
              <div>
                <CardHeader
                  title="Attention Required"
                  subtitle={
                    exceptions.length > 0
                      ? `${exceptions.length} issue${exceptions.length > 1 ? "s" : ""} need${exceptions.length === 1 ? "s" : ""} review`
                      : "All units operating normally"
                  }
                />
              </div>
              {exceptions.length > 0 && (
                <Link
                  href="/tracking"
                  className="flex items-center gap-1 text-xs font-medium text-brand hover:text-brand-hover transition-colors shrink-0"
                >
                  View map
                  <ChevronRight className="h-3.5 w-3.5" />
                </Link>
              )}
            </div>

            {exceptions.length === 0 ? (
              <div className="py-10 text-center">
                <div className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-st-driving-bg mb-3">
                  <Activity className="h-5 w-5 text-st-driving" />
                </div>
                <p className="text-sm font-medium text-foreground">All units operating normally</p>
                <p className="text-xs text-muted mt-0.5">No exceptions requiring attention</p>
              </div>
            ) : (
              <ul className="divide-y divide-border">
                {exceptions.map((exc) => (
                  <li key={`${exc.type}-${exc.id}`}>
                    <ExceptionRow exception={exc} />
                  </li>
                ))}
              </ul>
            )}
          </Card>
        </div>

        {/* Right column */}
        <div className="space-y-6">
          {/* On-Time Rate + Active Tasks */}
          <div className="grid grid-cols-2 gap-4">
            <KPIMetricCard
              label="On-Time Rate"
              value={onTimeRate}
              unit="%"
              trend={{ value: 2.1, positive: true }}
            />
            <KPIMetricCard
              label="Active Tasks"
              value={activeTasks}
              trend={{ value: 4, positive: true }}
            />
          </div>

          {/* Quick Access */}
          <Card padding="md">
            <p className="text-label uppercase tracking-widest text-muted mb-3">Quick Access</p>
            <div className="grid grid-cols-2 gap-2">
              <QuickAccessButton href="/tracking" icon={<Radio className="h-4 w-4" />} label="Realtime Monitor" />
              <QuickAccessButton href="/tasks" icon={<Activity className="h-4 w-4" />} label="Task Monitor" />
              <QuickAccessButton href="/history" icon={<Clock className="h-4 w-4" />} label="Trip History" />
              <QuickAccessButton href="/reports" icon={<Gauge className="h-4 w-4" />} label="Reports" />
            </div>
          </Card>

          {/* Activity Feed */}
          <Card padding="none">
            <div className="px-4 pt-4 pb-3 border-b border-border">
              <CardHeader title="Recent Activity" subtitle="Last 4 hours" />
            </div>
            <ul className="divide-y divide-border">
              {activityFeed.map((item) => (
                <li key={item.id}>
                  <ActivityRow item={item} />
                </li>
              ))}
            </ul>
            <div className="px-4 py-3 border-t border-border">
              <Link
                href="/history"
                className="flex items-center justify-center gap-1 text-xs font-medium text-muted hover:text-foreground transition-colors"
              >
                View full history
                <ChevronRight className="h-3.5 w-3.5" />
              </Link>
            </div>
          </Card>
        </div>
      </section>
    </motion.div>
  );
}

/* ─── KPI Stat Card with animated count-up ───────────────────────────────── */
function KPIStatCard({
  label,
  value,
  icon,
  accent,
}: {
  label: string;
  value: number;
  icon: React.ReactNode;
  accent?: "driving" | "idle" | "offline";
}) {
  const animated = useAnimatedNumber(value, 800);

  const accentColor = accent === "driving"
    ? "var(--st-driving)"
    : accent === "idle"
    ? "var(--st-idle)"
    : accent === "offline"
    ? "var(--st-offline)"
    : "var(--text)";

  return (
    <Card padding="md" className="group relative overflow-hidden transition-all duration-200 hover:border-border-strong hover:shadow-elev-2">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-label uppercase tracking-widest text-muted mb-2">{label}</p>
          <p
            className="text-display font-semibold tabular-nums tracking-tight"
            style={{ color: accentColor }}
          >
            {animated}
          </p>
        </div>
        <div
          className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg transition-colors"
          style={{ background: accent === "driving" ? "var(--st-driving-bg)" : accent === "idle" ? "var(--st-idle-bg)" : accent === "offline" ? "var(--st-offline-bg)" : "var(--surface-2)", color: accentColor }}
        >
          {icon}
        </div>
      </div>
    </Card>
  );
}

/* ─── KPI Metric Card (smaller) ─────────────────────────────────────────── */
function KPIMetricCard({
  label,
  value,
  unit,
  trend,
}: {
  label: string;
  value: number;
  unit?: string;
  trend?: { value: number; positive: boolean };
}) {
  const animated = useAnimatedNumber(typeof value === "number" ? value : parseFloat(String(value)) || 0, 800);

  return (
    <Card padding="md">
      <p className="text-label uppercase tracking-widest text-muted mb-2">{label}</p>
      <div className="flex items-end gap-1.5">
        <p className="text-display font-semibold tabular-nums tracking-tight text-foreground">
          {animated}
        </p>
        {unit && <span className="text-sm text-muted mb-1">{unit}</span>}
      </div>
      {trend && (
        <div className={`flex items-center gap-1 mt-1 text-xs font-medium tabular-nums ${trend.positive ? "text-st-driving" : "text-st-offline"}`}>
          {trend.positive ? <ArrowUpRight className="h-3 w-3" /> : <ArrowDownRight className="h-3 w-3" />}
          {trend.positive ? "+" : ""}{trend.value}
        </div>
      )}
    </Card>
  );
}

/* ─── Status Distribution Bar ────────────────────────────────────────────── */
function StatusDistribution({
  total,
  driving,
  idle,
  stopped,
  offline,
}: {
  total: number;
  driving: number;
  idle: number;
  stopped: number;
  offline: number;
}) {
  const rows: Array<{ label: string; count: number; color: string; bgColor: string; status: "driving" | "idle" | "stop" | "offline" }> = [
    { label: "Driving", count: driving, color: "var(--st-driving)", bgColor: "var(--st-driving-bg)", status: "driving" },
    { label: "Idle", count: idle, color: "var(--st-idle)", bgColor: "var(--st-idle-bg)", status: "idle" },
    { label: "Stop / Parking", count: stopped, color: "var(--st-stop)", bgColor: "var(--st-stop-bg)", status: "stop" },
    { label: "Offline", count: offline, color: "var(--st-offline)", bgColor: "var(--st-offline-bg)", status: "offline" },
  ];

  return (
    <div className="space-y-3">
      {rows.map((row) => (
        <div key={row.status}>
          <div className="flex items-center justify-between mb-1.5">
            <div className="flex items-center gap-2">
              <span className="h-2 w-2 rounded-full shrink-0" style={{ background: row.color }} />
              <span className="text-sm text-muted">{row.label}</span>
            </div>
            <span className="font-mono text-sm font-semibold tabular-nums text-foreground">
              {row.count}
            </span>
          </div>
          <div className="h-1.5 rounded-full overflow-hidden" style={{ background: "var(--surface-3)" }}>
            <motion.div
              className="h-full rounded-full"
              style={{ background: row.color }}
              initial={{ width: 0 }}
              animate={{ width: total > 0 ? `${(row.count / total) * 100}%` : "0%" }}
              transition={{ duration: 0.8, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
            />
          </div>
        </div>
      ))}
    </div>
  );
}

/* ─── Exception Row ──────────────────────────────────────────────────────── */
const EXC_ICONS: Record<string, React.ReactNode> = {
  offline: <WifiOff className="h-4 w-4" />,
  delayed: <Clock className="h-4 w-4" />,
  lowfuel: <Fuel className="h-4 w-4" />,
  speeding: <Gauge className="h-4 w-4" />,
};

const EXC_COLORS: Record<string, { color: string; bg: string }> = {
  offline: { color: "var(--st-offline)", bg: "var(--st-offline-bg)" },
  delayed: { color: "var(--st-delayed)", bg: "var(--st-delayed-bg)" },
  lowfuel: { color: "var(--signal)", bg: "var(--signal-soft)" },
  speeding: { color: "var(--st-delayed)", bg: "var(--st-delayed-bg)" },
};

function ExceptionRow({ exception }: { exception: { id: number; type: string; plate: string; driver: string; message: string; speed?: number } }) {
  const c = EXC_COLORS[exception.type] ?? EXC_COLORS.offline;
  return (
    <Link
      href={`/tracking?focus=${exception.id}`}
      className="flex items-center gap-3 px-4 py-3 transition-colors hover:bg-surface-2 focus-visible:outline-2 focus-visible:outline-brand"
    >
      <div
        className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg"
        style={{ background: c.bg, color: c.color }}
      >
        {EXC_ICONS[exception.type]}
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <span className="font-mono text-xs font-semibold tabular-nums text-foreground">{exception.plate}</span>
          <StatusPill
            status={exception.type === "offline" ? "offline" : exception.type === "delayed" ? "delayed" : "driving"}
            showIcon={false}
            showDot={false}
            className="text-[10px] px-1.5 py-0.5"
          />
        </div>
        <p className="text-xs text-muted truncate">{exception.message}</p>
      </div>
      <ChevronRight className="h-4 w-4 text-faint shrink-0" />
    </Link>
  );
}

/* ─── Quick Access Button ────────────────────────────────────────────────── */
function QuickAccessButton({ href, icon, label }: { href: string; icon: React.ReactNode; label: string }) {
  return (
    <Link
      href={href}
      className="flex flex-col items-center gap-2 rounded-lg border border-border bg-surface-2 px-3 py-3 text-center transition-all duration-150 hover:border-border-strong hover:bg-surface-3 focus-visible:outline-2 focus-visible:outline-brand"
    >
      <span className="text-muted">{icon}</span>
      <span className="text-xs font-medium text-foreground leading-tight">{label}</span>
    </Link>
  );
}

/* ─── Activity Row ─────────────────────────────────────────────────────────── */
const ACTIVITY_COLORS: Record<string, string> = {
  task_complete: "var(--st-driving)",
  task_start: "var(--brand)",
  alert: "var(--st-offline)",
  geofence: "var(--signal)",
};

function ActivityRow({ item }: { item: { id: number; type: string; unit: string; message: string; time: string; icon: React.ReactNode; alert?: boolean } }) {
  const color = ACTIVITY_COLORS[item.type] ?? "var(--text-muted)";
  return (
    <div className="flex items-start gap-3 px-4 py-3">
      <div
        className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full mt-0.5"
        style={{ background: `${color}20`, color }}
      >
        {item.icon}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-xs text-foreground">
          <span className="font-semibold font-mono tabular-nums">{item.unit}</span>
          {" — "}
          {item.message}
        </p>
        <p className="text-[10px] text-muted mt-0.5">{item.time}</p>
      </div>
    </div>
  );
}

/* ─── Mini Fleet Map ──────────────────────────────────────────────────────── */
/**
 * Dashboard mini-map: uses GRAPHITE_DARK_RASTER (reliable raster tiles) so it
 * renders immediately without waiting for vector tile parse + graphite overrides.
 * Explicit h-[180px] on the inner div ensures the MapView container always has
 * a defined height — this is the #1 cause of a "blank" map (container collapses).
 */
const MiniFleetMap = dynamic(
  () =>
    import("@/components/map/MapView").then((m) => {
      // Wrap MapView so we can pass raster style as a prop override
      return function MiniMapWrapper(props: {
        vehicles: MapVehicle[];
        selectedId?: number | null;
        onSelectVehicle?: (id: number) => void;
        center?: [number, number];
        zoom?: number;
        pitch?: number;
        className?: string;
      }) {
        // Pass through all props to MapView — basemap choice (vector vs raster)
        // is handled by MapView internally (GRAPHITE_DARK_STYLE).
        return <m.default {...props} />;
      };
    }),
  {
    ssr: false,
    loading: () => (
      <div className="h-[180px] flex items-center justify-center bg-bg">
        <div className="h-6 w-6 rounded-full border-2 border-brand border-t-transparent animate-spin" />
      </div>
    ),
  }
);
