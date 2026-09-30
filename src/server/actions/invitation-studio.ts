"use server";

import { prisma } from '@/lib/prisma';
import { requireAdminCapability } from '@/server/auth/admin-guard';
import { recordAdminAudit } from '@/server/services/admin-audit-service';
import { revalidate } from './_shared';
import { studioActionDependencies } from './invitation-studio-core';
import type { StudioMutationToken } from '@/lib/invitation-studio/contracts';
import type { ActionResult } from './_shared';

function actions() {
  return studioActionDependencies({ actor: () => requireAdminCapability('MANAGE_ADMIN'), db: prisma,
    audit: (entry, tx) => recordAdminAudit({ ...entry, capability: 'MANAGE_ADMIN', targetType: 'InvitationStudioDraft' }, tx) });
}
async function finish<T>(result: Promise<ActionResult<T>>, draftId?: string): Promise<ActionResult<T>> {
  const value = await result;
  if (value.success) revalidate(['/admin/undangan-studio', ...(draftId ? [`/admin/undangan-studio/${draftId}`] : [])]);
  return value;
}
export async function createStudioDraft(input: { name: string }) { return finish(actions().createStudioDraft(input)); }
export async function renameStudioDraft(input: StudioMutationToken & { name: string }) { return finish(actions().renameStudioDraft(input), input?.draftId); }
export async function duplicateStudioDraft(input: StudioMutationToken & { name: string }) { return finish(actions().duplicateStudioDraft(input)); }
export async function archiveStudioDraft(input: StudioMutationToken) { return finish(actions().archiveStudioDraft(input), input?.draftId); }
export async function deleteStudioDraft(input: StudioMutationToken & { confirmation: string }) { return finish(actions().deleteStudioDraft(input), input?.draftId); }
export async function saveStudioDocument(input: StudioMutationToken & { document: unknown }) { return finish(actions().saveStudioDocument(input), input?.draftId); }
export async function submitStudioReview(input: StudioMutationToken) { return finish(actions().submitStudioReview(input), input?.draftId); }
export async function approveStudioDraft(input: StudioMutationToken) { return finish(actions().approveStudioDraft(input), input?.draftId); }
export async function publishStudioVersion(input: StudioMutationToken) { return finish(actions().publishStudioVersion(input), input?.draftId); }
export async function unpublishStudioDraft(input: StudioMutationToken) { return finish(actions().unpublishStudioDraft(input), input?.draftId); }
export async function returnStudioDraft(input: StudioMutationToken) { return finish(actions().returnStudioDraft(input), input?.draftId); }
export async function linkStudioDraftToSlug(input: { slug: string; draftId: string }): Promise<ActionResult<{ slug: string; draftId: string }>> {
  return finish(actions().linkStudioDraftToSlug(input), input?.draftId);
}
