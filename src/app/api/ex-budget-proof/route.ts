import { NextResponse } from "next/server";
import { writeFile, mkdir } from "node:fs/promises";
import path from "node:path";
import { randomBytes } from "node:crypto";
import { getSession } from "@/lib/session";

const ALLOWED = ["image/jpeg", "image/png", "image/webp", "application/pdf"];
const MAX = 5 * 1024 * 1024;

/**
 * HariKita - Upload Bukti Pembayaran Pos Anggaran (di LUAR layanan HariKita / "ex-").
 *
 * POST /api/ex-budget-proof (FormData: file)
 * Simpan ke public/uploads/ex-budget/{userId}/ lalu kembalikan { url, fileName }.
 * Terpisah total dari /api/upload/vendor-doc agar tidak bentrok dengan layanan.
 */
export async function POST(req: Request) {
  const session = await getSession();
  if (!session || !session.userId) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  let form: FormData;
  try {
    form = await req.formData();
  } catch {
    return NextResponse.json({ error: "invalid form" }, { status: 400 });
  }

  const file = form.get("file");
  if (!(file instanceof File)) {
    return NextResponse.json({ error: "File wajib diunggah." }, { status: 400 });
  }
  if (!ALLOWED.includes(file.type)) {
    return NextResponse.json({ error: "Tipe file harus JPG/PNG/WEBP/PDF." }, { status: 400 });
  }
  if (file.size > MAX) {
    return NextResponse.json({ error: "Ukuran maksimum 5MB." }, { status: 400 });
  }

  const ext =
    file.type === "image/png" ? "png"
    : file.type === "image/webp" ? "webp"
    : file.type === "application/pdf" ? "pdf"
    : "jpg";
  const name = `proof-${randomBytes(8).toString("hex")}.${ext}`;
  const dir = path.join(process.cwd(), "public", "uploads", "ex-budget", session.userId);
  await mkdir(dir, { recursive: true });
  await writeFile(path.join(dir, name), Buffer.from(await file.arrayBuffer()));

  return NextResponse.json({
    url: `/uploads/ex-budget/${session.userId}/${name}`,
    fileName: file.name,
  });
}
