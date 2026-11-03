"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import dynamic from "next/dynamic";
import {
  Download,
  MapPin,
  MapPinned,
  Search,
  X,
} from "lucide-react";
import {
  TableContainer,
  TableHead,
  TableHeadCell,
  TableBody,
  TableRow,
  TableCell,
} from "@/components/ui/Table";
import { Button } from "@/components/ui/Button";
import { Card, EmptyState } from "@/components/ui/Card";
import { downloadCsv } from "@/lib/csv";
import { DEFAULT_LAYER_VISIBILITY } from "@/components/map/types";
import {
  GEOFENCE_ZONES,
  type GeofenceZone,
  type ZoneStatus,
  type ZoneType,
} from "@/lib/safety-data";

/* ─── Types ─────────────────────────────────────────────────────────────────── */

function SummaryItem({ label, value, color }: { label: string; value: number; color?: string }) {
  return (
    <div className="flex items-baseline gap-2 px-3 first:pl-0 last:pr-0">
      <span className="text-[10px] font-semibold uppercase tracking-widest text-muted">{label}</span>
      <span className="font-mono text-sm font-semibold tabular-nums" style={color ? { color } : undefined}>{value}</span>
    </div>
  );
}

/* ─── Geofence Map Preview (lazy, SSR-safe) ─────────────────────────────────── */

const GeofenceMapPreview = dynamic(() => import("@/components/map/MapView").then((m) => {
  return function GeofenceMapInner({ zones, selectedId }: { zones: GeofenceZone[]; selectedId: string | null }) {
    const selectedZone = zones.find((zone) => zone.id === selectedId);
    // Convert zones to MapVehicle shape — cast to any to bypass strict Vehicle extension fields
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const vehicles: any[] = zones
      .filter((z) => z.status === "active")
      .map((z) => ({
        id: zones.findIndex((zone) => zone.id === z.id) + 1,
        plate_number: z.name.slice(0, 12),
        status: "stop" as const,
        displayStatus: "stop" as const,
        lat: z.lat,
        lng: z.lng,
        displayLat: z.lat,
        displayLng: z.lng,
        heading: 0,
        displayHeading: 0,
        speed: 0,
        fuel_level: 0,
        odometer: 0,
        vehicle_type: "truck",
        brand: z.type,
        model: "",
        year: 2024,
        latitude: z.lat,
        longitude: z.lng,
        engine_on: false,
        last_update: "",
        driver_name: null,
      }));

    return (
      <m.default
        key={selectedZone?.id ?? "all-zones"}
        vehicles={vehicles}
        selectedId={selectedZone ? zones.findIndex((zone) => zone.id === selectedZone.id) + 1 : null}
        className="w-full h-full"
        center={selectedZone ? [selectedZone.lng, selectedZone.lat] : [107, -6.5]}
        zoom={selectedZone ? 12 : 8}
        pitch={0}
        visibility={{ ...DEFAULT_LAYER_VISIBILITY, geofence: true, cluster: false }}
      />
    );
  };
}), { ssr: false });

/* ─── Main Page ─────────────────────────────────────────────────────────────── */

