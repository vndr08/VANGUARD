"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
  AlertTriangle,
  ArrowRight,
  Car,
  ChevronRight,
  Clock,
  Fuel,
  MapPin,
  Radio,
  Route,
  Settings,
  Truck,
  Video,
} from "lucide-react";
import { MOCK_STATS, MOCK_VEHICLES } from "@/lib/mock-data";
import type { DashboardStats, Vehicle } from "@/types";

export default function DashboardPage() {
  const [stats, setStats] = useState<DashboardStats>(MOCK_STATS);
  const [vehicles, setVehicles] = useState<Vehicle[]>(MOCK_VEHICLES);
  const [now, setNow] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setNow(new Date()), 30000);
    return () => clearInterval(timer);
  }, []);

  const total = stats.total_vehicles || vehicles.length || 1;
  const driving = stats.driving || vehicles.filter((v) => v.status === "driving").length;
  const idle = stats.idle || vehicles.filter((v) => v.status === "idle").length;
  const stopped = stats.stopped || vehicles.filter((v) => v.status === "stopped").length;
  const offline = stats.offline || vehicles.filter((v) => v.status === "offline").length;

  const delayed = vehicles.filter((v) => {
    if (!v.last_update) return true;
    return Date.now() - new Date(v.last_update).getTime() > 1000 * 60 * 30;
  }).length;

  const lowFuel = vehicles.filter((v) => v.fuel_level < 25).length;
  const speeding = vehicles.filter((v) => v.speed >= 75).length;

  const activeVehicles = useMemo(
    () => [...vehicles].sort((a, b) => b.speed - a.speed).slice(0, 8),
    [vehicles]
  );

  const statusGroups = [
    { label: "Driving", value: driving, color: "bg-emerald-500", count: driving },
    { label: "Idle", value: idle, color: "bg-amber-500", count: idle },
    { label: "Parking", value: stopped, color: "bg-zinc-400", count: stopped },
    { label: "Offline", value: offline, color: "bg-red-500", count: offline },
  ];

  return (
    <div className="min-h-full bg-zinc-50 dark:bg-zinc-950">
      {/* Header */}
      <header className="border-b border-zinc-200 bg-white px-8 py-6 dark:border-zinc-800 dark:bg-zinc-900">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-sm font-medium text-zinc-500">Fleet Overview</p>
            <h1 className="mt-1 text-2xl font-bold text-zinc-900 dark:text-white">
              Vehicle Status Summary
            </h1>
            <p className="mt-1 text-sm text-zinc-500">
              {now.toLocaleDateString("id-ID", {
                weekday: "long",
                day: "numeric",
                month: "long",
                year: "numeric",
              })}
            </p>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 rounded-lg border border-zinc-200 bg-zinc-50 px-4 py-2 dark:border-zinc-800 dark:bg-zinc-800">
              <Clock className="h-4 w-4 text-zinc-400" />
              <span className="text-sm font-medium text-zinc-600 dark:text-zinc-300">
                {now.toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" })}
              </span>
            </div>
          </div>
        </div>
      </header>

      <div className="p-8">
        {/* Stats Grid */}
        <div className="mb-8 grid grid-cols-2 gap-4 lg:grid-cols-4">
          <StatCard
            label="Total Units"
            value={total}
            icon={Truck}
            trend={`${driving} driving`}
          />
          <StatCard
            label="Driving"
            value={driving}
            icon={Car}
            color="text-emerald-600"
            bgColor="bg-emerald-50 dark:bg-emerald-950"
          />
          <StatCard
            label="Parking"
            value={stopped}
            icon={MapPin}
            trend={`${idle} idle`}
          />
          <StatCard
            label="Offline"
            value={offline}
            icon={Radio}
            color={offline > 0 ? "text-red-600" : "text-zinc-600"}
            bgColor={offline > 0 ? "bg-red-50 dark:bg-red-950" : ""}
          />
        </div>

        {/* Main Content Grid */}
        <div className="grid gap-6 lg:grid-cols-3">
          {/* Vehicle List */}
          <div className="lg:col-span-2">
            <div className="card overflow-hidden">
              <div className="flex items-center justify-between border-b border-zinc-200 px-5 py-4 dark:border-zinc-800">
                <div>
                  <h2 className="text-lg font-semibold text-zinc-900 dark:text-white">
                    Active Units
                  </h2>
                  <p className="text-sm text-zinc-500">Latest vehicle activity</p>
                </div>
                <Link
                  href="/tracking"
                  className="flex items-center gap-1 text-sm font-medium text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-white"
                >
                  View all
                  <ChevronRight className="h-4 w-4" />
                </Link>
              </div>

              <div className="divide-y divide-zinc-100 dark:divide-zinc-800">
                {activeVehicles.map((v) => (
                  <Link
                    key={v.id}
                    href="/tracking"
                    className="flex items-center justify-between px-5 py-3 transition-colors hover:bg-zinc-50 dark:hover:bg-zinc-900"
                  >
                    <div className="flex items-center gap-4">
                      <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-zinc-100 dark:bg-zinc-800">
                        <Truck className="h-5 w-5 text-zinc-500" />
                      </div>
                      <div>
                        <p className="font-semibold text-zinc-900 dark:text-white">
                          {v.plate_number}
                        </p>
                        <p className="text-sm text-zinc-500">
                          {v.driver_name || "No driver"} · {v.brand}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-6">
                      <div className="text-right">
                        <p className="font-mono text-sm font-semibold text-zinc-900 dark:text-white">
                          {v.speed} km/h
                        </p>
                        <p className="text-xs text-zinc-500">
                          {v.fuel_level}% fuel
                        </p>
                      </div>
                      <StatusBadge status={v.status} />
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          </div>

          {/* Side Panel */}
          <div className="space-y-6">
            {/* Status Distribution */}
            <div className="card p-5">
              <h3 className="text-sm font-semibold text-zinc-900 dark:text-white">
                Status Distribution
              </h3>
              <div className="mt-4 space-y-3">
                {statusGroups.map((group) => (
                  <div key={group.label}>
                    <div className="mb-1.5 flex items-center justify-between">
                      <span className="flex items-center gap-2 text-sm text-zinc-600 dark:text-zinc-400">
                        <span className={`h-2 w-2 rounded-full ${group.color}`} />
                        {group.label}
                      </span>
                      <span className="font-mono text-sm font-semibold text-zinc-900 dark:text-white">
                        {group.count}
                      </span>
                    </div>
                    <div className="h-1.5 overflow-hidden rounded-full bg-zinc-100 dark:bg-zinc-800">
                      <div
                        className={`h-full rounded-full ${group.color}`}
                        style={{ width: `${(group.count / total) * 100}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Alerts */}
            {(delayed > 0 || lowFuel > 0 || speeding > 0) && (
              <div className="card border-red-200 bg-red-50 p-5 dark:border-red-900 dark:bg-red-950">
                <div className="flex items-center gap-2">
                  <AlertTriangle className="h-5 w-5 text-red-600" />
                  <h3 className="text-sm font-semibold text-red-900 dark:text-red-100">
                    Attention Required
                  </h3>
                </div>
                <div className="mt-4 space-y-2">
                  {delayed > 0 && (
                    <AlertItem
                      label="GPS delayed"
                      value={delayed}
                      desc="No data > 30 min"
                    />
                  )}
                  {lowFuel > 0 && (
                    <AlertItem
                      label="Low fuel"
                      value={lowFuel}
                      desc="Below 25%"
                    />
                  )}
                  {speeding > 0 && (
                    <AlertItem
                      label="Overspeed"
                      value={speeding}
                      desc="Above 75 km/h"
                    />
                  )}
                </div>
              </div>
            )}

            {/* Quick Access */}
            <div className="card p-5">
              <h3 className="text-sm font-semibold text-zinc-900 dark:text-white">
                Quick Access
              </h3>
              <div className="mt-4 grid grid-cols-2 gap-2">
                <QuickLink href="/tracking" icon={Radio} label="Realtime" />
                <QuickLink href="/tasks" icon={Route} label="Task" />
                <QuickLink href="/history" icon={Clock} label="History" />
                <QuickLink href="/reports" icon={Fuel} label="Report" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function StatCard({
  label,
  value,
  icon: Icon,
  trend,
  color = "text-zinc-900",
  bgColor = "",
}: {
  label: string;
  value: number;
  icon: any;
  trend?: string;
  color?: string;
  bgColor?: string;
}) {
  return (
    <div className="card p-5">
      <div className="flex items-center justify-between">
        <span className="text-xs font-medium uppercase tracking-wider text-zinc-500">
          {label}
        </span>
        <Icon className="h-5 w-5 text-zinc-400" />
      </div>
      <p className={`mt-2 text-3xl font-bold ${color} dark:text-white`}>{value}</p>
      {trend && <p className="mt-1 text-sm text-zinc-500">{trend}</p>}
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  const config: Record<string, { label: string; class: string }> = {
    driving: { label: "Driving", class: "badge-success" },
    idle: { label: "Idle", class: "badge-warning" },
    stopped: { label: "Parking", class: "badge-neutral" },
    offline: { label: "Offline", class: "badge-danger" },
  };

  const { label, class: className } = config[status] || {
    label: status,
    class: "badge-neutral",
  };

  return <span className={`badge ${className}`}>{label}</span>;
}

function AlertItem({
  label,
  value,
  desc,
}: {
  label: string;
  value: number;
  desc: string;
}) {
  return (
    <div className="flex items-center justify-between rounded-lg bg-white/50 p-2 dark:bg-black/20">
      <div>
        <p className="text-sm font-medium text-red-900 dark:text-red-100">
          {label}
        </p>
        <p className="text-xs text-red-700 dark:text-red-200">{desc}</p>
      </div>
      <span className="text-lg font-bold text-red-600 dark:text-red-300">
        {value}
      </span>
    </div>
  );
}

function QuickLink({
  href,
  icon: Icon,
  label,
}: {
  href: string;
  icon: any;
  label: string;
}) {
  return (
    <Link
      href={href}
      className="flex flex-col items-center gap-2 rounded-lg border border-zinc-200 bg-zinc-50 p-3 transition-colors hover:bg-zinc-100 dark:border-zinc-800 dark:bg-zinc-900 dark:hover:bg-zinc-800"
    >
      <Icon className="h-5 w-5 text-zinc-500" />
      <span className="text-xs font-medium text-zinc-600 dark:text-zinc-400">
        {label}
      </span>
    </Link>
  );
}
