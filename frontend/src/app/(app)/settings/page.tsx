"use client";

import { useState } from "react";
import { motion } from "motion/react";
import {
  Settings, User, Truck, Bell, Eye, Plug, Shield,
  ChevronRight, Moon, Sun, Monitor, Globe, Smartphone,
  CheckCircle2, AlertCircle, XCircle, Clock, LogOut, Key,
} from "lucide-react";
import { useToast } from "@/components/ui/Toast";
import { Button } from "@/components/ui/Button";
import { Card, CardHeader } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { useTheme } from "@/components/ThemeProvider";
import { useReducedMotion } from "@/hooks/useReducedMotion";
import { useAppContext } from "@/components/context/AppContext";

/* ─── Local Components ──────────────────────────────── */

// Toggle/Switch — animated, accessible
function Toggle({ checked, onChange }: { checked: boolean; onChange: (v: boolean) => void }) {
  const reducedMotion = useReducedMotion();
  const trackBg = checked ? "bg-brand" : "bg-surface-3";
  const knobX = checked ? "translate-x-[22px]" : "translate-x-0";
  return (
    <button
      role="switch"
      aria-checked={checked}
      onClick={() => onChange(!checked)}
      className="relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand"
      style={!reducedMotion ? { transition: "background-color 200ms" } : {}}
    >
      <span className={`inline-block h-4 w-4 rounded-full bg-white shadow-sm transition-transform ${trackBg} ${knobX}`}
        style={!reducedMotion ? { transition: `transform ${checked ? "200ms" : "100ms"}` } : {}}
      />
    </button>
  );
}

// SettingRow — label+description left, control right
function SettingRow({ label, description, children }: { label: string; description?: string; children: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between gap-4 py-3 border-b border-border last:border-0">
      <div className="min-w-0 flex-1">
        <p className="text-sm font-medium text-foreground">{label}</p>
        {description && <p className="mt-0.5 text-xs text-muted">{description}</p>}
      </div>
      <div className="shrink-0">{children}</div>
    </div>
  );
}

// SettingSection wrapper
function SettingSection({ title, description, children }: { title: string; description?: string; children: React.ReactNode }) {
  return (
    <div className="mb-8">
      <div className="mb-4">
        <h2 className="text-base font-semibold text-foreground">{title}</h2>
        {description && <p className="mt-0.5 text-sm text-muted">{description}</p>}
      </div>
      <Card padding="none">
        <div className="divide-y divide-border">{children}</div>
      </Card>
    </div>
  );
}

/* ─── Nav Items ──────────────────────────────────────── */

const NAV_SECTIONS = [
  { id: "profil", label: "Profil", icon: User },
  { id: "armada", label: "Armada", icon: Truck },
  { id: "notifikasi", label: "Notifikasi", icon: Bell },
  { id: "tampilan", label: "Tampilan", icon: Eye },
  { id: "integrasi", label: "Integrasi", icon: Plug },
  { id: "keamanan", label: "Keamanan", icon: Shield },
] as const;
type Section = typeof NAV_SECTIONS[number]["id"];

/* ─── Page ───────────────────────────────────────────── */

