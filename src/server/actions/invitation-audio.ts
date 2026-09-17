"use server";

import { prisma } from "@/lib/prisma";
import { getTrack, getPalette } from "@/lib/sound/audioCatalog";
import { runAction, requireSession, revalidate, type ActionResult } from "./_shared";

export interface SaveInvitationAudioInput {
  invitationId: string;
  backsoundTrackId: string | null;
  sfxPaletteId: string | null;
}

export interface SaveInvitationAudioResult {
  invitationId: string;
  backsoundTrackId: string | null;
  sfxPaletteId: string | null;
}

type Validation = { ok: true } | { ok: false; reason: string };

/** Validasi murni (tanpa I/O) agar dapat diuji tanpa DB/sesi. */
export function validateAudioInput(input: SaveInvitationAudioInput): Validation {
  if (!input.invitationId) return { ok: false, reason: "invitationId wajib diisi" };
  if (input.backsoundTrackId !== null && !getTrack(input.backsoundTrackId)) {
    return { ok: false, reason: `track tidak dikenal: ${input.backsoundTrackId}` };
  }
  if (input.sfxPaletteId !== null && !getPalette(input.sfxPaletteId)) {
    return { ok: false, reason: `palette tidak dikenal: ${input.sfxPaletteId}` };
  }
  return { ok: true };
}

export async function saveInvitationAudioAction(
  input: SaveInvitationAudioInput,
): Promise<ActionResult<SaveInvitationAudioResult>> {
  return runAction(async () => {
    await requireSession();

    const check = validateAudioInput(input);
    if (!check.ok) throw new Error(check.reason);

    const updated = await prisma.digitalInvitation.update({
      where: { id: input.invitationId },
      data: {
        backsoundTrackId: input.backsoundTrackId,
        sfxPaletteId: input.sfxPaletteId,
      },
      select: { id: true, backsoundTrackId: true, sfxPaletteId: true },
    });

    revalidate(["/builder", `/undangan`]);

    return {
      invitationId: updated.id,
      backsoundTrackId: updated.backsoundTrackId,
      sfxPaletteId: updated.sfxPaletteId,
    };
  });
}
