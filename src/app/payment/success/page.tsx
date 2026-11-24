"use client";

import * as React from "react";
import Link from "next/link";
import { useSearchParams, useRouter } from "next/navigation";
import { useQueryClient } from "@tanstack/react-query";
import {
  CheckCircle2,
  ShieldCheck,
  ArrowRight,
  Loader2,
  Calendar,
  Lock,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { paymentsService, type PaymentStatusVerificationResponse } from "@/features/payments/services/payments.service";

function PaymentSuccessContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const queryClient = useQueryClient();

  const tranIdFromUrl = searchParams.get("tran_id");

  const [isLoading, setIsLoading] = React.useState(true);
  const [verificationData, setVerificationData] = React.useState<PaymentStatusVerificationResponse | null>(null);
  const [errorMessage, setErrorMessage] = React.useState<string | null>(null);

  React.useEffect(() => {
    let isMounted = true;

    async function verifyTransaction() {
      // 1. Retrieve pending_payment_id from localStorage
      const pendingPaymentId = typeof window !== "undefined" ? localStorage.getItem("pending_payment_id") : null;

      if (!pendingPaymentId) {
        setIsLoading(false);
        return;
      }

      try {
        const res = await paymentsService.checkStatus(pendingPaymentId);

        if (!isMounted) return;

        setVerificationData(res);

        if (res.payment_attempt_status === "success") {
          // Cleanup storage & invalidate booking query caches
          if (typeof window !== "undefined") {
            localStorage.removeItem("pending_payment_id");
          }
          queryClient.invalidateQueries({ queryKey: ["my-bookings"] });
          queryClient.invalidateQueries({ queryKey: ["dashboard", "customer"] });
        }
      } catch (err: any) {
        if (!isMounted) return;
        setErrorMessage(err?.message || "Could not automatically verify payment status.");
      } finally {
        if (isMounted) setIsLoading(false);
      }
    }

    verifyTransaction();

    return () => {
      isMounted = false;
    };
  }, [queryClient]);

  // STATE 1: Verifying
  if (isLoading) {
    return (
      <div className="max-w-md w-full mx-auto rounded-2xl bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 p-8 shadow-sm text-center space-y-4">
        <div className="w-12 h-12 rounded-xl bg-teal-50 dark:bg-teal-950/40 border border-teal-200 dark:border-teal-800/60 flex items-center justify-center text-teal-800 dark:text-teal-200 mx-auto">
          <Loader2 className="h-6 w-6 animate-spin" />
        </div>
        <div className="space-y-1">
          <h2 className="text-xl font-semibold text-stone-900 dark:text-stone-100">
            Verifying payment...
          </h2>
          <p className="text-xs text-stone-500">
            Confirming transaction with SSLCommerz gateway.
          </p>
        </div>
      </div>
    );
  }

  // STATE 2: Confirmed Success
  if (verificationData && verificationData.payment_attempt_status === "success") {
    const isAdvance = verificationData.purpose === "advance";

    return (
      <div className="max-w-md w-full mx-auto rounded-2xl bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 p-6 sm:p-8 shadow-sm text-center space-y-5">
        <div className="w-12 h-12 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/60 flex items-center justify-center text-emerald-600 dark:text-emerald-400 mx-auto">
          <CheckCircle2 className="h-6 w-6" />
        </div>

        <div className="space-y-1">
          <div className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-medium bg-emerald-50 text-emerald-700 border border-emerald-200 dark:bg-emerald-950/50 dark:text-emerald-300 dark:border-emerald-800">
            Verified payment
          </div>
          <h2 className="text-xl font-semibold text-stone-900 dark:text-stone-100 pt-1">
            {isAdvance ? "20% advance confirmed" : "Final payment confirmed"}
          </h2>
          <p className="text-xs text-stone-500 leading-relaxed max-w-xs mx-auto">
            {isAdvance
              ? "Your 20% advance is held securely in escrow. The trade professional has received your booking confirmation."
              : "Thank you for completing your service balance payment."}
          </p>
        </div>

        {/* Tabular Verified Transaction Receipt */}
        <div className="rounded-xl bg-stone-50 dark:bg-stone-800/40 border border-stone-200 dark:border-stone-800 p-4 space-y-2 text-xs text-left">
          <div className="flex items-center justify-between gap-3 text-stone-500">
            <span>Transaction ID</span>
            <span className="min-w-0 break-all text-right font-mono font-medium text-stone-800 dark:text-stone-200">
              {verificationData.transaction_id || tranIdFromUrl || "N/A"}
            </span>
          </div>

          <div className="flex items-center justify-between gap-3 text-stone-500">
            <span>Payment type</span>
            <span className="font-medium text-stone-800 dark:text-stone-200 capitalize">
              {verificationData.purpose} payment
            </span>
          </div>

          <div className="flex items-center justify-between gap-3 text-stone-500">
            <span>Amount paid</span>
            <span className="font-semibold text-stone-900 dark:text-stone-100 tabular-nums">
              ৳{Number(verificationData.payment_amount).toFixed(2)}
            </span>
          </div>

          <div className="flex items-center justify-between gap-3 text-stone-500">
            <span>Booking status</span>
            <span className="font-medium text-emerald-600 dark:text-emerald-400 capitalize">
              {verificationData.booking_payment_status.replace(/_/g, " ")}
            </span>
          </div>

          {Number(verificationData.booking_remaining_amount) > 0 && (
            <div className="flex items-center justify-between gap-3 border-t border-stone-200 pt-2 text-stone-500 dark:border-stone-700/60">
              <span>Remaining balance (on completion)</span>
              <span className="font-medium text-stone-800 dark:text-stone-200 tabular-nums">
                ৳{Number(verificationData.booking_remaining_amount).toFixed(2)}
              </span>
            </div>
          )}
        </div>

        {/* Escrow badge */}
        <div className="flex items-center justify-center gap-1.5 text-[11px] text-stone-500">
          <Lock className="h-3 w-3 text-emerald-600" />
          <span>SSLCommerz encrypted transaction</span>
        </div>

        {/* Action Buttons */}
        <div className="pt-1 flex flex-col sm:flex-row items-center gap-2.5">
          <Button asChild className="w-full sm:w-auto flex-1 font-medium h-10 text-xs bg-[#EA580C] hover:bg-[#c2410c] text-white shadow-sm gap-1.5">
            <Link href="/dashboard/customer/bookings">
              <Calendar className="h-3.5 w-3.5" />
              <span>View my bookings</span>
            </Link>
          </Button>
          <Button variant="outline" asChild className="w-full sm:w-auto flex-1 h-10 text-xs border-stone-200 dark:border-stone-800">
            <Link href="/">Back to home</Link>
          </Button>
        </div>
      </div>
    );
  }

  // STATE 3: Unverified / Fallback Notice
  return (
    <div className="max-w-md w-full mx-auto rounded-2xl bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 p-6 sm:p-8 shadow-sm text-center space-y-5">
      <div className="w-12 h-12 rounded-xl bg-stone-100 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 flex items-center justify-center text-stone-700 dark:text-stone-300 mx-auto">
        <ShieldCheck className="h-6 w-6" />
      </div>

      <div className="space-y-1">
        <h2 className="text-xl font-semibold text-stone-900 dark:text-stone-100">
          Payment received
        </h2>
        <p className="text-xs text-stone-500 max-w-xs mx-auto leading-relaxed">
          Your payment callback has been registered by SSLCommerz.
          {tranIdFromUrl && (
            <span className="block mt-1 font-mono text-[11px] text-stone-600 dark:text-stone-400">
              Reference: {tranIdFromUrl}
            </span>
          )}
        </p>
      </div>

      <div className="p-3.5 rounded-xl bg-stone-50 dark:bg-stone-800/40 border border-stone-200 dark:border-stone-800 text-xs text-stone-600 dark:text-stone-400 text-left">
        You can check the updated booking and escrow status directly in your customer dashboard.
      </div>

      <div className="pt-1 flex flex-col sm:flex-row items-center gap-2.5">
        <Button asChild className="w-full sm:w-auto flex-1 font-medium h-10 text-xs bg-[#EA580C] hover:bg-[#c2410c] text-white shadow-sm gap-1.5">
          <Link href="/dashboard/customer/bookings">
            <Calendar className="h-3.5 w-3.5" />
            <span>Check my bookings</span>
          </Link>
        </Button>
        <Button variant="outline" asChild className="w-full sm:w-auto flex-1 h-10 text-xs border-stone-200 dark:border-stone-800">
          <Link href="/">Back to home</Link>
        </Button>
      </div>
    </div>
  );
}

export default function PaymentSuccessPage() {
  return (
    <div className="min-h-screen bg-[#FAF9F6] dark:bg-stone-950 flex items-center justify-center p-4 sm:p-6">
      <React.Suspense
        fallback={
          <div className="max-w-md w-full mx-auto rounded-2xl bg-white p-8 text-center">
            <Loader2 className="h-6 w-6 animate-spin text-stone-400 mx-auto" />
          </div>
        }
      >
        <PaymentSuccessContent />
      </React.Suspense>
    </div>
  );
}