export default function SettingsPage() {
  const [activeSection, setActiveSection] = useState<Section>("profil");
  const { theme, toggleTheme } = useTheme();
  const { success, error } = useToast();
  const reducedMotion = useReducedMotion();
  const { setSpeedingAlertEnabled, setTelemetriInterval } = useAppContext();

  // ── Profil state
  const [profile, setProfile] = useState({ nama: "Ahmad Wijaya", email: "ahmad.wijaya@vanguard.id", nohp: "0812-3456-7890", role: "Fleet Manager" });

  // ── Armada state
  const [fleet, setFleet] = useState({ company: "PT Logistics Nusantara", timezone: "Asia/Jakarta", distanceUnit: "km", speedLimit: 80, refreshInterval: "10" });

  // ── Notifikasi toggles
  const [notif, setNotif] = useState({ speeding: true, geofence: true, engineCut: false, insiden: true, laporanHarian: false });

  // ── Tampilan state
  const [display, setDisplay] = useState({ density: "compact" as "compact"|"normal", animation: true, bahasa: "id" });

  // ── Integrasi state
  const [integrations, setIntegrations] = useState([
    { id: "maps", name: "Maps API", status: "connected" as "connected"|"disconnected" },
    { id: "sms", name: "SMS Gateway", status: "connected" as "connected"|"disconnected" },
    { id: "wa", name: "WhatsApp", status: "disconnected" as "connected"|"disconnected" },
    { id: "webhook", name: "Webhook", status: "connected" as "connected"|"disconnected" },
  ]);

  // ── Keamanan state
  const [passwords, setPasswords] = useState({ current: "", baru: "", konfirmasi: "" });
  const [twoFA, setTwoFA] = useState(false);
  const [sessions] = useState([
    { id: "1", device: "Chrome · Windows", location: "Jakarta, ID", waktu: "2 jam lalu", current: true },
    { id: "2", device: "Safari · macOS", location: "Bandung, ID", waktu: "Kemarin", current: false },
    { id: "3", device: "App · iOS", location: "Surabaya, ID", waktu: "3 hari lalu", current: false },
  ]);

  /* ─── Handlers ────────────────────────────────────── */
  const handleSimpanProfil = () => success("Profil disimpan", "Perubahan berhasil disimpan.");
  const handleSimpanArmada = () => success("Pengaturan disimpan");
  const handleNotifToggle = (key: string, val: boolean) => {
    if (key === "speeding") setSpeedingAlertEnabled(val);
  };
  const handleIntegrasiToggle = (id: string, current: "connected"|"disconnected") => {
    if (current === "connected") {
      setIntegrations(prev => prev.map(i => i.id === id ? { ...i, status: "disconnected" as const } : i));
    } else {
      setIntegrations(prev => prev.map(i => i.id === id ? { ...i, status: "connected" as const } : i));
    }
  };
  const handleSimpanPassword = () => {
    if (!passwords.current) { error("Password kosong", "Masukkan password saat ini."); return; }
    if (passwords.baru.length < 6) { error("Password lemah", "Minimal 6 karakter."); return; }
    if (passwords.baru !== passwords.konfirmasi) { error("Password tidak cocok", "Pastikan password baru dan konfirmasi sama."); return; }
    success("Password diubah", "Password berhasil diperbarui.");
    setPasswords({ current: "", baru: "", konfirmasi: "" });
  };
  const handleAkhiriSesi = (id: string) => {
    // Session management in development
  };

  /* ─── Nav icon map ────────────────────────────────── */
  const navIconMap: Record<Section, React.ElementType> = {
    profil: User,
    armada: Truck,
    notifikasi: Bell,
    tampilan: Eye,
    integrasi: Plug,
    keamanan: Shield,
  };

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* ── Header ─────────────────────────────────────── */}
      <header className="border-b border-border bg-surface-1 px-6 py-4">
        <h1 className="text-xl font-semibold text-foreground flex items-center gap-2">
          <Settings className="w-5 h-5 text-brand" />
          Pengaturan
        </h1>
        <p className="mt-0.5 text-sm text-muted">Kelola akun, armada, dan preferensi sistem</p>
      </header>

      <div className="flex max-w-6xl mx-auto">
        {/* ── Sidebar Nav (sticky) ────────────────────── */}
        <aside className="w-[220px] shrink-0 py-6 pr-4 sticky top-0 h-fit">
          <nav className="space-y-1">
            {NAV_SECTIONS.map((section) => {
              const Icon = navIconMap[section.id];
              const isActive = activeSection === section.id;
              return (
                <button
                  key={section.id}
                  onClick={() => setActiveSection(section.id)}
                  aria-current={isActive ? "page" : undefined}
                  className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand ${
                    isActive
                      ? "bg-brand text-white"
                      : "text-muted hover:text-foreground hover:bg-surface-2"
                  }`}
                >
                  <Icon className="w-4 h-4 shrink-0" />
                  {section.label}
                </button>
              );
            })}
          </nav>
        </aside>

        {/* ── Content ──────────────────────────────────── */}
        <main className="flex-1 py-6 pl-4 min-w-0 border-l border-border">

          {/* ── Profil ──────────────────────────────────── */}
          {activeSection === "profil" && (
            <div>
              <div className="mb-6">
                <h2 className="text-lg font-semibold text-foreground">Profil</h2>
                <p className="mt-0.5 text-sm text-muted">Informasi akun Anda</p>
              </div>
              <Card>
                <div className="flex items-start gap-5 mb-6">
                  {/* Avatar */}
                  <div className="w-16 h-16 rounded-full bg-brand text-white flex items-center justify-center text-xl font-semibold shrink-0">
                    {profile.nama.split(" ").map(n => n[0]).join("").slice(0,2).toUpperCase()}
                  </div>
                  <div>
                    <p className="font-semibold text-foreground">{profile.nama}</p>
                    <Badge variant="default" className="mt-1">{profile.role}</Badge>
                  </div>
                </div>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-1.5">Nama Lengkap</label>
                    <input
                      type="text"
                      value={profile.nama}
                      onChange={e => setProfile(p => ({ ...p, nama: e.target.value }))}
                      className="w-full px-3 py-2 rounded-lg bg-surface-2 border border-border text-sm text-foreground placeholder:text-muted focus-visible:outline-2 focus-visible:outline-brand"
                      aria-label="Nama lengkap"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-1.5">Email</label>
                    <input
                      type="email"
                      value={profile.email}
                      onChange={e => setProfile(p => ({ ...p, email: e.target.value }))}
                      className="w-full px-3 py-2 rounded-lg bg-surface-2 border border-border text-sm text-foreground placeholder:text-muted focus-visible:outline-2 focus-visible:outline-brand"
                      aria-label="Email"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-1.5">No. HP</label>
                    <input
                      type="tel"
                      value={profile.nohp}
                      onChange={e => setProfile(p => ({ ...p, nohp: e.target.value }))}
                      className="w-full px-3 py-2 rounded-lg bg-surface-2 border border-border text-sm text-foreground placeholder:text-muted focus-visible:outline-2 focus-visible:outline-brand font-mono"
                      aria-label="Nomor HP"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-1.5">Role</label>
                    <input
                      type="text"
                      value={profile.role}
                      disabled
                      className="w-full px-3 py-2 rounded-lg bg-surface-3 border border-border text-sm text-muted cursor-not-allowed"
                      aria-label="Role"
                    />
                  </div>
                </div>
                <div className="mt-6 flex justify-end">
                  <Button onClick={handleSimpanProfil}>Simpan Perubahan</Button>
                </div>
              </Card>
            </div>
          )}

          {/* ── Armada ──────────────────────────────────── */}
          {activeSection === "armada" && (
            <div>
              <div className="mb-6">
                <h2 className="text-lg font-semibold text-foreground">Armada</h2>
                <p className="mt-0.5 text-sm text-muted">Pengaturan default armada</p>
              </div>
              <Card>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-1.5">Nama Perusahaan</label>
                    <input
                      type="text"
                      value={fleet.company}
                      onChange={e => setFleet(f => ({ ...f, company: e.target.value }))}
                      className="w-full px-3 py-2 rounded-lg bg-surface-2 border border-border text-sm text-foreground focus-visible:outline-2 focus-visible:outline-brand"
                      aria-label="Nama perusahaan"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-1.5">Zona Waktu</label>
                    <select
                      value={fleet.timezone}
                      onChange={e => setFleet(f => ({ ...f, timezone: e.target.value }))}
                      className="w-full px-3 py-2 rounded-lg bg-surface-2 border border-border text-sm text-foreground focus-visible:outline-2 focus-visible:outline-brand"
                      aria-label="Zona waktu"
                    >
                      <option>Asia/Jakarta</option>
                      <option>Asia/Makassar</option>
                      <option>Asia/Jayapura</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-1.5">Satuan Jarak</label>
                    <select
                      value={fleet.distanceUnit}
                      onChange={e => setFleet(f => ({ ...f, distanceUnit: e.target.value }))}
                      className="w-full px-3 py-2 rounded-lg bg-surface-2 border border-border text-sm text-foreground focus-visible:outline-2 focus-visible:outline-brand"
                      aria-label="Satuan jarak"
                    >
                      <option value="km">Kilometer (km)</option>
                      <option value="mil">Mil (mi)</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-1.5">Batas Kecepatan Default</label>
                    <div className="flex items-center gap-2">
                      <input
                        type="number"
                        min={40}
                        max={200}
                        value={fleet.speedLimit}
                        onChange={e => setFleet(f => ({ ...f, speedLimit: Number(e.target.value) }))}
                        className="w-24 px-3 py-2 rounded-lg bg-surface-2 border border-border text-sm text-foreground font-mono tabular-nums focus-visible:outline-2 focus-visible:outline-brand"
                        aria-label="Batas kecepatan default"
                      />
                      <span className="text-sm text-muted">{fleet.distanceUnit}/jam</span>
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-1.5">Interval Refresh Telemetri</label>
                    <select
                      value={fleet.refreshInterval}
                      onChange={e => { setFleet(f => ({ ...f, refreshInterval: e.target.value })); setTelemetriInterval(e.target.value as "5" | "10" | "30" | "60"); }}
                      className="w-full px-3 py-2 rounded-lg bg-surface-2 border border-border text-sm text-foreground focus-visible:outline-2 focus-visible:outline-brand"
                      aria-label="Interval refresh"
                    >
                      <option value="5">5 detik</option>
                      <option value="10">10 detik</option>
                      <option value="30">30 detik</option>
                      <option value="60">1 menit</option>
                    </select>
                  </div>
                </div>
                <div className="mt-6 flex justify-end">
                  <Button onClick={handleSimpanArmada}>Simpan</Button>
                </div>
              </Card>
            </div>
          )}

          {/* ── Notifikasi ───────────────────────────────── */}
          {activeSection === "notifikasi" && (
            <div>
              <div className="mb-6">
                <h2 className="text-lg font-semibold text-foreground">Notifikasi</h2>
                <p className="mt-0.5 text-sm text-muted">Pilih notifikasi yang ingin Anda terima</p>
              </div>
              <SettingSection
                title="Notifikasi Sistem"
                description="Notifikasi real-time dari aktivitas armada"
              >
                <div className="px-4">
                  <SettingRow label="Speeding Alert" description="Peringatan ketika kendaraan melebihi batas kecepatan">
                    <Toggle checked={notif.speeding} onChange={v => { setNotif(n => ({ ...n, speeding: v })); handleNotifToggle("speeding", v); }} />
                  </SettingRow>
                  <SettingRow label="Geofence In/Out" description="Notifikasi saat kendaraan masuk atau keluar zona">
                    <Toggle checked={notif.geofence} onChange={v => { setNotif(n => ({ ...n, geofence: v })); handleNotifToggle("geofence", v); }} />
                  </SettingRow>
                  <SettingRow label="Engine Cut-off" description="Peringatan pemotongan mesin">
                    <Toggle checked={notif.engineCut} onChange={v => { setNotif(n => ({ ...n, engineCut: v })); handleNotifToggle("engineCut", v); }} />
                  </SettingRow>
                  <SettingRow label="Insiden" description="Notifikasi kejadian atau kecelakaan">
                    <Toggle checked={notif.insiden} onChange={v => { setNotif(n => ({ ...n, insiden: v })); handleNotifToggle("insiden", v); }} />
                  </SettingRow>
                  <SettingRow label="Laporan Harian (Email)" description="Kirim ringkasan harian ke email">
                    <Toggle checked={notif.laporanHarian} onChange={v => { setNotif(n => ({ ...n, laporanHarian: v })); handleNotifToggle("laporanHarian", v); }} />
                  </SettingRow>
                </div>
              </SettingSection>
            </div>
          )}

          {/* ── Tampilan ──────────────────────────────────── */}
          {activeSection === "tampilan" && (
            <div>
              <div className="mb-6">
                <h2 className="text-lg font-semibold text-foreground">Tampilan</h2>
                <p className="mt-0.5 text-sm text-muted">Pengaturan tampilan dan preferensi antarmuka</p>
              </div>
              <SettingSection title="Tema">
                <div className="px-4">
                  <SettingRow
                    label="Mode Tema"
                    description={`Tema saat ini: ${theme === "dark" ? "Gelap" : "Terang"}`}
                  >
                    <button
                      onClick={toggleTheme}
                      aria-label={`Ganti ke tema ${theme === "dark" ? "Terang" : "Gelap"}`}
                      className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-surface-2 border border-border text-sm text-foreground hover:bg-surface-3 transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand"
                    >
                      {theme === "dark" ? <Moon className="w-4 h-4" /> : <Sun className="w-4 h-4" />}
                      {theme === "dark" ? "Gelap" : "Terang"}
                    </button>
                  </SettingRow>
                </div>
              </SettingSection>
              <SettingSection title="Density">
                <div className="px-4">
                  <SettingRow label="Density Antarmuka" description="Atur kepadatan informasi di layar">
                    <div className="flex rounded-lg border border-border overflow-hidden">
                      {(["compact", "normal"] as const).map(d => (
                        <button
                          key={d}
                          onClick={() => setDisplay(dis => ({ ...dis, density: d }))}
                          aria-pressed={display.density === d}
                          className={`px-3 py-1.5 text-xs font-medium transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand ${
                            display.density === d
                              ? "bg-brand text-white"
                              : "bg-surface-2 text-muted hover:bg-surface-3"
                          }`}
                        >
                          {d === "compact" ? "Compact" : "Normal"}
                        </button>
                      ))}
                    </div>
                  </SettingRow>
                </div>
              </SettingSection>
              <SettingSection title="Animasi">
                <div className="px-4">
                  <SettingRow label="Aktifkan Animasi" description="Animasi transisi dan efek visual">
                    <Toggle checked={display.animation} onChange={v => setDisplay(dis => ({ ...dis, animation: v }))} />
                  </SettingRow>
                </div>
              </SettingSection>
              <SettingSection title="Bahasa">
                <div className="px-4">
                  <SettingRow label="Bahasa Antarmuka" description="Pilih bahasa yang digunakan">
                    <select
                      value={display.bahasa}
                      onChange={e => setDisplay(dis => ({ ...dis, bahasa: e.target.value }))}
                      className="px-3 py-1.5 rounded-lg bg-surface-2 border border-border text-sm text-foreground focus-visible:outline-2 focus-visible:outline-brand"
                      aria-label="Bahasa"
                    >
                      <option value="id">Indonesia</option>
                      <option value="en">English</option>
                    </select>
                  </SettingRow>
                </div>
              </SettingSection>
            </div>
          )}

          {/* ── Integrasi ────────────────────────────────── */}
          {activeSection === "integrasi" && (
            <div>
              <div className="mb-6">
                <h2 className="text-lg font-semibold text-foreground">Integrasi</h2>
                <p className="mt-0.5 text-sm text-muted">Kelola koneksi ke layanan eksternal</p>
              </div>
              <div className="space-y-3">
                {integrations.map(item => (
                  <Card key={item.id} padding="md">
                    <div className="flex items-center justify-between gap-4">
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="w-9 h-9 rounded-lg bg-surface-2 flex items-center justify-center shrink-0">
                          <Plug className="w-4 h-4 text-muted" />
                        </div>
                        <div className="min-w-0">
                          <p className="text-sm font-medium text-foreground">{item.name}</p>
                          <Badge
                            variant={item.status === "connected" ? "success" : "default"}
                            className="mt-0.5"
                          >
                            {item.status === "connected" ? "Terhubung" : "Belum"}
                          </Badge>
                        </div>
                      </div>
                      <Button
                        size="sm"
                        variant={item.status === "connected" ? "ghost" : "primary"}
                        onClick={() => handleIntegrasiToggle(item.id, item.status)}
                        aria-label={item.status === "connected" ? `Putuskan ${item.name}` : `Hubungkan ${item.name}`}
                      >
                        {item.status === "connected" ? "Putus" : "Hubungkan"}
                      </Button>
                    </div>
                  </Card>
                ))}
              </div>
            </div>
          )}

          {/* ── Keamanan ────────────────────────────────── */}
          {activeSection === "keamanan" && (
            <div>
              <div className="mb-6">
                <h2 className="text-lg font-semibold text-foreground">Keamanan</h2>
                <p className="mt-0.5 text-sm text-muted">Pengaturan keamanan akun</p>
              </div>

              {/* Ganti Password */}
              <SettingSection title="Ubah Password" description="Minimal 6 karakter">
                <div className="p-4 space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-1.5">Password Saat Ini</label>
                    <input
                      type="password"
                      value={passwords.current}
                      onChange={e => setPasswords(p => ({ ...p, current: e.target.value }))}
                      placeholder="••••••••"
                      className="w-full px-3 py-2 rounded-lg bg-surface-2 border border-border text-sm text-foreground placeholder:text-muted focus-visible:outline-2 focus-visible:outline-brand"
                      aria-label="Password saat ini"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-1.5">Password Baru</label>
                    <input
                      type="password"
                      value={passwords.baru}
                      onChange={e => setPasswords(p => ({ ...p, baru: e.target.value }))}
                      placeholder="••••••••"
                      className="w-full px-3 py-2 rounded-lg bg-surface-2 border border-border text-sm text-foreground placeholder:text-muted focus-visible:outline-2 focus-visible:outline-brand"
                      aria-label="Password baru"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-1.5">Konfirmasi Password Baru</label>
                    <input
                      type="password"
                      value={passwords.konfirmasi}
                      onChange={e => setPasswords(p => ({ ...p, konfirmasi: e.target.value }))}
                      placeholder="••••••••"
                      className="w-full px-3 py-2 rounded-lg bg-surface-2 border border-border text-sm text-foreground placeholder:text-muted focus-visible:outline-2 focus-visible:outline-brand"
                      aria-label="Konfirmasi password baru"
                    />
                  </div>
                  <div className="flex justify-end pt-2">
                    <Button size="sm" onClick={handleSimpanPassword}>
                      <Key className="w-3.5 h-3.5" />
                      Ubah Password
                    </Button>
                  </div>
                </div>
              </SettingSection>

              {/* 2FA */}
              <SettingSection title="Autentikasi Dua Faktor">
                <div className="px-4">
                  <SettingRow
                    label="Aktifkan 2FA"
                    description="Menambah lapisan keamanan dengan kode verifikasi"
                  >
                    <Toggle checked={twoFA} onChange={v => setTwoFA(v)} />
                  </SettingRow>
                </div>
              </SettingSection>

              {/* Sesi Aktif */}
              <SettingSection title="Sesi Aktif" description="Perangkat yang sedang login ke akun Anda">
                <div className="divide-y divide-border">
                  {sessions.map(session => (
                    <div key={session.id} className="px-4 py-3 flex items-center justify-between gap-4">
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="w-9 h-9 rounded-lg bg-surface-2 flex items-center justify-center shrink-0">
                          <Smartphone className="w-4 h-4 text-muted" />
                        </div>
                        <div className="min-w-0">
                          <p className="text-sm font-medium text-foreground flex items-center gap-1.5">
                            {session.device}
                            {session.current && <Badge variant="success" className="text-xs py-0">Aktif</Badge>}
                          </p>
                          <p className="text-xs text-muted mt-0.5">{session.location}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3 shrink-0">
                        <span className="text-xs text-muted tabular-nums">{session.waktu}</span>
                        {!session.current && (
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => handleAkhiriSesi(session.id)}
                            aria-label={`Akhiri sesi ${session.device}`}
                          >
                            <LogOut className="w-3.5 h-3.5" />
                            Akhiri
                          </Button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </SettingSection>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
