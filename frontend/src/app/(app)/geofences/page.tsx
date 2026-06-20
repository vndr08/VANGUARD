"use client";

import { useState } from "react";
import { AlertTriangle, Edit, Eye, EyeOff, MapPinned, Plus, RadioTower, Trash2, Warehouse, X } from "lucide-react";
import { useToast } from "@/components/ui/Toast";

interface Geofence {
  id: string; name: string; type: string; units: number; radius: string; alert: string; visible: boolean; coordinates: { lat: number; lng: number };
}

const zones: Geofence[] = [
  { id: "1", name: "Warehouse Cikarang", type: "Depot", units: 7, radius: "650 m", alert: "2 dwell alerts", visible: true, coordinates: { lat: -6.4523, lng: 107.1234 } },
  { id: "2", name: "Jababeka Customer Area", type: "Customer", units: 4, radius: "420 m", alert: "Normal", visible: true, coordinates: { lat: -6.4256, lng: 107.1567 } },
  { id: "3", name: "Tanjung Priok Gate 4", type: "Port", units: 3, radius: "900 m", alert: "1 queue risk", visible: true, coordinates: { lat: -6.0989, lng: 106.8901 } },
  { id: "4", name: "Rest Area KM57", type: "Checkpoint", units: 2, radius: "300 m", alert: "Normal", visible: false, coordinates: { lat: -6.7234, lng: 108.4567 } },
  { id: "5", name: "MM2100 Industrial", type: "Customer", units: 5, radius: "550 m", alert: "Normal", visible: true, coordinates: { lat: -6.3823, lng: 107.0890 } },
  { id: "6", name: "Sentul City Depot", type: "Depot", units: 3, radius: "400 m", alert: "Normal", visible: true, coordinates: { lat: -6.5678, lng: 106.8234 } },
];

const typeColors: Record<string, string> = {
  Depot: "bg-emerald-50 text-emerald-700 dark:bg-emerald-900/20 dark:text-emerald-300",
  Customer: "bg-blue-50 text-blue-700 dark:bg-blue-900/20 dark:text-blue-300",
  Port: "bg-purple-50 text-purple-700 dark:bg-purple-900/20 dark:text-purple-300",
  Checkpoint: "bg-amber-50 text-amber-700 dark:bg-amber-900/20 dark:text-amber-300",
};

const typeFilter = ["All", "Depot", "Customer", "Port", "Checkpoint"];

