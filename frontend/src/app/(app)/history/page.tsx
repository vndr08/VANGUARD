"use client";

import { useState } from "react";
import { Calendar, Clock, Download, MapPin, Route, Truck } from "lucide-react";
import { useToast } from "@/components/ui/Toast";

const tripHistory = [
  { id: 1, vehicle: "B 1234 KJT", driver: "Ahmad Sudirman", from: "Warehouse Cikarang", to: "PT Unilever, Jababeka", distance: 42.5, duration: "1h 15m", date: "30 May 2026", startTime: "06:30", endTime: "07:45", status: "completed", avgSpeed: 34, maxSpeed: 72, fuelUsed: 12.3 },
  { id: 2, vehicle: "B 5678 TGP", driver: "Budi Santoso", from: "Gudang Sunter, Jakarta", to: "Pelabuhan Tanjung Priok", distance: 18.2, duration: "45m", date: "30 May 2026", startTime: "07:00", endTime: "07:45", status: "completed", avgSpeed: 24, maxSpeed: 55, fuelUsed: 5.8 },
  { id: 3, vehicle: "L 3456 ABC", driver: "Dedi Kurniawan", from: "Terminal Osowilangun, Surabaya", to: "Gudang Rungkut", distance: 28.7, duration: "55m", date: "30 May 2026", startTime: "05:45", endTime: "06:40", status: "completed", avgSpeed: 31, maxSpeed: 68, fuelUsed: 8.9 },
  { id: 4, vehicle: "H 2345 GHI", driver: "Fajar Ramadhan", from: "Kawasan Industri Candi, Semarang", to: "Pelabuhan Tanjung Emas", distance: 15.3, duration: "35m", date: "30 May 2026", startTime: "08:00", endTime: "08:35", status: "completed", avgSpeed: 26, maxSpeed: 50, fuelUsed: 4.2 },
  { id: 5, vehicle: "B 9012 XYZ", driver: "Cahyo Wibowo", from: "Gudang Cibitung", to: "Warehouse MM2100, Bekasi", distance: 35.1, duration: "1h 05m", date: "29 May 2026", startTime: "14:20", endTime: "15:25", status: "completed", avgSpeed: 32, maxSpeed: 65, fuelUsed: 10.1 },
  { id: 6, vehicle: "B 1357 MNO", driver: "Hendra Wijaya", from: "Depo Cakung, Jakarta", to: "Kawasan Industri Pulogadung", distance: 12.8, duration: "30m", date: "29 May 2026", startTime: "10:00", endTime: "10:30", status: "completed", avgSpeed: 25, maxSpeed: 48, fuelUsed: 3.6 },
  { id: 7, vehicle: "B 7788 BCD", driver: "Muhammad Rizki", from: "Kantor Pusat, Sudirman", to: "Warehouse Cikarang", distance: 52.3, duration: "1h 30m", date: "29 May 2026", startTime: "08:30", endTime: "10:00", status: "completed", avgSpeed: 35, maxSpeed: 82, fuelUsed: 14.7 },
  { id: 8, vehicle: "D 6789 JKL", driver: "Gunawan Hadi", from: "Gudang Gedebage, Bandung", to: "Pasar Induk Caringin", distance: 8.5, duration: "25m", date: "29 May 2026", startTime: "04:30", endTime: "04:55", status: "completed", avgSpeed: 20, maxSpeed: 45, fuelUsed: 2.4 },
];

