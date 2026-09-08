"use client";

import React, { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { INVITATION_THEMES, MASTER_ARCHETYPES } from "@/lib/templates/registry";
import { Sparkles, Palette, Layers, ChevronDown, Check } from "lucide-react";

interface LiveThemeSwitcherToolbarProps {
  currentThemeId: string;
}

export const LiveThemeSwitcherToolbar: React.FC<LiveThemeSwitcherToolbarProps> = ({
  currentThemeId,
}) => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isOpen, setIsOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string>("Semua");

  const currentTheme = INVITATION_THEMES.find((t) => t.id === currentThemeId) || INVITATION_THEMES[0];

  const handleSelectTheme = (themeId: string) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("theme", themeId);
    router.push(`?${params.toString()}`);
    setIsOpen(false);
  };

  const categories = ["Semua", ...Array.from(new Set(INVITATION_THEMES.map((t) => t.category)))];

  const filteredThemes = selectedCategory === "Semua"
    ? INVITATION_THEMES
    : INVITATION_THEMES.filter((t) => t.category === selectedCategory);

  return (
    <div className="fixed bottom-4 left-1/2 -translate-x-1/2 z-40 w-auto max-w-[95vw]">
      {/* Popover Menu for 65+ Themes */}
      {isOpen && (
        <div className="mb-3 w-80 sm:w-96 bg-white/95 backdrop-blur-xl rounded-3xl shadow-2xl border border-neutral-200 p-4 text-neutral-800 animate-fadeIn space-y-3 max-h-[70vh] flex flex-col">
          <div className="flex items-center justify-between pb-2 border-b border-neutral-100">
            <div className="flex items-center gap-1.5 text-xs font-bold text-plum">
              <Palette className="w-4 h-4 text-gold-dark" />
              <span>Pilih Dari 65+ Tema Undangan</span>
            </div>
            <span className="text-[10px] text-neutral-400 font-sans">
              {filteredThemes.length} Tema
            </span>
          </div>

          {/* Category Tabs */}
          <div className="flex gap-1 overflow-x-auto pb-1 scrollbar-none text-[11px]">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-2.5 py-1 rounded-full whitespace-nowrap transition-colors ${
                  selectedCategory === cat
                    ? "bg-plum text-white font-bold"
                    : "bg-neutral-100 text-neutral-600 hover:bg-neutral-200"
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* Theme List */}
          <div className="overflow-y-auto space-y-1.5 flex-1 pr-1">
            {filteredThemes.map((theme) => {
              const isActive = theme.id === currentThemeId;
              return (
                <button
                  key={theme.id}
                  onClick={() => handleSelectTheme(theme.id)}
                  className={`w-full text-left p-2.5 rounded-xl text-xs flex items-center justify-between transition-all ${
                    isActive
                      ? "bg-plum/10 border border-plum text-plum font-bold"
                      : "hover:bg-neutral-100 text-neutral-700"
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <span
                      className="w-3.5 h-3.5 rounded-full shadow-sm"
                      style={{ backgroundColor: theme.colors.primary }}
                    />
                    <div>
                      <p className="leading-tight">{theme.title}</p>
                      <span className="text-[10px] text-neutral-400 font-normal">
                        {theme.category} &bull; {theme.sourceOrigin}
                      </span>
                    </div>
                  </div>
                  {isActive && <Check className="w-4 h-4 text-plum" />}
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Floating Pill Trigger Bar */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="px-4 py-2.5 rounded-full bg-plum/90 backdrop-blur-md text-white border border-white/20 shadow-xl flex items-center gap-2.5 text-xs font-medium hover:bg-plum active:scale-95 transition-all"
        style={{
          boxShadow: "0 8px 30px rgba(38, 31, 35, 0.35)",
        }}
      >
        <span
          className="w-2.5 h-2.5 rounded-full animate-ping"
          style={{ backgroundColor: currentTheme.colors.primary }}
        />
        <div className="flex items-center gap-1">
          <span className="text-neutral-300">Tema:</span>
          <strong className="text-white font-bold">{currentTheme.title}</strong>
          <span className="text-[10px] px-1.5 py-0.5 rounded-md bg-white/20 text-gold-light ml-1 font-normal">
            {currentTheme.category}
          </span>
        </div>
        <ChevronDown className={`w-3.5 h-3.5 transition-transform ${isOpen ? "rotate-180" : ""}`} />
      </button>
    </div>
  );
};
