"use client";

import React, { useState, useTransition } from "react";
import { Send, CheckCircle2, MessageSquareHeart, Users, CalendarCheck } from "lucide-react";
import { submitRsvpAction } from "@/server/actions/rsvp";

interface RsvpItem {
  id: string;
  guestName: string;
  attendance: string;
  paxCount: number;
  message: string;
  createdAt: string | Date;
}

interface RsvpGuestbookFormProps {
  invitationId: string;
  defaultGuestName?: string;
  activeSessionCode?: string;
  initialWishes?: RsvpItem[];
}

export const RsvpGuestbookForm: React.FC<RsvpGuestbookFormProps> = ({
  invitationId,
  defaultGuestName = "",
  activeSessionCode = "s1",
  initialWishes = [],
}) => {
  const [wishes, setWishes] = useState<RsvpItem[]>(initialWishes);
  const [guestName, setGuestName] = useState(defaultGuestName);
  const [attendance, setAttendance] = useState("hadir");
  const [paxCount, setPaxCount] = useState(1);
  const [message, setMessage] = useState("");
  const [isSuccess, setIsSuccess] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [isPending, startTransition] = useTransition();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage("");

    if (!guestName.trim() || !message.trim()) {
      setErrorMessage("Mohon isi nama dan ucapan doa Anda.");
      return;
    }

    const formData = new FormData();
    formData.append("invitationId", invitationId);
    formData.append("guestName", guestName);
    formData.append("attendance", attendance);
    formData.append("paxCount", paxCount.toString());
    formData.append("sessionCode", activeSessionCode);
    formData.append("message", message);

    startTransition(async () => {
      const res = await submitRsvpAction(formData);
      if (res.success && res.data) {
        setIsSuccess(true);
        setWishes([
          {
            id: res.data.id,
            guestName: res.data.guestName,
            attendance: res.data.attendance,
            paxCount: res.data.paxCount,
            message: res.data.message,
            createdAt: new Date().toISOString(),
          },
          ...wishes,
        ]);
        setMessage("");
      } else {
        setErrorMessage(res.error || "Terjadi kesalahan saat mengirim.");
      }
    });
  };

  return (
    <section className="py-20 px-4 max-w-4xl mx-auto space-y-12">
      <div className="text-center space-y-3">
        <span className="text-xs uppercase tracking-widest text-gold-dark font-bold">
          RSVP & Guestbook
        </span>
        <h2 className="font-serif-luxury text-3xl sm:text-4xl text-plum font-bold">
          Konfirmasi Kehadiran & Doa Restu
        </h2>
        <p className="text-xs text-plum-light font-medium max-w-md mx-auto">
          Mohon konfirmasikan kehadiran Bapak/Ibu/Saudara/i untuk membantu kelancaran persiapan acara kami.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Form Column */}
        <div className="lg:col-span-6 p-6 sm:p-8 rounded-3xl bg-white/85 backdrop-blur-sm border border-gold/30 shadow-lg space-y-5">
          <h3 className="font-serif-luxury text-xl font-bold text-plum flex items-center gap-2">
            <CalendarCheck className="w-5 h-5 text-gold-dark" />
            <span>Formulir Kehadiran</span>
          </h3>

          {isSuccess ? (
            <div className="p-6 rounded-2xl bg-emerald-50 border border-emerald-200 text-center space-y-3 animate-fadeIn">
              <CheckCircle2 className="w-10 h-10 text-emerald-600 mx-auto" />
              <h4 className="font-serif-luxury text-lg font-bold text-emerald-900">
                Terima Kasih Banyak!
              </h4>
              <p className="text-xs text-emerald-700">
                Konfirmasi dan ucapan doa restu Anda telah berhasil tersimpan dalam buku tamu kami.
              </p>
              <button
                onClick={() => setIsSuccess(false)}
                className="btn btn-xs btn-outline border-emerald-500 text-emerald-700 hover:bg-emerald-100 rounded-full"
              >
                Kirim Ucapan Lainnya
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              {errorMessage && (
                <div className="p-3 rounded-xl bg-rose-50 text-rose-700 text-xs border border-rose-200">
                  {errorMessage}
                </div>
              )}

              {/* Name input */}
              <div className="space-y-1">
                <label className="text-xs font-bold text-plum">Nama Lengkap</label>
                <input
                  type="text"
                  value={guestName}
                  onChange={(e) => setGuestName(e.target.value)}
                  placeholder="Contoh: Bapak Joko & Keluarga"
                  className="input input-sm w-full bg-[#FAF8F5] border border-gold/30 focus:border-gold rounded-xl text-plum"
                  required
                />
              </div>

              {/* Attendance Selection */}
              <div className="space-y-1">
                <label className="text-xs font-bold text-plum">Konfirmasi Kehadiran</label>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { id: "hadir", label: "Hadir" },
                    { id: "tidak_hadir", label: "Tidak Hadir" },
                    { id: "ragu", label: "Masih Ragu" },
                  ].map((item) => (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => setAttendance(item.id)}
                      className={`py-2 px-2 rounded-xl text-xs font-semibold border transition-all ${
                        attendance === item.id
                          ? "gold-gradient-bg text-plum-dark border-gold shadow-sm font-bold"
                          : "bg-[#FAF8F5] border-gold/20 text-plum-light hover:bg-gold/10"
                      }`}
                    >
                      {item.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Number of Pax */}
              {attendance === "hadir" && (
                <div className="space-y-1">
                  <label className="text-xs font-bold text-plum flex items-center justify-between">
                    <span>Jumlah Tamu yang Hadir</span>
                    <span className="text-gold-dark font-mono font-bold">{paxCount} Orang</span>
                  </label>
                  <input
                    type="range"
                    min="1"
                    max="5"
                    value={paxCount}
                    onChange={(e) => setPaxCount(parseInt(e.target.value, 10))}
                    className="range range-xs range-primary"
                  />
                  <div className="w-full flex justify-between text-[10px] text-plum-light/70 px-1">
                    <span>1</span>
                    <span>2</span>
                    <span>3</span>
                    <span>4</span>
                    <span>5</span>
                  </div>
                </div>
              )}

              {/* Wishes Message */}
              <div className="space-y-1">
                <label className="text-xs font-bold text-plum">Ucapan & Doa Restu</label>
                <textarea
                  rows={3}
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Tuliskan doa restu untuk kedua mempelai..."
                  className="textarea textarea-sm w-full bg-[#FAF8F5] border border-gold/30 focus:border-gold rounded-xl text-plum"
                  required
                />
              </div>

              <button
                type="submit"
                disabled={isPending}
                className="btn btn-sm w-full gold-gradient-bg text-plum-dark font-bold rounded-full border-none shadow-md hover:brightness-105"
              >
                {isPending ? (
                  <span className="loading loading-spinner loading-xs" />
                ) : (
                  <>
                    <Send className="w-3.5 h-3.5 mr-1" />
                    <span>Kirim Konfirmasi & Ucapan</span>
                  </>
                )}
              </button>
            </form>
          )}
        </div>

        {/* Guestbook Feed Column */}
        <div className="lg:col-span-6 p-6 sm:p-8 rounded-3xl bg-white/70 backdrop-blur-sm border border-gold/25 shadow-md space-y-4 max-h-[520px] flex flex-col">
          <div className="flex items-center justify-between border-b border-gold/20 pb-3">
            <h3 className="font-serif-luxury text-lg font-bold text-plum flex items-center gap-2">
              <MessageSquareHeart className="w-5 h-5 text-rose-500" />
              <span>Buku Tamu ({wishes.length})</span>
            </h3>
            <span className="text-[11px] text-plum-light font-medium">Doa & Restu</span>
          </div>

          <div className="overflow-y-auto space-y-3 flex-1 pr-1">
            {wishes.length === 0 ? (
              <p className="text-xs text-plum-light text-center py-8 italic">
                Belum ada ucapan. Jadilah yang pertama memberikan doa restu!
              </p>
            ) : (
              wishes.map((item) => (
                <div
                  key={item.id}
                  className="p-3.5 rounded-2xl bg-[#FAF8F5] border border-gold/20 space-y-1.5"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-serif-luxury text-xs font-bold text-plum">
                      {item.guestName}
                    </span>
                    <span
                      className={`text-[9px] uppercase tracking-wider font-bold px-2 py-0.5 rounded-full ${
                        item.attendance === "hadir"
                          ? "bg-emerald-100 text-emerald-800"
                          : item.attendance === "tidak_hadir"
                          ? "bg-rose-100 text-rose-800"
                          : "bg-amber-100 text-amber-800"
                      }`}
                    >
                      {item.attendance === "hadir"
                        ? `Hadir (${item.paxCount} Pax)`
                        : item.attendance === "tidak_hadir"
                        ? "Berhalangan"
                        : "Masih Ragu"}
                    </span>
                  </div>
                  <p className="text-xs text-plum/85 leading-relaxed italic">
                    &ldquo;{item.message}&rdquo;
                  </p>
                  <span className="text-[10px] text-plum-light/60 block text-right font-mono">
                    {new Date(item.createdAt).toLocaleDateString("id-ID", {
                      day: "numeric",
                      month: "short",
                    })}
                  </span>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </section>
  );
};