export default function HistoryPage() {
  const { addToast } = useToast();
  const [activeTab, setActiveTab] = useState("timeline");
  const [selectedUnit, setSelectedUnit] = useState("all");
  const [dateRange, setDateRange] = useState("May 29 - May 30");

  const tabs = [
    { key: "timeline", label: "Timeline" },
    { key: "detail", label: "Detail" },
    { key: "engine", label: "Engine" },
    { key: "driving", label: "Driving" },
    { key: "idle", label: "Idle" },
    { key: "stop", label: "Stop" },
    { key: "speeding", label: "Speeding" },
    { key: "events", label: "Events" },
    { key: "reverse", label: "Reverse" },
    { key: "geofence", label: "Geofence" },
  ];

  const filteredTrips = tripHistory.filter(t => selectedUnit === "all" || t.vehicle === selectedUnit);

  const detailRows = filteredTrips.map(t => ({
    id: t.id, vehicle: t.vehicle, driver: t.driver, date: t.date, startTime: t.startTime, endTime: t.endTime, distance: t.distance, duration: t.duration, avgSpeed: t.avgSpeed, maxSpeed: t.maxSpeed, fuelUsed: t.fuelUsed,
  }));

  function handleExport() {
    addToast("info", "Exporting trip history...");
  }

  const activeTabContent = () => {
    if (activeTab === "timeline") {
      return (
        <div className="p-5 space-y-2.5">
          {filteredTrips.map((trip) => (
            <div key={trip.id} className="card p-4 hover:shadow-md transition-all cursor-pointer">
              <div className="flex items-start gap-4">
                <div className="flex flex-col items-center gap-0.5 pt-1 shrink-0">
                  <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 ring-2 ring-emerald-500/20" />
                  <div className="w-0.5 h-10 bg-gradient-to-b from-emerald-500/40 to-zinc-400 dark:to-zinc-600" />
                  <div className="w-2.5 h-2.5 rounded-full bg-zinc-900 dark:bg-zinc-400 ring-2 ring-zinc-200 dark:ring-zinc-700" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-[13px] font-semibold text-zinc-800 dark:text-white">{trip.vehicle}</span>
                    <span className="text-[10px] text-zinc-400 dark:text-zinc-600">·</span>
                    <span className="text-[11px] text-zinc-500 dark:text-zinc-400">{trip.driver}</span>
                  </div>
                  <div className="space-y-1.5">
                    <div className="flex items-center gap-2">
                      <span className="text-[11px] text-emerald-600 dark:text-emerald-400 w-10 shrink-0 font-medium">{trip.startTime}</span>
                      <p className="text-[12px] text-zinc-700 dark:text-zinc-200">{trip.from}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-[11px] text-zinc-500 dark:text-zinc-400 w-10 shrink-0 font-medium">{trip.endTime}</span>
                      <p className="text-[12px] text-zinc-700 dark:text-zinc-200">{trip.to}</p>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-4 text-[11px] shrink-0">
                  <div className="text-center px-3">
                    <p className="text-zinc-800 dark:text-white font-semibold tabular-nums">{trip.distance} km</p>
                    <p className="text-zinc-400 dark:text-zinc-500 text-[10px]">Distance</p>
                  </div>
                  <div className="text-center px-3 border-l border-zinc-100 dark:border-zinc-800">
                    <p className="text-zinc-800 dark:text-white font-semibold tabular-nums">{trip.duration}</p>
                    <p className="text-zinc-400 dark:text-zinc-500 text-[10px]">Duration</p>
                  </div>
                  <div className="text-center px-3 border-l border-zinc-100 dark:border-zinc-800">
                    <p className="text-zinc-800 dark:text-white font-semibold tabular-nums">{trip.avgSpeed} km/h</p>
                    <p className="text-zinc-400 dark:text-zinc-500 text-[10px]">Avg Speed</p>
                  </div>
                  <div className="text-center px-3 border-l border-zinc-100 dark:border-zinc-800">
                    <p className="text-zinc-800 dark:text-white font-semibold tabular-nums">{trip.fuelUsed} L</p>
                    <p className="text-zinc-400 dark:text-zinc-500 text-[10px]">Fuel</p>
                  </div>
                  <div className="text-center px-3 border-l border-zinc-100 dark:border-zinc-800">
                    <p className="text-[10px] text-zinc-500 dark:text-zinc-400">
                      <Calendar className="w-3 h-3 inline mr-1" />
                      {trip.date}
                    </p>
                    <span className="text-[9px] bg-emerald-50 dark:bg-emerald-500/15 text-emerald-700 dark:text-emerald-400 px-2 py-0.5 rounded-full mt-1 inline-block font-medium">Completed</span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      );
    }

    if (activeTab === "detail") {
      return (
        <div className="overflow-auto">
          <table className="w-full text-[12px] border-collapse">
            <thead className="sticky top-0 z-10">
              <tr className="bg-zinc-50 dark:bg-zinc-900 border-b border-zinc-200 dark:border-zinc-800">
                <th className="text-left px-4 py-2.5 font-semibold text-zinc-500 dark:text-zinc-400 w-10">#</th>
                <th className="text-left px-4 py-2.5 font-semibold text-zinc-500 dark:text-zinc-400">UNIT</th>
                <th className="text-left px-4 py-2.5 font-semibold text-zinc-500 dark:text-zinc-400">DRIVER</th>
                <th className="text-left px-4 py-2.5 font-semibold text-zinc-500 dark:text-zinc-400">DATE</th>
                <th className="text-left px-4 py-2.5 font-semibold text-zinc-500 dark:text-zinc-400">START</th>
                <th className="text-left px-4 py-2.5 font-semibold text-zinc-500 dark:text-zinc-400">END</th>
                <th className="text-right px-4 py-2.5 font-semibold text-zinc-500 dark:text-zinc-400">DISTANCE</th>
                <th className="text-right px-4 py-2.5 font-semibold text-zinc-500 dark:text-zinc-400">AVG SPEED</th>
                <th className="text-right px-4 py-2.5 font-semibold text-zinc-500 dark:text-zinc-400">MAX SPEED</th>
                <th className="text-right px-4 py-2.5 font-semibold text-zinc-500 dark:text-zinc-400">FUEL</th>
              </tr>
            </thead>
            <tbody>
              {detailRows.map((r, i) => (
                <tr key={r.id} className="border-b border-zinc-100/50 dark:border-zinc-800/40 hover:bg-zinc-50/60 dark:hover:bg-zinc-800/30 transition-colors">
                  <td className="px-4 py-2.5 text-zinc-400 dark:text-zinc-500">{i + 1}</td>
                  <td className="px-4 py-2.5 font-semibold text-zinc-800 dark:text-white">{r.vehicle}</td>
                  <td className="px-4 py-2.5 text-zinc-600 dark:text-zinc-300">{r.driver}</td>
                  <td className="px-4 py-2.5 text-zinc-500 dark:text-zinc-400">{r.date}</td>
                  <td className="px-4 py-2.5 text-emerald-600 dark:text-emerald-400 font-medium">{r.startTime}</td>
                  <td className="px-4 py-2.5 text-zinc-500 dark:text-zinc-400 font-medium">{r.endTime}</td>
                  <td className="px-4 py-2.5 text-right tabular-nums text-zinc-700 dark:text-zinc-200">{r.distance} km</td>
                  <td className="px-4 py-2.5 text-right tabular-nums text-zinc-700 dark:text-zinc-200">{r.avgSpeed} km/h</td>
                  <td className="px-4 py-2.5 text-right tabular-nums text-zinc-700 dark:text-zinc-200">{r.maxSpeed} km/h</td>
                  <td className="px-4 py-2.5 text-right tabular-nums text-zinc-700 dark:text-zinc-200">{r.fuelUsed} L</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      );
    }

    return (
      <div className="flex flex-col items-center justify-center h-64 text-zinc-300 dark:text-zinc-600">
        <Route className="w-10 h-10 mb-3 opacity-30" />
        <p className="text-sm font-medium text-zinc-400 dark:text-zinc-500">Pilih unit dan rentang tanggal untuk melihat data {activeTab}</p>
        <p className="text-xs text-zinc-400 dark:text-zinc-600 mt-1">Gunakan filter di atas untuk memilih kendaraan</p>
      </div>
    );
  };

  return (
    <div className="flex flex-col h-[calc(100vh-4rem)]">
      {/* Top Toolbar */}
      <div className="flex items-center gap-2 px-4 py-2 border-b border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 shrink-0">
        <span className="text-xs font-semibold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider mr-1">History</span>
        <div className="w-px h-5 bg-zinc-200 dark:bg-zinc-800" />

        <select
          value={selectedUnit}
          onChange={(e) => setSelectedUnit(e.target.value)}
          className="text-xs bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-800 rounded-lg px-2 py-1.5 text-zinc-700 dark:text-zinc-200 focus:outline-none focus:border-zinc-400"
        >
          <option value="all">All Units</option>
          {tripHistory.map(t => t.vehicle).filter((v, i, arr) => arr.indexOf(v) === i).map(v => <option key={v} value={v}>{v}</option>)}
        </select>

        <input
          type="text"
          value={dateRange}
          onChange={(e) => setDateRange(e.target.value)}
          className="text-xs bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-800 rounded-lg px-2 py-1.5 text-zinc-700 dark:text-zinc-200 focus:outline-none w-36"
        />

        <div className="flex items-center gap-1 ml-2">
          <button className="p-1.5 rounded-md bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-300">
            <Clock className="w-4 h-4" />
          </button>
          <button className="px-3 py-1.5 rounded-md bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 text-xs font-bold">1x</button>
          <button className="px-2 py-1.5 rounded-md bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-300 text-xs font-bold">2x</button>
          <button className="px-2 py-1.5 rounded-md bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-300 text-xs font-bold">4x</button>
        </div>

        <div className="ml-auto flex items-center gap-2">
          <button onClick={handleExport} className="flex items-center gap-1.5 text-[11px] text-zinc-500 dark:text-zinc-400 hover:text-zinc-800 dark:hover:text-white bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-800 rounded-lg px-3 py-1.5 transition-colors">
            <Download className="w-3.5 h-3.5" /> Export CSV
          </button>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="flex items-center border-b border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 shrink-0 overflow-x-auto">
        {tabs.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`px-5 py-2.5 text-[13px] font-medium whitespace-nowrap border-b-2 transition-colors ${
              activeTab === tab.key
                ? "border-zinc-900 dark:border-white text-zinc-900 dark:text-white"
                : "border-transparent text-zinc-400 dark:text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Content */}
      <div className="flex-1 overflow-auto">
        {activeTabContent()}
      </div>
    </div>
  );
}
