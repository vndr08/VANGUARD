"use client";

import { useMemo, useState } from "react";
import {
  AlertTriangle,
  Gauge,
  Lock,
  Navigation,
  Power,
  Radio,
  RefreshCw,
  Search,
  ShieldAlert,
  Snowflake,
  Speaker,
  Truck,
  Unlock,
  VolumeX,
  X,
  Zap,
} from "lucide-react";
import { StatusPill } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { EmptyState } from "@/components/ui/Card";
import { useAppContext } from "@/components/context/AppContext";
import { FLEET_VEHICLES } from "@/lib/fleet-data";
import type { Vehicle } from "@/types";

type CommandDefinition = {
  label: string;
  description: string;
  icon: typeof Power;
  tone?: "danger" | "warning";
};

const COMMANDS: CommandDefinition[] = [
  { label: "Engine Cut-off", description: "Matikan mesin unit dari jarak jauh", icon: Power, tone: "danger" },
  { label: "Engine Resume", description: "Aktifkan kembali mesin setelah cut-off", icon: Power },
  { label: "Klakson / Buzzer", description: "Bunyikan klakson untuk lokalisasi", icon: Speaker },
  { label: "Kunci Pintu", description: "Kunci pintu kabin unit", icon: Lock },
  { label: "Buka Pintu", description: "Buka kunci pintu kabin unit", icon: Unlock },
  { label: "Reboot GPS", description: "Mulai ulang perangkat GPS", icon: RefreshCw, tone: "warning" },
  { label: "Minta Lokasi", description: "Minta pembaruan posisi unit", icon: Navigation },
  { label: "Mode Siaga", description: "Kurangi polling telemetri perangkat", icon: Zap },
  { label: "Nyalakan AC", description: "Aktifkan AC kabin jika didukung", icon: Snowflake },
  { label: "Matikan AC", description: "Nonaktifkan AC kabin jika didukung", icon: VolumeX },
];

function SummaryItem({ label, value, color }: { label: string; value: number; color?: string }) {
  return (
    <div className="flex items-baseline gap-2 px-3 first:pl-0 last:pr-0">
      <span className="text-[10px] font-semibold uppercase tracking-widest text-muted">{label}</span>
      <span className="font-mono text-sm font-semibold tabular-nums" style={color ? { color } : undefined}>{value}</span>
    </div>
  );
}

function CommandCard({ command }: { command: CommandDefinition }) {
  const Icon = command.icon;
  const accent = command.tone === "danger" ? "text-st-offline" : command.tone === "warning" ? "text-st-idle" : "text-muted";

  return (
    <article className="flex min-h-[116px] flex-col border border-border bg-surface-1 p-3">
      <div className="flex min-w-0 items-start gap-2.5">
        <span className={`flex h-8 w-8 shrink-0 items-center justify-center border border-border bg-surface-2 ${accent}`}>
          <Icon className="h-4 w-4" />
        </span>
        <div className="min-w-0">
          <h3 className={`text-sm font-semibold ${command.tone === "danger" ? "text-st-offline" : "text-foreground"}`}>{command.label}</h3>
          <p className="mt-1 text-xs leading-snug text-muted">{command.description}</p>
        </div>
      </div>
      <button
        type="button"
        disabled
        title="Kanal perangkat belum terhubung"
        className="mt-auto h-7 w-full border border-border bg-surface-2 px-2 text-xs font-medium text-faint disabled:cursor-not-allowed"
      >
        Kanal belum terhubung
      </button>
    </article>
  );
}

