import { prisma } from "@/lib/prisma";
import { validateStudioDocument } from "@/lib/invitation-studio/validation";
import { STUDIO_LIMITS } from "@/lib/invitation-studio/validation";
import type { InvitationStudioDocument } from "@/lib/invitation-studio/types";

/** Minimal DB surface used by this module; keeps the module testable. */
type PrismaLike = Pick<typeof prisma, "digitalInvitation" | "invitationStudioPublish">;

/** The invitation row shape returned by the slug lookup. */
export type PublicInvitationRow = NonNullable<Awaited<ReturnType<PrismaLike["digitalInvitation"]["findUnique"]>>>;

export type PublicInvitation = {
  invitation: PublicInvitationRow;
  studioSnapshot: InvitationStudioDocument | null;
};

/**
 * Page-level branch predicate: the studio renderer is used ONLY when a
 * resolution exists AND carries a studio snapshot. Any other case (unknown
 * slug, unlinked row, un-published/invalid snapshot) renders the theme path.
 * Exposed as a pure helper so the branch is unit-testable without a page render.
 */
export function shouldRenderStudio(resolved: PublicInvitation | null): boolean {
  return Boolean(resolved?.studioSnapshot);
}

/**
 * Resolve a public invitation by slug. When the row is linked to a studio draft
 * and that draft has an active published snapshot, the validated snapshot is
 * returned; otherwise `studioSnapshot` is null and callers fall back to the
 * theme renderer. Never throws on snapshot problems — it degrades to null.
 *
 * Pass an already-fetched `invitation` (e.g. by the caller, with its own
 * `include`) to avoid a duplicate row read on the theme path. The snapshot
 * JSON is size-guarded before parse because this runs on an unauthenticated route.
 */
export async function resolvePublicInvitation(
  slug: string,
  deps?: { db?: PrismaLike; invitation?: PublicInvitationRow | null },
): Promise<PublicInvitation | null> {
  const db = deps?.db ?? prisma;
  const invitation =
    deps?.invitation !== undefined
      ? deps.invitation
      : await db.digitalInvitation.findUnique({ where: { slug } });
  if (!invitation) return null;

  const draftId = invitation.studioDraftId;
  if (!draftId) return { invitation, studioSnapshot: null };

  try {
    const publish = await db.invitationStudioPublish.findFirst({
      where: { draftId, unpublishedAt: null },
      orderBy: { publishedAt: "desc" },
    });
    if (!publish?.snapshotJson) return { invitation, studioSnapshot: null };
    // Guard before parse: reject oversized payloads without materializing them.
    if (publish.snapshotJson.length > STUDIO_LIMITS.bytes) {
      console.warn(`[public-invitation] snapshot too large for draft ${draftId}`);
      return { invitation, studioSnapshot: null };
    }

    const parsed = JSON.parse(publish.snapshotJson) as unknown;
    const checked = validateStudioDocument(parsed);
    if (!checked.success) {
      console.warn(`[public-invitation] invalid studio snapshot for draft ${draftId}: ${checked.errors.join("; ")}`);
      return { invitation, studioSnapshot: null };
    }
    return { invitation, studioSnapshot: checked.data };
  } catch (error) {
    console.warn(`[public-invitation] snapshot resolution failed for draft ${draftId}:`, error);
    return { invitation, studioSnapshot: null };
  }
}
