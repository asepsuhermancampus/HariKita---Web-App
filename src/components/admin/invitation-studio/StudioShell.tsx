"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { ArrowLeft, Eye, Redo2, Save, Undo2 } from "lucide-react";
import { DashButton } from "@/components/dashboard";
import { saveStudioDocument, submitStudioReview, approveStudioDraft, publishStudioVersion } from "@/server/actions/invitation-studio";
import type { InvitationStudioDocument } from "@/lib/invitation-studio/types";

export function StudioShell({ draft, version }: { draft: { id: string; name: string; status: string }; version: { versionNumber: number; documentJson: string } }) {
  const [document, setDocument] = useState<InvitationStudioDocument>(() => JSON.parse(version.documentJson));
  const [saveState, setSaveState] = useState("Saved");
  const [isPending, startTransition] = useTransition();
  const run = (action: () => Promise<unknown>) => startTransition(async () => { setSaveState("Saving…"); await action(); setSaveState("Saved"); });
  const updateName = (name: string) => setDocument((current) => ({ ...current, metadata: { ...current.metadata, name } }));
  const workflow = draft.status === "DRAFT"
    ? () => run(() => submitStudioReview({ draftId: draft.id }))
    : draft.status === "IN_REVIEW"
      ? () => run(() => approveStudioDraft({ draftId: draft.id }))
      : draft.status === "APPROVED" ? () => run(() => publishStudioVersion({ draftId: draft.id })) : undefined;
  return (
    <main className="min-h-screen overflow-x-hidden bg-hk-ivory px-4 py-6 text-hk-charcoal sm:px-6 lg:px-8">
      <div className="mx-auto max-w-[1600px] space-y-5">
        <header className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-hk-soft-beige bg-white p-4 shadow-sm">
          <div className="flex min-w-0 items-center gap-3">
            <Link href="/admin/undangan-studio" aria-label="Kembali" className="rounded-full p-2 hover:bg-hk-ivory"><ArrowLeft className="h-5 w-5" /></Link>
            <div className="min-w-0"><input value={document.metadata.name} onChange={(e) => updateName(e.target.value)} className="w-full max-w-sm bg-transparent font-editorial text-2xl font-bold outline-none" /><p className="text-xs text-hk-taupe">Status: {draft.status} · v{version.versionNumber} · {saveState}</p></div>
          </div>
          <div className="flex flex-wrap gap-2">
            <DashButton variant="ghost" size="sm" disabled><Undo2 className="h-4 w-4" /> Undo</DashButton>
            <DashButton variant="ghost" size="sm" disabled><Redo2 className="h-4 w-4" /> Redo</DashButton>
            <DashButton variant="secondary" size="sm" disabled={isPending}><Eye className="h-4 w-4" /> Preview</DashButton>
            <DashButton size="sm" disabled={isPending || !workflow} onClick={workflow}><Save className="h-4 w-4" /> {draft.status === "DRAFT" ? "Simpan & Ajukan Review" : draft.status === "IN_REVIEW" ? "Setujui" : "Publish"}</DashButton>
          </div>
        </header>
        <section className="grid min-h-[620px] gap-5 lg:grid-cols-[240px_minmax(360px,1fr)_280px]">
          <aside className="rounded-2xl border border-hk-soft-beige bg-white p-4"><p className="mb-3 text-xs font-bold uppercase tracking-[0.2em] text-hk-taupe">Sections</p><div className="space-y-2">{document.sections.map((section) => <div key={section.id} className={`rounded-xl px-3 py-2 text-sm ${section.enabled ? "bg-hk-ivory" : "text-hk-taupe/60 line-through"}`}>{section.id}</div>)}</div></aside>
          <div className="flex items-center justify-center overflow-hidden rounded-2xl border border-hk-soft-beige bg-[#eee8e0] p-5"><div className="flex h-[560px] w-full max-w-[360px] items-center justify-center rounded-[2rem] border-8 border-hk-charcoal/10 bg-white text-center shadow-xl"><div><p className="font-editorial text-3xl">Canvas Preview</p><p className="mt-2 text-xs text-hk-taupe">Pilih section atau asset untuk mulai menyusun desain.</p></div></div></div>
          <aside className="rounded-2xl border border-hk-soft-beige bg-white p-4"><p className="mb-3 text-xs font-bold uppercase tracking-[0.2em] text-hk-taupe">Inspector</p><p className="text-sm text-hk-taupe">Panel properti, layer, asset, dan animasi tersedia pada task editor berikutnya.</p></aside>
        </section>
      </div>
    </main>
  );
}
