'use client';

import React from 'react';
import { VisualEffectId, MicroAnimationId } from '@/types/invitation-studio';
import { cn } from '@/lib/utils';

export interface EffectItem {
  id: VisualEffectId;
  name: string;
  category: string;
  description: string;
}

export interface AnimationItem {
  id: MicroAnimationId;
  name: string;
  category: string;
  description: string;
}

export const OPTICAL_EFFECTS_LIST: EffectItem[] = [
  { id: 'specular-gold-shimmer', name: '1. Specular Gold Foil Shimmer', category: 'Lighting', description: 'Kilatan cahaya diagonal tipis melintas di atas lencana emas tiap 7 detik.' },
  { id: 'frosted-glassmorphism', name: '2. Frosted Crystal Glassmorphism', category: 'Surface', description: 'Kaca kristal berembun dengan latar putih susu hangat 88% dan bayangan lembut.' },
  { id: 'inner-gilded-rim-light', name: '3. Inner Gilded Rim Light', category: 'Lighting', description: 'Garis tepi 1px menangkap bias cahaya emas sampanye dinamis.' },
  { id: 'cotton-paper-texture', name: '4. Cotton Paper Texture', category: 'Texture', description: 'Tekstur serat kertas katun fisik 600 gsm mewah berbobot.' },
  { id: 'floating-petals', name: '5. Ambient Floating Petals / Gold Dust', category: 'Particles', description: 'Kelopak melati atau debu emas melayang lembut di latar belakang.' },
  { id: 'radial-vignette-depth', name: '6. Radial Vignette Focus-Depth', category: 'Optics', description: 'Gradasi halus di tepi layar yang memusatkan pandangan ke inti kartu.' },
  { id: 'embossed-letterpress', name: '7. Embossed Letterpress', category: 'Depth', description: 'Bayangan mikro cetak tekan timbul mesin letterpress pada judul.' },
  { id: 'dew-droplet-condensation', name: '8. Dew Droplet Condensation', category: 'Optics', description: 'Kilau titik embun pagi pada dedaunan dan bunga tropis Kebumen.' },
  { id: 'gilded-edge-bevel', name: '9. Gilded Edge Bevel 3D', category: 'Border', description: 'Sudut kartu melengkung tebal dengan gradasi bevel 3D bertepi emas.' },
  { id: 'warm-film-grain', name: '10. Soft Warm Film Grain', category: 'Filter', description: 'Gradasi film hangat sinematik pada foto pre-wedding.' },
  { id: 'aurora-halo-glow', name: '11. Ambient Aurora Halo Glow', category: 'Atmosphere', description: 'Pendaran cahaya pastel hangat di balik foto kedua mempelai.' },
  { id: 'physical-drop-shadow', name: '12. Physical Drop-Shadow Depth', category: 'Depth', description: 'Bayangan jatuh realistis di bawah pita dan segel lilin 3D.' },
  { id: 'sogan-vignette', name: '13. Monochromatic Adat Sogan Vignette', category: 'Cultural', description: 'Nuansa sepia-sogan klasik adiluhung keraton Jawa.' },
  { id: 'stardust-twinkle', name: '14. Star Dust Twinkle', category: 'Sparkle', description: 'Kilauan 4-titik mikro pada cincin permata dan inisial nama.' },
  { id: 'bokeh-blur-transition', name: '15. Lens Bokeh Blur Transition', category: 'Camera', description: 'Efek bokeh lensa f/1.4 saat modal atau detail kartu terbuka.' },
];

export const MICRO_ANIMATIONS_LIST: AnimationItem[] = [
  { id: 'svg-path-stroke-draw', name: '1. SVG Calligraphic Path Draw', category: 'Vector', description: 'Goresan garis dan bunga terlukis dinamis via stroke-dashoffset.' },
  { id: 'botanical-sway', name: '2. Gentle Botanical Sway', category: 'Nature', description: 'Ayunan dedaunan dan ranting tertiup angin sejuk 1.5°.' },
  { id: 'narrative-reveal', name: '3. Staggered Narrative Reveal', category: 'Scroll', description: 'Kemunculan bertahap puitis berurutan saat layar digulir.' },
  { id: 'gatefold-wax-open', name: '4. 3D Gatefold Wax Seal Opening', category: 'Interaction', description: 'Membuka lipatan amplop 3D ke samping saat segel lilin ditekan.' },
  { id: 'heartbeat-pulse', name: '5. Slow Heartbeat Pulse', category: 'Rhythm', description: 'Denyut tenang sakral pada monogram inisial (scale 1.0 ke 1.028).' },
  { id: 'parallax-depth', name: '6. Parallax Portrait Depth', category: 'Motion', description: 'Pergeseran kedalaman foto 0.15x relatif terhadap bingkai.' },
  { id: 'inertia-tilt', name: '7. Smooth Inertia Tilt', category: 'Touch', description: 'Kemiringan 3D responsif sentuhan jari maksimal 3 derajat.' },
  { id: 'countdown-ticker', name: '8. Live Countdown Number Ticker', category: 'Timer', description: 'Angka hitung mundur hari H berputar mulus saat pertama tampak.' },
  { id: 'music-equalizer-wave', name: '9. Floating Music Equalizer Bar', category: 'Audio', description: 'Gelombang nada pengiring bernuansa akustik/gamelan bergetar lembut.' },
  { id: 'rsvp-petal-burst', name: '10. Doa Restu Petal Burst on RSVP', category: 'Feedback', description: 'Letupan kelopak bunga melati mikro saat tamu mengirim doa.' },
  { id: 'elastic-wax-press', name: '11. Elastic Wax Press Response', category: 'Haptic', description: 'Sensasi tekanan fisik segel lilin (scale 0.94) sebelum merekah.' },
  { id: 'cubic-bezier-glide', name: '12. Cubic-Bezier Anchor Glide', category: 'Navigation', description: 'Luncuran navigasi sutra antar-section (cubic-bezier(0.25, 1, 0.5, 1)).' },
  { id: 'fluid-accordion', name: '13. Fluid Accordion Unfold', category: 'Content', description: 'Pemekaran rincian acara secara cair dan natural tanpa patah.' },
  { id: 'marquee-story', name: '14. Infinite Puitis Story Marquee', category: 'Text', description: 'Aliran teks kalimat puitis dan doa suci mengalir tenang horizontal.' },
  { id: 'morphing-copy-btn', name: '15. Morphing Copy-to-Clipboard', category: 'Action', description: 'Transformasi tombol salin rekening menjadi centang hijau zamrud.' },
];

