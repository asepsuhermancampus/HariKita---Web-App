"use server";

import { revalidatePath } from "next/cache";
import type { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/session";
import { toWibDateString } from "@/lib/date-utils";
import type { AccountOwnerRole } from "@/lib/client-couple-profile";
import {
  createUpdateClientProfileAction,
  type ClientProfileData,
} from "./client-profile-core";

export type { ClientProfileData, ProfileActionResult } from "./client-profile-core";

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
    accountOwnerRole:
      user.clientProfile?.accountOwnerRole === "GROOM" ||
      user.clientProfile?.accountOwnerRole === "BRIDE"
        ? user.clientProfile.accountOwnerRole
        : null,
    groomName: user.clientProfile?.groomName ?? null,
    brideName: user.clientProfile?.brideName ?? null,
    coupleDisplayName: user.clientProfile?.coupleDisplayName ?? null,
    eventDate: user.clientProfile?.eventDate
      ? toWibDateString(user.clientProfile.eventDate)
      : null,
    eventLocation: user.clientProfile?.eventLocation ?? null,
    district: user.clientProfile?.district ?? "Kebumen",
    themePreference: user.clientProfile?.themePreference ?? null,
    notes: user.clientProfile?.notes ?? null,
    rt: user.clientProfile?.rt ?? null,
    rw: user.clientProfile?.rw ?? null,
    dusun: user.clientProfile?.dusun ?? null,
    desa: user.clientProfile?.desa ?? null,
    kecamatan: user.clientProfile?.kecamatan ?? null,
    kabupaten: user.clientProfile?.kabupaten ?? "Kebumen",
    postalCode: user.clientProfile?.postalCode ?? null,
    latitude: user.clientProfile?.latitude ?? null,
    longitude: user.clientProfile?.longitude ?? null,
  };
}

/**
 * Server Action: Memperbarui data profil klien (Anti-IDOR: userId diambil dari session server).
 */
const updateClientProfile = createUpdateClientProfileAction({
  getSession,
  userUpdate: (input) =>
    prisma.user.update(input as unknown as Prisma.UserUpdateArgs),
  clientProfileUpsert: (input) =>
    prisma.clientProfile.upsert(
      input as unknown as Prisma.ClientProfileUpsertArgs
    ),
  transaction: (operations) =>
    prisma.$transaction(operations as Prisma.PrismaPromise<unknown>[]),
  getClientProfile,
  revalidatePath,
});

export async function updateClientProfileAction(formData: FormData) {
  return updateClientProfile(formData);
}
