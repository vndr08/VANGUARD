"use client";

import { useState } from "react";
import { AlertTriangle, BarChart3, CalendarDays, Clock, Download, FileText, Fuel, Gauge, MapPinned, Moon, Play, Repeat2, Route, ShieldAlert, TimerReset, Undo2, Video } from "lucide-react";
import { useToast } from "@/components/ui/Toast";

const reports = [
  { name: "Trip Summary", desc: "Distance, duration, start/end, average speed", icon: Route, count: 128, key: "trip" },
  { name: "Idle Report", desc: "Engine on without movement and detention time", icon: Clock, count: 34, key: "idle" },
  { name: "Stop Report", desc: "Parking location, stop duration, last known driver", icon: TimerReset, count: 52, key: "stop" },
  { name: "Working Time", desc: "Driver work hour, active route time, overtime signal", icon: CalendarDays, count: 61, key: "working" },
  { name: "Reverse Summary", desc: "Reverse events, risky maneuver, location evidence", icon: Undo2, count: 11, key: "reverse" },
  { name: "DIMS", desc: "Driver improvement: harsh brake, overspeed, fatigue", icon: BarChart3, count: 24, key: "dims" },
  { name: "Monthly Summary", desc: "Fleet trend, utilization, mileage, downtime", icon: CalendarDays, count: 4, key: "monthly" },
  { name: "Fatigue Summary", desc: "Night driving, long duty, drowsiness alarm", icon: Moon, count: 8, key: "fatigue" },
  { name: "Mileage Day", desc: "Daily mileage, route productivity, unit ranking", icon: Repeat2, count: 103, key: "mileage" },
  { name: "Alarm Video", desc: "Video evidence from dashcam alarm event", icon: Video, count: 5, key: "alarm" },
  { name: "Speeding", desc: "Speed threshold violations by unit and road segment", icon: Gauge, count: 7, key: "speeding" },
  { name: "Fuel Usage", desc: "Fuel trend, low fuel events, suspicious drops", icon: Fuel, count: 19, key: "fuel" },
  { name: "Geofence Events", desc: "Enter/exit warehouse, depot, customer area", icon: MapPinned, count: 41, key: "geofence" },
];

const mockReportData: Record<string, string[][]> = {
  trip: [["B 1234 KJT", "Ahmad Sudirman", "342 km", "4 trips", "Ready"], ["B 5678 TGP", "Budi Santoso", "218 km", "3 trips", "Ready"], ["L 3456 ABC", "Dedi Kurniawan", "156 km", "2 trips", "Ready"], ["H 2345 GHI", "Fajar Ramadhan", "289 km", "3 trips", "Review"]],
  idle: [["B 1234 KJT", "Ahmad Sudirman", "38 min", "Rest Area KM57", "Normal"], ["B 5678 TGP", "Budi Santoso", "45 min", "Customer site", "Normal"], ["L 3456 ABC", "Dedi Kurniawan", "22 min", "Loading dock", "Normal"]],
  speeding: [["B 5678 TGP", "Budi Santoso", "95 km/h", "Tol Cikampek", "Review"], ["H 2345 GHI", "Fajar Ramadhan", "88 km/h", "Pantura", "Action"]],
  fuel: [["B 9012 XYZ", "Cahyo Wibowo", "18%", "Low fuel", "Action"], ["D 6789 JKL", "Gunawan Hadi", "22%", "Monitor", "Normal"]],
};

const queueRows = [["B 1234 KJT", "Trip Summary", "342 km", "4 trips", "Ready"], ["B 5678 TGP", "Speeding", "95 km/h", "Tol Cikampek", "Review"], ["L 1122 STU", "Fuel Usage", "18%", "Low fuel", "Action"], ["H 2345 GHI", "Idle Report", "38 min", "Rest Area KM57", "Normal"]];

