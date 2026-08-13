"use client";

import dynamic from "next/dynamic";
import { useEffect, useMemo, useRef, useState } from "react";
import { useSearchParams } from "next/navigation";
import {
  AlertTriangle,
  Clock,
  Download,
  Gauge,
  MapPin,
  Pause,
  Play,
  RotateCcw,
  Route,
  SkipBack,
  SkipForward,
  Square,
} from "lucide-react";
import { EmptyState } from "@/components/ui/Card";
import { StatusPill } from "@/components/ui/Badge";
import { useReducedMotion } from "@/hooks/useReducedMotion";
import { lerp, lerpAngle } from "@/lib/motion";
import { GRAPHITE_DARK_RASTER } from "@/components/map/types";
import { FLEET_VEHICLES } from "@/lib/fleet-data";
import {
  OPERATIONS_DATASET,
  type OperationalEvent,
  type OperationalTrip,
} from "@/lib/operations-data";

/* ─── Types ─────────────────────────────────────────────────────────────────── */

type TelemetryStatus = "driving" | "idle" | "stop";

interface TelemetryPoint {
  time: number;
  lat: number;
  lng: number;
  heading: number;
  speed: number;
  status: TelemetryStatus;
}

interface ReplayVehicle {
  id: OperationalTrip["id"];
  vehicleId: number;
  taskId: OperationalTrip["taskId"];
  plate_number: string;
  brand: string;
  model: string;
  driver_name: string;
  telemetry: TelemetryPoint[];
}

interface HistoryEvent {
  id: string;
  type: string;
  label: string;
  location: string;
  time: string;
  occurredAt: string;
  value?: string;
}

type TabKey =
  | "Timeline"
  | "Detail"
  | "Engine"
  | "Driving"
  | "Idle"
  | "Stop"
  | "Speeding"
  | "Events"
  | "Reverse"
  | "Geofence";

/* ─── Constants ─────────────────────────────────────────────────────────────── */

const TABS: TabKey[] = [
  "Timeline",
  "Detail",
  "Engine",
  "Driving",
  "Idle",
  "Stop",
  "Speeding",
  "Events",
  "Reverse",
  "Geofence",
];

const SPEEDS: Record<1 | 2 | 4, number> = { 1: 1000, 2: 500, 4: 250 };

const EVENT_COLORS: Record<string, string> = {
  assigned: "var(--brand)",
  departed: "var(--st-driving)",
  delayed: "var(--st-delayed)",
  arrived: "var(--st-stop)",
  "unloading-started": "var(--st-idle)",
  completed: "var(--task-completed)",
  "geofence-entered": "var(--st-driving)",
  "geofence-exited": "var(--st-idle)",
};

const EVENT_ICONS: Record<string, React.ReactNode> = {
  assigned: <Route className="w-3.5 h-3.5" />,
  departed: <Play className="w-3.5 h-3.5" />,
  delayed: <AlertTriangle className="w-3.5 h-3.5" />,
  arrived: <MapPin className="w-3.5 h-3.5" />,
  "unloading-started": <Square className="w-3.5 h-3.5" />,
  completed: <Square className="w-3.5 h-3.5" />,
  "geofence-entered": <MapPin className="w-3.5 h-3.5" />,
  "geofence-exited": <MapPin className="w-3.5 h-3.5" />,
};

/* ─── Route Data ─────────────────────────────────────────────────────────────── */

type LngLat = { lng: number; lat: number };

/* ─── Replay Vehicles ────────────────────────────────────────────────────────── */

const vehicleById = new Map(FLEET_VEHICLES.map((vehicle) => [vehicle.id, vehicle]));
const REPLAY_VEHICLES: ReplayVehicle[] = OPERATIONS_DATASET.trips
  .filter((trip) => trip.track.length > 0)
  .map((trip) => {
    const vehicle = vehicleById.get(trip.vehicleId);
    if (!vehicle) throw new Error(`${trip.id} vehicle is missing`);
    const departureMs = Date.parse(trip.actualDepartureAt ?? trip.plannedDepartureAt);
    return {
      id: trip.id,
      vehicleId: trip.vehicleId,
      taskId: trip.taskId,
      plate_number: vehicle.plate_number,
      brand: vehicle.brand,
      model: vehicle.model,
      driver_name: vehicle.driver_name?.trim() ? `${vehicle.driver_name} (driver saat ini)` : "Driver saat ini belum ditetapkan",
      telemetry: trip.track.map((point) => ({
        time: Math.max(0, Math.round((Date.parse(point.recordedAt) - departureMs) / 1000)),
        lat: point.latitude,
        lng: point.longitude,
        heading: point.heading,
        speed: point.speedKph,
        status: point.state === "stopped" ? "stop" : point.state,
      })),
    };
  });

/* ─── Helpers ────────────────────────────────────────────────────────────────── */

function formatTime(secs: number): string {
  const h = Math.floor(secs / 3600);
  const m = Math.floor((secs % 3600) / 60);
  const s = secs % 60;
  return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
}

