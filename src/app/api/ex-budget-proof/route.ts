import { NextResponse } from "next/server";
import { mkdir, unlink, writeFile } from "node:fs/promises";
import path from "node:path";
import { randomBytes } from "node:crypto";
import { getSession } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import { checkRateLimit } from "@/lib/rate-limit";

const MAX = 5 * 1024 * 1024;
const TYPES: Record<string, { ext: string; signature: (bytes: Uint8Array) => boolean }> = {
  "image/jpeg": { ext: "jpg", signature: (b) => b[0] === 0xff && b[1] === 0xd8 && b[2] === 0xff },
  "image/png": { ext: "png", signature: (b) => b[0] === 0x89 && b[1] === 0x50 && b[2] === 0x4e && b[3] === 0x47 },
  "image/webp": { ext: "webp", signature: (b) => Buffer.from(b.slice(0, 4)).toString() === "RIFF" && Buffer.from(b.slice(8, 12)).toString() === "WEBP" },
  "application/pdf": { ext: "pdf", signature: (b) => Buffer.from(b.slice(0, 5)).toString() === "%PDF-" },
};

const safeOriginalName = (name: string) =>
  path.basename(name).replace(/[\x00-\x1f\x7f]/g, "").slice(0, 120) || "bukti-pembayaran";

export async function POST(req: Request) {
  const session = await getSession();
  if (!session?.userId) return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  if (session.role !== "CLIENT") return NextResponse.json({ error: "forbidden" }, { status: 403 });
  const rate = checkRateLimit({ key: `ex-budget-proof:${session.userId}`, limit: 10, windowMs: 60_000 });
  if (!rate.allowed) return NextResponse.json({ error: "Terlalu banyak unggahan. Coba lagi nanti." }, { status: 429 });

  try {
    const contentLengthHeader = req.headers.get("content-length");
    const contentLength = Number(contentLengthHeader);
    if (!contentLengthHeader || !Number.isFinite(contentLength) || contentLength > MAX + 64 * 1024) {
      return NextResponse.json({ error: "Ukuran maksimum 5MB." }, { status: 413 });
    }
    const form = await req.formData();
    const file = form.get("file");
    const budgetItemId = form.get("budgetItemId");
    if (!(file instanceof File) || typeof budgetItemId !== "string") {
      return NextResponse.json({ error: "File dan pos anggaran wajib diisi." }, { status: 400 });
    }
    const type = TYPES[file.type];
    if (!type) return NextResponse.json({ error: "Tipe file harus JPG/PNG/WEBP/PDF." }, { status: 400 });
    if (file.size <= 0 || file.size > MAX) {
      return NextResponse.json({ error: "Ukuran file harus antara 1 byte dan 5MB." }, { status: 400 });
    }
    const item = await prisma.weddingBudgetItem.findFirst({
      where: { id: budgetItemId, userId: session.userId, isExternal: true, linkMode: "MANUAL" },
      select: { id: true },
    });
    if (!item) return NextResponse.json({ error: "Pos anggaran tidak ditemukan." }, { status: 404 });
    const proofCount = await prisma.budgetPaymentProof.count({ where: { userId: session.userId } });
    if (proofCount >= 50) {
      return NextResponse.json({ error: "Batas 50 bukti pembayaran telah tercapai." }, { status: 409 });
    }

    const bytes = new Uint8Array(await file.arrayBuffer());
    if (!type.signature(bytes)) {
      return NextResponse.json({ error: "Isi file tidak sesuai dengan tipe file." }, { status: 400 });
    }
    const token = randomBytes(16).toString("hex");
    const storedName = `${token}.${type.ext}`;
    const dir = path.join(process.cwd(), "storage", "ex-budget", session.userId);
    const storedPath = path.join(dir, storedName);
    await mkdir(dir, { recursive: true });
    await writeFile(storedPath, bytes, { flag: "wx" });
    try {
      const proof = await prisma.budgetPaymentProof.create({
        data: {
          userId: session.userId,
          budgetItemId,
          fileUrl: `/api/ex-budget-proof/${token}`,
          fileName: safeOriginalName(file.name),
          paidAt: new Date(),
        },
        select: { id: true },
      });
      return NextResponse.json({ success: true, proofId: proof.id });
    } catch (error) {
      await unlink(storedPath).catch(() => undefined);
      throw error;
    }
  } catch (error) {
    console.error("ex-budget proof upload failed", error);
    return NextResponse.json({ error: "Bukti gagal diunggah." }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  const session = await getSession();
  if (!session?.userId) return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  if (session.role !== "CLIENT") return NextResponse.json({ error: "forbidden" }, { status: 403 });
  try {
    const { proofId } = (await req.json()) as { proofId?: string };
    if (!proofId) return NextResponse.json({ error: "Bukti tidak valid." }, { status: 400 });
    const proof = await prisma.budgetPaymentProof.findFirst({
      where: { id: proofId, userId: session.userId },
      select: { id: true, fileUrl: true },
    });
    if (!proof) return NextResponse.json({ error: "Bukti tidak ditemukan." }, { status: 404 });
    await prisma.budgetPaymentProof.delete({ where: { id: proof.id } });
    const token = proof.fileUrl.split("/").at(-1);
    if (token && /^[a-f0-9]{32}$/.test(token)) {
      const dir = path.join(process.cwd(), "storage", "ex-budget", session.userId);
      await Promise.all(Object.values(TYPES).map(({ ext }) => unlink(path.join(dir, `${token}.${ext}`)).catch(() => undefined)));
    }
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("ex-budget proof delete failed", error);
    return NextResponse.json({ error: "Bukti gagal dihapus." }, { status: 500 });
  }
}
