"use client";

import * as React from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Clock, Check, X, Calendar, User, MessageSquare } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { dashboardService } from "@/features/dashboard/services/dashboard.service";
import type { Booking } from "@/types/api";

export default function ProviderRequestsPage() {
  const queryClient = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ["dashboard", "provider", "pending_bookings"],
    queryFn: () => dashboardService.getProviderPendingBookings(),
  });

  const bookings: Booking[] = data || [];

  const acceptMutation = useMutation({
    mutationFn: (id: number | string) => dashboardService.acceptBooking(id),
    onSuccess: () => {
      toast.success("Booking accepted! Customer has been emailed to pay 20% advance.");
      queryClient.invalidateQueries({ queryKey: ["dashboard", "provider"] });
    },
    onError: (err: any) => {
      toast.error(err?.message || "Failed to accept booking.");
    },
  });

  const rejectMutation = useMutation({
    mutationFn: (id: number | string) => dashboardService.rejectBooking(id),
    onSuccess: () => {
      toast.info("Booking request rejected.");
      queryClient.invalidateQueries({ queryKey: ["dashboard", "provider"] });
    },
    onError: (err: any) => {
      toast.error(err?.message || "Failed to reject booking.");
    },
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">Pending Service Requests</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Review new appointment requests from customers. Accepting triggers notification for 20% advance deposit.
        </p>
      </div>

      {isLoading ? (
        <div className="space-y-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className="h-28 rounded-xl" />
          ))}
        </div>
      ) : bookings.length === 0 ? (
        <Card className="p-12 text-center text-muted-foreground">
          <Clock className="mx-auto h-12 w-12 text-muted-foreground/40 mb-3" />
          <h3 className="font-semibold text-base text-foreground">No pending requests</h3>
          <p className="text-sm mt-1">New booking requests from clients will show up here.</p>
        </Card>
      ) : (
        <div className="space-y-4">
          {bookings.map((booking) => (
            <Card key={booking.id} className="border-border/80 shadow-sm">
              <CardContent className="p-5 flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-lg">
                      {booking.service_name || `Service #${booking.service}`}
                    </span>
                    <Badge variant="warning" className="text-[10px] uppercase font-bold">
                      Awaiting Response
                    </Badge>
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
                  </div>

                  {booking.note && (
                    <div className="p-2.5 rounded bg-muted/40 text-xs text-muted-foreground flex items-start gap-1.5">
                      <MessageSquare className="h-3.5 w-3.5 text-muted-foreground shrink-0 mt-0.5" />
                      <span>{booking.note}</span>
                    </div>
                  )}
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <Button
                    className="gap-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold"
                    disabled={acceptMutation.isPending}
                    onClick={() => acceptMutation.mutate(booking.id)}
                  >
                    <Check className="h-4 w-4" />
                    Accept Request
                  </Button>

                  <Button
                    variant="outline"
                    className="gap-1.5 text-destructive hover:bg-destructive/10"
                    disabled={rejectMutation.isPending}
                    onClick={() => rejectMutation.mutate(booking.id)}
                  >
                    <X className="h-4 w-4" />
                    Reject
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}

