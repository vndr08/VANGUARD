"use client";

import { Suspense, useEffect, useMemo, useRef, useState } from "react";
import Image from "next/image";
import { useSearchParams } from "next/navigation";
import { Camera, Search, X } from "lucide-react";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Card, EmptyState } from "@/components/ui/Card";
import { FLEET_VEHICLES } from "@/lib/fleet-data";
import { EVIDENCE_SNAPSHOTS, getEvidenceSnapshots, type CameraPosition } from "@/lib/evidence-data";

const cameraOptions: Array<CameraPosition | "all"> = ["all", "Depan", "Kabin", "Belakang"];

function SnapshotsPageContent() {
  const searchParams = useSearchParams();
  const [search, setSearch] = useState("");
  const [searchOpen, setSearchOpen] = useState(false);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const [camera, setCamera] = useState<CameraPosition | "all">("all");

  useEffect(() => {
    if (searchOpen) searchInputRef.current?.focus();
  }, [searchOpen]);

  const vehicleById = useMemo(() => new Map(FLEET_VEHICLES.map((vehicle) => [vehicle.id, vehicle])), []);
  const contextualRecords = useMemo(() => getEvidenceSnapshots({
    taskId: searchParams.get("task"),
    tripId: searchParams.get("trip"),
    incidentId: searchParams.get("incident"),
  }), [searchParams]);
  const records = useMemo(() => {
    const query = search.trim().toLowerCase();
    return contextualRecords.filter((record) => {
      const vehicle = vehicleById.get(record.vehicleId);
      const matchesQuery = !query
        || vehicle?.plate_number.toLowerCase().includes(query)
        || record.event.toLowerCase().includes(query)
        || record.location.toLowerCase().includes(query);
      return matchesQuery && (camera === "all" || record.camera === camera);
    });
  }, [camera, contextualRecords, search, vehicleById]);

  const availableCount = contextualRecords.filter((record) => record.status === "Tersedia").length;
  const contextLabel = searchParams.get("incident") ? "Bukti insiden" : searchParams.get("task") ? "Bukti tugas" : searchParams.get("trip") ? "Bukti perjalanan" : null;

  function resetFilters() {
    setSearch("");
    setCamera("all");
  }

  return (
    <div className="flex h-[calc(100dvh-3.625rem)] max-h-[calc(100dvh-3.625rem)] min-h-0 flex-col overflow-hidden bg-bg">
      <header className="flex h-12 shrink-0 items-center gap-4 overflow-x-auto border-b border-border bg-surface-1 px-4">
        <div className="flex shrink-0 items-baseline gap-2">
          <h1 className="text-sm font-semibold text-foreground">Snapshot Kamera</h1>
          <span className="font-mono text-xs tabular-nums text-muted">{contextualRecords.length} catatan</span>
          {contextLabel && <span className="border-l border-border pl-2 text-xs text-muted">{contextLabel}</span>}
        </div>
        <div className="flex shrink-0 items-center divide-x divide-border text-xs">
          <div className="flex items-baseline gap-2 px-3 first:pl-0"><span className="text-[10px] font-semibold uppercase tracking-widest text-muted">Tersedia</span><span className="font-mono text-sm font-semibold tabular-nums text-st-driving">{availableCount}</span></div>
          <div className="flex items-baseline gap-2 px-3"><span className="text-[10px] font-semibold uppercase tracking-widest text-muted">Gagal</span><span className="font-mono text-sm font-semibold tabular-nums text-st-offline">{contextualRecords.length - availableCount}</span></div>
        </div>
      </header>

      <div className="flex h-11 shrink-0 min-w-0 items-center gap-2 overflow-x-auto border-b border-border bg-surface-1 px-4">
        {searchOpen ? (
          <div className="relative flex w-80 shrink-0 items-center gap-2">
            <Search className="pointer-events-none absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted" />
            <input
              ref={searchInputRef}
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              onKeyDown={(event) => { if (event.key === "Escape") { setSearch(""); setSearchOpen(false); } }}
              placeholder="Cari plat, kejadian, atau lokasi..."
              className="h-8 min-w-0 flex-1 border border-border bg-surface-1 pl-8 pr-3 text-xs text-foreground placeholder:text-faint focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand/20"
              aria-label="Cari snapshot"
            />
            <button type="button" onClick={() => { setSearch(""); setSearchOpen(false); }} className="flex h-8 w-8 shrink-0 items-center justify-center text-muted transition-colors hover:bg-surface-2 hover:text-foreground focus-visible:outline-2 focus-visible:outline-brand" aria-label="Tutup pencarian"><X className="h-4 w-4" /></button>
          </div>
        ) : (
          <button type="button" onClick={() => setSearchOpen(true)} className="flex h-8 w-8 shrink-0 items-center justify-center text-muted transition-colors hover:bg-surface-2 hover:text-foreground focus-visible:outline-2 focus-visible:outline-brand" aria-label="Cari snapshot"><Search className="h-4 w-4" /></button>
        )}
          <div className="flex shrink-0 items-center gap-1">
            {!searchOpen && <span className="mr-1 text-[10px] font-semibold uppercase tracking-widest text-muted">Kamera</span>}
            {cameraOptions.map((option) => (
              <button
                key={option}
                onClick={() => setCamera(option)}
                className={`h-7 shrink-0 border border-border px-2.5 text-xs font-medium focus-visible:outline-2 focus-visible:outline-brand ${camera === option ? "bg-brand text-slate-950" : "text-muted hover:bg-surface-2 hover:text-foreground"}`}
                aria-pressed={camera === option}
              >
                {option === "all" ? "Semua kamera" : option}
              </button>
            ))}
          </div>
          {(search || camera !== "all") && (
            <Button variant="ghost" size="sm" icon={<X className="h-4 w-4" />} onClick={resetFilters}>Reset</Button>
          )}
      </div>

      <main className="min-h-0 flex-1 overflow-auto px-4 py-3">
        {records.length === 0 ? (
          <Card padding="md">
            <EmptyState
              icon={<Camera className="h-8 w-8 opacity-40" />}
              title="Catatan tidak ditemukan"
              description="Tidak ada snapshot yang cocok dengan pencarian atau filter."
              action={<Button variant="secondary" size="sm" onClick={resetFilters}>Reset filter</Button>}
            />
          </Card>
        ) : (
          <section className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-3" aria-label="Galeri snapshot kamera">
            {records.map((record) => {
              const vehicle = vehicleById.get(record.vehicleId);
              const timestamp = new Intl.DateTimeFormat("id-ID", {
                dateStyle: "medium",
                timeStyle: "short",
                timeZone: "Asia/Jakarta",
              }).format(new Date(record.recordedAt));
              return (
                <article key={record.id} className="overflow-hidden border border-border bg-surface-1 transition-colors hover:border-border-strong">
                  <div className="relative aspect-[16/9] bg-surface-2">
                    <Image src={record.imageSrc} alt={`Arsip visual ${vehicle?.plate_number ?? `unit ${record.vehicleId}`}`} fill sizes="(min-width: 1280px) 30vw, (min-width: 640px) 50vw, 100vw" className="object-cover" />
                    <span className="absolute left-2 top-2 inline-flex items-center gap-1 border border-white/30 bg-black/70 px-1.5 py-1 text-[10px] font-semibold uppercase tracking-wide text-white"><Camera className="h-3 w-3" aria-hidden="true" />Kamera {record.camera}</span>
                    <Badge variant={record.status === "Tersedia" ? "success" : "danger"} className="absolute right-2 top-2 whitespace-nowrap px-2 py-0.5 text-[10px]">{record.status}</Badge>
                  </div>
                  <div className="p-3">
                    <div className="flex items-baseline justify-between gap-3">
                      <p className="font-mono text-xs font-semibold tabular-nums text-foreground">{vehicle?.plate_number ?? `Unit ${record.vehicleId}`}</p>
                      <time className="shrink-0 font-mono text-[10px] tabular-nums text-muted" dateTime={record.recordedAt}>{timestamp}</time>
                    </div>
                    <h2 className="mt-2 text-sm font-semibold text-foreground">{record.event}</h2>
                    <p className="mt-1 truncate text-xs text-muted">{record.location}</p>
                  </div>
                </article>
              );
            })}
          </section>
        )}
      </main>
    </div>
  );
}

export default function SnapshotsPage() {
  return (
    <Suspense fallback={null}>
      <SnapshotsPageContent />
    </Suspense>
  );
}
