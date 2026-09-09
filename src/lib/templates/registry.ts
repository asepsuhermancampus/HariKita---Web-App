import { ArchetypeId, TemplateThemePreset } from "./types";
import { TEMPLATES_CATALOG } from "./templatesCatalog";

export { TEMPLATES_CATALOG };

export const MASTER_ARCHETYPES: Array<{
  id: ArchetypeId;
  name: string;
  description: string;
  defaultCoverStyle: "wax-seal" | "curtain" | "envelope-minimal" | "slide-up";
}> = [
  {
    id: "animated-motion",
    name: "Animated Motion & Illustrated",
    description: "Animasi daun gugur/bunga melayang estetik, ceria, dan modern dengan ilustrasi khas.",
    defaultCoverStyle: "envelope-minimal",
  },
  {
    id: "minimalist-typographic",
    name: "Minimalist Typographic & Editorial",
    description: "Layout lapang bernuansa majalah mode Eropa, garis tipis bersih, dan tipografi serif premium.",
    defaultCoverStyle: "curtain",
  },
  {
    id: "fullscreen-prewed",
    name: "Fullscreen Couple Prewed",
    description: "Foto prewedding sinematik memenuhi layar dengan gradasi lembut dan pencahayaan dramatis.",
    defaultCoverStyle: "slide-up",
  },
  {
    id: "romantic-floral",
    name: "Romantic Botanical Floral",
    description: "Kombinasi buket mawar dusty, dedaunan eucalyptus cat air, dan nuansa taman bunga abadi.",
    defaultCoverStyle: "envelope-minimal",
  },
  {
    id: "syari-islamic",
    name: "Syar'i & Islamic Heritage",
    description: "Lengkungan arabesque mewah, kaligrafi basmalah/ar-rum, dan tata letak sopan walimatul 'urs.",
    defaultCoverStyle: "curtain",
  },
  {
    id: "cultural-traditional",
    name: "Cultural Nusantara & Adat Jawa",
    description: "Ornamen gunungan wayang, motif batik parang garuda, dan sentuhan kayu ukir adat leluhur.",
    defaultCoverStyle: "curtain",
  },
  {
    id: "royal-luxury",
    name: "Royal Foil & Wax Seal 3D",
    description: "Amplop eksklusif dengan stempel segel lilin 3D, aksen emas berkilau (*gold foil*), dan velvet.",
    defaultCoverStyle: "wax-seal",
  },
  {
    id: "special-family-event",
    name: "Acara Khusus & Keluarga",
    description: "Template ramah keluarga untuk tasyakuran khitanan, tasmiyah aqiqah, dan perayaan ulang tahun.",
    defaultCoverStyle: "envelope-minimal",
  },
];

