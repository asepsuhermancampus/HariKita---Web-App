import React from "react";
import {
  getVendorRingkasan,
  getVendorBlackouts,
  getCurrentVendor,
} from "@/server/queries/vendor";
import { getVendorProfile } from "@/server/actions/vendor-profile";
import { getSession } from "@/lib/session";
import { VendorRingkasanClient } from "./VendorRingkasanClient";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Ringkasan Toko Vendor | HariKita Kebumen",
  description:
    "Ringkasan operasional mitra vendor: saldo dompet payout, ketersediaan blackout dates, pesanan, dan metrik trafik profil.",
};

/**
 * Halaman Ringkasan portal vendor — Server Component.
 * Seluruh data berasal dari database milik vendor yang login.
 */
export default async function VendorPortalPage() {
  const vendor = await getCurrentVendor();

  // Fallback: sesi VENDOR/ADMIN tanpa profil ter-resolve → self-heal via
  // getVendorProfile() agar halaman tetap menampilkan data owner.
  if (!vendor) {
    const [profile, session] = await Promise.all([getVendorProfile(), getSession()]);
    if (!profile || !session) {
      return (
        <div className="flex flex-col items-center justify-center gap-3 py-20 text-center">
          <p className="font-editorial text-2xl text-hk-charcoal">
            Profil vendor tidak ditemukan
          </p>
          <p className="max-w-md text-xs text-hk-taupe">
            Sesi Anda belum terhubung ke profil vendor. Silakan muat ulang halaman atau login
            kembali.
          </p>
        </div>
      );
    }
    return (
      <VendorRingkasanClient
        vendor={{
          id: profile.id,
          businessName: profile.businessName,
          category: profile.category,
          city: profile.city,
          slug: profile.slug,
          isVerified: profile.isVerified,
          verificationStatus: profile.verificationStatus,
          rating: profile.rating,
          reviewCount: profile.reviewCount,
          walletBalance: profile.walletBalance,
          viewsGuest: profile.viewsGuest,
          viewsAuth: profile.viewsAuth,
          builderTrials: profile.builderTrials,
          bookmarksCount: profile.bookmarksCount,
          ordersSolo: profile.ordersSolo,
          ordersCombo: profile.ordersCombo,
        }}
        dbBlackouts={[]}
      />
    );
  }

  const ringkasan = await getVendorRingkasan();
  const dbBlackouts = await getVendorBlackouts();

  if (!ringkasan) {
    return (
      <div className="flex flex-col items-center justify-center gap-3 py-20 text-center">
        <p className="font-editorial text-2xl text-hk-charcoal">Profil vendor tidak ditemukan</p>
        <p className="max-w-md text-xs text-hk-taupe">
          Data vendor tidak dapat dimuat saat ini. Coba muat ulang beberapa saat lagi.
        </p>
      </div>
    );
  }

  return <VendorRingkasanClient vendor={ringkasan} dbBlackouts={dbBlackouts} />;
}
