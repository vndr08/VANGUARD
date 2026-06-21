"use client";

import { forwardRef, type ButtonHTMLAttributes, type ReactNode } from "react";
import { cx } from "./utils";

/* ─── Button ───────────────────────────────────────────────────────────────── */

/**
 * Button variants
 */
export type ButtonVariant = "primary" | "secondary" | "ghost" | "danger";
export type ButtonSize = "sm" | "md" | "icon";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  loading?: boolean;
  icon?: ReactNode;
  iconRight?: ReactNode;
}

/**
 * VANGUARD Button Component
 *
 * Design tokens: DESIGN.md §8 Components - Buttons
 * - Primary: brand fill, white/dark text
 * - Secondary: surface-2 + border
 * - Ghost: transparent, text-muted
 * - Danger: red fill
 *
 * Sizes:
 * - sm: compact padding
 * - md: default
 * - icon: square, aspect-ratio 1
 */
export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      variant = "primary",
      size = "md",
      loading = false,
      icon,
      iconRight,
      children,
      className,
      disabled,
      ...props
    },
    ref
  ) => {
    const baseStyles =
      "inline-flex items-center justify-center gap-2 font-semibold rounded-lg transition-all duration-100 focus-visible:outline-2 focus-visible:outline-offset-2 disabled:opacity-50 disabled:cursor-not-allowed select-none";

    const variantStyles: Record<ButtonVariant, string> = {
      primary: "bg-foreground text-bg hover:opacity-90",
      secondary:
        "bg-surface-2 text-foreground border border-border hover:bg-surface-3 hover:border-border-strong",
      ghost:
        "bg-transparent text-muted hover:bg-surface-2 hover:text-foreground",
      danger: "bg-st-offline text-white hover:bg-red-600",
    };

    const sizeStyles: Record<ButtonSize, string> = {
      sm: "px-3 py-1.5 text-label",
      md: "px-4 py-2 text-sm",
      icon: "p-2 aspect-square",
    };

    return (
      <button
        ref={ref}
        className={cx(baseStyles, variantStyles[variant], sizeStyles[size], className)}
        disabled={disabled || loading}
        {...props}
      >
        {loading ? (
          <LoadingSpinner size="sm" />
        ) : icon ? (
          <span className="shrink-0">{icon}</span>
        ) : null}
        {children}
        {iconRight && <span className="shrink-0">{iconRight}</span>}
      </button>
    );
  }
);

Button.displayName = "Button";

/* ─── Loading Spinner ──────────────────────────────────────────────────────── */

interface LoadingSpinnerProps {
  size?: "sm" | "md" | "lg";
}

export function LoadingSpinner({ size = "md" }: LoadingSpinnerProps) {
  const sizeStyles = {
    sm: "w-3 h-3 border",
    md: "w-4 h-4 border-2",
    lg: "w-6 h-6 border-2.5",
  };

  return (
    <span
      className={cx(
        "inline-block rounded-full border-border border-t-foreground",
        sizeStyles[size],
        "animate-spin"
      )}
      role="status"
      aria-label="Loading"
    />
  );
}

/* ─── Icon Button ──────────────────────────────────────────────────────────── */

/**
 * Icon-only button with tooltip support
 */
interface IconButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  icon: ReactNode;
  tooltip?: string;
  variant?: ButtonVariant;
  size?: "sm" | "md";
}

export const IconButton = forwardRef<HTMLButtonElement, IconButtonProps>(
  ({ icon, tooltip, variant = "ghost", size = "md", className, ...props }, ref) => {
    return (
      <Button
        ref={ref}
        variant={variant}
        size={size === "sm" ? "sm" : "icon"}
        className={cx(tooltip && "tooltip", className)}
        {...props}
      >
        {icon}
        {tooltip && <span data-tooltip={tooltip} className="sr-only" />}
      </Button>
    );
  }
);

IconButton.displayName = "IconButton";

export { cx };
