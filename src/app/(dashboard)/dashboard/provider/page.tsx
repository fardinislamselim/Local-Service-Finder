"use client";

import * as React from "react";
import Link from "next/link";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  Wrench,
  Clock,
  CheckCircle2,
  Check,
  X,
  PlusCircle,
  Layers,
  ArrowRight,
  DollarSign,
  Calendar,
  CreditCard,
  Banknote,
  TrendingUp,
  AlertCircle,
  Eye,
} from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { ServiceImage } from "@/components/shared/service-image";
import { dashboardService } from "@/features/dashboard/services/dashboard.service";
import { servicesService } from "@/features/services/services/services.service";
import { bookingsService } from "@/features/bookings/services/bookings.service";
import { useAuth } from "@/features/auth/hooks/use-auth";
import { formatCurrency } from "@/lib/utils";
import type { Booking, Service } from "@/types/api";

export default function ProviderDashboardPage() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  // Queries
  const { data: pendingData, isLoading: pendingLoading } = useQuery({
    queryKey: ["dashboard", "provider", "pending_bookings"],
    queryFn: () => dashboardService.getProviderPendingBookings(),
  });

  const { data: acceptedData, isLoading: acceptedLoading } = useQuery({
    queryKey: ["dashboard", "provider", "accepted_bookings"],
    queryFn: () => dashboardService.getProviderAcceptedBookings(),
  });

  const { data: totalAcceptedCount } = useQuery({
    queryKey: ["dashboard", "provider", "total_accepted"],
    queryFn: () => dashboardService.getTotalAcceptedBookingCount(),
  });

  const { data: totalCompletedCount } = useQuery({
    queryKey: ["dashboard", "provider", "total_completed"],
    queryFn: () => dashboardService.getTotalCompletedBookingCount(),
  });

  const { data: servicesData, isLoading: servicesLoading } = useQuery({
    queryKey: ["services", "provider_services"],
    queryFn: () => servicesService.getProviderServices(),
  });

  const { data: allBookingsData, isLoading: allBookingsLoading } = useQuery({
    queryKey: ["bookings", "provider_all"],
    queryFn: () => bookingsService.getProviderBookings(),
  });

  const pendingBookings: Booking[] = pendingData || [];
  const acceptedBookings: Booking[] = acceptedData || [];
  const services: Service[] = servicesData || [];
  const allBookings: Booking[] = allBookingsData || [];

  // Mutations
  const acceptMutation = useMutation({
    mutationFn: (bookingId: number | string) => dashboardService.acceptBooking(bookingId),
    onSuccess: () => {
      toast.success("Booking accepted! Customer has been notified to pay 20% advance.");
      queryClient.invalidateQueries({ queryKey: ["dashboard", "provider"] });
      queryClient.invalidateQueries({ queryKey: ["bookings"] });
    },
    onError: (err: any) => {
      toast.error(err?.message || "Failed to accept booking.");
    },
  });

  const rejectMutation = useMutation({
    mutationFn: (bookingId: number | string) => dashboardService.rejectBooking(bookingId),
    onSuccess: () => {
      toast.info("Booking request rejected.");
      queryClient.invalidateQueries({ queryKey: ["dashboard", "provider"] });
      queryClient.invalidateQueries({ queryKey: ["bookings"] });
    },
    onError: (err: any) => {
      toast.error(err?.message || "Failed to reject booking.");
    },
  });

  const completeMutation = useMutation({
    mutationFn: (bookingId: number | string) => dashboardService.completeBooking(bookingId),
    onSuccess: () => {
      toast.success("Service marked as completed! Customer can now settle the final payment.");
      queryClient.invalidateQueries({ queryKey: ["dashboard", "provider"] });
      queryClient.invalidateQueries({ queryKey: ["bookings"] });
    },
    onError: (err: any) => {
      toast.error(err?.message || "Failed to complete booking.");
    },
  });

  // Calculate actual statistics from real backend data
  const acceptedCountVal =
    typeof totalAcceptedCount === "number"
      ? totalAcceptedCount
      : (totalAcceptedCount as any)?.total_accepted ?? acceptedBookings.length;

  const completedCountVal =
    typeof totalCompletedCount === "number"
      ? totalCompletedCount
      : (totalCompletedCount as any)?.total_completed ?? 0;

  const activeServicesCount = services.filter((s) => s.is_active).length;

  // Real revenue calculated from paid_amount on bookings
  const totalEarnings = React.useMemo(() => {
    return allBookings.reduce((sum, b) => sum + Number(b.paid_amount || 0), 0);
  }, [allBookings]);

  // Real pending payments from remaining_amount on accepted/completed jobs
  const pendingPayments = React.useMemo(() => {
    return allBookings.reduce((sum, b) => {
      const st = String(b.status || "").toLowerCase();
      if ((st === "accepted" || st === "completed") && !b.is_paid) {
        return sum + Number(b.remaining_amount || 0);
      }
      return sum;
    }, 0);
  }, [allBookings]);

  return (
    <div className="space-y-8">
      {/* Provider Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 rounded-2xl bg-gradient-to-r from-primary/10 via-primary/5 to-transparent border border-primary/20">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
            Provider Workspace: {user?.first_name || "Specialist"}
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Manage your service catalog, respond to incoming customer requests, and track job executions.
          </p>
        </div>

        <div className="flex flex-wrap gap-2">
          <Button variant="outline" asChild>
            <Link href="/dashboard/provider/services">
              <Layers className="mr-2 h-4 w-4" />
              My Services
            </Link>
          </Button>
          <Button asChild className="gap-2 shadow font-semibold">
            <Link href="/dashboard/provider/services/new">
              <PlusCircle className="h-4 w-4" />
              Add Service
            </Link>
          </Button>
        </div>
      </div>

      {/* Top 6 Statistics Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {/* Card 1: New Requests */}
        <Card className="border-border/80 shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              New Booking Inquiries
            </CardTitle>
            <Clock className="h-4 w-4 text-amber-500" />
          </CardHeader>
          <CardContent>
            {pendingLoading ? (
              <Skeleton className="h-8 w-16" />
            ) : (
              <div className="text-3xl font-bold text-amber-600 dark:text-amber-400">
                {pendingBookings.length}
              </div>
            )}
            <p className="text-xs text-muted-foreground mt-1">Awaiting your acceptance</p>
          </CardContent>
        </Card>

        {/* Card 2: Active / Scheduled */}
        <Card className="border-border/80 shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Active & In Progress
            </CardTitle>
            <Wrench className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            {acceptedLoading ? (
              <Skeleton className="h-8 w-16" />
            ) : (
              <div className="text-3xl font-bold text-primary">{acceptedCountVal}</div>
            )}
            <p className="text-xs text-muted-foreground mt-1">Scheduled or ongoing appointments</p>
          </CardContent>
        </Card>

        {/* Card 3: Completed Jobs */}
        <Card className="border-border/80 shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Completed Jobs
            </CardTitle>
            <CheckCircle2 className="h-4 w-4 text-emerald-500" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-emerald-600 dark:text-emerald-400">
              {completedCountVal}
            </div>
            <p className="text-xs text-muted-foreground mt-1">Delivered and finalized jobs</p>
          </CardContent>
        </Card>

        {/* Card 4: Services Catalog */}
        <Card className="border-border/80 shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Published Services
            </CardTitle>
            <Layers className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            {servicesLoading ? (
              <Skeleton className="h-8 w-16" />
            ) : (
              <div className="text-3xl font-bold text-foreground">
                {services.length}
              </div>
            )}
            <p className="text-xs text-muted-foreground mt-1">
              {activeServicesCount} currently active for booking
            </p>
          </CardContent>
        </Card>

        {/* Card 5: Total Revenue Collected */}
        <Card className="border-border/80 shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Collected Revenue
            </CardTitle>
            <DollarSign className="h-4 w-4 text-emerald-500" />
          </CardHeader>
          <CardContent>
            {allBookingsLoading ? (
              <Skeleton className="h-8 w-24" />
            ) : (
              <div className="text-3xl font-bold text-emerald-600 dark:text-emerald-400">
                {formatCurrency(totalEarnings)}
              </div>
            )}
            <p className="text-xs text-muted-foreground mt-1">Verified advances & settlements</p>
          </CardContent>
        </Card>

        {/* Card 6: Pending Settlements */}
        <Card className="border-border/80 shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Pending Settlements
            </CardTitle>
            <TrendingUp className="h-4 w-4 text-amber-500" />
          </CardHeader>
          <CardContent>
            {allBookingsLoading ? (
              <Skeleton className="h-8 w-24" />
            ) : (
              <div className="text-3xl font-bold text-amber-600 dark:text-amber-400">
                {formatCurrency(pendingPayments)}
              </div>
            )}
            <p className="text-xs text-muted-foreground mt-1">Remaining balances on active jobs</p>
          </CardContent>
        </Card>
      </div>

      {/* Pending Booking Requests Section */}
      <Card className="border-border/80 shadow-sm">
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle className="text-lg font-bold">New Booking Inquiries</CardTitle>
            <CardDescription>
              Review customer service bookings and confirm technician schedule
            </CardDescription>
          </div>
          <Button variant="ghost" size="sm" asChild className="gap-1 text-primary font-semibold">
            <Link href="/dashboard/provider/requests">
              View All Queue <ArrowRight className="h-4 w-4" />
            </Link>
          </Button>
        </CardHeader>

        <CardContent>
          {pendingLoading ? (
            <div className="space-y-3">
              {Array.from({ length: 2 }).map((_, i) => (
                <Skeleton key={i} className="h-20 rounded-lg" />
              ))}
            </div>
          ) : pendingBookings.length === 0 ? (
            <div className="py-10 text-center text-muted-foreground text-sm">
              <Clock className="h-10 w-10 mx-auto text-muted-foreground/30 mb-2" />
              No pending booking inquiries at this moment.
            </div>
          ) : (
            <div className="space-y-3">
              {pendingBookings.slice(0, 3).map((booking) => (
                <div
                  key={booking.id}
                  className="p-4 rounded-xl border border-border/70 bg-card flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-base">
                        {booking.service_name || `Service #${booking.service}`}
                      </span>
                      <Badge variant="warning" className="text-[10px] uppercase font-bold">
                        Pending Confirmation
                      </Badge>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Requested Date: <strong>{booking.booking_date} at {booking.booking_time}</strong> | Customer: {booking.customer_name || "Client"}
                    </p>
                    {booking.note && (
                      <p className="text-xs italic text-muted-foreground bg-muted/40 p-1.5 rounded mt-1">
                        &quot;{booking.note}&quot;
                      </p>
                    )}
                  </div>

                  <div className="flex items-center gap-2">
                    <Button
                      size="sm"
                      className="gap-1 bg-emerald-600 hover:bg-emerald-700 text-white"
                      disabled={acceptMutation.isPending}
                      onClick={() => acceptMutation.mutate(booking.id)}
                    >
                      <Check className="h-4 w-4" />
                      Accept
                    </Button>

                    <Button
                      size="sm"
                      variant="outline"
                      className="gap-1 text-destructive hover:bg-destructive/10"
                      disabled={rejectMutation.isPending}
                      onClick={() => rejectMutation.mutate(booking.id)}
                    >
                      <X className="h-4 w-4" />
                      Reject
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Active / Accepted Bookings Section */}
      <Card className="border-border/80 shadow-sm">
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle className="text-lg font-bold">Accepted & Active Bookings</CardTitle>
            <CardDescription>
              Bookings scheduled or in execution. Mark as completed once finished.
            </CardDescription>
          </div>
          <Button variant="ghost" size="sm" asChild className="gap-1 text-primary font-semibold">
            <Link href="/dashboard/provider/active">
              View All Active <ArrowRight className="h-4 w-4" />
            </Link>
          </Button>
        </CardHeader>

        <CardContent>
          {acceptedLoading ? (
            <div className="space-y-3">
              {Array.from({ length: 2 }).map((_, i) => (
                <Skeleton key={i} className="h-20 rounded-lg" />
              ))}
            </div>
          ) : acceptedBookings.length === 0 ? (
            <div className="py-10 text-center text-muted-foreground text-sm">
              <CheckCircle2 className="h-10 w-10 mx-auto text-muted-foreground/30 mb-2" />
              No active accepted bookings at this moment.
            </div>
          ) : (
            <div className="space-y-3">
              {acceptedBookings.slice(0, 3).map((booking) => {
                const paidAmt = Number(booking.paid_amount || 0);
                const advAmt = Number(booking.advance_amount || 0);
                const hasAdvancePaid =
                  (advAmt > 0 && paidAmt >= advAmt) ||
                  booking.payment_status === "partially_paid" ||
                  booking.payment_status === "paid" ||
                  booking.is_advance_paid === true;

                return (
                  <div
                    key={booking.id}
                    className="p-4 rounded-xl border border-border/70 bg-card flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-base">
                          {booking.service_name || `Service #${booking.service}`}
                        </span>
                        <Badge variant="info" className="text-[10px] uppercase font-bold">
                          Accepted
                        </Badge>
                        {hasAdvancePaid && (
                          <Badge variant="success" className="text-[10px]">
                            20% Advance Paid
                          </Badge>
                        )}
                      </div>
                      <p className="text-xs text-muted-foreground">
                        Scheduled: <strong>{booking.booking_date} at {booking.booking_time}</strong> | Payment: <span className="capitalize font-medium">{booking.final_payment_method}</span>
                      </p>
                    </div>

                    <div className="flex items-center gap-2">
                      <Button
                        size="sm"
                        className="gap-1.5 bg-primary font-semibold"
                        disabled={completeMutation.isPending}
                        onClick={() => completeMutation.mutate(booking.id)}
                      >
                        <CheckCircle2 className="h-4 w-4" />
                        Mark Completed
                      </Button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Services Showcase Snapshot */}
      <Card className="border-border/80 shadow-sm">
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle className="text-lg font-bold">My Published Services</CardTitle>
            <CardDescription>
              Quick glance of your active services and customer-facing rates
            </CardDescription>
          </div>
          <Button variant="ghost" size="sm" asChild className="gap-1 text-primary font-semibold">
            <Link href="/dashboard/provider/services">
              Manage Services <ArrowRight className="h-4 w-4" />
            </Link>
          </Button>
        </CardHeader>

        <CardContent>
          {servicesLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {Array.from({ length: 3 }).map((_, i) => (
                <Skeleton key={i} className="h-48 rounded-xl" />
              ))}
            </div>
          ) : services.length === 0 ? (
            <div className="py-8 text-center text-muted-foreground text-sm">
              <Layers className="h-10 w-10 mx-auto text-muted-foreground/30 mb-2" />
              You haven&apos;t created any services yet.
              <div className="mt-3">
                <Button size="sm" asChild>
                  <Link href="/dashboard/provider/services/new">Publish First Service</Link>
                </Button>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
              {services.slice(0, 3).map((service) => (
                <div
                  key={service.id}
                  className="rounded-xl border border-border/70 overflow-hidden bg-card flex flex-col justify-between"
                >
                  <ServiceImage
                    src={service.image}
                    alt={service.name}
                    containerClassName="w-full aspect-[16/10] bg-muted/60 relative overflow-hidden"
                  />
                  <div className="p-3.5 space-y-1.5 flex-1 flex flex-col justify-between">
                    <div>
                      <h4 className="font-bold text-sm line-clamp-1">{service.name}</h4>
                      <p className="text-xs text-muted-foreground line-clamp-1">{service.description}</p>
                    </div>
                    <div className="flex items-center justify-between pt-2 border-t border-border/40 text-xs">
                      <span className="font-extrabold text-foreground">
                        {formatCurrency(service.base_price || service.hour_base_price)}
                      </span>
                      <Button variant="ghost" size="sm" asChild className="h-7 px-2 text-xs text-primary">
                        <Link href={`/dashboard/provider/services/${service.id}/edit`}>
                          Edit
                        </Link>
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
