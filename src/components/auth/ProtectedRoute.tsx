"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import { ShieldAlert, ArrowLeft, LayoutDashboard, Loader2 } from "lucide-react";
import { useAuthStore } from "@/store/useAuthStore";
import { Button } from "@/components/ui/button";
import type { UserRole } from "@/types/api";

interface ProtectedRouteProps {
  children: React.ReactNode;
  allowedRoles?: UserRole[];
}

export function ProtectedRoute({ children, allowedRoles }: ProtectedRouteProps) {
  const router = useRouter();
  const pathname = usePathname();
  const { isAuthenticated, user, profile, hasHydrated } = useAuthStore();
  const [mounted, setMounted] = React.useState(false);

  React.useEffect(() => {
    setMounted(true);
  }, []);

  React.useEffect(() => {
    if (mounted && hasHydrated && !isAuthenticated) {
      router.push(`/login?redirect=${encodeURIComponent(pathname)}`);
    }
  }, [mounted, hasHydrated, isAuthenticated, pathname, router]);

  // Wait for both the mount and the persisted store: checking the role before
  // rehydration is what produced false 403s for ADMIN / SERVICE_PROVIDER users.
  if (!mounted || !hasHydrated) {
    return (
      <div className="min-h-[50vh] flex items-center justify-center">
        <Loader2 className="h-6 w-6 animate-spin text-teal-800" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-[50vh] flex items-center justify-center">
        <Loader2 className="h-6 w-6 animate-spin text-teal-800" />
      </div>
    );
  }

  const role = user?.role || profile?.role;

  // Check role authorization
  if (allowedRoles && allowedRoles.length > 0 && role && !allowedRoles.includes(role)) {
    const fallbackDashboard =
      role === "ADMIN"
        ? "/dashboard/admin"
        : role === "SERVICE_PROVIDER"
        ? "/dashboard/provider"
        : "/dashboard/customer";

    return (
      <div className="min-h-[70vh] flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-2xl p-8 text-center space-y-5 shadow-tactile">
          <div className="w-16 h-16 mx-auto rounded-2xl bg-rose-50 border border-rose-200 flex items-center justify-center text-rose-600 shadow-sm">
            <ShieldAlert className="h-8 w-8" />
          </div>
          <div className="space-y-2">
            <span className="text-xs font-semibold tracking-widest text-rose-600 bg-rose-50 px-2.5 py-1 rounded-full border border-rose-200">
              403 • Access Restricted
            </span>
            <h2 className="text-2xl font-semibold text-stone-900 dark:text-stone-100 font-heading">
              Restricted Area
            </h2>
            <p className="text-xs text-stone-500 dark:text-stone-400 leading-relaxed">
              Your account ({role}) does not have permission to view this section of Local Service Finder.
            </p>
          </div>

          <div className="pt-2 flex flex-col gap-2">
            <Button asChild className="w-full font-semibold gap-2">
              <Link href={fallbackDashboard}>
                <LayoutDashboard className="h-4 w-4" />
                <span>Go to My Dashboard</span>
              </Link>
            </Button>
            <Button variant="outline" asChild className="w-full">
              <Link href="/">Return to Home</Link>
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}

export default ProtectedRoute;
