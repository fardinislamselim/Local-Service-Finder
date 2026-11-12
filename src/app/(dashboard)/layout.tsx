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
      <div className="min-h-screen flex flex-col bg-background">
        <Header />
        <div className="flex-1 flex">
          <DashboardSidebar />
          <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto overflow-y-auto">
            {children}
          </main>
        </div>
      </div>
    </AuthGuard>
  );
}

