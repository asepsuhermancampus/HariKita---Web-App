import { notFound, redirect } from "next/navigation";
import { getSession } from "@/lib/session";
import { loadAdminActor } from "@/server/auth/admin-guard";
import { getStudioDraft } from "@/server/queries/invitation-studio";
import { StudioShell } from "@/components/admin/invitation-studio/StudioShell";

export default async function InvitationStudioEditorPage({ params }: { params: Promise<{ draftId: string }> }) {
  const session = await getSession();
  const actor = session ? await loadAdminActor(session.userId) : null;
  if (!actor || actor.subRole !== "SUPER_ADMIN") redirect("/unauthorized");
  const { draftId } = await params;
  const draft = await getStudioDraft(draftId);
  if (!draft || !draft.versions[0]) notFound();
  return <StudioShell draft={draft} version={draft.versions[0]} />;
}
