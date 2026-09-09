"use client";

import React, { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { TEMPLATES_CATALOG } from "@/lib/templates/templatesCatalog";
import { INVITATION_THEMES } from "@/lib/templates/registry";
import { Palette, ChevronDown, Check, Search, X } from "lucide-react";

interface LiveThemeSwitcherToolbarProps {
  currentThemeId: string;
}

export const LiveThemeSwitcherToolbar: React.FC<LiveThemeSwitcherToolbarProps> = ({
  currentThemeId,
}) => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isOpen, setIsOpen] = useState(false);
  const [selectedArchetype, setSelectedArchetype] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState("");

  const allThemes = TEMPLATES_CATALOG.length > 0 ? TEMPLATES_CATALOG : INVITATION_THEMES;
  const currentTheme = allThemes.find((t) => t.id === currentThemeId) || allThemes[0];

  const handleSelectTheme = (themeId: string) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("theme", themeId);
    router.push(`?${params.toString()}`);
    setIsOpen(false);
  };

  const ARCHETYPE_TABS = [
    { id: "all", label: "Semua" },
    { id: "botanical", label: "Botanical" },
    { id: "javanese", label: "Javanese" },
    { id: "islamic", label: "Islamic" },
    { id: "minimalist", label: "Minimalist" },
    { id: "rose-gold", label: "Rose Gold" },
    { id: "rustic", label: "Rustic" },
    { id: "celestial", label: "Celestial" },
    { id: "cute-illustrated", label: "Cute" },
  ];

  const filteredThemes = allThemes.filter((t) => {
    const matchesArch = selectedArchetype === "all" || t.archetypeId === selectedArchetype;
    const matchesQuery =
      searchQuery === "" ||
      t.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.category.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesArch && matchesQuery;
  });

  return (
    <div className="fixed top-4 left-4 z-40 select-none">
      {/* Floating Pill Toggle Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-3.5 py-2 rounded-full bg-slate-950/85 backdrop-blur-xl border border-amber-400/40 text-amber-200 text-xs font-semibold shadow-xl shadow-black/80 hover:bg-slate-900 transition-all min-h-[44px]"
        title="Ganti Tema Undangan (64 Preset)"
        aria-label="Pilih Tema"
      >
        <Palette className="w-4 h-4 text-amber-300" />
        <span className="max-w-[120px] sm:max-w-[160px] truncate">{currentTheme?.title || "Pilih Tema"}</span>
        <ChevronDown className={`w-3.5 h-3.5 transition-transform ${isOpen ? "rotate-180" : ""}`} />
      </button>

      {/* Popover Modal for 64 Themes */}
      {isOpen && (
        <div className="mt-2 w-80 sm:w-96 bg-slate-950/95 backdrop-blur-2xl rounded-3xl shadow-2xl border border-amber-400/30 p-4 text-slate-100 animate-in fade-in zoom-in-95 duration-200 space-y-3 max-h-[75vh] flex flex-col">
          {/* Header */}
          <div className="flex items-center justify-between pb-2 border-b border-slate-800">
            <div className="flex items-center gap-1.5 text-xs font-bold text-amber-200">
              <Palette className="w-4 h-4 text-amber-300" />
              <span>Katalog 64 Template Undangan</span>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="p-1 rounded-full hover:bg-slate-800 text-slate-400"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Search Box */}
          <div className="relative">
            <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Cari tema, warna, atau gaya..."
              className="w-full pl-8 pr-3 py-1.5 rounded-xl bg-slate-900 border border-slate-700 text-xs text-white focus:outline-none focus:border-amber-400"
            />
          </div>

          {/* Archetype Filter Tabs */}
          <div className="flex gap-1 overflow-x-auto pb-1 scrollbar-none text-[11px]">
            {ARCHETYPE_TABS.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setSelectedArchetype(tab.id)}
                className={`px-2.5 py-1 rounded-full whitespace-nowrap transition-colors ${
                  selectedArchetype === tab.id
                    ? "bg-amber-400 text-slate-950 font-bold shadow"
                    : "bg-slate-900 text-slate-400 hover:text-white hover:bg-slate-800"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Theme List */}
          <div className="overflow-y-auto space-y-1.5 flex-1 pr-1">
            {filteredThemes.length === 0 ? (
              <p className="text-center text-xs text-slate-500 py-6">Tidak ada tema yang cocok.</p>
            ) : (
              filteredThemes.map((theme) => {
                const isActive = theme.id === currentThemeId;
                return (
                  <button
                    key={theme.id}
                    onClick={() => handleSelectTheme(theme.id)}
                    className={`w-full text-left p-2.5 rounded-xl text-xs flex items-center justify-between transition-all ${
                      isActive
                        ? "bg-amber-400/20 border border-amber-400/60 text-amber-200 font-bold"
                        : "hover:bg-slate-900 text-slate-300"
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <span
                        className="w-4 h-4 rounded-full shadow border border-white/20 shrink-0"
                        style={{ backgroundColor: theme.colors.primary }}
                      />
                      <div className="truncate">
                        <p className="leading-tight truncate">{theme.title}</p>
                        <span className="text-[10px] text-slate-400 font-normal">
                          {theme.archetypeId} &bull; {theme.sourceOrigin}
                        </span>
                      </div>
                    </div>
                    {isActive && <Check className="w-4 h-4 text-amber-300 shrink-0 ml-2" />}
                  </button>
                );
              })
            )}
          </div>
        </div>
      )}
    </div>
  );
};
