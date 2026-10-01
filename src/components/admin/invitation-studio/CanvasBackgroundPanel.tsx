"use client";

import { useState } from "react";
import { Check, Droplet, Layers, RotateCcw, Sparkles } from "lucide-react";
import type { StudioBackground, StudioBackgroundTexture } from "@/lib/invitation-studio/types";
import {
  DEFAULT_CANVAS_BACKGROUND,
  STUDIO_BACKGROUND_TEXTURES,
  backgroundToCss,
  isValidColorString,
} from "@/lib/invitation-studio/colors";

/** Palet ringkas untuk latar kanvas — warna latar yang terbukti enak dipadu dengan teks plum. */
const BACKGROUND_PALETTE = [
  { label: "Cream", hex: "#FAF8F5" },
  { label: "Champagne", hex: "#F3EDE6" },
  { label: "Ivory", hex: "#FFF8F0" },
  { label: "Blush", hex: "#FDF2F0" },
  { label: "Sage", hex: "#EAF0EA" },
  { label: "Mist", hex: "#E6ECF2" },
  { label: "Sand", hex: "#EDE6DC" },
  { label: "Plum", hex: "#4A2E35" },
];

type Kind = StudioBackground["kind"];

const DEFAULT_GRADIENT = { from: "#FAF8F5", to: "#F3EDE6", angle: 135 };
const DEFAULT_TEXTURE: { texture: StudioBackgroundTexture; baseColor: string; accentColor: string; intensity: number } = {
  texture: "linen",
  baseColor: "#FAF8F5",
  accentColor: "#C5A880",
  intensity: 30,
};

/** Small swatch grid reused by solid / gradient / texture pickers. */
function SwatchGrid({
  value,
  onPick,
  disabled,
}: {
  value?: string;
  onPick: (hex: string) => void;
  disabled?: boolean;
}) {
  return (
    <div className="grid grid-cols-8 gap-1.5">
      {BACKGROUND_PALETTE.map(({ label, hex }) => {
        const active = (value || "").toLowerCase() === hex.toLowerCase();
        return (
          <button
            key={hex}
            type="button"
            title={`${label} ${hex}`}
            disabled={disabled}
            onClick={() => onPick(hex)}
            className={`relative flex h-6 w-6 items-center justify-center rounded-md border transition disabled:opacity-40 ${
              active ? "border-[#4A2E35] ring-1 ring-[#4A2E35]" : "border-black/10 hover:border-[#C5A880]"
            }`}
            style={{ backgroundColor: hex }}
          >
            {active && (
              <Check className={`h-3.5 w-3.5 ${hex === "#4A2E35" ? "text-white" : "text-[#4A2E35]"}`} />
            )}
          </button>
        );
      })}
    </div>
  );
}

