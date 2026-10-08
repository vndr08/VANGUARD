"use client";

import { useMemo, useState } from "react";
import { Camera, Search, X } from "lucide-react";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Card, EmptyState } from "@/components/ui/Card";
import { FLEET_VEHICLES } from "@/lib/fleet-data";

type CameraPosition = "Depan" | "Kabin" | "Belakang";
type SnapshotStatus = "Tersedia" | "Gagal";

interface SnapshotRecord {
  id: string;
  vehicleId: number;
  camera: CameraPosition;
  recordedAt: string;
  status: SnapshotStatus;
  event: string;
  location: string;
}

const SNAPSHOT_RECORDS: SnapshotRecord[] = [
  { id: "snapshot-001", vehicleId: 1, camera: "Depan", recordedAt: "2026-06-20T09:42:00+07:00", status: "Tersedia", event: "Bukti kedatangan", location: "Jababeka Gate 2, Bekasi" },
  { id: "snapshot-002", vehicleId: 2, camera: "Depan", recordedAt: "2026-06-20T09:28:00+07:00", status: "Tersedia", event: "Peringatan kecepatan", location: "Tol Cikampek KM 32" },
  { id: "snapshot-003", vehicleId: 10, camera: "Kabin", recordedAt: "2026-06-20T08:51:00+07:00", status: "Tersedia", event: "Berhenti bahan bakar", location: "SPBU Cikampek" },
  { id: "snapshot-004", vehicleId: 6, camera: "Belakang", recordedAt: "2026-06-20T08:35:00+07:00", status: "Tersedia", event: "Mesin mati", location: "Rest Area KM 57" },
  { id: "snapshot-005", vehicleId: 13, camera: "Depan", recordedAt: "2026-06-20T07:58:00+07:00", status: "Tersedia", event: "Gerbang pelanggan", location: "Bekasi Timur" },
  { id: "snapshot-006", vehicleId: 7, camera: "Belakang", recordedAt: "2026-06-20T07:12:00+07:00", status: "Tersedia", event: "Masuk geofence", location: "Gedebage, Bandung" },
  { id: "snapshot-007", vehicleId: 4, camera: "Kabin", recordedAt: "2026-06-20T06:45:00+07:00", status: "Tersedia", event: "Bukti kedatangan", location: "Rungkut Industrial" },
  { id: "snapshot-008", vehicleId: 3, camera: "Depan", recordedAt: "2026-06-20T06:22:00+07:00", status: "Tersedia", event: "Masuk geofence", location: "Pelabuhan Tanjung Priok" },
  { id: "snapshot-009", vehicleId: 8, camera: "Belakang", recordedAt: "2026-06-19T18:10:00+07:00", status: "Tersedia", event: "Keluar geofence", location: "Warehouse Cikarang" },
  { id: "snapshot-010", vehicleId: 14, camera: "Kabin", recordedAt: "2026-06-19T17:45:00+07:00", status: "Tersedia", event: "Peringatan kecepatan", location: "Tol Cipularang KM 25" },
  { id: "snapshot-011", vehicleId: 11, camera: "Depan", recordedAt: "2026-06-19T16:30:00+07:00", status: "Gagal", event: "Kamera offline", location: "Sentul City" },
  { id: "snapshot-012", vehicleId: 12, camera: "Belakang", recordedAt: "2026-06-19T15:05:00+07:00", status: "Tersedia", event: "Bukti pengiriman", location: "Tangerang Logistics Hub" },
];

const cameraOptions: Array<CameraPosition | "all"> = ["all", "Depan", "Kabin", "Belakang"];

