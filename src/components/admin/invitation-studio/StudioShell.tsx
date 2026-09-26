"use client";

import { useRef, useState, useTransition } from "react";
import Link from "next/link";
import { ArrowLeft, Eye, Redo2, Save, Undo2 } from "lucide-react";
import { DashButton } from "@/components/dashboard";
import { saveStudioDocument, submitStudioReview, approveStudioDraft, publishStudioVersion, returnStudioDraft, unpublishStudioDraft } from "@/server/actions/invitation-studio";
import type { InvitationStudioDocument } from "@/lib/invitation-studio/types";
import type { StudioDraftStatus, StudioState } from "@/lib/invitation-studio/contracts";
import type { ActionResult } from "@/server/actions/_shared";
import { saveAndSubmitStudioReview, studioToken } from "@/lib/invitation-studio/client-workflow";
import { createStudioNode, editStudio, selectedStudioNode, type StudioEdit, type StudioDevice } from '@/lib/invitation-studio/editor';
import type { StudioSectionId } from '@/lib/invitation-studio/types';
import { SectionNavigator } from './SectionNavigator';
import { AssetCatalog } from './AssetCatalog';
import { LayerTree } from './LayerTree';
import { PropertiesInspector } from './PropertiesInspector';

export function StudioShell({ draft, version }: { draft: { id: string; name: string; status: string }; version: { versionNumber: number; documentJson: string } }) {
  const [document, setDocument] = useState<InvitationStudioDocument>(() => JSON.parse(version.documentJson));
  const [state, setState] = useState<StudioState>(() => ({ id: draft.id, name: draft.name, status: draft.status as StudioDraftStatus, versionNumber: version.versionNumber, document: JSON.parse(version.documentJson), updatedAt: '' }));
  const [saveState, setSaveState] = useState("Saved");
  const [isPending, startTransition] = useTransition();
  const busy = useRef(false);
  const [active, setActive] = useState<StudioSectionId>('cover');
  const [selection, setSelection] = useState<string | null>(null);
  const [device, setDevice] = useState<StudioDevice>('mobile');
  const section = document.sections.find(s => s.id === active)!;
  const edit = (operation: StudioEdit) => {
    if (busy.current || !editable) return;
    try { const result = editStudio(document, operation); setDocument(result.document); if ('id' in operation || operation.type === 'add') setSelection(result.selection); setSaveState('Belum disimpan'); }
    catch (error) { setSaveState(`Error: ${error instanceof Error ? error.message : 'Edit tidak valid'}`); }
  };
  const run = (action: () => Promise<ActionResult<StudioState>>) => {
    if (busy.current) return;
    busy.current = true;
    startTransition(async () => {
      setSaveState("Saving…");
      try {
        const result = await action();
        if (!result.success) { setSaveState(`Error: ${result.message}`); return; }
        setState(result.data); setDocument(result.data.document); setSaveState("Saved");
      } catch { setSaveState("Error: Koneksi gagal. Perubahan lokal tetap tersedia; coba simpan lagi."); }
      finally { busy.current = false; }
    });
  };
  const updateName = (name: string) => { setDocument(current => ({ ...current, metadata: { ...current.metadata, name } })); setSaveState("Belum disimpan"); };
  const dirty = JSON.stringify(document) !== JSON.stringify(state.document);
  const editable = !['IN_REVIEW', 'ARCHIVED'].includes(state.status);
  const workflow = state.status === "DRAFT"
    ? () => run(() => saveAndSubmitStudioReview(state, document, saveStudioDocument, submitStudioReview, setState))
    : state.status === "IN_REVIEW"
      ? () => run(() => approveStudioDraft(studioToken(state)))
      : state.status === "APPROVED" && !dirty ? () => run(() => publishStudioVersion(studioToken(state))) : undefined;
  return (
    <main className="min-h-screen overflow-x-hidden bg-hk-ivory px-4 py-6 text-hk-charcoal sm:px-6 lg:px-8">
      <div className="mx-auto max-w-[1600px] space-y-5">
        <header className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-hk-soft-beige bg-white p-4 shadow-sm">
          <div className="flex min-w-0 items-center gap-3">
            <Link href="/admin/undangan-studio" aria-label="Kembali" className="flex min-h-11 min-w-11 items-center justify-center rounded-full hover:bg-hk-ivory"><ArrowLeft className="h-5 w-5" /></Link>
            <div className="min-w-0"><input aria-label="Nama draft" maxLength={100} disabled={isPending || !editable} value={document.metadata.name} onChange={(e) => updateName(e.target.value)} className="min-h-11 w-full max-w-sm bg-transparent font-editorial text-2xl font-bold outline-none" /><p aria-live="polite" className="break-words text-xs text-hk-taupe">Status: {state.status} · v{state.versionNumber} · {saveState}</p></div>
          </div>
          <div className="flex flex-wrap gap-2">
            <DashButton variant="ghost" size="sm" disabled><Undo2 className="h-4 w-4" /> Undo</DashButton>
            <DashButton variant="ghost" size="sm" disabled><Redo2 className="h-4 w-4" /> Redo</DashButton>
            <DashButton variant="secondary" size="sm" disabled><Eye className="h-4 w-4" /> Preview</DashButton>
            <DashButton className="min-h-11" disabled={isPending || !editable} onClick={() => run(() => saveStudioDocument({ ...studioToken(state), document }))}>Simpan / Coba lagi</DashButton>
            <DashButton className="min-h-11" disabled={isPending || !workflow} onClick={workflow}><Save className="h-4 w-4" /> {state.status === "DRAFT" ? "Simpan & Ajukan Review" : state.status === "IN_REVIEW" ? "Setujui" : "Publish"}</DashButton>
            {state.status !== 'DRAFT' && <DashButton className="min-h-11" disabled={isPending || dirty} onClick={() => run(() => returnStudioDraft(studioToken(state)))}>Kembali ke Draft</DashButton>}
            {state.status === 'PUBLISHED' && <DashButton className="min-h-11" disabled={isPending || dirty} onClick={() => run(() => unpublishStudioDraft(studioToken(state)))}>Unpublish</DashButton>}
          </div>
        </header>
        <section className="grid min-w-0 min-h-[620px] gap-5 xl:grid-cols-[220px_minmax(0,1fr)_260px]">
          <aside className="min-w-0 space-y-6 rounded-2xl border border-hk-soft-beige bg-white p-4"><SectionNavigator document={document} active={active} onSelect={id => { setActive(id); setSelection(null); }} onEdit={edit} disabled={isPending || !editable} /><AssetCatalog disabled={isPending || !editable} onAdd={asset => edit({ type: 'add', section: active, node: createStudioNode(asset, crypto.randomUUID(), active) })} /></aside>
          <div className="flex items-center justify-center overflow-hidden rounded-2xl border border-hk-soft-beige bg-[#eee8e0] p-5"><div className="flex h-[560px] w-full max-w-[360px] items-center justify-center rounded-[2rem] border-8 border-hk-charcoal/10 bg-white text-center shadow-xl"><div><p className="font-editorial text-3xl">Canvas Preview</p><p className="mt-2 text-xs text-hk-taupe">Pilih section atau asset untuk mulai menyusun desain.</p></div></div></div>
          <aside className="min-w-0 space-y-6 rounded-2xl border border-hk-soft-beige bg-white p-4"><LayerTree section={section} selection={selection} onSelect={setSelection} onEdit={edit} disabled={isPending || !editable} /><PropertiesInspector section={section} node={selectedStudioNode(document, active, selection)} device={device} onDevice={setDevice} onEdit={edit} disabled={isPending || !editable} /></aside>
        </section>
      </div>
    </main>
  );
}
