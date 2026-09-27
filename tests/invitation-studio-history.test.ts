import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createBlankStudioDocument } from '../src/lib/invitation-studio/sections';
import { StudioHistory } from '../src/lib/invitation-studio/history';
import { StudioAutosaveCoordinator } from '../src/lib/invitation-studio/autosave';

test('history is bounded, undo/redo works, and a new edit invalidates redo', () => {
  const one = createBlankStudioDocument(), two = structuredClone(one); two.metadata.name = 'Two'; const three = structuredClone(two); three.metadata.name = 'Three';
  const h = new StudioHistory(one, 2); h.push(two); h.push(three); h.push(one);
  assert.equal(h.undo()?.metadata.name, 'Three'); assert.equal(h.undo()?.metadata.name, 'Two'); assert.equal(h.undo(), null);
  assert.equal(h.redo()?.metadata.name, 'Three'); h.push(two); assert.equal(h.redo(), null); assert.equal(h.canUndo, true);
});

test('autosave debounce, retry and stale responses preserve newest local edit', async () => {
  const one = createBlankStudioDocument(), two = structuredClone(one); two.metadata.name = 'Two'; const three = structuredClone(two); three.metadata.name = 'Three';
  let calls = 0, resolveFirst!: (v: any) => void;
  const coordinator = new StudioAutosaveCoordinator<any, any>({ debounceMs: 5, save: async (_d, _token) => { calls++; if (calls === 1) return new Promise(resolve => { resolveFirst = resolve; }); return { success: true, data: { acknowledged: 'new' } }; } });
  coordinator.edit(two, { version: 1 }); await new Promise(r => setTimeout(r, 10));
  coordinator.edit(three, { version: 1 }); resolveFirst({ success: true, data: { acknowledged: 'old' } }); await new Promise(r => setTimeout(r, 15));
  assert.equal(calls, 2); assert.equal(coordinator.status, 'saved'); assert.equal(coordinator.document.metadata.name, 'Three');
  coordinator.fail(new Error('temporary')); assert.equal(coordinator.status, 'error'); assert.equal(coordinator.retry(), true); coordinator.dispose();
});

test('autosave reports saving and saved status through its lifecycle callback', async () => {
  const statuses: string[] = [];
  const coordinator = new StudioAutosaveCoordinator<any, any>({
    debounceMs: 1,
    onStatus: status => statuses.push(status),
    save: async () => ({ success: true, data: { acknowledged: 'ok' } }),
  });
  coordinator.edit(createBlankStudioDocument(), { version: 1 });
  await new Promise(r => setTimeout(r, 10));
  assert.deepEqual(statuses, ['saving', 'saved']);
  coordinator.dispose();
});
