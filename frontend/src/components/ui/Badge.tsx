"use client";

import { type ReactNode } from "react";
import { cx } from "./utils";

/* ─── Status Types ─────────────────────────────────────────────────────────── */

/**
 * Vehicle status from DESIGN.md §2.3
 */
export type VehicleStatus = "driving" | "idle" | "stop" | "offline" | "delayed";

/**
 * Task status from DESIGN.md §2.3
 */
export type TaskStatus = "waiting" | "assigned" | "progress" | "unloading" | "completed";

/**
 * Generic badge variants
 */
export type BadgeVariant = "default" | "brand" | "success" | "warning" | "danger";

/* ─── Static Color Maps ─────────────────────────────────────────────────────── */

/**
 * Status pill background + text colors (static to avoid Tailwind JIT purging)
 */
const STATUS_PILL_STYLES: Record<VehicleStatus, string> = {
  driving: "bg-st-driving-bg text-st-driving",
  idle: "bg-st-idle-bg text-st-idle",
  stop: "bg-st-stop-bg text-st-stop",
  offline: "bg-st-offline-bg text-st-offline",
  delayed: "bg-st-delayed-bg text-st-delayed",
};

/**
 * Status dot colors (static)
 */
const STATUS_DOT_STYLES: Record<VehicleStatus, string> = {
  driving: "bg-st-driving",
  idle: "bg-st-idle",
  stop: "bg-st-stop",
  offline: "bg-st-offline",
  delayed: "bg-st-delayed",
};

/**
 * Status display labels and icons
 */
const STATUS_CONFIG: Record<
  VehicleStatus,
  { label: string; icon: ReactNode }
> = {
  driving: { label: "Driving", icon: <PlayIcon /> },
  idle: { label: "Idle", icon: <PauseIcon /> },
  stop: { label: "Stop", icon: <StopIcon /> },
  offline: { label: "Offline", icon: <OfflineIcon /> },
  delayed: { label: "Delayed", icon: <DelayedIcon /> },
};

const TASK_STATUS_CONFIG: Record<
  TaskStatus,
  { label: string; bgClass: string; colorVar: string }
> = {
  waiting: { label: "Waiting", bgClass: "bg-st-stop-bg", colorVar: "var(--task-waiting)" },
  assigned: { label: "Assigned", bgClass: "bg-brand-soft", colorVar: "var(--brand)" },
  progress: { label: "Progress", bgClass: "bg-st-driving-bg", colorVar: "var(--st-driving)" },
  unloading: { label: "Unloading", bgClass: "bg-st-idle-bg", colorVar: "var(--st-idle)" },
  completed: { label: "Completed", bgClass: "bg-st-driving-bg", colorVar: "var(--task-completed)" },
};

/* ─── Status Pill ──────────────────────────────────────────────────────────── */

/**
 * Vehicle status pill with icon and dot
 * Design tokens: DESIGN.md §8 Components - Status Pill
 */
interface StatusPillProps {
  status: VehicleStatus;
  showIcon?: boolean;
  showDot?: boolean;
  live?: boolean; // Add pulse animation for driving
  className?: string;
}

export function StatusPill({
  status,
  showIcon = true,
  showDot = true,
  live = false,
  className,
}: StatusPillProps) {
  const config = STATUS_CONFIG[status];
  const isLive = live && status === "driving";

  return (
    <span
      className={cx(
        "inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-sm font-semibold",
        STATUS_PILL_STYLES[status],
        isLive && "animate-live-pulse",
        className
      )}
    >
      {showDot && (
        <span className={cx("w-1.5 h-1.5 rounded-full", STATUS_DOT_STYLES[status])} />
      )}
      {showIcon && <span className="w-3 h-3">{config.icon}</span>}
      {config.label}
    </span>
  );
}

/* ─── Task Status Badge ────────────────────────────────────────────────────── */

/**
 * Task status badge
 */
interface TaskStatusBadgeProps {
  status: TaskStatus;
  className?: string;
}

export function TaskStatusBadge({ status, className }: TaskStatusBadgeProps) {
  const config = TASK_STATUS_CONFIG[status];

  return (
    <span
      className={cx(
        "inline-flex items-center px-2 py-0.5 rounded text-label font-semibold uppercase tracking-wide",
        config.bgClass,
        className
      )}
      style={{ color: config.colorVar }}
    >
      {config.label}
    </span>
  );
}

/* ─── Generic Badge ────────────────────────────────────────────────────────── */

/**
 * Generic badge with variants (static)
 */
const BADGE_VARIANT_STYLES: Record<BadgeVariant, string> = {
  default: "bg-surface-2 text-muted",
  brand: "bg-brand-soft text-brand",
  success: "bg-st-driving-bg text-st-driving",
  warning: "bg-st-idle-bg text-st-idle",
  danger: "bg-st-offline-bg text-st-offline",
};

interface BadgeProps {
  variant?: BadgeVariant;
  children: ReactNode;
  className?: string;
}

export function Badge({ variant = "default", children, className }: BadgeProps) {
  return (
    <span
      className={cx(
        "inline-flex items-center px-2 py-0.5 rounded text-label font-semibold uppercase tracking-wide",
        BADGE_VARIANT_STYLES[variant],
        className
      )}
    >
      {children}
    </span>
  );
}

/* ─── Status Icons (inline SVG) ────────────────────────────────────────────── */

function PlayIcon() {
  return (
    <svg viewBox="0 0 16 16" fill="currentColor" className="w-full h-full">
      <path d="M4 3.5l9 4.5-9 4.5V3.5z" />
    </svg>
  );
}

function PauseIcon() {
  return (
    <svg viewBox="0 0 16 16" fill="currentColor" className="w-full h-full">
      <rect x="3" y="3" width="3.5" height="10" rx="0.5" />
      <rect x="9.5" y="3" width="3.5" height="10" rx="0.5" />
    </svg>
  );
}

function StopIcon() {
  return (
    <svg viewBox="0 0 16 16" fill="currentColor" className="w-full h-full">
      <rect x="3" y="3" width="10" height="10" rx="1" />
    </svg>
  );
}

function OfflineIcon() {
  return (
    <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-full h-full">
      <circle cx="8" cy="8" r="5.5" />
      <line x1="4" y1="4" x2="12" y2="12" />
    </svg>
  );
}

function DelayedIcon() {
  return (
    <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-full h-full">
      <circle cx="8" cy="8" r="5.5" />
      <path d="M8 4.5V8l2.5 2" />
    </svg>
  );
}
