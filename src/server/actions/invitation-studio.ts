"use server";

import { prisma } from "@/lib/prisma";
import { requireAdminCapability } from "@/server/auth/admin-guard";
import { recordAdminAudit } from "@/server/services/admin-audit-service";
import { runAction } from "./_shared";
import { studioActionDependencies } from "./invitation-studio-core";
export { studioActionDependencies } from "./invitation-studio-core";
export type { StudioActionDependencies } from "./invitation-studio-core";

async function actions() {
  return studioActionDependencies({
    actor: () => requireAdminCapability("VIEW_ADMIN"),
    db: prisma as never,
    audit: async (entry, tx) => recordAdminAudit({
      actor: entry.actor,
      capability: "VIEW_ADMIN",
      action: entry.action,
      targetType: "InvitationStudioDraft",
      targetId: entry.targetId,
      metadata: entry.metadata,
    }, tx as never),
  });
}

export async function createStudioDraft(input: { name: string }) { return runAction(async () => (await actions()).createStudioDraft(input)); }
export async function renameStudioDraft(input: { draftId: string; name: string }) { return runAction(async () => (await actions()).renameStudioDraft(input)); }
export async function duplicateStudioDraft(input: { draftId: string; name: string }) { return runAction(async () => (await actions()).duplicateStudioDraft(input)); }
export async function archiveStudioDraft(input: { draftId: string }) { return runAction(async () => (await actions()).archiveStudioDraft(input)); }
export async function deleteStudioDraft(input: { draftId: string; confirmation: string }) { return runAction(async () => (await actions()).deleteStudioDraft(input)); }
export async function saveStudioDocument(input: { draftId: string; expectedVersion: number; document: unknown }) { return runAction(async () => (await actions()).saveStudioDocument(input)); }
export async function submitStudioReview(input: { draftId: string }) { return runAction(async () => (await actions()).submitStudioReview(input)); }
export async function approveStudioDraft(input: { draftId: string }) { return runAction(async () => (await actions()).approveStudioDraft(input)); }
export async function publishStudioVersion(input: { draftId: string }) { return runAction(async () => (await actions()).publishStudioVersion(input)); }
export async function unpublishStudioDraft(input: { draftId: string }) { return runAction(async () => (await actions()).unpublishStudioDraft(input)); }
