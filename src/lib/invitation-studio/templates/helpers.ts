/**
 * HariKita Invitation Studio — Template Helpers
 * 
 * Shared utilities untuk semua template: animasi, transform, nodeBase, placeholder path.
 */
import type { StudioNode, StudioLayer } from '../types';

export const PP = '/assets/harikita/placeholders/photo-portrait.svg';
export const LP = '/assets/harikita/placeholders/photo-landscape.svg';
export const VP = '/assets/harikita/placeholders/photo-venue.svg';
export const AP = '/assets/harikita/placeholders/photo-arch.svg';
export const CP = '/assets/harikita/placeholders/photo-circle.svg';
export const PLP = '/assets/harikita/placeholders/photo-polaroid.svg';

export const fadeIn = (delayMs = 0) => ({
  preset: 'none' as const, durationMs: 1200, delayMs,
  entrance: { enabled: true, durationMs: 1200, delayMs, direction: 'up' as const, intensity: 5 },
  loop: { preset: 'none' as const, durationMs: 3000, intensity: 5, repeat: 0 },
  exit: { enabled: false, durationMs: 800, delayMs: 0 },
});

export const floatAnim = (delayMs = 0) => ({
  preset: 'float' as const, durationMs: 4000, delayMs,
  entrance: { enabled: true, durationMs: 1000, delayMs, direction: 'up' as const, intensity: 3 },
  loop: { preset: 'float' as const, durationMs: 4000, intensity: 8, repeat: 0 },
  exit: { enabled: false, durationMs: 800, delayMs: 0 },
});

export const swayAnim = (delayMs = 0) => ({
  preset: 'sway' as const, durationMs: 6000, delayMs,
  entrance: { enabled: true, durationMs: 800, delayMs, direction: 'up' as const, intensity: 0 },
  loop: { preset: 'sway' as const, durationMs: 6000, intensity: 5, repeat: 0 },
  exit: { enabled: false, durationMs: 600, delayMs: 0 },
});

export const staticAnim = () => ({
  preset: 'none' as const, durationMs: 800, delayMs: 0,
  entrance: { enabled: false, durationMs: 800, delayMs: 0 },
  loop: { preset: 'none' as const, durationMs: 3000, intensity: 5, repeat: 0 },
  exit: { enabled: false, durationMs: 800, delayMs: 0 },
});

type NodeBase = Pick<StudioNode, 'layer' | 'visible' | 'locked' | 'appearance' | 'accessibility'>;
export const nodeBase = (layer: StudioLayer = 'content', opacity = 100): NodeBase => ({
  layer, visible: true, locked: false,
  appearance: { opacity, overflow: 'visible' },
  accessibility: { label: 'Elemen undangan' },
});

export const tfm = (x: number, y: number, w: number, h: number, rot = 0) => ({
  x, y, width: w, height: h, rotation: rot, flipX: false, flipY: false,
});

type TextConfig = Extract<StudioNode, { kind: 'text' }>['config'];
type NodeDef = Omit<StudioNode, 'id'>;

export const textNode = (
  name: string, box: [number, number, number, number], config: TextConfig,
  delayMs = 0, layer: StudioLayer = 'content',
): NodeDef => ({
  name, ...nodeBase(layer), transform: tfm(...box), animation: fadeIn(delayMs),
  kind: 'text', config: { align: 'center', ...config },
});

export const imageNode = (
  name: string, box: [number, number, number, number], src: string,
  delayMs = 0, layer: StudioLayer = 'behind-content',
): NodeDef => ({
  name, ...nodeBase(layer), transform: tfm(...box),
  animation: layer === 'background' ? staticAnim() : fadeIn(delayMs),
  kind: 'image', config: { src, fit: 'cover' },
});
