import { api } from "@/lib/api/client";
import type { PaymentInitiateResponse, PaymentRecord } from "@/types/api";

export function extractPaymentRedirectUrl(data: unknown): string | null {
  if (!data || typeof data !== "object") return null;
  const obj = data as Record<string, unknown>;
  const candidates = [
    obj.GatewayPageURL,
    obj.gateway_url,
    obj.payment_url,
    obj.url,
    obj.redirect_url,
    (obj.data as Record<string, unknown> | undefined)?.GatewayPageURL,
    (obj.data as Record<string, unknown> | undefined)?.payment_url,
    (obj.data as Record<string, unknown> | undefined)?.url,
  ];

  for (const c of candidates) {
    if (typeof c === "string" && (c.startsWith("http://") || c.startsWith("https://"))) {
      return c;
    }
  }
  return null;
}

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
