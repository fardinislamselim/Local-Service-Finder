"use client";

import * as React from "react";
import Link from "next/link";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import {
  CheckCircle2,
  Search,
  RefreshCw,
  AlertCircle,
  Loader2,
  CalendarDays,
  Briefcase,
  Info,
} from "lucide-react";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { ProJobCard } from "@/components/dashboard/provider/ProJobCard";
import { ConfirmCashModal } from "@/components/payments/ConfirmCashModal";
import { dashboardService } from "@/features/dashboard/services/dashboard.service";
import { paymentsService } from "@/features/payments/services/payments.service";
import { servicesService } from "@/features/services/services/services.service";
import type { Booking, Service } from "@/types/api";

export default function ProviderActiveBookingsPage() {
  const queryClient = useQueryClient();
  const [searchQuery, setSearchQuery] = React.useState("");
  const [confirmCashDialogBooking, setConfirmCashDialogBooking] = React.useState<Booking | null>(null);

  // Per-item action tracker
  const [actionInProgress, setActionInProgress] = React.useState<{
    id: string;
    type: "accept" | "reject" | "complete" | "cash";
  } | null>(null);

  // 1. Fetch Accepted & Active Bookings: GET /api/v1/dashboard/service_provider/get_accept_booking/
  const {
    data: acceptedBookings = [],
    isLoading: activeLoading,
    refetch,
    isRefetching,
  } = useQuery({
    queryKey: ["dashboard", "provider", "accepted_bookings"],
    queryFn: () => dashboardService.getProviderAcceptedBookings(),
  });

  // 2. Resolve Service UUID -> Name
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

  const serviceMap = React.useMemo(() => {
    const map: Record<string, Service> = {};
    for (const s of providerServices) {
      if (s?.id) {
        map[String(s.id)] = s;
      }
    }
    return map;
  }, [providerServices]);

  // Complete Mutation
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

  // Confirm Cash Payment Mutation
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

  // Filtered List
  const filteredBookings = React.useMemo(() => {
    if (!searchQuery.trim()) return acceptedBookings;
    const q = searchQuery.toLowerCase();

    return acceptedBookings.filter((b) => {
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
  }, [acceptedBookings, searchQuery, serviceMap]);

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
              <span className="text-stone-800 dark:text-stone-200 font-medium">Active Bookings</span>
            </div>
            <div className="flex items-center gap-2.5">
              <h1 className="text-xl sm:text-2xl font-semibold text-stone-900 dark:text-stone-100 tracking-tight">
                Active & in-progress jobs
              </h1>
              <span className="text-xs px-2.5 py-0.5 rounded-full font-medium bg-teal-50 text-teal-900 border border-teal-200 dark:bg-teal-950/40 dark:text-teal-200 dark:border-teal-800">
                {acceptedBookings.length} active
              </span>
            </div>
            <p className="text-xs text-stone-500 dark:text-stone-400 mt-1">
              Accepted assignments. You can mark a job completed once the scheduled date/time arrives, then confirm cash payments if chosen.
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

        {/* Scheduled-Time Guard Explainer Note */}
        <div className="p-3.5 rounded-xl bg-stone-50 dark:bg-stone-800/50 border border-stone-200 dark:border-stone-700/80 flex items-start gap-3 text-xs text-stone-600 dark:text-stone-300">
          <Info className="h-4 w-4 text-teal-800 shrink-0 mt-0.5" />
          <div className="space-y-0.5">
            <p className="font-semibold text-stone-900 dark:text-stone-100">
              Scheduled-Time Guard Invariant
            </p>
            <p className="text-stone-500 dark:text-stone-400 text-[11px] leading-relaxed">
              To guarantee service authenticity for customers, the <strong>"Mark job completed"</strong> button unlocks automatically once the scheduled appointment time (<code>booking_date + booking_time</code>) has been reached.
            </p>
          </div>
        </div>

        {/* Search Bar */}
        <div className="bg-white dark:bg-stone-900 rounded-2xl border border-stone-200 dark:border-stone-800 p-4 shadow-sm">
          <div className="relative max-w-md">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-stone-400 pointer-events-none" />
            <input
              type="text"
              placeholder="Search by customer, area, or note..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-3 py-2 text-xs rounded-xl border border-stone-200 dark:border-stone-800 bg-stone-50/50 dark:bg-stone-900 focus:bg-white dark:focus:bg-stone-800 focus:outline-none focus:ring-2 focus:ring-[#115E59]/20 focus:border-[#115E59] text-stone-800 dark:text-stone-200 placeholder:text-stone-400 transition-all"
            />
          </div>
        </div>

        {/* Active Jobs Feed */}
        {activeLoading ? (
          <div className="space-y-4">
            {[1, 2].map((i) => (
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
            <div className="h-14 w-14 rounded-2xl bg-teal-50 dark:bg-teal-950/40 flex items-center justify-center mx-auto text-teal-800 mb-4">
              <Briefcase className="h-7 w-7 text-teal-800" />
            </div>
            <h3 className="mb-1 text-sm font-semibold text-stone-900 dark:text-stone-100">
              No active bookings
            </h3>
            <p className="mx-auto max-w-sm text-xs text-stone-500 dark:text-stone-400">
              {searchQuery
                ? `No active jobs matching "${searchQuery}".`
                : "You have no accepted jobs in progress right now. Accept pending requests to schedule work."}
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
                  onAccept={() => {}}
                  onReject={() => {}}
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
