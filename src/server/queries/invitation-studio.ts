import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/session";
import { loadAdminActor } from "@/server/auth/admin-guard";

async function superAdminId(): Promise<string | null> {
  const session = await getSession();
  if (!session) return null;
  const actor = await loadAdminActor(session.userId);
  return actor?.subRole === "SUPER_ADMIN" ? actor.userId : null;
}

export async function listStudioDrafts() {
  const ownerId = await superAdminId();
  if (!ownerId) return [];
  return prisma.invitationStudioDraft.findMany({
    where: { ownerId },
    orderBy: { updatedAt: "desc" },
    include: { versions: { orderBy: { versionNumber: "desc" }, take: 1 } },
  });
}

export async function getStudioDraft(draftId: string) {
  const ownerId = await superAdminId();
  if (!ownerId) return null;
  return prisma.invitationStudioDraft.findFirst({
    where: { id: draftId, ownerId },
    include: { versions: { orderBy: { versionNumber: "desc" } }, publishes: true },
  });
}

export async function getStudioVersion(draftId: string, versionNumber: number) {
  const ownerId = await superAdminId();
  if (!ownerId) return null;
  return prisma.invitationStudioVersion.findFirst({
    where: { draftId, versionNumber, draft: { ownerId } },
  });
}

export async function getPublishedSnapshot(draftId: string) {
  const ownerId = await superAdminId();
  if (!ownerId) return null;
  return prisma.invitationStudioPublish.findFirst({
    where: { draftId, draft: { ownerId }, unpublishedAt: null },
    orderBy: { publishedAt: "desc" },
  });
}
