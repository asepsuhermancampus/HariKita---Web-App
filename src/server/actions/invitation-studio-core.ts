import type { Prisma, PrismaClient, InvitationStudioDraft, InvitationStudioVersion } from '@prisma/client';
import type { AdminActor } from '@/server/auth/admin-guard';
import { createBlankStudioDocument } from '@/lib/invitation-studio/sections';
import { validateStudioDocument, validateStudioTransition } from '@/lib/invitation-studio/validation';
import type { InvitationStudioDocument, StudioStatus } from '@/lib/invitation-studio/types';
import type { StudioMutationToken, StudioState, StudioDraftStatus } from '@/lib/invitation-studio/contracts';
import type { ActionResult } from './_shared';
import { DomainError, toMappedError } from '@/server/services/errors';

export interface StudioActionDependencies {
  actor: () => Promise<AdminActor>;
  db: PrismaClient;
  audit: (entry: { actor: AdminActor; action: string; targetId: string; metadata?: Record<string, unknown> }, tx: Prisma.TransactionClient) => Promise<void>;
  id?: () => string;
  now?: () => Date;
}

const invalid = (message: string): never => { throw new DomainError('INVALID_STUDIO_INPUT', message); };
function nameOf(value: unknown): string {
  if (typeof value !== 'string' || !value.trim() || value.trim().length > 100) return invalid('Nama wajib diisi, maksimal 100 karakter.');
  return value.trim();
}
function checkedDocument(value: unknown): InvitationStudioDocument {
  const result = validateStudioDocument(value);
  if (!result.success) return invalid(result.errors.join('; '));
  result.data.metadata.name = nameOf(result.data.metadata.name);
  return result.data;
}
function state(draft: InvitationStudioDraft, version: InvitationStudioVersion): StudioState {
  return { id: draft.id, name: draft.name, status: draft.status as StudioDraftStatus, versionNumber: version.versionNumber,
    document: checkedDocument(JSON.parse(version.documentJson)), updatedAt: draft.updatedAt.toISOString() };
}
/** Stable JSON comparison ignores object key order, preserves authored array order. */
function canonical(value: unknown): string {
  if (Array.isArray(value)) return `[${value.map(canonical).join(',')}]`;
  if (value && typeof value === 'object') return `{${Object.entries(value).sort(([a], [b]) => a.localeCompare(b)).map(([k, v]) => `${JSON.stringify(k)}:${canonical(v)}`).join(',')}}`;
  return JSON.stringify(value);
}

/** Attach a studio draft to an existing public invitation slug (logical reference). */
export async function linkStudioDraftToInvitation(
  input: { slug: string; draftId: string },
  deps: { db: PrismaClient },
): Promise<void> {
  const updated = await deps.db.digitalInvitation.updateMany({
    where: { slug: input.slug },
    data: { studioDraftId: input.draftId },
  });
  if (updated.count === 0) throw new DomainError('STUDIO_NOT_FOUND', `Invitation slug tidak ditemukan: ${input.slug}`);
}

