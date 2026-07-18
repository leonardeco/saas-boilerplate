# NightTable CO — helper for first production deploy (Windows)
# Usage:
#   .\scripts\first-deploy.ps1
#   .\scripts\first-deploy.ps1 -ApiUrl "https://nighttable-api.onrender.com" -DatabaseUrl "postgresql://..."

param(
  [string]$ApiUrl = "",
  [string]$DatabaseUrl = "",
  [string]$SuperAdminEmail = ""
)

$ErrorActionPreference = "Stop"
Write-Host ""
Write-Host "NightTable CO — first deploy helper" -ForegroundColor Cyan
Write-Host "====================================" -ForegroundColor Cyan
Write-Host ""

# --- Step A: secrets ---
Write-Host "[A] Secrets file (gitignored secrets.local.env):" -ForegroundColor Yellow
node scripts/gen-secrets.mjs
if (Test-Path "secrets.local.env") {
  Write-Host "  → Open: $((Resolve-Path secrets.local.env).Path)" -ForegroundColor Green
  # open in default editor without printing contents
  try { Invoke-Item "secrets.local.env" } catch { }
}
Write-Host ""


# --- Step B: checklist ---
Write-Host "[B] Render dashboard steps:" -ForegroundColor Yellow
Write-Host "  1. Open https://dashboard.render.com"
Write-Host "  2. New → Blueprint → repo leonardeco/saas-boilerplate (main)"
Write-Host "  3. Apply render.yaml"
Write-Host "  4. Set on API: WEB_URL, CORS_ORIGIN, API_PUBLIC_URL (https URLs)"
Write-Host "  5. Set on Web: NEXT_PUBLIC_API_URL (same as API public URL)"
Write-Host "  6. Manual Deploy API + Web + Worker"
Write-Host "  Full guide: docs/runbooks/first-deploy-render.md"
Write-Host ""

if (-not $ApiUrl) {
  $ApiUrl = Read-Host "Paste your API public URL (or Enter to skip smoke)"
}
if ($ApiUrl) {
  Write-Host "[C] Smoke test $ApiUrl" -ForegroundColor Yellow
  node scripts/smoke-prod.mjs $ApiUrl
  Write-Host ""
}

if (-not $DatabaseUrl) {
  $DatabaseUrl = Read-Host "Paste External DATABASE_URL for migrate (or Enter to skip)"
}
if ($DatabaseUrl) {
  $env:DATABASE_URL = $DatabaseUrl
  Write-Host "[D] Migrate..." -ForegroundColor Yellow
  npm run db:migrate -w @saas/db
  Write-Host "[E] Seed production-safe (no demo venues)..." -ForegroundColor Yellow
  npm run db:seed:prod
  if (-not $SuperAdminEmail) {
    $SuperAdminEmail = Read-Host "SUPERADMIN email (or Enter to skip)"
  }
  if ($SuperAdminEmail) {
    Write-Host "[F] Promote SUPERADMIN $SuperAdminEmail" -ForegroundColor Yellow
    npm run make-superadmin -- $SuperAdminEmail
  }
}

Write-Host ""
Write-Host "Done. Open the web URL, register, and test /co/bogota after seed/ingest." -ForegroundColor Green
Write-Host "Legal: /privacy  /terms" -ForegroundColor Green
Write-Host ""
