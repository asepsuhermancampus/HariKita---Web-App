export type ArchetypeId =
  | "botanical"
  | "javanese"
  | "islamic"
  | "minimalist"
  | "rose-gold"
  | "rustic"
  | "celestial"
  | "cute-illustrated"
  // Legacy aliases for backward compatibility
  | "animated-motion"
  | "minimalist-typographic"
  | "fullscreen-prewed"
  | "romantic-floral"
  | "syari-islamic"
  | "cultural-traditional"
  | "royal-luxury"
  | "special-family-event";

export type CoverLayoutId =
  | "FloatingCard"
  | "FullBleedText"
  | "SplitPanelHorizontal"
  | "GateDoors"
  | "ScrollUnroll"
  | "PostageStamp"
  | "CircleMonogram"
  | "PolaroidPhoto"
  | "FloralWreath"
  | "IslamicArch"
  | "BookCover"
  | "KawaiiCard";

export type CoverExitAnimId =
  | "slide-up"
  | "slide-down"
  | "gate-open"
  | "scroll-roll"
  | "flip-3d"
  | "zoom-away"
  | "dissolve-particles"
  | "curtain-reveal"
  | "page-turn"
  | "fade-drop";

export type CoverEntryAnimId =
  | "rise-up"
  | "fall-in"
  | "scale-in"
  | "doors-close"
  | "fade-in"
  | "rotate-in"
  | "slide-left"
  | "unfurl";

export interface CoverConfig {
  layoutId: CoverLayoutId;
  exitAnimId: CoverExitAnimId;
  entryAnimId: CoverEntryAnimId;
  bgVariant: string; // descriptive label; actual colors come from theme.colors
}

// 8 Section Matrix Style IDs for layout diversity
export type CoupleStyleId = "split-diagonal" | "arch-classic" | "polaroid-sticker" | "royal-medallion";
export type ScheduleStyleId = "boarding-pass" | "vertical-timeline" | "calendar-grid" | "twin-arch-gate";
export type MapStyleId = "interactive-clean" | "illustrated-cute" | "minimalist-guide";
export type StoriesStyleId = "filmstrip-scroll" | "chat-journey" | "milestone-cards" | "magazine-article";
export type GalleryStyleId = "masonry-staggered" | "film-roll-carousel" | "mosaic-hero" | "polaroid-scatter";
export type GiftStyleId = "embossed-cards" | "angpao-envelope" | "clean-pills";
export type GuestbookStyleId = "sticky-notes" | "luxury-scrollbook" | "minimal-feed";
export type ClosingStyleId = "wax-seal-signature" | "poetic-photo-outro" | "cute-waving-outro";

export interface SectionMatrixConfig {
  coupleStyle?: CoupleStyleId;
  scheduleStyle?: ScheduleStyleId;
  mapStyle?: MapStyleId;
  storiesStyle?: StoriesStyleId;
  galleryStyle?: GalleryStyleId;
  giftStyle?: GiftStyleId;
  guestbookStyle?: GuestbookStyleId;
  closingStyle?: ClosingStyleId;
  sfxTheme?: "romantic-harp" | "royal-gamelan" | "modern-pop" | "gentle-nature";
}

export interface TemplateThemePreset {
  id: string; // e.g. "autumnelle", "seraphicus-lux", "lunar-melody", "serenade-maroon"
  title: string;
  sourceOrigin: "HelloGuest" | "UndanganDigital" | "HariKita Original";
  archetypeId: ArchetypeId;
  category: string;
  previewImageUrl: string;
  colors: {
    primary: string;
    secondary: string;
    accent: string;
    background: string;
    text: string;
    cardBg: string;
    border: string;
  };
  typography: {
    headingFont: string; // 'font-serif-luxury' | 'font-cinzel' | 'font-script' | 'font-editorial'
    bodyFont: string;
  };
  ornamentStyle: "leaves" | "gold-foil" | "floral-watercolor" | "arabic-arch" | "batik-wayang" | "minimal-line" | "cute-stars";
  defaultAudioTrack: string;
  coverConfig?: CoverConfig; // optional — legacy presets without coverConfig get FloatingCard + slide-up fallback
  sectionConfig?: SectionMatrixConfig; // optional — defines modular layout for all 8 body sections
}


export interface GuestSessionInfo {
  sessionCode: "s1" | "s2" | "s3";
  title: string;
  timeSlot: string;
  venueName: string;
  venueAddress: string;
}

export interface InvitationData {
  slug: string;
  theme: TemplateThemePreset;
  title: string;
  bride: {
    name: string;
    fullName: string;
    father: string;
    mother: string;
    photo: string;
    instagram?: string;
  };
  groom: {
    name: string;
    fullName: string;
    father: string;
    mother: string;
    photo: string;
    instagram?: string;
  };
  eventDate: string; // ISO date string
  sessions: {
    s1: GuestSessionInfo; // e.g. Akad Nikah
    s2: GuestSessionInfo; // e.g. Resepsi Sesi 1
    s3?: GuestSessionInfo; // e.g. Resepsi Sesi 2
  };
  googleMapsUrl: string;
  cartoonMapUrl?: string;
  musicUrl: string;
  liveStreamUrl?: string;
  igFilterUrl?: string;
  giftInfo: {
    banks: Array<{ bank: string; number: string; holder: string }>;
    qrisUrl?: string;
    physicalGiftAddress: string;
  };
  storyTimeline: Array<{ year: string; title: string; desc: string; photo?: string }>;
  gallery: string[];
}

export interface DedicatedTemplateProps {
  invitationId: string;
  theme: TemplateThemePreset;
  guestName: string;
  activeSessionCode: "s1" | "s2" | "s3";
  bride: {
    name: string;
    fullName: string;
    father: string;
    mother: string;
    photo: string;
    instagram?: string;
  };
  groom: {
    name: string;
    fullName: string;
    father: string;
    mother: string;
    photo: string;
    instagram?: string;
  };
  eventDate: string;
  sessions: {
    s1: GuestSessionInfo;
    s2: GuestSessionInfo;
    s3?: GuestSessionInfo;
  };
  googleMapsUrl: string;
  cartoonMapUrl?: string;
  musicUrl: string;
  storyTimeline: Array<{ year: string; title: string; desc: string }>;
  galleryPhotos: string[];
  giftInfo: {
    banks: Array<{ bank: string; number: string; holder: string }>;
    physicalGiftAddress: string;
  };
  initialWishes: Array<{
    id: string;
    guestName: string;
    attendance: string;
    paxCount: number;
    message: string;
    createdAt: string;
  }>;
}
