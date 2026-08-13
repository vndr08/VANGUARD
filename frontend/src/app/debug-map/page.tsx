"use client";
import dynamic from "next/dynamic";
import { FLEET_VEHICLES } from "@/lib/fleet-data";
import { toMapVehicle } from "@/lib/fleet-data";
import { toCanonicalStatus } from "@/lib/status";

const TestMap = dynamic(() => import("@/components/map/MapView").then(m => m.default), { ssr: false, loading: () => <div style={{ width: "100%", height: "100%" }}><div>Loading...</div></div> });

export default function DebugPage() {
  const vehicles = FLEET_VEHICLES.map(v => ({ ...v, displayLng: v.longitude ?? 0, displayLat: v.latitude ?? 0, displayHeading: v.heading ?? 0, displayStatus: toCanonicalStatus(v.status), plate: v.plate_number }));
  return <div style={{ width: "100vw", height: "100vh" }}><TestMap vehicles={vehicles} /></div>;
}
