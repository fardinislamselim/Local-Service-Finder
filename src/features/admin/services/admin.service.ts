import { api } from "@/lib/api/client";
import type {
  AdminDashboardOverview,
  PendingAccount,
  Category,
  Service,
  Division,
  District,
  Upazila,
} from "@/types/api";

function unwrapList<T>(res: unknown): T[] {
  if (Array.isArray(res)) return res as T[];
  if (res && typeof res === "object") {
    const obj = res as Record<string, unknown>;
    for (const key of ["data", "results", "accounts", "profile", "services", "categories"]) {
      if (Array.isArray(obj[key])) return obj[key] as T[];
    }
  }
  return [];
}

export const adminService = {
  // 1. Overview Check
  async getOverview(): Promise<AdminDashboardOverview> {
    return api.get("/dashboard/admin/admin/");
  },

  // 2. Pending Provider Accounts List
  async getPendingProviders(): Promise<PendingAccount[]> {
    const res = await api.get<unknown>("/dashboard/admin/pending_account/");
    return unwrapList<PendingAccount>(res);
  },

  // 3. Approve Provider Account (pk = User UUID)
  async approveProvider(userId: string | number): Promise<{ message: string; data?: unknown }> {
    return api.patch(`/dashboard/admin/account_activate/${userId}/`);
  },

  // 4. Governance Counts
  async getTotalActiveCount(): Promise<{ total_active_accounts?: number; count?: number } | number> {
    return api.get("/dashboard/admin/total_activate_account_count/");
  },

  async getTotalPendingCount(): Promise<{ total_pending_accounts?: number; count?: number } | number> {
    return api.get("/dashboard/admin/total_activate_pending_count/");
  },

  // 5. Service Moderation
  async deleteService(serviceId: string | number): Promise<{ message?: string }> {
    return api.delete(`/service/service_modify/${serviceId}/`);
  },
};
