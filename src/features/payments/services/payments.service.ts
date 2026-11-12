import { api } from "@/lib/api/client";
import type { PaymentInitiateResponse, PaymentRecord } from "@/types/api";

export const paymentsService = {
  async initiateAdvance(bookingId: number | string): Promise<PaymentInitiateResponse> {
    return api.post<PaymentInitiateResponse>("/payments/payments/advance/initiate/", {
      booking_id: String(bookingId),
    });
  },

  async initiateFinal(bookingId: number | string): Promise<PaymentInitiateResponse> {
    return api.post<PaymentInitiateResponse>("/payments/payments/final/initiate/", {
      booking_id: String(bookingId),
    });
  },

  async confirmCash(bookingId: number | string): Promise<{ message?: string }> {
    return api.post(`/payments/payments/cash/${bookingId}/`);
  },

  async checkStatus(paymentId: number | string): Promise<PaymentRecord> {
    return api.get<PaymentRecord>(`/payments/status/${paymentId}/`);
  },
};

