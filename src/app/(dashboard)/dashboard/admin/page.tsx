"use client";

import * as React from "react";
import Link from "next/link";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  Shield,
  Users,
  Clock,
  CheckCircle,
  FolderTree,
  MapPin,
  ArrowRight,
  ShieldCheck,
} from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { dashboardService } from "@/features/dashboard/services/dashboard.service";
import { useAuth } from "@/features/auth/hooks/use-auth";
import type { PendingAccount } from "@/types/api";

export default function AdminDashboardPage() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const { data: totalActive } = useQuery({
    queryKey: ["dashboard", "admin", "total_active"],
    queryFn: () => dashboardService.getTotalActiveAccountCount(),
  });

  const { data: totalPending } = useQuery({
    queryKey: ["dashboard", "admin", "total_pending"],
    queryFn: () => dashboardService.getTotalPendingAccountCount(),
  });

  const { data: pendingAccountsData, isLoading: accountsLoading } = useQuery({
    queryKey: ["dashboard", "admin", "pending_accounts"],
    queryFn: () => dashboardService.getPendingAccounts(),
  });

  const pendingAccounts: PendingAccount[] = Array.isArray(pendingAccountsData)
    ? pendingAccountsData
    : pendingAccountsData?.results || [];

  const activateMutation = useMutation({
    mutationFn: (userId: number | string) => dashboardService.activateAccount(userId),
    onSuccess: () => {
      toast.success("Provider account approved and activated successfully!");
      queryClient.invalidateQueries({ queryKey: ["dashboard", "admin"] });
    },
    onError: (err: any) => {
      toast.error(err?.message || "Failed to activate account.");
    },
  });

  const activeCount =
    typeof totalActive === "number"
      ? totalActive
      : (totalActive as any)?.total_activate_account_count ?? (totalActive as any)?.count ?? 0;

  const pendingCount =
    typeof totalPending === "number"
      ? totalPending
      : (totalPending as any)?.total_activate_pending_count ?? (totalPending as any)?.count ?? pendingAccounts.length;

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 rounded-2xl bg-gradient-to-r from-primary/10 via-primary/5 to-transparent border border-primary/20">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
            Administrator Console
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Welcome, {user?.first_name || "Admin"}. Manage user approvals, categories, and territorial coverage.
          </p>
        </div>

        <div className="flex gap-2">
          <Button variant="outline" asChild>
            <Link href="/dashboard/admin/categories">
              <FolderTree className="mr-2 h-4 w-4" />
              Categories
            </Link>
          </Button>
          <Button variant="outline" asChild>
            <Link href="/dashboard/admin/locations">
              <MapPin className="mr-2 h-4 w-4" />
              Locations
            </Link>
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <Card className="border-border/80 shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Active Accounts
            </CardTitle>
            <Users className="h-4 w-4 text-emerald-500" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-emerald-600 dark:text-emerald-400">
              {activeCount}
            </div>
            <p className="text-xs text-muted-foreground mt-1">Approved & active members</p>
          </CardContent>
        </Card>

        <Card className="border-border/80 shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Pending Approvals
            </CardTitle>
            <Clock className="h-4 w-4 text-amber-500" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-amber-600 dark:text-amber-400">
              {pendingCount}
            </div>
            <p className="text-xs text-muted-foreground mt-1">Providers awaiting review</p>
          </CardContent>
        </Card>

        <Card className="border-border/80 shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Categories Management
            </CardTitle>
            <FolderTree className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <Button variant="link" asChild className="p-0 h-auto font-bold text-primary">
              <Link href="/dashboard/admin/categories">Manage Categories →</Link>
            </Button>
            <p className="text-xs text-muted-foreground mt-1">Create, update & archive</p>
          </CardContent>
        </Card>

        <Card className="border-border/80 shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Geographic Coverage
            </CardTitle>
            <MapPin className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <Button variant="link" asChild className="p-0 h-auto font-bold text-primary">
              <Link href="/dashboard/admin/locations">Manage Locations →</Link>
            </Button>
            <p className="text-xs text-muted-foreground mt-1">Divisions, districts, upazilas</p>
          </CardContent>
        </Card>
      </div>

      {/* Pending Provider Approvals Table */}
      <Card className="border-border/80 shadow-sm">
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle className="text-lg font-bold">Unapproved Provider Accounts</CardTitle>
            <CardDescription>
              Service provider accounts require administrator activation before they can log in.
            </CardDescription>
          </div>
          <Button variant="ghost" size="sm" asChild className="gap-1 text-primary font-semibold">
            <Link href="/dashboard/admin/pending-providers">
              View All <ArrowRight className="h-4 w-4" />
            </Link>
          </Button>
        </CardHeader>

        <CardContent>
          {accountsLoading ? (
            <div className="space-y-3">
              {Array.from({ length: 3 }).map((_, i) => (
                <Skeleton key={i} className="h-16 rounded-lg" />
              ))}
            </div>
          ) : pendingAccounts.length === 0 ? (
            <div className="py-10 text-center text-muted-foreground text-sm">
              All provider registrations are currently approved and active.
            </div>
          ) : (
            <div className="space-y-3">
              {pendingAccounts.slice(0, 5).map((account) => (
                <div
                  key={account.id}
                  className="p-4 rounded-xl border border-border/70 bg-card flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                >
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-base">
                        {account.first_name || ""} {account.last_name || ""}
                      </span>
                      <Badge variant="warning" className="text-[10px] font-bold uppercase">
                        Pending Approval
                      </Badge>
                    </div>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      Email: <strong>{account.email}</strong> | Role: {account.role}
                    </p>
                  </div>

                  <Button
                    size="sm"
                    className="gap-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold"
                    disabled={activateMutation.isPending}
                    onClick={() => activateMutation.mutate(account.id)}
                  >
                    <CheckCircle className="h-4 w-4" />
                    Approve & Activate
                  </Button>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