export function studioActionDependencies(deps: StudioActionDependencies) {
  const id = deps.id ?? (() => crypto.randomUUID());
  const now = deps.now ?? (() => new Date());

  async function execute<T>(work: (actor: AdminActor, tx: Prisma.TransactionClient) => Promise<T>): Promise<ActionResult<T>> {
    try {
      const actor = await deps.actor();
      if (!actor || actor.subRole !== 'SUPER_ADMIN') throw new DomainError('UNAUTHORIZED_ADMIN_CAPABILITY', 'SuperAdmin diperlukan.');
      for (let attempt = 0; ; attempt++) {
        try {
          const data = await deps.db.$transaction(tx => work(actor, tx), { isolationLevel: 'Serializable', maxWait: 5000, timeout: 10000 });
          return { success: true, data };
        } catch (error) {
          const code = (error as { code?: string })?.code;
          if (attempt < 2 && (code === 'P2034' || /SQLITE_BUSY|database is locked/i.test(String(error)))) {
            await new Promise(resolve => setTimeout(resolve, 20 * (attempt + 1))); continue;
          }
          if (code === 'P2002') throw new DomainError('STUDIO_NAME_TAKEN', 'Nama sudah dipakai atau versi telah berubah. Muat ulang draft.');
          throw error;
        }
      }
    } catch (error) {
      if (error instanceof DomainError) return toMappedError(error);
      return { success: false, errorCode: 'UNEXPECTED_SYSTEM_ERROR', message: 'Operasi gagal. Perubahan tidak disimpan; silakan coba lagi.' };
    }
  }

  async function current(actor: AdminActor, tx: Prisma.TransactionClient, input: StudioMutationToken) {
    if (!input || typeof input.draftId !== 'string' || !input.draftId || input.draftId.length > 100 || !Number.isSafeInteger(input.expectedVersion) || input.expectedVersion < 1 || !['DRAFT', 'IN_REVIEW', 'APPROVED', 'PUBLISHED', 'ARCHIVED'].includes(input.expectedStatus)) invalid('Token versi/status tidak valid.');
    // First statement takes the per-draft write lock on both SQLite and PostgreSQL.
    // A no-op assignment avoids changing the saved timestamp on reads/no-op saves.
    const locked = await tx.invitationStudioDraft.updateMany({ where: { id: input.draftId, ownerId: actor.userId }, data: { id: input.draftId } });
    if (!locked.count) throw new DomainError('STUDIO_NOT_FOUND', 'Draft tidak ditemukan.');
    const draft = await tx.invitationStudioDraft.findUniqueOrThrow({ where: { id: input.draftId } });
    const version = await tx.invitationStudioVersion.findFirst({ where: { draftId: draft.id }, orderBy: { versionNumber: 'desc' } });
    if (!version) throw new DomainError('STUDIO_NOT_FOUND', 'Versi draft tidak ditemukan.');
    if (version.versionNumber !== input.expectedVersion || draft.status !== input.expectedStatus) throw new DomainError('STUDIO_CONFLICT', 'Draft berubah. Muat ulang sebelum melanjutkan; salin perubahan lokal terlebih dahulu.');
    return { draft, version };
  }
  async function append(tx: Prisma.TransactionClient, draftId: string, actor: AdminActor, document: InvitationStudioDocument, versionNumber: number, changeSummary: string) {
    return tx.invitationStudioVersion.create({ data: { id: id(), draftId, authorId: actor.userId, versionNumber, schemaVersion: 1, documentJson: JSON.stringify(document), changeSummary } });
  }
  function audit(actor: AdminActor, tx: Prisma.TransactionClient, action: string, targetId: string) {
    return deps.audit({ actor, action: `INVITATION_STUDIO_${action}`, targetId }, tx);
  }
  function transition(from: string, to: StudioDraftStatus, document: InvitationStudioDocument) {
    const result = validateStudioTransition(from.toLowerCase() as StudioStatus, to.toLowerCase() as StudioStatus, 'SUPER_ADMIN', document);
    if (!result.success) throw new DomainError('INVALID_STUDIO_TRANSITION', 'Transisi status tidak diizinkan.');
  }
  async function save(actor: AdminActor, tx: Prisma.TransactionClient, input: StudioMutationToken, value: unknown) {
    const { draft, version } = await current(actor, tx, input);
    if (!['DRAFT', 'APPROVED', 'PUBLISHED'].includes(draft.status)) throw new DomainError('INVALID_STUDIO_TRANSITION', 'Kembalikan ke Draft sebelum mengedit.');
    const document = checkedDocument(value);
    if (canonical(document) === canonical(JSON.parse(version.documentJson))) return state(draft, version);
    const next = await append(tx, draft.id, actor, document, version.versionNumber + 1, 'Simpan perubahan');
    const updated = await tx.invitationStudioDraft.update({ where: { id: draft.id }, data: { name: document.metadata.name, status: 'DRAFT', archivedAt: null, updatedAt: now() } });
    if (draft.status !== 'DRAFT') await audit(actor, tx, 'EDIT_WORKING_VERSION', draft.id);
    return state(updated, next);
  }
  function move(input: StudioMutationToken, target: StudioDraftStatus, action: string) {
    return execute(async (actor, tx) => {
      const { draft, version } = await current(actor, tx, input);
      const document = checkedDocument(JSON.parse(version.documentJson));
      transition(draft.status, target, document);
      let next = version;
      if (target === 'DRAFT' && ['APPROVED', 'PUBLISHED', 'ARCHIVED'].includes(draft.status)) next = await append(tx, draft.id, actor, document, version.versionNumber + 1, 'Versi kerja baru');
      if (target === 'ARCHIVED') await tx.invitationStudioPublish.updateMany({ where: { draftId: draft.id, unpublishedAt: null }, data: { unpublishedAt: now() } });
      if (target === 'PUBLISHED') {
        await tx.invitationStudioPublish.updateMany({ where: { draftId: draft.id, unpublishedAt: null }, data: { unpublishedAt: now() } });
        await tx.invitationStudioPublish.create({ data: { id: id(), draftId: draft.id, sourceVersionId: version.id, publisherId: actor.userId, schemaVersion: 1, snapshotJson: version.documentJson } });
      }
      const updated = await tx.invitationStudioDraft.update({ where: { id: draft.id }, data: { status: target, archivedAt: target === 'ARCHIVED' ? now() : null, updatedAt: now() } });
      await audit(actor, tx, action, draft.id);
      return state(updated, next);
    });
  }
  return {
    createStudioDraft(input: { name: string }) {
      return execute(async (actor, tx) => {
        const name = nameOf(input?.name); const doc = createBlankStudioDocument(); doc.metadata.name = name;
        const draft = await tx.invitationStudioDraft.create({ data: { id: id(), ownerId: actor.userId, name } });
        const version = await append(tx, draft.id, actor, doc, 1, 'Draft dibuat');
        return state(draft, version);
      });
    },
    saveStudioDocument(input: StudioMutationToken & { document: unknown }) { return execute((actor, tx) => save(actor, tx, input, input?.document)); },
    renameStudioDraft(input: StudioMutationToken & { name: string }) {
      return execute(async (actor, tx) => {
        const { version } = await current(actor, tx, input);
        const doc = checkedDocument(JSON.parse(version.documentJson)); doc.metadata.name = nameOf(input.name);
        return save(actor, tx, input, doc);
      });
    },
    duplicateStudioDraft(input: StudioMutationToken & { name: string }) {
      return execute(async (actor, tx) => {
        const { version } = await current(actor, tx, input);
        const doc = checkedDocument(JSON.parse(version.documentJson)); doc.metadata.name = nameOf(input.name);
        const draft = await tx.invitationStudioDraft.create({ data: { id: id(), ownerId: actor.userId, name: doc.metadata.name } });
        return state(draft, await append(tx, draft.id, actor, doc, 1, 'Salinan draft'));
      });
    },
    deleteStudioDraft(input: StudioMutationToken & { confirmation: string }) {
      return execute(async (actor, tx) => {
        const { draft } = await current(actor, tx, input);
        if (input.confirmation !== draft.name) invalid('Konfirmasi nama draft tidak cocok.');
        if (await tx.invitationStudioPublish.count({ where: { draftId: draft.id } })) throw new DomainError('INVALID_STUDIO_TRANSITION', 'Draft dengan riwayat publikasi hanya dapat diarsipkan untuk menjaga snapshot.');
        await tx.invitationStudioDraft.delete({ where: { id: draft.id } });
        await audit(actor, tx, 'DELETE', draft.id);
        return { id: draft.id };
      });
    },
    submitStudioReview: (input: StudioMutationToken) => move(input, 'IN_REVIEW', 'REVIEW'),
    approveStudioDraft: (input: StudioMutationToken) => move(input, 'APPROVED', 'APPROVE'),
    publishStudioVersion: (input: StudioMutationToken) => move(input, 'PUBLISHED', 'PUBLISH'),
    archiveStudioDraft: (input: StudioMutationToken) => move(input, 'ARCHIVED', 'ARCHIVE'),
    returnStudioDraft: (input: StudioMutationToken) => move(input, 'DRAFT', 'RETURN_DRAFT'),
    unpublishStudioDraft: (input: StudioMutationToken) => execute(async (actor, tx) => {
      const { draft, version } = await current(actor, tx, input);
      if (!(await tx.invitationStudioPublish.count({ where: { draftId: draft.id, unpublishedAt: null } }))) throw new DomainError('INVALID_STUDIO_TRANSITION', 'Tidak ada snapshot aktif.');
      await tx.invitationStudioPublish.updateMany({ where: { draftId: draft.id, unpublishedAt: null }, data: { unpublishedAt: now() } });
      const updated = await tx.invitationStudioDraft.update({ where: { id: draft.id }, data: { status: 'ARCHIVED', archivedAt: now(), updatedAt: now() } });
      await audit(actor, tx, 'UNPUBLISH', draft.id);
      return state(updated, version);
    }),
  };
}
