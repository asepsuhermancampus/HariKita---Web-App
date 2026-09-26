export type StudioStatus = 'draft' | 'in_review' | 'approved' | 'published' | 'archived';
export type StudioSectionId = 'cover' | 'hero' | 'couple' | 'events' | 'countdown' | 'story' | 'gallery' | 'map' | 'rsvp' | 'guestbook' | 'gifts' | 'rundown' | 'dress-code' | 'entourage' | 'quote-prayer' | 'closing';
export type StudioNodeKind = 'svg' | 'png' | 'image' | 'text' | 'component';
export type StudioLayer = 'background' | 'behind-content' | 'content' | 'front-decoration' | 'component';
export type StudioOverflowPolicy = 'contained' | 'visible';
export type StudioAnimationPreset = 'none' | 'entrance' | 'float' | 'sway' | 'pulse' | 'drift' | 'reveal' | 'exit';

export interface StudioTransform { x: number; y: number; width: number; height: number; rotation: number; flipX: boolean; flipY: boolean; }
export interface StudioAnimation { preset: StudioAnimationPreset; delayMs: number; durationMs: number; }
export interface StudioAppearance { opacity: number; overflow: StudioOverflowPolicy; }
export interface StudioAccessibility { label: string; description?: string; }
export interface StudioNodeBase { id: string; name?: string; layer: StudioLayer; visible: boolean; locked: boolean; transform: StudioTransform; desktopTransform?: StudioTransform; appearance: StudioAppearance; animation: StudioAnimation; accessibility: StudioAccessibility; }
/** Official blocks consume neutral fixtures only. No URLs, HTML or live record IDs. */
export interface StudioComponentConfig { component: StudioSectionId; variant: 'default'; title: string; }
export type StudioNode = StudioNodeBase & (
  | { kind: 'svg' | 'png' | 'image'; config: { src: string; fit?: 'contain' | 'cover' } }
  | { kind: 'text'; config: { text: string; color?: string; fontSize?: number; align?: 'left' | 'center' | 'right' } }
  | { kind: 'component'; config: StudioComponentConfig }
);
export interface StudioSection { id: StudioSectionId; sectionType: StudioSectionId; enabled: boolean; layout: { mobile: 'base'; desktop?: 'override' }; overflowPolicy: StudioOverflowPolicy; nodes: StudioNode[]; }
export interface InvitationStudioDocument { schemaVersion: 1; metadata: { name: string }; sectionOrder: StudioSectionId[]; sections: StudioSection[]; fixtureProfile: 'neutral'; }
