"use client";

import { useState } from "react";
import { Bell, Bot, Database, KeyRound, Plus, Radio, Save, ShieldCheck, SlidersHorizontal, Trash2, Users, Webhook, X } from "lucide-react";
import { useToast } from "@/components/ui/Toast";

const modules = [
  { name: "Units", desc: "Vehicle master data, GPS pairing, device health", icon: Radio, status: "Active", key: "units" },
  { name: "Drivers", desc: "License, RFID, assignment and safety profile", icon: Users, status: "Active", key: "drivers" },
  { name: "Users & Roles", desc: "Supervisor, dispatcher, viewer permissions", icon: KeyRound, status: "Draft", key: "users" },
  { name: "Telegram Alerts", desc: "Speed, geofence, fuel, GPS lost notifications", icon: Bell, status: "Ready", key: "telegram" },
  { name: "API Webhook", desc: "Receive GPS hardware data via HTTP/MQTT bridge", icon: Webhook, status: "Ready", key: "webhook" },
  { name: "Database", desc: "Telemetry retention, backup and archive policy", icon: Database, status: "Healthy", key: "database" },
];

const statusColors: Record<string, string> = {
  Active: "bg-emerald-50 text-emerald-700 dark:bg-emerald-900/20 dark:text-emerald-300",
  Draft: "bg-amber-50 text-amber-700 dark:bg-amber-900/20 dark:text-amber-300",
  Ready: "bg-blue-50 text-blue-700 dark:bg-blue-900/20 dark:text-blue-300",
  Healthy: "bg-emerald-50 text-emerald-700 dark:bg-emerald-900/20 dark:text-emerald-300",
};

