"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
import { useAuth } from "@/features/auth/hooks/use-auth";

export default function DashboardIndexPage() {
  const router = useRouter();
  const { user, isLoading } = useAuth();

  React.useEffect(() => {
    if (!isLoading && user) {
      if (user.role === "ADMIN") {
        router.replace("/dashboard/admin");
      } else if (user.role === "SERVICE_PROVIDER") {
        router.replace("/dashboard/provider");
      } else {
        router.replace("/dashboard/customer");
      }
    }
  }, [isLoading, user, router]);

  return (
    <div className="flex h-64 w-full flex-col items-center justify-center gap-3">
      <Loader2 className="h-8 w-8 animate-spin text-primary" />
      <p className="text-sm text-muted-foreground animate-pulse">
        Loading your personalized dashboard...
      </p>
    </div>
  );
}

