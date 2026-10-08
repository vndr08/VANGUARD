"use client";

import { usePathname } from "next/navigation";
import Link from "next/link";
import {
  LayoutDashboard,
  Radio,
  Crosshair,
  MapPinned,
  ClipboardList,
  Truck,
  Users,
  History,
  ShieldAlert,
  BarChart3,
  Camera,
  Video,
  SlidersHorizontal,
  Settings,
  ChevronRight,
  Sun,
  Moon,
} from "lucide-react";
import { useTheme } from "@/components/ThemeProvider";
import { motion } from "motion/react";
import { W_EXPANDED, W_RAIL } from "@/lib/layout-constants";

/* ─── Navigation structure (TRAMOS §2 + DESIGN.md §8) ─────────────────────── */
const NAV_GROUPS = [
  {
    label: "RINGKASAN",
    items: [
      { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
    ],
  },
  {
    label: "REALTIME",
    items: [
      { name: "Realtime Monitor", href: "/tracking", icon: Radio },
      { name: "Lacak Unit", href: "/locate", icon: Crosshair },
    ],
  },
  {
    label: "OPERASIONAL",
    items: [
      { name: "Task Monitor", href: "/tasks", icon: ClipboardList },
      { name: "Vehicle", href: "/vehicles", icon: Truck },
      { name: "Driver", href: "/drivers", icon: Users },
      { name: "Trip History", href: "/history", icon: History },
    ],
  },
  {
    label: "KESELAMATAN",
    items: [
      { name: "Geofence", href: "/geofences", icon: MapPinned },
      { name: "Accident", href: "/accidents", icon: ShieldAlert },
      { name: "Camera Snapshot", href: "/snapshots", icon: Camera },
      { name: "Dashcam Monitor", href: "/dashcam", icon: Video },
    ],
  },
  {
    label: "LAPORAN",
    items: [
      { name: "LAPORAN", href: "/reports", icon: BarChart3 },
    ],
  },
  {
    label: "ADMINISTRASI",
    items: [
      { name: "Control Panel", href: "/control", icon: SlidersHorizontal },
      { name: "Settings", href: "/settings", icon: Settings },
    ],
  },
] as const;

interface SidebarProps {
  collapsed: boolean;
  fleetTotal: number;
  onToggle: () => void;
}

export default function Sidebar({
  collapsed,
  fleetTotal,
  onToggle,
}: SidebarProps) {
  const pathname = usePathname();
  const { theme, toggleTheme } = useTheme();
  const width = collapsed ? W_RAIL : W_EXPANDED;

  return (
    <motion.aside
      animate={{ width }}
      transition={{ duration: 0.18, ease: [0.2, 0, 0, 1] }}
      className="fixed left-0 top-0 z-50 flex h-screen flex-col overflow-hidden border-r border-border"
      style={{ background: "var(--surface-1)" }}
      aria-label="Main navigation"
    >
      {/* ── Header: logo + collapse toggle ────────────────────── */}
      <div className="flex h-12 shrink-0 items-center overflow-hidden border-b border-border" style={{ background: "var(--header-ink)" }}>
        <Link
          href="/dashboard"
          className={`flex h-full items-center overflow-hidden ${
            collapsed
              ? "w-10 shrink-0 justify-center px-1"
              : "flex-1 gap-3 px-3"
          }`}
          aria-label="VANGUARD Home"
        >
          {/* Signal logo mark */}
          <div
            className="flex h-8 w-8 shrink-0 items-center justify-center rounded-sm"
            style={{
              background: "var(--signal)",
              clipPath: "polygon(0 0, calc(100% - 6px) 0, 100% 6px, 100% 100%, 0 100%)",
            }}
          >
            <Radio className="h-4 w-4" style={{ color: "var(--signal-ink)" }} strokeWidth={2.5} />
          </div>
          {!collapsed && (
              <motion.div animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.14 }} className="overflow-hidden">
                <p className="sign text-sm font-bold tracking-wider text-[#EDF0E9] leading-none">
                  VANGUARD
                </p>
                <p className="mt-0.5 text-[9px] font-medium text-[#9AA69E] leading-none">
                  Fleet Control
                </p>
              </motion.div>
          )}
        </Link>

        <button
          onClick={onToggle}
          className={`flex h-12 shrink-0 items-center justify-center text-[#9AA69E] transition-colors hover:bg-white/5 hover:text-[#EDF0E9] focus-visible:outline-2 focus-visible:outline-brand ${
            collapsed ? "w-6" : "w-10"
          }`}
          aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
        >
          <motion.div
            animate={{ rotate: collapsed ? 0 : 180 }}
            transition={{ duration: 0.2 }}
          >
            <ChevronRight className="h-4 w-4" />
          </motion.div>
        </button>
      </div>

      {/* ── Navigation groups ────────────────────────────────── */}
      <nav className="flex-1 overflow-y-auto overflow-x-hidden py-2">
        {NAV_GROUPS.map((group) => (
          <div key={group.label} className={collapsed ? "py-1" : "pb-2 pt-1"}>
            {!collapsed && (
              <p className="px-4 pb-1 pt-1 text-[10px] font-medium text-faint">
                {group.label.charAt(0) + group.label.slice(1).toLowerCase()}
              </p>
            )}
            <ul className={collapsed ? "px-2" : "px-2"}>
              {group.items.map((item) => (
                <li key={item.name}>
                  <NavItem
                    item={item}
                    isActive={
                      pathname === item.href ||
                      (item.href !== "/dashboard" && pathname?.startsWith(item.href + "/"))
                    }
                    collapsed={collapsed}
                  />
                </li>
              ))}
            </ul>
          </div>
        ))}
      </nav>

      {/* ── Footer ────────────────────────────────────────────── */}
      <div className="shrink-0 border-t border-border" style={{ background: "var(--header-ink)" }}>
        <div className={`flex h-9 items-center text-[#9AA69E] ${collapsed ? "justify-center" : "justify-between px-4"}`} title={`${fleetTotal} unit dipantau`}>
          {!collapsed && <span className="text-xs">Armada dipantau</span>}
          <span className="font-mono text-xs tabular-nums text-[#EDF0E9]">{fleetTotal}</span>
        </div>

        <button
          onClick={toggleTheme}
          className={`flex h-10 w-full items-center border-t border-border text-[#9AA69E] transition-colors hover:bg-white/5 hover:text-[#EDF0E9] focus-visible:outline-2 focus-visible:outline-brand ${collapsed ? "justify-center" : "gap-3 px-4"}`}
          aria-label={theme === "dark" ? "Switch to light mode" : "Switch to Mode Gelap"}
        >
          <div className="flex h-5 w-5 shrink-0 items-center justify-center">
            {theme === "dark" ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
          </div>
          {!collapsed && (
            <span className="text-xs font-medium">
              {theme === "dark" ? "Light Mode" : "Mode Gelap"}
            </span>
          )}
        </button>
      </div>
    </motion.aside>
  );
}

