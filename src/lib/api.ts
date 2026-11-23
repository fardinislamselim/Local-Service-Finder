import { $fetch, type FetchOptions, type FetchContext } from "ofetch";
import { toast } from "sonner";
import { useAuthStore } from "@/store/useAuthStore";
import { tokenStorage } from "./api/token";

export const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL ||
  process.env.NEXT_PUBLIC_API_BASE_URL ||
  "https://local-service-finder-system.onrender.com/api/v1";

export interface ApiErrorData {
  message: string;
  statusCode: number;
  errors?: Record<string, string[] | string>;
  detail?: string;
  raw?: unknown;
}

export class ApiError extends Error {
  statusCode: number;
  errors?: Record<string, string[] | string>;
  detail?: string;
  raw?: unknown;

  constructor(data: ApiErrorData) {
    super(data.message);
    this.name = "ApiError";
    this.statusCode = data.statusCode;
    this.errors = data.errors;
    this.detail = data.detail;
    this.raw = data.raw;
  }
}

export function extractErrorMessage(
  data: unknown,
  status: number
): { message: string; detail?: string; errors?: Record<string, string[] | string> } {
  if (!data || typeof data !== "object") {
    return { message: `Request failed with status ${status}` };
  }

  const obj = data as Record<string, unknown>;

  if (typeof obj.detail === "string") {
    return { message: obj.detail, detail: obj.detail };
  }
  if (typeof obj.message === "string") {
    return { message: obj.message, detail: obj.message };
  }
  if (typeof obj.error === "string") {
    return { message: obj.error, detail: obj.error };
  }
  if (Array.isArray(obj.non_field_errors) && obj.non_field_errors.length > 0) {
    return { message: String(obj.non_field_errors[0]) };
  }

  // DRF validation errors
  const errors: Record<string, string[] | string> = {};
  const firstMessages: string[] = [];

  for (const [key, val] of Object.entries(obj)) {
    if (Array.isArray(val)) {
      errors[key] = val.map(String);
      if (val.length > 0) firstMessages.push(`${key}: ${val[0]}`);
    } else if (typeof val === "string") {
      errors[key] = val;
      firstMessages.push(`${key}: ${val}`);
    }
  }

  if (firstMessages.length > 0) {
    return {
      message: firstMessages.join(" | "),
      errors,
    };
  }

  return { message: `HTTP Error ${status}` };
}

export interface CustomFetchOptions extends FetchOptions<"json"> {
  requiresAuth?: boolean;
}

export function getAccessToken(): string | null {
  try {
    const zustandToken = useAuthStore.getState().accessToken;
    if (zustandToken) return zustandToken;
  } catch {
    // Ignore outside react context
  }
  return tokenStorage.getAccessToken();
}

/**
 * Standard API client configured with request/response interceptors
 */
export const apiClient = $fetch.create({
  baseURL: API_BASE_URL,

  // Request Interceptor: Attach Bearer access_token
  onRequest({ options }: FetchContext) {
    const customOpts = options as CustomFetchOptions;
    const token = getAccessToken();

    if (token && customOpts.requiresAuth !== false) {
      if (typeof Headers !== "undefined" && options.headers instanceof Headers) {
        options.headers.set("Authorization", `Bearer ${token}`);
      } else {
        options.headers = {
          ...(options.headers as unknown as Record<string, string>),
          Authorization: `Bearer ${token}`,
        } as any;
      }
    }
  },

  // Response Interceptor: 401 & 403 handling
  onResponseError({ response }: FetchContext) {
    const status = response?.status || 500;
    const { message, detail, errors } = extractErrorMessage(response?._data, status);

    if (status === 401) {
      // 401 Unauthorized: Clear auth state, show Sonner toast, and redirect to /login
      if (typeof window !== "undefined") {
        useAuthStore.getState().logout();
        tokenStorage.clearTokens();

        toast.error("Session expired. Please sign in again.");

        const pathname = window.location.pathname;
        if (
          !pathname.startsWith("/login") &&
          !pathname.startsWith("/register") &&
          !pathname.startsWith("/forgot-password") &&
          !pathname.startsWith("/reset-password")
        ) {
          window.location.href = "/login";
        }
      }
    } else if (status === 403) {
      // 403 Forbidden: Keep session active and show toast
      if (typeof window !== "undefined") {
        toast.error("Access denied: You don't have permission for this action.");
      }
    }

    throw new ApiError({
      message,
      statusCode: status,
      detail,
      errors,
      raw: response?._data,
    });
  },
});

export const api = {
  get<T = unknown>(url: string, options?: CustomFetchOptions): Promise<T> {
    return apiClient<T>(url, { ...options, method: "GET" });
  },
  post<T = unknown>(url: string, body?: unknown, options?: CustomFetchOptions): Promise<T> {
    return apiClient<T>(url, { ...options, method: "POST", body: body as any });
  },
  patch<T = unknown>(url: string, body?: unknown, options?: CustomFetchOptions): Promise<T> {
    return apiClient<T>(url, { ...options, method: "PATCH", body: body as any });
  },
  put<T = unknown>(url: string, body?: unknown, options?: CustomFetchOptions): Promise<T> {
    return apiClient<T>(url, { ...options, method: "PUT", body: body as any });
  },
  delete<T = unknown>(url: string, options?: CustomFetchOptions): Promise<T> {
    return apiClient<T>(url, { ...options, method: "DELETE" });
  },
};

export default api;
