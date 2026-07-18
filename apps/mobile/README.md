# NightTable — Capacitor shell

Native iOS/Android wrapper around the Next.js web app.

## Prerequisites

- Node 20+
- Xcode (iOS) / Android Studio (Android)
- CocoaPods (iOS)

## Quick start

```bash
# from monorepo root
npm install

# 1) Point WebView at local Next (use your LAN IP, not localhost, for devices)
cd apps/mobile
# Windows PowerShell example:
$env:CAPACITOR_SERVER_URL="http://192.168.1.20:3000"

# 2) Ensure www exists
npm run build:www

# 3) Add platforms once
npm run cap:add:android
# npm run cap:add:ios   # macOS only

# 4) Sync & open
npm run cap:sync
npm run cap:open:android
# npm run cap:open:ios
```

Also run the web + API:

```bash
npm run dev -w @saas/web
npm run dev -w @saas/api
```

## Production

```bash
export CAPACITOR_SERVER_URL=https://app.nighttable.co
npm run build:www
npx cap sync
# build release in Xcode / Android Studio
```

## Deep links

| Scheme | Example |
|---|---|
| Custom | `nighttable://co/bogota/some-venue` |
| App id | `co.nighttable.app` |
| Universal | `https://app.nighttable.co/co/...` |

Configure Associated Domains (iOS) and Digital Asset Links (Android) after first `cap add`.

## Auth on native

WebView loaded from same site can use cookies. Cross-origin API → Bearer tokens via Preferences (see web `auth-client` native bridge).

## OAuth

Uses `@capacitor/browser` system browser from web when Capacitor is detected.
