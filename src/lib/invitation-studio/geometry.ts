import type { StudioTransform } from './types';
import { clampTransform } from './editor';

export type StudioGesture = 'drag' | 'resize' | 'rotate';
/** Frame dimensions are measured after display scaling, so gestures stay in document percentages. */
export function gestureTransform(start: StudioTransform, mode: StudioGesture, dx: number, dy: number, width: number, height: number): StudioTransform {
  if (![dx, dy, width, height].every(Number.isFinite) || width <= 0 || height <= 0) throw new Error('Invalid gesture frame');
  const x = dx / width * 100, y = dy / height * 100;
  return clampTransform({ ...start, ...(mode === 'drag' ? { x: start.x + x, y: start.y + y } : mode === 'resize' ? { width: start.width + x, height: start.height + y } : { rotation: start.rotation + dx / width * 360 }) });
}
