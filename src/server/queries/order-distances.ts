import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/session";
import { estimateDrivingDistance, type DistanceResult } from "@/lib/geo/osrm";

/**
 * Estimasi jarak berkendara dari tiap vendor (order item) ke titik lokasi klien.
 * Mengembalikan map orderId -> daftar jarak per vendor. Kosong bila koordinat
 * tidak lengkap. Tidak throw (fallback Haversine di estimateDrivingDistance).
 */
export async function getClientVendorDistances(): Promise<
  Record<string, Array<{ vendorName: string } & DistanceResult>>
> {
  const session = await getSession();
  if (!session) return {};

  const [profile, orders] = await Promise.all([
    prisma.clientProfile.findUnique({ where: { userId: session.userId } }),
    prisma.order.findMany({
      where: { userId: session.userId },
      include: { items: { include: { vendor: true } } },
      orderBy: { createdAt: "desc" },
      take: 50,
    }),
  ]);

  const cLat = profile?.latitude;
  const cLng = profile?.longitude;
  if (typeof cLat !== "number" || typeof cLng !== "number") return {}; // butuh lokasi klien

  const result: Record<string, Array<{ vendorName: string } & DistanceResult>> = {};

  for (const order of orders) {
    const perVendor: Array<{ vendorName: string } & DistanceResult> = [];
    const seen = new Set<string>();
    for (const item of order.items) {
      const v = item.vendor;
      if (!v || seen.has(v.id)) continue;
      if (typeof v.latitude !== "number" || typeof v.longitude !== "number") continue;
      seen.add(v.id);
      const dist = await estimateDrivingDistance(
        { lat: v.latitude, lng: v.longitude },
        { lat: cLat, lng: cLng }
      );
      perVendor.push({ vendorName: v.businessName, ...dist });
    }
    if (perVendor.length > 0) result[order.id] = perVendor;
  }

  return result;
}
