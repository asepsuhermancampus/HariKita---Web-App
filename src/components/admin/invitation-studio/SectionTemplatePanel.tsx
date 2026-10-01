"use client";

import React, { useMemo, useState } from "react";
import { LayoutTemplate, ChevronDown, ChevronUp, Plus, Info, Sparkles, Shapes, Search, X } from "lucide-react";
import { getTemplatesForSection, searchTemplates, type SectionTemplate } from "@/lib/invitation-studio/section-templates";
import { SECTION_SNIPPETS, type SectionSnippet } from "@/lib/invitation-studio/section-snippets";
import type { StudioSectionId, StudioNode } from "@/lib/invitation-studio/types";
import type { StudioEdit } from "@/lib/invitation-studio/editor";

const SNIPPET_CATEGORIES: { id: SectionSnippet['category'] | 'all'; label: string }[] = [
  { id: 'all', label: 'Semua' },
  { id: 'photo', label: 'Foto' },
  { id: 'text', label: 'Teks' },
  { id: 'decoration', label: 'Dekorasi' },
  { id: 'shape', label: 'Bentuk' },
];

interface SectionTemplatePanelProps {
  sectionId: StudioSectionId;
  sectionLabel: string;
  onApply: (edits: StudioEdit[]) => void;
  disabled: boolean;
}

