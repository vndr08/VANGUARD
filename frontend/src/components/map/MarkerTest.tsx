"use client";
// Minimal test: verify MapLibre Marker creation works in this environment
import { useEffect, useRef, useState } from "react";
import maplibregl from "maplibre-gl";
import "maplibre-gl/dist/maplibre-gl.css";

export default function MarkerTest() {
  const ref = useRef<HTMLDivElement>(null);
  const [mkCount, setMkCount] = useState(0);
  const [isMapReady, setMapReady] = useState(false);

  useEffect(() => {
    if (!ref.current) return;
    const map = new maplibregl.Map({
      container: ref.current,
      style: "https://basemaps.cartocdn.com/gl/dark-matter-gl-style/style.json",
      center: [106.8, -6.2],
      zoom: 8,
    });
    map.on("load", () => {
      console.log("[MarkerTest] map load");
      setMapReady(true);
      // Create markers directly
      for (let i = 0; i < 25; i++) {
        const el = document.createElement("div");
        el.style.cssText = "width:32px;height:32px;background:#10B981;border-radius:50%";
        el.textContent = String(i);
        new maplibregl.Marker({ element: el }).setLngLat([106.8 + Math.random()*0.1, -6.2 + Math.random()*0.1]).addTo(map);
      }
      const containerEl = ref.current;
      if (!containerEl) return;
      const markers = containerEl.querySelectorAll("[class*='marker']");
      console.log("[MarkerTest] markers found:", markers.length);
      setMkCount(containerEl.querySelectorAll(".maplibregl-marker").length);
    });
    return () => { map.remove(); };
  }, []);

  return (
    <div style={{ width: "100%", height: "100%" }}>
      <div ref={ref} style={{ width: "100%", height: "100%" }} />
      <pre>Map ready: {String(isMapReady)} markers: {mkCount}</pre>
    </div>
  );
}
