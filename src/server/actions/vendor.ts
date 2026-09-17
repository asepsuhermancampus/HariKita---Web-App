"use server";

import { withTransactionRetry } from "@/lib/transaction-retry";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/session";
import { setBlackoutDate, removeBlackoutDate } from "@/server/services/availability-service";
import { DomainError } from "@/server/services/errors";
import { detectOffPlatformContact } from "@/lib/content-guard";
import { runAction, revalidate, type ActionResult } from "./_shared";

/**
 * HariKita - Vendor Portal Server Actions (Phase 2)
 *
 * Aksi self-service mitra vendor: blackout dates (ketersediaan) dan CMS paket
 * layanan. Seluruh aksi owner-scoped terhadap VendorProfile milik sesi login.
 */

/** Mengambil vendorId milik sesi vendor yang login (auth + ownership). */
async function requireVendorId(): Promise<string> {
  const session = await getSession();
  if (!session || (session.role !== "VENDOR" && session.role !== "ADMIN")) {
    throw new DomainError("UNAUTHORIZED_ORDER_ACCESS", "Hanya mitra vendor yang dapat mengakses.");
  }
  const vendor = await prisma.vendorProfile.findUnique({ where: { userId: session.userId } });
  if (!vendor) {
    throw new DomainError("ORDER_NOT_FOUND", "Profil vendor tidak ditemukan untuk sesi ini.");
  }
  return vendor.id;
}

// ── BLACKOUT DATES ───────────────────────────────────────────────────────────

/** Menambahkan blackout date (kunci tanggal) untuk vendor yang login. */
export async function addBlackoutAction(input: {
  date: string;
  reason?: string;
}): Promise<ActionResult<{ date: string }>> {
  return runAction(async () => {
    const vendorId = await requireVendorId();
    if (!input.date) {
      throw new DomainError("INVALID_AVAILABILITY_TRANSITION", "Tanggal wajib diisi.");
    }

    await withTransactionRetry((tx) =>
      setBlackoutDate({ vendorId, date: input.date, reason: input.reason }, tx)
    );

    revalidate(["/dashboard/vendor/kalender"]);
    return { date: input.date };
  });
}

/** Menghapus blackout date (buka kunci tanggal). */
export async function removeBlackoutAction(input: {
  date: string;
}): Promise<ActionResult<{ date: string }>> {
  return runAction(async () => {
    const vendorId = await requireVendorId();
    if (!input.date) {
      throw new DomainError("INVALID_AVAILABILITY_TRANSITION", "Tanggal wajib diisi.");
    }

    await withTransactionRetry((tx) => removeBlackoutDate(vendorId, input.date, tx));

    revalidate(["/dashboard/vendor/kalender"]);
    return { date: input.date };
  });
}

// ── PACKAGE CMS ──────────────────────────────────────────────────────────────

export interface PackageInput {
  id?: string;
  name: string;
  description: string;
  category: string;
  basePrice: number;
  unitType?: string | null;
  unitPrice?: number | null;
  minUnit?: number | null;
  maxUnit?: number | null;
  slaDays?: number;
}

function validatePackage(input: PackageInput): void {
  if (!input.name?.trim()) {
    throw new DomainError("ITEM_PACKAGE_MISMATCH", "Nama paket wajib diisi.");
  }
  if (!input.description?.trim()) {
    throw new DomainError("ITEM_PACKAGE_MISMATCH", "Deskripsi paket wajib diisi.");
  }
  if (!Number.isInteger(input.basePrice) || input.basePrice <= 0) {
    throw new DomainError("ITEM_PACKAGE_MISMATCH", "Harga dasar harus integer > 0 (Rupiah).");
  }
  if (!input.category?.trim()) {
    throw new DomainError("ITEM_PACKAGE_MISMATCH", "Kategori wajib diisi.");
  }
}

/** Membuat paket layanan baru milik vendor yang login. */
export async function createPackageAction(
  input: PackageInput
): Promise<ActionResult<{ id: string }>> {
  return runAction(async () => {
    const vendorId = await requireVendorId();
    validatePackage(input);

    const created = await prisma.servicePackage.create({
      data: {
        vendorId,
        category: input.category.trim(),
        name: input.name.trim(),
        description: input.description.trim(),
        basePrice: input.basePrice,
        unitType: input.unitType ?? "all_in",
        unitPrice: input.unitPrice ?? null,
        minUnit: input.minUnit ?? null,
        maxUnit: input.maxUnit ?? null,
        slaDays: input.slaDays ?? 7,
      },
    });

    revalidate(["/dashboard/vendor/paket", "/kategori"]);
    return { id: created.id };
  });
}

/** Memperbarui paket layanan milik vendor yang login (anti-IDOR). */
export async function updatePackageAction(
  input: PackageInput & { id: string }
): Promise<ActionResult<{ id: string }>> {
  return runAction(async () => {
    const vendorId = await requireVendorId();
    validatePackage(input);

    // Pastikan paket milik vendor ini.
    const existing = await prisma.servicePackage.findUnique({ where: { id: input.id } });
    if (!existing || existing.vendorId !== vendorId) {
      throw new DomainError("ITEM_PACKAGE_MISMATCH", "Paket tidak ditemukan atau bukan milik Anda.");
    }

    await prisma.servicePackage.update({
      where: { id: input.id },
      data: {
        category: input.category.trim(),
        name: input.name.trim(),
        description: input.description.trim(),
        basePrice: input.basePrice,
        unitType: input.unitType ?? "all_in",
        unitPrice: input.unitPrice ?? null,
        minUnit: input.minUnit ?? null,
        maxUnit: input.maxUnit ?? null,
        slaDays: input.slaDays ?? existing.slaDays,
      },
    });

    revalidate(["/dashboard/vendor/paket", "/kategori"]);
    return { id: input.id };
  });
}

