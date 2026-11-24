"use client";

import * as React from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import {
  CheckCircle2,
  Clock,
  ShieldCheck,
  User,
  Mail,
  Calendar,
  Search,
  Filter,
  Loader2,
  AlertCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { adminService } from "@/features/admin/services/admin.service";
import type { PendingAccount } from "@/types/api";

export function AdminPendingProvidersTab() {
  const queryClient = useQueryClient();
  const [searchQuery, setSearchQuery] = React.useState("");

  const { data: pendingProviders = [], isLoading } = useQuery({
    queryKey: ["admin", "pending_providers"],
    queryFn: () => adminService.getPendingProviders(),
  });

  const approveMutation = useMutation({
    mutationFn: (userId: string | number) => adminService.approveProvider(userId),
    onSuccess: (res) => {
      toast.success(res?.message || "Provider account activated successfully!");
      queryClient.invalidateQueries({ queryKey: ["admin"] });
    },
    onError: (err: any) => {
      toast.error(err?.message || "Failed to approve provider account.");
    },
  });

  const filteredProviders = React.useMemo(() => {
    if (!searchQuery.trim()) return pendingProviders;
    const q = searchQuery.toLowerCase();
    return pendingProviders.filter((p) => {
      const name = `${p.first_name || ""} ${p.last_name || ""}`.toLowerCase();
      const email = (p.email || "").toLowerCase();
      const phone = String(p.phone_number || "").toLowerCase();
      return name.includes(q) || email.includes(q) || phone.includes(q);
    });
  }, [pendingProviders, searchQuery]);

  return (
    <div className="space-y-6">
      {/* Top Filter Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-white dark:bg-stone-900 p-3.5 rounded-xl border border-stone-200 dark:border-stone-800 shadow-sm">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-stone-400" />
          <input
            type="text"
            placeholder="Search provider by name, email or phone..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 text-xs rounded-lg border border-stone-200 dark:border-stone-700 bg-stone-50 dark:bg-stone-800 focus:bg-white dark:focus:bg-stone-900 focus:outline-none focus:ring-1 focus:ring-stone-400 text-stone-800 dark:text-stone-200 placeholder:text-stone-400"
          />
        </div>

        <div className="text-xs text-stone-500 font-normal self-center">
          Showing <span className="font-semibold text-stone-800 dark:text-stone-200">{filteredProviders.length}</span> awaiting verification
        </div>
      </div>

      {/* Content Feed */}
      {isLoading ? (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="p-5 bg-white dark:bg-stone-900 rounded-xl border border-stone-200 dark:border-stone-800 space-y-2">
              <Skeleton className="h-5 w-48 rounded" />
              <Skeleton className="h-3.5 w-1/3 rounded" />
            </div>
          ))}
        </div>
      ) : filteredProviders.length === 0 ? (
        <div className="text-center py-12 px-4 bg-white dark:bg-stone-900 rounded-xl border border-stone-200 dark:border-stone-800 space-y-2">
          <div className="h-10 w-10 rounded-lg bg-stone-100 dark:bg-stone-800 flex items-center justify-center mx-auto text-stone-400">
            <CheckCircle2 className="h-5 w-5 text-emerald-600" />
          </div>
          <h3 className="text-sm font-semibold text-stone-900 dark:text-stone-100">
            {searchQuery ? "No matching providers" : "No pending approvals"}
          </h3>
          <p className="text-xs text-stone-500 max-w-sm mx-auto">
            {searchQuery
              ? "No pending providers match your search term."
              : "All provider applications have been reviewed."}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
          {filteredProviders.map((provider) => {
            const fullName = `${String(provider.first_name || "")} ${String(provider.last_name || "")}`.trim() || "Service Provider";
            const emailStr = String(provider.email || "");
            const phoneStr = provider.phone_number ? String(provider.phone_number) : null;
            const regDate = provider.date_joined ? String(provider.date_joined) : (provider.created_at ? String(provider.created_at) : null);
            const isSubmitting = approveMutation.isPending && approveMutation.variables === provider.id;

            return (
              <div
                key={String(provider.id)}
                className="bg-white rounded-2xl border border-stone-200 p-5 shadow-sm hover:shadow-md transition-all flex flex-col justify-between gap-4"
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <h4 className="font-semibold text-stone-900 text-base">{fullName}</h4>
                      <Badge className="bg-amber-100 text-amber-900 border-amber-200 text-[10px] font-semibold">
                        Pending Verification
                      </Badge>
                    </div>
                    <p className="text-xs text-stone-600 flex items-center gap-1.5">
                      <Mail className="h-3.5 w-3.5 text-stone-400" />
                      {emailStr}
                    </p>
                    {phoneStr && (
                      <p className="text-xs text-stone-600 flex items-center gap-1.5 mt-0.5 font-mono">
                        <User className="h-3.5 w-3.5 text-stone-400" />
                        {phoneStr}
                      </p>
                    )}
                  </div>
                </div>

                <div className="pt-3 border-t border-stone-100 flex items-center justify-between gap-3">
                  <span className="text-[11px] text-stone-400 flex items-center gap-1">
                    <Calendar className="h-3.5 w-3.5" />
                    Registered: {regDate ? new Date(regDate).toLocaleDateString() : "Recently"}
                  </span>

                  <Button
                    size="sm"
                    onClick={() => approveMutation.mutate(provider.id)}
                    disabled={approveMutation.isPending}
                    className="bg-[#0F5132] hover:bg-[#0B3D26] text-white text-xs font-semibold rounded-xl shadow-tactile"
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="h-3.5 w-3.5 mr-1.5 animate-spin" />
                        Activating...
                      </>
                    ) : (
                      <>
                        <ShieldCheck className="h-3.5 w-3.5 mr-1.5" />
                        Approve Provider
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
  );
}
