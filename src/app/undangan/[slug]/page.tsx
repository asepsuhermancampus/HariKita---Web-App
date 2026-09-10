import React from "react";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { getThemeById, ALL_INVITATION_TEMPLATES } from "@/lib/templates/registry";
import { TemplateEngineResolver } from "@/components/templates/TemplateEngineResolver";
import { LiveThemeSwitcherToolbar } from "@/components/invitation/LiveThemeSwitcherToolbar";

export const dynamic = "force-dynamic";

interface PageProps {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ to?: string; sesi?: string; theme?: string }>;
}

export default async function UndanganDetailPage({ params, searchParams }: PageProps) {
  const { slug } = await params;
  const { to: guestName = "Bapak/Ibu/Saudara/i", sesi = "s1", theme: themeOverride } = await searchParams;

  // Fetch invitation from database
  let invitation = null;
  try {
    invitation = await prisma.digitalInvitation.findUnique({
      where: { slug },
      include: {
        rsvps: {
          orderBy: { createdAt: "desc" },
        },
      },
    });
  } catch (error) {
    console.error("Database fetch error, using fallback demo data:", error);
  }

  // Fallback demo data if slug is a known template ID, "demo", or database record is not yet seeded
  const isTemplateId = ALL_INVITATION_TEMPLATES.some((t) => t.id === slug);
  const activeThemeId = themeOverride || invitation?.themeId || (isTemplateId ? slug : "autumnelle");
  const themePreset = getThemeById(activeThemeId);

  const brideName = invitation?.brideName || "Citra Ayu Lestari";
  const groomName = invitation?.groomName || "Bima Arya Pratama";
  const eventDate = invitation?.eventDate
    ? invitation.eventDate.toISOString()
    : "2026-11-20T09:00:00Z";

  function safeJsonParse<T>(val: string | null | undefined, fallback: T): T {
    if (!val || typeof val !== "string" || val.trim() === "") return fallback;
    try {
      return JSON.parse(val) as T;
    } catch {
      return fallback;
    }
  }

  const defaultStory = [
    {
      year: "2021",
      title: "Takdir di Sudut Alun-Alun Kebumen",
      desc: "Pertemuan pertama yang tak pernah direncanakan di bawah hangatnya lembayung sore Alun-Alun Kebumen. Berawal dari percakapan santai seputar kuliner lokal dan tawa kecil yang tak sengaja beradu, semesta diam-diam mulai menenun rasa nyaman di antara dua insan yang sebelumnya saling asing.",
    },
    {
      year: "2022",
      title: "Mengikat Kepercayaan di Pantai Menganti",
      desc: "Perjalanan demi perjalanan kami lewati bersama, hingga suatu senja di atas tebing kapur Pantai Menganti. Di sanalah lembaran demi lembaran cerita hidup kami buka tanpa ragu; saling mendengarkan mimpi sederhana, memahami cerita masa lalu, dan menyadari bahwa kehadiran masing-masing adalah rumah terbaik untuk berpulang.",
    },
    {
      year: "2024",
      title: "Menyelaraskan Hati & Restu Dua Keluarga",
      desc: "Cinta bukan lagi sekadar tentang 'aku dan kamu', melainkan menyelaraskan niat tulus dengan restu keluarga besar. Melewati diskusi panjang, silaturahmi yang hangat, dan doa-doa di sepertiga malam, kedua orang tua akhirnya saling menyatukan tangan dan merestui jalan suci ini menuju ikatan pernikahan.",
    },
    {
      year: "2026",
      title: "Mengucap Janji di Depan Penghulu",
      desc: "Setelah menempuh perjalanan waktu yang mendewasakan, hari yang paling kami nantikan kini menjelma nyata. Dengan bismillah dan kerendahan hati, kami bersiap mengikrarkan janji suci di hadapan Sang Khalik, mengarungi bahtera rumah tangga yang sakinah, mawaddah, dan warahmah hingga akhir usia.",
    },
  ];

  const defaultPhotos = [
    "https://images.unsplash.com/photo-1519741497674-611481863552?q=80&w=800", // Romantic couple outdoor sunlight
    "https://images.unsplash.com/photo-1583939003579-730e3918a45a?q=80&w=800", // Classic bride & groom portrait
    "https://images.unsplash.com/photo-1511285560929-80b456fea0bc?q=80&w=800", // Golden hour couple embrace
    "https://images.unsplash.com/photo-1537633552985-df8429e8048b?q=80&w=800", // Wedding dress & rings details
    "https://images.unsplash.com/photo-1520854221256-17451cc331bf?q=80&w=800", // Coastal / beach nature prewed
    "https://images.unsplash.com/photo-1606800052052-a08af7148866?q=80&w=800", // Close-up holding hands & floral bouquet
    "https://images.unsplash.com/photo-1519225429980-715cb0215aed?q=80&w=800", // Rustic wedding ceremony floral arch
    "https://images.unsplash.com/photo-1465495976277-4387d4b0b4c6?q=80&w=800", // Cinematic black & white couple kiss
    "https://images.unsplash.com/photo-1522673607200-164d1b6ce486?q=80&w=800", // Intimate prewed casual laugh
    "https://images.unsplash.com/photo-1529636798458-92182e662485?q=80&w=800", // Sunset romantic silhouettes
  ];

  const defaultBanks = [
    { bank: "BCA", number: "19827398124", holder: "Bima Arya Pratama" },
    { bank: "Mandiri", number: "136001239847", holder: "Citra Ayu Lestari" },
  ];

  const storyTimeline = safeJsonParse(invitation?.storyTimeline, defaultStory);
  const galleryPhotos = safeJsonParse(invitation?.galleryPhotos, defaultPhotos);
  const bankAccounts = safeJsonParse(invitation?.bankAccounts, defaultBanks);

  const rawWishes = invitation?.rsvps || [
    {
      id: "w1",
      guestName: "Keluarga Besar H. Subagyo",
      attendance: "hadir",
      paxCount: 2,
      message: "Selamat untuk Mas Bima & Mbak Citra. Semoga menjadi keluarga sakinah, mawaddah, warahmah.",
      createdAt: new Date().toISOString(),
    },
    {
      id: "w2",
      guestName: "Rizky & Dinda (Sahabat Kampus)",
      attendance: "hadir",
      paxCount: 2,
      message: "Alhamdulillah akhirnya berlabuh di pelaminan! Lancar sampai hari H ya teman-teman!",
      createdAt: new Date().toISOString(),
    },
  ];

  const formattedWishes = rawWishes.map((w) => ({
    id: w.id,
    guestName: w.guestName,
    attendance: w.attendance,
    paxCount: w.paxCount,
    message: w.message,
    createdAt: typeof w.createdAt === "string" ? w.createdAt : (w.createdAt as Date).toISOString(),
  }));

  return (
    <>
      <TemplateEngineResolver
        invitationId={invitation?.id || "demo-invitation"}
        theme={themePreset}
        guestName={guestName}
        activeSessionCode={sesi as "s1" | "s2" | "s3"}
        bride={{
          name: "Citra",
          fullName: brideName,
          father: invitation?.brideFather || "Bapak H. Bambang Sudiro",
          mother: invitation?.brideMother || "Ibu Hj. Endang Rahayu",
          photo: invitation?.bridePhoto || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=600",
          instagram: "citraayuu",
        }}
        groom={{
          name: "Bima",
          fullName: groomName,
          father: invitation?.groomFather || "Bapak Dr. Suryono",
          mother: invitation?.groomMother || "Ibu Siti Nurhaliza",
          photo: invitation?.groomPhoto || "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=600",
          instagram: "bima.arya",
        }}
        eventDate={eventDate}
        sessions={{
          s1: {
            sessionCode: "s1",
            title: "Akad Nikah",
            timeSlot: "08:00 - 10:00 WIB",
            venueName: invitation?.venueName || "Gedung Pertemuan Setda Kebumen",
            venueAddress: invitation?.venueAddress || "Jl. Veteran No. 2, Kebumen, Jawa Tengah",
          },
          s2: {
            sessionCode: "s2",
            title: "Resepsi Siang Sesi 1",
            timeSlot: "11:00 - 14:00 WIB",
            venueName: invitation?.venueName || "Gedung Pertemuan Setda Kebumen",
            venueAddress: invitation?.venueAddress || "Jl. Veteran No. 2, Kebumen, Jawa Tengah",
          },
          s3: {
            sessionCode: "s3",
            title: "Resepsi Malam Sesi 2 (Intimate)",
            timeSlot: "19:00 - 21:30 WIB",
            venueName: invitation?.venueName || "Gedung Pertemuan Setda Kebumen",
            venueAddress: invitation?.venueAddress || "Jl. Veteran No. 2, Kebumen, Jawa Tengah",
          },
        }}
        googleMapsUrl={invitation?.googleMapsUrl || "https://maps.google.com/?q=Setda+Kebumen"}
        musicUrl={
          invitation?.musicUrl ||
          themePreset.defaultAudioTrack ||
          "https://cdn.pixabay.com/download/audio/2022/05/27/audio_1808fbf07a.mp3?filename=romantic-piano-112199.mp3"
        }
        storyTimeline={storyTimeline}
        galleryPhotos={galleryPhotos}
        giftInfo={{
          banks: bankAccounts,
          physicalGiftAddress:
            invitation?.giftAddress ||
            "Perumahan Kebumen Indah Blok B-12, Kebumen, Jawa Tengah (081987654321)",
        }}
        initialWishes={formattedWishes}
      />
      <LiveThemeSwitcherToolbar currentThemeId={activeThemeId} />
    </>
  );
}
