"use client";

import { type ReactNode, type HTMLAttributes } from "react";
import { cx } from "./utils";

/* ─── Card ────────────────────────────────────────────────────────────────── */

/**
 * Card variants
 * - default: surface-1 + border + elev-1
 * - elevated: surface-2 + border + elev-2
 * - glass: backdrop-blur + semi-transparent (for map overlays)
 */
export type CardVariant = "default" | "elevated" | "glass";

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  variant?: CardVariant;
  padding?: "none" | "sm" | "md" | "lg";
  hoverable?: boolean;
  header?: ReactNode;
  footer?: ReactNode;
}

export function Card({
  variant = "default",
  padding = "md",
  hoverable = false,
  header,
  footer,
  children,
  className,
  ...props
}: CardProps) {
  const variantStyles: Record<CardVariant, string> = {
    default: "bg-surface-1 border border-border shadow-elev-1",
    elevated: "bg-surface-2 border border-border shadow-elev-2",
    glass: "glass border border-border-strong",
  };

  const paddingStyles: Record<NonNullable<CardProps["padding"]>, string> = {
    none: "",
    sm: "p-3",
    md: "p-4",
    lg: "p-6",
  };

  return (
    <div
      className={cx(
        "rounded-xl",
        variantStyles[variant],
        hoverable && "transition-all duration-100 hover:border-border-strong hover:shadow-elev-2",
        className
      )}
      {...props}
    >
      {header && (
        <div className="px-4 py-3 border-b border-border">
          {header}
        </div>
      )}
      <div className={paddingStyles[padding]}>
        {children}
      </div>
      {footer && (
        <div className="px-4 py-3 border-t border-border bg-surface-2 rounded-b-xl">
          {footer}
        </div>
      )}
    </div>
  );
}

/* ─── Card Header ──────────────────────────────────────────────────────────── */

/**
 * Card header with title and optional actions
 */
interface CardHeaderProps {
  title: string;
  subtitle?: string;
  actions?: ReactNode;
  className?: string;
}

export function CardHeader({ title, subtitle, actions, className }: CardHeaderProps) {
  return (
    <div className={cx("flex items-start justify-between gap-4", className)}>
      <div>
        <h3 className="text-h2 font-semibold text-foreground">{title}</h3>
        {subtitle && (
          <p className="mt-0.5 text-sm text-muted">{subtitle}</p>
        )}
      </div>
      {actions && (
        <div className="flex items-center gap-2 shrink-0">
          {actions}
        </div>
      )}
    </div>
  );
}

/* ─── Stat Card ────────────────────────────────────────────────────────────── */

/**
 * KPI stat card for dashboard
 * Design tokens: DESIGN.md §8 Components - KPI card
 */
interface StatCardProps {
  label: string;
  value: string | number;
  delta?: {
    value: number;
    positive?: boolean;
    label?: string;
  };
  icon?: ReactNode;
  trend?: "up" | "down" | "neutral";
  className?: string;
}

export function StatCard({
  label,
  value,
  delta,
  icon,
  trend,
  className,
}: StatCardProps) {
  return (
    <Card padding="md" className={cx("relative overflow-hidden", className)}>
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1 min-w-0">
          <p className="text-label uppercase tracking-wide text-muted mb-2">
            {label}
          </p>
          <p className="text-display font-semibold tabular-nums tracking-tight text-foreground">
            {value}
          </p>
          {delta && (
            <p
              className={cx(
                "mt-1 text-sm tabular-nums",
                delta.positive ? "text-st-driving" : "text-st-offline"
              )}
            >
              {delta.positive ? "+" : ""}
              {delta.value}
              {delta.label && (
                <span className="ml-1 text-muted">{delta.label}</span>
              )}
            </p>
          )}
        </div>
        {icon && (
          <div className="w-10 h-10 rounded-lg bg-surface-2 flex items-center justify-center text-muted shrink-0">
            {icon}
          </div>
        )}
      </div>
      {/* Optional trend indicator */}
      {trend && (
        <div className="absolute bottom-3 right-3">
          <TrendIndicator trend={trend} />
        </div>
      )}
    </Card>
  );
}

/* ─── Trend Indicator ──────────────────────────────────────────────────────── */

function TrendIndicator({ trend }: { trend: "up" | "down" | "neutral" }) {
  const colors = {
    up: "text-st-driving",
    down: "text-st-offline",
    neutral: "text-muted",
  };

  const paths = {
    up: "M8 12V4m0 0l4 4m-4-4L4 8",
    down: "M8 4v8m0 0l4-4m-4 4L4 8",
    neutral: "M5 8h6",
  };

  return (
    <svg
      viewBox="0 0 16 16"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={cx("w-4 h-4", colors[trend])}
    >
      <path d={paths[trend]} />
    </svg>
  );
}

/* ─── Skeleton ─────────────────────────────────────────────────────────────── */

/**
 * Skeleton loading placeholder
 */
interface SkeletonProps {
  width?: string | number;
  height?: string | number;
  rounded?: "sm" | "md" | "lg" | "full";
  className?: string;
}

export function Skeleton({
  width,
  height,
  rounded = "md",
  className,
}: SkeletonProps) {
  const roundedStyles = {
    sm: "rounded",
    md: "rounded-md",
    lg: "rounded-lg",
    full: "rounded-full",
  };

  return (
    <div
      className={cx(
        "bg-surface-2 animate-skeleton-shimmer",
        roundedStyles[rounded],
        className
      )}
      style={{
        width: typeof width === "number" ? `${width}px` : width,
        height: typeof height === "number" ? `${height}px` : height,
      }}
    />
  );
}

/* ─── Empty State ──────────────────────────────────────────────────────────── */

/**
 * Empty state with icon and CTA
 */
interface EmptyStateProps {
  icon?: ReactNode;
  title: string;
  description?: string;
  action?: ReactNode;
  className?: string;
}

export function EmptyState({
  icon,
  title,
  description,
  action,
  className,
}: EmptyStateProps) {
  return (
    <div className={cx("flex flex-col items-center justify-center py-12 px-4 text-center", className)}>
      {icon && (
        <div className="w-12 h-12 text-muted opacity-50 mb-4">
          {icon}
        </div>
      )}
      <h3 className="text-h2 font-semibold text-foreground mb-1">{title}</h3>
      {description && (
        <p className="text-sm text-muted max-w-sm mb-4">{description}</p>
      )}
      {action}
    </div>
  );
}
