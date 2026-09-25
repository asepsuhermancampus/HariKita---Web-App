"use server";

import { revalidatePath } from "next/cache";
import { unlink } from "node:fs/promises";
import path from "node:path";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/session";
import {
  validateBudgetItemInput,
  validateTaskInput,
  validateKuaInput,
} from "@/lib/validations/wedding-planner";

export interface PlannerActionResult {
  success: boolean;
  message?: string;
  error?: string;
  fieldErrors?: Record<string, string[]>;
}

function revalidatePlanner() {
  revalidatePath("/client");
  revalidatePath("/client/perencanaan");
  revalidatePath("/client/berkas-kua");
  revalidatePath("/client/anggaran");
  revalidatePath("/client/emergency");
}

async function requireUserId(): Promise<string | null> {
  const session = await getSession();
  return session?.role === "CLIENT" ? session.userId : null;
}

const s = (fd: FormData, k: string) => {
  const v = fd.get(k);
  return typeof v === "string" ? v : "";
};

// TASKS
export async function addPlannerTask(formData: FormData): Promise<PlannerActionResult> {
  const userId = await requireUserId();
  if (!userId) return { success: false, error: "Sesi berakhir. Silakan masuk kembali." };

  const validation = validateTaskInput({
    taskText: s(formData, "taskText"),
    stage: s(formData, "stage"),
    pic: s(formData, "pic"),
    priority: s(formData, "priority"),
    note: s(formData, "note"),
  });
  if (!validation.success || !validation.data)
    return { success: false, error: "Data belum valid.", fieldErrors: validation.errors };

  const max = await prisma.weddingTask.aggregate({ where: { userId }, _max: { sortOrder: true } });
  await prisma.weddingTask.create({
    data: { userId, ...validation.data, isCustom: true, sortOrder: (max._max.sortOrder ?? 0) + 1 },
  });
  revalidatePlanner();
  return { success: true, message: "Tugas baru ditambahkan." };
}

export async function togglePlannerTask(id: string, isDone: boolean): Promise<PlannerActionResult> {
  const userId = await requireUserId();
  if (!userId) return { success: false, error: "Sesi berakhir." };
  const res = await prisma.weddingTask.updateMany({
    where: { id, userId },
    data: { isDone, doneAt: isDone ? new Date() : null },
  });
  if (res.count === 0) return { success: false, error: "Tugas tidak ditemukan." };
  revalidatePlanner();
  return { success: true };
}

export async function updatePlannerTask(formData: FormData): Promise<PlannerActionResult> {
  const userId = await requireUserId();
  if (!userId) return { success: false, error: "Sesi berakhir." };
  const id = s(formData, "id");
  const validation = validateTaskInput({
    taskText: s(formData, "taskText"),
    stage: s(formData, "stage"),
    pic: s(formData, "pic"),
    priority: s(formData, "priority"),
    note: s(formData, "note"),
  });
  if (!validation.success || !validation.data)
    return { success: false, error: "Data belum valid.", fieldErrors: validation.errors };
  const res = await prisma.weddingTask.updateMany({ where: { id, userId }, data: validation.data });
  if (res.count === 0) return { success: false, error: "Tugas tidak ditemukan." };
  revalidatePlanner();
  return { success: true, message: "Tugas diperbarui." };
}

export async function deletePlannerTask(id: string): Promise<PlannerActionResult> {
  const userId = await requireUserId();
  if (!userId) return { success: false, error: "Sesi berakhir." };
  const res = await prisma.weddingTask.deleteMany({ where: { id, userId, isCustom: true } });
  if (res.count === 0) return { success: false, error: "Tugas tidak ditemukan." };
  revalidatePlanner();
  return { success: true };
}

export async function resetTimelineToDefault(): Promise<PlannerActionResult> {
  const userId = await requireUserId();
  if (!userId) return { success: false, error: "Sesi berakhir." };
  const { DEFAULT_TASKS } = await import("@/server/services/wedding-planner-seed");
  await prisma.$transaction([
    prisma.weddingTask.deleteMany({ where: { userId } }),
    prisma.weddingTask.createMany({
      data: DEFAULT_TASKS.map((t, i) => ({
        userId,
        stage: t.stage,
        taskText: t.taskText,
        pic: t.pic,
        priority: t.priority,
        note: t.note,
        sortOrder: i,
        seedKey: `task-${i}`,
      })),
    }),
  ]);
  revalidatePlanner();
  return { success: true, message: "Timeline direset ke pengaturan awal." };
}

// KUA
export async function toggleKuaDone(id: string, isDone: boolean): Promise<PlannerActionResult> {
  const userId = await requireUserId();
  if (!userId) return { success: false, error: "Sesi berakhir." };
  const res = await prisma.kuaRequirement.updateMany({
    where: { id, userId, OR: [{ isRequired: true }, { isActive: true }] },
    data: { isDone, doneAt: isDone ? new Date() : null },
  });
  if (res.count === 0) return { success: false, error: "Berkas tidak ditemukan." };
  revalidatePlanner();
  return { success: true };
}

