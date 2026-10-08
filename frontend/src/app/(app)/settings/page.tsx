"use client";

import { Check, Moon, Radio, Rows3, Sun } from "lucide-react";
import { useTheme } from "@/components/ThemeProvider";
import { useAppContext, type TelemetriInterval } from "@/components/context/AppContext";

const ACCENTS = [
  { id: "yellow" as const, label: "Signal Yellow", color: "#FFC500" },
  { id: "orange" as const, label: "Safety Orange", color: "#FF5A1F" },
  { id: "steel" as const, label: "Steel Mono", color: "#C7D0D9" },
];

const INTERVALS: Array<{ value: TelemetriInterval; label: string }> = [
  { value: "5", label: "5 detik" },
  { value: "10", label: "10 detik" },
  { value: "30", label: "30 detik" },
  { value: "60", label: "1 menit" },
];

function SettingRow({
  title,
  description,
  children,
}: {
  title: string;
  description: string;
  children: React.ReactNode;
}) {
  return (
    <div className="grid gap-4 border-b border-border py-5 last:border-b-0 md:grid-cols-[minmax(0,1fr)_minmax(280px,420px)] md:items-center">
      <div className="min-w-0">
        <h2 className="text-sm font-semibold text-foreground">{title}</h2>
        <p className="mt-1 max-w-xl text-sm leading-relaxed text-muted">{description}</p>
      </div>
      <div className="min-w-0 md:justify-self-end">{children}</div>
    </div>
  );
}

export default function SettingsPage() {
  const { theme, setTheme, density, setDensity, accent, setAccent } = useTheme();
  const { telemetriInterval, setTelemetriInterval, isConnected } = useAppContext();
  const interval = String(telemetriInterval / 1000) as TelemetriInterval;

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-bg">
      <header className="border-b border-border bg-surface-1 px-6 py-4">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="text-label uppercase tracking-wide text-muted">Workspace</p>
            <h1 className="mt-0.5 text-h1 font-semibold text-foreground">Pengaturan</h1>
            <p className="mt-0.5 text-sm text-muted">Preferensi lokal yang langsung diterapkan di perangkat ini</p>
          </div>
          <div className="flex items-center gap-2 text-sm text-muted" role="status">
            <span className={`h-2 w-2 rounded-full ${isConnected ? "bg-st-driving" : "bg-st-offline"}`} />
            {isConnected ? "Telemetry terhubung" : "Menggunakan data lokal"}
          </div>
        </div>
      </header>

      <main className="mx-auto w-full max-w-5xl px-6 py-6">
        <div className="border-y border-border">
          <SettingRow title="Tema" description="Gunakan kontras yang sesuai dengan kondisi ruang kerja.">
            <div className="inline-flex rounded-lg border border-border bg-surface-2 p-1" aria-label="Pilih tema">
              {([
                { value: "light" as const, label: "Terang", icon: Sun },
                { value: "dark" as const, label: "Gelap", icon: Moon },
              ]).map((option) => {
                const Icon = option.icon;
                const selected = theme === option.value;
                return (
                  <button
                    key={option.value}
                    onClick={() => setTheme(option.value)}
                    className={`flex min-h-9 items-center gap-2 rounded-md px-3 text-sm font-medium transition-colors focus-visible:outline-2 focus-visible:outline-brand ${selected ? "bg-surface-1 text-foreground" : "text-muted hover:text-foreground"}`}
                    aria-pressed={selected}
                  >
                    <Icon className="h-4 w-4" />
                    {option.label}
                  </button>
                );
              })}
            </div>
          </SettingRow>

          <SettingRow title="Aksen antarmuka" description="Warna sinyal untuk seleksi dan tindakan utama.">
            <div className="flex flex-wrap justify-end gap-2">
              {ACCENTS.map((option) => {
                const selected = accent === option.id;
                return (
                  <button
                    key={option.id}
                    onClick={() => setAccent(option.id)}
                    className={`flex min-h-9 items-center gap-2 rounded-md border px-3 text-sm font-medium transition-colors focus-visible:outline-2 focus-visible:outline-brand ${selected ? "border-foreground bg-surface-1 text-foreground" : "border-border bg-surface-2 text-muted hover:text-foreground"}`}
                    aria-pressed={selected}
                  >
                    <span className="h-3 w-3 rounded-sm" style={{ backgroundColor: option.color }} />
                    {option.label}
                    {selected && <Check className="h-3.5 w-3.5" />}
                  </button>
                );
              })}
            </div>
          </SettingRow>

          <SettingRow title="Kepadatan data" description="Atur tinggi baris untuk pemantauan cepat atau kenyamanan baca.">
            <div className="inline-flex rounded-lg border border-border bg-surface-2 p-1" aria-label="Pilih kepadatan data">
              {([
                { value: "compact" as const, label: "Ringkas" },
                { value: "comfortable" as const, label: "Nyaman" },
              ]).map((option) => {
                const selected = density === option.value;
                return (
                  <button
                    key={option.value}
                    onClick={() => setDensity(option.value)}
                    className={`flex min-h-9 items-center gap-2 rounded-md px-3 text-sm font-medium transition-colors focus-visible:outline-2 focus-visible:outline-brand ${selected ? "bg-surface-1 text-foreground" : "text-muted hover:text-foreground"}`}
                    aria-pressed={selected}
                  >
                    <Rows3 className="h-4 w-4" />
                    {option.label}
                  </button>
                );
              })}
            </div>
          </SettingRow>

          <SettingRow title="Interval telemetry" description="Frekuensi polling cadangan ketika pembaruan realtime tidak diterima.">
            <div className="flex items-center gap-2">
              <Radio className="h-4 w-4 text-muted" />
              <select
                value={interval}
                onChange={(event) => setTelemetriInterval(event.target.value as TelemetriInterval)}
                className="min-h-9 rounded-md border border-border bg-surface-2 px-3 text-sm text-foreground focus-visible:outline-2 focus-visible:outline-brand"
                aria-label="Interval refresh telemetry"
              >
                {INTERVALS.map((option) => (
                  <option key={option.value} value={option.value}>{option.label}</option>
                ))}
              </select>
            </div>
          </SettingRow>
        </div>

        <p className="mt-5 max-w-2xl text-sm text-muted">
          Preferensi tema, aksen, dan kepadatan disimpan di browser ini. Pengaturan akun, keamanan, dan integrasi tidak ditampilkan sampai layanan organisasinya tersedia.
        </p>
      </main>
    </div>
  );
}