export default function ControlPage() {
  const { vehicles: contextVehicles } = useAppContext();
  const vehicles = contextVehicles.length > 0 ? contextVehicles : FLEET_VEHICLES;
  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState<"all" | Vehicle["status"]>("all");
  const [selectedVehicles, setSelectedVehicles] = useState<Set<number>>(new Set());

  const rows = useMemo(() => {
    const query = search.trim().toLowerCase();
    return vehicles.filter((vehicle) => {
      const matchesSearch = !query
        || vehicle.plate_number.toLowerCase().includes(query)
        || (vehicle.driver_name ?? "").toLowerCase().includes(query);
      return matchesSearch && (filterStatus === "all" || vehicle.status === filterStatus);
    });
  }, [filterStatus, search, vehicles]);

  const onlineCount = vehicles.filter((vehicle) => vehicle.status !== "offline").length;
  const selectedCount = selectedVehicles.size;
  const isFiltered = search !== "" || filterStatus !== "all";

  function toggleVehicle(id: number) {
    setSelectedVehicles((current) => {
      const next = new Set(current);
      if (next.has(id)) next.delete(id); else next.add(id);
      return next;
    });
  }

  function resetFilters() {
    setSearch("");
    setFilterStatus("all");
  }

  return (
    <div className="flex h-[calc(100dvh-3.625rem)] max-h-[calc(100dvh-3.625rem)] min-h-0 flex-col overflow-hidden">
      <header className="flex h-12 shrink-0 items-center gap-4 overflow-x-auto border-b border-border bg-surface-1 px-4">
        <div className="flex shrink-0 items-baseline gap-2">
          <h1 className="text-sm font-semibold text-foreground">Control Panel</h1>
          <span className="font-mono text-xs tabular-nums text-muted">{vehicles.length} unit</span>
        </div>
        <div className="flex shrink-0 items-center divide-x divide-border">
          <SummaryItem label="Terhubung" value={onlineCount} color="var(--st-driving)" />
          <SummaryItem label="Dipilih" value={selectedCount} color="var(--brand)" />
          <SummaryItem label="Perintah" value={COMMANDS.length} />
        </div>
        <span className="ml-auto flex shrink-0 items-center gap-1.5 text-xs text-muted"><ShieldAlert className="h-3.5 w-3.5 text-st-idle" />Kanal perangkat belum terhubung</span>
      </header>

      <div className="flex min-h-0 flex-1 overflow-hidden">
        <aside className="flex w-[320px] shrink-0 flex-col overflow-hidden border-r border-border bg-surface-1">
          <div className="shrink-0 border-b border-border px-3 py-2">
            <div className="relative">
              <Search className="pointer-events-none absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted" />
              <input
                type="text"
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Plat atau pengemudi..."
                className="h-8 w-full border border-border bg-surface-2 pl-8 pr-8 text-xs text-foreground placeholder:text-faint focus-visible:outline-2 focus-visible:outline-brand"
                aria-label="Cari unit"
              />
              {search && <button type="button" onClick={() => setSearch("")} className="absolute right-2 top-1/2 -translate-y-1/2 text-muted hover:text-foreground focus-visible:outline-2 focus-visible:outline-brand" aria-label="Hapus pencarian"><X className="h-3.5 w-3.5" /></button>}
            </div>
            <div className="mt-2 flex gap-1">
              {([
                { key: "all" as const, label: "Semua" },
                { key: "driving" as const, label: "Jalan" },
                { key: "idle" as const, label: "Idle" },
                { key: "offline" as const, label: "Offline" },
              ]).map((filter) => (
                <button key={filter.key} type="button" onClick={() => setFilterStatus(filter.key)} aria-pressed={filterStatus === filter.key} className={`h-7 border border-border px-2.5 text-xs font-medium transition-colors focus-visible:outline-2 focus-visible:outline-brand ${filterStatus === filter.key ? "bg-brand text-slate-950" : "text-muted hover:bg-surface-2 hover:text-foreground"}`}>{filter.label}</button>
              ))}
            </div>
          </div>

          <div className="flex shrink-0 items-center justify-between border-b border-border px-3 py-1.5">
            <span className="text-xs text-muted">{selectedCount} unit dipilih</span>
            {(selectedCount > 0 || isFiltered) && <button type="button" onClick={() => { setSelectedVehicles(new Set()); resetFilters(); }} className="text-xs font-medium text-brand hover:underline focus-visible:outline-2 focus-visible:outline-brand">Reset</button>}
          </div>

          <div className="min-h-0 flex-1 overflow-y-auto p-2">
            {rows.length === 0 ? (
              <EmptyState icon={<Truck className="h-8 w-8 opacity-40" />} title="Unit tidak ditemukan" description="Tidak ada unit yang cocok dengan pencarian atau filter." action={<Button variant="secondary" size="sm" onClick={resetFilters}>Reset filter</Button>} />
            ) : (
              <div className="space-y-1">
                {rows.map((vehicle) => {
                  const selected = selectedVehicles.has(vehicle.id);
                  return (
                    <button key={vehicle.id} type="button" onClick={() => toggleVehicle(vehicle.id)} aria-pressed={selected} className={`w-full border px-3 py-2 text-left transition-colors focus-visible:outline-2 focus-visible:outline-brand ${selected ? "border-brand bg-brand-soft" : "border-border bg-surface-1 hover:bg-surface-2"}`}>
                      <div className="flex items-center gap-2">
                        <span className={`flex h-3.5 w-3.5 shrink-0 items-center justify-center border ${selected ? "border-brand bg-brand" : "border-border-strong"}`}>{selected && <span className="h-1.5 w-1.5 bg-surface-1" />}</span>
                        <span className="min-w-0 flex-1 truncate font-mono text-sm font-semibold tabular-nums text-foreground">{vehicle.plate_number}</span>
                        <StatusPill status={vehicle.status === "stopped" ? "stop" : vehicle.status} showIcon={false} className="px-1.5 py-0.5 text-[10px]" />
                      </div>
                      <p className="mt-1 truncate pl-5.5 text-xs text-muted">{vehicle.driver_name?.trim() || "Pengemudi belum ditetapkan"}</p>
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        </aside>

        <main className="flex min-w-0 flex-1 flex-col overflow-hidden bg-bg">
          <div className="flex h-11 shrink-0 items-center justify-between border-b border-border bg-surface-1 px-4">
            <div className="flex items-center gap-2">
              <Radio className="h-4 w-4 text-muted" />
              <span className="text-sm font-semibold text-foreground">Perintah perangkat</span>
              <span className="text-xs text-muted">{selectedCount ? `${selectedCount} unit dipilih` : "Pilih satu atau beberapa unit"}</span>
            </div>
            <span className="text-xs text-st-idle">Read-only</span>
          </div>

          <div className="min-h-0 flex-1 overflow-y-auto p-4">
            <div className="mb-4 flex items-start gap-2 border border-st-idle/30 bg-st-idle-bg px-3 py-2 text-xs text-st-idle">
              <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
              <p>Kontrol ditampilkan untuk kesiapan operasional. Pengiriman perintah, acknowledgment perangkat, dan audit trail belum tersedia.</p>
            </div>

            <section aria-labelledby="command-grid-title">
              <div className="mb-2 flex items-center justify-between">
                <h2 id="command-grid-title" className="text-xs font-semibold uppercase tracking-widest text-muted">Kontrol kendaraan</h2>
                <div className="flex items-center gap-2 text-xs text-muted"><Gauge className="h-3.5 w-3.5" />Batas kecepatan belum terhubung</div>
              </div>
              <div className="grid gap-2 sm:grid-cols-2 xl:grid-cols-3">
                {COMMANDS.map((command) => <CommandCard key={command.label} command={command} />)}
                <article className="flex min-h-[116px] flex-col border border-border bg-surface-1 p-3">
                  <div className="flex items-start gap-2.5">
                    <span className="flex h-8 w-8 shrink-0 items-center justify-center border border-border bg-surface-2 text-muted"><Gauge className="h-4 w-4" /></span>
                    <div><h3 className="text-sm font-semibold text-foreground">Set batas kecepatan</h3><p className="mt-1 text-xs leading-snug text-muted">Atur batas kecepatan maksimum unit.</p></div>
                  </div>
                  <div className="mt-auto flex items-center gap-2"><input type="number" value="80" disabled aria-label="Batas kecepatan" className="h-7 w-16 border border-border bg-surface-2 px-2 text-xs text-faint disabled:cursor-not-allowed" /><span className="text-xs text-muted">km/j</span><button type="button" disabled className="ml-auto h-7 border border-border bg-surface-2 px-2 text-xs text-faint disabled:cursor-not-allowed">Kirim</button></div>
                </article>
              </div>
            </section>

            <section className="mt-5 border-t border-border pt-4" aria-labelledby="audit-title">
              <div className="flex items-center gap-2"><ShieldAlert className="h-4 w-4 text-muted" /><h2 id="audit-title" className="text-xs font-semibold uppercase tracking-widest text-muted">Audit perintah</h2></div>
              <div className="mt-3 border border-border bg-surface-1 px-4 py-3 text-sm text-muted">Belum ada acknowledgment perangkat karena transport perintah belum terhubung.</div>
            </section>
          </div>
        </main>
      </div>
    </div>
  );
}
