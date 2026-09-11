// src/lib/templates/themeAssetRegistry.ts
/**
 * Master Theme Asset Registry for HariKita 64 Master Templates
 * Maps each template to verified pure vector SVG assets in /harikita-assets/
 */

export interface ThemeAssetBundle {
  heroCenterpiece: string;       // Primary header or centerpiece SVG
  cornerFiligree?: string;       // Corner accent SVG (optional)
  sectionDivider: string;        // Thematic horizontal section divider SVG
  cardBorder?: string;           // Border or card frame SVG (optional)
  backgroundGradient?: string;   // Subtle gradient or background texture SVG (optional)
  closingSeal?: string;          // Outro seal or stamp SVG (optional)
  heroSecondaryOrnament?: string;// Supporting accent (cascade / garland) (optional)
}

export const DEFAULT_ARCHETYPE_FALLBACKS: Record<string, ThemeAssetBundle> = {
  "botanical": {
    heroCenterpiece: "/harikita-assets/floral/centerpieces/centerpiece-bouquet-sage-01.svg",
    cornerFiligree: "/harikita-assets/frames/filigree-corners/filigree-ornament-floral-01.svg",
    sectionDivider: "/harikita-assets/frames/dividers-horizontal/divider-flourish-gold-01.svg",
    cardBorder: "/harikita-assets/frames/photo-frames/frame-photo-card-gold-01.svg",
    backgroundGradient: "/harikita-assets/backgrounds/gradients/bg-card-gradient-champagne-02.svg",
    closingSeal: "/harikita-assets/decorative/stamps-wax/stamp-ornament-cover-01.svg",
  },
  "javanese": {
    heroCenterpiece: "/harikita-assets/floral/roses/rose-olive-gold-01.svg",
    cornerFiligree: "/harikita-assets/frames/filigree-corners/filigree-corner-iceblue-01.svg",
    sectionDivider: "/harikita-assets/frames/dividers-horizontal/divider-flourish-gold-03.svg",
    cardBorder: "/harikita-assets/frames/full-cards/frame-full-card-gold-01.svg",
    backgroundGradient: "/harikita-assets/backgrounds/gradients/bg-card-gradient-champagne-03.svg",
    closingSeal: "/harikita-assets/decorative/stamps-wax/stamp-ornament-01.svg",
  },
  "islamic": {
    heroCenterpiece: "/harikita-assets/floral/headers-garlands/garland-header-blush-01.svg",
    cornerFiligree: "/harikita-assets/frames/filigree-corners/filigree-corner-teal-top.svg",
    sectionDivider: "/harikita-assets/frames/dividers-horizontal/divider-flourish-gold-04.svg",
    cardBorder: "/harikita-assets/frames/full-cards/frame-full-card-gold-02.svg",
    backgroundGradient: "/harikita-assets/backgrounds/gradients/bg-card-gradient-champagne-04.svg",
    closingSeal: "/harikita-assets/decorative/stamps-wax/stamp-ornament-02.svg",
  },
  "minimalist": {
    heroCenterpiece: "/harikita-assets/floral/roses/rose-dusty-blue-01.svg",
    cornerFiligree: "/harikita-assets/frames/filigree-corners/filigree-corner-line-01.svg",
    sectionDivider: "/harikita-assets/frames/dividers-horizontal/divider-flourish-gold-06.svg",
    cardBorder: "/harikita-assets/frames/full-cards/frame-full-card-gold-03.svg",
    backgroundGradient: "/harikita-assets/backgrounds/textures/bg-paper-texture-champagne-01.svg",
    closingSeal: "/harikita-assets/decorative/stamps-wax/stamp-ornament-story-01.svg",
  },
  "rose-gold": {
    heroCenterpiece: "/harikita-assets/floral/roses/rose-ivory-english-01.svg",
    cornerFiligree: "/harikita-assets/frames/filigree-corners/filigree-ornament-floral-02.svg",
    sectionDivider: "/harikita-assets/frames/dividers-horizontal/divider-flourish-gold-07.svg",
    cardBorder: "/harikita-assets/frames/photo-frames/frame-photo-card-gold-02.svg",
    backgroundGradient: "/harikita-assets/backgrounds/gradients/bg-card-gradient-blush-01.svg",
    closingSeal: "/harikita-assets/decorative/stamps-wax/stamp-ornament-cover-01.svg",
  },
  "celestial": {
    heroCenterpiece: "/harikita-assets/decorative/stars-sparkles/star-sparkle-gold-01.svg",
    cornerFiligree: "/harikita-assets/frames/filigree-corners/filigree-corner-iceblue-02.svg",
    sectionDivider: "/harikita-assets/frames/dividers-horizontal/divider-flourish-iceblue-05.svg",
    cardBorder: "/harikita-assets/frames/full-cards/frame-full-card-gold-04.svg",
    backgroundGradient: "/harikita-assets/backgrounds/gradients/bg-card-gradient-blue-01.svg",
    closingSeal: "/harikita-assets/decorative/stars-sparkles/sparkle-particle-01.svg",
  },
  "rustic": {
    heroCenterpiece: "/harikita-assets/floral/centerpieces/centerpiece-bouquet-terracotta-01.svg",
    cornerFiligree: "/harikita-assets/frames/filigree-corners/filigree-corner-iceblue-03.svg",
    sectionDivider: "/harikita-assets/frames/dividers-horizontal/divider-flourish-gold-08.svg",
    cardBorder: "/harikita-assets/frames/photo-frames/frame-photo-card-gold-03.svg",
    backgroundGradient: "/harikita-assets/backgrounds/textures/bg-paper-texture-champagne-02.svg",
    closingSeal: "/harikita-assets/decorative/stamps-wax/stamp-ornament-01.svg",
  },
  "cute-illustrated": {
    heroCenterpiece: "/harikita-assets/floral/centerpieces/centerpiece-bouquet-iceblue-74.svg",
    cornerFiligree: "/harikita-assets/frames/filigree-corners/filigree-corner-iceblue-04.svg",
    sectionDivider: "/harikita-assets/frames/dividers-horizontal/divider-flourish-gold-09.svg",
    cardBorder: "/harikita-assets/frames/full-cards/frame-full-card-message-01.svg",
    backgroundGradient: "/harikita-assets/backgrounds/gradients/bg-card-gradient-champagne-05.svg",
    closingSeal: "/harikita-assets/decorative/stamps-wax/stamp-ornament-story-01.svg",
  },
};

