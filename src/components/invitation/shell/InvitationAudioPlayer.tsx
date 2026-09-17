"use client";

import React from "react";
import { Play, Pause, Volume2, VolumeX } from "lucide-react";
import { useInvitationAudio } from "@/lib/sound/useInvitationAudio";
import type { SfxPaletteId } from "@/lib/sound/audioCatalog";

interface InvitationAudioPlayerProps {
  trackId: string;
  paletteId: SfxPaletteId;
  started: boolean;
  musicUrlOverride?: string | null;
  themeColors?: { primary?: string; accent?: string };
}

export const InvitationAudioPlayer: React.FC<InvitationAudioPlayerProps> = ({
  trackId,
  paletteId,
  started,
  musicUrlOverride,
  themeColors,
}) => {
  const { isPlaying, isSfxEnabled, togglePlayback, toggleSfx } = useInvitationAudio({
    trackId,
    paletteId,
    started,
    musicUrlOverride,
  });

  const accent = themeColors?.accent || "#C5A880";

  return (
    <div className="fixed bottom-6 right-6 z-40 flex items-center gap-2">
      <button
        onClick={togglePlayback}
        aria-label={isPlaying ? "Jeda musik latar" : "Putar musik latar"}
        title={isPlaying ? "Jeda musik latar" : "Putar musik latar"}
        className="p-3 rounded-full shadow-2xl backdrop-blur-md border transition-transform active:scale-95"
        style={{ borderColor: accent, backgroundColor: "rgba(255,255,255,0.85)" }}
      >
        {isPlaying ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5" />}
      </button>

      <button
        onClick={toggleSfx}
        aria-label={isSfxEnabled ? "Matikan efek suara" : "Nyalakan efek suara"}
        title={isSfxEnabled ? "Matikan efek suara" : "Nyalakan efek suara"}
        className="p-3 rounded-full shadow-2xl backdrop-blur-md border transition-transform active:scale-95"
        style={{ borderColor: accent, backgroundColor: "rgba(255,255,255,0.85)" }}
      >
        {isSfxEnabled ? <Volume2 className="w-5 h-5" /> : <VolumeX className="w-5 h-5" />}
      </button>
    </div>
  );
};
