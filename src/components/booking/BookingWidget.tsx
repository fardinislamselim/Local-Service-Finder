"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useForm } from "@tanstack/react-form";
import { useQuery, useQueryClient } from "@tanstack/react-query";
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
  Info,
  MapPin,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { bookingsService } from "@/features/bookings/services/bookings.service";
import { locationsService } from "@/features/locations/services/locations.service";
import { useAuthStore } from "@/store/useAuthStore";
import type { Service, Division, District, Upazila } from "@/types/api";

interface BookingWidgetProps {
  service: Service;
}

export function BookingWidget({ service }: BookingWidgetProps) {
  const router = useRouter();
  const queryClient = useQueryClient();
  const { user, profile, isAuthenticated, accessToken } = useAuthStore();

  const role = user?.role || profile?.role;
  const isCustomer = role === "CUSTOMER";

  const isQuotation = service.pricing_type === "quotation";
  const isHourly = service.pricing_type === "hourly";
  const isActive = service.is_active !== false;

  // Hourly duration state (defaults to 2 hours)
  const [durationHours, setDurationHours] = React.useState<number>(2);
  const [durationMinutes, setDurationMinutes] = React.useState<number>(0);
  const [paymentMethod, setPaymentMethod] = React.useState<"cash" | "online">("cash");

  // Cascading location states
  const [selectedDivision, setSelectedDivision] = React.useState<number | null>(null);
  const [selectedDistrict, setSelectedDistrict] = React.useState<number | null>(null);
  const [selectedUpazila, setSelectedUpazila] = React.useState<number | null>(null);
  const [areaAddress, setAreaAddress] = React.useState<string>("");
  const [locationError, setLocationError] = React.useState<string | null>(null);

  const [isLoading, setIsLoading] = React.useState(false);
  const [apiError, setApiError] = React.useState<string | null>(null);

  // Minimum date: today (YYYY-MM-DD)
  const todayStr = React.useMemo(() => {
    const d = new Date();
    return d.toISOString().split("T")[0];
  }, []);

  // Fetch cascading locations
  const { data: divisions = [], isLoading: isLoadingDivisions } = useQuery<Division[]>({
    queryKey: ["locations", "divisions"],
    queryFn: () => locationsService.getDivisions(),
  });

  const { data: allDistricts = [], isLoading: isLoadingDistricts } = useQuery<District[]>({
    queryKey: ["locations", "districts"],
    queryFn: () => locationsService.getDistricts(),
  });

  const { data: allUpazilas = [], isLoading: isLoadingUpazilas } = useQuery<Upazila[]>({
    queryKey: ["locations", "upazilas"],
    queryFn: () => locationsService.getUpazilas(),
  });

  // Filter districts by selectedDivision
  const availableDistricts = React.useMemo(() => {
    if (!selectedDivision) return [];
    return allDistricts.filter((dist) => {
      const divId = typeof dist.division === "object" ? dist.division?.id : dist.division;
      return Number(divId) === Number(selectedDivision);
    });
  }, [allDistricts, selectedDivision]);

  // Filter upazilas by selectedDistrict
  const availableUpazilas = React.useMemo(() => {
    if (!selectedDistrict) return [];
    return allUpazilas.filter((up) => {
      const distId = typeof up.district === "object" ? up.district?.id : up.district;
      return Number(distId) === Number(selectedDistrict);
    });
  }, [allUpazilas, selectedDistrict]);

  // Location change handlers (resetting downstream selections)
  const handleDivisionChange = (val: string) => {
    const num = val ? Number(val) : null;
    setSelectedDivision(num);
    setSelectedDistrict(null);
    setSelectedUpazila(null);
    if (locationError) setLocationError(null);
  };

  const handleDistrictChange = (val: string) => {
    const num = val ? Number(val) : null;
    setSelectedDistrict(num);
    setSelectedUpazila(null);
    if (locationError) setLocationError(null);
  };

  const handleUpazilaChange = (val: string) => {
    const num = val ? Number(val) : null;
    setSelectedUpazila(num);
    if (locationError) setLocationError(null);
  };

  // Price calculations
  const { totalPrice, advancePrice, balancePrice } = React.useMemo(() => {
    let total = 0;
    if (isHourly) {
      const hoursCount = durationHours + durationMinutes / 60;
      const rate = Number(service.hour_base_price ?? service.base_price ?? 0);
      total = rate * hoursCount;
    } else {
      total = Number(service.base_price ?? service.hour_base_price ?? 0);
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
      // 1. Guard against inactive services
      if (!isActive) {
        toast.error("This service is currently unavailable for booking.");
        return;
      }

      // 2. Guard against quotation pricing
      if (isQuotation) {
        toast.error("This service requires a custom quote and cannot be booked directly online.");
        return;
      }

      // 3. Unauthenticated Guard
      if (!isAuthenticated || !accessToken) {
        toast.info("Please sign in as a Customer to complete your booking.", {
          duration: 4000,
        });
        router.push(`/login?redirect=${encodeURIComponent(`/services/${service.id}`)}`);
        return;
      }

      // 4. Role Guard (Non-customers like SERVICE_PROVIDER or ADMIN)
      if (!isCustomer) {
        toast.error("Switch to a Customer account to book services.", {
          duration: 5000,
        });
        return;
      }

      // 5. Cascading location validations
      if (!selectedDivision) {
        setLocationError("Please select a Division.");
        toast.error("Please select a Division.");
        return;
      }
      if (!selectedDistrict) {
        setLocationError("Please select a District.");
        toast.error("Please select a District.");
        return;
      }
      if (!selectedUpazila) {
        setLocationError("Please select an Upazila.");
        toast.error("Please select an Upazila.");
        return;
      }
      if (!areaAddress.trim()) {
        setLocationError("Please enter your detailed street address / area.");
        toast.error("Please enter your street address / area.");
        return;
      }

      setIsLoading(true);
      setApiError(null);
      setLocationError(null);

      // Duration: format "HH:MM:00" ONLY if hourly (omit if fixed)
      let formattedDuration: string | undefined = undefined;
      if (isHourly) {
        const hh = String(durationHours).padStart(2, "0");
        const mm = String(durationMinutes).padStart(2, "0");
        formattedDuration = `${hh}:${mm}:00`;
      }

      // Booking time: format "HH:MM:00"
      const rawTime = value.booking_time.trim();
      const formattedTime = rawTime.length === 5 ? `${rawTime}:00` : rawTime;

      try {
        await bookingsService.book({
          service: String(service.id),
          booking_date: value.booking_date,
          booking_time: formattedTime,
          final_payment_method: paymentMethod,
          division: selectedDivision,
          district: selectedDistrict,
          upazila: selectedUpazila,
          area: areaAddress.trim(),
          duration: formattedDuration,
          note: value.note.trim() || undefined,
        });

        // Invalidate customer bookings cache
        queryClient.invalidateQueries({ queryKey: ["my-bookings"] });
        queryClient.invalidateQueries({ queryKey: ["dashboard", "customer"] });

        toast.success(
          "Service booking successful! Waiting for provider acceptance.",
          { duration: 6000 }
        );

        router.push("/dashboard/customer");
      } catch (err: any) {
        // Extract 2-hour buffer or slot conflict error
        let msg = "Could not create booking. Please check your inputs.";
        if (err?.errors?.booking_time) {
          msg = Array.isArray(err.errors.booking_time)
            ? err.errors.booking_time[0]
            : String(err.errors.booking_time);
        } else if (err?.errors?.error) {
          msg = Array.isArray(err.errors.error) ? err.errors.error[0] : String(err.errors.error);
        } else if (err?.errors?.detail) {
          msg = String(err.errors.detail);
        } else if (err?.message) {
          msg = err.message;
        }

        if (
          msg.toLowerCase().includes("gap") ||
          msg.toLowerCase().includes("2 hour") ||
          msg.toLowerCase().includes("already") ||
          msg.toLowerCase().includes("conflict")
        ) {
          msg = "This time slot conflicts with an existing booking within 2 hours. Please select another time slot.";
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
      <div className="rounded-2xl border border-stone-200 bg-white p-5 shadow-tactile lg:sticky lg:top-24 sm:p-6 space-y-4">
        <div className="w-12 h-12 rounded-2xl bg-amber-50 border border-amber-200 text-amber-700 flex items-center justify-center">
          <AlertCircle className="h-6 w-6" />
        </div>
        <div className="space-y-1.5">
          <h3 className="text-lg font-semibold text-stone-900 font-heading">
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

  // CASE 2: Inactive Service Guard
  if (!isActive) {
    return (
      <div className="rounded-2xl border border-stone-200 bg-white p-5 shadow-tactile lg:sticky lg:top-24 sm:p-6 space-y-4">
        <div className="w-12 h-12 rounded-2xl bg-rose-50 border border-rose-200 text-rose-700 flex items-center justify-center">
          <AlertCircle className="h-6 w-6" />
        </div>
        <div className="space-y-1.5">
          <h3 className="text-lg font-semibold text-stone-900 font-heading">
            Currently Unavailable
          </h3>
          <p className="text-xs text-stone-500 leading-relaxed">
            This service is temporarily deactivated or unavailable for direct booking.
          </p>
        </div>
        <Button variant="outline" asChild className="w-full rounded-xl text-xs font-semibold">
          <Link href="/services">Explore Other Services</Link>
        </Button>
      </div>
    );
  }

  // Active Interactive Booking Form
  return (
    <div className="rounded-2xl border border-stone-200 bg-white p-5 shadow-tactile lg:sticky lg:top-24 sm:p-6 space-y-6">
      {/* Header */}
      <div className="border-b border-stone-100 pb-4 flex items-center justify-between">
        <div>
          <span className="text-[10px] font-semibold text-[#EA580C]">
            Instant Scheduling
          </span>
          <h3 className="text-xl font-semibold text-stone-900 font-heading">
            Book Appointment
          </h3>
        </div>
        <div className="text-right">
          <span className="text-[10px] text-stone-400 block font-medium">Rate</span>
          <span className="text-base font-semibold text-[#115E59] tabular-nums">
            {isHourly
              ? `৳${service.hour_base_price ?? service.base_price}/hr`
              : `৳${service.base_price ?? service.hour_base_price}`}
          </span>
        </div>
      </div>

      {apiError && (
        <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-start gap-2">
          <AlertCircle className="h-4 w-4 text-rose-600 shrink-0 mt-0.5" />
          <span>{apiError}</span>
        </div>
      )}

      {/* Role Notice for non-customers */}
      {isAuthenticated && !isCustomer && (
        <div className="p-3 rounded-xl bg-amber-50 border border-amber-200 text-amber-800 text-xs flex items-start gap-2">
          <Info className="h-4 w-4 text-amber-600 shrink-0 mt-0.5" />
          <div>
            <span className="font-semibold">Logged in as {role}.</span> Switch to a Customer account to book services.
          </div>
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
              <Label htmlFor={field.name} className="text-xs font-semibold text-stone-700">
                Service Date *
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
                <Label htmlFor={field.name} className="text-xs font-semibold text-stone-700">
                  Preferred Time (24h) *
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

        {/* Conditional Hourly Duration Selector (Only shown if service is hourly) */}
        {isHourly && (
          <div className="space-y-1.5 p-3.5 rounded-2xl bg-teal-50/70 border border-teal-200/80">
            <Label className="text-xs font-semibold text-[#115E59]">
              Estimated Duration *
            </Label>
            <div className="grid grid-cols-2 gap-2 mt-1">
              <div>
                <span className="text-[10px] text-teal-700 block font-medium mb-1">Hours</span>
                <select
                  value={durationHours}
                  onChange={(e) => setDurationHours(Number(e.target.value))}
                  className="w-full h-9 rounded-lg bg-white border border-teal-200 text-xs font-semibold text-teal-900 px-2 cursor-pointer focus:outline-none focus:ring-1 focus:ring-teal-700"
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
                  className="w-full h-9 rounded-lg bg-white border border-teal-200 text-xs font-semibold text-teal-900 px-2 cursor-pointer focus:outline-none focus:ring-1 focus:ring-teal-700"
                >
                  <option value={0}>00 mins</option>
                  <option value={30}>30 mins</option>
                </select>
              </div>
            </div>
            <span className="text-[10px] text-teal-700/80 block mt-1">
              Duration formatted as {String(durationHours).padStart(2, "0")}:{String(durationMinutes).padStart(2, "0")}:00
            </span>
          </div>
        )}

        {/* Cascading Location Section (Division -> District -> Upazila -> Street Address) */}
        <div className="space-y-3 pt-2 border-t border-stone-100">
          <div className="flex items-center gap-1.5 text-xs font-semibold text-stone-800">
            <MapPin className="h-4 w-4 text-[#115E59]" />
            <span>Service Location</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
            {/* Division Dropdown */}
            <div className="space-y-1">
              <Label className="text-[11px] font-medium text-stone-600">Division *</Label>
              <select
                value={selectedDivision || ""}
                onChange={(e) => handleDivisionChange(e.target.value)}
                disabled={isLoadingDivisions}
                className="w-full h-9 rounded-xl bg-stone-50 border border-stone-200 text-xs font-medium text-stone-800 px-2 cursor-pointer focus:outline-none focus:ring-1 focus:ring-teal-700 disabled:opacity-50"
              >
                <option value="">Select Division</option>
                {divisions.map((div) => (
                  <option key={div.id} value={div.id}>
                    {div.name}
                  </option>
                ))}
              </select>
            </div>

            {/* District Dropdown (Disabled until Division is chosen) */}
            <div className="space-y-1">
              <Label className="text-[11px] font-medium text-stone-600">District *</Label>
              <select
                value={selectedDistrict || ""}
                onChange={(e) => handleDistrictChange(e.target.value)}
                disabled={!selectedDivision || isLoadingDistricts}
                className="w-full h-9 rounded-xl bg-stone-50 border border-stone-200 text-xs font-medium text-stone-800 px-2 cursor-pointer focus:outline-none focus:ring-1 focus:ring-teal-700 disabled:opacity-50 disabled:bg-stone-100 disabled:cursor-not-allowed"
              >
                <option value="">
                  {!selectedDivision ? "Select Division first" : "Select District"}
                </option>
                {availableDistricts.map((dist) => (
                  <option key={dist.id} value={dist.id}>
                    {dist.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Upazila Dropdown (Disabled until District is chosen) */}
            <div className="space-y-1">
              <Label className="text-[11px] font-medium text-stone-600">Upazila *</Label>
              <select
                value={selectedUpazila || ""}
                onChange={(e) => handleUpazilaChange(e.target.value)}
                disabled={!selectedDistrict || isLoadingUpazilas}
                className="w-full h-9 rounded-xl bg-stone-50 border border-stone-200 text-xs font-medium text-stone-800 px-2 cursor-pointer focus:outline-none focus:ring-1 focus:ring-teal-700 disabled:opacity-50 disabled:bg-stone-100 disabled:cursor-not-allowed"
              >
                <option value="">
                  {!selectedDistrict ? "Select District first" : "Select Upazila"}
                </option>
                {availableUpazilas.map((up) => (
                  <option key={up.id} value={up.id}>
                    {up.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Area / Street Address */}
          <div className="space-y-1">
            <Label htmlFor="booking-area" className="text-[11px] font-medium text-stone-600">
              Street / House Address *
            </Label>
            <Input
              id="booking-area"
              placeholder="House #, Road #, Sector / Block, Flat / Landmark..."
              value={areaAddress}
              onChange={(e) => {
                setAreaAddress(e.target.value);
                if (locationError) setLocationError(null);
              }}
              className="h-9 rounded-xl bg-stone-50 border-stone-200 text-xs"
            />
          </div>

          {locationError && (
            <p className="text-[11px] text-rose-600 font-medium">{locationError}</p>
          )}
        </div>

        {/* Final Payment Method Choice (Cash or Online) */}
        <div className="space-y-1.5 pt-1">
          <Label className="text-xs font-semibold text-stone-700">Remaining Balance Payment Method</Label>
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => setPaymentMethod("cash")}
              className={`p-2.5 rounded-xl border text-left transition-all cursor-pointer flex items-center gap-2 ${
                paymentMethod === "cash"
                  ? "bg-teal-50 border-[#115E59] ring-1 ring-[#115E59] text-[#115E59]"
                  : "bg-stone-50 border-stone-200 text-stone-600 hover:bg-stone-100"
              }`}
            >
              <Banknote className="h-4 w-4" />
              <span className="text-xs font-semibold">Cash on Finish</span>
            </button>

            <button
              type="button"
              onClick={() => setPaymentMethod("online")}
              className={`p-2.5 rounded-xl border text-left transition-all cursor-pointer flex items-center gap-2 ${
                paymentMethod === "online"
                  ? "bg-teal-50 border-[#115E59] ring-1 ring-[#115E59] text-[#115E59]"
                  : "bg-stone-50 border-stone-200 text-stone-600 hover:bg-stone-100"
              }`}
            >
              <CreditCard className="h-4 w-4" />
              <span className="text-xs font-semibold">Online Settle</span>
            </button>
          </div>
        </div>

        {/* Optional Note */}
        <form.Field name="note">
          {(field) => (
            <div className="space-y-1.5 pt-1">
              <Label htmlFor={field.name} className="text-xs font-semibold text-stone-700">
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
          <div className="flex items-center justify-between gap-3 text-stone-500">
            <span>Estimated Service Total</span>
            <span className="shrink-0 font-semibold text-stone-800 tabular-nums">৳{totalPrice.toFixed(2)}</span>
          </div>

          <div className="flex items-center justify-between gap-3 font-semibold text-[#EA580C] bg-orange-50/80 p-2.5 rounded-xl border border-orange-200/60">
            <span className="flex min-w-0 items-center gap-1.5 text-left">
              <ShieldCheck className="h-4 w-4 shrink-0" />
              20% Secure Advance (Due on Acceptance)
            </span>
            <span className="shrink-0 tabular-nums">৳{advancePrice.toFixed(2)}</span>
          </div>

          <div className="flex items-center justify-between gap-3 text-stone-500 pt-1 border-t border-stone-200/60">
            <span>80% Balance (Due upon Completion)</span>
            <span className="shrink-0 font-semibold text-stone-800 tabular-nums">৳{balancePrice.toFixed(2)}</span>
          </div>
        </div>

        {/* SUBMIT BUTTON */}
        <Button
          type="submit"
          disabled={isLoading || (isAuthenticated && !isCustomer)}
          className="mt-2 h-11 w-full gap-2 bg-[#EA580C] text-sm font-semibold text-white shadow-sm hover:bg-[#C2410C]"
        >
          {isLoading ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              <span>Submitting Booking...</span>
            </>
          ) : !isAuthenticated ? (
            <>
              <span>Sign In & Book Service</span>
              <ArrowRight className="h-4 w-4" />
            </>
          ) : !isCustomer ? (
            <>
              <Lock className="h-4 w-4" />
              <span>Customer Account Required</span>
            </>
          ) : (
            <>
              <span>Book Service</span>
              <ArrowRight className="h-4 w-4" />
            </>
          )}
        </Button>

        {!isAuthenticated && (
          <p className="text-[11px] text-stone-500 text-center leading-relaxed">
            You will be prompted to sign in or create an account to finalize your booking slot.
          </p>
        )}
      </form>
    </div>
  );
}

export default BookingWidget;
