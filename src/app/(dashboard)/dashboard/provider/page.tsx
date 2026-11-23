"use client";

import * as React from "react";
import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import {
  Briefcase,
  Layers,
  Clock,
  CheckCircle2,
  AlertCircle,
  Plus,
  RefreshCw,
  Sparkles,
  TrendingUp,
} from "lucide-react";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ProviderBookingsTab } from "@/components/dashboard/provider/ProviderBookingsTab";
import { ProviderServicesTab } from "@/components/dashboard/provider/ProviderServicesTab";
import { dashboardService } from "@/features/dashboard/services/dashboard.service";
import { servicesService } from "@/features/services/services/services.service";
import { useAuthStore } from "@/store/useAuthStore";

export default function ProviderWorkspacePage() {
  const { user, profile } = useAuthStore();
  const [activeMainTab, setActiveMainTab] = React.useState<string>("jobs");

  // Top KPI Queries
  const { data: pendingBookings = [], isLoading: pendingLoading, refetch: refetchPending } = useQuery({
    queryKey: ["dashboard", "provider", "pending_bookings"],
    queryFn: () => dashboardService.getProviderPendingBookings(),
  });

  const { data: acceptedBookings = [], isLoading: acceptedLoading, refetch: refetchAccepted } = useQuery({
    queryKey: ["dashboard", "provider", "accepted_bookings"],
    queryFn: () => dashboardService.getProviderAcceptedBookings(),
  });

  const { data: completedCountData, refetch: refetchCompleted } = useQuery({
    queryKey: ["dashboard", "provider", "completed_count"],
    queryFn: () => dashboardService.getTotalCompletedBookingCount(),
  });

  const { data: providerServices = [], refetch: refetchServices } = useQuery({
    queryKey: ["services", "provider"],
    queryFn: () => servicesService.getProviderServices(),
  });

  // Completed count normalization
  const completedJobsCount = React.useMemo(() => {
    if (typeof completedCountData === "number") return completedCountData;
    if (completedCountData && typeof completedCountData === "object") {
      return (
        completedCountData.total_completed ??
        completedCountData.count ??
        0
      );
    }
    return 0;
  }, [completedCountData]);

  const handleRefreshAll = () => {
    refetchPending();
    refetchAccepted();
    refetchCompleted();
    refetchServices();
  };

  const displayName: string =
    (typeof profile?.full_name === "string" && profile.full_name) ||
    (user?.first_name ? `${user.first_name} ${user.last_name || ""}`.trim() : "") ||
    (typeof user?.email === "string" ? user.email.split("@")[0] : "") ||
    "Service Pro";

  return (
    <ProtectedRoute allowedRoles={["SERVICE_PROVIDER"]}>
      <main className="min-h-screen bg-[#FAF9F6] py-8 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto space-y-8">
          {/* Top Editorial Banner */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-stone-200">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-teal-50 border border-teal-200 text-teal-800 text-xs font-semibold mb-2">
                <Briefcase className="h-3.5 w-3.5 text-teal-700" />
                Verified Pro Workspace
              </div>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-stone-900 tracking-tight font-serif">
                Welcome back, {displayName}
              </h1>
              <p className="text-sm text-stone-600 mt-1">
                Manage incoming customer job requests, coordinate active orders, and update your service catalog.
              </p>
            </div>

            <div className="flex items-center gap-3">
              <Button
                variant="outline"
                size="sm"
                onClick={handleRefreshAll}
                className="rounded-xl border-stone-200 bg-white hover:bg-stone-50 text-stone-700 text-xs shadow-xs"
              >
                <RefreshCw className="h-3.5 w-3.5 mr-1.5" />
                Refresh Data
              </Button>
            </div>
          </div>

          {/* Top Performance KPI Bento Strip (4-Column Grid) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Card 1: Pending Requests */}
            <div className="p-5 rounded-2xl bg-white border border-stone-200 shadow-sm hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between text-xs text-stone-500 mb-2">
                <span className="font-semibold uppercase tracking-wider text-[11px]">Pending Requests</span>
                <Clock className="h-4 w-4 text-amber-500" />
              </div>
              <div className="flex items-baseline gap-2">
                <span className="text-3xl font-extrabold text-amber-900 tabular-nums font-serif">
                  {pendingLoading ? "—" : pendingBookings.length}
                </span>
                <span className="text-xs text-amber-700 font-medium">Awaiting response</span>
              </div>
            </div>

            {/* Card 2: Accepted / Active Jobs */}
            <div className="p-5 rounded-2xl bg-white border border-stone-200 shadow-sm hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between text-xs text-stone-500 mb-2">
                <span className="font-semibold uppercase tracking-wider text-[11px]">Active Jobs</span>
                <Briefcase className="h-4 w-4 text-teal-700" />
              </div>
              <div className="flex items-baseline gap-2">
                <span className="text-3xl font-extrabold text-teal-900 tabular-nums font-serif">
                  {acceptedLoading ? "—" : acceptedBookings.length}
                </span>
                <span className="text-xs text-teal-700 font-medium">In execution</span>
              </div>
            </div>

            {/* Card 3: Completed Jobs */}
            <div className="p-5 rounded-2xl bg-white border border-stone-200 shadow-sm hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between text-xs text-stone-500 mb-2">
                <span className="font-semibold uppercase tracking-wider text-[11px]">Jobs Completed</span>
                <CheckCircle2 className="h-4 w-4 text-emerald-600" />
              </div>
              <div className="flex items-baseline gap-2">
                <span className="text-3xl font-extrabold text-emerald-900 tabular-nums font-serif">
                  {completedJobsCount}
                </span>
                <span className="text-xs text-emerald-700 font-medium">Delivered</span>
              </div>
            </div>

            {/* Card 4: Active Listed Services */}
            <div className="p-5 rounded-2xl bg-white border border-stone-200 shadow-sm hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between text-xs text-stone-500 mb-2">
                <span className="font-semibold uppercase tracking-wider text-[11px]">Listed Services</span>
                <Layers className="h-4 w-4 text-orange-600" />
              </div>
              <div className="flex items-baseline gap-2">
                <span className="text-3xl font-extrabold text-stone-900 tabular-nums font-serif">
                  {providerServices.length}
                </span>
                <span className="text-xs text-stone-500 font-medium">In catalog</span>
              </div>
            </div>
          </div>

          {/* Main Pro Workspace Tabs */}
          <Tabs value={activeMainTab} onValueChange={setActiveMainTab} className="space-y-6">
            <div className="flex items-center justify-between border-b border-stone-200 pb-3">
              <TabsList className="bg-stone-200/70 p-1 rounded-xl h-auto gap-2">
                <TabsTrigger
                  value="jobs"
                  className="rounded-lg text-xs font-semibold px-4 py-2 data-[state=active]:bg-white data-[state=active]:text-teal-900 data-[state=active]:shadow-sm"
                >
                  <Briefcase className="h-3.5 w-3.5 mr-2 text-teal-800" />
                  Incoming & Active Jobs ({pendingBookings.length + acceptedBookings.length})
                </TabsTrigger>
                <TabsTrigger
                  value="catalog"
                  className="rounded-lg text-xs font-semibold px-4 py-2 data-[state=active]:bg-white data-[state=active]:text-orange-900 data-[state=active]:shadow-sm"
                >
                  <Layers className="h-3.5 w-3.5 mr-2 text-orange-600" />
                  My Service Catalog ({providerServices.length})
                </TabsTrigger>
              </TabsList>
            </div>

            {/* Tab 1: Job Requests & Active Bookings */}
            <TabsContent value="jobs" className="mt-0 focus-visible:outline-none">
              <ProviderBookingsTab />
            </TabsContent>

            {/* Tab 2: Service Catalog */}
            <TabsContent value="catalog" className="mt-0 focus-visible:outline-none">
              <ProviderServicesTab />
            </TabsContent>
          </Tabs>
        </div>
      </main>
    </ProtectedRoute>
  );
}
