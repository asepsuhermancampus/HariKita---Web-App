import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/session";
import { toWibDateString, diffCalendarDaysWIB } from "@/lib/date-utils";

export interface ReadinessDTO {
  timeline: { done: number; total: number; pct: number };
  kua: { done: number; total: number; pct: number };
  budget: { estimated: number; paid: number; remaining: number; pctRealized: number };
  overallPct: number;
}

function pct(done: number, total: number): number {
  if (total <= 0) return 0;
  return Math.round((done / total) * 100);
}

/** Fungsi murni (mudah diuji tanpa DB). */
export function computeReadiness(input: {
  timelineDone: number;
  timelineTotal: number;
  kuaDone: number;
  kuaTotal: number;
  budgetEstimated: number;
  budgetPaid: number;
}): ReadinessDTO {
  const timelinePct = pct(input.timelineDone, input.timelineTotal);
  const kuaPct = pct(input.kuaDone, input.kuaTotal);
  const budgetPct =
    input.budgetEstimated > 0
      ? Math.min(100, Math.round((input.budgetPaid / input.budgetEstimated) * 100))
      : 0;
  const overallPct = Math.round((timelinePct + kuaPct + budgetPct) / 3);
  return {
    timeline: { done: input.timelineDone, total: input.timelineTotal, pct: timelinePct },
    kua: { done: input.kuaDone, total: input.kuaTotal, pct: kuaPct },
    budget: {
      estimated: input.budgetEstimated,
      paid: input.budgetPaid,
      remaining: Math.max(0, input.budgetEstimated - input.budgetPaid),
      pctRealized: budgetPct,
    },
    overallPct,
  };
}

async function currentUserId(): Promise<string | null> {
  const session = await getSession();
  return session?.userId ?? null;
}

export interface WeddingTaskDTO {
  id: string; stage: number; taskText: string; pic: string | null;
  priority: string; note: string | null; isDone: boolean; isCustom: boolean;
}

export async function getWeddingTasks(): Promise<WeddingTaskDTO[]> {
  const userId = await currentUserId();
  if (!userId) return [];
  const rows = await prisma.weddingTask.findMany({
    where: { userId },
    orderBy: [{ stage: "asc" }, { sortOrder: "asc" }],
  });
  return rows.map((t) => ({
    id: t.id, stage: t.stage, taskText: t.taskText, pic: t.pic,
    priority: t.priority, note: t.note, isDone: t.isDone, isCustom: t.isCustom,
  }));
}

export interface KuaDTO {
  id: string; category: string; docName: string; party: string | null;
  docFormat: string | null; institution: string | null; note: string | null;
  isRequired: boolean; isActive: boolean; isDone: boolean; isCustom: boolean;
}

export async function getKuaRequirements(): Promise<KuaDTO[]> {
  const userId = await currentUserId();
  if (!userId) return [];
  const rows = await prisma.kuaRequirement.findMany({
    where: { userId },
    orderBy: [{ sortOrder: "asc" }],
  });
  return rows.map((k) => ({
    id: k.id, category: k.category, docName: k.docName, party: k.party,
    docFormat: k.docFormat, institution: k.institution, note: k.note,
    isRequired: k.isRequired, isActive: k.isActive, isDone: k.isDone, isCustom: k.isCustom,
  }));
}

export interface BudgetItemDTO {
  id: string; category: string; itemName: string; pic: string | null;
  estimatedAmount: number; paidAmount: number; status: string; note: string | null;
  isExternal: boolean; linkMode: string;
  linkedOrderItemId: string | null;
  linkedOrderLabel: string | null;
  proofs: { id: string; fileUrl: string; fileName: string | null; amount: number | null }[];
}

