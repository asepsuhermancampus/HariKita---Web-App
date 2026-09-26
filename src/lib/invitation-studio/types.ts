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
export interface StudioNode { id: string; kind: StudioNodeKind; layer: StudioLayer; visible: boolean; locked: boolean; transform: StudioTransform; desktopTransform?: StudioTransform; appearance: StudioAppearance; animation: StudioAnimation; accessibility: StudioAccessibility; config: Record<string, unknown>; }
export interface StudioSection { id: StudioSectionId; sectionType: StudioSectionId; enabled: boolean; layout: { mobile: 'base'; desktop?: 'override' }; overflowPolicy: StudioOverflowPolicy; nodes: StudioNode[]; }
export interface InvitationStudioDocument { schemaVersion: 1; metadata: { name: string }; sectionOrder: StudioSectionId[]; sections: StudioSection[]; fixtureProfile: 'neutral'; }
