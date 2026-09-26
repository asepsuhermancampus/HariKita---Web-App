import type { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { getSession } from '@/lib/session';
import { loadAdminActor } from '@/server/auth/admin-guard';
import { listStudioDrafts } from '@/server/queries/invitation-studio';
import { StudioDraftList } from '@/components/admin/invitation-studio/StudioDraftList';
import type { StudioDraftStatus } from '@/lib/invitation-studio/contracts';

export const metadata: Metadata = { title: 'Invitation Studio — HariKita', robots: { index: false, follow: false } };
export const dynamic = 'force-dynamic';

export default async function InvitationStudioPage() {
  const session = await getSession();
  const actor = session ? await loadAdminActor(session.userId) : null;
  if (!actor || actor.subRole !== 'SUPER_ADMIN') redirect('/unauthorized');
  const drafts = await listStudioDrafts();
  return <main className="min-h-screen bg-hk-ivory px-4 py-8 text-hk-charcoal sm:px-8"><div className="mx-auto max-w-6xl space-y-6">
    <header><p className="text-xs font-bold uppercase tracking-widest">SuperAdmin Studio</p><h1 className="font-editorial text-4xl font-bold">Undangan baru dari nol</h1></header>
    <StudioDraftList drafts={drafts.map(draft => ({ id: draft.id, name: draft.name, status: draft.status as StudioDraftStatus, versionNumber: draft.versions[0]?.versionNumber ?? 0, updatedAt: draft.updatedAt.toISOString() }))} />
  </div></main>;
}
