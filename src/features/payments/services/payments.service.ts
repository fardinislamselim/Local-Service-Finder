import { api } from "@/lib/api";

export interface PaymentInitiationSuccessResponse {
  payment_id: string;
  transaction_id: string;
  purpose: "advance" | "final" | string;
  amount: string;
  gateway_url: string;
  booking_total?: string;
  booking_advance_amount?: string;
  booking_paid_amount?: string;
  booking_remaining_amount?: string;
}

export interface PaymentStatusVerificationResponse {
  payment_id: string;
  transaction_id: string;
  purpose: "advance" | "final" | string;
  payment_attempt_status: "pending" | "success" | "failed" | "refunded" | string;
  payment_amount: string;
  booking_payment_status: string;
  booking_paid_amount: string;
  booking_remaining_amount: string;
  booking_is_paid: boolean;
}

export function extractPaymentRedirectUrl(data: unknown): string | null {
  if (!data || typeof data !== "object") return null;
  const obj = data as Record<string, unknown>;
  const candidates = [
    obj.gateway_url,
    obj.GatewayPageURL,
    obj.payment_url,
    obj.url,
    (obj.data as Record<string, unknown> | undefined)?.gateway_url,
    (obj.data as Record<string, unknown> | undefined)?.GatewayPageURL,
  ];

  for (const c of candidates) {
    if (typeof c === "string" && (c.startsWith("http://") || c.startsWith("https://"))) {
      return c;
    }
  }
  return null;
}

export const paymentsService = {
  /**
   * Initiate 20% Advance Payment (Customer)
   * POST /api/v1/payments/payments/advance/initiate/
   * Auth: Bearer token (CUSTOMER role only)
   * Content-Type: application/json
   */
  async initiateAdvance(bookingId: string | number): Promise<PaymentInitiationSuccessResponse> {
    return api.post<PaymentInitiationSuccessResponse>(
      "/payments/payments/advance/initiate/",
      { booking_id: String(bookingId) }
    );
  },

  /**
   * Initiate Final Remaining Balance Payment (Customer)
   * POST /api/v1/payments/payments/final/initiate/
   * Auth: Bearer token (CUSTOMER role only)
   * Content-Type: application/json
   */
  async initiateFinal(bookingId: string | number): Promise<PaymentInitiationSuccessResponse> {
    return api.post<PaymentInitiationSuccessResponse>(
      "/payments/payments/final/initiate/",
      { booking_id: String(bookingId) }
    );
  },

  /**
   * Verify Payment Status
   * GET /api/v1/payments/status/{payment_id}/
   * Auth: Bearer token (CUSTOMER role only)
   */
  async checkStatus(paymentId: string | number): Promise<PaymentStatusVerificationResponse> {
    return api.get<PaymentStatusVerificationResponse>(`/payments/status/${paymentId}/`);
  },

  /**
   * Cash Confirmation (Provider)
   * POST /api/v1/payments/payments/cash/{booking_id}/
   * Prerequisites: booking.status === "completed" AND booking.final_payment_method === "cash"
   */
  async confirmCash(bookingId: string | number): Promise<{
    message: string;
    paid_amount: string;
    remaining_amount: string;
    payment_status: string;
    is_paid: boolean;
  }> {
    return api.post(`/payments/payments/cash/${bookingId}/`);
  },
};
