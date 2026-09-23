import React from "react";
import { getVendorProfile } from "@/server/actions/vendor-profile";
import { VendorProfilWorkspace } from "./VendorProfilWorkspace";
import { VendorVerificationForm } from "@/components/vendor/VendorVerificationForm";

export const metadata = {
  title: "Atelier Studio & Dashboard Statistik Vendor | HariKita Kebumen",
  description:
    "Pusat kendali studio mitra vendor: grafik tren interaktif kurva bezier, impresi tamu vs klien, peracikan paket, pesanan escrow, peta rute venue, dan prakiraan cuaca Kebumen.",
};

export default async function VendorProfilPage() {
  const profile = await getVendorProfile();

  // Fallback data jika belum login session
  const data = profile || {
    id: "guest-vendor",
    userId: "guest",
    phone: "0812-3456-7890",
    email: "mitra@harikita.id",
    businessName: "Menganti Studio & Cinematic",
    category: "Pre-wedding",
    picName: "Bagus Setiawan",
    city: "Kebumen",
    district: "Kebumen",
    address: "Jl. Pahlawan No. 18, Kebumen Kota",
    description:
      "Studio foto & videografi pre-wedding spesialis lanskap alam pantai dan perbukitan eksotis Kebumen.",
    slaGuarantees:
      "Tiba di lokasi H-60 menit. Backup kamera ganda & garansi file aman 100%.",
    rating: 4.9,
    reviewCount: 24,
    igHandle: "@menganticinematic",
    tiktokHandle: "@mengantistudio",
    bankName: "Bank Central Asia (BCA)",
    bankAccount: "8277-0192-33",
    bankHolder: "Bagus Setiawan",
    walletBalance: 4900000,
    isVerified: true,
    viewsGuest: 184,
    viewsAuth: 76,
    builderTrials: 42,
    bookmarksCount: 28,
    ordersSolo: 9,
    ordersCombo: 16,
    verificationStatus: "APPROVED",
    verificationNote: null,
    ktpNumber: null,
    ktpPhotoUrl: null,
    businessPhotoUrl: null,
    revenueMethod: "BANK",
    ewalletProvider: null,
    rt: null,
    rw: null,
    dusun: null,
    desa: null,
    kecamatan: "Kebumen",
    kabupaten: "Kebumen",
    postalCode: null,
    latitude: -7.6683,
    longitude: 109.6533,
    profileCompleted: true,
    submittedAt: null,
  };

  return (
    <div className="flex flex-col gap-6">
      <VendorVerificationForm data={data} />
      <VendorProfilWorkspace data={data} />
    </div>
  );
}
