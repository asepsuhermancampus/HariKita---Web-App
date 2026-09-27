"use client";

import React from 'react';
import { resolveTransform, type StudioDevice, type StudioEdit } from '@/lib/invitation-studio/editor';
import type { StudioNode, StudioSection, StudioLayer, StudioAnimationPreset } from '@/lib/invitation-studio/types';
import { 
  Sliders, 
  Move, 
  Eye, 
  Sparkles, 
  Type, 
  Smartphone, 
  Monitor, 
  RotateCw, 
  Layers, 
  AlignLeft, 
  AlignCenter, 
  AlignRight, 
  Accessibility 
} from 'lucide-react';

const HARIKITA_SWATCHES = [
  { name: 'Deep Plum', hex: '#4A2E35' },
  { name: 'Gilded Gold', hex: '#C5A880' },
  { name: 'Cashmere Canvas', hex: '#FAF8F5' },
  { name: 'Warm Taupe', hex: '#88735B' },
  { name: 'Champagne', hex: '#C9A88A' },
  { name: 'Pure White', hex: '#FFFFFF' },
];

export function PropertiesInspector({ 
  node, 
  section, 
  device, 
  onDevice, 
  onEdit, 
  disabled 
}: { 
  node?: StudioNode; 
  section: StudioSection; 
  device: StudioDevice; 
  onDevice: (device: StudioDevice) => void; 
  onEdit: (edit: StudioEdit) => void; 
  disabled: boolean; 
}) {
  const fieldClass = 'h-9 w-full min-w-0 rounded-lg border border-hk-soft-beige bg-[#FAF8F5] px-2.5 text-xs text-hk-charcoal transition focus:border-[#C5A880] focus:bg-white focus:outline-none';
  const labelClass = 'text-[11px] font-bold text-hk-taupe uppercase tracking-wider block mb-1';

  const patch = (value: Extract<StudioEdit, { type: 'node' }>['patch']) => 
    node && onEdit({ type: 'node', section: section.id, id: node.id, patch: value });

  const config = (value: StudioNode['config']) => 
    node && onEdit({ type: 'config', section: section.id, id: node.id, config: value });

  const t = node && resolveTransform(node, device);

  return (
    <section className="flex flex-col h-full min-h-0 space-y-3">
      <div className="shrink-0 flex items-center justify-between px-1">
        <div className="flex items-center gap-2">
          <Sliders className="h-4 w-4 text-[#C5A880]" />
          <h2 className="text-sm font-bold text-hk-charcoal">Inspector</h2>
        </div>
        {node && (
          <span className="rounded-md bg-[#FAF8F5] border border-hk-soft-beige px-2 py-0.5 text-[10px] font-bold text-[#4A2E35]">
            {node.name ?? node.kind}
          </span>
        )}
      </div>

      {/* Global Section & Viewport Controls */}
      <div className="rounded-xl border border-hk-soft-beige bg-white p-3 space-y-3">
        <div>
          <label className={labelClass}>Layout</label>
          <div className="grid grid-cols-2 gap-1.5">
            <button
              type="button"
              onClick={() => onDevice('mobile')}
              className={`flex h-8 items-center justify-center gap-1.5 rounded-lg border text-xs font-semibold transition ${
                device === 'mobile'
                  ? 'border-[#C5A880] bg-[#F3EDE6] text-[#4A2E35]'
                  : 'border-hk-soft-beige bg-white text-hk-taupe hover:bg-[#FAF8F5]'
              }`}
            >
              <Smartphone className="h-3.5 w-3.5" />
              <span>Mobile base</span>
            </button>
            <button
              type="button"
              onClick={() => onDevice('desktop')}
              className={`flex h-8 items-center justify-center gap-1.5 rounded-lg border text-xs font-semibold transition ${
                device === 'desktop'
                  ? 'border-[#C5A880] bg-[#F3EDE6] text-[#4A2E35]'
                  : 'border-hk-soft-beige bg-white text-hk-taupe hover:bg-[#FAF8F5]'
              }`}
            >
              <Monitor className="h-3.5 w-3.5" />
              <span>Desktop override</span>
            </button>
          </div>
          {/* Keep hidden select for native fallback/compatibility if needed */}
          <select 
            className="sr-only" 
            value={device} 
            onChange={e => onDevice(e.target.value as StudioDevice)}
          >
            <option value="mobile">Mobile base</option>
            <option value="desktop">Desktop override</option>
          </select>
        </div>

        <div>
          <label className={labelClass}>Overflow section</label>
          <select 
            className={fieldClass} 
            disabled={disabled} 
            value={section.overflowPolicy} 
            onChange={e => onEdit({ type: 'section-overflow', section: section.id, overflow: e.target.value as 'visible' | 'contained' })}
          >
            <option value="contained">Contained</option>
            <option value="visible">Lintas section</option>
          </select>
        </div>
      </div>

      {/* Node Details or Empty Notice */}
      {!node || !t ? (
        <div className="flex-1 flex flex-col justify-center rounded-xl border border-dashed border-hk-soft-beige bg-white p-6 text-center">
          <p className="text-xs text-hk-taupe">Pilih layer untuk mengedit.</p>
          <p className="mt-1 text-[11px] text-hk-taupe/70">Klik salah satu elemen di canvas atau dari daftar Layers di samping.</p>
        </div>
      ) : (
        <fieldset disabled={disabled} className="min-w-0 flex-1 min-h-0 space-y-3 overflow-y-auto pr-1">
          {/* Transform & Geometry Card */}
          <div className="rounded-xl border border-hk-soft-beige bg-white p-3 space-y-3">
            <div className="flex items-center justify-between">
              <span className="flex items-center gap-1.5 text-xs font-bold text-hk-charcoal">
                <Move className="h-3.5 w-3.5 text-[#C5A880]" />
                <span>Posisi & Transformasi</span>
              </span>
              <p className="text-[10px] text-hk-taupe">
                {device === 'desktop' && !node.desktopTransform ? 'Mengikuti mobile' : 'Layout tersimpan'}
                {node.locked && ' · Transform terkunci'}
              </p>
            </div>

            <div className="grid grid-cols-2 gap-2">
              {(['x', 'y', 'width', 'height', 'rotation'] as const).map(key => (
                <div key={key} className={key === 'rotation' ? 'col-span-2' : ''}>
                  <label className="flex items-center justify-between text-[11px] font-medium text-hk-taupe mb-1">
                    <span className="uppercase">{key}</span>
                    <span className="text-[10px] text-hk-taupe/70">{key === 'rotation' ? '°' : '%'}</span>
                  </label>
                  <input 
                    className={fieldClass} 
                    type="number" 
                    step="0.1" 
                    min={key === 'rotation' ? -360 : key === 'width' || key === 'height' ? 0.1 : 0} 
                    max={key === 'rotation' ? 360 : 100} 
                    disabled={node.locked} 
                    value={t[key]} 
                    onChange={e => { 
                      if (Number.isFinite(e.target.valueAsNumber)) {
                        onEdit({ type: 'transform', section: section.id, id: node.id, device, patch: { [key]: e.target.valueAsNumber } }); 
                      }
                    }} 
                  />
                </div>
              ))}
            </div>

            <div className="flex items-center gap-3 pt-1 border-t border-hk-soft-beige/70">
              {(['flipX', 'flipY'] as const).map(key => (
                <label key={key} className="flex cursor-pointer items-center gap-2 text-xs font-medium text-hk-charcoal">
                  <input 
                    type="checkbox" 
                    disabled={node.locked} 
                    checked={t[key]} 
                    onChange={e => onEdit({ type: 'transform', section: section.id, id: node.id, device, patch: { [key]: e.target.checked } })}
                    className="rounded border-hk-soft-beige text-[#C5A880] focus:ring-[#C5A880]" 
                  />
                  <span>{key === 'flipX' ? 'Flip Horizontal (X)' : 'Flip Vertikal (Y)'}</span>
                </label>
              ))}
            </div>

            {device === 'desktop' && (
              <button 
                type="button"
                className="w-full rounded-lg border border-hk-soft-beige bg-[#FAF8F5] py-2 text-xs font-semibold text-hk-charcoal transition hover:bg-[#F3EDE6] disabled:opacity-40" 
                disabled={node.locked || !node.desktopTransform} 
                onClick={() => onEdit({ type: 'inherit', section: section.id, id: node.id })}
              >
                Kembali mengikuti mobile
              </button>
            )}
          </div>

          {/* Appearance & Layer Z-Order Card */}
          <div className="rounded-xl border border-hk-soft-beige bg-white p-3 space-y-3">
            <span className="flex items-center gap-1.5 text-xs font-bold text-hk-charcoal">
              <Eye className="h-3.5 w-3.5 text-[#C5A880]" />
              <span>Tampilan & Lapisan</span>
            </span>

            <div className="space-y-1">
              <div className="flex items-center justify-between text-[11px] font-medium text-hk-taupe">
                <span>Opacity</span>
                <span className="font-bold">{node.appearance.opacity}%</span>
              </div>
              <div className="flex items-center gap-2">
                <input 
                  type="range"
                  min={0}
                  max={100}
                  value={node.appearance.opacity}
                  onChange={e => {
                    const val = Number(e.target.value);
                    patch({ appearance: { ...node.appearance, opacity: Math.min(100, Math.max(0, val)) } });
                  }}
                  className="flex-1 accent-[#C5A880]"
                />
                <input 
                  className="h-8 w-14 rounded-lg border border-hk-soft-beige bg-[#FAF8F5] text-center text-xs" 
                  type="number" 
                  min={0} 
                  max={100} 
                  value={node.appearance.opacity} 
                  onChange={e => { 
                    if (e.target.value !== '') {
                      patch({ appearance: { ...node.appearance, opacity: Math.min(100, Math.max(0, e.target.valueAsNumber)) } }); 
                    }
                  }} 
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className={labelClass}>Layer</label>
                <select 
                  className={fieldClass} 
                  value={node.layer} 
                  onChange={e => patch({ layer: e.target.value as StudioLayer })}
                >
                  {['background', 'behind-content', 'content', 'front-decoration', 'component'].map(v => (
                    <option key={v} value={v}>{v}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className={labelClass}>Overflow node</label>
                <select 
                  className={fieldClass} 
                  value={node.appearance.overflow} 
                  onChange={e => patch({ appearance: { ...node.appearance, overflow: e.target.value as 'contained' | 'visible' } })}
                >
                  <option value="contained">Contained</option>
                  <option value="visible">Visible</option>
                </select>
              </div>
            </div>
          </div>

          {/* Typography & Content Card (If text / component / image) */}
          {(node.kind === 'text' || node.kind === 'component' || 'src' in node.config) && (
            <div className="rounded-xl border border-hk-soft-beige bg-white p-3 space-y-3">
              <span className="flex items-center gap-1.5 text-xs font-bold text-hk-charcoal">
                <Type className="h-3.5 w-3.5 text-[#C5A880]" />
                <span>Konten & Tipografi</span>
              </span>

              {node.kind === 'text' && (
                <>
                  <div>
                    <label className={labelClass}>Teks</label>
                    <textarea 
                      className="w-full min-h-[72px] rounded-lg border border-hk-soft-beige bg-[#FAF8F5] p-2 text-xs text-hk-charcoal transition focus:border-[#C5A880] focus:bg-white focus:outline-none" 
                      maxLength={4000} 
                      value={node.config.text} 
                      onChange={e => config({ ...node.config, text: e.target.value })} 
                    />
                  </div>

                  <div>
                    <label className={labelClass}>Warna</label>
                    <div className="flex items-center gap-2">
                      <div className="flex items-center gap-1">
                        {HARIKITA_SWATCHES.map(swatch => (
                          <button
                            key={swatch.hex}
                            type="button"
                            title={swatch.name}
                            onClick={() => config({ ...node.config, color: swatch.hex })}
                            className="h-6 w-6 rounded-full border border-hk-soft-beige shadow-2xs transition hover:scale-110"
                            style={{ backgroundColor: swatch.hex }}
                          />
                        ))}
                      </div>
                      <input 
                        type="color" 
                        value={node.config.color ?? '#4A2E35'} 
                        onChange={e => config({ ...node.config, color: e.target.value })} 
                        className="h-8 w-8 cursor-pointer rounded-lg border border-hk-soft-beige bg-transparent p-0.5"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className={labelClass}>Ukuran font</label>
                      <input 
                        className={fieldClass} 
                        type="number" 
                        min={8} 
                        max={160} 
                        value={node.config.fontSize ?? 28} 
                        onChange={e => { 
                          if (Number.isFinite(e.target.valueAsNumber)) {
                            config({ ...node.config, fontSize: Math.min(160, Math.max(8, e.target.valueAsNumber)) }); 
                          }
                        }} 
                      />
                    </div>

                    <div>
                      <label className={labelClass}>Perataan</label>
                      <select 
                        className={fieldClass} 
                        value={node.config.align ?? 'center'} 
                        onChange={e => config({ ...node.config, align: e.target.value as 'left' | 'center' | 'right' })}
                      >
                        {['left', 'center', 'right'].map(v => <option key={v} value={v}>{v}</option>)}
                      </select>
                    </div>
                  </div>
                </>
              )}

              {node.kind === 'component' && (
                <div>
                  <label className={labelClass}>Judul blok</label>
                  <input 
                    className={fieldClass} 
                    maxLength={200} 
                    value={node.config.title} 
                    onChange={e => config({ ...node.config, title: e.target.value })} 
                  />
                </div>
              )}

              {'src' in node.config && (
                <div>
                  <label className={labelClass}>Fit</label>
                  <select 
                    className={fieldClass} 
                    value={node.config.fit ?? 'contain'} 
                    onChange={e => config({ ...node.config, fit: e.target.value as 'contain' | 'cover' })}
                  >
                    <option value="contain">contain</option>
                    <option value="cover">cover</option>
                  </select>
                </div>
              )}
            </div>
          )}

          {/* Animation Card */}
          <div className="rounded-xl border border-hk-soft-beige bg-white p-3 space-y-3">
            <span className="flex items-center gap-1.5 text-xs font-bold text-hk-charcoal">
              <Sparkles className="h-3.5 w-3.5 text-[#C5A880]" />
              <span>Animasi & Interaksi</span>
            </span>

            <div>
              <label className={labelClass}>Animation</label>
              <select 
                className={fieldClass} 
                value={node.animation.preset} 
                onChange={e => patch({ animation: { ...node.animation, preset: e.target.value as StudioAnimationPreset } })}
              >
                {['none', 'entrance', 'float', 'sway', 'pulse', 'drift', 'reveal', 'exit'].map(v => (
                  <option key={v} value={v}>{v}</option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-2 gap-2">
              {(['durationMs', 'delayMs'] as const).map(key => (
                <div key={key}>
                  <label className="text-[10px] font-bold text-hk-taupe uppercase tracking-wider block mb-1">
                    {key === 'durationMs' ? 'Durasi (ms)' : 'Delay (ms)'}
                  </label>
                  <input 
                    className={fieldClass} 
                    type="number" 
                    min={0} 
                    max={60000} 
                    value={node.animation[key]} 
                    onChange={e => { 
                      if (Number.isFinite(e.target.valueAsNumber)) {
                        patch({ animation: { ...node.animation, [key]: Math.min(60000, Math.max(0, e.target.valueAsNumber)) } }); 
                      }
                    }} 
                  />
                </div>
              ))}
            </div>

            <div className="grid grid-cols-2 gap-2">
              {(['intensity', 'repeat'] as const).map(key => (
                <div key={key}>
                  <label className="text-[10px] font-bold text-hk-taupe uppercase tracking-wider block mb-1">
                    {key === 'intensity' ? 'Intensitas (1-20)' : 'Pengulangan'}
                  </label>
                  <input 
                    className={fieldClass} 
                    type="number" 
                    min={0} 
                    max={20} 
                    step={1} 
                    value={node.animation[key] ?? (key === 'intensity' ? 8 : 0)} 
                    onChange={e => { 
                      if (Number.isFinite(e.target.valueAsNumber)) {
                        patch({ animation: { ...node.animation, [key]: Math.floor(Math.min(20, Math.max(0, e.target.valueAsNumber))) } }); 
                      }
                    }} 
                  />
                </div>
              ))}
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className={labelClass}>Arah</label>
                <select 
                  className={fieldClass} 
                  value={node.animation.direction ?? 'up'} 
                  onChange={e => patch({ animation: { ...node.animation, direction: e.target.value as 'up' | 'down' | 'left' | 'right' } })}
                >
                  {['up', 'down', 'left', 'right'].map(v => <option key={v} value={v}>{v}</option>)}
                </select>
              </div>

              <div>
                <label className={labelClass}>Pemicu</label>
                <select 
                  className={fieldClass} 
                  value={node.animation.trigger ?? 'mount'} 
                  onChange={e => patch({ animation: { ...node.animation, trigger: e.target.value as 'mount' | 'visible' } })}
                >
                  <option value="mount">Saat dimuat</option>
                  <option value="visible">Saat terlihat</option>
                </select>
              </div>
            </div>
          </div>

          {/* Accessibility Card */}
          <div className="rounded-xl border border-hk-soft-beige bg-white p-3 space-y-2">
            <span className="flex items-center gap-1.5 text-xs font-bold text-hk-charcoal">
              <Accessibility className="h-3.5 w-3.5 text-[#C5A880]" />
              <span>Aksesibilitas</span>
            </span>
            <div>
              <label className={labelClass}>Label aksesibilitas</label>
              <input 
                className={fieldClass} 
                maxLength={200} 
                value={node.accessibility.label} 
                onChange={e => patch({ accessibility: { ...node.accessibility, label: e.target.value } })} 
                placeholder="Deskripsi pembaca layar (screen reader)..."
              />
            </div>
          </div>
        </fieldset>
      )}
    </section>
  );
}
