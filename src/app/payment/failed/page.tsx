"use client";

import * as React from "react";
import Link from "next/link";
import { XCircle, Search, Calendar } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function PaymentFailedPage() {
  return (
    <div className="min-h-screen bg-[#FAF9F6] dark:bg-stone-950 flex items-center justify-center p-4 sm:p-6">
      <div className="max-w-md w-full rounded-2xl bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 p-6 sm:p-8 shadow-xs text-center space-y-5">
        <div className="w-12 h-12 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800/60 flex items-center justify-center text-rose-600 dark:text-rose-400 mx-auto">
          <XCircle className="h-6 w-6" />
        </div>

        <div className="space-y-1">
          <div className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-medium bg-rose-50 text-rose-700 border border-rose-200 dark:bg-rose-950/50 dark:text-rose-300 dark:border-rose-800">
            Payment incomplete
          </div>
          <h2 className="text-xl font-semibold text-stone-900 dark:text-stone-100 pt-1">
            Transaction cancelled or failed
          </h2>
          <p className="text-xs text-stone-500 leading-relaxed max-w-xs mx-auto">
            The transaction could not be processed via SSLCommerz. Your account has not been charged.
          </p>
        </div>

        <div className="p-3.5 rounded-xl bg-stone-50 dark:bg-stone-800/40 border border-stone-200 dark:border-stone-800 text-xs text-stone-600 dark:text-stone-400 text-left space-y-1">
          <div className="font-medium text-stone-900 dark:text-stone-100">Booking preserved</div>
          <p className="text-[11px] text-stone-500 leading-relaxed">
            Your booking request is safely saved in your account. You can retry payment at any time from your bookings tab.
          </p>
        </div>

        <div className="pt-1 flex flex-col sm:flex-row items-center gap-2.5">
          <Button asChild className="w-full sm:w-auto flex-1 font-medium h-10 text-xs bg-[#EA580C] hover:bg-[#c2410c] text-white shadow-xs gap-1.5">
            <Link href="/dashboard/customer/bookings">
              <Calendar className="h-3.5 w-3.5" />
              <span>Retry in bookings</span>
            </Link>
          </Button>

          <Button variant="outline" asChild className="w-full sm:w-auto flex-1 h-10 text-xs border-stone-200 dark:border-stone-800 gap-1.5">
            <Link href="/services">
              <Search className="h-3.5 w-3.5" />
              <span>Explore services</span>
            </Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
