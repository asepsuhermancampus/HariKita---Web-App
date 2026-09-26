import type { InvitationStudioDocument, StudioSection, StudioSectionId } from './types';

export const STUDIO_SECTIONS: ReadonlyArray<{ id: StudioSectionId; label: string; mandatory: boolean }> = [
  ['cover', 'Cover', true], ['hero', 'Hero', false], ['couple', 'Couple Profile', false], ['events', 'Events', false],
  ['countdown', 'Countdown', false], ['story', 'Love Story', false], ['gallery', 'Gallery', false], ['map', 'Map', false],
  ['rsvp', 'RSVP', false], ['guestbook', 'Guestbook', false], ['gifts', 'Gifts', false], ['rundown', 'Rundown', false],
  ['dress-code', 'Dress Code', false], ['entourage', 'Entourage', false], ['quote-prayer', 'Quote/Prayer', false], ['closing', 'Closing', true],
].map(([id, label, mandatory]) => ({ id: id as StudioSectionId, label, mandatory }));

export function canReorderSection(id: StudioSectionId): boolean { return id !== 'cover' && id !== 'closing'; }

export function normalizeSectionOrder(order: readonly string[]): StudioSectionId[] {
  const ids = new Set<StudioSectionId>();
  for (const id of order) if (STUDIO_SECTIONS.some((section) => section.id === id)) ids.add(id as StudioSectionId);
  return STUDIO_SECTIONS.map((section) => section.id).filter((id) => id === 'cover' || id === 'closing' || ids.has(id));
}

export function createBlankStudioDocument(): InvitationStudioDocument {
  const sections: StudioSection[] = STUDIO_SECTIONS.map(({ id, mandatory }) => ({ id, sectionType: id, enabled: mandatory, layout: { mobile: 'base' }, overflowPolicy: 'contained', nodes: [] }));
  return { schemaVersion: 1, metadata: { name: 'Untitled invitation' }, sectionOrder: STUDIO_SECTIONS.map(({ id }) => id), sections, fixtureProfile: 'neutral' };
}
