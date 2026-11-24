"use client";

import * as React from "react";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { AlertTriangle, Trash2, Loader2 } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { bookingsService } from "@/features/bookings/services/bookings.service";
import type { Booking } from "@/types/api";

interface CancelBookingDialogProps {
  booking: Booking | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function CancelBookingDialog({ booking, open, onOpenChange }: CancelBookingDialogProps) {
  const queryClient = useQueryClient();
  const [reason, setReason] = React.useState("Customer changed plans");
  const [isLoading, setIsLoading] = React.useState(false);

  const handleConfirmCancel = async () => {
    if (!booking) return;

    setIsLoading(true);
    try {
      await bookingsService.cancel(booking.id, {
        cancellation_reason: reason.trim() || "Customer requested cancellation",
      });

      toast.success("Booking cancelled successfully.");
      queryClient.invalidateQueries({ queryKey: ["my-bookings"] });
      queryClient.invalidateQueries({ queryKey: ["dashboard", "customer"] });
      onOpenChange(false);
    } catch (err: any) {
      toast.error(err?.message || "Could not cancel booking. Only pending bookings can be cancelled.");
    } finally {
      setIsLoading(false);
    }
  };

  if (!booking) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md rounded-2xl p-6 bg-white dark:bg-stone-900 border-stone-200 shadow-lg">
        <DialogHeader className="space-y-1.5 text-left">
          <div className="w-11 h-11 rounded-2xl bg-rose-50 border border-rose-200 flex items-center justify-center text-rose-600 mb-1">
            <AlertTriangle className="h-5 w-5" />
          </div>
          <DialogTitle className="text-xl font-semibold font-heading text-stone-900 dark:text-stone-100">
            Cancel Booking Request
          </DialogTitle>
          <DialogDescription className="text-xs text-stone-500">
            Are you sure you want to cancel this pending appointment? This action cannot be undone.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-3 pt-2 text-left">
          <div className="p-3.5 rounded-2xl bg-stone-50 border border-stone-200 text-xs text-stone-700 space-y-1">
            <div className="font-semibold text-stone-900 truncate">
              {booking.service_name || booking.service_title || "Local Service"}
            </div>
            <div className="text-stone-500">
              Scheduled for: {booking.booking_date} at {booking.booking_time}
            </div>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="cancel-reason" className="text-xs font-semibold text-stone-700">
              Reason for Cancellation <span className="font-normal text-stone-400">(Optional)</span>
            </Label>
            <Textarea
              id="cancel-reason"
              rows={2}
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="e.g. Found alternate provider, schedule conflict..."
              className="rounded-xl bg-stone-50 border-stone-200 text-xs"
            />
          </div>

          <div className="pt-2 flex items-center justify-end gap-2.5">
            <Button
              type="button"
              variant="outline"
              disabled={isLoading}
              onClick={() => onOpenChange(false)}
              className="rounded-xl h-10 text-xs font-medium"
            >
              Keep Booking
            </Button>

            <Button
              type="button"
              variant="destructive"
              disabled={isLoading}
              onClick={handleConfirmCancel}
              className="h-10 gap-1.5 rounded-xl text-xs font-semibold shadow-sm"
            >
              {isLoading ? (
                <>
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  <span>Cancelling...</span>
                </>
              ) : (
                <>
                  <Trash2 className="h-3.5 w-3.5" />
                  <span>Confirm Cancel</span>
                </>
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
