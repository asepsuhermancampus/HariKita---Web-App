/**
 * HariKita Invitation Studio — Section Content Templates (Registry)
 *
 * Template system dipecah per section di folder templates/ untuk maintainability.
 * File ini hanya registry & lookup utilities.
 *
 * Distribusi: 16 section × 3-10 templates = 62 templates total
 */
import type { StudioNode, StudioSectionId } from './types';

// Import template categories
import { COVER_TEMPLATES } from './templates/cover';
import { HERO_TEMPLATES } from './templates/hero';
import { COUPLE_TEMPLATES } from './templates/couple';
import { EVENTS_TEMPLATES } from './templates/events';
import { COUNTDOWN_TEMPLATES } from './templates/countdown';
import { STORY_TEMPLATES } from './templates/story';
import { GALLERY_TEMPLATES } from './templates/gallery';
import { MAP_TEMPLATES } from './templates/map';
import { RSVP_TEMPLATES } from './templates/rsvp';
import { GUESTBOOK_TEMPLATES } from './templates/guestbook';
import { GIFTS_TEMPLATES } from './templates/gifts';
import { RUNDOWN_TEMPLATES } from './templates/rundown';
import { DRESS_CODE_TEMPLATES } from './templates/dress-code';
import { ENTOURAGE_TEMPLATES } from './templates/entourage';
import { QUOTE_PRAYER_TEMPLATES } from './templates/quote-prayer';
import { CLOSING_TEMPLATES } from './templates/closing';

// Re-export helpers untuk backward compatibility
export {
  fadeIn, floatAnim, swayAnim, staticAnim, nodeBase, tfm, textNode, imageNode,
  PP, LP, VP, AP, CP, PLP,
} from './templates/helpers';

// ─────────────────────────────────────────────────────────────────────────────
// Public Types
// ─────────────────────────────────────────────────────────────────────────────
export interface SectionTemplate {
  id: string;
  sectionId: StudioSectionId;
  name: string;
  description: string;
  /** Emoji shown as thumbnail in the picker UI */
  thumbnail: string;
  nodes: Omit<StudioNode, 'id'>[];
}

// ─────────────────────────────────────────────────────────────────────────────
// Master Registry
// ─────────────────────────────────────────────────────────────────────────────
export const SECTION_TEMPLATES: readonly SectionTemplate[] = [
  ...COVER_TEMPLATES,           // 10
  ...HERO_TEMPLATES,            // 5
  ...COUPLE_TEMPLATES,          // 5
  ...EVENTS_TEMPLATES,          // 4
  ...COUNTDOWN_TEMPLATES,       // 3
  ...STORY_TEMPLATES,           // 4
  ...GALLERY_TEMPLATES,         // 4
  ...MAP_TEMPLATES,             // 3
  ...RSVP_TEMPLATES,            // 3
  ...GUESTBOOK_TEMPLATES,       // 3
  ...GIFTS_TEMPLATES,           // 4
  ...RUNDOWN_TEMPLATES,         // 3
  ...DRESS_CODE_TEMPLATES,      // 3
  ...ENTOURAGE_TEMPLATES,       // 3
  ...QUOTE_PRAYER_TEMPLATES,    // 3
  ...CLOSING_TEMPLATES,         // 4
];                              // TOTAL: 62 templates

export function getTemplatesForSection(sectionId: StudioSectionId): SectionTemplate[] {
  return SECTION_TEMPLATES.filter(t => t.sectionId === sectionId);
}

// ─────────────────────────────────────────────────────────────────────────────
// Query Helpers — untuk UI filter & search
// ─────────────────────────────────────────────────────────────────────────────
export function searchTemplates(query: string): SectionTemplate[] {
  const q = query.trim().toLowerCase();
  if (!q) return [...SECTION_TEMPLATES];
  return SECTION_TEMPLATES.filter(
    t => t.name.toLowerCase().includes(q) || t.description.toLowerCase().includes(q),
  );
}

export function getTemplateCountBySection(): Record<StudioSectionId, number> {
  const counts = {} as Record<StudioSectionId, number>;
  for (const t of SECTION_TEMPLATES) {
    counts[t.sectionId] = (counts[t.sectionId] ?? 0) + 1;
  }
  return counts;
}

export function getTemplateById(id: string): SectionTemplate | undefined {
  return SECTION_TEMPLATES.find(t => t.id === id);
}
