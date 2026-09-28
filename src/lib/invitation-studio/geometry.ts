import type { StudioTransform } from './types';
import { clampTransform } from './editor';

export type StudioGesture = 'drag' | 'resize' | 'resize-nw' | 'resize-ne' | 'resize-sw' | 'resize-se' | 'rotate';

/** Frame dimensions are measured after display scaling, so gestures stay in document percentages. */
export function gestureTransform(
  start: StudioTransform,
  mode: StudioGesture,
  dx: number,
  dy: number,
  width: number,
  height: number
): StudioTransform {
  if (![dx, dy, width, height].every(Number.isFinite) || width <= 0 || height <= 0)
    throw new Error('Invalid gesture frame');

  const px = (dx / width) * 100;   // delta in % of frame width
  const py = (dy / height) * 100;  // delta in % of frame height

  switch (mode) {
    case 'drag':
      return clampTransform({ ...start, x: start.x + px, y: start.y + py });

    // SE corner: grow right + down (classic resize)
    case 'resize':
    case 'resize-se':
      return clampTransform({
        ...start,
        width: Math.max(0.1, start.width + px),
        height: Math.max(0.1, start.height + py),
      });

    // NW corner: move origin + shrink opposite
    case 'resize-nw':
      return clampTransform({
        ...start,
        x: start.x + px,
        y: start.y + py,
        width: Math.max(0.1, start.width - px),
        height: Math.max(0.1, start.height - py),
      });

    // NE corner: grow right, move top
    case 'resize-ne':
      return clampTransform({
        ...start,
        y: start.y + py,
        width: Math.max(0.1, start.width + px),
        height: Math.max(0.1, start.height - py),
      });

    // SW corner: move left, grow down
    case 'resize-sw':
      return clampTransform({
        ...start,
        x: start.x + px,
        width: Math.max(0.1, start.width - px),
        height: Math.max(0.1, start.height + py),
      });

    case 'rotate':
      return clampTransform({ ...start, rotation: Math.round(start.rotation + (dx / width) * 360) });

    default:
      return start;
  }
}
