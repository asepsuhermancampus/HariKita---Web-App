import type { AccountOwnerRole } from "../client-couple-profile";

export const PhoneRegex = /^(\+62|62|0)8[1-9][0-9]{7,11}$/;
export const EmailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export const KEBUMEN_DISTRICTS = [
  "Kebumen",
  "Gombong",
  "Karanganyar",
  "Kutowinangun",
  "Prembun",
  "Alian",
  "Ambal",
  "Ayah",
  "Buayan",
  "Buluspesantren",
  "Bonorowo",
  "Karanggayam",
  "Klirong",
  "Kragan",
  "Kuwarasan",
  "Mirit",
  "Padureso",
  "Pejagoan",
  "Petanahan",
  "Poncowarno",
  "Puring",
  "Rowokele",
  "Sadang",
  "Sempor",
  "Sruweng",
] as const;

export const EVENT_THEMES = [
  "Jawa Klasik & Adat Kebumen",
  "Jawa Modern Minimalis",
  "Sunda Siger Elegan",
  "Muslim Chic & Syar'i Anggun",
  "Korean Glow Romantic",
  "Rustic Garden Intimate",
  "Monochrome Modern Bold",
] as const;

export interface UpdateClientProfileInput {
  accountOwnerRole: AccountOwnerRole;
  groomName: string;
  brideName: string;
  coupleDisplayName: string;
  email?: string;
  eventDate?: string;
  eventLocation?: string;
  district?: string;
  themePreference?: string;
  notes?: string;
}

export interface ValidationResult<T> {
  success: boolean;
  data?: T;
  errors?: Record<string, string[]>;
}

export function validateClientProfileInput(
  raw: Record<string, unknown>
): ValidationResult<UpdateClientProfileInput> {
  const errors: Record<string, string[]> = {};

  const accountOwnerRole =
    raw.accountOwnerRole === "GROOM" || raw.accountOwnerRole === "BRIDE"
      ? raw.accountOwnerRole
      : null;
  if (!accountOwnerRole) {
    errors.accountOwnerRole = ["Pilih peran pemilik akun."];
  }

  const groomName =
    typeof raw.groomName === "string" ? raw.groomName.trim() : "";
  if (groomName.length < 2 || groomName.length > 100) {
    errors.groomName = ["Nama mempelai pria harus 2-100 karakter."];
  }

  const brideName =
    typeof raw.brideName === "string" ? raw.brideName.trim() : "";
  if (brideName.length < 2 || brideName.length > 100) {
    errors.brideName = ["Nama mempelai wanita harus 2-100 karakter."];
  }

  const coupleDisplayName =
    typeof raw.coupleDisplayName === "string"
      ? raw.coupleDisplayName.trim()
      : "";
  if (coupleDisplayName.length < 2 || coupleDisplayName.length > 40) {
    errors.coupleDisplayName = [
      "Nama tampilan pasangan harus 2-40 karakter.",
    ];
  }

  const email = typeof raw.email === "string" ? raw.email.trim() : "";
  if (email && !EmailRegex.test(email)) {
    errors.email = ["Format email tidak valid (contoh: pengantin@gmail.com)."];
  }

  const eventDate =
    typeof raw.eventDate === "string" ? raw.eventDate.trim() : "";
  if (eventDate) {
    const parsed = new Date(eventDate);
    if (isNaN(parsed.getTime())) {
      errors.eventDate = ["Format tanggal acara tidak valid."];
    }
  }

  const eventLocation =
    typeof raw.eventLocation === "string" ? raw.eventLocation.trim() : "";
  if (eventLocation && eventLocation.length > 200) {
    errors.eventLocation = ["Nama lokasi/gedung maksimal 200 karakter."];
  }

  const district =
    typeof raw.district === "string" ? raw.district.trim() : "Kebumen";
  const themePreference =
    typeof raw.themePreference === "string" ? raw.themePreference.trim() : "";

  const notes = typeof raw.notes === "string" ? raw.notes.trim() : "";
  if (notes && notes.length > 1000) {
    errors.notes = ["Catatan maksimal 1000 karakter."];
  }

  if (Object.keys(errors).length > 0) {
    return { success: false, errors };
  }

  return {
    success: true,
    data: {
      accountOwnerRole: accountOwnerRole as AccountOwnerRole,
      groomName,
      brideName,
      coupleDisplayName,
      email: email || undefined,
      eventDate: eventDate || undefined,
      eventLocation: eventLocation || undefined,
      district: district || undefined,
      themePreference: themePreference || undefined,
      notes: notes || undefined,
    },
  };
}
