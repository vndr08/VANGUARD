"use client";

import { type ReactNode, useEffect, useCallback } from "react";
import { cx } from "./utils";
import { IconButton } from "./Button";

/* ─── Panel (Detail Drawer) ───────────────────────────────────────────────── */

/**
 * Detail panel / drawer that slides in from the right
 * Design tokens: DESIGN.md §8 Components - Detail panel
 */
interface PanelProps {
  open: boolean;
  onClose: () => void;
  title?: string;
  subtitle?: string;
  children: ReactNode;
  footer?: ReactNode;
  width?: number | string;
  className?: string;
}

export function Panel({
  open,
  onClose,
  title,
  subtitle,
  children,
  footer,
  width = 400,
  className,
}: PanelProps) {
  // Handle escape key
  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === "Escape" && open) {
        onClose();
      }
    },
    [open, onClose]
  );

  useEffect(() => {
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [handleKeyDown]);

  // Prevent body scroll when open
  useEffect(() => {
    if (open) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  if (!open) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/30 dark:bg-black/50 z-40 animate-fade-in"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Panel */}
      <aside
        className={cx(
          "fixed top-0 right-0 bottom-0 z-50",
          "bg-surface-1 border-l border-border",
          "shadow-elev-3",
          "flex flex-col",
          "animate-slide-in",
          className
        )}
        style={{
          width: typeof width === "number" ? `${width}px` : width,
        }}
        role="dialog"
        aria-modal="true"
        aria-labelledby={title ? "panel-title" : undefined}
      >
        {/* Header */}
        <header className="flex items-start justify-between gap-4 px-4 py-3 border-b border-border shrink-0">
          <div className="min-w-0 flex-1">
            {title && (
              <h2 id="panel-title" className="text-h2 font-semibold text-foreground truncate">
                {title}
              </h2>
            )}
            {subtitle && (
              <p className="mt-0.5 text-sm text-muted truncate">{subtitle}</p>
            )}
          </div>
          <IconButton
            icon={<CloseIcon />}
            onClick={onClose}
            aria-label="Close panel"
            variant="ghost"
          />
        </header>

        {/* Body */}
        <div className="flex-1 overflow-y-auto p-4">
          {children}
        </div>

        {/* Footer */}
        {footer && (
          <footer className="px-4 py-3 border-t border-border bg-surface-2 shrink-0">
            {footer}
          </footer>
        )}
      </aside>
    </>
  );
}

function CloseIcon() {
  return (
    <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" className="w-4 h-4">
      <path d="M4 4l8 8M12 4l-8 8" />
    </svg>
  );
}

/* ─── Panel Section ───────────────────────────────────────────────────────── */

/**
 * Section within a panel
 */
interface PanelSectionProps {
  title?: string;
  children: ReactNode;
  className?: string;
}

export function PanelSection({ title, children, className }: PanelSectionProps) {
  return (
    <div className={cx("mb-6", className)}>
      {title && (
        <h3 className="text-label uppercase tracking-wide text-muted mb-3">
          {title}
        </h3>
      )}
      {children}
    </div>
  );
}

/* ─── Panel Row ────────────────────────────────────────────────────────────── */

/**
 * Key-value row in a panel
 */
interface PanelRowProps {
  label: string;
  value: ReactNode;
  mono?: boolean;
  className?: string;
}

export function PanelRow({ label, value, mono, className }: PanelRowProps) {
  return (
    <div className={cx("flex items-baseline justify-between gap-4 py-1.5", className)}>
      <span className="text-sm text-muted shrink-0">{label}</span>
      <span
        className={cx(
          "text-sm text-foreground text-right truncate",
          mono && "font-mono text-xs"
        )}
      >
        {value}
      </span>
    </div>
  );
}

/* ─── Panel Divider ────────────────────────────────────────────────────────── */

/**
 * Visual divider within panel
 */
export function PanelDivider() {
  return <div className="my-4 border-t border-border" />;
}

/* ─── Layer Control Panel ─────────────────────────────────────────────────── */

/**
 * Glass panel for map layer controls
 * Design tokens: DESIGN.md §8 Glass dock
 */
interface LayerControlPanelProps {
  children: ReactNode;
  className?: string;
}

export function LayerControlPanel({ children, className }: LayerControlPanelProps) {
  return (
    <div
      className={cx(
        "absolute top-4 right-4 z-30",
        "glass",
        "border border-border-strong rounded-xl",
        "p-3 min-w-[180px]",
        "shadow-elev-2",
        className
      )}
    >
      {children}
    </div>
  );
}

interface LayerToggleProps {
  label: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
  color?: string;
}

export function LayerToggle({ label, checked, onChange, color }: LayerToggleProps) {
  return (
    <label className="flex items-center gap-2 py-1 cursor-pointer">
      <input
        type="checkbox"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
        className="sr-only"
      />
      <span
        className={cx(
          "w-4 h-4 rounded border-2 flex items-center justify-center transition-colors",
          checked ? "bg-brand border-brand" : "border-border-strong bg-surface-1"
        )}
        style={checked && color ? { backgroundColor: color, borderColor: color } : undefined}
      >
        {checked && (
          <svg viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="2" className="w-2.5 h-2.5 text-white">
            <path d="M2 6l3 3 5-5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        )}
      </span>
      <span className="text-sm text-foreground">{label}</span>
    </label>
  );
}
