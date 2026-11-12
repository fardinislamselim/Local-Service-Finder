import * as React from "react";
import Link from "next/link";
import { Wrench } from "lucide-react";
import { ThemeToggle } from "@/components/shared/theme-toggle";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen flex flex-col justify-between bg-muted/30">
      <header className="p-4 sm:p-6 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2.5 font-bold text-lg">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary text-primary-foreground shadow-sm">
            <Wrench className="h-5 w-5" />
          </div>
          <span className="bg-gradient-to-r from-primary to-blue-600 bg-clip-text text-transparent">
            Local Service Finder
          </span>
        </Link>
        <ThemeToggle />
      </header>

      <main className="flex-1 flex items-center justify-center p-4 sm:p-6">
        {children}
      </main>

      <footer className="p-4 sm:p-6 text-center text-xs text-muted-foreground">
        © {new Date().getFullYear()} Local Service Finder. Built with Next.js 16, TanStack Query, and ofetch.
      </footer>
    </div>
  );
}

