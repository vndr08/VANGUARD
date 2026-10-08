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

const INITIAL_NOTIFICATIONS: Notification[] = [];

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
