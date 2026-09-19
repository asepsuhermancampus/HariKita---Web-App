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

/** Membuat user BA + BrandAmbassador uji. */
export async function seedAmbassador(
  prisma: PrismaClient,
  opts?: { commissionPct?: number; isActive?: boolean; displayName?: string }
) {
  const user = await prisma.user.create({
    data: {
      name: opts?.displayName ?? "BA Uji",
      phone: `0855${Math.floor(Math.random() * 1e8).toString().padStart(8, "0")}`,
      role: "BA",
    },
  });
  const ambassador = await prisma.brandAmbassador.create({
    data: {
      userId: user.id,
      referralCode: `BA-TEST-${Math.floor(Math.random() * 1e6).toString(36).toUpperCase()}`,
      displayName: opts?.displayName ?? "BA Uji",
      commissionPct: opts?.commissionPct ?? 5.0,
      isActive: opts?.isActive ?? true,
    },
  });
  return { userId: user.id, ambassadorId: ambassador.id, referralCode: ambassador.referralCode };
}

/** Membuat vendor yang direkrut seorang BA + paket uji. */
export async function seedVendorWithRecruiter(
  prisma: PrismaClient,
  opts: { ambassadorId: string; commissionPct: number; price: number; businessName?: string }
) {
  const ba = await prisma.brandAmbassador.findUnique({ where: { id: opts.ambassadorId } });
  if (ba) {
    await prisma.brandAmbassador.update({
      where: { id: ba.id },
      data: { commissionPct: opts.commissionPct },
    });
  }
  const user = await prisma.user.create({
    data: {
      name: opts.businessName ?? "Vendor Rekrutan",
      phone: `0813${Math.floor(Math.random() * 1e8).toString().padStart(8, "0")}`,
      role: "VENDOR",
    },
  });
  const vendor = await prisma.vendorProfile.create({
    data: {
      userId: user.id,
      businessName: opts.businessName ?? "Vendor Rekrutan",
      category: "katering",
      address: "Jl. Test, Kebumen",
      recruitedById: opts.ambassadorId,
    },
  });
  const pkg = await prisma.servicePackage.create({
    data: {
      vendorId: vendor.id,
      category: "katering",
      name: "Paket Rekrutan",
      description: "Paket uji",
      basePrice: opts.price,
      unitType: "all_in",
    },
  });
  return { userId: user.id, vendorId: vendor.id, packageId: pkg.id, ambassadorId: opts.ambassadorId };
}

/** Membuat record OtpCode uji (kode default "123456"). */
export async function seedOtpCode(
  prisma: PrismaClient,
  opts: {
    email: string;
    purpose?: "REGISTER" | "RESET_PIN";
    status?: string;
    attempts?: number;
    expiresAt?: Date;
    lockedUntil?: Date | null;
    code?: string;
    createdAt?: Date;
  }
) {
  const bcrypt = (await import("bcryptjs")).default;
  const code = opts.code ?? "123456";
  const codeHash = await bcrypt.hash(code, 10);
  return prisma.otpCode.create({
    data: {
      email: opts.email.toLowerCase(),
      codeHash,
      purpose: opts.purpose ?? "REGISTER",
      status: opts.status ?? "PENDING",
      attempts: opts.attempts ?? 0,
      expiresAt: opts.expiresAt ?? new Date(Date.now() + 5 * 60 * 1000),
      lockedUntil: opts.lockedUntil ?? null,
      createdAt: opts.createdAt ?? new Date(),
    },
  });
}
