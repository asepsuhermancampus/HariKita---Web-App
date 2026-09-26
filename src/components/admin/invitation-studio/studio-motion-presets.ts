import type { MotionProps, TargetAndTransition } from 'motion/react';
import type { StudioAnimation } from '@/lib/invitation-studio/types';

export function resolveStudioMotion(animation: StudioAnimation, reduced: boolean): MotionProps {
  if (reduced || animation.preset === 'none') return { initial: false, animate: { opacity: 1 } };
  const intensity = Math.min(20, Math.max(0, animation.intensity ?? 8));
  const direction = animation.direction ?? 'up';
  const axis = direction === 'left' || direction === 'right' ? 'x' : 'y';
  const distance = intensity * (direction === 'left' || direction === 'up' ? -1 : 1);
  const transition = { duration: Math.max(0.001, Math.min(60, animation.durationMs / 1000)), delay: Math.min(60, animation.delayMs / 1000), repeat: Math.min(20, Math.max(0, animation.repeat ?? 0)), ease: 'easeInOut' as const };
  const presets: Record<StudioAnimation['preset'], Omit<MotionProps, 'animate'> & { animate?: TargetAndTransition }> = {
    none: {},
    entrance: { initial: { opacity: 0, [axis]: distance }, animate: { opacity: 1, [axis]: 0 } },
    float: { initial: false, animate: { y: [0, -intensity, 0] } },
    sway: { initial: false, animate: { rotate: [-intensity / 2, intensity / 2, -intensity / 2] } },
    pulse: { initial: false, animate: { scale: [1, 1 + intensity / 100, 1] } },
    drift: { initial: false, animate: { [axis]: [0, distance, 0] } },
    reveal: { initial: { opacity: 0, clipPath: 'inset(0 100% 0 0)' }, animate: { opacity: 1, clipPath: 'inset(0 0% 0 0)' } },
    exit: { initial: { opacity: 1 }, animate: { opacity: [1, 0, 1], [axis]: [0, distance, 0] }, exit: { opacity: 0, [axis]: distance } },
  };
  const result = { ...presets[animation.preset], transition };
  return animation.trigger === 'visible' ? { ...result, whileInView: result.animate, viewport: { once: true, amount: 0.1 } } : result;
}
