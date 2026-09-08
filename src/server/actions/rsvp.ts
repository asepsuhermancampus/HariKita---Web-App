"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function submitRsvpAction(formData: FormData) {
  try {
    const invitationId = formData.get("invitationId") as string;
    const guestName = formData.get("guestName") as string;
    const attendance = formData.get("attendance") as string;
    const paxCount = parseInt((formData.get("paxCount") as string) || "1", 10);
    const sessionCode = (formData.get("sessionCode") as string) || "s1";
    const message = formData.get("message") as string;

    if (!guestName || !message) {
      return { success: false, error: "Nama dan ucapan wajib diisi." };
    }

    const newWish = await prisma.rsvpWish.create({
      data: {
        invitationId,
        guestName,
        attendance: attendance || "hadir",
        paxCount,
        sessionCode,
        message,
      },
    });

    revalidatePath(`/undangan/[slug]`, "page");
    return { success: true, data: newWish };
  } catch (error) {
    console.error("Error submitting RSVP:", error);
    return { success: false, error: "Gagal menyimpan ucapan. Silakan coba lagi." };
  }
}
