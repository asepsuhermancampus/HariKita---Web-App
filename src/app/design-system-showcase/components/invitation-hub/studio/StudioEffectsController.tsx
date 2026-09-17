'use client';

import React, { useState } from 'react';
import { Sparkles, Wand2, Eye, Play, Check, ChevronDown, ChevronUp } from 'lucide-react';
import {
  VisualEffectId,
  MicroAnimationId,
  AnimationMoodPreset,
} from '@/types/invitation-studio';
import { OPTICAL_EFFECTS_LIST, MICRO_ANIMATIONS_LIST } from './VisualEffectsLayer';
import { cn } from '@/lib/utils';

interface StudioEffectsControllerProps {
  activeEffects: VisualEffectId[];
  activeAnimations: MicroAnimationId[];
  currentMood: AnimationMoodPreset;
  onApplyMood: (mood: AnimationMoodPreset) => void;
  onToggleEffect: (id: VisualEffectId) => void;
  onToggleAnimation: (id: MicroAnimationId) => void;
  themeColor: string;
  className?: string;
}

export function StudioEffectsController({
  activeEffects,
  activeAnimations,
  currentMood,
  onApplyMood,
  onToggleEffect,
  onToggleAnimation,
  themeColor,
  className,
}: StudioEffectsControllerProps) {
  const [showEffectsDetail, setShowEffectsDetail] = useState<boolean>(false);
  const [showAnimationsDetail, setShowAnimationsDetail] = useState<boolean>(false);

  const moodPresets = [
    {
      id: 'serene' as AnimationMoodPreset,
      label: 'Tenang & Sakral',
      subtitle: 'Khidmat, minimalis, tanpa gerak',
    },
    {
      id: 'graceful' as AnimationMoodPreset,
      label: 'Elegan Hidup (Default)',
      subtitle: 'Tinta terlukis, ayunan daun, kilau emas',
    },
    {
      id: 'cinematic' as AnimationMoodPreset,
      label: 'Magis Sinematik',
      subtitle: 'Semua efek aktif + partikel melayang',
    },
  ];

  return (
    <div className={cn('rounded-2xl border border-hk-champagne/50 bg-white p-5 shadow-xs space-y-5', className)}>
      {/* Header */}
      <div className="border-b border-hk-champagne/30 pb-3">
        <div className="flex items-center gap-2">
          <div
            className="flex h-7 w-7 items-center justify-center rounded-lg text-white shadow-2xs"
            style={{ backgroundColor: themeColor }}
          >
            <Wand2 className="h-4 w-4" />
          </div>
          <div>
            <h4 className="font-editorial text-xl text-hk-charcoal font-medium leading-none">
              Sistem 15 Efek Optik &amp; 15 Animasi Mikro
            </h4>
            <p className="font-manrope text-xs text-hk-charcoal/60 mt-0.5">
              Dibuat dengan akselerasi CSS GPU 60 FPS agar undangan tidak kaku, tetap elegan, dan sejuk di baterai.
            </p>
          </div>
        </div>
      </div>

      {/* Preset Mood Selector */}
      <div>
        <label className="block font-manrope text-xs font-bold uppercase tracking-wider text-hk-charcoal/80 mb-2">
          Pilih Preset Mood Suasana (1-Klik):
        </label>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
          {moodPresets.map((preset) => {
            const isSelected = currentMood === preset.id;
            return (
              <button
                key={preset.id}
                onClick={() => onApplyMood(preset.id)}
                className={cn(
                  'flex flex-col items-start rounded-xl border p-3 text-left transition-all',
                  isSelected
                    ? 'border-hk-charcoal bg-hk-ivory shadow-xs ring-1 ring-hk-charcoal'
                    : 'border-hk-champagne/40 bg-white hover:border-hk-taupe'
                )}
              >
                <div className="flex w-full items-center justify-between">
                  <span className="font-editorial text-sm font-semibold text-hk-charcoal">
                    {preset.label}
                  </span>
                  {isSelected && (
                    <span
                      className="flex h-4 w-4 items-center justify-center rounded-full text-white text-[9px]"
                      style={{ backgroundColor: themeColor }}
                    >
                      <Check className="h-2.5 w-2.5" />
                    </span>
                  )}
                </div>
                <span className="font-manrope text-[10px] text-hk-charcoal/65 mt-1 leading-snug">
                  {preset.subtitle}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Accordion 1: 15 Optical Effects Detail */}
      <div className="rounded-xl border border-hk-champagne/40 bg-hk-ivory/20 overflow-hidden">
        <button
          onClick={() => setShowEffectsDetail(!showEffectsDetail)}
          className="flex w-full items-center justify-between p-3.5 text-left font-manrope text-xs font-bold text-hk-charcoal hover:bg-hk-ivory/50 transition-colors"
        >
          <div className="flex items-center gap-2">
            <Eye className="h-4 w-4" style={{ color: themeColor }} />
            <span>Kustomisasi 15 Efek Optik &amp; Pencahayaan ({activeEffects.length} Aktif)</span>
          </div>
          {showEffectsDetail ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
        </button>

        {showEffectsDetail && (
          <div className="p-3 pt-0 grid grid-cols-1 sm:grid-cols-2 gap-2 border-t border-hk-champagne/20">
            {OPTICAL_EFFECTS_LIST.map((effect) => {
              const isActive = activeEffects.includes(effect.id);
              return (
                <div
                  key={effect.id}
                  onClick={() => onToggleEffect(effect.id)}
                  className={cn(
                    'flex items-start gap-2.5 rounded-lg border p-2 cursor-pointer transition-colors',
                    isActive
                      ? 'border-hk-charcoal bg-white shadow-2xs'
                      : 'border-hk-champagne/30 bg-hk-ivory/40 opacity-70 hover:opacity-100'
                  )}
                >
                  <input
                    type="checkbox"
                    checked={isActive}
                    onChange={() => onToggleEffect(effect.id)}
                    className="mt-0.5 rounded border-hk-champagne text-hk-taupe focus:ring-hk-taupe"
                  />
                  <div className="min-w-0 flex-1">
                    <p className="font-editorial text-xs font-medium text-hk-charcoal leading-snug">
                      {effect.name}
                    </p>
                    <p className="font-manrope text-[10px] text-hk-charcoal/60 line-clamp-1">
                      {effect.description}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Accordion 2: 15 Micro-Animations Detail */}
      <div className="rounded-xl border border-hk-champagne/40 bg-hk-ivory/20 overflow-hidden">
        <button
          onClick={() => setShowAnimationsDetail(!showAnimationsDetail)}
          className="flex w-full items-center justify-between p-3.5 text-left font-manrope text-xs font-bold text-hk-charcoal hover:bg-hk-ivory/50 transition-colors"
        >
          <div className="flex items-center gap-2">
            <Play className="h-4 w-4" style={{ color: themeColor }} />
            <span>Kustomisasi 15 Animasi Mikro Elegan ({activeAnimations.length} Aktif)</span>
          </div>
          {showAnimationsDetail ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
        </button>

        {showAnimationsDetail && (
          <div className="p-3 pt-0 grid grid-cols-1 sm:grid-cols-2 gap-2 border-t border-hk-champagne/20">
            {MICRO_ANIMATIONS_LIST.map((anim) => {
              const isActive = activeAnimations.includes(anim.id);
              return (
                <div
                  key={anim.id}
                  onClick={() => onToggleAnimation(anim.id)}
                  className={cn(
                    'flex items-start gap-2.5 rounded-lg border p-2 cursor-pointer transition-colors',
                    isActive
                      ? 'border-hk-charcoal bg-white shadow-2xs'
                      : 'border-hk-champagne/30 bg-hk-ivory/40 opacity-70 hover:opacity-100'
                  )}
                >
                  <input
                    type="checkbox"
                    checked={isActive}
                    onChange={() => onToggleAnimation(anim.id)}
                    className="mt-0.5 rounded border-hk-champagne text-hk-taupe focus:ring-hk-taupe"
                  />
                  <div className="min-w-0 flex-1">
                    <p className="font-editorial text-xs font-medium text-hk-charcoal leading-snug">
                      {anim.name}
                    </p>
                    <p className="font-manrope text-[10px] text-hk-charcoal/60 line-clamp-1">
                      {anim.description}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
