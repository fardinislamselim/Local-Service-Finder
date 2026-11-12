"use client";

import * as React from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useForm } from "@tanstack/react-form";
import { zodValidator } from "@tanstack/zod-form-adapter";
import { z } from "zod";
import {
  Calendar,
  Clock,
  CreditCard,
  Banknote,
  ShieldCheck,
  Star,
  CheckCircle2,
  Loader2,
  ArrowLeft,
  Wrench,
  AlertCircle,
  MessageSquare,
} from "lucide-react";
import { toast } from "sonner";
import { Header } from "@/components/layout/header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { FormInput, FormTextarea, FieldWrapper, getFieldError } from "@/components/shared/form-field";
import { servicesService } from "@/features/services/services/services.service";
import { bookingsService } from "@/features/bookings/services/bookings.service";
import { reviewsService } from "@/features/reviews/services/reviews.service";
import { useAuth } from "@/features/auth/hooks/use-auth";
import { formatCurrency, formatDate } from "@/lib/utils";
import type { Service, Review, FinalPaymentMethod } from "@/types/api";

const bookingSchema = z.object({
  booking_date: z.string().min(1, "Booking date is required"),
  booking_time: z.string().min(1, "Booking time is required"),
  final_payment_method: z.enum(["ONLINE", "CASH"], {
    required_error: "Please select your final payment method",
  }),
  note: z.string().max(500, "Note is too long").optional(),
});

