"use client";

import { useState, useEffect, useRef } from "react";
import { motion } from "motion/react";
import {
  Bell, AlertTriangle, MapPinOff, Zap, ShieldAlert,
  CheckCheck, X, Gauge, ArrowRight,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useReducedMotion } from "@/hooks/useReducedMotion";
import type { Notification, NotificationType } from "@/hooks/useNotifications";

const TYPE_META: Record<NotificationType, { icon: React.ReactNode; colorVar: string; label: string }> = {
  speeding:     { icon: <Gauge className="h-4 w-4" />,       colorVar: "var(--signal)",     label: "Speeding" },
  geofence_in:  { icon: <MapPinOff className="h-4 w-4" />,   colorVar: "var(--brand)",      label: "Geofence In" },
  geofence_out: { icon: <MapPinOff className="h-4 w-4" />,    colorVar: "var(--st-stop)",    label: "Geofence Out" },
  engine_cut:   { icon: <Zap className="h-4 w-4" />,          colorVar: "var(--st-offline)", label: "Engine Cut" },
  incident:     { icon: <ShieldAlert className="h-4 w-4" />,  colorVar: "var(--st-offline)", label: "Insiden" },
  offline:      { icon: <AlertTriangle className="h-4 w-4" />, colorVar: "var(--st-offline)", label: "Offline" },
};

function formatRelative(date: Date): string {
  const diff = Date.now() - date.getTime();
  const m = Math.floor(diff / 60000);
  if (m < 1) return "Baru saja";
  if (m < 60) return `${m} menit lalu`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h} jam lalu`;
  return `${Math.floor(h / 24)} hari lalu`;
}

interface NotificationDropdownProps {
  notifications: Notification[];
  unreadCount: number;
  onMarkRead: (id: string) => void;
  onMarkAllRead: () => void;
  onDismiss: (id: string) => void;
  onClose: () => void;
}

export function NotificationDropdown({
  notifications,
  unreadCount,
  onMarkRead,
  onMarkAllRead,
  onDismiss,
  onClose,
}: NotificationDropdownProps) {
  const router = useRouter();
  const reducedMotion = useReducedMotion();
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        onClose();
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [onClose]);

  const handleNotificationClick = (n: Notification) => {
    onMarkRead(n.id);
    if (n.vehicleId && n.plateNumber) {
      router.push(`/locate?q=${encodeURIComponent(n.plateNumber)}`);
    }
    onClose();
  };

  const active = notifications.filter(n => !n.dismissed).slice(0, 10);

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: -4, scale: 0.98 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: -4, scale: 0.98 }}
      transition={reducedMotion ? { duration: 0 } : { type: "spring", stiffness: 400, damping: 30 }}
      className="absolute right-0 top-full mt-2 w-96 rounded-xl border border-border bg-surface-1 shadow-elev-3 overflow-hidden z-50"
      role="dialog"
      aria-label="Notifications"
    >
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-border bg-surface-2">
        <div className="flex items-center gap-2">
          <Bell className="h-4 w-4 text-muted" />
          <h3 className="text-sm font-semibold text-foreground">Notifikasi</h3>
          {unreadCount > 0 && (
            <span className="inline-flex h-5 w-5 items-center justify-center rounded-full bg-st-offline text-[10px] font-semibold text-white">
              {unreadCount}
            </span>
          )}
        </div>
        <div className="flex items-center gap-2">
          {unreadCount > 0 && (
            <button
              onClick={onMarkAllRead}
              className="flex items-center gap-1 text-xs text-muted hover:text-foreground transition-colors focus-visible:outline-2 focus-visible:outline-brand rounded px-1.5 py-1"
              aria-label="Tandai semua dibaca"
            >
              <CheckCheck className="h-3.5 w-3.5" />
              <span>Semua dibaca</span>
            </button>
          )}
          <button
            onClick={onClose}
            className="rounded p-1 text-muted hover:bg-surface-3 hover:text-foreground transition-colors focus-visible:outline-2 focus-visible:outline-brand"
            aria-label="Tutup notifikasi"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* List */}
      <div className="max-h-[360px] overflow-y-auto divide-y divide-border">
        {active.length === 0 && (
          <div className="py-8 text-center text-sm text-muted">
            Tidak ada notifikasi
          </div>
        )}
        {active.map(n => {
          const meta = TYPE_META[n.type];
          return (
            <button
              key={n.id}
              onClick={() => handleNotificationClick(n)}
              className={`w-full flex items-start gap-3 px-4 py-3 text-left transition-colors hover:bg-surface-2 focus-visible:outline-2 focus-visible:outline-brand ${
                !n.read ? "bg-surface-2/50" : ""
              }`}
            >
              <div
                className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg"
                style={{ background: `${meta.colorVar}20`, color: meta.colorVar }}
              >
                {meta.icon}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-2">
                  <p className="text-sm font-semibold text-foreground truncate">{n.title}</p>
                  {!n.read && (
                    <span className="h-2 w-2 rounded-full bg-brand shrink-0" />
                  )}
                </div>
                <p className="mt-0.5 text-xs text-muted line-clamp-2">{n.message}</p>
                <p className="mt-1 text-[10px] text-faint tabular-nums">{formatRelative(n.timestamp)}</p>
              </div>
              {n.vehicleId && (
                <ArrowRight className="mt-1 h-3.5 w-3.5 shrink-0 text-faint" />
              )}
            </button>
          );
        })}
      </div>
    </motion.div>
  );
}
