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
  | { type: 'delete' | 'inherit'; section: StudioSectionId; id: string }
  | { type: 'node-move'; section: StudioSectionId; id: string; offset: -1 | 1 }
  | { type: 'node'; section: StudioSectionId; id: string; patch: Partial<Pick<StudioNodeBase, 'name' | 'locked' | 'visible' | 'layer' | 'appearance' | 'animation' | 'accessibility'>> }
  | { type: 'config'; section: StudioSectionId; id: string; config: StudioNode['config'] }
  | { type: 'transform'; section: StudioSectionId; id: string; device: StudioDevice; patch: Partial<StudioTransform> };

export const resolveTransform = (node: StudioNode, device: StudioDevice) => device === 'desktop' ? node.desktopTransform ?? node.transform : node.transform;
export const selectedStudioNode = (d: InvitationStudioDocument, section: StudioSectionId, id: string | null) => d.sections.find(s => s.id === section)?.nodes.find(n => n.id === id);
export function clampTransform(t: StudioTransform): StudioTransform {
  const clamp = (v: number, min: number, max: number) => Math.min(max, Math.max(min, v));
  // x/y are NOT clamped — assets may overflow canvas in all directions by design
  return { ...t, x: t.x, y: t.y, width: clamp(t.width, 0.1, 200), height: clamp(t.height, 0.1, 200), rotation: clamp(t.rotation, -360, 360) };
}
export function createStudioNode(kind: 'text' | 'component' | StudioAsset, id: string, section: StudioSectionId = 'cover'): StudioNode {
  const base: StudioNodeBase = {
    id,
    name: typeof kind === 'string' ? kind : kind.id,
    layer: kind === 'component' ? 'component' : 'front-decoration',
    visible: true,
    locked: false,
    // Default: small 20×20% drop in top-left area — user resizes from corner handles
    transform: { x: 5, y: 5, width: kind === 'component' ? 100 : kind === 'text' ? 60 : 20, height: kind === 'component' ? 75 : kind === 'text' ? 12 : 20, rotation: 0, flipX: false, flipY: false },
    appearance: { opacity: 100, overflow: 'visible' },
    animation: { preset: 'none', durationMs: 600, delayMs: 0 },
    accessibility: { label: typeof kind === 'string' ? kind : kind.id },
  };
  if (kind === 'text') return { ...base, kind, config: { text: 'Hari Bahagia', color: '#4A2E35', fontSize: 28, align: 'center' } };
  if (kind === 'component') return { ...base, kind, config: { component: section, variant: 'default', title: '' } };
  return { ...base, kind: kind.kind, config: { src: kind.path, fit: 'contain' } };
}
export function editStudio(document: InvitationStudioDocument, edit: StudioEdit): { document: InvitationStudioDocument; selection: string | null } {
  const d = structuredClone(document);
  const section = d.sections.find(s => s.id === edit.section)!;
  let selection: string | null = 'id' in edit ? edit.id : null;
  if (edit.type === 'section-enabled' && canReorderSection(section.id)) section.enabled = edit.enabled;
  if (edit.type === 'section-overflow') section.overflowPolicy = edit.overflow;
  if (edit.type === 'section-move') {
    const i = d.sectionOrder.indexOf(section.id), j = i + edit.offset;
    if (i > 0 && i < 15 && j > 0 && j < 15) [d.sectionOrder[i], d.sectionOrder[j]] = [d.sectionOrder[j], d.sectionOrder[i]];
  }
  if (edit.type === 'add') { section.nodes.push(edit.node); selection = edit.node.id; }
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
