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
  SlidersHorizontal,
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
      <main className="min-h-screen bg-[#FAF9F6] py-8 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto space-y-8">
          {/* Header Strip */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-stone-200">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold mb-2">
                <ShieldCheck className="h-3.5 w-3.5 text-emerald-700" />
                Root Administrator Authority
              </div>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-stone-900 tracking-tight font-serif">
                Platform Governance Hub
              </h1>
              <p className="text-sm text-stone-600 mt-1">
                Oversee service provider accreditation, taxonomy, hierarchical locations, and listings moderation.
              </p>
            </div>

            <Button
              variant="outline"
              size="sm"
              onClick={handleRefreshAll}
              className="rounded-xl border-stone-200 bg-white hover:bg-stone-50 text-stone-700 text-xs shadow-xs self-start md:self-auto"
            >
              <RefreshCw className="h-3.5 w-3.5 mr-1.5" />
              Refresh Governance Data
            </Button>
          </div>

          {/* Top Governance KPI Bento Strip */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="p-5 rounded-2xl bg-white border border-stone-200 shadow-sm hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between text-xs text-stone-500 mb-2">
                <span className="font-semibold uppercase tracking-wider text-[11px]">Active Providers</span>
                <Users className="h-4 w-4 text-emerald-600" />
              </div>
              <div className="flex items-baseline gap-2">
                <span className="text-3xl font-extrabold text-emerald-900 tabular-nums font-serif">
                  {activeProvidersCount}
                </span>
                <span className="text-xs text-emerald-700 font-medium">Verified Pros</span>
              </div>
            </div>

            <div className="p-5 rounded-2xl bg-white border border-stone-200 shadow-sm hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between text-xs text-stone-500 mb-2">
                <span className="font-semibold uppercase tracking-wider text-[11px]">Pending Approvals</span>
                <Clock className="h-4 w-4 text-amber-500" />
              </div>
              <div className="flex items-baseline gap-2">
                <span className="text-3xl font-extrabold text-amber-900 tabular-nums font-serif">
                  {pendingProvidersCount}
                </span>
                <span className="text-xs text-amber-700 font-medium">Awaiting check</span>
              </div>
            </div>

            <div className="p-5 rounded-2xl bg-white border border-stone-200 shadow-sm hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between text-xs text-stone-500 mb-2">
                <span className="font-semibold uppercase tracking-wider text-[11px]">Categories</span>
                <Layers className="h-4 w-4 text-teal-700" />
              </div>
              <div className="flex items-baseline gap-2">
                <span className="text-3xl font-extrabold text-stone-900 tabular-nums font-serif">
                  {categories.length}
                </span>
                <span className="text-xs text-stone-500 font-medium">Active classifications</span>
              </div>
            </div>

            <div className="p-5 rounded-2xl bg-white border border-stone-200 shadow-sm hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between text-xs text-stone-500 mb-2">
                <span className="font-semibold uppercase tracking-wider text-[11px]">Upazilas Mapped</span>
                <MapPin className="h-4 w-4 text-orange-600" />
              </div>
              <div className="flex items-baseline gap-2">
                <span className="text-3xl font-extrabold text-stone-900 tabular-nums font-serif">
                  {upazilas.length}
                </span>
                <span className="text-xs text-stone-500 font-medium">Coverage zones</span>
              </div>
            </div>
          </div>

          {/* 4-Tab Governance Workspace */}
          <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
            <div className="border-b border-stone-200 pb-3">
              <TabsList className="bg-stone-200/70 p-1 rounded-xl h-auto flex-wrap gap-2">
                <TabsTrigger
                  value="providers"
                  className="rounded-lg text-xs font-semibold px-4 py-2 data-[state=active]:bg-white data-[state=active]:text-amber-900 data-[state=active]:shadow-sm"
                >
                  <Users className="h-3.5 w-3.5 mr-2 text-amber-600" />
                  Provider Approvals ({pendingProvidersCount})
                </TabsTrigger>

                <TabsTrigger
                  value="categories"
                  className="rounded-lg text-xs font-semibold px-4 py-2 data-[state=active]:bg-white data-[state=active]:text-teal-900 data-[state=active]:shadow-sm"
                >
                  <Layers className="h-3.5 w-3.5 mr-2 text-teal-800" />
                  Category Management ({categories.length})
                </TabsTrigger>

                <TabsTrigger
                  value="locations"
                  className="rounded-lg text-xs font-semibold px-4 py-2 data-[state=active]:bg-white data-[state=active]:text-emerald-900 data-[state=active]:shadow-sm"
                >
                  <MapPin className="h-3.5 w-3.5 mr-2 text-emerald-700" />
                  Location Hierarchy
                </TabsTrigger>

                <TabsTrigger
                  value="moderation"
                  className="rounded-lg text-xs font-semibold px-4 py-2 data-[state=active]:bg-white data-[state=active]:text-stone-900 data-[state=active]:shadow-sm"
                >
                  <ShieldCheck className="h-3.5 w-3.5 mr-2 text-stone-700" />
                  Service Moderation
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
      </main>
    </ProtectedRoute>
  );
}
