import {
  mapCoupleProfileOwner,
  type AccountOwnerRole,
} from "@/lib/client-couple-profile";
import { validateClientProfileInput } from "@/lib/validations/client-profile";

export interface ClientProfileData {
  id: string;
  name: string;
  phone: string;
  email: string | null;
  partnerName: string | null;
  accountOwnerRole: AccountOwnerRole | null;
  groomName: string | null;
  brideName: string | null;
  coupleDisplayName: string | null;
  eventDate: string | null;
  eventLocation: string | null;
  district: string | null;
  themePreference: string | null;
  notes: string | null;
  rt: string | null;
  rw: string | null;
  dusun: string | null;
  desa: string | null;
  kecamatan: string | null;
  kabupaten: string | null;
  postalCode: string | null;
  latitude: number | null;
  longitude: number | null;
}

export interface ProfileActionResult {
  success: boolean;
  message?: string;
  fieldErrors?: Record<string, string[]>;
  error?: string;
  data?: ClientProfileData;
}

interface UpdateClientProfileDependencies {
  getSession: () => Promise<{ userId: string; role: string } | null>;
  userUpdate: (input: Record<string, unknown>) => unknown;
  clientProfileUpsert: (input: Record<string, unknown>) => unknown;
  transaction: (operations: unknown[]) => Promise<unknown>;
  getClientProfile: () => Promise<ClientProfileData | null>;
  revalidatePath: (path: string, type?: "layout") => void;
}

export function createUpdateClientProfileAction(
  dependencies: UpdateClientProfileDependencies
) {
  return async function updateClientProfileAction(
    formData: FormData
  ): Promise<ProfileActionResult> {
    const session = await dependencies.getSession();
    if (!session || session.role !== "CLIENT") {
      return {
        success: false,
        error: "Sesi klien tidak valid. Silakan masuk kembali.",
      };
    }

    const validation = validateClientProfileInput({
      accountOwnerRole: formData.get("accountOwnerRole"),
      groomName: formData.get("groomName"),
      brideName: formData.get("brideName"),
      coupleDisplayName: formData.get("coupleDisplayName"),
      email: formData.get("email") || "",
      eventDate: formData.get("eventDate") || "",
      eventLocation: formData.get("eventLocation") || "",
      district: formData.get("district") || "",
      themePreference: formData.get("themePreference") || "",
      notes: formData.get("notes") || "",
    });
    if (!validation.success || !validation.data) {
      return {
        success: false,
        error: "Terdapat data yang belum sesuai. Mohon periksa kembali formulir.",
        fieldErrors: validation.errors,
      };
    }

    const {
      accountOwnerRole,
      groomName,
      brideName,
      coupleDisplayName,
      email,
      eventDate,
      eventLocation,
      district,
      themePreference,
      notes,
    } = validation.data;
    const stringValue = (key: string) => {
      const value = formData.get(key);
      return typeof value === "string" && value.trim() !== ""
        ? value.trim()
        : null;
    };
    const numberValue = (key: string) => {
      const value = formData.get(key);
      if (typeof value !== "string" || value.trim() === "") return null;
      const number = Number(value);
      return Number.isFinite(number) ? number : null;
    };
    const geo = {
      rt: stringValue("rt"),
      rw: stringValue("rw"),
      dusun: stringValue("dusun"),
      desa: stringValue("desa"),
      kecamatan: stringValue("kecamatan"),
      kabupaten: stringValue("kabupaten") ?? "Kebumen",
      postalCode: stringValue("postalCode"),
      latitude: numberValue("latitude"),
      longitude: numberValue("longitude"),
    };

    try {
      const identity = mapCoupleProfileOwner({
        accountOwnerRole,
        groomName,
        brideName,
      });
      const profile = {
        accountOwnerRole,
        groomName,
        brideName,
        coupleDisplayName,
        partnerName: identity.partnerName,
        eventDate: eventDate ? new Date(eventDate) : null,
        eventLocation: eventLocation || null,
        district: district || "Kebumen",
        themePreference: themePreference || null,
        notes: notes || null,
        ...geo,
      };

      await dependencies.transaction([
        dependencies.userUpdate({
          where: { id: session.userId },
          data: { name: identity.ownerName, email: email || null },
        }),
        dependencies.clientProfileUpsert({
          where: { userId: session.userId },
          create: { userId: session.userId, ...profile },
          update: profile,
        }),
      ]);

      dependencies.revalidatePath("/client", "layout");
      dependencies.revalidatePath("/client");
      dependencies.revalidatePath("/client/profil");
      const data = await dependencies.getClientProfile();

      return {
        success: true,
        message: "Data pasangan berhasil diperbarui.",
        data: data ?? undefined,
      };
    } catch (err: unknown) {
      console.error("[updateClientProfileAction] Error:", err);
      return {
        success: false,
        error: "Gagal menyimpan data profil. Silakan coba lagi nanti.",
      };
    }
  };
}
