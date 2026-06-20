"use client";

import { useState, useMemo } from "react";
import { Copy, Crosshair, History, MapPin, Navigation, Radio, Search, Truck } from "lucide-react";
import { MOCK_VEHICLES } from "@/lib/mock-data";
import { useToast } from "@/components/ui/Toast";

const units = MOCK_VEHICLES.slice(0, 10);

export default function LocatePage() {
  const { addToast } = useToast();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedUnit, setSelectedUnit] = useState<typeof units[0] | null>(units[0]);
  const [recentSearches] = useState(["B 1234 KJT", "L 3456 ABC", "H 2345 GHI"]);

  const filtered = useMemo(() => {
    if (!searchQuery.trim()) return units;
    const q = searchQuery.toLowerCase();
    return units.filter((u) => u.plate_number.toLowerCase().includes(q) || u.driver_name?.toLowerCase().includes(q) || u.brand.toLowerCase().includes(q));
  }, [searchQuery]);

  function handleSelectUnit(unit: typeof units[0]) {
    setSelectedUnit(unit);
    addToast("info", `Located ${unit.plate_number}`);
  }

  function handleCopyCoordinates() {
    if (selectedUnit) {
      navigator.clipboard.writeText(`${selectedUnit.latitude}, ${selectedUnit.longitude}`);
      addToast("success", "Coordinates copied to clipboard");
    }
  }

  function handleOpenRealtime() {
    addToast("info", "Opening Realtime Monitor...");
  }

  function handleOpenHistory() {
    addToast("info", "Opening History for this unit...");
  }

  return (
    <div className="grid min-h-full grid-cols-1 bg-zinc-50 dark:bg-zinc-950 xl:grid-cols-[420px_1fr]">
      <aside className="border-r border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-900">
        <div className="p-6">
          <p className="metric-label">Quick locator</p>
          <h1 className="mt-2 text-3xl font-bold text-zinc-900 dark:text-white">Locate Unit</h1>
          <p className="mt-2 text-sm leading-6 text-zinc-600 dark:text-zinc-400">Cari unit cepat untuk melihat posisi terakhir, alamat estimasi, dan status GPS.</p>

          <div className="relative mt-5">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-400" />
            <input type="text" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} placeholder="Find plate / driver / IMEI" className="w-full rounded-lg border border-zinc-200 bg-white py-2.5 pl-9 pr-3 text-sm font-semibold dark:border-zinc-800 dark:bg-zinc-900 dark:text-white" />
          </div>

          {recentSearches.length > 0 && !searchQuery && (
            <div className="mt-4">
              <p className="text-xs font-bold uppercase text-zinc-500">Recent searches</p>
              <div className="mt-2 flex flex-wrap gap-2">
                {recentSearches.map((search) => (
                  <button key={search} onClick={() => setSearchQuery(search)} className="flex items-center gap-1.5 rounded-full border border-zinc-200 bg-zinc-50 px-3 py-1.5 text-xs font-semibold text-zinc-600 hover:bg-zinc-100 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-300">
                    <History className="h-3 w-3" />{search}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="border-t border-zinc-200 px-6 py-4 dark:border-zinc-800">
          <p className="text-xs font-bold uppercase text-zinc-500">{filtered.length} units found</p>
        </div>

        <div className="px-6 pb-6">
          <div className="space-y-2">
            {filtered.map((unit) => {
              const isSelected = selectedUnit?.id === unit.id;
              return (
                <button key={unit.id} onClick={() => handleSelectUnit(unit)} className={`w-full rounded-md border p-3 text-left transition-all ${isSelected ? "border-zinc-900 bg-zinc-900 text-white dark:border-white dark:bg-white dark:text-zinc-900" : "border-zinc-200 bg-white hover:bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-900 dark:hover:bg-zinc-800"}`}>
                  <div className="flex items-center justify-between">
                    <p className={`font-bold ${isSelected ? "" : "text-zinc-900 dark:text-white"}`}>{unit.plate_number}</p>
                    <span className={`text-xs font-bold ${isSelected ? "text-white/70 dark:text-zinc-600" : "text-zinc-500"}`}>{unit.speed} km/h</span>
                  </div>
                  <p className={`mt-1 text-xs font-semibold ${isSelected ? "text-white/70 dark:text-zinc-500" : "text-zinc-500"}`}>{unit.driver_name || "Unassigned"} - {unit.brand} {unit.model}</p>
                  <div className="mt-2 flex items-center gap-3 text-[10px] font-semibold">
                    <span className={`flex items-center gap-1 ${isSelected ? "text-white/60 dark:text-zinc-400" : "text-zinc-400"}`}><Radio className="h-3 w-3" />{unit.status}</span>
                    <span className={`flex items-center gap-1 ${isSelected ? "text-white/60 dark:text-zinc-400" : "text-zinc-400"}`}><Navigation className="h-3 w-3" />{Math.round(unit.heading)}°</span>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      </aside>

      <main className="relative min-h-[calc(100vh-4rem)] overflow-hidden">
        <div className="absolute inset-0 bg-zinc-100 dark:bg-zinc-900">
          <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(0,0,0,.05)_1px,transparent_1px),linear-gradient(rgba(0,0,0,.05)_1px,transparent_1px)] bg-[size:44px_44px]" />
          {selectedUnit && (
            <>
              <div className="absolute z-10 h-24 w-24 -translate-x-1/2 -translate-y-1/2 rounded-full border-4 border-amber-500 bg-amber-500/10" style={{ left: "30%", top: "40%", transform: "translate(-50%, -50%)" }} />
              <div className="absolute z-20 flex h-12 w-12 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full bg-amber-500 shadow-lg" style={{ left: "30%", top: "40%", transform: "translate(-50%, -50%)" }}>
                <Truck className="h-6 w-6 text-white" />
              </div>
            </>
          )}
        </div>

        <div className="absolute left-8 top-8 rounded-md border border-zinc-200 bg-white/95 p-4 shadow-sm backdrop-blur dark:border-zinc-800 dark:bg-zinc-900/95">
          <div className="flex items-center gap-3">
            <Crosshair className="h-5 w-5 text-zinc-900 dark:text-white" />
            <div>
              <p className="font-bold text-zinc-900 dark:text-white">{selectedUnit ? `${selectedUnit.plate_number} located` : "No unit selected"}</p>
              <p className="text-xs font-semibold text-zinc-500">{selectedUnit ? `${selectedUnit.brand} ${selectedUnit.model}` : "Select a unit from the list"}</p>
            </div>
          </div>
        </div>

        {selectedUnit && (
          <div className="absolute bottom-8 left-8 right-8">
            <div className="flex gap-3">
              <div className="flex-1 rounded-md border border-zinc-200 bg-white p-4 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xl font-bold text-zinc-900 dark:text-white">{selectedUnit.plate_number}</p>
                    <p className="text-sm font-semibold text-zinc-500">{selectedUnit.driver_name || "No driver"}</p>
                  </div>
                  <span className={`rounded-full border px-3 py-1 text-xs font-bold ${selectedUnit.status === "driving" ? "border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-900 dark:bg-emerald-900/20 dark:text-emerald-300" : selectedUnit.status === "idle" ? "border-amber-200 bg-amber-50 text-amber-700 dark:border-amber-900 dark:bg-amber-900/20 dark:text-amber-300" : "border-zinc-200 bg-zinc-50 text-zinc-700 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-300"}`}>{selectedUnit.status}</span>
                </div>
              </div>

              <div className="grid w-[360px] grid-cols-3 gap-3">
                <div className="rounded-md border border-zinc-200 bg-white p-3 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
                  <Radio className="h-4 w-4 text-zinc-500" />
                  <p className="mt-2 text-xs font-bold uppercase text-zinc-500">GPS</p>
                  <p className="mt-1 font-bold text-zinc-900 dark:text-white">Online</p>
                </div>
                <div className="rounded-md border border-zinc-200 bg-white p-3 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
                  <Navigation className="h-4 w-4 text-zinc-500" />
                  <p className="mt-2 text-xs font-bold uppercase text-zinc-500">Heading</p>
                  <p className="mt-1 font-bold text-zinc-900 dark:text-white">{Math.round(selectedUnit.heading)}°</p>
                </div>
                <div className="rounded-md border border-zinc-200 bg-white p-3 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
                  <MapPin className="h-4 w-4 text-zinc-500" />
                  <p className="mt-2 text-xs font-bold uppercase text-zinc-500">Address</p>
                  <p className="mt-1 truncate text-sm font-semibold text-zinc-700 dark:text-zinc-300">Cikarang Area</p>
                </div>
              </div>

              <div className="flex flex-col gap-2">
                <button onClick={handleOpenRealtime} className="btn btn-primary"><Crosshair className="h-4 w-4" /> Open Monitor</button>
                <button onClick={handleOpenHistory} className="btn btn-secondary"><History className="h-4 w-4" /> History</button>
                <button onClick={handleCopyCoordinates} className="btn btn-secondary"><Copy className="h-4 w-4" /> Copy Coords</button>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
