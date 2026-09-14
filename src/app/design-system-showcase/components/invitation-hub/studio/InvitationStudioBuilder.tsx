'use client';

import React, { useState, useEffect, useRef, useMemo } from 'react';
import {
  Sparkles,
  Layers,
  Palette,
  Smartphone,
  Check,
  ChevronRight,
  ShieldCheck,
  RotateCcw,
  Sliders,
  Maximize2,
  Copy,
  CheckCheck,
  Eye,
  EyeOff,
  Shapes,
  Heart,
  Calendar,
  MapPin,
  Image as ImageIcon,
  Gift,
  FileText,
  Clock,
  ArrowUp,
  ArrowDown,
  Share2,
  Volume2,
  Edit3,
} from 'lucide-react';
import {
  InvitationStudioConfig,
  CoupleCardVariantId,
  PlacementStyleId,
  SlotZoneId,
  DeviceFrameId,
  AnimationMoodPreset,
  VisualEffectId,
  MicroAnimationId,
  SectionOrderItem,
  LiveContentData,
} from '@/types/invitation-studio';
import { SANDBOX_STUDIO_DEFAULTS } from '@/app/design-system-showcase/data/mock-invitation-sandbox';
import { StudioColorPalettePicker } from './StudioColorPalettePicker';
import { StudioPlacementPicker } from './StudioPlacementPicker';
import { StudioEffectsController } from './StudioEffectsController';
import { StudioSlotAssetModal } from './StudioSlotAssetModal';
import { DeviceFrameContainer } from './DeviceFrameContainer';
import { InvitationDevicePreview } from './InvitationDevicePreview';
import { DynamicTintIcon } from './DynamicTintIcon';
import { DynamicSvgRenderer } from './DynamicSvgRenderer';
import { SLOT_ZONE_RULES, PLACEMENT_STYLES_CATALOG } from './AssetPlacementEngine';
import { getHariKitaAssets } from '@/lib/harikita-assets';
import { HariKitaAsset } from '@/types/harikita-asset';
import { encodeStudioDelta, decodeStudioDelta, sanitizeUrl } from '@/lib/url-delta-codec';
import { cn } from '@/lib/utils';

export const DEFAULT_STUDIO_SECTIONS: SectionOrderItem[] = [
  { id: 'muqaddimah', label: 'Muqaddimah & Salam', enabled: true, order: 1 },
  { id: 'couple', label: 'Mempelai Pria & Wanita', enabled: true, order: 2 },
  { id: 'story', label: 'Kisah Cinta & Milestone', enabled: true, order: 3 },
  { id: 'schedule', label: 'Rangkaian Akad & Resepsi', enabled: true, order: 4 },
  { id: 'location', label: 'Denah Lokasi & Maps', enabled: true, order: 5 },
  { id: 'gallery', label: 'Galeri Foto Pre-wedding', enabled: true, order: 6 },
  { id: 'gift', label: 'Tanda Kasih & Rekening', enabled: true, order: 7 },
  { id: 'rsvp', label: 'RSVP & Buku Ucapan', enabled: true, order: 8 },
  { id: 'dresscode', label: 'Panduan Busana / Dresscode', enabled: true, order: 9 },
  { id: 'closing', label: 'Penutup & Takzim Keluarga', enabled: true, order: 10 },
];

export const DEFAULT_LIVE_CONTENT: LiveContentData = {
  groomName: 'Aditya Pratama',
  groomParents: 'Bpk. H. Bambang Soediro & Ibu Hj. Siti Aminah',
  brideName: 'Ratna Kusuma Dewi',
  brideParents: 'Bpk. Drs. H. Hartono Sudrajat & Ibu Hj. Endang Rahayu',
  weddingDate: 'Sabtu, 24 Oktober 2026',
  venueName: 'Gedung Pertemuan Graha Kebumen',
  venueAddress: 'Jl. Pahlawan No. 45, Kebumen, Jawa Tengah',
  locationMapsUrl: 'https://maps.google.com/?q=Kebumen',
  quoteText: 'Dan di antara tanda-tanda (kebesaran)-Nya ialah Dia menciptakan pasangan-pasangan untukmu dari jenismu sendiri...',
  bankName: 'Bank BCA Kebumen',
  bankAccount: '123-456-7890',
  bankHolder: 'Aditya Pratama',
};

type InspectorTabId = 'warna' | 'mempelai' | 'konten' | 'bentuk' | 'seksi' | 'efek';

