"use client";

import * as React from "react";
import Link from "next/link";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  Calendar,
  Clock,
  CheckCircle2,
  XCircle,
  AlertCircle,
  User,
  Phone,
  Mail,
  CreditCard,
  Banknote,
  Search,
  Check,
  X,
  MessageSquare,
  Eye,
  Loader2,
  RotateCcw,
} from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { bookingsService } from "@/features/bookings/services/bookings.service";
import { dashboardService } from "@/features/dashboard/services/dashboard.service";
import { paymentsService } from "@/features/payments/services/payments.service";
import { formatCurrency, formatDate } from "@/lib/utils";
import type { Booking } from "@/types/api";

export default function ProviderAllBookingsPage() {
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = React.useState<string>("ALL");
  const [searchQuery, setSearchQuery] = React.useState<string>("");
  const [selectedBooking, setSelectedBooking] = React.useState<Booking | null>(null);
  const [detailsOpen, setDetailsOpen] = React.useState(false);

  // Queries
  const { data: allBookingsData, isLoading: allLoading } = useQuery({
    queryKey: ["bookings", "provider_all"],
    queryFn: () => bookingsService.getProviderBookings(),
  });

  const { data: pendingData } = useQuery({
    queryKey: ["dashboard", "provider", "pending_bookings"],
    queryFn: () => dashboardService.getProviderPendingBookings(),
  });

  const { data: acceptedData } = useQuery({
    queryKey: ["dashboard", "provider", "accepted_bookings"],
    queryFn: () => dashboardService.getProviderAcceptedBookings(),
  });

  // Combine and deduplicate bookings by ID
  const bookings: Booking[] = React.useMemo(() => {
    const map = new Map<number, Booking>();
    for (const b of allBookingsData || []) map.set(b.id, b);
    for (const b of acceptedData || []) map.set(b.id, b);
    for (const b of pendingData || []) map.set(b.id, b);
    return Array.from(map.values()).sort((a, b) => b.id - a.id);
  }, [allBookingsData, acceptedData, pendingData]);

  // Mutations
  const acceptMutation = useMutation({
    mutationFn: (id: number | string) => dashboardService.acceptBooking(id),
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
    mutationFn: (id: number | string) => dashboardService.rejectBooking(id),
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
    mutationFn: (id: number | string) => dashboardService.completeBooking(id),
    onSuccess: () => {
      toast.success("Service marked as completed! Customer can now settle the final balance.");
      queryClient.invalidateQueries({ queryKey: ["dashboard", "provider"] });
      queryClient.invalidateQueries({ queryKey: ["bookings"] });
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
      queryClient.invalidateQueries({ queryKey: ["bookings"] });
    },
    onError: (err: any) => {
      toast.error(err?.message || "Failed to confirm cash payment.");
    },
  });

  // Filter & Search
  const filteredBookings = React.useMemo(() => {
    let list = bookings;

    // Filter by tab
    if (activeTab !== "ALL") {
      list = list.filter((b) => {
        const rawStatus = String(b.status || "").toUpperCase();
        if (activeTab === "CANCELLED") {
          return rawStatus === "CANCELLED" || rawStatus === "REJECTED";
        }
        return rawStatus === activeTab;
      });
    }

    // Filter by search
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      list = list.filter(
        (b) =>
          b.service_name?.toLowerCase().includes(q) ||
          b.customer_name?.toLowerCase().includes(q) ||
          b.customer_email?.toLowerCase().includes(q) ||
          String(b.id).includes(q) ||
          b.note?.toLowerCase().includes(q)
      );
    }

    return list;
  }, [bookings, activeTab, searchQuery]);

  // Counts for tabs
  const tabCounts = React.useMemo(() => {
    let pending = 0;
    let accepted = 0;
    let completed = 0;
    let cancelled = 0;

    for (const b of bookings) {
      const st = String(b.status || "").toLowerCase();
      if (st === "pending") pending++;
      else if (st === "accepted") accepted++;
      else if (st === "completed") completed++;
      else if (st === "cancelled" || st === "rejected") cancelled++;
    }

    return { all: bookings.length, pending, accepted, completed, cancelled };
  }, [bookings]);

  const handleOpenDetails = (b: Booking) => {
    setSelectedBooking(b);
    setDetailsOpen(true);
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 rounded-2xl bg-gradient-to-r from-primary/10 via-primary/5 to-transparent border border-primary/20">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">Provider Bookings Center</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Review incoming requests, manage active appointments, mark deliveries completed, and verify settlements.
          </p>
        </div>

        <div className="flex gap-2">
          <Button variant="outline" asChild className="gap-2">
            <Link href="/dashboard/provider/requests">
              <Clock className="h-4 w-4 text-amber-500" />
              Pending Queue ({tabCounts.pending})
            </Link>
          </Button>
          <Button asChild className="gap-2 shadow font-semibold">
            <Link href="/dashboard/provider/active">
              <CheckCircle2 className="h-4 w-4" />
              Active Orders ({tabCounts.accepted})
            </Link>
          </Button>
        </div>
      </div>

      {/* Filter Tabs & Search Bar */}
      <div className="space-y-3">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
          {/* Status Tabs */}
          <div className="flex flex-wrap gap-2">
            {[
              { key: "ALL", label: `All (${tabCounts.all})` },
              { key: "PENDING", label: `Pending Requests (${tabCounts.pending})` },
              { key: "ACCEPTED", label: `Active & Scheduled (${tabCounts.accepted})` },
              { key: "COMPLETED", label: `Completed (${tabCounts.completed})` },
              { key: "CANCELLED", label: `Cancelled / Rejected (${tabCounts.cancelled})` },
            ].map((tab) => (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                  activeTab === tab.key
                    ? "bg-primary text-primary-foreground shadow-sm"
                    : "bg-muted/60 text-muted-foreground hover:bg-muted hover:text-foreground"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Search Box */}
          <div className="relative w-full md:w-72">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search by client, service, ID..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 h-9 text-xs"
            />
          </div>
        </div>
      </div>

      {/* Bookings List */}
      {allLoading ? (
        <div className="space-y-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-36 rounded-xl" />
          ))}
        </div>
      ) : filteredBookings.length === 0 ? (
        <Card className="p-12 text-center max-w-lg mx-auto border-border/80 shadow-sm">
          <Calendar className="mx-auto h-12 w-12 text-muted-foreground/40 mb-3" />
          <h3 className="font-semibold text-base">No bookings found in this view</h3>
          <p className="text-sm text-muted-foreground mt-1 mb-4">
            {searchQuery
              ? "No booking records match your search criteria."
              : `You have no ${activeTab.toLowerCase()} bookings recorded.`}
          </p>
          {(activeTab !== "ALL" || searchQuery) && (
            <Button
              variant="outline"
              onClick={() => {
                setActiveTab("ALL");
                setSearchQuery("");
              }}
            >
              Reset Filter
            </Button>
          )}
        </Card>
      ) : (
        <div className="space-y-4">
          {filteredBookings.map((b) => {
            const rawStatus = String(b.status || "").toLowerCase();
            const isAccepted = rawStatus === "accepted";
            const isPending = rawStatus === "pending";
            const isCompleted = rawStatus === "completed";
            const isCancelled = rawStatus === "cancelled" || rawStatus === "rejected";

            const method = String(b.final_payment_method || "").toLowerCase();
            const isOnline = method === "online";
            const isCash = method === "cash";

            const paidAmt = Number(b.paid_amount || 0);
            const advAmt = Number(b.advance_amount || 0);
            const remAmt = Number(b.remaining_amount || 0);
            const totalPrice = Number(b.price_at_booking || b.total_amount || 0);

            const hasPaidAdvance =
              (advAmt > 0 && paidAmt >= advAmt) ||
              b.payment_status === "partially_paid" ||
              b.payment_status === "paid" ||
              b.is_paid === true ||
              b.is_advance_paid === true;

            const hasPaidFull =
              b.is_paid === true ||
              b.payment_status === "paid" ||
              b.is_final_paid === true ||
              (remAmt <= 0 && paidAmt > 0);

            return (
              <Card key={b.id} className="border-border/80 shadow-sm overflow-hidden bg-card">
                <CardHeader className="p-5 pb-3 bg-muted/20 border-b border-border/50">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div className="flex items-center gap-2.5">
                      <h3 className="font-bold text-base">
                        {b.service_name || `Service #${b.service}`}
                      </h3>
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
                        {b.status}
                      </Badge>
                      {hasPaidFull ? (
                        <Badge variant="success" className="text-[10px]">
                          Fully Paid
                        </Badge>
                      ) : hasPaidAdvance ? (
                        <Badge variant="success" className="text-[10px]">
                          20% Advance Paid
                        </Badge>
                      ) : null}
                    </div>

                    <div className="flex items-center gap-3">
                      <span className="text-xs text-muted-foreground font-mono">
                        Booking Ref #{b.id}
                      </span>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-7 px-2 text-xs gap-1 text-primary"
                        onClick={() => handleOpenDetails(b)}
                      >
                        <Eye className="h-3.5 w-3.5" />
                        Details
                      </Button>
                    </div>
                  </div>
                </CardHeader>

                <CardContent className="p-5 space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                    {/* Appointment Date & Time */}
                    <div>
                      <p className="text-xs text-muted-foreground">Appointment Schedule</p>
                      <p className="font-semibold mt-0.5 flex items-center gap-1.5 text-foreground">
                        <Calendar className="h-4 w-4 text-primary" />
                        {b.booking_date} at {b.booking_time}
                      </p>
                    </div>

                    {/* Customer Info */}
                    <div>
                      <p className="text-xs text-muted-foreground">Customer</p>
                      <p className="font-semibold mt-0.5 flex items-center gap-1.5 text-foreground truncate">
                        <User className="h-4 w-4 text-primary" />
                        {b.customer_name || `User #${b.user || "Client"}`}
                      </p>
                    </div>

                    {/* Final Settlement Mode */}
                    <div>
                      <p className="text-xs text-muted-foreground">Final Settlement Mode</p>
                      <p className="font-semibold mt-0.5 flex items-center gap-1.5 text-foreground">
                        {isOnline ? (
                          <CreditCard className="h-4 w-4 text-blue-500" />
                        ) : (
                          <Banknote className="h-4 w-4 text-emerald-500" />
                        )}
                        <span className="capitalize">{method || "Cash"}</span>
                      </p>
                    </div>

                    {/* Financial Summary */}
                    <div>
                      <p className="text-xs text-muted-foreground">Price & Paid Status</p>
                      <p className="font-semibold mt-0.5 text-foreground">
                        {formatCurrency(totalPrice)}
                        {advAmt > 0 && (
                          <span className="text-xs text-muted-foreground ml-1.5">
                            (Adv: {formatCurrency(advAmt)})
                          </span>
                        )}
                      </p>
                    </div>
                  </div>

                  {/* Special Note */}
                  {b.note && (
                    <div className="p-3 rounded-lg bg-muted/40 text-xs text-muted-foreground border border-border/50">
                      <strong className="text-foreground">Client Note:</strong> {b.note}
                    </div>
                  )}

                  {/* Cancellation Reason */}
                  {b.cancellation_reason && (
                    <div className="p-3 rounded-lg bg-destructive/10 text-xs text-destructive border border-destructive/20">
                      <strong>Cancellation / Rejection Reason:</strong> {b.cancellation_reason}
                    </div>
                  )}

                  {/* Action Buttons */}
                  <div className="flex flex-wrap items-center justify-end gap-2 pt-2 border-t border-border/50">
                    {/* Pending actions: Accept / Reject */}
                    {isPending && (
                      <>
                        <Button
                          size="sm"
                          className="gap-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold"
                          disabled={acceptMutation.isPending}
                          onClick={() => acceptMutation.mutate(b.id)}
                        >
                          <Check className="h-4 w-4" />
                          Accept Request
                        </Button>

                        <Button
                          size="sm"
                          variant="outline"
                          className="gap-1.5 text-destructive hover:bg-destructive/10 border-destructive/30"
                          disabled={rejectMutation.isPending}
                          onClick={() => {
                            if (confirm(`Are you sure you want to decline this booking request?`)) {
                              rejectMutation.mutate(b.id);
                            }
                          }}
                        >
                          <X className="h-4 w-4" />
                          Decline
                        </Button>
                      </>
                    )}

                    {/* Accepted actions: Mark Completed & Confirm Cash */}
                    {isAccepted && (
                      <>
                        <Button
                          size="sm"
                          className="gap-1.5 bg-primary hover:bg-primary/90 font-semibold"
                          disabled={completeMutation.isPending}
                          onClick={() => completeMutation.mutate(b.id)}
                        >
                          <CheckCircle2 className="h-4 w-4" />
                          Mark Completed
                        </Button>

                        {isCash && (
                          <Button
                            size="sm"
                            variant="outline"
                            className="gap-1.5 border-emerald-600 text-emerald-700 hover:bg-emerald-50 dark:border-emerald-500 dark:text-emerald-400 font-semibold"
                            disabled={confirmCashMutation.isPending}
                            onClick={() => confirmCashMutation.mutate(b.id)}
                          >
                            <Banknote className="h-4 w-4" />
                            Confirm Cash Received
                          </Button>
                        )}
                      </>
                    )}

                    {/* Completed info badge */}
                    {isCompleted && (
                      <Badge variant="outline" className="border-emerald-500/40 text-emerald-700 dark:text-emerald-400 py-1 px-2.5">
                        <CheckCircle2 className="h-3.5 w-3.5 mr-1" />
                        Job Finalized
                      </Badge>
                    )}
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      {/* Detailed Booking Modal */}
      <Dialog open={detailsOpen} onOpenChange={setDetailsOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Booking Details #{selectedBooking?.id}</DialogTitle>
            <DialogDescription>
              Complete appointment and customer settlement specifications.
            </DialogDescription>
          </DialogHeader>

          {selectedBooking && (
            <div className="space-y-4 py-2 text-sm">
              <div className="p-3 rounded-lg bg-muted/40 border border-border/60 space-y-2">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Service Name:</span>
                  <span className="font-bold text-foreground">
                    {selectedBooking.service_name || `Service #${selectedBooking.service}`}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Status:</span>
                  <Badge variant="outline" className="uppercase text-[10px] font-bold">
                    {selectedBooking.status}
                  </Badge>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Scheduled Date:</span>
                  <span className="font-medium text-foreground">
                    {selectedBooking.booking_date} at {selectedBooking.booking_time}
                  </span>
                </div>
              </div>

              <div className="p-3 rounded-lg bg-muted/40 border border-border/60 space-y-2">
                <p className="font-semibold text-xs text-muted-foreground uppercase tracking-wider">
                  Client Contact
                </p>
                <div className="flex items-center gap-2 text-foreground">
                  <User className="h-4 w-4 text-primary" />
                  <span>{selectedBooking.customer_name || "Customer"}</span>
                </div>
                {selectedBooking.customer_email && (
                  <div className="flex items-center gap-2 text-muted-foreground text-xs">
                    <Mail className="h-3.5 w-3.5 text-primary" />
                    <span>{selectedBooking.customer_email}</span>
                  </div>
                )}
                {selectedBooking.customer_phone && (
                  <div className="flex items-center gap-2 text-muted-foreground text-xs">
                    <Phone className="h-3.5 w-3.5 text-primary" />
                    <span>{selectedBooking.customer_phone}</span>
                  </div>
                )}
              </div>

              <div className="p-3 rounded-lg bg-muted/40 border border-border/60 space-y-2">
                <p className="font-semibold text-xs text-muted-foreground uppercase tracking-wider">
                  Financial Breakdown
                </p>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Total Service Fee:</span>
                  <span className="font-bold">
                    {formatCurrency(selectedBooking.price_at_booking || selectedBooking.total_amount)}
                  </span>
                </div>
                <div className="flex justify-between text-primary font-semibold">
                  <span>20% Advance Amount:</span>
                  <span>{formatCurrency(selectedBooking.advance_amount)}</span>
                </div>
                <div className="flex justify-between text-emerald-600 dark:text-emerald-400">
                  <span>Amount Paid by Client:</span>
                  <span>{formatCurrency(selectedBooking.paid_amount || 0)}</span>
                </div>
                <div className="flex justify-between text-muted-foreground">
                  <span>Remaining Balance:</span>
                  <span>{formatCurrency(selectedBooking.remaining_amount || 0)}</span>
                </div>
                <div className="flex justify-between pt-1 border-t border-border/50">
                  <span className="text-muted-foreground">Payment Mode:</span>
                  <span className="capitalize font-semibold text-foreground">
                    {selectedBooking.final_payment_method}
                  </span>
                </div>
              </div>

              {selectedBooking.note && (
                <div className="p-3 rounded-lg bg-muted/40 border border-border/60 text-xs">
                  <strong className="text-foreground">Special Instructions:</strong>{" "}
                  <span className="text-muted-foreground">{selectedBooking.note}</span>
                </div>
              )}
            </div>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => setDetailsOpen(false)} className="w-full">
              Close Details
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
