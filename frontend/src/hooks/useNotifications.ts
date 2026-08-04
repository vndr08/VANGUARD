"use client";

import { useState, useEffect, useCallback } from "react";

export type NotificationType = "speeding" | "geofence_in" | "geofence_out" | "engine_cut" | "incident" | "offline";

export interface Notification {
  id: string;
  type: NotificationType;
  title: string;
  message: string;
  vehicleId?: number;
  plateNumber?: string;
  speed?: number;
  speedLimit?: number;
  timestamp: Date;
  read: boolean;
  dismissed: boolean;
}

const INITIAL_NOTIFICATIONS: Notification[] = [
  {
    id: "n1",
    type: "speeding",
    title: "Melebihi Batas Kecepatan",
    message: "B 5678 TGP · 82 Km/j di Jl. Tol Jakarta-Cikampek",
    vehicleId: 2,
    plateNumber: "B 5678 TGP",
    speed: 82,
    speedLimit: 80,
    timestamp: new Date(Date.now() - 3 * 60 * 1000),
    read: false,
    dismissed: false,
  },
  {
    id: "n2",
    type: "geofence_out",
    title: "Keluar Zona Geofence",
    message: "B 1234 KJT · Keluar dari Zona Pool Utama",
    vehicleId: 1,
    plateNumber: "B 1234 KJT",
    timestamp: new Date(Date.now() - 8 * 60 * 1000),
    read: false,
    dismissed: false,
  },
  {
    id: "n3",
    type: "offline",
    title: "Unit Offline",
    message: "D 6600 WXY · Tidak ada sinyal selama 24 jam",
    vehicleId: 20,
    plateNumber: "D 6600 WXY",
    timestamp: new Date(Date.now() - 60 * 60 * 1000),
    read: true,
    dismissed: false,
  },
  {
    id: "n4",
    type: "engine_cut",
    title: "Mesin Dipotong",
    message: "B 9012 XYZ · Engine cut-off dilakukan dari Control Panel",
    vehicleId: 3,
    plateNumber: "B 9012 XYZ",
    timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000),
    read: true,
    dismissed: false,
  },
  {
    id: "n5",
    type: "incident",
    title: "Insiden Terdeteksi",
    message: "H 2345 GHI · Getaran keras terdeteksi di Km 45",
    vehicleId: 6,
    plateNumber: "H 2345 GHI",
    timestamp: new Date(Date.now() - 4 * 60 * 60 * 1000),
    read: false,
    dismissed: false,
  },
];

export function useNotifications() {
  const [notifications, setNotifications] = useState<Notification[]>(INITIAL_NOTIFICATIONS);

  const unreadCount = notifications.filter(n => !n.read && !n.dismissed).length;

  const markRead = useCallback((id: string) => {
    setNotifications(prev =>
      prev.map(n => n.id === id ? { ...n, read: true } : n)
    );
  }, []);

  const markAllRead = useCallback(() => {
    setNotifications(prev =>
      prev.map(n => ({ ...n, read: true }))
    );
  }, []);

  const dismiss = useCallback((id: string) => {
    setNotifications(prev =>
      prev.map(n => n.id === id ? { ...n, dismissed: true } : n)
    );
  }, []);

  const addNotification = useCallback((n: Omit<Notification, "id" | "timestamp" | "read" | "dismissed">) => {
    const notification: Notification = {
      ...n,
      id: `n${Date.now()}`,
      timestamp: new Date(),
      read: false,
      dismissed: false,
    };
    setNotifications(prev => [notification, ...prev]);
    return notification.id;
  }, []);

  const active = notifications.filter(n => !n.dismissed);

  return { notifications: active, unreadCount, markRead, markAllRead, dismiss, addNotification };
}
