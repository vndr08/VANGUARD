"use client";

import { Bell, Search } from "lucide-react";
import {
  usePathname,
} from "next/navigation";
import { useEffect, useState } from "react";
import Sidebar from "./Sidebar";
import { CommandPalette } from "@/components/ui/CommandPalette";
import { NotificationDropdown } from "@/components/ui/NotificationDropdown";
import { UserMenuDropdown } from "@/components/ui/UserMenuDropdown";
import { useNotifications } from "@/hooks/useNotifications";
import { AppContextProvider, useAppContext } from "@/components/context/AppContext";
import { FLEET_VEHICLES } from "@/lib/fleet-data";
import { MAP_AUTO_COLLAPSE_BREAKPOINT, W_EXPANDED, W_RAIL } from "@/lib/layout-constants";
import TelemetryTicker from "@/components/v2/TelemetryTicker";

/* ─── Telemetri Refresh Bus ──────────────────────────────────────────────── */
/** Dispatches "vanguard:telemetri-refresh" CustomEvent on window at each interval. */

function TelemetriBus({ children }: { children: React.ReactNode }) {
  const { telemetriInterval } = useAppContext();

  // Start/stop/change polling interval
  useEffect(() => {
    const id = setInterval(() => {
      window.dispatchEvent(new CustomEvent("vanguard:telemetri-refresh"));
    }, telemetriInterval);
    // Fire once immediately on mount/change
    window.dispatchEvent(new CustomEvent("vanguard:telemetri-refresh"));
    return () => clearInterval(id);
  }, [telemetriInterval]);

  return <>{children}</>;
}

/* ─── Page title map (TRAMOS §2) ─────────────────────────────────────────── */
const PAGE_TITLES: Record<string, { title: string; summary: string }> = {
  "/dashboard": {
    title: "Dashboard",
    summary: `Overview · ${FLEET_VEHICLES.length} unit`,
  },
  "/tracking": {
    title: "Realtime Monitor",
    summary:
      `${FLEET_VEHICLES.length} unit · ` +
      `${FLEET_VEHICLES.filter(v => v.status === "driving").length} berkendara · ` +
      `${FLEET_VEHICLES.filter(v => v.status === "idle").length} diam · ` +
      `${FLEET_VEHICLES.filter(v => v.status === "stopped").length} berhenti · ` +
      `${FLEET_VEHICLES.filter(v => v.status === "offline").length} offline`,
  },
  "/locate": { title: "Lacak Unit", summary: "Cari dan pantau kendaraan" },
  "/geofences": { title: "Geofence", summary: "Virtual zones" },
  "/tasks": { title: "Task Monitor", summary: "Shipment tracking" },
  "/vehicles": { title: "Vehicle", summary: "Fleet management" },
  "/drivers": { title: "Driver", summary: "Driver management" },
  "/history": { title: "Trip History", summary: "Replay and investigate" },
  "/accidents": { title: "Accident Log", summary: "Incident records" },
  "/reports": { title: "Reports", summary: "Operational analytics" },
  "/snapshots": { title: "Camera Snapshot", summary: "Photo evidence" },
  "/dashcam": { title: "Dashcam Monitor", summary: "Rekaman arsip" },
  "/control": { title: "Control Panel", summary: "Administration" },
  "/settings": { title: "Settings", summary: "Preferences" },
};

const MAP_PRIMARY_ROUTES = [
  "/tracking",
  "/tasks",
  "/history",
  "/geofences",
] as const;

const SIDEBAR_PREFERENCE_KEY = "vanguard:sidebar-preference";

function getPageInfo(pathname: string) {
  if (pathname.startsWith("/tasks/")) {
    return { title: "Detail Tugas", summary: "Rute dan status operasional" };
  }

  return PAGE_TITLES[pathname] ?? { title: "VANGUARD", summary: "" };
}

interface WorkspaceUser {
  name: string;
  role: string;
  initials: string;
}

const CURRENT_USER: WorkspaceUser = {
  name: "Operator Lokal",
  role: "Workspace lokal",
  initials: "OL",
};

