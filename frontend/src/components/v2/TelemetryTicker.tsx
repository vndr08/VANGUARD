"use client";

import { useEffect, useState } from "react";
import { FLEET_VEHICLES } from "@/lib/fleet-data";
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

/* Helper to get task label for a vehicle */
function getTaskLabel(id: number): string | undefined {
  const labels: Record<number, string> = {
    1: "[PLI - DEPOK]",
    2: "[BDG - BEKASI]",
    4: "[SMG - SOLO]",
    6: "[TSM - BGR]",
    8: "[CKG - JKT]",
    13: "[BKS - JKT]",
    15: "[KTA - JKT]",
    17: "[PWT - JKT]",
    19: "[MLG - JKT]",
    21: "[DPK - JKT]",
    23: "[CLG - JKT]",
  };
  return labels[id];
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
        const taskLabel = getTaskLabel(v.id);
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

      <style>{`
        .ticker {
          position: relative;
          width: 100%;
          max-width: 100%;
          min-width: 0;
          height: 22px;
          background: var(--header-ink, #0B0F0E);
          border-bottom: 1px solid var(--line-strong, #3E4744);
          display: flex;
          align-items: center;
          overflow: hidden;
        }

        .ticker-tag {
          flex-shrink: 0;
          display: flex;
          align-items: center;
          gap: 7px;
          padding: 0 11px;
          font-family: var(--font-sign, 'Inter', sans-serif);
          font-size: 0.52rem;
          font-weight: 700;
          letter-spacing: 0.2em;
          text-transform: uppercase;
          color: var(--signal-ink, #171300);
          height: 100%;
          background: var(--signal, #FFC500);
          clip-path: polygon(0 0, 100% 0, calc(100% - 8px) 100%, 0 100%);
        }

        .live-dot {
          width: 8px;
          height: 8px;
          border-radius: 50%;
          background: var(--live, #0FB9BF);
          animation: none;
        }

        @keyframes live-ping {
          75%, 100% {
            transform: scale(1.8);
            opacity: 0;
          }
        }

        .ticker-viewport {
          flex: 1;
          width: 0;
          min-width: 0;
          overflow: hidden;
          position: relative;
        }

        .ticker-track {
          display: flex;
          gap: 40px;
          animation: ticker 46s linear infinite;
          white-space: nowrap;
        }

        .ticker:hover .ticker-track {
          animation-play-state: paused;
        }

        @keyframes ticker {
          0% {
            transform: translateX(0);
          }
          100% {
            transform: translateX(-33.333%);
          }
        }

        .ticker-item {
          display: inline-flex;
          align-items: center;
          gap: 10px;
          font-family: var(--font-mono, monospace);
          font-size: 0.6rem;
          color: var(--ink, #C9D2CA);
        }

        .ticker-plate {
          font-weight: 700;
          color: var(--muted, #7C8880);
        }

        .ticker-status {
          color: var(--faint, #5F6B64);
          font-size: 0.64rem;
        }

        .ticker-message {
          color: var(--ink, #C9D2CA);
        }

        .ticker-time {
          color: var(--faint, #5F6B64);
          font-size: 0.6rem;
        }

        .ticker-item--warn {
          color: #FFB4AE;
        }

        .ticker-item--warn .ticker-plate {
          color: #FF8A80;
        }

        .ticker-item--danger {
          color: #FF6B6B;
        }

        .ticker-item--danger .ticker-plate {
          color: #FF5252;
        }

        .ticker-item--ok {
          color: #A7E9C6;
        }

        .ticker-item--ok .ticker-plate {
          color: #4ADE80;
        }

        @media (prefers-reduced-motion: reduce) {
          .ticker-track {
            animation: none;
          }
          .live-dot {
            animation: none;
          }
        }
      `}</style>
    </div>
  );
}
