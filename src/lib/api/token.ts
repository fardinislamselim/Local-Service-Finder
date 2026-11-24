export const COOKIE_KEYS = {
  ACCESS_TOKEN: "access_token",
  REFRESH_TOKEN: "refresh_token",
  USER: "user_data",
  LEGACY_ACCESS: "lsf_access_token",
  LEGACY_REFRESH: "lsf_refresh_token",
  LEGACY_USER: "lsf_user",
} as const;

export function getCookie(name: string): string | null {
  if (typeof document === "undefined") return null;
  const match = document.cookie.match(new RegExp("(^|;\\s*)" + name + "=([^;]+)"));
  return match ? decodeURIComponent(match[2]) : null;
}

export function setCookie(name: string, value: string, days = 7) {
  if (typeof document === "undefined") return;
  const isSecure = typeof window !== "undefined" && window.location.protocol === "https:";
  const maxAgeSeconds = Math.max(days * 86400, 86400); // Minimum 1 day
  const expires = new Date(Date.now() + days * 864e5).toUTCString();

  let cookie = `${name}=${encodeURIComponent(value)}; path=/; SameSite=Lax; Max-Age=${maxAgeSeconds}; expires=${expires}`;
  if (isSecure) {
    cookie += "; Secure";
  }

  document.cookie = cookie;
}

