"use client";

import { Bell, Search } from "lucide-react";
import {
  usePathname,
  useSearchParams,
} from "next/navigation";
import { useEffect, useState } from "react";
import Sidebar from "./Sidebar";
import { FreshnessIndicator } from "./FreshnessIndicator";
import { CommandPalette } from "@/components/ui/CommandPalette";
import { NotificationDropdown } from "@/components/ui/NotificationDropdown";
import { UserMenuDropdown } from "@/components/ui/UserMenuDropdown";
import { useNotifications } from "@/hooks/useNotifications";
import { AppContextProvider, useAppContext } from "@/components/context/AppContext";
import { useSpeedingMonitor } from "@/hooks/useSpeedingMonitor";
import { FLEET_STATS, FLEET_VEHICLES } from "@/lib/fleet-data";
import { MAP_AUTO_COLLAPSE_BREAKPOINT, W_EXPANDED, W_RAIL } from "@/lib/layout-constants";

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

/* ─── Speeding monitor ─────────────────────────────────────────────────── */
function SpeedingMonitor() {
  useSpeedingMonitor();
  return null;
}

/* ─── Page title map (TRAMOS §2) ─────────────────────────────────────────── */
const PAGE_TITLES: Record<string, { title: string; summary: string }> = {
  "/dashboard": {
    title: "Dashboard",
    summary: `Overview · ${FLEET_STATS.total_vehicles} unit`,
  },
  "/tracking": {
    title: "Realtime Monitor",
    summary:
      `${FLEET_STATS.total_vehicles} unit · ` +
      `${FLEET_STATS.driving} berkendara · ` +
      `${FLEET_STATS.idle} diam · ` +
      `${FLEET_STATS.stopped} berhenti · ` +
      `${FLEET_STATS.offline} offline`,
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
  "/dashcam": { title: "Dashcam Monitor", summary: "Live video" },
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

/* ─── Mock user context (single source of truth) ─────────────────────────── */
interface MockUser {
  name: string;
  role: string;
  initials: string;
}

const CURRENT_USER: MockUser = {
  name: "Ahmad Wijaya",
  role: "Manajer Armada",
  initials: "AW",
};

function AppShellInner({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [sidebarPreference, setSidebarPreference] = useState<boolean | null>(null);
  const [viewportWidth, setViewportWidth] = useState<number | null>(null);

  const isMapPrimary = MAP_PRIMARY_ROUTES.some(
    (route) => pathname === route || pathname.startsWith(`${route}/`)
  );
  const isAutoCollapsed =
    isMapPrimary &&
    viewportWidth !== null &&
    viewportWidth < MAP_AUTO_COLLAPSE_BREAKPOINT;
  const sidebarCollapsed = sidebarPreference ?? isAutoCollapsed;
  const pageInfo =
    PAGE_TITLES[pathname] ?? {
      title: "VANGUARD",
      summary: "",
    };

  const selectedTrackingSlug =
    pathname === "/tracking"
      ? searchParams
          .get("vehicle")
          ?.toLowerCase()
          .replace(/\s+/g, "") ??
        null
      : null;

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
    <div className="flex min-h-screen bg-bg">
      {/* ── Sidebar (state managed here, passed as prop) ─────── */}
      <Sidebar
        collapsed={sidebarCollapsed}
        fleetTotal={FLEET_STATS.total_vehicles}
        onToggle={handleSidebarToggle}
      />

      {/* ── Command Palette ─────────────────────────────────── */}
      <CommandPalette open={paletteOpen} onClose={() => setPaletteOpen(false)} />

      {/* ── Main content area ─────────────────────────────────── */}
      <div
        className="flex flex-1 flex-col transition-[margin-left] duration-panel ease-standard"
        style={{ marginLeft: sidebarWidth }}
      >
        {/* ── Header: sticky solid operational surface ────────── */}
        <header className="sticky top-0 z-40 flex h-14 shrink-0 items-center justify-between gap-4 border-b border-border bg-surface-1 px-6">
          {/* Kiri: judul halaman + ringkasan */}
          <div className="flex min-w-0 flex-col">
            <h1 className="text-h2 font-semibold tracking-tight text-foreground truncate leading-tight">
              {pageInfo.title}
            </h1>
            <p className="font-mono text-xs tabular-nums text-muted truncate leading-tight mt-0.5">
              {pageInfo.summary}
            </p>
          </div>

          {/* Tengah: global search → opens command palette */}
          <div className="relative flex-1 max-w-sm mx-auto hidden md:block">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-faint pointer-events-none" />
            <button
              type="button"
              onClick={() => {
                setPaletteOpen(true);
                setNotifOpen(false);
                setUserMenuOpen(false);
              }}
              className="input w-full pl-9 pr-12 h-8 text-sm text-left cursor-text"
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
          <div className="flex shrink-0 items-center gap-3">
            <FreshnessIndicator
              vehicles={FLEET_VEHICLES}
              suppressSourcePlate={
                selectedTrackingSlug
              }
            />

            <div className="hidden h-5 w-px bg-border xl:block" />

            {/* Bell notifikasi — opens dropdown */}
            <div className="relative">
              <button
                type="button"
                onClick={() => {
                  setNotifOpen(prev => !prev);
                  setUserMenuOpen(false);
                }}
                className="relative rounded-lg p-2 text-muted transition-colors hover:bg-surface-2 hover:text-foreground focus-visible:outline-2 focus-visible:outline-brand"
                aria-label={`Notifications (${unreadCount} unread)`}
                aria-expanded={notifOpen}
                aria-haspopup="dialog"
              >
                <Bell className="h-5 w-5" />
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
                className="flex items-center gap-2 rounded-lg p-1.5 transition-colors hover:bg-surface-2 focus-visible:outline-2 focus-visible:outline-brand"
                aria-label="User menu"
                aria-expanded={userMenuOpen}
                aria-haspopup="dialog"
              >
                <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-brand text-white text-xs font-bold shrink-0">
                  {CURRENT_USER.initials}
                </div>
                <div className="hidden lg:flex flex-col items-start">
                  <span className="text-sm font-medium text-foreground leading-tight">{CURRENT_USER.name}</span>
                  <span className="text-[10px] text-muted leading-tight">{CURRENT_USER.role}</span>
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
        </header>

        {/* ── Content ─────────────────────────────────────────── */}
        <main className="min-h-[calc(100dvh-3.5rem)]">
          <SpeedingMonitor />
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
