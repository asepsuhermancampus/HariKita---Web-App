import type { MotionProps, TargetAndTransition } from 'motion/react';
import type { StudioAnimation } from '@/lib/invitation-studio/types';

export function resolveStudioMotion(animation: StudioAnimation, reduced: boolean): MotionProps {
  if (reduced || animation.preset === 'none') return { initial: false, animate: { opacity: 1 } };
  const intensity = Math.min(20, Math.max(0, animation.intensity ?? 8));
  const direction = animation.direction ?? 'up';
  const axis = direction === 'left' || direction === 'right' ? 'x' : 'y';
  const distance = intensity * (direction === 'left' || direction === 'up' ? -1 : 1);
  const transition = {
    duration: Math.max(0.001, Math.min(60, (animation.durationMs ?? 1500) / 1000)),
    delay: Math.min(60, (animation.delayMs ?? 0) / 1000),
    repeat: Math.min(20, Math.max(0, animation.repeat ?? 0)),
    ease: [0.25, 0.1, 0.25, 1.0] as const,
  };
  const presets: Record<StudioAnimation['preset'], Omit<MotionProps, 'animate'> & { animate?: TargetAndTransition }> = {
    none: {},
    entrance: { initial: { opacity: 0, [axis]: distance }, animate: { opacity: 1, [axis]: 0 } },
    exit: { initial: { opacity: 1, [axis]: 0 }, animate: { opacity: 0, [axis]: distance }, exit: { opacity: 0, [axis]: distance } },
    float: { initial: false, animate: { y: [0, -intensity, 0] } },
    sway: { initial: false, animate: { rotate: [-intensity / 2, intensity / 2, -intensity / 2] } },
    pulse: { initial: false, animate: { scale: [1, 1 + intensity / 100, 1] } },
    drift: { initial: false, animate: { [axis]: [0, distance, 0] } },
    reveal: { initial: { opacity: 0, clipPath: 'inset(0 100% 0 0)' }, animate: { opacity: 1, clipPath: 'inset(0 0% 0 0)' } },
  };
  const result = { ...presets[animation.preset], transition };
  return animation.trigger === 'visible' ? { ...result, whileInView: result.animate, viewport: { once: true, amount: 0.1 } } : result;
}

export function resolveCompositeStudioMotion(
  animation: StudioAnimation,
  reduced: boolean
): { outer: MotionProps; inner: MotionProps } {
  if (reduced) {
    return {
      outer: { initial: false, animate: { opacity: 1 } },
      inner: { initial: false, animate: { opacity: 1 } },
    };
  }

  // 1. Outer Container: Handles Entrance (0 -> 100) and Exit (100 -> 0)
  let outer: MotionProps = {};
  const hasEntrance = animation.entrance?.enabled ?? (animation.preset === 'entrance');
  const hasExit = animation.exit?.enabled ?? (animation.preset === 'exit');

  if (hasEntrance) {
    const dur = Math.max(0.001, Math.min(60, (animation.entrance?.durationMs ?? animation.durationMs ?? 1500) / 1000));
    const delay = Math.min(60, (animation.entrance?.delayMs ?? animation.delayMs ?? 0) / 1000);
    const intensity = Math.min(20, Math.max(0, animation.entrance?.intensity ?? animation.intensity ?? 0));
    const dir = animation.entrance?.direction ?? animation.direction ?? 'up';
    const axis = dir === 'left' || dir === 'right' ? 'x' : 'y';
    const distance = intensity * (dir === 'left' || dir === 'up' ? -1 : 1);

    outer = {
      initial: { opacity: 0, [axis]: distance },
      animate: { opacity: 1, [axis]: 0 },
      transition: { duration: dur, delay, ease: [0.25, 0.1, 0.25, 1.0] },
    };
  } else if (hasExit) {
    const dur = Math.max(0.001, Math.min(60, (animation.exit?.durationMs ?? animation.durationMs ?? 1500) / 1000));
    const delay = Math.min(60, (animation.exit?.delayMs ?? animation.delayMs ?? 0) / 1000);
    const intensity = Math.min(20, Math.max(0, animation.exit?.intensity ?? animation.intensity ?? 0));
    const dir = animation.exit?.direction ?? animation.direction ?? 'up';
    const axis = dir === 'left' || dir === 'right' ? 'x' : 'y';
    const distance = intensity * (dir === 'left' || dir === 'up' ? -1 : 1);

    outer = {
      initial: { opacity: 1, [axis]: 0 },
      animate: { opacity: 0, [axis]: distance },
      exit: { opacity: 0, [axis]: distance },
      transition: { duration: dur, delay, ease: [0.25, 0.1, 0.25, 1.0] },
    };
  } else if (animation.preset === 'reveal') {
    const dur = Math.max(0.001, Math.min(60, (animation.durationMs ?? 1500) / 1000));
    const delay = Math.min(60, (animation.delayMs ?? 0) / 1000);
    outer = {
      initial: { opacity: 0, clipPath: 'inset(0 100% 0 0)' },
      animate: { opacity: 1, clipPath: 'inset(0 0% 0 0)' },
      transition: { duration: dur, delay, ease: [0.25, 0.1, 0.25, 1.0] },
    };
  }

  // 2. Inner Container: Handles Looping Ambience (Float, Sway, Pulse, Drift)
  let inner: MotionProps = {};
  const loopPreset = animation.loop?.preset ?? (
    ['float', 'sway', 'pulse', 'drift'].includes(animation.preset) ? animation.preset as 'float' | 'sway' | 'pulse' | 'drift' : 'none'
  );

  if (loopPreset !== 'none') {
    const dur = Math.max(0.001, Math.min(60, (animation.loop?.durationMs ?? animation.durationMs ?? 3000) / 1000));
    const intensity = Math.min(20, Math.max(1, animation.loop?.intensity ?? animation.intensity ?? 8));
    const repeat = animation.loop?.repeat ?? (animation.repeat === 0 ? Infinity : (animation.repeat ?? Infinity));
    const transition = { duration: dur, repeat, ease: 'easeInOut' as const };

    if (loopPreset === 'float') {
      inner = { initial: false, animate: { y: [0, -intensity, 0] }, transition };
    } else if (loopPreset === 'sway') {
      inner = { initial: false, animate: { rotate: [-intensity / 2, intensity / 2, -intensity / 2] }, transition };
    } else if (loopPreset === 'pulse') {
      inner = { initial: false, animate: { scale: [1, 1 + intensity / 100, 1] }, transition };
    } else if (loopPreset === 'drift') {
      const dir = animation.direction ?? 'right';
      const axis = dir === 'left' || dir === 'right' ? 'x' : 'y';
      const dist = intensity * (dir === 'left' || dir === 'up' ? -1 : 1);
      inner = { initial: false, animate: { [axis]: [0, dist, 0] }, transition };
    }
  }

  return { outer, inner };
}