/**
 * Menghapus paket layanan milik vendor (anti-IDOR). Ditolak bila paket masih
 * terikat pada OrderItem aktif (menjaga integritas order historis).
 */
export async function deletePackageAction(input: {
  id: string;
}): Promise<ActionResult<{ id: string }>> {
  return runAction(async () => {
    const vendorId = await requireVendorId();

    const existing = await prisma.servicePackage.findUnique({ where: { id: input.id } });
    if (!existing || existing.vendorId !== vendorId) {
      throw new DomainError("ITEM_PACKAGE_MISMATCH", "Paket tidak ditemukan atau bukan milik Anda.");
    }

    const linkedItems = await prisma.orderItem.count({ where: { packageId: input.id } });
    if (linkedItems > 0) {
      throw new DomainError(
        "ITEM_PACKAGE_MISMATCH",
        "Paket tidak dapat dihapus karena masih terhubung dengan pesanan. Nonaktifkan saja."
      );
    }

    await prisma.servicePackage.delete({ where: { id: input.id } });
    revalidate(["/dashboard/vendor/paket", "/kategori"]);
    return { id: input.id };
  });
}

// ── PORTFOLIO CMS ─────────────────────────────────────────────────────────────

export interface PortfolioInput {
  id?: string;
  title: string;
  locationTag?: string;
  categoryTag?: string;
  styleTags?: string[];
  caption?: string;
  imageUrl: string;
}

function validatePortfolio(input: PortfolioInput): void {
  if (!input.title?.trim()) {
    throw new DomainError("ITEM_PACKAGE_MISMATCH", "Judul portofolio wajib diisi.");
  }
  if (!input.imageUrl?.trim()) {
    throw new DomainError("ITEM_PACKAGE_MISMATCH", "URL gambar portofolio wajib diisi.");
  }
  // Anti-disintermediation: saring kontak/medsos dari caption.
  if (input.caption) {
    const guard = detectOffPlatformContact(input.caption);
    if (guard.isViolation) {
      throw new DomainError(
        "ITEM_PACKAGE_MISMATCH",
        "Caption mengandung kontak/medsos di luar platform. Harap hapus nomor/link."
      );
    }
  }
}

/** Membuat portofolio baru milik vendor yang login. */
export async function createPortfolioAction(
  input: PortfolioInput
): Promise<ActionResult<{ id: string }>> {
  return runAction(async () => {
    const vendorId = await requireVendorId();
    validatePortfolio(input);

    const created = await prisma.vendorPortfolio.create({
      data: {
        vendorId,
        title: input.title.trim(),
        locationTag: input.locationTag?.trim() || null,
        categoryTag: input.categoryTag?.trim() || null,
        styleTags: input.styleTags ? JSON.stringify(input.styleTags) : null,
        caption: input.caption?.trim() || null,
        imageUrl: input.imageUrl.trim(),
      },
    });

    revalidate(["/dashboard/vendor/portofolio", "/vendor"]);
    return { id: created.id };
  });
}

/** Memperbarui portofolio milik vendor (anti-IDOR). */
export async function updatePortfolioAction(
  input: PortfolioInput & { id: string }
): Promise<ActionResult<{ id: string }>> {
  return runAction(async () => {
    const vendorId = await requireVendorId();
    validatePortfolio(input);

    const existing = await prisma.vendorPortfolio.findUnique({ where: { id: input.id } });
    if (!existing || existing.vendorId !== vendorId) {
      throw new DomainError("ITEM_PACKAGE_MISMATCH", "Portofolio tidak ditemukan atau bukan milik Anda.");
    }

    await prisma.vendorPortfolio.update({
      where: { id: input.id },
      data: {
        title: input.title.trim(),
        locationTag: input.locationTag?.trim() || null,
        categoryTag: input.categoryTag?.trim() || null,
        styleTags: input.styleTags ? JSON.stringify(input.styleTags) : null,
        caption: input.caption?.trim() || null,
        imageUrl: input.imageUrl.trim(),
      },
    });

    revalidate(["/dashboard/vendor/portofolio", "/vendor"]);
    return { id: input.id };
  });
}

/** Menghapus portofolio milik vendor (anti-IDOR). */
export async function deletePortfolioAction(input: {
  id: string;
}): Promise<ActionResult<{ id: string }>> {
  return runAction(async () => {
    const vendorId = await requireVendorId();

    const existing = await prisma.vendorPortfolio.findUnique({ where: { id: input.id } });
    if (!existing || existing.vendorId !== vendorId) {
      throw new DomainError("ITEM_PACKAGE_MISMATCH", "Portofolio tidak ditemukan atau bukan milik Anda.");
    }

    await prisma.vendorPortfolio.delete({ where: { id: input.id } });
    revalidate(["/dashboard/vendor/portofolio", "/vendor"]);
    return { id: input.id };
  });
}


