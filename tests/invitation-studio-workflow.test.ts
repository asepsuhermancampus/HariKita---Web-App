import { test } from 'node:test';
import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import { readFileSync } from 'node:fs';
import { createTestDb } from './helpers/test-db';
import { studioActionDependencies } from '../src/server/actions/invitation-studio-core';
import { createBlankStudioDocument } from '../src/lib/invitation-studio/sections';

test('studio migration creates its relations and unique indexes in a disposable database', async () => {
  const ctx = await createTestDb();
  try {
    // TEMP tables shadow copied tables; the source database is never changed.
    const sql = readFileSync('prisma/migrations/20260926120000_invitation_studio_persistence/migration.sql', 'utf8');
    assert.ok(!/\bDATETIME\b/.test(sql), 'PostgreSQL migration directory requires TIMESTAMP');
    for (const statement of sql.replaceAll('CREATE TABLE', 'CREATE TEMP TABLE').split(';').filter(s => s.trim())) await ctx.prisma.$executeRawUnsafe(statement);
    const tables = await ctx.prisma.$queryRawUnsafe<Array<{ name: string }>>("SELECT name FROM sqlite_temp_master WHERE type = 'table' AND name LIKE 'InvitationStudio%'");
    assert.equal(tables.length, 3);
  } finally { await ctx.cleanup(); }
});

test('studio real SQLite workflow: isolation, version conflicts, immutable snapshots and atomic audit', async () => {
  const ctx = await createTestDb();
  const db = ctx.prisma;
  try {
    // Push only to the disposable copy, never the development database.
    const url = (db as any)._engineConfig.overrideDatasources.db.url;
    execFileSync(process.execPath, ['node_modules/prisma/build/index.js', 'db', 'push', '--schema', 'prisma/schema.sqlite.prisma', '--skip-generate'], { env: { ...process.env, DATABASE_URL: url }, stdio: 'pipe' });
    const u = await db.user.create({ data: { name: 'Studio test', phone: `studio-${crypto.randomUUID()}`, role: 'ADMIN', adminRole: 'SUPER_ADMIN' } });
    let auditFails = false;
    const actions = studioActionDependencies({ db, actor: async () => ({ userId: u.id, name: u.name, subRole: 'SUPER_ADMIN' }),
      audit: async (entry, tx) => {
        await tx!.adminAuditLog.create({ data: { actorId: u.id, actorName: u.name, actorRole: 'SUPER_ADMIN', capability: 'MANAGE_ADMIN', action: entry.action, targetType: 'InvitationStudioDraft', targetId: entry.targetId } });
        if (auditFails) throw new Error('audit unavailable');
      } });
    const unwrap = (r: any): any => { assert.equal(r.success, true, JSON.stringify(r)); return r.data; };
    const created = unwrap(await actions.createStudioDraft({ name: 'First' }));
    const outsider = await db.user.create({ data: { name: 'Other admin', phone: `studio-${crypto.randomUUID()}`, role: 'ADMIN', adminRole: 'SUPER_ADMIN' } });
    const otherActions = studioActionDependencies({ db, actor: async () => ({ userId: outsider.id, name: outsider.name, subRole: 'SUPER_ADMIN' }), audit: async () => { throw new Error('Must not audit unauthorized mutation'); } });
    const denied = await otherActions.saveStudioDocument({ draftId: created.id, expectedVersion: 1, expectedStatus: 'DRAFT', document: created.document });
    assert.equal(denied.success, false);
    if (!denied.success) assert.equal(denied.errorCode, 'STUDIO_NOT_FOUND');
    assert.equal((await actions.createStudioDraft({ name: '' })).success, false);
    const token = (state: any) => ({ draftId: state.id, expectedVersion: state.versionNumber, expectedStatus: state.status });
    let state = unwrap(await actions.renameStudioDraft({ ...token(created), name: 'Renamed' } as any));
    assert.equal(JSON.parse((await db.invitationStudioVersion.findFirstOrThrow({ where: { draftId: state.id }, orderBy: { versionNumber: 'desc' } })).documentJson).metadata.name, 'Renamed');
    const doc = createBlankStudioDocument(); doc.metadata.name = 'Renamed';
    const unchanged = unwrap(await actions.saveStudioDocument({ ...token(state), document: doc }));
    assert.equal(unchanged.versionNumber, state.versionNumber);
    state = unwrap(await actions.submitStudioReview(token(state) as any));
    assert.equal((await actions.saveStudioDocument({ ...token(state), document: doc })).success, false);
    state = unwrap(await (actions as any).returnStudioDraft(token(state)));
    state = unwrap(await actions.submitStudioReview(token(state) as any));
    state = unwrap(await actions.approveStudioDraft(token(state) as any));
    state = unwrap(await actions.publishStudioVersion(token(state) as any));
    const snapshot = await db.invitationStudioPublish.findFirstOrThrow({ where: { draftId: state.id } });
    doc.metadata.name = 'Edited published';
    state = unwrap(await actions.saveStudioDocument({ ...token(state), document: doc }));
    assert.equal(state.status, 'DRAFT');
    assert.equal((await db.invitationStudioPublish.findUniqueOrThrow({ where: { id: snapshot.id } })).snapshotJson, snapshot.snapshotJson);
    assert.equal((await actions.saveStudioDocument({ ...token(created), document: doc })).success, false);
    auditFails = true;
    const count = await db.adminAuditLog.count({ where: { targetId: state.id } });
    assert.equal((await actions.archiveStudioDraft(token(state) as any)).success, false);
    assert.equal((await db.invitationStudioDraft.findUniqueOrThrow({ where: { id: state.id } })).status, 'DRAFT');
    assert.equal(await db.adminAuditLog.count({ where: { targetId: state.id } }), count);
    auditFails = false;
    state = unwrap(await actions.archiveStudioDraft(token(state) as any));
    assert.equal(await db.invitationStudioPublish.count({ where: { draftId: state.id, unpublishedAt: null } }), 0);
    const copy = unwrap(await actions.duplicateStudioDraft({ ...token(state), name: 'Copy' } as any));
    assert.equal(copy.status, 'DRAFT');
    assert.equal((await actions.deleteStudioDraft({ ...token(copy), confirmation: 'wrong' } as any)).success, false);
    unwrap(await actions.deleteStudioDraft({ ...token(copy), confirmation: 'Copy' } as any));
    assert.equal(await db.invitationStudioDraft.count({ where: { id: copy.id } }), 0);
    state = unwrap(await (actions as any).returnStudioDraft(token(state)));
    const d1 = structuredClone(doc); d1.metadata.name = 'Concurrent one';
    const d2 = structuredClone(doc); d2.metadata.name = 'Concurrent two';
    const results = await Promise.all([actions.saveStudioDocument({ ...token(state), document: d1 }), actions.saveStudioDocument({ ...token(state), document: d2 })]);
    assert.equal(results.filter((r: any) => r.success).length, 1);
    assert.equal(results.filter((r: any) => !r.success).length, 1);
  } finally { await ctx.cleanup(); }
});
