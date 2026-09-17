"use client";

import React, { useState, useTransition } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import {
  Camera,
  Plus,
  Trash2,
  AlertTriangle,
  CheckCircle2,
  ShieldCheck,
  MapPin,
  Sparkles,
  ExternalLink,
  Heart,
  Tag,
} from "lucide-react";
import { detectOffPlatformContact } from "@/lib/content-guard";
import { usePortfolio, portfolioStore, PortfolioPost } from "@/lib/portfolio-store";
import { Modal } from "@/components/harikita/ui";
import {
  createPortfolioAction,
  deletePortfolioAction,
} from "@/server/actions/vendor";
import type { VendorPortfolioDTO } from "@/server/queries/vendor";

export function VendorPortofolioClient({
  dbPosts,
  vendorResolved,
  vendorSlug,
}: {
  dbPosts: VendorPortfolioDTO[];
  vendorResolved: boolean;
  vendorSlug: string;
}) {
  const router = useRouter();
  const currentVendorSlug = vendorSlug || "griya-busana-rarasati";
  const currentVendorName = "Griya Busana Rarasati";

  // Reactive posts from mock store (fallback)
  const mockPosts = usePortfolio();
  const allPosts: PortfolioPost[] = vendorResolved
    ? dbPosts.map((p) => ({
        id: p.id,
        vendorId: "",
        vendorSlug: currentVendorSlug,
        vendorName: currentVendorName,
        title: p.title,
        locationTag: p.locationTag,
        categoryTag: p.categoryTag,
        styleTags: p.styleTags,
        caption: p.caption,
        imageUrl: p.imageUrl,
        likes: p.likes,
        createdAt: p.createdAt,
      }))
    : mockPosts;

  const [isPending, startTransition] = useTransition();

  // Form State
  const [showAddModal, setShowAddModal] = useState(false);
  const [newTitle, setNewTitle] = useState("");
  const [newLocation, setNewLocation] = useState("Pantai Menganti, Ayah, Kebumen");
  const [newCategory, setNewCategory] = useState("Outdoor Pre-wedding");
  const [newStyleTag, setNewStyleTag] = useState("Sunset");
  const [newCaption, setNewCaption] = useState("");
  const [newImageUrl, setNewImageUrl] = useState("https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&w=800&q=80");
  const [errorMessage, setErrorMessage] = useState("");

  // Real-time Content Guard Check
  const guardResult = detectOffPlatformContact(newCaption + " " + newTitle);

  const handleAddItem = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage("");

    if (guardResult.isViolation) {
      setErrorMessage(guardResult.reason || "Konten melanggar aturan platform");
      return;
    }

    if (vendorResolved) {
      startTransition(async () => {
        const res = await createPortfolioAction({
          title: newTitle || "Karya Dokumentasi Pernikahan",
          locationTag: newLocation,
          categoryTag: newCategory,
          styleTags: [newStyleTag, "Kebumen"],
          caption: newCaption,
          imageUrl: newImageUrl,
        });
        if (res.success) {
          setShowAddModal(false);
          setNewTitle("");
          setNewCaption("");
          setErrorMessage("");
          router.refresh();
        } else {
          setErrorMessage(res.message || "Gagal menyimpan post");
        }
      });
      return;
    }

    const res = portfolioStore.addPost({
      vendorId: "v_busana_01",
      vendorSlug: currentVendorSlug,
      vendorName: currentVendorName,
      title: newTitle || "Karya Dokumentasi Pernikahan",
      locationTag: newLocation,
      categoryTag: newCategory,
      styleTags: [newStyleTag, "Kebumen"],
      caption: newCaption,
      imageUrl: newImageUrl,
    });

    if (res.success) {
      setShowAddModal(false);
      setNewTitle("");
      setNewCaption("");
      setErrorMessage("");
    } else {
      setErrorMessage(res.error || "Gagal menyimpan post");
    }
  };

  const handleDelete = (id: string) => {
    if (vendorResolved) {
      startTransition(async () => {
        const res = await deletePortfolioAction({ id });
        if (res.success) router.refresh();
        else setErrorMessage(res.message || "Gagal menghapus post");
      });
      return;
    }
    portfolioStore.deletePost(id);
  };

  const handleLike = (id: string) => {
    if (!vendorResolved) portfolioStore.likePost(id);
  };

  return (
    <div className="min-h-screen bg-[#FAF8F5] text-[#4A2E35] py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-5xl mx-auto space-y-6">
        {/* Header Breadcrumb */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <div className="text-xs text-[#6B5E62] flex items-center gap-1 mb-1">
              <Link href="/dashboard/vendor" className="hover:text-[#4A2E35]">
                Portal Mitra Vendor
              </Link>
              <span>/</span>
              <span className="text-[#4A2E35] font-medium">Portofolio Feed</span>
            </div>
            <h1 className="font-serif text-2xl sm:text-3xl font-bold text-[#4A2E35]">
              Pengelola Portofolio Feed
            </h1>
            <p className="text-xs text-[#6B5E62] mt-0.5">
              Unggah karya foto/video pernikahan Anda. Ditampilkan langsung di profil publik dan direktori calon pengantin.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <Link
              href={`/vendor/${currentVendorSlug}`}
              target="_blank"
              className="px-3.5 py-2 rounded-xl bg-white border border-[#C5A880] text-[#4A2E35] text-xs font-semibold hover:bg-[#FAF8F5] transition-colors flex items-center gap-1.5 shadow-2xs"
            >
              <ExternalLink className="w-3.5 h-3.5 text-[#C5A880]" />
              Lihat Profil Publik
            </Link>
            <button
              onClick={() => setShowAddModal(true)}
              className="px-3.5 py-2 rounded-xl bg-[#4A2E35] text-white text-xs font-semibold hover:bg-[#6B5E62] transition-colors flex items-center gap-1.5 shadow-sm"
            >
              <Plus className="w-3.5 h-3.5 text-[#C5A880]" />
              Unggah Karya Baru
            </button>
          </div>
        </div>

        {/* Anti-Disintermediation Policy Banner */}
        <div className="p-4 rounded-2xl bg-white border border-[#C5A880]/30 shadow-sm flex items-start gap-3">
          <ShieldCheck className="w-5 h-5 text-[#C5A880] shrink-0 mt-0.5" />
          <div className="text-xs text-[#6B5E62] leading-relaxed">
            <strong className="text-[#4A2E35] block font-medium">Standar Keamanan Transaksi Platform HariKita:</strong>
            Untuk melindungi rekening bersama (escrow) dan jaminan pembayaran Anda, sistem secara otomatis
            memeriksa deskripsi portofolio dari pencantuman nomor telepon/WhatsApp, rekening luar, atau link bypass.
          </div>
        </div>

        {/* Portfolio Gallery Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-5">
          {allPosts.map((item) => (
            <div
              key={item.id}
              className="bg-white rounded-2xl border border-[#C5A880]/30 overflow-hidden shadow-sm hover:border-[#C5A880] transition-all flex flex-col justify-between group"
            >
              <div className="relative aspect-4/3 w-full bg-[#FAF8F5] overflow-hidden">
                <Image
                  src={item.imageUrl}
                  alt={item.title}
                  fill
                  className="object-cover group-hover:scale-105 transition-transform duration-300"
                />
                <span className="absolute top-2 left-2 px-2 py-0.5 rounded-full bg-black/60 backdrop-blur-sm text-white text-[10px] font-medium">
                  {item.categoryTag}
                </span>
                <button
                  onClick={() => handleDelete(item.id)}
                  aria-label={`Hapus karya portofolio ${item.title}`}
                  className="focus-ring absolute top-2 right-2 p-2 rounded-full bg-red-600/90 hover:bg-red-700 text-white transition-colors opacity-0 group-hover:opacity-100 focus-visible:opacity-100 shadow-sm"
                >
                  <Trash2 className="w-4 h-4" aria-hidden="true" />
                </button>
              </div>

              <div className="p-4 space-y-2 flex-1 flex flex-col justify-between">
                <div>
                  <h4 className="font-serif text-sm font-bold text-[#4A2E35] line-clamp-1">
                    {item.title}
                  </h4>
                  <div className="flex items-center gap-1 text-[11px] text-[#6B5E62] mt-0.5">
                    <MapPin className="w-3 h-3 text-[#C5A880] shrink-0" />
                    <span className="truncate">{item.locationTag}</span>
                  </div>
                  <p className="text-xs text-[#6B5E62] mt-2 line-clamp-2 leading-relaxed">
                    {item.caption}
                  </p>

                  <div className="flex flex-wrap gap-1 mt-2">
                    {item.styleTags.map((t, idx) => (
                      <span
                        key={idx}
                        className="text-[10px] px-2 py-0.5 rounded-full bg-[#FAF8F5] text-[#4A2E35] border border-[#E5D7C7]"
                      >
                        #{t}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="pt-3 border-t border-[#FAF8F5] flex items-center justify-between text-[11px] text-[#6B5E62]">
                  <button
                    onClick={() => handleLike(item.id)}
                    aria-label={`Sukai karya ${item.title}, saat ini ${item.likes} suka`}
                    className="focus-ring flex items-center gap-1 text-[#4A2E35] hover:text-red-600 transition-colors font-semibold p-1 rounded"
                  >
                    <Heart className="w-3.5 h-3.5 fill-red-500 text-red-500" aria-hidden="true" />
                    <span>{item.likes}</span>
                  </button>
                  <span className="text-emerald-700 font-semibold">Aktif di Feed</span>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Modal Unggah Karya Baru */}
        <Modal
          isOpen={showAddModal}
          onClose={() => setShowAddModal(false)}
          title="Unggah Karya Portofolio Baru"
          size="lg"
        >
          {errorMessage && (
            <div
              role="alert"
              className="mb-3 p-2.5 rounded-xl bg-red-50 border border-red-200 text-red-800 text-xs flex items-start gap-1.5"
            >
              <AlertTriangle className="w-4 h-4 shrink-0 text-red-600 mt-0.5" aria-hidden="true" />
              <span>{errorMessage}</span>
            </div>
          )}

          <form onSubmit={handleAddItem} className="space-y-3 text-xs">
            <div>
              <label htmlFor="portfolio-title" className="block text-[#4A2E35] font-semibold mb-1">
                Judul Karya / Sesi:
              </label>
              <input
                id="portfolio-title"
                type="text"
                value={newTitle}
                onChange={(e) => setNewTitle(e.target.value)}
                placeholder="Contoh: Sesi Sunset Romantis Tebing Menganti"
                required
                className="focus-ring w-full p-2.5 rounded-xl border border-[#E5D7C7] focus:outline-none focus:border-[#C5A880]"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label htmlFor="portfolio-location" className="block text-[#4A2E35] font-semibold mb-1">
                  Lokasi di Kebumen:
                </label>
                <select
                  id="portfolio-location"
                  value={newLocation}
                  onChange={(e) => setNewLocation(e.target.value)}
                  className="focus-ring w-full p-2.5 rounded-xl border border-[#E5D7C7] focus:outline-none focus:border-[#C5A880]"
                >
                  <option value="Pantai Menganti, Ayah, Kebumen">Pantai Menganti, Ayah</option>
                  <option value="Bukit Hud, Karangbolong, Kebumen">Bukit Hud, Karangbolong</option>
                  <option value="Pendopo Ronggowarsito, Kebumen Kota">Pendopo Ronggowarsito</option>
                  <option value="Hotel Mexolie, Kebumen Kota">Hotel Mexolie Kebumen</option>
                  <option value="Jembangan Natural Park, Poncowarno">Jembangan Natural Park</option>
                  <option value="Goa Jatijajar, Ayah">Goa Jatijajar, Ayah</option>
                  <option value="Gombong, Kebumen">Kecamatan Gombong</option>
                  <option value="Kutowinangun, Kebumen">Kecamatan Kutowinangun</option>
                </select>
              </div>

              <div>
                <label htmlFor="portfolio-category" className="block text-[#4A2E35] font-semibold mb-1">
                  Kategori Layanan:
                </label>
                <select
                  id="portfolio-category"
                  value={newCategory}
                  onChange={(e) => setNewCategory(e.target.value)}
                  className="focus-ring w-full p-2.5 rounded-xl border border-[#E5D7C7] focus:outline-none focus:border-[#C5A880]"
                >
                  <option value="Outdoor Pre-wedding">Outdoor Pre-wedding</option>
                  <option value="Busana Pengantin & Fitting">Busana &amp; Fitting</option>
                  <option value="Makeup Artist (MUA)">Makeup Artist (MUA)</option>
                  <option value="Dokumentasi Hari H">Dokumentasi Hari H</option>
                  <option value="Dekorasi & Florist">Dekorasi &amp; Florist</option>
                </select>
              </div>
            </div>

            <div>
              <label htmlFor="portfolio-image" className="block text-[#4A2E35] font-semibold mb-1">
                URL Gambar Portofolio:
              </label>
              <input
                id="portfolio-image"
                type="url"
                value={newImageUrl}
                onChange={(e) => setNewImageUrl(e.target.value)}
                required
                className="focus-ring w-full p-2.5 rounded-xl border border-[#E5D7C7] focus:outline-none focus:border-[#C5A880]"
              />
            </div>

            <div>
              <label htmlFor="portfolio-caption" className="block text-[#4A2E35] font-semibold mb-1">
                Caption / Cerita Momen:
              </label>
              <textarea
                id="portfolio-caption"
                rows={3}
                value={newCaption}
                onChange={(e) => setNewCaption(e.target.value)}
                placeholder="Tuliskan cerita singkat estetika acara..."
                required
                className="focus-ring w-full p-2.5 rounded-xl border border-[#E5D7C7] focus:outline-none focus:border-[#C5A880]"
              />

              {/* Real-time Content Guard Feedback */}
              {guardResult.isViolation ? (
                <div role="alert" className="mt-1.5 p-2 rounded-lg bg-red-50 border border-red-200 text-red-800 text-[11px] flex items-start gap-1.5">
                  <AlertTriangle className="w-3.5 h-3.5 shrink-0 mt-0.5 text-red-600" aria-hidden="true" />
                  <span>{guardResult.reason}. Harap hapus nomor telepon atau kontak langsung demi perlindungan rekening bersama.</span>
                </div>
              ) : (
                <span className="text-[10px] text-emerald-700 block mt-1">
                  ✓ Lolos sensor kepatuhan platform HariKita.
                </span>
              )}
            </div>

            <div className="pt-2 flex justify-end gap-2 border-t border-[#E5D7C7]">
              <button
                type="button"
                onClick={() => setShowAddModal(false)}
                className="focus-ring px-4 py-2 rounded-xl border border-[#E5D7C7] text-[#6B5E62] hover:bg-[#FAF8F5] min-h-[44px]"
              >
                Batal
              </button>
              <button
                type="submit"
                disabled={guardResult.isViolation || isPending}
                aria-busy={isPending}
                className="focus-ring px-4 py-2 rounded-xl bg-[#4A2E35] text-white font-semibold hover:bg-[#6B5E62] transition-colors disabled:opacity-40 min-h-[44px]"
              >
                {isPending ? "Menyimpan..." : "Publikasikan Karya"}
              </button>
            </div>
          </form>
        </Modal>
      </div>
    </div>
  );
}
