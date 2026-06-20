"use client";

import { usePathname } from "next/navigation";
import Link from "next/link";
import {
  BarChart3,
  Camera,
  ChevronDown,
  ClipboardList,
  Crosshair,
  Gauge,
  History,
  LayoutDashboard,
  MapPinned,
  Radio,
  Route,
  Settings,
  Shield,
  SlidersHorizontal,
  Truck,
  Users,
  Video,
  Volume2,
} from "lucide-react";
import { useTheme } from "@/components/ThemeProvider";
import { useState } from "react";

const navItems = [
  {
    label: "Monitor",
    items: [
      { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
      { name: "Realtime Monitor", href: "/tracking", icon: Radio },
      { name: "Locate", href: "/locate", icon: Crosshair },
      { name: "Geofence", href: "/geofences", icon: MapPinned },
    ],
  },
  {
    label: "Operation",
    items: [
      { name: "Task Monitor", href: "/tasks", icon: ClipboardList },
      { name: "Vehicle", href: "/vehicles", icon: Truck },
      { name: "Driver", href: "/drivers", icon: Users },
      { name: "History", href: "/history", icon: History },
      { name: "Accident", href: "/accidents", icon: Shield },
    ],
  },
  {
    label: "Evidence",
    items: [
      { name: "Report", href: "/reports", icon: BarChart3 },
      { name: "Camera Snapshot", href: "/snapshots", icon: Camera },
      { name: "Dashcam Monitor", href: "/dashcam", icon: Video },
    ],
  },
  {
    label: "Admin",
    items: [
      { name: "Control Panel", href: "/control", icon: SlidersHorizontal },
      { name: "Settings", href: "/settings", icon: Settings },
    ],
  },
];

export default function Sidebar() {
  const pathname = usePathname();
  const { theme, toggleTheme } = useTheme();
  const [collapsed, setCollapsed] = useState(false);

  return (
    <aside
      className={`fixed left-0 top-0 z-50 flex h-screen flex-col border-r border-zinc-200 bg-white transition-all duration-300 dark:border-zinc-800 dark:bg-zinc-950 ${
        collapsed ? "w-[72px]" : "w-[260px]"
      }`}
    >
      {/* Logo */}
      <div className="flex h-16 items-center border-b border-zinc-200 px-4 dark:border-zinc-800">
        <Link href="/dashboard" className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-zinc-900 dark:bg-white">
            <Radio className="h-5 w-5 text-white dark:text-zinc-900" />
          </div>
          {!collapsed && (
            <div>
              <h1 className="text-base font-bold tracking-wide text-zinc-900 dark:text-white">
                VANGUARD
              </h1>
              <p className="text-[10px] font-medium uppercase tracking-widest text-zinc-500">
                Fleet Control
              </p>
            </div>
          )}
        </Link>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto py-4">
        {navItems.map((section) => (
          <div key={section.label} className="mb-4 px-3">
            {!collapsed && (
              <p className="mb-2 px-3 text-[10px] font-semibold uppercase tracking-widest text-zinc-400">
                {section.label}
              </p>
            )}
            <div className="space-y-0.5">
              {section.items.map((item) => {
                const isActive =
                  pathname === item.href || pathname?.startsWith(item.href + "/");

                return (
                  <Link
                    key={item.name}
                    href={item.href}
                    className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors ${
                      isActive
                        ? "bg-zinc-900 text-white dark:bg-white dark:text-zinc-900"
                        : "text-zinc-600 hover:bg-zinc-100 hover:text-zinc-900 dark:text-zinc-400 dark:hover:bg-zinc-900 dark:hover:text-white"
                    }`}
                  >
                    <item.icon className="h-[18px] w-[18px] shrink-0" />
                    {!collapsed && <span>{item.name}</span>}
                  </Link>
                );
              })}
            </div>
          </div>
        ))}
      </nav>

      {/* Footer */}
      <div className="border-t border-zinc-200 p-4 dark:border-zinc-800">
        {/* Status */}
        {!collapsed && (
          <div className="mb-3 rounded-lg border border-zinc-200 bg-zinc-50 p-3 dark:border-zinc-800 dark:bg-zinc-900">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-semibold uppercase tracking-wider text-zinc-500">
                System Status
              </span>
              <span className="h-2 w-2 rounded-full bg-emerald-500" />
            </div>
            <p className="mt-1.5 text-sm font-bold text-zinc-900 dark:text-white">
              103 units online
            </p>
          </div>
        )}

        {/* Theme Toggle */}
        <button
          onClick={toggleTheme}
          className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-zinc-600 transition-colors hover:bg-zinc-100 dark:text-zinc-400 dark:hover:bg-zinc-900 dark:hover:text-white"
        >
          {theme === "dark" ? (
            <>
              <svg className="h-[18px] w-[18px] shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
              </svg>
              {!collapsed && <span>Light Mode</span>}
            </>
          ) : (
            <>
              <svg className="h-[18px] w-[18px] shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
              </svg>
              {!collapsed && <span>Dark Mode</span>}
            </>
          )}
        </button>
      </div>
    </aside>
  );
}
