"use client";

import React, { useState, useEffect } from "react";
import { Calendar, Clock, MapPin, ExternalLink, CalendarPlus } from "lucide-react";

interface SessionData {
  sessionCode: "s1" | "s2" | "s3";
  title: string;
  timeSlot: string;
  venueName: string;
  venueAddress: string;
}

interface EventScheduleProps {
  eventDate: string;
  sessions: {
    s1: SessionData;
    s2: SessionData;
    s3?: SessionData;
  };
  activeSessionCode?: "s1" | "s2" | "s3";
  googleMapsUrl: string;
}

export const EventSchedule: React.FC<EventScheduleProps> = ({
  eventDate,
  sessions,
  activeSessionCode,
  googleMapsUrl,
}) => {
  // Countdown Logic
  const [timeLeft, setTimeLeft] = useState({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0,
  });

  useEffect(() => {
    const target = new Date(eventDate).getTime();

    const updateCountdown = () => {
      const now = new Date().getTime();
      const diff = target - now;

      if (diff > 0) {
        setTimeLeft({
          days: Math.floor(diff / (1000 * 60 * 60 * 24)),
          hours: Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
          minutes: Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60)),
          seconds: Math.floor((diff % (1000 * 60)) / 1000),
        });
      }
    };

    updateCountdown();
    const interval = setInterval(updateCountdown, 1000);
    return () => clearInterval(interval);
  }, [eventDate]);

  // Determine sessions to display
  const sessionList: SessionData[] = [];
  if (activeSessionCode === "s1") {
    sessionList.push(sessions.s1);
  } else if (activeSessionCode === "s2") {
    sessionList.push(sessions.s2);
  } else if (activeSessionCode === "s3" && sessions.s3) {
    sessionList.push(sessions.s3);
  } else {
    // Default: show both S1 and S2
    sessionList.push(sessions.s1);
    sessionList.push(sessions.s2);
    if (sessions.s3) sessionList.push(sessions.s3);
  }

  // Google Calendar Intent Link
  const googleCalendarUrl = `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent(
    "Pernikahan Bahagia"
  )}&dates=${new Date(eventDate).toISOString().replace(/-|:|\.\d\d\d/g, "")}/${new Date(
    eventDate
  ).toISOString().replace(/-|:|\.\d\d\d/g, "")}&details=${encodeURIComponent(
    "Menghadiri hari bahagia pernikahan di Kebumen"
  )}&location=${encodeURIComponent(sessions.s1.venueName)}`;

  return (
    <section className="py-20 px-4 max-w-5xl mx-auto space-y-16 text-center">
      {/* Title */}
      <div className="space-y-3">
        <span className="text-xs uppercase tracking-widest text-gold-dark font-bold">
          Save The Date
        </span>
        <h2 className="font-serif-luxury text-3xl sm:text-4xl text-plum font-bold">
          Waktu & Lokasi Acara
        </h2>
        <p className="text-xs text-plum-light font-medium">
          Merupakan suatu kehormatan dan kebahagiaan bagi kami atas kehadiran Bapak/Ibu/Saudara/i
        </p>
      </div>

      {/* Countdown Clock */}
      <div className="grid grid-cols-4 gap-3 max-w-md mx-auto">
        {[
          { label: "Hari", value: timeLeft.days },
          { label: "Jam", value: timeLeft.hours },
          { label: "Menit", value: timeLeft.minutes },
          { label: "Detik", value: timeLeft.seconds },
        ].map((item, idx) => (
          <div
            key={idx}
            className="p-4 rounded-2xl bg-white/80 border border-gold/30 shadow-sm flex flex-col items-center"
          >
            <span className="font-serif-luxury text-2xl sm:text-3xl font-bold text-plum">
              {item.value}
            </span>
            <span className="text-[10px] uppercase tracking-wider text-plum-light font-semibold mt-1">
              {item.label}
            </span>
          </div>
        ))}
      </div>

      {/* Add to Calendar Button */}
      <div>
        <a
          href={googleCalendarUrl}
          target="_blank"
          rel="noreferrer"
          className="inline-flex items-center gap-2 px-6 py-2.5 rounded-full border border-gold/40 text-xs font-bold text-plum hover:bg-gold/15 transition-colors"
        >
          <CalendarPlus className="w-4 h-4 text-gold-dark" />
          <span>Simpan ke Google Calendar</span>
        </a>
      </div>

      {/* Sessions Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
        {sessionList.map((session, idx) => (
          <div
            key={idx}
            className="p-8 rounded-3xl bg-white/80 border border-gold/30 shadow-md text-center space-y-6 flex flex-col justify-between"
          >
            <div className="space-y-4">
              <div className="inline-block px-4 py-1 rounded-full bg-gold/15 text-xs font-bold text-gold-dark border border-gold/30 uppercase tracking-wider">
                {session.title}
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-center gap-2 text-sm text-plum font-semibold">
                  <Calendar className="w-4 h-4 text-gold" />
                  <span>
                    {new Date(eventDate).toLocaleDateString("id-ID", {
                      weekday: "long",
                      day: "numeric",
                      month: "long",
                      year: "numeric",
                    })}
                  </span>
                </div>
                <div className="flex items-center justify-center gap-2 text-sm text-plum font-semibold">
                  <Clock className="w-4 h-4 text-gold" />
                  <span>{session.timeSlot}</span>
                </div>
              </div>

              <div className="pt-2 space-y-1">
                <h4 className="font-serif-luxury text-xl font-bold text-plum">
                  {session.venueName}
                </h4>
                <p className="text-xs text-plum-light leading-relaxed max-w-xs mx-auto">
                  {session.venueAddress}
                </p>
              </div>
            </div>

            <div className="pt-4">
              <a
                href={googleMapsUrl}
                target="_blank"
                rel="noreferrer"
                className="btn btn-sm w-full gold-gradient-bg text-plum-dark font-bold rounded-full border-none shadow-sm hover:brightness-105"
              >
                <MapPin className="w-4 h-4 mr-1 text-plum-dark" />
                <span>Petunjuk Arah Google Maps</span>
              </a>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};