function formatDuration(secs: number): string {
  if (secs <= 0) return "0m";
  const h = Math.floor(secs / 3600);
  const m = Math.floor((secs % 3600) / 60);
  if (h > 0) return `${h}h ${m}m`;
  return `${m}m`;
}

function jakartaDateKey(timestamp: string): string {
  const shifted = new Date(Date.parse(timestamp) + 7 * 60 * 60 * 1000);
  return [
    shifted.getUTCFullYear(),
    String(shifted.getUTCMonth() + 1).padStart(2, "0"),
    String(shifted.getUTCDate()).padStart(2, "0"),
  ].join("-");
}

const eventTime = new Intl.DateTimeFormat("id-ID", {
  timeZone: "Asia/Jakarta", hour: "2-digit", minute: "2-digit",
});

function eventLabel(event: OperationalEvent): string {
  const labels: Record<OperationalEvent["type"], string> = {
    assigned: "Tugas ditugaskan",
    departed: "Perjalanan dimulai",
    "geofence-entered": "Masuk area operasi",
    "geofence-exited": "Keluar area operasi",
    delayed: "Perjalanan terlambat",
    arrived: "Tiba di tujuan",
    "unloading-started": "Bongkar dimulai",
    completed: "Tugas selesai",
  };
  return labels[event.type];
}

function buildEvents(vehicle: ReplayVehicle): HistoryEvent[] {
  return OPERATIONS_DATASET.events
    .filter((event) => event.tripId === vehicle.id)
    .sort((a, b) => Date.parse(a.occurredAt) - Date.parse(b.occurredAt))
    .map((event) => ({
      id: event.id,
      type: event.type,
      label: eventLabel(event),
      location: event.location?.name ?? "Tanpa lokasi fisik",
      time: eventTime.format(Date.parse(event.occurredAt)),
      occurredAt: event.occurredAt,
      value: event.type === "delayed" ? `${event.payload.delayMinutes} menit` : undefined,
    }));
}

/* ─── Trip Replay Map ────────────────────────────────────────────────────────── */

const TripReplayMap = dynamic(
  () => import("maplibre-gl").then((mod) => {
    return function MapComponent(props: {
      className?: string;
      vehicle: ReplayVehicle;
      progress: number;
    }) {
      const { className, vehicle, progress } = props;
      const mapRef = useRef<maplibregl.Map | null>(null);
      const containerRef = useRef<HTMLDivElement | null>(null);
      const markerInstanceRef = useRef<maplibregl.Marker | null>(null);
      const markerElRef = useRef<HTMLDivElement | null>(null);

      // ── Memoize telemetry processing so it recomputes ONLY when progress changes
      const { markerPos, markerHeading, routeCoords, firstCoord } = useMemo(() => {
        const telemetry = vehicle.telemetry;
        if (!telemetry.length) {
          return { markerPos: null, markerHeading: 0, routeCoords: [], firstCoord: null };
        }
        const totalDur = telemetry[telemetry.length - 1]?.time ?? 1;
        const simTime = progress * totalDur;

        // Find the correct segment for current simTime (recalculated every progress change)
        let segIdx = 0;
        for (let i = 0; i < telemetry.length - 1; i++) {
          if (telemetry[i].time <= simTime) segIdx = i;
        }

        const seg = telemetry[segIdx];
        const nextSeg = telemetry[segIdx + 1] ?? seg;
        const segT = seg.time === nextSeg.time ? 0 : Math.max(0, Math.min(1, (simTime - seg.time) / (nextSeg.time - seg.time)));

        const mp: LngLat = {
          lng: lerp(seg.lng, nextSeg.lng, segT),
          lat: lerp(seg.lat, nextSeg.lat, segT),
        };
        const mh = lerpAngle(seg.heading, nextSeg.heading, segT);
        const rc: LngLat[] = telemetry.map((p) => ({ lng: p.lng, lat: p.lat }));
        return { markerPos: mp, markerHeading: mh, routeCoords: rc, firstCoord: rc[0] ?? null };
      }, [vehicle.telemetry, progress]);

      // ── Init map (runs once on mount)
      useEffect(() => {
        if (!containerRef.current) return;

        const map = new mod.Map({
          container: containerRef.current,
          style: GRAPHITE_DARK_RASTER,
          center: firstCoord ? [firstCoord.lng, firstCoord.lat] : [106.8, -6.2],
          zoom: 10,
          maxZoom: 18,
          minZoom: 4,
        });

        map.on("load", () => {
          // Add route GeoJSON
          if (routeCoords.length >= 2) {
            map.addSource("route", {
              type: "geojson",
              data: {
                type: "Feature",
                properties: {},
                geometry: {
                  type: "LineString",
                  coordinates: routeCoords.map((c) => [c.lng, c.lat]),
                },
              },
            });
            map.addLayer({
              id: "route-line",
              type: "line",
              source: "route",
              paint: {
                "line-color": "#16a34a",
                "line-width": 3,
                "line-opacity": 0.8,
              },
            });

            // Auto-fit route bounds
            const lngs = routeCoords.map((c) => c.lng);
            const lats = routeCoords.map((c) => c.lat);
            map.fitBounds(
              [Math.min(...lngs), Math.min(...lats), Math.max(...lngs), Math.max(...lats)],
              { padding: 48, maxZoom: 14 }
            );
          }

          // Create marker using MapLibre Marker (properly handles zoom/pan transforms)
          const el = document.createElement("div");
          el.style.cssText = "width:32px;height:32px;pointer-events:none;";
          el.innerHTML = `<svg viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
            <circle cx="16" cy="16" r="15" fill="#16a34a" stroke="white" stroke-width="2"/>
            <path d="M16 8l8 12H8L16 8z" fill="white"/>
          </svg>`;
          markerElRef.current = el;

          const marker = new mod.Marker({ element: el, anchor: "center" });
          if (markerPos) marker.setLngLat([markerPos.lng, markerPos.lat]);
          marker.addTo(map);
          markerInstanceRef.current = marker;
        });

        mapRef.current = map;
        return () => {
          markerInstanceRef.current?.remove();
          markerInstanceRef.current = null;
          map.remove();
          mapRef.current = null;
        };
      // eslint-disable-next-line react-hooks/exhaustive-deps
      }, []);

      // ── Update marker position/rotation when progress changes
      useEffect(() => {
        if (!markerInstanceRef.current || !markerPos) return;
        markerInstanceRef.current.setLngLat([markerPos.lng, markerPos.lat]);
        if (markerElRef.current) {
          markerElRef.current.style.transform = `rotate(${markerHeading - 90}deg)`;
        }
      }, [markerPos, markerHeading]);

      return (
        <div
          ref={containerRef}
          className={className ?? "h-full w-full"}
          style={{ position: "relative" }}
        />
      );
    };
  }),
  { ssr: false }
);

