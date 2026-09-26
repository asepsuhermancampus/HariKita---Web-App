"use client";
import React from 'react';
import type { StudioSection } from '@/lib/invitation-studio/types';
import type { StudioEdit } from '@/lib/invitation-studio/editor';

export function LayerTree({ section, selection, onSelect, onEdit, disabled }: { section: StudioSection; selection: string | null; onSelect: (id: string) => void; onEdit: (edit: StudioEdit) => void; disabled: boolean }) {
  const button = 'min-h-11 min-w-11 rounded border px-2 text-xs disabled:opacity-40';
  return <section className="space-y-2"><h2 className="font-bold">Layers</h2>{!section.nodes.length && <p className="text-sm">Belum ada layer.</p>}{section.nodes.map((node, index) => <div key={node.id} className={`min-w-0 space-y-2 rounded border p-2 ${selection === node.id ? 'border-[#C5A880] bg-[#F3EDE6]' : ''}`}>
    <button className="flex min-h-11 w-full min-w-0 items-center gap-2 text-left text-sm" aria-pressed={selection === node.id} onClick={() => onSelect(node.id)}>{'src' in node.config ? <img src={node.config.src} alt="" className="h-10 w-10 object-contain" /> : <span aria-hidden="true">{node.kind === 'text' ? 'T' : '▤'}</span>}<span className="break-all">{node.name ?? node.kind}</span></button>
    <label className="block text-xs">Nama layer<input className="min-h-11 w-full min-w-0 rounded border p-2" value={node.name ?? node.kind} maxLength={100} disabled={disabled} onChange={e => { if (e.target.value.trim()) onEdit({ type: 'node', section: section.id, id: node.id, patch: { name: e.target.value } }); }} /></label>
    <div className="flex flex-wrap gap-1">
      <button className={button} disabled={disabled} onClick={() => onEdit({ type: 'node', section: section.id, id: node.id, patch: { locked: !node.locked } })}>{node.locked ? 'Buka kunci' : 'Kunci'}</button>
      <button className={button} disabled={disabled} onClick={() => onEdit({ type: 'node', section: section.id, id: node.id, patch: { visible: !node.visible } })}>{node.visible ? 'Sembunyikan' : 'Tampilkan'}</button>
      <button className={button} aria-label={`Naik layer ${node.name}`} disabled={disabled || index === 0} onClick={() => onEdit({ type: 'node-move', section: section.id, id: node.id, offset: -1 })}>↑</button>
      <button className={button} aria-label={`Turun layer ${node.name}`} disabled={disabled || index === section.nodes.length - 1} onClick={() => onEdit({ type: 'node-move', section: section.id, id: node.id, offset: 1 })}>↓</button>
      <button className={button} disabled={disabled} onClick={() => onEdit({ type: 'duplicate', section: section.id, id: node.id, newId: crypto.randomUUID() })}>Duplikat layer</button>
      <button className={button} disabled={disabled} onClick={() => onEdit({ type: 'delete', section: section.id, id: node.id })}>Hapus layer</button>
    </div>
  </div>)}</section>;
}