export async function getBudgetItems(): Promise<BudgetItemDTO[]> {
  const userId = await currentUserId();
  if (!userId) return [];
  const rows = await prisma.weddingBudgetItem.findMany({
    where: { userId },
    include: { linkedOrderItem: true, proofs: { orderBy: { createdAt: "desc" } } },
    orderBy: [{ sortOrder: "asc" }],
  });
  return rows.map((b) => ({
    id: b.id, category: b.category, itemName: b.itemName, pic: b.pic,
    estimatedAmount: b.estimatedAmount, paidAmount: b.paidAmount, status: b.status,
    note: b.note, isExternal: b.isExternal, linkMode: b.linkMode,
    linkedOrderItemId: b.linkedOrderItemId,
    linkedOrderLabel:
      b.linkedOrderItem?.packageName ?? b.linkedOrderItem?.serviceName ?? null,
    proofs: b.proofs.map((p) => ({
      id: p.id, fileUrl: p.fileUrl, fileName: p.fileName, amount: p.amount,
    })),
  }));
}

export interface EmergencyDTO {
  id: string; itemText: string; isPacked: boolean;
}

export async function getEmergencyItems(): Promise<EmergencyDTO[]> {
  const userId = await currentUserId();
  if (!userId) return [];
  const rows = await prisma.weddingEmergencyItem.findMany({
    where: { userId },
    orderBy: [{ sortOrder: "asc" }],
  });
  return rows.map((e) => ({ id: e.id, itemText: e.itemText, isPacked: e.isPacked }));
}

export async function getWeddingReadiness(): Promise<ReadinessDTO> {
  const userId = await currentUserId();
  if (!userId) {
    return computeReadiness({
      timelineDone: 0, timelineTotal: 0, kuaDone: 0, kuaTotal: 0,
      budgetEstimated: 0, budgetPaid: 0,
    });
  }
  const [timelineTotal, timelineDone, kuaTotal, kuaDone, budgetAgg] = await Promise.all([
    prisma.weddingTask.count({ where: { userId } }),
    prisma.weddingTask.count({ where: { userId, isDone: true } }),
    prisma.kuaRequirement.count({
      where: { userId, OR: [{ isRequired: true }, { isActive: true }] },
    }),
    prisma.kuaRequirement.count({ where: { userId, isDone: true } }),
    prisma.weddingBudgetItem.aggregate({
      where: { userId },
      _sum: { estimatedAmount: true, paidAmount: true },
    }),
  ]);
  return computeReadiness({
    timelineDone, timelineTotal, kuaDone, kuaTotal,
    budgetEstimated: budgetAgg._sum.estimatedAmount ?? 0,
    budgetPaid: budgetAgg._sum.paidAmount ?? 0,
  });
}

export interface PlannerOverview {
  readiness: ReadinessDTO;
  daysUntilEvent: number | null;
  eventDate: string | null;
  coupleName: string;
  partnerName: string | null;
  nextSession: { title: string; scheduledDate: string; location: string } | null;
}

export async function getClientPlannerOverview(): Promise<PlannerOverview> {
  const userId = await currentUserId();
  const readiness = await getWeddingReadiness();
  const empty: PlannerOverview = {
    readiness,
    daysUntilEvent: null, eventDate: null, coupleName: "Calon Pengantin",
    partnerName: null, nextSession: null,
  };
  if (!userId) return empty;

  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: { clientProfile: true },
  });
  const eventDate = user?.clientProfile?.eventDate
    ? toWibDateString(user.clientProfile.eventDate)
    : null;
  const today = toWibDateString(new Date());
  const daysUntilEvent = eventDate ? diffCalendarDaysWIB(eventDate, today) : null;

  const next = await prisma.physicalSession.findFirst({
    where: { order: { userId } },
    orderBy: { scheduledDate: "asc" },
  });

  return {
    readiness,
    daysUntilEvent,
    eventDate,
    coupleName: user?.name ?? "Calon Pengantin",
    partnerName: user?.clientProfile?.partnerName ?? null,
    nextSession: next
      ? {
          title: next.notes || next.type,
          scheduledDate: toWibDateString(next.scheduledDate),
          location: next.location,
        }
      : null,
  };
}
