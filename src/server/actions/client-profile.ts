"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/session";
import { validateClientProfileInput } from "@/lib/validations/client-profile";

export interface ClientProfileData {
  id: string;
  name: string;
  phone: string;
  email: string | null;
  partnerName: string | null;
  eventDate: string | null;
  eventLocation: string | null;
  district: string | null;
  themePreference: string | null;
  notes: string | null;
}

export interface ProfileActionResult {
  success: boolean;
  message?: string;
  fieldErrors?: Record<string, string[]>;
  error?: string;
  data?: ClientProfileData;
}

/**
 * Mengambil data profil klien yang sedang login dari database.
 */
export async function getClientProfile(): Promise<ClientProfileData | null> {
  const session = await getSession();
  if (!session) return null;

  const user = await prisma.user.findUnique({
    where: { id: session.userId },
    include: { clientProfile: true },
  });

  if (!user) return null;

  return {
    id: user.id,
    name: user.name,
    phone: user.phone,
    email: user.email,
    partnerName: user.clientProfile?.partnerName ?? null,
    eventDate: user.clientProfile?.eventDate
      ? user.clientProfile.eventDate.toISOString().split("T")[0]
      : null,
    eventLocation: user.clientProfile?.eventLocation ?? null,
    district: user.clientProfile?.district ?? "Kebumen",
    themePreference: user.clientProfile?.themePreference ?? null,
    notes: user.clientProfile?.notes ?? null,
  };
}

/**
 * Server Action: Memperbarui data profil klien (Anti-IDOR: userId diambil dari session server).
 */
export async function updateClientProfileAction(
  formData: FormData
): Promise<ProfileActionResult> {
  const session = await getSession();
  if (!session) {
    return {
      success: false,
      error: "Sesi Anda telah berakhir. Silakan masuk kembali.",
    };
  }

  // Siapkan data mentah dari FormData
  const rawData = {
    name: formData.get("name"),
    email: formData.get("email") || "",
    partnerName: formData.get("partnerName") || "",
    eventDate: formData.get("eventDate") || "",
    eventLocation: formData.get("eventLocation") || "",
    district: formData.get("district") || "",
    themePreference: formData.get("themePreference") || "",
    notes: formData.get("notes") || "",
  };

  // Validasi input data diri
  const validation = validateClientProfileInput(rawData);
  if (!validation.success || !validation.data) {
    return {
      success: false,
      error: "Terdapat data yang belum sesuai. Mohon periksa kembali formulir.",
      fieldErrors: validation.errors,
    };
  }

  const {
    name,
    email,
    partnerName,
    eventDate,
    eventLocation,
    district,
    themePreference,
    notes,
  } = validation.data;

  try {
    const parsedDate = eventDate ? new Date(eventDate) : null;

    // Mutasi database: Update User dan Upsert ClientProfile
    await prisma.$transaction([
      prisma.user.update({
        where: { id: session.userId },
        data: {
          name,
          email: email || null,
        },
      }),
      prisma.clientProfile.upsert({
        where: { userId: session.userId },
        create: {
          userId: session.userId,
          partnerName: partnerName || null,
          eventDate: parsedDate,
          eventLocation: eventLocation || null,
          district: district || "Kebumen",
          themePreference: themePreference || null,
          notes: notes || null,
        },
        update: {
          partnerName: partnerName || null,
          eventDate: parsedDate,
          eventLocation: eventLocation || null,
          district: district || "Kebumen",
          themePreference: themePreference || null,
          notes: notes || null,
        },
      }),
    ]);

    // Revalidasi cache halaman client
    revalidatePath("/client/profil");
    revalidatePath("/client");

    return {
      success: true,
      message: "Data profil berhasil disimpan dan diperbarui!",
    };
  } catch (err: unknown) {
    console.error("[updateClientProfileAction] Error:", err);
    return {
      success: false,
      error: "Gagal menyimpan data profil. Silakan coba lagi nanti.",
    };
  }
}
