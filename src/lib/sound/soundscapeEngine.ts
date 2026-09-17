// ============================================================================
// SOUNDSCAPE SFX ENGINE (Web Audio API Procedural Synthesizer)
// Zero-latency, 0 KB external audio asset dependencies, works completely offline
// ============================================================================

import { getPalette, type SfxPalette, type SfxPaletteId } from "./audioCatalog";

class SoundscapeEngine {
  private ctx: AudioContext | null = null;
  private muted: boolean = true;
  private volume: number = 0.4;
  private listeners: Set<(muted: boolean) => void> = new Set();
  private paletteId: SfxPaletteId = "romantic-harp";
  private palette: SfxPalette = getPalette("romantic-harp")!;

  constructor() {
    this.muted = true;
  }

  // Initialize or resume AudioContext on first user interaction
  private getContext(): AudioContext | null {
    if (typeof window === "undefined") return null;

    if (!this.ctx) {
      const AudioCtxClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (AudioCtxClass) {
        this.ctx = new AudioCtxClass();
      }
    }

    if (this.ctx && this.ctx.state === "suspended") {
      this.ctx.resume().catch(() => {});
    }

    return this.ctx;
  }

  public isMuted(): boolean {
    return this.muted;
  }

  public toggleMute(): boolean {
    this.muted = !this.muted;
    if (typeof window !== "undefined") {
      localStorage.setItem("hk_sfx_muted", String(this.muted));
    }
    this.listeners.forEach((fn) => fn(this.muted));
    return this.muted;
  }

  public setMuted(muted: boolean): void {
    this.muted = muted;
    if (typeof window !== "undefined") {
      localStorage.setItem("hk_sfx_muted", String(this.muted));
    }
    this.listeners.forEach((fn) => fn(this.muted));
  }

  public subscribe(fn: (muted: boolean) => void): () => void {
    this.listeners.add(fn);
    return () => this.listeners.delete(fn);
  }

  // Ganti palette SFX yang aktif (romantic-harp | royal-gamelan | modern-pop | gentle-nature)
  public setPalette(id: SfxPaletteId): void {
    const next = getPalette(id);
    if (!next) return; // abaikan id tak dikenal, pertahankan palette sebelumnya
    this.paletteId = id;
    this.palette = next;
  }

  public getPaletteId(): SfxPaletteId {
    return this.paletteId;
  }

  // 1. Cover Card Open Sound (Paper friction / wax seal break + harmonic harp chord)
  public playCoverOpen(): void {
    if (this.muted) return;
    const ctx = this.getContext();
    if (!ctx) return;

    const now = ctx.currentTime;

    // A. Parchment noise burst
    try {
      const bufferSize = ctx.sampleRate * 0.15;
      const noiseBuffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
      const output = noiseBuffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) {
        output[i] = (Math.random() * 2 - 1) * Math.exp(-i / (bufferSize * 0.4));
      }

      const whiteNoise = ctx.createBufferSource();
      whiteNoise.buffer = noiseBuffer;

      const filter = ctx.createBiquadFilter();
      filter.type = "bandpass";
      filter.frequency.setValueAtTime(1200, now);
      filter.Q.setValueAtTime(1.5, now);

      const noiseGain = ctx.createGain();
      noiseGain.gain.setValueAtTime(this.volume * 0.35, now);
      noiseGain.gain.exponentialRampToValueAtTime(0.001, now + 0.15);

      whiteNoise.connect(filter);
      filter.connect(noiseGain);
      noiseGain.connect(ctx.destination);
      whiteNoise.start(now);
    } catch {
      // Noise buffer fallback
    }

