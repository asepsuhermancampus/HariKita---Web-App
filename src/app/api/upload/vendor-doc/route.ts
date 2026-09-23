import { NextResponse } from "next/server";
import { writeFile, mkdir } from "node:fs/promises";
import path from "node:path";
import { randomBytes } from "node:crypto";
import { getSession } from "@/lib/session";

const ALLOWED = ["image/jpeg", "image/png", "image/webp"];
const MAX = 5 * 1024 * 1024;

/**
 * HariKita - Upload Dokumen Vendor
 *
 * POST /api/upload/vendor-doc (FormData: file, kind "ktp"|"business")
 * Menyimpan file ke public/uploads/vendor/{userId}/ dan mengembalikan { url }.
 * Validasi tipe & ukuran; butuh sesi login.
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
  const kind = String(form.get("kind") ?? "");
  if (!(file instanceof File) || !["ktp", "business"].includes(kind)) {
    return NextResponse.json({ error: "invalid input" }, { status: 400 });
  }
  if (!ALLOWED.includes(file.type)) {
    return NextResponse.json({ error: "Tipe file harus JPG/PNG/WEBP." }, { status: 400 });
  }
  if (file.size > MAX) {
    return NextResponse.json({ error: "Ukuran maksimum 5MB." }, { status: 400 });
  }

  const ext = file.type === "image/png" ? "png" : file.type === "image/webp" ? "webp" : "jpg";
  const name = `${kind}-${randomBytes(8).toString("hex")}.${ext}`;
  const dir = path.join(process.cwd(), "public", "uploads", "vendor", session.userId);
  await mkdir(dir, { recursive: true });
  await writeFile(path.join(dir, name), Buffer.from(await file.arrayBuffer()));

  return NextResponse.json({ url: `/uploads/vendor/${session.userId}/${name}` });
}