export default function GeofencesPage() {
  const { addToast } = useToast();
  const [geofences, setGeofences] = useState(zones);
  const [selectedZone, setSelectedZone] = useState<Geofence | null>(null);
  const [typeFilterValue, setTypeFilterValue] = useState("All");

  const filtered = geofences.filter((z) => typeFilterValue === "All" || z.type === typeFilterValue);

  function handleZoneClick(zone: Geofence) {
    setSelectedZone(zone === selectedZone ? null : zone);
  }

  function handleToggleVisibility(zone: Geofence) {
    setGeofences((prev) => prev.map((z) => (z.id === zone.id ? { ...z, visible: !z.visible } : z)));
    addToast("info", `${zone.name} ${zone.visible ? "hidden" : "shown"} on map`);
  }

  function handleAddZone() {
    addToast("info", "Add geofence form");
  }

  function handleDeleteZone(zone: Geofence) {
    setGeofences((prev) => prev.filter((z) => z.id !== zone.id));
    if (selectedZone?.id === zone.id) setSelectedZone(null);
    addToast("success", `${zone.name} deleted`);
  }

  return (
    <div className="grid min-h-full grid-cols-1 bg-zinc-50 dark:bg-zinc-950 xl:grid-cols-[420px_1fr]">
      <aside className="border-r border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-900">
        <div className="flex items-start justify-between">
          <div>
            <p className="metric-label">Smart geofence</p>
            <h1 className="mt-2 text-3xl font-bold text-zinc-900 dark:text-white">Geofence</h1>
            <p className="mt-2 text-sm leading-6 text-zinc-600 dark:text-zinc-400">Area penting untuk monitoring arrival, departure, dwell time, dan penyimpangan rute.</p>
          </div>
          <button onClick={handleAddZone} className="btn btn-primary"><Plus className="h-4 w-4" /></button>
        </div>

        <div className="mt-5 flex flex-wrap gap-2">
          {typeFilter.map((type) => (
            <button key={type} onClick={() => setTypeFilterValue(type)} className={`rounded-full px-3 py-1.5 text-xs font-bold transition-colors ${typeFilterValue === type ? "bg-zinc-900 text-white dark:bg-white dark:text-zinc-900" : "border border-zinc-200 bg-white text-zinc-600 hover:bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-300"}`}>{type}</button>
          ))}
        </div>

        <div className="mt-5 space-y-3">
          {filtered.map((zone) => (
            <button key={zone.id} onClick={() => handleZoneClick(zone)} className={`w-full rounded-md border p-4 text-left transition-all ${selectedZone?.id === zone.id ? "border-zinc-900 bg-zinc-50 dark:border-white dark:bg-zinc-900" : "border-zinc-200 hover:bg-zinc-50 dark:border-zinc-800 dark:hover:bg-zinc-900"}`}>
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="font-bold text-zinc-900 dark:text-white">{zone.name}</p>
                  <div className="mt-1 flex items-center gap-2">
                    <span className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${typeColors[zone.type]}`}>{zone.type}</span>
                    <span className="text-xs font-semibold text-zinc-500">{zone.radius}</span>
                  </div>
                </div>
                <span className="rounded-full bg-zinc-100 px-2 py-1 text-xs font-bold text-zinc-700 dark:bg-zinc-900 dark:text-zinc-300">{zone.units} units</span>
              </div>
              <div className="mt-3 flex items-center justify-between">
                <p className={`inline-flex items-center gap-2 text-xs font-bold ${zone.alert === "Normal" ? "text-emerald-700 dark:text-emerald-300" : "text-amber-700 dark:text-amber-300"}`}>
                  {zone.alert === "Normal" ? <RadioTower className="h-3.5 w-3.5" /> : <AlertTriangle className="h-3.5 w-3.5" />}{zone.alert}
                </p>
                <div className="flex items-center gap-1">
                  <button onClick={(e) => { e.stopPropagation(); handleToggleVisibility(zone); }} className="rounded p-1 text-zinc-500 hover:bg-zinc-100 dark:hover:bg-zinc-800">{zone.visible ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}</button>
                </div>
              </div>
            </button>
          ))}
        </div>

        {filtered.length === 0 && (
          <div className="mt-10 text-center text-zinc-400 dark:text-zinc-600">
            <MapPinned className="mx-auto h-10 w-10 opacity-30" />
            <p className="mt-2 text-sm font-semibold">No geofences found</p>
          </div>
        )}
      </aside>

      <main className="relative min-h-[calc(100vh-4rem)] overflow-hidden">
        <div className="absolute inset-0 bg-zinc-100 dark:bg-zinc-900">
          <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(0,0,0,.05)_1px,transparent_1px),linear-gradient(rgba(0,0,0,.05)_1px,transparent_1px)] bg-[size:48px_48px]" />
          <div className="absolute left-[20%] top-[30%] h-52 w-52 rounded-full border-4 border-emerald-500/70 bg-emerald-500/10" style={{ transform: "translate(-50%, -50%)" }} />
          <div className="absolute left-[65%] top-[40%] h-44 w-44 rounded-full border-4 border-blue-500/60 bg-blue-500/10" style={{ transform: "translate(-50%, -50%)" }} />
          <div className="absolute left-[45%] top-[70%] h-36 w-36 rounded-full border-4 border-amber-500/50 bg-amber-500/10" style={{ transform: "translate(-50%, -50%)" }} />
        </div>

        <div className="absolute left-8 top-8 rounded-md border border-zinc-200 bg-white/95 p-4 shadow-sm backdrop-blur dark:border-zinc-800 dark:bg-zinc-900/95">
          <div className="flex items-center gap-3">
            <MapPinned className="h-5 w-5 text-zinc-900 dark:text-white" />
            <div>
              <p className="font-bold text-zinc-900 dark:text-white">Geofence map</p>
              <p className="text-xs font-semibold text-zinc-500">{geofences.filter((z) => z.visible).length} zones visible</p>
            </div>
          </div>
        </div>

        <div className="absolute bottom-8 right-8 rounded-md bg-zinc-900 p-5 text-white shadow-sm dark:bg-white dark:text-zinc-900">
          <Warehouse className="h-5 w-5" />
          <p className="mt-3 text-2xl font-bold">{geofences.length}</p>
          <p className="text-xs font-semibold opacity-70">active zones</p>
        </div>

        {selectedZone && (
          <div className="absolute right-8 top-8 w-[380px] rounded-md border border-zinc-200 bg-white p-5 shadow-lg dark:border-zinc-800 dark:bg-zinc-900">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-bold text-zinc-900 dark:text-white">{selectedZone.name}</h3>
              <button onClick={() => setSelectedZone(null)} className="rounded-md p-1 text-zinc-500 hover:bg-zinc-100 dark:hover:bg-zinc-800"><X className="h-5 w-5" /></button>
            </div>
            <div className="mt-4 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <p className="text-[10px] font-bold uppercase text-zinc-500">Type</p>
                  <span className={`inline-block rounded-full px-2.5 py-1 text-xs font-bold ${typeColors[selectedZone.type]}`}>{selectedZone.type}</span>
                </div>
                <div className="space-y-1">
                  <p className="text-[10px] font-bold uppercase text-zinc-500">Radius</p>
                  <p className="font-semibold text-zinc-900 dark:text-white">{selectedZone.radius}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-[10px] font-bold uppercase text-zinc-500">Units inside</p>
                  <p className="font-semibold text-zinc-900 dark:text-white">{selectedZone.units}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-[10px] font-bold uppercase text-zinc-500">Status</p>
                  <p className={`font-semibold ${selectedZone.alert === "Normal" ? "text-emerald-700 dark:text-emerald-300" : "text-amber-700 dark:text-amber-300"}`}>{selectedZone.alert}</p>
                </div>
              </div>
              <div className="space-y-1">
                <p className="text-[10px] font-bold uppercase text-zinc-500">Coordinates</p>
                <p className="font-mono text-sm text-zinc-700 dark:text-zinc-300">{selectedZone.coordinates.lat.toFixed(6)}, {selectedZone.coordinates.lng.toFixed(6)}</p>
              </div>
              <div className="flex gap-2 pt-2">
                <button onClick={() => addToast("info", "Editing geofence...")} className="btn btn-primary flex-1"><Edit className="mr-2 h-4 w-4" /> Edit</button>
                <button onClick={() => handleToggleVisibility(selectedZone)} className="btn btn-secondary">{selectedZone.visible ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}</button>
                <button onClick={() => handleDeleteZone(selectedZone)} className="btn btn-secondary text-red-600"><Trash2 className="h-4 w-4" /></button>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
