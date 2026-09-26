import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { getSession } from "@/lib/session";
import { loadAdminActor } from "@/server/auth/admin-guard";
import { listStudioDrafts } from "@/server/queries/invitation-studio";
import { DashButton } from "@/components/dashboard";

export const metadata: Metadata = { title: "Invitation Studio — HariKita", robots: { index: false, follow: false } };
export const dynamic = "force-dynamic";

export default async function InvitationStudioPage() {
  const session = await getSession();
  const actor = session ? await loadAdminActor(session.userId) : null;
  if (!actor || actor.subRole !== "SUPER_ADMIN") redirect("/unauthorized");
  const drafts = await listStudioDrafts();
  return <main className="min-h-screen bg-hk-ivory px-4 py-8 text-hk-charcoal sm:px-8"><div className="mx-auto max-w-6xl space-y-6"><header className="flex flex-wrap items-end justify-between gap-4"><div><p className="text-xs font-bold uppercase tracking-[0.25em] text-hk-taupe">SuperAdmin Studio</p><h1 className="font-editorial text-4xl font-bold">Undangan baru dari nol</h1><p className="mt-2 text-sm text-hk-taupe">Eksperimen tema terisolasi. Tema existing tetap aman.</p></div><DashButton disabled>+ Draft Baru</DashButton></header><div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">{drafts.map((draft) => <Link key={draft.id} href={`/admin/undangan-studio/${draft.id}`} className="rounded-2xl border border-hk-soft-beige bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"><div className="flex items-start justify-between gap-3"><h2 className="font-editorial text-2xl font-bold">{draft.name}</h2><span className="rounded-full bg-hk-ivory px-2 py-1 text-[10px] font-bold uppercase">{draft.status}</span></div><p className="mt-6 text-xs text-hk-taupe">{draft.versions[0] ? `Versi ${draft.versions[0].versionNumber}` : "Belum ada versi"}</p></Link>)}{drafts.length === 0 && <div className="col-span-full rounded-2xl border border-dashed border-hk-taupe/30 bg-white/60 p-12 text-center text-sm text-hk-taupe">Belum ada draft. Buat draft pertama untuk mulai eksplorasi.</div>}</div></div></main>;
}
