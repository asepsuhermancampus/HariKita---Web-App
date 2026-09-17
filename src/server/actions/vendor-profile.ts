"use server";

import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/session";
import { validateVendorProfileInput, UpdateVendorProfileInput } from "@/lib/validations/vendor-profile";
import { revalidatePath } from "next/cache";

export interface VendorProfileData {
  id: string;
  userId: string;
  phone: string;
  email: string;
  businessName: string;
  category: string;
  picName: string;
  city: string;
  district: string;
  address: string;
  description: string;
  slaGuarantees: string;
  rating: number;
  reviewCount: number;
  igHandle: string;
  tiktokHandle: string;
  bankName: string;
  bankAccount: string;
  bankHolder: string;
  walletBalance: number;
  isVerified: boolean;
  viewsGuest: number;
  viewsAuth: number;
  builderTrials: number;
  bookmarksCount: number;
  ordersSolo: number;
  ordersCombo: number;
}

export interface VendorProfileActionResult {
  success: boolean;
  message?: string;
  error?: string;
  fieldErrors?: Record<string, string[]>;
  data?: VendorProfileData;
}

/**
 * Mengambil profil vendor yang sedang login dari database.
 * Terlindungi anti-IDOR: hanya mengambil data milik session user saat ini.
 */
export async function getVendorProfile(): Promise<VendorProfileData | null> {
  const session = await getSession();
  if (!session || !session.userId) {
    return null;
  }

  const user = await prisma.user.findUnique({
    where: { id: session.userId },
    include: { vendorProfile: true },
  });

  if (!user) return null;

  // Jika belum ada profile, buat record default
  let profile = user.vendorProfile;
  if (!profile) {
    profile = await prisma.vendorProfile.create({
      data: {
        userId: user.id,
        businessName: user.name || "Mitra Studio Kebumen",
        category: "Busana Pengantin & Fitting",
        picName: user.name || "Penanggung Jawab Studio",
        city: "Kebumen",
        district: "Kebumen",
        address: "Jl. Pahlawan No. 12, Kebumen Kota",
        description: "Penyedia jasa pernikahan dan lamaran terpercaya dengan kurasi lokal Kebumen.",
        slaGuarantees: "Standby 60 menit sebelum call time. Pergantian kru cadangan terverifikasi.",
        bankName: "Bank Central Asia (BCA)",
        bankAccount: "8277-0192-33",
        bankHolder: user.name || "Mitra HariKita",
        viewsGuest: 184,
        viewsAuth: 76,
        builderTrials: 42,
        bookmarksCount: 28,
        ordersSolo: 9,
        ordersCombo: 16,
      },
    });
  }

  return {
    id: profile.id,
    userId: user.id,
    phone: user.phone,
    email: user.email || "",
    businessName: profile.businessName,
    category: profile.category,
    picName: profile.picName || user.name || "",
    city: profile.city || "Kebumen",
    district: profile.district || "Kebumen",
    address: profile.address || "",
    description: profile.description || "",
    slaGuarantees: profile.slaGuarantees || "",
    rating: profile.rating,
    reviewCount: profile.reviewCount,
    igHandle: profile.igHandle || "",
    tiktokHandle: profile.tiktokHandle || "",
    bankName: profile.bankName || "Bank Central Asia (BCA)",
    bankAccount: profile.bankAccount || "",
    bankHolder: profile.bankHolder || "",
    walletBalance: profile.walletBalance,
    isVerified: profile.isVerified,
    viewsGuest: profile.viewsGuest,
    viewsAuth: profile.viewsAuth,
    builderTrials: profile.builderTrials,
    bookmarksCount: profile.bookmarksCount,
    ordersSolo: profile.ordersSolo,
    ordersCombo: profile.ordersCombo,
  };
}

/**
 * Server Action untuk menyimpan perubahan profil vendor.
 */
export async function updateVendorProfileAction(
  formData: FormData
): Promise<VendorProfileActionResult> {
  const session = await getSession();
  if (!session || !session.userId) {
    return {
      success: false,
      error: "Sesi login telah berakhir. Silakan login kembali.",
    };
  }

  const raw = {
    businessName: formData.get("businessName"),
    category: formData.get("category"),
    picName: formData.get("picName"),
    email: formData.get("email"),
    district: formData.get("district"),
    address: formData.get("address"),
    description: formData.get("description"),
    slaGuarantees: formData.get("slaGuarantees"),
    igHandle: formData.get("igHandle"),
    tiktokHandle: formData.get("tiktokHandle"),
    bankName: formData.get("bankName"),
    bankAccount: formData.get("bankAccount"),
    bankHolder: formData.get("bankHolder"),
  };

  const validation = validateVendorProfileInput(raw);
  if (!validation.success || !validation.data) {
    return {
      success: false,
      error: "Data profil vendor tidak valid. Mohon periksa isian Anda.",
      fieldErrors: validation.errors,
    };
  }

  const input: UpdateVendorProfileInput = validation.data;

  try {
    const updated = await prisma.$transaction(async (tx) => {
      // 1. Update email di User jika diisi
      if (input.email) {
        await tx.user.update({
          where: { id: session.userId },
          data: {
            email: input.email,
            name: input.picName || input.businessName,
          },
        });
      }

      // 2. Upsert VendorProfile
      return tx.vendorProfile.upsert({
        where: { userId: session.userId },
        create: {
          userId: session.userId,
          businessName: input.businessName,
          category: input.category,
          picName: input.picName,
          city: "Kebumen",
          district: input.district || "Kebumen",
          address: input.address,
          description: input.description,
          slaGuarantees: input.slaGuarantees,
          igHandle: input.igHandle,
          tiktokHandle: input.tiktokHandle,
          bankName: input.bankName,
          bankAccount: input.bankAccount,
          bankHolder: input.bankHolder,
        },
        update: {
          businessName: input.businessName,
          category: input.category,
          picName: input.picName,
          district: input.district || "Kebumen",
          address: input.address,
          description: input.description,
          slaGuarantees: input.slaGuarantees,
          igHandle: input.igHandle,
          tiktokHandle: input.tiktokHandle,
          bankName: input.bankName,
          bankAccount: input.bankAccount,
          bankHolder: input.bankHolder,
        },
      });
    });

    revalidatePath("/dashboard/vendor/profil");
    revalidatePath("/dashboard/vendor");
    // Profil publik & katalog ikut berubah saat nama/kategori vendor diperbarui
    revalidatePath("/vendor");

    return {
      success: true,
      message: "Profil studio vendor & rekening pencairan berhasil diperbarui!",
    };
  } catch (err: any) {
    console.error("Error updateVendorProfileAction:", err);
    return {
      success: false,
      error: "Terjadi kendala server saat menyimpan data. Coba lagi.",
    };
  }
}
