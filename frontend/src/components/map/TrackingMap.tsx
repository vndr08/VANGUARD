"use client";

import { useEffect, useRef, useState } from "react";
import {
  MapContainer,
  TileLayer,
  Marker,
  Popup,
  useMap,
  ZoomControl,
} from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import type { Vehicle } from "@/types";

function createTruckIcon(
  status: string,
  heading: number
): L.DivIcon {
  const color =
    status === "driving"
      ? "#059669"
    : status === "idle"
      ? "#d97706"
    : status === "offline"
      ? "#e84d1f"
      : "#667371";

  const pulseRing =
    status === "driving"
      ? `<div style="position:absolute;top:-4px;left:-4px;width:32px;height:32px;border-radius:50%;border:2px solid ${color};opacity:0.3;animation:ping 2s cubic-bezier(0,0,0.2,1) infinite;"></div>`
      : "";

  return L.divIcon({
    className: "",
    html: `
      <div style="position:relative;width:24px;height:24px;">
        ${pulseRing}
        <div class="truck-marker" style="transform:rotate(${heading}deg);display:flex;align-items:center;justify-content:center;width:24px;height:24px;">
          <svg viewBox="0 0 24 24" width="22" height="22" fill="none">
            <path d="M12 2L4.5 20.29l.71.71L12 18l6.79 3 .71-.71z" fill="${color}" stroke="${color}" stroke-width="0.5"/>
          </svg>
        </div>
        <style>@keyframes ping{75%,100%{transform:scale(2);opacity:0}}</style>
      </div>
    `,
    iconSize: [24, 24],
    iconAnchor: [12, 12],
    popupAnchor: [0, -14],
  });
}

function FitBounds({ vehicles }: { vehicles: Vehicle[] }) {
  const map = useMap();
  const fitted = useRef(false);

  useEffect(() => {
    if (fitted.current || vehicles.length === 0) return;
    const coords = vehicles
      .filter((v) => v.latitude && v.longitude)
      .map((v) => [v.latitude!, v.longitude!] as [number, number]);
    if (coords.length > 0) {
      map.fitBounds(L.latLngBounds(coords), { padding: [50, 50], maxZoom: 12 });
      fitted.current = true;
    }
  }, [vehicles, map]);

  return null;
}

function ThemeLayer() {
  const map = useMap();
  const [isDark, setIsDark] = useState(false);
  const tileRef = useRef<L.TileLayer | null>(null);

  useEffect(() => {
    const check = () => {
      setIsDark(document.documentElement.classList.contains("dark"));
    };
    check();
    const observer = new MutationObserver(check);
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ["class"] });
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (tileRef.current) {
      map.removeLayer(tileRef.current);
    }
    const url = isDark
      ? "https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
      : "https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png";
    tileRef.current = L.tileLayer(url, {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OSM</a> &copy; <a href="https://carto.com/">CARTO</a>',
    }).addTo(map);
  }, [isDark, map]);

  return null;
}

const statusLabel: Record<string, string> = {
  driving: "Driving",
  idle: "Idle",
  stopped: "Stopped",
  offline: "Offline",
};

const statusColor: Record<string, string> = {
  driving: "#059669",
  idle: "#d97706",
  stopped: "#667371",
  offline: "#e84d1f",
};

interface TrackingMapProps {
  vehicles: Vehicle[];
  selectedId?: number | null;
  onSelectVehicle?: (id: number) => void;
}

export default function TrackingMap({
  vehicles,
  selectedId,
  onSelectVehicle,
}: TrackingMapProps) {
  const markersRef = useRef<Record<number, L.Marker>>({});

  useEffect(() => {
    if (selectedId && markersRef.current[selectedId]) {
      markersRef.current[selectedId].openPopup();
    }
  }, [selectedId]);

  return (
    <MapContainer
      center={[-6.2088, 106.8456]}
      zoom={10}
      className="h-full w-full"
      zoomControl={false}
    >
      <ZoomControl position="topright" />
      <ThemeLayer />
      <FitBounds vehicles={vehicles} />
      {vehicles
        .filter((v) => v.latitude && v.longitude)
        .map((v) => (
          <Marker
            key={v.id}
            position={[v.latitude!, v.longitude!]}
            icon={createTruckIcon(v.status, v.heading || 0)}
            ref={(ref) => {
              if (ref) markersRef.current[v.id] = ref;
            }}
            eventHandlers={{
              click: () => onSelectVehicle?.(v.id),
            }}
          >
            <Popup>
              <div style={{ minWidth: 200 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
                  <div
                    style={{
                      width: 8,
                      height: 8,
                      borderRadius: "50%",
                      backgroundColor: statusColor[v.status],
                    }}
                  />
                  <strong style={{ fontSize: 14 }}>{v.plate_number}</strong>
                </div>
                <div style={{ fontSize: 12, lineHeight: 1.8 }}>
                  <div>
                    <span style={{ opacity: 0.6 }}>Status:</span>{" "}
                    <span style={{ color: statusColor[v.status], fontWeight: 600 }}>
                      {statusLabel[v.status]}
                    </span>
                  </div>
                  <div>
                    <span style={{ opacity: 0.6 }}>Speed:</span>{" "}
                    <span style={{ fontWeight: 500 }}>{v.speed} km/h</span>
                  </div>
                  <div>
                    <span style={{ opacity: 0.6 }}>Driver:</span>{" "}
                    <span style={{ fontWeight: 500 }}>
                      {v.driver_name || "\u2014"}
                    </span>
                  </div>
                  <div>
                    <span style={{ opacity: 0.6 }}>Vehicle:</span>{" "}
                    <span>
                      {v.brand} {v.model}
                    </span>
                  </div>
                  <div>
                    <span style={{ opacity: 0.6 }}>Fuel:</span>{" "}
                    <span style={{ color: v.fuel_level < 25 ? "#dc2626" : undefined, fontWeight: 500 }}>
                      {v.fuel_level}%
                    </span>
                  </div>
                </div>
              </div>
            </Popup>
          </Marker>
        ))}
    </MapContainer>
  );
}
