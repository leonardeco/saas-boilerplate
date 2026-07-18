/** Capacitor / native WebView detection and secure token storage. */

export type NativeBridge = {
  isNativePlatform: () => boolean;
  getPlatform: () => string;
  Plugins?: {
    Preferences?: {
      set: (opts: { key: string; value: string }) => Promise<void>;
      get: (opts: { key: string }) => Promise<{ value: string | null }>;
      remove: (opts: { key: string }) => Promise<void>;
    };
    Browser?: {
      open: (opts: { url: string }) => Promise<void>;
      close: () => Promise<void>;
    };
    App?: {
      addListener: (
        event: string,
        cb: (data: { url: string }) => void,
      ) => Promise<{ remove: () => void }>;
    };
  };
};

export function getCapacitor(): NativeBridge | null {
  if (typeof window === "undefined") return null;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return (window as any).Capacitor ?? null;
}

export function isNativeApp(): boolean {
  const cap = getCapacitor();
  try {
    return Boolean(cap?.isNativePlatform?.());
  } catch {
    return false;
  }
}

const ACCESS = "nt_native_access";
const REFRESH = "nt_native_refresh";

export async function nativeSetTokens(tokens: {
  accessToken: string;
  refreshToken: string;
}) {
  const prefs = getCapacitor()?.Plugins?.Preferences;
  if (!prefs) return;
  await prefs.set({ key: ACCESS, value: tokens.accessToken });
  await prefs.set({ key: REFRESH, value: tokens.refreshToken });
}

export async function nativeGetAccessToken(): Promise<string | null> {
  const prefs = getCapacitor()?.Plugins?.Preferences;
  if (!prefs) return null;
  const { value } = await prefs.get({ key: ACCESS });
  return value;
}

export async function nativeGetRefreshToken(): Promise<string | null> {
  const prefs = getCapacitor()?.Plugins?.Preferences;
  if (!prefs) return null;
  const { value } = await prefs.get({ key: REFRESH });
  return value;
}

export async function nativeClearTokens() {
  const prefs = getCapacitor()?.Plugins?.Preferences;
  if (!prefs) return;
  await prefs.remove({ key: ACCESS });
  await prefs.remove({ key: REFRESH });
}

export async function nativeOpenUrl(url: string) {
  const browser = getCapacitor()?.Plugins?.Browser;
  if (browser) {
    await browser.open({ url });
    return;
  }
  window.location.href = url;
}
