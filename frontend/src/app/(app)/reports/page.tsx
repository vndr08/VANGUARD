"use client";

import { useMemo, useState } from "react";
import {
  Activity,
  BarChart2,
  Calendar,
  Clock,
  Droplet,
  FileText,
  Gauge,
  Globe,
  Heart,
  MapPin,
  Route,
  Search,
  Shield,
  X,
  Zap,
} from "lucide-react";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Card, EmptyState } from "@/components/ui/Card";

type ReportCategory = "operasional" | "perjalanan" | "bahan_bakar" | "driver" | "keamanan" | "geofence";

interface ReportDefinition {
  id: string;
  name: string;
  description: string;
  category: ReportCategory;
  icon: React.ReactNode;
}

const REPORTS: ReportDefinition[] = [
  { id: "ringkasan-armada", name: "Ringkasan Armada", description: "Status dan utilisasi armada berdasarkan periode.", category: "operasional", icon: <Activity /> },
  { id: "utilisasi-kendaraan", name: "Utilisasi Kendaraan", description: "Perbandingan utilisasi antarunit dan tren harian.", category: "operasional", icon: <BarChart2 /> },
  { id: "aktivitas-harian", name: "Aktivitas Harian", description: "Rekap aktivitas kendaraan per hari kerja.", category: "operasional", icon: <Calendar /> },
  { id: "riwayat-perjalanan", name: "Riwayat Perjalanan", description: "Jarak, durasi, serta waktu mulai dan selesai perjalanan.", category: "perjalanan", icon: <Route /> },
  { id: "jarak-tempuh", name: "Jarak Tempuh", description: "Total jarak tempuh per kendaraan dan periode.", category: "perjalanan", icon: <Zap /> },
  { id: "rekap-rute", name: "Rekap Rute", description: "Perbandingan rute rencana dan aktual.", category: "perjalanan", icon: <Globe /> },
  { id: "pelanggaran-kecepatan", name: "Pelanggaran Kecepatan", description: "Kejadian kecepatan berlebih beserta lokasi dan waktu.", category: "perjalanan", icon: <Gauge /> },
  { id: "konsumsi-bbm", name: "Konsumsi BBM", description: "Volume bahan bakar dan tren konsumsi operasional.", category: "bahan_bakar", icon: <Droplet /> },
  { id: "efisiensi-bbm", name: "Efisiensi BBM", description: "Efisiensi jarak per liter antarunit.", category: "bahan_bakar", icon: <Activity /> },
  { id: "kinerja-driver", name: "Kinerja Pengemudi", description: "Ringkasan perjalanan, jam kerja, dan kejadian keselamatan.", category: "driver", icon: <Heart /> },
  { id: "skor-mengemudi", name: "Skor Mengemudi", description: "Pengereman keras, kecepatan, dan pola berkendara.", category: "driver", icon: <Gauge /> },
  { id: "jam-kerja", name: "Jam Kerja", description: "Waktu kerja dan istirahat pengemudi.", category: "driver", icon: <Clock /> },
  { id: "log-kejadian", name: "Log Kejadian", description: "Kejadian keselamatan dan pelanggaran operasional.", category: "keamanan", icon: <Shield /> },
  { id: "insiden-kecelakaan", name: "Insiden dan Kecelakaan", description: "Rekam insiden serta bukti pendukung yang tersedia.", category: "keamanan", icon: <FileText /> },
  { id: "masuk-keluar-zona", name: "Masuk dan Keluar Zona", description: "Kejadian geofence per lokasi operasional.", category: "geofence", icon: <MapPin /> },
];

const CATEGORIES: ReportCategory[] = ["operasional", "perjalanan", "bahan_bakar", "driver", "keamanan", "geofence"];
const CATEGORY_LABELS: Record<ReportCategory, string> = {
  operasional: "Operasional",
  perjalanan: "Perjalanan",
  bahan_bakar: "Bahan Bakar",
  driver: "Pengemudi",
  keamanan: "Keamanan",
  geofence: "Geofence",
};

