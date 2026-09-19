import { PrismaClient } from "@prisma/client";

/**
 * Backfill NON-DESTRUKTIF untuk data dummy yang sudah ada:
 *  - Mengisi `email` yang kosong (format `${phone}@harikita.id`).
 *  - Membuat `PinChangeLog` awal untuk setiap user yang belum punya.
 *
 * Idempotent: aman dijalankan berulang.
 */
const prisma = new PrismaClient();

async function main() {
  const users = await prisma.user.findMany({ select: { id: true, name: true, phone: true, email: true } });
  let emailFilled = 0;
  let pinLogged = 0;

  for (const u of users) {
    if (!u.email) {
      await prisma.user.update({
        where: { id: u.id },
        data: { email: `${u.phone}@harikita.id` },
      });
      emailFilled++;
    }
    const hasLog = await prisma.pinChangeLog.findFirst({ where: { userId: u.id } });
    if (!hasLog) {
      await prisma.pinChangeLog.create({ data: { userId: u.id } });
      pinLogged++;
    }
  }

  console.log(`Backfill selesai: ${emailFilled} email diisi, ${pinLogged} PinChangeLog dibuat.`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
