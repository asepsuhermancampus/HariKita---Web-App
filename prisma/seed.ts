import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

/** Koordinat demo per kecamatan Kebumen (untuk estimasi jarak vendor↔client). */
const VENDOR_COORDS: Array<[number, number]> = [
  [-7.6683, 109.6533], // Kebumen Kota
  [-7.6067, 109.5133], // Gombong
  [-7.6683, 109.7122], // Kutowinangun
  [-7.7222, 109.6333], // Karanganyar
  [-7.5833, 109.6167], // Alian
  [-7.7206, 109.5667], // Prembun
  [-7.7667, 109.4167], // Ayah
  [-7.65, 109.5833], // Pejagoan
  [-7.7, 109.6833], // Poncowarno
  [-7.6333, 109.5333], // Kuwarasan
  [-7.6167, 109.7], // Buluspesantren
];

/**
 * Dual-provider aware, mirroring `src/lib/prisma.ts`:
 *  - `file:`          → SQLite dev client (generated/sqlite-client)
 *  - `postgresql://`  → PostgreSQL client (@prisma/client)
 * Ini agar `npm run db:seed` dapat dijalankan ke dev.db SQLite lokal maupun
 * Neon/Postgres, sesuai DATABASE_URL aktif.
 */
function createSeedClient(): PrismaClient {
  const url = process.env.DATABASE_URL ?? "";
  if (url.startsWith("file:")) {
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const { PrismaClient: SqlitePrismaClient } = require("../generated/sqlite-client");
    return new SqlitePrismaClient() as unknown as PrismaClient;
  }
  return new PrismaClient();
}

const prisma = createSeedClient();

