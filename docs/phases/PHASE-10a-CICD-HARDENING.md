PHASE: 10 (bagian A — CI/CD & Hardening)
STATUS: COMPLETE
PEMILIK: CodeBuddy

OBJECTIVE:
Menyiapkan gerbang kualitas otomatis (CI) dan hardening dasar agar semua phase
berikutnya diverifikasi dengan standar yang sama, tanpa butuh keputusan platform.

FILE DIBUAT:
- .github/workflows/ci.yml                (CI: install → prisma generate/validate/db push → typecheck → test → build)
- vercel.json                             (jadwal cron /api/cron/sweep tiap jam)
- src/app/api/health/route.ts             (liveness + readiness DB)
- src/lib/rate-limit.ts                   (sliding-window rate limiter, process-local)
- src/lib/logger.ts                       (structured logger + redaction)
- tests/rate-limit.test.ts                (6 test)

FILE DIUBAH:
- package.json                            (+scripts: typecheck, validate, generate, test, verify)
- next.config.ts                          (+security headers: CSP, HSTS, X-Frame-Options, dll.)
- src/app/api/webhooks/payment/route.ts   (+rate limit 60/menit per IP)
- src/app/api/cron/sweep/route.ts         (+rate limit 10/menit + terima CRON_SECRET Vercel)
- .env.example                            (catatan CRON_SECRET Vercel)

ACTION/QUERY YANG DIPANGGIL: —
DATABASE CHANGES: —

TEST DITAMBAHKAN: tests/rate-limit.test.ts (6)

COMMAND DIJALANKAN:
- npm run typecheck        → EXIT 0
- npx tsx --test tests/*.test.ts → 114 tests, 114 pass, 0 fail
- npm run build            → sukses (route: /api/health, /api/cron/sweep, /api/webhooks/payment)

HASIL TEST/BUILD: SEMUA PASS (114/114)

PERMINTAAN KE CODEBUDDY: —

CATATAN REKONSILIASI:
- 2 kegagalan test lama (archetypeRegistry) ternyata sudah diperbaiki pada commit
  c0f0bc1 (test diubah agar deklaratif terhadap katalog 15 rose-gold). Baseline
  test kini 100% hijau.
- Rate limiter bersifat PROCESS-LOCAL (bukan distributed). Untuk multi-instance,
  ganti ke Redis/Upstash — didokumentasikan di header file.
- Bagian B Phase 10 (deploy live + kredensial DB/gateway) menunggu keputusan user.

NEXT STEP:
Phase 3 — Vendor Self-Service (portofolio, inbox, /vendor/[slug]).