/** A native color input + hex text box that commits a valid color. */
function ColorField({
  label,
  value,
  onCommit,
  disabled,
}: {
  label: string;
  value: string;
  onCommit: (hex: string) => void;
  disabled?: boolean;
}) {
  const [draft, setDraft] = useState(value);
  const valid = isValidColorString(draft);
  return (
    <div className="flex items-center gap-2">
      <span className="w-16 shrink-0 text-[10px] font-semibold text-hk-taupe">{label}</span>
      <input
        type="color"
        value={/^#[\da-f]{6}$/i.test(value) ? value : "#FAF8F5"}
        disabled={disabled}
        onChange={(e) => onCommit(e.target.value)}
        className="h-7 w-9 shrink-0 cursor-pointer rounded-md border border-hk-soft-beige bg-white disabled:opacity-40"
        title={label}
      />
      <input
        type="text"
        value={draft}
        disabled={disabled}
        onChange={(e) => setDraft(e.target.value)}
        onBlur={() => { if (valid) onCommit(draft); else setDraft(value); }}
        onKeyDown={(e) => { if (e.key === "Enter" && valid) onCommit(draft); }}
        spellCheck={false}
        className={`h-7 min-w-0 flex-1 rounded-md border px-2 font-mono text-[10px] text-hk-charcoal disabled:opacity-40 ${
          valid ? "border-hk-soft-beige" : "border-red-300 bg-red-50"
        }`}
      />
    </div>
  );
}

export function CanvasBackgroundPanel({
  background,
  onChange,
  disabled,
}: {
  background?: StudioBackground;
  onChange: (background: StudioBackground | null) => void;
  disabled?: boolean;
}) {
  const kind: Kind = background?.kind ?? "solid";
  const solid = background?.kind === "solid" ? background : null;
  const gradient = background?.kind === "gradient" ? background : null;
  const texture = background?.kind === "texture" ? background : null;

  const setKind = (next: Kind) => {
    if (next === "solid") onChange({ kind: "solid", color: solid?.color ?? DEFAULT_CANVAS_BACKGROUND });
    if (next === "gradient") onChange({ kind: "gradient", ...(gradient ?? DEFAULT_GRADIENT) });
    if (next === "texture") onChange({ kind: "texture", ...(texture ?? DEFAULT_TEXTURE) });
  };

  const previewStyle = backgroundToCss(background);

  return (
    <div className="flex flex-col gap-3">
      {/* Header + Reset */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1.5">
          <Droplet className="h-3.5 w-3.5 text-[#C5A880]" />
          <p className="text-[10px] font-bold uppercase tracking-wider text-hk-taupe">Latar Kanvas</p>
        </div>
        <button
          type="button"
          disabled={disabled || !background}
          onClick={() => onChange(null)}
          title="Kembalikan ke Cream Canvas (#FAF8F5)"
          className="flex h-6 items-center gap-1 rounded-lg px-2 text-[10px] font-semibold text-hk-taupe transition hover:bg-[#FAF8F5] hover:text-hk-charcoal disabled:opacity-30"
        >
          <RotateCcw className="h-3 w-3" /> Reset
        </button>
      </div>

      {/* Type selector */}
      <div className="grid grid-cols-3 gap-1.5">
        {([
          { id: "solid", label: "Warna", Icon: Droplet },
          { id: "gradient", label: "Gradient", Icon: Sparkles },
          { id: "texture", label: "Tekstur", Icon: Layers },
        ] as const).map(({ id, label, Icon }) => (
          <button
            key={id}
            type="button"
            disabled={disabled}
            onClick={() => setKind(id)}
            className={`flex flex-col items-center gap-1 rounded-lg border p-2 transition disabled:opacity-40 ${
              kind === id
                ? "border-[#C5A880] bg-white shadow-2xs"
                : "border-hk-soft-beige bg-[#FAF8F5] hover:border-[#C5A880]"
            }`}
          >
            <Icon className="h-4 w-4 text-[#C5A880]" />
            <span className="text-[10px] font-bold text-hk-charcoal">{label}</span>
          </button>
        ))}
      </div>

      {/* Live preview */}
      <div
        className="h-14 w-full rounded-xl border border-hk-soft-beige shadow-inner"
        style={previewStyle}
        aria-hidden="true"
      />

      {/* Solid controls */}
      {kind === "solid" && (
        <div className="flex flex-col gap-2">
          <SwatchGrid value={solid?.color} disabled={disabled} onPick={(hex) => onChange({ kind: "solid", color: hex })} />
          <ColorField
            label="Warna"
            value={solid?.color ?? DEFAULT_CANVAS_BACKGROUND}
            disabled={disabled}
            onCommit={(hex) => onChange({ kind: "solid", color: hex })}
          />
        </div>
      )}

      {/* Gradient controls */}
      {kind === "gradient" && (
        <div className="flex flex-col gap-2">
          <ColorField label="Dari" value={gradient?.from ?? DEFAULT_GRADIENT.from} disabled={disabled} onCommit={(from) => onChange({ kind: "gradient", from, to: gradient?.to ?? DEFAULT_GRADIENT.to, angle: gradient?.angle ?? DEFAULT_GRADIENT.angle })} />
          <ColorField label="Ke" value={gradient?.to ?? DEFAULT_GRADIENT.to} disabled={disabled} onCommit={(to) => onChange({ kind: "gradient", from: gradient?.from ?? DEFAULT_GRADIENT.from, to, angle: gradient?.angle ?? DEFAULT_GRADIENT.angle })} />
          <div className="flex items-center gap-2">
            <span className="w-16 shrink-0 text-[10px] font-semibold text-hk-taupe">Arah</span>
            <input
              type="range"
              min={0}
              max={360}
              step={5}
              disabled={disabled}
              value={gradient?.angle ?? DEFAULT_GRADIENT.angle}
              onChange={(e) => onChange({ kind: "gradient", from: gradient?.from ?? DEFAULT_GRADIENT.from, to: gradient?.to ?? DEFAULT_GRADIENT.to, angle: Number(e.target.value) })}
              className="h-1.5 flex-1 cursor-pointer accent-[#4A2E35]"
            />
            <span className="w-9 shrink-0 text-right font-mono text-[10px] text-hk-taupe">{gradient?.angle ?? DEFAULT_GRADIENT.angle}°</span>
          </div>
        </div>
      )}

      {/* Texture controls */}
      {kind === "texture" && (
        <div className="flex flex-col gap-2">
          <div className="grid grid-cols-3 gap-1.5">
            {STUDIO_BACKGROUND_TEXTURES.map(({ id, label, desc }) => {
              const active = (texture?.texture ?? "linen") === id;
              return (
                <button
                  key={id}
                  type="button"
                  title={desc}
                  disabled={disabled}
                  onClick={() => onChange({ kind: "texture", texture: id, baseColor: texture?.baseColor ?? DEFAULT_TEXTURE.baseColor, accentColor: texture?.accentColor ?? DEFAULT_TEXTURE.accentColor, intensity: texture?.intensity ?? DEFAULT_TEXTURE.intensity })}
                  className={`flex items-center justify-center rounded-lg border p-2 text-[10px] font-bold transition disabled:opacity-40 ${
                    active
                      ? "border-[#C5A880] bg-white text-hk-charcoal shadow-2xs"
                      : "border-hk-soft-beige bg-[#FAF8F5] text-hk-taupe hover:border-[#C5A880]"
                  }`}
                >
                  {label}
                </button>
              );
            })}
          </div>
          <ColorField label="Dasar" value={texture?.baseColor ?? DEFAULT_TEXTURE.baseColor} disabled={disabled} onCommit={(baseColor) => onChange({ kind: "texture", texture: texture?.texture ?? "linen", baseColor, accentColor: texture?.accentColor ?? DEFAULT_TEXTURE.accentColor, intensity: texture?.intensity ?? DEFAULT_TEXTURE.intensity })} />
          <ColorField label="Motif" value={texture?.accentColor ?? DEFAULT_TEXTURE.accentColor} disabled={disabled} onCommit={(accentColor) => onChange({ kind: "texture", texture: texture?.texture ?? "linen", baseColor: texture?.baseColor ?? DEFAULT_TEXTURE.baseColor, accentColor, intensity: texture?.intensity ?? DEFAULT_TEXTURE.intensity })} />
          <div className="flex items-center gap-2">
            <span className="w-16 shrink-0 text-[10px] font-semibold text-hk-taupe">Kepekatan</span>
            <input
              type="range"
              min={0}
              max={100}
              step={5}
              disabled={disabled}
              value={texture?.intensity ?? DEFAULT_TEXTURE.intensity}
              onChange={(e) => onChange({ kind: "texture", texture: texture?.texture ?? "linen", baseColor: texture?.baseColor ?? DEFAULT_TEXTURE.baseColor, accentColor: texture?.accentColor ?? DEFAULT_TEXTURE.accentColor, intensity: Number(e.target.value) })}
              className="h-1.5 flex-1 cursor-pointer accent-[#4A2E35]"
            />
            <span className="w-9 shrink-0 text-right font-mono text-[10px] text-hk-taupe">{texture?.intensity ?? DEFAULT_TEXTURE.intensity}%</span>
          </div>
        </div>
      )}

      <p className="text-[10px] leading-relaxed text-hk-taupe/80">
        Latar berlaku untuk seluruh undangan. Perubahan tampil langsung di kanvas editor dan pratinjau.
      </p>
    </div>
  );
}
