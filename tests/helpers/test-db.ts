import { PrismaClient as SqlitePrismaClient } from "../../generated/sqlite-client";
import type { PrismaClient } from "@prisma/client";
import { execFileSync } from "node:child_process";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";

/**
 * Test helper: menyediakan PrismaClient yang terisolasi pada salinan SQLite
 * temporer sehingga database pengembangan (`prisma/dev.db`) tidak tersentuh.
 *
 * CATATAN ARSITEKTUR (dual-provider):
 *  - Produksi memakai PostgreSQL (lihat prisma/schema.prisma).
 *  - Dev lokal & test memakai SQLite (prisma/schema.sqlite.prisma, client
 *    terpisah di generated/sqlite-client).
 *  - Instance runtime di sini adalah client SQLite, namun di-*cast* ke tipe
 *    `PrismaClient` dari `@prisma/client` agar service layer (yang bertipe
 *    PostgreSQL) dapat menerimanya saat pengujian. Aman karena perilaku query
 *    identik; hanya engine provider yang berbeda.
 */

export interface TestDb {
  prisma: PrismaClient;
  cleanup: () => Promise<void>;
}

const projectRoot = path.resolve(__dirname, "..", "..");

export async function createTestDb(): Promise<TestDb> {
  const tempDir = fs.mkdtempSync(path.join(os.tmpdir(), "harikita-test-"));
  const dbPath = path.join(tempDir, "test.db");
  const sourceDb = path.join(projectRoot, "prisma", "dev.db");

  if (fs.existsSync(sourceDb)) {
    fs.copyFileSync(sourceDb, dbPath);
  } else {
    const tempSchema = path.join(tempDir, "schema.sqlite.prisma");
    const schemaSource = fs.readFileSync(
      path.join(projectRoot, "prisma", "schema.sqlite.prisma"),
      "utf-8"
    );
    fs.writeFileSync(
      tempSchema,
      schemaSource.replace(
        'url      = env("DATABASE_URL")',
        `url      = "file:${dbPath.replace(/\\/g, "/")}"`
      )
    );
    execFileSync("npx", ["prisma", "db", "push", "--schema", tempSchema, "--skip-generate"], {
      cwd: projectRoot,
      stdio: "ignore",
      shell: true,
    });
  }

  const sqliteClient = new SqlitePrismaClient({
    datasources: { db: { url: `file:${dbPath.replace(/\\/g, "/")}` } },
  });
  const prisma = sqliteClient as unknown as PrismaClient;

  return {
    prisma,
    cleanup: async () => {
      await sqliteClient.$disconnect();
      if (fs.existsSync(tempDir)) fs.rmSync(tempDir, { recursive: true, force: true });
    },
  };
}

/** Membuat vendor + paket uji, mengembalikan id-nya. */
export async function seedVendorWithPackage(
  prisma: PrismaClient,
  opts: { category: string; businessName: string; price: number }
) {
  const user = await prisma.user.create({
    data: {
      name: opts.businessName,
      phone: `0812${Math.floor(Math.random() * 1e8).toString().padStart(8, "0")}`,
      role: "VENDOR",
    },
  });
  const vendor = await prisma.vendorProfile.create({
    data: {
      userId: user.id,
      businessName: opts.businessName,
      category: opts.category,
      address: "Jl. Test, Kebumen",
    },
  });
  const pkg = await prisma.servicePackage.create({
    data: {
      vendorId: vendor.id,
      category: opts.category,
      name: `${opts.businessName} Package`,
      description: "Paket uji",
      basePrice: opts.price,
      unitType: "all_in",
    },
  });
  return { userId: user.id, vendorId: vendor.id, packageId: pkg.id };
}

/** Membuat klien uji. */
export async function seedClient(prisma: PrismaClient, name: string) {
  const user = await prisma.user.create({
    data: { name, phone: `0819${Math.floor(Math.random() * 1e8).toString().padStart(8, "0")}`, role: "CLIENT" },
  });
  return { userId: user.id };
}
