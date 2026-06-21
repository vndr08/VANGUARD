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
  ChevronDown,
  ChevronRight,
  Sun,
  Moon,
  Wifi,
} from "lucide-react";
import { useTheme } from "@/components/ThemeProvider";
import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";

/* ─── Navigation structure (TRAMOS §2 + DESIGN.md §8) ─────────────────────── */
const NAV_GROUPS = [
  {
    label: "MONITOR",
    items: [
      { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
      { name: "Realtime Monitor", href: "/tracking", icon: Radio },
      { name: "Locate", href: "/locate", icon: Crosshair },
      { name: "Geofence", href: "/geofences", icon: MapPinned },
    ],
  },
  {
    label: "OPERATION",
    items: [
      { name: "Task Monitor", href: "/tasks", icon: ClipboardList },
      { name: "Vehicle", href: "/vehicles", icon: Truck },
      { name: "Driver", href: "/drivers", icon: Users },
      { name: "History", href: "/history", icon: History },
      { name: "Accident", href: "/accidents", icon: ShieldAlert },
    ],
  },
  {
    label: "EVIDENCE",
    items: [
      { name: "Report", href: "/reports", icon: BarChart3 },
      { name: "Camera Snapshot", href: "/snapshots", icon: Camera },
      { name: "Dashcam Monitor", href: "/dashcam", icon: Video },
    ],
  },
  {
    label: "ADMINISTRATION",
    items: [
      { name: "Control Panel", href: "/control", icon: SlidersHorizontal },
      { name: "Settings", href: "/settings", icon: Settings },
    ],
  },
] as const;

/* ─── Width constants ─────────────────────────────────────────────────────── */
const W_EXPANDED = 248;
const W_RAIL = 64;

interface SidebarProps {
  collapsed: boolean;
  onToggle: () => void;
}

export default function Sidebar({ collapsed, onToggle }: SidebarProps) {
  const pathname = usePathname();
  const { theme, toggleTheme } = useTheme();
  const [expandedGroups, setExpandedGroups] = useState<Set<string>>(
    new Set(NAV_GROUPS.map((g) => g.label))
  );

  function toggleGroup(label: string) {
    setExpandedGroups((prev) => {
      const next = new Set(prev);
      next.has(label) ? next.delete(label) : next.add(label);
      return next;
    });
  }

  const width = collapsed ? W_RAIL : W_EXPANDED;

  return (
    <motion.aside
      animate={{ width }}
      transition={{ type: "spring", stiffness: 320, damping: 30 }}
      className="fixed left-0 top-0 z-50 flex h-screen flex-col overflow-hidden border-r border-border bg-surface-1"
      aria-label="Main navigation"
    >
      {/* ── Header: logo + collapse toggle ────────────────────── */}
      <div className="flex h-14 shrink-0 items-center border-b border-border overflow-hidden">
        <Link
          href="/dashboard"
          className="flex h-full flex-1 items-center gap-3 overflow-hidden px-3"
          aria-label="VANGUARD Home"
        >
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-foreground">
            <Radio className="h-4 w-4 text-bg" strokeWidth={2} />
          </div>
          <AnimatePresence>
            {!collapsed && (
              <motion.div
                initial={{ opacity: 0, x: -8 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -8 }}
                transition={{ duration: 0.15 }}
                className="overflow-hidden"
              >
                <p className="text-sm font-semibold tracking-tight text-foreground leading-none">
                  VANGUARD
                </p>
                <p className="text-[9px] font-semibold uppercase tracking-widest text-muted mt-0.5 leading-none">
                  Fleet Control
                </p>
              </motion.div>
            )}
          </AnimatePresence>
        </Link>

        <button
          onClick={onToggle}
          className="flex h-14 w-10 shrink-0 items-center justify-center text-muted transition-colors hover:bg-surface-2 hover:text-foreground focus-visible:outline-2 focus-visible:outline-brand"
          aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
        >
          <motion.div
            animate={{ rotate: collapsed ? 180 : 0 }}
            transition={{ duration: 0.2 }}
          >
            <ChevronRight className="h-4 w-4" />
          </motion.div>
        </button>
      </div>

      {/* ── Navigation groups ────────────────────────────────── */}
      <nav className="flex-1 overflow-y-auto overflow-x-hidden py-3">
        {NAV_GROUPS.map((group, gi) => {
          const isOpen = expandedGroups.has(group.label);
          return (
            <div key={group.label}>
              {gi > 0 && (
                <div
                  className="mx-3 my-2 border-t border-border"
                  style={{ boxShadow: "0 1px 0 rgba(255,255,255,0.03) inset" }}
                />
              )}
              <button
                onClick={() => toggleGroup(group.label)}
                className="flex w-full items-center gap-2 px-3 py-1.5 text-left"
                aria-expanded={isOpen}
              >
                {!collapsed && (
                  <>
                    <span className="flex-1 text-[10px] font-semibold uppercase tracking-widest text-faint">
                      {group.label}
                    </span>
                    <ChevronDown
                      className="h-3 w-3 text-faint transition-transform duration-200"
                      style={{ transform: isOpen ? "rotate(0deg)" : "rotate(-90deg)" }}
                    />
                  </>
                )}
                {collapsed && <span className="h-px flex-1 bg-border" />}
              </button>

              <AnimatePresence>
                {isOpen && (
                  <motion.ul
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ type: "spring", stiffness: 400, damping: 32 }}
                    className="overflow-hidden px-2 pb-1"
                  >
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
                  </motion.ul>
                )}
              </AnimatePresence>
            </div>
          );
        })}
      </nav>

      {/* ── Footer ────────────────────────────────────────────── */}
      <div className="shrink-0 border-t border-border">
        <div className="px-3 py-3">
          <AnimatePresence mode="wait">
            {!collapsed ? (
              <motion.div
                key="expanded-status"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.12 }}
                className="flex items-center justify-between rounded-lg border border-border bg-surface-2 px-3 py-2.5"
              >
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-semibold uppercase tracking-widest text-muted">
                      System Status
                    </span>
                    <span className="relative flex h-2 w-2 shrink-0" aria-label="Live">
                      <span
                        className="absolute inline-flex h-full w-full rounded-full animate-live-pulse"
                        style={{ background: "var(--hud)", opacity: 0.75 }}
                      />
                      <span
                        className="relative inline-flex h-2 w-2 rounded-full"
                        style={{ background: "var(--hud)" }}
                      />
                    </span>
                  </div>
                  <p className="font-mono mt-0.5 text-sm font-semibold tabular-nums text-foreground">
                    103 units online
                  </p>
                </div>
                <Wifi className="h-4 w-4 shrink-0 text-st-driving" />
              </motion.div>
            ) : (
              <motion.div
                key="rail-status"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.12 }}
                className="flex flex-col items-center gap-1 rounded-lg border border-border bg-surface-2 px-2 py-2.5"
                title="103 units online"
              >
                <span className="relative flex h-2 w-2" aria-label="Live">
                  <span
                    className="absolute inline-flex h-full w-full rounded-full animate-live-pulse"
                    style={{ background: "var(--hud)", opacity: 0.75 }}
                  />
                  <span
                    className="relative inline-flex h-2 w-2 rounded-full"
                    style={{ background: "var(--hud)" }}
                  />
                </span>
                <span className="font-mono text-[10px] tabular-nums text-muted">103</span>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <button
          onClick={toggleTheme}
          className="flex w-full items-center gap-3 border-t border-border px-4 py-2.5 text-muted transition-colors hover:bg-surface-2 hover:text-foreground focus-visible:outline-2 focus-visible:outline-brand"
          aria-label={theme === "dark" ? "Switch to light mode" : "Switch to dark mode"}
        >
          <div className="flex h-6 w-6 shrink-0 items-center justify-center">
            {theme === "dark" ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
          </div>
          {!collapsed && (
            <span className="text-sm font-medium">
              {theme === "dark" ? "Light Mode" : "Dark Mode"}
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
        className="group relative flex h-11 w-full items-center justify-center rounded-lg transition-colors focus-visible:outline-2 focus-visible:outline-brand"
        style={{
          background: isActive ? "var(--brand-soft)" : undefined,
        }}
        title={item.name}
        aria-label={item.name}
      >
        {/* Left accent bar */}
        <motion.div
          className="absolute left-0 top-1/2 -translate-y-1/2 h-5 w-0.5 rounded-r"
          style={{
            background: isActive ? "var(--brand)" : "transparent",
          }}
          animate={{ opacity: isActive ? 1 : 0 }}
          transition={{ duration: 0.15 }}
        />
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
      className="group relative flex items-center gap-3 rounded-lg px-3 py-2 transition-colors focus-visible:outline-2 focus-visible:outline-brand"
      style={{
        background: isActive ? "var(--brand-soft)" : undefined,
      }}
      aria-current={isActive ? "page" : undefined}
    >
      {/* Left accent bar */}
      <motion.div
        className="absolute left-0 top-1/2 -translate-y-1/2 h-5 w-0.5 rounded-r"
        style={{
          background: isActive ? "var(--brand)" : "transparent",
        }}
        animate={{ opacity: isActive ? 1 : 0 }}
        transition={{ duration: 0.15 }}
      />

      <Icon
        className="h-[18px] w-[18px] shrink-0 transition-colors"
        style={{
          color: isActive ? "var(--brand)" : "var(--text-muted)",
        }}
      />

      <span
        className="flex-1 text-sm font-medium truncate transition-colors"
        style={{
          color: isActive ? "var(--brand)" : "var(--text-muted)",
        }}
      >
        {item.name}
      </span>
    </Link>
  );
}
