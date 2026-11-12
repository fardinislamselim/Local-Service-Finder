"use client";

import * as React from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { CheckCircle2, ArrowRight, Calendar, ExternalLink } from "lucide-react";
import { Header } from "@/components/layout/header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";

function SuccessContent() {
  const searchParams = useSearchParams();
  const tranId = searchParams?.get("tran_id") || searchParams?.get("tranId") || "N/A";
  const valId = searchParams?.get("val_id") || searchParams?.get("valId") || "N/A";

  return (
    <Card className="max-w-md w-full text-center border-border/80 shadow-xl">
      <CardHeader className="space-y-3 pb-2">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-emerald-500/15 text-emerald-600 dark:text-emerald-400">
          <CheckCircle2 className="h-10 w-10" />
        </div>
        <CardTitle className="text-2xl font-extrabold text-foreground">
          Payment Successful!
        </CardTitle>
        <CardDescription>
          Your payment transaction has been verified and processed by the gateway.
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-3 py-4">
        <div className="p-4 rounded-xl bg-muted/40 border border-border/60 text-xs text-left space-y-2">
          <div className="flex justify-between">
            <span className="text-muted-foreground">Transaction ID:</span>
            <span className="font-mono font-semibold text-foreground">{tranId}</span>
          </div>
          {valId !== "N/A" && (
            <div className="flex justify-between">
              <span className="text-muted-foreground">Validation ID:</span>
              <span className="font-mono font-semibold text-foreground">{valId}</span>
            </div>
          )}
          <div className="flex justify-between">
            <span className="text-muted-foreground">Status:</span>
            <span className="font-bold text-emerald-600 dark:text-emerald-400">PAID</span>
          </div>
        </div>
      </CardContent>

      <CardFooter className="flex flex-col gap-2">
        <Button asChild className="w-full gap-2 font-semibold">
          <Link href="/dashboard/customer/bookings">
            <Calendar className="h-4 w-4" />
            Go to My Bookings
          </Link>
        </Button>

        <Button variant="ghost" asChild className="w-full text-xs">
          <Link href="/">Back to Home</Link>
        </Button>
      </CardFooter>
    </Card>
  );
}

export default function PaymentSuccessPage() {
  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />
      <main className="flex-1 flex items-center justify-center p-4 sm:p-8">
        <React.Suspense fallback={<div className="p-8">Verifying transaction...</div>}>
          <SuccessContent />
        </React.Suspense>
      </main>
    </div>
  );
}

