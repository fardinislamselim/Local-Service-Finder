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
  AlertCircle,
  PlusCircle,
  Layers,
  ArrowRight,
  Loader2,
} from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { dashboardService } from "@/features/dashboard/services/dashboard.service";
import { useAuth } from "@/features/auth/hooks/use-auth";
import { formatCurrency } from "@/lib/utils";
import type { Booking } from "@/types/api";

export default function ProviderDashboardPage() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

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

  const pendingBookings: Booking[] = pendingData || [];
  const acceptedBookings: Booking[] = acceptedData || [];

  // Accept Mutation
  const acceptMutation = useMutation({
    mutationFn: (bookingId: number | string) => dashboardService.acceptBooking(bookingId),
    onSuccess: () => {
      toast.success("Booking accepted! Customer has been notified to pay 20% advance.");
      queryClient.invalidateQueries({ queryKey: ["dashboard", "provider"] });
    },
    onError: (err: any) => {
      toast.error(err?.message || "Failed to accept booking.");
    },
  });

  // Reject Mutation
  const rejectMutation = useMutation({
    mutationFn: (bookingId: number | string) => dashboardService.rejectBooking(bookingId),
    onSuccess: () => {
      toast.info("Booking request rejected.");
      queryClient.invalidateQueries({ queryKey: ["dashboard", "provider"] });
    },
    onError: (err: any) => {
      toast.error(err?.message || "Failed to reject booking.");
    },
  });

  // Complete Mutation
  const completeMutation = useMutation({
    mutationFn: (bookingId: number | string) => dashboardService.completeBooking(bookingId),
    onSuccess: () => {
      toast.success("Service marked as completed! Customer can now settle the final payment.");
      queryClient.invalidateQueries({ queryKey: ["dashboard", "provider"] });
    },
    onError: (err: any) => {
      toast.error(err?.message || "Failed to complete booking.");
    },
  });

  const acceptedCountVal =
    typeof totalAcceptedCount === "number"
      ? totalAcceptedCount
      : (totalAcceptedCount as any)?.total_accepted ?? acceptedBookings.length;

  const completedCountVal =
    typeof totalCompletedCount === "number"
      ? totalCompletedCount
      : (totalCompletedCount as any)?.total_completed ?? 0;

  return (
    <div className="space-y-8">
      {/* Provider Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 rounded-2xl bg-gradient-to-r from-primary/10 via-primary/5 to-transparent border border-primary/20">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
            Provider Workspace: {user?.first_name || "Specialist"}
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Manage your service requests, accepted orders, and complete service deliveries.
          </p>
        </div>

        <div className="flex gap-2">
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

      {/* Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
        <Card className="border-border/80 shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              New Requests Waiting
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
            <p className="text-xs text-muted-foreground mt-1">Accept to prompt 20% advance</p>
          </CardContent>
        </Card>

        <Card className="border-border/80 shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Accepted / In Progress
            </CardTitle>
            <Wrench className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            {acceptedLoading ? (
              <Skeleton className="h-8 w-16" />
            ) : (
              <div className="text-3xl font-bold text-primary">{acceptedCountVal}</div>
            )}
            <p className="text-xs text-muted-foreground mt-1">Scheduled or active jobs</p>
          </CardContent>
        </Card>

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
            <p className="text-xs text-muted-foreground mt-1">Delivered and finalized services</p>
          </CardContent>
        </Card>
      </div>

      {/* Pending Booking Requests Section */}
      <Card className="border-border/80 shadow-sm">
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle className="text-lg font-bold">New Booking Inquiries</CardTitle>
            <CardDescription>
              Review customer service bookings and confirm availability
            </CardDescription>
          </div>
          <Button variant="ghost" size="sm" asChild className="gap-1 text-primary font-semibold">
            <Link href="/dashboard/provider/requests">
              View All <ArrowRight className="h-4 w-4" />
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
              View All <ArrowRight className="h-4 w-4" />
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
              No active accepted bookings at this moment.
            </div>
          ) : (
            <div className="space-y-3">
              {acceptedBookings.slice(0, 3).map((booking) => (
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
                      {booking.is_advance_paid && (
                        <Badge variant="success" className="text-[10px]">
                          20% Advance Paid
                        </Badge>
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Scheduled: <strong>{booking.booking_date} at {booking.booking_time}</strong> | Payment: {booking.final_payment_method}
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
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

