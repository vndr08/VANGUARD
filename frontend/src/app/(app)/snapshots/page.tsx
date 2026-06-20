"use client";

import { useState, useMemo } from "react";
import { Camera, Download, Eye, MapPin, Search, X } from "lucide-react";
import { useToast } from "@/components/ui/Toast";

interface Snapshot {
  id: string; unit: string; driver: string; place: string; time: string; date: string; event: string; tone: string;
}

const snapshots: Snapshot[] = [
  { id: "1", unit: "B 1234 KJT", driver: "Ahmad Sudirman", place: "Jababeka Gate 2", time: "09:42", date: "12 Jun 2026", event: "Arrival proof", tone: "bg-emerald-500" },
  { id: "2", unit: "B 5678 TGP", driver: "Budi Santoso", place: "Tol Cikampek KM32", time: "09:28", date: "12 Jun 2026", event: "Speed alert", tone: "bg-red-500" },
  { id: "3", unit: "L 1122 STU", driver: "Joko Susilo", place: "SPBU Cikampek", time: "08:51", date: "12 Jun 2026", event: "Fuel stop", tone: "bg-amber-500" },
  { id: "4", unit: "H 2345 GHI", driver: "Fajar Ramadhan", place: "Rest Area KM57", time: "08:35", date: "12 Jun 2026", event: "Engine off", tone: "bg-zinc-500" },
  { id: "5", unit: "B 7788 BCD", driver: "Muhammad Rizki", place: "Bekasi Timur", time: "07:58", date: "12 Jun 2026", event: "Customer gate", tone: "bg-emerald-500" },
  { id: "6", unit: "D 6789 JKL", driver: "Gunawan Hadi", place: "Gedebage Bandung", time: "07:12", date: "12 Jun 2026", event: "Geofence entry", tone: "bg-zinc-500" },
  { id: "7", unit: "L 3456 ABC", driver: "Dedi Kurniawan", place: "Rungkut Industrial", time: "06:45", date: "12 Jun 2026", event: "Arrival proof", tone: "bg-emerald-500" },
  { id: "8", unit: "B 9012 XYZ", driver: "Cahyo Wibowo", place: "Tanjung Priok Port", time: "06:22", date: "12 Jun 2026", event: "Geofence entry", tone: "bg-zinc-500" },
];

const eventTypes = ["All", "Arrival proof", "Speed alert", "Fuel stop", "Engine off", "Customer gate", "Geofence entry"];