export const THEME_ASSET_REGISTRY: Record<string, ThemeAssetBundle> = {
  // ==========================================
  // 1. BOTANICAL ARCHETYPE (8 Presets)
  // ==========================================
  "autumnelle": {
    heroCenterpiece: "/harikita-assets/floral/centerpieces/centerpiece-bouquet-terracotta-02.svg",
    cornerFiligree: "/harikita-assets/frames/filigree-corners/filigree-ornament-floral-01.svg",
    sectionDivider: "/harikita-assets/frames/dividers-horizontal/divider-flourish-gold-01.svg",
    cardBorder: "/harikita-assets/frames/photo-frames/frame-photo-card-gold-01.svg",
    backgroundGradient: "/harikita-assets/backgrounds/gradients/bg-card-gradient-champagne-02.svg",
    closingSeal: "/harikita-assets/decorative/stamps-wax/stamp-ornament-cover-01.svg",
  },
  "tulivelle": {
    heroCenterpiece: "/harikita-assets/floral/centerpieces/centerpiece-bouquet-terracotta-03.svg",
    cornerFiligree: "/harikita-assets/frames/filigree-corners/filigree-ornament-floral-02.svg",
    sectionDivider: "/harikita-assets/frames/dividers-horizontal/divider-flourish-gold-03.svg",
    cardBorder: "/harikita-assets/frames/photo-frames/frame-photo-card-gold-02.svg",
    backgroundGradient: "/harikita-assets/backgrounds/gradients/bg-card-gradient-champagne-03.svg",
    closingSeal: "/harikita-assets/decorative/stamps-wax/stamp-ornament-01.svg",
  },
  "fiorella": {
    heroCenterpiece: "/harikita-assets/floral/roses/rose-champagne-peach-01.svg",
    cornerFiligree: "/harikita-assets/frames/filigree-corners/filigree-corner-iceblue-01.svg",
    sectionDivider: "/harikita-assets/frames/dividers-horizontal/divider-flourish-gold-04.svg",
    cardBorder: "/harikita-assets/frames/full-cards/frame-full-card-gold-01.svg",
    backgroundGradient: "/harikita-assets/backgrounds/gradients/bg-card-gradient-champagne-04.svg",
    closingSeal: "/harikita-assets/decorative/stamps-wax/stamp-ornament-02.svg",
  },
  "serenade-olive": {
    heroCenterpiece: "/harikita-assets/floral/roses/rose-olive-gold-01.svg",
    cornerFiligree: "/harikita-assets/frames/filigree-corners/filigree-corner-teal-top.svg",
    sectionDivider: "/harikita-assets/frames/dividers-horizontal/divider-flourish-gold-06.svg",
    cardBorder: "/harikita-assets/frames/photo-frames/frame-photo-card-gold-03.svg",
    backgroundGradient: "/harikita-assets/backgrounds/gradients/bg-card-gradient-champagne-05.svg",
    closingSeal: "/harikita-assets/decorative/stamps-wax/stamp-ornament-story-01.svg",
  },
  "serenade-dusty-rose": {
    heroCenterpiece: "/harikita-assets/floral/roses/rose-blush-mini-01.svg",
    cornerFiligree: "/harikita-assets/frames/filigree-corners/filigree-corner-iceblue-02.svg",
    sectionDivider: "/harikita-assets/frames/dividers-horizontal/divider-flourish-gold-07.svg",
    cardBorder: "/harikita-assets/frames/photo-frames/frame-photo-card-gold-04.svg",
    backgroundGradient: "/harikita-assets/backgrounds/gradients/bg-card-gradient-blush-01.svg",
    closingSeal: "/harikita-assets/decorative/stamps-wax/stamp-ornament-cover-01.svg",
  },
  "serenade-deep-moss": {
    heroCenterpiece: "/harikita-assets/floral/centerpieces/centerpiece-bouquet-sage-01.svg",
    cornerFiligree: "/harikita-assets/frames/filigree-corners/filigree-corner-line-01.svg",
    sectionDivider: "/harikita-assets/frames/dividers-horizontal/divider-flourish-gold-08.svg",
    cardBorder: "/harikita-assets/frames/full-cards/frame-full-card-gold-02.svg",
    backgroundGradient: "/harikita-assets/backgrounds/gradients/bg-card-gradient-champagne-06.svg",
    closingSeal: "/harikita-assets/decorative/stamps-wax/stamp-ornament-01.svg",
  },
  "celestine": {
    heroCenterpiece: "/harikita-assets/floral/roses/rose-dusty-blue-02.svg",
    cornerFiligree: "/harikita-assets/frames/filigree-corners/filigree-corner-iceblue-top-left.svg",
    sectionDivider: "/harikita-assets/frames/dividers-horizontal/divider-flourish-iceblue-05.svg",
    cardBorder: "/harikita-assets/frames/full-cards/frame-full-card-gold-03.svg",
    backgroundGradient: "/harikita-assets/backgrounds/gradients/bg-card-gradient-blue-01.svg",
    closingSeal: "/harikita-assets/decorative/stamps-wax/stamp-ornament-02.svg",
  },
  "botanica-terracotta": {
    heroCenterpiece: "/harikita-assets/floral/centerpieces/centerpiece-bouquet-terracotta-01.svg",
    cornerFiligree: "/harikita-assets/frames/filigree-corners/filigree-corner-iceblue-03.svg",
    sectionDivider: "/harikita-assets/frames/dividers-horizontal/divider-flourish-gold-09.svg",
    cardBorder: "/harikita-assets/frames/photo-frames/frame-photo-card-gold-05.svg",
    backgroundGradient: "/harikita-assets/backgrounds/textures/bg-paper-texture-champagne-01.svg",
    closingSeal: "/harikita-assets/decorative/stamps-wax/stamp-ornament-story-01.svg",
  },

  // ==========================================
  // 2. JAVANESE ARCHETYPE (8 Presets)
  // ==========================================
  "heritage-parang": {
    heroCenterpiece: "/harikita-assets/floral/roses/rose-bronze-gold-01.svg",
    cornerFiligree: "/harikita-assets/frames/filigree-corners/filigree-corner-iceblue-04.svg",
    sectionDivider: "/harikita-assets/frames/dividers-horizontal/divider-flourish-gold-10.svg",
    cardBorder: "/harikita-assets/frames/full-cards/frame-full-card-gold-04.svg",
    backgroundGradient: "/harikita-assets/backgrounds/gradients/bg-card-gradient-champagne-07.svg",
    closingSeal: "/harikita-assets/decorative/stamps-wax/stamp-ornament-cover-01.svg",
  },
  "javanese-azurite": {
    heroCenterpiece: "/harikita-assets/floral/roses/rose-dusty-blue-01.svg",
    cornerFiligree: "/harikita-assets/frames/filigree-corners/filigree-corner-iceblue-05.svg",
    sectionDivider: "/harikita-assets/frames/dividers-horizontal/divider-flourish-gold-11.svg",
    cardBorder: "/harikita-assets/frames/full-cards/frame-full-card-gold-05.svg",
    backgroundGradient: "/harikita-assets/backgrounds/gradients/bg-card-gradient-blue-01.svg",
    closingSeal: "/harikita-assets/decorative/stamps-wax/stamp-ornament-01.svg",
  },
  "javanese-teak": {
    heroCenterpiece: "/harikita-assets/floral/centerpieces/centerpiece-bouquet-terracotta-04.svg",
    cornerFiligree: "/harikita-assets/frames/filigree-corners/filigree-corner-iceblue-06.svg",
    sectionDivider: "/harikita-assets/frames/dividers-horizontal/divider-flourish-gold-12.svg",
    cardBorder: "/harikita-assets/frames/photo-frames/frame-photo-card-gold-06.svg",
    backgroundGradient: "/harikita-assets/backgrounds/textures/bg-paper-texture-champagne-02.svg",
    closingSeal: "/harikita-assets/decorative/stamps-wax/stamp-ornament-02.svg",
  },
  "javanese-ivory": {
    heroCenterpiece: "/harikita-assets/floral/roses/rose-ivory-english-01.svg",
    cornerFiligree: "/harikita-assets/frames/filigree-corners/filigree-ornament-floral-01.svg",
    sectionDivider: "/harikita-assets/frames/dividers-horizontal/divider-flourish-gold-13.svg",
    cardBorder: "/harikita-assets/frames/full-cards/frame-full-card-gold-06.svg",
    backgroundGradient: "/harikita-assets/backgrounds/gradients/bg-card-gradient-champagne-08.svg",
    closingSeal: "/harikita-assets/decorative/stamps-wax/stamp-ornament-story-01.svg",
  },
  "javanese-crimson": {
    heroCenterpiece: "/harikita-assets/floral/roses/rose-terracotta-01.svg",
    cornerFiligree: "/harikita-assets/frames/filigree-corners/filigree-corner-iceblue-07.svg",
    sectionDivider: "/harikita-assets/frames/dividers-horizontal/divider-flourish-gold-14.svg",
    cardBorder: "/harikita-assets/frames/photo-frames/frame-photo-card-gold-07.svg",
    backgroundGradient: "/harikita-assets/backgrounds/gradients/bg-card-gradient-blush-01.svg",
    closingSeal: "/harikita-assets/decorative/stamps-wax/stamp-ornament-cover-01.svg",
  },
  "javanese-garuda": {
    heroCenterpiece: "/harikita-assets/floral/headers-garlands/garland-header-blush-02.svg",
    cornerFiligree: "/harikita-assets/frames/filigree-corners/filigree-corner-iceblue-08.svg",
    sectionDivider: "/harikita-assets/frames/dividers-horizontal/divider-flourish-gold-18.svg",
    cardBorder: "/harikita-assets/frames/full-cards/frame-full-card-gold-07.svg",
    backgroundGradient: "/harikita-assets/backgrounds/gradients/bg-card-gradient-champagne-09.svg",
    closingSeal: "/harikita-assets/decorative/stamps-wax/stamp-ornament-01.svg",
  },
  "javanese-kebumen": {
    heroCenterpiece: "/harikita-assets/floral/centerpieces/centerpiece-bouquet-sage-02.svg",
    cornerFiligree: "/harikita-assets/frames/filigree-corners/filigree-corner-iceblue-09.svg",
    sectionDivider: "/harikita-assets/frames/dividers-horizontal/divider-flourish-gold-19.svg",
    cardBorder: "/harikita-assets/frames/full-cards/frame-full-card-gold-08.svg",
    backgroundGradient: "/harikita-assets/backgrounds/textures/bg-paper-texture-champagne-03.svg",
    closingSeal: "/harikita-assets/decorative/stamps-wax/stamp-ornament-02.svg",
  },
  "javanese-pearl": {
    heroCenterpiece: "/harikita-assets/floral/roses/rose-ivory-english-01.svg",
    cornerFiligree: "/harikita-assets/frames/filigree-corners/filigree-corner-iceblue-10.svg",
    sectionDivider: "/harikita-assets/frames/dividers-horizontal/divider-flourish-gold-20.svg",
    cardBorder: "/harikita-assets/frames/photo-frames/frame-photo-card-gold-01.svg",
    backgroundGradient: "/harikita-assets/backgrounds/gradients/bg-card-gradient-champagne-02.svg",
    closingSeal: "/harikita-assets/decorative/stamps-wax/stamp-ornament-story-01.svg",
  },

  // ==========================================
  // 3. ISLAMIC ARCHETYPE (8 Presets)
  // ==========================================
  "arabesque-royal": {
    heroCenterpiece: "/harikita-assets/floral/headers-garlands/garland-header-blush-03.svg",
    cornerFiligree: "/harikita-assets/frames/filigree-corners/filigree-corner-teal-top.svg",
    sectionDivider: "/harikita-assets/frames/dividers-horizontal/divider-flourish-gold-01.svg",
    cardBorder: "/harikita-assets/frames/full-cards/frame-full-card-gold-01.svg",
    backgroundGradient: "/harikita-assets/backgrounds/gradients/bg-card-gradient-champagne-03.svg",
    closingSeal: "/harikita-assets/decorative/stamps-wax/stamp-ornament-cover-01.svg",
  },
  "emerald-syari": {
    heroCenterpiece: "/harikita-assets/floral/centerpieces/centerpiece-bouquet-sage-01.svg",
    cornerFiligree: "/harikita-assets/frames/filigree-corners/filigree-corner-teal-bottom.svg",
    sectionDivider: "/harikita-assets/frames/dividers-horizontal/divider-flourish-gold-03.svg",
    cardBorder: "/harikita-assets/frames/full-cards/frame-full-card-gold-02.svg",
    backgroundGradient: "/harikita-assets/backgrounds/gradients/bg-card-gradient-champagne-04.svg",
    closingSeal: "/harikita-assets/decorative/stamps-wax/stamp-ornament-01.svg",
  },
  "walimatul-ursy": {
    heroCenterpiece: "/harikita-assets/floral/headers-garlands/garland-header-blush-04.svg",
    cornerFiligree: "/harikita-assets/frames/filigree-corners/filigree-corner-iceblue-top-right.svg",
    sectionDivider: "/harikita-assets/frames/dividers-horizontal/divider-flourish-gold-04.svg",
    cardBorder: "/harikita-assets/frames/photo-frames/frame-photo-card-gold-02.svg",
    backgroundGradient: "/harikita-assets/backgrounds/gradients/bg-card-gradient-champagne-05.svg",
    closingSeal: "/harikita-assets/decorative/stamps-wax/stamp-ornament-02.svg",
  },
  "al-fatih": {
    heroCenterpiece: "/harikita-assets/floral/centerpieces/centerpiece-bouquet-terracotta-05.svg",
    cornerFiligree: "/harikita-assets/frames/filigree-corners/filigree-corner-iceblue-bottom-left.svg",
    sectionDivider: "/harikita-assets/frames/dividers-horizontal/divider-flourish-gold-06.svg",
    cardBorder: "/harikita-assets/frames/full-cards/frame-full-card-gold-03.svg",
    backgroundGradient: "/harikita-assets/backgrounds/gradients/bg-card-gradient-champagne-06.svg",
    closingSeal: "/harikita-assets/decorative/stamps-wax/stamp-ornament-story-01.svg",
  },
  "salsabila": {
    heroCenterpiece: "/harikita-assets/floral/centerpieces/centerpiece-bouquet-iceblue-74.svg",
    cornerFiligree: "/harikita-assets/frames/filigree-corners/filigree-corner-iceblue-bottom-right.svg",
    sectionDivider: "/harikita-assets/frames/dividers-horizontal/divider-flourish-iceblue-05.svg",
    cardBorder: "/harikita-assets/frames/photo-frames/frame-photo-card-gold-03.svg",
    backgroundGradient: "/harikita-assets/backgrounds/gradients/bg-card-gradient-blue-01.svg",
    closingSeal: "/harikita-assets/decorative/stamps-wax/stamp-ornament-cover-01.svg",
  },
  "ar-rahman": {
    heroCenterpiece: "/harikita-assets/floral/headers-garlands/garland-header-blush-05.svg",
    cornerFiligree: "/harikita-assets/frames/filigree-corners/filigree-corner-line-01.svg",
    sectionDivider: "/harikita-assets/frames/dividers-horizontal/divider-flourish-gold-07.svg",
    cardBorder: "/harikita-assets/frames/full-cards/frame-full-card-gold-04.svg",
    backgroundGradient: "/harikita-assets/backgrounds/gradients/bg-card-gradient-champagne-07.svg",
    closingSeal: "/harikita-assets/decorative/stamps-wax/stamp-ornament-01.svg",
  },
  "nur-jannah": {
    heroCenterpiece: "/harikita-assets/floral/roses/rose-ivory-english-01.svg",
    cornerFiligree: "/harikita-assets/frames/filigree-corners/filigree-ornament-floral-01.svg",
    sectionDivider: "/harikita-assets/frames/dividers-horizontal/divider-flourish-gold-08.svg",
    cardBorder: "/harikita-assets/frames/photo-frames/frame-photo-card-gold-04.svg",
    backgroundGradient: "/harikita-assets/backgrounds/textures/bg-paper-texture-champagne-04.svg",
    closingSeal: "/harikita-assets/decorative/stamps-wax/stamp-ornament-02.svg",
  },
  "barakah-gold": {
    heroCenterpiece: "/harikita-assets/floral/roses/rose-champagne-peach-01.svg",
    cornerFiligree: "/harikita-assets/frames/filigree-corners/filigree-ornament-floral-02.svg",
    sectionDivider: "/harikita-assets/frames/dividers-horizontal/divider-flourish-gold-09.svg",
    cardBorder: "/harikita-assets/frames/full-cards/frame-full-card-gold-05.svg",
    backgroundGradient: "/harikita-assets/backgrounds/gradients/bg-card-gradient-champagne-08.svg",
    closingSeal: "/harikita-assets/decorative/stamps-wax/stamp-ornament-story-01.svg",
  },

  // ==========================================
  // 4. MINIMALIST ARCHETYPE (8 Presets)
  // ==========================================
  "editorial-vogue": {
    heroCenterpiece: "/harikita-assets/floral/roses/rose-dusty-blue-01.svg",
    cornerFiligree: "/harikita-assets/frames/filigree-corners/filigree-corner-line-01.svg",
    sectionDivider: "/harikita-assets/frames/dividers-horizontal/divider-flourish-gold-10.svg",
    cardBorder: "/harikita-assets/frames/full-cards/frame-full-card-gold-06.svg",
    backgroundGradient: "/harikita-assets/backgrounds/textures/bg-paper-texture-champagne-01.svg",
    closingSeal: "/harikita-assets/decorative/stamps-wax/stamp-ornament-01.svg",
  },
  "minimal-noir": {
    heroCenterpiece: "/harikita-assets/floral/roses/rose-bronze-gold-01.svg",
    cornerFiligree: "/harikita-assets/frames/filigree-corners/filigree-corner-iceblue-01.svg",
    sectionDivider: "/harikita-assets/frames/dividers-horizontal/divider-flourish-gold-11.svg",
    cardBorder: "/harikita-assets/frames/full-cards/frame-full-card-gold-07.svg",
    backgroundGradient: "/harikita-assets/backgrounds/textures/bg-paper-texture-champagne-05.svg",
    closingSeal: "/harikita-assets/decorative/stamps-wax/stamp-ornament-02.svg",
  },
  "kinfolk-odyssey": {
    heroCenterpiece: "/harikita-assets/floral/centerpieces/centerpiece-bouquet-terracotta-06.svg",
    cornerFiligree: "/harikita-assets/frames/filigree-corners/filigree-corner-iceblue-02.svg",
    sectionDivider: "/harikita-assets/frames/dividers-horizontal/divider-flourish-gold-12.svg",
    cardBorder: "/harikita-assets/frames/photo-frames/frame-photo-card-gold-05.svg",
    backgroundGradient: "/harikita-assets/backgrounds/textures/bg-paper-texture-champagne-02.svg",
    closingSeal: "/harikita-assets/decorative/stamps-wax/stamp-ornament-story-01.svg",
  },
  "blanc-pure": {
    heroCenterpiece: "/harikita-assets/floral/roses/rose-ivory-english-01.svg",
    cornerFiligree: "/harikita-assets/frames/filigree-corners/filigree-corner-line-01.svg",
    sectionDivider: "/harikita-assets/frames/dividers-horizontal/divider-flourish-gold-13.svg",
    cardBorder: "/harikita-assets/frames/photo-frames/frame-photo-card-gold-06.svg",
    backgroundGradient: "/harikita-assets/backgrounds/gradients/bg-card-gradient-champagne-02.svg",
    closingSeal: "/harikita-assets/decorative/stamps-wax/stamp-ornament-cover-01.svg",
  },
  "harmony-gray": {
    heroCenterpiece: "/harikita-assets/floral/roses/rose-dusty-blue-02.svg",
    cornerFiligree: "/harikita-assets/frames/filigree-corners/filigree-corner-iceblue-03.svg",
    sectionDivider: "/harikita-assets/frames/dividers-horizontal/divider-flourish-gold-14.svg",
    cardBorder: "/harikita-assets/frames/full-cards/frame-full-card-gold-08.svg",
    backgroundGradient: "/harikita-assets/backgrounds/textures/bg-paper-texture-champagne-03.svg",
    closingSeal: "/harikita-assets/decorative/stamps-wax/stamp-ornament-01.svg",
  },
  "clay-peak": {
    heroCenterpiece: "/harikita-assets/floral/centerpieces/centerpiece-bouquet-terracotta-07.svg",
    cornerFiligree: "/harikita-assets/frames/filigree-corners/filigree-corner-iceblue-04.svg",
    sectionDivider: "/harikita-assets/frames/dividers-horizontal/divider-flourish-gold-18.svg",
    cardBorder: "/harikita-assets/frames/photo-frames/frame-photo-card-gold-07.svg",
    backgroundGradient: "/harikita-assets/backgrounds/textures/bg-paper-texture-champagne-06.svg",
    closingSeal: "/harikita-assets/decorative/stamps-wax/stamp-ornament-02.svg",
  },
  "marble-mist": {
    heroCenterpiece: "/harikita-assets/floral/centerpieces/centerpiece-bouquet-sage-02.svg",
    cornerFiligree: "/harikita-assets/frames/filigree-corners/filigree-corner-iceblue-05.svg",
    sectionDivider: "/harikita-assets/frames/dividers-horizontal/divider-flourish-gold-19.svg",
    cardBorder: "/harikita-assets/frames/full-cards/frame-full-card-gold-01.svg",
    backgroundGradient: "/harikita-assets/backgrounds/gradients/bg-card-gradient-champagne-09.svg",
    closingSeal: "/harikita-assets/decorative/stamps-wax/stamp-ornament-story-01.svg",
  },
  "serenity-sky": {
    heroCenterpiece: "/harikita-assets/floral/headers-garlands/garland-header-blush-06.svg",
    cornerFiligree: "/harikita-assets/frames/filigree-corners/filigree-corner-iceblue-06.svg",
    sectionDivider: "/harikita-assets/frames/dividers-horizontal/divider-flourish-iceblue-05.svg",
    cardBorder: "/harikita-assets/frames/full-cards/frame-full-card-gold-02.svg",
    backgroundGradient: "/harikita-assets/backgrounds/gradients/bg-card-gradient-blue-01.svg",
    closingSeal: "/harikita-assets/decorative/stamps-wax/stamp-ornament-cover-01.svg",
  },

  // ==========================================
  // 5. ROSE GOLD & ROYAL FOIL (8 Presets)
  // ==========================================
  "aurum-velvet": {
    heroCenterpiece: "/harikita-assets/floral/roses/rose-ivory-english-01.svg",
    cornerFiligree: "/harikita-assets/frames/filigree-corners/filigree-ornament-floral-01.svg",
    sectionDivider: "/harikita-assets/frames/dividers-horizontal/divider-flourish-gold-20.svg",
    cardBorder: "/harikita-assets/frames/photo-frames/frame-photo-card-gold-01.svg",
    backgroundGradient: "/harikita-assets/backgrounds/gradients/bg-card-gradient-blush-01.svg",
    closingSeal: "/harikita-assets/decorative/stamps-wax/stamp-ornament-cover-01.svg",
  },
  "glamour-grey": {
    heroCenterpiece: "/harikita-assets/floral/roses/rose-dusty-blue-01.svg",
    cornerFiligree: "/harikita-assets/frames/filigree-corners/filigree-corner-iceblue-07.svg",
    sectionDivider: "/harikita-assets/frames/dividers-horizontal/divider-flourish-gold-21.svg",
    cardBorder: "/harikita-assets/frames/full-cards/frame-full-card-gold-03.svg",
    backgroundGradient: "/harikita-assets/backgrounds/gradients/bg-card-gradient-champagne-02.svg",
    closingSeal: "/harikita-assets/decorative/stamps-wax/stamp-ornament-01.svg",
  },
  "black-diamond": {
    heroCenterpiece: "/harikita-assets/floral/roses/rose-bronze-gold-01.svg",
    cornerFiligree: "/harikita-assets/frames/filigree-corners/filigree-corner-iceblue-08.svg",
    sectionDivider: "/harikita-assets/frames/dividers-horizontal/divider-flourish-gold-01.svg",
    cardBorder: "/harikita-assets/frames/full-cards/frame-full-card-gold-04.svg",
    backgroundGradient: "/harikita-assets/backgrounds/textures/bg-paper-texture-champagne-04.svg",
    closingSeal: "/harikita-assets/decorative/stamps-wax/stamp-ornament-02.svg",
  },
  "burgundy-bliss": {
    heroCenterpiece: "/harikita-assets/floral/roses/rose-terracotta-01.svg",
    cornerFiligree: "/harikita-assets/frames/filigree-corners/filigree-corner-iceblue-09.svg",
    sectionDivider: "/harikita-assets/frames/dividers-horizontal/divider-flourish-gold-03.svg",
    cardBorder: "/harikita-assets/frames/photo-frames/frame-photo-card-gold-02.svg",
    backgroundGradient: "/harikita-assets/backgrounds/gradients/bg-card-gradient-blush-01.svg",
    closingSeal: "/harikita-assets/decorative/stamps-wax/stamp-ornament-story-01.svg",
  },
  "emerald-seafoam": {
    heroCenterpiece: "/harikita-assets/floral/centerpieces/centerpiece-bouquet-sage-01.svg",
    cornerFiligree: "/harikita-assets/frames/filigree-corners/filigree-corner-teal-top.svg",
    sectionDivider: "/harikita-assets/frames/dividers-horizontal/divider-flourish-gold-04.svg",
    cardBorder: "/harikita-assets/frames/full-cards/frame-full-card-gold-05.svg",
    backgroundGradient: "/harikita-assets/backgrounds/gradients/bg-card-gradient-champagne-03.svg",
    closingSeal: "/harikita-assets/decorative/stamps-wax/stamp-ornament-cover-01.svg",
  },
  "royal-amethyst": {
    heroCenterpiece: "/harikita-assets/floral/roses/rose-lilac-lavender-01.svg",
    cornerFiligree: "/harikita-assets/frames/filigree-corners/filigree-corner-iceblue-10.svg",
    sectionDivider: "/harikita-assets/frames/dividers-horizontal/divider-flourish-gold-06.svg",
    cardBorder: "/harikita-assets/frames/photo-frames/frame-photo-card-gold-03.svg",
    backgroundGradient: "/harikita-assets/backgrounds/gradients/bg-card-gradient-blush-01.svg",
    closingSeal: "/harikita-assets/decorative/stamps-wax/stamp-ornament-01.svg",
  },
  "copper-canyon": {
    heroCenterpiece: "/harikita-assets/floral/centerpieces/centerpiece-bouquet-terracotta-01.svg",
    cornerFiligree: "/harikita-assets/frames/filigree-corners/filigree-corner-iceblue-01.svg",
    sectionDivider: "/harikita-assets/frames/dividers-horizontal/divider-flourish-gold-07.svg",
    cardBorder: "/harikita-assets/frames/full-cards/frame-full-card-gold-06.svg",
    backgroundGradient: "/harikita-assets/backgrounds/textures/bg-paper-texture-champagne-01.svg",
    closingSeal: "/harikita-assets/decorative/stamps-wax/stamp-ornament-02.svg",
  },
  "midnight-gilded": {
    heroCenterpiece: "/harikita-assets/floral/headers-garlands/garland-header-blush-07.svg",
    cornerFiligree: "/harikita-assets/frames/filigree-corners/filigree-ornament-floral-02.svg",
    sectionDivider: "/harikita-assets/frames/dividers-horizontal/divider-flourish-gold-08.svg",
    cardBorder: "/harikita-assets/frames/full-cards/frame-full-card-gold-07.svg",
    backgroundGradient: "/harikita-assets/backgrounds/gradients/bg-card-gradient-champagne-04.svg",
    closingSeal: "/harikita-assets/decorative/stamps-wax/stamp-ornament-story-01.svg",
  },

  // ==========================================
  // 6. CELESTIAL ARCHETYPE (8 Presets)
  // ==========================================
  "celestial-starlight": {
    heroCenterpiece: "/harikita-assets/decorative/stars-sparkles/star-sparkle-gold-01.svg",
    cornerFiligree: "/harikita-assets/frames/filigree-corners/filigree-corner-iceblue-top-left.svg",
    sectionDivider: "/harikita-assets/frames/dividers-horizontal/divider-flourish-iceblue-05.svg",
    cardBorder: "/harikita-assets/frames/full-cards/frame-full-card-gold-08.svg",
    backgroundGradient: "/harikita-assets/backgrounds/gradients/bg-card-gradient-blue-01.svg",
    closingSeal: "/harikita-assets/decorative/stars-sparkles/sparkle-particle-01.svg",
  },
  "lunar-aurora": {
    heroCenterpiece: "/harikita-assets/decorative/stars-sparkles/star-sparkle-gold-01.svg",
    cornerFiligree: "/harikita-assets/frames/filigree-corners/filigree-corner-iceblue-top-right.svg",
    sectionDivider: "/harikita-assets/frames/dividers-horizontal/divider-flourish-gold-09.svg",
    cardBorder: "/harikita-assets/frames/photo-frames/frame-photo-card-gold-04.svg",
    backgroundGradient: "/harikita-assets/backgrounds/gradients/bg-card-gradient-blue-01.svg",
    closingSeal: "/harikita-assets/decorative/stamps-wax/stamp-ornament-cover-01.svg",
  },
  "midnight-galaxy": {
    heroCenterpiece: "/harikita-assets/decorative/stars-sparkles/star-sparkle-gold-01.svg",
    cornerFiligree: "/harikita-assets/frames/filigree-corners/filigree-corner-iceblue-bottom-left.svg",
    sectionDivider: "/harikita-assets/frames/dividers-horizontal/divider-flourish-gold-10.svg",
    cardBorder: "/harikita-assets/frames/full-cards/frame-full-card-gold-01.svg",
    backgroundGradient: "/harikita-assets/backgrounds/gradients/bg-card-gradient-champagne-05.svg",
    closingSeal: "/harikita-assets/decorative/stars-sparkles/sparkle-particle-01.svg",
  },
  "cosmic-romance": {
    heroCenterpiece: "/harikita-assets/decorative/stars-sparkles/star-sparkle-gold-01.svg",
    cornerFiligree: "/harikita-assets/frames/filigree-corners/filigree-corner-iceblue-bottom-right.svg",
    sectionDivider: "/harikita-assets/frames/dividers-horizontal/divider-flourish-gold-11.svg",
    cardBorder: "/harikita-assets/frames/photo-frames/frame-photo-card-gold-05.svg",
    backgroundGradient: "/harikita-assets/backgrounds/gradients/bg-card-gradient-blue-01.svg",
    closingSeal: "/harikita-assets/decorative/stamps-wax/stamp-ornament-01.svg",
  },
  "astral-whisper": {
    heroCenterpiece: "/harikita-assets/decorative/stars-sparkles/star-sparkle-gold-01.svg",
    cornerFiligree: "/harikita-assets/frames/filigree-corners/filigree-corner-line-01.svg",
    sectionDivider: "/harikita-assets/frames/dividers-horizontal/divider-flourish-iceblue-05.svg",
    cardBorder: "/harikita-assets/frames/full-cards/frame-full-card-gold-02.svg",
    backgroundGradient: "/harikita-assets/backgrounds/gradients/bg-card-gradient-champagne-06.svg",
    closingSeal: "/harikita-assets/decorative/stamps-wax/stamp-ornament-02.svg",
  },
  "solstice-glow": {
    heroCenterpiece: "/harikita-assets/floral/roses/rose-bronze-gold-01.svg",
    cornerFiligree: "/harikita-assets/frames/filigree-corners/filigree-corner-iceblue-02.svg",
    sectionDivider: "/harikita-assets/frames/dividers-horizontal/divider-flourish-gold-12.svg",
    cardBorder: "/harikita-assets/frames/photo-frames/frame-photo-card-gold-06.svg",
    backgroundGradient: "/harikita-assets/backgrounds/gradients/bg-card-gradient-champagne-07.svg",
    closingSeal: "/harikita-assets/decorative/stars-sparkles/sparkle-particle-01.svg",
  },
  "nebula-dust": {
    heroCenterpiece: "/harikita-assets/decorative/stars-sparkles/star-sparkle-gold-01.svg",
    cornerFiligree: "/harikita-assets/frames/filigree-corners/filigree-corner-iceblue-03.svg",
    sectionDivider: "/harikita-assets/frames/dividers-horizontal/divider-flourish-gold-13.svg",
    cardBorder: "/harikita-assets/frames/full-cards/frame-full-card-gold-03.svg",
    backgroundGradient: "/harikita-assets/backgrounds/gradients/bg-card-gradient-blue-01.svg",
    closingSeal: "/harikita-assets/decorative/stamps-wax/stamp-ornament-story-01.svg",
  },
  "orion-constellation": {
    heroCenterpiece: "/harikita-assets/decorative/stars-sparkles/star-sparkle-gold-01.svg",
    cornerFiligree: "/harikita-assets/frames/filigree-corners/filigree-corner-iceblue-04.svg",
    sectionDivider: "/harikita-assets/frames/dividers-horizontal/divider-flourish-iceblue-05.svg",
    cardBorder: "/harikita-assets/frames/photo-frames/frame-photo-card-gold-07.svg",
    backgroundGradient: "/harikita-assets/backgrounds/gradients/bg-card-gradient-champagne-08.svg",
    closingSeal: "/harikita-assets/decorative/stamps-wax/stamp-ornament-cover-01.svg",
  },

  // ==========================================
  // 7. RUSTIC ARCHETYPE (8 Presets)
  // ==========================================
  "rustic-wood": {
    heroCenterpiece: "/harikita-assets/floral/centerpieces/centerpiece-bouquet-sage-01.svg",
    cornerFiligree: "/harikita-assets/frames/filigree-corners/filigree-corner-iceblue-05.svg",
    sectionDivider: "/harikita-assets/frames/dividers-horizontal/divider-flourish-gold-14.svg",
    cardBorder: "/harikita-assets/frames/photo-frames/frame-photo-card-gold-01.svg",
    backgroundGradient: "/harikita-assets/backgrounds/textures/bg-paper-texture-champagne-01.svg",
    closingSeal: "/harikita-assets/decorative/stamps-wax/stamp-ornament-01.svg",
  },
  "boho-terracotta": {
    heroCenterpiece: "/harikita-assets/floral/side-cascades/cascade-side-terracotta-01.svg",
    cornerFiligree: "/harikita-assets/frames/filigree-corners/filigree-corner-iceblue-06.svg",
    sectionDivider: "/harikita-assets/frames/dividers-horizontal/divider-flourish-gold-18.svg",
    cardBorder: "/harikita-assets/frames/full-cards/frame-full-card-gold-04.svg",
    backgroundGradient: "/harikita-assets/backgrounds/textures/bg-paper-texture-champagne-02.svg",
    closingSeal: "/harikita-assets/decorative/stamps-wax/stamp-ornament-02.svg",
  },
  "pampas-grass": {
    heroCenterpiece: "/harikita-assets/floral/centerpieces/centerpiece-bouquet-terracotta-01.svg",
    cornerFiligree: "/harikita-assets/frames/filigree-corners/filigree-corner-iceblue-07.svg",
    sectionDivider: "/harikita-assets/frames/dividers-horizontal/divider-flourish-gold-19.svg",
    cardBorder: "/harikita-assets/frames/photo-frames/frame-photo-card-gold-02.svg",
    backgroundGradient: "/harikita-assets/backgrounds/textures/bg-paper-texture-champagne-03.svg",
    closingSeal: "/harikita-assets/decorative/stamps-wax/stamp-ornament-story-01.svg",
  },
  "vintage-kraft": {
    heroCenterpiece: "/harikita-assets/floral/roses/rose-rustic-blossom-01.svg",
    cornerFiligree: "/harikita-assets/frames/filigree-corners/filigree-corner-line-01.svg",
    sectionDivider: "/harikita-assets/frames/dividers-horizontal/divider-flourish-gold-20.svg",
    cardBorder: "/harikita-assets/frames/full-cards/frame-full-card-gold-05.svg",
    backgroundGradient: "/harikita-assets/backgrounds/textures/bg-paper-texture-champagne-04.svg",
    closingSeal: "/harikita-assets/decorative/stamps-wax/stamp-ornament-cover-01.svg",
  },
  "rustic-macrame": {
    heroCenterpiece: "/harikita-assets/floral/headers-garlands/garland-header-blush-08.svg",
    cornerFiligree: "/harikita-assets/frames/filigree-corners/filigree-corner-iceblue-08.svg",
    sectionDivider: "/harikita-assets/frames/dividers-horizontal/divider-flourish-gold-21.svg",
    cardBorder: "/harikita-assets/frames/photo-frames/frame-photo-card-gold-03.svg",
    backgroundGradient: "/harikita-assets/backgrounds/textures/bg-paper-texture-champagne-05.svg",
    closingSeal: "/harikita-assets/decorative/stamps-wax/stamp-ornament-01.svg",
  },
  "wildflower-meadow": {
    heroCenterpiece: "/harikita-assets/floral/centerpieces/centerpiece-bouquet-sage-02.svg",
    cornerFiligree: "/harikita-assets/frames/filigree-corners/filigree-ornament-floral-01.svg",
    sectionDivider: "/harikita-assets/frames/dividers-horizontal/divider-flourish-gold-01.svg",
    cardBorder: "/harikita-assets/frames/full-cards/frame-full-card-gold-06.svg",
    backgroundGradient: "/harikita-assets/backgrounds/gradients/bg-card-gradient-champagne-02.svg",
    closingSeal: "/harikita-assets/decorative/stamps-wax/stamp-ornament-02.svg",
  },
  "desert-dune": {
    heroCenterpiece: "/harikita-assets/floral/centerpieces/centerpiece-bouquet-terracotta-02.svg",
    cornerFiligree: "/harikita-assets/frames/filigree-corners/filigree-corner-iceblue-09.svg",
    sectionDivider: "/harikita-assets/frames/dividers-horizontal/divider-flourish-gold-03.svg",
    cardBorder: "/harikita-assets/frames/photo-frames/frame-photo-card-gold-04.svg",
    backgroundGradient: "/harikita-assets/backgrounds/textures/bg-paper-texture-champagne-06.svg",
    closingSeal: "/harikita-assets/decorative/stamps-wax/stamp-ornament-story-01.svg",
  },
  "warm-amber": {
    heroCenterpiece: "/harikita-assets/floral/roses/rose-terracotta-01.svg",
    cornerFiligree: "/harikita-assets/frames/filigree-corners/filigree-corner-iceblue-10.svg",
    sectionDivider: "/harikita-assets/frames/dividers-horizontal/divider-flourish-gold-04.svg",
    cardBorder: "/harikita-assets/frames/full-cards/frame-full-card-gold-07.svg",
    backgroundGradient: "/harikita-assets/backgrounds/gradients/bg-card-gradient-champagne-03.svg",
    closingSeal: "/harikita-assets/decorative/stamps-wax/stamp-ornament-cover-01.svg",
  },

  // ==========================================
  // 8. CUTE ILLUSTRATED ARCHETYPE (8 Presets)
  // ==========================================
  "storybook-garden": {
    heroCenterpiece: "/harikita-assets/floral/centerpieces/centerpiece-bouquet-iceblue-74.svg",
    cornerFiligree: "/harikita-assets/frames/filigree-corners/filigree-corner-iceblue-01.svg",
    sectionDivider: "/harikita-assets/frames/dividers-horizontal/divider-flourish-gold-06.svg",
    cardBorder: "/harikita-assets/frames/full-cards/frame-full-card-message-01.svg",
    backgroundGradient: "/harikita-assets/backgrounds/gradients/bg-card-gradient-champagne-04.svg",
    closingSeal: "/harikita-assets/decorative/stamps-wax/stamp-ornament-01.svg",
  },
  "pastel-watercolor": {
    heroCenterpiece: "/harikita-assets/floral/roses/rose-champagne-peach-01.svg",
    cornerFiligree: "/harikita-assets/frames/filigree-corners/filigree-corner-iceblue-02.svg",
    sectionDivider: "/harikita-assets/frames/dividers-horizontal/divider-flourish-gold-07.svg",
    cardBorder: "/harikita-assets/frames/photo-frames/frame-photo-card-gold-05.svg",
    backgroundGradient: "/harikita-assets/backgrounds/gradients/bg-card-gradient-blush-01.svg",
    closingSeal: "/harikita-assets/decorative/stamps-wax/stamp-ornament-02.svg",
  },
  "whimsical-bloom": {
    heroCenterpiece: "/harikita-assets/floral/centerpieces/centerpiece-bouquet-terracotta-03.svg",
    cornerFiligree: "/harikita-assets/frames/filigree-corners/filigree-ornament-floral-02.svg",
    sectionDivider: "/harikita-assets/frames/dividers-horizontal/divider-flourish-gold-08.svg",
    cardBorder: "/harikita-assets/frames/full-cards/frame-full-card-gold-08.svg",
    backgroundGradient: "/harikita-assets/backgrounds/gradients/bg-card-gradient-champagne-05.svg",
    closingSeal: "/harikita-assets/decorative/stamps-wax/stamp-ornament-story-01.svg",
  },
  "cozy-cottage": {
    heroCenterpiece: "/harikita-assets/floral/headers-garlands/garland-header-blush-09.svg",
    cornerFiligree: "/harikita-assets/frames/filigree-corners/filigree-corner-iceblue-03.svg",
    sectionDivider: "/harikita-assets/frames/dividers-horizontal/divider-flourish-gold-09.svg",
    cardBorder: "/harikita-assets/frames/photo-frames/frame-photo-card-gold-06.svg",
    backgroundGradient: "/harikita-assets/backgrounds/textures/bg-paper-texture-champagne-01.svg",
    closingSeal: "/harikita-assets/decorative/stamps-wax/stamp-ornament-cover-01.svg",
  },
  "charming-doodle": {
    heroCenterpiece: "/harikita-assets/floral/roses/rose-blush-mini-01.svg",
    cornerFiligree: "/harikita-assets/frames/filigree-corners/filigree-corner-line-01.svg",
    sectionDivider: "/harikita-assets/frames/dividers-horizontal/divider-flourish-gold-10.svg",
    cardBorder: "/harikita-assets/frames/full-cards/frame-full-card-message-01.svg",
    backgroundGradient: "/harikita-assets/backgrounds/gradients/bg-card-gradient-champagne-06.svg",
    closingSeal: "/harikita-assets/decorative/stamps-wax/stamp-ornament-01.svg",
  },
  "playful-meadow": {
    heroCenterpiece: "/harikita-assets/floral/centerpieces/centerpiece-bouquet-sage-01.svg",
    cornerFiligree: "/harikita-assets/frames/filigree-corners/filigree-corner-iceblue-04.svg",
    sectionDivider: "/harikita-assets/frames/dividers-horizontal/divider-flourish-gold-11.svg",
    cardBorder: "/harikita-assets/frames/photo-frames/frame-photo-card-gold-07.svg",
    backgroundGradient: "/harikita-assets/backgrounds/gradients/bg-card-gradient-champagne-07.svg",
    closingSeal: "/harikita-assets/decorative/stamps-wax/stamp-ornament-02.svg",
  },
  "fairytale-dream": {
    heroCenterpiece: "/harikita-assets/floral/headers-garlands/garland-header-blush-10.svg",
    cornerFiligree: "/harikita-assets/frames/filigree-corners/filigree-corner-iceblue-05.svg",
    sectionDivider: "/harikita-assets/frames/dividers-horizontal/divider-flourish-gold-12.svg",
    cardBorder: "/harikita-assets/frames/full-cards/frame-full-card-gold-01.svg",
    backgroundGradient: "/harikita-assets/backgrounds/gradients/bg-card-gradient-blue-01.svg",
    closingSeal: "/harikita-assets/decorative/stamps-wax/stamp-ornament-story-01.svg",
  },
  "sweet-wonder": {
    heroCenterpiece: "/harikita-assets/floral/centerpieces/centerpiece-bouquet-terracotta-04.svg",
    cornerFiligree: "/harikita-assets/frames/filigree-corners/filigree-corner-iceblue-06.svg",
    sectionDivider: "/harikita-assets/frames/dividers-horizontal/divider-flourish-gold-13.svg",
    cardBorder: "/harikita-assets/frames/photo-frames/frame-photo-card-gold-01.svg",
    backgroundGradient: "/harikita-assets/backgrounds/gradients/bg-card-gradient-champagne-08.svg",
    closingSeal: "/harikita-assets/decorative/stamps-wax/stamp-ornament-cover-01.svg",
  },
};

/**
 * Helper to retrieve an asset bundle for a theme, falling back to archetype default or general fallback
 */
export function getThemeAssets(themeId?: string, archetypeId?: string): ThemeAssetBundle {
  if (themeId && THEME_ASSET_REGISTRY[themeId]) {
    return THEME_ASSET_REGISTRY[themeId];
  }
  if (archetypeId && DEFAULT_ARCHETYPE_FALLBACKS[archetypeId]) {
    return DEFAULT_ARCHETYPE_FALLBACKS[archetypeId];
  }
  return DEFAULT_ARCHETYPE_FALLBACKS["botanical"];
}
