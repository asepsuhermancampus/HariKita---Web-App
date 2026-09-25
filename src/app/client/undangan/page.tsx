"use client";

import React, { useState } from "react";
import {
  Plus,
  Search,
  Trash2,
  Filter,
} from "lucide-react";
import { Modal } from "@/components/harikita/ui";
import { DashPageHeader } from "@/components/dashboard";

interface Guest {
  id: string;
  name: string;
  category: string;
  pax: number;
  rsvp: "HADIR" | "RAGU" | "TIDAK_HADIR" | "BELUM_KONFIRMASI";
  sessions: string;
  sesiParam: string;
  phone?: string;
}

export default function ClientUndanganPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [rsvpFilter, setRsvpFilter] = useState("ALL");
  const [showAddModal, setShowAddModal] = useState(false);

  // Guest List State
  const [guests, setGuests] = useState<Guest[]>([]);

  // Form State
  const [newName, setNewName] = useState("");
  const [newCategory, setNewCategory] = useState("Sahabat");
  const [newPax, setNewPax] = useState(2);
  const [newSession, setNewSession] = useState("s1");

  // Dynamic KPI Calculations
  const totalPaxInvited = guests.reduce((acc, g) => acc + g.pax, 0);
  const totalHadirPax = guests
    .filter((g) => g.rsvp === "HADIR")
    .reduce((acc, g) => acc + g.pax, 0);
  const totalRaguCount = guests.filter((g) => g.rsvp === "RAGU" || g.rsvp === "BELUM_KONFIRMASI").length;

  const handleAddGuest = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName.trim()) return;

    const newGuestItem: Guest = {
      id: `g-${Date.now()}`,
      name: newName.trim(),
      category: newCategory,
      pax: Number(newPax) || 1,
      rsvp: "BELUM_KONFIRMASI",
      sessions: newSession === "s1" ? "Sesi 1 (Akad & Resepsi Pagi)" : "Sesi 2 (Resepsi Sore)",
      sesiParam: newSession,
    };

    setGuests([newGuestItem, ...guests]);
    setShowAddModal(false);
    setNewName("");
    setNewPax(2);
  };

  const handleDeleteGuest = (id: string) => {
    setGuests(guests.filter((g) => g.id !== id));
  };

  const filteredGuests = guests.filter((g) => {
    const matchSearch =
      g.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      g.category.toLowerCase().includes(searchTerm.toLowerCase());
    const matchRsvp = rsvpFilter === "ALL" || g.rsvp === rsvpFilter;
    return matchSearch && matchRsvp;
  });

  return (
    <div className="flex flex-col gap-6">
      <DashPageHeader
        title="Pengelola Undangan Digital & RSVP"
        description="Kelola daftar tamu, buat tautan personalisasi WhatsApp otomatis, dan pantau amplop digital QRIS."
        action={
          <div className="flex flex-wrap items-center gap-2.5">
            <span className="inline-flex min-h-11 items-center rounded-full border border-hk-champagne/60 bg-white px-4 text-xs font-semibold text-hk-charcoal/60">
              Web undangan belum diterbitkan
            </span>
            <button
              onClick={() => setShowAddModal(true)}
              className="focus-ring inline-flex min-h-11 cursor-pointer items-center gap-2 rounded-full bg-hk-taupe px-4 text-xs font-semibold text-white hover:bg-hk-charcoal"
            >
              <Plus className="w-3.5 h-3.5 text-hk-champagne" />
              <span>Tambah Tamu Baru</span>
            </button>
          </div>
        }
      />

      {/* Quick Stats Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-3xl border border-hk-champagne/40 shadow-xs text-center font-manrope">
          <span className="text-[11px] text-hk-charcoal/70 font-semibold uppercase tracking-wider block">Total Estimasi Tamu</span>
          <div className="font-editorial text-3xl font-bold text-hk-charcoal mt-1">
            {totalPaxInvited} Pax
          </div>
          <span className="text-[10px] text-hk-charcoal/60 mt-0.5 block">{guests.length} Undangan Tercatat</span>
        </div>

        <div className="bg-white p-5 rounded-3xl border border-hk-champagne/40 shadow-xs text-center font-manrope">
          <span className="text-[11px] text-emerald-800 font-semibold uppercase tracking-wider block">Konfirmasi Hadir</span>
          <div className="font-editorial text-3xl font-bold text-emerald-700 mt-1">
            {totalHadirPax} Pax
          </div>
          <span className="text-[10px] text-emerald-600 mt-0.5 block">Porsi Katering Terkunci</span>
        </div>

        <div className="bg-white p-5 rounded-3xl border border-hk-champagne/40 shadow-xs text-center font-manrope">
          <span className="text-[11px] text-amber-800 font-semibold uppercase tracking-wider block">Perlu Follow-up</span>
          <div className="font-editorial text-3xl font-bold text-amber-700 mt-1">
            {totalRaguCount} Tamu
          </div>
          <span className="text-[10px] text-amber-600 mt-0.5 block">Ragu / Belum Merespon</span>
        </div>

        <div className="bg-white p-5 rounded-3xl border border-hk-champagne/40 shadow-xs text-center font-manrope">
          <span className="text-[11px] text-hk-taupe font-semibold uppercase tracking-wider block">Amplop Digital QRIS</span>
          <div className="font-editorial text-3xl font-bold text-hk-charcoal mt-1">
            Rp 0
          </div>
          <span className="text-[10px] text-hk-charcoal/60 mt-0.5 block">Belum ada transaksi tercatat</span>
        </div>
      </div>

      {/* Search & Filter Bar */}
      <div className="bg-white p-4 rounded-3xl border border-hk-champagne/40 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-3 font-manrope">
        <div className="relative w-full sm:w-72">
          <Search className="w-4 h-4 text-hk-charcoal/60 absolute left-3.5 top-1/2 -translate-y-1/2" aria-hidden="true" />
          <label htmlFor="guest-search" className="sr-only">Cari nama tamu atau kategori</label>
          <input
            id="guest-search"
            type="search"
            placeholder="Cari nama tamu atau kategori..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-3 py-2.5 rounded-full border border-hk-champagne/60 text-xs focus:outline-none focus:border-hk-taupe focus-visible:ring-2 focus-visible:ring-hk-charcoal bg-hk-ivory/50"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <Filter className="w-3.5 h-3.5 text-hk-taupe" aria-hidden="true" />
          <label htmlFor="rsvp-filter" className="text-xs text-hk-charcoal/70">Filter RSVP:</label>
          <select
            id="rsvp-filter"
            value={rsvpFilter}
            onChange={(e) => setRsvpFilter(e.target.value)}
            className="text-xs py-2 px-3 rounded-full border border-hk-champagne/60 bg-hk-ivory/50 text-hk-charcoal focus:outline-none focus:border-hk-taupe focus-visible:ring-2 focus-visible:ring-hk-charcoal"
          >
            <option value="ALL">Semua Respon</option>
            <option value="HADIR">Hadir ({guests.filter((g) => g.rsvp === "HADIR").length})</option>
            <option value="RAGU">Ragu ({guests.filter((g) => g.rsvp === "RAGU").length})</option>
            <option value="BELUM_KONFIRMASI">Belum Konfirmasi ({guests.filter((g) => g.rsvp === "BELUM_KONFIRMASI").length})</option>
          </select>
        </div>
      </div>

      {/* Guest Table */}
      <div className="bg-white rounded-3xl border border-hk-champagne/40 shadow-xs p-6 sm:p-7 space-y-4 font-manrope">
        <div className="flex justify-between items-center border-b border-hk-soft-beige/60 pb-3">
          <div>
            <h3 className="font-editorial text-2xl font-normal text-hk-charcoal">
              Daftar Tamu &amp; Link Personalisasi ({filteredGuests.length})
            </h3>
            <p className="text-xs text-hk-charcoal/70 mt-0.5">
              Setiap tamu memiliki URL unik dengan ucapan selamat datang personal saat membuka wax seal 3D.
            </p>
          </div>
        </div>

        <div className="border border-hk-champagne/40 rounded-2xl overflow-hidden">
          <table className="w-full text-left text-xs border-collapse">
            <thead className="bg-hk-soft-beige/40 text-hk-charcoal font-semibold border-b border-hk-champagne/40">
              <tr>
                <th className="p-3.5">Nama Tamu &amp; Kategori</th>
                <th className="p-3.5 hidden sm:table-cell">Sesi Undangan</th>
                <th className="p-3.5 text-center">RSVP</th>
                <th className="p-3.5 text-right">Aksi Undangan WhatsApp</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-hk-champagne/20">
              {filteredGuests.length === 0 ? (
                <tr>
                  <td colSpan={4} className="p-6 text-center text-hk-charcoal/60 italic">
                    Tidak ada tamu yang cocok dengan pencarian.
                  </td>
                </tr>
              ) : (
                filteredGuests.map((guest) => (
                  <tr key={guest.id} className="hover:bg-hk-soft-beige/25 transition-colors">
                    <td className="p-3.5">
                      <div className="font-semibold text-hk-charcoal text-sm">{guest.name}</div>
                      <div className="text-[11px] text-hk-charcoal/70 mt-0.5">
                        {guest.category} • Estimasi <strong>{guest.pax} Pax</strong>
                      </div>
                    </td>
                    <td className="p-3.5 hidden sm:table-cell text-hk-charcoal/70">
                      <span className="px-2.5 py-1 rounded-full bg-hk-soft-beige/50 border border-hk-champagne/40 font-medium text-[11px]">
                        {guest.sessions}
                      </span>
                    </td>
                    <td className="p-3.5 text-center">
                      <span
                        className={`inline-block px-3 py-1 rounded-full text-[10px] font-bold ${
                          guest.rsvp === "HADIR"
                            ? "bg-emerald-100 text-emerald-800 border border-emerald-300"
                            : guest.rsvp === "RAGU"
                            ? "bg-amber-100 text-amber-800 border border-amber-300"
                            : "bg-hk-soft-beige/50 text-hk-charcoal/70 border border-hk-champagne/40"
                        }`}
                      >
                        {guest.rsvp === "HADIR"
                          ? "HADIR"
                          : guest.rsvp === "RAGU"
                          ? "MASIH RAGU"
                          : "BELUM RESPON"}
                      </span>
                    </td>
                    <td className="p-3.5 text-right space-x-1.5">
                      <span className="text-[11px] text-hk-charcoal/60">Terbitkan undangan untuk membagikan tautan.</span>

                      <button
                        onClick={() => handleDeleteGuest(guest.id)}
                        aria-label={`Hapus tamu ${guest.name}`}
                        className="focus-ring p-2 rounded-full text-red-600 hover:bg-red-50 text-[11px] transition-colors inline-flex items-center cursor-pointer"
                      >
                        <Trash2 className="w-4 h-4" aria-hidden="true" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal Tambah Tamu Baru */}
      <Modal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        title="Tambah Tamu Undangan Baru"
        size="md"
      >
        <form onSubmit={handleAddGuest} className="space-y-4 text-xs font-manrope">
          <div>
            <label htmlFor="guest-name" className="block text-hk-charcoal font-semibold mb-1">
              Nama Tamu / Keluarga:
            </label>
            <input
              id="guest-name"
              type="text"
              required
              placeholder="Contoh: Bpk. Bambang Pamungkas & Istri"
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              className="focus-ring w-full p-3 rounded-xl border border-hk-champagne/60 focus:outline-none focus:border-hk-taupe bg-hk-ivory/50"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label htmlFor="guest-category" className="block text-hk-charcoal font-semibold mb-1">
                Kategori Tamu:
              </label>
              <select
                id="guest-category"
                value={newCategory}
                onChange={(e) => setNewCategory(e.target.value)}
                className="focus-ring w-full p-3 rounded-xl border border-hk-champagne/60 focus:outline-none focus:border-hk-taupe bg-hk-ivory/50"
              >
                <option value="Keluarga Inti">Keluarga Inti</option>
                <option value="Keluarga Besar">Keluarga Besar</option>
                <option value="Sahabat">Sahabat</option>
                <option value="Rekan Kerja">Rekan Kerja</option>
                <option value="Tokoh Masyarakat">Tokoh Masyarakat</option>
              </select>
            </div>

            <div>
              <label htmlFor="guest-pax" className="block text-hk-charcoal font-semibold mb-1">
                Estimasi Pax:
              </label>
              <input
                id="guest-pax"
                type="number"
                min={1}
                max={20}
                value={newPax}
                onChange={(e) => setNewPax(parseInt(e.target.value, 10))}
                className="focus-ring w-full p-3 rounded-xl border border-hk-champagne/60 focus:outline-none focus:border-hk-taupe bg-hk-ivory/50"
              />
            </div>
          </div>

          <div>
            <label htmlFor="guest-session" className="block text-hk-charcoal font-semibold mb-1">
              Sesi Acara Undangan:
            </label>
            <select
              id="guest-session"
              value={newSession}
              onChange={(e) => setNewSession(e.target.value)}
              className="focus-ring w-full p-3 rounded-xl border border-hk-champagne/60 focus:outline-none focus:border-hk-taupe bg-hk-ivory/50"
            >
              <option value="s1">Sesi 1: Akad &amp; Resepsi Pagi (08:00 - 11:30 WIB)</option>
              <option value="s2">Sesi 2: Resepsi Sore &amp; Ramah Tamah (13:00 - 16:30 WIB)</option>
            </select>
          </div>

          <div className="pt-2 flex justify-end gap-2 border-t border-hk-champagne/30">
            <button
              type="button"
              onClick={() => setShowAddModal(false)}
              className="focus-ring px-4 py-2 rounded-full border border-hk-champagne/60 text-hk-charcoal hover:bg-hk-soft-beige/40 cursor-pointer min-h-[44px]"
            >
              Batal
            </button>
            <button
              type="submit"
              className="focus-ring px-5 py-2 rounded-full bg-hk-taupe text-white font-semibold hover:bg-[#78644e] transition-colors shadow-xs cursor-pointer min-h-[44px]"
            >
              Tambahkan ke Daftar
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
