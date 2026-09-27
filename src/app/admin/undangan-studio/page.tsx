import type { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { getSession } from '@/lib/session';
import { loadAdminActor } from '@/server/auth/admin-guard';
import { listStudioDrafts } from '@/server/queries/invitation-studio';
import { StudioDraftList } from '@/components/admin/invitation-studio/StudioDraftList';
import { DashPageHeader } from '@/components/dashboard';
import type { StudioDraftStatus } from '@/lib/invitation-studio/contracts';

export const metadata: Metadata = { title: 'Studio Undangan — HariKita Admin', robots: { index: false, follow: false } };
export const dynamic = 'force-dynamic';

export default async function InvitationStudioPage() {
  const session = await getSession();
  const actor = session ? await loadAdminActor(session.userId) : null;
  if (!actor || actor.subRole !== 'SUPER_ADMIN') redirect('/unauthorized');
  const drafts = await listStudioDrafts();

  return (
    <div className="space-y-6 py-2">
      <DashPageHeader
        title="Studio Undangan Digital"
        description="Rancang, kelola, dan terbitkan template undangan visual interaktif untuk calon pengantin."
      />
      <StudioDraftList
        drafts={drafts.map(draft => ({
          id: draft.id,
          name: draft.name,
          status: draft.status as StudioDraftStatus,
          versionNumber: draft.versions[0]?.versionNumber ?? 0,
          updatedAt: draft.updatedAt.toISOString(),
        }))}
      />
    </div>
  );
}
