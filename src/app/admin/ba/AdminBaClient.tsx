"use client";

import React, { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import {
  UserPlus,
  Coins,
  Wallet,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Percent,
  Sparkles,
  Building2,
} from "lucide-react";
import { formatRupiah } from "@/lib/utils";
import {
  createAmbassadorAction,
  setAmbassadorActiveAction,
  setAmbassadorCommissionAction,
  resolveWithdrawalAction,
} from "@/server/actions/ambassador";
import { Modal, ToggleSwitch, EmptyState } from "@/components/harikita/ui";
import { AdminPageHeader } from "@/components/admin";
import type { listAmbassadors, listAmbassadorWithdrawals } from "@/server/queries/ambassador";

type Ambassador = Awaited<ReturnType<typeof listAmbassadors>>[number];
type Withdrawal = Awaited<ReturnType<typeof listAmbassadorWithdrawals>>[number];

const STATUS_META: Record<string, { label: string; className: string }> = {
  PENDING: { label: "Menunggu", className: "bg-amber-50 text-amber-800 border-amber-200" },
  PAID: { label: "Dibayar", className: "bg-emerald-50 text-emerald-800 border-emerald-200" },
  REJECTED: { label: "Ditolak", className: "bg-red-50 text-red-800 border-red-200" },
};

export function AdminBaClient({
  ambassadors,
  pendingWithdrawals,
  allWithdrawals,
}: {
  ambassadors: Ambassador[];
  pendingWithdrawals: Withdrawal[];
  allWithdrawals: Withdrawal[];
}) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [message, setMessage] = useState<string | null>(null);

  // Form buat BA baru.
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [form, setForm] = useState({
    name: "",
    phone: "",
    pin: "",
    displayName: "",
    commissionPct: "5",
  });

  // Edit komisi inline.
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editPct, setEditPct] = useState("");

  const refresh = () => router.refresh();

  const handleCreate = () => {
    setMessage(null);
    startTransition(async () => {
      const res = await createAmbassadorAction({
        name: form.name.trim(),
        phone: form.phone.trim(),
        pin: form.pin.trim(),
        displayName: form.displayName.trim() || form.name.trim(),
        commissionPct: Number(form.commissionPct) || 5,
      });
      if (!res.success) {
        setMessage(res.message || "Gagal membuat akun BA.");
      } else {
        setMessage(`Berhasil membuat BA dengan kode ${res.data.referralCode}.`);
        setIsCreateOpen(false);
        setForm({ name: "", phone: "", pin: "", displayName: "", commissionPct: "5" });
        refresh();
      }
    });
  };

  const handleToggleActive = (ba: Ambassador, next: boolean) => {
    setMessage(null);
    startTransition(async () => {
      const res = await setAmbassadorActiveAction({ ambassadorId: ba.id, isActive: next });
      if (!res.success) setMessage(res.message || "Gagal mengubah status BA.");
      else refresh();
    });
  };

  const startEditPct = (ba: Ambassador) => {
    setEditingId(ba.id);
    setEditPct(String(ba.commissionPct));
  };

  const saveEditPct = (ba: Ambassador) => {
    const pct = Number(editPct);
    if (!Number.isFinite(pct) || pct < 0 || pct > 100) {
      setMessage("Persen komisi harus antara 0 sampai 100.");
      return;
    }
    setMessage(null);
    startTransition(async () => {
      const res = await setAmbassadorCommissionAction({ ambassadorId: ba.id, commissionPct: pct });
      if (!res.success) setMessage(res.message || "Gagal mengubah komisi.");
      else {
        setEditingId(null);
        refresh();
      }
    });
  };

  const handleResolve = (withdrawalId: string, decision: "PAID" | "REJECTED") => {
    setMessage(null);
    startTransition(async () => {
      const res = await resolveWithdrawalAction({ withdrawalId, decision });
      if (!res.success) setMessage(res.message || "Gagal memproses penarikan.");
      else refresh();
    });
  };

  return (
    <div className="flex flex-col gap-6">
      <div className="mx-auto w-full max-w-6xl space-y-6">
        {/* Header */}
        <AdminPageHeader
          title="Panel Brand Ambassador"
          description="Kelola akun BA, atur persen komisi, dan proses penarikan dompet komisi."
          action={
            <button
              onClick={() => setIsCreateOpen(true)}
              className="focus-ring inline-flex min-h-[44px] items-center gap-2 rounded-xl bg-hk-charcoal px-4 py-2.5 text-xs font-semibold text-white shadow-sm transition-colors hover:bg-hk-taupe"
            >
              <UserPlus className="h-4 w-4 text-hk-champagne" aria-hidden="true" />
              Tambah BA Baru
            </button>
          }
        />

        <div aria-live="polite" aria-atomic="true">
          {message && (
            <div className="flex items-center gap-2 rounded-xl border border-hk-champagne/50 bg-white p-3 text-xs text-hk-charcoal">
              <AlertCircle className="w-4 h-4 text-hk-taupe" aria-hidden="true" />
              <span>{message}</span>
            </div>
          )}
        </div>

        {/* Tabel BA */}
        <div className="bg-white rounded-2xl border border-hk-champagne/30 shadow-sm overflow-hidden">
          <div className="px-5 py-3 border-b border-hk-soft-beige/60 flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-hk-taupe" aria-hidden="true" />
            <h2 className="font-editorial text-base font-bold text-hk-charcoal">
              Daftar Brand Ambassador ({ambassadors.length})
            </h2>
          </div>
          {ambassadors.length === 0 ? (
            <div className="p-6">
              <EmptyState
                title="Belum ada Brand Ambassador"
                description="Tambahkan akun BA pertama untuk mulai merekrut vendor lewat kode referral."
                icon="inbox"
              />
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-xs font-manrope">
                <thead className="bg-hk-ivory/70 text-hk-charcoal/70">
                  <tr>
                    <th className="text-left font-semibold px-4 py-3">Nama</th>
                    <th className="text-left font-semibold px-4 py-3">Kode</th>
                    <th className="text-right font-semibold px-4 py-3">Komisi</th>
                    <th className="text-right font-semibold px-4 py-3">Rekrutan</th>
                    <th className="text-right font-semibold px-4 py-3">Saldo</th>
                    <th className="text-center font-semibold px-4 py-3">Aktif</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-hk-soft-beige/60">
                  {ambassadors.map((ba) => (
                    <tr key={ba.id} className="hover:bg-hk-ivory/40">
                      <td className="px-4 py-3">
                        <div className="font-semibold text-hk-charcoal">{ba.displayName}</div>
                        <div className="text-[10px] text-hk-charcoal/50 font-mono">{ba.id.slice(0, 10)}</div>
                      </td>
                      <td className="px-4 py-3 font-mono text-[11px] text-hk-taupe font-bold">
                        {ba.referralCode}
                      </td>
                      <td className="px-4 py-3 text-right">
                        {editingId === ba.id ? (
                          <span className="inline-flex items-center gap-1">
                            <input
                              type="number"
                              min={0}
                              max={100}
                              value={editPct}
                              onChange={(e) => setEditPct(e.target.value)}
                              className="w-16 p-1 rounded-lg border border-hk-soft-beige text-right focus:outline-none focus:border-hk-champagne"
                              aria-label={`Persen komisi untuk ${ba.displayName}`}
                            />
                            <button
                              onClick={() => saveEditPct(ba)}
                              disabled={isPending}
                              className="text-emerald-700 hover:text-emerald-900 font-semibold disabled:opacity-50"
                            >
                              Simpan
                            </button>
                          </span>
                        ) : (
                          <button
                            onClick={() => startEditPct(ba)}
                            className="inline-flex items-center gap-1 text-hk-charcoal hover:text-hk-taupe font-semibold"
                            title="Ubah persen komisi"
                          >
                            <Percent className="w-3 h-3 text-hk-taupe" aria-hidden="true" />
                            {ba.commissionPct}%
                          </button>
                        )}
                      </td>
                      <td className="px-4 py-3 text-right text-hk-charcoal/80">{ba.recruitedCount}</td>
                      <td className="px-4 py-3 text-right font-bold text-hk-taupe">
                        {formatRupiah(ba.walletBalance)}
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex justify-center">
                          <ToggleSwitch
                            checked={ba.isActive}
                            disabled={isPending}
                            onChange={(next) => handleToggleActive(ba, next)}
                          />
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Penarikan PENDING */}
        <div className="bg-white rounded-2xl border border-hk-champagne/30 shadow-sm p-5 sm:p-6 space-y-4">
          <div className="flex items-center gap-2 border-b border-hk-ivory pb-3">
            <Wallet className="w-5 h-5 text-hk-taupe" aria-hidden="true" />
            <h2 className="font-editorial text-base font-bold text-hk-charcoal">
              Penarikan Menunggu Proses ({pendingWithdrawals.length})
            </h2>
          </div>

          {pendingWithdrawals.length === 0 ? (
            <p className="text-xs text-hk-charcoal/60 font-manrope italic py-4 text-center">
              Tidak ada permohonan penarikan yang menunggu.
            </p>
          ) : (
            <div className="space-y-3">
              {pendingWithdrawals.map((w) => (
                <div
                  key={w.id}
                  className="flex flex-col sm:flex-row sm:items-center justify-between p-3.5 rounded-xl bg-hk-ivory border border-hk-soft-beige gap-3 text-xs"
                >
                  <div className="space-y-0.5">
                    <div className="font-semibold text-hk-charcoal">
                      {w.ambassadorName}{" "}
                      <span className="font-mono text-[10px] text-hk-taupe">({w.referralCode})</span>
                    </div>
                    <div className="text-[11px] text-hk-charcoal/60 font-manrope flex items-center gap-1">
                      <Building2 className="w-3 h-3 text-hk-taupe" aria-hidden="true" />
                      {w.bankName ?? "-"} • {w.bankAccount ?? "-"} • a.n {w.bankHolder ?? "-"}
                    </div>
                    <div className="text-[10px] text-hk-charcoal/50">Diajukan: {w.createdAt}</div>
                  </div>

                  <div className="flex items-center gap-3 sm:justify-end">
                    <div className="text-right">
                      <div className="font-mono font-bold text-sm text-hk-charcoal">
                        {formatRupiah(w.amount)}
                      </div>
                      <div className="text-[10px] text-hk-charcoal/50">
                        Sisa saldo: {formatRupiah(w.walletBalance)}
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleResolve(w.id, "PAID")}
                        disabled={isPending}
                        className="focus-ring inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-hk-charcoal text-white hover:bg-hk-taupe text-xs font-semibold disabled:opacity-50 min-h-[40px]"
                      >
                        <CheckCircle2 className="w-3.5 h-3.5 text-hk-champagne" aria-hidden="true" />
                        Proses
                      </button>
                      <button
                        onClick={() => handleResolve(w.id, "REJECTED")}
                        disabled={isPending}
                        className="focus-ring inline-flex items-center gap-1.5 px-3 py-2 rounded-xl border border-red-200 text-red-700 hover:bg-red-50 text-xs font-semibold disabled:opacity-50 min-h-[40px]"
                      >
                        <XCircle className="w-3.5 h-3.5" aria-hidden="true" />
                        Tolak
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Riwayat penarikan */}
        {allWithdrawals.length > 0 && (
          <div className="bg-white rounded-2xl border border-hk-champagne/30 shadow-sm p-5 sm:p-6 space-y-4">
            <h2 className="font-editorial text-base font-bold text-hk-charcoal border-b border-hk-ivory pb-3">
              Riwayat Seluruh Penarikan
            </h2>
            <div className="overflow-x-auto">
              <table className="w-full text-xs font-manrope">
                <thead className="bg-hk-ivory/70 text-hk-charcoal/70">
                  <tr>
                    <th className="text-left font-semibold px-4 py-3">BA</th>
                    <th className="text-right font-semibold px-4 py-3">Nominal</th>
                    <th className="text-center font-semibold px-4 py-3">Status</th>
                    <th className="text-right font-semibold px-4 py-3">Tanggal</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-hk-soft-beige/60">
                  {allWithdrawals.map((w) => {
                    const meta = STATUS_META[w.status] ?? {
                      label: w.status,
                      className: "bg-hk-soft-beige text-hk-charcoal border-hk-champagne/40",
                    };
                    return (
                      <tr key={w.id} className="hover:bg-hk-ivory/40">
                        <td className="px-4 py-3 text-hk-charcoal">{w.ambassadorName}</td>
                        <td className="px-4 py-3 text-right font-mono text-hk-charcoal">
                          {formatRupiah(w.amount)}
                        </td>
                        <td className="px-4 py-3 text-center">
                          <span
                            className={`inline-block text-[10px] font-semibold px-2 py-0.5 rounded-full border ${meta.className}`}
                          >
                            {meta.label}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-right text-hk-charcoal/60">{w.createdAt}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      {/* Modal buat BA baru */}
      <Modal
        isOpen={isCreateOpen}
        onClose={() => setIsCreateOpen(false)}
        title="Tambah Brand Ambassador Baru"
        size="md"
        footer={
          <>
            <button
              type="button"
              onClick={() => setIsCreateOpen(false)}
              disabled={isPending}
              className="focus-ring inline-flex min-h-[44px] items-center justify-center rounded-full border border-hk-soft-beige px-5 py-2 text-xs font-semibold text-hk-charcoal transition-colors hover:bg-hk-ivory disabled:opacity-50"
            >
              Batal
            </button>
            <button
              type="button"
              onClick={handleCreate}
              disabled={isPending}
              aria-busy={isPending}
              className="focus-ring inline-flex min-h-[44px] items-center justify-center rounded-full bg-hk-charcoal px-5 py-2 text-xs font-semibold text-white transition-colors hover:bg-hk-taupe disabled:opacity-50"
            >
              {isPending ? "Menyimpan..." : "Buat Akun BA"}
            </button>
          </>
        }
      >
        <div className="space-y-3 font-manrope text-xs text-hk-charcoal">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1">
              <label htmlFor="ba-name" className="block font-semibold">
                Nama Lengkap
              </label>
              <input
                id="ba-name"
                type="text"
                value={form.name}
                onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                placeholder="Contoh: Rina Kebumen"
                className="focus-ring w-full p-2.5 rounded-xl border border-hk-soft-beige focus:outline-none focus:border-hk-champagne"
              />
            </div>
            <div className="space-y-1">
              <label htmlFor="ba-display" className="block font-semibold">
                Nama Tampilan (opsional)
              </label>
              <input
                id="ba-display"
                type="text"
                value={form.displayName}
                onChange={(e) => setForm((f) => ({ ...f, displayName: e.target.value }))}
                placeholder="Default: sama dengan nama"
                className="focus-ring w-full p-2.5 rounded-xl border border-hk-soft-beige focus:outline-none focus:border-hk-champagne"
              />
            </div>
            <div className="space-y-1">
              <label htmlFor="ba-phone" className="block font-semibold">
                Nomor HP
              </label>
              <input
                id="ba-phone"
                type="tel"
                inputMode="numeric"
                value={form.phone}
                onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value }))}
                placeholder="08xxxxxxxxxx"
                className="focus-ring w-full p-2.5 rounded-xl border border-hk-soft-beige focus:outline-none focus:border-hk-champagne"
              />
            </div>
            <div className="space-y-1">
              <label htmlFor="ba-pin" className="block font-semibold">
                PIN Login (6 digit)
              </label>
              <input
                id="ba-pin"
                type="text"
                inputMode="numeric"
                maxLength={6}
                value={form.pin}
                onChange={(e) => setForm((f) => ({ ...f, pin: e.target.value.replace(/\D/g, "") }))}
                placeholder="6 digit angka"
                className="focus-ring w-full p-2.5 rounded-xl border border-hk-soft-beige focus:outline-none focus:border-hk-champagne"
              />
            </div>
            <div className="space-y-1">
              <label htmlFor="ba-pct" className="block font-semibold">
                Persen Komisi (%)
              </label>
              <input
                id="ba-pct"
                type="number"
                min={0}
                max={100}
                step="0.5"
                value={form.commissionPct}
                onChange={(e) => setForm((f) => ({ ...f, commissionPct: e.target.value }))}
                className="focus-ring w-full p-2.5 rounded-xl border border-hk-soft-beige focus:outline-none focus:border-hk-champagne"
              />
            </div>
          </div>
          <p className="text-[10px] text-hk-charcoal/60 flex items-center gap-1">
            <Coins className="w-3 h-3 text-hk-taupe" aria-hidden="true" />
            Kode referral dibuat otomatis dengan format BA-KEBUMEN-XXXX.
          </p>
        </div>
      </Modal>
    </div>
  );
}