export default function ReportsPage() {
  const { addToast } = useToast();
  const [selectedReport, setSelectedReport] = useState<string | null>(null);
  const [dateRange, setDateRange] = useState("Jun 01 - Jun 12");
  const [selectedUnit, setSelectedUnit] = useState("all");
  const [generatedData, setGeneratedData] = useState<Array<string[]> | null>(null);

  function handleSelectReport(key: string) {
    setSelectedReport(key);
    setGeneratedData(null);
  }

  function handleGenerate() {
    if (!selectedReport) return;
    const data = mockReportData[selectedReport] || mockReportData.trip;
    setGeneratedData(data);
    addToast("success", `Generated ${reports.find((r) => r.key === selectedReport)?.name}`);
  }

  function handleExport() {
    addToast("info", "Exporting report to PDF...");
  }

  function handleExportCsv() {
    addToast("info", "Exporting report to CSV...");
  }

  const currentReport = reports.find((r) => r.key === selectedReport);

  return (
    <div className="min-h-full bg-zinc-50 px-7 py-6 dark:bg-zinc-950">
      <div className="mb-6 flex flex-col gap-4 xl:flex-row xl:items-end xl:justify-between">
        <div>
          <p className="metric-label">Operational reporting</p>
          <h1 className="mt-2 text-3xl font-bold text-zinc-900 dark:text-white">Report Center</h1>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-zinc-600 dark:text-zinc-400">Laporan utama untuk supervisor: trip, idle, stop, speeding, fuel, dan geofence.</p>
        </div>
        <div className="flex gap-2">
          <button onClick={handleExportCsv} className="btn btn-secondary">
            <FileText className="h-4 w-4" /> Export CSV
          </button>
          <button onClick={handleExport} className="btn btn-primary">
            <Download className="h-4 w-4" /> Export PDF
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
        {reports.map((item) => (
          <button
            key={item.key}
            onClick={() => handleSelectReport(item.key)}
            className={`card p-5 text-left transition-all ${selectedReport === item.key ? "ring-2 ring-zinc-900 dark:ring-white" : "hover:shadow-md"}`}
          >
            <div className="flex items-start justify-between gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-md bg-zinc-900 text-white dark:bg-white dark:text-zinc-900">
                <item.icon className="h-5 w-5" />
              </div>
              <span className="rounded-full border border-zinc-200 px-2.5 py-1 text-xs font-bold text-zinc-600 dark:border-zinc-800 dark:text-zinc-300">{item.count} records</span>
            </div>
            <h2 className="mt-4 text-lg font-bold text-zinc-900 dark:text-white">{item.name}</h2>
            <p className="mt-2 text-sm leading-6 text-zinc-600 dark:text-zinc-400">{item.desc}</p>
          </button>
        ))}
      </div>

      <div className="mt-6 grid grid-cols-1 gap-5 xl:grid-cols-[1fr_380px]">
        <section className="card overflow-hidden">
          <div className="flex items-center justify-between border-b border-zinc-200 px-5 py-4 dark:border-zinc-800">
            <div className="flex items-center gap-3">
              <p className="metric-label">Report preview</p>
              {currentReport && <span className="rounded-full bg-zinc-100 px-3 py-1 text-xs font-bold text-zinc-700 dark:bg-zinc-900 dark:text-zinc-300">{currentReport.name}</span>}
            </div>
            <div className="flex items-center gap-3">
              <select value={selectedUnit} onChange={(e) => setSelectedUnit(e.target.value)} className="rounded-md border border-zinc-200 bg-white px-3 py-1.5 text-xs font-semibold dark:border-zinc-800 dark:bg-zinc-900">
                <option value="all">All Units</option>
                <option value="B 1234 KJT">B 1234 KJT</option>
                <option value="B 5678 TGP">B 5678 TGP</option>
                <option value="L 3456 ABC">L 3456 ABC</option>
              </select>
              <input type="text" value={dateRange} onChange={(e) => setDateRange(e.target.value)} className="rounded-md border border-zinc-200 bg-white px-3 py-1.5 text-xs font-semibold dark:border-zinc-800 dark:bg-zinc-900" />
              <button onClick={handleGenerate} disabled={!selectedReport} className="btn btn-primary">
                <Play className="h-3.5 w-3.5" /> Generate
              </button>
            </div>
          </div>

          {generatedData ? (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-zinc-200 bg-zinc-50 text-left text-[11px] font-bold uppercase text-zinc-500 dark:border-zinc-800 dark:bg-zinc-900">
                    <th className="px-4 py-3">Unit</th>
                    <th className="px-4 py-3">Driver</th>
                    <th className="px-4 py-3">Metric 1</th>
                    <th className="px-4 py-3">Metric 2</th>
                    <th className="px-4 py-3">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {generatedData.map((row, i) => (
                    <tr key={i} className="border-b border-zinc-100 last:border-0 dark:border-zinc-800">
                      <td className="px-4 py-3 font-bold text-zinc-900 dark:text-white">{row[0]}</td>
                      <td className="px-4 py-3 font-semibold text-zinc-700 dark:text-zinc-300">{row[1]}</td>
                      <td className="px-4 py-3 font-semibold text-zinc-700 dark:text-zinc-300">{row[2]}</td>
                      <td className="px-4 py-3 font-semibold text-zinc-700 dark:text-zinc-300">{row[3]}</td>
                      <td className="px-4 py-3">
                        <span className={`rounded-full px-2.5 py-1 text-xs font-bold ${row[4] === "Ready" || row[4] === "Normal" ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-900/20 dark:text-emerald-300" : row[4] === "Review" ? "bg-amber-50 text-amber-700 dark:bg-amber-900/20 dark:text-amber-300" : "bg-red-50 text-red-700 dark:bg-red-900/20 dark:text-red-300"}`}>{row[4]}</span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-16 text-zinc-400 dark:text-zinc-600">
              <FileText className="h-10 w-10 mb-3 opacity-30" />
              <p className="text-sm font-semibold">{selectedReport ? "Klik Generate untuk melihat preview" : "Pilih jenis report terlebih dahulu"}</p>
            </div>
          )}
        </section>

        <aside className="space-y-5">
          <div className="card p-5">
            <p className="metric-label">Report queue</p>
            <div className="mt-4 space-y-2">
              {queueRows.map((row) => (
                <div key={`${row[0]}-${row[1]}`} className="flex items-center justify-between rounded-md border border-zinc-100 p-3 dark:border-zinc-800">
                  <div>
                    <p className="font-bold text-zinc-900 dark:text-white">{row[0]}</p>
                    <p className="text-xs font-semibold text-zinc-500">{row[1]}</p>
                  </div>
                  <span className={`rounded-full px-2.5 py-1 text-[10px] font-bold ${row[4] === "Ready" ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-900/20 dark:text-emerald-300" : "bg-amber-50 text-amber-700 dark:bg-amber-900/20 dark:text-amber-300"}`}>{row[4]}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-md border border-red-200 bg-red-50 p-5 text-red-800 dark:border-red-900 dark:bg-red-900/20 dark:text-red-200">
            <ShieldAlert className="h-5 w-5" />
            <p className="mt-3 text-2xl font-bold">3</p>
            <p className="text-xs font-semibold opacity-80">reports need review before dispatch close.</p>
          </div>

          <div className="card p-5">
            <p className="metric-label">Supervisor Review</p>
            <div className="mt-4 space-y-3">
              <div className="rounded-md bg-zinc-900 p-4 text-white dark:bg-white dark:text-zinc-900">
                <BarChart3 className="h-5 w-5" />
                <p className="mt-3 text-2xl font-bold">87%</p>
                <p className="text-xs font-semibold opacity-70">On-time delivery rate</p>
              </div>
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}
