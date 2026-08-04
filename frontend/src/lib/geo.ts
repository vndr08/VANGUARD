/**
 * lib/geo.ts — VANGUARD coordinate system
 *
 * Konvensi:
 *   Data domain / API → { lat, lng }  (objek eksplisit)
 *   MapLibre GL       → [lng, lat]     (array GeoJSON)
 *
 * Helper di module ini memaksa satu arah: domain → MapLibre.
 * Larang akses lng/lat secara langsung di luar module ini.
 */

/* ─── Types ──────────────────────────────────────────────────────────────── */

/** Koordinat domain (data, API, mock) */
export interface LatLng {
  lat: number;
  lng: number;
}

/** Koordinat MapLibre (GeoJSON order) */
export type LngLatArray = [number, number];

/* ─── Validasi ───────────────────────────────────────────────────────────── */

/**
 * Cek apakah nilai coordinate valid untuk MapLibre.
 * MapLibre throw "Invalid LngLat latitude value: must be between -90 and 90"
 * kalau latitude di luar [-90, 90] atau longitude di luar [-180, 180].
 */
export function isValidLngLat(p: LatLng): boolean {
  const lat = Number(p.lat);
  const lng = Number(p.lng);
  return (
    !Number.isNaN(lat) &&
    !Number.isNaN(lng) &&
    lat >= -90 &&
    lat <= 90 &&
    lng >= -180 &&
    lng <= 180
  );
}

/**
 * Validasi + clamp ke range valid MapLibre.
 * Gunakan ini sebagai "last resort" — warn di console agar bug ketahuan.
 */
export function clampLngLat(p: LatLng): LatLng {
  const lat = Number(p.lat);
  const lng = Number(p.lng);

  if (Number.isNaN(lat) || Number.isNaN(lng)) {
    console.warn("[geo] NaN coordinate detected, skipping:", p);
    return { lat: 0, lng: 0 };
  }

  const clamped: LatLng = { lat, lng };

  if (lat < -90 || lat > 90) {
    console.warn(`[geo] Latitude out of range: ${lat} (clamped to ${Math.max(-90, Math.min(90, lat))})`, p);
    clamped.lat = Math.max(-90, Math.min(90, lat));
  }

  if (lng < -180 || lng > 180) {
    console.warn(`[geo] Longitude out of range: ${lng} (clamped to ${Math.max(-180, Math.min(180, lng))})`, p);
    clamped.lng = Math.max(-180, Math.min(180, lng));
  }

  return clamped;
}

/* ─── Konversi (domain → MapLibre) ──────────────────────────────────────── */

/**
 * Konversi {lat, lng} → [lng, lat] untuk MapLibre.
 * Includes validation guard — skips invalid coords with console.warn.
 */
export function toLngLat(p: LatLng): LngLatArray | null {
  if (!isValidLngLat(p)) {
    // Defensive: clamp instead of returning null so the caller doesn't crash silently
    const c = clampLngLat(p);
    // Only return null if even after clamp we got 0,0 (genuinely bad data)
    if (c.lat === 0 && c.lng === 0 && p.lat !== 0 && p.lng !== 0) {
      return null;
    }
    return [c.lng, c.lat];
  }
  return [p.lng, p.lat];
}

/**
 * Konversi array of {lat, lng} → array of [lng, lat].
 * Filters out nulls from toLngLat().
 */
export function toLngLatArray(points: LatLng[]): LngLatArray[] {
  return points
    .map((p) => toLngLat(p))
    .filter((p): p is LngLatArray => p !== null);
}

/* ─── MapLibre-specific helpers ─────────────────────────────────────────── */

/**
 * Bangun LngLatBounds dari array of {lat, lng}.
 * Handles 1-point edge case (single vehicle).
 */
export function buildFitBounds(
  points: LatLng[],
  padding = 64,
  maxZoom = 16
): { bounds: [number, number, number, number]; options: { padding: number; maxZoom: number } } | null {
  if (!points.length) return null;

  const valid = points.filter(isValidLngLat);
  if (valid.length === 0) return null;

  let minLng = Infinity, maxLng = -Infinity;
  let minLat = Infinity, maxLat = -Infinity;

  valid.forEach(({ lng, lat }) => {
    minLng = Math.min(minLng, lng);
    maxLng = Math.max(maxLng, lng);
    minLat = Math.min(minLat, lat);
    maxLat = Math.max(maxLat, lat);
  });

  // Single point: add a small bounding box
  if (valid.length === 1) {
    minLng -= 0.01;
    maxLng += 0.01;
    minLat -= 0.01;
    maxLat += 0.01;
  }

  return {
    bounds: [minLng, minLat, maxLng, maxLat],
    options: { padding, maxZoom },
  };
}

/**
 * Validasi + kembalikan nilai default jika null/undefined.
 * Untuk use di hooks yang baca v.latitude / v.longitude (Vehicle type).
 */
export function safeCoord(lat: number | null | undefined, lng: number | null | undefined, fallback: LatLng): LatLng {
  const latVal = lat ?? fallback.lat;
  const lngVal = lng ?? fallback.lng;
  const p: LatLng = { lat: latVal, lng: lngVal };
  if (!isValidLngLat(p)) {
    console.warn("[geo] Invalid coordinate from Vehicle:", { lat, lng }, "— using fallback", fallback);
    return fallback;
  }
  return p;
}
