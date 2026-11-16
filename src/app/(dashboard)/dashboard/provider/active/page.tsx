"use client";

import * as React from "react";
import Link from "next/link";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { CheckCircle2, Banknote, Calendar, User, Clock, CreditCard } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { dashboardService } from "@/features/dashboard/services/dashboard.service";
import { paymentsService } from "@/features/payments/services/payments.service";
import { formatCurrency } from "@/lib/utils";
import type { Booking } from "@/types/api";

export default function ProviderActiveBookingsPage() {
  const queryClient = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ["dashboard", "provider", "accepted_bookings"],
    queryFn: () => dashboardService.getProviderAcceptedBookings(),
  });

  const bookings: Booking[] = data || [];

  const completeMutation = useMutation({
    mutationFn: (id: number | string) => dashboardService.completeBooking(id),
    onSuccess: () => {
      toast.success("Service marked as completed! Customer can now settle the final payment.");
      queryClient.invalidateQueries({ queryKey: ["dashboard", "provider"] });
    },
    onError: (err: any) => {
      toast.error(err?.message || "Failed to mark booking as completed.");
    },
  });

  const confirmCashMutation = useMutation({
    mutationFn: (id: number | string) => paymentsService.confirmCash(id),
    onSuccess: () => {
      toast.success("Cash payment confirmed and recorded!");
      queryClient.invalidateQueries({ queryKey: ["dashboard", "provider"] });
    },
    onError: (err: any) => {
      toast.error(err?.message || "Failed to confirm cash payment.");
    },
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 rounded-2xl bg-gradient-to-r from-primary/10 via-primary/5 to-transparent border border-primary/20">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">Active & Accepted Bookings</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Perform scheduled services and mark them as completed to enable final balance settlement.
          </p>
        </div>

        <Button variant="outline" asChild className="gap-2 font-semibold">
          <Link href="/dashboard/provider/bookings">
            <Calendar className="h-4 w-4" />
            All Bookings Hub
          </Link>
        </Button>
      </div>

      {isLoading ? (
        <div className="space-y-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className="h-28 rounded-xl" />
          ))}
        </div>
      ) : bookings.length === 0 ? (
        <Card className="p-12 text-center text-muted-foreground">
          <CheckCircle2 className="mx-auto h-12 w-12 text-muted-foreground/40 mb-3" />
          <h3 className="font-semibold text-base text-foreground">No active bookings</h3>
          <p className="text-sm mt-1">Accepted service requests will appear here for execution.</p>
        </Card>
      ) : (
        <div className="space-y-4">
          {bookings.map((booking) => {
            const paidAmt = Number(booking.paid_amount || 0);
            const advAmt = Number(booking.advance_amount || 0);
            const hasAdvancePaid =
              (advAmt > 0 && paidAmt >= advAmt) ||
              booking.payment_status === "partially_paid" ||
              booking.payment_status === "paid" ||
              booking.is_advance_paid === true;

            const isCash = String(booking.final_payment_method || "").toLowerCase() === "cash";

            return (
              <Card key={booking.id} className="border-border/80 shadow-sm">
                <CardContent className="p-5 flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-lg">
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

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-1 text-xs text-muted-foreground">
                      <p className="flex items-center gap-1.5">
                        <Calendar className="h-3.5 w-3.5 text-primary" />
                        Date: <strong className="text-foreground">{booking.booking_date}</strong> at{" "}
                        <strong className="text-foreground">{booking.booking_time}</strong>
                      </p>
                      <p className="flex items-center gap-1.5">
                        <User className="h-3.5 w-3.5 text-primary" />
                        Client: {booking.customer_name || "Customer"}
                      </p>
                      <p className="flex items-center gap-1.5">
                        <CreditCard className="h-3.5 w-3.5 text-primary" />
                        Final Payment: <strong className="text-foreground capitalize">{booking.final_payment_method}</strong>
                      </p>
                      {advAmt > 0 && (
                        <p>
                          Advance Amount: <strong>{formatCurrency(advAmt)}</strong>
                        </p>
                      )}
                    </div>

                    {booking.note && (
                      <p className="text-xs italic text-muted-foreground bg-muted/40 p-2 rounded">
                        Note: {booking.note}
                      </p>
                    )}
                  </div>

                  <div className="flex flex-wrap items-center gap-2 shrink-0">
                    {/* Mark complete button */}
                    <Button
                      size="sm"
                      className="gap-1.5 bg-primary hover:bg-primary/90 font-semibold"
                      disabled={completeMutation.isPending}
                      onClick={() => completeMutation.mutate(booking.id)}
                    >
                      <CheckCircle2 className="h-4 w-4" />
                      Mark Service Completed
                    </Button>

                    {/* Confirm Cash received */}
                    {isCash && (
                      <Button
                        size="sm"
                        variant="outline"
                        className="gap-1.5 border-emerald-600 text-emerald-700 hover:bg-emerald-50 dark:border-emerald-500 dark:text-emerald-400"
                        disabled={confirmCashMutation.isPending}
                        onClick={() => confirmCashMutation.mutate(booking.id)}
                      >
                        <Banknote className="h-4 w-4" />
                        Confirm Cash Received
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}