export function SectionTemplatePanel({
  sectionId,
  sectionLabel,
  onApply,
  disabled,
}: SectionTemplatePanelProps) {
  const templates = getTemplatesForSection(sectionId);
  const [expanded, setExpanded] = useState(true);
  const [hoveredId, setHoveredId] = useState<string | null>(null);
  const [applyingId, setApplyingId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'layout' | 'snippet'>('layout');
  const [search, setSearch] = useState('');
  const [snippetCategory, setSnippetCategory] = useState<SectionSnippet['category'] | 'all'>('all');

  // Filter template section ini berdasarkan kata kunci search
  const filteredTemplates = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return templates;
    return templates.filter(
      t => t.name.toLowerCase().includes(q) || t.description.toLowerCase().includes(q),
    );
  }, [templates, search]);

  // Id template yang lolos search di seluruh katalog (untuk badge hasil global)
  const globalMatchCount = useMemo(
    () => (search.trim() ? searchTemplates(search).length : 0),
    [search],
  );

  const filteredSnippets = useMemo(
    () => (snippetCategory === 'all'
      ? SECTION_SNIPPETS
      : SECTION_SNIPPETS.filter(s => s.category === snippetCategory)),
    [snippetCategory],
  );

  const handleApplySnippet = (snippet: SectionSnippet) => {
    if (disabled || applyingId) return;
    setApplyingId(snippet.id);
    const node: StudioNode = { ...snippet.node, id: crypto.randomUUID() } as StudioNode;
    const edits: StudioEdit[] = [{ type: "add" as const, section: sectionId, node }];
    onApply(edits);
    setTimeout(() => setApplyingId(null), 800);
  };

  if (templates.length === 0 && SECTION_SNIPPETS.length === 0) {
    return (
      <div className="rounded-xl border border-dashed border-hk-soft-beige bg-[#FAF8F5] p-4 text-center">
        <Info className="mx-auto mb-1.5 h-4 w-4 text-hk-taupe/60" />
        <p className="text-xs text-hk-taupe">Belum ada template untuk section ini.</p>
        <p className="mt-0.5 text-[10px] text-hk-taupe/60">Tambahkan elemen dari Katalog Aset.</p>
      </div>
    );
  }

  const handleApply = (template: SectionTemplate) => {
    if (disabled || applyingId) return;
    setApplyingId(template.id);
    const edits: StudioEdit[] = template.nodes.map((nodeDef) => {
      const node: StudioNode = { ...nodeDef, id: crypto.randomUUID() } as StudioNode;
      return { type: "add" as const, section: sectionId, node };
    });
    onApply(edits);
    setTimeout(() => setApplyingId(null), 800);
  };

  return (
    <div className="flex flex-col gap-2">
      <button
        type="button"
        onClick={() => setExpanded((v) => !v)}
        className="flex items-center justify-between gap-2 rounded-xl border border-hk-soft-beige bg-[#FAF8F5] px-3 py-2 text-left transition hover:border-[#C5A880]/60 hover:bg-[#F3EDE6]"
      >
        <div className="flex items-center gap-2">
          <Sparkles className="h-3.5 w-3.5 text-[#C5A880]" />
          <span className="text-xs font-bold text-hk-charcoal">Template {sectionLabel}</span>
          <span className="rounded-full bg-[#C5A880]/15 px-1.5 py-0.5 text-[10px] font-bold text-[#C5A880]">
            {templates.length}
          </span>
        </div>
        {expanded ? (
          <ChevronUp className="h-3.5 w-3.5 text-hk-taupe" />
        ) : (
          <ChevronDown className="h-3.5 w-3.5 text-hk-taupe" />
        )}
      </button>

      {expanded && (
        <div className="flex flex-col gap-2">
          {/* Tab Switcher */}
          <div className="flex gap-1 rounded-lg bg-[#FAF8F5] p-1 border border-hk-soft-beige">
            <button
              type="button"
              onClick={() => setActiveTab('layout')}
              className={`flex-1 flex items-center justify-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-bold transition ${
                activeTab === 'layout'
                  ? 'bg-white text-[#4A2E35] shadow-2xs'
                  : 'text-hk-taupe hover:text-hk-charcoal'
              }`}
            >
              <LayoutTemplate className="h-3 w-3" />
              <span>Layout Penuh</span>
              <span className="rounded-full bg-[#C5A880]/15 px-1.5 py-0.5 text-[10px] font-bold text-[#C5A880]">
                {templates.length}
              </span>
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('snippet')}
              className={`flex-1 flex items-center justify-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-bold transition ${
                activeTab === 'snippet'
                  ? 'bg-white text-[#4A2E35] shadow-2xs'
                  : 'text-hk-taupe hover:text-hk-charcoal'
              }`}
            >
              <Shapes className="h-3 w-3" />
              <span>Elemen Pengisi</span>
              <span className="rounded-full bg-[#C5A880]/15 px-1.5 py-0.5 text-[10px] font-bold text-[#C5A880]">
                {SECTION_SNIPPETS.length}
              </span>
            </button>
          </div>

          {/* Search Bar */}
          <div className="relative">
            <Search className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-hk-taupe" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Cari template..."
              className="h-9 w-full rounded-lg border border-hk-soft-beige bg-[#FAF8F5] pl-8 pr-8 text-xs text-hk-charcoal placeholder:text-hk-taupe/60 transition focus:border-[#C5A880] focus:bg-white focus:outline-none"
            />
            {search && (
              <button
                type="button"
                onClick={() => setSearch('')}
                className="absolute right-2 top-2 h-5 w-5 rounded-full flex items-center justify-center text-hk-taupe hover:text-hk-charcoal"
                title="Hapus pencarian"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            )}
          </div>

          {/* Tab Content: Layout Penuh */}
          {activeTab === 'layout' && (
            <div className="flex flex-col gap-2">
              {search.trim() && (
                <p className="px-1 text-[10px] text-hk-taupe/70">
                  {filteredTemplates.length > 0
                    ? `${filteredTemplates.length} template cocok di section ini`
                    : `Tidak ada di section ini — ${globalMatchCount} template cocok di section lain`}
                </p>
              )}
              {filteredTemplates.length === 0 ? (
                <div className="rounded-xl border border-dashed border-hk-soft-beige bg-[#FAF8F5] p-4 text-center">
                  <Search className="mx-auto mb-1.5 h-4 w-4 text-hk-taupe/60" />
                  <p className="text-xs text-hk-taupe">Tidak ada template yang cocok.</p>
                </div>
              ) : (
                filteredTemplates.map((template) => {
                const isHovered = hoveredId === template.id;
                const isApplying = applyingId === template.id;
                return (
                  <div
                    key={template.id}
                    onMouseEnter={() => setHoveredId(template.id)}
                    onMouseLeave={() => setHoveredId(null)}
                    className={`group relative overflow-hidden rounded-xl border transition-all duration-200 ${
                      isHovered
                        ? "border-[#C5A880] bg-[#F3EDE6] shadow-sm"
                        : "border-hk-soft-beige bg-white hover:border-[#C5A880]/60"
                    }`}
                  >
                    <div className="flex items-start gap-3 p-3">
                      <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-[#FAF8F5] text-2xl shadow-inner border border-hk-soft-beige">
                        {template.thumbnail}
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="text-xs font-bold text-hk-charcoal leading-tight">{template.name}</p>
                        <p className="mt-0.5 text-[10px] leading-snug text-hk-taupe line-clamp-2">{template.description}</p>
                        <div className="mt-1.5 flex items-center gap-1">
                          <LayoutTemplate className="h-3 w-3 text-hk-taupe/60" />
                          <span className="text-[10px] text-hk-taupe/70">{template.nodes.length} elemen siap edit</span>
                        </div>
                      </div>
                    </div>

                    <div className="border-t border-hk-soft-beige/60 bg-[#FAF8F5] px-3 py-2">
                      <button
                        type="button"
                        disabled={disabled || !!applyingId}
                        onClick={() => handleApply(template)}
                        className={`flex w-full items-center justify-center gap-1.5 rounded-lg px-3 py-1.5 text-[11px] font-bold transition-all ${
                          isApplying
                            ? "bg-emerald-100 text-emerald-700 border border-emerald-200"
                            : "bg-[#4A2E35] text-[#FAF8F5] hover:bg-[#382328] disabled:opacity-40"
                        }`}
                      >
                        {isApplying ? (
                          <>
                            <span className="animate-spin inline-block">+</span>
                            <span>Menerapkan...</span>
                          </>
                        ) : (
                          <>
                            <Plus className="h-3 w-3" />
                            <span>Terapkan Template</span>
                          </>
                        )}
                      </button>
                    </div>

                    {isHovered && (
                      <div className="absolute right-2 top-2">
                        <span className="rounded-full bg-[#C5A880] px-1.5 py-0.5 text-[9px] font-bold text-white shadow">
                          {template.nodes.length} node
                        </span>
                      </div>
                    )}
                  </div>
                );
              })
              )}
              <p className="px-1 text-[10px] text-hk-taupe/60 leading-snug">
                Template menambahkan elemen ke section. Semua teks, foto, dan data bisa diedit bebas setelahnya.
              </p>
            </div>
          )}

          {/* Tab Content: Elemen Pengisi */}
          {activeTab === 'snippet' && (
            <div className="flex flex-col gap-2">
              {/* Kategori Filter Pills */}
              <div className="flex gap-1 overflow-x-auto pb-0.5 scrollbar-thin">
                {SNIPPET_CATEGORIES.map((cat) => (
                  <button
                    key={cat.id}
                    type="button"
                    onClick={() => setSnippetCategory(cat.id)}
                    className={`shrink-0 rounded-full px-2.5 py-1 text-[10px] font-medium transition ${
                      snippetCategory === cat.id
                        ? 'bg-[#C5A880] text-white shadow-2xs'
                        : 'bg-[#FAF8F5] text-hk-taupe hover:bg-hk-soft-beige/60 hover:text-hk-charcoal'
                    }`}
                  >
                    {cat.label}
                  </button>
                ))}
              </div>
              {filteredSnippets.map((snippet) => {
                const isHovered = hoveredId === snippet.id;
                const isApplying = applyingId === snippet.id;
                return (
                  <div
                    key={snippet.id}
                    onMouseEnter={() => setHoveredId(snippet.id)}
                    onMouseLeave={() => setHoveredId(null)}
                    className={`group relative overflow-hidden rounded-xl border transition-all duration-200 ${
                      isHovered
                        ? "border-[#C5A880] bg-[#F3EDE6] shadow-sm"
                        : "border-hk-soft-beige bg-white hover:border-[#C5A880]/60"
                    }`}
                  >
                    <div className="flex items-center gap-3 p-3">
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-[#FAF8F5] text-xl shadow-inner border border-hk-soft-beige">
                        {snippet.thumbnail}
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="text-xs font-bold text-hk-charcoal leading-tight">{snippet.name}</p>
                        <span className="inline-block mt-0.5 rounded bg-[#C5A880]/15 px-1.5 py-0.5 text-[9px] font-medium text-[#88735B]">
                          {snippet.category}
                        </span>
                      </div>
                      <button
                        type="button"
                        disabled={disabled || !!applyingId}
                        onClick={() => handleApplySnippet(snippet)}
                        className={`shrink-0 flex items-center justify-center gap-1 rounded-lg px-2.5 py-1.5 text-[10px] font-bold transition-all ${
                          isApplying
                            ? "bg-emerald-100 text-emerald-700 border border-emerald-200"
                            : "bg-[#4A2E35] text-[#FAF8F5] hover:bg-[#382328] disabled:opacity-40"
                        }`}
                      >
                        {isApplying ? (
                          <span className="animate-spin inline-block">+</span>
                        ) : (
                          <Plus className="h-3 w-3" />
                        )}
                      </button>
                    </div>
                  </div>
                );
              })}
              <p className="px-1 text-[10px] text-hk-taupe/60 leading-snug">
                Elemen pengisi siap pakai untuk meracik layout Cover kustom. Klik + untuk tambahkan.
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}