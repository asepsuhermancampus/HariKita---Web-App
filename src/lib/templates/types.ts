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
