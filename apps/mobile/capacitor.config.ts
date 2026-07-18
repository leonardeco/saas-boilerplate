import type { CapacitorConfig } from "@capacitor/cli";

/**
 * NightTable CO — Capacitor shell
 *
 * Dev:  CAPACITOR_SERVER_URL=http://<LAN-IP>:3000
 * Prod: CAPACITOR_SERVER_URL=https://app.nighttable.co  (or omit to use bundled www)
 *
 * Deep links: co.nighttable.app://  and https://app.nighttable.co
 */
const serverUrl = process.env.CAPACITOR_SERVER_URL;

const config: CapacitorConfig = {
  appId: "co.nighttable.app",
  appName: "NightTable",
  webDir: "www",
  bundledWebRuntime: false,
  server: serverUrl
    ? {
        url: serverUrl,
        cleartext: serverUrl.startsWith("http://"),
        allowNavigation: [
          "localhost",
          "127.0.0.1",
          "*.nighttable.co",
          "accounts.google.com",
          "github.com",
        ],
      }
    : undefined,
  plugins: {
    SplashScreen: {
      launchShowDuration: 1200,
      backgroundColor: "#020617",
      showSpinner: false,
    },
    StatusBar: {
      style: "DARK",
      backgroundColor: "#020617",
    },
    App: {
      // Android App Links / iOS Universal Links configured in native projects after `cap add`
    },
  },
  android: {
    allowMixedContent: true,
  },
  ios: {
    contentInset: "automatic",
    preferredContentMode: "mobile",
    scheme: "NightTable",
  },
};

export default config;
