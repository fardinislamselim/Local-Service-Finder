"use client";

import * as React from "react";
import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import {
  ShieldCheck,
  Users,
  Clock,
  Layers,
  MapPin,
  RefreshCw,
} from "lucide-react";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AdminPendingProvidersTab } from "@/components/dashboard/admin/AdminPendingProvidersTab";
import { AdminCategoriesTab } from "@/components/dashboard/admin/AdminCategoriesTab";
import { AdminLocationsTab } from "@/components/dashboard/admin/AdminLocationsTab";
import { AdminServiceModerationTab } from "@/components/dashboard/admin/AdminServiceModerationTab";
import { adminService } from "@/features/admin/services/admin.service";
import { categoriesService } from "@/features/categories/services/categories.service";
import { locationsService } from "@/features/locations/services/locations.service";

export default function AdminDashboardPage() {
  const [activeTab, setActiveTab] = React.useState<string>("providers");

  // KPI 1: Active Verified Providers
  const { data: activeCountData, refetch: refetchActive } = useQuery({
    queryKey: ["admin", "active_count"],
    queryFn: () => adminService.getTotalActiveCount(),
  });

  // KPI 2: Pending Provider Approvals
  const { data: pendingCountData, refetch: refetchPending } = useQuery({
    queryKey: ["admin", "pending_count"],
    queryFn: () => adminService.getTotalPendingCount(),
  });

  // KPI 3: Total Service Categories
  const { data: categories = [], refetch: refetchCategories } = useQuery({
    queryKey: ["categories", "all_category"],
    queryFn: () => categoriesService.getAll(),
  });

  // KPI 4: Configured Upazilas
  const { data: upazilas = [], refetch: refetchUpazilas } = useQuery({
    queryKey: ["locations", "upazilas"],
    queryFn: () => locationsService.getUpazilas(),
  });

  const activeProvidersCount = React.useMemo(() => {
    if (typeof activeCountData === "number") return activeCountData;
    if (activeCountData && typeof activeCountData === "object") {
      return activeCountData.total_active_accounts ?? activeCountData.count ?? 0;
    }
    return 0;
  }, [activeCountData]);

  const pendingProvidersCount = React.useMemo(() => {
    if (typeof pendingCountData === "number") return pendingCountData;
    if (pendingCountData && typeof pendingCountData === "object") {
      return pendingCountData.total_pending_accounts ?? pendingCountData.count ?? 0;
    }
    return 0;
  }, [pendingCountData]);

  const handleRefreshAll = () => {
    refetchActive();
    refetchPending();
    refetchCategories();
    refetchUpazilas();
  };

  return (
    <ProtectedRoute allowedRoles={["ADMIN"]}>
      <div className="space-y-6">
        {/* Header Strip */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-stone-200 dark:border-stone-800">
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl sm:text-2xl font-semibold text-stone-900 dark:text-stone-100 tracking-tight">
                Platform administration
              </h1>
              <span className="text-xs px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200/80 dark:bg-emerald-950/60 dark:text-emerald-300 dark:border-emerald-800">
                Admin portal
              </span>
            </div>
            <p className="text-xs text-stone-500 dark:text-stone-400 mt-1">
              Oversee provider accreditation, taxonomy, coverage zones, and service listings moderation.
            </p>
          </div>

          <Button
            variant="outline"
            size="sm"
            onClick={handleRefreshAll}
            className="rounded-lg h-9 text-xs font-medium border-stone-200 dark:border-stone-800 gap-1.5 self-start sm:self-auto"
          >
            <RefreshCw className="h-3.5 w-3.5" />
            <span>Refresh</span>
          </Button>
        </div>

        {/* 4-Column Governance KPI Strip */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5">
          {/* Card 1: Active Providers */}
          <div className="p-4 rounded-xl bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 space-y-1 shadow-sm">
            <span className="text-stone-500 dark:text-stone-400 text-xs font-medium">
              Verified providers
            </span>
            <div className="text-2xl font-semibold text-emerald-700 dark:text-emerald-400 tabular-nums">
              {activeProvidersCount}
            </div>
            <p className="text-[11px] text-stone-400">Active trade accounts</p>
          </div>

          {/* Card 2: Pending Approvals */}
          <div className="p-4 rounded-xl bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 space-y-1 shadow-sm">
            <span className="text-stone-500 dark:text-stone-400 text-xs font-medium">
              Pending approvals
            </span>
            <div className="text-2xl font-semibold text-amber-600 dark:text-amber-400 tabular-nums">
              {pendingProvidersCount}
            </div>
            <p className="text-[11px] text-stone-400">Awaiting credential check</p>
          </div>

          {/* Card 3: Categories */}
          <div className="p-4 rounded-xl bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 space-y-1 shadow-sm">
            <span className="text-stone-500 dark:text-stone-400 text-xs font-medium">
              Service categories
            </span>
            <div className="text-2xl font-semibold text-stone-900 dark:text-stone-100 tabular-nums">
              {categories.length}
            </div>
            <p className="text-[11px] text-stone-400">Active classifications</p>
          </div>

          {/* Card 4: Upazilas */}
          <div className="p-4 rounded-xl bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 space-y-1 shadow-sm">
            <span className="text-stone-500 dark:text-stone-400 text-xs font-medium">
              Coverage upazilas
            </span>
            <div className="text-2xl font-semibold text-stone-900 dark:text-stone-100 tabular-nums">
              {upazilas.length}
            </div>
            <p className="text-[11px] text-stone-400">Mapped service zones</p>
          </div>
        </div>

        {/* 4-Tab Governance Workspace */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
          <div className="border-b border-stone-200 dark:border-stone-800 pb-2">
            <TabsList className="bg-stone-100 dark:bg-stone-800/60 p-1 rounded-xl h-auto flex-wrap gap-1 border border-stone-200/60 dark:border-stone-700/60">
              <TabsTrigger
                value="providers"
                className="rounded-lg text-xs font-medium px-3.5 py-1.5 data-[state=active]:bg-white dark:data-[state=active]:bg-stone-900 data-[state=active]:text-stone-900 dark:data-[state=active]:text-stone-100 data-[state=active]:shadow-sm"
              >
                <Users className="h-3.5 w-3.5 mr-1.5 text-stone-500" />
                <span>Provider approvals ({pendingProvidersCount})</span>
              </TabsTrigger>

              <TabsTrigger
                value="categories"
                className="rounded-lg text-xs font-medium px-3.5 py-1.5 data-[state=active]:bg-white dark:data-[state=active]:bg-stone-900 data-[state=active]:text-stone-900 dark:data-[state=active]:text-stone-100 data-[state=active]:shadow-sm"
              >
                <Layers className="h-3.5 w-3.5 mr-1.5 text-stone-500" />
                <span>Category management ({categories.length})</span>
              </TabsTrigger>

              <TabsTrigger
                value="locations"
                className="rounded-lg text-xs font-medium px-3.5 py-1.5 data-[state=active]:bg-white dark:data-[state=active]:bg-stone-900 data-[state=active]:text-stone-900 dark:data-[state=active]:text-stone-100 data-[state=active]:shadow-sm"
              >
                <MapPin className="h-3.5 w-3.5 mr-1.5 text-stone-500" />
                <span>Location hierarchy</span>
              </TabsTrigger>

              <TabsTrigger
                value="moderation"
                className="rounded-lg text-xs font-medium px-3.5 py-1.5 data-[state=active]:bg-white dark:data-[state=active]:bg-stone-900 data-[state=active]:text-stone-900 dark:data-[state=active]:text-stone-100 data-[state=active]:shadow-sm"
              >
                <ShieldCheck className="h-3.5 w-3.5 mr-1.5 text-stone-500" />
                <span>Service moderation</span>
              </TabsTrigger>
            </TabsList>
          </div>

          <TabsContent value="providers" className="mt-0 focus-visible:outline-none">
            <AdminPendingProvidersTab />
          </TabsContent>

          <TabsContent value="categories" className="mt-0 focus-visible:outline-none">
            <AdminCategoriesTab />
          </TabsContent>

          <TabsContent value="locations" className="mt-0 focus-visible:outline-none">
            <AdminLocationsTab />
          </TabsContent>

          <TabsContent value="moderation" className="mt-0 focus-visible:outline-none">
            <AdminServiceModerationTab />
          </TabsContent>
        </Tabs>
      </div>
    </ProtectedRoute>
  );
}
