"use client";

import { useEffect, useRef, useState, useTransition } from "react";
import Link from "next/link";
import { ArrowLeft, Eye, Layers, Palette, Redo2, RotateCcw, Save, Sliders, Undo2, Send, CheckCircle, Globe, ChevronLeft, Sparkles, Type, Brush, Clock, Keyboard, Settings2, FileText } from "lucide-react";
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
import { ResponsiveStudioCanvas } from './ResponsiveStudioCanvas';
import { StudioPreview } from './StudioPreview';
import { SectionTemplatePanel } from './SectionTemplatePanel';
import { StudioHistory } from '@/lib/invitation-studio/history';
import { UndoRedoControls } from './UndoRedoControls';
import { SaveStatus } from './SaveStatus';
import { StudioAutosaveCoordinator, type AutosaveStatus } from '@/lib/invitation-studio/autosave';

export function StudioShell({ 
  draft, 
  version 
}: { 
  draft: { id: string; name: string; status: string }; 
  version: { versionNumber: number; documentJson: string };
}) {
  const [document, setDocument] = useState<InvitationStudioDocument>(() => JSON.parse(version.documentJson));
  const [state, setState] = useState<StudioState>(() => ({ 
    id: draft.id, 
    name: draft.name, 
    status: draft.status as StudioDraftStatus, 
    versionNumber: version.versionNumber, 
    document: JSON.parse(version.documentJson), 
    updatedAt: '' 
  }));
  const [saveState, setSaveState] = useState("Saved");
  const [isPending, startTransition] = useTransition();
  const busy = useRef(false);
  const [active, setActive] = useState<StudioSectionId>('cover');
  const [selection, setSelection] = useState<string | null>(null);
  const [device, setDevice] = useState<StudioDevice>('mobile');
  const [preview, setPreview] = useState(false);
  
  // UX Panel Tabs & Collapsible Sidebar
  type LeftTab = 'sections' | 'assets' | 'templates' | 'teks' | 'warna' | 'riwayat' | 'pintasan' | 'pengaturan';
  const [leftTab, setLeftTab] = useState<LeftTab | null>(null);
  const [rightTab, setRightTab] = useState<'layers' | 'inspector'>('layers');

  // Close flyout on Escape
  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') setLeftTab(null); };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, []);

  const documentRef = useRef(document);
  const stateRef = useRef(state);
  const [autosaveStatus, setAutosaveStatus] = useState<AutosaveStatus>('saved');
  const history = useRef(new StudioHistory(document));
  const [historyState, setHistoryState] = useState({ canUndo: false, canRedo: false });

  const setHistoryDocument = (next: InvitationStudioDocument) => { 
    setDocument(next); 
    setHistoryState({ canUndo: history.current.canUndo, canRedo: history.current.canRedo }); 
  };

  useEffect(() => { documentRef.current = document; }, [document]);
  useEffect(() => { stateRef.current = state; }, [state]);

  const autosave = useRef<StudioAutosaveCoordinator<InvitationStudioDocument, StudioState> | null>(null);
  if (!autosave.current) {
    autosave.current = new StudioAutosaveCoordinator({
      save: async (nextDocument, token) => {
        const result = await saveStudioDocument({ ...studioToken(token as StudioState), document: nextDocument });
        if (result.success) { setState(result.data); setDocument(result.data.document); }
        return result;
      },
      onStatus: setAutosaveStatus,
    });
  }

  useEffect(() => () => autosave.current?.dispose(), []);
  const section = document.sections.find(s => s.id === active)!;

  const edit = (operation: StudioEdit) => {
    if (busy.current || !editable) return;
    try { 
      const result = editStudio(document, operation); 
      history.current.push(result.document); 
      setHistoryDocument(result.document); 
      autosave.current?.edit(result.document, stateRef.current); 
      const switchToInspector =
        operation.type === 'add' ||
        operation.type === 'duplicate' ||
        operation.type === 'duplicate-many' ||
        operation.type === 'duplicate-group' ||
        operation.type === 'copy-to-section';
      if (switchToInspector) {
        setSelection(result.selection);
        setRightTab('inspector');
      }

      setSaveState('Belum disimpan'); 
    }
    catch (error) { 
      setSaveState(`Error: ${error instanceof Error ? error.message : 'Edit tidak valid'}`); 
    }
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
      } catch { 
        setSaveState("Error: Koneksi gagal. Perubahan lokal tetap tersedia; coba simpan lagi."); 
      }
      finally { busy.current = false; }
    });
  };

  const updateName = (name: string) => { 
    const next = { ...documentRef.current, metadata: { ...documentRef.current.metadata, name } }; 
    setDocument(next); 
    history.current.push(next); 
    autosave.current?.edit(next, stateRef.current); 
    setSaveState("Belum disimpan"); 
  };

  // Lock viewport scroll while studio editor is mounted so the browser window never scrolls
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const body = window.document.body;
    const prevOverflow = body.style.overflow;
    const prevHeight = body.style.height;
    body.style.overflow = 'hidden';
    body.style.height = '100vh';
    return () => {
      body.style.overflow = prevOverflow;
      body.style.height = prevHeight;
    };
  }, []);

  const dirty = JSON.stringify(document) !== JSON.stringify(state.document);
  const editable = !['IN_REVIEW', 'ARCHIVED'].includes(state.status);

  const workflow = state.status === "DRAFT"
    ? () => run(() => saveAndSubmitStudioReview(state, document, saveStudioDocument, submitStudioReview, setState))
    : state.status === "IN_REVIEW"
      ? () => run(() => approveStudioDraft(studioToken(state)))
      : state.status === "APPROVED" && !dirty ? () => run(() => publishStudioVersion(studioToken(state))) : undefined;

  return (
    <div
      className="overflow-x-hidden overflow-hidden text-hk-charcoal flex flex-col px-3 pb-3 -mt-2 lg:-mt-4"
      style={{
        height: 'calc(100vh - 3.25rem)',
        maxHeight: 'calc(100vh - 3.25rem)',
      }}
    >
      <div className="flex flex-col h-full min-h-0 gap-3">
        {/* Top Studio Header (Pinned / Sticky) */}
        <header className="shrink-0 flex flex-wrap items-center justify-between gap-2.5 rounded-2xl border border-hk-soft-beige bg-white p-2.5 shadow-sm sm:px-4">
          {/* Left: Back & Editable Title */}
          <div className="flex min-w-0 items-center gap-2.5">
            <Link 
              href="/admin/undangan-studio" 
              aria-label="Kembali" 
              title="Kembali ke Daftar Studio"
              className="flex h-8.5 w-8.5 items-center justify-center rounded-xl border border-hk-soft-beige bg-[#FAF8F5] text-hk-charcoal transition hover:border-[#C5A880] hover:bg-[#F3EDE6]"
            >
              <ArrowLeft className="h-4 w-4" />
            </Link>

            <div className="min-w-0">
              <input 
                aria-label="Nama draft" 
                maxLength={100} 
                disabled={isPending || !editable} 
                value={document.metadata.name} 
                onChange={(e) => updateName(e.target.value)} 
                className="h-7 w-full max-w-sm rounded-lg bg-transparent font-editorial text-xl sm:text-2xl font-bold text-hk-charcoal transition hover:bg-[#FAF8F5] focus:bg-white focus:outline-none focus:ring-1 focus:ring-[#C5A880]" 
              />
              <div className="flex items-center gap-1.5">
                <span className="rounded-md bg-[#F3EDE6] px-1.5 py-0.5 text-[10px] font-bold text-hk-taupe">
                  Status: {state.status}
                </span>
                <span className="text-[11px] text-hk-taupe/80">
                  v{state.versionNumber}
                </span>
                <span className="text-hk-soft-beige">·</span>
                <SaveStatus status={autosaveStatus} onRetry={() => autosave.current?.retry()} />
                {saveState !== 'Saved' && saveState !== 'Saving…' && (
                  <span className="text-[11px] text-hk-taupe truncate max-w-xs">{saveState}</span>
                )}
              </div>
            </div>
          </div>

          {/* Right Toolbar & Action Buttons */}
          <div className="flex flex-wrap items-center gap-1.5">
            <UndoRedoControls 
              canUndo={historyState.canUndo} 
              canRedo={historyState.canRedo} 
              onUndo={() => { 
                const next = history.current.undo(); 
                if (next) { setHistoryDocument(next); setSaveState('Belum disimpan'); } 
              }} 
              onRedo={() => { 
                const next = history.current.redo(); 
                if (next) { setHistoryDocument(next); setSaveState('Belum disimpan'); } 
              }} 
            />

            <button
              type="button"
              onClick={() => setPreview(true)}
              className="flex h-8 items-center gap-1.5 rounded-xl border border-hk-soft-beige bg-white px-2.5 text-xs font-semibold text-hk-charcoal shadow-2xs transition hover:border-[#C5A880] hover:bg-[#FAF8F5]"
            >
              <Eye className="h-3.5 w-3.5 text-[#C5A880]" />
              <span>Preview</span>
            </button>

            {/* Simpan draft / coba lagi button (preserves text for test) */}
            <button
              type="button"
              disabled={isPending || !editable} 
              onClick={() => run(() => saveStudioDocument({ ...studioToken(state), document }))}
              className="flex h-8 items-center gap-1.5 rounded-xl border border-hk-soft-beige bg-white px-3 text-xs font-bold text-hk-charcoal shadow-2xs transition hover:border-[#C5A880] hover:bg-[#FAF8F5] disabled:opacity-40"
            >
              <Save className="h-3.5 w-3.5 text-hk-taupe" />
              <span>Simpan / Coba lagi</span>
            </button>

            {/* Workflow Action Button */}
            <button
              type="button"
              disabled={isPending || !workflow} 
              onClick={workflow}
              className="flex h-8 items-center gap-1.5 rounded-xl bg-[#4A2E35] px-3 text-xs font-bold text-[#FAF8F5] shadow-sm transition hover:bg-[#382328] disabled:opacity-40"
            >
              {state.status === "DRAFT" ? (
                <>
                  <Send className="h-3.5 w-3.5 text-[#C5A880]" />
                  <span>Simpan & Ajukan Review</span>
                </>
              ) : state.status === "IN_REVIEW" ? (
                <>
                  <CheckCircle className="h-3.5 w-3.5 text-emerald-400" />
                  <span>Setujui</span>
                </>
              ) : (
                <>
                  <Globe className="h-3.5 w-3.5 text-[#C5A880]" />
                  <span>Publish</span>
                </>
              )}
            </button>

            {/* Return / Unpublish Secondary Buttons */}
            {state.status !== 'DRAFT' && (
              <button 
                type="button"
                className="flex h-8 items-center gap-1 rounded-xl border border-hk-soft-beige bg-white px-2 text-xs font-semibold text-hk-charcoal transition hover:bg-[#FAF8F5] disabled:opacity-40" 
                disabled={isPending || dirty} 
                onClick={() => run(() => returnStudioDraft(studioToken(state)))}
              >
                <RotateCcw className="h-3 w-3 text-hk-taupe" />
                <span>Kembali ke Draft</span>
              </button>
            )}

            {state.status === 'PUBLISHED' && (
              <button 
                type="button"
                className="flex h-8 items-center gap-1 rounded-xl border border-amber-200 bg-amber-50 px-2 text-xs font-semibold text-amber-800 transition hover:bg-amber-100 disabled:opacity-40" 
                disabled={isPending || dirty} 
                onClick={() => run(() => unpublishStudioDraft(studioToken(state)))}
              >
                <span>Unpublish</span>
              </button>
            )}
          </div>
        </header>

        {/* ── 3-Column Workspace (icon-rail | canvas | right panel) ──── */}
        <section className="xl:grid-cols-[48px_minmax(0,1fr)_330px] grid flex-1 min-h-0 gap-3 grid-rows-[minmax(0,1fr)]">

          {/* ── Icon Rail (always 48px) ──────────────────────────────── */}
          <aside className="relative flex w-12 shrink-0 h-full min-h-0 flex-col items-center gap-1.5 rounded-2xl border border-hk-soft-beige bg-white py-3 shadow-sm">
            {/* Section icon */}
            <div className="group/tip relative">
              <button
                type="button"
                id="rail-sections"
                onClick={() => setLeftTab(t => t === 'sections' ? null : 'sections')}
                title="Sections"
                className={`flex h-9 w-9 items-center justify-center rounded-xl transition ${
                  leftTab === 'sections'
                    ? 'bg-[#4A2E35] text-white shadow-sm'
                    : 'text-hk-taupe hover:bg-[#FAF8F5] hover:text-[#4A2E35]'
                }`}
              >
                <Layers className="h-4 w-4" />
              </button>
              <span className="pointer-events-none absolute left-full top-1/2 z-50 ml-2.5 -translate-y-1/2 whitespace-nowrap rounded-lg bg-[#4A2E35] px-2.5 py-1 text-[11px] font-semibold text-white opacity-0 shadow-xl transition-opacity group-hover/tip:opacity-100">
                Sections
                <span className="absolute right-full top-1/2 -translate-y-1/2 border-4 border-transparent border-r-[#4A2E35]" />
              </span>
            </div>

            {/* Template icon */}
            <div className="group/tip relative">
              <button
                type="button"
                id="rail-templates"
                onClick={() => setLeftTab(t => t === 'templates' ? null : 'templates')}
                title="Template"
                className={`flex h-9 w-9 items-center justify-center rounded-xl transition ${
                  leftTab === 'templates'
                    ? 'bg-[#4A2E35] text-white shadow-sm'
                    : 'text-hk-taupe hover:bg-[#FAF8F5] hover:text-[#4A2E35]'
                }`}
              >
                <Sparkles className="h-4 w-4" />
              </button>
              <span className="pointer-events-none absolute left-full top-1/2 z-50 ml-2.5 -translate-y-1/2 whitespace-nowrap rounded-lg bg-[#4A2E35] px-2.5 py-1 text-[11px] font-semibold text-white opacity-0 shadow-xl transition-opacity group-hover/tip:opacity-100">
                Template
                <span className="absolute right-full top-1/2 -translate-y-1/2 border-4 border-transparent border-r-[#4A2E35]" />
              </span>
            </div>

            {/* Assets icon */}
            <div className="group/tip relative">
              <button
                type="button"
                id="rail-assets"
                onClick={() => setLeftTab(t => t === 'assets' ? null : 'assets')}
                title="Aset"
                className={`flex h-9 w-9 items-center justify-center rounded-xl transition ${
                  leftTab === 'assets'
                    ? 'bg-[#4A2E35] text-white shadow-sm'
                    : 'text-hk-taupe hover:bg-[#FAF8F5] hover:text-[#4A2E35]'
                }`}
              >
                <Palette className="h-4 w-4" />
              </button>
              <span className="pointer-events-none absolute left-full top-1/2 z-50 ml-2.5 -translate-y-1/2 whitespace-nowrap rounded-lg bg-[#4A2E35] px-2.5 py-1 text-[11px] font-semibold text-white opacity-0 shadow-xl transition-opacity group-hover/tip:opacity-100">
                Katalog Aset
                <span className="absolute right-full top-1/2 -translate-y-1/2 border-4 border-transparent border-r-[#4A2E35]" />
              </span>
            </div>

            {/* Divider */}
            <div className="mx-auto w-5 border-t border-hk-soft-beige my-0.5" />

            {/* Teks icon */}
            <div className="group/tip relative">
              <button
                type="button"
                id="rail-teks"
                onClick={() => setLeftTab(t => t === 'teks' ? null : 'teks')}
                className={`flex h-9 w-9 items-center justify-center rounded-xl transition ${
                  leftTab === 'teks' ? 'bg-[#4A2E35] text-white shadow-sm' : 'text-hk-taupe hover:bg-[#FAF8F5] hover:text-[#4A2E35]'
                }`}
              >
                <Type className="h-4 w-4" />
              </button>
              <span className="pointer-events-none absolute left-full top-1/2 z-50 ml-2.5 -translate-y-1/2 whitespace-nowrap rounded-lg bg-[#4A2E35] px-2.5 py-1 text-[11px] font-semibold text-white opacity-0 shadow-xl transition-opacity group-hover/tip:opacity-100">
                Tambah Teks &amp; Blok
                <span className="absolute right-full top-1/2 -translate-y-1/2 border-4 border-transparent border-r-[#4A2E35]" />
              </span>
            </div>

            {/* Warna/Tema icon */}
            <div className="group/tip relative">
              <button
                type="button"
                id="rail-warna"
                onClick={() => setLeftTab(t => t === 'warna' ? null : 'warna')}
                className={`flex h-9 w-9 items-center justify-center rounded-xl transition ${
                  leftTab === 'warna' ? 'bg-[#4A2E35] text-white shadow-sm' : 'text-hk-taupe hover:bg-[#FAF8F5] hover:text-[#4A2E35]'
                }`}
              >
                <Brush className="h-4 w-4" />
              </button>
              <span className="pointer-events-none absolute left-full top-1/2 z-50 ml-2.5 -translate-y-1/2 whitespace-nowrap rounded-lg bg-[#4A2E35] px-2.5 py-1 text-[11px] font-semibold text-white opacity-0 shadow-xl transition-opacity group-hover/tip:opacity-100">
                Warna &amp; Transparansi
                <span className="absolute right-full top-1/2 -translate-y-1/2 border-4 border-transparent border-r-[#4A2E35]" />
              </span>
            </div>

            {/* Riwayat icon */}
            <div className="group/tip relative">
              <button
                type="button"
                id="rail-riwayat"
                onClick={() => setLeftTab(t => t === 'riwayat' ? null : 'riwayat')}
                className={`flex h-9 w-9 items-center justify-center rounded-xl transition ${
                  leftTab === 'riwayat' ? 'bg-[#4A2E35] text-white shadow-sm' : 'text-hk-taupe hover:bg-[#FAF8F5] hover:text-[#4A2E35]'
                }`}
              >
                <Clock className="h-4 w-4" />
              </button>
              <span className="pointer-events-none absolute left-full top-1/2 z-50 ml-2.5 -translate-y-1/2 whitespace-nowrap rounded-lg bg-[#4A2E35] px-2.5 py-1 text-[11px] font-semibold text-white opacity-0 shadow-xl transition-opacity group-hover/tip:opacity-100">
                Riwayat Perubahan
                <span className="absolute right-full top-1/2 -translate-y-1/2 border-4 border-transparent border-r-[#4A2E35]" />
              </span>
            </div>

            {/* Pintasan Keyboard icon */}
            <div className="group/tip relative">
              <button
                type="button"
                id="rail-pintasan"
                onClick={() => setLeftTab(t => t === 'pintasan' ? null : 'pintasan')}
                className={`flex h-9 w-9 items-center justify-center rounded-xl transition ${
                  leftTab === 'pintasan' ? 'bg-[#4A2E35] text-white shadow-sm' : 'text-hk-taupe hover:bg-[#FAF8F5] hover:text-[#4A2E35]'
                }`}
              >
                <Keyboard className="h-4 w-4" />
              </button>
              <span className="pointer-events-none absolute left-full top-1/2 z-50 ml-2.5 -translate-y-1/2 whitespace-nowrap rounded-lg bg-[#4A2E35] px-2.5 py-1 text-[11px] font-semibold text-white opacity-0 shadow-xl transition-opacity group-hover/tip:opacity-100">
                Pintasan Keyboard
                <span className="absolute right-full top-1/2 -translate-y-1/2 border-4 border-transparent border-r-[#4A2E35]" />
              </span>
            </div>

            {/* Pengaturan Dokumen icon (pinned to bottom) */}
            <div className="group/tip relative mt-auto">
              <button
                type="button"
                id="rail-pengaturan"
                onClick={() => setLeftTab(t => t === 'pengaturan' ? null : 'pengaturan')}
                className={`flex h-9 w-9 items-center justify-center rounded-xl transition ${
                  leftTab === 'pengaturan' ? 'bg-[#4A2E35] text-white shadow-sm' : 'text-hk-taupe hover:bg-[#FAF8F5] hover:text-[#4A2E35]'
                }`}
              >
                <Settings2 className="h-4 w-4" />
              </button>
              <span className="pointer-events-none absolute left-full top-1/2 z-50 ml-2.5 -translate-y-1/2 whitespace-nowrap rounded-lg bg-[#4A2E35] px-2.5 py-1 text-[11px] font-semibold text-white opacity-0 shadow-xl transition-opacity group-hover/tip:opacity-100">
                Pengaturan Dokumen
                <span className="absolute right-full top-1/2 -translate-y-1/2 border-4 border-transparent border-r-[#4A2E35]" />
              </span>
            </div>

            {/* Active tab indicator dot */}
            {leftTab && leftTab !== 'pengaturan' && (
              <div className="mb-1">
                <div className="h-1.5 w-1.5 rounded-full bg-[#C5A880]" />
              </div>
            )}

            {/* Flyout Panel (overlay, slides out from rail) */}
            {leftTab && (
              <>
                {/* Backdrop */}
                <div className="fixed inset-0 z-30" onClick={() => setLeftTab(null)} aria-hidden="true" />
                {/* Flyout */}
                <aside
                  className="absolute left-[52px] top-0 z-40 flex h-full w-[288px] flex-col rounded-2xl border border-hk-soft-beige bg-white shadow-2xl overflow-hidden"
                  style={{ animation: 'flyoutIn 0.18s ease-out' }}
                >
                  {/* Flyout header */}
                  <div className="shrink-0 flex items-center justify-between border-b border-hk-soft-beige px-3 py-2.5">
                    <div className="flex items-center gap-2">
                      {leftTab === 'sections'    && <><Layers    className="h-4 w-4 text-[#C5A880]" /><span className="text-sm font-bold text-hk-charcoal">Sections</span></>}
                      {leftTab === 'templates'   && <><Sparkles  className="h-4 w-4 text-[#C5A880]" /><span className="text-sm font-bold text-hk-charcoal">Template</span></>}
                      {leftTab === 'assets'      && <><Palette   className="h-4 w-4 text-[#C5A880]" /><span className="text-sm font-bold text-hk-charcoal">Katalog Aset</span></>}
                      {leftTab === 'teks'        && <><Type      className="h-4 w-4 text-[#C5A880]" /><span className="text-sm font-bold text-hk-charcoal">Tambah Teks &amp; Blok</span></>}
                      {leftTab === 'warna'       && <><Brush     className="h-4 w-4 text-[#C5A880]" /><span className="text-sm font-bold text-hk-charcoal">Warna &amp; Transparansi</span></>}
                      {leftTab === 'riwayat'     && <><Clock     className="h-4 w-4 text-[#C5A880]" /><span className="text-sm font-bold text-hk-charcoal">Riwayat Perubahan</span></>}
                      {leftTab === 'pintasan'    && <><Keyboard  className="h-4 w-4 text-[#C5A880]" /><span className="text-sm font-bold text-hk-charcoal">Pintasan Keyboard</span></>}
                      {leftTab === 'pengaturan'  && <><Settings2 className="h-4 w-4 text-[#C5A880]" /><span className="text-sm font-bold text-hk-charcoal">Pengaturan Dokumen</span></>}
                    </div>
                    <button type="button" onClick={() => setLeftTab(null)} className="flex h-7 w-7 items-center justify-center rounded-lg text-hk-taupe hover:bg-[#FAF8F5] hover:text-hk-charcoal transition" title="Tutup (Esc)">
                      <ChevronLeft className="h-4 w-4" />
                    </button>
                  </div>

                  {/* Flyout content */}
                  <div className="flex-1 min-h-0 overflow-y-auto p-3">

                    {/* SECTIONS */}
                    {leftTab === 'sections' && (
                      <SectionNavigator document={document} active={active} onSelect={id => { setActive(id); setSelection(null); setLeftTab(null); }} onEdit={edit} disabled={isPending || !editable} />
                    )}

                    {/* TEMPLATES */}
                    {leftTab === 'templates' && (
                      <div className="flex flex-col gap-3">
                        <p className="text-[11px] text-hk-taupe">Template untuk section <strong className="text-hk-charcoal">{active}</strong>. Semua elemen dapat diedit setelah diterapkan.</p>
                        <SectionTemplatePanel sectionId={active} sectionLabel={active} onApply={(edits) => { edits.forEach(e => edit(e)); setLeftTab(null); }} disabled={isPending || !editable} />
                      </div>
                    )}

                    {/* ASSETS */}
                    {leftTab === 'assets' && (
                      <AssetCatalog disabled={isPending || !editable} onAdd={asset => { edit({ type: 'add', section: active, node: createStudioNode(asset, crypto.randomUUID(), active) }); setLeftTab(null); }} />
                    )}

                    {/* TEKS & BLOK */}
                    {leftTab === 'teks' && (
                      <div className="flex flex-col gap-3">
                        <p className="text-[11px] text-hk-taupe">Tambahkan elemen teks atau blok konten ke section <strong className="text-hk-charcoal">{active}</strong>.</p>
                        <div className="grid grid-cols-1 gap-2">
                          <button type="button" disabled={isPending || !editable} onClick={() => { edit({ type: 'add', section: active, node: createStudioNode('text', crypto.randomUUID(), active) }); setLeftTab(null); }} className="flex items-center gap-3 rounded-xl border border-hk-soft-beige bg-white p-3 text-left transition hover:border-[#C5A880] hover:bg-[#FAF8F5] disabled:opacity-40">
                            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#FAF8F5] border border-hk-soft-beige"><Type className="h-5 w-5 text-[#C5A880]" /></div>
                            <div><p className="text-xs font-bold text-hk-charcoal">Tambah Teks</p><p className="text-[10px] text-hk-taupe">Layer teks bebas yang bisa diposisikan di mana saja</p></div>
                          </button>
                          <button type="button" disabled={isPending || !editable} onClick={() => { edit({ type: 'add', section: active, node: createStudioNode('component', crypto.randomUUID(), active) }); setLeftTab(null); }} className="flex items-center gap-3 rounded-xl border border-hk-soft-beige bg-white p-3 text-left transition hover:border-[#C5A880] hover:bg-[#FAF8F5] disabled:opacity-40">
                            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#FAF8F5] border border-hk-soft-beige"><FileText className="h-5 w-5 text-[#C5A880]" /></div>
                            <div><p className="text-xs font-bold text-hk-charcoal">Tambah Blok Konten</p><p className="text-[10px] text-hk-taupe">Blok section dinamis (foto, RSVP, peta, dll)</p></div>
                          </button>
                        </div>
                      </div>
                    )}

                    {/* WARNA & TRANSPARANSI */}
                    {leftTab === 'warna' && (
                      <div className="flex flex-col gap-4">
                        <p className="text-[11px] text-hk-taupe">Preset transparansi untuk layer yang dipilih. Pilih node di canvas terlebih dahulu.</p>
                        <div>
                          <p className="mb-2 text-[10px] font-bold uppercase tracking-wider text-hk-taupe">Preset Opacity</p>
                          <div className="grid grid-cols-4 gap-1.5">
                            {[100,80,60,40,20,10].map(op => (
                              <button key={op} type="button"
                                disabled={isPending || !editable || !selection}
                                onClick={() => { if (selection) edit({ type: 'node', section: active, id: selection, patch: { appearance: { opacity: op, overflow: 'visible' } } }); }}
                                className="flex flex-col items-center gap-1 rounded-lg border border-hk-soft-beige bg-[#FAF8F5] p-2 text-center hover:border-[#C5A880] hover:bg-white transition disabled:opacity-30">
                                <div className="h-5 w-5 rounded-md bg-[#4A2E35]" style={{ opacity: op / 100 }} />
                                <span className="text-[10px] font-bold text-hk-charcoal">{op}%</span>
                              </button>
                            ))}
                          </div>
                        </div>
                        <div>
                          <p className="mb-2 text-[10px] font-bold uppercase tracking-wider text-hk-taupe">Palet Warna HariKita</p>
                          <div className="grid grid-cols-5 gap-1.5">
                            {[
                              { label: 'Ivory', hex: '#FAF8F5' },
                              { label: 'Gold', hex: '#C5A880' },
                              { label: 'Plum', hex: '#4A2E35' },
                              { label: 'Taupe', hex: '#6B5E62' },
                              { label: 'Champagne', hex: '#F3EDE6' },
                              { label: 'Sage', hex: '#8A9E8B' },
                              { label: 'Blush', hex: '#E8C4B8' },
                              { label: 'Dusty', hex: '#B8A9A0' },
                              { label: 'Cream', hex: '#FFF8F0' },
                              { label: 'Charcoal', hex: '#2D2020' },
                            ].map(({ label, hex }) => (
                              <button key={hex} type="button" title={`${label} ${hex}`}
                                className="group flex flex-col items-center gap-1 rounded-lg border border-hk-soft-beige p-1 hover:border-[#C5A880] transition">
                                <div className="h-6 w-6 rounded-md border border-black/10" style={{ backgroundColor: hex }} />
                                <span className="text-[9px] text-hk-taupe">{label}</span>
                              </button>
                            ))}
                          </div>
                        </div>
                      </div>
                    )}

                    {/* RIWAYAT PERUBAHAN */}
                    {leftTab === 'riwayat' && (
                      <div className="flex flex-col gap-3">
                        <div className="flex items-center justify-between">
                          <p className="text-[11px] text-hk-taupe">Riwayat edit sesi ini. Klik Undo/Redo di toolbar untuk navigasi.</p>
                        </div>
                        <div className="flex gap-2">
                          <button type="button" disabled={!historyState.canUndo} onClick={() => { const next = history.current.undo(); if (next) { setHistoryDocument(next); setSaveState('Belum disimpan'); } }} className="flex-1 flex items-center justify-center gap-1.5 h-8 rounded-xl border border-hk-soft-beige bg-white text-xs font-semibold text-hk-charcoal hover:border-[#C5A880] hover:bg-[#FAF8F5] transition disabled:opacity-30">
                            <Undo2 className="h-3.5 w-3.5" /> Undo
                          </button>
                          <button type="button" disabled={!historyState.canRedo} onClick={() => { const next = history.current.redo(); if (next) { setHistoryDocument(next); setSaveState('Belum disimpan'); } }} className="flex-1 flex items-center justify-center gap-1.5 h-8 rounded-xl border border-hk-soft-beige bg-white text-xs font-semibold text-hk-charcoal hover:border-[#C5A880] hover:bg-[#FAF8F5] transition disabled:opacity-30">
                            <Redo2 className="h-3.5 w-3.5" /> Redo
                          </button>
                        </div>
                        <div className="rounded-xl border border-hk-soft-beige bg-[#FAF8F5] px-3 py-4 text-center">
                          <Clock className="h-6 w-6 text-[#C5A880] mx-auto mb-2" />
                          <p className="text-[11px] font-semibold text-hk-charcoal">Sesi aktif</p>
                          <p className="text-[10px] text-hk-taupe mt-0.5">Semua perubahan tersimpan otomatis setiap 30 detik</p>
                          <div className="mt-3 flex items-center justify-center gap-1.5">
                            <div className="h-2 w-2 rounded-full bg-emerald-400" />
                            <span className="text-[10px] text-hk-taupe">Autosave aktif</span>
                          </div>
                        </div>
                        <button type="button" disabled={isPending || !editable} onClick={() => run(() => saveStudioDocument({ ...studioToken(state), document }))} className="flex items-center justify-center gap-1.5 h-9 rounded-xl border border-hk-soft-beige bg-white text-xs font-bold text-hk-charcoal hover:border-[#C5A880] hover:bg-[#FAF8F5] transition disabled:opacity-40">
                          <Save className="h-3.5 w-3.5 text-hk-taupe" /> Simpan Sekarang
                        </button>
                      </div>
                    )}

                    {/* PINTASAN KEYBOARD */}
                    {leftTab === 'pintasan' && (
                      <div className="flex flex-col gap-2">
                        <p className="text-[11px] text-hk-taupe mb-1">Pintasan keyboard untuk mempercepat desain undangan.</p>
                        {([
                          { group: 'Navigasi', items: [
                            { key: 'Esc', label: 'Tutup panel / batal seleksi' },
                            { key: '↑ ↓', label: 'Navigasi section' },
                            { key: 'Click', label: 'Pilih layer di canvas' },
                          ]},
                          { group: 'Edit', items: [
                            { key: 'Ctrl+Z', label: 'Undo' },
                            { key: 'Ctrl+Y', label: 'Redo' },
                            { key: 'Ctrl+S', label: 'Simpan draft' },
                            { key: 'Ctrl+D', label: 'Duplikat layer' },
                            { key: 'Del', label: 'Hapus layer terpilih' },
                          ]},
                          { group: 'Canvas', items: [
                            { key: 'Drag', label: 'Pindah posisi layer' },
                            { key: '⌅ Resize', label: 'Ubah ukuran dari sudut' },
                            { key: 'Rotate ↻', label: 'Putar dari handle' },
                          ]},
                        ] as const).map(({ group, items }) => (
                          <div key={group} className="rounded-xl border border-hk-soft-beige bg-white overflow-hidden">
                            <div className="px-3 py-1.5 bg-[#FAF8F5] border-b border-hk-soft-beige">
                              <p className="text-[10px] font-bold uppercase tracking-wider text-hk-taupe">{group}</p>
                            </div>
                            {items.map(({ key, label }) => (
                              <div key={key} className="flex items-center justify-between px-3 py-2 border-b border-hk-soft-beige/60 last:border-0">
                                <span className="text-[11px] text-hk-charcoal">{label}</span>
                                <kbd className="rounded-md border border-hk-soft-beige bg-[#FAF8F5] px-2 py-0.5 text-[10px] font-mono font-bold text-hk-taupe">{key}</kbd>
                              </div>
                            ))}
                          </div>
                        ))}
                      </div>
                    )}

                    {/* PENGATURAN DOKUMEN */}
                    {leftTab === 'pengaturan' && (
                      <div className="flex flex-col gap-4">
                        <div>
                          <p className="mb-2 text-[10px] font-bold uppercase tracking-wider text-hk-taupe">Nama Dokumen</p>
                          <input
                            maxLength={100}
                            disabled={isPending || !editable}
                            value={document.metadata.name}
                            onChange={e => updateName(e.target.value)}
                            className="h-9 w-full rounded-xl border border-hk-soft-beige bg-[#FAF8F5] px-3 text-xs font-semibold text-hk-charcoal focus:border-[#C5A880] focus:bg-white focus:outline-none transition"
                          />
                        </div>
                        <div>
                          <p className="mb-2 text-[10px] font-bold uppercase tracking-wider text-hk-taupe">Overflow Section Aktif</p>
                          <div className="grid grid-cols-2 gap-2">
                            {(['contained','visible'] as const).map(val => (
                              <button key={val} type="button" disabled={isPending || !editable}
                                onClick={() => edit({ type: 'section-overflow', section: active, overflow: val })}
                                className={`h-9 rounded-xl border text-xs font-bold transition ${
                                  section.overflowPolicy === val
                                    ? 'border-[#C5A880] bg-[#F3EDE6] text-[#4A2E35]'
                                    : 'border-hk-soft-beige bg-white text-hk-taupe hover:border-[#C5A880]'
                                }`}>{val === 'contained' ? '📦 Contained' : '🔓 Visible'}</button>
                            ))}
                          </div>
                          <p className="mt-1.5 text-[10px] text-hk-taupe">Contained: aset dipotong sesuai batas section. Visible: aset boleh keluar dari batas.</p>
                        </div>
                        <div className="rounded-xl border border-hk-soft-beige bg-[#FAF8F5] p-3">
                          <p className="text-[10px] font-bold uppercase tracking-wider text-hk-taupe mb-2">Info Dokumen</p>
                          <div className="space-y-1.5">
                            <div className="flex justify-between"><span className="text-[11px] text-hk-taupe">Status</span><span className="text-[11px] font-bold text-hk-charcoal">{state.status}</span></div>
                            <div className="flex justify-between"><span className="text-[11px] text-hk-taupe">Versi</span><span className="text-[11px] font-bold text-hk-charcoal">v{state.versionNumber}</span></div>
                            <div className="flex justify-between"><span className="text-[11px] text-hk-taupe">Section aktif</span><span className="text-[11px] font-bold text-hk-charcoal">{active}</span></div>
                            <div className="flex justify-between"><span className="text-[11px] text-hk-taupe">Total layer</span><span className="text-[11px] font-bold text-hk-charcoal">{section.nodes.length} layer</span></div>
                          </div>
                        </div>
                      </div>
                    )}

                  </div>
                </aside>
              </>
            )}
          </aside>

          {/* Center Canvas */}
          <ResponsiveStudioCanvas 
            document={document} 
            active={active} 
            selection={selection} 
            device={device} 
            onDevice={setDevice} 
            onSelect={setSelection} 
            onActiveSectionChange={setActive}
            onEdit={edit} 
            disabled={isPending || !editable} 
          />

          {/* Right Panel with Tab Switcher (Posisi Layers di Kiri & Inspector di Kanan) */}
          <aside className="flex min-w-0 h-full min-h-0 flex-col rounded-2xl border border-hk-soft-beige bg-white p-3 shadow-sm overflow-hidden">
            {/* Panel Tabs (Pinned) - Ditukar: Layers di Tab Kiri, Inspector di Tab Kanan */}
            <div className="shrink-0 mb-2 grid grid-cols-2 gap-1 rounded-xl bg-[#FAF8F5] p-1 border border-hk-soft-beige">
              <button
                type="button"
                onClick={() => setRightTab('layers')}
                className={`flex h-7.5 items-center justify-center gap-1.5 rounded-lg text-xs font-bold transition ${
                  rightTab === 'layers'
                    ? 'bg-white text-[#4A2E35] shadow-2xs border border-hk-soft-beige/80'
                    : 'text-hk-taupe hover:text-hk-charcoal'
                }`}
              >
                <Layers className="h-3.5 w-3.5 text-[#C5A880]" />
                <span>Layers ({section.nodes.length})</span>
              </button>
              <button
                type="button"
                onClick={() => setRightTab('inspector')}
                className={`flex h-7.5 items-center justify-center gap-1.5 rounded-lg text-xs font-bold transition ${
                  rightTab === 'inspector'
                    ? 'bg-white text-[#4A2E35] shadow-2xs border border-hk-soft-beige/80'
                    : 'text-hk-taupe hover:text-hk-charcoal'
                }`}
              >
                <Sliders className="h-3.5 w-3.5 text-[#C5A880]" />
                <span>Inspector</span>
              </button>
            </div>

            {/* Tab Contents (Scrollable Internally) */}
            <div className="flex-1 min-h-0 overflow-y-auto">
              {rightTab === 'inspector' ? (
                <PropertiesInspector 
                  section={section} 
                  node={selectedStudioNode(document, active, selection)} 
                  device={device} 
                  onDevice={setDevice} 
                  onEdit={edit} 
                  disabled={isPending || !editable} 
                />
              ) : (
                <LayerTree 
                  section={section} 
                  selection={selection} 
                  onSelect={id => { setSelection(id); }} 
                  onEdit={edit} 
                  disabled={isPending || !editable} 
                />
              )}
            </div>
          </aside>
        </section>
      </div>

      {/* Fullscreen Responsive Preview Modal */}
      {preview && (
        <StudioPreview document={document} onClose={() => setPreview(false)} />
      )}
    </div>
  );
}
