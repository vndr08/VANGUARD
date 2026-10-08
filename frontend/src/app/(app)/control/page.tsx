"use client";

import { useMemo, useState } from "react";
import { Radio, Search, ShieldAlert, Truck, X } from "lucide-react";
import { StatusPill } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { EmptyState } from "@/components/ui/Card";
import { useAppContext } from "@/components/context/AppContext";
import { FLEET_VEHICLES } from "@/lib/fleet-data";
import type { Vehicle } from "@/types";

export default function ControlPage() {
  const { vehicles: contextVehicles } = useAppContext();
  const vehicles = contextVehicles.length > 0 ? contextVehicles : FLEET_VEHICLES;
  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState<"all" | Vehicle["status"]>("all");
  const [selectedVehicleId, setSelectedVehicleId] = useState<number | null>(null);

  const rows = useMemo(() => {
    const query = search.trim().toLowerCase();
    return vehicles.filter((vehicle) => {
      const matchesSearch = !query
        || vehicle.plate_number.toLowerCase().includes(query)
        || (vehicle.driver_name ?? "").toLowerCase().includes(query);
      const matchesStatus = filterStatus === "all" || vehicle.status === filterStatus;
      return matchesSearch && matchesStatus;
    });
  }, [filterStatus, search, vehicles]);

  const selectedVehicle = vehicles.find((vehicle) => vehicle.id === selectedVehicleId) ?? null;
  const onlineCount = vehicles.filter((vehicle) => vehicle.status !== "offline").length;

  function resetFilters() {
    setSearch("");
    setFilterStatus("all");
  }

  return (
    <div className="flex h-[calc(100vh-4rem)] min-h-0 flex-col overflow-hidden">
      <header className="shrink-0 border-b border-border bg-surface-1 px-6 py-4">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <p className="text-label uppercase tracking-wide text-muted">Device Management</p>
            <h1 className="mt-0.5 text-h1 font-semibold text-foreground">Control Panel</h1>
            <p className="mt-0.5 text-sm text-muted">Kesiapan perangkat dan konektivitas unit armada</p>
          </div>
          <div className="flex items-center gap-3 text-sm">
            <span className="font-mono font-semibold tabular-nums text-foreground">{onlineCount}/{vehicles.length}</span>
            <span className="text-muted">unit terhubung</span>
          </div>
        </div>
      </header>

      <div className="flex min-h-0 flex-1">
        <aside className="flex w-[320px] shrink-0 flex-col overflow-hidden border-r border-border bg-surface-1">
          <div className="shrink-0 border-b border-border px-4 py-3">
            <div className="relative">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" />
              <input
                type="text"
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Plat atau pengemudi..."
                className="w-full rounded-lg border border-border bg-surface-2 py-1.5 pl-9 pr-8 text-sm text-foreground placeholder:text-faint focus-visible:outline-2 focus-visible:outline-brand"
                aria-label="Cari unit"
              />
              {search && (
                <button
                  onClick={() => setSearch("")}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 rounded p-0.5 text-muted hover:text-foreground focus-visible:outline-2 focus-visible:outline-brand"
                  aria-label="Hapus pencarian"
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              )}
            </div>
            <div className="mt-2 flex items-center gap-1">
              {([
                { key: "all" as const, label: "Semua" },
                { key: "driving" as const, label: "Jalan" },
                { key: "idle" as const, label: "Idle" },
                { key: "offline" as const, label: "Offline" },
              ]).map((filter) => (
                <button
                  key={filter.key}
                  onClick={() => setFilterStatus(filter.key)}
                  className={`rounded-md border px-3 py-1.5 text-sm font-medium transition-colors focus-visible:outline-2 focus-visible:outline-brand ${
                    filterStatus === filter.key
                      ? "border-brand bg-brand text-signal-ink"
                      : "border-border bg-surface-2 text-muted hover:bg-surface-3 hover:text-foreground"
                  }`}
                >
                  {filter.label}
                </button>
              ))}
            </div>
          </div>

          <div className="min-h-0 flex-1 overflow-y-auto p-2">
            {rows.length === 0 ? (
              <EmptyState
                icon={<Truck className="h-8 w-8 opacity-40" />}
                title="Unit tidak ditemukan"
                description="Tidak ada unit yang cocok dengan pencarian atau filter."
                action={<Button variant="secondary" size="sm" onClick={resetFilters}>Reset filter</Button>}
              />
            ) : (
              <div className="space-y-1">
                {rows.map((vehicle) => {
                  const selected = vehicle.id === selectedVehicleId;
                  return (
                    <button
                      key={vehicle.id}
                      onClick={() => setSelectedVehicleId(vehicle.id)}
                      className={`w-full rounded-lg border p-3 text-left transition-colors focus-visible:outline-2 focus-visible:outline-brand ${
                        selected ? "border-brand bg-brand/10" : "border-border bg-surface-2 hover:bg-surface-3"
                      }`}
                      aria-pressed={selected}
                    >
                      <div className="flex items-center justify-between gap-3">
                        <span className="truncate font-mono text-sm font-semibold tabular-nums text-foreground">{vehicle.plate_number}</span>
                        <StatusPill status={vehicle.status === "stopped" ? "stop" : vehicle.status} showIcon={false} />
                      </div>
                      <p className="mt-1 truncate text-sm text-muted">{vehicle.driver_name?.trim() || "Pengemudi belum ditetapkan"}</p>
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        </aside>

        <main className="flex min-w-0 flex-1 items-center justify-center bg-bg p-6">
          <div className="w-full max-w-xl border-y border-border py-8">
            <div className="flex items-start gap-4">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-surface-2 text-muted">
                {selectedVehicle ? <Radio className="h-5 w-5" /> : <ShieldAlert className="h-5 w-5" />}
              </div>
              <div>
                <h2 className="text-base font-semibold text-foreground">
                  {selectedVehicle ? selectedVehicle.plate_number : "Kanal perintah belum terhubung"}
                </h2>
                <p className="mt-1 max-w-lg text-sm leading-relaxed text-muted">
                  {selectedVehicle
                    ? "Status unit dapat dipantau, tetapi perintah jarak jauh belum tersedia sampai transport perangkat dan acknowledgment audit terhubung."
                    : "Pilih unit untuk memeriksa status konektivitas. Kontrol jarak jauh tidak ditampilkan sebelum backend perangkat tersedia."}
                </p>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
