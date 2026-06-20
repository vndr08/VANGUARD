"use client";

import { useState } from "react";
import { Moon, Monitor, Save, Settings as SettingsIcon, Sun } from "lucide-react";
import { useToast } from "@/components/ui/Toast";

type ThemePreference = "light" | "dark" | "system";
type TableDensity = "compact" | "comfortable";
type TileProvider = "carto" | "osm" | "satellite";

export default function SettingsPage() {
  const { addToast } = useToast();

  const [theme, setTheme] = useState<ThemePreference>("system");
  const [tableDensity, setTableDensity] = useState<TableDensity>("compact");
  const [tileProvider, setTileProvider] = useState<TileProvider>("carto");
  const [defaultZoom, setDefaultZoom] = useState(12);
  const [notifications, setNotifications] = useState({ speeding: true, geofence: true, offline: true, idle: false, fuel: true });
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [autoRefresh, setAutoRefresh] = useState(30);

  function handleSave() {
    addToast("success", "Settings saved successfully");
  }

  const themeOptions = [
    { value: "light", label: "Light", icon: Sun },
    { value: "dark", label: "Dark", icon: Moon },
    { value: "system", label: "System", icon: Monitor },
  ] as const;

  return (
    <div className="min-h-full bg-zinc-50 px-7 py-6 dark:bg-zinc-950">
      <div className="mb-6">
        <p className="metric-label">User preferences</p>
        <h1 className="mt-2 text-3xl font-bold text-zinc-900 dark:text-white">Settings</h1>
        <p className="mt-2 max-w-2xl text-sm leading-6 text-zinc-600 dark:text-zinc-400">Configure your VANGUARD experience: theme, map, notifications, and display preferences.</p>
      </div>

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-[1fr_400px]">
        <div className="space-y-6">
          <section className="card rounded-md p-6">
            <div className="flex items-center gap-3 mb-5">
              <div className="flex h-10 w-10 items-center justify-center rounded-md bg-zinc-900 dark:bg-white">
                <SettingsIcon className="h-5 w-5 text-white dark:text-zinc-900" />
              </div>
              <div>
                <h2 className="text-lg font-bold text-zinc-900 dark:text-white">Appearance</h2>
                <p className="text-xs font-semibold text-zinc-500">Theme and display settings</p>
              </div>
            </div>

            <div className="space-y-5">
              <div>
                <label className="mb-3 block text-sm font-bold text-zinc-700 dark:text-zinc-300">Theme preference</label>
                <div className="flex gap-3">
                  {themeOptions.map((option) => (
                    <button key={option.value} onClick={() => setTheme(option.value)} className={`flex flex-1 items-center justify-center gap-2 rounded-md border px-4 py-3 text-sm font-bold transition-colors ${theme === option.value ? "border-zinc-900 bg-zinc-900 text-white dark:border-white dark:bg-white dark:text-zinc-900" : "border-zinc-200 bg-white text-zinc-700 hover:bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-300"}`}>
                      <option.icon className="h-4 w-4" />{option.label}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="mb-3 block text-sm font-bold text-zinc-700 dark:text-zinc-300">Table density</label>
                <div className="flex gap-3">
                  <button onClick={() => setTableDensity("compact")} className={`flex flex-1 items-center justify-center rounded-md border px-4 py-3 text-sm font-bold transition-colors ${tableDensity === "compact" ? "border-zinc-900 bg-zinc-900 text-white dark:border-white dark:bg-white dark:text-zinc-900" : "border-zinc-200 bg-white text-zinc-700 hover:bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-300"}`}>Compact</button>
                  <button onClick={() => setTableDensity("comfortable")} className={`flex flex-1 items-center justify-center rounded-md border px-4 py-3 text-sm font-bold transition-colors ${tableDensity === "comfortable" ? "border-zinc-900 bg-zinc-900 text-white dark:border-white dark:bg-white dark:text-zinc-900" : "border-zinc-200 bg-white text-zinc-700 hover:bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-300"}`}>Comfortable</button>
                </div>
              </div>
            </div>
          </section>

          <section className="card rounded-md p-6">
            <h2 className="text-lg font-bold text-zinc-900 dark:text-white">Map preferences</h2>
            <p className="text-xs font-semibold text-zinc-500 mb-5">Default map display settings</p>

            <div className="space-y-5">
              <div>
                <label className="mb-3 block text-sm font-bold text-zinc-700 dark:text-zinc-300">Tile provider</label>
                <select value={tileProvider} onChange={(e) => setTileProvider(e.target.value as TileProvider)} className="w-full rounded-lg border border-zinc-200 bg-white px-4 py-3 text-sm font-semibold text-zinc-900 dark:border-zinc-800 dark:bg-zinc-900 dark:text-white">
                  <option value="carto">CartoDB (Light/Dark)</option>
                  <option value="osm">OpenStreetMap</option>
                  <option value="satellite">Satellite (ESRI)</option>
                </select>
              </div>

              <div>
                <label className="mb-3 block text-sm font-bold text-zinc-700 dark:text-zinc-300">Default zoom level: {defaultZoom}x</label>
                <input type="range" min="8" max="18" value={defaultZoom} onChange={(e) => setDefaultZoom(Number(e.target.value))} className="w-full" />
                <div className="flex justify-between text-xs font-semibold text-zinc-500 mt-1"><span>8x (Wide)</span><span>18x (Detail)</span></div>
              </div>

              <div>
                <label className="mb-3 block text-sm font-bold text-zinc-700 dark:text-zinc-300">Auto-refresh interval: {autoRefresh}s</label>
                <input type="range" min="10" max="120" step="10" value={autoRefresh} onChange={(e) => setAutoRefresh(Number(e.target.value))} className="w-full" />
                <div className="flex justify-between text-xs font-semibold text-zinc-500 mt-1"><span>10s (Fast)</span><span>120s (Slow)</span></div>
              </div>
            </div>
          </section>

          <section className="card rounded-md p-6">
            <h2 className="text-lg font-bold text-zinc-900 dark:text-white">Notification preferences</h2>
            <p className="text-xs font-semibold text-zinc-500 mb-5">Which alerts should trigger notifications</p>

            <div className="space-y-4">
              {[{ key: "speeding", label: "Speeding alerts", desc: "When vehicle exceeds speed threshold" }, { key: "geofence", label: "Geofence events", desc: "Enter/exit virtual zones" }, { key: "offline", label: "GPS offline", desc: "When vehicle loses GPS connection" }, { key: "idle", label: "Idle engine", desc: "Engine on without movement > 15 min" }, { key: "fuel", label: "Low fuel warning", desc: "Fuel level below 25%" }].map((item) => (
                <div key={item.key} className="flex items-center justify-between rounded-md border border-zinc-200 p-4 dark:border-zinc-800">
                  <div>
                    <p className="font-bold text-zinc-900 dark:text-white">{item.label}</p>
                    <p className="text-xs font-semibold text-zinc-500">{item.desc}</p>
                  </div>
                  <button onClick={() => setNotifications((prev) => ({ ...prev, [item.key]: !prev[item.key as keyof typeof prev] }))} className={`relative h-6 w-11 rounded-full p-0.5 transition-colors ${notifications[item.key as keyof typeof notifications] ? "bg-emerald-500" : "bg-zinc-300 dark:bg-zinc-700"}`}>
                    <span className={`block h-5 w-5 rounded-full bg-white transition-transform ${notifications[item.key as keyof typeof notifications] ? "translate-x-5" : ""}`} />
                  </button>
                </div>
              ))}

              <div className="flex items-center justify-between rounded-md border border-zinc-200 p-4 dark:border-zinc-800">
                <div>
                  <p className="font-bold text-zinc-900 dark:text-white">Sound alerts</p>
                  <p className="text-xs font-semibold text-zinc-500">Play sound for critical notifications</p>
                </div>
                <button onClick={() => setSoundEnabled(!soundEnabled)} className={`relative h-6 w-11 rounded-full p-0.5 transition-colors ${soundEnabled ? "bg-emerald-500" : "bg-zinc-300 dark:bg-zinc-700"}`}>
                  <span className={`block h-5 w-5 rounded-full bg-white transition-transform ${soundEnabled ? "translate-x-5" : ""}`} />
                </button>
              </div>
            </div>
          </section>
        </div>

        <aside className="space-y-6">
          <section className="card rounded-md p-6">
            <h2 className="text-lg font-bold text-zinc-900 dark:text-white">Account</h2>
            <p className="text-xs font-semibold text-zinc-500 mb-5">Your profile information</p>

            <div className="space-y-4">
              <div className="flex items-center gap-4">
                <div className="h-16 w-16 bg-zinc-900 dark:bg-zinc-700 rounded-xl flex items-center justify-center">
                  <span className="text-xl font-bold text-white">JE</span>
                </div>
                <div>
                  <p className="font-bold text-zinc-900 dark:text-white">Jhon Erizal</p>
                  <p className="text-sm font-semibold text-zinc-500">Dispatcher</p>
                </div>
              </div>

              <div className="space-y-3">
                <div>
                  <label className="text-xs font-semibold text-zinc-500">Email</label>
                  <p className="font-semibold text-zinc-900 dark:text-white">jhon.erizal@tempo-group.com</p>
                </div>
                <div>
                  <label className="text-xs font-semibold text-zinc-500">Role</label>
                  <p className="font-semibold text-zinc-900 dark:text-white">Dispatcher / Supervisor</p>
                </div>
                <div>
                  <label className="text-xs font-semibold text-zinc-500">Last login</label>
                  <p className="font-semibold text-zinc-900 dark:text-white">12 June 2026, 08:45</p>
                </div>
              </div>
            </div>
          </section>

          <section className="card rounded-md p-6">
            <h2 className="text-lg font-bold text-zinc-900 dark:text-white">Session</h2>
            <p className="text-xs font-semibold text-zinc-500 mb-5">API and connection status</p>

            <div className="space-y-3">
              <div className="flex items-center justify-between rounded-md bg-zinc-50 p-3 dark:bg-zinc-900">
                <span className="text-sm font-semibold text-zinc-700 dark:text-zinc-300">API Server</span>
                <span className="flex items-center gap-2 text-sm font-bold text-emerald-700 dark:text-emerald-300"><span className="h-2 w-2 rounded-full bg-emerald-500" />Connected</span>
              </div>
              <div className="flex items-center justify-between rounded-md bg-zinc-50 p-3 dark:bg-zinc-900">
                <span className="text-sm font-semibold text-zinc-700 dark:text-zinc-300">WebSocket</span>
                <span className="flex items-center gap-2 text-sm font-bold text-emerald-700 dark:text-emerald-300"><span className="h-2 w-2 rounded-full bg-emerald-500" />Live</span>
              </div>
              <div className="flex items-center justify-between rounded-md bg-zinc-50 p-3 dark:bg-zinc-900">
                <span className="text-sm font-semibold text-zinc-700 dark:text-zinc-300">GPS Devices</span>
                <span className="text-sm font-bold text-zinc-900 dark:text-white">103 units synced</span>
              </div>
            </div>
          </section>

          <button onClick={handleSave} className="btn btn-primary w-full">
            <Save className="h-4 w-4" /> Save Settings
          </button>
        </aside>
      </div>
    </div>
  );
}
