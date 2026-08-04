"use client";

import { useMemo, useState } from "react";
import { motion } from "motion/react";
import {
  AlertTriangle,
  Bell,
  Car,
  CheckCircle2,
  Clock,
  Gauge,
  History,
  Lock,
  Maximize2,
  Navigation,
  Power,
  Radio,
  RefreshCw,
  Search,
  Settings,
  Snowflake,
  Speaker,
  Truck,
  Unlock,
  VolumeX,
  X,
  Zap,
} from "lucide-react";
import { useToast } from "@/components/ui/Toast";
import { StatusPill } from "@/components/ui/Badge";
import { Button, IconButton } from "@/components/ui/Button";
import { Card, EmptyState } from "@/components/ui/Card";
import { useReducedMotion } from "@/hooks/useReducedMotion";
import { MOCK_VEHICLES } from "@/lib/mock-data";
import type { Vehicle } from "@/types";

/* ─── Types ─────────────────────────────────────────────────────────────────── */

type CommandStatus = "pending" | "sent" | "success" | "failed";
type SpeedLimitCmdStatus = "idle" | "pending" | "success" | "failed";

interface CommandLogEntry {
  id: string;
  vehicleId: number;
  plate_number: string;
  command: string;
  status: CommandStatus;
  timestamp: string;
}

/* ─── KPI Components ─────────────────────────────────────────────────────────── */

