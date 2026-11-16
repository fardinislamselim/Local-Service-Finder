"use client";

import * as React from "react";
import { Button } from "@/components/ui/button";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html lang="en">
      <body className="min-h-screen flex items-center justify-center p-6 bg-background text-foreground font-sans">
        <div className="max-w-md w-full text-center space-y-4">
          <h2 className="text-2xl font-bold tracking-tight">Something went wrong</h2>
          <p className="text-sm text-muted-foreground">
            {error?.message || "An unexpected error occurred. Please try again."}
          </p>
          <Button onClick={() => reset()} className="mt-4">
            Try again
          </Button>
        </div>
      </body>
    </html>
  );
}
