"use client";

import React, { useState } from 'react';
import Link from 'next/link';
import { createStudioDraft, renameStudioDraft, duplicateStudioDraft, archiveStudioDraft, deleteStudioDraft } from '@/server/actions/invitation-studio';
import type { StudioDraftStatus } from '@/lib/invitation-studio/contracts';

type Draft = { id: string; name: string; status: StudioDraftStatus; versionNumber: number; updatedAt: string };
const button = 'min-h-11 rounded-lg border border-hk-soft-beige px-3 py-2 text-sm disabled:opacity-50';

export function StudioDraftList({ drafts }: { drafts: Draft[] }) {
  const [items, setItems] = useState(drafts);
  const [name, setName] = useState('');
  const [pending, setPending] = useState(false);
  const [error, setError] = useState('');
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
    setPending(true); setError('');
    try {
      if (action === 'create') {
        const result = await createStudioDraft({ name: value });
        if (!result.success) { setError(result.message); return; }
        setItems(current => [result.data, ...current]); setName(''); return;
      }
      if (!draft) return;
      const token = { draftId: draft.id, expectedVersion: draft.versionNumber, expectedStatus: draft.status };
      if (action === 'delete') {
        const result = await deleteStudioDraft({ ...token, confirmation });
        if (!result.success) { setError(result.message); return; }
        setItems(current => current.filter(item => item.id !== draft.id)); return;
      }
      const result = await (action === 'rename' ? renameStudioDraft({ ...token, name: value }) : action === 'duplicate' ? duplicateStudioDraft({ ...token, name: value }) : archiveStudioDraft(token));
      if (!result.success) { setError(result.message); return; }
      setItems(current => action === 'duplicate' ? [result.data, ...current] : current.map(item => item.id === draft.id ? result.data : item));
    } catch { setError('Koneksi gagal. Muat ulang untuk memeriksa hasil sebelum mencoba lagi.'); }
    finally { setPending(false); }
  }
  return <section className="space-y-5">
    <form className="flex flex-wrap gap-2" onSubmit={event => { event.preventDefault(); void mutate('create'); }}>
      <label className="flex min-w-0 flex-col gap-1">Nama draft<input required maxLength={100} value={name} onChange={event => setName(event.target.value)} className="min-h-11 rounded-lg border p-2" /></label>
      <button className={button} disabled={pending}>Buat draft</button>
    </form>
    {error && <p role="alert" className="break-words text-red-700">{error}</p>}
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">{items.map(draft => <article key={draft.id} className="min-w-0 space-y-3 rounded-2xl border border-hk-soft-beige bg-white p-5">
      <Link className="block min-h-11 break-words text-xl font-bold" href={`/admin/undangan-studio/${draft.id}`}>{draft.name}</Link>
      <p>{draft.status} · Versi {draft.versionNumber}</p>
      <p className="break-words text-xs">Terakhir disimpan: <time dateTime={draft.updatedAt}>{draft.updatedAt.replace('T', ' ').replace('.000Z', ' UTC')}</time></p>
      <div className="flex flex-wrap gap-2">
        <button className={button} disabled={pending || ['IN_REVIEW', 'ARCHIVED'].includes(draft.status)} onClick={() => void mutate('rename', draft)}>Ganti nama</button>
        <button className={button} disabled={pending} onClick={() => void mutate('duplicate', draft)}>Duplikat</button>
        <button className={button} disabled={pending || draft.status === 'ARCHIVED'} onClick={() => void mutate('archive', draft)}>Arsipkan</button>
        <button className={button} disabled={pending} onClick={() => void mutate('delete', draft)}>Hapus</button>
      </div>
    </article>)}</div>
    {!items.length && <p>Belum ada draft. Buat draft pertama untuk mulai.</p>}
  </section>;
}
