"use client";

import React from 'react';
import { STUDIO_SECTIONS, canReorderSection } from '@/lib/invitation-studio/sections';
import type { InvitationStudioDocument, StudioSectionId } from '@/lib/invitation-studio/types';
import type { StudioEdit } from '@/lib/invitation-studio/editor';
import { Lock, Eye, EyeOff, ChevronUp, ChevronDown, Layers } from 'lucide-react';

export function SectionNavigator({ 
  document, 
  active, 
  onSelect, 
  onEdit, 
  disabled 
}: { 
  document: InvitationStudioDocument; 
  active: StudioSectionId; 
  onSelect: (id: StudioSectionId) => void; 
  onEdit: (edit: StudioEdit) => void; 
  disabled: boolean; 
}) {
  const enabledCount = document.sections.filter(s => s.enabled).length;

  return (
    <nav aria-label="Section undangan" className="flex flex-col h-full min-h-0 space-y-2.5">
      <div className="shrink-0 flex items-center justify-between px-1">
        <div className="flex items-center gap-2">
          <Layers className="h-4 w-4 text-[#C5A880]" />
          <h2 className="text-sm font-bold text-hk-charcoal">Sections</h2>
        </div>
        <span className="rounded-full bg-[#FAF8F5] border border-hk-soft-beige px-2 py-0.5 text-[11px] font-bold text-hk-taupe">
          {enabledCount}/{document.sectionOrder.length} Aktif
        </span>
      </div>

      <div className="flex-1 min-h-0 space-y-1.5 overflow-y-auto pr-1">
        {document.sectionOrder.map((id, index) => {
          const section = document.sections.find(s => s.id === id)!;
          const labelInfo = STUDIO_SECTIONS.find(s => s.id === id);
          const isFixed = !canReorderSection(id);
          const isActive = active === id;

          return (
            <div 
              key={id} 
              className={`group flex items-center justify-between rounded-xl border p-2 text-left transition ${
                isActive 
                  ? 'border-[#C5A880] bg-[#F3EDE6] shadow-2xs ring-1 ring-[#C5A880]/40' 
                  : 'border-hk-soft-beige/80 bg-white hover:border-[#C5A880]/60 hover:bg-[#FAF8F5]'
              }`}
            >
              {/* Click to select section button */}
              <button 
                type="button"
                className="flex flex-1 min-w-0 items-center gap-2 text-left" 
                aria-current={isActive ? 'true' : undefined} 
                onClick={() => onSelect(id)}
              >
                <span className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-md text-[11px] font-bold ${
                  isActive ? 'bg-[#C5A880] text-white' : 'bg-[#FAF8F5] text-hk-taupe border border-hk-soft-beige/60'
                }`}>
                  {index + 1}
                </span>

                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-1">
                    <p className={`text-xs font-semibold leading-snug ${isActive ? 'text-[#4A2E35]' : 'text-hk-charcoal'}`}>
                      {labelInfo?.label ?? id}
                    </p>
                    {isFixed && (
                      <span title="Posisi tetap (Cover/Closing)" className="shrink-0 text-hk-taupe/70">
                        <Lock className="h-3 w-3" />
                        <span className="sr-only">· Tetap</span>
                      </span>
                    )}
                  </div>
                  <p className="text-[10px] text-hk-taupe">
                    {section.nodes.length} elemen {section.enabled ? '' : '· Nonaktif'}
                  </p>
                </div>
              </button>

              {/* Compact Section Controls (takes only ~68px, leaving ~220px for text) */}
              <div className="flex items-center gap-1 shrink-0 ml-1.5">
                <label 
                  className={`flex h-6 cursor-pointer items-center justify-center rounded-md px-1.5 text-[10px] font-bold transition ${
                    section.enabled 
                      ? 'bg-emerald-50 text-emerald-800 border border-emerald-200 hover:bg-emerald-100' 
                      : 'bg-stone-100 text-stone-500 border border-stone-200 hover:bg-stone-200'
                  }`}
                  title={section.enabled ? 'Section aktif (ditampilkan)' : 'Section nonaktif (disembunyikan)'}
                >
                  <input 
                    type="checkbox" 
                    checked={section.enabled} 
                    disabled={disabled || isFixed} 
                    onChange={e => onEdit({ type: 'section-enabled', section: id, enabled: e.target.checked })} 
                    className="sr-only"
                  />
                  {section.enabled ? (
                    <Eye className="h-3 w-3 mr-0.5 text-emerald-600" />
                  ) : (
                    <EyeOff className="h-3 w-3 mr-0.5 text-stone-400" />
                  )}
                  <span>Aktif</span>
                </label>

                {/* Move buttons preserving aria-labels */}
                <button 
                  type="button"
                  aria-label={`Naik ${id}`} 
                  title="Pindah ke atas"
                  className="flex h-6 w-6 items-center justify-center rounded-md border border-hk-soft-beige bg-white text-xs text-hk-charcoal transition hover:border-[#C5A880] hover:bg-[#FAF8F5] disabled:opacity-25" 
                  disabled={disabled || index <= 1 || isFixed} 
                  onClick={() => onEdit({ type: 'section-move', section: id, offset: -1 })}
                >
                  <ChevronUp className="h-3 w-3" />
                  <span className="sr-only">↑</span>
                </button>

                <button 
                  type="button"
                  aria-label={`Turun ${id}`} 
                  title="Pindah ke bawah"
                  className="flex h-6 w-6 items-center justify-center rounded-md border border-hk-soft-beige bg-white text-xs text-hk-charcoal transition hover:border-[#C5A880] hover:bg-[#FAF8F5] disabled:opacity-25" 
                  disabled={disabled || index >= 14 || isFixed} 
                  onClick={() => onEdit({ type: 'section-move', section: id, offset: 1 })}
                >
                  <ChevronDown className="h-3 w-3" />
                  <span className="sr-only">↓</span>
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </nav>
  );
}
