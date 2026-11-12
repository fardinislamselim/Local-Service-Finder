import { $fetch, type FetchOptions, type FetchContext } from "ofetch";
import { siteConfig } from "@/config/site";
import { tokenStorage } from "./token";

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

function extractErrorMessage(data: unknown, status: number): { message: string; detail?: string; errors?: Record<string, string[] | string> } {
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

  // Handle DRF validation errors: { field: ["error message"] }
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

export const ofetchClient = $fetch.create({
  baseURL: siteConfig.apiUrl,
  onRequest({ options }: FetchContext) {
    const customOpts = options as CustomFetchOptions;
    const token = tokenStorage.getAccessToken();

    // Attach Bearer token if available and not explicitly disabled
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
  onResponseError({ response }: FetchContext) {
    const status = response?.status || 500;
    const { message, detail, errors } = extractErrorMessage(response?._data, status);

    // If unauthorized, clear tokens
    if (status === 401) {
      if (typeof window !== "undefined") {
        tokenStorage.clearTokens();
        // Don't auto-redirect if we are already on auth pages
        const pathname = window.location.pathname;
        if (!pathname.startsWith("/login") && !pathname.startsWith("/register") && !pathname.startsWith("/forgot-password")) {
          // let components handle redirects cleanly via auth guard
        }
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
    return ofetchClient<T>(url, { ...options, method: "GET" });
  },
  post<T = unknown>(url: string, body?: unknown, options?: CustomFetchOptions): Promise<T> {
    return ofetchClient<T>(url, { ...options, method: "POST", body: body as any });
  },
  patch<T = unknown>(url: string, body?: unknown, options?: CustomFetchOptions): Promise<T> {
    return ofetchClient<T>(url, { ...options, method: "PATCH", body: body as any });
  },
  put<T = unknown>(url: string, body?: unknown, options?: CustomFetchOptions): Promise<T> {
    return ofetchClient<T>(url, { ...options, method: "PUT", body: body as any });
  },
  delete<T = unknown>(url: string, options?: CustomFetchOptions): Promise<T> {
    return ofetchClient<T>(url, { ...options, method: "DELETE" });
  },
};