export default function SnapshotsPage() {
  const [search, setSearch] = useState("");
  const [camera, setCamera] = useState<CameraPosition | "all">("all");

  const vehicleById = useMemo(() => new Map(FLEET_VEHICLES.map((vehicle) => [vehicle.id, vehicle])), []);
  const records = useMemo(() => {
    const query = search.trim().toLowerCase();
    return SNAPSHOT_RECORDS.filter((record) => {
      const vehicle = vehicleById.get(record.vehicleId);
      const matchesQuery = !query
        || vehicle?.plate_number.toLowerCase().includes(query)
        || record.event.toLowerCase().includes(query)
        || record.location.toLowerCase().includes(query);
      return matchesQuery && (camera === "all" || record.camera === camera);
    });
  }, [camera, search, vehicleById]);

  const availableCount = SNAPSHOT_RECORDS.filter((record) => record.status === "Tersedia").length;

  function resetFilters() {
    setSearch("");
    setCamera("all");
  }

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-bg">
      <header className="border-b border-border bg-surface-1 px-6 py-4">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="text-label uppercase tracking-wide text-muted">Camera Evidence</p>
            <h1 className="mt-0.5 text-h1 font-semibold text-foreground">Camera Snapshot</h1>
            <p className="mt-0.5 text-sm text-muted">Indeks bukti visual kendaraan yang tercatat</p>
          </div>
          <div className="flex items-center gap-4 text-sm text-muted">
            <span><strong className="font-mono tabular-nums text-foreground">{SNAPSHOT_RECORDS.length}</strong> catatan</span>
            <span><strong className="font-mono tabular-nums text-foreground">{availableCount}</strong> tersedia</span>
          </div>
        </div>
      </header>

      <div className="border-b border-border bg-surface-1 px-6 py-3">
        <div className="flex flex-wrap items-center gap-3">
          <div className="relative min-w-[220px] flex-1 sm:max-w-xs">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" />
            <input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Cari plat, kejadian, atau lokasi..."
              className="w-full rounded-lg border border-border bg-surface-2 py-1.5 pl-9 pr-3 text-sm text-foreground placeholder:text-faint focus-visible:outline-2 focus-visible:outline-brand"
            />
          </div>
          <div className="flex items-center gap-1">
            {cameraOptions.map((option) => (
              <button
                key={option}
                onClick={() => setCamera(option)}
                className={`rounded-md border px-3 py-1.5 text-sm font-medium focus-visible:outline-2 focus-visible:outline-brand ${camera === option ? "border-brand bg-brand text-signal-ink" : "border-border bg-surface-2 text-muted hover:bg-surface-3"}`}
              >
                {option === "all" ? "Semua kamera" : option}
              </button>
            ))}
          </div>
          {(search || camera !== "all") && (
            <Button variant="ghost" size="sm" icon={<X className="h-4 w-4" />} onClick={resetFilters}>Reset</Button>
          )}
        </div>
      </div>

      <main className="px-6 py-5">
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
          <div className="divide-y divide-border border-y border-border">
            {records.map((record) => {
              const vehicle = vehicleById.get(record.vehicleId);
              const timestamp = new Intl.DateTimeFormat("id-ID", {
                dateStyle: "medium",
                timeStyle: "short",
                timeZone: "Asia/Jakarta",
              }).format(new Date(record.recordedAt));
              return (
                <article key={record.id} className="grid gap-3 py-4 sm:grid-cols-[44px_150px_minmax(0,1fr)_160px_90px] sm:items-center">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-surface-2 text-muted">
                    <Camera className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="font-mono text-sm font-semibold tabular-nums text-foreground">{vehicle?.plate_number ?? `Unit ${record.vehicleId}`}</p>
                    <p className="mt-0.5 text-xs text-muted">Kamera {record.camera}</p>
                  </div>
                  <div className="min-w-0">
                    <h2 className="text-sm font-semibold text-foreground">{record.event}</h2>
                    <p className="mt-0.5 truncate text-sm text-muted">{record.location}</p>
                  </div>
                  <time className="font-mono text-xs tabular-nums text-muted" dateTime={record.recordedAt}>{timestamp}</time>
                  <Badge variant={record.status === "Tersedia" ? "success" : "danger"} className="w-fit sm:justify-self-end">{record.status}</Badge>
                </article>
              );
            })}
          </div>
        )}
        <p className="mt-4 max-w-2xl text-sm text-muted">
          Pengambilan dan unduhan gambar akan tersedia setelah layanan kamera terhubung. Halaman ini menampilkan metadata bukti yang tersedia.
        </p>
      </main>
    </div>
  );
}
