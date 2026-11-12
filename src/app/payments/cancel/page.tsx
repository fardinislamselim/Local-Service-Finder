"use client";

import * as React from "react";
import Link from "next/link";
import { AlertCircle, RotateCcw } from "lucide-react";
import { Header } from "@/components/layout/header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";

export default function PaymentCancelPage() {
  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />
      <main className="flex-1 flex items-center justify-center p-4 sm:p-8">
        <Card className="max-w-md w-full text-center border-border/80 shadow-xl">
          <CardHeader className="space-y-3 pb-2">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-amber-500/15 text-amber-600 dark:text-amber-400">
              <AlertCircle className="h-10 w-10" />
            </div>
            <CardTitle className="text-2xl font-extrabold text-foreground">
              Payment Cancelled
            </CardTitle>
            <CardDescription>
              You cancelled the payment gateway session. No charges were made to your account.
            </CardDescription>
          </CardHeader>

          <CardFooter className="flex flex-col gap-2 pt-4">
            <Button asChild className="w-full gap-2 font-semibold">
              <Link href="/dashboard/customer/bookings">
                <RotateCcw className="h-4 w-4" />
                Return to Bookings
              </Link>
            </Button>

            <Button variant="ghost" asChild className="w-full text-xs">
              <Link href="/">Back to Home</Link>
            </Button>
          </CardFooter>
        </Card>
      </main>
    </div>
  );
}