/* ─── Trip stat helpers ────────────────────────────────────────────────────── */
function calcStats(telemetry: TelemetryPoint[]) {
  if (!telemetry.length) return { distKm: 0, durasi: "0m", avgSpeed: 0, maxSpeed: 0, idleMin: 0, stopMin: 0 };
  let distKm = 0;
  for (let i = 1; i < telemetry.length; i++) {
    const dLat = telemetry[i].lat - telemetry[i - 1].lat;
    const dLng = telemetry[i].lng - telemetry[i - 1].lng;
    distKm += Math.sqrt(dLat * dLat + dLng * dLng) * 111;
  }
  const durasiSec = (telemetry[telemetry.length - 1]?.time ?? 0) - (telemetry[0]?.time ?? 0);
  const idleMin = telemetry.filter(t => t.status === "idle").length;
  const stopMin = telemetry.filter(t => t.status === "stop").length;
  const avgSpeed = telemetry.filter(t => t.speed > 0).reduce((s, t) => s + t.speed, 0) / Math.max(1, telemetry.filter(t => t.speed > 0).length);
  const maxSpeed = Math.max(...telemetry.map(t => t.speed));
  return { distKm: Math.round(distKm * 10) / 10, durasi: formatDuration(durasiSec), avgSpeed: Math.round(avgSpeed), maxSpeed };
}

/* ─── Tab Content Components ───────────────────────────────────────────────── */
function TimelineTab({
  vehicle,
  events,
  selectedEventId,
}: {
  vehicle: ReplayVehicle;
  events: HistoryEvent[];
  selectedEventId: string | null;
}) {
  return (
    <div className="flex-1 overflow-y-auto p-3 space-y-0">
      {events.map((ev, i) => (
        <div
          key={ev.id}
          className={`flex gap-3 relative rounded-sm ${selectedEventId === ev.id ? "bg-brand-soft" : ""}`}
          aria-current={selectedEventId === ev.id ? "true" : undefined}
          data-operational-event-id={ev.id}
        >
          {/* Line connector */}
          {i < events.length - 1 && <div className="absolute left-3.5 top-7 bottom-0 w-px bg-border" style={{ background: "var(--border)" }} />}
          {/* Dot */}
          <div className="shrink-0 mt-1 w-7 h-7 rounded-full flex items-center justify-center z-10" style={{ background: `${EVENT_COLORS[ev.type]}20`, color: EVENT_COLORS[ev.type] }}>
            {EVENT_ICONS[ev.type]}
          </div>
          {/* Content */}
          <div className="flex-1 pb-4 min-w-0">
            <div className="flex items-start justify-between gap-2">
              <div className="min-w-0">
                <p className="text-sm font-semibold text-foreground" style={{ color: EVENT_COLORS[ev.type] }}>{ev.label}</p>
                <p className="text-xs text-muted truncate">{ev.location}</p>
              </div>
              <span className="font-mono text-xs tabular-nums text-muted shrink-0">{ev.time}</span>
            </div>
            {ev.value && <span className="mt-1 inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-semibold" style={{ background: `${EVENT_COLORS[ev.type]}20`, color: EVENT_COLORS[ev.type] }}>{ev.value}</span>}
          </div>
        </div>
      ))}
    </div>
  );
}