export async function toggleKuaActive(id: string, isActive: boolean): Promise<PlannerActionResult> {
  const userId = await requireUserId();
  if (!userId) return { success: false, error: "Sesi berakhir." };
  const res = await prisma.kuaRequirement.updateMany({
    where: { id, userId, isRequired: false },
    data: isActive ? { isActive: true } : { isActive: false, isDone: false, doneAt: null },
  });
  if (res.count === 0) return { success: false, error: "Berkas opsional tidak ditemukan." };
  revalidatePlanner();
  return { success: true };
}

export async function addCustomKua(formData: FormData): Promise<PlannerActionResult> {
  const userId = await requireUserId();
  if (!userId) return { success: false, error: "Sesi berakhir." };
  const validation = validateKuaInput({
    category: s(formData, "category") || "9. Berkas Khusus (Opsional)",
    docName: s(formData, "docName"),
    institution: s(formData, "institution"),
    note: s(formData, "note"),
  });
  if (!validation.success || !validation.data)
    return { success: false, error: "Data belum valid.", fieldErrors: validation.errors };
  const max = await prisma.kuaRequirement.aggregate({ where: { userId }, _max: { sortOrder: true } });
  await prisma.kuaRequirement.create({
    data: {
      userId,
      ...validation.data,
      isRequired: false,
      isActive: true,
      isCustom: true,
      sortOrder: (max._max.sortOrder ?? 0) + 1,
    },
  });
  revalidatePlanner();
  return { success: true, message: "Berkas khusus ditambahkan." };
}

export async function updateKua(formData: FormData): Promise<PlannerActionResult> {
  const userId = await requireUserId();
  if (!userId) return { success: false, error: "Sesi berakhir." };
  const id = s(formData, "id");
  const validation = validateKuaInput({
    category: s(formData, "category"),
    docName: s(formData, "docName"),
    institution: s(formData, "institution"),
    note: s(formData, "note"),
  });
  if (!validation.success || !validation.data)
    return { success: false, error: "Data belum valid.", fieldErrors: validation.errors };
  const res = await prisma.kuaRequirement.updateMany({ where: { id, userId }, data: validation.data });
  if (res.count === 0) return { success: false, error: "Berkas tidak ditemukan." };
  revalidatePlanner();
  return { success: true, message: "Berkas diperbarui." };
}

export async function deleteKua(id: string): Promise<PlannerActionResult> {
  const userId = await requireUserId();
  if (!userId) return { success: false, error: "Sesi berakhir." };
  const res = await prisma.kuaRequirement.deleteMany({ where: { id, userId, isCustom: true } });
  if (res.count === 0) return { success: false, error: "Hanya berkas tambahan sendiri yang dapat dihapus." };
  revalidatePlanner();
  return { success: true };
}

// BUDGET
export async function addBudgetItem(formData: FormData): Promise<PlannerActionResult> {
  const userId = await requireUserId();
  if (!userId) return { success: false, error: "Sesi berakhir." };
  const validation = validateBudgetItemInput({
    category: s(formData, "category"),
    itemName: s(formData, "itemName"),
    pic: s(formData, "pic"),
    estimatedAmount: s(formData, "estimatedAmount"),
    paidAmount: s(formData, "paidAmount"),
    status: s(formData, "status"),
    note: s(formData, "note"),
    isExternal: true,
    linkMode: "MANUAL",
  });
  if (!validation.success || !validation.data)
    return { success: false, error: "Data belum valid.", fieldErrors: validation.errors };
  const max = await prisma.weddingBudgetItem.aggregate({
    where: { userId },
    _max: { sortOrder: true },
  });
  await prisma.weddingBudgetItem.create({
    data: { userId, ...validation.data, sortOrder: (max._max.sortOrder ?? 0) + 1 },
  });
  revalidatePlanner();
  return { success: true, message: "Pos anggaran ditambahkan." };
}

export async function updateBudgetItem(formData: FormData): Promise<PlannerActionResult> {
  const userId = await requireUserId();
  if (!userId) return { success: false, error: "Sesi berakhir." };
  const id = s(formData, "id");
  const validation = validateBudgetItemInput({
    category: s(formData, "category"),
    itemName: s(formData, "itemName"),
    pic: s(formData, "pic"),
    estimatedAmount: s(formData, "estimatedAmount"),
    paidAmount: s(formData, "paidAmount"),
    status: s(formData, "status"),
    note: s(formData, "note"),
    isExternal: true,
    linkMode: "MANUAL",
  });
  if (!validation.success || !validation.data)
    return { success: false, error: "Data belum valid.", fieldErrors: validation.errors };
  const existing = await prisma.weddingBudgetItem.findFirst({
    where: { id, userId },
    select: { linkedOrderItemId: true },
  });
  if (!existing) return { success: false, error: "Pos anggaran tidak ditemukan." };
  if (existing.linkedOrderItemId) {
    return { success: false, error: "Lepas tautan pesanan sebelum mengubah pos anggaran." };
  }
  // AUTO tidak menyimpan nominal ganda; dibaca dari Order saat render.
  const data =
    validation.data.linkMode === "AUTO"
      ? { ...validation.data, estimatedAmount: 0, paidAmount: 0 }
      : validation.data;
  const res = await prisma.weddingBudgetItem.updateMany({ where: { id, userId }, data });
  if (res.count === 0) return { success: false, error: "Pos anggaran tidak ditemukan." };
  revalidatePlanner();
  return { success: true, message: "Pos anggaran diperbarui." };
}

