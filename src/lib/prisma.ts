import { PrismaClient } from "@prisma/client";

/**
 * HariKita — Prisma Client Singleton (dual-provider aware)
 *
 * Arsitektur dual-provider (lihat docs/RUNBOOK_DEPLOY_SUPABASE_VERCEL_MIDTRANS.md):
 *  - Produksi (Supabase/Vercel) : PostgreSQL  → client `@prisma/client`
 *  - Dev lokal / test           : SQLite      → client `generated/sqlite-client`
 *
 * Pemilihan client ditentukan dari skema `DATABASE_URL`:
 *  - `file:...`            → SQLite  (dev lokal)
 *  - `postgresql://...`    → PostgreSQL (produksi)
 *
 * Loader SQLite bersifat lazy (require) agar build produksi tidak wajib
 * menyertakan folder `generated/` (di-gitignore) saat deploy.
 */

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

function resolveDatasourceUrl(): string {
  return process.env.DATABASE_URL ?? "";
}

function isSqliteUrl(url: string): boolean {
  return url.startsWith("file:");
}

function normalizeDatasourceUrl(url: string): string {
  if (!url) return url;
  // Jika memakai Neon pooler (PgBouncer transaction mode), wajib append pgbouncer=true
  if (url.includes("-pooler.") && !url.includes("pgbouncer=")) {
    const separator = url.includes("?") ? "&" : "?";
    return `${url}${separator}pgbouncer=true&connect_timeout=15`;
  }
  return url;
}

function createPrismaClient(): PrismaClient {
  const url = resolveDatasourceUrl();

  if (isSqliteUrl(url)) {
    // Dev lokal: gunakan client SQLite yang di-generate terpisah.
    // require() dinamis agar tidak dibundel ke build produksi.
    try {
      // eslint-disable-next-line @typescript-eslint/no-var-requires
      const { PrismaClient: SqlitePrismaClient } = require("../../generated/sqlite-client");
      return new SqlitePrismaClient({
        log: process.env.NODE_ENV === "development" ? ["query", "error", "warn"] : ["error"],
      }) as unknown as PrismaClient;
    } catch (err) {
      throw new Error(
        "[prisma] DATABASE_URL menunjuk ke SQLite tetapi client `generated/sqlite-client` " +
          "belum di-generate. Jalankan: npm run generate:sqlite\n" +
          (err instanceof Error ? err.message : String(err))
      );
    }
  }

  // Produksi / PostgreSQL (termasuk Neon & Supabase)
  const finalUrl = normalizeDatasourceUrl(url);
  return new PrismaClient({
    datasourceUrl: finalUrl || undefined,
    log: process.env.NODE_ENV === "development" ? ["query", "error", "warn"] : ["error"],
  });
}

export const prisma = globalForPrisma.prisma ?? createPrismaClient();

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;
