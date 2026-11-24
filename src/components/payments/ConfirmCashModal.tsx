"use client";

import * as React from "react";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Banknote, CheckCircle2, AlertCircle, Loader2 } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import {
  paymentsService,
  type CashConfirmationResponse,
} from "@/features/payments/services/payments.service";
import type { Booking } from "@/types/api";

interface ConfirmCashModalProps {
  booking: Booking | null;
  children?: React.ReactNode;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  onSuccess?: (data?: CashConfirmationResponse) => void;
}

export function ConfirmCashModal({
  booking,
  children,
  open: controlledOpen,
  onOpenChange: setControlledOpen,
  onSuccess,
}: ConfirmCashModalProps) {
  const queryClient = useQueryClient();
  const [internalOpen, setInternalOpen] = React.useState(false);
  const isControlled = controlledOpen !== undefined;
  const open = isControlled ? controlledOpen : internalOpen;
  const setOpen = isControlled ? setControlledOpen! : setInternalOpen;

  const [isLoading, setIsLoading] = React.useState(false);
  const [errorMsg, setErrorMsg] = React.useState<string | null>(null);

  if (!booking) return null;

  const remainingAmount = Number(booking.remaining_amount || 0);
  const totalPrice = Number(booking.price_at_booking || booking.total_amount || 0);
  const paidAmount = Number(booking.paid_amount || 0);
  const cashDue = remainingAmount > 0 ? remainingAmount : totalPrice - paidAmount;

  const serviceName = React.useMemo(() => {
    if (typeof booking.service === "object" && booking.service) {
      return (booking.service as any).name || (booking.service as any).title;
    }
    if (booking.service_name && !booking.service_name.startsWith("Service #")) {
      return booking.service_name;
    }
    if (booking.service_title && !booking.service_title.startsWith("Service #")) {
      return booking.service_title;
    }
    return "Local Service";
  }, [booking]);

  const customerName = React.useMemo(() => {
    if (typeof booking.customer === "object" && booking.customer) {
      return (booking.customer as any).full_name || (booking.customer as any).username;
    }
    return booking.customer_name || "Customer";
  }, [booking]);

  const handleConfirm = async () => {
    setIsLoading(true);
    setErrorMsg(null);

    try {
      const data = await paymentsService.confirmCashPayment(booking.id);

      toast.success(
        data?.message || `Cash payment of ৳${cashDue.toLocaleString()} confirmed! Job is fully settled.`
      );

      // Invalidate relevant caches
      queryClient.invalidateQueries({ queryKey: ["dashboard", "provider"] });
      queryClient.invalidateQueries({ queryKey: ["bookings", "provider_all"] });
      queryClient.invalidateQueries({ queryKey: ["my-bookings"] });

      if (onSuccess) {
        onSuccess(data);
      }

      setOpen(false);
    } catch (err: any) {
      const message =
        err?.errors?.error?.[0] ||
        err?.errors?.error ||
        err?.detail ||
        err?.message ||
        "Failed to confirm cash payment. Please check with your customer.";

      setErrorMsg(message);
      toast.error(message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      {children && <DialogTrigger asChild>{children}</DialogTrigger>}
      <DialogContent className="sm:max-w-md rounded-2xl p-6 bg-white dark:bg-stone-900 border-stone-200 dark:border-stone-800 shadow-tactile space-y-4">
        <DialogHeader className="space-y-1.5 text-left">
          <div className="w-12 h-12 rounded-2xl bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-200 dark:border-emerald-800 flex items-center justify-center text-emerald-700 dark:text-emerald-400 mb-1">
            <Banknote className="h-6 w-6" />
          </div>
          <DialogTitle className="text-lg font-semibold text-stone-900 dark:text-stone-100 font-heading">
            Confirm Cash Collection
          </DialogTitle>
          <DialogDescription className="text-xs text-stone-500 leading-relaxed">
            Verify that you have received physical cash payment from the customer for this completed job.
          </DialogDescription>
        </DialogHeader>

        {errorMsg && (
          <div className="p-3 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 text-xs text-rose-800 dark:text-rose-200 flex items-start gap-2">
            <AlertCircle className="h-4 w-4 text-rose-600 shrink-0 mt-0.5" />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* Itemized Cash Amount Box */}
        <div className="p-4 rounded-xl bg-emerald-50/70 dark:bg-emerald-950/40 border border-emerald-200/80 dark:border-emerald-800 space-y-2">
          <div className="flex items-center justify-between text-xs text-emerald-900 dark:text-emerald-200">
            <span className="font-medium">Cash Amount to Collect:</span>
            <span className="text-lg font-bold text-emerald-800 dark:text-emerald-300 tabular-nums">
              ৳{cashDue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </span>
          </div>

          <div className="pt-2 border-t border-emerald-200/60 dark:border-emerald-800/60 space-y-1 text-[11px] text-emerald-800 dark:text-emerald-300">
            <div className="flex items-center justify-between">
              <span className="text-stone-500 dark:text-stone-400">Customer:</span>
              <span className="font-semibold">{customerName}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-stone-500 dark:text-stone-400">Service:</span>
              <span className="font-semibold truncate max-w-[200px]">{serviceName}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-stone-500 dark:text-stone-400">Booking Ref:</span>
              <span className="font-mono text-stone-600 dark:text-stone-300">#{String(booking.id).slice(0, 8)}</span>
            </div>
          </div>
        </div>

        {/* Trust & Safety Warning Notice */}
        <div className="p-3 rounded-xl bg-stone-50 dark:bg-stone-800/40 border border-stone-200 dark:border-stone-800 text-[11px] text-stone-600 dark:text-stone-400 flex items-start gap-2">
          <AlertCircle className="h-4 w-4 text-amber-600 shrink-0 mt-0.5" />
          <span>
            Please only confirm after the cash is in your hands. Once confirmed, this booking will be marked as <strong>Fully Paid</strong> and cannot be undone.
          </span>
        </div>

        <DialogFooter className="flex flex-col-reverse sm:flex-row gap-2 sm:justify-end pt-2">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => setOpen(false)}
            disabled={isLoading}
            className="rounded-xl text-xs h-10 border-stone-200 dark:border-stone-800"
          >
            Cancel
          </Button>
          <Button
            type="button"
            size="sm"
            onClick={handleConfirm}
            disabled={isLoading}
            className="rounded-xl text-xs h-10 bg-emerald-700 hover:bg-emerald-800 text-white font-medium shadow-sm gap-1.5"
          >
            {isLoading ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                <span>Confirming Collection...</span>
              </>
            ) : (
              <>
                <CheckCircle2 className="h-4 w-4" />
                <span>Confirm ৳{cashDue.toLocaleString()} Received</span>
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export default ConfirmCashModal;
