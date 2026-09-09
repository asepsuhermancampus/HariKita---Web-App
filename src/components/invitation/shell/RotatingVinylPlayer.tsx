"use client";

import React, { useState, useEffect, useRef } from "react";
import { Disc, Play, Pause, Volume2, VolumeX } from "lucide-react";

interface RotatingVinylPlayerProps {
  audioUrl?: string;
  isPlaying?: boolean;
  onTogglePlay?: () => void;
  albumCoverUrl?: string;
  songTitle?: string;
}

export const RotatingVinylPlayer: React.FC<RotatingVinylPlayerProps> = ({
  audioUrl = "https://cdn.pixabay.com/download/audio/2022/05/27/audio_1808fbf07a.mp3?filename=romantic-piano-112199.mp3",
  isPlaying: externalIsPlaying,
  onTogglePlay: externalOnTogglePlay,
  albumCoverUrl = "https://images.unsplash.com/photo-1519741497674-611481863552?q=80&w=200",
  songTitle = "Romantic Nuance",
}) => {
  const [internalPlaying, setInternalPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const playing = externalIsPlaying !== undefined ? externalIsPlaying : internalPlaying;

  useEffect(() => {
    if (!audioRef.current && typeof window !== "undefined") {
      audioRef.current = new Audio(audioUrl);
      audioRef.current.loop = true;
      audioRef.current.volume = 0.5;
    }

    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
    };
  }, [audioUrl]);

  useEffect(() => {
    if (audioRef.current) {
      if (playing) {
        audioRef.current.play().catch((err) => {
          console.warn("Audio autoplay blocked or failed:", err);
        });
      } else {
        audioRef.current.pause();
      }
    }
  }, [playing]);

  const handleToggle = () => {
    if (externalOnTogglePlay) {
      externalOnTogglePlay();
    } else {
      if (audioRef.current) {
        if (playing) {
          audioRef.current.pause();
          setInternalPlaying(false);
        } else {
          audioRef.current.play().catch((err) => console.warn(err));
          setInternalPlaying(true);
        }
      }
    }
  };

  const toggleMute = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (audioRef.current) {
      audioRef.current.muted = !isMuted;
      setIsMuted(!isMuted);
    }
  };

  return (
    <div
      className="fixed top-4 right-4 z-40 select-none flex items-center gap-2"
      aria-label="Pemutar Audio Piringan Hitam"
    >
      {/* Vinyl Disc Container */}
      <button
        onClick={handleToggle}
        className="group relative w-12 h-12 sm:w-14 sm:h-14 rounded-full flex items-center justify-center bg-slate-950 border-2 border-amber-300/60 shadow-xl shadow-black/80 hover:scale-105 active:scale-95 transition-transform"
        title={playing ? "Jeda Musik" : "Putar Musik"}
        aria-label={playing ? "Jeda Musik" : "Putar Musik"}
      >
        {/* Animated Soundwave Pulse Rings (when playing) */}
        {playing && (
          <span className="absolute inset-0 rounded-full border border-amber-400/40 animate-ping pointer-events-none" />
        )}

        {/* Vinyl Body with Grooves & Spinning Center */}
        <div
          className={`w-full h-full rounded-full flex items-center justify-center overflow-hidden transition-all ${
            playing ? "animate-spin" : ""
          }`}
          style={{
            animationDuration: "10s",
            background: "radial-gradient(circle, #333 10%, #111 60%, #000 100%)",
          }}
        >
          {/* Vinyl Grooves Texture */}
          <div className="absolute inset-1 rounded-full border border-white/10" />
          <div className="absolute inset-2.5 rounded-full border border-white/5" />

          {/* Mini Center Album Art */}
          <div
            className="w-5 h-5 sm:w-6 sm:h-6 rounded-full bg-cover bg-center border border-amber-300 relative z-10"
            style={{ backgroundImage: `url('${albumCoverUrl}')` }}
          />
        </div>

        {/* Center Play/Pause Overlay Icon on Hover */}
        <div className="absolute inset-0 rounded-full bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity text-white">
          {playing ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4 ml-0.5" />}
        </div>
      </button>

      {/* Mini Volume Mute Toggle */}
      <button
        onClick={toggleMute}
        className="w-8 h-8 rounded-full bg-slate-900/80 backdrop-blur-md border border-white/20 text-amber-200 flex items-center justify-center hover:bg-slate-800 transition-colors"
        title={isMuted ? "Bunyikan" : "Bisukan"}
      >
        {isMuted ? <VolumeX className="w-3.5 h-3.5" /> : <Volume2 className="w-3.5 h-3.5" />}
      </button>
    </div>
  );
};
