"use client";

import * as React from "react";
import Link from "next/link";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import {
  Calendar,
  Search,
  Filter,
  RefreshCw,
  Layers,
  Clock,
  CheckCircle2,
  AlertCircle,
  Phone,
  User,
  ExternalLink,
  ChevronRight,
  ShieldCheck,
  Banknote,
  CreditCard,
  MapPin,
  FileText,
  DollarSign,
  Loader2,
  CalendarDays,
} from "lucide-react";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { ProJobCard } from "@/components/dashboard/provider/ProJobCard";
import { ConfirmCashModal } from "@/components/payments/ConfirmCashModal";
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
import { servicesService } from "@/features/services/services/services.service";
import type { Booking, Service } from "@/types/api";

type StatusFilter = "all" | "pending" | "accepted" | "completed" | "cancelled" | "rejected";

export default function ProviderAllBookingsPage() {
  const queryClient = useQueryClient();
  const [statusFilter, setStatusFilter] = React.useState<StatusFilter>("all");
  const [searchQuery, setSearchQuery] = React.useState("");

  // Reject dialog
  const [rejectDialogBooking, setRejectDialogBooking] = React.useState<Booking | null>(null);
  // Cash confirmation dialog
  const [confirmCashDialogBooking, setConfirmCashDialogBooking] = React.useState<Booking | null>(null);

  // Per-item processing state tracker
  const [actionInProgress, setActionInProgress] = React.useState<{
    id: string;
    type: "accept" | "reject" | "complete" | "cash";
  } | null>(null);

  // 1. Fetch All Bookings: GET /api/v1/booking/get_all_booking/
  const {
    data: allBookings = [],
    isLoading: bookingsLoading,
    refetch,
    isRefetching,
  } = useQuery({
    queryKey: ["bookings", "provider_all"],
    queryFn: () => bookingsService.getProviderBookings(),
  });

  // 2. Fetch Services to map UUID -> Name (GET /api/v1/service/services/ with fallback /service/all_service/)
  const { data: providerServices = [], isLoading: servicesLoading } = useQuery({
    queryKey: ["services", "provider_catalog_lookup"],
    queryFn: async () => {
      try {
        const ownServices = await servicesService.getProviderServices();
        if (ownServices && ownServices.length > 0) return ownServices;
      } catch {
        // fallback
      }
      return servicesService.getAll();
    },
    staleTime: 1000 * 60 * 5,
  });

  // Build service map
  const serviceMap = React.useMemo(() => {
    const map: Record<string, Service> = {};
    for (const s of providerServices) {
      if (s?.id) {
        map[String(s.id)] = s;
      }
    }
    return map;
  }, [providerServices]);

  // Mutations
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
    onSettled: () => setActionInProgress(null),
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
    onSettled: () => setActionInProgress(null),
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
    onSettled: () => setActionInProgress(null),
  });

  const confirmCashMutation = useMutation({
    mutationFn: (id: string | number) => paymentsService.confirmCashPayment(id),
    onSuccess: (data) => {
      toast.success(data?.message || "Cash payment confirmed! Job is now fully settled.");
      queryClient.invalidateQueries({ queryKey: ["dashboard", "provider"] });
      queryClient.invalidateQueries({ queryKey: ["bookings", "provider_all"] });
    },
    onError: (err: any) => {
      toast.error(err?.message || "Failed to confirm cash payment.");
    },
    onSettled: () => setActionInProgress(null),
  });

  // Action handlers
  const handleAccept = (booking: Booking) => {
    setActionInProgress({ id: String(booking.id), type: "accept" });
    acceptMutation.mutate(booking.id);
  };

  const handleRejectClick = (booking: Booking) => {
    setRejectDialogBooking(booking);
  };

  const handleConfirmReject = () => {
    if (!rejectDialogBooking) return;
    setActionInProgress({ id: String(rejectDialogBooking.id), type: "reject" });
    rejectMutation.mutate(rejectDialogBooking.id);
  };

  const handleComplete = (booking: Booking) => {
    setActionInProgress({ id: String(booking.id), type: "complete" });
    completeMutation.mutate(booking.id);
  };

  const handleConfirmCashClick = (booking: Booking) => {
    setConfirmCashDialogBooking(booking);
  };

  const handleConfirmCashSubmit = (bookingId: string | number) => {
    setActionInProgress({ id: String(bookingId), type: "cash" });
    confirmCashMutation.mutate(bookingId);
  };

  // Filter & Search
  const filteredBookings = React.useMemo(() => {
    return allBookings.filter((b) => {
      const bStatus = String(b.status || "").toLowerCase();
      if (statusFilter !== "all" && bStatus !== statusFilter) {
        return false;
      }

      if (!searchQuery.trim()) return true;
      const q = searchQuery.toLowerCase();

      const sId = typeof b.service === "object" ? String((b.service as any)?.id || "") : String(b.service || "");
      const resolved = serviceMap[sId];
      const sName = (
        resolved?.name ||
        (typeof b.service === "object" && b.service
          ? (b.service as any).name || (b.service as any).title
          : b.service_name || b.service_title || "")
      ).toLowerCase();

      const cName = (
        typeof b.customer === "object" && b.customer
          ? (b.customer as any).full_name || (b.customer as any).username
          : b.customer_name || ""
      ).toLowerCase();

      const bNote = (b.note || "").toLowerCase();
      const bArea = ((b as any).area || "").toLowerCase();
      const bId = String(b.id || "").toLowerCase();

      return sName.includes(q) || cName.includes(q) || bNote.includes(q) || bArea.includes(q) || bId.includes(q);
    });
  }, [allBookings, statusFilter, searchQuery, serviceMap]);

  // Counts for pills
  const counts = React.useMemo(() => {
    const c = { all: allBookings.length, pending: 0, accepted: 0, completed: 0, cancelled: 0, rejected: 0 };
    for (const b of allBookings) {
      const s = String(b.status || "").toLowerCase() as keyof typeof c;
      if (c[s] !== undefined) {
        c[s]++;
      }
    }
    return c;
  }, [allBookings]);

  return (
    <ProtectedRoute allowedRoles={["SERVICE_PROVIDER"]}>
      <div className="space-y-6">
        {/* Breadcrumb & Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-stone-200 dark:border-stone-800">
          <div>
            <div className="flex items-center gap-2 text-xs text-stone-500 mb-1">
              <Link href="/dashboard/provider" className="hover:text-teal-800 transition-colors">
                Dashboard
              </Link>
              <span>/</span>
              <span className="text-stone-800 dark:text-stone-200 font-medium">All Bookings</span>
            </div>
            <h1 className="text-xl sm:text-2xl font-semibold text-stone-900 dark:text-stone-100 tracking-tight">
              All booking orders
            </h1>
            <p className="text-xs text-stone-500 dark:text-stone-400 mt-1">
              Complete history of service requests, ongoing assignments, and fulfilled work.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => refetch()}
              disabled={isRefetching}
              className="h-9 px-3 text-xs border-stone-200 dark:border-stone-800 gap-1.5 rounded-xl font-medium"
            >
              <RefreshCw className={`h-3.5 w-3.5 ${isRefetching ? "animate-spin" : ""}`} />
              <span>Refresh</span>
            </Button>
          </div>
        </div>

        {/* Filter Pills & Search */}
        <div className="bg-white dark:bg-stone-900 rounded-2xl border border-stone-200 dark:border-stone-800 p-4 shadow-sm space-y-4">
          <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
            {/* Status Pills */}
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 md:pb-0 no-scrollbar">
              {(
                [
                  { key: "all", label: "All", count: counts.all },
                  { key: "pending", label: "Pending", count: counts.pending },
                  { key: "accepted", label: "Accepted", count: counts.accepted },
                  { key: "completed", label: "Completed", count: counts.completed },
                  { key: "cancelled", label: "Cancelled", count: counts.cancelled },
                  { key: "rejected", label: "Rejected", count: counts.rejected },
                ] as const
              ).map(({ key, label, count }) => {
                const isActive = statusFilter === key;
                return (
                  <button
                    key={key}
                    type="button"
                    onClick={() => setStatusFilter(key)}
                    className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium transition-all shrink-0 ${
                      isActive
                        ? "bg-[#115E59] text-white shadow-sm font-semibold"
                        : "bg-stone-100 dark:bg-stone-800 text-stone-600 dark:text-stone-300 hover:bg-stone-200 dark:hover:bg-stone-700"
                    }`}
                  >
                    <span>{label}</span>
                    <span
                      className={`text-[10px] px-1.5 py-0.2 rounded-full tabular-nums ${
                        isActive
                          ? "bg-white/20 text-white"
                          : "bg-stone-200 dark:bg-stone-700 text-stone-600 dark:text-stone-300"
                      }`}
                    >
                      {count}
                    </span>
                  </button>
                );
              })}
            </div>

            {/* Search Input with proper pl-10 icon padding */}
            <div className="relative w-full md:w-72 shrink-0">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-stone-400 pointer-events-none" />
              <input
                type="text"
                placeholder="Search service, area, or note..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-3 py-2 text-xs rounded-xl border border-stone-200 dark:border-stone-800 bg-stone-50/50 dark:bg-stone-900 focus:bg-white dark:focus:bg-stone-800 focus:outline-none focus:ring-2 focus:ring-[#115E59]/20 focus:border-[#115E59] text-stone-800 dark:text-stone-200 placeholder:text-stone-400 transition-all"
              />
            </div>
          </div>
        </div>

        {/* Bookings List */}
        {bookingsLoading ? (
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="p-6 bg-white dark:bg-stone-900 rounded-xl border border-stone-200 dark:border-stone-800 space-y-4"
              >
                <div className="flex justify-between items-center">
                  <Skeleton className="h-6 w-48 rounded" />
                  <Skeleton className="h-6 w-24 rounded-full" />
                </div>
                <Skeleton className="h-12 w-full rounded-xl" />
                <Skeleton className="h-8 w-1/3 rounded" />
              </div>
            ))}
          </div>
        ) : filteredBookings.length === 0 ? (
          <div className="text-center py-16 px-4 bg-white dark:bg-stone-900 rounded-2xl border border-dashed border-stone-300 dark:border-stone-800">
            <div className="h-14 w-14 rounded-2xl bg-stone-100 dark:bg-stone-800 flex items-center justify-center mx-auto text-stone-400 mb-4">
              <CalendarDays className="h-7 w-7 text-stone-400" />
            </div>
            <h3 className="mb-1 text-sm font-semibold text-stone-900 dark:text-stone-100">
              No bookings found
            </h3>
            <p className="mx-auto max-w-sm text-xs text-stone-500 dark:text-stone-400">
              {searchQuery
                ? `No orders matching "${searchQuery}".`
                : statusFilter !== "all"
                ? `No orders currently in "${statusFilter}" status.`
                : "You don't have any bookings in your account yet."}
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredBookings.map((b) => {
              const serviceId =
                typeof b.service === "object" && b.service
                  ? String((b.service as any).id)
                  : String(b.service || "");
              const resolved = serviceMap[serviceId] || null;

              return (
                <ProJobCard
                  key={String(b.id)}
                  booking={b}
                  resolvedService={resolved}
                  isServicesLoading={servicesLoading}
                  onAccept={handleAccept}
                  onReject={handleRejectClick}
                  onComplete={handleComplete}
                  onConfirmCash={handleConfirmCashClick}
                  actionLoadingType={
                    actionInProgress?.id === String(b.id) ? actionInProgress.type : null
                  }
                />
              );
            })}
          </div>
        )}

        {/* Reject Confirmation Dialog */}
        <Dialog
          open={!!rejectDialogBooking}
          onOpenChange={(open) => !open && setRejectDialogBooking(null)}
        >
          <DialogContent className="sm:max-w-md p-6 bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-2xl">
            <DialogHeader className="pb-3 border-b border-stone-100 dark:border-stone-800">
              <DialogTitle className="text-base font-semibold text-stone-900 dark:text-stone-100 flex items-center gap-2">
                <AlertCircle className="h-5 w-5 text-rose-600 shrink-0" />
                <span>Decline this booking request?</span>
              </DialogTitle>
              <DialogDescription className="text-xs text-stone-500 dark:text-stone-400">
                Are you sure you want to decline booking{" "}
                <strong className="text-stone-800 dark:text-stone-200">
                  #{String(rejectDialogBooking?.id).slice(0, 8)}
                </strong>
                ? The customer will be informed immediately.
              </DialogDescription>
            </DialogHeader>

            <DialogFooter className="pt-4 flex items-center justify-end gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setRejectDialogBooking(null)}
                disabled={rejectMutation.isPending}
                className="text-xs rounded-xl"
              >
                Cancel
              </Button>
              <Button
                size="sm"
                onClick={handleConfirmReject}
                disabled={rejectMutation.isPending}
                className="bg-rose-600 hover:bg-rose-700 text-white text-xs rounded-xl font-medium"
              >
                {rejectMutation.isPending ? (
                  <>
                    <Loader2 className="h-3.5 w-3.5 mr-1.5 animate-spin" />
                    <span>Declining...</span>
                  </>
                ) : (
                  <span>Yes, decline request</span>
                )}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Confirm Cash Received Modal */}
        <ConfirmCashModal
          open={!!confirmCashDialogBooking}
          onOpenChange={(open) => !open && setConfirmCashDialogBooking(null)}
          booking={confirmCashDialogBooking}
          onSuccess={() => {
            queryClient.invalidateQueries({ queryKey: ["dashboard", "provider"] });
            queryClient.invalidateQueries({ queryKey: ["bookings", "provider_all"] });
          }}
        />
      </div>
    </ProtectedRoute>
  );
}
