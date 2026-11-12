"use client";

import * as React from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { XCircle, ArrowLeft, RotateCcw } from "lucide-react";
import { Header } from "@/components/layout/header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";

function FailContent() {
  const searchParams = useSearchParams();
  const tranId = searchParams?.get("tran_id") || "N/A";

  return (
    <Card className="max-w-md w-full text-center border-border/80 shadow-xl">
      <CardHeader className="space-y-3 pb-2">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-destructive/15 text-destructive">
          <XCircle className="h-10 w-10" />
        </div>
        <CardTitle className="text-2xl font-extrabold text-foreground">
          Payment Failed
        </CardTitle>
        <CardDescription>
          The transaction could not be processed by the payment provider or was declined.
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-3 py-4">
        {tranId !== "N/A" && (
          <div className="p-3 rounded-lg bg-muted/40 border border-border/60 text-xs text-left">
            <span className="text-muted-foreground">Transaction Ref: </span>
            <span className="font-mono font-semibold">{tranId}</span>
          </div>
        )}
      </CardContent>

      <CardFooter className="flex flex-col gap-2">
        <Button asChild className="w-full gap-2 font-semibold">
          <Link href="/dashboard/customer/bookings">
            <RotateCcw className="h-4 w-4" />
            Retry in My Bookings
          </Link>
        </Button>

        <Button variant="ghost" asChild className="w-full text-xs">
          <Link href="/">Back to Home</Link>
        </Button>
      </CardFooter>
    </Card>
  );
}

export default function PaymentFailPage() {
  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />
      <main className="flex-1 flex items-center justify-center p-4 sm:p-8">
        <React.Suspense fallback={<div className="p-8">Loading status...</div>}>
          <FailContent />
        </React.Suspense>
      </main>
    </div>
  );
}