export function InvitationStudioBuilder() {
  const [config, setConfig] = useState<InvitationStudioConfig>({
    ...SANDBOX_STUDIO_DEFAULTS,
    sections: DEFAULT_STUDIO_SECTIONS,
    content: DEFAULT_LIVE_CONTENT,
    audioUrl: '',
  });

  const [activeTab, setActiveTab] = useState<InspectorTabId>('warna');
  const [zoomScale, setZoomScale] = useState<number>(0.75);
  const [activeSlotModal, setActiveSlotModal] = useState<SlotZoneId | null>(null);
  const [copiedConfig, setCopiedConfig] = useState<boolean>(false);
  const [copiedShareLink, setCopiedShareLink] = useState<boolean>(false);
  const [selectedTaxonomy, setSelectedTaxonomy] = useState<string>('dividers');
  const [appliedAssetNotice, setAppliedAssetNotice] = useState<string | null>(null);

  // Sequence ref for URL Delta Hash sync without race conditions
  const seqRef = useRef<number>(0);

  // Hydrate from URL Hash on initial mount
  useEffect(() => {
    if (typeof window !== 'undefined' && window.location.hash) {
      const decoded = decodeStudioDelta(window.location.hash);
      if (decoded) {
        setConfig((prev) => ({
          ...prev,
          ...decoded,
          sections: decoded.sections && decoded.sections.length > 0 ? decoded.sections : prev.sections,
          content: decoded.content ? { ...prev.content, ...decoded.content } : prev.content,
        }));
      }
    }
  }, []);

  // Safe async sync of config to URL hash (Debounced 300ms)
  useEffect(() => {
    const currentSeq = ++seqRef.current;
    const timer = setTimeout(() => {
      if (currentSeq === seqRef.current && typeof window !== 'undefined') {
        const hash = encodeStudioDelta(config);
        if (hash) {
          window.history.replaceState(null, '', `#${hash}`);
        }
      }
    }, 300);
    return () => clearTimeout(timer);
  }, [config]);

  const updateConfig = (updater: Partial<InvitationStudioConfig>) => {
    setConfig((prev) => ({ ...prev, ...updater }));
  };

  const handleSelectColor = (hex: string) => {
    updateConfig({ themeColor: hex });
  };

  const handleSelectPlacementStyle = (styleId: PlacementStyleId) => {
    const styleDef = PLACEMENT_STYLES_CATALOG.find((s) => s.id === styleId);
    if (styleDef?.defaultSlots) {
      updateConfig({
        placementStyle: styleId,
        slotAssets: {
          ...config.slotAssets,
          ...styleDef.defaultSlots,
        },
      });
    } else {
      updateConfig({ placementStyle: styleId });
    }
  };

  const handleSelectCoupleVariant = (variant: CoupleCardVariantId) => {
    updateConfig({ coupleVariant: variant, isGatekeeperOpened: true });
    setTimeout(() => {
      const el = document.getElementById('inv-section-couple');
      if (el) {
        el.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    }, 150);
  };

  const handleSelectGalleryVariant = (variant: string) => {
    updateConfig({ galleryVariant: variant, isGatekeeperOpened: true });
    setTimeout(() => {
      const el = document.getElementById('inv-section-gallery');
      if (el) {
        el.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    }, 150);
  };

  const handleUpdateContentField = (field: keyof LiveContentData, value: string) => {
    const currentContent = config.content || DEFAULT_LIVE_CONTENT;
    updateConfig({
      content: {
        ...currentContent,
        [field]: value,
      },
    });
  };

  // Section Reordering & Visibility
  const handleToggleSectionVisibility = (sectionId: string) => {
    const currentSections = config.sections || DEFAULT_STUDIO_SECTIONS;
    const updated = currentSections.map((s) =>
      s.id === sectionId ? { ...s, enabled: !s.enabled } : s
    );
    updateConfig({ sections: updated });
  };

  const handleMoveSection = (sectionId: string, direction: 'up' | 'down') => {
    const currentSections = [...(config.sections || DEFAULT_STUDIO_SECTIONS)].sort(
      (a, b) => a.order - b.order
    );
    const index = currentSections.findIndex((s) => s.id === sectionId);
    if (index === -1) return;

    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= currentSections.length) return;

    const temp = currentSections[index];
    currentSections[index] = currentSections[targetIndex];
    currentSections[targetIndex] = temp;

    const reordered = currentSections.map((s, idx) => ({ ...s, order: idx + 1 }));
    updateConfig({ sections: reordered });
  };

  const handleApplyMood = (mood: AnimationMoodPreset) => {
    if (mood === 'serene') {
      updateConfig({
        animationMood: 'serene',
        activeEffects: ['frosted-glassmorphism', 'cotton-paper-texture'],
        activeAnimations: [],
      });
    } else if (mood === 'graceful') {
      updateConfig({
        animationMood: 'graceful',
        activeEffects: [
          'specular-gold-shimmer',
          'frosted-glassmorphism',
          'inner-gilded-rim-light',
          'cotton-paper-texture',
          'floating-petals',
        ],
        activeAnimations: [
          'svg-path-stroke-draw',
          'botanical-sway',
          'narrative-reveal',
          'gatefold-wax-open',
          'heartbeat-pulse',
          'morphing-copy-btn',
        ],
      });
    } else {
      updateConfig({
        animationMood: 'cinematic',
        activeEffects: [
          'specular-gold-shimmer',
          'frosted-glassmorphism',
          'inner-gilded-rim-light',
          'cotton-paper-texture',
          'floating-petals',
          'radial-vignette-depth',
          'aurora-halo-glow',
          'physical-drop-shadow',
          'stardust-twinkle',
        ],
        activeAnimations: [
          'svg-path-stroke-draw',
          'botanical-sway',
          'narrative-reveal',
          'gatefold-wax-open',
          'heartbeat-pulse',
          'parallax-depth',
          'inertia-tilt',
          'countdown-ticker',
          'music-equalizer-wave',
          'rsvp-petal-burst',
          'elastic-wax-press',
          'morphing-copy-btn',
        ],
      });
    }
  };

  const handleToggleEffect = (effectId: VisualEffectId) => {
    const active = config.activeEffects.includes(effectId);
    updateConfig({
      activeEffects: active
        ? config.activeEffects.filter((e) => e !== effectId)
        : [...config.activeEffects, effectId],
    });
  };

  const handleToggleAnimation = (animId: MicroAnimationId) => {
    const active = config.activeAnimations.includes(animId);
    updateConfig({
      activeAnimations: active
        ? config.activeAnimations.filter((a) => a !== animId)
        : [...config.activeAnimations, animId],
    });
  };

  const handleResetToDefaults = () => {
    setConfig({
      ...SANDBOX_STUDIO_DEFAULTS,
      sections: DEFAULT_STUDIO_SECTIONS,
      content: DEFAULT_LIVE_CONTENT,
      audioUrl: '',
    });
    setZoomScale(0.75);
    if (typeof window !== 'undefined') {
      window.history.replaceState(null, '', window.location.pathname);
    }
  };

  const handleCopyConfigJson = () => {
    navigator.clipboard.writeText(JSON.stringify(config, null, 2));
    setCopiedConfig(true);
    setTimeout(() => setCopiedConfig(false), 2000);
  };

  const handleCopyShareLink = () => {
    if (typeof window !== 'undefined') {
      const hash = encodeStudioDelta(config);
      const fullUrl = `${window.location.origin}${window.location.pathname}#${hash}`;
      navigator.clipboard.writeText(fullUrl);
      setCopiedShareLink(true);
      setTimeout(() => setCopiedShareLink(false), 2500);
    }
  };

  const handleQuickJump = (sectionId: string) => {
    if (!config.isGatekeeperOpened && sectionId !== 'inv-gatekeeper') {
      updateConfig({ isGatekeeperOpened: true });
      setTimeout(() => {
        document.getElementById(sectionId)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }, 200);
    } else {
      document.getElementById(sectionId)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  const handleSelectSectionHotspot = (sectionId: string) => {
    if (sectionId === 'couple') {
      setActiveTab('mempelai');
    } else if (['schedule', 'location', 'gift'].includes(sectionId)) {
      setActiveTab('konten');
    } else {
      setActiveTab('seksi');
    }
    handleQuickJump(`inv-section-${sectionId}`);
  };

  const coupleVariantsList: { id: CoupleCardVariantId; label: string; desc: string; archetype: string }[] = [
    { id: 'twin-arches', label: 'Twin Arches Floral', desc: 'Kubah ganda klasik flora', archetype: 'Botanical' },
    { id: 'floating-glass', label: 'Floating Soft Glass', desc: 'Kaca kristal kedalaman optik', archetype: 'Rose Gold' },
    { id: 'editorial-serif', label: 'Editorial Serif Vogue', desc: 'Format majalah seni tinggi', archetype: 'Minimalist' },
    { id: 'fullscreen-prewed', label: 'Fullscreen Sinematik', desc: 'Potret penuh foto dramatis', archetype: 'Cinematic' },
    { id: 'mihrab-arabesque', label: 'Mihrab Arabesque Syar’i', desc: 'Kubah arabesque suci', archetype: 'Islamic' },
    { id: 'javanese-gunungan', label: 'Javanese Gunungan', desc: 'Adiluhung Jawa & sogan emas', archetype: 'Javanese' },
    { id: 'royal-medallion', label: 'Royal Medallion 3D', desc: 'Oval emas segel lilin 3D', archetype: 'Royal' },
    { id: 'polaroid-scrapbook', label: 'Polaroid Scrapbook', desc: 'Stempel pos hangat & washitape', archetype: 'Cute/Rustic' },
  ];

  const galleryVariantsList = [
    { id: 'editorial-masonry', label: 'Editorial Masonry' },
    { id: 'filmstrip-reel', label: 'Horizontal Filmstrip' },
    { id: 'polaroid-scatter', label: 'Cascading Polaroids' },
    { id: 'classic-grid', label: 'Square Clean Grid' },
  ];

  interface ShapeTaxonomyDef {
    id: string;
    name: string;
    ratio: string;
    count: number;
    tag: string;
    slotTarget: SlotZoneId;
    targetSection: string;
  }

  const shapeTaxonomySummary: ShapeTaxonomyDef[] = [
    { id: 'dividers', name: 'Garis Pembatas (Dividers)', ratio: '4:1', count: 21, tag: 'Center Horizontal', slotTarget: 'divider', targetSection: 'inv-section-muqaddimah' },
    { id: 'corners', name: 'Aksen Sudut (Corners L-Shape)', ratio: '1:1', count: 10, tag: '4 Sudut Frame', slotTarget: 'corner', targetSection: 'inv-section-muqaddimah' },
    { id: 'arches', name: 'Bingkai Arch & Kubah', ratio: '9:16', count: 14, tag: 'Top Arch / Puncak', slotTarget: 'monogram', targetSection: 'inv-gatekeeper' },
    { id: 'stems', name: 'Flora Vertikal (Single Stem)', ratio: '1:2.5', count: 34, tag: 'Side Flanking', slotTarget: 'tailpiece', targetSection: 'inv-section-couple' },
    { id: 'blooms', name: 'Mahkota Bunga & Buket', ratio: '1:1', count: 56, tag: 'Aksen Tanggal/Wax', slotTarget: 'tailpiece', targetSection: 'inv-section-closing' },
    { id: 'motifs', name: 'Motif Adat (Gunungan & Mihrab)', ratio: '1:1', count: 61, tag: 'Simbol Sakral', slotTarget: 'monogram', targetSection: 'inv-section-schedule' },
    { id: 'textures', name: 'Tekstur Kertas Permukaan', ratio: 'Cover', count: 20, tag: 'Latar Belakang', slotTarget: 'monogram', targetSection: 'inv-gatekeeper' },
    { id: 'icons', name: 'Ikon & Lencana Acara', ratio: '1:1', count: 38, tag: 'Navigasi / Rundown', slotTarget: 'tailpiece', targetSection: 'inv-section-schedule' },
  ];

  const allAssets = useMemo<HariKitaAsset[]>(() => getHariKitaAssets(), []);

  const activeTaxonomyAssets = useMemo<HariKitaAsset[]>(() => {
    if (!selectedTaxonomy) return [];
    switch (selectedTaxonomy) {
      case 'dividers':
        return allAssets.filter(
          (a: HariKitaAsset) =>
            a.category === 'lines' ||
            a.tags.some((t: string) => ['divider', 'line', 'separator', 'border'].includes(t.toLowerCase()))
        );
      case 'corners':
        return allAssets.filter(
          (a: HariKitaAsset) =>
            a.category === 'corners' ||
            a.tags.some((t: string) => ['corner', 'sudut', 'angle', 'l-shape'].includes(t.toLowerCase()))
        );
      case 'arches':
        return allAssets.filter(
          (a: HariKitaAsset) =>
            (a.category === 'ornaments' || a.category === 'abstract') &&
            (a.name.toLowerCase().includes('arch') ||
              a.name.toLowerCase().includes('frame') ||
              a.name.toLowerCase().includes('crest') ||
              a.tags.some((t: string) => ['arch', 'frame', 'kubah'].includes(t.toLowerCase())))
        );
      case 'stems':
        return allAssets.filter((a: HariKitaAsset) =>
          ['flowers/single-stem', 'leaves/stems', 'leaves/branches', 'leaves/sprigs'].includes(a.category)
        );
      case 'blooms':
        return allAssets.filter((a: HariKitaAsset) =>
          ['flowers/blooms', 'flowers/accents'].includes(a.category)
        );
      case 'motifs':
        return allAssets.filter(
          (a: HariKitaAsset) =>
            ['ornaments', 'decorative', 'abstract'].includes(a.category) ||
            a.tags.some((t: string) => ['traditional', 'gunungan', 'mandala', 'motif', 'ornament', 'islamic'].includes(t.toLowerCase()))
        );
      case 'textures':
        return allAssets.filter((a: HariKitaAsset) => ['textures', 'patterns'].includes(a.category));
      case 'icons':
        return allAssets.filter((a: HariKitaAsset) => a.category === 'icons');
      default:
        return allAssets.slice(0, 20);
    }
  }, [allAssets, selectedTaxonomy]);

  const displayedTaxonomyAssets = activeTaxonomyAssets.length > 0 ? activeTaxonomyAssets : allAssets.slice(0, 16);

  const handleApplyTaxonomyAsset = (
    asset: HariKitaAsset,
    slotTarget: SlotZoneId,
    targetSection?: string
  ) => {
    updateConfig({
      slotAssets: {
        ...config.slotAssets,
        [slotTarget]: asset.filePath,
      },
      isGatekeeperOpened: true,
    });
    setAppliedAssetNotice(asset.name);
    setTimeout(() => setAppliedAssetNotice(null), 3000);

    if (targetSection) {
      setTimeout(() => {
        const el = document.getElementById(targetSection);
        if (el) {
          el.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
      }, 150);
    }
  };

  const sectionsList = config.sections || DEFAULT_STUDIO_SECTIONS;
  const content = config.content || DEFAULT_LIVE_CONTENT;

  return (
    <section id="studio-kustom" className="scroll-mt-24 space-y-6">
      {/* Studio Header Bar */}
      <div className="flex flex-col gap-3 rounded-2xl border border-hk-champagne/60 bg-gradient-to-r from-hk-ivory via-white to-hk-soft-beige/40 p-5 shadow-xs sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-2 text-hk-taupe">
            <Sliders className="h-4 w-4" />
            <span className="font-manrope text-[11px] font-bold uppercase tracking-widest">
              Live Interactive Atelier Studio
            </span>
            <span className="rounded-full bg-emerald-100 border border-emerald-300 px-2 py-0.5 text-[9px] font-manrope font-bold text-emerald-800">
              Zero Mondar-Mandir
            </span>
          </div>
          <h2 className="mt-0.5 font-editorial text-2xl sm:text-3xl text-hk-charcoal font-semibold">
            Studio Racik Undangan Digital Kustom
          </h2>
          <p className="font-manrope text-xs text-hk-charcoal/70 mt-0.5 max-w-2xl leading-relaxed">
            Atur warna, ketikkan data mempelai langsung, susun ulang urutan 11 seksi acara, dan bagikan tautan preview kustom ke keluarga.
          </p>
        </div>

        {/* Live Config Status Badge & Quick Actions */}
        <div className="flex items-center gap-2 self-start sm:self-auto shrink-0">
          <div className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-xl border border-hk-champagne/40 bg-white text-xs font-manrope text-hk-charcoal shadow-2xs">
            <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: config.themeColor }} />
            <span className="font-semibold text-hk-taupe font-mono text-[11px]">{config.themeColor}</span>
            <span className="text-hk-charcoal/40">•</span>
            <span className="font-semibold capitalize text-[11px]">{config.coupleVariant.split('-')[0]}</span>
          </div>

          <button
            onClick={handleCopyShareLink}
            className="flex items-center gap-1.5 rounded-xl bg-hk-taupe px-3 py-1.5 text-xs font-manrope font-semibold text-white hover:bg-hk-charcoal shadow-2xs transition-colors"
          >
            {copiedShareLink ? (
              <>
                <CheckCheck className="h-3.5 w-3.5 text-emerald-300" />
                <span>Link Tersalin!</span>
              </>
            ) : (
              <>
                <Share2 className="h-3.5 w-3.5" />
                <span>Bagikan Desain</span>
              </>
            )}
          </button>

          <button
            onClick={handleResetToDefaults}
            className="flex items-center gap-1.5 rounded-xl border border-hk-champagne/50 bg-white px-3 py-1.5 text-xs font-manrope font-semibold text-hk-charcoal hover:border-hk-taupe shadow-2xs transition-colors"
          >
            <RotateCcw className="h-3.5 w-3.5 text-hk-taupe" />
            <span>Reset</span>
          </button>
        </div>
      </div>

      {/* ================= SPLIT-SCREEN WORKBENCH LAYOUT ================= */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* ================= LEFT COLUMN: THE ATELIER INSPECTOR (7/12 ~ 60%) ================= */}
        <div className="lg:col-span-7 bg-white rounded-2xl border border-hk-champagne/60 shadow-sm flex flex-col h-[calc(100vh-140px)] min-h-[640px] overflow-hidden">
          
          {/* Sticky Inspector 6 Tabs Header */}
          <div className="flex items-center border-b border-hk-champagne/40 bg-hk-ivory/60 px-3 pt-2.5 gap-1.5 overflow-x-auto shrink-0 scrollbar-none">
            <button
              onClick={() => setActiveTab('warna')}
              className={cn(
                'flex items-center gap-1.5 px-3 py-2 rounded-t-xl text-xs font-manrope font-bold transition-all border-b-2 shrink-0',
                activeTab === 'warna'
                  ? 'border-hk-charcoal bg-white text-hk-charcoal shadow-2xs'
                  : 'border-transparent text-hk-charcoal/60 hover:text-hk-charcoal'
              )}
            >
              <span>🎨</span>
              <span>1. Warna</span>
            </button>

            <button
              onClick={() => setActiveTab('mempelai')}
              className={cn(
                'flex items-center gap-1.5 px-3 py-2 rounded-t-xl text-xs font-manrope font-bold transition-all border-b-2 shrink-0',
                activeTab === 'mempelai'
                  ? 'border-hk-charcoal bg-white text-hk-charcoal shadow-2xs'
                  : 'border-transparent text-hk-charcoal/60 hover:text-hk-charcoal'
              )}
            >
              <span>💑</span>
              <span>2. Mempelai</span>
            </button>

            <button
              onClick={() => setActiveTab('konten')}
              className={cn(
                'flex items-center gap-1.5 px-3 py-2 rounded-t-xl text-xs font-manrope font-bold transition-all border-b-2 shrink-0',
                activeTab === 'konten'
                  ? 'border-hk-charcoal bg-white text-hk-charcoal shadow-2xs'
                  : 'border-transparent text-hk-charcoal/60 hover:text-hk-charcoal'
              )}
            >
              <span>✍️</span>
              <span>3. Teks Live</span>
              <span className="bg-emerald-100 text-emerald-800 text-[9px] px-1.5 py-0.2 rounded-full font-mono font-bold">New</span>
            </button>

            <button
              onClick={() => setActiveTab('seksi')}
              className={cn(
                'flex items-center gap-1.5 px-3 py-2 rounded-t-xl text-xs font-manrope font-bold transition-all border-b-2 shrink-0',
                activeTab === 'seksi'
                  ? 'border-hk-charcoal bg-white text-hk-charcoal shadow-2xs'
                  : 'border-transparent text-hk-charcoal/60 hover:text-hk-charcoal'
              )}
            >
              <span>📑</span>
              <span>4. Urutan Seksi</span>
              <span className="bg-hk-champagne/30 text-hk-taupe text-[9px] px-1.5 py-0.2 rounded-full font-mono">11</span>
            </button>

            <button
              onClick={() => setActiveTab('bentuk')}
              className={cn(
                'flex items-center gap-1.5 px-3 py-2 rounded-t-xl text-xs font-manrope font-bold transition-all border-b-2 shrink-0',
                activeTab === 'bentuk'
                  ? 'border-hk-charcoal bg-white text-hk-charcoal shadow-2xs'
                  : 'border-transparent text-hk-charcoal/60 hover:text-hk-charcoal'
              )}
            >
              <span>📐</span>
              <span>5. Anatomi Aset</span>
            </button>

            <button
              onClick={() => setActiveTab('efek')}
              className={cn(
                'flex items-center gap-1.5 px-3 py-2 rounded-t-xl text-xs font-manrope font-bold transition-all border-b-2 shrink-0',
                activeTab === 'efek'
                  ? 'border-hk-charcoal bg-white text-hk-charcoal shadow-2xs'
                  : 'border-transparent text-hk-charcoal/60 hover:text-hk-charcoal'
              )}
            >
              <span>✨</span>
              <span>6. Efek &amp; Audio</span>
            </button>
          </div>

          {/* Scrollable Tab Content Container */}
          <div className="flex-1 overflow-y-auto p-5 space-y-6">
            
            {/* ================= TAB 1: WARNA & PALET ================= */}
            {activeTab === 'warna' && (
              <div className="space-y-6 animate-in fade-in duration-200">
                <StudioColorPalettePicker
                  selectedColor={config.themeColor}
                  onSelectColor={handleSelectColor}
                />

                {/* Quick Texture Overlay Picker */}
                <div className="rounded-xl border border-hk-champagne/40 bg-hk-ivory/30 p-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-editorial text-lg font-semibold text-hk-charcoal">
                        Tekstur Permukaan Kertas Sentuhan Fisik
                      </h4>
                      <p className="font-manrope text-xs text-hk-charcoal/65">
                        Aktifkan tekstur kertas serat alami untuk kedalaman optik mewah:
                      </p>
                    </div>
                    <span className="text-[10px] font-mono bg-hk-taupe/15 text-hk-taupe px-2 py-0.5 rounded-full font-semibold">
                      Tactile Surface
                    </span>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                    {[
                      { id: 'cotton-paper-texture', label: 'Cotton Paper', desc: 'Serat katun alami halus' },
                      { id: 'gold-foil', label: 'Gilded Gold Foil', desc: 'Kilau foil emas mewah' },
                      { id: 'frosted-glassmorphism', label: 'Frosted Crystal', desc: 'Kaca buram kedalaman' },
                      { id: 'inner-gilded-rim-light', label: 'Gilded Rim Light', desc: 'Pendar tepian emas' },
                    ].map((tex) => {
                      const isActive = config.activeEffects.includes(tex.id as VisualEffectId);
                      return (
                        <button
                          key={tex.id}
                          onClick={() => handleToggleEffect(tex.id as VisualEffectId)}
                          className={cn(
                            'p-2.5 rounded-xl border text-left transition-all',
                            isActive
                              ? 'border-hk-charcoal bg-white shadow-xs ring-1 ring-hk-charcoal'
                              : 'border-hk-champagne/40 bg-white/70 hover:border-hk-taupe'
                          )}
                        >
                          <div className="flex items-center justify-between">
                            <span className="font-editorial text-xs font-bold text-hk-charcoal">
                              {tex.label}
                            </span>
                            {isActive && <Check className="w-3 h-3 text-emerald-700" />}
                          </div>
                          <p className="font-manrope text-[10px] text-hk-charcoal/60 mt-0.5">
                            {tex.desc}
                          </p>
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>
            )}

            {/* ================= TAB 2: MEMPELAI & KARTU ================= */}
            {activeTab === 'mempelai' && (
              <div className="space-y-6 animate-in fade-in duration-200">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <div>
                      <h4 className="font-editorial text-xl font-semibold text-hk-charcoal">
                        8 Arketipe Kartu Pasangan Mempelai
                      </h4>
                      <p className="font-manrope text-xs text-hk-charcoal/65">
                        Pilih tata letak kartu pasangan yang langsung mengubah tampilan di smartphone:
                      </p>
                    </div>
                    <span className="text-xs font-manrope font-bold text-hk-taupe bg-hk-soft-beige px-2.5 py-0.5 rounded-full">
                      8 Varian Induk
                    </span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {coupleVariantsList.map((variant) => {
                      const isSelected = config.coupleVariant === variant.id;
                      return (
                        <button
                          key={variant.id}
                          onClick={() => handleSelectCoupleVariant(variant.id)}
                          className={cn(
                            'flex flex-col p-3 rounded-xl border text-left transition-all',
                            isSelected
                              ? 'border-hk-charcoal bg-hk-ivory shadow-xs ring-2 ring-hk-charcoal'
                              : 'border-hk-champagne/50 bg-white hover:border-hk-taupe'
                          )}
                        >
                          <div className="flex items-center justify-between w-full">
                            <span className="font-editorial text-sm font-bold text-hk-charcoal">
                              {variant.label}
                            </span>
                            <span className="font-mono text-[9px] px-1.5 py-0.2 bg-hk-champagne/30 text-hk-taupe rounded font-semibold">
                              {variant.archetype}
                            </span>
                          </div>
                          <p className="font-manrope text-xs text-hk-charcoal/65 mt-1">
                            {variant.desc}
                          </p>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Galeri Layout */}
                <div className="pt-2 border-t border-hk-champagne/30">
                  <h4 className="font-editorial text-lg font-semibold text-hk-charcoal mb-2">
                    Format Galeri Pre-wedding
                  </h4>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                    {galleryVariantsList.map((gv) => (
                      <button
                        key={gv.id}
                        onClick={() => handleSelectGalleryVariant(gv.id)}
                        className={cn(
                          'p-2 rounded-xl border text-center font-manrope text-xs font-semibold transition-all',
                          config.galleryVariant === gv.id
                            ? 'border-hk-charcoal bg-hk-charcoal text-white shadow-2xs'
                            : 'border-hk-champagne/50 bg-hk-ivory text-hk-charcoal hover:border-hk-taupe'
                        )}
                      >
                        {gv.label}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* ================= TAB 3: TEKS & KONTEN LIVE ================= */}
            {activeTab === 'konten' && (
              <div className="space-y-4 animate-in fade-in duration-200">
                <div className="border-b border-hk-champagne/30 pb-2">
                  <h4 className="font-editorial text-xl text-hk-charcoal font-semibold">
                    Editor Teks &amp; Informasi Acara Live
                  </h4>
                  <p className="font-manrope text-xs text-hk-charcoal/65 mt-0.5">
                    Ketik langsung data pernikahan. Perubahan seketika merefleksi di simulator smartphone sebelah kanan:
                  </p>
                </div>

                {/* Mempelai Pria */}
                <div className="rounded-xl border border-hk-champagne/40 bg-hk-ivory/20 p-3.5 space-y-3">
                  <span className="font-manrope text-[10px] uppercase font-bold tracking-wider text-hk-taupe block">
                    1. Data Calon Mempelai Pria (The Groom)
                  </span>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[11px] font-manrope font-semibold text-hk-charcoal/80 mb-1">
                        Nama Lengkap Pria:
                      </label>
                      <input
                        type="text"
                        value={content.groomName}
                        onChange={(e) => handleUpdateContentField('groomName', e.target.value)}
                        className="w-full rounded-lg border border-hk-champagne/60 bg-white px-3 py-1.5 text-xs font-manrope text-hk-charcoal focus:border-hk-charcoal focus:outline-none shadow-2xs"
                        placeholder="Nama Mempelai Pria"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-manrope font-semibold text-hk-charcoal/80 mb-1">
                        Nama Orang Tua Pria:
                      </label>
                      <input
                        type="text"
                        value={content.groomParents}
                        onChange={(e) => handleUpdateContentField('groomParents', e.target.value)}
                        className="w-full rounded-lg border border-hk-champagne/60 bg-white px-3 py-1.5 text-xs font-manrope text-hk-charcoal focus:border-hk-charcoal focus:outline-none shadow-2xs"
                        placeholder="Putra dari Bpk... & Ibu..."
                      />
                    </div>
                  </div>
                </div>

                {/* Mempelai Wanita */}
                <div className="rounded-xl border border-hk-champagne/40 bg-hk-ivory/20 p-3.5 space-y-3">
                  <span className="font-manrope text-[10px] uppercase font-bold tracking-wider text-hk-taupe block">
                    2. Data Calon Mempelai Wanita (The Bride)
                  </span>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[11px] font-manrope font-semibold text-hk-charcoal/80 mb-1">
                        Nama Lengkap Wanita:
                      </label>
                      <input
                        type="text"
                        value={content.brideName}
                        onChange={(e) => handleUpdateContentField('brideName', e.target.value)}
                        className="w-full rounded-lg border border-hk-champagne/60 bg-white px-3 py-1.5 text-xs font-manrope text-hk-charcoal focus:border-hk-charcoal focus:outline-none shadow-2xs"
                        placeholder="Nama Mempelai Wanita"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-manrope font-semibold text-hk-charcoal/80 mb-1">
                        Nama Orang Tua Wanita:
                      </label>
                      <input
                        type="text"
                        value={content.brideParents}
                        onChange={(e) => handleUpdateContentField('brideParents', e.target.value)}
                        className="w-full rounded-lg border border-hk-champagne/60 bg-white px-3 py-1.5 text-xs font-manrope text-hk-charcoal focus:border-hk-charcoal focus:outline-none shadow-2xs"
                        placeholder="Putri dari Bpk... & Ibu..."
                      />
                    </div>
                  </div>
                </div>

                {/* Waktu & Lokasi Acara Kebumen */}
                <div className="rounded-xl border border-hk-champagne/40 bg-hk-ivory/20 p-3.5 space-y-3">
                  <span className="font-manrope text-[10px] uppercase font-bold tracking-wider text-hk-taupe block">
                    3. Waktu &amp; Lokasi Acara (Pilot Kebumen)
                  </span>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[11px] font-manrope font-semibold text-hk-charcoal/80 mb-1">
                        Tanggal Pernikahan:
                      </label>
                      <input
                        type="text"
                        value={content.weddingDate}
                        onChange={(e) => handleUpdateContentField('weddingDate', e.target.value)}
                        className="w-full rounded-lg border border-hk-champagne/60 bg-white px-3 py-1.5 text-xs font-manrope text-hk-charcoal focus:border-hk-charcoal focus:outline-none shadow-2xs"
                        placeholder="Sabtu, 24 Oktober 2026"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-manrope font-semibold text-hk-charcoal/80 mb-1">
                        Nama Gedung / Tempat:
                      </label>
                      <input
                        type="text"
                        value={content.venueName}
                        onChange={(e) => handleUpdateContentField('venueName', e.target.value)}
                        className="w-full rounded-lg border border-hk-champagne/60 bg-white px-3 py-1.5 text-xs font-manrope text-hk-charcoal focus:border-hk-charcoal focus:outline-none shadow-2xs"
                        placeholder="Gedung Graha Kebumen"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-[11px] font-manrope font-semibold text-hk-charcoal/80 mb-1">
                      Alamat Lengkap di Kebumen:
                    </label>
                    <input
                      type="text"
                      value={content.venueAddress}
                      onChange={(e) => handleUpdateContentField('venueAddress', e.target.value)}
                      className="w-full rounded-lg border border-hk-champagne/60 bg-white px-3 py-1.5 text-xs font-manrope text-hk-charcoal focus:border-hk-charcoal focus:outline-none shadow-2xs"
                      placeholder="Jl. Pahlawan No. 45, Kebumen, Jawa Tengah"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-manrope font-semibold text-hk-charcoal/80 mb-1">
                      Link Google Maps (Wajib HTTPS):
                    </label>
                    <input
                      type="url"
                      value={content.locationMapsUrl}
                      onChange={(e) => handleUpdateContentField('locationMapsUrl', sanitizeUrl(e.target.value))}
                      className="w-full rounded-lg border border-hk-champagne/60 bg-white px-3 py-1.5 text-xs font-manrope text-hk-charcoal focus:border-hk-charcoal focus:outline-none shadow-2xs"
                      placeholder="https://maps.google.com/..."
                    />
                  </div>
                </div>

                {/* Hadiah & Tanda Kasih Digital */}
                <div className="rounded-xl border border-hk-champagne/40 bg-hk-ivory/20 p-3.5 space-y-3">
                  <span className="font-manrope text-[10px] uppercase font-bold tracking-wider text-hk-taupe block">
                    4. Tanda Kasih &amp; Rekening Bank
                  </span>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div>
                      <label className="block text-[11px] font-manrope font-semibold text-hk-charcoal/80 mb-1">
                        Nama Bank:
                      </label>
                      <input
                        type="text"
                        value={content.bankName}
                        onChange={(e) => handleUpdateContentField('bankName', e.target.value)}
                        className="w-full rounded-lg border border-hk-champagne/60 bg-white px-3 py-1.5 text-xs font-manrope text-hk-charcoal focus:border-hk-charcoal focus:outline-none shadow-2xs"
                        placeholder="Bank BCA Kebumen"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-manrope font-semibold text-hk-charcoal/80 mb-1">
                        Nomor Rekening:
                      </label>
                      <input
                        type="text"
                        value={content.bankAccount}
                        onChange={(e) => handleUpdateContentField('bankAccount', e.target.value)}
                        className="w-full rounded-lg border border-hk-champagne/60 bg-white px-3 py-1.5 text-xs font-manrope text-hk-charcoal focus:border-hk-charcoal focus:outline-none shadow-2xs"
                        placeholder="123-456-7890"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-manrope font-semibold text-hk-charcoal/80 mb-1">
                        Atas Nama (Holder):
                      </label>
                      <input
                        type="text"
                        value={content.bankHolder}
                        onChange={(e) => handleUpdateContentField('bankHolder', e.target.value)}
                        className="w-full rounded-lg border border-hk-champagne/60 bg-white px-3 py-1.5 text-xs font-manrope text-hk-charcoal focus:border-hk-charcoal focus:outline-none shadow-2xs"
                        placeholder="Aditya Pratama"
                      />
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* ================= TAB 4: URUTAN SEKSI ACARA (REORDER & TOGGLE) ================= */}
            {activeTab === 'seksi' && (
              <div className="space-y-4 animate-in fade-in duration-200">
                <div className="border-b border-hk-champagne/30 pb-2">
                  <h4 className="font-editorial text-2xl text-hk-charcoal font-semibold leading-none">
                    Urutan &amp; Visibilitas 11 Seksi Acara
                  </h4>
                  <p className="font-manrope text-xs text-hk-charcoal/65 mt-1">
                    Atur susunan seksi acara (naik/turunkan urutan) dan aktifkan/sembunyikan seksi sesuai kebutuhan acara:
                  </p>
                </div>

                <div className="space-y-2">
                  {sectionsList.map((sec, index) => (
                    <div
                      key={sec.id}
                      className={cn(
                        'flex items-center justify-between rounded-xl border p-3 transition-all shadow-2xs',
                        sec.enabled
                          ? 'border-hk-champagne/50 bg-white hover:border-hk-taupe'
                          : 'border-hk-champagne/30 bg-hk-soft-beige/30 opacity-60'
                      )}
                    >
                      <div className="flex items-center gap-3 min-w-0 pr-2">
                        {/* Reorder Buttons */}
                        <div className="flex flex-col gap-1 shrink-0">
                          <button
                            type="button"
                            disabled={index === 0}
                            onClick={() => handleMoveSection(sec.id, 'up')}
                            className="w-7 h-7 flex items-center justify-center rounded border border-hk-champagne/50 bg-hk-ivory hover:bg-white text-hk-charcoal disabled:opacity-30 disabled:pointer-events-none transition-colors"
                            title="Naikkan Urutan"
                          >
                            <ArrowUp className="w-3.5 h-3.5" />
                          </button>
                          <button
                            type="button"
                            disabled={index === sectionsList.length - 1}
                            onClick={() => handleMoveSection(sec.id, 'down')}
                            className="w-7 h-7 flex items-center justify-center rounded border border-hk-champagne/50 bg-hk-ivory hover:bg-white text-hk-charcoal disabled:opacity-30 disabled:pointer-events-none transition-colors"
                            title="Turunkan Urutan"
                          >
                            <ArrowDown className="w-3.5 h-3.5" />
                          </button>
                        </div>

                        <div className="min-w-0">
                          <div className="flex items-center gap-2">
                            <span className="font-mono text-[10px] font-bold text-hk-taupe bg-hk-ivory px-1.5 py-0.2 rounded border border-hk-champagne/40">
                              #{index + 1}
                            </span>
                            <h5 className="font-editorial text-sm font-bold text-hk-charcoal truncate">
                              {sec.label}
                            </h5>
                          </div>
                          <p className="font-manrope text-[11px] text-hk-charcoal/60 mt-0.5 truncate">
                            Status: {sec.enabled ? 'Aktif Tampil di Layar' : 'Disembunyikan'}
                          </p>
                        </div>
                      </div>

                      {/* Visibility Toggle & Quick Jump */}
                      <div className="flex items-center gap-2 shrink-0">
                        <button
                          type="button"
                          onClick={() => handleToggleSectionVisibility(sec.id)}
                          className={cn(
                            'flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-manrope font-semibold transition-colors shadow-2xs',
                            sec.enabled
                              ? 'bg-hk-ivory text-hk-charcoal hover:bg-hk-soft-beige border border-hk-champagne/60'
                              : 'bg-stone-200 text-stone-600 hover:bg-stone-300'
                          )}
                          title={sec.enabled ? 'Sembunyikan dari Undangan' : 'Tampilkan di Undangan'}
                        >
                          {sec.enabled ? <Eye className="w-3.5 h-3.5 text-emerald-700" /> : <EyeOff className="w-3.5 h-3.5 text-stone-500" />}
                          <span className="hidden sm:inline">{sec.enabled ? 'Aktif' : 'Off'}</span>
                        </button>

                        <button
                          type="button"
                          onClick={() => handleQuickJump(`inv-section-${sec.id}`)}
                          className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg border border-hk-champagne/50 bg-white text-xs font-manrope font-semibold text-hk-taupe hover:border-hk-taupe hover:text-hk-charcoal shadow-2xs transition-colors"
                        >
                          <span>Lihat</span>
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* ================= TAB 5: ANATOMI BENTUK ASET ================= */}
            {activeTab === 'bentuk' && (
              <div className="space-y-6 animate-in fade-in duration-200">
                {/* 8 Geometric Taxonomy */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between border-b border-hk-champagne/30 pb-2">
                    <div>
                      <h4 className="font-editorial text-xl text-hk-charcoal font-semibold">
                        8 Taksonomi Bentuk Geometris (254 Aset)
                      </h4>
                      <p className="font-manrope text-xs text-hk-charcoal/65 mt-0.5">
                        Pilih klasifikasi bentuk untuk membuka laci koleksi aset dan menyematkannya ke smartphone:
                      </p>
                    </div>
                    <span className="text-xs font-mono font-bold bg-hk-taupe/15 text-hk-taupe px-2.5 py-0.5 rounded-full">
                      254 Curated
                    </span>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                    {shapeTaxonomySummary.map((st) => {
                      const isSelected = selectedTaxonomy === st.id;
                      return (
                        <button
                          key={st.id}
                          type="button"
                          onClick={() => setSelectedTaxonomy(st.id)}
                          className={cn(
                            'rounded-xl border p-2.5 text-left transition-all relative cursor-pointer',
                            isSelected
                              ? 'border-hk-charcoal bg-white shadow-xs ring-2 ring-hk-charcoal'
                              : 'border-hk-champagne/40 bg-hk-ivory/30 hover:border-hk-taupe hover:bg-white'
                          )}
                        >
                          <div className="flex items-center justify-between text-[9px] font-mono text-hk-taupe font-bold">
                            <span>{st.ratio}</span>
                            <span
                              className={cn(
                                'px-1.5 py-0.2 rounded border transition-colors',
                                isSelected
                                  ? 'bg-hk-charcoal text-white border-hk-charcoal'
                                  : 'bg-white text-hk-taupe border-hk-champagne/40'
                              )}
                            >
                              {st.count} aset
                            </span>
                          </div>
                          <h5 className="font-editorial text-xs font-bold text-hk-charcoal mt-1 line-clamp-1">
                            {st.name.split('(')[0]}
                          </h5>
                          <p className="font-manrope text-[9px] text-hk-charcoal/60 mt-0.5">
                            {st.tag}
                          </p>
                          {isSelected && (
                            <span className="absolute -top-1.5 -right-1.5 bg-hk-charcoal text-white text-[8px] font-manrope font-bold px-1.5 py-0.2 rounded-full shadow-2xs">
                              Aktif
                            </span>
                          )}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Quick Asset Explorer Drawer for Selected Taxonomy */}
                {selectedTaxonomy && (
                  <div className="rounded-2xl border border-hk-champagne/60 bg-white p-4 shadow-sm space-y-3 animate-in fade-in slide-in-from-top-2 duration-200">
                    <div className="flex items-center justify-between border-b border-hk-champagne/30 pb-2">
                      <div className="flex items-center gap-2">
                        <span className="text-base">✨</span>
                        <div>
                          <h4 className="font-editorial text-sm font-bold text-hk-charcoal">
                            Koleksi Aset: {shapeTaxonomySummary.find((s) => s.id === selectedTaxonomy)?.name}
                          </h4>
                          <p className="font-manrope text-[11px] text-hk-charcoal/65">
                            Klik aset di bawah untuk menyematkannya ke slot preview smartphone (Zona{' '}
                            <span className="font-mono font-bold text-hk-taupe">
                              {shapeTaxonomySummary.find((s) => s.id === selectedTaxonomy)?.slotTarget}
                            </span>
                            ):
                          </p>
                        </div>
                      </div>
                      <span className="text-[10px] font-mono font-bold bg-hk-ivory px-2 py-0.5 rounded-full border border-hk-champagne/50 text-hk-taupe">
                        {displayedTaxonomyAssets.length} Aset Siap Pakai
                      </span>
                    </div>

                    {appliedAssetNotice && (
                      <div className="flex items-center gap-2 p-2 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-manrope font-semibold animate-in fade-in duration-150">
                        <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                        <span>Aset "{appliedAssetNotice}" berhasil diterapkan ke slot &amp; preview disinkronkan!</span>
                      </div>
                    )}

                    {/* Asset Grid */}
                    <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-2 max-h-56 overflow-y-auto pr-1">
                      {displayedTaxonomyAssets.map((asset: HariKitaAsset) => {
                        const targetSlot = shapeTaxonomySummary.find((s) => s.id === selectedTaxonomy)?.slotTarget || 'monogram';
                        const targetSec = shapeTaxonomySummary.find((s) => s.id === selectedTaxonomy)?.targetSection || 'inv-section-muqaddimah';
                        const currentSlotAsset = (config.slotAssets as any)[targetSlot] || '';
                        const isApplied = currentSlotAsset.includes(asset.filePath) || currentSlotAsset.includes(asset.id);

                        return (
                          <button
                            key={asset.id}
                            type="button"
                            onClick={() => handleApplyTaxonomyAsset(asset, targetSlot, targetSec)}
                            className={cn(
                              'group relative flex flex-col items-center justify-between rounded-xl border p-2 text-center transition-all cursor-pointer',
                              isApplied
                                ? 'border-hk-charcoal bg-hk-ivory shadow-xs ring-1 ring-hk-charcoal'
                                : 'border-hk-champagne/40 bg-white hover:border-hk-taupe hover:shadow-xs'
                            )}
                            title={`Klik untuk terapkan ${asset.name}`}
                          >
                            <div className="h-12 w-full flex items-center justify-center rounded-lg bg-hk-ivory/50 p-1 mb-1">
                              <DynamicSvgRenderer
                                asset={asset}
                                color={config.themeColor}
                                className="h-9 w-9 object-contain"
                              />
                            </div>
                            <span className="font-editorial text-[10px] font-semibold text-hk-charcoal truncate w-full block">
                              {asset.name}
                            </span>
                            <span className="text-[8px] font-mono text-hk-taupe truncate w-full block">
                              {asset.aspectRatio}
                            </span>
                            {isApplied && (
                              <span className="absolute top-1 right-1 h-3.5 w-3.5 rounded-full bg-hk-charcoal text-white flex items-center justify-center text-[8px]">
                                ✓
                              </span>
                            )}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* Placement Style Picker */}
                <StudioPlacementPicker
                  selectedStyle={config.placementStyle}
                  onSelectStyle={handleSelectPlacementStyle}
                  themeColor={config.themeColor}
                />

                {/* 6 Curated Slot Ornaments Customizer */}
                <div className="rounded-xl border border-hk-champagne/40 bg-white p-4 space-y-3 shadow-2xs">
                  <div className="flex items-start justify-between border-b border-hk-champagne/30 pb-2">
                    <div>
                      <h4 className="font-editorial text-lg text-hk-charcoal font-semibold">
                        Kustomisasi 6 Zona Slot Ornamen Vektor
                      </h4>
                      <p className="font-manrope text-xs text-hk-charcoal/60 mt-0.5">
                        Tukar ornamen satuan sesuai selera. Dilengkapi pengaman visual guardrails:
                      </p>
                    </div>
                    <span className="flex items-center gap-1 text-[10px] font-manrope font-semibold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                      <ShieldCheck className="h-3 w-3 text-emerald-700" />
                      <span>Guardrails</span>
                    </span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                    {(Object.keys(SLOT_ZONE_RULES) as SlotZoneId[]).map((slotId) => {
                      const rule = SLOT_ZONE_RULES[slotId];
                      const activeAsset = (config.slotAssets as any)[slotId] || 'Bawaan Gaya';
                      return (
                        <div
                          key={slotId}
                          className="flex items-center justify-between rounded-xl border border-hk-champagne/40 bg-hk-ivory/30 p-2.5"
                        >
                          <div className="min-w-0 pr-2">
                            <span className="font-manrope text-[9px] font-bold uppercase tracking-wider text-hk-taupe">
                              {rule.label.split(':')[0]}
                            </span>
                            <p className="font-editorial text-sm font-semibold text-hk-charcoal truncate">
                              {rule.label.split(':')[1]}
                            </p>
                            <span className="font-mono text-[9px] text-hk-charcoal/60 block truncate">
                              {String(activeAsset).split('/').pop() || activeAsset}
                            </span>
                          </div>

                          <button
                            onClick={() => setActiveSlotModal(slotId)}
                            className="shrink-0 rounded-lg px-2.5 py-1 text-xs font-manrope font-semibold text-white shadow-2xs transition-transform active:scale-95"
                            style={{ backgroundColor: config.themeColor }}
                          >
                            Ganti Aset
                          </button>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            )}

            {/* ================= TAB 6: EFEK & AUDIO ================= */}
            {activeTab === 'efek' && (
              <div className="space-y-6 animate-in fade-in duration-200">
                {/* Audio URL Input */}
                <div className="rounded-xl border border-hk-champagne/40 bg-hk-ivory/30 p-4 space-y-2">
                  <div className="flex items-center gap-2 text-hk-charcoal">
                    <Volume2 className="h-4 w-4 text-hk-taupe" />
                    <h4 className="font-editorial text-base font-bold">Audio / Lagu Latar Belakang</h4>
                  </div>
                  <p className="font-manrope text-xs text-hk-charcoal/70">
                    Masukkan tautan file audio (MP3 via HTTPS) yang akan diputar otomatis begitu amplop segel lilin 3D dibuka:
                  </p>
                  <input
                    type="url"
                    value={config.audioUrl || ''}
                    onChange={(e) => updateConfig({ audioUrl: sanitizeUrl(e.target.value) })}
                    placeholder="https://domain.com/musik-romantis.mp3"
                    className="w-full rounded-lg border border-hk-champagne/60 bg-white px-3 py-1.5 text-xs font-manrope text-hk-charcoal focus:border-hk-charcoal focus:outline-none shadow-2xs"
                  />
                  <span className="text-[10px] font-manrope text-hk-taupe block">
                    * Browser mobile secara otomatis mengizinkan audio karena dipicu langsung saat tamu menekan "Buka Undangan".
                  </span>
                </div>

                <StudioEffectsController
                  activeEffects={config.activeEffects}
                  activeAnimations={config.activeAnimations}
                  currentMood={config.animationMood}
                  onApplyMood={handleApplyMood}
                  onToggleEffect={handleToggleEffect}
                  onToggleAnimation={handleToggleAnimation}
                  themeColor={config.themeColor}
                />
              </div>
            )}

          </div>

          {/* Bottom Floating Action Bar */}
          <div className="border-t border-hk-champagne/40 bg-hk-ivory/70 p-3.5 flex items-center justify-between gap-3 shrink-0">
            <div className="flex items-center gap-2 text-xs font-manrope text-hk-charcoal/75">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span>Auto-saved real-time</span>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={handleCopyShareLink}
                className="flex items-center gap-1.5 rounded-xl border border-hk-champagne/60 bg-white px-3 py-1.5 text-xs font-manrope font-semibold text-hk-charcoal hover:border-hk-taupe shadow-2xs transition-all"
              >
                {copiedShareLink ? (
                  <>
                    <CheckCheck className="h-3.5 w-3.5 text-emerald-600" />
                    <span>Link Tersalin!</span>
                  </>
                ) : (
                  <>
                    <Share2 className="h-3.5 w-3.5 text-hk-taupe" />
                    <span>Bagikan URL Desain</span>
                  </>
                )}
              </button>

              <button
                onClick={handleCopyConfigJson}
                className="hidden sm:flex items-center gap-1.5 rounded-xl border border-hk-champagne/60 bg-white px-3 py-1.5 text-xs font-manrope font-semibold text-hk-charcoal hover:border-hk-taupe shadow-2xs transition-all"
              >
                {copiedConfig ? (
                  <>
                    <CheckCheck className="h-3.5 w-3.5 text-emerald-600" />
                    <span>JSON Tersalin!</span>
                  </>
                ) : (
                  <>
                    <Copy className="h-3.5 w-3.5 text-hk-taupe" />
                    <span>Salin JSON</span>
                  </>
                )}
              </button>

              <button
                onClick={handleResetToDefaults}
                className="rounded-xl px-3 py-1.5 text-xs font-manrope font-semibold text-white shadow-2xs transition-all"
                style={{ backgroundColor: config.themeColor }}
              >
                Reset
              </button>
            </div>
          </div>
        </div>

        {/* ================= RIGHT COLUMN: LIVE SMARTPHONE CANVAS (5/12 ~ 40%) ================= */}
        <div className="lg:col-span-5 lg:sticky lg:top-20 space-y-3">
          
          {/* Top Smartphone Utility Strip */}
          <div className="flex flex-col gap-2 rounded-xl border border-hk-champagne/50 bg-white p-2.5 shadow-2xs">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5 text-xs font-manrope font-bold text-hk-charcoal">
                <Smartphone className="h-4 w-4 text-hk-taupe" />
                <span>Smartphone Simulator</span>
              </div>

              {/* Dynamic Zoom Scale Switcher (75% Fit, 85%, 100%) */}
              <div className="flex items-center bg-hk-ivory border border-hk-champagne/60 rounded-full p-0.5 text-[10px] font-manrope font-bold text-hk-charcoal">
                <button
                  onClick={() => setZoomScale(0.75)}
                  className={cn(
                    'px-2 py-0.5 rounded-full transition-all',
                    zoomScale === 0.75
                      ? 'bg-hk-charcoal text-white shadow-2xs'
                      : 'text-hk-charcoal/70 hover:text-hk-charcoal'
                  )}
                >
                  75% Pas
                </button>
                <button
                  onClick={() => setZoomScale(0.85)}
                  className={cn(
                    'px-2 py-0.5 rounded-full transition-all',
                    zoomScale === 0.85
                      ? 'bg-hk-charcoal text-white shadow-2xs'
                      : 'text-hk-charcoal/70 hover:text-hk-charcoal'
                  )}
                >
                  85%
                </button>
                <button
                  onClick={() => setZoomScale(1.0)}
                  className={cn(
                    'px-2 py-0.5 rounded-full transition-all',
                    zoomScale === 1.0
                      ? 'bg-hk-charcoal text-white shadow-2xs'
                      : 'text-hk-charcoal/70 hover:text-hk-charcoal'
                  )}
                >
                  100%
                </button>
              </div>

              {/* Quick Open/Close Gatekeeper Toggle */}
              <button
                onClick={() => updateConfig({ isGatekeeperOpened: !config.isGatekeeperOpened })}
                className="text-[10px] font-manrope font-semibold text-hk-taupe hover:underline"
              >
                {config.isGatekeeperOpened ? '↺ Tutup Amplop' : '✦ Buka Undangan'}
              </button>
            </div>

            {/* Quick Section Jump Navigation Pills */}
            <div className="flex items-center gap-1 overflow-x-auto scrollbar-none pt-1 border-t border-hk-champagne/30 text-[9px] font-manrope font-semibold text-hk-taupe">
              <span className="shrink-0 text-hk-charcoal/50 mr-1">Pintasan:</span>
              <button
                onClick={() => handleQuickJump('inv-gatekeeper')}
                className="px-2 py-0.5 rounded-full bg-hk-ivory hover:bg-hk-champagne/30 border border-hk-champagne/40 shrink-0"
              >
                Sampul
              </button>
              <button
                onClick={() => handleQuickJump('inv-section-couple')}
                className="px-2 py-0.5 rounded-full bg-hk-ivory hover:bg-hk-champagne/30 border border-hk-champagne/40 shrink-0"
              >
                Mempelai
              </button>
              <button
                onClick={() => handleQuickJump('inv-section-schedule')}
                className="px-2 py-0.5 rounded-full bg-hk-ivory hover:bg-hk-champagne/30 border border-hk-champagne/40 shrink-0"
              >
                Jadwal
              </button>
              <button
                onClick={() => handleQuickJump('inv-section-location')}
                className="px-2 py-0.5 rounded-full bg-hk-ivory hover:bg-hk-champagne/30 border border-hk-champagne/40 shrink-0"
              >
                Lokasi
              </button>
              <button
                onClick={() => handleQuickJump('inv-section-gallery')}
                className="px-2 py-0.5 rounded-full bg-hk-ivory hover:bg-hk-champagne/30 border border-hk-champagne/40 shrink-0"
              >
                Galeri
              </button>
              <button
                onClick={() => handleQuickJump('inv-section-gift')}
                className="px-2 py-0.5 rounded-full bg-hk-ivory hover:bg-hk-champagne/30 border border-hk-champagne/40 shrink-0"
              >
                Hadiah
              </button>
              <button
                onClick={() => handleQuickJump('inv-section-rsvp')}
                className="px-2 py-0.5 rounded-full bg-hk-ivory hover:bg-hk-champagne/30 border border-hk-champagne/40 shrink-0"
              >
                RSVP
              </button>
            </div>
          </div>

          {/* Smartphone Hardware Frame & Live Content */}
          <DeviceFrameContainer
            activeFrame={config.activeFrame}
            onChangeFrame={(f) => updateConfig({ activeFrame: f })}
            scale={zoomScale}
          >
            <InvitationDevicePreview
              config={config}
              onUpdateConfig={updateConfig}
              onSelectSection={handleSelectSectionHotspot}
            />
          </DeviceFrameContainer>
        </div>

      </div>

      {/* Asset Swap Modal */}
      {activeSlotModal && (
        <StudioSlotAssetModal
          slot={activeSlotModal}
          activeAssetId={(config.slotAssets as any)[activeSlotModal] || ''}
          placementStyle={config.placementStyle}
          themeColor={config.themeColor}
          onSelectAsset={(filePath) => {
            updateConfig({
              slotAssets: {
                ...config.slotAssets,
                [activeSlotModal]: filePath,
              },
            });
          }}
          onClose={() => setActiveSlotModal(null)}
        />
      )}
    </section>
  );
}
