import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";
import {
  getServiceTemplates,
  getPortfolioTemplates,
  IMG,
} from "./seed-data/vendor-services";
import { generateVendors } from "./seed-data/vendors";
import { buildVendorSlug } from "../src/lib/catalog-utils";

/** Peta kategori vendor → key pool gambar. */
function categoryImgKey(category: string): keyof typeof IMG {
  const map: Record<string, keyof typeof IMG> = {
    "Pre-wedding": "prewed",
    "Busana Pengantin & Fitting": "busana",
    "Makeup Artist (MUA)": "mua",
    "Kotak Seserahan & Mahar": "seserahan",
    "Dokumentasi Foto-Video": "dokumentasi",
    "Dekorasi & Florist": "dekorasi",
    "Katering & Food Stalls": "katering",
    "Cakes & Dessert Corner": "cake",
    "Souvenir & Favors": "souvenir",
    "Undangan Digital & Amplop": "undangan",
    "Cute Illustrated Maps": "map",
  };
  return map[category] ?? "prewed";
}

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
  await prisma.vendorPortfolio.deleteMany();
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
  // Data vendor di-generate: 25 vendor per 11 kategori = 275 (satu kategori masing-masing).
  const vendorsData = generateVendors();

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
    const n = i + 1;
    const phone = "081300" + String(n).padStart(6, "0"); // 081300000001..275
    const user = await prisma.user.create({
      data: {
        name: item.businessName,
        phone,
        email: `vendor${n}@harikita.id`,
        pin: DEFAULT_PIN,
        role: "VENDOR",
      },
    });
    await logPin(user.id);

    const vendor = await prisma.vendorProfile.create({
      data: {
        userId: user.id,
        slug: buildVendorSlug(item.businessName, user.id),
        businessName: item.businessName,
        category: item.category,
        picName: item.businessName,
        city: "Kebumen",
        district: item.district,
        address: item.address,
        rating: item.rating,
        reviewCount: item.reviewCount,
        igHandle: item.igHandle,
        bankName: item.bankName,
        bankAccount: item.bankAccount,
        bankHolder: item.bankHolder,
        walletBalance: 0,
        recruitedById: recruiterByIndex[i] ?? null,
        // Vendor demo sudah terverifikasi agar katalog demo tetap terisi
        verificationStatus: "APPROVED",
        isVerified: true,
        profileCompleted: true,
        ktpNumber: "3305" + String(100000000000 + i).slice(0, 12),
        revenueMethod: "BANK",
        desa: item.district,
        kecamatan: item.district,
        kabupaten: "Kebumen",
        postalCode: "54311",
        // Koordinat bervariasi per kecamatan Kebumen (untuk estimasi jarak)
        latitude: VENDOR_COORDS[i % VENDOR_COORDS.length][0],
        longitude: VENDOR_COORDS[i % VENDOR_COORDS.length][1],
      },
    });

    const svcTemplates = getServiceTemplates(item.category);
    const imgPool = IMG[categoryImgKey(item.category)];

    const base = 500000 + (i % 25) * 15000;

    // ── Katalog kaya: 25 paket layanan per vendor (batch createMany) ──
    const pkgRows = svcTemplates.map((t, s) => {
      const price = Math.round((base * t.priceFactor) / 1000) * 1000;
      return {
        vendorId: vendor.id,
        category: item.category,
        name: t.name,
        description: t.description,
        basePrice: price,
        unitType: t.unitType,
        unitPrice: t.unitType === "all_in" ? null : price,
        minUnit: t.minUnit ?? 1,
        maxUnit: t.maxUnit ?? null,
        slaDays: t.slaDays,
        imageUrl: imgPool[s % imgPool.length],
        includes: JSON.stringify(t.includes),
      };
    });
    await prisma.servicePackage.createMany({ data: pkgRows });

    // Paket pertama (dipakai sebagai rujukan id/basePrice untuk order demo)
    const firstPkg = await prisma.servicePackage.findFirst({
      where: { vendorId: vendor.id },
      orderBy: { basePrice: "asc" },
    });
    const firstPkgId = firstPkg?.id ?? "";
    const firstPkgPrice = firstPkg?.basePrice ?? 0;

    // ── Portofolio feed: 10 item per vendor (batch createMany) ──
    const pfTemplates = getPortfolioTemplates(item.category);
    const pfRows = pfTemplates.map((pf, p) => {
      const [pfTitle, pfLocation, pfCategory, pfStyles, pfCaption] = pf;
      return {
        vendorId: vendor.id,
        title: pfTitle,
        locationTag: pfLocation,
        categoryTag: pfCategory,
        styleTags: JSON.stringify(pfStyles),
        caption: pfCaption,
        imageUrl: imgPool[p % imgPool.length],
        likes: 20 + (n * 7 + p * 13) % 300,
        isPublished: true,
      };
    });
    await prisma.vendorPortfolio.createMany({ data: pfRows });

    createdVendors.push({
      id: vendor.id,
      businessName: item.businessName,
      packageId: firstPkgId,
      basePrice: firstPkgPrice,
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
      phone: "081399000099",
      email: "vendor.pending@harikita.id",
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
  console.log("Vendor PENDING : 081399000099 -> /dashboard/vendor/profil (uji ajukan verifikasi)");
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
