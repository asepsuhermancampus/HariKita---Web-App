"use client";

import React from 'react';
import { resolveTransform, type StudioDevice, type StudioEdit } from '@/lib/invitation-studio/editor';
import type { StudioNode, StudioSection, StudioLayer, StudioAnimationPreset, StudioAnimation } from '@/lib/invitation-studio/types';
import { 
  Sliders, 
  Move, 
  Eye, 
  Sparkles, 
  Type, 
  Accessibility,
  Play,
  Clock,
  ChevronDown,
  ChevronRight,
  Check
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
  const [previewKey, setPreviewKey] = React.useState(0);
  const [openEntrance, setOpenEntrance] = React.useState(true);
  const [openLoop, setOpenLoop] = React.useState(true);
  const [openExit, setOpenExit] = React.useState(false);

  // Modular Multi-Stage Animation States
  const anim: StudioAnimation = node?.animation ?? { preset: 'none', delayMs: 0, durationMs: 1500 };
  const entrance = anim.entrance ?? {
    enabled: anim.preset === 'entrance',
    durationMs: anim.preset === 'entrance' ? (anim.durationMs ?? 1500) : 1500,
    delayMs: anim.preset === 'entrance' ? (anim.delayMs ?? 0) : 0,
    direction: anim.preset === 'entrance' ? (anim.direction ?? 'up') : 'up',
    intensity: anim.preset === 'entrance' ? (anim.intensity ?? 0) : 0,
  };

  const loop = anim.loop ?? {
    preset: (['float', 'sway', 'pulse', 'drift'].includes(anim.preset) ? anim.preset as 'float' | 'sway' | 'pulse' | 'drift' : 'none'),
    durationMs: ['float', 'sway', 'pulse', 'drift'].includes(anim.preset) ? (anim.durationMs ?? 3000) : 3000,
    intensity: ['float', 'sway', 'pulse', 'drift'].includes(anim.preset) ? (anim.intensity ?? 8) : 8,
    repeat: anim.repeat ?? 0,
  };

  const exit = anim.exit ?? {
    enabled: anim.preset === 'exit',
    durationMs: anim.preset === 'exit' ? (anim.durationMs ?? 1500) : 1500,
    delayMs: anim.preset === 'exit' ? (anim.delayMs ?? 0) : 0,
    direction: anim.preset === 'exit' ? (anim.direction ?? 'up') : 'up',
    intensity: anim.preset === 'exit' ? (anim.intensity ?? 0) : 0,
  };

  const updateCompositeAnimation = (changes: {
    entrance?: Partial<typeof entrance>;
    loop?: Partial<typeof loop>;
    exit?: Partial<typeof exit>;
  }) => {
    if (!node) return;
    const nextEntrance = { ...entrance, ...(changes.entrance || {}) };
    const nextLoop = { ...loop, ...(changes.loop || {}) };
    const nextExit = { ...exit, ...(changes.exit || {}) };

    let nextPreset: StudioAnimationPreset = 'none';
    if (nextLoop.preset !== 'none') {
      nextPreset = nextLoop.preset;
    } else if (nextEntrance.enabled) {
      nextPreset = 'entrance';
    } else if (nextExit.enabled) {
      nextPreset = 'exit';
    }

    patch({
      animation: {
        ...anim,
        preset: nextPreset,
        entrance: nextEntrance,
        loop: nextLoop,
        exit: nextExit,
        durationMs: nextLoop.preset !== 'none' ? nextLoop.durationMs : (nextEntrance.enabled ? nextEntrance.durationMs : (nextExit.enabled ? nextExit.durationMs : (anim.durationMs ?? 1500))),
        delayMs: nextEntrance.enabled ? (nextEntrance.delayMs ?? 0) : (nextExit.enabled ? (nextExit.delayMs ?? 0) : (anim.delayMs ?? 0)),
        direction: nextEntrance.enabled ? nextEntrance.direction : (nextExit.enabled ? nextExit.direction : anim.direction),
        intensity: nextLoop.preset !== 'none' ? nextLoop.intensity : (nextEntrance.enabled ? nextEntrance.intensity : (nextExit.enabled ? nextExit.intensity : anim.intensity)),
        repeat: nextLoop.repeat,
      }
    });
  };

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
          <style>{`
            @keyframes previewFadeIn {
              0% { opacity: 0; transform: translateY(8px); }
              100% { opacity: 1; transform: translateY(0); }
            }
            @keyframes previewFadeOut {
              0% { opacity: 1; transform: translateY(0); }
              100% { opacity: 0; transform: translateY(-8px); }
            }
            @keyframes previewFloat {
              0%, 100% { transform: translateY(0); }
              50% { transform: translateY(-6px); }
            }
            @keyframes previewSway {
              0%, 100% { transform: rotate(0deg); }
              25% { transform: rotate(-5deg); }
              75% { transform: rotate(5deg); }
            }
            @keyframes previewPulse {
              0%, 100% { transform: scale(1); }
              50% { transform: scale(1.08); }
            }
            @keyframes previewDrift {
              0%, 100% { transform: translate(0, 0); }
              50% { transform: translate(6px, -3px); }
            }
          `}</style>

          {/* Card 1: Animasi & Gerakan Interaktif (Multi-Stage Modular) */}
          <div className="rounded-xl border-2 border-[#C5A880]/50 bg-gradient-to-b from-[#FAF8F5] to-white p-3 space-y-3 shadow-2xs">
            <div className="flex items-center justify-between pb-1 border-b border-[#C5A880]/30">
              <span className="flex items-center gap-1.5 text-xs font-bold text-[#4A2E35]">
                <Sparkles className="h-4 w-4 text-[#C5A880] animate-pulse" />
                <span>Efek & Gerak Komposit</span>
              </span>
              <span className="rounded bg-[#F3EDE6] px-2 py-0.5 text-[9px] font-bold text-[#88735B]">
                3 Efek Terpisah
              </span>
            </div>

            {/* Stage 1: Efek Masuk (Entrance: Opacity 0 -> 100) */}
            <div className="rounded-lg border border-[#C5A880]/30 bg-white overflow-hidden shadow-2xs">
              <div 
                onClick={() => setOpenEntrance(o => !o)}
                className="flex items-center justify-between p-2.5 bg-gradient-to-r from-[#FAF8F5] to-white cursor-pointer hover:bg-[#F3EDE6]/40 transition select-none"
              >
                <div className="flex items-center gap-2">
                  {openEntrance ? <ChevronDown className="h-3.5 w-3.5 text-[#C5A880]" /> : <ChevronRight className="h-3.5 w-3.5 text-hk-taupe" />}
                  <span className="text-xs font-bold text-[#4A2E35]">1. Efek Masuk (Entrance)</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded ${
                    entrance.enabled 
                      ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' 
                      : 'bg-hk-soft-beige/50 text-hk-taupe'
                  }`}>
                    {entrance.enabled ? `Aktif · ${(entrance.durationMs / 1000).toFixed(1)}s` : 'Nonaktif'}
                  </span>
                </div>
              </div>

              {openEntrance && (
                <div className="p-3 space-y-3 border-t border-hk-soft-beige/60 bg-[#FAF8F5]/30">
                  {/* Toggle Aktif */}
                  <label className="flex items-center justify-between cursor-pointer p-2 rounded-lg bg-white border border-[#C5A880]/20 hover:border-[#C5A880]/50 transition">
                    <div className="space-y-0.5">
                      <span className="text-xs font-bold text-hk-charcoal block">Aktifkan Efek Masuk</span>
                      <span className="text-[10px] text-hk-taupe block">Mulai dari opacity 0 perlahan tampil hingga 100</span>
                    </div>
                    <input
                      type="checkbox"
                      checked={entrance.enabled}
                      onChange={e => updateCompositeAnimation({ entrance: { enabled: e.target.checked } })}
                      className="h-4 w-4 rounded border-hk-soft-beige text-[#4A2E35] focus:ring-[#C5A880] accent-[#4A2E35] cursor-pointer"
                    />
                  </label>

                  {entrance.enabled && (
                    <div className="space-y-2.5 pt-1">
                      {/* Durasi Masuk */}
                      <div className="space-y-1.5 bg-white rounded-lg p-2.5 border border-hk-soft-beige">
                        <div className="flex items-center justify-between text-[11px] font-medium text-hk-taupe">
                          <span className="flex items-center gap-1 font-bold text-[#4A2E35]">
                            <Clock className="h-3 w-3 text-[#C5A880]" />
                            <span>Durasi Pudar Masuk</span>
                          </span>
                          <div className="flex items-center gap-1">
                            <input
                              type="number"
                              min="0.2"
                              max="15.0"
                              step="0.1"
                              value={Number((entrance.durationMs / 1000).toFixed(1))}
                              onChange={e => {
                                const val = Math.max(0.1, Math.min(15, parseFloat(e.target.value) || 1));
                                updateCompositeAnimation({ entrance: { durationMs: Math.round(val * 1000) } });
                              }}
                              className="w-14 rounded border border-hk-soft-beige bg-white px-1.5 py-0.5 text-center text-xs font-bold text-hk-charcoal shadow-2xs focus:border-[#C5A880] focus:outline-none"
                            />
                            <span className="text-[10px] font-bold text-hk-taupe">detik</span>
                          </div>
                        </div>

                        <input
                          type="range"
                          min="0.2"
                          max="10.0"
                          step="0.1"
                          value={entrance.durationMs / 1000}
                          onChange={e => updateCompositeAnimation({ entrance: { durationMs: Math.round(parseFloat(e.target.value) * 1000) } })}
                          className="w-full accent-[#C5A880] cursor-pointer"
                        />

                        {/* Quick Presets */}
                        <div className="flex flex-wrap items-center gap-1">
                          {[
                            { label: '0.8s Cepat', ms: 800 },
                            { label: '1.5s Sedang', ms: 1500 },
                            { label: '2.5s Halus', ms: 2500 },
                            { label: '4.0s Lambat', ms: 4000 },
                          ].map(p => (
                            <button
                              key={p.ms}
                              type="button"
                              onClick={() => updateCompositeAnimation({ entrance: { durationMs: p.ms } })}
                              className={`rounded px-1.5 py-0.5 text-[9px] font-semibold transition ${
                                Math.abs(entrance.durationMs - p.ms) < 50
                                  ? 'bg-[#4A2E35] text-white shadow-2xs'
                                  : 'bg-[#F3EDE6] text-hk-taupe hover:text-hk-charcoal'
                              }`}
                            >
                              {p.label}
                            </button>
                          ))}
                        </div>
                      </div>

                      {/* Waktu Tunggu / Delay */}
                      <div className="space-y-1">
                        <div className="flex items-center justify-between text-[11px] font-medium text-hk-taupe">
                          <span>Waktu Tunggu (Delay)</span>
                          <span className="font-bold text-hk-charcoal">
                            {((entrance.delayMs ?? 0) / 1000).toFixed(1)} detik
                          </span>
                        </div>
                        <input
                          type="range"
                          min="0.0"
                          max="5.0"
                          step="0.1"
                          value={(entrance.delayMs ?? 0) / 1000}
                          onChange={e => updateCompositeAnimation({ entrance: { delayMs: Math.round(parseFloat(e.target.value) * 1000) } })}
                          className="w-full accent-[#C5A880] cursor-pointer"
                        />
                      </div>

                      {/* Arah Geser & Jarak */}
                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <label className="text-[10px] font-bold text-hk-taupe uppercase tracking-wider block mb-1">
                            Arah Geser Masuk
                          </label>
                          <select
                            className={fieldClass}
                            value={entrance.direction ?? 'up'}
                            onChange={e => updateCompositeAnimation({ entrance: { direction: e.target.value as any } })}
                          >
                            <option value="up">Dari Bawah (Naik)</option>
                            <option value="down">Dari Atas (Turun)</option>
                            <option value="left">Dari Kanan (Ke Kiri)</option>
                            <option value="right">Dari Kiri (Ke Kanan)</option>
                          </select>
                        </div>
                        <div>
                          <label className="text-[10px] font-bold text-hk-taupe uppercase tracking-wider block mb-1">
                            Jarak Geser
                          </label>
                          <select
                            className={fieldClass}
                            value={entrance.intensity ?? 0}
                            onChange={e => updateCompositeAnimation({ entrance: { intensity: Number(e.target.value) } })}
                          >
                            <option value={0}>0 (Murni Fade di Tempat)</option>
                            <option value={5}>5 (Geser Sedikit)</option>
                            <option value={10}>10 (Geser Sedang)</option>
                            <option value={18}>18 (Geser Jauh)</option>
                          </select>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Stage 2: Efek Berkelanjutan (Ambience / Looping) */}
            <div className="rounded-lg border border-[#C5A880]/30 bg-white overflow-hidden shadow-2xs">
              <div 
                onClick={() => setOpenLoop(o => !o)}
                className="flex items-center justify-between p-2.5 bg-gradient-to-r from-[#FAF8F5] to-white cursor-pointer hover:bg-[#F3EDE6]/40 transition select-none"
              >
                <div className="flex items-center gap-2">
                  {openLoop ? <ChevronDown className="h-3.5 w-3.5 text-[#C5A880]" /> : <ChevronRight className="h-3.5 w-3.5 text-hk-taupe" />}
                  <span className="text-xs font-bold text-[#4A2E35]">2. Efek Berkelanjutan (Looping)</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded ${
                    loop.preset !== 'none' 
                      ? 'bg-amber-50 text-amber-800 border border-amber-200' 
                      : 'bg-hk-soft-beige/50 text-hk-taupe'
                  }`}>
                    {loop.preset !== 'none' ? `${loop.preset} · ${(loop.durationMs / 1000).toFixed(1)}s` : 'Nonaktif'}
                  </span>
                </div>
              </div>

              {openLoop && (
                <div className="p-3 space-y-3 border-t border-hk-soft-beige/60 bg-[#FAF8F5]/30">
                  <div>
                    <label className={labelClass}>Pilihan Gerakan Berulang</label>
                    <select
                      className={fieldClass}
                      value={loop.preset}
                      onChange={e => updateCompositeAnimation({ loop: { preset: e.target.value as any } })}
                    >
                      <option value="none">⚪ Tanpa Gerakan Loop (Asset Diam)</option>
                      <option value="sway">🍃 Ayunan Anggun (Sway: Bergoyang Kiri-Kanan)</option>
                      <option value="float">🌸 Mengapung Lembut (Float: Naik-Turun Halus)</option>
                      <option value="pulse">💓 Denyut Elegan (Pulse: Mengembang-Kempis)</option>
                      <option value="drift">🌊 Melayang (Drift: Meluncur Searah)</option>
                    </select>
                  </div>

                  {loop.preset !== 'none' && (
                    <div className="space-y-2.5 pt-1">
                      {/* Kecepatan 1 Siklus */}
                      <div className="space-y-1.5 bg-white rounded-lg p-2.5 border border-hk-soft-beige">
                        <div className="flex items-center justify-between text-[11px] font-medium text-hk-taupe">
                          <span className="flex items-center gap-1 font-bold text-[#4A2E35]">
                            <Clock className="h-3 w-3 text-[#C5A880]" />
                            <span>Durasi 1 Siklus Putaran</span>
                          </span>
                          <div className="flex items-center gap-1">
                            <input
                              type="number"
                              min="0.5"
                              max="15.0"
                              step="0.1"
                              value={Number((loop.durationMs / 1000).toFixed(1))}
                              onChange={e => {
                                const val = Math.max(0.5, Math.min(15, parseFloat(e.target.value) || 2));
                                updateCompositeAnimation({ loop: { durationMs: Math.round(val * 1000) } });
                              }}
                              className="w-14 rounded border border-hk-soft-beige bg-white px-1.5 py-0.5 text-center text-xs font-bold text-hk-charcoal shadow-2xs focus:border-[#C5A880] focus:outline-none"
                            />
                            <span className="text-[10px] font-bold text-hk-taupe">detik</span>
                          </div>
                        </div>

                        <input
                          type="range"
                          min="0.5"
                          max="10.0"
                          step="0.1"
                          value={loop.durationMs / 1000}
                          onChange={e => updateCompositeAnimation({ loop: { durationMs: Math.round(parseFloat(e.target.value) * 1000) } })}
                          className="w-full accent-[#C5A880] cursor-pointer"
                        />

                        {/* Quick Presets */}
                        <div className="flex flex-wrap items-center gap-1">
                          {[
                            { label: '1.5s Cepat', ms: 1500 },
                            { label: '3.0s Sedang', ms: 3000 },
                            { label: '5.0s Halus', ms: 5000 },
                            { label: '8.0s Lembut', ms: 8000 },
                          ].map(p => (
                            <button
                              key={p.ms}
                              type="button"
                              onClick={() => updateCompositeAnimation({ loop: { durationMs: p.ms } })}
                              className={`rounded px-1.5 py-0.5 text-[9px] font-semibold transition ${
                                Math.abs(loop.durationMs - p.ms) < 50
                                  ? 'bg-[#4A2E35] text-white shadow-2xs'
                                  : 'bg-[#F3EDE6] text-hk-taupe hover:text-hk-charcoal'
                              }`}
                            >
                              {p.label}
                            </button>
                          ))}
                        </div>
                      </div>

                      {/* Kekuatan Gerak (Intensitas) */}
                      <div>
                        <div className="flex items-center justify-between text-[11px] font-medium text-hk-taupe mb-1">
                          <span>Kekuatan Ayunan / Gerak</span>
                          <span className="font-bold text-hk-charcoal">{loop.intensity ?? 8}</span>
                        </div>
                        <input
                          type="range"
                          min={1}
                          max={20}
                          step={1}
                          value={loop.intensity ?? 8}
                          onChange={e => updateCompositeAnimation({ loop: { intensity: Number(e.target.value) } })}
                          className="w-full accent-[#C5A880] cursor-pointer"
                        />
                        <div className="flex justify-between text-[9px] text-hk-taupe/60 px-0.5">
                          <span>1 (Halus/Kecil)</span>
                          <span>10 (Sedang)</span>
                          <span>20 (Kuat/Lebar)</span>
                        </div>
                      </div>

                      {/* Pengulangan */}
                      <div>
                        <label className="text-[10px] font-bold text-hk-taupe uppercase tracking-wider block mb-1">
                          Pengulangan Siklus
                        </label>
                        <select
                          className={fieldClass}
                          value={loop.repeat ?? 0}
                          onChange={e => updateCompositeAnimation({ loop: { repeat: Number(e.target.value) } })}
                        >
                          <option value={0}>♾️ Berulang Terus Menerus (Tanpa Batas)</option>
                          <option value={3}>Ulangi 3 Kali Lalu Berhenti</option>
                          <option value={5}>Ulangi 5 Kali Lalu Berhenti</option>
                        </select>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Stage 3: Efek Keluar (Exit: Opacity 100 -> 0) */}
            <div className="rounded-lg border border-[#C5A880]/30 bg-white overflow-hidden shadow-2xs">
              <div 
                onClick={() => setOpenExit(o => !o)}
                className="flex items-center justify-between p-2.5 bg-gradient-to-r from-[#FAF8F5] to-white cursor-pointer hover:bg-[#F3EDE6]/40 transition select-none"
              >
                <div className="flex items-center gap-2">
                  {openExit ? <ChevronDown className="h-3.5 w-3.5 text-[#C5A880]" /> : <ChevronRight className="h-3.5 w-3.5 text-hk-taupe" />}
                  <span className="text-xs font-bold text-[#4A2E35]">3. Efek Keluar (Exit)</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded ${
                    exit.enabled 
                      ? 'bg-rose-50 text-rose-700 border border-rose-200' 
                      : 'bg-hk-soft-beige/50 text-hk-taupe'
                  }`}>
                    {exit.enabled ? `Aktif · ${(exit.durationMs / 1000).toFixed(1)}s` : 'Nonaktif'}
                  </span>
                </div>
              </div>

              {openExit && (
                <div className="p-3 space-y-3 border-t border-hk-soft-beige/60 bg-[#FAF8F5]/30">
                  {/* Toggle Aktif */}
                  <label className="flex items-center justify-between cursor-pointer p-2 rounded-lg bg-white border border-[#C5A880]/20 hover:border-[#C5A880]/50 transition">
                    <div className="space-y-0.5">
                      <span className="text-xs font-bold text-hk-charcoal block">Aktifkan Efek Keluar</span>
                      <span className="text-[10px] text-hk-taupe block">Memudar dari 100 perlahan menuju transparan 0</span>
                    </div>
                    <input
                      type="checkbox"
                      checked={exit.enabled}
                      onChange={e => updateCompositeAnimation({ exit: { enabled: e.target.checked } })}
                      className="h-4 w-4 rounded border-hk-soft-beige text-[#4A2E35] focus:ring-[#C5A880] accent-[#4A2E35] cursor-pointer"
                    />
                  </label>

                  {exit.enabled && (
                    <div className="space-y-2.5 pt-1">
                      {/* Durasi Keluar */}
                      <div className="space-y-1.5 bg-white rounded-lg p-2.5 border border-hk-soft-beige">
                        <div className="flex items-center justify-between text-[11px] font-medium text-hk-taupe">
                          <span className="flex items-center gap-1 font-bold text-[#4A2E35]">
                            <Clock className="h-3 w-3 text-[#C5A880]" />
                            <span>Durasi Pudar Keluar</span>
                          </span>
                          <div className="flex items-center gap-1">
                            <input
                              type="number"
                              min="0.2"
                              max="15.0"
                              step="0.1"
                              value={Number((exit.durationMs / 1000).toFixed(1))}
                              onChange={e => {
                                const val = Math.max(0.1, Math.min(15, parseFloat(e.target.value) || 1));
                                updateCompositeAnimation({ exit: { durationMs: Math.round(val * 1000) } });
                              }}
                              className="w-14 rounded border border-hk-soft-beige bg-white px-1.5 py-0.5 text-center text-xs font-bold text-hk-charcoal shadow-2xs focus:border-[#C5A880] focus:outline-none"
                            />
                            <span className="text-[10px] font-bold text-hk-taupe">detik</span>
                          </div>
                        </div>

                        <input
                          type="range"
                          min="0.2"
                          max="10.0"
                          step="0.1"
                          value={exit.durationMs / 1000}
                          onChange={e => updateCompositeAnimation({ exit: { durationMs: Math.round(parseFloat(e.target.value) * 1000) } })}
                          className="w-full accent-[#C5A880] cursor-pointer"
                        />
                      </div>

                      {/* Arah Geser & Jarak */}
                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <label className="text-[10px] font-bold text-hk-taupe uppercase tracking-wider block mb-1">
                            Arah Keluar
                          </label>
                          <select
                            className={fieldClass}
                            value={exit.direction ?? 'up'}
                            onChange={e => updateCompositeAnimation({ exit: { direction: e.target.value as any } })}
                          >
                            <option value="up">Ke Atas</option>
                            <option value="down">Ke Bawah</option>
                            <option value="left">Ke Kiri</option>
                            <option value="right">Ke Kanan</option>
                          </select>
                        </div>
                        <div>
                          <label className="text-[10px] font-bold text-hk-taupe uppercase tracking-wider block mb-1">
                            Jarak Geser
                          </label>
                          <select
                            className={fieldClass}
                            value={exit.intensity ?? 0}
                            onChange={e => updateCompositeAnimation({ exit: { intensity: Number(e.target.value) } })}
                          >
                            <option value={0}>0 (Murni Fade di Tempat)</option>
                            <option value={5}>5 (Geser Sedikit)</option>
                            <option value={10}>10 (Geser Sedang)</option>
                            <option value={18}>18 (Geser Jauh)</option>
                          </select>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Uji Simulasi Animasi Komposit Terpadu */}
            <div className="rounded-lg bg-[#FAF8F5] border border-[#C5A880]/40 p-2.5 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold text-hk-taupe uppercase tracking-wider">
                  Uji Gabungan Efek (Simulasi)
                </span>
                <button
                  type="button"
                  onClick={() => setPreviewKey(k => k + 1)}
                  className="flex items-center gap-1 rounded-md bg-[#4A2E35] px-2.5 py-1 text-[10px] font-bold text-white shadow-2xs hover:bg-[#382228] transition cursor-pointer"
                >
                  <Play className="h-2.5 w-2.5 fill-white" />
                  <span>Putar Ulang Simulasi</span>
                </button>
              </div>

              {/* Status Ringkasan */}
              <div className="flex items-center gap-1.5 flex-wrap text-[9px]">
                <span className={`px-1.5 py-0.5 rounded font-medium ${entrance.enabled ? 'bg-emerald-100 text-emerald-800' : 'bg-hk-soft-beige/50 text-hk-taupe'}`}>
                  Masuk: {entrance.enabled ? `${(entrance.durationMs / 1000).toFixed(1)}s` : 'Off'}
                </span>
                <span className={`px-1.5 py-0.5 rounded font-medium ${loop.preset !== 'none' ? 'bg-amber-100 text-amber-800' : 'bg-hk-soft-beige/50 text-hk-taupe'}`}>
                  Loop: {loop.preset !== 'none' ? `${loop.preset} ${(loop.durationMs / 1000).toFixed(1)}s` : 'Off'}
                </span>
                <span className={`px-1.5 py-0.5 rounded font-medium ${exit.enabled ? 'bg-rose-100 text-rose-800' : 'bg-hk-soft-beige/50 text-hk-taupe'}`}>
                  Keluar: {exit.enabled ? `${(exit.durationMs / 1000).toFixed(1)}s` : 'Off'}
                </span>
              </div>

              {/* Canvas Preview Simulation */}
              <div className="relative h-16 w-full rounded-md bg-white border border-hk-soft-beige flex items-center justify-center overflow-hidden">
                <div
                  key={`outer-${previewKey}`}
                  style={{
                    animation: entrance.enabled
                      ? `previewFadeIn ${Math.max(0.1, entrance.durationMs / 1000)}s cubic-bezier(0.25, 0.1, 0.25, 1) forwards`
                      : undefined,
                  }}
                  className="w-full h-full flex items-center justify-center"
                >
                  <div
                    key={`inner-${previewKey}`}
                    style={{
                      animation: loop.preset === 'sway'
                        ? `previewSway ${Math.max(0.5, loop.durationMs / 1000)}s ease-in-out infinite`
                        : loop.preset === 'float'
                        ? `previewFloat ${Math.max(0.5, loop.durationMs / 1000)}s ease-in-out infinite`
                        : loop.preset === 'pulse'
                        ? `previewPulse ${Math.max(0.5, loop.durationMs / 1000)}s ease-in-out infinite`
                        : loop.preset === 'drift'
                        ? `previewDrift ${Math.max(0.5, loop.durationMs / 1000)}s ease-in-out infinite`
                        : undefined,
                    }}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#FAF8F5] border border-[#C5A880] text-xs font-semibold text-[#4A2E35] shadow-2xs"
                  >
                    <Sparkles className="h-3.5 w-3.5 text-[#C5A880]" />
                    <span>{node.name || 'Asset Terpilih'}</span>
                  </div>
                </div>
              </div>
            </div>
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
