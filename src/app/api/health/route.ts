import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

/**
 * HariKita - Health / Readiness Endpoint
 *
 * GET /api/health
 *   - Liveness: proses responsif (selalu 200 bila route ini dieksekusi).
 *   - Readiness: koneksi database (`SELECT 1`) — mengembalikan 503 bila gagal.
 *
 * Tidak mengungkap detail internal pada produksi (hanya status ringkas).
 */

export const dynamic = "force-dynamic";

export async function GET(): Promise<NextResponse> {
  const startedAt = Date.now();
  let dbOk = false;
  let dbError: string | undefined;

  try {
    await prisma.$queryRaw`SELECT 1`;
    dbOk = true;
  } catch (error) {
    dbError = error instanceof Error ? error.message : String(error);
  }

  const body = {
    status: dbOk ? "ok" : "degraded",
    service: "harikita-web-app",
    checks: {
      database: dbOk ? "up" : "down",
      ...(dbOk ? {} : { databaseError: dbError }),
    },
    latencyMs: Date.now() - startedAt,
    timestamp: new Date().toISOString(),
  };

  return NextResponse.json(body, { status: dbOk ? 200 : 503 });
}
