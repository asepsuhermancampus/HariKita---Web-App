"use client";
import React from 'react';
import { STUDIO_SECTIONS, canReorderSection } from '@/lib/invitation-studio/sections';
import type { InvitationStudioDocument, StudioSectionId } from '@/lib/invitation-studio/types';
import type { StudioEdit } from '@/lib/invitation-studio/editor';

export function SectionNavigator({ document, active, onSelect, onEdit, disabled }: { document: InvitationStudioDocument; active: StudioSectionId; onSelect: (id: StudioSectionId) => void; onEdit: (edit: StudioEdit) => void; disabled: boolean }) {
  return <nav aria-label="Section undangan" className="space-y-2"><h2 className="font-bold">Sections</h2>{document.sectionOrder.map((id, index) => {
    const section = document.sections.find(s => s.id === id)!;
    return <div key={id} className={`rounded-lg border p-2 ${active === id ? 'border-[#C5A880] bg-[#F3EDE6]' : 'border-hk-soft-beige'}`}>
      <button className="min-h-11 w-full text-left text-sm" aria-current={active === id ? 'true' : undefined} onClick={() => onSelect(id)}>{STUDIO_SECTIONS.find(s => s.id === id)?.label}{!canReorderSection(id) && ' · Tetap'}</button>
      <div className="flex flex-wrap items-center gap-1">
        <label className="flex min-h-11 items-center gap-2 text-xs"><input type="checkbox" checked={section.enabled} disabled={disabled || !canReorderSection(id)} onChange={e => onEdit({ type: 'section-enabled', section: id, enabled: e.target.checked })} />Aktif</label>
        <button aria-label={`Naik ${id}`} className="min-h-11 min-w-11 rounded border" disabled={disabled || index <= 1 || !canReorderSection(id)} onClick={() => onEdit({ type: 'section-move', section: id, offset: -1 })}>↑</button>
        <button aria-label={`Turun ${id}`} className="min-h-11 min-w-11 rounded border" disabled={disabled || index >= 14 || !canReorderSection(id)} onClick={() => onEdit({ type: 'section-move', section: id, offset: 1 })}>↓</button>
      </div>
    </div>;
  })}</nav>;
}