interface VisualEffectsLayerProps {
  children: React.ReactNode;
  activeEffects: VisualEffectId[];
  activeAnimations: MicroAnimationId[];
  themeColor: string;
  className?: string;
}

export function VisualEffectsLayer({
  children,
  activeEffects,
  activeAnimations,
  themeColor,
  className,
}: VisualEffectsLayerProps) {
  const hasFloatingPetals = activeEffects.includes('floating-petals');
  const hasPaperTexture = activeEffects.includes('cotton-paper-texture');
  const hasVignette = activeEffects.includes('radial-vignette-depth');
  const hasShimmer = activeEffects.includes('specular-gold-shimmer');
  const hasPathDraw = activeAnimations.includes('svg-path-stroke-draw');
  const hasBotanicalSway = activeAnimations.includes('botanical-sway');

  return (
    <div
      className={cn(
        'relative min-h-full w-full transition-colors',
        hasPathDraw && 'animate-hk-path-draw',
        hasBotanicalSway && '[&_.hk-sway]:animate-hk-botanical-sway',
        className
      )}
    >
      {/* Background Atmosphere Overlays (Isolated with pointer-events-none & overflow-hidden) */}
      <div aria-hidden="true" className="pointer-events-none absolute inset-0 z-10 overflow-hidden">
        {/* 1. Cotton Paper Texture Overlay */}
        {hasPaperTexture && (
          <div
            className="absolute inset-0 opacity-[0.05] mix-blend-multiply"
            style={{
              backgroundImage:
                'radial-gradient(#4A2E35 1px, transparent 1px), radial-gradient(#C5A880 1px, transparent 1px)',
              backgroundSize: '16px 16px',
              backgroundPosition: '0 0, 8px 8px',
            }}
          />
        )}

        {/* 2. Radial Vignette Focus Depth */}
        {hasVignette && (
          <div
            className="absolute inset-0"
            style={{
              background: 'radial-gradient(circle at 50% 50%, transparent 65%, rgba(43,43,43,0.08) 100%)',
            }}
          />
        )}

        {/* 3. Ambient Floating Petals (Falling Particles) */}
        {hasFloatingPetals && (
          <div className="absolute inset-0 overflow-hidden">
            {[
              { left: '15%', delay: '0s', dur: '8s', size: '10px' },
              { left: '45%', delay: '2.5s', dur: '9.5s', size: '12px' },
              { left: '75%', delay: '4s', dur: '7.5s', size: '8px' },
              { left: '30%', delay: '5.5s', dur: '10s', size: '11px' },
              { left: '85%', delay: '1s', dur: '8.5s', size: '9px' },
            ].map((petal, i) => (
              <div
                key={i}
                className="absolute rounded-full bg-white/70 shadow-2xs backdrop-blur-xs"
                style={{
                  top: '-20px',
                  left: petal.left,
                  width: petal.size,
                  height: petal.size,
                  animation: `hk-falling-petal ${petal.dur} linear infinite`,
                  animationDelay: petal.delay,
                }}
              />
            ))}
          </div>
        )}

        {/* 4. Specular Gold Shimmer Light Sweep */}
        {hasShimmer && (
          <div className="absolute inset-0 overflow-hidden">
            <div
              className="absolute -inset-full w-[200%] h-full bg-gradient-to-r from-transparent via-white/20 to-transparent"
              style={{
                animation: 'hk-gold-shimmer 7s cubic-bezier(0.4, 0, 0.2, 1) infinite',
              }}
            />
          </div>
        )}
      </div>

      {/* Content Stream (Allows natural scroll expansion) */}
      <div className="relative z-0 min-h-full">{children}</div>
    </div>
  );
}

