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

      {/* Node Details or Empty Notice */}
      {!node || !t ? (
        <div className="flex-1 flex flex-col justify-center rounded-xl border border-dashed border-hk-soft-beige bg-white p-6 text-center">
          <p className="text-xs font-semibold text-hk-charcoal">Pilih elemen untuk mengedit</p>
          <p className="mt-1 text-[11px] text-hk-taupe/70">Klik salah satu asset di canvas atau dari daftar Layers di samping.</p>
        </div>
      ) : (
        <fieldset disabled={disabled} className="min-w-0 flex-1 min-h-0 space-y-3 overflow-y-auto pr-1">
          {/* Card 1: Animasi & Gerakan Interaktif (Ditekankan di Posisi Utama) */}
          <div className="rounded-xl border-2 border-[#C5A880]/50 bg-gradient-to-b from-[#FAF8F5] to-white p-3.5 space-y-3 shadow-2xs">
            <div className="flex items-center justify-between">
              <span className="flex items-center gap-1.5 text-xs font-bold text-[#4A2E35]">
                <Sparkles className="h-4 w-4 text-[#C5A880] animate-pulse" />
                <span>Efek Gerak & Animasi Estetis</span>
              </span>
              <span className="rounded bg-[#F3EDE6] px-1.5 py-0.5 text-[9px] font-bold text-[#88735B]">
                {node.animation.preset === 'none' ? 'Static' : 'Active Motion'}
              </span>
            </div>

            <div>
              <label className={labelClass}>Pilihan Gerakan</label>
              <select 
                className={fieldClass} 
                value={node.animation.preset} 
                onChange={e => patch({ animation: { ...node.animation, preset: e.target.value as StudioAnimationPreset } })}
              >
                <option value="none">⚪ Tanpa Animasi (Diam)</option>
                <option value="float">🌸 Mengapung Lembut (Float) — Naik-turun halus</option>
                <option value="sway">🍃 Ayunan Anggun (Sway) — Bergoyang kiri-kanan</option>
                <option value="pulse">💓 Denyut Elegan (Pulse) — Mengembang lembut</option>
                <option value="drift">🌊 Melayang (Drift) — Geser perlahan mengikuti arah</option>
                <option value="reveal">✨ Sapuan Indah (Reveal) — Muncul menyapu lembut</option>
                <option value="entrance">🚀 Masuk Meluncur (Entrance) — Muncul dari luar</option>
                <option value="exit">🚪 Transisi Keluar (Exit)</option>
              </select>
            </div>

            {node.animation.preset !== 'none' && (
              <div className="space-y-2.5 pt-1 border-t border-hk-soft-beige/60">
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="text-[10px] font-bold text-hk-taupe uppercase tracking-wider block mb-1">
                      Durasi / Kecepatan
                    </label>
                    <select
                      className={fieldClass}
                      value={node.animation.durationMs}
                      onChange={e => patch({ animation: { ...node.animation, durationMs: Number(e.target.value) } })}
                    >
                      <option value={800}>Sangat Cepat (0.8s)</option>
                      <option value={1500}>Cepat (1.5s)</option>
                      <option value={2500}>Sedang & Anggun (2.5s)</option>
                      <option value={4000}>Lambat & Lembut (4.0s)</option>
                      <option value={6000}>Sangat Lambat (6.0s)</option>
                    </select>
                  </div>

                  <div>
                    <label className="text-[10px] font-bold text-hk-taupe uppercase tracking-wider block mb-1">
                      Pengulangan (Loop)
                    </label>
                    <select
                      className={fieldClass}
                      value={node.animation.repeat ?? 0}
                      onChange={e => patch({ animation: { ...node.animation, repeat: Number(e.target.value) } })}
                    >
                      <option value={20}>♾️ Berulang Terus (Maksimal)</option>
                      <option value={5}>Ulangi 5 Kali</option>
                      <option value={3}>Ulangi 3 Kali</option>
                      <option value={0}>Sekali Saja (No Loop)</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="text-[10px] font-bold text-hk-taupe uppercase tracking-wider block mb-1">
                      Pemicu Gerak
                    </label>
                    <select 
                      className={fieldClass} 
                      value={node.animation.trigger ?? 'visible'} 
                      onChange={e => patch({ animation: { ...node.animation, trigger: e.target.value as 'mount' | 'visible' } })}
                    >
                      <option value="visible">👁️ Saat Terlihat di Layar</option>
                      <option value="mount">⚡ Langsung Saat Halaman Dibuka</option>
                    </select>
                  </div>

                  <div>
                    <label className="text-[10px] font-bold text-hk-taupe uppercase tracking-wider block mb-1">
                      Arah Gerak
                    </label>
                    <select 
                      className={fieldClass} 
                      value={node.animation.direction ?? 'up'} 
                      onChange={e => patch({ animation: { ...node.animation, direction: e.target.value as 'up' | 'down' | 'left' | 'right' } })}
                    >
                      <option value="up">Ke Atas</option>
                      <option value="down">Ke Bawah</option>
                      <option value="left">Ke Kiri</option>
                      <option value="right">Ke Kanan</option>
                    </select>
                  </div>
                </div>

                <div>
                  <div className="flex items-center justify-between text-[11px] font-medium text-hk-taupe mb-1">
                    <span>Intensitas / Jangkauan Gerak</span>
                    <span className="font-bold text-hk-charcoal">{node.animation.intensity ?? 8}</span>
                  </div>
                  <input 
                    type="range" 
                    min={1} 
                    max={20} 
                    step={1} 
                    value={node.animation.intensity ?? 8} 
                    onChange={e => patch({ animation: { ...node.animation, intensity: Number(e.target.value) } })} 
                    className="w-full accent-[#C5A880]"
                  />
                  <div className="flex justify-between text-[9px] text-hk-taupe/60 px-0.5">
                    <span>Halus</span>
                    <span>Sedang</span>
                    <span>Kuat</span>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Card 2: Ukuran Asset (Width & Height) */}
          <div className="rounded-xl border border-hk-soft-beige bg-white p-3 space-y-3">
            <div className="flex items-center justify-between">
              <span className="flex items-center gap-1.5 text-xs font-bold text-hk-charcoal">
                <Move className="h-3.5 w-3.5 text-[#C5A880]" />
                <span>Ukuran Asset (Lebar & Tinggi)</span>
              </span>
              <p className="text-[10px] text-hk-taupe">
                {device === 'desktop' && !node.desktopTransform ? 'Mengikuti mobile' : 'Layout aktif'}
              </p>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="flex items-center justify-between text-[11px] font-medium text-hk-taupe mb-1">
                  <span>Lebar (Width)</span>
                  <span className="text-[10px] text-hk-taupe/70">%</span>
                </label>
                <input 
                  className={fieldClass} 
                  type="number" 
                  step="0.5" 
                  min={0.1} 
                  max={100} 
                  disabled={node.locked} 
                  value={t.width} 
                  onChange={e => { 
                    if (Number.isFinite(e.target.valueAsNumber)) {
                      onEdit({ type: 'transform', section: section.id, id: node.id, device, patch: { width: e.target.valueAsNumber } }); 
                    }
                  }} 
                />
              </div>

              <div>
                <label className="flex items-center justify-between text-[11px] font-medium text-hk-taupe mb-1">
                  <span>Tinggi (Height)</span>
                  <span className="text-[10px] text-hk-taupe/70">%</span>
                </label>
                <input 
                  className={fieldClass} 
                  type="number" 
                  step="0.5" 
                  min={0.1} 
                  max={100} 
                  disabled={node.locked} 
                  value={t.height} 
                  onChange={e => { 
                    if (Number.isFinite(e.target.valueAsNumber)) {
                      onEdit({ type: 'transform', section: section.id, id: node.id, device, patch: { height: e.target.valueAsNumber } }); 
                    }
                  }} 
                />
              </div>
            </div>

            <p className="text-[10px] text-hk-taupe/70">
              💡 Posisi (geser), rotasi (putar), dan pembalik (Flip X/Y) kini dapat dilakukan langsung pada asset di canvas.
            </p>

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

          {/* Card 3: Tampilan & Lapisan (Layer & Opacity) */}
          <div className="rounded-xl border border-hk-soft-beige bg-white p-3 space-y-3">
            <span className="flex items-center gap-1.5 text-xs font-bold text-hk-charcoal">
              <Eye className="h-3.5 w-3.5 text-[#C5A880]" />
              <span>Tampilan & Tumpukan Lapisan</span>
            </span>

            <div className="space-y-1">
              <div className="flex items-center justify-between text-[11px] font-medium text-hk-taupe">
                <span>Transparansi (Opacity)</span>
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

            <div>
              <label className={labelClass}>Urutan Tumpukan (Layer)</label>
              <select 
                className={fieldClass} 
                value={node.layer} 
                onChange={e => patch({ layer: e.target.value as StudioLayer })}
              >
                <option value="background">Latar Belakang Paling Bawah</option>
                <option value="behind-content">Di Belakang Teks / Konten</option>
                <option value="content">Sejajar Konten Utama</option>
                <option value="front-decoration">Di Depan / Hiasan Atas (Default)</option>
                <option value="component">Komponen Interaktif</option>
              </select>
              <p className="mt-1 text-[10px] text-hk-taupe/70">
                Mengatur apakah elemen hiasan berada di depan atau di belakang teks undangan.
              </p>
            </div>
          </div>

          {/* Card 4: Typography & Content Card (If text / component / image) */}
          {(node.kind === 'text' || node.kind === 'component' || 'src' in node.config) && (
            <div className="rounded-xl border border-hk-soft-beige bg-white p-3 space-y-3">
              <span className="flex items-center gap-1.5 text-xs font-bold text-hk-charcoal">
                <Type className="h-3.5 w-3.5 text-[#C5A880]" />
                <span>Konten & Format</span>
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
                  <label className={labelClass}>Penyesuaian Gambar (Fit)</label>
                  <select 
                    className={fieldClass} 
                    value={node.config.fit ?? 'contain'} 
                    onChange={e => config({ ...node.config, fit: e.target.value as 'contain' | 'cover' })}
                  >
                    <option value="contain">Proporsional Utuh (Contain)</option>
                    <option value="cover">Penuhi Area / Crop (Cover)</option>
                  </select>
                  <p className="mt-1 text-[10px] text-hk-taupe/70">
                    Contain mempertahankan rasio gambar utuh. Cover mengisi penuh tanpa celah.
                  </p>
                </div>
              )}
            </div>
          )}

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
