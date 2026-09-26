"use client";
import React, { useRef, useState } from 'react';
import type { InvitationStudioDocument, StudioSectionId, StudioTransform } from '@/lib/invitation-studio/types';
import { resolveTransform, selectedStudioNode, type StudioDevice, type StudioEdit } from '@/lib/invitation-studio/editor';
import { gestureTransform, type StudioGesture } from '@/lib/invitation-studio/geometry';
import { StudioSceneRenderer } from './StudioSceneRenderer';

export function ResponsiveStudioCanvas({ document, active, selection, device, onDevice, onSelect, onEdit, disabled }: { document: InvitationStudioDocument; active: StudioSectionId; selection: string | null; device: StudioDevice; onDevice: (device: StudioDevice) => void; onSelect: (id: string | null) => void; onEdit: (edit: StudioEdit) => void; disabled: boolean }) {
  const frame = useRef<HTMLDivElement>(null);
  const gesture = useRef<{ id: string; pointer: number; x: number; y: number; width: number; height: number; start: StudioTransform; mode: StudioGesture; last: StudioTransform } | null>(null);
  const [transient, setTransient] = useState<{ id: string; transform: StudioTransform } | null>(null);
  const section = document.sections.find(s => s.id === active)!;
  const node = selectedStudioNode(document, active, selection);
  const display = transient ? { ...document, sections: document.sections.map(s => s.id !== active ? s : { ...s, nodes: s.nodes.map(n => n.id !== transient.id ? n : { ...n, [device === 'mobile' ? 'transform' : 'desktopTransform']: transient.transform }) }) } : document;
  const start = (event: React.PointerEvent<HTMLElement>, id: string, mode: StudioGesture) => {
    if (disabled || event.button !== 0) return;
    const target = section.nodes.find(n => n.id === id)!;
    onSelect(id);
    if (target.locked) return;
    event.preventDefault(); event.stopPropagation();
    const rect = frame.current!.getBoundingClientRect(), t = resolveTransform(target, device);
    event.currentTarget.setPointerCapture(event.pointerId);
    gesture.current = { id, pointer: event.pointerId, x: event.clientX, y: event.clientY, width: rect.width, height: rect.height, start: t, mode, last: t };
  };
  const move = (event: React.PointerEvent) => {
    const g = gesture.current; if (!g || g.pointer !== event.pointerId) return;
    g.last = gestureTransform(g.start, g.mode, event.clientX - g.x, event.clientY - g.y, g.width, g.height);
    setTransient({ id: g.id, transform: g.last });
  };
  const finish = (cancel = false) => {
    const g = gesture.current; gesture.current = null; setTransient(null);
    if (g && !cancel && JSON.stringify(g.start) !== JSON.stringify(g.last)) onEdit({ type: 'transform', section: active, id: g.id, device, patch: g.last });
  };
  return <section className="min-w-0 space-y-3 rounded-2xl border border-hk-soft-beige bg-[#F3EDE6] p-3" aria-label="Canvas editor">
    <div className="flex flex-wrap gap-2">{(['mobile', 'desktop'] as const).map(d => <button key={d} className="min-h-11 rounded border bg-white px-3" aria-pressed={device === d} onClick={() => { finish(true); onDevice(d); }}>{d === 'mobile' ? 'Mobile 375' : 'Desktop'}</button>)}<span className="self-center text-xs">{active}{!section.enabled && ' · Nonaktif di preview'}</span></div>
    <p className="text-xs">Pilih layer lalu geser. Resize dan rotasi melalui handle; angka di Inspector memakai aturan yang sama.</p>
    <div ref={frame} className="relative mx-auto w-full bg-white" style={{ maxWidth: device === 'mobile' ? 375 : 1024, height: 640, overflow: 'clip' }} onPointerMove={move} onPointerUp={() => finish()} onPointerCancel={() => finish(true)} onLostPointerCapture={() => { if (gesture.current) finish(true); }}>
      <StudioSceneRenderer document={display} device={device} activeSection={active} editor />
      <div className="pointer-events-none absolute inset-0 border border-dashed border-[#C5A880]" aria-hidden="true" />
      {section.nodes.filter(n => n.visible).map(n => {
        const t = transient?.id === n.id ? transient.transform : resolveTransform(n, device);
        return <button key={n.id} aria-label={`Pilih ${n.name ?? n.kind}`} aria-pressed={selection === n.id} onClick={() => onSelect(n.id)} onPointerDown={e => start(e, n.id, 'drag')} className="absolute min-h-11 min-w-11 touch-none bg-transparent" style={{ left: `${t.x}%`, top: `${t.y}%`, width: `${t.width}%`, height: `${t.height}%`, transform: `rotate(${t.rotation}deg)`, border: selection === n.id ? '2px solid #C5A880' : '1px dashed #C5A88066', zIndex: 10 }} />;
      })}
    </div>
    {node && <div className="flex flex-wrap gap-2"><button disabled={disabled || node.locked} className="min-h-11 min-w-11 touch-none rounded border bg-white px-3" onPointerDown={e => start(e, node.id, 'resize')} onPointerMove={move} onPointerUp={() => finish()} onPointerCancel={() => finish(true)}>Resize ↔</button><button disabled={disabled || node.locked} className="min-h-11 touch-none rounded border bg-white px-3" onPointerDown={e => start(e, node.id, 'rotate')} onPointerMove={move} onPointerUp={() => finish()} onPointerCancel={() => finish(true)}>Rotate ↻</button>{(['flipX', 'flipY'] as const).map(key => <button key={key} disabled={disabled || node.locked} className="min-h-11 rounded border bg-white px-3" onClick={() => onEdit({ type: 'transform', section: active, id: node.id, device, patch: { [key]: !resolveTransform(node, device)[key] } })}>{key}</button>)}</div>}
  </section>;
}