function AppShellInner({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [sidebarPreference, setSidebarPreference] = useState<boolean | null>(null);
  const [viewportWidth, setViewportWidth] = useState<number | null>(null);
  const { vehicles } = useAppContext();

  const isMapPrimary = MAP_PRIMARY_ROUTES.some(
    (route) => pathname === route || pathname.startsWith(`${route}/`)
  );
  const isAutoCollapsed =
    isMapPrimary &&
    viewportWidth !== null &&
    viewportWidth < MAP_AUTO_COLLAPSE_BREAKPOINT;
  const isNarrowViewport = viewportWidth !== null && viewportWidth < 1024;
  const sidebarCollapsed = isNarrowViewport || (sidebarPreference ?? isAutoCollapsed);
  const basePageInfo = getPageInfo(pathname);
  const pageInfo = pathname === "/dashboard"
    ? { ...basePageInfo, summary: `Overview · ${vehicles.length} unit` }
    : pathname === "/tracking"
      ? {
          ...basePageInfo,
          summary: `${vehicles.length} unit · ${vehicles.filter((vehicle) => vehicle.status === "driving").length} berkendara · ${vehicles.filter((vehicle) => vehicle.status === "idle").length} diam · ${vehicles.filter((vehicle) => vehicle.status === "stopped").length} berhenti · ${vehicles.filter((vehicle) => vehicle.status === "offline").length} offline`,
        }
      : basePageInfo;

  useEffect(() => {
    const storedPreference = window.sessionStorage.getItem(
      SIDEBAR_PREFERENCE_KEY
    );

    if (storedPreference === "collapsed") {
      setSidebarPreference(true);
    } else if (storedPreference === "expanded") {
      setSidebarPreference(false);
    }

    const updateViewportWidth = () => {
      setViewportWidth(window.innerWidth);
    };

    updateViewportWidth();
    window.addEventListener("resize", updateViewportWidth);

    return () => {
      window.removeEventListener("resize", updateViewportWidth);
    };
  }, []);

  function handleSidebarToggle() {
    if (isNarrowViewport) return;
    const nextCollapsed = !sidebarCollapsed;

    setSidebarPreference(nextCollapsed);
    window.sessionStorage.setItem(
      SIDEBAR_PREFERENCE_KEY,
      nextCollapsed ? "collapsed" : "expanded"
    );
  }

  // ── Command palette
  const [paletteOpen, setPaletteOpen] = useState(false);

  // ── Notification dropdown
  const [notifOpen, setNotifOpen] = useState(false);
  const { notifications, unreadCount, markRead, markAllRead, dismiss } = useNotifications();

  // ── User menu dropdown
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [clock, setClock] = useState("--:--:--");

  useEffect(() => {
    const updateClock = () => {
      setClock(
        new Intl.DateTimeFormat("id-ID", {
          timeZone: "Asia/Jakarta",
          hour: "2-digit",
          minute: "2-digit",
          second: "2-digit",
          hour12: false,
        }).format(new Date())
      );
    };
    updateClock();
    const id = window.setInterval(updateClock, 1000);
    return () => window.clearInterval(id);
  }, []);

  // ── Global ⌘K / Ctrl+K listener
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        setPaletteOpen(prev => !prev);
        setNotifOpen(false);
        setUserMenuOpen(false);
      }
    };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, []);

  // Close dropdowns on route change
  useEffect(() => {
    setNotifOpen(false);
    setUserMenuOpen(false);
  }, [pathname]);

  const sidebarWidth = sidebarCollapsed ? W_RAIL : W_EXPANDED;

  return (
    <div className="v2-app flex min-h-screen max-w-full overflow-x-hidden bg-bg">
      {/* ── Sidebar (state managed here, passed as prop) ─────── */}
      <Sidebar
        collapsed={sidebarCollapsed}
        fleetTotal={vehicles.length}
        onToggle={handleSidebarToggle}
      />

      {/* ── Command Palette ─────────────────────────────────── */}
      <CommandPalette open={paletteOpen} onClose={() => setPaletteOpen(false)} />

      {/* ── Main content area ─────────────────────────────────── */}
      <div
        className="flex min-w-0 max-w-full flex-1 flex-col transition-[margin-left] duration-panel ease-standard"
        style={{ marginLeft: sidebarWidth }}
      >
        {/* ── Compact V2 masthead: one operational line ───────── */}
        <header className="sticky top-0 z-40 shrink-0 border-b border-border bg-surface-1">
          <div className="relative flex h-9 items-center gap-3 px-4 before:absolute before:inset-y-0 before:left-0 before:w-1 before:bg-brand">
            <div className="flex min-w-0 items-baseline gap-3">
              <h1 className="sign truncate text-base font-bold uppercase tracking-[0.05em] text-foreground leading-none">{pageInfo.title}</h1>
              <p className="hidden border-l border-dashed border-border-strong pl-3 font-mono text-[9px] uppercase tracking-[0.08em] text-muted xl:block">{pageInfo.summary}</p>
            </div>

          {/* Tengah: global search → opens command palette */}
          <div className="relative ml-auto hidden w-full max-w-[260px] 2xl:block">
            <Search className="absolute left-0 top-1/2 h-4 w-4 -translate-y-1/2 text-faint pointer-events-none" />
            <button
              type="button"
              onClick={() => {
                setPaletteOpen(true);
                setNotifOpen(false);
                setUserMenuOpen(false);
              }}
              className="h-6 w-full border-b border-border-strong bg-transparent pl-7 pr-12 text-left text-xs transition-colors hover:border-brand"
              aria-label="Buka pencarian (⌘K)"
            >
              <span className="text-muted">Cari unit, pengemudi, atau tugas...</span>
            </button>
            <kbd className="absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none hidden lg:inline-flex">
              <span className="inline-flex items-center gap-0.5 rounded border border-border bg-surface-2 px-1.5 py-0.5 font-mono text-[10px] text-muted tabular-nums">
                <span>⌘</span><span>K</span>
              </span>
            </kbd>
          </div>

          {/* Kanan: data context + notifikasi + avatar */}
          <div className="ml-auto flex shrink-0 items-center gap-1.5">
            <span className="hidden bg-brand px-2 py-0.5 font-mono text-[9px] font-semibold tracking-[0.08em] text-slate-950 tabular-nums sm:inline">{clock}</span>

            {/* Bell notifikasi — opens dropdown */}
            <div className="relative">
              <button
                type="button"
                onClick={() => {
                  setNotifOpen(prev => !prev);
                  setUserMenuOpen(false);
                }}
                className="relative p-1.5 text-muted transition-colors hover:bg-surface-2 hover:text-foreground focus-visible:outline-2 focus-visible:outline-brand"
                aria-label={`Notifications (${unreadCount} unread)`}
                aria-expanded={notifOpen}
                aria-haspopup="dialog"
              >
                <Bell className="h-4 w-4" />
                {unreadCount > 0 && (
                  <span className="absolute right-1 top-1 flex h-4 w-4 items-center justify-center rounded-full bg-st-offline text-[9px] font-semibold text-white tabular-nums">
                    {unreadCount > 9 ? "9+" : unreadCount}
                  </span>
                )}
              </button>
              {notifOpen && (
                <NotificationDropdown
                  notifications={notifications}
                  unreadCount={unreadCount}
                  onMarkRead={markRead}
                  onMarkAllRead={markAllRead}
                  onDismiss={dismiss}
                  onClose={() => setNotifOpen(false)}
                />
              )}
            </div>

            {/* Avatar + role — opens user menu */}
            <div className="relative">
              <button
                type="button"
                onClick={() => {
                  setUserMenuOpen(prev => !prev);
                  setNotifOpen(false);
                }}
                className="flex items-center gap-2 transition-colors hover:bg-surface-2 focus-visible:outline-2 focus-visible:outline-brand"
                aria-label="User menu"
                aria-expanded={userMenuOpen}
                aria-haspopup="dialog"
              >
                <div className="sign flex h-6 w-6 shrink-0 items-center justify-center bg-brand text-[10px] font-bold text-slate-950 [clip-path:polygon(0_0,calc(100%_-_5px)_0,100%_5px,100%_100%,0_100%)]">
                  {CURRENT_USER.initials}
                </div>
                <div className="hidden 2xl:flex flex-col items-start">
                  <span className="text-xs font-medium text-foreground leading-tight">{CURRENT_USER.name}</span>
                  <span className="text-[9px] text-muted leading-tight">{CURRENT_USER.role}</span>
                </div>
              </button>
              {userMenuOpen && (
                <UserMenuDropdown
                  userName={CURRENT_USER.name}
                  userRole={CURRENT_USER.role}
                  userInitials={CURRENT_USER.initials}
                  onClose={() => setUserMenuOpen(false)}
                />
              )}
            </div>
          </div>
          </div>
        </header>

        {/* ── Telemetry ribbon sits directly below the masthead in V2 ── */}
        <TelemetryTicker />

        {/* ── Content ─────────────────────────────────────────── */}
        <main className="v2-page-stage min-w-0 max-w-full min-h-[calc(100dvh-3.625rem)]">
          {children}
        </main>

      </div>
    </div>
  );
}

/* ─── Exported AppShell ─────────────────────────────────────────────────── */

export default function AppShell({ children }: { children: React.ReactNode }) {
  return (
    <AppContextProvider>
      <TelemetriBus>
        <AppShellInner>{children}</AppShellInner>
      </TelemetriBus>
    </AppContextProvider>
  );
}
