"use client";

import React, { useEffect, useState } from "react";
import { Home, Users, Calendar, BookOpen, Image as ImageIcon, Gift, MessageSquare } from "lucide-react";

interface InvitationBottomDockProps {
  activeSection?: string;
  onNavigate?: (sectionId: string) => void;
  isVisible?: boolean;
}

interface DockItem {
  id: string;
  label: string;
  icon: React.FC<{ className?: string }>;
}

const DOCK_ITEMS: DockItem[] = [
  { id: "hero", label: "Sampul", icon: Home },
  { id: "couple", label: "Mempelai", icon: Users },
  { id: "event", label: "Acara", icon: Calendar },
  { id: "story", label: "Kisah", icon: BookOpen },
  { id: "gallery", label: "Galeri", icon: ImageIcon },
  { id: "gift", label: "Kado", icon: Gift },
  { id: "rsvp", label: "Ucapan", icon: MessageSquare },
];

export const InvitationBottomDock: React.FC<InvitationBottomDockProps> = ({
  activeSection = "hero",
  onNavigate,
  isVisible = true,
}) => {
  const [currentSection, setCurrentSection] = useState(activeSection);

  useEffect(() => {
    setCurrentSection(activeSection);
  }, [activeSection]);

  // Scroll spy detection
  useEffect(() => {
    const handleScroll = () => {
      const sectionElements = DOCK_ITEMS.map((item) => document.getElementById(item.id));
      const scrollPosition = window.scrollY + window.innerHeight / 3;

      for (let i = sectionElements.length - 1; i >= 0; i--) {
        const el = sectionElements[i];
        if (el && el.offsetTop <= scrollPosition) {
          setCurrentSection(DOCK_ITEMS[i].id);
          break;
        }
      }
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  if (!isVisible) return null;

  const handleItemClick = (id: string) => {
    setCurrentSection(id);
    if (onNavigate) {
      onNavigate(id);
    } else {
      const element = document.getElementById(id);
      if (element) {
        element.scrollIntoView({ behavior: "smooth" });
      }
    }
  };

  return (
    <nav
      aria-label="Navigasi Undangan"
      className="fixed bottom-4 sm:bottom-6 left-1/2 -translate-x-1/2 z-40 max-w-[95vw] w-auto transition-all duration-300"
    >
      <div className="flex items-center gap-1 sm:gap-2 px-3 sm:px-4 py-2 rounded-full bg-slate-950/80 backdrop-blur-xl border border-white/20 shadow-2xl shadow-black/80 pb-[env(safe-area-inset-bottom,8px)]">
        {DOCK_ITEMS.map((item) => {
          const Icon = item.icon;
          const isActive = currentSection === item.id;

          return (
            <button
              key={item.id}
              onClick={() => handleItemClick(item.id)}
              className={`flex flex-col items-center justify-center p-2 rounded-full transition-all min-w-[40px] sm:min-w-[44px] min-h-[40px] sm:min-h-[44px] ${
                isActive
                  ? "bg-amber-400 text-slate-950 shadow-md shadow-amber-400/40 scale-105"
                  : "text-white/70 hover:text-white hover:bg-white/10 active:scale-95"
              }`}
              title={item.label}
              aria-label={item.label}
            >
              <Icon className="w-4 h-4 sm:w-4.5 sm:h-4.5" />
              <span className="text-[9px] font-medium tracking-tight mt-0.5 hidden xs:inline">
                {item.label}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
};
