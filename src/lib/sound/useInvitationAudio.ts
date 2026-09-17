"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { soundscape } from "./soundscapeEngine";
import { getTrack, type SfxPaletteId } from "./audioCatalog";

export const BACKSOUND_GAIN = 0.4;
const SFX_MUTE_KEY = "hk_sfx_muted";

/**
 * Aturan presedensi (spec §3): musicUrl > backsoundTrackId > fallback tema.
 * Mengembalikan path lokal `/audio/backsound/*.mp3`, URL legacy apa adanya,
 * atau null bila tak ada yang bisa di-resolve.
 */
export function resolveAudioSrc(
  musicUrl: string | null | undefined,
  backsoundTrackId: string | null | undefined,
  fallbackTrackId: string,
): string | null {
  if (musicUrl) return musicUrl;
  const chosen = getTrack(backsoundTrackId ?? "") ?? getTrack(fallbackTrackId);
  return chosen ? chosen.file : null;
}

interface UseInvitationAudioOptions {
  trackId: string;
  paletteId: SfxPaletteId;
  started: boolean;
  musicUrlOverride?: string | null;
}

/**
 * Pemilik tunggal seluruh pemutaran audio undangan. Backsound mulai tanpa mute
 * (gain 0.4) saat `started` menjadi true; SFX default mute dan menghormati
 * localStorage `hk_sfx_muted`.
 */
export function useInvitationAudio({
  trackId,
  paletteId,
  started,
  musicUrlOverride,
}: UseInvitationAudioOptions) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isSfxEnabled, setIsSfxEnabled] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const src = resolveAudioSrc(musicUrlOverride, trackId, trackId);

  // Muat preferensi SFX tamu dari localStorage.
  useEffect(() => {
    if (typeof window === "undefined") return;
    const stored = window.localStorage.getItem(SFX_MUTE_KEY);
    const muted = stored === null ? true : stored === "true";
    setIsSfxEnabled(!muted);
    soundscape.setMuted(muted);
  }, []);

  // Terapkan palette SFX aktif.
  useEffect(() => {
    soundscape.setPalette(paletteId);
  }, [paletteId]);

  // Buat / ganti elemen audio saat src berubah.
  useEffect(() => {
    if (typeof window === "undefined" || !src) return;
    const el = new Audio(src);
    el.loop = true;
    el.preload = "auto";
    el.volume = BACKSOUND_GAIN;
    audioRef.current = el;
    return () => {
      el.pause();
      if (audioRef.current === el) audioRef.current = null;
    };
  }, [src]);

  // Mulai saat sampul dibuka; gagal autoplay bukan error fatal.
  useEffect(() => {
    const el = audioRef.current;
    if (!el) return;
    if (started) {
      el.play().then(() => setIsPlaying(true)).catch(() => setIsPlaying(false));
    } else {
      el.pause();
      setIsPlaying(false);
    }
  }, [started, src]);

  const togglePlayback = useCallback(() => {
    const el = audioRef.current;
    if (!el) return;
    if (isPlaying) {
      el.pause();
      setIsPlaying(false);
    } else {
      el.play().then(() => setIsPlaying(true)).catch(() => setIsPlaying(false));
    }
  }, [isPlaying]);

  const toggleSfx = useCallback(() => {
    setIsSfxEnabled((prev) => {
      const next = !prev;
      soundscape.setMuted(!next);
      if (typeof window !== "undefined") {
        window.localStorage.setItem(SFX_MUTE_KEY, String(!next));
      }
      return next;
    });
  }, []);

  return { isPlaying, isSfxEnabled, togglePlayback, toggleSfx };
}