export function deleteCookie(name: string) {
  if (typeof document === "undefined") return;
  const hostname = typeof window !== "undefined" ? window.location.hostname : "";

  // Delete without domain
  document.cookie = `${name}=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT; max-age=0; SameSite=Lax`;
  document.cookie = `${name}=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT; max-age=0; SameSite=Lax; Secure`;
  document.cookie = `${name}=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT; max-age=0`;

  // Delete with hostname domain if available
  if (hostname && hostname !== "localhost") {
    document.cookie = `${name}=; path=/; domain=${hostname}; expires=Thu, 01 Jan 1970 00:00:00 GMT; max-age=0; SameSite=Lax`;
    document.cookie = `${name}=; path=/; domain=.${hostname}; expires=Thu, 01 Jan 1970 00:00:00 GMT; max-age=0; SameSite=Lax`;
  }

  // Delete without path
  document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 GMT; max-age=0`;
}

export function clearAllCookies() {
  if (typeof document === "undefined") return;
  try {
    const cookies = document.cookie.split(";");
    for (const cookie of cookies) {
      const eqPos = cookie.indexOf("=");
      const name = eqPos > -1 ? cookie.substring(0, eqPos).trim() : cookie.trim();
      if (name) {
        deleteCookie(name);
      }
    }
  } catch {
    // ignore
  }
}

async function syncToServer(accessToken?: string, refreshToken?: string, user?: unknown) {
  if (typeof window === "undefined") return;
  try {
    await fetch("/api/auth/cookies", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        access_token: accessToken,
        refresh_token: refreshToken,
        user,
      }),
    });
  } catch {
    // client-side document.cookie fallback is already active
  }
}

async function deleteFromServer() {
  if (typeof window === "undefined") return;
  try {
    await fetch("/api/auth/cookies", { method: "DELETE" });
  } catch {
    // fallback
  }
}

export const tokenStorage = {
  getAccessToken(): string | null {
    if (typeof window === "undefined") return null;
    return (
      getCookie(COOKIE_KEYS.ACCESS_TOKEN) ||
      getCookie(COOKIE_KEYS.LEGACY_ACCESS) ||
      localStorage.getItem(COOKIE_KEYS.ACCESS_TOKEN) ||
      localStorage.getItem(COOKIE_KEYS.LEGACY_ACCESS)
    );
  },

  getRefreshToken(): string | null {
    if (typeof window === "undefined") return null;
    return (
      getCookie(COOKIE_KEYS.REFRESH_TOKEN) ||
      getCookie(COOKIE_KEYS.LEGACY_REFRESH) ||
      localStorage.getItem(COOKIE_KEYS.REFRESH_TOKEN) ||
      localStorage.getItem(COOKIE_KEYS.LEGACY_REFRESH)
    );
  },

  async setTokens(accessToken: string, refreshToken?: string) {
    if (typeof window === "undefined") return;

    // 1. Set browser document cookies with healthy persistent lifetime (7 days access, 30 days refresh)
    setCookie(COOKIE_KEYS.ACCESS_TOKEN, accessToken, 7);
    setCookie(COOKIE_KEYS.LEGACY_ACCESS, accessToken, 7);

    if (refreshToken) {
      setCookie(COOKIE_KEYS.REFRESH_TOKEN, refreshToken, 30);
      setCookie(COOKIE_KEYS.LEGACY_REFRESH, refreshToken, 30);
    }

    // 2. Set localStorage backup
    localStorage.setItem(COOKIE_KEYS.ACCESS_TOKEN, accessToken);
    localStorage.setItem(COOKIE_KEYS.LEGACY_ACCESS, accessToken);
    if (refreshToken) {
      localStorage.setItem(COOKIE_KEYS.REFRESH_TOKEN, refreshToken);
      localStorage.setItem(COOKIE_KEYS.LEGACY_REFRESH, refreshToken);
    }

    // 3. Sync to server HTTP Set-Cookie headers
    await syncToServer(accessToken, refreshToken);
  },

  async clearTokens() {
    if (typeof window === "undefined") return;

    // 1. Delete all known cookie keys and clear all document cookies
    deleteCookie(COOKIE_KEYS.ACCESS_TOKEN);
    deleteCookie(COOKIE_KEYS.REFRESH_TOKEN);
    deleteCookie(COOKIE_KEYS.LEGACY_ACCESS);
    deleteCookie(COOKIE_KEYS.LEGACY_REFRESH);
    deleteCookie(COOKIE_KEYS.USER);
    deleteCookie(COOKIE_KEYS.LEGACY_USER);
    deleteCookie("access_token");
    deleteCookie("refresh_token");
    deleteCookie("lsf_access_token");
    deleteCookie("lsf_refresh_token");
    deleteCookie("user_data");
    deleteCookie("lsf_user");
    clearAllCookies();

    // 2. Delete all localStorage keys
    localStorage.removeItem(COOKIE_KEYS.ACCESS_TOKEN);
    localStorage.removeItem(COOKIE_KEYS.REFRESH_TOKEN);
    localStorage.removeItem(COOKIE_KEYS.LEGACY_ACCESS);
    localStorage.removeItem(COOKIE_KEYS.LEGACY_REFRESH);
    localStorage.removeItem(COOKIE_KEYS.USER);
    localStorage.removeItem(COOKIE_KEYS.LEGACY_USER);
    localStorage.removeItem("access_token");
    localStorage.removeItem("refresh_token");
    localStorage.removeItem("lsf_access_token");
    localStorage.removeItem("lsf_refresh_token");
    localStorage.removeItem("user_data");
    localStorage.removeItem("user_email");
    localStorage.removeItem("lsf-auth-storage");

    // 3. Clear sessionStorage
    try {
      sessionStorage.clear();
    } catch {
      // ignore
    }

    // 4. Sync deletion to server route and await it
    try {
      await deleteFromServer();
    } catch {
      // ignore
    }
  },

  getUser<T = unknown>(): T | null {
    if (typeof window === "undefined") return null;
    const raw =
      getCookie(COOKIE_KEYS.USER) ||
      localStorage.getItem(COOKIE_KEYS.USER) ||
      localStorage.getItem(COOKIE_KEYS.LEGACY_USER);
    if (!raw) return null;
    try {
      return JSON.parse(raw) as T;
    } catch {
      return null;
    }
  },

  async setUser<T>(user: T) {
    if (typeof window === "undefined") return;
    const jsonStr = JSON.stringify(user);
    localStorage.setItem(COOKIE_KEYS.USER, jsonStr);
    localStorage.setItem(COOKIE_KEYS.LEGACY_USER, jsonStr);
    setCookie(COOKIE_KEYS.USER, jsonStr, 30);
    setCookie(COOKIE_KEYS.LEGACY_USER, jsonStr, 30);
    await syncToServer(undefined, undefined, user);
  },
};
