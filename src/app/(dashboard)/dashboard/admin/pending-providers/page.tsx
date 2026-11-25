"use client";

import * as React from "react";
import Link from "next/link";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import {
  Shield,
  ShieldCheck,
  User,
  Mail,
  Calendar,
  Search,
  Filter,
  Loader2,
  AlertCircle,
  RefreshCw,
  Clock,
  CheckCircle2,
  ArrowRight,
  ExternalLink,
} from "lucide-react";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { adminService } from "@/features/admin/services/admin.service";
import type { PendingAccount } from "@/types/api";

export default function AdminPendingApprovalsPage() {
  const queryClient = useQueryClient();
  const [searchQuery, setSearchQuery] = React.useState("");

  // Per-row processing tracker to isolate button loading states
  const [processingId, setProcessingId] = React.useState<string | null>(null);

  // 1. Fetch Pending Provider Accounts: GET /api/v1/dashboard/admin/pending_account/
  const {
    data: pendingProviders = [],
    isLoading: providersLoading,
    refetch,
    isRefetching,
  } = useQuery({
    queryKey: ["admin", "pending_providers"],
    queryFn: () => adminService.getPendingProviders(),
  });

  // 2. Counts KPI: GET /api/v1/dashboard/admin/total_activate_pending_count/ and /total_activate_account_count/
  const { data: totalPendingCountData } = useQuery({
    queryKey: ["admin", "counts", "pending"],
    queryFn: () => adminService.getTotalPendingCount(),
  });

  const { data: totalActiveCountData } = useQuery({
    queryKey: ["admin", "counts", "active"],
    queryFn: () => adminService.getTotalActiveCount(),
  });

  const pendingCount = React.useMemo(() => {
    if (typeof totalPendingCountData === "number") return totalPendingCountData;
    if (totalPendingCountData && typeof totalPendingCountData === "object") {
      return totalPendingCountData.total_pending_accounts ?? totalPendingCountData.count ?? pendingProviders.length;
    }
    return pendingProviders.length;
  }, [totalPendingCountData, pendingProviders.length]);

  const activeCount = React.useMemo(() => {
    if (typeof totalActiveCountData === "number") return totalActiveCountData;
    if (totalActiveCountData && typeof totalActiveCountData === "object") {
      return totalActiveCountData.total_active_accounts ?? totalActiveCountData.count ?? 0;
    }
    return 0;
  }, [totalActiveCountData]);

  // 3. Approve Mutation: PATCH /api/v1/dashboard/admin/account_activate/{pk}/ (pk = UUID)
  const approveMutation = useMutation({
    mutationFn: (userId: string | number) => adminService.approveProvider(userId),
    onSuccess: (res) => {
      toast.success(res?.message || "Provider account approved and activated!");
      queryClient.invalidateQueries({ queryKey: ["admin", "pending_providers"] });
      queryClient.invalidateQueries({ queryKey: ["admin", "counts"] });
      queryClient.invalidateQueries({ queryKey: ["admin-pending"] });
      queryClient.invalidateQueries({ queryKey: ["admin-counts"] });
    },
    onError: (err: any) => {
      toast.error(err?.message || "Failed to approve provider account.");
    },
    onSettled: () => setProcessingId(null),
  });

  const handleApprove = (providerId: string | number) => {
    setProcessingId(String(providerId));
    approveMutation.mutate(providerId);
  };

  const filteredProviders = React.useMemo(() => {
    if (!searchQuery.trim()) return pendingProviders;
    const q = searchQuery.toLowerCase();
    return pendingProviders.filter((p) => {
      const name = `${p.first_name || ""} ${p.last_name || ""}`.toLowerCase();
      const email = (p.email || "").toLowerCase();
      const roleStr = String(p.role || "").toLowerCase();
      const pId = String(p.id || "").toLowerCase();
      return name.includes(q) || email.includes(q) || roleStr.includes(q) || pId.includes(q);
    });
  }, [pendingProviders, searchQuery]);

  return (
    <ProtectedRoute allowedRoles={["ADMIN"]}>
      <div className="space-y-6">
        {/* Breadcrumb & Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-stone-200 dark:border-stone-800">
          <div>
            <div className="flex items-center gap-2 text-xs text-stone-500 mb-1">
              <Link href="/dashboard/admin" className="hover:text-teal-800 transition-colors">
                Dashboard
              </Link>
              <span>/</span>
              <span className="text-stone-800 dark:text-stone-200 font-medium">Pending Approvals</span>
            </div>
            <div className="flex items-center gap-2.5">
              <h1 className="text-xl sm:text-2xl font-semibold text-stone-900 dark:text-stone-100 tracking-tight">
                Pending provider applications
              </h1>
              <span className="text-xs px-2.5 py-0.5 rounded-full font-medium bg-amber-50 text-amber-900 border border-amber-200 dark:bg-amber-950/40 dark:text-amber-200 dark:border-amber-800 tabular-nums">
                {pendingCount} awaiting approval
              </span>
            </div>
            <p className="text-xs text-stone-500 dark:text-stone-400 mt-1">
              Review credential submissions from new professionals before unlocking their service catalog.
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

        {/* Stats KPI Ribbon */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="p-4 bg-white dark:bg-stone-900 rounded-2xl border border-stone-200 dark:border-stone-800 flex items-center justify-between shadow-sm">
            <div className="space-y-0.5">
              <span className="text-xs text-stone-500 dark:text-stone-400 font-medium">
                Pending Provider Applications
              </span>
              <p className="text-2xl font-semibold text-amber-900 dark:text-amber-300 tabular-nums font-heading">
                {pendingCount}
              </p>
            </div>
            <div className="h-10 w-10 rounded-xl bg-amber-50 dark:bg-amber-950/50 flex items-center justify-center text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-800">
              <Clock className="h-5 w-5" />
            </div>
          </div>

          <div className="p-4 bg-white dark:bg-stone-900 rounded-2xl border border-stone-200 dark:border-stone-800 flex items-center justify-between shadow-sm">
            <div className="space-y-0.5">
              <span className="text-xs text-stone-500 dark:text-stone-400 font-medium">
                Total Activated Providers
              </span>
              <p className="text-2xl font-semibold text-teal-900 dark:text-teal-300 tabular-nums font-heading">
                {activeCount}
              </p>
            </div>
            <div className="h-10 w-10 rounded-xl bg-teal-50 dark:bg-teal-950/50 flex items-center justify-center text-teal-800 dark:text-teal-300 border border-teal-200 dark:border-teal-800">
              <CheckCircle2 className="h-5 w-5" />
            </div>
          </div>
        </div>

        {/* Search Bar Strip */}
        <div className="bg-white dark:bg-stone-900 rounded-2xl border border-stone-200 dark:border-stone-800 p-4 shadow-sm flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-stone-400 pointer-events-none" />
            <input
              type="text"
              placeholder="Search provider by name, email, or role..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-3 py-2 text-xs rounded-xl border border-stone-200 dark:border-stone-800 bg-stone-50/50 dark:bg-stone-900 focus:bg-white dark:focus:bg-stone-800 focus:outline-none focus:ring-2 focus:ring-[#115E59]/20 focus:border-[#115E59] text-stone-800 dark:text-stone-200 placeholder:text-stone-400 transition-all"
            />
          </div>

          <div className="text-xs text-stone-500 self-center">
            Showing <strong className="text-stone-900 dark:text-stone-100 tabular-nums">{filteredProviders.length}</strong> providers
          </div>
        </div>

        {/* Content Feed */}
        {providersLoading ? (
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="p-5 bg-white dark:bg-stone-900 rounded-2xl border border-stone-200 dark:border-stone-800 space-y-3"
              >
                <div className="flex justify-between items-center">
                  <Skeleton className="h-5 w-48 rounded" />
                  <Skeleton className="h-6 w-24 rounded-full" />
                </div>
                <Skeleton className="h-4 w-1/3 rounded" />
                <Skeleton className="h-8 w-32 rounded-lg ml-auto" />
              </div>
            ))}
          </div>
        ) : filteredProviders.length === 0 ? (
          <div className="text-center py-16 px-4 bg-white dark:bg-stone-900 rounded-2xl border border-dashed border-stone-300 dark:border-stone-800">
            <div className="h-14 w-14 rounded-2xl bg-teal-50 dark:bg-teal-950/40 flex items-center justify-center mx-auto text-teal-800 mb-4">
              <ShieldCheck className="h-7 w-7 text-teal-800" />
            </div>
            <h3 className="mb-1 text-sm font-semibold text-stone-900 dark:text-stone-100">
              {searchQuery ? "No matching provider applications" : "No pending provider approvals"}
            </h3>
            <p className="mx-auto max-w-sm text-xs text-stone-500 dark:text-stone-400">
              {searchQuery
                ? `No pending accounts matched "${searchQuery}".`
                : "All submitted provider registrations have been reviewed and approved."}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredProviders.map((provider) => {
              const fullName =
                `${String(provider.first_name || "")} ${String(provider.last_name || "")}`.trim() ||
                "New Service Provider";
              const emailStr = String(provider.email || "");
              const regDate = provider.date_joined
                ? String(provider.date_joined)
                : provider.created_at
                ? String(provider.created_at)
                : null;
              const isItemProcessing = processingId === String(provider.id);

              return (
                <div
                  key={String(provider.id)}
                  className="bg-white dark:bg-stone-900 rounded-2xl border border-stone-200 dark:border-stone-800 p-5 shadow-sm hover:border-stone-300 dark:hover:border-stone-700 transition-colors flex flex-col justify-between gap-4"
                >
                  <div className="space-y-3">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <div className="flex items-center gap-2 mb-1 flex-wrap">
                          <h4 className="font-semibold text-stone-900 dark:text-stone-100 text-sm tracking-tight">
                            {fullName}
                          </h4>
                          <Badge className="bg-amber-50 text-amber-900 border-amber-200 dark:bg-amber-950/40 dark:text-amber-200 dark:border-amber-800 text-[10px] font-semibold">
                            Pending Approval
                          </Badge>
                          <Badge variant="outline" className="text-[10px] font-medium text-stone-600 dark:text-stone-400">
                            {provider.role || "SERVICE_PROVIDER"}
                          </Badge>
                        </div>

                        <p className="text-xs text-stone-600 dark:text-stone-400 flex items-center gap-1.5">
                          <Mail className="h-3.5 w-3.5 text-stone-400 shrink-0" />
                          <span className="truncate">{emailStr}</span>
                        </p>
                      </div>

                      <span className="text-[10px] font-mono font-medium text-stone-400 bg-stone-100 dark:bg-stone-800 px-2 py-0.5 rounded shrink-0">
                        #{String(provider.id).slice(0, 8)}
                      </span>
                    </div>
                  </div>

                  <div className="pt-3 border-t border-stone-100 dark:border-stone-800 flex items-center justify-between gap-3">
                    <span className="text-[11px] text-stone-400 flex items-center gap-1 tabular-nums">
                      <Calendar className="h-3.5 w-3.5 shrink-0" />
                      Registered: {regDate ? new Date(regDate).toLocaleDateString() : "Recently"}
                    </span>

                    <Button
                      size="sm"
                      onClick={() => handleApprove(provider.id)}
                      disabled={Boolean(processingId)}
                      className="bg-[#115E59] hover:bg-teal-800 text-white text-xs font-semibold rounded-xl shadow-tactile h-8 px-3"
                    >
                      {isItemProcessing ? (
                        <>
                          <Loader2 className="h-3.5 w-3.5 mr-1.5 animate-spin" />
                          <span>Approving...</span>
                        </>
                      ) : (
                        <>
                          <ShieldCheck className="h-3.5 w-3.5 mr-1.5" />
                          <span>Approve Provider</span>
                        </>
                      )}
                    </Button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </ProtectedRoute>
  );
}
