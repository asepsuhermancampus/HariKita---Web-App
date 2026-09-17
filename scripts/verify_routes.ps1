$routes = @(
  '/',
  '/kategori',
  '/kategori/prewed',
  '/kategori/dokumentasi-foto-video',
  '/vendor/menganti-cinematic',
  '/undangan',
  '/builder',
  '/hub-koordinasi',
  '/checkout',
  '/pembayaran/HKB-2026-001',
  '/pesanan/HKB-2026-001/invoice',
  '/client',
  '/client/pesanan',
  '/client/jadwal',
  '/client/undangan',
  '/vendor',
  '/vendor/inbox',
  '/vendor/portofolio',
  '/vendor/paket',
  '/vendor/kalender',
  '/vendor/dompet',
  '/admin',
  '/admin/kalender',
  '/admin/verifikasi',
  '/admin/escrow',
  '/admin/audit-konten',
  '/auth/login',
  '/auth/register',
  '/auth/register-vendor',
  '/design-system-showcase'
)

$passed = 0
$failed = 0

foreach ($r in $routes) {
  try {
    $url = "http://127.0.0.1:3000$r"
    $res = Invoke-WebRequest -Uri $url -UseBasicParsing -TimeoutSec 10
    if ($res.StatusCode -eq 200) {
      Write-Host "[PASS] $r -> 200 OK" -ForegroundColor Green
      $passed++
    } else {
      Write-Host "[FAIL] $r -> $($res.StatusCode)" -ForegroundColor Red
      $failed++
    }
  } catch {
    Write-Host "[ERROR] $r -> $($_.Exception.Message)" -ForegroundColor Red
    $failed++
  }
}

Write-Host "=========================================="
Write-Host "Total: $($routes.Count) | Passed: $passed | Failed: $failed"
