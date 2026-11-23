"use client";

import * as React from "react";
import { usePathname } from "next/navigation";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";

export function RootLayoutShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  // Pages where global header/footer should NOT be duplicated or displayed:
  // 1. Dashboard routes: /dashboard, /dashboard/*, and /profile (which is inside the (dashboard) route group with its own header & sidebar)
  // 2. Auth routes: /login, /register, /forgot-password, /reset-password (which have their own dedicated full-page split layout)
  const isDashboardRoute = pathname.startsWith("/dashboard") || pathname.startsWith("/profile");
  const isAuthRoute =
    pathname === "/login" ||
    pathname === "/register" ||
    pathname === "/forgot-password" ||
    pathname === "/reset-password";

  if (isDashboardRoute || isAuthRoute) {
    return <>{children}</>;
  }

  return (
    <div className="min-h-screen flex flex-col bg-[#FAF9F6] text-stone-900">
      <Navbar />
      <main className="flex-1 w-full flex flex-col">{children}</main>
      <Footer />
    </div>
  );
}
