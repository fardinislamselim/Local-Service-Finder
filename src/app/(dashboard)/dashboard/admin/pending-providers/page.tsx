"use client";

import * as React from "react";
import Link from "next/link";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { ArrowLeft, CheckCircle, Shield, Search, Mail, User } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { dashboardService } from "@/features/dashboard/services/dashboard.service";
import type { PendingAccount } from "@/types/api";

export default function PendingProvidersPage() {
  const queryClient = useQueryClient();
  const [search, setSearch] = React.useState("");

  const { data, isLoading } = useQuery({
    queryKey: ["dashboard", "admin", "pending_accounts"],
    queryFn: () => dashboardService.getPendingAccounts(),
  });

  const accounts: PendingAccount[] = Array.isArray(data) ? data : data?.results || [];

  const activateMutation = useMutation({
    mutationFn: (userId: number | string) => dashboardService.activateAccount(userId),
    onSuccess: () => {
      toast.success("Account approved and activated! The provider can now log in.");
      queryClient.invalidateQueries({ queryKey: ["dashboard", "admin"] });
    },
    onError: (err: any) => {
      toast.error(err?.message || "Failed to activate account.");
    },
  });

  const filtered = React.useMemo(() => {
    if (!search.trim()) return accounts;
    const q = search.toLowerCase();
    return accounts.filter(
      (a) =>
        a.email?.toLowerCase().includes(q) ||
        a.first_name?.toLowerCase().includes(q) ||
        a.last_name?.toLowerCase().includes(q)
    );
  }, [accounts, search]);

  return (
    <div className="space-y-6">
      <Link
        href="/dashboard/admin"
        className="inline-flex items-center text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
      >
        <ArrowLeft className="mr-2 h-4 w-4" />
        Back to admin overview
      </Link>

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">Provider Approvals</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Review service provider registrations and approve their platform access.
          </p>
        </div>

        <div className="relative w-full sm:w-72">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search by name or email..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9 h-9"
          />
        </div>
      </div>

      {isLoading ? (
        <div className="space-y-3">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-24 rounded-xl" />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <Card className="p-12 text-center text-muted-foreground">
          <Shield className="mx-auto h-12 w-12 text-muted-foreground/40 mb-3" />
          <h3 className="font-semibold text-base text-foreground">No pending accounts found</h3>
          <p className="text-sm mt-1">
            {search ? `No accounts match "${search}".` : "All provider registrations are approved."}
          </p>
        </Card>
      ) : (
        <div className="space-y-3">
          {filtered.map((acc) => (
            <Card key={acc.id} className="border-border/80 shadow-sm">
              <CardContent className="p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-base">
                      {acc.first_name || ""} {acc.last_name || ""}
                    </span>
                    <Badge variant="warning" className="text-[10px] font-bold uppercase">
                      Needs Activation
                    </Badge>
                  </div>

                  <div className="flex flex-wrap items-center gap-4 text-xs text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <Mail className="h-3.5 w-3.5 text-primary" />
                      {acc.email}
                    </span>
                    <span>Role: <strong className="text-foreground">{acc.role}</strong></span>
                    <span>Account ID: #{acc.id}</span>
                  </div>
                </div>

                <Button
                  size="sm"
                  className="gap-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold"
                  disabled={activateMutation.isPending}
                  onClick={() => activateMutation.mutate(acc.id)}
                >
                  <CheckCircle className="h-4 w-4" />
                  Approve & Activate
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}

