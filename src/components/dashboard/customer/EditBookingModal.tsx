"use client";

import * as React from "react";
import { useForm } from "@tanstack/react-form";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Calendar as CalendarIcon, Clock, AlertCircle, Loader2, Edit3 } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { bookingsService } from "@/features/bookings/services/bookings.service";
import type { Booking } from "@/types/api";

interface EditBookingModalProps {
  booking: Booking | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function EditBookingModal({ booking, open, onOpenChange }: EditBookingModalProps) {
  const queryClient = useQueryClient();
  const [isLoading, setIsLoading] = React.useState(false);
  const [errorMsg, setErrorMsg] = React.useState<string | null>(null);

  const todayStr = React.useMemo(() => new Date().toISOString().split("T")[0], []);

  const form = useForm({
    defaultValues: {
      booking_date: booking?.booking_date || todayStr,
      booking_time: booking?.booking_time ? booking.booking_time.slice(0, 5) : "10:00",
      note: booking?.note || "",
    },
    onSubmit: async ({ value }) => {
      if (!booking) return;

      setIsLoading(true);
      setErrorMsg(null);
      try {
        await bookingsService.update(booking.id, {
          booking_date: value.booking_date,
          booking_time: value.booking_time,
          note: value.note.trim() || undefined,
        });

        toast.success("Booking updated and rescheduled successfully!");
        queryClient.invalidateQueries({ queryKey: ["my-bookings"] });
        queryClient.invalidateQueries({ queryKey: ["dashboard", "customer"] });
        onOpenChange(false);
      } catch (err: any) {
        let msg = err?.message || err?.detail || "Could not reschedule booking.";
        if (err?.errors?.booking_time) {
          msg = Array.isArray(err.errors.booking_time) ? err.errors.booking_time[0] : String(err.errors.booking_time);
        }
        setErrorMsg(msg);
        toast.error(msg);
      } finally {
        setIsLoading(false);
      }
    },
  });

  // Re-sync values on booking change
  React.useEffect(() => {
    if (booking) {
      form.setFieldValue("booking_date", booking.booking_date || todayStr);
      form.setFieldValue("booking_time", booking.booking_time ? booking.booking_time.slice(0, 5) : "10:00");
      form.setFieldValue("note", booking.note || "");
    }
  }, [booking, form, todayStr]);

  if (!booking) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md rounded-2xl p-6 bg-white dark:bg-stone-900 border-stone-200 shadow-lg">
        <DialogHeader className="space-y-1.5 text-left">
          <div className="w-11 h-11 rounded-2xl bg-teal-50 border border-teal-200 flex items-center justify-center text-teal-800 mb-1">
            <Edit3 className="h-5 w-5" />
          </div>
          <DialogTitle className="text-xl font-semibold font-heading text-stone-900 dark:text-stone-100">
            Reschedule Pending Booking
          </DialogTitle>
          <DialogDescription className="text-xs text-stone-500">
            Update your appointment date, time, or provider instructions before confirmation.
          </DialogDescription>
        </DialogHeader>

        {errorMsg && (
          <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-center gap-2">
            <AlertCircle className="h-4 w-4 text-rose-600 shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        <form
          onSubmit={(e) => {
            e.preventDefault();
            e.stopPropagation();
            form.handleSubmit();
          }}
          className="space-y-4 pt-1"
        >
          <form.Field
            name="booking_date"
            validators={{
              onChange: ({ value }) => (!value ? "Date is required" : undefined),
            }}
          >
            {(field) => (
              <div className="space-y-1.5">
                <Label htmlFor={field.name} className="text-xs font-semibold text-stone-700">
                  New Date
                </Label>
                <div className="relative">
                  <CalendarIcon className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-stone-400" />
                  <Input
                    id={field.name}
                    type="date"
                    min={todayStr}
                    value={field.state.value}
                    onChange={(e) => field.handleChange(e.target.value)}
                    className="pl-10 h-10 rounded-xl bg-stone-50 border-stone-200 text-xs"
                  />
                </div>
              </div>
            )}
          </form.Field>

          <form.Field
            name="booking_time"
            validators={{
              onChange: ({ value }) => (!value ? "Time is required" : undefined),
            }}
          >
            {(field) => (
              <div className="space-y-1.5">
                <Label htmlFor={field.name} className="text-xs font-semibold text-stone-700">
                  New Time (24h)
                </Label>
                <div className="relative">
                  <Clock className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-stone-400" />
                  <Input
                    id={field.name}
                    type="time"
                    value={field.state.value}
                    onChange={(e) => field.handleChange(e.target.value)}
                    className="pl-10 h-10 rounded-xl bg-stone-50 border-stone-200 text-xs"
                  />
                </div>
              </div>
            )}
          </form.Field>

          <form.Field name="note">
            {(field) => (
              <div className="space-y-1.5">
                <Label htmlFor={field.name} className="text-xs font-semibold text-stone-700">
                  Note for Technician
                </Label>
                <Textarea
                  id={field.name}
                  rows={2}
                  value={field.state.value}
                  onChange={(e) => field.handleChange(e.target.value)}
                  className="rounded-xl bg-stone-50 border-stone-200 text-xs"
                />
              </div>
            )}
          </form.Field>

          <div className="pt-2 flex items-center justify-end gap-2.5">
            <Button
              type="button"
              variant="outline"
              disabled={isLoading}
              onClick={() => onOpenChange(false)}
              className="rounded-xl h-10 text-xs font-medium"
            >
              Cancel
            </Button>

            <Button
              type="submit"
              disabled={isLoading}
              className="h-10 gap-1.5 rounded-xl bg-[#EA580C] text-xs font-semibold text-white shadow-sm hover:bg-[#C2410C]"
            >
              {isLoading && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
              <span>Save Changes</span>
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
