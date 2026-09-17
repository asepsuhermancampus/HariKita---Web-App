'use client';

import React, { useRef, useState, useEffect } from 'react';
import { Heart, Volume2, VolumeX, Music } from 'lucide-react';
import { cn } from '@/lib/utils';
import { sanitizeUrl } from '@/lib/url-delta-codec';

interface Studio3DEnvelopeFlapProps {
  themeColor: string;
  groomName?: string;
  brideName?: string;
  weddingDate?: string;
  audioUrl?: string;
  isOpened: boolean;
  onOpen: () => void;
  onToggleMusic?: (playing: boolean) => void;
}

export const Studio3DEnvelopeFlap: React.FC<Studio3DEnvelopeFlapProps> = ({
  themeColor,
  groomName = 'Aditya',
  brideName = 'Ratna',
  weddingDate = '24 . 10 . 2026',
  audioUrl,
  isOpened,
  onOpen,
  onToggleMusic,
}) => {
  const [isFlapping, setIsFlapping] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // Audio lifecycle cleanup
  useEffect(() => {
    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
    };
  }, []);

  const handleOpenClick = () => {
    if (isOpened || isFlapping) return;

    // Synchronous audio unlock inside user click gesture
    const safeAudio = sanitizeUrl(audioUrl);
    if (safeAudio) {
      try {
        if (!audioRef.current) {
          audioRef.current = new Audio(safeAudio);
          audioRef.current.loop = true;
        }
        audioRef.current.play().then(() => {
          setIsPlaying(true);
          if (onToggleMusic) onToggleMusic(true);
        }).catch((err) => {
          console.warn('[Studio3DEnvelopeFlap] Audio unlock failed or blocked:', err);
        });
      } catch (e) {
        console.warn('[Studio3DEnvelopeFlap] Audio init error:', e);
      }
    }

    setIsFlapping(true);
    // Smooth transition into opened stream
    setTimeout(() => {
      onOpen();
    }, 900);
  };

  const handleToggleSound = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!audioRef.current) return;

    if (isPlaying) {
      audioRef.current.pause();
      setIsPlaying(false);
      if (onToggleMusic) onToggleMusic(false);
    } else {
      audioRef.current.play().then(() => {
        setIsPlaying(true);
        if (onToggleMusic) onToggleMusic(true);
      }).catch(console.warn);
    }
  };

  return (
    <div className="relative flex h-full min-h-[580px] flex-col justify-between p-6 text-center select-none" style={{ perspective: '1200px' }}>
      
      {/* 3D Flap Envelope Top Header */}
      <div className="relative pt-6">
        <div
          className={cn(
            'transition-transform duration-700 ease-in-out',
            isFlapping ? 'scale-95 opacity-0' : 'scale-100 opacity-100'
          )}
        >
          <span className="font-editorial text-xs italic tracking-widest text-hk-taupe">
            The Wedding Celebration of
          </span>
          <h3 className="mt-2 font-editorial text-4xl text-hk-charcoal tracking-tight">
            {groomName} &amp; {brideName}
          </h3>
          <p className="mt-1 font-mono text-[11px] text-hk-champagne tracking-widest uppercase">
            {weddingDate}
          </p>
        </div>
      </div>

      {/* Guest Card Box Floating */}
      <div
        className={cn(
          'rounded-2xl border border-hk-champagne/60 bg-white/95 p-5 shadow-sm backdrop-blur-xs transition-all duration-500',
          isFlapping && 'translate-y-4 opacity-50'
        )}
      >
        <span className="font-manrope text-[10px] uppercase tracking-wider text-hk-charcoal/60">
          Kepada Yth. Bapak/Ibu/Saudara/i:
        </span>
        <div className="mt-1 font-editorial text-2xl font-medium text-hk-charcoal">
          Tamu Kehormatan
        </div>
        <span className="mt-1 inline-block rounded-full bg-hk-soft-beige px-2.5 py-0.5 font-manrope text-[10px] text-hk-taupe">
          Keluarga Besar di Kebumen
        </span>
      </div>

      {/* 3D Wax Seal Opening Action */}
      <div className="pb-8">
        <button
          type="button"
          onClick={handleOpenClick}
          disabled={isFlapping}
          className="group mx-auto flex flex-col items-center gap-2 transition-transform active:scale-95"
        >
          <div
            className="flex h-16 w-16 items-center justify-center rounded-full text-white shadow-[0_8px_24px_rgba(136,115,91,0.4)] ring-4 ring-[#C9A88A]/40 transition-all duration-500 group-hover:scale-105 group-hover:shadow-[0_10px_30px_rgba(136,115,91,0.5)]"
            style={{
              backgroundColor: themeColor,
              transform: isFlapping ? 'scale(1.2) rotate(15deg)' : undefined,
            }}
          >
            <Heart className="h-7 w-7 fill-white" />
          </div>
          <span className="font-manrope text-xs font-semibold text-hk-taupe tracking-wider">
            {isFlapping ? '✦ Membuka Undangan... ✦' : '✦ Buka Undangan ✦'}
          </span>
        </button>

        {/* Floating Audio Controller (WCAG SC 1.4.2 Compliance) */}
        {audioUrl && (
          <div className="mt-4 flex items-center justify-center gap-1.5 text-[10px] font-manrope text-hk-charcoal/60">
            <Music className="h-3 w-3 text-hk-taupe" />
            <span>Audio Hari H Siap Diputar</span>
          </div>
        )}
      </div>

    </div>
  );
};