/* ─── NavItem ─────────────────────────────────────────────────────────────── */
interface NavItemProps {
  item: (typeof NAV_GROUPS)[number]["items"][number];
  isActive: boolean;
  collapsed: boolean;
}

function NavItem({ item, isActive, collapsed }: NavItemProps) {
  const Icon = item.icon;

  if (collapsed) {
    return (
      <Link
        href={item.href}
        className="group relative flex h-10 w-full items-center justify-center transition-colors hover:bg-surface-2 focus-visible:outline-2 focus-visible:outline-brand"
        title={item.name}
        aria-label={item.name}
        aria-current={isActive ? "page" : undefined}
      >
        {isActive && <motion.span layoutId="sidebar-active" className="absolute inset-y-2 left-0 w-0.5 bg-brand" transition={{ duration: 0.18 }} />}
        <Icon
          className="h-[18px] w-[18px] shrink-0 transition-colors"
          style={{
            color: isActive ? "var(--brand)" : "var(--text-muted)",
          }}
        />
      </Link>
    );
  }

  return (
    <Link
      href={item.href}
      className={`v2-nav-item group relative flex h-9 items-center gap-3 px-3 transition-colors hover:bg-surface-2 focus-visible:outline-2 focus-visible:outline-brand ${isActive ? "active bg-brand-soft" : ""}`}
      aria-current={isActive ? "page" : undefined}
    >
      {isActive && <motion.span layoutId="sidebar-active" className="absolute inset-y-2 left-0 w-0.5 bg-brand" transition={{ duration: 0.18 }} />}

      <Icon
        className="h-[18px] w-[18px] shrink-0 transition-colors"
        style={{
          color: isActive ? "var(--brand)" : "var(--text-muted)",
        }}
      />

      <span
        className="flex-1 text-sm font-medium truncate transition-colors"
        style={{
          color: isActive ? "var(--text)" : "var(--text-muted)",
        }}
      >
        {item.name}
      </span>
    </Link>
  );
}
