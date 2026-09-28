"use client";

import React, { useState } from "react";
import { LayoutTemplate, ChevronDown, ChevronUp, Plus, Info, Sparkles } from "lucide-react";
import { getTemplatesForSection, type SectionTemplate } from "@/lib/invitation-studio/section-templates";
import type { StudioSectionId, StudioNode } from "@/lib/invitation-studio/types";
import type { StudioEdit } from "@/lib/invitation-studio/editor";

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

  if (templates.length === 0) {
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
          {templates.map((template) => {
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
          })}
          <p className="px-1 text-[10px] text-hk-taupe/60 leading-snug">
            Template menambahkan elemen ke section. Semua teks, foto, dan data bisa diedit bebas setelahnya.
          </p>
        </div>
      )}
    </div>
  );
}