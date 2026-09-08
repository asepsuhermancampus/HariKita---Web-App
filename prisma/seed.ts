import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  console.log("Seeding HariKita Kebumen database...");

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
  await prisma.vendorProfile.deleteMany();
  await prisma.user.deleteMany();

  // 1. Users (Admin, Client, and Vendors)
  const adminUser = await prisma.user.create({
    data: {
      name: "Super Admin HariKita",
      phone: "081234567890",
      email: "admin@harikita.id",
      role: "ADMIN",
    },
  });

  const clientUser = await prisma.user.create({
    data: {
      name: "Bima & Citra",
      phone: "081987654321",
      email: "bima.citra@gmail.com",
      role: "CLIENT",
    },
  });

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

  for (let i = 0; i < vendorsData.length; i++) {
    const item = vendorsData[i];
    const user = await prisma.user.create({
      data: {
        name: item.businessName,
        phone: `0813000000${(i + 1).toString().padStart(2, "0")}`,
        email: `vendor${i + 1}@harikita.id`,
        role: "VENDOR",
      },
    });

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
      },
    });

    await prisma.servicePackage.create({
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
  }

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

  console.log("Seeding finished successfully! 11 Kebumen categories seeded.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
