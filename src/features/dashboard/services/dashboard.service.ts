import { api } from "@/lib/api/client";
import type {
  AdminDashboardOverview,
  PendingAccount,
  CustomerDashboardOverview,
  ProviderDashboardOverview,
  Booking,
} from "@/types/api";

export const dashboardService = {
  // Admin Endpoints
  async getAdminOverview(): Promise<AdminDashboardOverview> {
    return api.get("/dashboard/admin/admin/");
  },

  async activateAccount(userId: number | string): Promise<{ message?: string; detail?: string }> {
    return api.patch(`/dashboard/admin/account_activate/${userId}/`);
  },

  async getPendingAccounts(): Promise<PendingAccount[] | { results?: PendingAccount[] }> {
    return api.get("/dashboard/admin/pending_account/");
  },

  async getTotalActiveAccountCount(): Promise<{ total_active_accounts?: number; count?: number } | number> {
    return api.get("/dashboard/admin/total_activate_account_count/");
  },

  async getTotalPendingAccountCount(): Promise<{ total_pending_accounts?: number; count?: number } | number> {
    return api.get("/dashboard/admin/total_activate_pending_count/");
  },

  // Customer Endpoints
  async getCustomerOverview(): Promise<CustomerDashboardOverview> {
    return api.get("/dashboard/customer/customer/");
  },

  async getCustomerTotalOrders(): Promise<Booking[] | { results?: Booking[] }> {
    return api.get("/dashboard/customer/total_oder_list/");
  },

  async getCustomerCompletedBookings(): Promise<Booking[] | { results?: Booking[] }> {
    return api.get("/dashboard/customer/completed_booking/");
  },

  async getCustomerPendingBookings(): Promise<Booking[] | { results?: Booking[] }> {
    return api.get("/dashboard/customer/pending_booking/");
  },

  // Service Provider Endpoints
  async getProviderOverview(): Promise<ProviderDashboardOverview> {
    return api.get("/dashboard/service_provider/service_provide/");
  },

  async getProviderPendingBookings(): Promise<Booking[] | { results?: Booking[] }> {
    return api.get("/dashboard/service_provider/get_pending_booking/");
  },

  async getProviderAcceptedBookings(): Promise<Booking[] | { results?: Booking[] }> {
    return api.get("/dashboard/service_provider/get_accept_booking/");
  },

  async acceptBooking(bookingId: number | string): Promise<{ message?: string }> {
    return api.post(`/dashboard/service_provider/accept_booking/${bookingId}/`);
  },

  async rejectBooking(bookingId: number | string): Promise<{ message?: string }> {
    return api.post(`/dashboard/service_provider/reject_booking/${bookingId}/`);
  },

  async completeBooking(bookingId: number | string): Promise<{ message?: string }> {
    return api.post(`/dashboard/service_provider/complete_booking/${bookingId}/`);
  },

  async getTotalAcceptedBookingCount(): Promise<{ total_accepted?: number; count?: number } | number> {
    return api.get("/dashboard/service_provider/total_accept_booking/");
  },

  async getTotalCompletedBookingCount(): Promise<{ total_completed?: number; count?: number } | number> {
    return api.get("/dashboard/service_provider/total_completed_booking/");
  },
};

