"use client";

import React, { useMemo, useState } from 'react';
import Link from 'next/link';
import { 
  createStudioDraft, 
  renameStudioDraft, 
  duplicateStudioDraft, 
  archiveStudioDraft, 
  deleteStudioDraft 
} from '@/server/actions/invitation-studio';
import type { StudioDraftStatus } from '@/lib/invitation-studio/contracts';
import { DashBadge, type DashBadgeTone } from '@/components/dashboard/DashBadge';
import { 
  Plus, 
  Search, 
  Sparkles, 
  Calendar, 
  Edit3, 
  Copy, 
  Archive, 
  Trash2, 
  ExternalLink, 
  AlertCircle,
  Clock
} from 'lucide-react';

type Draft = { 
  id: string; 
  name: string; 
  status: StudioDraftStatus; 
  versionNumber: number; 
  updatedAt: string;
};

const STATUS_TONES: Record<StudioDraftStatus, DashBadgeTone> = {
  DRAFT: 'neutral',
  IN_REVIEW: 'info',
  APPROVED: 'warn',
  PUBLISHED: 'ok',
  ARCHIVED: 'error',
};

const STATUS_LABELS: Record<StudioDraftStatus, string> = {
  DRAFT: 'Draft',
  IN_REVIEW: 'Dalam Review',
  APPROVED: 'Disetujui',
  PUBLISHED: 'Tayang (Published)',
  ARCHIVED: 'Diarsipkan',
};

