import { NextResponse } from "next/server";
import { readFile } from "node:fs/promises";
import path from "node:path";
import { getSession } from "@/lib/session";
import { prisma } from "@/lib/prisma";

const CONTENT_TYPES: Record<string, string> = {
  jpg: "image/jpeg",
  png: "image/png",
  webp: "image/webp",
  pdf: "application/pdf",
};

export async function GET(_req: Request, { params }: { params: Promise<{ token: string }> }) {
  const session = await getSession();
  if (!session?.userId || session.role !== "CLIENT") {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }
  const { token } = await params;
  if (!/^[a-f0-9]{32}$/.test(token)) return NextResponse.json({ error: "not found" }, { status: 404 });
  const proof = await prisma.budgetPaymentProof.findFirst({
    where: { userId: session.userId, fileUrl: `/api/ex-budget-proof/${token}` },
    select: { fileName: true },
  });
  if (!proof) return NextResponse.json({ error: "not found" }, { status: 404 });

  const dir = path.join(process.cwd(), "storage", "ex-budget", session.userId);
  for (const [ext, contentType] of Object.entries(CONTENT_TYPES)) {
    try {
      const bytes = await readFile(path.join(dir, `${token}.${ext}`));
      return new NextResponse(bytes, {
        headers: {
          "Content-Type": contentType,
          "Content-Disposition": `attachment; filename*=UTF-8''${encodeURIComponent(proof.fileName ?? `bukti.${ext}`)}`,
          "Cache-Control": "private, no-store",
          "X-Content-Type-Options": "nosniff",
        },
      });
    } catch {
      // Try the next allowlisted extension.
    }
  }
  return NextResponse.json({ error: "not found" }, { status: 404 });
}
