"use client";

import { useState } from "react";
import type { ReactNode } from "react";
import { Lock, Unlock, Pencil, Plus, Trash2, ShieldCheck } from "lucide-react";
import {
  AdminPageHeader,
  AdminCard,
  AdminButton,
  AdminBadge,
} from "@/components/admin";
import { updatePlatformSettingsAction } from "@/server/actions/platform-settings";
import {
  requestPlatformEditOtpAction,
  verifyPlatformEditOtpAction,
} from "@/server/actions/platform-settings-unlock";
import type { PlatformSettingsView } from "@/server/services/platform-settings-service";

interface ComponentRow {
  id: string;
  label: string;
  pct: number;
  sortOrder: number;
}

export function AdminPengaturanClient({
  initial,
  unlocked: initialUnlocked,
}: {
  initial: PlatformSettingsView;
  unlocked: boolean;
}) {
  const [unlocked, setUnlocked] = useState(initialUnlocked);
  const [dpPct, setDpPct] = useState(initial.dpPct);
  const [settlementPct, setSettlementPct] = useState(initial.settlementPct);
  const [platformFeePct, setPlatformFeePct] = useState(initial.platformFeePct);
  const [defaultBaCommissionPct, setDefaultBaCommissionPct] = useState(
    initial.defaultBaCommissionPct
  );
  const [superAdminEmail, setSuperAdminEmail] = useState(initial.superAdminEmail ?? "");
  const [components, setComponents] = useState<ComponentRow[]>(initial.components);

  const [otpModal, setOtpModal] = useState(false);
  const [otp, setOtp] = useState("");
  const [devCode, setDevCode] = useState<string | null>(null);
  const [msg, setMsg] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const feeTotal = components.reduce((a, c) => a + c.pct, 0);
  const feeValid = feeTotal === platformFeePct;
  const dpValid = dpPct + settlementPct === 100;

  const ro = !unlocked; // read-only bila terkunci

  async function requestOtp() {
    setBusy(true);
    setMsg(null);
    const res = await requestPlatformEditOtpAction();
    setBusy(false);
    if (res.success) {
      if (res.data.devCode) setDevCode(res.data.devCode);
      setOtpModal(true);
    } else {
      setMsg(res.message);
    }
  }

  async function submitOtp() {
    setBusy(true);
    setMsg(null);
    const res = await verifyPlatformEditOtpAction({ code: otp });
    setBusy(false);
    if (res.success) {
      setUnlocked(true);
      setOtpModal(false);
      setOtp("");
      setDevCode(null);
    } else {
      setMsg(res.message);
    }
  }

  async function save() {
    if (!feeValid) {
      setMsg(`Total komponen (${feeTotal}%) harus = Platform Fee (${platformFeePct}%).`);
      return;
    }
    if (!dpValid) {
      setMsg("DP% + Pelunasan% harus = 100.");
      return;
    }
    setBusy(true);
    setMsg(null);
    const res = await updatePlatformSettingsAction({
      dpPct,
      settlementPct,
      platformFeePct,
      defaultBaCommissionPct,
      superAdminEmail: superAdminEmail.trim() || null,
      components: components.map((c, i) => ({
        id: c.id,
        label: c.label,
        pct: c.pct,
        sortOrder: i,
      })),
    });
    setBusy(false);
    if (res.success) {
      setUnlocked(false); // kembali terkunci
      setMsg("Tersimpan. Form terkunci kembali — butuh OTP baru untuk mengubah lagi.");
    } else {
      setMsg(res.message);
    }
  }

  return (
    <div className="flex flex-col gap-6">
      <AdminPageHeader
        title="Pengaturan Platform"
        description="Persentase finansial & rincian fee. Perubahan butuh verifikasi OTP ke email Super Admin."
        action={
          <div className="flex items-center gap-2">
            {unlocked ? (
              <AdminBadge tone="ok">
                <Unlock className="h-3.5 w-3.5" aria-hidden="true" /> Terbuka
              </AdminBadge>
            ) : (
              <AdminBadge tone="neutral">
                <Lock className="h-3.5 w-3.5" aria-hidden="true" /> Terkunci
              </AdminBadge>
            )}
            <AdminButton variant="ghost" size="sm" onClick={requestOtp} disabled={busy}>
              <ShieldCheck className="h-4 w-4" aria-hidden="true" />
              Kirim Kode OTP
            </AdminButton>
          </div>
        }
      />

      <AdminCard>
        <div className="mb-5 flex items-start gap-2.5 rounded-xl border border-[#f0dcae] bg-[#fbf0d8] px-4 py-3 text-xs text-[#7a5608]">
          <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
          <span>
            Form ini <b>read-only</b> secara default. Klik <b>Kirim Kode OTP</b>, masukkan kode
            dari email Super Admin, lalu mode edit terbuka. Setelah disimpan, form terkunci kembali.
          </span>
        </div>

        <div className="grid grid-cols-1 gap-7 lg:grid-cols-[1fr_1.15fr]">
          {/* KIRI: Persentase Finansial */}
          <div className="min-w-0">
            <div className="mb-3 text-[13px] font-bold text-hk-charcoal">Persentase Finansial</div>
            <div className="flex flex-col gap-3">
              <SettingRow label="DP">
                <PctInput value={dpPct} onChange={setDpPct} readOnly={ro} />
              </SettingRow>
              <SettingRow label="Pelunasan">
                <PctInput value={settlementPct} onChange={setSettlementPct} readOnly={ro} />
              </SettingRow>
              <SettingRow label="Platform Fee">
                <PctInput value={platformFeePct} onChange={setPlatformFeePct} readOnly={ro} />
              </SettingRow>
              <SettingRow label="Default Komisi BA">
                <PctInput
                  value={defaultBaCommissionPct}
                  onChange={setDefaultBaCommissionPct}
                  readOnly={ro}
                />
              </SettingRow>
              <SettingRow label="Email Super Admin (OTP)">
                <input
                  type="email"
                  value={superAdminEmail}
                  onChange={(e) => setSuperAdminEmail(e.target.value)}
                  readOnly={ro}
                  placeholder="admin@harikita.id"
                  className="focus-ring min-h-11 w-[240px] rounded-xl border border-hk-soft-beige px-3.5 text-right text-sm text-hk-charcoal read-only:bg-hk-ivory read-only:text-plum-light"
                />
              </SettingRow>
            </div>
          </div>

          {/* KANAN: Rincian Platform Fee */}
          <div className="min-w-0">
            <div className="mb-3 flex flex-wrap items-center gap-2.5">
              <span className="text-[13px] font-bold text-hk-charcoal">Rincian Platform Fee</span>
              <AdminBadge tone={feeValid ? "ok" : "error"}>
                total {feeTotal}% {feeValid ? "= platformFee" : "≠ platformFee"}
              </AdminBadge>
            </div>
            <div className="mb-2 grid grid-cols-[1fr_104px_72px] gap-2.5 text-[11px] font-bold uppercase tracking-wide text-plum-light">
              <span>Komponen</span>
              <span className="text-right">Persentase</span>
              <span />
            </div>
            <div className="flex flex-col gap-2">
              {components.map((c, i) => (
                <div key={i} className="grid grid-cols-[1fr_104px_72px] items-center gap-2.5">
                  <input
                    value={c.label}
                    onChange={(e) =>
                      setComponents(
                        components.map((x, j) => (j === i ? { ...x, label: e.target.value } : x))
                      )
                    }
                    readOnly={ro}
                    placeholder="Nama komponen"
                    className="focus-ring min-h-11 w-full rounded-xl border border-hk-soft-beige px-3.5 text-sm text-hk-charcoal read-only:bg-hk-ivory read-only:text-plum-light"
                  />
                  <PctInput
                    value={c.pct}
                    onChange={(v) =>
                      setComponents(components.map((x, j) => (j === i ? { ...x, pct: v } : x)))
                    }
                    readOnly={ro}
                  />
                  <AdminButton
                    variant="danger"
                    size="sm"
                    disabled={ro}
                    onClick={() => setComponents(components.filter((_, j) => j !== i))}
                    aria-label={`Hapus komponen ${c.label || i + 1}`}
                  >
                    <Trash2 className="h-4 w-4" aria-hidden="true" />
                  </AdminButton>
                </div>
              ))}
            </div>
            <AdminButton
              variant="ghost"
              size="sm"
              className="mt-3"
              disabled={ro}
              onClick={() =>
                setComponents([
                  ...components,
                  { id: "", label: "", pct: 0, sortOrder: components.length },
                ])
              }
            >
              <Plus className="h-4 w-4" aria-hidden="true" />
              Tambah Komponen
            </AdminButton>
          </div>
        </div>

        {msg && (
          <div role="status" className="mt-5 text-sm font-semibold text-hk-charcoal">
            {msg}
          </div>
        )}

        <div className="mt-6 flex justify-end gap-3 border-t border-hk-soft-beige pt-4">
          <AdminButton variant="secondary" disabled={!unlocked || busy} onClick={() => setUnlocked(true)}>
            <Pencil className="h-4 w-4" aria-hidden="true" />
            Edit
          </AdminButton>
          <AdminButton variant="primary" disabled={!unlocked || busy} onClick={save}>
            Simpan
          </AdminButton>
        </div>
      </AdminCard>

      {/* Modal OTP */}
      {otpModal && (
        <div className="fixed inset-0 z-50 grid place-items-center bg-black/50 p-5">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl">
            <div className="flex items-start justify-between gap-3">
              <div>
                <div className="text-[17px] font-bold text-hk-charcoal">Verifikasi OTP</div>
                <div className="mt-0.5 text-xs text-plum-light">
                  Kode 6 digit dikirim ke email Super Admin.
                </div>
              </div>
            </div>

            {devCode && (
              <div className="mt-4 rounded-xl border border-[#f0dcae] bg-[#fbf0d8] px-4 py-3 text-xs text-[#7a5608]">
                Mode dev (email belum aktif). Kode:{" "}
                <strong className="font-mono tracking-widest">{devCode}</strong>
              </div>
            )}

            <input
              inputMode="numeric"
              maxLength={6}
              value={otp}
              onChange={(e) => setOtp(e.target.value.replace(/\D/g, ""))}
              placeholder="______"
              className="focus-ring mt-4 min-h-14 w-full rounded-xl border border-hk-soft-beige text-center text-2xl font-extrabold tracking-[0.5em] text-hk-charcoal"
              aria-label="Kode OTP 6 digit"
            />

            {msg && <div className="mt-3 text-xs font-semibold text-[#a2352f]">{msg}</div>}

            <div className="mt-5 flex gap-3">
              <AdminButton
                variant="secondary"
                className="flex-1"
                onClick={() => {
                  setOtpModal(false);
                  setOtp("");
                  setDevCode(null);
                  setMsg(null);
                }}
              >
                Batal
              </AdminButton>
              <AdminButton
                variant="primary"
                className="flex-1"
                disabled={busy || otp.length !== 6}
                onClick={submitOtp}
              >
                Verifikasi
              </AdminButton>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function SettingRow({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="flex items-center justify-between gap-4">
      <label className="text-[13px] font-semibold text-hk-charcoal">{label}</label>
      {children}
    </div>
  );
}

function PctInput({
  value,
  onChange,
  readOnly,
}: {
  value: number;
  onChange: (v: number) => void;
  readOnly: boolean;
}) {
  return (
    <div className="relative w-[104px] shrink-0">
      <input
        type="number"
        min={0}
        max={100}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        readOnly={readOnly}
        className="focus-ring min-h-11 w-full rounded-xl border border-hk-soft-beige pl-3.5 pr-9 text-right text-sm font-semibold text-hk-charcoal read-only:bg-hk-ivory read-only:text-plum-light"
      />
      <span className="pointer-events-none absolute right-3.5 top-1/2 -translate-y-1/2 text-sm font-bold text-plum-light">
        %
      </span>
    </div>
  );
}
