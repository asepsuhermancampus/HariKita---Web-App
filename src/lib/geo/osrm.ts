import { haversineKm, type LatLng } from "./haversine";

export interface DistanceResult {
  km: number;
  minutes: number | null;
  source: "osrm" | "haversine";
}

const OSRM_BASE = "https://router.project-osrm.org/route/v1/driving";
const TIMEOUT_MS = 5000;

/**
 * Estimasi jarak berkendara via OSRM (rute jalan nyata). Bila gagal/timeout,
 * fallback ke Haversine (garis lurus) dan menandai source="haversine".
 */
export async function estimateDrivingDistance(
  from: LatLng,
  to: LatLng,
  fetchImpl: typeof fetch = fetch
): Promise<DistanceResult> {
  try {
    const url = `${OSRM_BASE}/${from.lng},${from.lat};${to.lng},${to.lat}?overview=false`;
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), TIMEOUT_MS);
    const res = await fetchImpl(url, { signal: controller.signal });
    clearTimeout(timer);
    if (!res.ok) throw new Error(`OSRM ${res.status}`);
    const data = (await res.json()) as {
      routes?: Array<{ distance: number; duration: number }>;
    };
    const route = data.routes?.[0];
    if (!route) throw new Error("no route");
    return {
      km: Math.round((route.distance / 1000) * 10) / 10,
      minutes: Math.round(route.duration / 60),
      source: "osrm",
    };
  } catch {
    return {
      km: Math.round(haversineKm(from, to) * 10) / 10,
      minutes: null,
      source: "haversine",
    };
  }
}