    // B. Chord glissando mengikuti palette aktif
    const notes = this.palette.chord.intervals.map((semitones) =>
      this.palette.chord.base * Math.pow(2, semitones / 12),
    );
    notes.forEach((freq, idx) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = this.palette.chord.waveform;
      osc.frequency.setValueAtTime(freq, now + idx * 0.04);
      gain.gain.setValueAtTime(0.001, now + idx * 0.04);
      gain.gain.linearRampToValueAtTime(this.volume * 0.25, now + idx * 0.04 + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + idx * 0.04 + 0.8);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(now + idx * 0.04);
      osc.stop(now + idx * 0.04 + 0.85);
    });
  }

  // 2. Soft Tactile Tick (Button click, tab switch, gallery swipe)
  public playTick(): void {
    if (this.muted) return;
    const ctx = this.getContext();
    if (!ctx) return;

    const now = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = this.palette.tick.waveform;
    osc.frequency.setValueAtTime(this.palette.tick.freqA, now);
    osc.frequency.exponentialRampToValueAtTime(
      this.palette.tick.freqB,
      now + this.palette.tick.decayMs / 1000,
    );
    gain.gain.setValueAtTime(this.volume * 0.2, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + this.palette.tick.decayMs / 1000);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start(now);
    osc.stop(now + this.palette.tick.decayMs / 1000 + 0.005);
  }

  // 3. Gentle Crystal Chime (Section entered, modal open)
  public playChime(): void {
    if (this.muted) return;
    const ctx = this.getContext();
    if (!ctx) return;

    const now = ctx.currentTime;
    const freqs = this.palette.chime.freqs;

    freqs.forEach((f, i) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = this.palette.chime.waveform;
      osc.frequency.setValueAtTime(f, now + i * 0.03);

      gain.gain.setValueAtTime(this.volume * 0.2, now + i * 0.03);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + i * 0.03 + this.palette.chime.decayMs / 1000);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(now + i * 0.03);
      osc.stop(now + i * 0.03 + 0.65);
    });
  }

  // 4. Metallic Coin Shimmer (Copy bank account / QRIS clicked)
  public playCoin(): void {
    if (this.muted) return;
    const ctx = this.getContext();
    if (!ctx) return;

    const now = ctx.currentTime;
    // Two high resonant bells
    [1567.98, 2093.0].forEach((freq, idx) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = "triangle";
      osc.frequency.setValueAtTime(freq, now + idx * 0.07);

      gain.gain.setValueAtTime(this.volume * 0.3, now + idx * 0.07);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + idx * 0.07 + 0.5);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(now + idx * 0.07);
      osc.stop(now + idx * 0.07 + 0.55);
    });
  }

  // 5. Confetti Pop (Wish submit / RSVP confirmed)
  public playConfettiPop(): void {
    if (this.muted) return;
    const ctx = this.getContext();
    if (!ctx) return;

    const now = ctx.currentTime;

    // Pop low sweep
    const popOsc = ctx.createOscillator();
    const popGain = ctx.createGain();
    popOsc.type = "sine";
    popOsc.frequency.setValueAtTime(320, now);
    popOsc.frequency.exponentialRampToValueAtTime(70, now + 0.1);

    popGain.gain.setValueAtTime(this.volume * 0.45, now);
    popGain.gain.exponentialRampToValueAtTime(0.001, now + 0.1);

    popOsc.connect(popGain);
    popGain.connect(ctx.destination);

    popOsc.start(now);
    popOsc.stop(now + 0.12);

    // Celebratory sparkle arpeggio
    [1046.5, 1318.5, 1567.98, 2093.0].forEach((f, i) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = "sine";
      osc.frequency.setValueAtTime(f, now + 0.06 + i * 0.04);

      gain.gain.setValueAtTime(this.volume * 0.25, now + 0.06 + i * 0.04);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.06 + i * 0.04 + 0.4);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(now + 0.06 + i * 0.04);
      osc.stop(now + 0.06 + i * 0.04 + 0.45);
    });
  }

  // 6. Gamelan Slendro Chime (Adat Jawa & Cultural templates)
  public playGamelanBell(): void {
    if (this.muted) return;
    const ctx = this.getContext();
    if (!ctx) return;

    const now = ctx.currentTime;
    const partials = this.palette.chord.intervals.map((semitones, i) => ({
      freq: this.palette.chord.base * Math.pow(2, semitones / 12),
      gain: [0.3, 0.2, 0.15, 0.08, 0.05][i] ?? 0.05,
    }));

    partials.forEach((p) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = this.palette.chord.waveform;
      osc.frequency.setValueAtTime(p.freq, now);

      gain.gain.setValueAtTime(this.volume * p.gain, now);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + 1.2);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(now);
      osc.stop(now + 1.25);
    });
  }
}

export const soundscape = new SoundscapeEngine();