export default function GeofencesPage() {
  const zones = GEOFENCE_ZONES;
  const [selected, setSelected] = useState<GeofenceZone | null>(GEOFENCE_ZONES[0] ?? null);
  const [search, setSearch] = useState("");
  const [searchOpen, setSearchOpen] = useState(false);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const [filterType, setFilterType] = useState<ZoneType | "all">("all");
  const [filterStatus, setFilterStatus] = useState<ZoneStatus | "all">("all");

  useEffect(() => {
    if (searchOpen) searchInputRef.current?.focus();
  }, [searchOpen]);

  const counts = useMemo(() => ({
    total: zones.length,
    aktif: zones.filter((z) => z.status === "active").length,
    circle: zones.filter((z) => z.shape === "circle").length,
    polygon: zones.filter((z) => z.shape === "polygon").length,
  }), [zones]);

  const rows = useMemo(() => {
    const q = search.trim().toLowerCase();
    return zones.filter((z) => {
      if (q && !z.name.toLowerCase().includes(q)) return false;
      if (filterType !== "all" && z.type !== filterType) return false;
      if (filterStatus !== "all" && z.status !== filterStatus) return false;
      return true;
    });
  }, [zones, search, filterType, filterStatus]);

  function handleExport() {
    downloadCsv(
      "vanguard-geofence.csv",
      ["id", "name", "type", "shape", "latitude", "longitude", "radius_m", "status", "units", "notes"],
      rows.map((zone) => [zone.id, zone.name, zone.type, zone.shape, zone.lat, zone.lng, zone.radius, zone.status, zone.units, zone.notes])
    );
  }

  function resetFilters() {
    setSearch("");
    setFilterType("all");
    setFilterStatus("all");
  }

  const isFiltered = search !== "" || filterType !== "all" || filterStatus !== "all";

  return (
    <div className="flex h-[calc(100dvh-3.625rem)] max-h-[calc(100dvh-3.625rem)] min-h-0 flex-col overflow-hidden">
      <header className="flex h-12 shrink-0 items-center gap-4 overflow-x-auto border-b border-border bg-surface-1 px-4">
        <div className="flex shrink-0 items-baseline gap-2">
          <h1 className="text-sm font-semibold text-foreground">Geofence</h1>
          <span className="font-mono text-xs tabular-nums text-muted">{counts.total} zona</span>
        </div>
        <div className="flex shrink-0 items-center divide-x divide-border">
          <SummaryItem label="Total" value={counts.total} />
          <SummaryItem label="Aktif" value={counts.aktif} color="var(--st-driving)" />
          <SummaryItem label="Lingkaran" value={counts.circle} />
          <SummaryItem label="Poligon" value={counts.polygon} />
        </div>
        <div className="ml-auto flex shrink-0 items-center">
          <Button variant="secondary" size="sm" icon={<Download className="h-4 w-4" />} onClick={handleExport} aria-label="Export data geofence">
            Export
          </Button>
        </div>
      </header>

      {/* ─── Toolbar ────────────────────────────────────────────────────────── */}
      <div className="flex h-11 shrink-0 min-w-0 items-center gap-2 overflow-x-auto border-b border-border bg-surface-1 px-4">
        {searchOpen ? (
          <div className="relative flex w-72 shrink-0 items-center gap-2">
            <Search className="pointer-events-none absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted" />
            <input ref={searchInputRef} type="text" value={search} onChange={(e) => setSearch(e.target.value)} onKeyDown={(event) => {
              if (event.key === "Escape") { setSearch(""); setSearchOpen(false); }
            }} placeholder="Cari nama zona..." aria-label="Cari zona"
              className="h-8 min-w-0 flex-1 border border-border bg-surface-1 pl-8 pr-3 text-xs text-foreground placeholder:text-faint focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand/20" />
            <button type="button" onClick={() => { setSearch(""); setSearchOpen(false); }} className="flex h-8 w-8 shrink-0 items-center justify-center text-muted transition-colors hover:bg-surface-2 hover:text-foreground focus-visible:outline-2 focus-visible:outline-brand" aria-label="Tutup pencarian"><X className="h-4 w-4" /></button>
          </div>
        ) : (
          <button type="button" onClick={() => setSearchOpen(true)} className="flex h-8 w-8 shrink-0 items-center justify-center text-muted transition-colors hover:bg-surface-2 hover:text-foreground focus-visible:outline-2 focus-visible:outline-brand" aria-label="Cari zona"><Search className="h-4 w-4" /></button>
        )}

        <div className="flex shrink-0 items-center gap-1">
            {!searchOpen && <span className="mr-1 text-[10px] font-semibold uppercase tracking-widest text-muted">Tipe</span>}
            {(["all", "Depot", "Customer", "Port", "Checkpoint"] as (ZoneType | "all")[]).map((f) => (
              <button key={f} onClick={() => setFilterType(f)}
                className={"h-7 shrink-0 border border-border px-2.5 text-xs font-medium transition-colors focus-visible:outline-2 focus-visible:outline-brand " + (filterType === f ? "bg-brand text-slate-950" : "text-muted hover:bg-surface-2 hover:text-foreground")} aria-pressed={filterType === f}>
                {f === "all" ? "Semua" : f}
              </button>
            ))}
        </div>

        <div className="flex shrink-0 items-center gap-1 border-l border-border pl-2">
            <span className="mr-1 text-[10px] font-semibold uppercase tracking-widest text-muted">Status</span>
            {(["all", "active", "inactive"] as (ZoneStatus | "all")[]).map((f) => (
              <button key={f} onClick={() => setFilterStatus(f)}
                className={"h-7 shrink-0 border border-border px-2.5 text-xs font-medium transition-colors focus-visible:outline-2 focus-visible:outline-brand " + (filterStatus === f ? "bg-brand text-slate-950" : "text-muted hover:bg-surface-2 hover:text-foreground")} aria-pressed={filterStatus === f}>
                {f === "all" ? "Semua" : f === "active" ? "Aktif" : "Nonaktif"}
              </button>
            ))}
        </div>

          {isFiltered && (
            <button onClick={resetFilters}
              className="flex h-7 shrink-0 items-center gap-1 border border-border px-2.5 text-xs font-medium text-muted transition-colors hover:bg-surface-2 hover:text-foreground focus-visible:outline-2 focus-visible:outline-brand">
              <X className="h-3 w-3" />Reset
            </button>
          )}
      </div>

      {/* ─── Content: 2-column ────────────────────────────────────────────── */}
      <div className="flex-1 overflow-hidden flex">
        {/* ── LEFT: Zone list ──────────────────────────────────────────────── */}
        <div className="flex w-[360px] shrink-0 flex-col overflow-hidden border-r border-border bg-surface-1">
          {rows.length === 0 ? (
            <div className="flex-1 flex items-center justify-center p-6">
              <EmptyState
                icon={<MapPinned className="w-8 h-8 opacity-40" />}
                title={isFiltered ? "Tidak ada zona" : "Belum ada zona"}
                description={isFiltered ? "Tidak ada zona yang cocok dengan filter." : "Belum ada zona dalam sumber data geofence."}
                action={isFiltered ? (
                  <Button variant="secondary" size="sm" onClick={resetFilters}>Reset Filter</Button>
                ) : undefined}
              />
            </div>
          ) : (
            <div className="flex-1 overflow-y-auto">
              <TableContainer scrollable={false} className="v2-geofence-table border-0 [&_td]:!px-3 [&_td]:!py-2 [&_th]:!h-9 [&_th]:!px-3 [&_th]:!py-0">
                <TableHead>
                  <tr>
                    <TableHeadCell width={160}>Zona</TableHeadCell>
                    <TableHeadCell width={76}>Tipe</TableHeadCell>
                    <TableHeadCell width={64}>Radius</TableHeadCell>
                    <TableHeadCell width={60} className="text-right">Unit</TableHeadCell>
                  </tr>
                </TableHead>
                <TableBody>
                  {rows.map((z) => {
                    return (
                      <TableRow
                        key={z.id}
                        selectable
                        selected={selected?.id === z.id}
                        onClick={() => setSelected(selected?.id === z.id ? null : z)}
                        className="group"
                      >
                        {/* Nama */}
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <span className="h-2 w-2 rounded-full shrink-0" style={{ backgroundColor: z.color }} />
                            <div className="min-w-0">
                              <p className="text-sm font-semibold text-foreground truncate">{z.name}</p>
                            </div>
                          </div>
                        </TableCell>
                        {/* Tipe */}
                        <TableCell>
                          <span className="whitespace-nowrap text-[10px] font-semibold uppercase tracking-wide text-muted">
                            {z.type}
                          </span>
                        </TableCell>
                        {/* Radius */}
                        <TableCell>
                          <span className="text-xs font-mono tabular-nums font-medium text-foreground">{z.radius}m</span>
                        </TableCell>
                        {/* Units */}
                        <TableCell className="text-right">
                          <span className="text-xs font-mono tabular-nums font-semibold text-foreground">{z.units}</span>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </TableContainer>
            </div>
          )}
        </div>

        {/* ── RIGHT: Map preview ─────────────────────────────────────────── */}
        <div className="flex-1 relative overflow-hidden bg-bg">
          {selected ? (
            <>
              <GeofenceMapPreview zones={zones} selectedId={selected.id} />
              {/* Selected zone overlay card */}
              <div className="absolute right-3 top-3 z-dock w-[288px]">
                <Card padding="sm">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-2 min-w-0">
                      <span className="w-3 h-3 rounded-full shrink-0" style={{ backgroundColor: selected.color }} />
                      <h3 className="text-sm font-semibold text-foreground truncate">{selected.name}</h3>
                    </div>
                    <button onClick={() => setSelected(null)} className="shrink-0 p-1 rounded text-muted hover:bg-surface-2 focus-visible:outline-2 focus-visible:outline-brand" aria-label="Tutup pratinjau">
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                  <dl className="mt-3 grid grid-cols-2 gap-x-3 gap-y-2 border-y border-border py-2 text-xs">
                    <div><dt className="text-[10px] uppercase tracking-wide text-muted">Tipe</dt><dd className="mt-0.5 font-medium text-foreground">{selected.type}</dd></div>
                    <div><dt className="text-[10px] uppercase tracking-wide text-muted">Radius</dt><dd className="mt-0.5 font-mono tabular-nums font-medium text-foreground">{selected.radius}m</dd></div>
                    <div><dt className="text-[10px] uppercase tracking-wide text-muted">Unit</dt><dd className="mt-0.5 font-medium text-foreground">{selected.units} kendaraan</dd></div>
                    <div><dt className="text-[10px] uppercase tracking-wide text-muted">Status</dt><dd className="mt-0.5 font-medium text-foreground">{selected.status === "active" ? "Aktif" : "Nonaktif"}</dd></div>
                  </dl>
                  <p className="mt-2 text-[11px] font-mono tabular-nums text-muted">{selected.lat.toFixed(6)}, {selected.lng.toFixed(6)}</p>
                  {selected.notes && (
                    <div className="mt-2 border-t border-border pt-2">
                      <p className="text-xs text-muted">{selected.notes}</p>
                    </div>
                  )}
                </Card>
              </div>
            </>
          ) : (
            <div className="absolute inset-0 flex items-center justify-center">
              <EmptyState
                icon={<MapPin className="w-8 h-8 opacity-40" />}
                title="Pilih zona untuk pratinjau"
                description="Klik zona di daftar untuk melihat lokasi di peta."
              />
            </div>
          )}
        </div>
      </div>

    </div>
  );
}
