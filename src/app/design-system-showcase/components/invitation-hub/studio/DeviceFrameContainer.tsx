'use client';

import React from 'react';
import { DeviceFrameId } from '@/types/invitation-studio';
import { cn } from '@/lib/utils';

export interface FrameConfig {
  id: DeviceFrameId;
  name: string;
  width: number;
  height: number;
  bezelRadius: string;
  notchType: 'island' | 'classic' | 'punch-hole';
  aspectRatio: string;
}

export const DEVICE_FRAME_CONFIGS: Record<DeviceFrameId, FrameConfig> = {
  'iphone-15-pro': {
    id: 'iphone-15-pro',
    name: 'iPhone 15 Pro (393px)',
    width: 393,
    height: 852,
    bezelRadius: '50px',
    notchType: 'island',
    aspectRatio: '393 / 852',
  },
  'iphone-se': {
    id: 'iphone-se',
    name: 'iPhone SE (375px)',
    width: 375,
    height: 667,
    bezelRadius: '36px',
    notchType: 'classic',
    aspectRatio: '375 / 667',
  },
  'galaxy-s24': {
    id: 'galaxy-s24',
    name: 'Samsung Galaxy S24 (412px)',
    width: 412,
    height: 915,
    bezelRadius: '42px',
    notchType: 'punch-hole',
    aspectRatio: '412 / 915',
  },
  'pixel-8': {
    id: 'pixel-8',
    name: 'Google Pixel 8 (412px)',
    width: 412,
    height: 892,
    bezelRadius: '44px',
    notchType: 'punch-hole',
    aspectRatio: '412 / 892',
  },
  'iphone-max': {
    id: 'iphone-max',
    name: 'iPhone Pro Max (430px)',
    width: 430,
    height: 932,
    bezelRadius: '52px',
    notchType: 'island',
    aspectRatio: '430 / 932',
  },
};

interface DeviceFrameContainerProps {
  activeFrame: DeviceFrameId;
  onChangeFrame?: (frame: DeviceFrameId) => void;
  children: React.ReactNode;
  className?: string;
}

export function DeviceFrameContainer({
  activeFrame,
  onChangeFrame,
  children,
  className,
}: DeviceFrameContainerProps) {
  const config = DEVICE_FRAME_CONFIGS[activeFrame] || DEVICE_FRAME_CONFIGS['iphone-15-pro'];

  return (
    <div className={cn('flex flex-col items-center select-none', className)}>
      {/* Device Frame Switcher Bar */}
      {onChangeFrame && (
        <div className="mb-3 flex items-center justify-between w-full max-w-[393px] px-2">
          <span className="font-manrope text-[11px] font-bold text-hk-charcoal/70 uppercase tracking-wider">
            Device Viewport:
          </span>
          <div className="flex rounded-full border border-hk-champagne/60 bg-white p-0.5 shadow-2xs">
            {(Object.keys(DEVICE_FRAME_CONFIGS) as DeviceFrameId[]).map((fId) => {
              const f = DEVICE_FRAME_CONFIGS[fId];
              const isSelected = activeFrame === fId;
              return (
                <button
                  key={fId}
                  onClick={() => onChangeFrame(fId)}
                  className={cn(
                    'rounded-full px-2.5 py-0.5 text-[10px] font-manrope font-semibold transition-all',
                    isSelected
                      ? 'bg-hk-charcoal text-white shadow-2xs'
                      : 'text-hk-charcoal/70 hover:text-hk-charcoal'
                  )}
                >
                  {f.name.split(' ')[0]}
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Hardware Smartphone Bezel */}
      <div
        className="relative overflow-hidden border-[8px] sm:border-[10px] border-[#1C1C1E] bg-[#FAF8F5] shadow-2xl transition-all duration-300 ring-1 ring-black/20"
        style={{
          width: '100%',
          maxWidth: `${config.width}px`,
          height: `${Math.min(740, config.height)}px`,
          borderRadius: config.bezelRadius,
        }}
      >
        {/* Dynamic Notch / Island / Punch-hole Header */}
        {config.notchType === 'island' && (
          <div className="absolute top-2 left-1/2 z-40 h-5 w-24 -translate-x-1/2 rounded-full bg-black flex items-center justify-end px-2">
            <div className="h-2 w-2 rounded-full bg-[#111] border border-white/10" />
          </div>
        )}

        {config.notchType === 'classic' && (
          <div className="absolute top-1.5 left-1/2 z-40 h-3.5 w-20 -translate-x-1/2 rounded-full bg-[#2B2B2B]" />
        )}

        {config.notchType === 'punch-hole' && (
          <div className="absolute top-3 left-1/2 z-40 h-3.5 w-3.5 -translate-x-1/2 rounded-full bg-black ring-2 ring-[#222]" />
        )}

        {/* Scrollable Viewport Content */}
        <div className="relative h-full w-full overflow-y-auto overflow-x-hidden scroll-smooth">
          {children}
        </div>

        {/* Bottom Home Indicator Bar */}
        <div className="pointer-events-none absolute bottom-1.5 left-1/2 z-40 h-1 w-32 -translate-x-1/2 rounded-full bg-black/25" />
      </div>

      <p className="mt-2 font-mono text-[10px] text-hk-taupe/80 text-center">
        {config.name} • Viewport {config.width}px • Touch-friendly 44px ergonomics
      </p>
    </div>
  );
}
