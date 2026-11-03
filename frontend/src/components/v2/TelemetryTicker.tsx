"use client";

import { useEffect, useState } from "react";
import { FLEET_VEHICLES } from "@/lib/fleet-data";
import { getOperationalTaskLabel } from "@/lib/operations-map";
import { useAppContext } from "@/components/context/AppContext";

interface TickerItem {
  id: string;
  plate: string;
  status: string;
  message: string;
  timestamp: string;
  variant?: "normal" | "warn" | "danger" | "ok";
}

interface TelemetryTickerProps {
  className?: string;
}

export default function TelemetryTicker({ className = "" }: TelemetryTickerProps) {
  const [items, setItems] = useState<TickerItem[]>([]);
  const { vehicles: contextVehicles } = useAppContext();
  const vehicles = contextVehicles.length > 0 ? contextVehicles : FLEET_VEHICLES;

  useEffect(() => {
    // Generate initial ticker items
    const generateItems = () => {
      const now = new Date();
      const newItems: TickerItem[] = [];

      const driving = vehicles.filter((vehicle) => vehicle.status === "driving").length;
      const idle = vehicles.filter((vehicle) => vehicle.status === "idle").length;
      const offline = vehicles.filter((vehicle) => vehicle.status === "offline").length;

      // Add fleet stats
      newItems.push({
        id: "stats-driving",
        plate: "FLEET",
        status: "DRIVING",
        message: `${driving} kendaraan beroperasi`,
        timestamp: now.toLocaleTimeString("id-ID", {
          hour: "2-digit",
          minute: "2-digit",
        }),
        variant: "ok",
      });

      newItems.push({
        id: "stats-idle",
        plate: "FLEET",
        status: "IDLE",
        message: `${idle} kendaraan idle`,
        timestamp: now.toLocaleTimeString("id-ID", {
          hour: "2-digit",
          minute: "2-digit",
        }),
        variant: "normal",
      });

      // Add some vehicle-specific events
      const recentVehicles = vehicles.slice(0, 6);
      recentVehicles.forEach((v) => {
        const minutesAgo = (v.id * 7) % 30;
        const time = new Date(now.getTime() - minutesAgo * 60000);
        const taskLabel = getOperationalTaskLabel(v.id);
        newItems.push({
          id: `v-${v.id}`,
          plate: v.plate_number,
          status: v.status.toUpperCase(),
          message: taskLabel || `${v.speed} km/j`,
          timestamp: time.toLocaleTimeString("id-ID", {
            hour: "2-digit",
            minute: "2-digit",
          }),
          variant:
            v.status === "offline"
              ? "danger"
              : v.status === "stopped"
              ? "warn"
              : "normal",
        });
      });

      // Add alerts
      if (offline > 0) {
        newItems.push({
          id: "alert-offline",
          plate: "ALERT",
          status: "⚠",
          message: `${offline} unit offline`,
          timestamp: now.toLocaleTimeString("id-ID", {
            hour: "2-digit",
            minute: "2-digit",
          }),
          variant: "danger",
        });
      }

      return newItems;
    };

    setItems(generateItems());

    // Refresh every 30 seconds
    const interval = setInterval(() => {
      setItems(generateItems());
    }, 30000);

    return () => clearInterval(interval);
  }, [vehicles]);

  // Duplicate items for seamless loop
  const duplicatedItems = [...items, ...items, ...items];

  return (
    <div className={`ticker ${className}`}>
      <div className="ticker-tag">
        <span className="live-dot" />
        TELEMETRI
      </div>
      <div className="ticker-viewport">
        <div className="ticker-track">
          {duplicatedItems.map((item, i) => (
            <span
              key={`${item.id}-${i}`}
              className={`ticker-item ticker-item--${item.variant || "normal"}`}
            >
              <span className="ticker-plate">{item.plate}</span>
              <span className="ticker-status">[{item.status}]</span>
              <span className="ticker-message">{item.message}</span>
              <span className="ticker-time">{item.timestamp}</span>
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}
