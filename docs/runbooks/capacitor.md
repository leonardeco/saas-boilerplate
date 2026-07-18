# Capacitor (iOS / Android) — NightTable CO

## Architecture

```
┌─────────────────────────────┐
│  Capacitor WebView          │
│  ← CAPACITOR_SERVER_URL     │  (Next.js web)
│     or bundled www shell    │
└─────────────┬───────────────┘
              │ HTTPS + Bearer (native) / cookies (web)
              ▼
         NightTable API
```

## Install platforms

```bash
cd apps/mobile
npm install
npm run build:www
npx cap add android
npx cap add ios    # macOS
```

`ios/` and `android/` are gitignored until you decide to commit them.

## Dev against LAN

1. Start API + Web on your machine  
2. Find LAN IP (e.g. `192.168.1.20`)  
3. Allow Next to bind: already `0.0.0.0` via default next  
4. Set:

```bash
export CAPACITOR_SERVER_URL=http://192.168.1.20:3000
export NEXT_PUBLIC_API_URL=http://192.168.1.20:3001
```

5. Rebuild web with public API URL, then:

```bash
npx cap sync
npx cap open android
```

## Auth modes

| Environment | Storage |
|---|---|
| Mobile browser / PWA | httpOnly cookies |
| Capacitor native | `@capacitor/preferences` + `Authorization: Bearer` |

Implemented in `apps/web/lib/auth-client.ts` + `native.ts`.

## Deep links

Custom scheme: `nighttable://`  
App id: `co.nighttable.app`

After first native project generation:

- **iOS**: Xcode → Signing & Capabilities → Associated Domains → `applinks:app.nighttable.co`
- **Android**: `assetlinks.json` on `https://app.nighttable.co/.well-known/assetlinks.json`

## OAuth on device

Uses system browser (`Browser` plugin) when Capacitor is detected.  
Callback still hits API then redirects to web `/dashboard` — ensure `WEB_URL` matches `CAPACITOR_SERVER_URL` origin so the WebView picks the session. For pure native Bearer OAuth, add a custom scheme callback later.

## Store checklist

- [ ] Splash + icons (1024 / adaptive)
- [ ] Privacy policy URL
- [ ] Location permission only if you add geolocation
- [ ] Camera not required
- [ ] Test offline shell (`www/index.html`)
