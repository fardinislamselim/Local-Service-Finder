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
  Search,
  SlidersHorizontal,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import { CustomerBookingCard } from "@/components/dashboard/customer/CustomerBookingCard";
import { EditBookingModal } from "@/components/dashboard/customer/EditBookingModal";
import { CancelBookingDialog } from "@/components/dashboard/customer/CancelBookingDialog";
import { ReviewModal } from "@/components/reviews/ReviewModal";
import { bookingsService } from "@/features/bookings/services/bookings.service";
import { dashboardService } from "@/features/dashboard/services/dashboard.service";
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
      <div className="space-y-8">
        {/* TOP COMMAND HEADER */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <span className="text-[11px] font-bold uppercase tracking-wider text-teal-800">
              Customer Order Hub
            </span>
            <h1 className="text-3xl font-extrabold text-stone-900 tracking-tight font-heading">
              My Service Bookings
            </h1>
            <p className="text-xs sm:text-sm text-stone-500 mt-0.5">
              Track appointments, manage 20% advance deposits, and rate completed craftsmanship.
            </p>
          </div>

          <div className="flex items-center gap-2.5">
            <Button
              variant="outline"
              size="sm"
              onClick={() => refetch()}
              disabled={isRefetching}
              className="rounded-xl h-10 text-xs font-semibold gap-1.5"
            >
              <RefreshCw className={`h-3.5 w-3.5 ${isRefetching ? "animate-spin" : ""}`} />
              <span>Refresh</span>
            </Button>

            <Button asChild size="sm" className="rounded-xl h-10 text-xs font-bold gap-1.5 shadow-md">
              <Link href="/services">
                <Plus className="h-4 w-4" />
                <span>Book New Service</span>
              </Link>
            </Button>
          </div>
        </div>

        {/* 4-COLUMN KPI SUMMARY BENTO CARDS */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {/* 1. Total Bookings */}
          <div className="p-5 rounded-3xl bg-white border border-stone-200 shadow-2xs space-y-2">
            <span className="text-stone-400 block text-[10px] uppercase font-bold tracking-wider">
              Total Orders
            </span>
            <div className="text-2xl sm:text-3xl font-extrabold text-stone-900 tabular-nums font-heading">
              {kpiStats.total}
            </div>
            <p className="text-[11px] text-stone-500">Lifetime service requests</p>
          </div>

          {/* 2. Pending Approval */}
          <div className="p-5 rounded-3xl bg-white border border-stone-200 shadow-2xs space-y-2">
            <span className="text-amber-600 block text-[10px] uppercase font-bold tracking-wider">
              Pending Approval
            </span>
            <div className="text-2xl sm:text-3xl font-extrabold text-amber-600 tabular-nums font-heading">
              {kpiStats.pending}
            </div>
            <p className="text-[11px] text-stone-500">Awaiting provider acceptance</p>
          </div>

          {/* 3. Action Needed */}
          <div className="p-5 rounded-3xl bg-white border border-stone-200 shadow-2xs space-y-2">
            <span className="text-orange-600 block text-[10px] uppercase font-bold tracking-wider">
              Action Needed (Pay 20%)
            </span>
            <div className="text-2xl sm:text-3xl font-extrabold text-orange-600 tabular-nums font-heading">
              {kpiStats.actionNeeded}
            </div>
            <p className="text-[11px] text-stone-500">Advance deposit due</p>
          </div>

          {/* 4. Completed Services */}
          <div className="p-5 rounded-3xl bg-white border border-stone-200 shadow-2xs space-y-2">
            <span className="text-emerald-600 block text-[10px] uppercase font-bold tracking-wider">
              Completed
            </span>
            <div className="text-2xl sm:text-3xl font-extrabold text-emerald-600 tabular-nums font-heading">
              {kpiStats.completed}
            </div>
            <p className="text-[11px] text-stone-500">Jobs fulfilled successfully</p>
          </div>
        </div>

        {/* TABS & ORDER FEED */}
        <div className="space-y-6">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="bg-stone-100 p-1 rounded-2xl flex flex-wrap h-auto gap-1">
              <TabsTrigger
                value="all"
                className="rounded-xl text-xs font-semibold px-4 py-2 data-[state=active]:bg-white data-[state=active]:text-teal-900 data-[state=active]:shadow-xs"
              >
                All Bookings ({kpiStats.total})
              </TabsTrigger>
              <TabsTrigger
                value="pending"
                className="rounded-xl text-xs font-semibold px-4 py-2 data-[state=active]:bg-white data-[state=active]:text-teal-900 data-[state=active]:shadow-xs"
              >
                Pending ({kpiStats.pending})
              </TabsTrigger>
              <TabsTrigger
                value="active"
                className="rounded-xl text-xs font-semibold px-4 py-2 data-[state=active]:bg-white data-[state=active]:text-teal-900 data-[state=active]:shadow-xs"
              >
                Accepted & Active ({kpiStats.actionNeeded})
              </TabsTrigger>
              <TabsTrigger
                value="completed"
                className="rounded-xl text-xs font-semibold px-4 py-2 data-[state=active]:bg-white data-[state=active]:text-teal-900 data-[state=active]:shadow-xs"
              >
                Completed ({kpiStats.completed})
              </TabsTrigger>
              <TabsTrigger
                value="cancelled"
                className="rounded-xl text-xs font-semibold px-4 py-2 data-[state=active]:bg-white data-[state=active]:text-teal-900 data-[state=active]:shadow-xs"
              >
                Cancelled / Rejected
              </TabsTrigger>
            </TabsList>
          </Tabs>

          {/* Bookings Feed */}
          {isLoading ? (
            <div className="space-y-4">
              {Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="h-44 rounded-3xl bg-stone-100 animate-pulse" />
              ))}
            </div>
          ) : filteredBookings.length === 0 ? (
            <div className="p-12 text-center rounded-3xl bg-white border border-stone-200 shadow-2xs space-y-4">
              <div className="w-14 h-14 rounded-2xl bg-teal-50 border border-teal-200 text-teal-800 flex items-center justify-center mx-auto">
                <Calendar className="h-6 w-6" />
              </div>
              <div className="space-y-1">
                <h3 className="font-extrabold text-base text-stone-900 font-heading">
                  No bookings found in this view
                </h3>
                <p className="text-xs text-stone-500 max-w-sm mx-auto">
                  {activeTab === "all"
                    ? "You haven't booked any service pros yet. Explore our verified marketplace to get started."
                    : `No appointments currently marked as ${activeTab}.`}
                </p>
              </div>
              {activeTab === "all" && (
                <Button asChild size="sm" className="rounded-xl font-bold">
                  <Link href="/services">Browse Verified Services</Link>
                </Button>
              )}
            </div>
          ) : (
            <div className="space-y-4">
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

        {/* MODALS */}
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
