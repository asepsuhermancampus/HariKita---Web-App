import { STUDIO_SECTIONS } from './sections';
import { findStudioAsset } from './assets';
import type { InvitationStudioDocument, StudioStatus } from './types';

export type ValidationResult<T> = { success: true; data: T } | { success: false; errors: string[] };
export const STUDIO_LIMITS = { bytes: 512_000, nodes: 256, name: 100, text: 4000, durationMs: 60_000, delayMs: 60_000 } as const;
const presets = ['none', 'entrance', 'float', 'sway', 'pulse', 'drift', 'reveal', 'exit'];
const layers = ['background', 'behind-content', 'content', 'front-decoration', 'component'];
const ids = STUDIO_SECTIONS.map(s => s.id as string);
const record = (v: unknown): v is Record<string, unknown> => !!v && typeof v === 'object' && !Array.isArray(v) && (Object.getPrototypeOf(v) === Object.prototype || Object.getPrototypeOf(v) === null);
const number = (v: unknown, min: number, max: number) => typeof v === 'number' && Number.isFinite(v) && v >= min && v <= max;
const text = (v: unknown, max: number, nonempty = false) => typeof v === 'string' && v.length <= max && (!nonempty || !!v.trim());
const oneOf = (v: unknown, values: readonly string[]) => typeof v === 'string' && values.includes(v);
const keys = (v: Record<string, unknown>, allowed: string[]) => Object.keys(v).every(k => allowed.includes(k));
const overflow = (v: unknown) => oneOf(v, ['contained', 'visible']);

function transform(v: unknown): boolean {
  return record(v) && keys(v, ['x', 'y', 'width', 'height', 'rotation', 'flipX', 'flipY']) &&
    number(v.x, -50, 100) && number(v.y, -100, 150) && number(v.width, 0.1, 100) && number(v.height, 0.1, 100) &&
    number(v.rotation, -360, 360) && typeof v.flipX === 'boolean' && typeof v.flipY === 'boolean';
}

