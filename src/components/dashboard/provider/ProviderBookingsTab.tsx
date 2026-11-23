"use client";

import * as React from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import {
  Clock,
  CheckCircle2,
  AlertCircle,
  Search,
  Filter,
  Check,
  X,
  Loader2,
  CalendarDays,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import { ProJobCard } from "@/components/dashboard/provider/ProJobCard";
import { dashboardService } from "@/features/dashboard/services/dashboard.service";
import { bookingsService } from "@/features/bookings/services/bookings.service";
import { paymentsService } from "@/features/payments/services/payments.service";
import type { Booking } from "@/types/api";

export function ProviderBookingsTab() {
  const queryClient = useQueryClient();
  const [subTab, setSubTab] = React.useState<"pending" | "accepted" | "all">("pending");
  const [searchQuery, setSearchQuery] = React.useState("");

  // Reject confirmation dialog
  const [rejectDialogBooking, setRejectDialogBooking] = React.useState<Booking | null>(null);

  // Queries
  const { data: pendingBookings = [], isLoading: pendingLoading } = useQuery({
    queryKey: ["dashboard", "provider", "pending_bookings"],
    queryFn: () => dashboardService.getProviderPendingBookings(),
  });

  const { data: acceptedBookings = [], isLoading: acceptedLoading } = useQuery({
    queryKey: ["dashboard", "provider", "accepted_bookings"],
    queryFn: () => dashboardService.getProviderAcceptedBookings(),
  });

  const { data: allBookings = [], isLoading: allLoading } = useQuery({
    queryKey: ["bookings", "provider_all"],
    queryFn: () => bookingsService.getProviderBookings(),
  });

  // Action Mutations
  const acceptMutation = useMutation({
    mutationFn: (id: string | number) => dashboardService.acceptBooking(id),
    onSuccess: () => {
      toast.success("Job request accepted! Customer has been notified to pay the 20% advance.");
      queryClient.invalidateQueries({ queryKey: ["dashboard", "provider"] });
      queryClient.invalidateQueries({ queryKey: ["bookings", "provider_all"] });
    },
    onError: (err: any) => {
      toast.error(err?.message || "Failed to accept booking.");
    },
  });

  const rejectMutation = useMutation({
    mutationFn: (id: string | number) => dashboardService.rejectBooking(id),
    onSuccess: () => {
      toast.info("Job request rejected.");
      setRejectDialogBooking(null);
      queryClient.invalidateQueries({ queryKey: ["dashboard", "provider"] });
      queryClient.invalidateQueries({ queryKey: ["bookings", "provider_all"] });
    },
    onError: (err: any) => {
      toast.error(err?.message || "Failed to reject booking.");
    },
  });

  const completeMutation = useMutation({
    mutationFn: (id: string | number) => dashboardService.completeBooking(id),
    onSuccess: () => {
      toast.success("Job marked as completed! Customer can now settle the remaining balance.");
      queryClient.invalidateQueries({ queryKey: ["dashboard", "provider"] });
      queryClient.invalidateQueries({ queryKey: ["bookings", "provider_all"] });
    },
    onError: (err: any) => {
      toast.error(err?.message || "Cannot complete job before scheduled time.");
    },
  });

  const confirmCashMutation = useMutation({
    mutationFn: (id: string | number) => paymentsService.confirmCash(id),
    onSuccess: (data) => {
      toast.success(data?.message || "Cash payment confirmed! Job is now fully settled.");
      queryClient.invalidateQueries({ queryKey: ["dashboard", "provider"] });
      queryClient.invalidateQueries({ queryKey: ["bookings", "provider_all"] });
    },
    onError: (err: any) => {
      toast.error(err?.message || "Failed to confirm cash payment.");
    },
  });

  // Choose list based on subTab
  const currentList = React.useMemo(() => {
    let list: Booking[] = [];
    if (subTab === "pending") list = pendingBookings;
    else if (subTab === "accepted") list = acceptedBookings;
    else list = allBookings;

    if (!searchQuery.trim()) return list;

    const q = searchQuery.toLowerCase();
    return list.filter((b) => {
      const sName = (
        typeof b.service === "object" && b.service
          ? (b.service as any).name || (b.service as any).title
          : b.service_name || b.service_title || ""
      ).toLowerCase();
      const cName = (
        typeof b.customer === "object" && b.customer
          ? (b.customer as any).full_name || (b.customer as any).username
          : b.customer_name || ""
      ).toLowerCase();
      const bId = String(b.id || "").toLowerCase();

      return sName.includes(q) || cName.includes(q) || bId.includes(q);
    });
  }, [subTab, pendingBookings, acceptedBookings, allBookings, searchQuery]);

  const isLoading =
    (subTab === "pending" && pendingLoading) ||
    (subTab === "accepted" && acceptedLoading) ||
    (subTab === "all" && allLoading);

  const isActionLoading =
    acceptMutation.isPending ||
    rejectMutation.isPending ||
    completeMutation.isPending ||
    confirmCashMutation.isPending;

  return (
    <div className="space-y-6">
      {/* Sub-Filter Bar */}
      <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4 bg-white p-4 rounded-2xl border border-stone-200 shadow-sm">
        <Tabs
          value={subTab}
          onValueChange={(val) => setSubTab(val as "pending" | "accepted" | "all")}
          className="w-full md:w-auto"
        >
          <TabsList className="bg-stone-100 p-1 rounded-xl flex-wrap h-auto gap-1">
            <TabsTrigger
              value="pending"
              className="rounded-lg text-xs font-semibold px-3 py-1.5 data-[state=active]:bg-white data-[state=active]:text-amber-800 data-[state=active]:shadow-sm"
            >
              Pending Requests ({pendingBookings.length})
            </TabsTrigger>
            <TabsTrigger
              value="accepted"
              className="rounded-lg text-xs font-semibold px-3 py-1.5 data-[state=active]:bg-white data-[state=active]:text-teal-900 data-[state=active]:shadow-sm"
            >
              Accepted & Active ({acceptedBookings.length})
            </TabsTrigger>
            <TabsTrigger
              value="all"
              className="rounded-lg text-xs font-semibold px-3 py-1.5 data-[state=active]:bg-white data-[state=active]:text-stone-900 data-[state=active]:shadow-sm"
            >
              All Jobs ({allBookings.length})
            </TabsTrigger>
          </TabsList>
        </Tabs>

        {/* Search */}
        <div className="relative min-w-[240px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-stone-400" />
          <input
            type="text"
            placeholder="Search service, customer, #ID..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 text-xs rounded-xl border border-stone-200 bg-stone-50/50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-teal-700/20 focus:border-teal-700 text-stone-800 placeholder:text-stone-400"
          />
        </div>
      </div>

      {/* Bookings Feed */}
      {isLoading ? (
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="p-6 bg-white rounded-2xl border border-stone-200 space-y-4">
              <div className="flex justify-between items-center">
                <Skeleton className="h-6 w-48 rounded" />
                <Skeleton className="h-6 w-24 rounded-full" />
              </div>
              <Skeleton className="h-12 w-full rounded-xl" />
              <Skeleton className="h-8 w-1/3 rounded" />
            </div>
          ))}
        </div>
      ) : currentList.length === 0 ? (
        <div className="text-center py-16 px-4 bg-white rounded-3xl border border-dashed border-stone-300">
          <div className="h-14 w-14 rounded-2xl bg-stone-100 flex items-center justify-center mx-auto text-stone-400 mb-4">
            <Filter className="h-7 w-7 text-stone-400" />
          </div>
          <h3 className="text-lg font-bold text-stone-900 mb-1">No jobs in this view</h3>
          <p className="text-sm text-stone-500 max-w-sm mx-auto">
            {searchQuery
              ? "No job orders match your search keyword."
              : subTab === "pending"
              ? "You're all caught up! No pending service requests awaiting your review."
              : subTab === "accepted"
              ? "No active jobs currently in progress."
              : "No booking history recorded yet."}
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {currentList.map((booking) => (
            <ProJobCard
              key={booking.id}
              booking={booking}
              onAccept={(b) => acceptMutation.mutate(b.id)}
              onReject={(b) => setRejectDialogBooking(b)}
              onComplete={(b) => completeMutation.mutate(b.id)}
              onConfirmCash={(b) => confirmCashMutation.mutate(b.id)}
              isActionLoading={isActionLoading}
            />
          ))}
        </div>
      )}

      {/* Reject Confirmation Dialog */}
      <Dialog
        open={!!rejectDialogBooking}
        onOpenChange={(open) => !open && setRejectDialogBooking(null)}
      >
        <DialogContent className="sm:max-w-md rounded-2xl border-stone-200">
          <DialogHeader>
            <DialogTitle className="text-stone-900 flex items-center gap-2">
              <AlertCircle className="h-5 w-5 text-rose-600" />
              Reject Job Request?
            </DialogTitle>
            <DialogDescription className="text-xs text-stone-600">
              Are you sure you want to decline this booking request? The customer will be informed that you are unavailable.
            </DialogDescription>
          </DialogHeader>

          <div className="p-3 bg-stone-50 rounded-xl border border-stone-200 text-xs space-y-1">
            <p>
              <strong>Service:</strong>{" "}
              {rejectDialogBooking?.service_name || rejectDialogBooking?.service_title || "Service"}
            </p>
            <p>
              <strong>Date:</strong> {rejectDialogBooking?.booking_date} at{" "}
              {rejectDialogBooking?.booking_time?.slice(0, 5)}
            </p>
          </div>

          <DialogFooter className="flex gap-2 sm:justify-end">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setRejectDialogBooking(null)}
              disabled={rejectMutation.isPending}
              className="rounded-xl text-xs"
            >
              Cancel
            </Button>
            <Button
              size="sm"
              onClick={() => rejectDialogBooking && rejectMutation.mutate(rejectDialogBooking.id)}
              disabled={rejectMutation.isPending}
              className="bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-semibold"
            >
              {rejectMutation.isPending ? (
                <>
                  <Loader2 className="h-3.5 w-3.5 mr-1.5 animate-spin" />
                  Rejecting...
                </>
              ) : (
                "Confirm Reject"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
