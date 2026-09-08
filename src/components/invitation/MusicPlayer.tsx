"use client";

import React, { useState, useEffect, useRef } from "react";
import { Disc3, Volume2, VolumeX } from "lucide-react";

interface MusicPlayerProps {
  audioUrl: string;
  autoPlayTriggered?: boolean;
}

export const MusicPlayer: React.FC<MusicPlayerProps> = ({ audioUrl, autoPlayTriggered = false }) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    if (autoPlayTriggered && audioRef.current) {
      audioRef.current
        .play()
        .then(() => setIsPlaying(true))
        .catch(() => {
          // Autoplay blocked by browser policy, will play on manual tap
          setIsPlaying(false);
        });
    }
  }, [autoPlayTriggered]);

  const togglePlay = () => {
    if (!audioRef.current) return;
    if (isPlaying) {
      audioRef.current.pause();
      setIsPlaying(false);
    } else {
      audioRef.current
        .play()
        .then(() => setIsPlaying(true))
        .catch(() => setIsPlaying(false));
    }
  };

  return (
    <>
      <audio ref={audioRef} src={audioUrl} loop preload="auto" />
      <div className="fixed bottom-6 right-6 z-40 flex items-center gap-2">
        <button
          onClick={togglePlay}
          className={`relative p-3 rounded-full shadow-2xl backdrop-blur-md border border-gold/40 transition-transform active:scale-95 ${
            isPlaying ? "gold-gradient-bg text-plum-dark" : "bg-white/80 text-plum-light"
          }`}
          aria-label={isPlaying ? "Jeda Musik" : "Putar Musik"}
          title={isPlaying ? "Jeda Musik" : "Putar Musik"}
        >
          <Disc3 className={`w-6 h-6 ${isPlaying ? "animate-spin-slow text-plum-dark" : ""}`} />
          <div className="absolute -top-1 -right-1 p-1 rounded-full bg-plum text-white text-[10px]">
            {isPlaying ? <Volume2 className="w-2.5 h-2.5" /> : <VolumeX className="w-2.5 h-2.5" />}
          </div>
        </button>
      </div>
    </>
  );
};
