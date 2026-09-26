import { STUDIO_SECTIONS } from './sections';
import { findStudioAsset } from './assets';
import type { InvitationStudioDocument, StudioNode, StudioStatus } from './types';

export type ValidationResult<T> = { success: true; data: T } | { success: false; errors: string[] };
const presets = new Set(['none', 'entrance', 'float', 'sway', 'pulse', 'drift', 'reveal', 'exit']);
const kinds = new Set(['svg', 'png', 'image', 'text', 'component']);
const layers = new Set(['background', 'behind-content', 'content', 'front-decoration', 'component']);
const statuses: StudioStatus[] = ['draft', 'in_review', 'approved', 'published', 'archived'];

function nodeErrors(node: unknown, seen: Set<string>): string[] {
  const errors: string[] = [];
  if (!node || typeof node !== 'object') return ['node must be an object'];
  const value = node as Partial<StudioNode>;
  if (!value.id || typeof value.id !== 'string') errors.push('node id required');
  else if (seen.has(value.id)) errors.push(`duplicate node id: ${value.id}`); else seen.add(value.id);
  if (!kinds.has(value.kind as string)) errors.push(`invalid node kind: ${value.id}`);
  if (!layers.has(value.layer as string)) errors.push(`invalid layer: ${value.id}`);
  const transform = value.transform;
  if (!transform || [transform.x, transform.y, transform.width, transform.height, transform.rotation].some((n) => typeof n !== 'number' || !Number.isFinite(n))) errors.push(`invalid transform: ${value.id}`);
  else if (transform.x < 0 || transform.x > 100 || transform.y < 0 || transform.y > 100 || transform.width <= 0 || transform.width > 100 || transform.height <= 0 || transform.height > 100 || transform.rotation < -360 || transform.rotation > 360) errors.push(`transform out of bounds: ${value.id}`);
  if (!value.animation || !presets.has(value.animation.preset) || value.animation.delayMs < 0 || value.animation.durationMs < 0) errors.push(`invalid animation: ${value.id}`);
  if (!value.appearance || value.appearance.opacity < 0 || value.appearance.opacity > 100 || !['contained', 'visible'].includes(value.appearance.overflow)) errors.push(`invalid appearance: ${value.id}`);
  if (!value.accessibility || typeof value.accessibility.label !== 'string') errors.push(`accessibility label required: ${value.id}`);
  if (value.kind === 'svg' || value.kind === 'png' || value.kind === 'image') {
    const src = value.config && typeof value.config.src === 'string' ? value.config.src : '';
    if (!findStudioAsset(src)) errors.push(`unregistered asset: ${value.id}`);
  }
  if (value.kind === 'component' && (!value.config || typeof value.config.component !== 'string')) errors.push(`component config required: ${value.id}`);
  return errors;
}

export function validateStudioDocument(input: unknown): ValidationResult<InvitationStudioDocument> {
  const errors: string[] = [];
  if (!input || typeof input !== 'object') return { success: false, errors: ['document must be an object'] };
  const document = input as Partial<InvitationStudioDocument>;
  if (document.schemaVersion !== 1) errors.push('schemaVersion must be 1');
  if (!document.metadata || typeof document.metadata.name !== 'string' || !document.metadata.name.trim()) errors.push('metadata.name required');
  const expected = STUDIO_SECTIONS.map((section) => section.id);
  if (!Array.isArray(document.sectionOrder) || document.sectionOrder.length !== expected.length || new Set(document.sectionOrder).size !== expected.length || expected.some((id) => !document.sectionOrder?.includes(id))) errors.push('sectionOrder must contain all unique sections');
  if (!Array.isArray(document.sections)) errors.push('sections required');
  else {
    const ids = new Set<string>();
    for (const section of document.sections) {
      if (!section || typeof section !== 'object') { errors.push('invalid section'); continue; }
      const item = section as any;
      if (ids.has(item.id)) errors.push(`duplicate section id: ${item.id}`); ids.add(item.id);
      if (!expected.includes(item.id)) errors.push(`unknown section: ${item.id}`);
      if (!item.layout || item.layout.mobile !== 'base' || (item.layout.desktop !== undefined && item.layout.desktop !== 'override')) errors.push(`invalid layout: ${item.id}`);
      if (!Array.isArray(item.nodes)) errors.push(`nodes required: ${item.id}`); else for (const node of item.nodes) errors.push(...nodeErrors(node, new Set()));
    }
    for (const required of ['cover', 'closing']) if (!document.sections.some((section: any) => section.id === required && section.enabled === true)) errors.push(`${required} section is mandatory`);
  }
  if (document.fixtureProfile !== 'neutral') errors.push('fixtureProfile must be neutral');
  return errors.length ? { success: false, errors } : { success: true, data: input as InvitationStudioDocument };
}

export function validateStudioTransition(from: StudioStatus, to: StudioStatus, actor: string, document: unknown): ValidationResult<InvitationStudioDocument> {
  const valid = validateStudioDocument(document);
  if (!valid.success) return valid;
  if (actor !== 'SUPER_ADMIN') return { success: false, errors: ['SuperAdmin required'] };
  const allowed: Record<StudioStatus, StudioStatus[]> = { draft: ['in_review', 'archived'], in_review: ['approved', 'draft'], approved: ['published', 'draft'], published: ['archived', 'draft'], archived: ['draft'] };
  if (!statuses.includes(to) || !allowed[from]?.includes(to)) return { success: false, errors: [`invalid transition: ${from} to ${to}`] };
  return valid;
}
