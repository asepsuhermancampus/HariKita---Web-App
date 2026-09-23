/**
 * Validasi kelengkapan data verifikasi vendor (fungsi murni).
 * Dipisah dari "use server" agar bisa dipakai server & test tanpa batasan action.
 */
export interface VendorCompletenessInput {
  businessName?: string | null;
  category?: string | null;
  ktpNumber?: string | null;
  ktpPhotoUrl?: string | null;
  businessPhotoUrl?: string | null;
  revenueMethod?: string | null;
  bankName?: string | null;
  bankAccount?: string | null;
  bankHolder?: string | null;
  ewalletProvider?: string | null;
  phone?: string | null;
  address?: string | null;
  desa?: string | null;
  kecamatan?: string | null;
  latitude?: number | null;
  longitude?: number | null;
}

/** Daftar field wajib yang masih kosong untuk verifikasi vendor. */
export function validateVendorCompleteness(v: VendorCompletenessInput): string[] {
  const missing: string[] = [];
  const req = (cond: boolean, label: string) => {
    if (!cond) missing.push(label);
  };
  req(!!v.businessName?.trim(), "Nama usaha");
  req(!!v.category?.trim(), "Kategori");
  req(!!v.ktpNumber?.trim(), "Nomor KTP");
  req(!!v.ktpPhotoUrl, "Foto KTP");
  req(!!v.businessPhotoUrl, "Foto usaha");
  req(!!v.phone?.trim(), "No WhatsApp");
  req(!!v.address?.trim(), "Alamat");
  req(!!v.desa?.trim(), "Desa/Kelurahan");
  req(!!v.kecamatan?.trim(), "Kecamatan");
  req(
    typeof v.latitude === "number" && typeof v.longitude === "number",
    "Titik lokasi peta"
  );
  if (v.revenueMethod === "EWALLET") {
    req(!!v.ewalletProvider?.trim(), "Provider e-wallet");
    req(!!v.bankAccount?.trim(), "No e-wallet");
    req(!!v.bankHolder?.trim(), "Nama pemilik e-wallet");
  } else {
    req(!!v.bankName?.trim(), "Nama bank");
    req(!!v.bankAccount?.trim(), "No rekening");
    req(!!v.bankHolder?.trim(), "Nama pemilik rekening");
  }
  return missing;
}
