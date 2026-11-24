"use client";

import * as React from "react";
import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import {
  Briefcase,
  Layers,
  Clock,
  CheckCircle2,
  RefreshCw,
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
      <div className="space-y-6">
        {/* Top Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-stone-200 dark:border-stone-800">
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl sm:text-2xl font-semibold text-stone-900 dark:text-stone-100 tracking-tight">
                Provider workspace
              </h1>
              <span className="text-xs px-2 py-0.5 rounded-full bg-teal-50 text-teal-800 border border-teal-200/80 dark:bg-teal-950/60 dark:text-teal-300 dark:border-teal-800">
                Verified Pro
              </span>
            </div>
            <p className="text-xs text-stone-500 dark:text-stone-400 mt-1">
              Welcome back, {displayName}. Manage incoming job requests, coordinate active appointments, and publish services.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handleRefreshAll}
              className="rounded-lg h-9 text-xs font-medium border-stone-200 dark:border-stone-800 gap-1.5"
            >
              <RefreshCw className="h-3.5 w-3.5" />
              <span>Refresh</span>
            </Button>
          </div>
        </div>

        {/* 4-Column KPI Strip */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5">
          {/* Card 1: Pending Requests */}
          <div className="p-4 rounded-xl bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 space-y-1 shadow-xs">
            <span className="text-stone-500 dark:text-stone-400 text-xs font-medium">
              Pending requests
            </span>
            <div className="text-2xl font-semibold text-amber-600 dark:text-amber-400 tabular-nums">
              {pendingLoading ? "—" : pendingBookings.length}
            </div>
            <p className="text-[11px] text-stone-400">Awaiting your response</p>
          </div>

          {/* Card 2: Accepted / Active Jobs */}
          <div className="p-4 rounded-xl bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 space-y-1 shadow-xs">
            <span className="text-stone-500 dark:text-stone-400 text-xs font-medium">
              Active jobs
            </span>
            <div className="text-2xl font-semibold text-[#115E59] dark:text-teal-400 tabular-nums">
              {acceptedLoading ? "—" : acceptedBookings.length}
            </div>
            <p className="text-[11px] text-stone-400">In execution</p>
          </div>

          {/* Card 3: Completed Jobs */}
          <div className="p-4 rounded-xl bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 space-y-1 shadow-xs">
            <span className="text-stone-500 dark:text-stone-400 text-xs font-medium">
              Jobs delivered
            </span>
            <div className="text-2xl font-semibold text-emerald-600 dark:text-emerald-400 tabular-nums">
              {completedJobsCount}
            </div>
            <p className="text-[11px] text-stone-400">Fulfilled orders</p>
          </div>

          {/* Card 4: Active Listed Services */}
          <div className="p-4 rounded-xl bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 space-y-1 shadow-xs">
            <span className="text-stone-500 dark:text-stone-400 text-xs font-medium">
              Listed services
            </span>
            <div className="text-2xl font-semibold text-stone-900 dark:text-stone-100 tabular-nums">
              {providerServices.length}
            </div>
            <p className="text-[11px] text-stone-400">In your catalog</p>
          </div>
        </div>

        {/* Main Pro Workspace Tabs */}
        <Tabs value={activeMainTab} onValueChange={setActiveMainTab} className="space-y-4">
          <div className="border-b border-stone-200 dark:border-stone-800 pb-2">
            <TabsList className="bg-stone-100 dark:bg-stone-800/60 p-1 rounded-xl h-auto gap-1 border border-stone-200/60 dark:border-stone-700/60">
              <TabsTrigger
                value="jobs"
                className="rounded-lg text-xs font-medium px-3.5 py-1.5 data-[state=active]:bg-white dark:data-[state=active]:bg-stone-900 data-[state=active]:text-stone-900 dark:data-[state=active]:text-stone-100 data-[state=active]:shadow-xs"
              >
                <Briefcase className="h-3.5 w-3.5 mr-1.5 text-stone-500" />
                <span>Job requests & active orders ({pendingBookings.length + acceptedBookings.length})</span>
              </TabsTrigger>
              <TabsTrigger
                value="catalog"
                className="rounded-lg text-xs font-medium px-3.5 py-1.5 data-[state=active]:bg-white dark:data-[state=active]:bg-stone-900 data-[state=active]:text-stone-900 dark:data-[state=active]:text-stone-100 data-[state=active]:shadow-xs"
              >
                <Layers className="h-3.5 w-3.5 mr-1.5 text-stone-500" />
                <span>Service catalog ({providerServices.length})</span>
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
    </ProtectedRoute>
  );
}
