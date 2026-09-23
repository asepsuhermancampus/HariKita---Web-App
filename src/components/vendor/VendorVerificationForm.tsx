"use client";

import React, { useState, useTransition, useRef } from "react";
import dynamic from "next/dynamic";
import {
  Store,
  User,
  MapPin,
  Wallet,
  Upload,
  FileCheck2,
  CheckCircle2,
  AlertCircle,
  Loader2,
  Send,
} from "lucide-react";
import { DashCard, DashButton, DashBadge } from "@/components/dashboard";
import {
  saveVendorVerificationAction,
  submitVendorVerificationAction,
  type VendorProfileData,
} from "@/server/actions/vendor-profile";
import { lookupPostalCode } from "@/lib/geo/postal-codes";
import { KEBUMEN_DISTRICTS } from "@/data/multi-vendor-catalog";

const LocationPickerMap = dynamic(
  () => import("@/components/maps/LocationPickerMap").then((m) => m.LocationPickerMap),
  { ssr: false, loading: () => <div className="h-[280px] rounded-2xl bg-hk-ivory" /> }
);

const CATEGORIES = [
  "Pre-wedding",
  "Busana Pengantin & Fitting",
  "Makeup Artist (MUA & Hair/Hijab)",
  "Kotak Seserahan & Mahar",
  "Dokumentasi Foto-Video",
  "Dekorasi & Florist",
  "Katering & Food Stalls",
  "Kue Acara & Dessert",
  "Souvenir & Wedding Favors",
  "Undangan Digital & Cetak",
  "Cute Illustrated Maps",
];

