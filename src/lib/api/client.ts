import { apiClient, api, ApiError, extractErrorMessage, type CustomFetchOptions } from "../api";

export { apiClient, api, ApiError, extractErrorMessage };
export type { CustomFetchOptions };
export const ofetchClient = ((...args: any[]) => (apiClient as any)(...args)) as typeof apiClient;