export default function ServiceDetailPage() {
  const params = useParams();
  const router = useRouter();
  const serviceId = params?.id as string;
  const { user, isAuthenticated } = useAuth();
  const queryClient = useQueryClient();

  // Fetch all services to find this service
  const { data: servicesData, isLoading: serviceLoading } = useQuery({
    queryKey: ["services", "all"],
    queryFn: () => servicesService.getAll(),
  });

  const allServices: Service[] = Array.isArray(servicesData)
    ? servicesData
    : servicesData?.results || [];

  const service = allServices.find((s) => String(s.id) === String(serviceId));

  // Fetch average rating
  const { data: ratingData } = useQuery({
    queryKey: ["reviews", "average", serviceId],
    queryFn: () => reviewsService.getAverageRating(serviceId),
    enabled: !!serviceId,
  });

  // Fetch reviews for this service
  const { data: reviewsData } = useQuery({
    queryKey: ["reviews", "service", serviceId],
    queryFn: () => reviewsService.getReviewsForService(serviceId),
    enabled: !!serviceId,
  });

  const reviews: Review[] = Array.isArray(reviewsData)
    ? reviewsData
    : reviewsData?.results || [];

  // Booking mutation
  const bookMutation = useMutation({
    mutationFn: (values: {
      booking_date: string;
      booking_time: string;
      final_payment_method: FinalPaymentMethod;
      note?: string;
    }) =>
      bookingsService.book({
        service: serviceId,
        booking_date: values.booking_date,
        booking_time: values.booking_time,
        final_payment_method: values.final_payment_method,
        note: values.note,
      }),
    onSuccess: (booking) => {
      toast.success("Service booked successfully! The provider has been notified.", {
        duration: 5000,
      });
      queryClient.invalidateQueries({ queryKey: ["bookings"] });
      router.push("/dashboard/customer/bookings");
    },
    onError: (err: any) => {
      toast.error(err?.message || "Failed to book service. Please check fields.");
    },
  });

  const form = useForm({
    defaultValues: {
      booking_date: new Date(Date.now() + 864e5).toISOString().split("T")[0],
      booking_time: "10:00",
      final_payment_method: "ONLINE" as FinalPaymentMethod,
      note: "",
    },
    onSubmit: async ({ value }) => {
      if (!isAuthenticated) {
        toast.info("Please sign in or create an account to book this service.");
        router.push(`/login?redirect=${encodeURIComponent(`/services/${serviceId}`)}`);
        return;
      }
      await bookMutation.mutateAsync(value);
    },
  });

  if (serviceLoading) {
    return (
      <div className="min-h-screen flex flex-col bg-background">
        <Header />
        <div className="container max-w-5xl mx-auto py-10 px-4 space-y-6">
          <Skeleton className="h-8 w-48" />
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <Skeleton className="h-96 md:col-span-2 rounded-xl" />
            <Skeleton className="h-96 rounded-xl" />
          </div>
        </div>
      </div>
    );
  }

  if (!service) {
    return (
      <div className="min-h-screen flex flex-col bg-background">
        <Header />
        <div className="container max-w-lg mx-auto py-20 px-4 text-center">
          <AlertCircle className="h-12 w-12 text-destructive mx-auto mb-3" />
          <h2 className="text-xl font-bold">Service Not Found</h2>
          <p className="text-muted-foreground text-sm mt-1 mb-6">
            The requested service could not be located. It may have been removed or updated.
          </p>
          <Button asChild>
            <Link href="/services">Browse Available Services</Link>
          </Button>
        </div>
      </div>
    );
  }

  const basePrice = service.pricing_type === "HOURLY" ? service.hour_base_price : service.base_price;
  const advanceAmount = (Number(basePrice) || 0) * 0.2;

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />

      <main className="flex-1 py-8 px-4 sm:px-8 max-w-6xl mx-auto w-full space-y-8">
        {/* Back button */}
        <Link
          href="/services"
          className="inline-flex items-center text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to all services
        </Link>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
          {/* Service Details & Reviews (Left 2 cols) */}
          <div className="lg:col-span-2 space-y-8">
            <Card className="border-border/80 shadow-sm overflow-hidden">
              <CardHeader className="space-y-4">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <Badge variant="outline" className="text-xs uppercase font-semibold">
                    {service.pricing_type === "HOURLY" ? "Hourly Service" : "Fixed Price Service"}
                  </Badge>
                  {service.is_active && (
                    <Badge variant="success" className="text-xs">
                      Available for Booking
                    </Badge>
                  )}
                </div>

                <div>
                  <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
                    {service.name}
                  </h1>
                  {service.category_name && (
                    <p className="text-sm font-medium text-primary mt-1">
                      Category: {service.category_name}
                    </p>
                  )}
                </div>

                {/* Rating badge */}
                {ratingData?.average_rating !== undefined && (
                  <div className="flex items-center gap-2 pt-1">
                    <div className="flex items-center text-amber-500">
                      <Star className="h-4 w-4 fill-amber-500" />
                      <span className="font-bold text-sm ml-1 text-foreground">
                        {ratingData.average_rating.toFixed(1)}
                      </span>
                    </div>
                    <span className="text-xs text-muted-foreground">
                      ({reviews.length} customer {reviews.length === 1 ? "review" : "reviews"})
                    </span>
                  </div>
                )}
              </CardHeader>

              <CardContent className="space-y-6">
                <div>
                  <h3 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground mb-2">
                    Service Description
                  </h3>
                  <p className="text-base text-foreground/90 whitespace-pre-line leading-relaxed">
                    {service.description}
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-4 pt-4 border-t border-border/60">
                  <div className="p-4 rounded-lg bg-muted/40 border border-border/50">
                    <p className="text-xs font-semibold text-muted-foreground uppercase">
                      Total Service Price
                    </p>
                    <p className="text-2xl font-extrabold text-foreground mt-1">
                      {formatCurrency(basePrice)}
                      {service.pricing_type === "HOURLY" && (
                        <span className="text-xs font-normal text-muted-foreground"> / hour</span>
                      )}
                    </p>
                  </div>

                  <div className="p-4 rounded-lg bg-primary/10 border border-primary/20">
                    <p className="text-xs font-semibold text-primary uppercase">
                      20% Advance Upon Acceptance
                    </p>
                    <p className="text-2xl font-extrabold text-primary mt-1">
                      {formatCurrency(advanceAmount)}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Customer Reviews Section */}
            <Card className="border-border/80 shadow-sm">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-xl font-bold flex items-center gap-2">
                      <MessageSquare className="h-5 w-5 text-primary" />
                      Customer Reviews & Ratings
                    </CardTitle>
                    <CardDescription>
                      Authentic ratings from customers who completed this service
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>

              <CardContent className="space-y-4">
                {reviews.length === 0 ? (
                  <p className="text-sm text-muted-foreground py-4 text-center">
                    No reviews submitted yet for this service.
                  </p>
                ) : (
                  reviews.map((rev) => (
                    <div
                      key={rev.id}
                      className="p-4 rounded-lg border border-border/60 bg-muted/20 space-y-2"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-1.5 text-amber-500">
                          {Array.from({ length: 5 }).map((_, i) => (
                            <Star
                              key={i}
                              className={`h-3.5 w-3.5 ${
                                i < rev.rating ? "fill-amber-500 text-amber-500" : "text-muted-foreground/30"
                              }`}
                            />
                          ))}
                          <span className="text-xs font-semibold ml-1 text-foreground">
                            {rev.rating} / 5
                          </span>
                        </div>
                        <span className="text-xs text-muted-foreground">
                          {formatDate(rev.created_at)}
                        </span>
                      </div>
                      <p className="text-sm text-foreground/90">{rev.review}</p>
                    </div>
                  ))
                )}
              </CardContent>
            </Card>
          </div>

          {/* Booking Card Form (Right col) */}
          <div className="sticky top-24">
            <Card className="border-border shadow-lg bg-card">
              <CardHeader className="space-y-1">
                <CardTitle className="text-xl font-bold">Book This Service</CardTitle>
                <CardDescription>
                  Choose your appointment date, time, and payment preference
                </CardDescription>
              </CardHeader>

              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  form.handleSubmit();
                }}
              >
                <CardContent className="space-y-4">
                  {/* Booking Date */}
                  <form.Field
                    name="booking_date"
                    validators={{
                      onChange: ({ value }) => {
                        const res = bookingSchema.shape.booking_date.safeParse(value);
                        return res.success ? undefined : res.error.errors[0]?.message;
                      },
                    }}
                  >
                    {(field) => (
                      <FormInput
                        label="Appointment Date"
                        type="date"
                        required
                        value={field.state.value}
                        onBlur={field.handleBlur}
                        onChange={(e) => field.handleChange(e.target.value)}
                        error={getFieldError(field.state.meta.errors)}
                        min={new Date().toISOString().split("T")[0]}
                      />
                    )}
                  </form.Field>

                  {/* Booking Time */}
                  <form.Field
                    name="booking_time"
                    validators={{
                      onChange: ({ value }) => {
                        const res = bookingSchema.shape.booking_time.safeParse(value);
                        return res.success ? undefined : res.error.errors[0]?.message;
                      },
                    }}
                  >
                    {(field) => (
                      <FormInput
                        label="Preferred Time"
                        type="time"
                        required
                        value={field.state.value}
                        onBlur={field.handleBlur}
                        onChange={(e) => field.handleChange(e.target.value)}
                        error={getFieldError(field.state.meta.errors)}
                      />
                    )}
                  </form.Field>

                  {/* Final Payment Method */}
                  <form.Field name="final_payment_method">
                    {(field) => (
                      <FieldWrapper
                        label="Final Balance Payment Method"
                        required
                        description="20% advance is paid online upon provider acceptance. Remaining 80% is settled via your choice below."
                      >
                        <div className="grid grid-cols-2 gap-2 pt-1">
                          <button
                            type="button"
                            onClick={() => field.handleChange("ONLINE")}
                            className={`flex flex-col items-center justify-center gap-1 p-3 rounded-lg border text-xs font-semibold transition-all ${
                              field.state.value === "ONLINE"
                                ? "border-primary bg-primary/10 text-primary ring-1 ring-primary"
                                : "border-input hover:bg-accent text-muted-foreground"
                            }`}
                          >
                            <CreditCard className="h-4 w-4" />
                            <span>Online (Gateway)</span>
                          </button>

                          <button
                            type="button"
                            onClick={() => field.handleChange("CASH")}
                            className={`flex flex-col items-center justify-center gap-1 p-3 rounded-lg border text-xs font-semibold transition-all ${
                              field.state.value === "CASH"
                                ? "border-primary bg-primary/10 text-primary ring-1 ring-primary"
                                : "border-input hover:bg-accent text-muted-foreground"
                            }`}
                          >
                            <Banknote className="h-4 w-4" />
                            <span>Cash on Delivery</span>
                          </button>
                        </div>
                      </FieldWrapper>
                    )}
                  </form.Field>

                  {/* Note */}
                  <form.Field name="note">
                    {(field) => (
                      <FormTextarea
                        label="Special Instructions / Address Details"
                        placeholder="e.g. Please bring extra ladder and notify when at the gate."
                        value={field.state.value}
                        onBlur={field.handleBlur}
                        onChange={(e) => field.handleChange(e.target.value)}
                        rows={3}
                      />
                    )}
                  </form.Field>

                  {/* Advance calculation notice */}
                  <div className="p-3 rounded-lg bg-muted/60 border border-border text-xs space-y-1">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Estimated Total:</span>
                      <span className="font-bold">{formatCurrency(basePrice)}</span>
                    </div>
                    <div className="flex justify-between text-primary font-semibold">
                      <span>20% Advance Deposit:</span>
                      <span>{formatCurrency(advanceAmount)}</span>
                    </div>
                  </div>
                </CardContent>

                <CardFooter>
                  <Button
                    type="submit"
                    className="w-full font-semibold gap-2 shadow"
                    disabled={bookMutation.isPending}
                  >
                    {bookMutation.isPending ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin" />
                        Submitting booking...
                      </>
                    ) : (
                      "Confirm & Book Service"
                    )}
                  </Button>
                </CardFooter>
              </form>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
}
