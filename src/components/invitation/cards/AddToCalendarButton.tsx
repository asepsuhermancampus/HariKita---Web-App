"use client";

import React, { useState } from "react";
import { CalendarPlus, Calendar, Download, Check } from "lucide-react";
import { generateGoogleCalendarUrl, generateIcsContent } from "@/lib/invitation/calendar";

interface AddToCalendarButtonProps {
  title: string;
  description: string;
  location: string;
  startDate: string;
  endDate: string;
  primaryColor?: string;
  accentColor?: string;
}

export const AddToCalendarButton: React.FC<AddToCalendarButtonProps> = ({
  title,
  description,
  location,
  startDate,
  endDate,
  primaryColor = "#7D424D",
  accentColor = "#CCA873",
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [downloaded, setDownloaded] = useState(false);

  const eventDetails = { title, description, location, startDate, endDate };

  const handleDownloadIcs = () => {
    const icsContent = generateIcsContent(eventDetails);
    const blob = new Blob([icsContent], { type: "text/calendar;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", `${title.replace(/\s+/g, "_")}.ics`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    setDownloaded(true);
    setTimeout(() => {
      setDownloaded(false);
      setIsOpen(false);
    }, 2000);
  };

  const googleUrl = generateGoogleCalendarUrl(eventDetails);

  return (
    <div className="relative inline-block w-full">
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full inline-flex items-center justify-center gap-2 py-3 px-4 rounded-full text-xs font-bold uppercase tracking-wider transition-all shadow-md hover:scale-[1.01] min-h-[44px]"
        style={{
          backgroundColor: primaryColor,
          color: "#FFFFFF",
          border: `1px solid ${accentColor}`,
        }}
        title="Simpan Acara ke Kalender Ponsel"
      >
        <CalendarPlus className="w-4 h-4 text-amber-300 shrink-0" />
        <span>Simpan ke Kalender</span>
      </button>

      {isOpen && (
        <div className="absolute left-0 right-0 top-full mt-2 p-2 bg-slate-950/95 backdrop-blur-xl border border-amber-400/40 rounded-2xl shadow-2xl z-30 space-y-1.5 animate-in fade-in zoom-in-95 duration-200">
          <a
            href={googleUrl}
            target="_blank"
            rel="noopener noreferrer"
            onClick={() => setIsOpen(false)}
            className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs text-amber-100 hover:bg-amber-400/20 transition-colors w-full"
          >
            <Calendar className="w-3.5 h-3.5 text-amber-400 shrink-0" />
            <span>Google Calendar (Online)</span>
          </a>

          <button
            type="button"
            onClick={handleDownloadIcs}
            className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs text-amber-100 hover:bg-amber-400/20 transition-colors w-full text-left"
          >
            {downloaded ? (
              <>
                <Check className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                <span className="text-emerald-300">File .ics Tersimpan!</span>
              </>
            ) : (
              <>
                <Download className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                <span>Apple Calendar / Outlook (.ics)</span>
              </>
            )}
          </button>
        </div>
      )}
    </div>
  );
};
