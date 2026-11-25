"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
import { useAuth } from "@/features/auth/hooks/use-auth";
import { useAuthStore } from "@/store/useAuthStore";

export default function DashboardIndexPage() {
  const router = useRouter();
  const { user: queryUser, isLoading } = useAuth();
  const { user, hasHydrated } = useAuthStore();

  const role = user?.role || queryUser?.role;

  React.useEffect(() => {
    if (!hasHydrated) return;
    if (!role) return;

    if (role === "ADMIN") {
      router.replace("/dashboard/admin");
    } else if (role === "SERVICE_PROVIDER") {
      router.replace("/dashboard/provider");
    } else {
      router.replace("/dashboard/customer");
    }
  }, [hasHydrated, role, router]);

  return (
    <div className="flex h-64 w-full flex-col items-center justify-center gap-3">
      <Loader2 className="h-8 w-8 animate-spin text-primary" />
      <p className="text-sm text-muted-foreground animate-pulse">
        {isLoading && !role ? "Loading your account..." : "Loading your personalized dashboard..."}
      </p>
    </div>
  );
}
