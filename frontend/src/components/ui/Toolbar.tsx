"use client";

import { type ReactNode } from "react";
import { cx } from "./utils";

/* ─── Toolbar ──────────────────────────────────────────────────────────────── */

/**
 * Toolbar container with consistent spacing
 * Design tokens: DESIGN.md §8 Components - Toolbar
 */
interface ToolbarProps {
  children: ReactNode;
  className?: string;
}

export function Toolbar({ children, className }: ToolbarProps) {
  return (
    <div
      className={cx(
        "flex items-center gap-2 px-3 py-2",
        "bg-surface-1 border border-border rounded-lg",
        className
      )}
    >
      {children}
    </div>
  );
}

/**
 * Toolbar divider
 */
export function ToolbarDivider() {
  return (
    <div className="w-px h-6 bg-border mx-1" />
  );
}

/**
 * Toolbar label
 */
export function ToolbarLabel({ children }: { children: ReactNode }) {
  return (
    <span className="text-label uppercase tracking-wide text-muted mr-1">
      {children}
    </span>
  );
}

/* ─── Filter Pills ─────────────────────────────────────────────────────────── */

/**
 * Filter pill (like status filter)
 */
interface FilterPillProps {
  label: string;
  active?: boolean;
  count?: number;
  onClick?: () => void;
  color?: "default" | "driving" | "idle" | "stop" | "offline";
}

export function FilterPill({
  label,
  active = false,
  count,
  onClick,
  color = "default",
}: FilterPillProps) {
  const colorStyles = {
    default: active
      ? "bg-foreground text-background"
      : "bg-surface-2 text-muted hover:bg-surface-3",
    driving: active
      ? "bg-st-driving text-white"
      : "bg-st-driving-bg text-st-driving hover:opacity-80",
    idle: active
      ? "bg-st-idle text-white"
      : "bg-st-idle-bg text-st-idle hover:opacity-80",
    stop: active
      ? "bg-st-stop text-white"
      : "bg-st-stop-bg text-st-stop hover:opacity-80",
    offline: active
      ? "bg-st-offline text-white"
      : "bg-st-offline-bg text-st-offline hover:opacity-80",
  };

  return (
    <button
      type="button"
      onClick={onClick}
      className={cx(
        "inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full",
        "text-sm font-medium transition-all duration-100",
        "focus-visible:outline-2 focus-visible:outline-offset-2",
        colorStyles[color]
      )}
    >
      {label}
      {count !== undefined && (
        <span className="text-xs tabular-nums opacity-70">({count})</span>
      )}
    </button>
  );
}

/* ─── Search Input ─────────────────────────────────────────────────────────── */

/**
 * Search input with icon
 */
interface SearchInputProps {
  placeholder?: string;
  value?: string;
  onChange?: (value: string) => void;
  className?: string;
}

export function SearchInput({
  placeholder = "Search...",
  value,
  onChange,
  className,
}: SearchInputProps) {
  return (
    <div className={cx("relative", className)}>
      <svg
        viewBox="0 0 16 16"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
        className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted pointer-events-none"
      >
        <circle cx="7" cy="7" r="4.5" />
        <path d="M10 10l3 3" strokeLinecap="round" />
      </svg>
      <input
        type="search"
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange?.(e.target.value)}
        className={cx(
          "w-full pl-9 pr-4 py-2",
          "bg-surface-1 border border-border rounded-lg",
          "text-sm text-foreground placeholder:text-faint",
          "focus:outline-none focus:border-brand focus:ring-2 focus:ring-brand-soft",
          "transition-colors duration-100"
        )}
      />
    </div>
  );
}

/* ─── View Toggle ──────────────────────────────────────────────────────────── */

/**
 * Toggle between table/map view
 */
interface ViewToggleProps {
  view: "table" | "map";
  onChange: (view: "table" | "map") => void;
}

export function ViewToggle({ view, onChange }: ViewToggleProps) {
  return (
    <div className="inline-flex rounded-lg bg-surface-2 p-0.5">
      <button
        type="button"
        onClick={() => onChange("table")}
        className={cx(
          "flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm font-medium",
          "transition-all duration-100",
          view === "table"
            ? "bg-surface-1 text-foreground shadow-sm"
            : "text-muted hover:text-foreground"
        )}
        aria-pressed={view === "table"}
      >
        <svg viewBox="0 0 16 16" fill="currentColor" className="w-4 h-4">
          <rect x="2" y="3" width="12" height="10" rx="1" />
          <path d="M2 6h12M6 6v7" stroke="currentColor" fill="none" strokeWidth="1" />
        </svg>
        Table
      </button>
      <button
        type="button"
        onClick={() => onChange("map")}
        className={cx(
          "flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm font-medium",
          "transition-all duration-100",
          view === "map"
            ? "bg-surface-1 text-foreground shadow-sm"
            : "text-muted hover:text-foreground"
        )}
        aria-pressed={view === "map"}
      >
        <svg viewBox="0 0 16 16" fill="currentColor" className="w-4 h-4">
          <path d="M8 2l4 2-4 3-4-3 4-2z" />
          <path d="M4 4l4 3v7l-4-3V4z" fillOpacity="0.5" />
          <path d="M12 4l-4 3v7l4-3V4z" />
        </svg>
        Map
      </button>
    </div>
  );
}

/* ─── Toolbar Button Group ────────────────────────────────────────────────── */

/**
 * Group of related toolbar buttons
 */
interface ToolbarGroupProps {
  children: ReactNode;
  label?: string;
}

export function ToolbarGroup({ children, label }: ToolbarGroupProps) {
  return (
    <div className="flex items-center gap-1">
      {label && <ToolbarLabel>{label}</ToolbarLabel>}
      {children}
    </div>
  );
}
