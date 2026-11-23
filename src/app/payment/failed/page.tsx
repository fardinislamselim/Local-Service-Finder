"use client";

import * as React from "react";
import Link from "next/link";
import { XCircle, ArrowRight, RotateCcw, Search, Calendar } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function PaymentFailedPage() {
  return (
    <div className="min-h-screen bg-[#FAF9F6] flex items-center justify-center p-6 sm:p-10">
      <div className="max-w-lg w-full rounded-3xl bg-white border border-stone-200 p-8 sm:p-10 shadow-tactile text-center space-y-6">
        <div className="w-16 h-16 rounded-2xl bg-rose-50 border border-rose-200 flex items-center justify-center text-rose-600 mx-auto">
          <XCircle className="h-8 w-8" />
        </div>

        <div className="space-y-2">
          <span className="text-[10px] uppercase font-bold tracking-wider px-3 py-1 rounded-full bg-rose-100 text-rose-800 border border-rose-200">
            Payment Unsuccessful
          </span>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-stone-900 font-heading">
            Payment Cancelled or Failed
          </h2>
          <p className="text-xs text-stone-500 leading-relaxed max-w-sm mx-auto">
            The transaction could not be completed via SSLCommerz. Your card or mobile wallet was not charged.
          </p>
        </div>

        <div className="p-4 rounded-xl bg-stone-50 border border-stone-200 text-xs text-stone-600 text-left space-y-1">
          <div className="font-bold text-stone-900">What would you like to do?</div>
          <p className="text-[11px] text-stone-500">
            Your booking is still preserved in your account. You can return to your dashboard and retry the payment anytime.
          </p>
        </div>

        <div className="pt-2 flex flex-col sm:flex-row items-center gap-3">
          <Button asChild className="w-full sm:w-auto flex-1 font-bold h-11 gap-2 shadow-md">
            <Link href="/dashboard/customer/bookings">
              <Calendar className="h-4 w-4" />
              <span>Retry in Bookings</span>
            </Link>
          </Button>

          <Button variant="outline" asChild className="w-full sm:w-auto flex-1 h-11 gap-2">
            <Link href="/services">
              <Search className="h-4 w-4" />
              <span>Explore Services</span>
            </Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
