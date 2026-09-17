"use client";

import React, { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import {
  Sparkles,
  ShieldCheck,
  Compass,
  MapPin,
  Heart,
  ArrowRight,
  CheckCircle2,
  Camera,
  Scissors,
  Palette,
  Utensils,
  Cake,
  Gift,
  Mail,
  Map,
  Phone,
  CalendarCheck,
  Check,
  Layers,
} from "lucide-react";
import {
  DecorativeDivider,
} from "@/components/harikita/ui";
import type { VendorPortfolioData } from "@/components/home/VendorPortfolioModal";
import { FloatingConcierge } from "@/components/layout/FloatingConcierge";

type EventPhase = "all" | "prewed_attire" | "main_event" | "details";

const CATEGORIES: (VendorPortfolioData & {
  icon: React.ComponentType<{ className?: string }>;
  phase: EventPhase;
})[] = [
    {
      id: "prewed",
      title: "Pre-wedding Alam & Studio",
      vendor: "Menganti Cinematic & Studio",
      district: "Kecamatan Ayah",
      price: "Rp 3.500.000",
      desc: "Spot Pantai Menganti & bukit eksotis, 2 busana, drone aerial, 25 edited photo, teaser 60s.",
      icon: Camera,
      badge: "Favorit Kebumen",
      phase: "prewed_attire",
      highlights: [
        "Spot ikonik Pantai Menganti & Bukit Hud eksotis",
        "2 Sesi pergantian busana (Casual & Adat)",
        "Pilot drone aerial berlisensi & video teaser 60 detik",
        "25 Foto edited high-res + flashdisk kayu grafir",
      ],
      photos: [
        {
          url: "https://images.unsplash.com/photo-1519741497674-611481863552?q=80&w=600",
          caption: "Pre-wedding Sunset Pantai Menganti",
        },
        {
          url: "https://images.unsplash.com/photo-1522673607200-164d1b6ce486?q=80&w=600",
          caption: "Pemandangan Tebing & Samudra Hindia",
        },
        {
          url: "https://images.unsplash.com/photo-1511285560929-80b456fea0bc?q=80&w=600",
          caption: "Sesi Intimate Indoor Studio",
        },
      ],
    },
    {
      id: "busana",
      title: "Busana Pengantin & Fitting",
      vendor: "Griya Busana Rarasati",
      district: "Kebumen Kota",
      price: "Rp 2.800.000",
      desc: "Sewa perdana kebaya modern / beskap adat Jawa, aksesori lengkap, dan 2x sesi fitting gratis.",
      icon: Scissors,
      badge: "Fitting 2x",
      phase: "prewed_attire",
      highlights: [
        "Sewa perdana kebaya brokat mewah & beskap Jawa halus",
        "Aksesori lengkap: jarik prada, keris, ronce, selop",
        "2x Sesi fitting fisik (pengukuran awal & final check)",
        "Opsi add-on busana kembar orang tua & besan",
      ],
      photos: [
        {
          url: "https://images.unsplash.com/photo-1583939003579-730e3918a45a?q=80&w=600",
          caption: "Beskap Sikepan & Kebaya Jawa Keraton",
        },
        {
          url: "https://images.unsplash.com/photo-1529636798458-92182e662485?q=80&w=600",
          caption: "Gaun Pengantin Modern Champagne",
        },
        {
          url: "https://images.unsplash.com/photo-1537633552985-df8429e8048b?q=80&w=600",
          caption: "Ruang Fitting Busana Griya Rarasati",
        },
      ],
    },
    {
      id: "mua",
      title: "Makeup Artist (MUA)",
      vendor: "Alula MUA & Hijab Styling",
      district: "Kebumen Kota",
      price: "Rp 2.200.000",
      desc: "Rias pengantin soft glam / adat, melati segar keraton, hijab styling syar'i, touch-up standby.",
      icon: Palette,
      badge: "Tahan 12 Jam",
      phase: "prewed_attire",
      highlights: [
        "Base makeup tahan air & keringat hingga 12 jam",
        "Ronce melati asli segar wangi keraton",
        "Pilihan hijab do syar'i atau paes adat Jawa modern",
        "Asisten MUA standby touch-up hingga prosesi usai",
      ],
      photos: [
        {
          url: "https://images.unsplash.com/photo-1522673607200-164d1b6ce486?q=80&w=600",
          caption: "Riasan Pengantin Soft Glam Korean Glow",
        },
        {
          url: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=600",
          caption: "Hijab Styling Pengantin Anggun",
        },
        {
          url: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=600",
          caption: "Detail Melati Ronce Asli Kebumen",
        },
      ],
    },
    {
      id: "seserahan",
      title: "Seserahan Akrilik & Mahar",
      vendor: "Hantaran Lestari Kebumen",
      district: "Karanganyar",
      price: "Rp 1.050.000 (7 Baki)",
      desc: "Baki akrilik kristal kombinasi kayu jati, bunga premium, kalkulator fleksibel per kotak.",
      icon: Gift,
      badge: "Kalkulator Baki",
      phase: "details",
      highlights: [
        "Tutup baki akrilik tebal crystal clear anti-gores",
        "Tatakan kayu jati solid finishing natural mewah",
        "Hiasan artificial flowers kualitas ekspor & pita satin",
        "Pigura mahar kaca custom nominal & inisial 3D",
      ],
      photos: [
        {
          url: "https://images.unsplash.com/photo-1518895949257-7621c3c786d7?q=80&w=600",
          caption: "Hiasan Baki Seserahan Akrilik Kristal",
        },
        {
          url: "https://images.unsplash.com/photo-1519225421980-715cb0215aed?q=80&w=600",
          caption: "Frame Mahar Emas Kaca 3D",
        },
        {
          url: "https://images.unsplash.com/photo-1465495976277-4387d4b0b4c6?q=80&w=600",
          caption: "Paket 7 Baki Hantaran Siap Kirim",
        },
      ],
    },
    {
      id: "foto",
      title: "Dokumentasi Foto & Video",
      vendor: "Pradana Cinema & Story",
      district: "Kebumen Kota",
      price: "Rp 4.200.000",
      desc: "Liputan hari H akad & resepsi, video cinematic 7 menit, teaser Reels, flashdisk kayu eksklusif.",
      icon: Camera,
      badge: "Drone Aerial",
      phase: "main_event",
      highlights: [
        "Liputan penuh prosesi akad & resepsi",
        "Tim liputan: 2 fotografer + 1 videografer sinematik",
        "Video cinematic teaser Reels 60s + film dokumenter 7 menit",
        "Seluruh file foto original + 60 edited photo album",
      ],
      photos: [
        {
          url: "https://images.unsplash.com/photo-1511285560929-80b456fea0bc?q=80&w=600",
          caption: "Momen Sakral Ijab Kabul Akad Nikah",
        },
        {
          url: "https://images.unsplash.com/photo-1519741497674-611481863552?q=80&w=600",
          caption: "Cinematic Film Suasana Resepsi",
        },
        {
          url: "https://images.unsplash.com/photo-1520854221256-17451cc331bf?q=80&w=600",
          caption: "Box Kayu Flashdisk Ukir Inisial",
        },
      ],
    },
    {
      id: "dekor",
      title: "Dekorasi Pelaminan & Florist",
      vendor: "Asmara Flora & Pelaminan",
      district: "Gombong",
      price: "Rp 5.500.000",
      desc: "Pelaminan intimate 4-6 meter bunga segar, karpet jalan, photobooth lamaran estetik.",
      icon: Heart,
      badge: "Bunga Segar",
      phase: "main_event",
      highlights: [
        "Pelaminan intimate 4-6 meter (modern rustic / adat Jawa)",
        "Rangkaian bunga segar mawar, krisan & dedaunan eukaliptus",
        "Karpet permadani jalan & pergola pintu masuk estetik",
        "Area photobooth tamu dengan standing sign akrilik",
      ],
      photos: [
        {
          url: "https://images.unsplash.com/photo-1519225421980-715cb0215aed?q=80&w=600",
          caption: "Pelaminan Intimate Bunga Segar Pilihan",
        },
        {
          url: "https://images.unsplash.com/photo-1465495976277-4387d4b0b4c6?q=80&w=600",
          caption: "Backdrop Photobooth Lamaran",
        },
        {
          url: "https://images.unsplash.com/photo-1509927083803-4bd519298ac4?q=80&w=600",
          caption: "Pergola Pintu Masuk Karpet Merah",
        },
      ],
    },
    {
      id: "katering",
      title: "Katering Prasmanan & Stall",
      vendor: "Dapur Rasa Boga Kebumen",
      district: "Kutowinangun",
      price: "Rp 45.000 / Pax",
      desc: "Menu komplit khas Kebumen, waiter standby, gratis Sample Test Food Box sebelum hari H.",
      icon: Utensils,
      badge: "Gratis Test Food",
      phase: "main_event",
      highlights: [
        "Menu prasmanan komplit nusantara & hidangan khas Kebumen",
        "Gratis Sample Box Test Food diantar langsung ke rumah",
        "Pramusaji standby berbusana rapi menjaga higienitas",
        "Peralatan roll-top chafing dish & meja buffet dekoratif",
      ],
      photos: [
        {
          url: "https://images.unsplash.com/photo-1555244162-803834f70033?q=80&w=600",
          caption: "Sajian Prasmanan Komplit & Bersih",
        },
        {
          url: "https://images.unsplash.com/photo-1492684223066-81342ee5ff30?q=80&w=600",
          caption: "Box Sample Test Food untuk Keluarga",
        },
        {
          url: "https://images.unsplash.com/photo-1509927083803-4bd519298ac4?q=80&w=600",
          caption: "Pramusaji Sigap Melayani Tamu Undangan",
        },
      ],
    },
    {
      id: "cake",
      title: "Wedding Cake & Dessert",
      vendor: "L'Aura Patisserie & Cakes",
      district: "Kebumen Kota",
      price: "Rp 1.600.000",
      desc: "Kue pengantin 2 tingkat senada dekorasi + dessert table (pudding, macarons, cupcakes).",
      icon: Cake,
      badge: "Taster Box",
      phase: "main_event",
      highlights: [
        "Kue pengantin 2 tingkat berhias butter cream halus & bunga",
        "Dessert table mini: pudding cup, macarons, cupcakes",
        "Gratis Cake Taster Box 3 rasa sebelum konfirmasi rasa kue",
        "Termasuk standing cake kristal & pisau hias potong kue",
      ],
      photos: [
        {
          url: "https://images.unsplash.com/photo-1535141192574-5d4897c13136?q=80&w=600",
          caption: "Kue Pengantin Bertingkat Estetik",
        },
        {
          url: "https://images.unsplash.com/photo-1509927083803-4bd519298ac4?q=80&w=600",
          caption: "Meja Dessert Corner Manis",
        },
        {
          url: "https://images.unsplash.com/photo-1519741497674-611481863552?q=80&w=600",
          caption: "Taster Box Pilihan Rasa Sponge Cake",
        },
      ],
    },
    {
      id: "souvenir",
      title: "Souvenir Anyaman Pandan",
      vendor: "Kriya Anyam Gombong",
      district: "Gombong",
      price: "Rp 15.000 / Pcs",
      desc: "Pouch ramah lingkungan kombinasi anyaman pandan Kebumen & linen inisial nama.",
      icon: Gift,
      badge: "Khas Gombong",
      phase: "details",
      highlights: [
        "Anyaman serat pandan alami pengrajin lokal Gombong",
        "Kombinasi linen lembut dengan cetak inisial nama pengantin",
        "Kemas ramah lingkungan dengan tali rami & kartu terima kasih",
        "Minimal pesanan fleksibel untuk acara intimate (mulai 50 pcs)",
      ],
      photos: [
        {
          url: "https://images.unsplash.com/photo-1544816155-12df9643f363?q=80&w=600",
          caption: "Pouch Anyaman Pandan Khas Gombong",
        },
        {
          url: "https://images.unsplash.com/photo-1518895949257-7621c3c786d7?q=80&w=600",
          caption: "Kemas Tali Rami Alami & Hangtag",
        },
        {
          url: "https://images.unsplash.com/photo-1519225421980-715cb0215aed?q=80&w=600",
          caption: "Inisial Custom Pasangan Pengantin",
        },
      ],
    },
    {
      id: "undangan",
      title: "Undangan Digital & Wax Seal",
      vendor: "HariKita Digital & Print",
      district: "Kebumen Kota",
      price: "Rp 1.250.000",
      desc: "Website undangan (65+ varian tema, musik, RSVP) + 100 pcs cetak hardcover segel lilin 3D.",
      icon: Mail,
      badge: "65+ Tema",
      phase: "details",
      highlights: [
        "Website undangan interaktif (65+ tema & 8 arketipe)",
        "Musik latar otomatis, formulir RSVP & amplop QRIS",
        "100 pcs undangan fisik cetak hardcover bahan tebal",
        "Stempel segel lilin 3D (wax seal) berinisial pasangan",
      ],
      photos: [
        {
          url: "https://helloguest.id/wp-content/uploads/2025/01/Autumnelle.webp",
          caption: "Website Undangan Responsif HariKita",
        },
        {
          url: "https://images.unsplash.com/photo-1511285560929-80b456fea0bc?q=80&w=600",
          caption: "Undangan Cetak Hardcover Wax Seal 3D",
        },
        {
          url: "https://images.unsplash.com/photo-1509927083803-4bd519298ac4?q=80&w=600",
          caption: "Amplop Cetak Bersegel Lilin Emas",
        },
      ],
    },
    {
      id: "denah",
      title: "Cute Illustrated Map",
      vendor: "Denah Kita Kartun Estetik",
      district: "Kebumen Kota",
      price: "Rp 250.000",
      desc: "Ilustrasi peta kartun rute gedung resepsi Kebumen terintegrasi barcode navigasi Google Maps.",
      icon: Map,
      badge: "Scan QR",
      phase: "details",
      highlights: [
        "Gambar denah kartun lucu dengan landmark khas Kebumen",
        "Integrasi barcode QR Code menuju Google Maps & Waze",
        "Format gambar high-res siap kirim via WhatsApp & cetak",
        "Revisi posisi jalan & gedung hingga akurat",
      ],
      photos: [
        {
          url: "https://images.unsplash.com/photo-1526778548025-fa2f459cd5c1?q=80&w=600",
          caption: "Ilustrasi Peta Kartun Gedung Acara",
        },
        {
          url: "https://images.unsplash.com/photo-1564507592333-c60657eea523?q=80&w=600",
          caption: "Barcode QR Code Navigasi Akurat",
        },
        {
          url: "https://images.unsplash.com/photo-1519741497674-611481863552?q=80&w=600",
          caption: "Layout Denah Siap Bagikan",
        },
      ],
    },
  ];

  // Archetype Data for Digital Invitation Showcase
  const ARCHETYPES = {
    motion: {
      name: "Autumnelle & Seraphicus Lux",
      archetypeLabel: "Animated Motion & Modern",
      image: "https://helloguest.id/wp-content/uploads/2025/01/Autumnelle.webp",
      desc: "Desain tema musim gugur dan gaya minimalis editorial yang anggun untuk calon pengantin di Kebumen.",
      demoUrl: "/undangan/demo?theme=autumnelle&to=Bapak+Joko&sesi=s1",
      features: [
        "Animasi Daun Gugur Lembut",
        "Tipografi Editorial Cormorant",
        "Musik Latar Otomatis",
      ],
    },
    adat: {
      name: "Keraton Sogan & Wayang Kamajaya",
      archetypeLabel: "Traditional Cultural Adat",
      image: "https://images.unsplash.com/photo-1583939003579-730e3918a45a?q=80&w=800",
      desc: "Harmoni ornamen batik sogan Jawa dan figur wayang Kamajaya melambangkan keteguhan cinta dan restu leluhur.",
      demoUrl: "/undangan",
      features: [
        "Aksen Batik Prada Emas",
        "Gending Karawitan Tradisional",
        "Kutipan Doa Serat Adat",
      ],
    },
    botanical: {
      name: "Pastel Meadow & Romantic Floral",
      archetypeLabel: "Romantic Botanical",
      image: "https://images.unsplash.com/photo-1519741497674-611481863552?q=80&w=800",
      desc: "Sentuhan dedaunan sage green, eukaliptus, dan kelopak mawar blush menghadirkan atmosfer resepsi taman yang hangat.",
      demoUrl: "/undangan",
      features: [
        "Ilustrasi Bunga Cat Air Asli",
        "Palet Warna Sage & Blush",
        "Countdown Acara Estetik",
      ],
    },
    syari: {
      name: "Mihrab Ar-Raudhah & Zafaran Gold",
      archetypeLabel: "Syar'i & Islamic Heritage",
      image: "https://images.unsplash.com/photo-1542838132-92c53300491e?q=80&w=800",
      desc: "Kemegahan lengkung kubah mihrab kaligrafi doa walimatul 'urs bernuansa emas tembaga dan hijau zamrud.",
      demoUrl: "/undangan",
      features: [
        "Kaligrafi Doa Walimah Berkah",
        "Multi-Sesi Ikhwan & Akhwat",
        "Lantunan Nasyid Halal",
      ],
    },
  };

  // Escrow Timeline Steps
  const ESCROW_STEPS = [
    {
      step: 1,
      title: "Invoice DP 30% Mengunci Tanggal",
      timing: "Saat Booking Awal",
      badgeColor: "bg-emerald-100 text-emerald-800 border-emerald-300",
      desc: "Pembayaran uang muka langsung mengunci ketersediaan seluruh vendor di tanggal acara Kebumen. Dana disimpan aman di rekening bersama dan baru dicairkan 30% ke vendor pada H-3 acara.",
      details: [
        "Kunci tanggal serentak di kalender seluruh vendor Kebumen terpilih",
        "Penerbitan kontrak digital mengikat hak & kewajiban kerja",
        "Dana DP aman tertampung di rekening escrow resmi",
      ],
    },
    {
      step: 2,
      title: "Pelacak 2x Fitting & Test Food",
      timing: "H-30 s/d H-3 Acara",
      badgeColor: "bg-hk-soft-beige text-hk-taupe border-hk-champagne",
      desc: "Jadwal sesi fisik (fitting busana pertama, final fitting busana orang tua, serta pengiriman sample test food katering) tercatat rapi di portal klien dan otomatis terkirim via notifikasi WhatsApp.",
      details: [
        "Pengingat otomatis jadwal fitting di Griya Busana Rarasati",
        "Pencicipan sample box test food katering di rumah keluarga",
        "Pencairan operasional 30% cair ke vendor pada H-3 setelah jadwal siap",
      ],
    },
    {
      step: 3,
      title: "Pelunasan 70% Dicairkan Pasca-Acara",
      timing: "H+2 Pasca-Acara",
      badgeColor: "bg-amber-100 text-amber-800 border-amber-300",
      desc: "Pelunasan dibayarkan pada H-7 dan DITAHAN di rekening bersama. Dana pelunasan baru ditransfer ke rekening vendor pada H+2 setelah klien mengonfirmasi acara telah berjalan sukses dan memuaskan.",
      details: [
        "Dana pelunasan 70% tidak bisa diambil vendor sebelum acara tuntas",
        "Konfirmasi kepuasan satu klik dari handphone klien",
        "Mediasi netral tim HariKita jika terjadi kendala operasional",
      ],
    },
  ];

export default function HomePage() {
  const [activePhase, setActivePhase] = useState<EventPhase>("all");
  const [activeArchetype, setActiveArchetype] = useState<"motion" | "adat" | "botanical" | "syari">("motion");
  const [activeEscrowStep, setActiveEscrowStep] = useState<number>(1);

  // Memoized filter categories based on active phase
  const filteredCategories = React.useMemo(() => {
    if (activePhase === "all") return CATEGORIES;
    return CATEGORIES.filter((cat) => cat.phase === activePhase);
  }, [activePhase]);

  const currentArchetype = ARCHETYPES[activeArchetype];
  const escrowSteps = ESCROW_STEPS;

  return (
    <div className="space-y-16 pb-20 overflow-x-hidden">
      {/* ================= 1. HERO SECTION ================= */}
      <section className="relative pt-12 pb-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto overflow-hidden">
        {/* Glow ambient background circles */}
        <div className="absolute -top-16 left-1/2 -translate-x-1/2 w-[600px] h-[350px] bg-gradient-to-b from-hk-champagne/20 via-hk-taupe/5 to-transparent rounded-full blur-3xl -z-10 pointer-events-none" />

        <div className="text-center space-y-6 max-w-4xl mx-auto">
          {/* Cameo Emblem Tag */}
          <div className="inline-flex items-center gap-2.5 px-4 py-1.5 rounded-full bg-white/90 border border-hk-champagne/60 shadow-2xs backdrop-blur-sm">
            <div className="relative w-5 h-5 rounded-full overflow-hidden border border-hk-taupe">
              <Image src="/logo_cameo.png" alt="Emblem" fill className="object-cover" priority />
            </div>
            <span className="font-manrope text-xs font-bold uppercase tracking-widest text-hk-charcoal">
              Platform Hyperlocal Kabupaten Kebumen
            </span>
          </div>

          {/* Main Headline with Editorial Serif */}
          <h1 className="font-editorial text-4xl sm:text-6xl lg:text-7xl text-hk-charcoal font-normal tracking-tight leading-[1.12]">
            Rangkai Hari Bahagiamu, <br />
            <span className="italic text-hk-taupe">Menyelaraskan Restu &amp; Impian.</span>
          </h1>

          <p className="font-manrope text-base sm:text-lg text-hk-charcoal/75 max-w-2xl mx-auto leading-relaxed">
            Kurasi 11 kategori vendor terbaik di Kebumen untuk acara Pre-wedding, Lamaran, dan Pernikahan Intim. Rancang paket secara bebas dengan jaminan perlindungan Rekening Bersama (Escrow).
          </p>

          {/* CTAs */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-2">
            <Link
              href="/builder"
              className="flex items-center gap-2 rounded-full bg-hk-taupe px-8 py-3.5 text-sm font-manrope font-bold text-white shadow-md hover:bg-hk-charcoal transition-all hover:scale-[1.02] active:scale-95"
            >
              <Sparkles className="w-4 h-4" />
              <span>Mulai Racik Paket Acara</span>
              <ArrowRight className="w-4 h-4" />
            </Link>

            <Link
              href="/undangan"
              className="flex items-center gap-2 rounded-full border border-hk-champagne/60 bg-white/80 px-7 py-3.5 text-sm font-manrope font-semibold text-hk-charcoal hover:border-hk-taupe hover:bg-hk-ivory transition-all shadow-2xs"
            >
              <Mail className="w-4 h-4 text-hk-taupe" />
              <span>Lihat 65+ Tema Undangan</span>
            </Link>
          </div>

          {/* Trust Highlights */}
          <div className="pt-8 grid grid-cols-2 sm:grid-cols-4 gap-3.5 max-w-3xl mx-auto">
            {[
              { title: "100% Vendor Lokal", desc: "Terkurasi di Kebumen" },
              { title: "2x Sesi Fitting", desc: "Jadwal fitting busana fisik" },
              { title: "Sample Test Food", desc: "Cicipi rasa menu katering" },
              { title: "Rekening Bersama", desc: "DP 30% / Pelunasan 70%" },
            ].map((stat, i) => (
              <div
                key={i}
                className="p-4 rounded-2xl bg-white/85 border border-hk-champagne/50 shadow-2xs text-center transition-all hover:border-hk-taupe hover:shadow-xs"
              >
                <span className="font-editorial text-base font-bold text-hk-charcoal block">
                  {stat.title}
                </span>
                <span className="font-manrope text-xs text-hk-charcoal/65 mt-0.5 block">
                  {stat.desc}
                </span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Decorative Divider: Diamond */}
      <div className="max-w-4xl mx-auto px-4" aria-hidden="true">
        <DecorativeDivider variant="diamond" color="champagne" />
      </div>

      {/* ================= 2. 11 LAYANAN TERPADU KEBUMEN DENGAN FILTER TABS ================= */}
      <section id="layanan" className="scroll-mt-24 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8 contain-content-auto">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-hk-champagne/40 pb-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 text-xs font-manrope font-bold text-hk-taupe uppercase tracking-widest">
              <Compass className="w-4 h-4" />
              <span>Modular Marketplace Kebumen</span>
            </div>
            <h2 className="font-editorial text-3xl sm:text-4xl text-hk-charcoal font-normal">
              11 Kategori Layanan Terpadu di Kebumen
            </h2>
            <p className="font-manrope text-sm text-hk-charcoal/70 max-w-xl leading-relaxed">
              Pilih satu per satu layanan sesuai konsep dan anggaran impian keluarga Anda. Seluruh vendor siap berkolaborasi sinkron di hari H.
            </p>
          </div>

          <Link
            href="/builder"
            className="flex items-center gap-1.5 rounded-full bg-hk-taupe px-5 py-2 text-xs font-manrope font-bold text-white shadow-xs hover:bg-hk-charcoal transition-all self-start md:self-auto shrink-0"
          >
            <span>Buka Simulator Racik</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {/* Event Phase Filter Tabs */}
        <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
          {[
            { id: "all", label: "Semua Layanan", count: 11, icon: Layers },
            { id: "prewed_attire", label: "Pra-Acara & Busana", count: 3, icon: Scissors },
            { id: "main_event", label: "Hari H & Katering", count: 4, icon: Utensils },
            { id: "details", label: "Detail & Suvenir", count: 4, icon: Gift },
          ].map((tab) => {
            const TabIcon = tab.icon;
            const isActive = activePhase === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActivePhase(tab.id as EventPhase)}
                className={`flex items-center gap-2 px-4 py-2 rounded-full text-xs font-manrope font-semibold transition-all whitespace-nowrap shadow-2xs ${
                  isActive
                    ? "bg-hk-charcoal text-white shadow-xs"
                    : "bg-white text-hk-charcoal/80 border border-hk-champagne/60 hover:bg-hk-ivory hover:text-hk-charcoal"
                }`}
              >
                <TabIcon className={`w-3.5 h-3.5 ${isActive ? "text-hk-champagne" : "text-hk-taupe"}`} />
                <span>{tab.label}</span>
                <span
                  className={`px-1.5 py-0.2 rounded-full text-[10px] font-bold ${
                    isActive ? "bg-white/20 text-white" : "bg-hk-soft-beige/80 text-hk-taupe"
                  }`}
                >
                  {tab.count}
                </span>
              </button>
            );
          })}
        </div>

        {/* Categories Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredCategories.map((item) => {
            const Icon = item.icon;
            return (
              <div
                key={item.id}
                className="group relative p-6 rounded-3xl bg-white border border-hk-champagne/50 shadow-xs hover:border-hk-taupe hover:shadow-lg hover:-translate-y-1 transition-all flex flex-col justify-between"
              >
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="w-11 h-11 rounded-2xl bg-hk-ivory border border-hk-champagne/60 flex items-center justify-center text-hk-taupe group-hover:scale-105 transition-transform shadow-2xs">
                      <Icon className="w-5 h-5 text-hk-taupe" />
                    </div>
                    <div className="flex items-center gap-1.5">
                      <span className="px-2.5 py-0.5 rounded-full text-[10px] font-manrope font-bold uppercase tracking-wider bg-hk-ivory text-hk-charcoal/70 border border-hk-champagne/40">
                        {item.district}
                      </span>
                      <span className="px-2.5 py-0.5 rounded-full text-[10px] font-manrope font-bold uppercase tracking-wider bg-hk-soft-beige/70 text-hk-taupe border border-hk-champagne/40">
                        {item.badge}
                      </span>
                    </div>
                  </div>

                  <div className="space-y-1">
                    <h3 className="font-editorial text-2xl font-bold text-hk-charcoal group-hover:text-hk-taupe transition-colors">
                      {item.title}
                    </h3>
                    <p className="text-xs font-manrope font-semibold text-hk-taupe flex items-center gap-1">
                      <MapPin className="w-3.5 h-3.5 shrink-0" />
                      <span>{item.vendor}</span>
                    </p>
                  </div>

                  <p className="font-manrope text-xs text-hk-charcoal/70 leading-relaxed line-clamp-3">
                    {item.desc}
                  </p>
                </div>

                <div className="pt-5 mt-4 border-t border-hk-champagne/40 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div>
                    <span className="text-[10px] font-manrope text-hk-charcoal/60 block">Mulai dari:</span>
                    <span className="font-mono text-sm font-bold text-hk-charcoal">{item.price}</span>
                  </div>

                  <div className="flex items-center gap-2">
                    <Link
                      href={`/vendor/kategori/${item.id}`}
                      className="rounded-full border border-hk-champagne/60 bg-hk-taupe text-white px-3.5 py-1.5 text-xs font-manrope font-semibold hover:bg-hk-charcoal transition-all shadow-2xs inline-flex items-center gap-1"
                    >
                      <span>Lihat Layanan</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </Link>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* Decorative Divider: Botanical */}
      <div className="max-w-4xl mx-auto px-4" aria-hidden="true">
        <DecorativeDivider variant="botanical" color="champagne" />
      </div>

      {/* ================= 3. SHOWCASE UNDANGAN DIGITAL DENGAN 4-ARCHETYPE SWITCHER ================= */}
      <section className="bg-hk-ivory/60 py-20 px-4 sm:px-6 lg:px-8 border-y border-hk-champagne/40">
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          <div className="lg:col-span-6 space-y-6">
            <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-hk-soft-beige/80 text-hk-charcoal text-xs font-manrope font-bold uppercase tracking-widest border border-hk-champagne/50">
              <Mail className="w-3.5 h-3.5 text-hk-taupe" />
              <span>Adaptasi 65+ Desain Undangan Digital</span>
            </div>

            <h2 className="font-editorial text-3xl sm:text-5xl text-hk-charcoal font-normal leading-tight">
              Undangan Digital Interaktif &amp; Amplop Segel Lilin 3D
            </h2>

            <p className="font-manrope text-sm text-hk-charcoal/75 leading-relaxed">
              Koleksi terlengkap yang mencakup 8 arketipe estetika: kartun animasi estetik, minimalis editorial chic, foto fullscreen prewed, kaligrafi syar&apos;i walimatul &apos;urs, hingga keraton Jawa wayang kulit.
            </p>

            {/* Archetype Quick Switcher Tabs */}
            <div className="p-1.5 rounded-2xl bg-white/90 border border-hk-champagne/60 shadow-2xs space-y-2">
              <span className="text-[10px] font-manrope font-bold uppercase tracking-wider text-hk-charcoal/60 px-2 block">
                Coba Pilih Tema Estetika:
              </span>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5">
                {[
                  { id: "motion", label: "Animated Motion" },
                  { id: "adat", label: "Jawa Klasik Adat" },
                  { id: "botanical", label: "Romantic Floral" },
                  { id: "syari", label: "Syar'i Heritage" },
                ].map((t) => (
                  <button
                    key={t.id}
                    onClick={() => setActiveArchetype(t.id as any)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-manrope font-bold transition-all text-center ${
                      activeArchetype === t.id
                        ? "bg-hk-taupe text-white shadow-xs"
                        : "bg-hk-ivory/50 text-hk-charcoal/80 hover:bg-hk-soft-beige/60"
                    }`}
                  >
                    {t.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Interactive Features Checklist */}
            <div className="grid grid-cols-2 gap-3 text-xs font-manrope text-hk-charcoal/85 font-medium">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-700 shrink-0" />
                <span>Buka Segel Lilin 3D (Wax Seal)</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-700 shrink-0" />
                <span>Musik Otomatis Latar Belakang</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-700 shrink-0" />
                <span>Pembagian Sesi Tamu (Akad &amp; Resepsi)</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-700 shrink-0" />
                <span>RSVP &amp; Buku Tamu Real-Time</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-700 shrink-0" />
                <span>Amplop Digital &amp; Salin Rekening</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-700 shrink-0" />
                <span>QR Check-in Meja Resepsionis</span>
              </div>
            </div>

            <div className="pt-2 flex flex-wrap items-center gap-3">
              <Link
                href="/undangan"
                className="rounded-full bg-hk-taupe px-6 py-2.5 text-xs font-manrope font-bold text-white shadow-xs hover:bg-hk-charcoal transition-all"
              >
                Buka Katalog 65+ Desain
              </Link>
              <Link
                href={currentArchetype.demoUrl}
                target="_blank"
                className="rounded-full border border-hk-champagne/60 bg-white px-6 py-2.5 text-xs font-manrope font-semibold text-hk-charcoal hover:bg-hk-ivory transition-all shadow-2xs"
              >
                Uji Coba Live Preview
              </Link>
            </div>
          </div>

          {/* Interactive Card Preview */}
          <div className="lg:col-span-6 relative">
            <div className="relative mx-auto w-full max-w-md h-[470px] rounded-3xl overflow-hidden shadow-2xl border-4 border-white transition-all duration-300">
              <Image
                src={currentArchetype.image}
                alt={currentArchetype.name}
                fill
                className="object-cover transition-opacity duration-300"
                sizes="(max-width: 768px) 100vw, 448px"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/25 to-transparent flex flex-col justify-end p-6 text-white space-y-2.5">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-manrope uppercase font-bold tracking-widest bg-hk-taupe px-3 py-1 rounded-full text-white shadow-2xs">
                    Arketipe: {currentArchetype.archetypeLabel}
                  </span>
                  <span className="text-[11px] font-manrope text-white/80">
                    65+ Varian
                  </span>
                </div>
                <h3 className="font-editorial text-2xl sm:text-3xl font-bold">
                  {currentArchetype.name}
                </h3>
                <p className="font-manrope text-xs text-white/85 leading-relaxed">
                  {currentArchetype.desc}
                </p>

                {/* Micro tags */}
                <div className="flex flex-wrap gap-1.5 pt-1">
                  {currentArchetype.features.map((f, i) => (
                    <span
                      key={i}
                      className="px-2 py-0.5 rounded-full text-[10px] bg-white/20 text-white backdrop-blur-xs font-manrope"
                    >
                      ✓ {f}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Decorative Divider: Loop */}
      <div className="max-w-4xl mx-auto px-4" aria-hidden="true">
        <DecorativeDivider variant="loop" color="champagne" />
      </div>

      {/* ================= 4. REKENING BERSAMA INTERACTIVE TIMELINE STEPPER ================= */}
      <section id="rekber" className="scroll-mt-24 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10 contain-content-auto">
        <div className="text-center space-y-3 max-w-2xl mx-auto">
          <div className="inline-flex items-center gap-2 text-xs font-manrope font-bold text-emerald-800 uppercase tracking-widest bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200">
            <ShieldCheck className="w-4 h-4 text-emerald-700" />
            <span>Ketenangan Hati Seluruh Keluarga</span>
          </div>
          <h2 className="font-editorial text-3xl sm:text-4xl text-hk-charcoal font-normal">
            Sistem Escrow &amp; Jadwal Sesi Fisik Terpadu
          </h2>
          <p className="font-manrope text-sm text-hk-charcoal/70 leading-relaxed">
            Menghilangkan keraguan orang tua dengan transparansi rincian harga, kontrak kerja digital berkekuatan hukum, dan rekening penampungan aman.
          </p>
        </div>

        {/* Interactive Step Navigator Bar */}
        <div className="max-w-3xl mx-auto">
          <div className="relative flex items-center justify-between">
            {/* Background Line */}
            <div className="absolute left-8 right-8 top-1/2 -translate-y-1/2 h-1 bg-hk-champagne/40 -z-0" />
            {/* Active Progress Fill */}
            <div
              className="absolute left-8 top-1/2 -translate-y-1/2 h-1 bg-hk-taupe transition-all duration-500 -z-0"
              style={{
                width:
                  activeEscrowStep === 1
                    ? "0%"
                    : activeEscrowStep === 2
                    ? "50%"
                    : "calc(100% - 64px)",
              }}
            />

            {[1, 2, 3].map((step) => {
              const isPassed = step <= activeEscrowStep;
              const isCurrent = step === activeEscrowStep;
              return (
                <button
                  key={step}
                  onClick={() => setActiveEscrowStep(step)}
                  className={`relative z-10 flex flex-col items-center gap-1.5 group cursor-pointer focus:outline-none`}
                >
                  <div
                    className={`w-12 h-12 rounded-full flex items-center justify-center font-editorial text-xl font-bold transition-all shadow-md ${
                      isCurrent
                        ? "bg-hk-taupe text-white ring-4 ring-hk-taupe/30 border-2 border-hk-taupe scale-110"
                        : isPassed
                        ? "bg-hk-charcoal text-white ring-2 ring-hk-champagne/30"
                        : "bg-white text-hk-charcoal border-2 border-hk-champagne/60 group-hover:border-hk-taupe"
                    }`}
                  >
                    {isPassed && !isCurrent ? <Check className="w-5 h-5 text-hk-champagne" /> : step}
                  </div>
                  <span
                    className={`text-[11px] font-manrope font-bold hidden sm:block ${
                      isCurrent ? "text-hk-taupe font-extrabold" : "text-hk-charcoal/60"
                    }`}
                  >
                    Langkah {step}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* 3 Step Details Cards (highlighting the active step) */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {escrowSteps.map((s) => {
            const isSelected = activeEscrowStep === s.step;
            return (
              <div
                key={s.step}
                onClick={() => setActiveEscrowStep(s.step)}
                className={`p-7 rounded-3xl bg-white cursor-pointer transition-all flex flex-col justify-between ${
                  isSelected
                    ? "border-2 border-hk-taupe shadow-xl ring-4 ring-hk-taupe/20 -translate-y-1"
                    : "border border-hk-champagne/50 shadow-xs hover:border-hk-taupe/60 hover:shadow-md"
                }`}
              >
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div
                      className={`w-11 h-11 rounded-2xl flex items-center justify-center font-editorial text-xl font-bold shadow-2xs transition-all ${
                        isSelected
                          ? "bg-hk-taupe text-white border-2 border-hk-taupe ring-2 ring-hk-taupe/30"
                          : "bg-hk-ivory text-hk-taupe border border-hk-champagne/60"
                      }`}
                    >
                      {s.step}
                    </div>
                    <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-manrope font-bold uppercase tracking-wider border transition-all ${
                      isSelected
                        ? "bg-hk-taupe/10 text-hk-taupe border-hk-taupe/40 font-extrabold"
                        : "bg-hk-ivory text-hk-charcoal/70 border-hk-champagne/50"
                    }`}>
                      {s.timing}
                    </span>
                  </div>

                  <div className="space-y-1">
                    <h3 className="font-editorial text-2xl font-bold text-hk-charcoal">
                      {s.title}
                    </h3>
                  </div>

                  <p className="font-manrope text-xs text-hk-charcoal/75 leading-relaxed">
                    {s.desc}
                  </p>

                  <div className="space-y-2 pt-2 border-t border-hk-champagne/30">
                    {s.details.map((detail, idx) => (
                      <div key={idx} className="flex items-start gap-1.5 text-[11px] font-manrope text-hk-charcoal/80">
                        <CheckCircle2 className="w-3.5 h-3.5 text-hk-taupe shrink-0 mt-0.5" />
                        <span>{detail}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="pt-4 mt-4 border-t border-hk-champagne/20 flex items-center justify-between text-[11px] font-manrope font-bold text-hk-taupe">
                  <span>{isSelected ? "Sedang Ditinjau" : "Klik untuk Detail"}</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </div>
              </div>
            );
          })}
        </div>

        {/* Legal & Educational Safety Notice */}
        <div className="p-4 rounded-2xl bg-hk-soft-beige/30 border border-hk-champagne/50 max-w-3xl mx-auto flex items-center gap-3 text-xs font-manrope text-hk-charcoal/75">
          <ShieldCheck className="w-5 h-5 text-emerald-700 shrink-0" />
          <p>
            <span className="font-bold text-hk-charcoal">Garansi Netralitas HariKita Kebumen:</span>{" "}
            Dana DP &amp; Pelunasan tidak dikuasai sepihak oleh vendor. Pembayaran diproses melalui Virtual Account resmi penampungan independen demi melindungi hak konsumen dan mitra vendor lokal.
          </p>
        </div>
      </section>

      {/* ================= 5. CALL TO ACTION BANNER ================= */}
      <section className="max-w-5xl mx-auto px-4 sm:px-6 pt-4">
        <div className="relative overflow-hidden p-10 sm:p-14 rounded-3xl bg-gradient-to-r from-hk-charcoal via-[#3A2228] to-hk-charcoal text-white text-center space-y-6 shadow-2xl border border-hk-champagne/40">
          
          {/* Subtle Corner Flourishes from Core Assets */}
          <div className="pointer-events-none absolute top-3 left-3 h-12 w-12 text-hk-champagne/20" aria-hidden="true">
            <img src="/assets/harikita/corners/corner-01.svg" alt="" className="h-full w-full object-contain" />
          </div>
          <div className="pointer-events-none absolute top-3 right-3 h-12 w-12 rotate-90 text-hk-champagne/20" aria-hidden="true">
            <img src="/assets/harikita/corners/corner-01.svg" alt="" className="h-full w-full object-contain" />
          </div>
          <div className="pointer-events-none absolute bottom-3 right-3 h-12 w-12 rotate-180 text-hk-champagne/20" aria-hidden="true">
            <img src="/assets/harikita/corners/corner-01.svg" alt="" className="h-full w-full object-contain" />
          </div>
          <div className="pointer-events-none absolute bottom-3 left-3 h-12 w-12 -rotate-90 text-hk-champagne/20" aria-hidden="true">
            <img src="/assets/harikita/corners/corner-01.svg" alt="" className="h-full w-full object-contain" />
          </div>

          <div className="w-12 h-12 mx-auto rounded-full bg-white/10 flex items-center justify-center text-hk-champagne border border-hk-champagne/30 shadow-inner">
            <Sparkles className="w-6 h-6" />
          </div>

          <h2 className="font-editorial text-3xl sm:text-5xl font-normal text-white tracking-tight">
            Siap Merangkai Hari Bahagiamu di Kebumen?
          </h2>

          <p className="font-manrope text-sm sm:text-base text-white/80 max-w-xl mx-auto leading-relaxed">
            Mulai simulator racik paket tanpa perlu registrasi rumit. Lihat simulasi harga seketika dan konsultasikan dengan wedding concierge lokal kami.
          </p>

          <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-4 relative z-10">
            <Link
              href="/builder"
              className="rounded-full bg-hk-taupe px-8 py-3.5 text-sm font-manrope font-bold text-white shadow-md hover:bg-white hover:text-hk-charcoal transition-all hover:scale-[1.02] active:scale-95"
            >
              Mulai Racik Paket Hari Ini
            </Link>
            <a
              href="https://wa.me/6281234567890?text=Halo%20HariKita%20Kebumen%2C%20saya%20ingin%20tanya%20rekomendasi%20paket%20pernikahan"
              target="_blank"
              rel="noopener noreferrer"
              className="rounded-full border border-hk-champagne/60 bg-white/10 px-7 py-3.5 text-sm font-manrope font-semibold text-hk-champagne hover:bg-white/20 transition-all shadow-2xs flex items-center gap-1.5"
            >
              <Phone className="w-4 h-4" />
              <span>Chat WhatsApp Concierge</span>
            </a>
          </div>
        </div>
      </section>

      {/* Floating WhatsApp Concierge Pill */}
      <FloatingConcierge phoneNumber="6281234567890" />
    </div>
  );
}