export default function ControlPage() {
  const { addToast } = useToast();
  const [selectedModule, setSelectedModule] = useState<string | null>(null);
  const [telegramEnabled, setTelegramEnabled] = useState(true);
  const [webhookUrl, setWebhookUrl] = useState("https://api.tempo-group.com/gps/ingest");
  const [retentionDays, setRetentionDays] = useState(90);

  function handleModuleClick(key: string) {
    setSelectedModule(key);
  }

  function handleClosePanel() {
    setSelectedModule(null);
  }

  function handleSave() {
    addToast("success", "Settings saved successfully");
  }

  function handleAddUser() {
    addToast("info", "Add user form would open here");
  }

  function handleTestWebhook() {
    addToast("info", "Testing webhook connection...");
  }

  return (
    <div className="min-h-full bg-zinc-50 px-7 py-6 dark:bg-zinc-950">
      <div className="mb-6">
        <p className="metric-label">System administration</p>
        <h1 className="mt-2 text-3xl font-bold text-zinc-900 dark:text-white">Control Panel</h1>
        <p className="mt-2 max-w-2xl text-sm leading-6 text-zinc-600 dark:text-zinc-400">Pusat konfigurasi untuk unit, driver, user, notifikasi, dan integrasi perangkat GPS.</p>
      </div>

      <div className={`grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3 transition-all ${selectedModule ? "xl:grid-cols-2" : ""}`}>
        {modules.map((module) => (
          <button key={module.key} onClick={() => handleModuleClick(module.key)} className={`card p-5 text-left transition-all ${selectedModule === module.key ? "ring-2 ring-zinc-900 dark:ring-white" : "hover:shadow-md"}`}>
            <div className="flex items-start justify-between gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-md bg-zinc-900 text-white dark:bg-white dark:text-zinc-900">
                <module.icon className="h-5 w-5" />
              </div>
              <span className={`rounded-full border px-2.5 py-1 text-xs font-bold ${statusColors[module.status]}`}>{module.status}</span>
            </div>
            <h2 className="mt-4 text-lg font-bold text-zinc-900 dark:text-white">{module.name}</h2>
            <p className="mt-2 text-sm leading-6 text-zinc-600 dark:text-zinc-400">{module.desc}</p>
          </button>
        ))}
      </div>

      {selectedModule && (
        <div className="mt-6 grid grid-cols-1 gap-5 xl:grid-cols-[1fr_400px]">
          <section className="card rounded-md p-5">
            <div className="mb-5 flex items-center justify-between">
              <h2 className="text-lg font-bold text-zinc-900 dark:text-white">{modules.find((m) => m.key === selectedModule)?.name} Configuration</h2>
              <button onClick={handleClosePanel} className="rounded-md p-2 text-zinc-500 hover:bg-zinc-100 dark:hover:bg-zinc-800"><X className="h-5 w-5" /></button>
            </div>

            {selectedModule === "units" && (
              <div className="space-y-4">
                <p className="text-sm text-zinc-600 dark:text-zinc-400">Vehicle master data management. All registered units, GPS device pairing, and device health monitoring.</p>
                <div className="rounded-md border border-zinc-200 p-4 dark:border-zinc-800">
                  <div className="flex items-center justify-between mb-3"><span className="font-semibold text-zinc-700 dark:text-zinc-300">Total Units</span><span className="text-xl font-bold text-zinc-900 dark:text-white">103</span></div>
                  <div className="flex items-center justify-between mb-3"><span className="font-semibold text-zinc-700 dark:text-zinc-300">GPS Online</span><span className="text-xl font-bold text-emerald-700 dark:text-emerald-300">98</span></div>
                  <div className="flex items-center justify-between"><span className="font-semibold text-zinc-700 dark:text-zinc-300">Needs Attention</span><span className="text-xl font-bold text-amber-700 dark:text-amber-300">5</span></div>
                </div>
                <button onClick={() => addToast("info", "Opening vehicle management...")} className="btn btn-primary">Manage Units</button>
              </div>
            )}

            {selectedModule === "drivers" && (
              <div className="space-y-4">
                <p className="text-sm text-zinc-600 dark:text-zinc-400">Driver master data, license management, RFID pairing, and safety profile tracking.</p>
                <div className="rounded-md border border-zinc-200 p-4 dark:border-zinc-800">
                  <div className="flex items-center justify-between mb-3"><span className="font-semibold text-zinc-700 dark:text-zinc-300">Total Drivers</span><span className="text-xl font-bold text-zinc-900 dark:text-white">85</span></div>
                  <div className="flex items-center justify-between mb-3"><span className="font-semibold text-zinc-700 dark:text-zinc-300">Active</span><span className="text-xl font-bold text-emerald-700 dark:text-emerald-300">72</span></div>
                  <div className="flex items-center justify-between"><span className="font-semibold text-zinc-700 dark:text-zinc-300">Avg Safety Score</span><span className="text-xl font-bold text-zinc-900 dark:text-white">87.3</span></div>
                </div>
              </div>
            )}

            {selectedModule === "users" && (
              <div className="space-y-4">
                <p className="text-sm text-zinc-600 dark:text-zinc-400">User accounts and role-based access control for dispatcher, supervisor, and admin.</p>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-zinc-200 text-left text-[11px] uppercase text-zinc-500">
                        <th className="pb-2">Name</th>
                        <th className="pb-2">Email</th>
                        <th className="pb-2">Role</th>
                        <th className="pb-2">Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {[{ name: "Jhon Erizal", email: "jhon.erizal@tempo-group.com", role: "Dispatcher", status: "Active" }, { name: "Ahmad Wijaya", email: "ahmad.wijaya@tempo-group.com", role: "Supervisor", status: "Active" }, { name: "Budi Santoso", email: "budi.santoso@tempo-group.com", role: "Admin", status: "Active" }].map((user, i) => (
                        <tr key={i} className="border-b border-zinc-100 last:border-0 dark:border-zinc-800">
                          <td className="py-2 font-semibold text-zinc-900 dark:text-white">{user.name}</td>
                          <td className="py-2 text-zinc-600 dark:text-zinc-400">{user.email}</td>
                          <td className="py-2 text-zinc-600 dark:text-zinc-400">{user.role}</td>
                          <td className="py-2"><span className="rounded-full bg-emerald-50 px-2 py-0.5 text-xs font-bold text-emerald-700 dark:bg-emerald-900/20 dark:text-emerald-300">{user.status}</span></td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                <button onClick={handleAddUser} className="btn btn-primary"><Plus className="h-4 w-4" /> Add User</button>
              </div>
            )}

            {selectedModule === "telegram" && (
              <div className="space-y-4">
                <p className="text-sm text-zinc-600 dark:text-zinc-400">Configure Telegram bot for real-time alerts on speeding, geofence events, and GPS issues.</p>
                <div className="flex items-center justify-between rounded-md border border-zinc-200 p-4 dark:border-zinc-800">
                  <div><p className="font-semibold text-zinc-900 dark:text-white">Enable Telegram Alerts</p><p className="text-xs text-zinc-500">Send notifications to configured bot</p></div>
                  <button onClick={() => setTelegramEnabled(!telegramEnabled)} className={`relative h-6 w-11 rounded-full p-0.5 transition-colors ${telegramEnabled ? "bg-emerald-500" : "bg-zinc-300 dark:bg-zinc-700"}`}><span className={`block h-5 w-5 rounded-full bg-white transition-transform ${telegramEnabled ? "translate-x-5" : ""}`} /></button>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-zinc-700 dark:text-zinc-300">Bot Token</label>
                  <input type="text" defaultValue="1234567890:ABCdefGHIjklMNOpqrsTUVwxyz" className="w-full rounded-lg border border-zinc-200 bg-white px-4 py-2.5 text-sm dark:border-zinc-800 dark:bg-zinc-900" />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-zinc-700 dark:text-zinc-300">Alert Types</label>
                  <div className="space-y-2">
                    {["Speeding", "Geofence Entry/Exit", "GPS Offline", "Low Fuel", "Driver Fatigue"].map((type) => (
                      <label key={type} className="flex items-center gap-2 text-sm font-semibold text-zinc-700 dark:text-zinc-300">
                        <input type="checkbox" defaultChecked className="h-4 w-4" />{type}
                      </label>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {selectedModule === "webhook" && (
              <div className="space-y-4">
                <p className="text-sm text-zinc-600 dark:text-zinc-400">Configure API webhook endpoint for receiving GPS data from hardware devices.</p>
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-zinc-700 dark:text-zinc-300">Webhook URL</label>
                  <input type="text" value={webhookUrl} onChange={(e) => setWebhookUrl(e.target.value)} className="w-full rounded-lg border border-zinc-200 bg-white px-4 py-2.5 text-sm dark:border-zinc-800 dark:bg-zinc-900" />
                </div>
                <div className="flex gap-2">
                  <button onClick={handleTestWebhook} className="btn btn-secondary">Test Connection</button>
                  <button onClick={handleSave} className="btn btn-primary"><Save className="h-4 w-4" /> Save</button>
                </div>
              </div>
            )}

            {selectedModule === "database" && (
              <div className="space-y-4">
                <p className="text-sm text-zinc-600 dark:text-zinc-400">Telemetry data retention policy and backup configuration.</p>
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-zinc-700 dark:text-zinc-300">Retention Period</label>
                  <select value={retentionDays} onChange={(e) => setRetentionDays(Number(e.target.value))} className="w-full rounded-lg border border-zinc-200 bg-white px-4 py-2.5 text-sm dark:border-zinc-800 dark:bg-zinc-900">
                    <option value={30}>30 days</option>
                    <option value={60}>60 days</option>
                    <option value={90}>90 days</option>
                    <option value={180}>180 days</option>
                    <option value={365}>1 year</option>
                  </select>
                </div>
                <div className="rounded-md border border-zinc-200 p-4 dark:border-zinc-800">
                  <div className="flex items-center justify-between mb-3"><span className="font-semibold text-zinc-700 dark:text-zinc-300">Database Size</span><span className="font-bold text-zinc-900 dark:text-white">2.4 GB</span></div>
                  <div className="flex items-center justify-between mb-3"><span className="font-semibold text-zinc-700 dark:text-zinc-300">Total Records</span><span className="font-bold text-zinc-900 dark:text-white">15.2M</span></div>
                  <div className="flex items-center justify-between"><span className="font-semibold text-zinc-700 dark:text-zinc-300">Last Backup</span><span className="font-bold text-zinc-900 dark:text-white">12 Jun 2026, 03:00</span></div>
                </div>
              </div>
            )}
          </section>

          <aside className="space-y-5">
            <div className="rounded-md bg-zinc-900 p-5 text-white dark:bg-white dark:text-zinc-900">
              <SlidersHorizontal className="h-5 w-5" />
              <p className="mt-4 text-3xl font-bold">VANGUARD</p>
              <p className="mt-2 text-sm font-semibold opacity-75">Control tower modern untuk fleet monitoring operational.</p>
              <div className="mt-6 flex items-center gap-2 rounded-md bg-white/10 p-3 dark:bg-zinc-900/10">
                <Bot className="h-4 w-4" />
                <p className="text-xs font-bold">Integration layer ready</p>
              </div>
            </div>

            <div className="card rounded-md p-5">
              <p className="metric-label">Smart handling rules</p>
              <div className="mt-4 space-y-3">
                {["If GPS data delayed above 30 minutes, mark unit as attention and notify supervisor.", "If speed exceeds 90 km/h, create speeding report and request dashcam snapshot.", "If vehicle enters customer geofence, start unloading timer automatically.", "If telemetry API fails, keep UI on last-known position and show degraded state."].map((rule, i) => (
                  <div key={i} className="flex items-start gap-3 rounded-md border border-zinc-200 p-3 dark:border-zinc-800">
                    <ShieldCheck className="mt-0.5 h-4 w-4 text-emerald-600 shrink-0" />
                    <p className="text-sm font-semibold text-zinc-700 dark:text-zinc-300">{rule}</p>
                  </div>
                ))}
              </div>
            </div>
          </aside>
        </div>
      )}
    </div>
  );
}
