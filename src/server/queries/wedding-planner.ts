import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/session";
import { toWibDateString, diffCalendarDaysWIB } from "@/lib/date-utils";
import { ensureWeddingPlannerSeeded } from "@/server/services/wedding-planner-seed";

export interface ReadinessDTO {
  timeline: { done: number; total: number; pct: number };
  kua: { done: number; total: number; pct: number };
  budget: { estimated: number; paid: number; remaining: number; pctRealized: number };
  overallPct: number;
}

function pct(done: number, total: number): number {
  if (total <= 0) return 0;
  return Math.max(0, Math.min(100, Math.round((done / total) * 100)));
}

interface ResolvableBudgetItem {
  linkMode: string;
  estimatedAmount: number;
  paidAmount: number;
  status?: string;
  linkedOrderItem: {
    subtotal: number;
    status?: string;
    order: {
      totalAmount: number;
      installments: { amount: number; status: string }[];
      refunds?: { amount: number; status: string }[];
    };
  } | null;
}

export function resolveBudgetAmounts(item: ResolvableBudgetItem) {
  if (item.linkMode !== "AUTO" || !item.linkedOrderItem) {
    return {
      estimatedAmount: item.estimatedAmount,
      paidAmount: item.paidAmount,
      status: item.status ?? (item.paidAmount >= item.estimatedAmount && item.estimatedAmount > 0 ? "LUNAS" : item.paidAmount > 0 ? "DP" : "BELUM"),
    };
  }
  if (["REJECTED", "CANCELLED"].includes(item.linkedOrderItem.status ?? "")) {
    return { estimatedAmount: 0, paidAmount: 0, status: "BELUM" };
  }
  const estimatedAmount = item.linkedOrderItem.subtotal;
  const order = item.linkedOrderItem.order;
  const grossPaid = order.installments
    .filter((installment) => installment.status === "PAID")
    .reduce((sum, installment) => sum + installment.amount, 0);
  const refunded = (order.refunds ?? [])
    .filter((refund) => refund.status === "PAID")
    .reduce((sum, refund) => sum + refund.amount, 0);
  const orderPaid = Math.max(0, grossPaid - refunded);
  const paidAmount = order.totalAmount > 0
    ? Math.min(estimatedAmount, Math.round((orderPaid * estimatedAmount) / order.totalAmount))
    : 0;
  return {
    estimatedAmount,
    paidAmount,
    status: paidAmount >= estimatedAmount && estimatedAmount > 0 ? "LUNAS" : paidAmount > 0 ? "DP" : "BELUM",
  };
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
  return session?.role === "CLIENT" ? session.userId : null;
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
    include: {
      linkedOrderItem: { include: { order: { include: { installments: true, refunds: true } } } },
      proofs: { where: { userId }, orderBy: { createdAt: "desc" } },
    },
    orderBy: [{ sortOrder: "asc" }],
  });
  return rows.map((b) => {
    const amounts = resolveBudgetAmounts(b);
    return {
    id: b.id, category: b.category, itemName: b.itemName, pic: b.pic,
    estimatedAmount: amounts.estimatedAmount, paidAmount: amounts.paidAmount, status: amounts.status,
    note: b.note, isExternal: b.isExternal, linkMode: b.linkMode,
    linkedOrderItemId: b.linkedOrderItemId,
    linkedOrderLabel:
      b.linkedOrderItem?.packageName ?? b.linkedOrderItem?.serviceName ?? null,
    proofs: b.proofs.map((p) => ({
      id: p.id, fileUrl: p.fileUrl, fileName: p.fileName, amount: p.amount,
    })),
    };
  });
}

export interface EmergencyDTO {
  id: string; itemText: string; isPacked: boolean; isCustom: boolean;
}

export async function getEmergencyItems(): Promise<EmergencyDTO[]> {
  const userId = await currentUserId();
  if (!userId) return [];
  const rows = await prisma.weddingEmergencyItem.findMany({
    where: { userId },
    orderBy: [{ sortOrder: "asc" }],
  });
  return rows.map((e) => ({
    id: e.id,
    itemText: e.itemText,
    isPacked: e.isPacked,
    isCustom: e.seedKey === null,
  }));
}

export async function getWeddingReadiness(): Promise<ReadinessDTO> {
  const userId = await currentUserId();
  if (!userId) {
    return computeReadiness({
      timelineDone: 0, timelineTotal: 0, kuaDone: 0, kuaTotal: 0,
      budgetEstimated: 0, budgetPaid: 0,
    });
  }
  const [timelineTotal, timelineDone, kuaTotal, kuaDone, budgetItems] = await Promise.all([
    prisma.weddingTask.count({ where: { userId } }),
    prisma.weddingTask.count({ where: { userId, isDone: true } }),
    prisma.kuaRequirement.count({
      where: { userId, OR: [{ isRequired: true }, { isActive: true }] },
    }),
    prisma.kuaRequirement.count({
      where: { userId, isDone: true, OR: [{ isRequired: true }, { isActive: true }] },
    }),
    prisma.weddingBudgetItem.findMany({
      where: { userId },
      include: { linkedOrderItem: { include: { order: { include: { installments: true, refunds: true } } } } },
    }),
  ]);
  const budget = budgetItems.reduce(
    (total, item) => {
      const amounts = resolveBudgetAmounts(item);
      total.estimated += amounts.estimatedAmount;
      total.paid += amounts.paidAmount;
      return total;
    },
    { estimated: 0, paid: 0 }
  );
  return computeReadiness({
    timelineDone, timelineTotal, kuaDone, kuaTotal,
    budgetEstimated: budget.estimated,
    budgetPaid: budget.paid,
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
  await ensureWeddingPlannerSeeded(userId);
  const seededReadiness = await getWeddingReadiness();

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
    where: {
      order: { userId },
      scheduledDate: { gte: new Date() },
      status: { in: ["SCHEDULED", "RESCHEDULED"] },
    },
    orderBy: { scheduledDate: "asc" },
  });

  return {
    readiness: seededReadiness,
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
