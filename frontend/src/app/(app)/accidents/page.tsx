"use client";

import { useState } from "react";
import { AlertTriangle, Camera, CheckCircle, Download, Eye, FileText, MapPin, ShieldCheck, Truck, X } from "lucide-react";
import { useToast } from "@/components/ui/Toast";

interface Incident {
  id: string; unit: string; driver: string; type: string; severity: "High" | "Medium" | "Low"; location: string; time: string; date: string; status: "Review" | "Action" | "Closed"; evidence: string;
}

const incidents: Incident[] = [
  { id: "ACC-0529-01", unit: "B 5678 TGP", driver: "Budi Santoso", type: "Harsh brake", severity: "Medium", location: "Tol Cikampek KM32", time: "15:22", date: "29 May 2026", status: "Review", evidence: "3 snapshots, 1 video" },
  { id: "ACC-0528-04", unit: "L 1122 STU", driver: "Joko Susilo", type: "Fatigue alarm", severity: "High", location: "Pantura Cirebon", time: "22:10", date: "28 May 2026", status: "Closed", evidence: "2 snapshots, 1 dashcam" },
  { id: "ACC-0527-02", unit: "H 2345 GHI", driver: "Fajar Ramadhan", type: "Impact sensor", severity: "High", location: "Semarang Barat", time: "08:42", date: "27 May 2026", status: "Action", evidence: "5 snapshots, 2 video" },
  { id: "ACC-0526-03", unit: "B 1234 KJT", driver: "Ahmad Sudirman", type: "Overspeed", severity: "Low", location: "Tol Trans Jawa", time: "14:15", date: "26 May 2026", status: "Review", evidence: "1 snapshot" },
  { id: "ACC-0525-01", unit: "L 3456 ABC", driver: "Dedi Kurniawan", type: "Harsh brake", severity: "Medium", location: "Jababeka", time: "10:30", date: "25 May 2026", status: "Closed", evidence: "2 snapshots" },
];

const severityColors: Record<string, string> = {
  High: "bg-red-50 text-red-700 dark:bg-red-900/20 dark:text-red-300",
  Medium: "bg-amber-50 text-amber-700 dark:bg-amber-900/20 dark:text-amber-300",
  Low: "bg-blue-50 text-blue-700 dark:bg-blue-900/20 dark:text-blue-300",
};

const statusColors: Record<string, string> = {
  Review: "bg-amber-50 text-amber-700 dark:bg-amber-900/20 dark:text-amber-300",
  Action: "bg-red-50 text-red-700 dark:bg-red-900/20 dark:text-red-300",
  Closed: "bg-emerald-50 text-emerald-700 dark:bg-emerald-900/20 dark:text-emerald-300",
};