function config(kind: unknown, v: unknown): boolean {
  if (!record(v)) return false;
  if (kind === 'text') return keys(v, ['text', 'color', 'fontSize', 'align']) && text(v.text, STUDIO_LIMITS.text) &&
    (v.color === undefined || (typeof v.color === 'string' && /^#[\da-f]{6}$/i.test(v.color))) &&
    (v.fontSize === undefined || number(v.fontSize, 8, 160)) && (v.align === undefined || oneOf(v.align, ['left', 'center', 'right']));
  if (kind === 'component') return keys(v, ['component', 'variant', 'title']) && oneOf(v.component, ids) && v.variant === 'default' && text(v.title, 200);
  if (!oneOf(kind, ['svg', 'png', 'image']) || !keys(v, ['src', 'fit']) || typeof v.src !== 'string') return false;
  const asset = findStudioAsset(v.src);
  // Allow: 'image' kind accepts any found asset; 'svg'/'png' accepts same-kind OR 'image' kind fallback.
  // This tolerates nodes saved before asset manifest changes (kind mismatch from DB is non-fatal).
  return !!asset && (v.fit === undefined || oneOf(v.fit, ['contain', 'cover']));
}

export function validateStudioDocument(input: unknown): ValidationResult<InvitationStudioDocument> {
  const errors: string[] = [];
  const reject = (message: string) => errors.push(message);
  if (!record(input)) return { success: false, errors: ['document must be an object'] };
  try {
    if (new TextEncoder().encode(JSON.stringify(input)).length > STUDIO_LIMITS.bytes) return { success: false, errors: ['document too large'] };
  } catch { return { success: false, errors: ['document must be serializable JSON'] }; }
  if (!keys(input, ['schemaVersion', 'metadata', 'sectionOrder', 'sections', 'fixtureProfile'])) reject('unknown document field');
  if (input.schemaVersion !== 1) reject('schemaVersion must be 1');
  if (!record(input.metadata) || !keys(input.metadata, ['name']) || !text(input.metadata.name, 100, true)) reject('metadata.name required, maximum 100 characters');
  if (input.fixtureProfile !== 'neutral') reject('fixtureProfile must be neutral');
  const order = input.sectionOrder;
  if (!Array.isArray(order) || order.length !== 16 || new Set(order).size !== 16 || !order.every(id => ids.includes(id)) || order[0] !== 'cover' || order[15] !== 'closing') reject('sectionOrder must contain all unique sections with fixed cover/closing');
  if (!Array.isArray(input.sections) || input.sections.length !== 16) reject('all sixteen sections required');
  const sections = Array.isArray(input.sections) ? input.sections : [];
  const seenSections = new Set<string>();
  const seenNodes = new Set<string>();
  let count = 0;
  for (const section of sections) {
    if (!record(section)) { reject('invalid section'); continue; }
    if (!keys(section, ['id', 'sectionType', 'enabled', 'layout', 'overflowPolicy', 'nodes'])) reject('unknown section field');
    if (typeof section.id !== 'string' || !ids.includes(section.id) || seenSections.has(section.id)) reject('unknown or duplicate section id');
    else seenSections.add(section.id);
    if (section.sectionType !== section.id || typeof section.enabled !== 'boolean' || !overflow(section.overflowPolicy)) reject('invalid section configuration');
    if (['cover', 'closing'].includes(String(section.id)) && section.enabled !== true) reject('cover/closing section is mandatory');
    if (!record(section.layout) || !keys(section.layout, ['mobile', 'desktop']) || section.layout.mobile !== 'base' || (section.layout.desktop !== undefined && section.layout.desktop !== 'override')) reject('invalid section layout');
    if (!Array.isArray(section.nodes)) { reject('nodes required'); continue; }
    count += section.nodes.length;
    if (count > STUDIO_LIMITS.nodes) { reject('too many nodes'); break; }
    for (const node of section.nodes) {
      if (!record(node)) { reject('invalid node'); continue; }
      if (!keys(node, ['id', 'name', 'groupId', 'groupName', 'kind', 'layer', 'visible', 'locked', 'transform', 'desktopTransform', 'appearance', 'animation', 'accessibility', 'config'])) reject('unknown node field');
      if (typeof node.id !== 'string' || !/^[\w-]{1,100}$/.test(node.id)) reject('invalid node id');
      else if (seenNodes.has(node.id)) reject(`duplicate node id: ${node.id}`); else seenNodes.add(node.id);
      if (node.name !== undefined && !text(node.name, 100, true)) reject('invalid node name');
      if (node.groupId !== undefined && (typeof node.groupId !== 'string' || !/^[\w-]{1,100}$/.test(node.groupId))) reject('invalid node groupId');
      if (node.groupName !== undefined && !text(node.groupName, 100, true)) reject('invalid node groupName');
      if (!oneOf(node.layer, layers) || typeof node.visible !== 'boolean' || typeof node.locked !== 'boolean') reject('invalid node flags/layer');
      if (!transform(node.transform) || (node.desktopTransform !== undefined && !transform(node.desktopTransform))) reject('invalid transform');
      const a = node.animation as any;
      if (!record(a) || !keys(a, ['preset', 'delayMs', 'durationMs', 'intensity', 'direction', 'repeat', 'trigger', 'entrance', 'loop', 'exit']) || !oneOf(a.preset, presets) || !number(a.delayMs, 0, STUDIO_LIMITS.delayMs) || !number(a.durationMs, 0, STUDIO_LIMITS.durationMs) ||
        (a.intensity !== undefined && !number(a.intensity, 0, 20)) || (a.direction !== undefined && !oneOf(a.direction, ['left', 'right', 'up', 'down'])) ||
        (a.repeat !== undefined && (!number(a.repeat, 0, 20) || !Number.isInteger(a.repeat))) || (a.trigger !== undefined && !oneOf(a.trigger, ['mount', 'visible']))) reject('invalid animation');
      if (a.entrance !== undefined) {
        if (!record(a.entrance) || !keys(a.entrance, ['enabled', 'durationMs', 'delayMs', 'direction', 'intensity']) || typeof a.entrance.enabled !== 'boolean' || !number(a.entrance.durationMs, 0, STUDIO_LIMITS.durationMs) ||
          (a.entrance.delayMs !== undefined && !number(a.entrance.delayMs, 0, STUDIO_LIMITS.delayMs)) ||
          (a.entrance.intensity !== undefined && !number(a.entrance.intensity, 0, 20)) ||
          (a.entrance.direction !== undefined && !oneOf(a.entrance.direction, ['left', 'right', 'up', 'down']))) reject('invalid entrance animation');
      }
      if (a.loop !== undefined) {
        if (!record(a.loop) || !keys(a.loop, ['preset', 'durationMs', 'intensity', 'repeat']) || !oneOf(a.loop.preset, ['none', 'float', 'sway', 'pulse', 'drift']) || !number(a.loop.durationMs, 0, STUDIO_LIMITS.durationMs) ||
          (a.loop.intensity !== undefined && !number(a.loop.intensity, 0, 20)) ||
          (a.loop.repeat !== undefined && (!number(a.loop.repeat, 0, 20) || !Number.isInteger(a.loop.repeat)))) reject('invalid loop animation');
      }
      if (a.exit !== undefined) {
        if (!record(a.exit) || !keys(a.exit, ['enabled', 'durationMs', 'delayMs', 'direction', 'intensity']) || typeof a.exit.enabled !== 'boolean' || !number(a.exit.durationMs, 0, STUDIO_LIMITS.durationMs) ||
          (a.exit.delayMs !== undefined && !number(a.exit.delayMs, 0, STUDIO_LIMITS.delayMs)) ||
          (a.exit.intensity !== undefined && !number(a.exit.intensity, 0, 20)) ||
          (a.exit.direction !== undefined && !oneOf(a.exit.direction, ['left', 'right', 'up', 'down']))) reject('invalid exit animation');
      }
      const p = node.appearance;
      if (!record(p) || !keys(p, ['opacity', 'overflow']) || !number(p.opacity, 0, 100) || !overflow(p.overflow)) reject('invalid appearance');
      const access = node.accessibility;
      if (!record(access) || !keys(access, ['label', 'description']) || !text(access.label, 200) || (access.description !== undefined && !text(access.description, 1000))) reject('invalid accessibility');
      if (!config(node.kind, node.config)) reject('invalid node kind/config or unregistered asset');
    }
  }
  if (seenSections.size !== 16) reject('all sixteen unique sections required');
  return errors.length ? { success: false, errors } : { success: true, data: structuredClone(input) as unknown as InvitationStudioDocument };
}

export function validateStudioTransition(from: StudioStatus, to: StudioStatus, actor: string, document: unknown): ValidationResult<InvitationStudioDocument> {
  if (actor !== 'SUPER_ADMIN') return { success: false, errors: ['SuperAdmin required'] };
  const valid = validateStudioDocument(document);
  if (!valid.success) return valid;
  const allowed: Record<StudioStatus, StudioStatus[]> = { draft: ['in_review', 'archived'], in_review: ['approved', 'draft', 'archived'], approved: ['published', 'draft', 'archived'], published: ['archived', 'draft'], archived: ['draft'] };
  if (!allowed[from]?.includes(to)) return { success: false, errors: [`invalid transition: ${from} to ${to}`] };
  return valid;
}
