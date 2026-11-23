"use client";

import * as React from "react";
import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { 
  ArrowLeft, 
  CalendarDays, 
  Sparkles, 
  Search, 
  Filter
} from "lucide-react";

import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import { bookingsService } from "@/features/bookings/services/bookings.service";
import { CustomerBookingCard } from "@/components/dashboard/customer/CustomerBookingCard";
import { EditBookingModal } from "@/components/dashboard/customer/EditBookingModal";
import { CancelBookingDialog } from "@/components/dashboard/customer/CancelBookingDialog";
import { ReviewModal } from "@/components/reviews/ReviewModal";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import type { Booking } from "@/types/api";

export default function CustomerBookingsPage() {
  const [activeTab, setActiveTab] = React.useState<string>("all");
  const [searchQuery, setSearchQuery] = React.useState<string>("");

  // Modal states
  const [editingBooking, setEditingBooking] = React.useState<Booking | null>(null);
  const [cancellingBooking, setCancellingBooking] = React.useState<Booking | null>(null);
  const [reviewingBooking, setReviewingBooking] = React.useState<Booking | null>(null);

  // Fetch all customer bookings
  const { data: bookings = [], isLoading } = useQuery({
    queryKey: ["my-bookings"],
    queryFn: () => bookingsService.getMyBookings(),
  });

  // Filter bookings based on tab & search query
  const filteredBookings = React.useMemo(() => {
    return bookings.filter((b) => {
      // Tab filter
      const status = String(b.status || "").toLowerCase();
      let matchesTab = true;
      if (activeTab === "pending") matchesTab = status === "pending";
      else if (activeTab === "active") matchesTab = ["accepted", "in_progress"].includes(status);
      else if (activeTab === "completed") matchesTab = status === "completed";
      else if (activeTab === "cancelled") matchesTab = ["cancelled", "rejected"].includes(status);

      if (!matchesTab) return false;

      // Text search
      if (!searchQuery.trim()) return true;
      const q = searchQuery.toLowerCase();
      const serviceName = (
        typeof b.service === "object" && b.service
          ? (b.service as any).name || (b.service as any).title || ""
          : b.service_name || b.service_title || ""
      ).toLowerCase();
      const providerName = (
        typeof b.provider === "object" && b.provider
          ? (b.provider as any).full_name || (b.provider as any).username || ""
          : b.provider_name || ""
      ).toLowerCase();
      const bookingId = String(b.id || "").toLowerCase();

      return serviceName.includes(q) || providerName.includes(q) || bookingId.includes(q);
    });
  }, [bookings, activeTab, searchQuery]);

  return (
    <ProtectedRoute allowedRoles={["CUSTOMER"]}>
      <main className="min-h-screen bg-[#FAF9F6] py-8 px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto space-y-6">
          {/* Breadcrumb / Top Bar */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-stone-200">
            <div>
              <Link
                href="/dashboard/customer"
                className="inline-flex items-center gap-1.5 text-xs font-semibold text-stone-500 hover:text-teal-900 transition-colors mb-2"
              >
                <ArrowLeft className="h-3.5 w-3.5" />
                Back to Command Center
              </Link>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-stone-900 tracking-tight font-serif flex items-center gap-2.5">
                <CalendarDays className="h-7 w-7 text-teal-800" />
                All My Bookings
              </h1>
              <p className="text-sm text-stone-600 mt-1">
                Full chronological history of all your local service orders, invoices, and reviews.
              </p>
            </div>

            <Button asChild className="bg-[#EA580C] hover:bg-[#C2410C] text-white shadow-tactile self-start sm:self-auto">
              <Link href="/services">
                <Sparkles className="h-4 w-4 mr-2" />
                Book New Service
              </Link>
            </Button>
          </div>

          {/* Filter & Search Bar */}
          <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4 bg-white p-4 rounded-2xl border border-stone-200 shadow-sm">
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full md:w-auto">
              <TabsList className="bg-stone-100/90 p-1 rounded-xl flex-wrap h-auto gap-1">
                <TabsTrigger value="all" className="rounded-lg text-xs font-medium px-3 py-1.5 data-[state=active]:bg-white data-[state=active]:text-teal-900 data-[state=active]:shadow-sm">
                  All ({bookings.length})
                </TabsTrigger>
                <TabsTrigger value="pending" className="rounded-lg text-xs font-medium px-3 py-1.5 data-[state=active]:bg-white data-[state=active]:text-amber-800 data-[state=active]:shadow-sm">
                  Pending ({bookings.filter(b => b.status === "pending").length})
                </TabsTrigger>
                <TabsTrigger value="active" className="rounded-lg text-xs font-medium px-3 py-1.5 data-[state=active]:bg-white data-[state=active]:text-teal-900 data-[state=active]:shadow-sm">
                  Active ({bookings.filter(b => ["accepted", "in_progress"].includes(b.status)).length})
                </TabsTrigger>
                <TabsTrigger value="completed" className="rounded-lg text-xs font-medium px-3 py-1.5 data-[state=active]:bg-white data-[state=active]:text-emerald-800 data-[state=active]:shadow-sm">
                  Completed ({bookings.filter(b => b.status === "completed").length})
                </TabsTrigger>
                <TabsTrigger value="cancelled" className="rounded-lg text-xs font-medium px-3 py-1.5 data-[state=active]:bg-white data-[state=active]:text-stone-700 data-[state=active]:shadow-sm">
                  Cancelled ({bookings.filter(b => ["cancelled", "rejected"].includes(b.status)).length})
                </TabsTrigger>
              </TabsList>
            </Tabs>

            <div className="relative min-w-[240px]">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-stone-400" />
              <input
                type="text"
                placeholder="Search service, pro, ID..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-3 py-1.5 text-xs rounded-xl border border-stone-200 bg-stone-50/50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-teal-700/20 focus:border-teal-700 text-stone-800 placeholder:text-stone-400"
              />
            </div>
          </div>

          {/* Bookings List */}
          {isLoading ? (
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="p-6 bg-white rounded-2xl border border-stone-200 space-y-4">
                  <div className="flex justify-between items-center">
                    <Skeleton className="h-6 w-48 rounded" />
                    <Skeleton className="h-6 w-24 rounded-full" />
                  </div>
                  <Skeleton className="h-14 w-full rounded-xl" />
                  <Skeleton className="h-8 w-1/3 rounded" />
                </div>
              ))}
            </div>
          ) : filteredBookings.length === 0 ? (
            <div className="text-center py-16 px-4 bg-white rounded-3xl border border-dashed border-stone-300">
              <div className="h-14 w-14 rounded-2xl bg-stone-100 flex items-center justify-center mx-auto text-stone-400 mb-4">
                <Filter className="h-7 w-7 text-stone-400" />
              </div>
              <h3 className="text-lg font-bold text-stone-900 mb-1">No bookings found</h3>
              <p className="text-sm text-stone-500 max-w-sm mx-auto mb-6">
                {searchQuery
                  ? "No orders match your search term. Try searching for a different keyword."
                  : activeTab === "all"
                  ? "You haven't placed any service requests yet. Browse top pros and book with 20% advance protection."
                  : `You have no bookings matching the "${activeTab}" filter.`}
              </p>
              {activeTab === "all" && !searchQuery ? (
                <Button asChild className="bg-[#EA580C] hover:bg-[#C2410C] text-white shadow-tactile">
                  <Link href="/services">Browse Verified Services</Link>
                </Button>
              ) : (
                <Button variant="outline" onClick={() => { setActiveTab("all"); setSearchQuery(""); }}>
                  Clear Filters
                </Button>
              )}
            </div>
          ) : (
            <div className="space-y-4">
              {filteredBookings.map((booking) => (
                <CustomerBookingCard
                  key={booking.id}
                  booking={booking}
                  onEdit={(b) => setEditingBooking(b)}
                  onCancel={(b) => setCancellingBooking(b)}
                  onReview={(b) => setReviewingBooking(b)}
                />
              ))}
            </div>
          )}
        </div>

        {/* Action Modals */}
        <EditBookingModal
          booking={editingBooking}
          open={!!editingBooking}
          onOpenChange={(open) => !open && setEditingBooking(null)}
        />

        <CancelBookingDialog
          booking={cancellingBooking}
          open={!!cancellingBooking}
          onOpenChange={(open) => !open && setCancellingBooking(null)}
        />

        <ReviewModal
          booking={reviewingBooking}
          open={!!reviewingBooking}
          onOpenChange={(open) => !open && setReviewingBooking(null)}
        />
      </main>
    </ProtectedRoute>
  );
}