export default function SnapshotsPage() {
  const { addToast } = useToast();
  const [search, setSearch] = useState("");
  const [eventFilter, setEventFilter] = useState("All");
  const [selectedSnapshot, setSelectedSnapshot] = useState<Snapshot | null>(null);

  const filtered = useMemo(() => {
    return snapshots.filter((s) => {
      const matchSearch = !search || s.unit.toLowerCase().includes(search.toLowerCase()) || s.place.toLowerCase().includes(search.toLowerCase()) || s.driver.toLowerCase().includes(search.toLowerCase());
      const matchEvent = eventFilter === "All" || s.event === eventFilter;
      return matchSearch && matchEvent;
    });
  }, [search, eventFilter]);

  function handleReview(snapshot: Snapshot) {
    setSelectedSnapshot(snapshot);
  }

  function handleDownload() {
    addToast("info", "Downloading snapshot...");
  }

  function handleCloseModal() {
    setSelectedSnapshot(null);
  }

  return (
    <div className="min-h-full bg-zinc-50 dark:bg-zinc-950">
      <div className="border-b border-zinc-200 bg-white px-7 py-6 dark:border-zinc-800 dark:bg-zinc-900">
        <p className="metric-label">Camera evidence</p>
        <h1 className="mt-2 text-3xl font-bold text-zinc-900 dark:text-white">Camera Snapshot</h1>
        <p className="mt-2 max-w-2xl text-sm leading-6 text-zinc-600 dark:text-zinc-400">Bukti visual dari event penting: arrival, speeding, stop, fuel, dan geofence.</p>

        <div className="mt-5 flex flex-wrap gap-3">
          <div className="relative w-full max-w-sm">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-400" />
            <input type="text" value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search unit or location" className="w-full rounded-lg border border-zinc-200 bg-white py-2.5 pl-9 pr-3 text-sm dark:border-zinc-800 dark:bg-zinc-900 dark:text-white" />
          </div>
          <select value={eventFilter} onChange={(e) => setEventFilter(e.target.value)} className="rounded-lg border border-zinc-200 bg-white px-4 py-2.5 text-sm dark:border-zinc-800 dark:bg-zinc-900">
            {eventTypes.map((type) => <option key={type} value={type}>{type}</option>)}
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-5 px-7 py-6 md:grid-cols-2 xl:grid-cols-3">
        {filtered.map((item) => (
          <div key={item.id} className="card overflow-hidden">
            <div className="relative h-44 bg-gradient-to-br from-zinc-100 to-zinc-200 dark:from-zinc-800 dark:to-zinc-900">
              <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent" />
              <div className="absolute left-4 top-4 rounded-md bg-white/90 px-3 py-1.5 text-xs font-bold text-zinc-800 shadow-sm dark:bg-zinc-900/90 dark:text-white">{item.time}</div>
              <div className="absolute inset-x-0 bottom-0 flex items-end justify-between bg-gradient-to-t from-black/50 to-transparent p-4 text-white">
                <div>
                  <p className="text-lg font-bold">{item.unit}</p>
                  <p className="text-xs font-semibold opacity-80">{item.event}</p>
                </div>
                <Camera className="h-6 w-6" />
              </div>
            </div>
            <div className="p-4">
              <div className="flex items-center gap-2 text-sm font-semibold text-zinc-600 dark:text-zinc-300">
                <span className={`h-2 w-2 rounded-full ${item.tone}`} />
                <MapPin className="h-4 w-4" /> {item.place}
              </div>
              <p className="mt-2 text-xs font-semibold text-zinc-500">{item.driver} - {item.date}</p>
              <div className="mt-4 flex gap-2">
                <button onClick={() => handleReview(item)} className="btn btn-primary flex-1">
                  <Eye className="h-4 w-4" /> Review
                </button>
                <button onClick={handleDownload} className="btn btn-secondary">
                  <Download className="h-4 w-4" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {filtered.length === 0 && (
        <div className="flex flex-col items-center justify-center py-16 text-zinc-400 dark:text-zinc-600">
          <Camera className="h-10 w-10 mb-3 opacity-30" />
          <p className="text-sm font-semibold">No snapshots found</p>
        </div>
      )}

      {selectedSnapshot && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-2xl rounded-lg bg-white dark:bg-zinc-900 shadow-xl">
            <div className="flex items-center justify-between border-b border-zinc-200 p-5 dark:border-zinc-800">
              <div>
                <p className="metric-label">Snapshot review</p>
                <h2 className="mt-1 text-xl font-bold text-zinc-900 dark:text-white">{selectedSnapshot.unit} - {selectedSnapshot.event}</h2>
              </div>
              <button onClick={handleCloseModal} className="rounded-lg p-2 text-zinc-500 hover:bg-zinc-100 dark:hover:bg-zinc-800"><X className="h-5 w-5" /></button>
            </div>
            <div className="p-5">
              <div className="relative mb-5 h-80 rounded-lg bg-zinc-100 dark:bg-zinc-800 overflow-hidden flex items-center justify-center">
                <Camera className="h-16 w-16 text-zinc-400 opacity-50" />
                <div className="absolute left-4 top-4 rounded-md bg-black/60 px-3 py-1.5 text-xs font-bold text-white">{selectedSnapshot.date} {selectedSnapshot.time}</div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <p className="text-[10px] font-bold uppercase text-zinc-500">Unit</p>
                  <p className="font-semibold text-zinc-900 dark:text-white">{selectedSnapshot.unit}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-[10px] font-bold uppercase text-zinc-500">Driver</p>
                  <p className="font-semibold text-zinc-900 dark:text-white">{selectedSnapshot.driver}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-[10px] font-bold uppercase text-zinc-500">Event</p>
                  <p className="font-semibold text-zinc-900 dark:text-white">{selectedSnapshot.event}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-[10px] font-bold uppercase text-zinc-500">Location</p>
                  <p className="font-semibold text-zinc-900 dark:text-white">{selectedSnapshot.place}</p>
                </div>
              </div>
              <div className="mt-5 flex gap-3">
                <button onClick={handleDownload} className="btn btn-primary flex-1">
                  <Download className="mr-2 h-4 w-4" /> Download Full Resolution
                </button>
                <button onClick={handleCloseModal} className="btn btn-secondary">Close</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