export function VendorVerificationForm({ data }: { data: VendorProfileData }) {
  const [pending, startTransition] = useTransition();
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null);

  const [businessName, setBusinessName] = useState(data.businessName);
  const [category, setCategory] = useState(data.category);
  const [picName, setPicName] = useState(data.picName);
  const [phone, setPhone] = useState(data.phone);
  const [ktpNumber, setKtpNumber] = useState(data.ktpNumber ?? "");
  const [revenueMethod, setRevenueMethod] = useState(data.revenueMethod ?? "BANK");
  const [ewalletProvider, setEwalletProvider] = useState(data.ewalletProvider ?? "");
  const [bankName, setBankName] = useState(data.bankName);
  const [bankAccount, setBankAccount] = useState(data.bankAccount);
  const [bankHolder, setBankHolder] = useState(data.bankHolder);

  const [address, setAddress] = useState(data.address);
  const [rt, setRt] = useState(data.rt ?? "");
  const [rw, setRw] = useState(data.rw ?? "");
  const [dusun, setDusun] = useState(data.dusun ?? "");
  const [desa, setDesa] = useState(data.desa ?? "");
  const [kecamatan, setKecamatan] = useState(data.kecamatan ?? data.district ?? "Kebumen");
  const [postalCode, setPostalCode] = useState(data.postalCode ?? "");
  const [coords, setCoords] = useState<{ lat: number; lng: number } | null>(
    typeof data.latitude === "number" && typeof data.longitude === "number"
      ? { lat: data.latitude, lng: data.longitude }
      : null
  );

  const [ktpPhotoUrl, setKtpPhotoUrl] = useState(data.ktpPhotoUrl ?? "");
  const [businessPhotoUrl, setBusinessPhotoUrl] = useState(data.businessPhotoUrl ?? "");

  const formRef = useRef<HTMLFormElement>(null);

  function onKecamatanChange(v: string) {
    setKecamatan(v);
    const pc = lookupPostalCode(desa, v);
    if (pc) setPostalCode(pc);
  }
  function onDesaChange(v: string) {
    setDesa(v);
    const pc = lookupPostalCode(v, kecamatan);
    if (pc) setPostalCode(pc);
  }

  async function uploadFile(file: File, kind: "ktp" | "business") {
    setMsg(null);
    const fd = new FormData();
    fd.append("file", file);
    fd.append("kind", kind);
    const res = await fetch("/api/upload/vendor-doc", { method: "POST", body: fd });
    const json = await res.json();
    if (!res.ok) {
      setMsg({ ok: false, text: json.error ?? "Gagal upload." });
      return;
    }
    if (kind === "ktp") setKtpPhotoUrl(json.url);
    else setBusinessPhotoUrl(json.url);
    setMsg({ ok: true, text: "Dokumen terunggah. Klik Simpan lalu Ajukan Verifikasi." });
  }

  async function save() {
    setMsg(null);
    const fd = new FormData();
    fd.set("businessName", businessName);
    fd.set("category", category);
    fd.set("picName", picName);
    fd.set("ktpNumber", ktpNumber);
    fd.set("revenueMethod", revenueMethod);
    fd.set("ewalletProvider", ewalletProvider);
    fd.set("bankName", bankName);
    fd.set("bankAccount", bankAccount);
    fd.set("bankHolder", bankHolder);
    fd.set("address", address);
    fd.set("rt", rt);
    fd.set("rw", rw);
    fd.set("dusun", dusun);
    fd.set("desa", desa);
    fd.set("kecamatan", kecamatan);
    fd.set("postalCode", postalCode);
    if (coords) {
      fd.set("latitude", String(coords.lat));
      fd.set("longitude", String(coords.lng));
    }
    fd.set("ktpPhotoUrl", ktpPhotoUrl);
    fd.set("businessPhotoUrl", businessPhotoUrl);
    startTransition(async () => {
      const res = await saveVendorVerificationAction(fd);
      setMsg({ ok: res.success, text: res.message ?? res.error ?? "" });
    });
  }

  function submit() {
    setMsg(null);
    startTransition(async () => {
      const res = await submitVendorVerificationAction();
      setMsg({ ok: res.success, text: res.message ?? res.error ?? "" });
    });
  }

  const statusTone =
    data.verificationStatus === "APPROVED"
      ? "ok"
      : data.verificationStatus === "REJECTED"
        ? "error"
        : "warn";

  return (
    <DashCard
      title="Data Usaha & Verifikasi Mitra"
      description="Lengkapi data usaha, dokumen, dan titik lokasi. Setelah diajukan, admin akan memverifikasi."
      action={
        <DashBadge tone={statusTone as "ok" | "warn" | "error"}>
          {data.verificationStatus === "APPROVED"
            ? "Terverifikasi"
            : data.verificationStatus === "REJECTED"
              ? "Ditolak"
              : "Menunggu Verifikasi"}
        </DashBadge>
      }
    >
      {data.verificationStatus === "REJECTED" && data.verificationNote && (
        <div className="mb-4 rounded-xl border border-[#f3c9c6] bg-[#fdeceb] p-3 text-xs text-[#8f2b25]">
          <b>Alasan penolakan:</b> {data.verificationNote}
        </div>
      )}

      <form ref={formRef} onSubmit={(e) => e.preventDefault()} className="flex flex-col gap-6">
        {/* Info Usaha */}
        <section className="space-y-3">
          <h4 className="flex items-center gap-2 text-sm font-bold text-hk-charcoal">
            <Store className="h-4 w-4 text-hk-taupe" /> Info Usaha
          </h4>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <Field label="Nama Usaha">
              <input className={inputCls} value={businessName} onChange={(e) => setBusinessName(e.target.value)} />
            </Field>
            <Field label="Kategori">
              <select className={inputCls} value={category} onChange={(e) => setCategory(e.target.value)}>
                {CATEGORIES.map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </Field>
            <Field label="Nama Pemilik / PIC">
              <input className={inputCls} value={picName} onChange={(e) => setPicName(e.target.value)} />
            </Field>
            <Field label="No WhatsApp">
              <input className={inputCls} value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="08xxxxxxxxxx" />
            </Field>
          </div>
        </section>

        {/* Data Pemilik / KTP */}
        <section className="space-y-3 border-t border-hk-soft-beige pt-4">
          <h4 className="flex items-center gap-2 text-sm font-bold text-hk-charcoal">
            <User className="h-4 w-4 text-hk-taupe" /> Data Pemilik & KTP
          </h4>
          <Field label="Nomor KTP (sesuai KTP)">
            <input className={inputCls} value={ktpNumber} onChange={(e) => setKtpNumber(e.target.value)} placeholder="16 digit" />
          </Field>
          <FileUpload
            label="Foto KTP"
            current={ktpPhotoUrl}
            onPick={(f) => uploadFile(f, "ktp")}
          />
        </section>

        {/* Alamat + Peta */}
        <section className="space-y-3 border-t border-hk-soft-beige pt-4">
          <h4 className="flex items-center gap-2 text-sm font-bold text-hk-charcoal">
            <MapPin className="h-4 w-4 text-hk-taupe" /> Alamat & Titik Lokasi
          </h4>
          <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
            <div className="space-y-3">
              <Field label="Alamat Jalan / Detail">
                <input className={inputCls} value={address} onChange={(e) => setAddress(e.target.value)} placeholder="Jl. / Gang / No." />
              </Field>
              <div className="grid grid-cols-2 gap-3">
                <Field label="RT"><input className={inputCls} value={rt} onChange={(e) => setRt(e.target.value)} /></Field>
                <Field label="RW"><input className={inputCls} value={rw} onChange={(e) => setRw(e.target.value)} /></Field>
              </div>
              <Field label="Dusun"><input className={inputCls} value={dusun} onChange={(e) => setDusun(e.target.value)} /></Field>
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <Field label="Desa / Kelurahan">
                  <input className={inputCls} value={desa} onChange={(e) => onDesaChange(e.target.value)} />
                </Field>
                <Field label="Kecamatan">
                  <select className={inputCls} value={kecamatan} onChange={(e) => onKecamatanChange(e.target.value)}>
                    {KEBUMEN_DISTRICTS.map((d) => (
                      <option key={d} value={d}>{d}</option>
                    ))}
                  </select>
                </Field>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <Field label="Kabupaten"><input className={inputCls} value="Kebumen" readOnly /></Field>
                <Field label="Kode Pos (otomatis)">
                  <input className={inputCls} value={postalCode} onChange={(e) => setPostalCode(e.target.value)} placeholder="otomatis / isi manual" />
                </Field>
              </div>
            </div>
            <div className="space-y-2">
              <div className="text-xs font-semibold text-hk-charcoal">Titik Lokasi di Peta</div>
              <LocationPickerMap value={coords} onChange={setCoords} />
              <p className="text-[11px] text-hk-taupe">
                {coords ? `Koordinat: ${coords.lat.toFixed(5)}, ${coords.lng.toFixed(5)}` : "Klik peta untuk menandai lokasi usaha."}
              </p>
            </div>
          </div>
        </section>

        {/* Rekening */}
        <section className="space-y-3 border-t border-hk-soft-beige pt-4">
          <h4 className="flex items-center gap-2 text-sm font-bold text-hk-charcoal">
            <Wallet className="h-4 w-4 text-hk-taupe" /> Rekening Pencairan
          </h4>
          <Field label="Jenis Rekening">
            <select className={inputCls} value={revenueMethod} onChange={(e) => setRevenueMethod(e.target.value)}>
              <option value="BANK">Bank</option>
              <option value="EWALLET">E-Wallet</option>
            </select>
          </Field>
          {revenueMethod === "EWALLET" ? (
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
              <Field label="Provider">
                <select className={inputCls} value={ewalletProvider} onChange={(e) => setEwalletProvider(e.target.value)}>
                  <option value="">Pilih</option>
                  {["DANA", "OVO", "GoPay", "ShopeePay"].map((p) => (
                    <option key={p} value={p}>{p}</option>
                  ))}
                </select>
              </Field>
              <Field label="No E-Wallet"><input className={inputCls} value={bankAccount} onChange={(e) => setBankAccount(e.target.value)} /></Field>
              <Field label="Nama Pemilik"><input className={inputCls} value={bankHolder} onChange={(e) => setBankHolder(e.target.value)} /></Field>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
              <Field label="Nama Bank"><input className={inputCls} value={bankName} onChange={(e) => setBankName(e.target.value)} /></Field>
              <Field label="No Rekening"><input className={inputCls} value={bankAccount} onChange={(e) => setBankAccount(e.target.value)} /></Field>
              <Field label="Nama Pemilik"><input className={inputCls} value={bankHolder} onChange={(e) => setBankHolder(e.target.value)} /></Field>
            </div>
          )}
        </section>

        {/* Dokumen Usaha */}
        <section className="space-y-3 border-t border-hk-soft-beige pt-4">
          <h4 className="flex items-center gap-2 text-sm font-bold text-hk-charcoal">
            <FileCheck2 className="h-4 w-4 text-hk-taupe" /> Foto Usaha
          </h4>
          <FileUpload label="Foto Tempat Usaha" current={businessPhotoUrl} onPick={(f) => uploadFile(f, "business")} />
        </section>

        {msg && (
          <div
            role="status"
            className={`flex items-start gap-2 rounded-xl border p-3 text-xs ${
              msg.ok ? "border-[#bfe6d1] bg-[#e5f4ec] text-[#157a4d]" : "border-[#f3c9c6] bg-[#fdeceb] text-[#8f2b25]"
            }`}
          >
            {msg.ok ? <CheckCircle2 className="h-4 w-4 shrink-0" /> : <AlertCircle className="h-4 w-4 shrink-0" />}
            <span>{msg.text}</span>
          </div>
        )}

        <div className="flex flex-wrap justify-end gap-3 border-t border-hk-soft-beige pt-4">
          <DashButton variant="secondary" onClick={save} disabled={pending}>
            {pending ? <Loader2 className="h-4 w-4 animate-spin" /> : null} Simpan Draf
          </DashButton>
          <DashButton variant="primary" onClick={submit} disabled={pending}>
            <Send className="h-4 w-4" /> Ajukan Verifikasi
          </DashButton>
        </div>
      </form>
    </DashCard>
  );
}

const inputCls =
  "focus-ring min-h-11 w-full rounded-xl border border-hk-soft-beige px-3.5 text-sm text-hk-charcoal read-only:bg-hk-ivory";

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="mb-1 block text-xs font-semibold text-hk-charcoal">{label}</span>
      {children}
    </label>
  );
}

function FileUpload({
  label,
  current,
  onPick,
}: {
  label: string;
  current: string;
  onPick: (f: File) => void;
}) {
  return (
    <div className="flex flex-wrap items-center gap-3">
      <label className="focus-ring inline-flex min-h-11 cursor-pointer items-center gap-2 rounded-xl border border-hk-soft-beige bg-white px-4 text-xs font-semibold text-hk-charcoal hover:bg-hk-ivory">
        <Upload className="h-4 w-4 text-hk-taupe" />
        {label}
        <input
          type="file"
          accept="image/jpeg,image/png,image/webp"
          className="hidden"
          onChange={(e) => {
            const f = e.target.files?.[0];
            if (f) onPick(f);
          }}
        />
      </label>
      {current && (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={current} alt={label} className="h-14 w-20 rounded-lg border border-hk-soft-beige object-cover" />
      )}
    </div>
  );
}