export default function AccidentsPage() {
  const { addToast } = useToast();
  const [selectedIncident, setSelectedIncident] = useState<Incident | null>(null);
  const [severityFilter, setSeverityFilter] = useState<string>("All");
  const [statusFilter, setStatusFilter] = useState<string>("All");

  const filtered = incidents.filter((i) => {
    const matchSeverity = severityFilter === "All" || i.severity === severityFilter;
    const matchStatus = statusFilter === "All" || i.status === statusFilter;
    return matchSeverity && matchStatus;
  });

  function handleSelectIncident(incident: Incident) {
    setSelectedIncident(incident === selectedIncident ? null : incident);
  }

  function handleReview() {
    addToast("info", "Opening evidence review...");
  }

  function handleMarkResolved() {
    if (selectedIncident) {
      addToast("success", `${selectedIncident.id} marked as resolved`);
      setSelectedIncident(null);
    }
  }

  function handleExport() {
    addToast("info", "Exporting safety log...");
  }

  return (
    <div className="min-h-full bg-zinc-50 px-7 py-6 dark:bg-zinc-950">
      <div className="mb-6 flex flex-col gap-4 xl:flex-row xl:items-end xl:justify-between">
        <div>
          <p className="metric-label">Safety evidence</p>
          <h1 className="mt-2 text-3xl font-bold text-zinc-900 dark:text-white">Accident Log</h1>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-zinc-600 dark:text-zinc-400">Catatan insiden, alarm mengemudi, evidence kamera, lokasi, dan status follow-up.</p>
        </div>
        <button onClick={handleExport} className="btn btn-primary"><FileText className="h-4 w-4" /> Export safety log</button>
      </div>

      <div className="mb-6 grid grid-cols-2 gap-3 md:grid-cols-4">
        <div className="card rounded-md p-4">
          <span className="metric-label">Total insiden</span>
          <p className="mt-2 text-2xl font-bold text-zinc-900 dark:text-white">{incidents.length}</p>
        </div>
        <div className="card rounded-md p-4">
          <span className="metric-label">Open review</span>
          <p className="mt-2 text-2xl font-bold text-amber-700 dark:text-amber-300">{incidents.filter((i) => i.status === "Review").length}</p>
        </div>
        <div className="card rounded-md p-4">
          <span className="metric-label">Need action</span>
          <p className="mt-2 text-2xl font-bold text-red-700 dark:text-red-300">{incidents.filter((i) => i.status === "Action").length}</p>
        </div>
        <div className="card rounded-md p-4">
          <span className="metric-label">Resolved</span>
          <p className="mt-2 text-2xl font-bold text-emerald-700 dark:text-emerald-300">{incidents.filter((i) => i.status === "Closed").length}</p>
        </div>
      </div>

      <div className="mb-4 flex flex-wrap items-center gap-3">
        <span className="text-sm font-bold text-zinc-500">Severity:</span>
        {["All", "High", "Medium", "Low"].map((sev) => (
          <button key={sev} onClick={() => setSeverityFilter(sev)} className={`rounded-full px-3 py-1.5 text-xs font-bold transition-colors ${severityFilter === sev ? "bg-zinc-900 text-white dark:bg-white dark:text-zinc-900" : "border border-zinc-200 bg-white text-zinc-600 hover:bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-300"}`}>{sev}</button>
        ))}
        <span className="ml-4 text-sm font-bold text-zinc-500">Status:</span>
        {["All", "Review", "Action", "Closed"].map((st) => (
          <button key={st} onClick={() => setStatusFilter(st)} className={`rounded-full px-3 py-1.5 text-xs font-bold transition-colors ${statusFilter === st ? "bg-zinc-900 text-white dark:bg-white dark:text-zinc-900" : "border border-zinc-200 bg-white text-zinc-600 hover:bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-300"}`}>{st}</button>
        ))}
      </div>

      <div className="grid grid-cols-1 gap-5 xl:grid-cols-[1fr_400px]">
        <section className="card overflow-hidden rounded-md">
          <div className="border-b border-zinc-200 px-5 py-4 dark:border-zinc-800">
            <p className="metric-label">Incident queue</p>
          </div>
          <div className="divide-y divide-zinc-100 dark:divide-zinc-800">
            {filtered.map((item) => (
              <div key={item.id} onClick={() => handleSelectIncident(item)} className={`cursor-pointer p-5 transition-colors hover:bg-zinc-50 dark:hover:bg-zinc-900 ${selectedIncident?.id === item.id ? "bg-zinc-50 dark:bg-zinc-900" : ""}`}>
                <div className="grid grid-cols-1 gap-4 xl:grid-cols-[150px_1fr_120px]">
                  <div>
                    <p className="text-xs font-bold text-zinc-500">{item.id}</p>
                    <p className="mt-1 font-bold text-zinc-900 dark:text-white">{item.type}</p>
                    <span className={`mt-2 inline-block rounded-full px-2 py-0.5 text-[10px] font-bold ${severityColors[item.severity]}`}>{item.severity}</span>
                  </div>
                  <div className="space-y-2 text-sm font-semibold text-zinc-700 dark:text-zinc-300">
                    <p className="inline-flex items-center gap-2"><Truck className="h-4 w-4" /> {item.unit} - {item.driver}</p>
                    <p className="inline-flex items-center gap-2"><MapPin className="h-4 w-4" /> {item.location}</p>
                    <p className="inline-flex items-center gap-2"><Camera className="h-4 w-4" /> {item.evidence}</p>
                  </div>
                  <div className="text-right">
                    <span className={`rounded-full px-3 py-1 text-xs font-bold ${statusColors[item.status]}`}>{item.status}</span>
                    <p className="mt-2 text-xs font-semibold text-zinc-500">{item.date} {item.time}</p>
                  </div>
                </div>
              </div>
            ))}
            {filtered.length === 0 && (
              <div className="py-14 text-center text-zinc-400 dark:text-zinc-600">
                <ShieldCheck className="mx-auto h-10 w-10 opacity-30" />
                <p className="mt-2 text-sm font-semibold">No incidents match the filter</p>
              </div>
            )}
          </div>
        </section>

        {selectedIncident ? (
          <aside className="space-y-5">
            <div className="card rounded-md p-5">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-bold text-zinc-900 dark:text-white">{selectedIncident.id}</h3>
                <button onClick={() => setSelectedIncident(null)} className="rounded-md p-1 text-zinc-500 hover:bg-zinc-100 dark:hover:bg-zinc-800"><X className="h-5 w-5" /></button>
              </div>
              <div className="mt-4 space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <p className="text-[10px] font-bold uppercase text-zinc-500">Incident type</p>
                    <p className="font-semibold text-zinc-900 dark:text-white">{selectedIncident.type}</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-[10px] font-bold uppercase text-zinc-500">Severity</p>
                    <span className={`inline-block rounded-full px-2.5 py-1 text-xs font-bold ${severityColors[selectedIncident.severity]}`}>{selectedIncident.severity}</span>
                  </div>
                  <div className="space-y-1">
                    <p className="text-[10px] font-bold uppercase text-zinc-500">Unit</p>
                    <p className="font-semibold text-zinc-900 dark:text-white">{selectedIncident.unit}</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-[10px] font-bold uppercase text-zinc-500">Driver</p>
                    <p className="font-semibold text-zinc-900 dark:text-white">{selectedIncident.driver}</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-[10px] font-bold uppercase text-zinc-500">Location</p>
                    <p className="font-semibold text-zinc-900 dark:text-white">{selectedIncident.location}</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-[10px] font-bold uppercase text-zinc-500">Date/Time</p>
                    <p className="font-semibold text-zinc-900 dark:text-white">{selectedIncident.date} {selectedIncident.time}</p>
                  </div>
                </div>
                <div className="space-y-1">
                  <p className="text-[10px] font-bold uppercase text-zinc-500">Evidence</p>
                  <p className="font-semibold text-zinc-700 dark:text-zinc-300">{selectedIncident.evidence}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-[10px] font-bold uppercase text-zinc-500">Status</p>
                  <span className={`inline-block rounded-full px-3 py-1 text-xs font-bold ${statusColors[selectedIncident.status]}`}>{selectedIncident.status}</span>
                </div>
              </div>
              <div className="mt-5 flex gap-2">
                <button onClick={handleReview} className="btn btn-primary flex-1"><Eye className="mr-2 h-4 w-4" /> Review Evidence</button>
                {selectedIncident.status !== "Closed" && (
                  <button onClick={handleMarkResolved} className="btn btn-secondary text-emerald-600"><CheckCircle className="mr-2 h-4 w-4" /> Mark Resolved</button>
                )}
              </div>
            </div>

            <div className="rounded-md border border-amber-200 bg-amber-50 p-5 text-amber-800 dark:border-amber-900 dark:bg-amber-900/20 dark:text-amber-200">
              <AlertTriangle className="h-5 w-5" />
              <p className="mt-3 text-sm font-bold">{incidents.filter((i) => i.status !== "Closed").length} open safety reviews need supervisor attention.</p>
            </div>

            <div className="card rounded-md p-5">
              <ShieldCheck className="h-5 w-5 text-emerald-600" />
              <p className="mt-3 text-sm font-bold text-zinc-900 dark:text-white">Safety workflow</p>
              <p className="mt-2 text-sm leading-6 text-zinc-600 dark:text-zinc-400">Review evidence, contact driver, classify incident, then close with supervisor note.</p>
            </div>
          </aside>
        ) : (
          <aside className="space-y-5">
            <div className="card rounded-md p-5">
              <ShieldCheck className="h-5 w-5 text-emerald-600" />
              <p className="mt-3 text-sm font-bold text-zinc-900 dark:text-white">Safety workflow</p>
              <p className="mt-2 text-sm leading-6 text-zinc-600 dark:text-zinc-400">Review evidence, contact driver, classify incident, then close with supervisor note.</p>
            </div>
            <div className="rounded-md border border-amber-200 bg-amber-50 p-5 text-amber-800 dark:border-amber-900 dark:bg-amber-900/20 dark:text-amber-200">
              <AlertTriangle className="h-5 w-5" />
              <p className="mt-3 text-2xl font-bold">{incidents.filter((i) => i.status !== "Closed").length}</p>
              <p className="text-xs font-semibold opacity-80">open safety reviews need supervisor attention.</p>
            </div>
          </aside>
        )}
      </div>
    </div>
  );
}
