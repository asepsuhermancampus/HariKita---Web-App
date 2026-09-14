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
  scale?: number;
  children: React.ReactNode;
  className?: string;
}

export function DeviceFrameContainer({
  activeFrame,
  onChangeFrame,
  scale = 1,
  children,
  className,
}: DeviceFrameContainerProps) {
  const config = DEVICE_FRAME_CONFIGS[activeFrame] || DEVICE_FRAME_CONFIGS['iphone-15-pro'];
  const baseHeight = Math.min(740, config.height);

  return (
    <div className={cn('flex flex-col items-center w-full', className)}>
      {/* Device Frame Switcher Bar */}
      {onChangeFrame && (
        <div className="mb-2 flex items-center justify-between w-full max-w-[393px] px-1">
          <span className="font-manrope text-[10px] font-bold text-hk-charcoal/70 uppercase tracking-wider">
            Device:
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
                    'rounded-full px-2 py-0.5 text-[9px] font-manrope font-semibold transition-all',
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

      {/* Scaling Wrapper to prevent empty vertical gaps */}
      <div
        className="w-full flex justify-center transition-all duration-300"
        style={{
          height: scale < 1 ? `${baseHeight * scale + 10}px` : `${baseHeight}px`,
        }}
      >
        <div
          style={{
            transform: `scale(${scale})`,
            transformOrigin: 'top center',
            transition: 'transform 0.25s cubic-bezier(0.16, 1, 0.3, 1)',
          }}
        >
          {/* Hardware Smartphone Bezel */}
          <div
            className="relative overflow-hidden border-[8px] sm:border-[10px] border-[#1C1C1E] bg-[#FAF8F5] shadow-2xl transition-all duration-300 ring-1 ring-black/20"
            style={{
              width: `${config.width}px`,
              maxWidth: `${config.width}px`,
              height: `${baseHeight}px`,
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

            {/* Scrollable Viewport Content - No Scrollbar, Full Scrollability */}
            <div
              id="invitation-phone-viewport"
              tabIndex={0}
              role="region"
              aria-label="Simulator Layar Undangan Smartphone"
              className="relative h-full w-full overflow-y-auto overflow-x-hidden scroll-smooth overscroll-contain select-text no-scrollbar [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden [&::-webkit-scrollbar]:w-0 [&::-webkit-scrollbar]:h-0 focus-visible:outline-none"
              style={{
                WebkitOverflowScrolling: 'touch',
                scrollbarWidth: 'none',
                msOverflowStyle: 'none',
              }}
            >
              {children}
            </div>

            {/* Visual Scroll Affordance Fade at bottom edge (pointer-events-none) */}
            <div
              className="pointer-events-none absolute bottom-0 left-0 right-0 h-6 bg-gradient-to-t from-black/10 via-black/5 to-transparent z-30"
              aria-hidden="true"
            />

            {/* Bottom Home Indicator Bar */}
            <div className="pointer-events-none absolute bottom-1.5 left-1/2 z-40 h-1 w-32 -translate-x-1/2 rounded-full bg-black/25" />
          </div>
        </div>
      </div>


      <p className="mt-2 font-mono text-[10px] text-hk-taupe/80 text-center">
        {config.name} • Viewport {config.width}px • Touch-friendly 44px ergonomics
      </p>
    </div>
  );
}