function DetailTab({ vehicle, stats }: { vehicle: ReplayVehicle; stats: ReturnType<typeof calcStats> }) {
  return (
    <div className="flex-1 overflow-y-auto p-3 space-y-3">
      <div className="grid grid-cols-2 gap-2">
        {[
          { label: "Jarak Total", value: `${stats.distKm} km`, icon: <Route className="w-4 h-4" /> },
          { label: "Durasi", value: stats.durasi, icon: <Clock className="w-4 h-4" /> },
          { label: "Kecep. Rata", value: `${stats.avgSpeed} km/j`, icon: <Gauge className="w-4 h-4" /> },
          { label: "Kecep. Maks", value: `${stats.maxSpeed} km/j`, icon: <Gauge className="w-4 h-4" /> },
        ].map(item => (
          <div key={item.label} className="flex items-center gap-2.5 rounded-lg bg-surface-2 border border-border px-3 py-2.5">
            <span className="text-muted shrink-0">{item.icon}</span>
            <div>
              <p className="text-[9px] font-semibold uppercase tracking-widest text-muted leading-none">{item.label}</p>
              <p className="font-mono text-sm font-bold tabular-nums text-foreground mt-0.5">{item.value}</p>
            </div>
          </div>
        ))}
      </div>
      <div className="rounded-lg bg-surface-2 border border-border px-3 py-2.5">
        <p className="text-[9px] font-semibold uppercase tracking-widest text-muted mb-2">Kendaraan</p>
        <p className="font-mono text-sm font-semibold text-foreground">{vehicle.plate_number}</p>
        <p className="text-xs text-muted mt-0.5">{vehicle.brand} {vehicle.model}</p>
      </div>
      <div className="rounded-lg bg-surface-2 border border-border px-3 py-2.5">
        <p className="text-[9px] font-semibold uppercase tracking-widest text-muted mb-2">Driver</p>
        <p className="text-sm font-semibold text-foreground">{vehicle.driver_name}</p>
      </div>
    </div>
  );
}

