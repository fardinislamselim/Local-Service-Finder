"use client";

import * as React from "react";
import { toast } from "sonner";
import { CreditCard, ShieldCheck, ArrowRight, Loader2, AlertCircle } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { paymentsService } from "@/features/payments/services/payments.service";
import type { Booking } from "@/types/api";

interface PaymentCheckoutModalProps {
  booking: Booking;
  type: "advance" | "final";
  children?: React.ReactNode;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}

export function PaymentCheckoutModal({
  booking,
  type,
  children,
  open: controlledOpen,
  onOpenChange: setControlledOpen,
}: PaymentCheckoutModalProps) {
  const [internalOpen, setInternalOpen] = React.useState(false);
  const isControlled = controlledOpen !== undefined;
  const open = isControlled ? controlledOpen : internalOpen;
  const setOpen = isControlled ? setControlledOpen! : setInternalOpen;

  const [isLoading, setIsLoading] = React.useState(false);
  const [errorMsg, setErrorMsg] = React.useState<string | null>(null);

  const isAdvance = type === "advance";

  // Calculate amount due
  const amountDue = React.useMemo(() => {
    if (isAdvance) {
      if (booking.advance_amount) return Number(booking.advance_amount);
      const total = Number(booking.price_at_booking || booking.total_amount || 0);
      return total * 0.2;
    } else {
      if (booking.remaining_amount) return Number(booking.remaining_amount);
      const total = Number(booking.price_at_booking || booking.total_amount || 0);
      const paid = Number(booking.paid_amount || 0);
      return Math.max(0, total - paid);
    }
  }, [isAdvance, booking]);

  const handleProceedToPayment = async () => {
    setIsLoading(true);
    setErrorMsg(null);

    try {
      const res = isAdvance
        ? await paymentsService.initiateAdvance(String(booking.id))
        : await paymentsService.initiateFinal(String(booking.id));

      if (!res.gateway_url) {
        throw new Error("Did not receive a valid SSLCommerz payment gateway URL.");
      }

      // 1. Mandatory requirement: Save pending_payment_id before redirecting
      if (typeof window !== "undefined") {
        localStorage.setItem("pending_payment_id", res.payment_id);
      }

      toast.success("Connecting to SSLCommerz Secure Checkout...");

      // 2. Perform full-page redirect to SSLCommerz
      window.location.href = res.gateway_url;
    } catch (err: any) {
      let message = "Could not initiate payment session.";
      if (err?.statusCode === 409) {
        message = "A payment session is already in progress for this booking.";
      } else if (err?.statusCode === 502) {
        message = "Payment gateway is temporarily unavailable. Please try again shortly.";
      } else if (err?.message) {
        message = err.message;
      }

      setErrorMsg(message);
      toast.error(message);
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      {children && <DialogTrigger asChild>{children}</DialogTrigger>}
      <DialogContent className="sm:max-w-md rounded-2xl p-6 bg-white dark:bg-stone-900 border-stone-200 shadow-lg">
        <DialogHeader className="space-y-1.5 text-left">
          <div className="w-12 h-12 rounded-2xl bg-orange-50 border border-orange-200 flex items-center justify-center text-orange-600 mb-1">
            <CreditCard className="h-6 w-6" />
          </div>
          <DialogTitle className="text-xl font-semibold font-heading text-stone-900 dark:text-stone-100">
            {isAdvance ? "Pay 20% Secure Advance" : "Settle Remaining Balance"}
          </DialogTitle>
          <DialogDescription className="text-xs text-stone-500">
            {isAdvance
              ? "Your provider has accepted! Pay the mandatory 20% advance held in escrow via SSLCommerz to lock your slot."
              : "Service is complete! Settle the remaining balance safely via online gateway."}
          </DialogDescription>
        </DialogHeader>

        {errorMsg && (
          <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-center gap-2">
            <AlertCircle className="h-4 w-4 shrink-0 text-rose-600" />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* Visual Itemized Breakdown Receipt */}
        <div className="rounded-2xl bg-stone-50 border border-stone-200 p-4 space-y-2.5 text-xs">
          <div className="flex items-center justify-between gap-3 text-stone-600">
            <span>Service</span>
            <span className="max-w-[60%] truncate font-semibold text-stone-900">
              {booking.service_name || booking.service_title || "Verified Local Service"}
            </span>
          </div>

          <div className="flex items-center justify-between gap-3 text-stone-600">
            <span>Booking Reference</span>
            <span className="font-mono text-[10px] text-stone-500">{String(booking.id).slice(0, 8)}...</span>
          </div>

          <div className="flex items-center justify-between gap-3 text-stone-600">
            <span>Total Service Amount</span>
            <span className="font-semibold text-stone-800 tabular-nums">
              ৳{Number(booking.price_at_booking || booking.total_amount || 0).toFixed(2)}
            </span>
          </div>

          {Number(booking.paid_amount || 0) > 0 && (
            <div className="flex items-center justify-between gap-3 text-emerald-700">
              <span>Already Paid</span>
              <span className="font-semibold tabular-nums">- ৳{Number(booking.paid_amount).toFixed(2)}</span>
            </div>
          )}

          <div className="flex items-center justify-between gap-3 border-t border-stone-200 pt-2">
            <span className="font-semibold text-sm text-stone-900">Amount Due Now</span>
            <span className="shrink-0 text-lg font-semibold text-orange-600 tabular-nums">
              ৳{amountDue.toFixed(2)}
            </span>
          </div>
        </div>

        {/* SSLCommerz Reassurance */}
        <div className="p-3 rounded-xl bg-teal-50 border border-teal-200 flex items-center gap-2 text-xs text-teal-900">
          <ShieldCheck className="h-4 w-4 text-emerald-600 shrink-0" />
          <span>Protected by SSLCommerz • Instant Transaction Verification</span>
        </div>

        {/* CTA Buttons */}
        <div className="pt-2 flex flex-col sm:flex-row items-center gap-2.5">
          <Button
            type="button"
            variant="outline"
            onClick={() => setOpen(false)}
            disabled={isLoading}
            className="w-full sm:w-auto flex-1 rounded-xl h-11 text-xs font-semibold"
          >
            Cancel
          </Button>

          <Button
            type="button"
            disabled={isLoading}
            onClick={handleProceedToPayment}
            className="w-full gap-2 rounded-xl h-11 text-xs font-semibold bg-[#EA580C] text-white hover:bg-[#C2410C] sm:w-auto flex-1"
          >
            {isLoading ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                <span>Connecting to Gateway...</span>
              </>
            ) : (
              <>
                <span>Proceed to SSLCommerz</span>
                <ArrowRight className="h-4 w-4" />
              </>
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

export default PaymentCheckoutModal;
