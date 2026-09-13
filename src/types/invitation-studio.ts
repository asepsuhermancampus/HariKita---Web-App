export type CoupleCardVariantId =
  | 'floating-glass'
  | 'editorial-serif'
  | 'fullscreen-prewed'
  | 'twin-arches'
  | 'mihrab-arabesque'
  | 'javanese-gunungan'
  | 'royal-medallion'
  | 'polaroid-scrapbook';

export type PlacementStyleId =
  | 'royal-symmetrical'
  | 'botanical-hug'
  | 'asymmetric-editorial'
  | 'heritage-gunungan'
  | 'mihrab-syari'
  | 'twin-arch'
  | 'corner-baroque'
  | 'minimalist-stems'
  | 'celestial-flow'
  | 'postage-ribbon';

export type SlotZoneId =
  | 'corner'
  | 'monogram'
  | 'divider'
  | 'couple-surround'
  | 'icon-marker'
  | 'tailpiece';

export type DeviceFrameId =
  | 'iphone-15-pro'
  | 'iphone-se'
  | 'galaxy-s24'
  | 'pixel-8'
  | 'iphone-max';

export type AnimationMoodPreset = 'serene' | 'graceful' | 'cinematic';

export type VisualEffectId =
  | 'specular-gold-shimmer'
  | 'frosted-glassmorphism'
  | 'inner-gilded-rim-light'
  | 'cotton-paper-texture'
  | 'floating-petals'
  | 'radial-vignette-depth'
  | 'embossed-letterpress'
  | 'dew-droplet-condensation'
  | 'gilded-edge-bevel'
  | 'warm-film-grain'
  | 'aurora-halo-glow'
  | 'physical-drop-shadow'
  | 'sogan-vignette'
  | 'stardust-twinkle'
  | 'bokeh-blur-transition';

export type MicroAnimationId =
  | 'svg-path-stroke-draw'
  | 'botanical-sway'
  | 'narrative-reveal'
  | 'gatefold-wax-open'
  | 'heartbeat-pulse'
  | 'parallax-depth'
  | 'inertia-tilt'
  | 'countdown-ticker'
  | 'music-equalizer-wave'
  | 'rsvp-petal-burst'
  | 'elastic-wax-press'
  | 'cubic-bezier-glide'
  | 'fluid-accordion'
  | 'marquee-story'
  | 'morphing-copy-btn';

export interface SlotAssetMapping {
  corner?: string;
  monogram?: string;
  divider?: string;
  coupleSurround?: string;
  iconMarker?: string;
  tailpiece?: string;
}

export interface InvitationStudioConfig {
  themeColor: string;
  coupleVariant: CoupleCardVariantId;
  placementStyle: PlacementStyleId;
  galleryVariant: string;
  activeFrame: DeviceFrameId;
  animationMood: AnimationMoodPreset;
  activeEffects: VisualEffectId[];
  activeAnimations: MicroAnimationId[];
  slotAssets: SlotAssetMapping;
  isGatekeeperOpened: boolean;
}

export interface VenueLocationData {
  venueName: string;
  hallName: string;
  address: string;
  district: string;
  city: string;
  province: string;
  postalCode: string;
  googleMapsUrl: string;
  wazeUrl: string;
  qrPayload: string;
  latitude: number;
  longitude: number;
  parkingNotes: string;
}
