import { KEBUMEN_DISTRICTS, PhoneRegex, EmailRegex, ValidationResult } from "./client-profile";

export { KEBUMEN_DISTRICTS };

export const VENDOR_CATEGORIES = [
  "Pre-wedding",
  "Busana Pengantin & Fitting",
  "Makeup Artist (MUA)",
  "Kotak Seserahan & Mahar",
  "Dokumentasi Foto-Video",
  "Dekorasi & Florist",
  "Katering & Food Stalls",
  "Kue Acara & Dessert Corner",
  "Souvenir & Favors",
  "Undangan Digital & Amplop Hybrid",
  "Cute Illustrated Maps",
] as const;

export const SUPPORTED_BANKS = [
  "Bank Central Asia (BCA)",
  "Bank Mandiri",
  "Bank Rakyat Indonesia (BRI)",
  "Bank Negara Indonesia (BNI)",
  "Bank Syariah Indonesia (BSI)",
  "Bank Jateng",
] as const;

export interface UpdateVendorProfileInput {
  businessName: string;
  category: string;
  picName?: string;
  email?: string;
  city?: string;
  district?: string;
  address: string;
  description?: string;
  slaGuarantees?: string;
  igHandle?: string;
  tiktokHandle?: string;
  bankName?: string;
  bankAccount?: string;
  bankHolder?: string;
}

export function validateVendorProfileInput(
  raw: Record<string, unknown>
): ValidationResult<UpdateVendorProfileInput> {
  const errors: Record<string, string[]> = {};

  const businessName = typeof raw.businessName === "string" ? raw.businessName.trim() : "";
  if (!businessName) {
    errors.businessName = ["Nama bisnis/studio vendor wajib diisi."];
  } else if (businessName.length < 3) {
    errors.businessName = ["Nama bisnis minimal 3 karakter."];
  }

  const category = typeof raw.category === "string" ? raw.category.trim() : "";
  if (!category) {
    errors.category = ["Kategori layanan wajib dipilih."];
  }

  const address = typeof raw.address === "string" ? raw.address.trim() : "";
  if (!address) {
    errors.address = ["Alamat studio/kantor vendor di Kebumen wajib diisi."];
  }

  let email: string | undefined = undefined;
  if (raw.email && typeof raw.email === "string" && raw.email.trim() !== "") {
    const trimmed = raw.email.trim();
    if (!EmailRegex.test(trimmed)) {
      errors.email = ["Format email penagihan tidak valid."];
    } else {
      email = trimmed;
    }
  }

  let district: string | undefined = "Kebumen";
  if (raw.district && typeof raw.district === "string" && raw.district.trim() !== "") {
    district = raw.district.trim();
  }

  const picName = typeof raw.picName === "string" ? raw.picName.trim() : undefined;
  const description = typeof raw.description === "string" ? raw.description.trim() : undefined;
  const slaGuarantees = typeof raw.slaGuarantees === "string" ? raw.slaGuarantees.trim() : undefined;
  const igHandle = typeof raw.igHandle === "string" ? raw.igHandle.trim().replace(/^@/, "") : undefined;
  const tiktokHandle = typeof raw.tiktokHandle === "string" ? raw.tiktokHandle.trim().replace(/^@/, "") : undefined;
  const bankName = typeof raw.bankName === "string" ? raw.bankName.trim() : undefined;
  const bankAccount = typeof raw.bankAccount === "string" ? raw.bankAccount.trim() : undefined;
  const bankHolder = typeof raw.bankHolder === "string" ? raw.bankHolder.trim() : undefined;

  if (Object.keys(errors).length > 0) {
    return { success: false, errors };
  }

  return {
    success: true,
    data: {
      businessName,
      category,
      picName,
      email,
      city: "Kebumen",
      district,
      address,
      description,
      slaGuarantees,
      igHandle,
      tiktokHandle,
      bankName,
      bankAccount,
      bankHolder,
    },
  };
}