function SegmentsTab({ vehicle, type, label }: { vehicle: ReplayVehicle; type: TelemetryStatus; label: string }) {
  const segs = vehicle.telemetry.filter(t => t.status === type);
  if (!segs.length) return <div className="flex flex-1 items-center justify-center"><EmptyState title={`Tidak ada segmen ${label}`} description="Tidak ada data untuk tab ini." /></div>;
  return (
    <div className="flex-1 overflow-y-auto p-3">
      <table className="w-full">
        <thead>
          <tr className="border-b border-border">
            <th className="px-2 py-2 text-left text-[10px] font-semibold uppercase tracking-widest text-muted">#</th>
            <th className="px-2 py-2 text-left text-[10px] font-semibold uppercase tracking-widest text-muted">Waktu</th>
            <th className="px-2 py-2 text-left text-[10px] font-semibold uppercase tracking-widest text-muted">Lokasi</th>
            <th className="px-2 py-2 text-right text-[10px] font-semibold uppercase tracking-widest text-muted">Kecepatan</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-border">
          {segs.slice(0, 20).map((s, i) => (
            <tr key={i} className="hover:bg-surface-2 transition-colors">
              <td className="px-2 py-2 font-mono text-xs text-muted">{i + 1}</td>
              <td className="px-2 py-2 font-mono text-xs tabular-nums text-foreground">{formatTime(s.time)}</td>
              <td className="px-2 py-2 text-xs text-muted">{s.lat.toFixed(4)}, {s.lng.toFixed(4)}</td>
              <td className="px-2 py-2 text-right font-mono text-xs tabular-nums text-foreground">{s.speed} km/j</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function SpeedingTab({ vehicle }: { vehicle: ReplayVehicle }) {
  const violations = vehicle.telemetry.filter(t => t.speed > 80);
  if (!violations.length) return <div className="flex flex-1 items-center justify-center"><EmptyState title="Tidak ada pelanggaran" description="Tidak ada data speeding untuk kendaraan ini." /></div>;
  return (
    <div className="flex-1 overflow-y-auto p-3 space-y-2">
      {violations.map((v, i) => (
        <div key={i} className="flex items-center justify-between gap-3 rounded-lg border border-border bg-surface-2 px-3 py-2.5">
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 shrink-0" style={{ color: "var(--st-delayed)" }} />
            <div>
              <p className="font-mono text-sm font-semibold tabular-nums text-foreground" style={{ color: "var(--st-delayed)" }}>{v.speed} km/j</p>
              <p className="text-xs text-muted">{formatTime(v.time)} · {v.lat.toFixed(4)}, {v.lng.toFixed(4)}</p>
            </div>
          </div>
          <span className="shrink-0 rounded-full px-2 py-0.5 text-[10px] font-semibold" style={{ background: "var(--st-delayed-bg)", color: "var(--st-delayed)" }}>Terlambat</span>
        </div>
      ))}
    </div>
  );
}

function GeofenceTab({ events }: { events: HistoryEvent[] }) {
  const gfEvents = events.filter(e => e.type === "geofence-entered" || e.type === "geofence-exited");
  if (!gfEvents.length) return <div className="flex flex-1 items-center justify-center"><EmptyState title="Tidak ada event geofence" description="Kendaraan tidak keluar-masuk zona." /></div>;
  return (
    <div className="flex-1 overflow-y-auto p-3 space-y-2">
      {gfEvents.map((ev, i) => (
        <div key={i} className="flex items-center gap-3 rounded-lg border border-border bg-surface-2 px-3 py-2.5">
          <div className="w-7 h-7 rounded-full flex items-center justify-center shrink-0" style={{ background: `${EVENT_COLORS[ev.type]}20`, color: EVENT_COLORS[ev.type] }}>
            <MapPin className="w-3.5 h-3.5" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-foreground">{ev.label}</p>
            <p className="text-xs text-muted truncate">{ev.location}</p>
          </div>
          <span className="font-mono text-xs tabular-nums text-muted shrink-0">{ev.time}</span>
        </div>
      ))}
    </div>
  );
}

function EventsTab({ events }: { events: HistoryEvent[] }) {
  const alertEvents = events.filter(e => e.type !== "assigned" && e.type !== "departed" && e.type !== "completed");
  if (!alertEvents.length) return <div className="flex flex-1 items-center justify-center"><EmptyState title="Tidak ada event" description="Tidak ada event penting untuk kendaraan ini." /></div>;
  return (
    <div className="flex-1 overflow-y-auto p-3 space-y-2">
      {alertEvents.map((ev, i) => (
        <div key={i} className="flex items-center gap-3 rounded-lg border border-border bg-surface-2 px-3 py-2.5">
          <div className="w-7 h-7 rounded-full flex items-center justify-center shrink-0" style={{ background: `${EVENT_COLORS[ev.type]}20`, color: EVENT_COLORS[ev.type] }}>
            {EVENT_ICONS[ev.type]}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-foreground">{ev.label}</p>
            <p className="text-xs text-muted truncate">{ev.location}</p>
          </div>
          <span className="font-mono text-xs tabular-nums text-muted shrink-0">{ev.time}</span>
        </div>
      ))}
    </div>
  );
}

/* ─── Main Page ────────────────────────────────────────────────────────────── */
export default function HistoryPage() {
  const searchParams = useSearchParams();
  const reducedMotion = useReducedMotion();

  const [selectedTripId, setSelectedTripId] = useState<OperationalTrip["id"]>(REPLAY_VEHICLES[0].id);
  const [selectedDate, setSelectedDate] = useState("2026-06-20");
  const [selectedEventId, setSelectedEventId] = useState<string | null>(null);
  const [tripNotFound, setTripNotFound] = useState(false);
  const [activeTab, setActiveTab] = useState<TabKey>("Timeline");
  const [playing, setPlaying] = useState(false);
  const [speed, setSpeed] = useState<1 | 2 | 4>(1);
  const [progress, setProgress] = useState(0);
  const visibleTrips = useMemo(() => REPLAY_VEHICLES.filter((vehicle) => {
    const trip = OPERATIONS_DATASET.trips.find((candidate) => candidate.id === vehicle.id);
    if (!trip) return false;
    return jakartaDateKey(trip.plannedDepartureAt) === selectedDate;
  }), [selectedDate]);
  const selectedVehicle = visibleTrips.find((vehicle) => vehicle.id === selectedTripId) ?? visibleTrips[0] ?? REPLAY_VEHICLES[0];
  const events = useMemo(() => buildEvents(selectedVehicle), [selectedVehicle]);
  const stats = useMemo(() => calcStats(selectedVehicle.telemetry), [selectedVehicle]);

  useEffect(() => {
    const requestedTripId = searchParams.get("trip");
    if (requestedTripId === null) {
      setTripNotFound(false);
      setSelectedTripId(REPLAY_VEHICLES[0].id);
      const defaultTrip = OPERATIONS_DATASET.trips.find((trip) => trip.id === REPLAY_VEHICLES[0].id);
      if (defaultTrip) setSelectedDate(jakartaDateKey(defaultTrip.plannedDepartureAt));
      setSelectedEventId(null);
      setPlaying(false);
      setProgress(0);
      return;
    }
    const requestedTrip = REPLAY_VEHICLES.find((trip) => trip.id === requestedTripId);
    if (!requestedTrip) {
      setTripNotFound(true);
      setSelectedEventId(null);
      setPlaying(false);
      return;
    }
    const canonicalTrip = OPERATIONS_DATASET.trips.find((trip) => trip.id === requestedTrip.id);
    if (!canonicalTrip) return;
    setTripNotFound(false);
    const queryDate = jakartaDateKey(canonicalTrip.plannedDepartureAt);
    setSelectedDate(queryDate);
    setSelectedTripId(requestedTrip.id);
    setPlaying(false);
    const requestedEventId = searchParams.get("event");
    const requestedEvent = OPERATIONS_DATASET.events.find(
      (event) => event.id === requestedEventId && event.tripId === requestedTrip.id
    );
    if (requestedEvent) {
      const startMs = Date.parse(canonicalTrip.actualDepartureAt ?? canonicalTrip.plannedDepartureAt);
      const durationSec = requestedTrip.telemetry.at(-1)?.time ?? 1;
      const eventSec = Math.max(0, (Date.parse(requestedEvent.occurredAt) - startMs) / 1000);
      setProgress(Math.min(1, eventSec / durationSec));
      setActiveTab("Timeline");
      setSelectedEventId(requestedEvent.id);
    } else {
      setProgress(0);
      setSelectedEventId(null);
    }
  }, [searchParams]);

  const totalDurationSec = selectedVehicle.telemetry[selectedVehicle.telemetry.length - 1]?.time ?? 3600;
  const simTimeSec = Math.round(progress * totalDurationSec);

  /* Playback interval */
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  useEffect(() => {
    if (playing) {
      intervalRef.current = setInterval(() => {
        setProgress(p => { const next = p + (0.5 / totalDurationSec); return next >= 1 ? (setPlaying(false), 1) : next; });
      }, SPEEDS[speed]);
    } else {
      if (intervalRef.current) { clearInterval(intervalRef.current); intervalRef.current = null; }
    }
    return () => { if (intervalRef.current) clearInterval(intervalRef.current); };
  }, [playing, speed, totalDurationSec]);

  function handlePlayPause() { setPlaying(p => !p); }
  function handleReset() { setPlaying(false); setProgress(0); }
  function handleStepBack() { setPlaying(false); setProgress(p => Math.max(0, p - 10 / totalDurationSec)); }
  function handleStepForward() { setPlaying(false); setProgress(p => Math.min(1, p + 10 / totalDurationSec)); }
  function handleSpeed(s: 1 | 2 | 4) { setSpeed(s); }
  function handleScrub(e: React.ChangeEvent<HTMLInputElement>) { setPlaying(false); setProgress(Number(e.target.value)); }
  function handleExport() {
    if (visibleTrips.length === 0 || tripNotFound) return;
    const header = ["trip_id", "task_id", "vehicle_id", "plate_number", "recorded_at", "latitude", "longitude", "heading", "speed_kph", "state"];
    const trip = OPERATIONS_DATASET.trips.find((candidate) => candidate.id === selectedVehicle.id);
    const rows = (trip?.track ?? []).map((point) => [
      selectedVehicle.id, selectedVehicle.taskId, selectedVehicle.vehicleId, selectedVehicle.plate_number,
      point.recordedAt, point.latitude, point.longitude, point.heading, point.speedKph, point.state,
    ]);
    const csv = [header, ...rows].map((row) => row.map((value) => `"${String(value).replaceAll('"', '""')}"`).join(",")).join("\n");
    const url = URL.createObjectURL(new Blob([csv], { type: "text/csv;charset=utf-8" }));
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = `${selectedVehicle.id}-${selectedDate}.csv`;
    anchor.click();
    URL.revokeObjectURL(url);
  }
  function handleTripChange(id: OperationalTrip["id"]) {
    setTripNotFound(false);
    setSelectedTripId(id);
    setSelectedEventId(null);
    setPlaying(false);
    setProgress(0);
  }

  const curTelemetry = selectedVehicle.telemetry[Math.floor(progress * (selectedVehicle.telemetry.length - 1))];

  const tabIndex = TABS.indexOf(activeTab);
  function handleTabKey(e: React.KeyboardEvent, idx: number) {
    if (e.key === "ArrowRight") setActiveTab(TABS[(idx + 1) % TABS.length]);
    if (e.key === "ArrowLeft") setActiveTab(TABS[(idx - 1 + TABS.length) % TABS.length]);
  }

  return (
    <div className="flex h-[calc(100vh-4rem)] flex-col overflow-hidden">

      {/* ── HEADER ──────────────────────────────────────────────────────────── */}
      <header className="flex items-center justify-between gap-3 border-b border-border bg-surface-1 px-4 py-2 shrink-0">
        <div className="flex items-center gap-3">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-brand text-white shrink-0">
            <Route className="h-4 w-4" />
          </div>
          <div>
            <h1 className="text-sm font-semibold text-foreground leading-none">Trip History</h1>
            <p className="text-xs text-muted mt-0.5 tabular-nums">{selectedDate} · {visibleTrips.length} perjalanan</p>
          </div>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          {/* Vehicle selector */}
          <select
            value={tripNotFound ? "" : selectedVehicle.id}
            onChange={e => handleTripChange(e.target.value as OperationalTrip["id"])}
            disabled={visibleTrips.length === 0 || tripNotFound}
            className="h-8 rounded-lg border border-border bg-surface-1 px-2.5 pr-7 text-xs font-semibold text-foreground focus:outline-none focus:border-brand focus:ring-2 focus:ring-brand-soft cursor-pointer appearance-none"
            style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%23888' stroke-width='2'%3E%3Cpath d='M6 9l6 6 6-6'/%3E%3C/svg%3E")`, backgroundRepeat: "no-repeat", backgroundPosition: "right 6px center" }}
          >
            {tripNotFound && <option value="">Perjalanan tidak ditemukan</option>}
            {visibleTrips.map(v => <option key={v.id} value={v.id}>{v.plate_number} — {v.id}</option>)}
          </select>

          {/* Date range */}
          <input
            type="date"
            value={selectedDate}
            onChange={e => {
              setSelectedDate(e.target.value);
              setPlaying(false);
              setProgress(0);
            }}
            className="h-8 rounded-lg border border-border bg-surface-1 px-2.5 text-xs text-foreground focus:outline-none focus:border-brand focus:ring-2 focus:ring-brand-soft"
          />

          {/* Export */}
          <button
            onClick={handleExport}
            disabled={visibleTrips.length === 0 || tripNotFound}
            className="inline-flex items-center gap-1.5 h-8 rounded-lg bg-foreground text-background px-3 text-xs font-semibold hover:opacity-90 transition-opacity disabled:cursor-not-allowed disabled:opacity-40 focus-visible:outline-2 focus-visible:outline-brand"
          >
            <Download className="h-3.5 w-3.5" /> Export CSV
          </button>
        </div>
      </header>

      {/* ── CONTENT: 2-column ──────────────────────────────────────────────── */}
      {tripNotFound ? (
        <div className="flex flex-1 items-center justify-center bg-surface-2">
          <EmptyState
            title="Perjalanan tidak ditemukan"
            description="Periksa kembali ID perjalanan pada URL."
          />
        </div>
      ) : visibleTrips.length === 0 ? (
        <div className="flex flex-1 items-center justify-center bg-surface-2">
          <EmptyState
            title="Tidak ada perjalanan"
            description={`Tidak ada perjalanan pada ${selectedDate}.`}
          />
        </div>
      ) : (
      <div className="grid flex-1 grid-cols-[1fr_420px] overflow-hidden">

        {/* ── LEFT: Replay Map ─────────────────────────────────────────────── */}
        <main className="relative flex flex-col overflow-hidden">
          {/* Map */}
          <div className="relative flex-1 overflow-hidden">
            <TripReplayMap vehicle={selectedVehicle} progress={progress} />

            {/* Route legend */}
            <div className="absolute bottom-4 left-4 z-dock rounded-lg border border-border bg-surface-1/90 px-3 py-2 backdrop-blur">
              <p className="text-[10px] font-semibold uppercase tracking-widest text-muted mb-1.5">Rute</p>
              <div className="flex items-center gap-2">
                <span className="h-0.5 flex-1 rounded-full bg-st-driving" />
                <span className="text-[10px] text-muted w-20">Actual</span>
              </div>
            </div>
          </div>

          {/* HUD + Controls */}
          <div className="shrink-0 border-t border-border bg-surface-1 px-4 py-3">
            {/* HUD */}
            <div className="flex items-center gap-4 mb-3">
              <div>
                <p className="text-[9px] font-semibold uppercase tracking-widest text-muted">Simulasi</p>
                <p className="font-mono text-base font-bold tabular-nums text-foreground">{formatTime(simTimeSec)}</p>
              </div>
              <div className="h-8 w-px bg-border" />
              <div>
                <p className="text-[9px] font-semibold uppercase tracking-widest text-muted">Kecepatan</p>
                <p className="font-mono text-base font-bold tabular-nums" style={{ color: "var(--st-driving)" }}>{curTelemetry?.speed ?? 0} km/j</p>
              </div>
              <div className="h-8 w-px bg-border" />
              <div>
                <p className="text-[9px] font-semibold uppercase tracking-widest text-muted">Koordinat</p>
                <p className="font-mono text-xs tabular-nums text-muted">{curTelemetry?.lat.toFixed(5) ?? "—"}, {curTelemetry?.lng.toFixed(5) ?? "—"}</p>
              </div>
              <div className="h-8 w-px bg-border" />
              <div>
                <p className="text-[9px] font-semibold uppercase tracking-widest text-muted">Status</p>
                <StatusPill status={curTelemetry?.status ?? "stop"} showIcon={false} className="text-[10px]" />
              </div>
            </div>

            {/* Controls */}
            <div className="flex items-center gap-2">
              {/* Play/Pause */}
              <button onClick={handlePlayPause} className="flex h-9 w-9 items-center justify-center rounded-lg bg-brand text-white hover:opacity-90 transition-opacity focus-visible:outline-2 focus-visible:outline-brand shrink-0" aria-label={playing ? "Pause" : "Play"}>
                {playing ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4 ml-0.5" />}
              </button>

              {/* Step back */}
              <button onClick={handleStepBack} className="flex h-9 w-9 items-center justify-center rounded-lg border border-border bg-surface-2 text-foreground hover:bg-surface-3 transition-colors focus-visible:outline-2 focus-visible:outline-brand" aria-label="Step back">
                <SkipBack className="h-4 w-4" />
              </button>

              {/* Step forward */}
              <button onClick={handleStepForward} className="flex h-9 w-9 items-center justify-center rounded-lg border border-border bg-surface-2 text-foreground hover:bg-surface-3 transition-colors focus-visible:outline-2 focus-visible:outline-brand" aria-label="Step forward">
                <SkipForward className="h-4 w-4" />
              </button>

              {/* Reset */}
              <button onClick={handleReset} className="flex h-9 w-9 items-center justify-center rounded-lg border border-border bg-surface-2 text-foreground hover:bg-surface-3 transition-colors focus-visible:outline-2 focus-visible:outline-brand" aria-label="Reset">
                <RotateCcw className="h-4 w-4" />
              </button>

              {/* Scrubber */}
              <div className="flex-1 mx-2">
                <input
                  type="range"
                  min={0}
                  max={1}
                  step={0.001}
                  value={progress}
                  onChange={handleScrub}
                  className="w-full h-1.5 rounded-full appearance-none cursor-pointer"
                  style={{ accentColor: "var(--brand)" }}
                  aria-label="Playback progress"
                />
              </div>

              {/* Time */}
              <span className="font-mono text-xs tabular-nums text-muted w-20 text-right shrink-0">
                {formatTime(simTimeSec)} / {formatTime(totalDurationSec)}
              </span>

              {/* Speed toggles */}
              <div className="flex rounded-lg border border-border bg-surface-2 p-0.5 shrink-0">
                {([1, 2, 4] as const).map(s => (
                  <button
                    key={s}
                    onClick={() => handleSpeed(s)}
                    className={`px-2.5 py-1 rounded-md text-xs font-bold transition-all duration-100 focus-visible:outline-2 focus-visible:outline-brand ${
                      speed === s ? "bg-surface-1 text-foreground shadow-sm" : "text-muted hover:text-foreground"
                    }`}
                    aria-pressed={speed === s}
                  >
                    {s}x
                  </button>
                ))}
              </div>
            </div>
          </div>
        </main>

        {/* ── RIGHT: Tab Panel ─────────────────────────────────────────────── */}
        <aside className="flex flex-col border-l border-border overflow-hidden bg-surface-1">
          {/* Tab bar */}
          <div className="shrink-0 border-b border-border overflow-x-auto" role="tablist">
            <div className="flex items-center">
              {TABS.map((tab, i) => (
                <button
                  key={tab}
                  role="tab"
                  aria-selected={activeTab === tab}
                  tabIndex={activeTab === tab ? 0 : -1}
                  onClick={() => { setActiveTab(tab); }}
                  onKeyDown={e => handleTabKey(e, i)}
                  className={`shrink-0 px-3 py-2.5 text-[11px] font-semibold whitespace-nowrap border-b-2 transition-colors focus-visible:outline-2 focus-visible:outline-brand ${
                    activeTab === tab ? "border-brand text-foreground" : "border-transparent text-muted hover:text-foreground"
                  }`}
                >
                  {tab}
                </button>
              ))}
            </div>
          </div>

          {/* Tab content */}
          <div className="flex-1 overflow-hidden" role="tabpanel">
            {activeTab === "Timeline" && (
              <TimelineTab vehicle={selectedVehicle} events={events} selectedEventId={selectedEventId} />
            )}
            {activeTab === "Detail" && <DetailTab vehicle={selectedVehicle} stats={stats} />}
            {activeTab === "Engine" && <SegmentsTab vehicle={selectedVehicle} type="stop" label="Engine" />}
            {activeTab === "Driving" && <SegmentsTab vehicle={selectedVehicle} type="driving" label="Berkendara" />}
            {activeTab === "Idle" && <SegmentsTab vehicle={selectedVehicle} type="idle" label="Diam" />}
            {activeTab === "Stop" && <SegmentsTab vehicle={selectedVehicle} type="stop" label="Berhenti" />}
            {activeTab === "Speeding" && <SpeedingTab vehicle={selectedVehicle} />}
            {activeTab === "Events" && <EventsTab events={events} />}
            {activeTab === "Reverse" && <div className="flex flex-1 items-center justify-center"><EmptyState title="Tidak ada mundur" description="Tidak ada segmen mundur tercatat." /></div>}
            {activeTab === "Geofence" && <GeofenceTab events={events} />}
          </div>
        </aside>
      </div>
      )}
    </div>
  );
}
