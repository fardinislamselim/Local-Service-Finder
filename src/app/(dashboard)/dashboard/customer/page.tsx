"use client";

import * as React from "react";
import Link from "next/link";
import { useQuery, useMutation } from "@tanstack/react-query";
import {
  Calendar,
  Clock,
  CheckCircle2,
  AlertCircle,
  Wrench,
  CreditCard,
  ArrowRight,
  ExternalLink,
  Plus,
} from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { dashboardService } from "@/features/dashboard/services/dashboard.service";
import { paymentsService, extractPaymentRedirectUrl } from "@/features/payments/services/payments.service";
import { useAuth } from "@/features/auth/hooks/use-auth";
import { formatCurrency, formatDate } from "@/lib/utils";
import type { Booking } from "@/types/api";

export default function CustomerDashboardPage() {
  const { user } = useAuth();

  const { data: overview, isLoading: overviewLoading } = useQuery({
    queryKey: ["dashboard", "customer", "overview"],
    queryFn: () => dashboardService.getCustomerOverview(),
  });

  const { data: totalOrdersData, isLoading: ordersLoading } = useQuery({
    queryKey: ["dashboard", "customer", "total_orders"],
    queryFn: () => dashboardService.getCustomerTotalOrders(),
  });

  const { data: pendingData } = useQuery({
    queryKey: ["dashboard", "customer", "pending_bookings"],
    queryFn: () => dashboardService.getCustomerPendingBookings(),
  });

  const { data: completedData } = useQuery({
    queryKey: ["dashboard", "customer", "completed_bookings"],
    queryFn: () => dashboardService.getCustomerCompletedBookings(),
  });

  const totalOrders: Booking[] = totalOrdersData || [];
  const pendingBookings: Booking[] = pendingData || [];
  const completedBookings: Booking[] = completedData || [];

  // Pay 20% Advance mutation
  const advancePaymentMutation = useMutation({
    mutationFn: (bookingId: number | string) => paymentsService.initiateAdvance(bookingId),
    onSuccess: (data) => {
      const url = extractPaymentRedirectUrl(data);
      if (url) {
        toast.info("Redirecting to SSLCommerz secure payment gateway...");
        window.location.href = url;
      } else {
        toast.success("Advance payment session created!");
      }
    },
    onError: (err: any) => {
      toast.error(err?.message || "Failed to initiate payment gateway.");
    },
  });

  return (
    <div className="space-y-8">
      {/* Welcome Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 rounded-2xl bg-gradient-to-r from-primary/10 via-primary/5 to-transparent border border-primary/20">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
            Hello, {user?.first_name || "Customer"}!
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Track your service appointments, payments, and book verified professionals.
          </p>
        </div>

        <Button asChild className="gap-2 shadow font-semibold">
          <Link href="/services">
            <Plus className="h-4 w-4" />
            Book a New Service
          </Link>
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
        <Card className="border-border/80 shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total Bookings
            </CardTitle>
            <Calendar className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            {ordersLoading ? (
              <Skeleton className="h-8 w-16" />
            ) : (
              <div className="text-3xl font-bold">{totalOrders.length}</div>
            )}
            <p className="text-xs text-muted-foreground mt-1">Lifetime booked services</p>
          </CardContent>
        </Card>

        <Card className="border-border/80 shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Pending / In Progress
            </CardTitle>
            <Clock className="h-4 w-4 text-amber-500" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-amber-600 dark:text-amber-400">
              {pendingBookings.length}
            </div>
            <p className="text-xs text-muted-foreground mt-1">Awaiting provider confirmation</p>
          </CardContent>
        </Card>

        <Card className="border-border/80 shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Completed Services
            </CardTitle>
            <CheckCircle2 className="h-4 w-4 text-emerald-500" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-emerald-600 dark:text-emerald-400">
              {completedBookings.length}
            </div>
            <p className="text-xs text-muted-foreground mt-1">Successfully completed jobs</p>
          </CardContent>
        </Card>
      </div>

      {/* Recent Bookings List */}
      <Card className="border-border/80 shadow-sm">
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle className="text-lg font-bold">Recent Bookings</CardTitle>
            <CardDescription>
              Review your scheduled appointments and payment statuses
            </CardDescription>
          </div>
          <Button variant="ghost" size="sm" asChild className="gap-1 text-primary font-semibold">
            <Link href="/dashboard/customer/bookings">
              View All <ArrowRight className="h-4 w-4" />
            </Link>
          </Button>
        </CardHeader>

        <CardContent>
          {ordersLoading ? (
            <div className="space-y-3">
              {Array.from({ length: 3 }).map((_, i) => (
                <Skeleton key={i} className="h-20 rounded-lg" />
              ))}
            </div>
          ) : totalOrders.length === 0 ? (
            <div className="py-12 text-center">
              <Calendar className="mx-auto h-12 w-12 text-muted-foreground/40 mb-3" />
              <h3 className="font-semibold text-base">No bookings placed yet</h3>
              <p className="text-sm text-muted-foreground mt-1 mb-4">
                Explore our vetted service catalog and book your first service today.
              </p>
              <Button asChild>
                <Link href="/services">Browse Services</Link>
              </Button>
            </div>
          ) : (
            <div className="space-y-3">
              {totalOrders.slice(0, 5).map((booking) => {
                const isAccepted = booking.status === "ACCEPTED";
                const isPending = booking.status === "PENDING";
                const isCompleted = booking.status === "COMPLETED";

                return (
                  <div
                    key={booking.id}
                    className="p-4 rounded-xl border border-border/70 bg-card hover:bg-muted/30 transition-colors flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-base">
                          {booking.service_name || `Service #${booking.service}`}
                        </span>
                        <Badge
                          variant={
                            isAccepted
                              ? "info"
                              : isCompleted
                              ? "success"
                              : isPending
                              ? "warning"
                              : "secondary"
                          }
                          className="text-[10px] font-bold uppercase"
                        >
                          {booking.status}
                        </Badge>
                      </div>

                      <div className="flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <Calendar className="h-3.5 w-3.5" />
                          {booking.booking_date} at {booking.booking_time}
                        </span>
                        <span>•</span>
                        <span>
                          Final: <strong className="text-foreground">{booking.final_payment_method}</strong>
                        </span>
                        {booking.advance_amount && (
                          <>
                            <span>•</span>
                            <span>
                              20% Advance:{" "}
                              <strong className="text-foreground">
                                {formatCurrency(booking.advance_amount)}
                              </strong>
                            </span>
                          </>
                        )}
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-2">
                      {isAccepted && !booking.is_advance_paid && (
                        <Button
                          size="sm"
                          className="gap-1.5 font-semibold bg-primary hover:bg-primary/90"
                          disabled={advancePaymentMutation.isPending}
                          onClick={() => advancePaymentMutation.mutate(booking.id)}
                        >
                          <CreditCard className="h-4 w-4" />
                          Pay 20% Advance
                        </Button>
                      )}

                      <Button variant="outline" size="sm" asChild>
                        <Link href="/dashboard/customer/bookings">View Details</Link>
                      </Button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

