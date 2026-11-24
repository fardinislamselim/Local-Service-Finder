"use client";

import * as React from "react";
import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import {
  Calendar,
  Clock,
  CheckCircle2,
  AlertCircle,
  Plus,
  RefreshCw,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import { CustomerBookingCard } from "@/components/dashboard/customer/CustomerBookingCard";
import { EditBookingModal } from "@/components/dashboard/customer/EditBookingModal";
import { CancelBookingDialog } from "@/components/dashboard/customer/CancelBookingDialog";
import { ReviewModal } from "@/components/reviews/ReviewModal";
import { bookingsService } from "@/features/bookings/services/bookings.service";
import { servicesService } from "@/features/services/services/services.service";
import type { Booking, Service } from "@/types/api";

export default function CustomerDashboardPage() {
  const [activeTab, setActiveTab] = React.useState<string>("all");

  // Dialog states
  const [selectedBookingForEdit, setSelectedBookingForEdit] = React.useState<Booking | null>(null);
  const [selectedBookingForCancel, setSelectedBookingForCancel] = React.useState<Booking | null>(null);
  const [selectedBookingForReview, setSelectedBookingForReview] = React.useState<Booking | null>(null);

  // 1. Primary Detailed Bookings Query
  const {
    data: allBookings = [],
    isLoading,
    refetch,
    isRefetching,
  } = useQuery({
    queryKey: ["my-bookings"],
    queryFn: () => bookingsService.getMyBookings(),
    staleTime: 1000 * 60 * 2,
  });

  // Services lookup
  const { data: allServices = [] } = useQuery({
    queryKey: ["services", "all_service_lookup"],
    queryFn: () => servicesService.getAll(),
    staleTime: 1000 * 60 * 5,
  });

  const serviceMap = React.useMemo(() => {
    const map: Record<string, Service> = {};
    for (const s of allServices) {
      if (s?.id) map[String(s.id)] = s;
    }
    return map;
  }, [allServices]);

  // Calculate KPI Counts
  const kpiStats = React.useMemo(() => {
    let pendingCount = 0;
    let actionNeededCount = 0;
    let completedCount = 0;

    allBookings.forEach((b) => {
      const status = b.status?.toLowerCase();
      const paid = Number(b.paid_amount || 0);

      if (status === "pending") pendingCount++;
      if (status === "accepted" && paid === 0) actionNeededCount++;
      if (status === "completed") completedCount++;
    });

    return {
      total: allBookings.length,
      pending: pendingCount,
      actionNeeded: actionNeededCount,
      completed: completedCount,
    };
  }, [allBookings]);

  // Filter Bookings by Tab
  const filteredBookings = React.useMemo(() => {
    switch (activeTab) {
      case "pending":
        return allBookings.filter((b) => b.status?.toLowerCase() === "pending");
      case "active":
        return allBookings.filter(
          (b) =>
            b.status?.toLowerCase() === "accepted" || b.status?.toLowerCase() === "in_progress"
        );
      case "completed":
        return allBookings.filter((b) => b.status?.toLowerCase() === "completed");
      case "cancelled":
        return allBookings.filter(
          (b) =>
            b.status?.toLowerCase() === "cancelled" || b.status?.toLowerCase() === "rejected"
        );
      default:
        return allBookings;
    }
  }, [allBookings, activeTab]);

  return (
    <ProtectedRoute allowedRoles={["CUSTOMER"]}>
      <div className="space-y-6">
        {/* Header Strip */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 border-b border-stone-200 dark:border-stone-800">
          <div>
            <h1 className="text-xl sm:text-2xl font-semibold text-stone-900 dark:text-stone-100 tracking-tight">
              My service bookings
            </h1>
            <p className="text-xs text-stone-500 dark:text-stone-400 mt-1">
              Track appointments, manage 20% advance deposits, and rate completed services.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => refetch()}
              disabled={isRefetching}
              className="rounded-lg h-9 text-xs font-medium border-stone-200 dark:border-stone-800 gap-1.5"
            >
              <RefreshCw className={`h-3.5 w-3.5 ${isRefetching ? "animate-spin" : ""}`} />
              <span>Refresh</span>
            </Button>

            <Button
              asChild
              size="sm"
              className="rounded-lg h-9 text-xs font-medium bg-[#EA580C] hover:bg-[#c2410c] text-white gap-1.5 shadow-xs"
            >
              <Link href="/services">
                <Plus className="h-3.5 w-3.5" />
                <span>Book a service</span>
              </Link>
            </Button>
          </div>
        </div>

        {/* 4-Column KPI Bento Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5">
          {/* 1. Total Bookings */}
          <div className="p-4 rounded-xl bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 space-y-1 shadow-xs">
            <span className="text-stone-500 dark:text-stone-400 text-xs font-medium">
              Total bookings
            </span>
            <div className="text-2xl font-semibold text-stone-900 dark:text-stone-100 tabular-nums">
              {kpiStats.total}
            </div>
            <p className="text-[11px] text-stone-400">All registered requests</p>
          </div>

          {/* 2. Pending Approval */}
          <div className="p-4 rounded-xl bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 space-y-1 shadow-xs">
            <span className="text-stone-500 dark:text-stone-400 text-xs font-medium">
              Pending confirmation
            </span>
            <div className="text-2xl font-semibold text-amber-600 dark:text-amber-400 tabular-nums">
              {kpiStats.pending}
            </div>
            <p className="text-[11px] text-stone-400">Awaiting provider acceptance</p>
          </div>

          {/* 3. Action Needed */}
          <div className="p-4 rounded-xl bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 space-y-1 shadow-xs">
            <span className="text-stone-500 dark:text-stone-400 text-xs font-medium">
              Advance deposit due
            </span>
            <div className="text-2xl font-semibold text-[#EA580C] tabular-nums">
              {kpiStats.actionNeeded}
            </div>
            <p className="text-[11px] text-stone-400">20% escrow payment required</p>
          </div>

          {/* 4. Completed Services */}
          <div className="p-4 rounded-xl bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 space-y-1 shadow-xs">
            <span className="text-stone-500 dark:text-stone-400 text-xs font-medium">
              Completed
            </span>
            <div className="text-2xl font-semibold text-emerald-600 dark:text-emerald-400 tabular-nums">
              {kpiStats.completed}
            </div>
            <p className="text-[11px] text-stone-400">Fulfillment confirmed</p>
          </div>
        </div>

        {/* Tabs & Feed */}
        <div className="space-y-4">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="bg-stone-100 dark:bg-stone-800/60 p-1 rounded-xl flex flex-wrap h-auto gap-1 border border-stone-200/60 dark:border-stone-700/60">
              <TabsTrigger
                value="all"
                className="rounded-lg text-xs font-medium px-3.5 py-1.5 data-[state=active]:bg-white dark:data-[state=active]:bg-stone-900 data-[state=active]:text-stone-900 dark:data-[state=active]:text-stone-100 data-[state=active]:shadow-xs"
              >
                All ({kpiStats.total})
              </TabsTrigger>
              <TabsTrigger
                value="pending"
                className="rounded-lg text-xs font-medium px-3.5 py-1.5 data-[state=active]:bg-white dark:data-[state=active]:bg-stone-900 data-[state=active]:text-stone-900 dark:data-[state=active]:text-stone-100 data-[state=active]:shadow-xs"
              >
                Pending ({kpiStats.pending})
              </TabsTrigger>
              <TabsTrigger
                value="active"
                className="rounded-lg text-xs font-medium px-3.5 py-1.5 data-[state=active]:bg-white dark:data-[state=active]:bg-stone-900 data-[state=active]:text-stone-900 dark:data-[state=active]:text-stone-100 data-[state=active]:shadow-xs"
              >
                Accepted & Active ({kpiStats.actionNeeded})
              </TabsTrigger>
              <TabsTrigger
                value="completed"
                className="rounded-lg text-xs font-medium px-3.5 py-1.5 data-[state=active]:bg-white dark:data-[state=active]:bg-stone-900 data-[state=active]:text-stone-900 dark:data-[state=active]:text-stone-100 data-[state=active]:shadow-xs"
              >
                Completed ({kpiStats.completed})
              </TabsTrigger>
              <TabsTrigger
                value="cancelled"
                className="rounded-lg text-xs font-medium px-3.5 py-1.5 data-[state=active]:bg-white dark:data-[state=active]:bg-stone-900 data-[state=active]:text-stone-900 dark:data-[state=active]:text-stone-100 data-[state=active]:shadow-xs"
              >
                Cancelled / Rejected
              </TabsTrigger>
            </TabsList>
          </Tabs>

          {/* Bookings Feed */}
          {isLoading ? (
            <div className="space-y-3">
              {Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="h-36 rounded-xl bg-stone-100 dark:bg-stone-800/40 animate-pulse border border-stone-200/60 dark:border-stone-800" />
              ))}
            </div>
          ) : filteredBookings.length === 0 ? (
            <div className="p-10 text-center rounded-xl bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 shadow-xs space-y-3">
              <div className="w-10 h-10 rounded-lg bg-stone-100 dark:bg-stone-800 text-stone-600 dark:text-stone-400 flex items-center justify-center mx-auto">
                <Calendar className="h-5 w-5" />
              </div>
              <div className="space-y-1">
                <h3 className="font-semibold text-sm text-stone-900 dark:text-stone-100">
                  No bookings found
                </h3>
                <p className="text-xs text-stone-500 max-w-sm mx-auto">
                  {activeTab === "all"
                    ? "You haven't booked any services yet. Explore our verified marketplace to get started."
                    : `No appointments currently marked as ${activeTab}.`}
                </p>
              </div>
              {activeTab === "all" && (
                <Button asChild size="sm" className="rounded-lg text-xs font-medium bg-[#EA580C] hover:bg-[#c2410c] text-white">
                  <Link href="/services">Browse services</Link>
                </Button>
              )}
            </div>
          ) : (
            <div className="space-y-3">
              {filteredBookings.map((booking) => {
                const sId = typeof booking.service === "object" ? String((booking.service as any)?.id || "") : String(booking.service || "");
                const resolved = serviceMap[sId] || null;

                return (
                  <CustomerBookingCard
                    key={booking.id}
                    booking={booking}
                    resolvedService={resolved}
                    onEdit={setSelectedBookingForEdit}
                    onCancel={setSelectedBookingForCancel}
                    onReview={setSelectedBookingForReview}
                  />
                );
              })}
            </div>
          )}
        </div>

        {/* Modals */}
        <EditBookingModal
          booking={selectedBookingForEdit}
          open={Boolean(selectedBookingForEdit)}
          onOpenChange={(open) => !open && setSelectedBookingForEdit(null)}
        />

        <CancelBookingDialog
          booking={selectedBookingForCancel}
          open={Boolean(selectedBookingForCancel)}
          onOpenChange={(open) => !open && setSelectedBookingForCancel(null)}
        />

        <ReviewModal
          booking={selectedBookingForReview}
          open={Boolean(selectedBookingForReview)}
          onOpenChange={(open) => !open && setSelectedBookingForReview(null)}
        />
      </div>
    </ProtectedRoute>
  );
}
