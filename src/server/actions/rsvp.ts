"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function submitRsvpAction(formData: FormData) {
  try {
    const rawInvitationId = (formData.get("invitationId") as string) || "";
    const guestName = (formData.get("guestName") as string) || "";
    const attendance = (formData.get("attendance") as string) || "hadir";
    const paxCount = parseInt((formData.get("paxCount") as string) || "1", 10);
    const sessionCode = (formData.get("sessionCode") as string) || "s1";
    const message = (formData.get("message") as string) || "";

    if (!guestName.trim() || !message.trim()) {
      return { success: false, error: "Nama dan ucapan wajib diisi." };
    }

    // Resolve valid invitation target to guarantee foreign key integrity
    let targetInvitation = null;
    if (rawInvitationId) {
      targetInvitation = await prisma.digitalInvitation.findFirst({
        where: {
          OR: [
            { id: rawInvitationId },
            { slug: rawInvitationId },
          ],
        },
      });
    }

    // If still not resolved, connect to default seeded invitation
    if (!targetInvitation) {
      targetInvitation = await prisma.digitalInvitation.findFirst({
        where: { slug: "bima-citra" },
      });
    }

    // Fallback: if DB has no invitation at all, create a demo record
    if (!targetInvitation) {
      targetInvitation = await prisma.digitalInvitation.create({
        data: {
          slug: "demo-invitation",
          themeId: "autumnelle-animasi",
          title: "Pernikahan Bima & Citra",
          brideName: "Citra Ayu Lestari",
          groomName: "Bima Arya Pratama",
          eventDate: new Date("2026-11-20T09:00:00Z"),
          venueName: "Gedung Pertemuan Setda Kebumen",
          venueAddress: "Jl. Veteran No. 2, Kebumen, Jawa Tengah",
        },
      });
    }

    const newWish = await prisma.rsvpWish.create({
      data: {
        invitationId: targetInvitation.id,
        guestName: guestName.trim(),
        attendance: attendance || "hadir",
        paxCount,
        sessionCode,
        message: message.trim(),
      },
    });

    revalidatePath(`/undangan/[slug]`, "page");
    return {
      success: true,
      data: {
        id: newWish.id,
        guestName: newWish.guestName,
        attendance: newWish.attendance,
        paxCount: newWish.paxCount,
        sessionCode: newWish.sessionCode,
        message: newWish.message,
        createdAt: newWish.createdAt.toISOString(),
      },
    };
  } catch (error) {
    console.error("Error submitting RSVP:", error);
    return { success: false, error: "Gagal menyimpan ucapan. Silakan coba lagi." };
  }
}
