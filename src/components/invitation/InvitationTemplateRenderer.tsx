"use client";

import React, { useState } from "react";
import { TemplateThemePreset } from "@/lib/templates/types";
import { EnvelopeCover } from "./EnvelopeCover";
import { MusicPlayer } from "./MusicPlayer";
import { CoupleSection } from "./CoupleSection";
import { EventSchedule } from "./EventSchedule";
import { LoveStoryTimeline } from "./LoveStoryTimeline";
import { PhotoGallery } from "./PhotoGallery";
import { DigitalGiftModal } from "./DigitalGiftModal";
import { RsvpGuestbookForm } from "./RsvpGuestbookForm";
import { ReceptionQrCheckin } from "./ReceptionQrCheckin";
import { Heart, Sparkles } from "lucide-react";

interface InvitationTemplateRendererProps {
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
    s1: {
      sessionCode: "s1";
      title: string;
      timeSlot: string;
      venueName: string;
      venueAddress: string;
    };
    s2: {
      sessionCode: "s2";
      title: string;
      timeSlot: string;
      venueName: string;
      venueAddress: string;
    };
    s3?: {
      sessionCode: "s3";
      title: string;
      timeSlot: string;
      venueName: string;
      venueAddress: string;
    };
  };
  googleMapsUrl: string;
  musicUrl: string;
  storyTimeline: Array<{ year: string; title: string; desc: string }>;
  galleryPhotos: string[];
  giftInfo: {
    banks: Array<{ bank: string; number: string; holder: string }>;
    physicalGiftAddress: string;
  };
  initialWishes: any[];
}

export const InvitationTemplateRenderer: React.FC<InvitationTemplateRendererProps> = ({
  invitationId,
  theme,
  guestName,
  activeSessionCode,
  bride,
  groom,
  eventDate,
  sessions,
  googleMapsUrl,
  musicUrl,
  storyTimeline,
  galleryPhotos,
  giftInfo,
  initialWishes,
}) => {
  const [isOpened, setIsOpened] = useState(false);

  return (
    <div
      className={`min-h-screen relative transition-colors duration-500 ${theme.typography.headingFont}`}
      style={{
        backgroundColor: theme.colors.background,
        color: theme.colors.text,
      }}
    >
      {/* 1. Interactive Wax Seal Envelope Cover */}
      {!isOpened && (
        <EnvelopeCover
          brideName={bride.name}
          groomName={groom.name}
          guestName={guestName}
          eventDate={eventDate}
          themePrimaryColor={theme.colors.primary}
          onOpen={() => setIsOpened(true)}
        />
      )}

      {/* 2. Floating Audio Controller */}
      <MusicPlayer audioUrl={musicUrl} autoPlayTriggered={isOpened} />

      {/* Theme Indicator Bar (Subtle top banner) */}
      <div className="w-full py-2 px-4 bg-black/5 text-center text-[11px] font-sans text-plum/70 border-b border-gold/20 flex items-center justify-center gap-2">
        <Sparkles className="w-3 h-3 text-gold-dark" />
        <span>
          Tema: <strong>{theme.title}</strong> ({theme.category}) • Kebumen Digital Invitation
        </span>
      </div>

      {/* Hero Section of Invitation */}
      <header className="pt-24 pb-16 px-4 text-center space-y-4 max-w-4xl mx-auto">
        <span className="text-xs uppercase tracking-widest text-gold-dark font-bold font-sans">
          The Wedding Celebration of
        </span>
        <h1 className="text-4xl sm:text-6xl font-bold tracking-tight text-plum">
          {bride.name} & {groom.name}
        </h1>
        <p className="text-xs uppercase tracking-widest text-plum-light font-sans font-medium">
          {new Date(eventDate).toLocaleDateString("id-ID", {
            weekday: "long",
            day: "numeric",
            month: "long",
            year: "numeric",
          })}
        </p>
      </header>

      {/* 3. Couple Section */}
      <CoupleSection bride={bride} groom={groom} />

      {/* 4. Event Schedule & Multi-Session */}
      <EventSchedule
        eventDate={eventDate}
        sessions={sessions}
        activeSessionCode={activeSessionCode}
        googleMapsUrl={googleMapsUrl}
      />

      {/* 5. Love Story Timeline */}
      <LoveStoryTimeline stories={storyTimeline} />

      {/* 6. Photo & Video Lightbox Gallery */}
      <PhotoGallery photos={galleryPhotos} />

      {/* 7. Digital Gift & Bank Account Copy */}
      <DigitalGiftModal
        banks={giftInfo.banks}
        physicalGiftAddress={giftInfo.physicalGiftAddress}
      />

      {/* 8. RSVP & Real-time Guestbook */}
      <RsvpGuestbookForm
        invitationId={invitationId}
        defaultGuestName={guestName !== "Bapak/Ibu/Saudara/i" ? guestName : ""}
        activeSessionCode={activeSessionCode}
        initialWishes={initialWishes}
      />

      {/* 9. Reception Desk QR Check-in */}
      <ReceptionQrCheckin guestName={guestName} sessionCode={activeSessionCode} />

      {/* Closing Quote */}
      <footer className="py-16 px-4 text-center space-y-3 border-t border-gold/20 mt-16 font-sans">
        <p className="text-xs text-plum-light">
          Merupakan suatu kehormatan dan kebahagiaan bagi kami sekeluarga apabila Bapak/Ibu/Saudara/i berkenan hadir dan memberikan doa restu.
        </p>
        <p className="font-serif-luxury text-xl font-bold text-plum">
          {bride.name} & {groom.name}
        </p>
        <div className="flex items-center justify-center gap-1 text-[11px] text-plum-light/70 pt-2">
          <span>Dibuat dengan cinta di Kebumen melalui HariKita</span>
          <Heart className="w-3 h-3 text-rose-500 fill-rose-500" />
        </div>
      </footer>
    </div>
  );
};
