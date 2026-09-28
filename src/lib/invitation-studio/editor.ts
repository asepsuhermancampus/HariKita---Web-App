import type { InvitationStudioDocument, StudioNode, StudioNodeBase, StudioSectionId, StudioTransform } from './types';
import { canReorderSection } from './sections';
import { validateStudioDocument } from './validation';
import type { StudioAsset } from './assets';

export type StudioDevice = 'mobile' | 'desktop';
export type StudioEdit =
  | { type: 'section-enabled'; section: StudioSectionId; enabled: boolean }
  | { type: 'section-move'; section: StudioSectionId; offset: -1 | 1 }
  | { type: 'section-overflow'; section: StudioSectionId; overflow: 'contained' | 'visible' }
  | { type: 'add'; section: StudioSectionId; node: StudioNode }
  | { type: 'duplicate'; section: StudioSectionId; id: string; newId: string }
  | { type: 'duplicate-many'; section: StudioSectionId; ids: string[]; newIds: string[] }
  | { type: 'copy-to-section'; fromSection: StudioSectionId; toSection: StudioSectionId; ids: string[]; newIds: string[] }
  | { type: 'group-nodes'; section: StudioSectionId; ids: string[]; groupId: string; groupName: string }
  | { type: 'ungroup-nodes'; section: StudioSectionId; groupId: string }
  | { type: 'rename-group'; section: StudioSectionId; groupId: string; groupName: string }
  | { type: 'duplicate-group'; section: StudioSectionId; groupId: string; newGroupId: string; newGroupIdsMap: Record<string, string> }
  | { type: 'group-toggle'; section: StudioSectionId; groupId: string; field: 'locked' | 'visible'; value: boolean }
  | { type: 'delete-group'; section: StudioSectionId; groupId: string }
  | { type: 'delete' | 'inherit'; section: StudioSectionId; id: string }
  | { type: 'delete-many'; section: StudioSectionId; ids: string[] }
  | { type: 'node-move'; section: StudioSectionId; id: string; offset: -1 | 1 }
  | { type: 'node'; section: StudioSectionId; id: string; patch: Partial<Pick<StudioNodeBase, 'name' | 'groupId' | 'groupName' | 'locked' | 'visible' | 'layer' | 'appearance' | 'animation' | 'accessibility'>> }
  | { type: 'config'; section: StudioSectionId; id: string; config: StudioNode['config'] }
  | { type: 'transform'; section: StudioSectionId; id: string; device: StudioDevice; patch: Partial<StudioTransform> }
  | { type: 'transform-many'; section: StudioSectionId; device: StudioDevice; patches: Record<string, Partial<StudioTransform>> };

