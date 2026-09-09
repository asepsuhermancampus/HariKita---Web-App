"use client";

import React, { useState, useEffect, useRef } from "react";
import { ArrowDownCircle, PauseCircle } from "lucide-react";

interface AutoScrollButtonProps {
  isAutoScrolling?: boolean;
  onToggleAutoScroll?: () => void;
  isVisible?: boolean;
}

export const AutoScrollButton: React.FC<AutoScrollButtonProps> = ({
  isAutoScrolling: externalIsScrolling,
  onToggleAutoScroll: externalOnToggle,
  isVisible = true,
}) => {
  const [internalScrolling, setInternalScrolling] = useState(false);
  const animFrameRef = useRef<number | null>(null);

  const isScrolling = externalIsScrolling !== undefined ? externalIsScrolling : internalScrolling;

  const stopAutoScroll = () => {
    if (animFrameRef.current) {
      cancelAnimationFrame(animFrameRef.current);
      animFrameRef.current = null;
    }
    if (externalOnToggle && isScrolling) {
      externalOnToggle();
    } else {
      setInternalScrolling(false);
    }
  };

  const startAutoScroll = () => {
    const scrollStep = () => {
      const maxScroll = document.documentElement.scrollHeight - window.innerHeight;
      if (window.scrollY < maxScroll) {
        window.scrollBy(0, 1.5);
        animFrameRef.current = requestAnimationFrame(scrollStep);
      } else {
        stopAutoScroll();
      }
    };
    animFrameRef.current = requestAnimationFrame(scrollStep);
    if (externalOnToggle && !isScrolling) {
      externalOnToggle();
    } else {
      setInternalScrolling(true);
    }
  };

  // User manual intervention pauses auto scroll
  useEffect(() => {
    const handleUserInteraction = () => {
      if (isScrolling) {
        stopAutoScroll();
      }
    };

    window.addEventListener("wheel", handleUserInteraction, { passive: true });
    window.addEventListener("touchstart", handleUserInteraction, { passive: true });
    return () => {
      window.removeEventListener("wheel", handleUserInteraction);
      window.removeEventListener("touchstart", handleUserInteraction);
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
    };
  }, [isScrolling]);

  if (!isVisible) return null;

  const handleToggle = () => {
    if (isScrolling) {
      stopAutoScroll();
    } else {
      startAutoScroll();
    }
  };

  return (
    <div className="fixed bottom-24 left-4 z-40 select-none">
      <button
        onClick={handleToggle}
        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium shadow-lg backdrop-blur-md transition-all border min-h-[44px] ${
          isScrolling
            ? "bg-amber-400 text-slate-950 border-amber-300 shadow-amber-400/40 animate-pulse"
            : "bg-slate-950/80 text-white/80 border-white/20 hover:text-white hover:bg-slate-900"
        }`}
        title={isScrolling ? "Jeda Gulir Otomatis" : "Mulai Gulir Otomatis"}
        aria-label="Gulir Otomatis"
      >
        {isScrolling ? (
          <>
            <PauseCircle className="w-4 h-4 text-slate-950" />
            <span>Jeda Scroll</span>
          </>
        ) : (
          <>
            <ArrowDownCircle className="w-4 h-4 text-amber-300" />
            <span>Auto Scroll</span>
          </>
        )}
      </button>
    </div>
  );
};