export async function deleteBudgetItem(id: string): Promise<PlannerActionResult> {
  const userId = await requireUserId();
  if (!userId) return { success: false, error: "Sesi berakhir." };
  const item = await prisma.weddingBudgetItem.findFirst({
    where: { id, userId },
    select: { proofs: { select: { fileUrl: true } } },
  });
  if (!item) return { success: false, error: "Pos anggaran tidak ditemukan." };
  const res = await prisma.weddingBudgetItem.deleteMany({ where: { id, userId } });
  if (res.count === 0) return { success: false, error: "Pos anggaran tidak ditemukan." };
  await Promise.all(item.proofs.map(async ({ fileUrl }) => {
    const token = fileUrl.split("/").at(-1);
    if (!token || !/^[a-f0-9]{32}$/.test(token)) return;
    const dir = path.join(process.cwd(), "storage", "ex-budget", userId);
    await Promise.all(["jpg", "png", "webp", "pdf"].map((ext) =>
      unlink(path.join(dir, `${token}.${ext}`)).catch(() => undefined)
    ));
  }));
  revalidatePlanner();
  return { success: true };
}

export async function linkBudgetToOrderItem(
  id: string,
  orderItemId: string,
  linkMode: "MANUAL" | "AUTO"
): Promise<PlannerActionResult> {
  const userId = await requireUserId();
  if (!userId) return { success: false, error: "Sesi berakhir." };
  if (linkMode !== "MANUAL" && linkMode !== "AUTO") {
    return { success: false, error: "Mode tautan tidak valid." };
  }

  // Pastikan OrderItem benar-benar milik order klien ini (anti-IDOR).
  const owns = await prisma.orderItem.findFirst({
    where: { id: orderItemId, order: { userId } },
  });
  if (!owns) return { success: false, error: "Pesanan tidak ditemukan untuk akun ini." };
  const proofCount = await prisma.budgetPaymentProof.count({ where: { budgetItemId: id, userId } });
  if (proofCount > 0) return { success: false, error: "Hapus bukti pembayaran sebelum menautkan pos." };

  const res = await prisma.weddingBudgetItem.updateMany({
    where: { id, userId },
    data: {
      linkedOrderItemId: orderItemId,
      linkMode,
      isExternal: false,
      ...(linkMode === "AUTO" ? { estimatedAmount: 0, paidAmount: 0 } : {}),
    },
  });
  if (res.count === 0) return { success: false, error: "Pos anggaran tidak ditemukan." };
  revalidatePlanner();
  return { success: true, message: "Pos ditautkan ke pesanan HariKita." };
}

export async function unlinkBudgetItem(id: string): Promise<PlannerActionResult> {
  const userId = await requireUserId();
  if (!userId) return { success: false, error: "Sesi berakhir." };
  const res = await prisma.weddingBudgetItem.updateMany({
    where: { id, userId },
    data: { linkedOrderItemId: null, linkMode: "MANUAL", isExternal: true },
  });
  if (res.count === 0) return { success: false, error: "Pos anggaran tidak ditemukan." };
  revalidatePlanner();
  return { success: true, message: "Tautan pesanan dilepas." };
}

// EMERGENCY
export async function toggleEmergencyItem(
  id: string,
  isPacked: boolean
): Promise<PlannerActionResult> {
  const userId = await requireUserId();
  if (!userId) return { success: false, error: "Sesi berakhir." };
  const res = await prisma.weddingEmergencyItem.updateMany({
    where: { id, userId },
    data: { isPacked },
  });
  if (res.count === 0) return { success: false, error: "Item tidak ditemukan." };
  revalidatePlanner();
  return { success: true };
}

export async function addEmergencyItem(formData: FormData): Promise<PlannerActionResult> {
  const userId = await requireUserId();
  if (!userId) return { success: false, error: "Sesi berakhir." };
  const itemText = s(formData, "itemText").trim();
  if (!itemText) return { success: false, error: "Nama item wajib diisi." };
  if (itemText.length > 150) return { success: false, error: "Nama item maksimal 150 karakter." };
  const max = await prisma.weddingEmergencyItem.aggregate({
    where: { userId },
    _max: { sortOrder: true },
  });
  await prisma.weddingEmergencyItem.create({
    data: { userId, itemText, sortOrder: (max._max.sortOrder ?? 0) + 1 },
  });
  revalidatePlanner();
  return { success: true, message: "Item ditambahkan." };
}

export async function deleteEmergencyItem(id: string): Promise<PlannerActionResult> {
  const userId = await requireUserId();
  if (!userId) return { success: false, error: "Sesi berakhir." };
  const res = await prisma.weddingEmergencyItem.deleteMany({ where: { id, userId, seedKey: null } });
  if (res.count === 0) return { success: false, error: "Item tidak ditemukan." };
  revalidatePlanner();
  return { success: true };
}
