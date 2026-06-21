"use client";

import {
  createContext,
  useContext,
  useState,
  useCallback,
  type ReactNode,
} from "react";
import { cx } from "./utils";

/* ─── Types ─────────────────────────────────────────────────────────────────── */

type ToastType = "success" | "error" | "warning" | "info";

interface Toast {
  id: string;
  type: ToastType;
  title: string;
  message?: string;
  duration?: number;
}

interface ToastContextValue {
  toasts: Toast[];
  addToast: (toast: Omit<Toast, "id">) => void;
  removeToast: (id: string) => void;
  success: (title: string, message?: string) => void;
  error: (title: string, message?: string) => void;
  warning: (title: string, message?: string) => void;
  info: (title: string, message?: string) => void;
}

/* ─── Context ──────────────────────────────────────────────────────────────── */

const ToastContext = createContext<ToastContextValue | null>(null);

export function useToast(): ToastContextValue {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error("useToast must be used within ToastProvider");
  }
  return context;
}

/* ─── Provider ─────────────────────────────────────────────────────────────── */

interface ToastProviderProps {
  children: ReactNode;
}

export function ToastProvider({ children }: ToastProviderProps) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const addToast = useCallback((toast: Omit<Toast, "id">) => {
    const id = `toast-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
    const duration = toast.duration ?? 4000;

    setToasts((prev) => [...prev, { ...toast, id }]);

    // Auto-dismiss
    if (duration > 0) {
      setTimeout(() => {
        setToasts((prev) => prev.filter((t) => t.id !== id));
      }, duration);
    }
  }, []);

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const success = useCallback(
    (title: string, message?: string) => addToast({ type: "success", title, message }),
    [addToast]
  );

  const error = useCallback(
    (title: string, message?: string) => addToast({ type: "error", title, message, duration: 6000 }),
    [addToast]
  );

  const warning = useCallback(
    (title: string, message?: string) => addToast({ type: "warning", title, message }),
    [addToast]
  );

  const info = useCallback(
    (title: string, message?: string) => addToast({ type: "info", title, message }),
    [addToast]
  );

  return (
    <ToastContext.Provider value={{ toasts, addToast, removeToast, success, error, warning, info }}>
      {children}
      <ToastList toasts={toasts} onRemove={removeToast} />
    </ToastContext.Provider>
  );
}

/* ─── Toast List ──────────────────────────────────────────────────────────── */

interface ToastListProps {
  toasts: Toast[];
  onRemove: (id: string) => void;
}

function ToastList({ toasts, onRemove }: ToastListProps) {
  if (toasts.length === 0) return null;

  return (
    <div className="fixed bottom-4 right-4 z-toast flex flex-col gap-2 pointer-events-none">
      {toasts.map((toast, index) => (
        <ToastItem
          key={toast.id}
          toast={toast}
          onRemove={() => onRemove(toast.id)}
          style={{ "--index": index } as React.CSSProperties}
        />
      ))}
    </div>
  );
}

/* ─── Individual Toast ─────────────────────────────────────────────────────── */

interface ToastItemProps {
  toast: Toast;
  onRemove: () => void;
  style?: React.CSSProperties;
}

function ToastItem({ toast, onRemove, style }: ToastItemProps) {
  const config = TOAST_CONFIG[toast.type];

  return (
    <div
      className={cx(
        "pointer-events-auto",
        "flex items-start gap-3",
        "px-4 py-3",
        "bg-surface-1 border border-border rounded-lg",
        "shadow-elev-2",
        "animate-slide-in",
        "max-w-sm"
      )}
      style={{
        borderLeftWidth: "3px",
        borderLeftColor: config.color,
        animationDelay: `calc(var(--index, 0) * 50ms)`,
        ...style,
      }}
      role="alert"
    >
      {/* Icon */}
      <span className="shrink-0 mt-0.5">{config.icon}</span>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold text-foreground">{toast.title}</p>
        {toast.message && (
          <p className="mt-0.5 text-sm text-muted">{toast.message}</p>
        )}
      </div>

      {/* Dismiss */}
      <button
        onClick={onRemove}
        className="shrink-0 p-1 rounded text-muted hover:text-foreground hover:bg-surface-2 transition-colors"
        aria-label="Dismiss"
      >
        <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-4 h-4">
          <path d="M4 4l8 8M12 4l-8 8" strokeLinecap="round" />
        </svg>
      </button>
    </div>
  );
}

/* ─── Toast Config ─────────────────────────────────────────────────────────── */

const TOAST_CONFIG: Record<
  ToastType,
  { color: string; icon: ReactNode }
> = {
  success: {
    color: "var(--st-driving)",
    icon: (
      <svg viewBox="0 0 16 16" fill="none" stroke="var(--st-driving)" strokeWidth="1.5" className="w-4 h-4">
        <circle cx="8" cy="8" r="5.5" />
        <path d="M5 8l2 2 4-4" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    ),
  },
  error: {
    color: "var(--st-offline)",
    icon: (
      <svg viewBox="0 0 16 16" fill="none" stroke="var(--st-offline)" strokeWidth="1.5" className="w-4 h-4">
        <circle cx="8" cy="8" r="5.5" />
        <path d="M8 5v4M8 11v.5" strokeLinecap="round" />
      </svg>
    ),
  },
  warning: {
    color: "var(--signal)",
    icon: (
      <svg viewBox="0 0 16 16" fill="none" stroke="var(--signal)" strokeWidth="1.5" className="w-4 h-4">
        <path d="M8 2L14.5 13H1.5L8 2z" strokeLinejoin="round" />
        <path d="M8 6v3M8 11v.5" strokeLinecap="round" />
      </svg>
    ),
  },
  info: {
    color: "var(--brand)",
    icon: (
      <svg viewBox="0 0 16 16" fill="none" stroke="var(--brand)" strokeWidth="1.5" className="w-4 h-4">
        <circle cx="8" cy="8" r="5.5" />
        <path d="M8 7v4M8 5v.5" strokeLinecap="round" />
      </svg>
    ),
  },
};

/* ─── Legacy Support ──────────────────────────────────────────────────────── */

/**
 * Simple toast without full provider
 * For use in non-client components or quick prototyping
 */
interface SimpleToastProps {
  type: ToastType;
  message: string;
  onClose?: () => void;
}

export function SimpleToast({ type, message, onClose }: SimpleToastProps) {
  const config = TOAST_CONFIG[type];

  return (
    <div
      className={cx(
        "flex items-center gap-3 px-4 py-3",
        "bg-surface-1 border border-border rounded-lg shadow-elev-2",
        "max-w-sm"
      )}
      style={{
        borderLeftWidth: "3px",
        borderLeftColor: config.color,
      }}
    >
      <span className="shrink-0">{config.icon}</span>
      <span className="text-sm font-medium text-foreground flex-1">{message}</span>
      {onClose && (
        <button
          onClick={onClose}
          className="shrink-0 p-1 rounded text-muted hover:text-foreground"
        >
          <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-4 h-4">
            <path d="M4 4l8 8M12 4l-8 8" strokeLinecap="round" />
          </svg>
        </button>
      )}
    </div>
  );
}
