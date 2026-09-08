import React from "react";
import Link from "next/link";
import Image from "next/image";
import {
  Sparkles,
  ShieldCheck,
  Calendar,
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
  BadgePercent,
  Phone,
} from "lucide-react";

export default function HomePage() {
  const categories = [
    {
      id: "prewed",
      title: "Pre-wedding Alam & Studio",
      vendor: "Menganti Cinematic & Studio",
      price: "Rp 3.500.000",
      desc: "Spot Pantai Menganti & bukit eksotis, 2 busana, drone aerial, 25 edited photo, teaser 60s.",
      icon: Camera,
      badge: "Favorit Kebumen",
    },
    {
      id: "busana",
      title: "Busana Pengantin & Fitting",
      vendor: "Griya Busana Rarasati",
      price: "Rp 2.800.000",
      desc: "Sewa perdana kebaya modern / beskap adat Jawa, aksesori lengkap, dan 2x sesi fitting gratis.",
      icon: Scissors,
      badge: "Fitting 2x",
    },
    {
      id: "mua",
      title: "Makeup Artist (MUA)",
      vendor: "Alula MUA & Hijab Styling",
      price: "Rp 2.200.000",
      desc: "Rias pengantin soft glam / adat, melati segar keraton, hijab styling syar'i, touch-up standby.",
      icon: Palette,
      badge: "Tahan 12 Jam",
    },
    {
      id: "seserahan",
      title: "Seserahan Akrilik & Mahar",
      vendor: "Hantaran Lestari Kebumen",
      price: "Rp 1.050.000 (7 Baki)",
      desc: "Baki akrilik kristal kombinasi kayu jati, bunga premium, kalkulator fleksibel per kotak.",
      icon: Gift,
      badge: "Kalkulator Baki",
    },
    {
      id: "foto",
      title: "Dokumentasi Foto & Video",
      vendor: "Pradana Cinema & Story",
      price: "Rp 4.200.000",
      desc: "Liputan hari H akad & resepsi, video cinematic 7 menit, teaser Reels, flashdisk kayu eksklusif.",
      icon: Camera,
      badge: "Drone Aerial",
    },
    {
      id: "dekor",
      title: "Dekorasi Pelaminan & Florist",
      vendor: "Asmara Flora & Pelaminan",
      price: "Rp 5.500.000",
      desc: "Pelaminan intimate 4-6 meter bunga segar, karpet jalan, photobooth lamaran estetik.",
      icon: Heart,
      badge: "Bunga Segar",
    },
    {
      id: "katering",
      title: "Katering Prasmanan & Stall",
      vendor: "Dapur Rasa Boga Kebumen",
      price: "Rp 45.000 / Pax",
      desc: "Menu komplit khas Kebumen, waiter standby, gratis Sample Test Food Box sebelum hari H.",
      icon: Utensils,
      badge: "Gratis Test Food",
    },
    {
      id: "cake",
      title: "Wedding Cake & Dessert",
      vendor: "L'Aura Patisserie & Cakes",
      price: "Rp 1.600.000",
      desc: "Kue pengantin 2 tingkat senada dekorasi + dessert table (pudding, macarons, cupcakes).",
      icon: Cake,
      badge: "Taster Box",
    },
    {
      id: "souvenir",
      title: "Souvenir Anyaman Pandan",
      vendor: "Kriya Anyam Gombong",
      price: "Rp 15.000 / Pcs",
      desc: "Pouch ramah lingkungan kombinasi anyaman pandan Kebumen & linen inisial nama.",
      icon: Gift,
      badge: "Khas Gombong",
    },
    {
      id: "undangan",
      title: "Undangan Digital & Wax Seal",
      vendor: "HariKita Digital & Print",
      price: "Rp 1.250.000",
      desc: "Website undangan (65+ varian tema, musik, RSVP) + 100 pcs cetak hardcover segel lilin 3D.",
      icon: Mail,
      badge: "65+ Tema",
    },
    {
      id: "denah",
      title: "Cute Illustrated Map",
      vendor: "Denah Kita Kartun Estetik",
      price: "Rp 250.000",
      desc: "Ilustrasi peta kartun rute gedung resepsi Kebumen terintegrasi barcode navigasi Google Maps.",
      icon: Map,
      badge: "Scan QR",
    },
  ];

  return (
    <div className="space-y-24 pb-20">
      {/* 1. HERO SECTION */}
      <section className="relative pt-12 pb-24 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto overflow-hidden">
        {/* Glow background circles */}
        <div className="absolute -top-16 left-1/2 -translate-x-1/2 w-[600px] h-[350px] bg-gradient-to-b from-gold/25 via-gold/5 to-transparent rounded-full blur-3xl -z-10" />

        <div className="text-center space-y-6 max-w-4xl mx-auto">
          {/* Cameo Emblem Tag */}
          <div className="inline-flex items-center gap-2.5 px-4 py-1.5 rounded-full bg-white/80 border border-gold/40 shadow-sm backdrop-blur-sm">
            <div className="relative w-5 h-5 rounded-full overflow-hidden border border-gold">
              <Image src="/logo_cameo.png" alt="Emblem" fill className="object-cover" />
            </div>
            <span className="text-xs font-bold uppercase tracking-widest text-plum-dark">
              Platform Hyperlocal Kabupaten Kebumen
            </span>
          </div>

          {/* Main Headline */}
          <h1 className="font-serif-luxury text-4xl sm:text-6xl text-plum font-bold tracking-tight leading-[1.15]">
            Rangkai Hari Bahagiamu, <br />
            <span className="gold-gradient-text">Menyelaraskan Restu & Impian.</span>
          </h1>

          <p className="text-base sm:text-lg text-plum-light max-w-2xl mx-auto leading-relaxed">
            Kurasi 11 kategori vendor terbaik di Kebumen untuk acara Pre-wedding, Lamaran, dan Pernikahan Intim. Rancang paket secara bebas dengan jaminan perlindungan Rekening Bersama (Escrow).
          </p>

          {/* CTAs */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
            <Link
              href="/builder"
              className="btn gold-gradient-bg text-plum-dark font-bold text-sm px-8 py-3.5 rounded-full shadow-lg hover:brightness-105 border-none flex items-center gap-2"
            >
              <Sparkles className="w-4 h-4" />
              <span>Mulai Racik Paket Acara</span>
              <ArrowRight className="w-4 h-4" />
            </Link>

            <Link
              href="/undangan"
              className="btn btn-outline border-gold/50 text-plum hover:bg-gold/15 font-bold text-sm px-7 py-3.5 rounded-full"
            >
              <Mail className="w-4 h-4 text-gold-dark" />
              <span>Lihat 65+ Tema Undangan</span>
            </Link>
          </div>

          {/* Trust Highlights */}
          <div className="pt-10 grid grid-cols-2 sm:grid-cols-4 gap-4 max-w-3xl mx-auto">
            {[
              { title: "100% Vendor Lokal", desc: "Terkurasi di Kebumen" },
              { title: "2x Sesi Fitting", desc: "Jadwal fitting busana fisik" },
              { title: "Sample Test Food", desc: "Cicipi rasa menu katering" },
              { title: "Rekening Bersama", desc: "DP 30% / Pelunasan 70%" },
            ].map((stat, i) => (
              <div key={i} className="p-3.5 rounded-2xl bg-white/70 border border-gold/25 shadow-xs text-center">
                <span className="font-serif-luxury text-sm font-bold text-plum block">{stat.title}</span>
                <span className="text-[11px] text-plum-light font-medium">{stat.desc}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 2. 11 LAYANAN TERPADU KEBUMEN */}
      <section id="layanan" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-gold/25 pb-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 text-xs font-bold text-gold-dark uppercase tracking-widest">
              <Compass className="w-4 h-4" />
              <span>Modular Marketplace</span>
            </div>
            <h2 className="font-serif-luxury text-3xl sm:text-4xl text-plum font-bold">
              11 Kategori Layanan Terpadu di Kebumen
            </h2>
            <p className="text-sm text-plum-light max-w-xl">
              Pilih satu per satu layanan sesuai konsep dan anggaran impian keluarga Anda. Seluruh vendor siap berkolaborasi sinkron di hari H.
            </p>
          </div>

          <Link
            href="/builder"
            className="btn btn-sm gold-gradient-bg text-plum-dark font-bold rounded-full border-none shadow-xs self-start md:self-auto"
          >
            Buka Simulator Racik
          </Link>
        </div>

        {/* Categories Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {categories.map((item) => {
            const Icon = item.icon;
            return (
              <div
                key={item.id}
                className="group p-6 rounded-3xl bg-white/80 border border-gold/25 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all flex flex-col justify-between"
              >
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="w-10 h-10 rounded-2xl bg-gold/15 border border-gold/30 flex items-center justify-center text-plum group-hover:scale-110 transition-transform">
                      <Icon className="w-5 h-5 text-gold-dark" />
                    </div>
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-plum-dark/10 text-plum">
                      {item.badge}
                    </span>
                  </div>

                  <div className="space-y-1">
                    <h3 className="font-serif-luxury text-xl font-bold text-plum group-hover:text-gold-dark transition-colors">
                      {item.title}
                    </h3>
                    <p className="text-xs font-semibold text-gold-dark flex items-center gap-1">
                      <MapPin className="w-3 h-3" />
                      <span>{item.vendor}</span>
                    </p>
                  </div>

                  <p className="text-xs text-plum-light leading-relaxed">
                    {item.desc}
                  </p>
                </div>

                <div className="pt-6 mt-4 border-t border-gold/20 flex items-center justify-between">
                  <div>
                    <span className="text-[10px] text-plum-light block">Mulai dari:</span>
                    <span className="font-mono text-sm font-bold text-plum">{item.price}</span>
                  </div>

                  <Link
                    href={`/builder?cat=${item.id}`}
                    className="btn btn-xs btn-outline border-gold/50 text-plum font-bold rounded-full hover:bg-gold/20"
                  >
                    Pilih Layanan
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* 3. SHOWCASE UNDANGAN DIGITAL (65+ PRESETS) */}
      <section className="bg-[#FAF4EE] py-20 px-4 sm:px-6 lg:px-8 border-y border-gold/30">
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          <div className="lg:col-span-6 space-y-6">
            <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-gold/20 text-plum text-xs font-bold uppercase tracking-widest">
              <Mail className="w-3.5 h-3.5 text-gold-dark" />
              <span>Adaptasi 65+ Desain Undangan Digital</span>
            </div>

            <h2 className="font-serif-luxury text-3xl sm:text-5xl text-plum font-bold leading-tight">
              Undangan Digital Interaktif & Amplop Segel Lilin 3D
            </h2>

            <p className="text-sm text-plum-light leading-relaxed">
              Koleksi terlengkap yang mencakup 8 arketipe estetika: kartun animasi estetik, minimalis editorial chic, foto fullscreen prewed, kaligrafi syar&apos;i walimatul &apos;urs, hingga keraton Jawa wayang kulit.
            </p>

            <div className="grid grid-cols-2 gap-3 text-xs text-plum font-medium">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <span>Buka Segel Lilin 3D (Wax Seal)</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <span>Musik Otomatis Latar Belakang</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <span>Multi-Sesi URL (?sesi=s1, s2)</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <span>RSVP & Buku Tamu Real-Time</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <span>Amplop Digital & Salin Rekening</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <span>QR Check-in Meja Resepsionis</span>
              </div>
            </div>

            <div className="pt-2 flex flex-wrap items-center gap-3">
              <Link
                href="/undangan"
                className="btn gold-gradient-bg text-plum-dark font-bold text-xs px-6 rounded-full border-none shadow-sm"
              >
                Buka Katalog 65+ Desain
              </Link>
              <Link
                href="/undangan/demo?theme=autumnelle-animasi&to=Bapak+Joko&sesi=s1"
                target="_blank"
                className="btn btn-outline border-gold/40 text-plum font-bold text-xs px-6 rounded-full hover:bg-gold/15"
              >
                Uji Coba Live Preview
              </Link>
            </div>
          </div>

          <div className="lg:col-span-6 relative">
            <div className="relative mx-auto w-full max-w-md h-[460px] rounded-3xl overflow-hidden shadow-2xl border-4 border-white">
              <Image
                src="https://helloguest.id/wp-content/uploads/2025/01/Autumnelle.webp"
                alt="Autumnelle Template"
                fill
                className="object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-transparent to-transparent flex flex-col justify-end p-6 text-white space-y-2">
                <span className="text-[10px] uppercase font-bold tracking-widest bg-gold px-2 py-0.5 rounded-full text-plum-dark w-fit">
                  Arketipe: Animated Motion
                </span>
                <h3 className="font-serif-luxury text-2xl font-bold">Autumnelle & Seraphicus Lux</h3>
                <p className="text-xs text-white/80">
                  Desain tema musim gugur dan gaya minimalis editorial yang anggun untuk calon pengantin di Kebumen.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 4. REKENING BERSAMA & PROTEKSI SESI FISIK */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        <div className="text-center space-y-3 max-w-2xl mx-auto">
          <div className="inline-flex items-center gap-2 text-xs font-bold text-emerald-700 uppercase tracking-widest">
            <ShieldCheck className="w-4 h-4" />
            <span>Ketenangan Hati Seluruh Keluarga</span>
          </div>
          <h2 className="font-serif-luxury text-3xl sm:text-4xl text-plum font-bold">
            Sistem Escrow & Jadwal Sesi Fisik Terpadu
          </h2>
          <p className="text-sm text-plum-light">
            Menghilangkan keraguan orang tua dengan transparansi rincian harga, kontrak kerja digital berkekuatan hukum, dan rekening penampungan aman.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="p-8 rounded-3xl bg-white/80 border border-gold/30 shadow-md space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-emerald-100 text-emerald-800 flex items-center justify-center font-serif-luxury text-xl font-bold">
              1
            </div>
            <h3 className="font-serif-luxury text-xl font-bold text-plum">
              Invoice DP 30% Mengunci Tanggal
            </h3>
            <p className="text-xs text-plum-light leading-relaxed">
              Pembayaran uang muka langsung mengunci ketersediaan seluruh vendor di tanggal acara Kebumen. Dana disimpan aman di rekening bersama dan baru dicairkan 30% ke vendor pada H-3 acara.
            </p>
          </div>

          <div className="p-8 rounded-3xl bg-white/80 border border-gold/30 shadow-md space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-gold/20 text-gold-dark flex items-center justify-center font-serif-luxury text-xl font-bold">
              2
            </div>
            <h3 className="font-serif-luxury text-xl font-bold text-plum">
              Pelacak 2x Fitting & Test Food
            </h3>
            <p className="text-xs text-plum-light leading-relaxed">
              Jadwal sesi fisik (fitting busana pertama, final fitting busana orang tua, serta pengiriman sample test food katering) tercatat rapi di portal klien dan otomatis terkirim via notifikasi WhatsApp.
            </p>
          </div>

          <div className="p-8 rounded-3xl bg-white/80 border border-gold/30 shadow-md space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-rose-100 text-rose-800 flex items-center justify-center font-serif-luxury text-xl font-bold">
              3
            </div>
            <h3 className="font-serif-luxury text-xl font-bold text-plum">
              Pelunasan 70% Dicairkan Pasca-Acara
            </h3>
            <p className="text-xs text-plum-light leading-relaxed">
              Pelunasan dibayarkan pada H-7 dan DITAHAN di rekening bersama. Dana pelunasan baru ditransfer ke rekening vendor pada H+2 setelah klien mengonfirmasi acara telah berjalan sukses dan memuaskan.
            </p>
          </div>
        </div>
      </section>

      {/* 5. CALL TO ACTION BANNER */}
      <section className="max-w-5xl mx-auto px-4 sm:px-6">
        <div className="p-10 sm:p-14 rounded-3xl bg-gradient-to-r from-plum-dark via-plum to-[#351A22] text-canvas-subtle text-center space-y-6 shadow-2xl border border-gold/40">
          <div className="w-12 h-12 mx-auto rounded-full bg-gold/20 flex items-center justify-center text-gold border border-gold/40">
            <Sparkles className="w-6 h-6" />
          </div>

          <h2 className="font-serif-luxury text-3xl sm:text-5xl font-bold text-white tracking-tight">
            Siap Merangkai Hari Bahagiamu di Kebumen?
          </h2>

          <p className="text-sm sm:text-base text-canvas/80 max-w-xl mx-auto leading-relaxed">
            Mulai simulator racik paket tanpa perlu registrasi rumit. Lihat simulasi harga seketika dan konsultasikan dengan wedding concierge lokal kami.
          </p>

          <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              href="/builder"
              className="btn gold-gradient-bg text-plum-dark font-bold text-sm px-8 py-3 rounded-full border-none shadow-md hover:brightness-105"
            >
              Mulai Racik Paket Hari Ini
            </Link>
            <a
              href="https://wa.me/6281234567890?text=Halo%20HariKita%20Kebumen%2C%20saya%20ingin%20tanya%20rekomendasi%20paket%20pernikahan"
              target="_blank"
              rel="noreferrer"
              className="btn btn-outline border-gold/50 text-gold-light hover:bg-gold/20 font-bold text-sm px-7 py-3 rounded-full"
            >
              <Phone className="w-4 h-4 mr-1" />
              Chat WhatsApp Concierge
            </a>
          </div>
        </div>
      </section>
    </div>
  );
}
