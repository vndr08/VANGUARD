"use client";

import {
  type ReactNode,
  type HTMLAttributes,
  type ThHTMLAttributes,
  type TdHTMLAttributes,
} from "react";
import { cx } from "./utils";

/* ─── Table Container ──────────────────────────────────────────────────────── */

/**
 * Table wrapper with sticky header and overflow handling
 */
interface TableContainerProps extends HTMLAttributes<HTMLDivElement> {
  scrollable?: boolean;
  maxHeight?: string;
}

export function TableContainer({
  scrollable = true,
  maxHeight,
  children,
  className,
  ...props
}: TableContainerProps) {
  return (
    <div
      className={cx(
        "bg-surface-1 border border-border rounded-xl overflow-hidden",
        scrollable && "overflow-auto",
        className
      )}
      style={maxHeight ? { maxHeight } : undefined}
      {...props}
    >
      <table className="w-full border-collapse">
        {children}
      </table>
    </div>
  );
}

/* ─── Table Header ──────────────────────────────────────────────────────────── */

interface TableHeadProps extends HTMLAttributes<HTMLTableSectionElement> {}

export function TableHead({ children, className, ...props }: TableHeadProps) {
  return (
    <thead
      className={cx("bg-surface-2 border-b border-border sticky top-0 z-10", className)}
      {...props}
    >
      {children}
    </thead>
  );
}

interface TableHeadCellProps extends ThHTMLAttributes<HTMLTableCellElement> {
  sortable?: boolean;
  sorted?: "asc" | "desc" | false;
  width?: string | number;
}

export function TableHeadCell({
  sortable,
  sorted,
  width,
  children,
  className,
  ...props
}: TableHeadCellProps) {
  return (
    <th
      className={cx(
        "px-4 py-3 text-left text-label font-semibold uppercase tracking-wide text-muted",
        sortable && "sortable cursor-pointer select-none hover:text-foreground",
        className
      )}
      style={width ? { width: typeof width === "number" ? `${width}px` : width } : undefined}
      {...props}
    >
      <span className="inline-flex items-center gap-1">
        {children}
        {sortable && (
          <SortIcon sorted={sorted} />
        )}
      </span>
    </th>
  );
}

function SortIcon({ sorted }: { sorted?: "asc" | "desc" | false }) {
  if (!sorted) {
    return (
      <svg viewBox="0 0 16 16" fill="currentColor" className="w-3 h-3 opacity-30">
        <path d="M8 3l3 4H5l3-4zM8 13l-3-4h6l-3 4z" />
      </svg>
    );
  }

  if (sorted === "asc") {
    return (
      <svg viewBox="0 0 16 16" fill="currentColor" className="w-3 h-3">
        <path d="M8 4l4 5H4l4-5z" />
      </svg>
    );
  }

  return (
    <svg viewBox="0 0 16 16" fill="currentColor" className="w-3 h-3">
      <path d="M8 12l4-5H4l4 5z" />
    </svg>
  );
}

/* ─── Table Body ───────────────────────────────────────────────────────────── */

interface TableBodyProps extends HTMLAttributes<HTMLTableSectionElement> {}

export function TableBody({ children, className, ...props }: TableBodyProps) {
  return (
    <tbody className={cx("divide-y divide-border", className)} {...props}>
      {children}
    </tbody>
  );
}

interface TableRowProps extends HTMLAttributes<HTMLTableRowElement> {
  selectable?: boolean;
  selected?: boolean;
  onClick?: () => void;
}

export function TableRow({
  selectable,
  selected,
  onClick,
  children,
  className,
  ...props
}: TableRowProps) {
  return (
    <tr
      className={cx(
        "transition-colors duration-100",
        "hover:bg-surface-2",
        selected && "bg-brand-soft",
        selectable && "cursor-pointer",
        className
      )}
      onClick={onClick}
      {...props}
    >
      {children}
    </tr>
  );
}

interface TableCellProps extends TdHTMLAttributes<HTMLTableCellElement> {
  numeric?: boolean;
  mono?: boolean;
}

export function TableCell({
  numeric,
  mono,
  children,
  className,
  ...props
}: TableCellProps) {
  return (
    <td
      className={cx(
        "px-4 py-3 text-sm",
        numeric && "tabular-nums text-right",
        mono && "font-mono text-xs",
        className
      )}
      {...props}
    >
      {children}
    </td>
  );
}

/* ─── Table Footer ─────────────────────────────────────────────────────────── */

interface TableFooterProps extends HTMLAttributes<HTMLTableSectionElement> {
  pagination?: ReactNode;
}

export function TableFooter({ pagination, children, className, ...props }: TableFooterProps) {
  return (
    <tfoot className={cx("bg-surface-2 border-t border-border", className)} {...props}>
      <tr>
        <td colSpan={100} className="px-4 py-3">
          <div className="flex items-center justify-between">
            {children && (
              <span className="text-sm text-muted">{children}</span>
            )}
            {pagination && (
              <div className="ml-auto">{pagination}</div>
            )}
          </div>
        </td>
      </tr>
    </tfoot>
  );
}

/* ─── Table Cell Variants ─────────────────────────────────────────────────── */

/**
 * Cell with vehicle plate (mono, prominent)
 */
export function PlateCell({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <td className={cx("px-4 py-3", className)}>
      <span className="font-mono text-sm font-semibold tabular-nums">
        {children}
      </span>
    </td>
  );
}

/**
 * Cell with status pill
 */
export function StatusCell({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <td className={cx("px-4 py-3", className)}>
      {children}
    </td>
  );
}

/**
 * Cell with time (right-aligned, mono, muted)
 */
export function TimeCell({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <td className={cx("px-4 py-3 text-right", className)}>
      <span className="font-mono text-sm tabular-nums text-muted">
        {children}
      </span>
    </td>
  );
}

/**
 * Cell with coordinates (mono, small)
 */
export function CoordsCell({
  lat,
  lng,
  className,
}: {
  lat: number;
  lng: number;
  className?: string;
}) {
  return (
    <td className={cx("px-4 py-3", className)}>
      <span className="font-mono text-xs tabular-nums text-faint">
        {lat.toFixed(5)}, {lng.toFixed(5)}
      </span>
    </td>
  );
}

/* ─── Grouped Table Header ─────────────────────────────────────────────────── */

/**
 * Grouped rows with collapsible header
 */
interface TableGroupHeaderProps {
  label: string;
  count?: number;
  collapsed?: boolean;
  onToggle?: () => void;
  colSpan?: number;
}

export function TableGroupHeader({
  label,
  count,
  collapsed,
  onToggle,
  colSpan = 1,
}: TableGroupHeaderProps) {
  return (
    <tr
      className="bg-surface-3 cursor-pointer select-none"
      onClick={onToggle}
    >
      <td colSpan={colSpan} className="px-4 py-2">
        <div className="flex items-center gap-2">
          <svg
            viewBox="0 0 16 16"
            fill="currentColor"
            className={cx(
              "w-3 h-3 text-muted transition-transform duration-100",
              collapsed && "-rotate-90"
            )}
          >
            <path d="M4 6l4 4 4-4" />
          </svg>
          <span className="text-label font-semibold uppercase tracking-wide text-muted">
            {label}
          </span>
          {count !== undefined && (
            <span className="text-label text-muted ml-1">({count})</span>
          )}
        </div>
      </td>
    </tr>
  );
}