export function StudioDraftList({ drafts }: { drafts: Draft[] }) {
  const [items, setItems] = useState<Draft[]>(drafts);
  const [name, setName] = useState('');
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [pending, setPending] = useState(false);
  const [error, setError] = useState('');

  const filteredItems = useMemo(() => {
    return items.filter(item => {
      const matchSearch = item.name.toLowerCase().includes(search.toLowerCase());
      const matchStatus = statusFilter === 'ALL' || item.status === statusFilter;
      return matchSearch && matchStatus;
    });
  }, [items, search, statusFilter]);

  async function mutate(action: 'create' | 'rename' | 'duplicate' | 'archive' | 'delete', draft?: Draft) {
    if (pending) return;
    let value = name;
    if (draft && (action === 'rename' || action === 'duplicate')) {
      const answer = window.prompt(action === 'rename' ? 'Nama baru' : 'Nama salinan', action === 'rename' ? draft.name : `${draft.name} salinan`);
      if (answer === null) return;
      value = answer;
    }
    let confirmation = '';
    if (action === 'delete' && draft) {
      const answer = window.prompt(`Ketik nama draft "${draft.name}" untuk menghapus permanen.`);
      if (answer === null) return;
      confirmation = answer;
    }
    setPending(true); 
    setError('');
    try {
      if (action === 'create') {
        const result = await createStudioDraft({ name: value });
        if (!result.success) { setError(result.message); return; }
        setItems(current => [result.data, ...current]); 
        setName(''); 
        return;
      }
      if (!draft) return;
      const token = { draftId: draft.id, expectedVersion: draft.versionNumber, expectedStatus: draft.status };
      if (action === 'delete') {
        const result = await deleteStudioDraft({ ...token, confirmation });
        if (!result.success) { setError(result.message); return; }
        setItems(current => current.filter(item => item.id !== draft.id)); 
        return;
      }
      const result = await (action === 'rename' ? renameStudioDraft({ ...token, name: value }) : action === 'duplicate' ? duplicateStudioDraft({ ...token, name: value }) : archiveStudioDraft(token));
      if (!result.success) { setError(result.message); return; }
      setItems(current => action === 'duplicate' ? [result.data, ...current] : current.map(item => item.id === draft.id ? result.data : item));
    } catch { 
      setError('Koneksi gagal. Muat ulang untuk memeriksa hasil sebelum mencoba lagi.'); 
    } finally { 
      setPending(false); 
    }
  }

  return (
    <section className="space-y-6">
      {/* Creation Card */}
      <div className="rounded-2xl border border-hk-soft-beige bg-white p-5 shadow-sm">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="space-y-1">
            <h2 className="flex items-center gap-2 font-editorial text-xl font-bold text-hk-charcoal">
              <Sparkles className="h-5 w-5 text-[#C5A880]" />
              Buat Template Undangan Baru
            </h2>
            <p className="text-xs text-hk-taupe sm:text-sm">
              Mulai kanvas baru dari nol dengan 16 section interaktif dan visual canvas editor.
            </p>
          </div>
          <form 
            className="flex flex-wrap items-center gap-2" 
            onSubmit={event => { event.preventDefault(); void mutate('create'); }}
          >
            <div className="relative min-w-[240px] flex-1 sm:w-80">
              <input 
                required 
                maxLength={100} 
                value={name} 
                onChange={event => setName(event.target.value)} 
                placeholder="Nama template (mis. Royal Adat Kebumen)..." 
                className="h-11 w-full rounded-xl border border-hk-soft-beige bg-[#FAF8F5] px-3.5 text-sm text-hk-charcoal placeholder-hk-taupe/60 transition-colors focus:border-[#C5A880] focus:bg-white focus:outline-none" 
              />
            </div>
            <button 
              type="submit" 
              disabled={pending}
              className="inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-[#4A2E35] px-5 text-sm font-semibold text-[#FAF8F5] shadow-sm transition hover:bg-[#382328] disabled:opacity-50"
            >
              <Plus className="h-4 w-4 text-[#C5A880]" />
              Buat draft
            </button>
          </form>
        </div>
      </div>

      {/* Error Alert */}
      {error && (
        <div role="alert" className="flex items-center gap-3 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-800">
          <AlertCircle className="h-5 w-5 shrink-0 text-red-600" />
          <p className="break-words font-medium">{error}</p>
        </div>
      )}

      {/* Filters and Search Bar */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-hk-taupe/70" />
          <input 
            type="text"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Cari draft template..."
            className="h-10 w-full rounded-xl border border-hk-soft-beige bg-white pl-10 pr-4 text-sm text-hk-charcoal placeholder-hk-taupe/60 transition focus:border-[#C5A880] focus:outline-none"
          />
        </div>

        {/* Filter Chips */}
        <div className="flex flex-wrap items-center gap-1.5 overflow-x-auto pb-1">
          {['ALL', 'DRAFT', 'IN_REVIEW', 'APPROVED', 'PUBLISHED', 'ARCHIVED'].map(tab => (
            <button
              key={tab}
              onClick={() => setStatusFilter(tab)}
              className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition ${
                statusFilter === tab
                  ? 'bg-[#C5A880] text-white'
                  : 'bg-white text-hk-taupe border border-hk-soft-beige hover:bg-[#F3EDE6]'
              }`}
            >
              {tab === 'ALL' ? 'Semua' : STATUS_LABELS[tab as StudioDraftStatus] ?? tab}
            </button>
          ))}
        </div>
      </div>

      {/* Cards Grid */}
      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {filteredItems.map(draft => (
          <article 
            key={draft.id} 
            className="group flex flex-col justify-between rounded-2xl border border-hk-soft-beige bg-white p-5 shadow-sm transition hover:border-[#C5A880] hover:shadow-md"
          >
            <div className="space-y-3">
              <div className="flex items-start justify-between gap-2">
                <DashBadge tone={STATUS_TONES[draft.status]}>
                  {STATUS_LABELS[draft.status] ?? draft.status}
                </DashBadge>
                <span className="rounded-md bg-[#F3EDE6] px-2 py-0.5 text-[11px] font-bold text-hk-taupe">
                  v{draft.versionNumber}
                </span>
              </div>

              <div>
                <Link 
                  href={`/admin/undangan-studio/${draft.id}`}
                  className="font-editorial text-2xl font-bold text-hk-charcoal transition-colors group-hover:text-[#4A2E35] hover:underline"
                >
                  {draft.name}
                </Link>
                <p className="mt-1 flex items-center gap-1.5 text-xs text-hk-taupe">
                  <Clock className="h-3.5 w-3.5 shrink-0 text-[#C5A880]" />
                  <span>Terakhir disimpan: </span>
                  <time dateTime={draft.updatedAt}>
                    {draft.updatedAt.replace('T', ' ').replace('.000Z', ' UTC')}
                  </time>
                </p>
              </div>
            </div>

            <div className="mt-5 space-y-2.5 pt-4 border-t border-hk-soft-beige/70">
              <Link
                href={`/admin/undangan-studio/${draft.id}`}
                className="flex h-10 w-full items-center justify-center gap-2 rounded-xl bg-[#FAF8F5] border border-hk-soft-beige text-xs font-bold text-[#4A2E35] transition hover:bg-[#F3EDE6] hover:border-[#C5A880]"
              >
                <span>Buka Visual Editor</span>
                <ExternalLink className="h-3.5 w-3.5" />
              </Link>

              {/* Action Buttons to satisfy tests */}
              <div className="grid grid-cols-2 gap-1.5 sm:grid-cols-4">
                <button 
                  className="flex h-9 items-center justify-center gap-1 rounded-lg border border-hk-soft-beige bg-white px-2 text-[11px] font-medium text-hk-charcoal transition hover:border-[#C5A880] hover:bg-[#FAF8F5] disabled:opacity-40" 
                  disabled={pending || ['IN_REVIEW', 'ARCHIVED'].includes(draft.status)} 
                  onClick={() => void mutate('rename', draft)}
                  title="Ganti nama draft"
                >
                  <Edit3 className="h-3 w-3 text-[#C5A880]" />
                  <span>Ganti nama</span>
                </button>
                <button 
                  className="flex h-9 items-center justify-center gap-1 rounded-lg border border-hk-soft-beige bg-white px-2 text-[11px] font-medium text-hk-charcoal transition hover:border-[#C5A880] hover:bg-[#FAF8F5] disabled:opacity-40" 
                  disabled={pending} 
                  onClick={() => void mutate('duplicate', draft)}
                  title="Duplikat draft"
                >
                  <Copy className="h-3 w-3 text-sky-600" />
                  <span>Duplikat</span>
                </button>
                <button 
                  className="flex h-9 items-center justify-center gap-1 rounded-lg border border-hk-soft-beige bg-white px-2 text-[11px] font-medium text-hk-charcoal transition hover:border-[#C5A880] hover:bg-[#FAF8F5] disabled:opacity-40" 
                  disabled={pending || draft.status === 'ARCHIVED'} 
                  onClick={() => void mutate('archive', draft)}
                  title="Arsipkan draft"
                >
                  <Archive className="h-3 w-3 text-amber-600" />
                  <span>Arsipkan</span>
                </button>
                <button 
                  className="flex h-9 items-center justify-center gap-1 rounded-lg border border-red-100 bg-white px-2 text-[11px] font-medium text-red-700 transition hover:border-red-300 hover:bg-red-50 disabled:opacity-40" 
                  disabled={pending} 
                  onClick={() => void mutate('delete', draft)}
                  title="Hapus draft permanen"
                >
                  <Trash2 className="h-3 w-3 text-red-500" />
                  <span>Hapus</span>
                </button>
              </div>
            </div>
          </article>
        ))}
      </div>

      {/* Empty State */}
      {!filteredItems.length && (
        <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-hk-soft-beige bg-white py-12 text-center">
          <div className="flex h-14 w-14 items-center justify-center rounded-full bg-[#FAF8F5] text-hk-taupe mb-3">
            <Calendar className="h-6 w-6 text-[#C5A880]" />
          </div>
          <p className="text-base font-bold text-hk-charcoal">
            {search ? 'Tidak ada draft yang cocok dengan pencarian' : 'Belum ada draft. Buat draft pertama untuk mulai.'}
          </p>
          <p className="mt-1 text-xs text-hk-taupe max-w-sm">
            {search ? 'Coba ubah kata kunci pencarian atau filter status.' : 'Gunakan form di atas untuk membuat template undangan pertama Anda.'}
          </p>
        </div>
      )}
    </section>
  );
}
