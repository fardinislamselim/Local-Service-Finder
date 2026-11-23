"use client";

import * as React from "react";
import Link from "next/link";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  Calendar,
  Clock,
  CreditCard,
  Banknote,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Edit,
  Trash2,
  Star,
  ExternalLink,
  MessageSquare,
  Loader2,
} from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
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
import { FormInput, FormTextarea } from "@/components/shared/form-field";
import { bookingsService } from "@/features/bookings/services/bookings.service";
import { paymentsService, extractPaymentRedirectUrl } from "@/features/payments/services/payments.service";
import { reviewsService } from "@/features/reviews/services/reviews.service";
import { formatCurrency, formatDate } from "@/lib/utils";
import { PaymentCheckoutModal } from "@/components/payments/PaymentCheckoutModal";
import type { Booking } from "@/types/api";

export default function CustomerBookingsPage() {
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = React.useState<string>("ALL");

  // Dialog states
  const [updateDialogOpen, setUpdateDialogOpen] = React.useState(false);
  const [cancelDialogOpen, setCancelDialogOpen] = React.useState(false);
  const [reviewDialogOpen, setReviewDialogOpen] = React.useState(false);
  const [selectedBooking, setSelectedBooking] = React.useState<Booking | null>(null);

  // Form states for update dialog
  const [editDate, setEditDate] = React.useState("");
  const [editTime, setEditTime] = React.useState("");
  const [editNote, setEditNote] = React.useState("");

  // Cancel reason state
  const [cancelReason, setCancelReason] = React.useState("");

  // Review states
  const [reviewRating, setReviewRating] = React.useState("5");
  const [reviewComment, setReviewComment] = React.useState("");

  // Fetch bookings
  const { data: bookingsData, isLoading } = useQuery({
    queryKey: ["bookings", "my_bookings"],
    queryFn: () => bookingsService.getMyBookings(),
  });

  const bookings: Booking[] = bookingsData || [];

  // Filter by tab
  const filteredBookings = React.useMemo(() => {
    if (activeTab === "ALL") return bookings;
    return bookings.filter((b) => String(b.status || "").toUpperCase() === activeTab);
  }, [bookings, activeTab]);

  // Update mutation
  const updateMutation = useMutation({
    mutationFn: (data: { id: number | string; date: string; time: string; note: string }) =>
      bookingsService.update(data.id, {
        booking_date: data.date,
        booking_time: data.time,
        note: data.note,
      }),
    onSuccess: () => {
      toast.success("Booking updated successfully!");
      queryClient.invalidateQueries({ queryKey: ["bookings"] });
      setUpdateDialogOpen(false);
    },
    onError: (err: any) => {
      toast.error(err?.message || "Failed to update booking.");
    },
  });

  // Cancel mutation
  const cancelMutation = useMutation({
    mutationFn: (data: { id: number | string; reason: string }) =>
      bookingsService.cancel(data.id, { cancellation_reason: data.reason }),
    onSuccess: () => {
      toast.success("Booking cancelled.");
      queryClient.invalidateQueries({ queryKey: ["bookings"] });
      setCancelDialogOpen(false);
      setCancelReason("");
    },
    onError: (err: any) => {
      toast.error(err?.message || "Failed to cancel booking.");
    },
  });

  // Advance Payment Mutation
  const advancePaymentMutation = useMutation({
    mutationFn: (bookingId: number | string) => paymentsService.initiateAdvance(bookingId),
    onSuccess: (data) => {
      const url = extractPaymentRedirectUrl(data);
      if (url) {
        toast.info("Redirecting to SSLCommerz payment gateway...");
        window.location.href = url;
      } else {
        toast.success("Advance payment initialized.");
      }
    },
    onError: (err: any) => {
      const msg = err?.message || "Failed to initiate advance payment.";
      if (msg.includes("SSLCommerz") || msg.includes("Could not initiate")) {
        toast.error(
          "Could not initiate SSLCommerz session. Please make sure your contact phone and city are set in My Profile, or try again.",
          { duration: 7000 }
        );
      } else {
        toast.error(msg);
      }
    },
  });

  // Final Payment Mutation
  const finalPaymentMutation = useMutation({
    mutationFn: (bookingId: number | string) => paymentsService.initiateFinal(bookingId),
    onSuccess: (data) => {
      const url = extractPaymentRedirectUrl(data);
      if (url) {
        toast.info("Redirecting to SSLCommerz for final balance settlement...");
        window.location.href = url;
      } else {
        toast.success("Final payment initialized.");
      }
    },
    onError: (err: any) => {
      const msg = err?.message || "Failed to initiate final online payment.";
      if (msg.includes("SSLCommerz") || msg.includes("Could not initiate")) {
        toast.error(
          "Could not initiate SSLCommerz session. Please make sure your contact phone and city are set in My Profile, or try again.",
          { duration: 7000 }
        );
      } else {
        toast.error(msg);
      }
    },
  });

  // Review Mutation
  const reviewMutation = useMutation({
    mutationFn: (data: { bookingId: number | string; serviceId: number | string; rating: string; review: string }) =>
      reviewsService.create({
        booking_id: data.bookingId,
        service_id: data.serviceId,
        rating: data.rating,
        review: data.review,
      }),
    onSuccess: () => {
      toast.success("Thank you! Review and rating submitted.");
      setReviewDialogOpen(false);
      setReviewComment("");
    },
    onError: (err: any) => {
      toast.error(err?.message || "Failed to submit review.");
    },
  });

  const handleOpenUpdate = (b: Booking) => {
    setSelectedBooking(b);
    setEditDate(b.booking_date || "");
    setEditTime(b.booking_time || "");
    setEditNote(b.note || "");
    setUpdateDialogOpen(true);
  };

  const handleOpenCancel = (b: Booking) => {
    setSelectedBooking(b);
    setCancelReason("");
    setCancelDialogOpen(true);
  };

  const handleOpenReview = (b: Booking) => {
    setSelectedBooking(b);
    setReviewRating("5");
    setReviewComment("");
    setReviewDialogOpen(true);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">My Bookings</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Manage your service reservations, payments, cancellations, and ratings
          </p>
        </div>

        <Button asChild className="gap-2 shadow font-semibold">
          <Link href="/services">Book Another Service</Link>
        </Button>
      </div>

      {/* Filter Tabs */}
      <div className="flex flex-wrap gap-2 border-b border-border pb-3">
        {[
          { key: "ALL", label: "All Bookings" },
          { key: "PENDING", label: "Pending" },
          { key: "ACCEPTED", label: "Accepted" },
          { key: "COMPLETED", label: "Completed" },
          { key: "CANCELLED", label: "Cancelled" },
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

      {/* Bookings List */}
      {isLoading ? (
        <div className="space-y-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-32 rounded-xl" />
          ))}
        </div>
      ) : filteredBookings.length === 0 ? (
        <Card className="p-12 text-center max-w-lg mx-auto">
          <Calendar className="mx-auto h-12 w-12 text-muted-foreground/40 mb-3" />
          <h3 className="font-semibold text-base">No bookings found in this status</h3>
          <p className="text-sm text-muted-foreground mt-1 mb-4">
            You don&apos;t have any {activeTab.toLowerCase()} bookings.
          </p>
          <Button variant="outline" onClick={() => setActiveTab("ALL")}>
            View All Bookings
          </Button>
        </Card>
      ) : (
        <div className="space-y-4">
          {filteredBookings.map((b) => {
            const rawStatus = String(b.status || "").toLowerCase();
            const isAccepted = rawStatus === "accepted";
            const isPending = rawStatus === "pending";
            const isCompleted = rawStatus === "completed";
            const isCancelled = rawStatus === "cancelled";
            const isRejected = rawStatus === "rejected";

            const method = String(b.final_payment_method || "").toLowerCase();
            const isOnline = method === "online";

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

            const hasPaidFinal =
              b.is_paid === true ||
              b.payment_status === "paid" ||
              b.is_final_paid === true ||
              (remAmt <= 0 && paidAmt > 0);

            return (
              <Card key={b.id} className="border-border/80 shadow-sm overflow-hidden">
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
                      {hasPaidFinal ? (
                        <Badge variant="success" className="text-[10px]">
                          Fully Paid
                        </Badge>
                      ) : hasPaidAdvance ? (
                        <Badge variant="success" className="text-[10px]">
                          20% Advance Paid
                        </Badge>
                      ) : null}
                    </div>

                    <span className="text-xs text-muted-foreground">Booking Ref #{b.id}</span>
                  </div>
                </CardHeader>

                <CardContent className="p-5 space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                    <div>
                      <p className="text-xs text-muted-foreground">Appointment Date & Time</p>
                      <p className="font-semibold mt-0.5 flex items-center gap-1.5">
                        <Calendar className="h-4 w-4 text-primary" />
                        {b.booking_date} at {b.booking_time}
                      </p>
                    </div>

                    <div>
                      <p className="text-xs text-muted-foreground">Final Settlement Mode</p>
                      <p className="font-semibold mt-0.5 flex items-center gap-1.5">
                        {isOnline ? (
                          <CreditCard className="h-4 w-4 text-blue-500" />
                        ) : (
                          <Banknote className="h-4 w-4 text-emerald-500" />
                        )}
                        <span className="capitalize">{method || "Cash"}</span>
                      </p>
                    </div>

                    {advAmt > 0 && (
                      <div>
                        <p className="text-xs text-muted-foreground">20% Advance Amount</p>
                        <p className="font-semibold mt-0.5 text-primary">
                          {formatCurrency(advAmt)}
                          {hasPaidAdvance && (
                            <Badge variant="success" className="ml-2 text-[10px]">
                              Paid
                            </Badge>
                          )}
                        </p>
                      </div>
                    )}

                    {totalPrice > 0 && (
                      <div>
                        <p className="text-xs text-muted-foreground">Total Service Amount</p>
                        <p className="font-semibold mt-0.5 text-foreground">
                          {formatCurrency(totalPrice)}
                        </p>
                      </div>
                    )}
                  </div>

                  {b.note && (
                    <div className="p-3 rounded-lg bg-muted/40 text-xs text-muted-foreground border border-border/50">
                      <strong className="text-foreground">Special Note:</strong> {b.note}
                    </div>
                  )}

                  {b.cancellation_reason && (
                    <div className="p-3 rounded-lg bg-destructive/10 text-xs text-destructive border border-destructive/20">
                      <strong>Cancellation Reason:</strong> {b.cancellation_reason}
                    </div>
                  )}

                  {/* Informative banners for booking flow progression */}
                  {isPending && (
                    <div className="p-3 rounded-lg bg-amber-500/10 text-xs text-amber-800 dark:text-amber-300 border border-amber-500/20 flex items-center gap-2">
                      <Clock className="h-4 w-4 shrink-0 text-amber-600 dark:text-amber-400" />
                      <span>
                        Awaiting provider acceptance. Once the provider accepts your request, the 20% advance payment option will become available.
                      </span>
                    </div>
                  )}

                  {isAccepted && !hasPaidAdvance && (
                    <div className="p-3 rounded-lg bg-blue-500/10 text-xs text-blue-800 dark:text-blue-300 border border-blue-500/20 flex items-center gap-2">
                      <CreditCard className="h-4 w-4 shrink-0 text-blue-600 dark:text-blue-400" />
                      <span>
                        Booking accepted! Please pay the 20% advance deposit ({formatCurrency(advAmt)}) to confirm the technician&apos;s schedule.
                      </span>
                    </div>
                  )}

                  {/* Action buttons */}
                  <div className="flex flex-wrap items-center justify-end gap-2 pt-2 border-t border-border/50">
                    {/* Pay 20% advance */}
                    {isAccepted && !hasPaidAdvance && (
                      <PaymentCheckoutModal booking={b} type="advance">
                        <Button
                          size="sm"
                          className="gap-1.5 font-semibold bg-orange-600 hover:bg-orange-700 text-white shadow-sm"
                        >
                          <CreditCard className="h-4 w-4" />
                          <span>Pay 20% Advance ({formatCurrency(advAmt)})</span>
                        </Button>
                      </PaymentCheckoutModal>
                    )}

                    {/* Pay final balance online if completed & method is online */}
                    {isCompleted && isOnline && !hasPaidFinal && (
                      <PaymentCheckoutModal booking={b} type="final">
                        <Button
                          size="sm"
                          className="gap-1.5 font-semibold bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm"
                        >
                          <CreditCard className="h-4 w-4" />
                          <span>Pay Final Balance ({formatCurrency(remAmt > 0 ? remAmt : totalPrice)})</span>
                        </Button>
                      </PaymentCheckoutModal>
                    )}

                    {/* Leave Review if completed */}
                    {isCompleted && (
                      <Button
                        variant="outline"
                        size="sm"
                        className="gap-1.5"
                        onClick={() => handleOpenReview(b)}
                      >
                        <Star className="h-4 w-4 text-amber-500" />
                        Review Service
                      </Button>
                    )}

                    {/* Pending actions: update / reschedule & cancel */}
                    {isPending && (
                      <>
                        <Button
                          variant="outline"
                          size="sm"
                          className="gap-1.5"
                          onClick={() => handleOpenUpdate(b)}
                        >
                          <Edit className="h-4 w-4" />
                          Reschedule
                        </Button>

                        <Button
                          variant="ghost"
                          size="sm"
                          className="gap-1.5 text-destructive hover:bg-destructive/10"
                          onClick={() => handleOpenCancel(b)}
                        >
                          <Trash2 className="h-4 w-4" />
                          Cancel
                        </Button>
                      </>
                    )}
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      {/* Reschedule / Update Dialog */}
      <Dialog open={updateDialogOpen} onOpenChange={setUpdateDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Reschedule Booking</DialogTitle>
            <DialogDescription>
              Update your preferred date, time, or instructions for this appointment.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-2">
            <FormInput
              label="New Appointment Date"
              type="date"
              required
              value={editDate}
              onChange={(e) => setEditDate(e.target.value)}
              min={new Date().toISOString().split("T")[0]}
            />

            <FormInput
              label="New Preferred Time"
              type="time"
              required
              value={editTime}
              onChange={(e) => setEditTime(e.target.value)}
            />

            <FormTextarea
              label="Updated Note (Optional)"
              value={editNote}
              onChange={(e) => setEditNote(e.target.value)}
              rows={3}
            />
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setUpdateDialogOpen(false)}
              disabled={updateMutation.isPending}
            >
              Cancel
            </Button>
            <Button
              disabled={updateMutation.isPending || !editDate || !editTime}
              onClick={() => {
                if (selectedBooking) {
                  updateMutation.mutate({
                    id: selectedBooking.id,
                    date: editDate,
                    time: editTime,
                    note: editNote,
                  });
                }
              }}
            >
              {updateMutation.isPending ? "Saving..." : "Save Changes"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Cancel Dialog */}
      <Dialog open={cancelDialogOpen} onOpenChange={setCancelDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="text-destructive">Cancel Booking</DialogTitle>
            <DialogDescription>
              Please let us know why you are cancelling this service reservation.
            </DialogDescription>
          </DialogHeader>

          <div className="py-2">
            <FormTextarea
              label="Reason for cancellation"
              required
              placeholder="e.g. Schedule conflict, plans changed, or booked in error."
              value={cancelReason}
              onChange={(e) => setCancelReason(e.target.value)}
              rows={3}
            />
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setCancelDialogOpen(false)}
              disabled={cancelMutation.isPending}
            >
              Keep Booking
            </Button>
            <Button
              variant="destructive"
              disabled={cancelMutation.isPending || !cancelReason.trim()}
              onClick={() => {
                if (selectedBooking) {
                  cancelMutation.mutate({
                    id: selectedBooking.id,
                    reason: cancelReason,
                  });
                }
              }}
            >
              {cancelMutation.isPending ? "Cancelling..." : "Confirm Cancellation"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Review Dialog */}
      <Dialog open={reviewDialogOpen} onOpenChange={setReviewDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Star className="h-5 w-5 text-amber-500 fill-amber-500" />
              Rate & Review Service
            </DialogTitle>
            <DialogDescription>
              Share your feedback regarding the completed service and technician.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-2">
            <div>
              <label className="text-sm font-medium mb-1.5 block">Rating Score (1 to 5)</label>
              <div className="flex gap-2">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    onClick={() => setReviewRating(String(star))}
                    className={`flex items-center justify-center h-10 w-10 rounded-lg border text-sm font-bold transition-all ${
                      Number(reviewRating) >= star
                        ? "bg-amber-500/15 border-amber-500 text-amber-600 dark:text-amber-400"
                        : "border-input text-muted-foreground hover:bg-accent"
                    }`}
                  >
                    ★ {star}
                  </button>
                ))}
              </div>
            </div>

            <FormTextarea
              label="Your Review Feedback"
              required
              placeholder="How was the service quality, timeliness, and technician behavior?"
              value={reviewComment}
              onChange={(e) => setReviewComment(e.target.value)}
              rows={4}
            />
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setReviewDialogOpen(false)}
              disabled={reviewMutation.isPending}
            >
              Cancel
            </Button>
            <Button
              disabled={reviewMutation.isPending || !reviewComment.trim()}
              onClick={() => {
                if (selectedBooking) {
                  const rawService = selectedBooking.service;
                  const serviceId =
                    (typeof rawService === "object" ? (rawService as any)?.id : rawService) ||
                    selectedBooking.service_details?.id ||
                    (selectedBooking as any).service_id;

                  reviewMutation.mutate({
                    bookingId: selectedBooking.id,
                    serviceId: String(serviceId),
                    rating: reviewRating,
                    review: reviewComment,
                  });
                }
              }}
            >
              {reviewMutation.isPending ? "Submitting..." : "Submit Review"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