export const resolveTransform = (node: StudioNode, device: StudioDevice) => device === 'desktop' ? node.desktopTransform ?? node.transform : node.transform;
export const selectedStudioNode = (d: InvitationStudioDocument, section: StudioSectionId, id: string | null) => d.sections.find(s => s.id === section)?.nodes.find(n => n.id === id);
export function clampTransform(t: StudioTransform): StudioTransform {
  const clamp = (v: number, min: number, max: number) => Math.min(max, Math.max(min, v));
  // Allow x/y to bleed across section boundaries (-100% to 150%)
  return {
    ...t,
    x: clamp(t.x, -50, 100),
    y: clamp(t.y, -100, 150),
    width: clamp(t.width, 0.1, 100),
    height: clamp(t.height, 0.1, 100),
    rotation: clamp(t.rotation, -360, 360),
  };
}
export function createStudioNode(kind: 'text' | 'component' | StudioAsset, id: string, section: StudioSectionId = 'cover'): StudioNode {
  // Friendly name: prefer asset.label, else strip a-/b- source prefix from id
  const assetName = typeof kind === 'string'
    ? kind
    : (kind.label ?? kind.id.replace(/^[ab]-/, '').replace(/-/g, ' '));
  const base: StudioNodeBase = {
    id,
    name: assetName,
    layer: kind === 'component' ? 'component' : 'front-decoration',
    visible: true,
    locked: false,
    transform: {
      x: 10,
      y: 10,
      width: kind === 'component' ? 100 : kind === 'text' ? 60 : 20,
      height: kind === 'component' ? 75 : kind === 'text' ? 12 : 20,
      rotation: 0,
      flipX: false,
      flipY: false,
    },
    appearance: { opacity: 100, overflow: 'visible' },
    animation: { preset: 'none', durationMs: 600, delayMs: 0 },
    accessibility: { label: assetName },
  };
  if (kind === 'text') return { ...base, kind, config: { text: 'Hari Bahagia', color: '#4A2E35', fontSize: 28, align: 'center' } };
  if (kind === 'component') return { ...base, kind, config: { component: section, variant: 'default', title: '' } };
  return { ...base, kind: kind.kind, config: { src: kind.path, fit: 'contain' } };
}
export function editStudio(document: InvitationStudioDocument, edit: StudioEdit): { document: InvitationStudioDocument; selection: string | null } {
  const d = structuredClone(document);
  const section = d.sections.find(s => s.id === (edit.type === 'copy-to-section' ? edit.fromSection : edit.section))!;
  let selection: string | null = 'id' in edit ? edit.id : null;
  if (edit.type === 'section-enabled' && canReorderSection(section.id)) section.enabled = edit.enabled;
  if (edit.type === 'section-overflow') section.overflowPolicy = edit.overflow;
  if (edit.type === 'section-move') {
    const i = d.sectionOrder.indexOf(section.id), j = i + edit.offset;
    if (i > 0 && i < 15 && j > 0 && j < 15) [d.sectionOrder[i], d.sectionOrder[j]] = [d.sectionOrder[j], d.sectionOrder[i]];
  }
  if (edit.type === 'add') { section.nodes.push(edit.node); selection = edit.node.id; }
  if (edit.type === 'duplicate-many') {
    const toDuplicate = section.nodes.filter(n => edit.ids.includes(n.id));
    const newNodes: StudioNode[] = [];
    toDuplicate.forEach((node, idx) => {
      const cloned = structuredClone(node);
      const newId = edit.newIds[idx] || crypto.randomUUID();
      cloned.id = newId;
      cloned.name = `${node.name ?? node.kind} salinan`.slice(0, 100);
      cloned.transform = clampTransform({
        ...cloned.transform,
        x: cloned.transform.x + 3,
        y: cloned.transform.y + 3,
      });
      if (cloned.desktopTransform) {
        cloned.desktopTransform = clampTransform({
          ...cloned.desktopTransform,
          x: cloned.desktopTransform.x + 3,
          y: cloned.desktopTransform.y + 3,
        });
      }
      newNodes.push(cloned);
    });
    section.nodes.push(...newNodes);
    selection = newNodes[newNodes.length - 1]?.id ?? null;
  }
  if (edit.type === 'copy-to-section') {
    const fromSec = d.sections.find(s => s.id === edit.fromSection);
    const toSec = d.sections.find(s => s.id === edit.toSection);
    if (fromSec && toSec) {
      const toCopy = fromSec.nodes.filter(n => edit.ids.includes(n.id));
      const newNodes: StudioNode[] = [];
      toCopy.forEach((node, idx) => {
        const cloned = structuredClone(node);
        const newId = edit.newIds[idx] || crypto.randomUUID();
        cloned.id = newId;
        newNodes.push(cloned);
      });
      toSec.nodes.push(...newNodes);
      selection = newNodes[newNodes.length - 1]?.id ?? null;
    }
  }
  if (edit.type === 'delete-many') {
    section.nodes = section.nodes.filter(n => !edit.ids.includes(n.id));
    selection = null;
  }
  if (edit.type === 'group-nodes') {
    section.nodes.forEach(node => {
      if (edit.ids.includes(node.id)) {
        node.groupId = edit.groupId;
        node.groupName = edit.groupName;
      }
    });
  }
  if (edit.type === 'ungroup-nodes') {
    section.nodes.forEach(node => {
      if (node.groupId === edit.groupId) {
        delete node.groupId;
        delete node.groupName;
      }
    });
  }
  if (edit.type === 'rename-group') {
    section.nodes.forEach(node => {
      if (node.groupId === edit.groupId) {
        node.groupName = edit.groupName;
      }
    });
  }
  if (edit.type === 'group-toggle') {
    section.nodes.forEach(node => {
      if (node.groupId === edit.groupId) {
        node[edit.field] = edit.value;
      }
    });
  }
  if (edit.type === 'delete-group') {
    section.nodes = section.nodes.filter(n => n.groupId !== edit.groupId);
    selection = null;
  }
  if (edit.type === 'duplicate-group') {
    const toDuplicate = section.nodes.filter(n => n.groupId === edit.groupId);
    const newNodes: StudioNode[] = [];
    toDuplicate.forEach((node) => {
      const cloned = structuredClone(node);
      const newId = edit.newGroupIdsMap[node.id] || crypto.randomUUID();
      cloned.id = newId;
      cloned.groupId = edit.newGroupId;
      cloned.groupName = `${node.groupName ?? 'Grup'} salinan`.slice(0, 100);
      cloned.name = `${node.name ?? node.kind} salinan`.slice(0, 100);
      cloned.transform = clampTransform({
        ...cloned.transform,
        x: cloned.transform.x + 3,
        y: cloned.transform.y + 3,
      });
      if (cloned.desktopTransform) {
        cloned.desktopTransform = clampTransform({
          ...cloned.desktopTransform,
          x: cloned.desktopTransform.x + 3,
          y: cloned.desktopTransform.y + 3,
        });
      }
      newNodes.push(cloned);
    });
    section.nodes.push(...newNodes);
    selection = newNodes[newNodes.length - 1]?.id ?? null;
  }
  if (edit.type === 'transform-many') {
    section.nodes.forEach(node => {
      const patch = edit.patches[node.id];
      if (patch && !node.locked) {
        node[edit.device === 'desktop' ? 'desktopTransform' : 'transform'] = clampTransform({
          ...resolveTransform(node, edit.device),
          ...patch,
        });
      }
    });
  }
  if ('id' in edit) {
    const i = section.nodes.findIndex(n => n.id === edit.id), node = section.nodes[i];
    if (!node) return { document, selection: null };
    if (edit.type === 'node') Object.assign(node, edit.patch);
    if (edit.type === 'config') Object.assign(node, { config: edit.config });
    if (edit.type === 'delete') { section.nodes.splice(i, 1); selection = null; }
    if (edit.type === 'duplicate') { section.nodes.splice(i + 1, 0, { ...structuredClone(node), id: edit.newId, name: `${node.name ?? node.kind} salinan`.slice(0, 100) }); selection = edit.newId; }
    if (edit.type === 'node-move') { const j = i + edit.offset; if (j >= 0 && j < section.nodes.length) [section.nodes[i], section.nodes[j]] = [section.nodes[j], section.nodes[i]]; }
    if (edit.type === 'inherit' && !node.locked) delete node.desktopTransform;
    if (edit.type === 'transform' && !node.locked) node[edit.device === 'desktop' ? 'desktopTransform' : 'transform'] = clampTransform({ ...resolveTransform(node, edit.device), ...edit.patch });
  }
  const checked = validateStudioDocument(d);
  if (!checked.success) throw new Error(checked.errors.join('; '));
  return { document: checked.data, selection };
}