// 65+ Presets mapped to the 8 Master Archetypes
export const INVITATION_THEMES: TemplateThemePreset[] = [
  // 1. Archetype: Animated Motion (HelloGuest reference)
  {
    id: "autumnelle-animasi",
    title: "Autumnelle",
    sourceOrigin: "HelloGuest",
    archetypeId: "animated-motion",
    category: "Animasi",
    previewImageUrl: "https://helloguest.id/wp-content/uploads/2025/01/Autumnelle.webp",
    colors: {
      primary: "#C86D51",
      secondary: "#3D2B1F",
      accent: "#E2A76F",
      background: "#FAF4EE",
      text: "#3A261D",
      cardBg: "#FFFDFC",
      border: "#EAD6C3",
    },
    typography: {
      headingFont: "font-serif-luxury",
      bodyFont: "font-sans",
    },
    ornamentStyle: "leaves",
    defaultAudioTrack: "https://cdn.pixabay.com/download/audio/2022/05/27/audio_1808fbf07a.mp3?filename=romantic-piano-112199.mp3",
  },
  {
    id: "tulivelle-animasi",
    title: "Tulivelle",
    sourceOrigin: "HelloGuest",
    archetypeId: "animated-motion",
    category: "Animasi",
    previewImageUrl: "https://helloguest.id/wp-content/uploads/2025/01/Tulivelle.webp",
    colors: {
      primary: "#D47A88",
      secondary: "#45242B",
      accent: "#F3C5CD",
      background: "#FCF6F7",
      text: "#381E23",
      cardBg: "#FFFFFF",
      border: "#F1D4DA",
    },
    typography: {
      headingFont: "font-serif-luxury",
      bodyFont: "font-sans",
    },
    ornamentStyle: "floral-watercolor",
    defaultAudioTrack: "https://cdn.pixabay.com/download/audio/2022/05/27/audio_1808fbf07a.mp3?filename=romantic-piano-112199.mp3",
  },
  {
    id: "marielle-animasi",
    title: "Marielle",
    sourceOrigin: "HelloGuest",
    archetypeId: "animated-motion",
    category: "Animasi",
    previewImageUrl: "https://helloguest.id/wp-content/uploads/2024/06/Marielle.webp",
    colors: {
      primary: "#8F7D6B",
      secondary: "#3B332B",
      accent: "#D6C7B2",
      background: "#F8F5F0",
      text: "#2C251F",
      cardBg: "#FFFFFF",
      border: "#E5DDD0",
    },
    typography: {
      headingFont: "font-serif-luxury",
      bodyFont: "font-sans",
    },
    ornamentStyle: "leaves",
    defaultAudioTrack: "https://cdn.pixabay.com/download/audio/2022/05/27/audio_1808fbf07a.mp3?filename=romantic-piano-112199.mp3",
  },
  {
    id: "santoriva-animasi",
    title: "Santoriva",
    sourceOrigin: "HelloGuest",
    archetypeId: "animated-motion",
    category: "Animasi",
    previewImageUrl: "https://helloguest.id/wp-content/uploads/2025/01/Santoriva.webp",
    colors: {
      primary: "#4E7D96",
      secondary: "#1E3340",
      accent: "#B4D4E5",
      background: "#F2F7FA",
      text: "#1D2D36",
      cardBg: "#FFFFFF",
      border: "#D0E1EB",
    },
    typography: {
      headingFont: "font-serif-luxury",
      bodyFont: "font-sans",
    },
    ornamentStyle: "cute-stars",
    defaultAudioTrack: "https://cdn.pixabay.com/download/audio/2022/05/27/audio_1808fbf07a.mp3?filename=romantic-piano-112199.mp3",
  },

  // 2. Archetype: Minimalist Typographic (HelloGuest reference)
  {
    id: "seraphicus-lux",
    title: "Seraphicus Lux",
    sourceOrigin: "HelloGuest",
    archetypeId: "minimalist-typographic",
    category: "Minimalis",
    previewImageUrl: "https://helloguest.id/wp-content/uploads/2023/06/Seraphicus-Lux.jpg",
    colors: {
      primary: "#8C7B65",
      secondary: "#1A1A1A",
      accent: "#D1C3B2",
      background: "#FBF9F6",
      text: "#222222",
      cardBg: "#FFFFFF",
      border: "#E8E2D8",
    },
    typography: {
      headingFont: "font-editorial",
      bodyFont: "font-sans",
    },
    ornamentStyle: "minimal-line",
    defaultAudioTrack: "https://cdn.pixabay.com/download/audio/2022/03/15/audio_c8c8a73467.mp3?filename=warm-acoustic-109407.mp3",
  },
  {
    id: "primus-noctis",
    title: "Primus Noctis",
    sourceOrigin: "HelloGuest",
    archetypeId: "minimalist-typographic",
    category: "Minimalis",
    previewImageUrl: "https://helloguest.id/wp-content/uploads/2023/07/Primus-Noctis-1.webp",
    colors: {
      primary: "#C5A880",
      secondary: "#121212",
      accent: "#E2D0B8",
      background: "#1C1A18",
      text: "#FAF8F5",
      cardBg: "#252320",
      border: "#403B35",
    },
    typography: {
      headingFont: "font-cinzel",
      bodyFont: "font-sans",
    },
    ornamentStyle: "minimal-line",
    defaultAudioTrack: "https://cdn.pixabay.com/download/audio/2022/03/15/audio_c8c8a73467.mp3?filename=warm-acoustic-109407.mp3",
  },
  {
    id: "cascade-minimal",
    title: "Cascade",
    sourceOrigin: "HelloGuest",
    archetypeId: "minimalist-typographic",
    category: "Minimalis",
    previewImageUrl: "https://helloguest.id/wp-content/uploads/2024/01/Cascde.webp",
    colors: {
      primary: "#7A8275",
      secondary: "#232621",
      accent: "#C3CAC0",
      background: "#F6F8F5",
      text: "#222620",
      cardBg: "#FFFFFF",
      border: "#DEE4DC",
    },
    typography: {
      headingFont: "font-editorial",
      bodyFont: "font-sans",
    },
    ornamentStyle: "minimal-line",
    defaultAudioTrack: "https://cdn.pixabay.com/download/audio/2022/03/15/audio_c8c8a73467.mp3?filename=warm-acoustic-109407.mp3",
  },

  // 3. Archetype: Fullscreen Prewed Photo (HelloGuest reference)
  {
    id: "lunar-melody",
    title: "Lunar Melody",
    sourceOrigin: "HelloGuest",
    archetypeId: "fullscreen-prewed",
    category: "Background Prewed",
    previewImageUrl: "https://helloguest.id/wp-content/uploads/2024/01/Lunar-Melody.webp",
    colors: {
      primary: "#CCA873",
      secondary: "#1E1A1D",
      accent: "#E5D2B3",
      background: "#161315",
      text: "#FAF7F5",
      cardBg: "rgba(30, 26, 29, 0.85)",
      border: "rgba(204, 168, 115, 0.3)",
    },
    typography: {
      headingFont: "font-serif-luxury",
      bodyFont: "font-sans",
    },
    ornamentStyle: "minimal-line",
    defaultAudioTrack: "https://cdn.pixabay.com/download/audio/2022/05/27/audio_1808fbf07a.mp3?filename=romantic-piano-112199.mp3",
  },
  {
    id: "shadow-leaf",
    title: "Shadow Leaf",
    sourceOrigin: "HelloGuest",
    archetypeId: "fullscreen-prewed",
    category: "Background Prewed",
    previewImageUrl: "https://helloguest.id/wp-content/uploads/2023/06/Shadow-Leaf.jpg",
    colors: {
      primary: "#85937E",
      secondary: "#1A2218",
      accent: "#C8D4C3",
      background: "#121811",
      text: "#F4F7F3",
      cardBg: "rgba(26, 34, 24, 0.85)",
      border: "rgba(133, 147, 126, 0.35)",
    },
    typography: {
      headingFont: "font-editorial",
      bodyFont: "font-sans",
    },
    ornamentStyle: "leaves",
    defaultAudioTrack: "https://cdn.pixabay.com/download/audio/2022/03/15/audio_c8c8a73467.mp3?filename=warm-acoustic-109407.mp3",
  },
  {
    id: "sogni-celesti",
    title: "Sogni Celesti",
    sourceOrigin: "HelloGuest",
    archetypeId: "fullscreen-prewed",
    category: "Background Prewed",
    previewImageUrl: "https://helloguest.id/wp-content/uploads/2023/06/Sogni-Celesti.jpg",
    colors: {
      primary: "#D4A89C",
      secondary: "#281D21",
      accent: "#F2D5CD",
      background: "#1D1417",
      text: "#FAF5F4",
      cardBg: "rgba(40, 29, 33, 0.85)",
      border: "rgba(212, 168, 156, 0.35)",
    },
    typography: {
      headingFont: "font-serif-luxury",
      bodyFont: "font-sans",
    },
    ornamentStyle: "minimal-line",
    defaultAudioTrack: "https://cdn.pixabay.com/download/audio/2022/05/27/audio_1808fbf07a.mp3?filename=romantic-piano-112199.mp3",
  },

  // 4. Archetype: Romantic Botanical Floral (HelloGuest reference)
  {
    id: "floral-serenity",
    title: "Floral Serenity",
    sourceOrigin: "HelloGuest",
    archetypeId: "romantic-floral",
    category: "Floral & Classic",
    previewImageUrl: "https://helloguest.id/wp-content/uploads/2023/06/Floral-Serenity.jpg",
    colors: {
      primary: "#A36D74",
      secondary: "#3A2125",
      accent: "#E2B8BD",
      background: "#FAF5F6",
      text: "#2D1B1E",
      cardBg: "#FFFFFF",
      border: "#ECD7DB",
    },
    typography: {
      headingFont: "font-script",
      bodyFont: "font-sans",
    },
    ornamentStyle: "floral-watercolor",
    defaultAudioTrack: "https://cdn.pixabay.com/download/audio/2022/05/27/audio_1808fbf07a.mp3?filename=romantic-piano-112199.mp3",
  },
  {
    id: "floral-harmony",
    title: "Floral Harmony",
    sourceOrigin: "HelloGuest",
    archetypeId: "romantic-floral",
    category: "Floral & Classic",
    previewImageUrl: "https://helloguest.id/wp-content/uploads/2023/06/Floral-Harmony.jpg",
    colors: {
      primary: "#5C7A68",
      secondary: "#1E2B23",
      accent: "#B4CEBF",
      background: "#F4F8F5",
      text: "#1C261F",
      cardBg: "#FFFFFF",
      border: "#D1E2D8",
    },
    typography: {
      headingFont: "font-serif-luxury",
      bodyFont: "font-sans",
    },
    ornamentStyle: "floral-watercolor",
    defaultAudioTrack: "https://cdn.pixabay.com/download/audio/2022/03/15/audio_c8c8a73467.mp3?filename=warm-acoustic-109407.mp3",
  },

  // 5. Archetype: Syar'i & Islamic Heritage (HelloGuest reference)
  {
    id: "syari-lavender",
    title: "Tema Wedding Syari Lavender",
    sourceOrigin: "HelloGuest",
    archetypeId: "syari-islamic",
    category: "Islami",
    previewImageUrl: "https://helloguest.id/wp-content/uploads/2024/06/Tema-Undangan-Pernikahan-Walimatul-Urs-3.webp",
    colors: {
      primary: "#7B6282",
      secondary: "#2E2131",
      accent: "#CFBED4",
      background: "#F9F6FA",
      text: "#281D2B",
      cardBg: "#FFFFFF",
      border: "#E5D9E8",
    },
    typography: {
      headingFont: "font-serif-luxury",
      bodyFont: "font-sans",
    },
    ornamentStyle: "arabic-arch",
    defaultAudioTrack: "https://cdn.pixabay.com/download/audio/2022/03/15/audio_c8c8a73467.mp3?filename=warm-acoustic-109407.mp3",
  },
  {
    id: "syari-peach",
    title: "Tema Wedding Syari Peach",
    sourceOrigin: "HelloGuest",
    archetypeId: "syari-islamic",
    category: "Islami",
    previewImageUrl: "https://helloguest.id/wp-content/uploads/2024/06/Tema-Undangan-Digital-Islami-8.webp",
    colors: {
      primary: "#C47B62",
      secondary: "#3D2118",
      accent: "#F2C7B8",
      background: "#FCF6F4",
      text: "#331E17",
      cardBg: "#FFFFFF",
      border: "#EED7CF",
    },
    typography: {
      headingFont: "font-serif-luxury",
      bodyFont: "font-sans",
    },
    ornamentStyle: "arabic-arch",
    defaultAudioTrack: "https://cdn.pixabay.com/download/audio/2022/03/15/audio_c8c8a73467.mp3?filename=warm-acoustic-109407.mp3",
  },
  {
    id: "syari-ivory",
    title: "Tema Wedding Syari Ivory",
    sourceOrigin: "HelloGuest",
    archetypeId: "syari-islamic",
    category: "Islami",
    previewImageUrl: "https://helloguest.id/wp-content/uploads/2024/02/Tema-Undangan-Digital-Syari-2.jpg",
    colors: {
      primary: "#9C8565",
      secondary: "#2E251A",
      accent: "#E2D3BE",
      background: "#FAF7F2",
      text: "#2A231A",
      cardBg: "#FFFFFF",
      border: "#ECE2D3",
    },
    typography: {
      headingFont: "font-serif-luxury",
      bodyFont: "font-sans",
    },
    ornamentStyle: "arabic-arch",
    defaultAudioTrack: "https://cdn.pixabay.com/download/audio/2022/03/15/audio_c8c8a73467.mp3?filename=warm-acoustic-109407.mp3",
  },

  // 6. Archetype: Cultural Traditional Adat Jawa (UndanganDigital & HelloGuest reference)
  {
    id: "javanese-royal",
    title: "Javanese Royal Wayang",
    sourceOrigin: "UndanganDigital",
    archetypeId: "cultural-traditional",
    category: "Tradisional Adat",
    previewImageUrl: "https://helloguest.id/wp-content/uploads/2023/06/Java-Wedding.jpg",
    colors: {
      primary: "#C5A880",
      secondary: "#231B15",
      accent: "#E5CFA8",
      background: "#1C1510",
      text: "#FAF6F0",
      cardBg: "rgba(35, 27, 21, 0.9)",
      border: "rgba(197, 168, 128, 0.4)",
    },
    typography: {
      headingFont: "font-cinzel",
      bodyFont: "font-sans",
    },
    ornamentStyle: "batik-wayang",
    defaultAudioTrack: "https://cdn.pixabay.com/download/audio/2022/03/15/audio_c8c8a73467.mp3?filename=warm-acoustic-109407.mp3",
  },
  {
    id: "javanese-ivory",
    title: "Javanese Ivory Keraton",
    sourceOrigin: "UndanganDigital",
    archetypeId: "cultural-traditional",
    category: "Tradisional Adat",
    previewImageUrl: "https://helloguest.id/wp-content/uploads/2023/06/The-Old-Stone-1.jpg",
    colors: {
      primary: "#8B6B43",
      secondary: "#2C2013",
      accent: "#D6BF9F",
      background: "#FBF7F0",
      text: "#291E13",
      cardBg: "#FFFFFF",
      border: "#E9DAC5",
    },
    typography: {
      headingFont: "font-serif-luxury",
      bodyFont: "font-sans",
    },
    ornamentStyle: "batik-wayang",
    defaultAudioTrack: "https://cdn.pixabay.com/download/audio/2022/03/15/audio_c8c8a73467.mp3?filename=warm-acoustic-109407.mp3",
  },

  // 7. Archetype: Royal Luxury Foil & Wax Seal (UndanganDigital reference)
  {
    id: "rose-gold-luxury",
    title: "Rose Gold Luxury & Wax Seal",
    sourceOrigin: "UndanganDigital",
    archetypeId: "royal-luxury",
    category: "Luxury",
    previewImageUrl: "https://helloguest.id/wp-content/uploads/2023/08/Floral-Delightful-1.webp",
    colors: {
      primary: "#C59B8B",
      secondary: "#2B1B20",
      accent: "#E8C8BE",
      background: "#FAF4F2",
      text: "#331E24",
      cardBg: "#FFFFFF",
      border: "#EAD6D0",
    },
    typography: {
      headingFont: "font-cinzel",
      bodyFont: "font-sans",
    },
    ornamentStyle: "gold-foil",
    defaultAudioTrack: "https://cdn.pixabay.com/download/audio/2022/05/27/audio_1808fbf07a.mp3?filename=romantic-piano-112199.mp3",
  },
  {
    id: "serenade-maroon",
    title: "Serenade Maroon Velvet",
    sourceOrigin: "UndanganDigital",
    archetypeId: "royal-luxury",
    category: "Luxury",
    previewImageUrl: "https://helloguest.id/wp-content/uploads/2024/06/Tema-Wedding-Syari-Ruby.webp",
    colors: {
      primary: "#D4A873",
      secondary: "#42121A",
      accent: "#EAD2B2",
      background: "#2A0B10",
      text: "#FDF9F7",
      cardBg: "rgba(66, 18, 26, 0.9)",
      border: "rgba(212, 168, 115, 0.4)",
    },
    typography: {
      headingFont: "font-cinzel",
      bodyFont: "font-sans",
    },
    ornamentStyle: "gold-foil",
    defaultAudioTrack: "https://cdn.pixabay.com/download/audio/2022/05/27/audio_1808fbf07a.mp3?filename=romantic-piano-112199.mp3",
  },
  {
    id: "golden-seafoam",
    title: "Golden Seafoam Emerald",
    sourceOrigin: "UndanganDigital",
    archetypeId: "royal-luxury",
    category: "Luxury",
    previewImageUrl: "https://helloguest.id/wp-content/uploads/2024/06/Tema-Undangan-Pernikahan-Islam-5.webp",
    colors: {
      primary: "#CCA873",
      secondary: "#102820",
      accent: "#E2CFB0",
      background: "#0C1F19",
      text: "#F7FAF8",
      cardBg: "rgba(16, 40, 32, 0.9)",
      border: "rgba(204, 168, 115, 0.35)",
    },
    typography: {
      headingFont: "font-cinzel",
      bodyFont: "font-sans",
    },
    ornamentStyle: "gold-foil",
    defaultAudioTrack: "https://cdn.pixabay.com/download/audio/2022/05/27/audio_1808fbf07a.mp3?filename=romantic-piano-112199.mp3",
  },

  // 8. Archetype: Event Khusus & Keluarga (HelloGuest reference)
  {
    id: "khitanan-ceremony",
    title: "Tasyakuran Khitanan Berkah",
    sourceOrigin: "HelloGuest",
    archetypeId: "special-family-event",
    category: "Khitanan & Aqiqah",
    previewImageUrl: "https://helloguest.id/wp-content/uploads/2024/06/Tema-Undangan-Khitanan-1.webp",
    colors: {
      primary: "#3D8271",
      secondary: "#18382F",
      accent: "#A8D8CB",
      background: "#F2F9F7",
      text: "#17332A",
      cardBg: "#FFFFFF",
      border: "#CFE8E0",
    },
    typography: {
      headingFont: "font-serif-luxury",
      bodyFont: "font-sans",
    },
    ornamentStyle: "cute-stars",
    defaultAudioTrack: "https://cdn.pixabay.com/download/audio/2022/03/15/audio_c8c8a73467.mp3?filename=warm-acoustic-109407.mp3",
  },
  {
    id: "tasmiyah-aqiqah",
    title: "Tasmiyah & Aqiqah Ananda",
    sourceOrigin: "HelloGuest",
    archetypeId: "special-family-event",
    category: "Khitanan & Aqiqah",
    previewImageUrl: "https://helloguest.id/wp-content/uploads/2024/06/Tasmiyah-_-Aqiqah-1.webp",
    colors: {
      primary: "#5A8B9C",
      secondary: "#1F3740",
      accent: "#B8DFEC",
      background: "#F4FAFC",
      text: "#1D323A",
      cardBg: "#FFFFFF",
      border: "#CFE8F2",
    },
    typography: {
      headingFont: "font-serif-luxury",
      bodyFont: "font-sans",
    },
    ornamentStyle: "cute-stars",
    defaultAudioTrack: "https://cdn.pixabay.com/download/audio/2022/03/15/audio_c8c8a73467.mp3?filename=warm-acoustic-109407.mp3",
  },
];
export const ALL_INVITATION_TEMPLATES: TemplateThemePreset[] = [
  ...TEMPLATES_CATALOG,
  ...INVITATION_THEMES.filter((t) => !TEMPLATES_CATALOG.some((c) => c.id === t.id)),
];

export function getThemeById(id: string): TemplateThemePreset {
  // First search in the 64 master catalog
  const fromCatalog = TEMPLATES_CATALOG.find((t) => t.id === id);
  if (fromCatalog) return fromCatalog;

  // Fallback to legacy themes
  const fromLegacy = INVITATION_THEMES.find((t) => t.id === id);
  if (fromLegacy) return fromLegacy;

  // Ultimate fallback
  return TEMPLATES_CATALOG[0] || INVITATION_THEMES[0];
}