function KpiStat({ label, value, accent }: { label: string; value: number; accent?: string }) {
  const reducedMotion = useReducedMotion();
  return (
    <div className="flex flex-col items-center px-4 py-2 rounded-lg bg-surface-2 border border-border min-w-[72px]">
      <motion.span
        key={value}
        initial={{ opacity: 0.6, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={reducedMotion ? { duration: 0 } : { duration: 0.2 }}
        className={"text-xl font-bold tabular-nums " + (accent ?? "text-foreground")}
      >
        {value}
      </motion.span>
      <span className="text-label text-muted">{label}</span>
    </div>
  );
}

function KpiDivider() {
  return <div className="w-px h-8 bg-border self-center" />;
}

/* ─── Status Badge ─────────────────────────────────────────────────────────── */

function CommandStatusBadge({ status }: { status: CommandStatus }) {
  const variants: Record<CommandStatus, "warning" | "success" | "danger" | "default"> = {
    pending: "warning",
    sent: "warning",
    success: "success",
    failed: "danger",
  };
  const labels: Record<CommandStatus, string> = {
    pending: "Menunggu",
    sent: "Terkirim",
    success: "Berhasil",
    failed: "Gagal",
  };
  const colorClass = status === "pending" || status === "sent" ? "st-idle" : status === "success" ? "st-driving" : "st-offline";
  return <span className={`inline-flex items-center gap-1 text-label font-semibold text-${colorClass} px-2 py-0.5 rounded-full bg-surface-2 border border-border`}>{labels[status]}</span>;
}

/* ─── Confirm Dialog ─────────────────────────────────────────────────────────── */

function ConfirmDialog({
  title,
  description,
  confirmLabel,
  onConfirm,
  onCancel,
  variant,
}: {
  title: string;
  description: string;
  confirmLabel: string;
  onConfirm: () => void;
  onCancel: () => void;
  variant?: "danger" | "warning";
}) {
  const reducedMotion = useReducedMotion();
  const colorClass = variant === "danger" ? "text-st-offline" : "text-st-idle";
  const btnVariant = variant === "danger" ? "danger" : "secondary";
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={reducedMotion ? { duration: 0 } : { duration: 0.15 }}
      className="flex flex-col gap-3 p-4 bg-surface-2 border border-border rounded-lg"
    >
      <div className="flex items-start gap-3">
        {variant === "danger" ? (
          <AlertTriangle className={`w-5 h-5 shrink-0 mt-0.5 ${colorClass}`} />
        ) : (
          <Bell className={`w-5 h-5 shrink-0 mt-0.5 ${colorClass}`} />
        )}
        <div>
          <p className="text-sm font-semibold text-foreground">{title}</p>
          <p className="text-xs text-muted mt-0.5">{description}</p>
        </div>
      </div>
      <div className="flex items-center gap-2">
        <Button size="sm" variant="ghost" onClick={onCancel} aria-label="Batal" className="flex-1">
          Batal
        </Button>
        <Button size="sm" variant={btnVariant} onClick={onConfirm} aria-label={confirmLabel} className="flex-1">
          {confirmLabel}
        </Button>
      </div>
    </motion.div>
  );
}

/* ─── Speed Limit Dialog ──────────────────────────────────────────────────────── */

function SpeedLimitDialog({
  currentLimit,
  onConfirm,
  onCancel,
}: {
  currentLimit: number;
  onConfirm: (limit: number) => void;
  onCancel: () => void;
}) {
  const [value, setValue] = useState(String(currentLimit));
  return (
    <div className="flex flex-col gap-3 p-4 bg-surface-2 border border-border rounded-lg">
      <p className="text-sm font-semibold text-foreground">Set Batas Kecepatan</p>
      <div className="flex items-center gap-2">
        <input
          type="number"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          min={20}
          max={200}
          className="form-input flex-1"
          autoFocus
        />
        <span className="text-sm text-muted">km/j</span>
      </div>
      <div className="flex items-center gap-2">
        <Button size="sm" variant="ghost" onClick={onCancel} className="flex-1">Batal</Button>
        <Button
          size="sm"
          variant="primary"
          onClick={() => {
            const v = parseInt(value);
            if (v >= 20 && v <= 200) onConfirm(v);
          }}
          className="flex-1"
          aria-label="Kirim batas kecepatan"
        >
          Kirim
        </Button>
      </div>
    </div>
  );
}

/* ─── Command Card ───────────────────────────────────────────────────────────── */

function CommandCard({
  icon,
  label,
  description,
  onSend,
  confirmDialog,
  disabled,
  variant,
}: {
  icon: React.ReactNode;
  label: string;
  description: string;
  onSend: () => void;
  confirmDialog?: React.ReactNode;
  disabled?: boolean;
  variant?: "danger" | "default";
}) {
  const isDanger = variant === "danger";
  return (
    <div className="flex flex-col gap-2 p-4 rounded-lg bg-surface-2 border border-border hover:border-border-strong transition-colors">
      <div className="flex items-center gap-3">
        <div className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 ${isDanger ? "bg-st-offline/10" : "bg-surface-3"}`}>
          <span className={isDanger ? "text-st-offline" : "text-muted"}>{icon}</span>
        </div>
        <div className="min-w-0">
          <p className={`text-sm font-semibold ${isDanger ? "text-st-offline" : "text-foreground"}`}>{label}</p>
          <p className="text-xs text-muted mt-0.5 line-clamp-2">{description}</p>
        </div>
      </div>
      {confirmDialog ?? (
        <Button
          size="sm"
          variant={isDanger ? "danger" : "secondary"}
          onClick={onSend}
          disabled={disabled}
          className="w-full mt-1"
          aria-label={"Kirim perintah " + label}
        >
          Kirim
        </Button>
      )}
    </div>
  );
}

/* ─── Main Page ─────────────────────────────────────────────────────────────── */

export default function ControlPage() {
  const { success, error, info, warning } = useToast();

  // Target vehicles
  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState<"all" | Vehicle["status"]>("all");
  const [selectedVehicles, setSelectedVehicles] = useState<Set<number>>(new Set());

  // Engine cut-off state per vehicle
  const [engineCutOff, setEngineCutOff] = useState<Set<number>>(new Set());

  // Speed limit command dialog
  const [speedLimitTarget, setSpeedLimitTarget] = useState<number | null>(null);
  const [speedLimit, setSpeedLimit] = useState<number>(80);

  // Confirm dialogs
  const [confirmKey, setConfirmKey] = useState<string | null>(null);

  // Command log
  const [commandLog, setCommandLog] = useState<CommandLogEntry[]>([]);

  // KPI counts
  const counts = useMemo(() => ({
    unitOnline: MOCK_VEHICLES.filter((v) => v.status !== "offline").length,
    sent: commandLog.filter((l) => l.status === "sent" || l.status === "pending").length,
    waiting: commandLog.filter((l) => l.status === "pending").length,
    failed: commandLog.filter((l) => l.status === "failed").length,
  }), [commandLog]);

  // Vehicle lookup
  const vehicleMap = useMemo(() => {
    const m = new Map<number, typeof MOCK_VEHICLES[0]>();
    MOCK_VEHICLES.forEach((v) => m.set(v.id, v));
    return m;
  }, []);

  // Filtered vehicles
  const rows = useMemo(() => {
    const q = search.trim().toLowerCase();
    return MOCK_VEHICLES.filter((v) => {
      if (q && !v.plate_number.toLowerCase().includes(q) && !(v.driver_name ?? "").toLowerCase().includes(q)) return false;
      if (filterStatus !== "all" && v.status !== filterStatus) return false;
      return true;
    });
  }, [search, filterStatus]);

  function toggleVehicle(id: number) {
    setSelectedVehicles((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id); else next.add(id);
      return next;
    });
  }

  function sendCommand(command: string, vehicleIds: number[]) {
    if (vehicleIds.length === 0) {
      error("Pilih unit terlebih dahulu");
      return;
    }
    const entries: CommandLogEntry[] = vehicleIds.map((vid) => ({
      id: String(Date.now()) + "-" + vid,
      vehicleId: vid,
      plate_number: vehicleMap.get(vid)?.plate_number ?? "—",
      command,
      status: "sent",
      timestamp: new Date().toISOString(),
    }));
    setCommandLog((prev) => [...entries, ...prev].slice(0, 50));

    success("Perintah dikirim", `${command} ke ${vehicleIds.length} unit`);
    setConfirmKey(null);

    // Mock: resolve after 2-4s
    const delay = 2000 + Math.random() * 2000;
    setTimeout(() => {
      const resolvedStatus: CommandStatus = Math.random() > 0.15 ? "success" : "failed";
      setCommandLog((prev) =>
        prev.map((l) => vehicleIds.includes(l.vehicleId) && l.command === command && l.status === "sent"
          ? { ...l, status: resolvedStatus }
          : l)
      );
      if (resolvedStatus === "success") {
        info("Perintah berhasil", `${command} dieksekusi`);
      } else {
        warning("Perintah gagal", `${command} — coba lagi`);
      }
    }, delay);
  }

  function handleEngineCutOff(enable: boolean) {
    const ids = selectedVehicles.size > 0 ? Array.from(selectedVehicles) : [speedLimitTarget].filter(Boolean) as number[];
    if (ids.length === 0) { error("Pilih unit terlebih dahulu"); return; }
    if (enable) {
      setEngineCutOff((prev) => { const n = new Set(prev); ids.forEach((id) => n.add(id)); return n; });
    } else {
      setEngineCutOff((prev) => { const n = new Set(prev); ids.forEach((id) => n.delete(id)); return n; });
    }
    sendCommand(enable ? "Engine Cut-off" : "Engine Resume", ids);
  }

  function handleHorn() {
    sendCommand("Klakson", Array.from(selectedVehicles));
  }

  function handleLockDoor(lock: boolean) {
    sendCommand(lock ? "Kunci Pintu" : "Buka Pintu", Array.from(selectedVehicles));
  }

  function handleReboot() {
    sendCommand("Reboot GPS", Array.from(selectedVehicles));
  }

  function handlePing() {
    sendCommand("Minta Lokasi", Array.from(selectedVehicles));
  }

  function handleStandby() {
    sendCommand("Mode Siaga", Array.from(selectedVehicles));
  }

  function handleSpeedLimit(limit: number) {
    if (!speedLimitTarget && selectedVehicles.size === 0) { error("Pilih unit terlebih dahulu"); return; }
    const ids = speedLimitTarget ? [speedLimitTarget] : Array.from(selectedVehicles);
    setSpeedLimit(limit);
    setSpeedLimitTarget(null);
    sendCommand(`Set Batas ${limit} km/j`, ids);
  }

  function handleAC(on: boolean) {
    sendCommand(on ? "Nyalakan AC" : "Matikan AC", Array.from(selectedVehicles));
  }

  const isEngineCutOff = selectedVehicles.size > 0 && Array.from(selectedVehicles).some((id) => engineCutOff.has(id));
  const hasSelection = selectedVehicles.size > 0;

  function resetFilters() {
    setSearch("");
    setFilterStatus("all");
  }

  return (
    <div className="h-[calc(100vh-4rem)] flex flex-col overflow-hidden">
      {/* ─── Header ─────────────────────────────────────────────────────────── */}
      <header className="shrink-0 px-6 pt-6 pb-4 border-b border-border bg-surface-1">
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-start gap-6">
            <div>
              <p className="text-label uppercase tracking-wide text-muted">Fleet Management</p>
              <h1 className="text-h1 font-semibold text-foreground mt-0.5">Control Panel</h1>
              <p className="text-sm text-muted mt-0.5">Kirim perintah jarak jauh ke unit armada</p>
            </div>
            <div className="flex items-center gap-1 mt-6">
              <KpiStat label="Unit Online" value={counts.unitOnline} accent="text-st-driving" />
              <KpiDivider />
              <KpiStat label="Terkirim" value={counts.sent} accent="text-st-idle" />
              <KpiDivider />
              <KpiStat label="Menunggu" value={counts.waiting} />
              <KpiDivider />
              <KpiStat label="Gagal" value={counts.failed} accent={counts.failed > 0 ? "text-st-offline" : undefined} />
            </div>
          </div>

          {/* Engine cut-off warning */}
          {isEngineCutOff && (
            <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-st-offline/10 border border-st-offline/30">
              <AlertTriangle className="w-4 h-4 text-st-offline" />
              <span className="text-xs font-semibold text-st-offline">Engine cut-off aktif</span>
              <button
                onClick={() => handleEngineCutOff(false)}
                className="text-xs font-semibold text-st-offline hover:underline focus-visible:outline-2 focus-visible:outline-st-offline"
              >
                Resume
              </button>
            </div>
          )}
        </div>
      </header>

      {/* ─── Body ─────────────────────────────────────────────────────────── */}
      <div className="flex-1 overflow-hidden flex">
        {/* ── LEFT: Unit selection ─────────────────────────────────────────── */}
        <div className="w-[320px] shrink-0 border-r border-border flex flex-col overflow-hidden bg-surface-1">

          {/* Search */}
          <div className="shrink-0 px-4 py-3 border-b border-border">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted pointer-events-none" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Plat atau driver..."
                className="w-full pl-9 pr-3 py-1.5 text-sm bg-surface-2 border border-border rounded-lg
                           placeholder:text-faint text-foreground
                           focus-visible:outline-2 focus-visible:outline-brand focus-visible:outline-offset-0
                           transition-colors"
                aria-label="Cari unit"
              />
              {search && (
                <button onClick={() => setSearch("")} className="absolute right-2.5 top-1/2 -translate-y-1/2 p-0.5 rounded text-muted hover:text-foreground focus-visible:outline-2 focus-visible:outline-brand" aria-label="Hapus pencarian">
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            {/* Status filter */}
            <div className="flex items-center gap-1 mt-2">
              {([
                { key: "all" as const, label: "Semua" },
                { key: "driving" as const, label: "Driving" },
                { key: "idle" as const, label: "Idle" },
                { key: "offline" as const, label: "Offline" },
              ]).map((f) => (
                <button
                  key={f.key}
                  onClick={() => setFilterStatus(f.key)}
                  className={`px-2 py-0.5 rounded-md text-xs font-medium transition-colors focus-visible:outline-2 focus-visible:outline-brand ${
                    filterStatus === f.key
                      ? "bg-brand text-white"
                      : "bg-surface-2 text-muted hover:bg-surface-3 hover:text-foreground border border-border"
                  }`}
                >
                  {f.label}
                </button>
              ))}
            </div>
          </div>

          {/* Selection info */}
          <div className="shrink-0 px-4 py-2 border-b border-border flex items-center justify-between">
            <p className="text-xs text-muted">{selectedVehicles.size} unit dipilih</p>
            {selectedVehicles.size > 0 && (
              <button
                onClick={() => setSelectedVehicles(new Set())}
                className="text-xs text-brand hover:underline focus-visible:outline-2 focus-visible:outline-brand"
              >
                Reset
              </button>
            )}
          </div>

          {/* Vehicle list */}
          <div className="flex-1 overflow-y-auto">
            {rows.length === 0 ? (
              <div className="flex items-center justify-center h-full p-4">
                <EmptyState
                  icon={<Truck className="w-8 h-8 opacity-40" />}
                  title="Unit tidak ditemukan"
                  description="Tidak ada unit yang cocok."
                  action={<Button variant="secondary" size="sm" onClick={resetFilters}>Reset</Button>}
                />
              </div>
            ) : (
              <div className="p-2 space-y-1">
                {rows.map((v) => {
                  const isSelected = selectedVehicles.has(v.id);
                  const isCutOff = engineCutOff.has(v.id);
                  return (
                    <button
                      key={v.id}
                      onClick={() => toggleVehicle(v.id)}
                      className={`w-full rounded-lg border p-3 text-left transition-all focus-visible:outline-2 focus-visible:outline-brand ${
                        isSelected
                          ? "bg-brand/10 border-brand"
                          : "bg-surface-2 border-border hover:bg-surface-3"
                      }`}
                      aria-pressed={isSelected}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2 min-w-0">
                          {/* Checkbox visual */}
                          <span className={`w-4 h-4 rounded border-2 shrink-0 flex items-center justify-center transition-colors ${
                            isSelected ? "bg-brand border-brand" : "border-border-strong"
                          }`}>
                            {isSelected && <span className="w-1.5 h-1.5 rounded-full bg-white" />}
                          </span>
                          <span className={`font-mono font-bold text-sm tabular-nums truncate ${
                            isCutOff ? "text-st-offline" : isSelected ? "text-brand" : "text-foreground"
                          }`}>
                            {v.plate_number}
                          </span>
                        </div>
                        {isCutOff && (
                          <AlertTriangle className="w-3.5 h-3.5 text-st-offline shrink-0" />
                        )}
                      </div>
                      <p className={`mt-0.5 text-xs ${isSelected ? "text-brand/70" : "text-muted"}`}>
                        {v.driver_name || "—"}
                      </p>
                      <div className="mt-1">
                        <StatusPill
                          status={v.status === "stopped" ? "stop" : v.status as "driving" | "idle" | "offline"}
                          showIcon={false}
                          showDot={true}
                          live={v.status === "driving"}
                          className={`text-[10px] px-1.5 py-0.5 ${isSelected ? "bg-brand/20" : ""}`}
                        />
                      </div>
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* ── RIGHT: Commands + Log ─────────────────────────────────────────── */}
        <div className="flex-1 overflow-hidden flex flex-col bg-bg">
          {!hasSelection && !speedLimitTarget ? (
            <div className="flex-1 flex items-center justify-center">
              <EmptyState
                icon={<Radio className="w-8 h-8 opacity-40" />}
                title="Pilih unit untuk mengirim perintah"
                description="Klik unit di panel kiri untuk memilih. Gunakan multi-select untuk broadcast."
              />
            </div>
          ) : (
            <>
              {/* Commands grid */}
              <div className="shrink-0 px-4 pt-4 pb-2 border-b border-border">
                <div className="flex items-center gap-2 mb-3">
                  <Radio className="w-4 h-4 text-muted" />
                  <p className="text-xs font-semibold uppercase tracking-widest text-muted">
                    Perintah{hasSelection ? ` — ${selectedVehicles.size} unit` : ""}
                  </p>
                  {hasSelection && (
                    <button
                      onClick={() => setSelectedVehicles(new Set())}
                      className="ml-auto text-xs text-brand hover:underline focus-visible:outline-2 focus-visible:outline-brand"
                    >
                      Reset pemilihan
                    </button>
                  )}
                </div>
                <div className="grid grid-cols-2 gap-2 lg:grid-cols-3">
                  {/* Engine Cut-off */}
                  <CommandCard
                    icon={<Power className="w-5 h-5" />}
                    label="Engine Cut-off"
                    description="Matikan mesin unit dari jarak jauh (DESTRUCTIVE)"
                    variant="danger"
                    disabled={!hasSelection}
                    confirmDialog={
                      confirmKey === "engine-off" ? (
                        <ConfirmDialog
                          title="Engine Cut-off?"
                          description="Perintah ini akan MENGHENTIKAN mesin kendaraan. Gunakan dengan hati-hati. Lanjutkan?"
                          confirmLabel="Ya, Matikan"
                          variant="danger"
                          onConfirm={() => handleEngineCutOff(true)}
                          onCancel={() => setConfirmKey(null)}
                        />
                      ) : undefined
                    }
                    onSend={() => setConfirmKey("engine-off")}
                  />

                  {/* Engine Resume */}
                  <CommandCard
                    icon={<Power className="w-5 h-5" />}
                    label="Engine Resume"
                    description="Nyalakan kembali mesin unit (setelah cut-off)"
                    disabled={!hasSelection || !isEngineCutOff}
                    confirmDialog={
                      confirmKey === "engine-resume" ? (
                        <ConfirmDialog
                          title="Resume Engine?"
                          description="Nyalakan kembali mesin unit yang di-cut-off?"
                          confirmLabel="Ya, Nyalakan"
                          variant="warning"
                          onConfirm={() => handleEngineCutOff(false)}
                          onCancel={() => setConfirmKey(null)}
                        />
                      ) : undefined
                    }
                    onSend={() => setConfirmKey("engine-resume")}
                  />

                  {/* Horn */}
                  <CommandCard
                    icon={<Speaker className="w-5 h-5" />}
                    label="Klakson / Buzzer"
                    description="Tekan klakson unit sekali untuk lokalisasi"
                    disabled={!hasSelection}
                    onSend={handleHorn}
                  />

                  {/* Lock */}
                  <CommandCard
                    icon={<Lock className="w-5 h-5" />}
                    label="Kunci Pintu"
                    description="Kunci semua pintu kabin unit"
                    disabled={!hasSelection}
                    onSend={() => handleLockDoor(true)}
                  />

                  {/* Unlock */}
                  <CommandCard
                    icon={<Unlock className="w-5 h-5" />}
                    label="Buka Pintu"
                    description="Buka kunci pintu kabin unit"
                    disabled={!hasSelection}
                    onSend={() => handleLockDoor(false)}
                  />

                  {/* Reboot */}
                  <CommandCard
                    icon={<RefreshCw className="w-5 h-5" />}
                    label="Reboot GPS"
                    description="Reboot perangkat GPS unit dari jarak jauh"
                    disabled={!hasSelection}
                    confirmDialog={
                      confirmKey === "reboot" ? (
                        <ConfirmDialog
                          title="Reboot GPS?"
                          description="Perangkat GPS akan restart. Unit mungkin offline sesaat."
                          confirmLabel="Ya, Reboot"
                          variant="warning"
                          onConfirm={handleReboot}
                          onCancel={() => setConfirmKey(null)}
                        />
                      ) : undefined
                    }
                    onSend={() => setConfirmKey("reboot")}
                  />

                  {/* Ping */}
                  <CommandCard
                    icon={<Navigation className="w-5 h-5" />}
                    label="Minta Lokasi"
                    description="Kirim ping — unit akan kirim posisi GPS sekarang"
                    disabled={!hasSelection}
                    onSend={handlePing}
                  />

                  {/* Standby */}
                  <CommandCard
                    icon={<Zap className="w-5 h-5" />}
                    label="Mode Siaga"
                    description="Aktifkan mode siaga — mengurangi polling telemetry"
                    disabled={!hasSelection}
                    onSend={handleStandby}
                  />

                  {/* AC On */}
                  <CommandCard
                    icon={<Snowflake className="w-5 h-5" />}
                    label="Nyalakan AC"
                    description="Nyalakan AC kabin (jika didukung)"
                    disabled={!hasSelection}
                    onSend={() => handleAC(true)}
                  />

                  {/* AC Off */}
                  <CommandCard
                    icon={<VolumeX className="w-5 h-5" />}
                    label="Matikan AC"
                    description="Matikan AC kabin unit"
                    disabled={!hasSelection}
                    onSend={() => handleAC(false)}
                  />

                  {/* Speed Limit */}
                  <div className="flex flex-col gap-2 p-4 rounded-lg bg-surface-2 border border-border hover:border-border-strong transition-colors">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-lg bg-surface-3 flex items-center justify-center shrink-0">
                        <Gauge className="w-5 h-5 text-muted" />
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-foreground">Set Batas Kecepatan</p>
                        <p className="text-xs text-muted mt-0.5">Atur batas max speed unit</p>
                      </div>
                    </div>
                    {speedLimitTarget !== null ? (
                      <SpeedLimitDialog
                        currentLimit={speedLimit}
                        onConfirm={handleSpeedLimit}
                        onCancel={() => setSpeedLimitTarget(null)}
                      />
                    ) : (
                      <div className="flex items-center gap-2 mt-1">
                        <input
                          type="number"
                          value={speedLimit}
                          onChange={(e) => setSpeedLimit(parseInt(e.target.value) || 80)}
                          min={20}
                          max={200}
                          className="form-input w-20"
                          aria-label="Batas kecepatan"
                        />
                        <span className="text-xs text-muted">km/j</span>
                        <Button
                          size="sm"
                          variant="secondary"
                          onClick={() => setSpeedLimitTarget(Array.from(selectedVehicles)[0] ?? 0)}
                          disabled={!hasSelection}
                          className="flex-1"
                          aria-label="Kirim batas kecepatan"
                        >
                          Kirim
                        </Button>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Command log */}
              <div className="flex-1 overflow-y-auto p-4">
                <div className="flex items-center gap-2 mb-3">
                  <History className="w-4 h-4 text-muted" />
                  <p className="text-xs font-semibold uppercase tracking-widest text-muted">Riwayat Perintah</p>
                  {commandLog.length > 0 && (
                    <button
                      onClick={() => setCommandLog([])}
                      className="ml-auto text-xs text-muted hover:text-foreground focus-visible:outline-2 focus-visible:outline-brand"
                    >
                      Clear
                    </button>
                  )}
                </div>

                {commandLog.length === 0 ? (
                  <Card padding="md">
                    <EmptyState
                      icon={<History className="w-8 h-8 opacity-40" />}
                      title="Belum ada perintah"
                      description="Kirim perintah pertama menggunakan kartu di atas."
                    />
                  </Card>
                ) : (
                  <div className="space-y-2">
                    {commandLog.map((entry) => {
                      const isPending = entry.status === "pending" || entry.status === "sent";
                      return (
                        <div
                          key={entry.id}
                          className="flex items-center gap-3 px-4 py-3 rounded-lg bg-surface-2 border border-border"
                        >
                          <div className="flex items-center gap-2 min-w-0 flex-1">
                            <span className="font-mono text-xs font-semibold text-foreground">{entry.plate_number}</span>
                            <span className="text-muted text-xs">—</span>
                            <span className="text-sm font-medium text-foreground truncate">{entry.command}</span>
                          </div>
                          <div className="flex items-center gap-2 shrink-0">
                            <span className="font-mono text-[10px] text-muted tabular-nums">
                              {new Date(entry.timestamp).toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit", second: "2-digit" })}
                            </span>
                            <CommandStatusBadge status={entry.status} />
                            {isPending && (
                              <RefreshCw className="w-3.5 h-3.5 text-st-idle animate-spin" />
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
