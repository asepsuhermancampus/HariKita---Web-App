export type StudioStatus = 'draft' | 'in_review' | 'approved' | 'published' | 'archived';
export type StudioSectionId = 'cover' | 'hero' | 'couple' | 'events' | 'countdown' | 'story' | 'gallery' | 'map' | 'rsvp' | 'guestbook' | 'gifts' | 'rundown' | 'dress-code' | 'entourage' | 'quote-prayer' | 'closing';
export type StudioNodeKind = 'svg' | 'png' | 'image' | 'text' | 'component';
export type StudioLayer = 'background' | 'behind-content' | 'content' | 'front-decoration' | 'component';
export type StudioOverflowPolicy = 'contained' | 'visible';
export type StudioAnimationPreset = 'none' | 'entrance' | 'float' | 'sway' | 'pulse' | 'drift' | 'reveal' | 'exit';

export interface StudioStageAnimation {
  enabled: boolean;
  durationMs: number;
  delayMs?: number;
  direction?: 'left' | 'right' | 'up' | 'down';
  intensity?: number;
}

export interface StudioLoopAnimation {
  preset: 'none' | 'float' | 'sway' | 'pulse' | 'drift';
  durationMs: number;
  intensity?: number;
  repeat?: number;
}

export interface StudioTransform { x: number; y: number; width: number; height: number; rotation: number; flipX: boolean; flipY: boolean; }
export interface StudioAnimation {
  preset: StudioAnimationPreset;
  delayMs: number;
  durationMs: number;
  intensity?: number;
  direction?: 'left' | 'right' | 'up' | 'down';
  repeat?: number;
  trigger?: 'mount' | 'visible';
  entrance?: StudioStageAnimation;
  loop?: StudioLoopAnimation;
  exit?: StudioStageAnimation;
}
export interface StudioAppearance { opacity: number; overflow: StudioOverflowPolicy; }
export interface StudioAccessibility { label: string; description?: string; }
export interface StudioNodeBase { id: string; name?: string; groupId?: string; groupName?: string; layer: StudioLayer; visible: boolean; locked: boolean; transform: StudioTransform; desktopTransform?: StudioTransform; appearance: StudioAppearance; animation: StudioAnimation; accessibility: StudioAccessibility; }
/** Official blocks consume neutral fixtures only. No URLs, HTML or live record IDs. */
export interface StudioComponentConfig { component: StudioSectionId; variant: 'default'; title: string; }
export type StudioNode = StudioNodeBase & (
  | { kind: 'svg' | 'png' | 'image'; config: { src: string; fit?: 'contain' | 'cover' } }
  | { 
      kind: 'text'; 
      config: { 
        text: string; 
        color?: string; 
        fontSize?: number; 
        align?: 'left' | 'center' | 'right';
        fontFamily?: string;
        fontWeight?: string | number;
        fontStyle?: 'normal' | 'italic';
        letterSpacing?: number;
        lineHeight?: number;
      } 
    }
  | { kind: 'component'; config: StudioComponentConfig }
);
export interface StudioSection { id: StudioSectionId; sectionType: StudioSectionId; enabled: boolean; layout: { mobile: 'base'; desktop?: 'override' }; overflowPolicy: StudioOverflowPolicy; nodes: StudioNode[]; }

/** Texture presets rendered with pure CSS (no image files) so they stay light on mobile. */
export type StudioBackgroundTexture = 'noise' | 'grain' | 'linen' | 'marble' | 'dots' | 'rays';

/**
 * Global canvas background. Optional for backward compatibility: an older document
 * without a `background` field simply falls back to the original Cream Canvas (#FAF8F5).
 */
export type StudioBackground =
  | { kind: 'solid'; color: string }
  | { kind: 'gradient'; from: string; to: string; angle: number }
  | { kind: 'texture'; texture: StudioBackgroundTexture; baseColor: string; accentColor: string; intensity: number };

export interface InvitationStudioDocument { schemaVersion: 1; metadata: { name: string }; sectionOrder: StudioSectionId[]; sections: StudioSection[]; fixtureProfile: 'neutral'; background?: StudioBackground; }
