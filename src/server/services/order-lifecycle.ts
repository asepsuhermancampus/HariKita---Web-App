import type { Prisma } from "@prisma/client";
import { getStartOfDayWIB, addCalendarDaysWIB } from "@/lib/date-utils";

/**
 * HariKita - Order Lifecycle Generator
 *
 * Menghasilkan entitas operasional turunan saat pesanan memasuki fase finansial:
 *  - `PhysicalSession` (first fitting, final fitting, test food) — untuk kategori
 *    yang membutuhkannya.
 *  - `EventRundown` (susunan jam hari H) dari item pesanan.
 *
 * Semua fungsi idempotent: tidak menggandakan baris bila dipanggil ulang.
 */

type TxClient = Prisma.TransactionClient;

/** Kategori (slug) yang membutuhkan sesi fisik & jenis sesinya. */
const CATEGORY_SESSION_MAP: Record<string, Array<{ type: string; offsetDays: number; label: string }>> = {
  // Busana / kebaya → 2x fitting (H-30, H-7)
  "Busana Pengantin & Fitting": [
    { type: "FIRST_FITTING", offsetDays: -30, label: "Fitting Pertama Busana (1st Fitting)" },
    { type: "FINAL_FITTING", offsetDays: -7, label: "Fitting Final Busana" },
  ],
  busana: [
    { type: "FIRST_FITTING", offsetDays: -30, label: "Fitting Pertama Busana (1st Fitting)" },
    { type: "FINAL_FITTING", offsetDays: -7, label: "Fitting Final Busana" },
  ],
  // Katering → test food (H-14)
  "Katering & Food Stalls": [
    { type: "TEST_FOOD", offsetDays: -14, label: "Pencicipan Sample Box Test Food" },
  ],
  katering: [
    { type: "TEST_FOOD", offsetDays: -14, label: "Pencicipan Sample Box Test Food" },
  ],
};

/**
 * Menghasilkan sesi fisik turunan dari item pesanan. Idempotent.
 * @returns jumlah sesi yang dibuat.
 */
export async function generatePhysicalSessions(
  orderId: string,
  tx: TxClient
): Promise<number> {
  const order = await tx.order.findUnique({
    where: { id: orderId },
    include: { items: true },
  });
  if (!order) return 0;

  const existing = await tx.physicalSession.findMany({ where: { orderId } });
  const existingTypes = new Set(existing.map((s) => s.type));

  let created = 0;
  const eventDateYMD = order.eventDate.toISOString().split("T")[0];

  for (const item of order.items) {
    const sessionDefs =
      CATEGORY_SESSION_MAP[item.categorySlug] ??
      CATEGORY_SESSION_MAP[item.serviceName] ??
      [];
    for (const def of sessionDefs) {
      if (existingTypes.has(def.type)) continue;

      const scheduledYMD = addCalendarDaysWIB(eventDateYMD, def.offsetDays);
      await tx.physicalSession.create({
        data: {
          orderId,
          type: def.type,
          scheduledDate: getStartOfDayWIB(scheduledYMD),
          status: "SCHEDULED",
          notes: def.label,
          location: "Menunggu konfirmasi vendor",
        },
      });
      created++;
    }
  }
  return created;
}

/**
 * Menghasilkan rundown hari H dari item pesanan. Idempotent (mengganti bila ada).
 * @returns jumlah baris rundown.
 */
export async function generateEventRundown(
  orderId: string,
  tx: TxClient
): Promise<number> {
  const order = await tx.order.findUnique({
    where: { id: orderId },
    include: { items: true },
  });
  if (!order) return 0;

  // Idempotent: hapus rundown lama lalu buat ulang dari item aktif.
  await tx.eventRundown.deleteMany({ where: { orderId } });

  const activeItems = order.items.filter((i) => ["PENDING", "ACCEPTED"].includes(i.status));

  let sortOrder = 0;
  const rows: Prisma.EventRundownCreateManyInput[] = [
    {
      orderId,
      timeSlot: "07:30 - 09:00 WIB",
      activity: "Prosesi Akad Nikah & Ijab Qabul",
      picName: "Seluruh Vendor Terkoneksi",
      location: order.city,
      sortOrder: sortOrder++,
    },
    {
      orderId,
      timeSlot: "09:30 - 13:00 WIB",
      activity: "Ramah Tamah Resepsi & Jamuan",
      picName: "Koordinator Acara",
      location: order.city,
      sortOrder: sortOrder++,
    },
  ];

  for (const item of activeItems) {
    rows.push({
      orderId,
      timeSlot: "Menyesuaikan (Call Time Vendor)",
      activity: `Pelaksanaan Jasa ${item.categorySlug} — ${item.packageName}`,
      picName: item.vendorNameSnapshot || item.serviceName,
      location: order.city,
      sortOrder: sortOrder++,
    });
  }

  await tx.eventRundown.createMany({ data: rows });
  return rows.length;
}

/**
 * Menjalankan kedua generator (sesi fisik + rundown). Dipanggil saat DP terbayar.
 * @returns ringkasan jumlah baris yang dibuat.
 */
export async function generateOperationalArtifacts(
  orderId: string,
  tx: TxClient
): Promise<{ sessions: number; rundownRows: number }> {
  const sessions = await generatePhysicalSessions(orderId, tx);
  const rundownRows = await generateEventRundown(orderId, tx);
  return { sessions, rundownRows };
}