async function main() {
  console.log("Seeding HariKita Kebumen database...");
  const DEFAULT_PIN = await bcrypt.hash("123456", 10);

  // Clean old records
  await prisma.rsvpWish.deleteMany();
  await prisma.digitalInvitation.deleteMany();
  await prisma.eventRundown.deleteMany();
  await prisma.physicalSession.deleteMany();
  await prisma.digitalContract.deleteMany();
  await prisma.escrowTransaction.deleteMany();
  await prisma.orderItem.deleteMany();
  await prisma.order.deleteMany();
  await prisma.servicePackage.deleteMany();
  await prisma.blackoutDate.deleteMany();
  await prisma.ambassadorCommission.deleteMany();
  await prisma.ambassadorWithdrawal.deleteMany();
  await prisma.brandAmbassador.deleteMany();
  await prisma.otpCode.deleteMany();
  await prisma.pinChangeLog.deleteMany();
  await prisma.adminAuditLog.deleteMany();
  await prisma.platformFeeComponent.deleteMany();
  await prisma.platformSetting.deleteMany();
  await prisma.vendorProfile.deleteMany();
  await prisma.user.deleteMany();

  /** Mencatat log perubahan PIN awal untuk seorang user (untuk kebijakan 14 hari). */
  async function logPin(userId: string) {
    await prisma.pinChangeLog.create({ data: { userId } });
  }

  // 1. Users (Admin, Client, and Vendors)
  const adminUser = await prisma.user.create({
    data: {
      name: "Super Admin HariKita",
      phone: "081234567890",
      email: "admin@harikita.id",
      pin: DEFAULT_PIN,
      role: "ADMIN",
    },
  });
  await logPin(adminUser.id);

  // Admin demo sub-role (OPS & FINANCE). `adminRole` null = SUPER_ADMIN.
  const opsAdmin = await prisma.user.create({
    data: {
      name: "Ops Admin HariKita",
      phone: "081234567891",
      email: "ops@harikita.id",
      pin: DEFAULT_PIN,
      role: "ADMIN",
      adminRole: "OPS",
    },
  });
  await logPin(opsAdmin.id);

  const financeAdmin = await prisma.user.create({
    data: {
      name: "Finance Admin HariKita",
      phone: "081234567892",
      email: "finance@harikita.id",
      pin: DEFAULT_PIN,
      role: "ADMIN",
      adminRole: "FINANCE",
    },
  });
  await logPin(financeAdmin.id);

  // Platform settings (singleton) — persentase finansial + rincian platform fee.
  const platformSetting = await prisma.platformSetting.create({
    data: {
      dpPct: 30,
      settlementPct: 70,
      platformFeePct: 10,
      defaultBaCommissionPct: 5,
      superAdminEmail: "asepsuherman.workmail@gmail.com",
      isActive: true,
      updatedByName: adminUser.name,
    },
  });
  await prisma.platformFeeComponent.createMany({
    data: [
      { settingId: platformSetting.id, label: "Operasional", pct: 6, sortOrder: 0 },
      { settingId: platformSetting.id, label: "Marketing", pct: 2, sortOrder: 1 },
      { settingId: platformSetting.id, label: "Cadangan", pct: 2, sortOrder: 2 },
    ],
  });

  const clientUser = await prisma.user.create({
    data: {
      name: "Bima & Citra",
      phone: "081987654321",
      email: "bima.citra@gmail.com",
      pin: DEFAULT_PIN,
      role: "CLIENT",
    },
  });
  await logPin(clientUser.id);

  // Profil klien (alamat + koordinat) untuk estimasi jarak vendor→client.
  await prisma.clientProfile.create({
    data: {
      userId: clientUser.id,
      partnerName: "Citra Kirana",
      eventLocation: "Gedung Pertemuan Setda Kebumen",
      district: "Kebumen",
      kecamatan: "Kebumen",
      kabupaten: "Kebumen",
      desa: "Kebumen",
      postalCode: "54311",
      latitude: -7.66,
      longitude: 109.65,
    },
  });

  // Brand Ambassador (BA) demo — merekrut vendor lewat kode referral.
  const baUserId = "ba-demo-001";
  const baUser = await prisma.user.create({
    data: {
      id: baUserId,
      name: "Rina Brand Ambassador",
      phone: "081200000001",
      email: "ba@harikita.id",
      pin: DEFAULT_PIN,
      role: "BA",
    },
  });

  const ba2User = await prisma.user.create({
    data: {
      id: "ba-demo-002",
      name: "Dwi Gombong Ambassador",
      phone: "081200000002",
      email: "dwi.ba@harikita.id",
      pin: DEFAULT_PIN,
      role: "BA",
    },
  });

  const ba3User = await prisma.user.create({
    data: {
      id: "ba-demo-003",
      name: "Sari Karanganyar Ambassador",
      phone: "081200000003",
      email: "sari.ba@harikita.id",
      pin: DEFAULT_PIN,
      role: "BA",
    },
  });

  const ba1 = await prisma.brandAmbassador.create({
    data: {
      userId: baUser.id,
      referralCode: "BA-KEBUMEN-2026",
      displayName: "Rina BA Kebumen",
      phone: "081200000001",
      city: "Kebumen",
      district: "Kebumen Kota",
      commissionPct: 5.0,
      isActive: true,
      // Total komisi terkumpul Rp1.237.500 - penarikan diproses Rp100.000.
      walletBalance: 1137500,
      bankName: "BCA",
      bankAccount: "1234567890",
      bankHolder: "Rina Brand Ambassador",
    },
  });

  const ba2 = await prisma.brandAmbassador.create({
    data: {
      userId: ba2User.id,
      referralCode: "BA-GOMBONG-2026",
      displayName: "Dwi BA Gombong",
      phone: "081200000002",
      city: "Kebumen",
      district: "Gombong",
      commissionPct: 7.0,
      isActive: true,
      // Total komisi terkumpul Rp910.000 (belum ada penarikan sukses).
      walletBalance: 910000,
      bankName: "Mandiri",
      bankAccount: "136000998877",
      bankHolder: "Dwi Gombong Ambassador",
    },
  });

  await prisma.brandAmbassador.create({
    data: {
      userId: ba3User.id,
      referralCode: "BA-KARANGANYAR-2026",
      displayName: "Sari BA Karanganyar",
      phone: "081200000003",
      city: "Kebumen",
      district: "Karanganyar",
      commissionPct: 5.0,
      isActive: false, // Contoh BA nonaktif.
      walletBalance: 0,
      bankName: "BRI",
      bankAccount: "003921829381",
      bankHolder: "Sari Karanganyar Ambassador",
    },
  });

  // Log perubahan PIN awal untuk ketiga BA.
  await logPin(baUser.id);
  await logPin(ba2User.id);
  await logPin(ba3User.id);

  // 2. Vendors across 11 Categories in Kebumen
  const vendorsData = [
    {
      businessName: "Menganti Cinematic & Studio",
      category: "Pre-wedding",
      city: "Kebumen",
      address: "Jl. Pemuda No. 45, Kebumen",
      rating: 4.9,
      reviewCount: 38,
      igHandle: "@menganti.visuals",
      bankName: "BCA",
      bankAccount: "1234567890",
      bankHolder: "Menganti Cinematic",
      packageName: "Paket Prewed All-In Pantai Menganti",
      description: "Sesi foto outdoor di Pantai Menganti & Bukit Menara, 2 busana, drone footage, 25 foto retouched, teaser Reels 60s.",
      basePrice: 3500000,
      unitType: "all_in",
      slaDays: 7,
      imageUrl: "https://images.unsplash.com/photo-1519741497674-611481863552?q=80&w=800",
    },
    {
      businessName: "Griya Busana Rarasati",
      category: "Busana Pengantin & Fitting",
      city: "Kebumen",
      address: "Jl. Pahlawan No. 12, Kebumen",
      rating: 5.0,
      reviewCount: 52,
      igHandle: "@rarasati.kebumen",
      bankName: "Mandiri",
      bankAccount: "136000987654",
      bankHolder: "Griya Rarasati",
      packageName: "Sewa Busana Akad & Resepsi Lengkap",
      description: "Termasuk sewa perdana kebaya modern / beskap adat Jawa, kain jarik, aksesori lengkap, dan 2x sesi fisik fitting gratis.",
      basePrice: 2800000,
      unitType: "all_in",
      slaDays: 5,
      imageUrl: "https://images.unsplash.com/photo-1594552072238-b8a33785b261?q=80&w=800",
    },
    {
      businessName: "Alula MUA & Hijab Styling",
      category: "Makeup Artist (MUA)",
      city: "Kebumen",
      address: "Jl. Tentara Pelajar No. 8, Gombong, Kebumen",
      rating: 4.9,
      reviewCount: 44,
      igHandle: "@alulamua.kebumen",
      bankName: "BSI",
      bankAccount: "7123456789",
      bankHolder: "Alula Wedding Studio",
      packageName: "Paket Rias Pengantin Soft Glam / Adat",
      description: "Rias pengantin akad + resepsi, hijab do / hair styling premium, melati segar, dan touch-up standby 4 jam.",
      basePrice: 2200000,
      unitType: "all_in",
      slaDays: 3,
      imageUrl: "https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?q=80&w=800",
    },
    {
      businessName: "Hantaran Lestari Kebumen",
      category: "Kotak Seserahan & Mahar",
      city: "Kebumen",
      address: "Jl. Kusuma No. 29, Kebumen",
      rating: 4.8,
      reviewCount: 31,
      igHandle: "@hantaranlestari.kbm",
      bankName: "BRI",
      bankAccount: "001234567890",
      bankHolder: "Hantaran Lestari",
      packageName: "Sewa & Hias Baki Akrilik Kayu Jati",
      description: "Baki akrilik kristal kombinasi kayu jati Kebumen, bunga artifisial premium, pita satin, kalkulator fleksibel per kotak.",
      basePrice: 1050000,
      unitType: "baki",
      unitPrice: 150000,
      minUnit: 5,
      maxUnit: 15,
      slaDays: 5,
      imageUrl: "https://images.unsplash.com/photo-1549465220-1a8b9238cd48?q=80&w=800",
    },
    {
      businessName: "Pradana Cinema & Story",
      category: "Dokumentasi Foto-Video",
      city: "Kebumen",
      address: "Jl. Ahmad Yani No. 102, Kebumen",
      rating: 5.0,
      reviewCount: 60,
      igHandle: "@pradana.cinema",
      bankName: "BCA",
      bankAccount: "9876543210",
      bankHolder: "Pradana Multi Media",
      packageName: "Liputan Hari H + Cinematic Teaser",
      description: "2 Fotografer + 1 Videografer, drone aerial venue, all file original di flashdisk kayu eksklusif, video teaser 1 menit & full highlight 7 menit.",
      basePrice: 4200000,
      unitType: "all_in",
      slaDays: 14,
      imageUrl: "https://images.unsplash.com/photo-1606800052052-a08af7148866?q=80&w=800",
    },
    {
      businessName: "Asmara Flora & Pelaminan",
      category: "Dekorasi & Florist",
      city: "Kebumen",
      address: "Jl. Mayjen Soetoyo No. 15, Kebumen",
      rating: 4.9,
      reviewCount: 47,
      igHandle: "@asmaraflora.kbm",
      bankName: "Mandiri",
      bankAccount: "136000554433",
      bankHolder: "Asmara Flora Dekor",
      packageName: "Dekorasi Pelaminan Intimate 4-6 Meter",
      description: "Pelaminan bunga segar kombinasi rustic elegan, karpet jalan, standing flowers 4 titik, gate masuk, dan photobooth lamaran.",
      basePrice: 5500000,
      unitType: "all_in",
      slaDays: 7,
      imageUrl: "https://images.unsplash.com/photo-1519225424564-96fe7be8ffb6?q=80&w=800",
    },
    {
      businessName: "Dapur Rasa Boga Kebumen",
      category: "Katering & Food Stalls",
      city: "Kebumen",
      address: "Jl. Indrakila No. 70, Kebumen",
      rating: 4.9,
      reviewCount: 85,
      igHandle: "@rasaboga.kebumen",
      bankName: "BCA",
      bankAccount: "5544332211",
      bankHolder: "Dapur Rasa Boga",
      packageName: "Prasmanan Harmoni Selera Kebumen",
      description: "Menu komplit: Nasi, Olahan Daging Sapi, Ayam Suwir, Sup Pengantin, Es Dawet Ireng Khas Butuh, buah potong, lengkap dengan waiter & sample test food.",
      basePrice: 4500000, // untuk 100 pax dasar
      unitType: "pax",
      unitPrice: 45000,
      minUnit: 50,
      maxUnit: 1000,
      slaDays: 10,
      imageUrl: "https://images.unsplash.com/photo-1555244162-803834f70033?q=80&w=800",
    },
    {
      businessName: "L'Aura Patisserie & Cakes",
      category: "Cakes & Dessert Corner",
      city: "Kebumen",
      address: "Jl. Kolonel Sugiono No. 22, Kebumen",
      rating: 4.8,
      reviewCount: 29,
      igHandle: "@lauracakes.kbm",
      bankName: "BCA",
      bankAccount: "3322114455",
      bankHolder: "L'Aura Cakes",
      packageName: "Tiered Wedding Cake & Sweet Corner",
      description: "Kue pengantin 2 tingkat dengan hiasan bunga segar senada dekorasi + mini dessert table (cupcakes, pudding shooters, tarts). Termasuk sample cake taster.",
      basePrice: 1600000,
      unitType: "all_in",
      slaDays: 4,
      imageUrl: "https://images.unsplash.com/photo-1535141192574-5d4897c13136?q=80&w=800",
    },
    {
      businessName: "Kriya Anyam Gombong Souvenir",
      category: "Souvenir & Favors",
      city: "Kebumen",
      address: "Jl. Raya Barat Gombong No. 10, Kebumen",
      rating: 4.9,
      reviewCount: 40,
      igHandle: "@kriyaanyam.kbm",
      bankName: "BRI",
      bankAccount: "009988776655",
      bankHolder: "Kriya Anyam Kebumen",
      packageName: "Pouch Linen Anyaman Pandan Eksklusif",
      description: "Pouch ramah lingkungan kombinasi anyaman pandan khas Kebumen & linen, bordir inisial pasangan, kemasan mika & kartu ucapan terima kasih.",
      basePrice: 750000, // untuk 50 pcs dasar
      unitType: "pcs",
      unitPrice: 15000,
      minUnit: 50,
      maxUnit: 500,
      slaDays: 12,
      imageUrl: "https://images.unsplash.com/photo-1513519245088-0e12902e5a38?q=80&w=800",
    },
    {
      businessName: "HariKita Digital & Print Invitation",
      category: "Undangan Digital & Amplop",
      city: "Kebumen",
      address: "Sentra Kreasi Kebumen Creative Hub, Kebumen",
      rating: 5.0,
      reviewCount: 95,
      igHandle: "@harikita.invitation",
      bankName: "BCA",
      bankAccount: "8899001122",
      bankHolder: "HariKita Kebumen",
      packageName: "Paket All-In Undangan Digital & Cetak Wax Seal",
      description: "Website undangan digital responsif (65+ varian tema, musik, RSVP real-time, amplop digital) + 100 pcs undangan cetak hardcover dengan cap segel lilin.",
      basePrice: 1250000,
      unitType: "all_in",
      slaDays: 5,
      imageUrl: "https://images.unsplash.com/photo-1544717305-2782549b5136?q=80&w=800",
    },
    {
      businessName: "Denah Kita Kartun Estetik",
      category: "Cute Illustrated Maps",
      city: "Kebumen",
      address: "Jl. Veteran No. 18, Kebumen",
      rating: 4.9,
      reviewCount: 34,
      igHandle: "@denahkita.kebumen",
      bankName: "BSI",
      bankAccount: "7766554433",
      bankHolder: "Denah Kita Studio",
      packageName: "Ilustrasi Denah Lokasi Kartun & Barcode QR",
      description: "Gambar kartun lucu rute lokasi venue (gedung, masjid, patung ikonik Kebumen), siap cetak & terintegrasi navigasi langsung Google Maps.",
      basePrice: 250000,
      unitType: "all_in",
      slaDays: 3,
      imageUrl: "https://images.unsplash.com/photo-1524661135-423995f22d0b?q=80&w=800",
    },
  ];

  // Vendor yang direkrut BA (berdasarkan indeks vendorsData):
  //   BA-1 (Rina): 0=Menganti, 1=Rarasati, 2=Alula MUA, 3=Hantaran, 4=Pradana
  //   BA-2 (Dwi) : 6=Dapur Rasa Boga, 5=Asmara Flora
  const recruiterByIndex: Record<number, string> = {
    0: ba1.id,
    1: ba1.id,
    2: ba1.id,
    3: ba1.id,
    4: ba1.id,
    5: ba2.id,
    6: ba2.id,
  };

  const createdVendors: Array<{
    id: string;
    businessName: string;
    packageId: string;
    basePrice: number;
    category: string;
  }> = [];

  for (let i = 0; i < vendorsData.length; i++) {
    const item = vendorsData[i];
    const user = await prisma.user.create({
      data: {
        name: item.businessName,
        phone: `0813000000${(i + 1).toString().padStart(2, "0")}`,
        email: `vendor${i + 1}@harikita.id`,
        pin: DEFAULT_PIN,
        role: "VENDOR",
      },
    });
    await logPin(user.id);

    const vendor = await prisma.vendorProfile.create({
      data: {
        userId: user.id,
        businessName: item.businessName,
        category: item.category,
        city: item.city,
        address: item.address,
        rating: item.rating,
        reviewCount: item.reviewCount,
        igHandle: item.igHandle,
        bankName: item.bankName,
        bankAccount: item.bankAccount,
        bankHolder: item.bankHolder,
        walletBalance: 1500000,
        recruitedById: recruiterByIndex[i] ?? null,
        // Vendor demo sudah terverifikasi agar katalog demo tetap terisi
        verificationStatus: "APPROVED",
        isVerified: true,
        profileCompleted: true,
        ktpNumber: "3305" + String(100000000000 + i).slice(0, 12),
        revenueMethod: "BANK",
        desa: "Kebumen",
        kecamatan: "Kebumen",
        kabupaten: "Kebumen",
        postalCode: "54311",
        // Koordinat bervariasi per kecamatan Kebumen (untuk estimasi jarak)
        latitude: VENDOR_COORDS[i % VENDOR_COORDS.length][0],
        longitude: VENDOR_COORDS[i % VENDOR_COORDS.length][1],
      },
    });

    const pkg = await prisma.servicePackage.create({
      data: {
        vendorId: vendor.id,
        category: item.category,
        name: item.packageName,
        description: item.description,
        basePrice: item.basePrice,
        unitType: item.unitType,
        unitPrice: item.unitPrice,
        minUnit: item.minUnit,
        maxUnit: item.maxUnit,
        slaDays: item.slaDays,
        imageUrl: item.imageUrl,
      },
    });

    createdVendors.push({
      id: vendor.id,
      businessName: item.businessName,
      packageId: pkg.id,
      basePrice: item.basePrice,
      category: item.category,
    });
  }

  // 2b. Riwayat komisi BA — order tuntas dari vendor rekrutan.
  //     Komisi = floor(subtotal * commissionPct / 100), exact-once per OrderItem.
  const commissionSeeds: Array<{
    ambassadorId: string;
    pct: number;
    vendorIndex: number;
    subtotal: number;
    status: string;
  }> = [
    // ── BA-1 Rina (5%) ────────────────────────────────────────────
    { ambassadorId: ba1.id, pct: 5.0, vendorIndex: 0, subtotal: 3500000, status: "CREDITED" }, // 175.000
    { ambassadorId: ba1.id, pct: 5.0, vendorIndex: 4, subtotal: 4200000, status: "CREDITED" }, // 210.000
    { ambassadorId: ba1.id, pct: 5.0, vendorIndex: 1, subtotal: 2800000, status: "CREDITED" }, // 140.000
    { ambassadorId: ba1.id, pct: 5.0, vendorIndex: 2, subtotal: 2200000, status: "CREDITED" }, // 110.000
    { ambassadorId: ba1.id, pct: 5.0, vendorIndex: 3, subtotal: 1050000, status: "CREDITED" }, //  52.500
    { ambassadorId: ba1.id, pct: 5.0, vendorIndex: 0, subtotal: 5000000, status: "CREDITED" }, // 250.000
    { ambassadorId: ba1.id, pct: 5.0, vendorIndex: 4, subtotal: 6000000, status: "CREDITED" }, // 300.000
    // ── BA-2 Dwi (7%) ─────────────────────────────────────────────
    { ambassadorId: ba2.id, pct: 7.0, vendorIndex: 6, subtotal: 4500000, status: "CREDITED" }, // 315.000
    { ambassadorId: ba2.id, pct: 7.0, vendorIndex: 5, subtotal: 5500000, status: "CREDITED" }, // 385.000
    { ambassadorId: ba2.id, pct: 7.0, vendorIndex: 6, subtotal: 3000000, status: "CREDITED" }, // 210.000
  ];

  for (let i = 0; i < commissionSeeds.length; i++) {
    const seed = commissionSeeds[i];
    const vendor = createdVendors[seed.vendorIndex];
    const commissionAmount = Math.floor((seed.subtotal * seed.pct) / 100);

    const order = await prisma.order.create({
      data: {
        orderNumber: `HKB-BA-${(i + 1).toString().padStart(3, "0")}`,
        userId: clientUser.id,
        clientName: "Bima & Citra",
        clientPhone: "081987654321",
        eventDate: new Date(`2026-1${(i % 2) + 1}-15T09:00:00Z`),
        city: "Kebumen",
        totalAmount: seed.subtotal,
        status: "COMPLETED",
      },
    });

    const orderItem = await prisma.orderItem.create({
      data: {
        orderId: order.id,
        vendorId: vendor.id,
        packageId: vendor.packageId,
        vendorNameSnapshot: vendor.businessName,
        categorySlug: vendor.businessName.toLowerCase().replace(/\s+/g, "-"),
        serviceName: vendor.businessName,
        unitType: "all_in",
        quantity: 1,
        unitPrice: seed.subtotal,
        subtotal: seed.subtotal,
        status: "ACCEPTED",
      },
    });

    await prisma.ambassadorCommission.create({
      data: {
        ambassadorId: seed.ambassadorId,
        orderId: order.id,
        orderItemId: orderItem.id,
        vendorId: vendor.id,
        baseAmount: seed.subtotal,
        commissionPct: seed.pct,
        commissionAmount,
        status: seed.status,
      },
    });
  }

  // 2c. Riwayat penarikan dompet BA.
  await prisma.ambassadorWithdrawal.createMany({
    data: [
      // ── Rina (BA-1) ──
      {
        ambassadorId: ba1.id,
        amount: 100000,
        status: "PAID",
        bankName: "BCA",
        bankAccount: "1234567890",
        bankHolder: "Rina Brand Ambassador",
        processedAt: new Date("2026-09-10T10:00:00Z"),
        note: "Transfer berhasil.",
      },
      {
        ambassadorId: ba1.id,
        amount: 50000,
        status: "PENDING",
        bankName: "GoPay",
        bankAccount: "081200000001",
        bankHolder: "Rina Brand Ambassador",
      },
      // ── Dwi (BA-2) ──
      {
        ambassadorId: ba2.id,
        amount: 75000,
        status: "REJECTED",
        bankName: "Mandiri",
        bankAccount: "136000998877",
        bankHolder: "Dwi Gombong Ambassador",
        processedAt: new Date("2026-09-12T14:30:00Z"),
        note: "Nomor rekening tidak valid.",
      },
      {
        ambassadorId: ba2.id,
        amount: 200000,
        status: "PENDING",
        bankName: "DANA",
        bankAccount: "081200000002",
        bankHolder: "Dwi Gombong Ambassador",
      },
    ],
  });

  // 3. Mock Digital Invitation (Autumnelle preset as initial demonstration)
  const invitation = await prisma.digitalInvitation.create({
    data: {
      slug: "bima-citra",
      themeId: "autumnelle-animasi",
      title: "Pernikahan Bima & Citra",
      brideName: "Citra Ayu Lestari",
      brideFather: "Bapak H. Bambang Sudiro",
      brideMother: "Ibu Hj. Endang Rahayu",
      bridePhoto: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=600",
      groomName: "Bima Arya Pratama",
      groomFather: "Bapak Dr. Suryono",
      groomMother: "Ibu Siti Nurhaliza",
      groomPhoto: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=600",
      eventDate: new Date("2026-11-20T09:00:00Z"),
      venueName: "Gedung Pertemuan Setda Kebumen",
      venueAddress: "Jl. Veteran No. 2, Kebumen, Jawa Tengah",
      googleMapsUrl: "https://maps.google.com/?q=Setda+Kebumen",
      liveStreamUrl: "https://instagram.com/bima.citra.wedding",
      igFilterUrl: "https://instagram.com/ar/bima-citra-filter",
      musicUrl: "https://cdn.pixabay.com/download/audio/2022/05/27/audio_1808fbf07a.mp3?filename=romantic-piano-112199.mp3",
      giftAddress: "Perumahan Kebumen Indah Blok B-12, Kebumen (081987654321)",
      bankAccounts: JSON.stringify([
        { bank: "BCA", number: "19827398124", holder: "Bima Arya Pratama" },
        { bank: "Mandiri", number: "136001239847", holder: "Citra Ayu Lestari" },
      ]),
      storyTimeline: JSON.stringify([
        {
          year: "2021",
          title: "Pertemuan Pertama di Alun-Alun Kebumen",
          desc: "Berjumpa saat sama-sama menikmati kuliner sate ambal di sore hari.",
        },
        {
          year: "2023",
          title: "Komitmen Bersama",
          desc: "Sepakat menjalin hubungan serius untuk menyatukan dua keluarga besar.",
        },
        {
          year: "2026",
          title: "Hari Bahagia Menuju Pelaminan",
          desc: "Dengan restu kedua orang tua, mengikat janji suci pernikahan abadi.",
        },
      ]),
      galleryPhotos: JSON.stringify([
        "https://images.unsplash.com/photo-1519741497674-611481863552?q=80&w=800",
        "https://images.unsplash.com/photo-1583939003579-730e3918a45a?q=80&w=800",
        "https://images.unsplash.com/photo-1511285560929-80b456fea0bc?q=80&w=800",
        "https://images.unsplash.com/photo-1537633552985-df8429e8048b?q=80&w=800",
      ]),
    },
  });

  // Seed initial well wishes
  await prisma.rsvpWish.createMany({
    data: [
      {
        invitationId: invitation.id,
        guestName: "Keluarga Besar H. Subagyo",
        attendance: "hadir",
        paxCount: 2,
        sessionCode: "s1",
        message: "Selamat untuk Mas Bima & Mbak Citra. Semoga menjadi keluarga sakinah, mawaddah, warahmah.",
      },
      {
        invitationId: invitation.id,
        guestName: "Rizky & Dinda (Sahabat Kampus)",
        attendance: "hadir",
        paxCount: 2,
        sessionCode: "s2",
        message: "Alhamdulillah akhirnya berlabuh di pelaminan! Lancar sampai hari H ya teman-teman!",
      },
      {
        invitationId: invitation.id,
        guestName: "Pakde Widodo (Semarang)",
        attendance: "ragu",
        paxCount: 1,
        sessionCode: "s1",
        message: "Insya Allah hadir jika tidak ada tugas dinas luar kota. Doa terbaik untuk kedua mempelai.",
      },
    ],
  });

  // ── Data uji verifikasi & geo ──────────────────────────────────────────────
  // Client demo (untuk uji estimasi jarak di /client/pesanan)
  const demoClient = await prisma.user.create({
    data: {
      name: "Demo Client Uji",
      phone: "081900000099",
      email: "client.uji@harikita.id",
      pin: DEFAULT_PIN,
      role: "CLIENT",
    },
  });
  await logPin(demoClient.id);
  await prisma.clientProfile.create({
    data: {
      userId: demoClient.id,
      partnerName: "Pasangan Demo",
      district: "Kebumen",
      kecamatan: "Kebumen",
      kabupaten: "Kebumen",
      desa: "Kebumen",
      postalCode: "54311",
      latitude: -7.66,
      longitude: 109.65,
    },
  });

  // Vendor PENDING (untuk uji alur verifikasi admin)
  const pendingVendorUser = await prisma.user.create({
    data: {
      name: "Vendor Uji PENDING",
      phone: "081300000099",
      email: "vendor.uji@harikita.id",
      pin: DEFAULT_PIN,
      role: "VENDOR",
    },
  });
  await logPin(pendingVendorUser.id);
  await prisma.vendorProfile.create({
    data: {
      userId: pendingVendorUser.id,
      businessName: "Vendor Uji Belum Terverifikasi",
      category: "Katering & Food Stalls",
      address: "Jl. Uji No. 1",
      verificationStatus: "PENDING",
      isVerified: false,
      profileCompleted: false,
    },
  });

  // Order demo untuk client demo (agar estimasi jarak tampil)
  const demoVendor = createdVendors[0];
  if (demoVendor) {
    const demoPkg = await prisma.servicePackage.findFirst({ where: { vendorId: demoVendor.id } });
    if (demoPkg) {
      const unitPrice = demoPkg.unitPrice ?? demoPkg.basePrice;
      const order = await prisma.order.create({
        data: {
          orderNumber: "HK-DEMO-0001",
          userId: demoClient.id,
          clientName: demoClient.name,
          clientPhone: demoClient.phone,
          eventDate: new Date("2027-06-15"),
          city: "Kebumen",
          totalAmount: unitPrice,
          status: "IN_PROGRESS",
          notes: "Order demo untuk testing estimasi jarak",
          snapshotDpPct: 30,
          snapshotSettlementPct: 70,
          snapshotPlatformFeePct: 10,
        },
      });
      await prisma.orderItem.create({
        data: {
          orderId: order.id,
          vendorId: demoVendor.id,
          packageId: demoPkg.id,
          vendorNameSnapshot: demoVendor.businessName,
          categorySlug: demoVendor.category,
          serviceName: demoPkg.name,
          packageName: demoPkg.name,
          quantity: 1,
          unitPrice,
          subtotal: unitPrice,
          status: "ACCEPTED",
        },
      });
    }
  }

  console.log("Seeding finished successfully! 11 Kebumen categories seeded.");
  console.log("");
  console.log("=== AKUN DEMO HARI KITA (PIN semua: 123456) ===");
  console.log("Super Admin : 081234567890  -> /auth/login/admin");
  console.log("Ops Admin   : 081234567891  (sub-role OPS)     -> /auth/login/admin");
  console.log("Finance Adm : 081234567892  (sub-role FINANCE) -> /auth/login/admin");
  console.log("Pengantin   : 081987654321  -> /auth/login");
  console.log("Vendor      : 081300000001  -> /auth/login");
  console.log("--- Akun uji verifikasi & geo ---");
  console.log("Client Uji  : 081900000099  (punya alamat+peta+order demo) -> /auth/login");
  console.log("Vendor PENDING : 081300000099 -> /dashboard/vendor/profil (uji ajukan verifikasi)");
  console.log("Brand Ambassador:");
  console.log("  [AKTIF]   : 081200000001  (Rina BA Kebumen, komisi 5%, saldo Rp1.137.500, kode BA-KEBUMEN-2026) -> /auth/login/ba");
  console.log("  [AKTIF]   : 081200000002  (Dwi BA Gombong, komisi 7%, saldo Rp910.000, kode BA-GOMBONG-2026) -> /auth/login/ba");
  console.log("  [NONAKTIF]: 081200000003  (Sari BA Karanganyar, komisi 5%, saldo Rp0, kode BA-KARANGANYAR-2026) -> /auth/login/ba");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
