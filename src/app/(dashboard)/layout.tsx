import * as React from "react";
import { Header } from "@/components/layout/header";
import { DashboardSidebar } from "@/components/layout/sidebar";
import { AuthGuard } from "@/components/shared/auth-guard";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <AuthGuard>
      <div className="min-h-screen md:h-screen flex flex-col bg-background md:overflow-hidden">
        <Header />
        <div className="flex-1 flex flex-col md:flex-row md:overflow-hidden min-h-0 relative">
          <DashboardSidebar />
          <main className="flex-1 min-w-0 p-4 sm:p-6 lg:p-8 md:overflow-y-auto">
            <div className="max-w-7xl w-full mx-auto">
              {children}
            </div>
          </main>
        </div>
      </div>
    </AuthGuard>
  );
}

