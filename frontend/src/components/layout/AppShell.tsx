"use client";

import { Bell, Search } from "lucide-react";
import { usePathname } from "next/navigation";
import Sidebar from "./Sidebar";
import { useLiveClock } from "@/hooks/useLiveClock";
import { useState } from "react";

/* ─── Page title map (TRAMOS §2) ─────────────────────────────────────────── */
const PAGE_TITLES: Record<string, { title: string; summary: string }> = {
  "/dashboard": { title: "Dashboard", summary: "Overview · 103 units" },
  "/tracking": {
    title: "Realtime Monitor",
    summary: "25 units · 12 driving · 8 idle · 3 stop · 2 offline",
  },
  "/locate": { title: "Locate Unit", summary: "Search and track" },
  "/geofences": { title: "Geofence", summary: "Virtual zones" },
  "/tasks": { title: "Task Monitor", summary: "Shipment tracking" },
  "/vehicles": { title: "Vehicle", summary: "Fleet management" },
  "/drivers": { title: "Driver", summary: "Driver management" },
  "/history": { title: "Trip History", summary: "Replay and investigate" },
  "/accidents": { title: "Accident Log", summary: "Incident records" },
  "/reports": { title: "Reports", summary: "Operational analytics" },
  "/snapshots": { title: "Camera Snapshot", summary: "Photo evidence" },
  "/dashcam": { title: "Dashcam Monitor", summary: "Live video" },
  "/control": { title: "Control Panel", summary: "Administration" },
  "/settings": { title: "Settings", summary: "Preferences" },
};

const W_EXPANDED = 248;
const W_RAIL = 64;

export default function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const clock = useLiveClock();
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const pageInfo = PAGE_TITLES[pathname] ?? { title: "VANGUARD", summary: "" };

  const sidebarWidth = sidebarCollapsed ? W_RAIL : W_EXPANDED;

  return (
    <div className="flex min-h-screen bg-bg">
      {/* ── Sidebar (state managed here, passed as prop) ─────── */}
      <Sidebar collapsed={sidebarCollapsed} onToggle={() => setSidebarCollapsed((c) => !c)} />

      {/* ── Main content area ─────────────────────────────────── */}
      <div
        className="flex flex-1 flex-col transition-all"
        style={{ marginLeft: sidebarWidth }}
      >
        {/* ── Header: sticky glass bar ────────────────────────── */}
        <header className="glass sticky top-0 z-40 flex h-14 shrink-0 items-center justify-between gap-4 border-b border-border px-6">
          {/* Kiri: judul halaman + ringkasan */}
          <div className="flex min-w-0 flex-col">
            <h1 className="text-h2 font-semibold tracking-tight text-foreground truncate leading-tight">
              {pageInfo.title}
            </h1>
            <p className="font-mono text-xs tabular-nums text-muted truncate leading-tight mt-0.5">
              {pageInfo.summary}
            </p>
          </div>

          {/* Tengah: global search */}
          <div className="relative flex-1 max-w-sm mx-auto hidden md:block">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-faint pointer-events-none" />
            <input
              type="text"
              placeholder="Search units, drivers, tasks..."
              className="input w-full pl-9 pr-12 h-8 text-sm"
            />
            <kbd className="absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none hidden lg:inline-flex">
              <span className="inline-flex items-center gap-0.5 rounded border border-border bg-surface-2 px-1.5 py-0.5 font-mono text-[10px] text-muted tabular-nums">
                <span>⌘</span><span>K</span>
              </span>
            </kbd>
          </div>

          {/* Kanan: jam live + notifikasi + avatar */}
          <div className="flex items-center gap-3 shrink-0">
            {/* Jam live */}
            <time
              dateTime={clock}
              className="font-mono text-sm tabular-nums text-muted hidden sm:block"
            >
              {clock}
            </time>

            <div className="h-5 w-px bg-border hidden sm:block" />

            {/* Bell notifikasi */}
            <button
              type="button"
              className="relative rounded-lg p-2 text-muted transition-colors hover:bg-surface-2 hover:text-foreground focus-visible:outline-2 focus-visible:outline-brand"
              aria-label="Notifications (3 unread)"
            >
              <Bell className="h-5 w-5" />
              <span className="absolute right-1 top-1 flex h-4 w-4 items-center justify-center rounded-full bg-st-offline text-[9px] font-semibold text-white tabular-nums">
                3
              </span>
            </button>

            {/* Avatar + role */}
            <button
              type="button"
              className="flex items-center gap-2 rounded-lg p-1.5 transition-colors hover:bg-surface-2 focus-visible:outline-2 focus-visible:outline-brand"
              aria-label="User menu"
            >
              <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-brand text-white text-xs font-bold shrink-0">
                JE
              </div>
              <div className="hidden lg:flex flex-col items-start">
                <span className="text-sm font-medium text-foreground leading-tight">Jhon Erizal</span>
                <span className="text-[10px] text-muted leading-tight">Dispatcher</span>
              </div>
            </button>
          </div>
        </header>

        {/* ── Content ─────────────────────────────────────────── */}
        <main className="min-h-[calc(100dvh-3.5rem)]">
          {children}
        </main>
      </div>
    </div>
  );
}
