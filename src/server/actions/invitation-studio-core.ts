import type { AdminActor } from "@/server/auth/admin-guard";
import { createBlankStudioDocument } from "@/lib/invitation-studio/sections";
import { validateStudioDocument, validateStudioTransition } from "@/lib/invitation-studio/validation";
import type { InvitationStudioDocument, StudioStatus } from "@/lib/invitation-studio/types";

type StudioDb = {
  invitationStudioDraft: any;
  invitationStudioVersion: any;
  invitationStudioPublish: any;
  $transaction: (fn: (tx: StudioDb) => Promise<unknown>) => Promise<unknown>;
};

export interface StudioActionDependencies {
  actor: () => Promise<AdminActor>;
  db: StudioDb;
  audit: (entry: { actor: AdminActor; action: string; targetId: string; metadata?: Record<string, unknown> }, tx?: StudioDb) => Promise<void>;
  id?: () => string;
  now?: () => Date;
}

const fail = (error: string) => ({ success: false as const, error });
const ok = <T>(data: T) => ({ success: true as const, data });

export function studioActionDependencies(deps: StudioActionDependencies) {
  const id = deps.id ?? (() => crypto.randomUUID());
  const now = deps.now ?? (() => new Date());

  async function ownedDraft(actor: AdminActor, draftId: string, tx: StudioDb = deps.db) {
    const draft = await tx.invitationStudioDraft.findFirst({ where: { id: draftId, ownerId: actor.userId } });
    if (!draft) throw new Error("Draft tidak ditemukan.");
    return draft;
  }

  async function nextVersion(tx: StudioDb, draftId: string, actorId: string, document: InvitationStudioDocument, summary: string) {
    const latest = await tx.invitationStudioVersion.findFirst({ where: { draftId }, orderBy: { versionNumber: "desc" } });
    return tx.invitationStudioVersion.create({ data: { id: id(), draftId, authorId: actorId, versionNumber: (latest?.versionNumber ?? 0) + 1, schemaVersion: document.schemaVersion, documentJson: JSON.stringify(document), changeSummary: summary } });
  }

  return {
    async createStudioDraft(input: { name: string }) {
      const actor = await deps.actor();
      const name = input?.name?.trim();
      if (!name || name.length > 100) return fail("Nama draft wajib diisi, maksimal 100 karakter.");
      return deps.db.$transaction(async (tx) => {
        const draftId = id();
        const doc = createBlankStudioDocument(); doc.metadata.name = name;
        const draft = await tx.invitationStudioDraft.create({ data: { id: draftId, ownerId: actor.userId, name, status: "DRAFT" } });
        await nextVersion(tx, draftId, actor.userId, doc, "Draft dibuat");
        return ok(draft);
      });
    },
    async renameStudioDraft(input: { draftId: string; name: string }) {
      const actor = await deps.actor(); const draft = await ownedDraft(actor, input.draftId);
      const name = input.name?.trim(); if (!name || name.length > 100) return fail("Nama draft tidak valid.");
      return ok(await deps.db.invitationStudioDraft.update({ where: { id: draft.id }, data: { name } }));
    },
    async duplicateStudioDraft(input: { draftId: string; name: string }) {
      const actor = await deps.actor(); const draft = await ownedDraft(actor, input.draftId);
      const source = await deps.db.invitationStudioVersion.findFirst({ where: { draftId: draft.id }, orderBy: { versionNumber: "desc" } });
      if (!source) return fail("Versi draft tidak ditemukan.");
      const name = input.name?.trim(); if (!name || name.length > 100) return fail("Nama draft tidak valid.");
      const document = JSON.parse(source.documentJson) as InvitationStudioDocument; document.metadata.name = name;
      return deps.db.$transaction(async (tx) => {
        const draftId = id(); const copy = await tx.invitationStudioDraft.create({ data: { id: draftId, ownerId: actor.userId, name, status: "DRAFT" } });
        await nextVersion(tx, draftId, actor.userId, document, `Disalin dari ${draft.name}`); return ok(copy);
      });
    },
    async archiveStudioDraft(input: { draftId: string }) {
      const actor = await deps.actor(); const draft = await ownedDraft(actor, input.draftId);
      await deps.audit({ actor, action: "INVITATION_STUDIO_ARCHIVE", targetId: draft.id });
      return ok(await deps.db.invitationStudioDraft.update({ where: { id: draft.id }, data: { status: "ARCHIVED", archivedAt: now() } }));
    },
    async deleteStudioDraft(input: { draftId: string; confirmation: string }) {
      const actor = await deps.actor(); const draft = await ownedDraft(actor, input.draftId);
      if (input.confirmation !== draft.name) return fail("Konfirmasi nama draft tidak cocok.");
      await deps.audit({ actor, action: "INVITATION_STUDIO_DELETE", targetId: draft.id });
      await deps.db.invitationStudioDraft.delete({ where: { id: draft.id } }); return ok({ id: draft.id });
    },
    async saveStudioDocument(input: { draftId: string; expectedVersion: number; document: unknown }) {
      const actor = await deps.actor(); const draft = await ownedDraft(actor, input.draftId);
      if (draft.status !== "DRAFT") return fail("Hanya draft yang dapat diedit.");
      const checked = validateStudioDocument(input.document); if (!checked.success) return fail(checked.errors.join("; "));
      return deps.db.$transaction(async (tx) => {
        const latest = await tx.invitationStudioVersion.findFirst({ where: { draftId: draft.id }, orderBy: { versionNumber: "desc" } });
        if (!latest || latest.versionNumber !== input.expectedVersion) return fail("Konflik versi. Muat ulang draft sebelum menyimpan.");
        if (latest.documentJson === JSON.stringify(checked.data)) return ok({ versionNumber: latest.versionNumber, unchanged: true });
        const version = await nextVersion(tx, draft.id, actor.userId, checked.data, "Autosave");
        await tx.invitationStudioDraft.update({ where: { id: draft.id }, data: { name: checked.data.metadata.name, updatedAt: now() } });
        return ok({ versionNumber: version.versionNumber, unchanged: false });
      });
    },
    async submitStudioReview(input: { draftId: string }) { return transition(input.draftId, "IN_REVIEW", "INVITATION_STUDIO_REVIEW"); },
    async approveStudioDraft(input: { draftId: string }) { return transition(input.draftId, "APPROVED", "INVITATION_STUDIO_APPROVE"); },
    async publishStudioVersion(input: { draftId: string }) {
      const actor = await deps.actor(); const draft = await ownedDraft(actor, input.draftId);
      if (draft.status !== "APPROVED") return fail("Hanya draft Approved yang dapat dipublikasikan.");
      const version = await deps.db.invitationStudioVersion.findFirst({ where: { draftId: draft.id }, orderBy: { versionNumber: "desc" } });
      if (!version) return fail("Versi draft tidak ditemukan.");
      const checked = validateStudioDocument(JSON.parse(version.documentJson)); if (!checked.success) return fail(checked.errors.join("; "));
      return deps.db.$transaction(async (tx) => {
        const publish = await tx.invitationStudioPublish.create({ data: { id: id(), draftId: draft.id, sourceVersionId: version.id, publisherId: actor.userId, schemaVersion: version.schemaVersion, snapshotJson: version.documentJson } });
        await tx.invitationStudioDraft.update({ where: { id: draft.id }, data: { status: "PUBLISHED" } });
        await deps.audit({ actor, action: "INVITATION_STUDIO_PUBLISH", targetId: draft.id, metadata: { publishId: publish.id, versionNumber: version.versionNumber } }, tx);
        return ok(publish);
      });
    },
    async unpublishStudioDraft(input: { draftId: string }) {
      const actor = await deps.actor(); const draft = await ownedDraft(actor, input.draftId);
      if (draft.status !== "PUBLISHED") return fail("Draft tidak sedang Published.");
      return deps.db.$transaction(async (tx) => {
        await tx.invitationStudioPublish.updateMany({ where: { draftId: draft.id, unpublishedAt: null }, data: { unpublishedAt: now() } });
        const updated = await tx.invitationStudioDraft.update({ where: { id: draft.id }, data: { status: "ARCHIVED", archivedAt: now() } });
        await deps.audit({ actor, action: "INVITATION_STUDIO_UNPUBLISH", targetId: draft.id }, tx); return ok(updated);
      });
    },
  };

  async function transition(draftId: string, target: "IN_REVIEW" | "APPROVED", action: string) {
    const actor = await deps.actor(); const draft = await ownedDraft(actor, draftId);
    const version = await deps.db.invitationStudioVersion.findFirst({ where: { draftId }, orderBy: { versionNumber: "desc" } });
    if (!version) return fail("Versi draft tidak ditemukan.");
    const checked = validateStudioTransition(draft.status.toLowerCase() as StudioStatus, target.toLowerCase() as StudioStatus, actor.subRole, JSON.parse(version.documentJson));
    if (!checked.success) return fail(checked.errors.join("; "));
    return deps.db.$transaction(async (tx) => {
      const updated = await tx.invitationStudioDraft.update({ where: { id: draft.id }, data: { status: target } });
      await deps.audit({ actor, action, targetId: draft.id }, tx); return ok(updated);
    });
  }
}
