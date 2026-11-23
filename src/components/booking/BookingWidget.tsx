"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useForm } from "@tanstack/react-form";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import {
  Calendar as CalendarIcon,
  Clock,
  CreditCard,
  Banknote,
  ShieldCheck,
  AlertCircle,
  Loader2,
  Lock,
  ArrowRight,
  Sparkles,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { bookingsService } from "@/features/bookings/services/bookings.service";
import { useAuthStore } from "@/store/useAuthStore";
import type { Service } from "@/types/api";

interface BookingWidgetProps {
  service: Service;
}

export function BookingWidget({ service }: BookingWidgetProps) {
  const router = useRouter();
  const queryClient = useQueryClient();
  const { user, profile, isAuthenticated } = useAuthStore();

  const role = user?.role || profile?.role;
  const isCustomer = role === "CUSTOMER";
  const isQuotation = service.pricing_type === "quotation";
  const isHourly = service.pricing_type === "hourly";

  // Hourly duration state
  const [durationHours, setDurationHours] = React.useState<number>(2);
  const [durationMinutes, setDurationMinutes] = React.useState<number>(0);
  const [paymentMethod, setPaymentMethod] = React.useState<"cash" | "online">("cash");

  const [isLoading, setIsLoading] = React.useState(false);
  const [apiError, setApiError] = React.useState<string | null>(null);

  // Minimum date: today (YYYY-MM-DD)
  const todayStr = React.useMemo(() => {
    const d = new Date();
    return d.toISOString().split("T")[0];
  }, []);

  // Price calculations
  const { totalPrice, advancePrice, balancePrice } = React.useMemo(() => {
    let total = 0;
    if (isHourly) {
      const hoursCount = durationHours + durationMinutes / 60;
      const rate = Number(service.hour_base_price || service.base_price || 0);
      total = rate * hoursCount;
    } else {
      total = Number(service.base_price || 0);
    }
    const advance = total * 0.2;
    const balance = total - advance;
    return {
      totalPrice: total,
      advancePrice: advance,
      balancePrice: balance,
    };
  }, [isHourly, durationHours, durationMinutes, service.base_price, service.hour_base_price]);

  // TanStack Form configuration
  const form = useForm({
    defaultValues: {
      booking_date: todayStr,
      booking_time: "10:00",
      note: "",
    },
    onSubmit: async ({ value }) => {
      setIsLoading(true);
      setApiError(null);

      // Build ISO 8601 duration string if hourly (e.g. "PT2H30M" or "PT1H0M")
      let isoDuration: string | undefined = undefined;
      if (isHourly) {
        isoDuration = `PT${durationHours}H${durationMinutes}M`;
      }

      try {
        await bookingsService.book({
          service: String(service.id),
          booking_date: value.booking_date,
          booking_time: value.booking_time,
          final_payment_method: paymentMethod,
          duration: isoDuration,
          note: value.note.trim() || undefined,
        });

        // Invalidate customer bookings cache
        queryClient.invalidateQueries({ queryKey: ["my-bookings"] });
        queryClient.invalidateQueries({ queryKey: ["dashboard", "customer"] });

        toast.success(
          "Booking request sent! Waiting for provider acceptance before 20% advance.",
          { duration: 6000 }
        );

        router.push("/dashboard/customer");
      } catch (err: any) {
        // Extract 2-hour gap or validation errors
        let msg = "Could not create booking. Please check your inputs.";
        if (err?.errors?.booking_time) {
          msg = Array.isArray(err.errors.booking_time)
            ? err.errors.booking_time[0]
            : String(err.errors.booking_time);
        } else if (err?.errors?.error) {
          msg = Array.isArray(err.errors.error) ? err.errors.error[0] : String(err.errors.error);
        } else if (err?.message) {
          msg = err.message;
        }

        if (msg.toLowerCase().includes("gap") || msg.toLowerCase().includes("2 hour") || msg.toLowerCase().includes("already")) {
          msg = "This time slot conflicts with an existing booking within 2 hours. Please select another time.";
        }

        setApiError(msg);
        toast.error(msg);
      } finally {
        setIsLoading(false);
      }
    },
  });

  // CASE 1: Quotation Service Guard
  if (isQuotation) {
    return (
      <div className="rounded-3xl border border-stone-200 bg-white p-7 shadow-tactile sticky top-24 space-y-4">
        <div className="w-12 h-12 rounded-2xl bg-amber-50 border border-amber-200 text-amber-700 flex items-center justify-center">
          <AlertCircle className="h-6 w-6" />
        </div>
        <div className="space-y-1.5">
          <h3 className="text-lg font-extrabold text-stone-900 font-heading">
            Custom Quotation Required
          </h3>
          <p className="text-xs text-stone-500 leading-relaxed">
            This specialized service requires an on-site or custom assessment and cannot be booked directly online with a fixed price.
          </p>
        </div>
        <div className="p-3.5 rounded-xl bg-stone-50 border border-stone-200 text-xs text-stone-600">
          Please contact our operations support or submit a request via message to receive a verified price quote.
        </div>
      </div>
    );
  }

  // CASE 2: Guest Guard
  if (!isAuthenticated) {
    return (
      <div className="rounded-3xl border border-stone-200 bg-white p-7 shadow-tactile sticky top-24 space-y-5 text-center">
        <div className="w-12 h-12 rounded-2xl bg-teal-50 border border-teal-200 text-teal-800 flex items-center justify-center mx-auto">
          <Lock className="h-6 w-6" />
        </div>
        <div className="space-y-1">
          <h3 className="text-lg font-extrabold text-stone-900 font-heading">
            Sign In to Book This Pro
          </h3>
          <p className="text-xs text-stone-500">
            Log in to schedule an appointment, reserve your time slot, and track provider arrival.
          </p>
        </div>

        <div className="p-3.5 rounded-2xl bg-stone-50 border border-stone-200 text-left space-y-1 text-xs">
          <div className="font-bold text-stone-900 flex items-center gap-1.5">
            <ShieldCheck className="h-4 w-4 text-emerald-600" />
            <span>20% Secure Advance Booking</span>
          </div>
          <p className="text-stone-500 text-[11px]">
            Held in escrow until provider begins work. Balance paid upon satisfaction.
          </p>
        </div>

        <Button asChild className="w-full h-11 font-bold shadow-md">
          <Link href="/login">Sign In / Register</Link>
        </Button>
      </div>
    );
  }

  // CASE 3: Role Guard (Provider or Admin)
  if (!isCustomer) {
    return (
      <div className="rounded-3xl border border-stone-200 bg-white p-7 shadow-tactile sticky top-24 space-y-4 text-center">
        <div className="w-12 h-12 rounded-2xl bg-stone-100 border border-stone-200 text-stone-600 flex items-center justify-center mx-auto">
          <AlertCircle className="h-6 w-6" />
        </div>
        <div className="space-y-1">
          <h3 className="text-base font-extrabold text-stone-900 font-heading">
            Customer Account Required
          </h3>
          <p className="text-xs text-stone-500">
            You are logged in as <strong className="uppercase">{role}</strong>. Only customer accounts can book service appointments.
          </p>
        </div>
      </div>
    );
  }

  // CASE 4: Active Customer Booking Form
  return (
    <div className="rounded-3xl border border-stone-200 bg-white p-7 shadow-tactile sticky top-24 space-y-6">
      {/* Header */}
      <div className="border-b border-stone-100 pb-4 flex items-center justify-between">
        <div>
          <span className="text-[10px] uppercase font-bold tracking-wider text-orange-600">
            Instant Scheduling
          </span>
          <h3 className="text-xl font-extrabold text-stone-900 font-heading">
            Book Appointment
          </h3>
        </div>
        <div className="text-right">
          <span className="text-[10px] text-stone-400 block font-medium">Rate</span>
          <span className="text-base font-extrabold text-teal-900 tabular-nums">
            {isHourly ? `৳${service.hour_base_price}/hr` : `৳${service.base_price}`}
          </span>
        </div>
      </div>

      {apiError && (
        <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-start gap-2">
          <AlertCircle className="h-4 w-4 text-rose-600 shrink-0 mt-0.5" />
          <span>{apiError}</span>
        </div>
      )}

      <form
        onSubmit={(e) => {
          e.preventDefault();
          e.stopPropagation();
          form.handleSubmit();
        }}
        className="space-y-4 text-left"
      >
        {/* Date Selection */}
        <form.Field
          name="booking_date"
          validators={{
            onChange: ({ value }) => (!value ? "Date is required" : undefined),
          }}
        >
          {(field) => (
            <div className="space-y-1.5">
              <Label htmlFor={field.name} className="text-xs font-bold text-stone-700">
                Service Date
              </Label>
              <div className="relative">
                <CalendarIcon className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-stone-400" />
                <Input
                  id={field.name}
                  type="date"
                  min={todayStr}
                  value={field.state.value}
                  onChange={(e) => field.handleChange(e.target.value)}
                  className="pl-10 h-10 rounded-xl bg-stone-50 border-stone-200 text-xs font-medium"
                />
              </div>
              {field.state.meta.errors ? (
                <p className="text-[11px] text-rose-600">{field.state.meta.errors.join(", ")}</p>
              ) : null}
            </div>
          )}
        </form.Field>

        {/* Time Selection */}
        <form.Field
          name="booking_time"
          validators={{
            onChange: ({ value }) => (!value ? "Time is required" : undefined),
          }}
        >
          {(field) => (
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <Label htmlFor={field.name} className="text-xs font-bold text-stone-700">
                  Preferred Time (24h)
                </Label>
                <span className="text-[10px] text-stone-400">2-hr buffer enforced</span>
              </div>
              <div className="relative">
                <Clock className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-stone-400" />
                <Input
                  id={field.name}
                  type="time"
                  value={field.state.value}
                  onChange={(e) => field.handleChange(e.target.value)}
                  className="pl-10 h-10 rounded-xl bg-stone-50 border-stone-200 text-xs font-medium"
                />
              </div>
              {field.state.meta.errors ? (
                <p className="text-[11px] text-rose-600">{field.state.meta.errors.join(", ")}</p>
              ) : null}
            </div>
          )}
        </form.Field>

        {/* Conditional Hourly Duration Selector */}
        {isHourly && (
          <div className="space-y-1.5 p-3.5 rounded-2xl bg-teal-50/70 border border-teal-200/80">
            <Label className="text-xs font-bold text-teal-900">
              Estimated Duration
            </Label>
            <div className="grid grid-cols-2 gap-2 mt-1">
              <div>
                <span className="text-[10px] text-teal-700 block font-medium mb-1">Hours</span>
                <select
                  value={durationHours}
                  onChange={(e) => setDurationHours(Number(e.target.value))}
                  className="w-full h-9 rounded-lg bg-white border border-teal-200 text-xs font-bold text-teal-900 px-2 cursor-pointer focus:outline-none focus:ring-1 focus:ring-teal-700"
                >
                  {Array.from({ length: 12 }, (_, i) => i + 1).map((h) => (
                    <option key={h} value={h}>
                      {h} hour{h > 1 ? "s" : ""}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <span className="text-[10px] text-teal-700 block font-medium mb-1">Minutes</span>
                <select
                  value={durationMinutes}
                  onChange={(e) => setDurationMinutes(Number(e.target.value))}
                  className="w-full h-9 rounded-lg bg-white border border-teal-200 text-xs font-bold text-teal-900 px-2 cursor-pointer focus:outline-none focus:ring-1 focus:ring-teal-700"
                >
                  <option value={0}>0 mins</option>
                  <option value={30}>30 mins</option>
                </select>
              </div>
            </div>
            <span className="text-[10px] text-teal-700/80 block mt-1">
              Format: ISO 8601 (PT{durationHours}H{durationMinutes}M)
            </span>
          </div>
        )}

        {/* Final Payment Method Choice (Cash or Online) */}
        <div className="space-y-1.5 pt-1">
          <Label className="text-xs font-bold text-stone-700">Remaining Balance Payment Method</Label>
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => setPaymentMethod("cash")}
              className={`p-2.5 rounded-xl border text-left transition-all cursor-pointer flex items-center gap-2 ${
                paymentMethod === "cash"
                  ? "bg-teal-50 border-teal-700 ring-1 ring-teal-700 text-teal-900"
                  : "bg-stone-50 border-stone-200 text-stone-600 hover:bg-stone-100"
              }`}
            >
              <Banknote className="h-4 w-4" />
              <span className="text-xs font-bold">Cash on Completion</span>
            </button>

            <button
              type="button"
              onClick={() => setPaymentMethod("online")}
              className={`p-2.5 rounded-xl border text-left transition-all cursor-pointer flex items-center gap-2 ${
                paymentMethod === "online"
                  ? "bg-teal-50 border-teal-700 ring-1 ring-teal-700 text-teal-900"
                  : "bg-stone-50 border-stone-200 text-stone-600 hover:bg-stone-100"
              }`}
            >
              <CreditCard className="h-4 w-4" />
              <span className="text-xs font-bold">Online Settle</span>
            </button>
          </div>
        </div>

        {/* Optional Note */}
        <form.Field name="note">
          {(field) => (
            <div className="space-y-1.5 pt-1">
              <Label htmlFor={field.name} className="text-xs font-bold text-stone-700">
                Instructions for Pro <span className="font-normal text-stone-400">(Optional)</span>
              </Label>
              <Textarea
                id={field.name}
                rows={2}
                placeholder="Specific problem, floor number, or parking details..."
                value={field.state.value}
                onChange={(e) => field.handleChange(e.target.value)}
                className="rounded-xl bg-stone-50 border-stone-200 text-xs"
              />
            </div>
          )}
        </form.Field>

        {/* ITEMIZED PRICING RECEIPT BOX */}
        <div className="p-4 rounded-2xl bg-stone-50 border border-stone-200 space-y-2 text-xs">
          <div className="flex items-center justify-between text-stone-500">
            <span>Estimated Service Total</span>
            <span className="font-bold text-stone-800 tabular-nums">৳{totalPrice.toFixed(2)}</span>
          </div>

          <div className="flex items-center justify-between text-orange-700 font-bold bg-orange-50/80 p-2 rounded-lg border border-orange-200/60">
            <span className="flex items-center gap-1">
              <ShieldCheck className="h-3.5 w-3.5" />
              20% Secure Advance (Due on Acceptance)
            </span>
            <span className="tabular-nums">৳{advancePrice.toFixed(2)}</span>
          </div>

          <div className="flex items-center justify-between text-stone-500 pt-1 border-t border-stone-200/60">
            <span>80% Balance (Due upon Completion)</span>
            <span className="font-bold text-stone-800 tabular-nums">৳{balancePrice.toFixed(2)}</span>
          </div>
        </div>

        {/* SUBMIT BUTTON */}
        <Button
          type="submit"
          disabled={isLoading}
          className="w-full h-11 font-bold text-sm shadow-md gap-2 mt-2"
        >
          {isLoading ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              <span>Submitting Booking...</span>
            </>
          ) : (
            <>
              <span>Request Appointment</span>
              <ArrowRight className="h-4 w-4" />
            </>
          )}
        </Button>
      </form>
    </div>
  );
}

export default BookingWidget;
