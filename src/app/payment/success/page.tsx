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
  AlertCircle,
  Home,
  RefreshCw,
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
      <div className="max-w-lg mx-auto rounded-3xl bg-white border border-stone-200 p-10 shadow-tactile text-center space-y-4">
        <div className="w-16 h-16 rounded-2xl bg-teal-50 border border-teal-200 flex items-center justify-center text-teal-800 mx-auto">
          <Loader2 className="h-8 w-8 animate-spin" />
        </div>
        <div className="space-y-1">
          <h2 className="text-2xl font-extrabold text-stone-900 font-heading">
            Verifying Transaction...
          </h2>
          <p className="text-xs text-stone-500">
            Please wait while we confirm your payment with the SSLCommerz gateway.
          </p>
        </div>
      </div>
    );
  }

  // STATE 2: Confirmed Success
  if (verificationData && verificationData.payment_attempt_status === "success") {
    const isAdvance = verificationData.purpose === "advance";

    return (
      <div className="max-w-lg mx-auto rounded-3xl bg-white border border-stone-200 p-8 sm:p-10 shadow-tactile text-center space-y-6">
        <div className="w-16 h-16 rounded-2xl bg-emerald-50 border border-emerald-200 flex items-center justify-center text-emerald-600 mx-auto">
          <CheckCircle2 className="h-8 w-8" />
        </div>

        <div className="space-y-2">
          <span className="text-[10px] uppercase font-bold tracking-wider px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-200">
            Payment Confirmed
          </span>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-stone-900 font-heading">
            {isAdvance ? "20% Advance Paid Successfully" : "Final Balance Paid"}
          </h2>
          <p className="text-xs text-stone-500 leading-relaxed max-w-sm mx-auto">
            {isAdvance
              ? "Your 20% advance has been secured in escrow via SSLCommerz. Your provider is now preparing for your appointment!"
              : "Thank you for completing your service balance. We hope you loved the work!"}
          </p>
        </div>

        {/* Itemized Verified Transaction Receipt */}
        <div className="rounded-2xl bg-stone-50 border border-stone-200 p-5 space-y-2.5 text-xs text-left">
          <div className="flex items-center justify-between text-stone-600">
            <span>Transaction ID</span>
            <span className="font-mono text-stone-900 font-semibold">{verificationData.transaction_id || tranIdFromUrl || "N/A"}</span>
          </div>

          <div className="flex items-center justify-between text-stone-600">
            <span>Payment Purpose</span>
            <span className="font-bold text-stone-900 uppercase text-[11px]">
              {verificationData.purpose} Payment
            </span>
          </div>

          <div className="flex items-center justify-between text-stone-600">
            <span>Amount Paid</span>
            <span className="font-extrabold text-teal-900 text-sm tabular-nums">
              ৳{Number(verificationData.payment_amount).toFixed(2)}
            </span>
          </div>

          <div className="flex items-center justify-between text-stone-600">
            <span>Booking Status</span>
            <span className="font-bold text-emerald-700 capitalize">
              {verificationData.booking_payment_status.replace(/_/g, " ")}
            </span>
          </div>

          {Number(verificationData.booking_remaining_amount) > 0 && (
            <div className="pt-2 border-t border-stone-200/80 flex items-center justify-between text-stone-600">
              <span>Remaining Balance (Due upon completion)</span>
              <span className="font-bold text-stone-800 tabular-nums">
                ৳{Number(verificationData.booking_remaining_amount).toFixed(2)}
              </span>
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div className="pt-2 flex flex-col sm:flex-row items-center gap-3">
          <Button asChild className="w-full sm:w-auto flex-1 font-bold h-11 gap-2 shadow-md">
            <Link href="/dashboard/customer/bookings">
              <Calendar className="h-4 w-4" />
              <span>View My Bookings</span>
            </Link>
          </Button>
          <Button variant="outline" asChild className="w-full sm:w-auto flex-1 h-11">
            <Link href="/">Back to Home</Link>
          </Button>
        </div>
      </div>
    );
  }

  // STATE 3: Unverified / Fallback Notice
  return (
    <div className="max-w-lg mx-auto rounded-3xl bg-white border border-stone-200 p-8 sm:p-10 shadow-tactile text-center space-y-6">
      <div className="w-16 h-16 rounded-2xl bg-amber-50 border border-amber-200 flex items-center justify-center text-amber-600 mx-auto">
        <ShieldCheck className="h-8 w-8" />
      </div>

      <div className="space-y-2">
        <h2 className="text-2xl font-extrabold text-stone-900 font-heading">
          Transaction Processed
        </h2>
        <p className="text-xs text-stone-500 max-w-sm mx-auto">
          Your payment callback has been acknowledged by SSLCommerz.
          {tranIdFromUrl && (
            <span className="block mt-1 font-mono text-[11px] text-stone-600">
              Reference: {tranIdFromUrl}
            </span>
          )}
        </p>
      </div>

      <div className="p-4 rounded-xl bg-stone-50 border border-stone-200 text-xs text-stone-600">
        You can verify updated booking and payment statuses directly in your Customer Bookings dashboard.
      </div>

      <div className="pt-2 flex flex-col sm:flex-row items-center gap-3">
        <Button asChild className="w-full sm:w-auto flex-1 font-bold h-11 gap-2 shadow-md">
          <Link href="/dashboard/customer/bookings">
            <Calendar className="h-4 w-4" />
            <span>Check My Bookings</span>
          </Link>
        </Button>
        <Button variant="outline" asChild className="w-full sm:w-auto flex-1 h-11">
          <Link href="/">Home</Link>
        </Button>
      </div>
    </div>
  );
}

export default function PaymentSuccessPage() {
  return (
    <div className="min-h-screen bg-[#FAF9F6] flex items-center justify-center p-6 sm:p-10">
      <React.Suspense
        fallback={
          <div className="max-w-lg mx-auto rounded-3xl bg-white p-10 text-center">
            <Loader2 className="h-8 w-8 animate-spin text-teal-800 mx-auto" />
          </div>
        }
      >
        <PaymentSuccessContent />
      </React.Suspense>
    </div>
  );
}
