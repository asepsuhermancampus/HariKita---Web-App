"use client";
import React from 'react';
import { resolveTransform, type StudioDevice, type StudioEdit } from '@/lib/invitation-studio/editor';
import type { StudioNode, StudioSection, StudioLayer, StudioAnimationPreset } from '@/lib/invitation-studio/types';

export function PropertiesInspector({ node, section, device, onDevice, onEdit, disabled }: { node?: StudioNode; section: StudioSection; device: StudioDevice; onDevice: (device: StudioDevice) => void; onEdit: (edit: StudioEdit) => void; disabled: boolean }) {
  const field = 'min-h-11 w-full min-w-0 rounded border border-hk-soft-beige p-2';
  const patch = (value: Extract<StudioEdit, { type: 'node' }>['patch']) => node && onEdit({ type: 'node', section: section.id, id: node.id, patch: value });
  const config = (value: StudioNode['config']) => node && onEdit({ type: 'config', section: section.id, id: node.id, config: value });
  const t = node && resolveTransform(node, device);
  return <section className="space-y-3"><h2 className="font-bold">Inspector</h2>
    <label className="block text-sm">Layout<select className={field} value={device} onChange={e => onDevice(e.target.value as StudioDevice)}><option value="mobile">Mobile base</option><option value="desktop">Desktop override</option></select></label>
    <label className="block text-sm">Overflow section<select className={field} disabled={disabled} value={section.overflowPolicy} onChange={e => onEdit({ type: 'section-overflow', section: section.id, overflow: e.target.value as 'visible' | 'contained' })}><option value="contained">Contained</option><option value="visible">Lintas section</option></select></label>
    {!node || !t ? <p className="text-sm">Pilih layer untuk mengedit.</p> : <fieldset disabled={disabled} className="min-w-0 space-y-3">
      <p className="text-xs">{device === 'desktop' && !node.desktopTransform ? 'Mengikuti mobile' : 'Layout tersimpan'}{node.locked && ' · Transform terkunci'}</p>
      <div className="grid grid-cols-2 gap-2">{(['x', 'y', 'width', 'height', 'rotation'] as const).map(key => <label key={key} className="text-xs">{key}{key === 'rotation' ? ' °' : ' %'}<input className={field} type="number" step="0.1" min={key === 'rotation' ? -360 : key === 'width' || key === 'height' ? 0.1 : 0} max={key === 'rotation' ? 360 : 100} disabled={node.locked} value={t[key]} onChange={e => { if (Number.isFinite(e.target.valueAsNumber)) onEdit({ type: 'transform', section: section.id, id: node.id, device, patch: { [key]: e.target.valueAsNumber } }); }} /></label>)}</div>
      {(['flipX', 'flipY'] as const).map(key => <label key={key} className="flex min-h-11 items-center gap-2"><input type="checkbox" disabled={node.locked} checked={t[key]} onChange={e => onEdit({ type: 'transform', section: section.id, id: node.id, device, patch: { [key]: e.target.checked } })} />{key}</label>)}
      {device === 'desktop' && <button className={field} disabled={node.locked || !node.desktopTransform} onClick={() => onEdit({ type: 'inherit', section: section.id, id: node.id })}>Kembali mengikuti mobile</button>}
      <label className="block text-sm">Opacity<input className={field} type="number" min={0} max={100} value={node.appearance.opacity} onChange={e => { if (e.target.value !== '') patch({ appearance: { ...node.appearance, opacity: Math.min(100, Math.max(0, e.target.valueAsNumber)) } }); }} /></label>
      <label className="block text-sm">Layer<select className={field} value={node.layer} onChange={e => patch({ layer: e.target.value as StudioLayer })}>{['background', 'behind-content', 'content', 'front-decoration', 'component'].map(v => <option key={v}>{v}</option>)}</select></label>
      <label className="block text-sm">Overflow node<select className={field} value={node.appearance.overflow} onChange={e => patch({ appearance: { ...node.appearance, overflow: e.target.value as 'contained' | 'visible' } })}><option value="contained">Contained</option><option value="visible">Visible</option></select></label>
      <label className="block text-sm">Animation<select className={field} value={node.animation.preset} onChange={e => patch({ animation: { ...node.animation, preset: e.target.value as StudioAnimationPreset } })}>{['none', 'entrance', 'float', 'sway', 'pulse', 'drift', 'reveal', 'exit'].map(v => <option key={v}>{v}</option>)}</select></label>
      {(['durationMs', 'delayMs'] as const).map(key => <label key={key} className="block text-xs">{key}<input className={field} type="number" min={0} max={60000} value={node.animation[key]} onChange={e => { if (Number.isFinite(e.target.valueAsNumber)) patch({ animation: { ...node.animation, [key]: Math.min(60000, Math.max(0, e.target.valueAsNumber)) } }); }} /></label>)}
      {(['intensity', 'repeat'] as const).map(key => <label key={key} className="block text-xs">{key}<input className={field} type="number" min={0} max={20} step={1} value={node.animation[key] ?? (key === 'intensity' ? 8 : 0)} onChange={e => { if (Number.isFinite(e.target.valueAsNumber)) patch({ animation: { ...node.animation, [key]: Math.floor(Math.min(20, Math.max(0, e.target.valueAsNumber))) } }); }} /></label>)}
      <label className="block text-sm">Arah<select className={field} value={node.animation.direction ?? 'up'} onChange={e => patch({ animation: { ...node.animation, direction: e.target.value as 'up' | 'down' | 'left' | 'right' } })}>{['up', 'down', 'left', 'right'].map(v => <option key={v}>{v}</option>)}</select></label>
      <label className="block text-sm">Pemicu<select className={field} value={node.animation.trigger ?? 'mount'} onChange={e => patch({ animation: { ...node.animation, trigger: e.target.value as 'mount' | 'visible' } })}><option value="mount">Saat dimuat</option><option value="visible">Saat terlihat</option></select></label>
      <label className="block text-sm">Label aksesibilitas<input className={field} maxLength={200} value={node.accessibility.label} onChange={e => patch({ accessibility: { ...node.accessibility, label: e.target.value } })} /></label>
      {node.kind === 'text' && <>
        <label className="block text-sm">Teks<textarea className={field} maxLength={4000} value={node.config.text} onChange={e => config({ ...node.config, text: e.target.value })} /></label>
        <label className="block text-sm">Warna<input className={field} type="color" value={node.config.color ?? '#4A2E35'} onChange={e => config({ ...node.config, color: e.target.value })} /></label>
        <label className="block text-sm">Ukuran font<input className={field} type="number" min={8} max={160} value={node.config.fontSize ?? 28} onChange={e => { if (Number.isFinite(e.target.valueAsNumber)) config({ ...node.config, fontSize: Math.min(160, Math.max(8, e.target.valueAsNumber)) }); }} /></label>
        <label className="block text-sm">Perataan<select className={field} value={node.config.align ?? 'center'} onChange={e => config({ ...node.config, align: e.target.value as 'left' | 'center' | 'right' })}>{['left', 'center', 'right'].map(v => <option key={v}>{v}</option>)}</select></label>
      </>}
      {node.kind === 'component' && <label className="block text-sm">Judul blok<input className={field} maxLength={200} value={node.config.title} onChange={e => config({ ...node.config, title: e.target.value })} /></label>}
      {'src' in node.config && <label className="block text-sm">Fit<select className={field} value={node.config.fit ?? 'contain'} onChange={e => config({ ...node.config, fit: e.target.value as 'contain' | 'cover' })}><option>contain</option><option>cover</option></select></label>}
    </fieldset>}
  </section>;
}
