"use client";

import { useEffect, useMemo, useRef } from "react";
import {
  MapContainer,
  Marker,
  Polyline,
  Popup,
  TileLayer,
  useMap,
  ZoomControl,
} from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

export interface TaskRoutePoint {
  label: string;
  coord: [number, number];
}

export interface TaskRouteData {
  vehicle: string;
  driver: string;
  task: string;
  status: string;
  speed: number;
  origin: TaskRoutePoint;
  destination: TaskRoutePoint;
  current: TaskRoutePoint;
  plannedRoute: [number, number][];
  traveledRoute: [number, number][];
}

function markerIcon(type: "start" | "current" | "end") {
  const colors = {
    start: "#2563eb",
    current: "#e84d1f",
    end: "#059669",
  };

  return L.divIcon({
    className: "",
    html: `
      <div style="position:relative;width:28px;height:28px;display:flex;align-items:center;justify-content:center;">
        <div style="width:${type === "current" ? 18 : 14}px;height:${type === "current" ? 18 : 14}px;border-radius:${type === "current" ? 4 : 999}px;background:${colors[type]};border:3px solid white;box-shadow:0 2px 10px rgba(11,15,14,.28);"></div>
      </div>
    `,
    iconSize: [28, 28],
    iconAnchor: [14, 14],
    popupAnchor: [0, -14],
  });
}

function FitTaskRoute({ route }: { route: [number, number][] }) {
  const map = useMap();
  const fitted = useRef(false);

  useEffect(() => {
    if (fitted.current || route.length === 0) return;
    map.fitBounds(L.latLngBounds(route), { padding: [64, 64], maxZoom: 12 });
    fitted.current = true;
  }, [map, route]);

  return null;
}

export default function TaskRouteMap({ task }: { task: TaskRouteData }) {
  const boundsRoute = useMemo(
    () => [task.origin.coord, ...task.plannedRoute, task.destination.coord],
    [task.destination.coord, task.origin.coord, task.plannedRoute]
  );

  return (
    <MapContainer
      center={task.current.coord}
      zoom={11}
      className="h-full w-full"
      zoomControl={false}
    >
      <ZoomControl position="topleft" />
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OSM</a> &copy; <a href="https://carto.com/">CARTO</a>'
        url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png"
      />
      <FitTaskRoute route={boundsRoute} />

      <Polyline
        positions={task.plannedRoute}
        pathOptions={{ color: "#64748b", weight: 7, opacity: 0.38, dashArray: "10 10" }}
      />
      <Polyline
        positions={task.traveledRoute}
        pathOptions={{ color: "#10b981", weight: 8, opacity: 0.78 }}
      />

      <Marker position={task.origin.coord} icon={markerIcon("start")}>
        <Popup>
          <strong>Origin</strong>
          <br />
          {task.origin.label}
        </Popup>
      </Marker>
      <Marker position={task.destination.coord} icon={markerIcon("end")}>
        <Popup>
          <strong>Destination</strong>
          <br />
          {task.destination.label}
        </Popup>
      </Marker>
      <Marker position={task.current.coord} icon={markerIcon("current")}>
        <Popup>
          <strong>{task.vehicle}</strong>
          <br />
          {task.driver}
          <br />
          {task.task} - {task.speed} km/h
        </Popup>
      </Marker>

      <div className="leaflet-bottom leaflet-left">
        <div className="leaflet-control rounded-md border border-steel-200 bg-white px-3 py-2 text-xs font-bold text-steel-700 shadow-sm">
          <div className="flex items-center gap-2"><span className="h-2 w-5 rounded-full bg-emerald-500" /> Traveled route</div>
          <div className="mt-1 flex items-center gap-2"><span className="h-2 w-5 rounded-full bg-steel-500 opacity-50" /> Planned route</div>
        </div>
      </div>
    </MapContainer>
  );
}
