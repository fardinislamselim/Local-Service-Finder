"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
import { useAuth } from "@/features/auth/hooks/use-auth";

export default function BookingsRedirectPage() {
  const router = useRouter();
  const { user, isLoading } = useAuth();

  useEffect(() => {
    if (isLoading) return;
    if (user?.role === "SERVICE_PROVIDER") {
      router.replace("/dashboard/provider/bookings");
    } else {
      router.replace("/dashboard/customer/bookings");
    }
  }, [user, isLoading, router]);

  return (
    <div className="flex h-dvh w-full items-center justify-center">
      <Loader2 className="h-8 w-8 animate-spin text-primary" />
    </div>
  );
}