export default function ReportsPage() {
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState<ReportCategory | "all">("all");

  const filteredReports = useMemo(() => {
    const query = search.trim().toLowerCase();
    return REPORTS.filter((report) => {
      const matchesQuery = !query
        || report.name.toLowerCase().includes(query)
        || report.description.toLowerCase().includes(query);
      return matchesQuery && (category === "all" || report.category === category);
    });
  }, [category, search]);

  function resetFilters() {
    setSearch("");
    setCategory("all");
  }

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-bg">
      <header className="border-b border-border bg-surface-1 px-6 py-4">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="text-label uppercase tracking-wide text-muted">Reporting</p>
            <h1 className="mt-0.5 text-h1 font-semibold text-foreground">Pusat Laporan</h1>
            <p className="mt-0.5 text-sm text-muted">Katalog definisi laporan operasional</p>
          </div>
          <p className="text-sm text-muted"><span className="font-mono font-semibold tabular-nums text-foreground">{REPORTS.length}</span> jenis laporan</p>
        </div>
      </header>

      <div className="border-b border-border bg-surface-1 px-6 py-3">
        <div className="flex flex-wrap items-center gap-3">
          <div className="relative min-w-[220px] flex-1 sm:max-w-xs">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" />
            <input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Cari jenis laporan..."
              className="w-full rounded-lg border border-border bg-surface-2 py-1.5 pl-9 pr-3 text-sm text-foreground placeholder:text-faint focus-visible:outline-2 focus-visible:outline-brand"
            />
          </div>
          <div className="flex flex-wrap items-center gap-1">
            <button
              onClick={() => setCategory("all")}
              className={`rounded-md border px-3 py-1.5 text-sm font-medium focus-visible:outline-2 focus-visible:outline-brand ${category === "all" ? "border-brand bg-brand text-signal-ink" : "border-border bg-surface-2 text-muted hover:bg-surface-3"}`}
            >
              Semua
            </button>
            {CATEGORIES.map((item) => (
              <button
                key={item}
                onClick={() => setCategory(item)}
                className={`rounded-md border px-3 py-1.5 text-sm font-medium focus-visible:outline-2 focus-visible:outline-brand ${category === item ? "border-brand bg-brand text-signal-ink" : "border-border bg-surface-2 text-muted hover:bg-surface-3"}`}
              >
                {CATEGORY_LABELS[item]}
              </button>
            ))}
          </div>
          {(search || category !== "all") && (
            <Button variant="ghost" size="sm" icon={<X className="h-4 w-4" />} onClick={resetFilters}>Reset</Button>
          )}
        </div>
      </div>

      <main className="px-6 py-5">
        {filteredReports.length === 0 ? (
          <Card padding="md">
            <EmptyState
              icon={<FileText className="h-8 w-8 opacity-40" />}
              title="Laporan tidak ditemukan"
              description="Tidak ada definisi laporan yang cocok dengan filter."
              action={<Button variant="secondary" size="sm" onClick={resetFilters}>Reset filter</Button>}
            />
          </Card>
        ) : (
          <div className="divide-y divide-border border-y border-border">
            {filteredReports.map((report) => (
              <article key={report.id} className="grid gap-3 py-4 sm:grid-cols-[36px_minmax(0,1fr)_140px] sm:items-center">
                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-surface-2 text-muted [&_svg]:h-4 [&_svg]:w-4">
                  {report.icon}
                </div>
                <div className="min-w-0">
                  <h2 className="text-sm font-semibold text-foreground">{report.name}</h2>
                  <p className="mt-0.5 text-sm text-muted">{report.description}</p>
                </div>
                <Badge variant="default" className="w-fit sm:justify-self-end">{CATEGORY_LABELS[report.category]}</Badge>
              </article>
            ))}
          </div>
        )}
        <p className="mt-4 max-w-2xl text-sm text-muted">
          Pembuatan dan ekspor laporan akan tersedia setelah pipeline dokumen terhubung. Katalog ini tidak menjalankan aksi simulasi.
        </p>
      </main>
    </div>
  );
}
