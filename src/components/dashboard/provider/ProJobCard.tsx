"use client";

import * as React from "react";
import Link from "next/link";
import {
  Calendar,
  Clock,
  User,
  Phone,
  Mail,
  AlertCircle,
  CheckCircle2,
  XCircle,
  CreditCard,
  Banknote,
  DollarSign,
  Loader2,
  ShieldCheck,
  Info,
  ExternalLink,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { getBookingStatusInfo, getPaymentStatusInfo } from "@/lib/statusHelpers";
import type { Booking, Service } from "@/types/api";

interface ProJobCardProps {
  booking: Booking;
  resolvedService?: Service | null;
  isServicesLoading?: boolean;
  onAccept: (booking: Booking) => void;
  onReject: (booking: Booking) => void;
  onComplete: (booking: Booking) => void;
  onConfirmCash: (booking: Booking) => void;
  actionLoadingType?: "accept" | "reject" | "complete" | "cash" | null;
}

export function ProJobCard({
  booking,
  resolvedService,
  isServicesLoading,
  onAccept,
  onReject,
  onComplete,
  onConfirmCash,
  actionLoadingType,
}: ProJobCardProps) {
  const statusInfo = getBookingStatusInfo(booking.status);
  const paymentInfo = getPaymentStatusInfo(booking.payment_status);

  const status = String(booking.status || "").toLowerCase();
  const isPending = status === "pending";
  const isAccepted = status === "accepted";
  const isCompleted = status === "completed";

  const isCash = String(booking.final_payment_method || "").toLowerCase() === "cash";
  const isOnline = String(booking.final_payment_method || "").toLowerCase() === "online";

  const paidAmount = Number(booking.paid_amount || 0);
  const remainingAmount = Number(booking.remaining_amount || 0);
  const totalPrice = Number(booking.price_at_booking || booking.total_amount || 0);
  const cashDue = remainingAmount > 0 ? remainingAmount : (!booking.is_paid ? Math.max(0, totalPrice - paidAmount) : 0);
  const showCashCollection = isCompleted && isCash && !booking.is_paid && cashDue > 0;

  // CRITICAL SCHEDULED-TIME GUARD: Compare current local date/time against booking_date + booking_time
  const isScheduledTimePassed = React.useMemo(() => {
    if (!booking.booking_date) return true;
    try {
      const timeStr = booking.booking_time ? booking.booking_time.slice(0, 5) : "00:00";
      const scheduledIso = `${booking.booking_date}T${timeStr}:00`;
      const scheduledDate = new Date(scheduledIso);
      if (isNaN(scheduledDate.getTime())) return true;
      return Date.now() >= scheduledDate.getTime();
    } catch {
      return true;
    }
  }, [booking.booking_date, booking.booking_time]);

  // Resolve Real Service Name (avoid displaying raw UUID like "Service #af1d11c6-...")
  const serviceId =
    typeof booking.service === "object" && booking.service
      ? (booking.service as any).id
      : booking.service;

  const resolvedServiceName = React.useMemo(() => {
    if (resolvedService?.name) return resolvedService.name;
    if (typeof booking.service === "object" && booking.service) {
      return (booking.service as any).name || (booking.service as any).title;
    }
    if (booking.service_name && !booking.service_name.startsWith("Service #")) {
      return booking.service_name;
    }
    if (booking.service_title && !booking.service_title.startsWith("Service #")) {
      return booking.service_title;
    }
    if (isServicesLoading) {
      return null;
    }
    return "Verified Local Service";
  }, [resolvedService, booking, isServicesLoading]);

  const customerName =
    typeof booking.customer === "object" && booking.customer
      ? (booking.customer as any).full_name || (booking.customer as any).username
      : booking.customer_name || "Customer";

  const customerPhone =
    typeof booking.customer === "object" && booking.customer
      ? (booking.customer as any).phone_number || (booking.customer as any).phone
      : booking.customer_phone;

  const isAccepting = actionLoadingType === "accept";
  const isRejecting = actionLoadingType === "reject";
  const isCompleting = actionLoadingType === "complete";
  const isCashConfirming = actionLoadingType === "cash";
  const isAnyActionLoading = Boolean(actionLoadingType);

  return (
    <div className="bg-white dark:bg-stone-900 rounded-xl border border-stone-200 dark:border-stone-800 p-5 shadow-sm hover:border-stone-300 dark:hover:border-stone-700 transition-colors flex flex-col justify-between gap-4">
      {/* Top Header Strip */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-stone-100 dark:border-stone-800 pb-3">
        <div>
          <div className="flex items-center gap-1.5 flex-wrap mb-1">
            <span className="text-[11px] font-mono font-medium text-stone-500 bg-stone-100 dark:bg-stone-800 px-2 py-0.5 rounded">
              #{String(booking.id).slice(0, 8)}
            </span>
            <Badge className={`${statusInfo.className} border text-[11px] font-medium`}>
              {statusInfo.label}
            </Badge>
            <Badge className={`${paymentInfo.className} border text-[11px] font-medium`}>
              {paymentInfo.label}
            </Badge>
            <span className="inline-flex items-center gap-1 text-[11px] font-medium text-stone-600 dark:text-stone-300 bg-stone-50 dark:bg-stone-800 px-2 py-0.5 rounded-full border border-stone-200 dark:border-stone-700">
              {isCash ? <Banknote className="h-3 w-3 text-emerald-700" /> : <CreditCard className="h-3 w-3 text-stone-500" />}
              {isCash ? "Final via cash" : "Final via SSLCommerz"}
            </span>
          </div>

          <div className="flex min-w-0 items-center gap-2">
            {resolvedServiceName === null ? (
              <Skeleton className="h-6 w-40 rounded-md sm:w-56" />
            ) : (
              <h3 className="truncate text-base font-semibold text-stone-900 dark:text-stone-100 tracking-tight">
                {resolvedServiceName}
              </h3>
            )}
            {serviceId && (
              <Link
                href={`/services/${serviceId}`}
                target="_blank"
                className="text-stone-400 hover:text-stone-700 dark:hover:text-stone-300 transition-colors"
                title="View service page"
              >
                <ExternalLink className="h-3.5 w-3.5" />
              </Link>
            )}
          </div>
        </div>

        {/* Customer Quick Info */}
        <div className="text-xs text-stone-600 dark:text-stone-400 space-y-0.5 sm:text-right">
          <p className="flex min-w-0 items-center gap-1 font-medium text-stone-800 dark:text-stone-200 sm:justify-end">
            <User className="h-3.5 w-3.5 text-stone-400" />
            <span className="truncate">{customerName}</span>
          </p>
          {customerPhone && (
            <p className="flex items-center gap-1 sm:justify-end font-mono text-[11px] text-stone-400">
              <Phone className="h-3 w-3 text-stone-400" />
              <span>{customerPhone}</span>
            </p>
          )}
        </div>
      </div>

      {/* Middle Specs & Timing */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 text-xs text-stone-600 dark:text-stone-400">
        <div className="flex items-center gap-2">
          <Calendar className="h-4 w-4 text-stone-500 shrink-0" />
          <span>
            Scheduled: <strong className="text-stone-900 dark:text-stone-100 tabular-nums">{booking.booking_date}</strong>
          </span>
        </div>

        <div className="flex items-center gap-2">
          <Clock className="h-4 w-4 text-stone-500 shrink-0" />
          <span>
            Time: <strong className="text-stone-900 dark:text-stone-100 tabular-nums">{booking.booking_time ? booking.booking_time.slice(0, 5) : ""}</strong>
          </span>
        </div>

        {booking.duration ? (
          <div className="flex items-center gap-2">
            <Clock className="h-4 w-4 text-stone-500 shrink-0" />
            <span>
              Duration: <strong className="text-stone-900 dark:text-stone-100">{booking.duration.replace("PT", "").toLowerCase()}</strong>
            </span>
          </div>
        ) : null}
      </div>

      {/* Customer Instruction / Note */}
      {booking.note && (
        <div className="p-3 rounded-xl bg-stone-50 dark:bg-stone-800/40 border border-stone-200 dark:border-stone-800 text-xs text-stone-700 dark:text-stone-300">
          <span className="font-medium text-stone-900 dark:text-stone-100 block text-[11px] mb-0.5">
            Customer instructions:
          </span>
          {booking.note}
        </div>
      )}

      {/* Itemized Financial Strip */}
      <div className="p-3 rounded-xl bg-stone-50 dark:bg-stone-800/40 border border-stone-200 dark:border-stone-800 flex flex-wrap items-center justify-between gap-3 text-xs">
        <div>
          <span className="text-stone-400 block text-[11px]">Agreed total</span>
          <span className="font-semibold text-stone-900 dark:text-stone-100 text-sm tabular-nums">৳{totalPrice.toLocaleString()}</span>
        </div>

        <div>
          <span className="text-stone-400 block text-[11px]">20% Advance status</span>
          <span className={`font-medium tabular-nums ${paidAmount > 0 ? "text-emerald-700 dark:text-emerald-400" : "text-amber-800 dark:text-amber-400"}`}>
            {paidAmount > 0 ? `৳${paidAmount.toLocaleString()} paid` : "Awaiting advance"}
          </span>
        </div>

        <div>
          <span className="text-stone-400 block text-[11px]">Final balance due</span>
          <span className="font-semibold text-stone-900 dark:text-stone-100 text-sm tabular-nums">৳{remainingAmount.toLocaleString()}</span>
        </div>
      </div>

      {/* Highlighted Cash Collection Banner */}
      {showCashCollection && (
        <div className="p-3.5 rounded-xl bg-emerald-50/80 dark:bg-emerald-950/40 border border-emerald-200/80 dark:border-emerald-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2 text-xs text-emerald-900 dark:text-emerald-200">
            <Banknote className="h-4 w-4 text-emerald-700 shrink-0" />
            <div>
              <span className="font-semibold block text-xs">Remaining cash due: ৳{cashDue.toLocaleString()}</span>
              <span className="text-[11px]">Collect from customer upon finishing service and confirm below.</span>
            </div>
          </div>

          <Button
            size="sm"
            onClick={() => onConfirmCash(booking)}
            disabled={isAnyActionLoading}
            className="h-9 bg-emerald-700 hover:bg-emerald-800 text-white font-medium text-xs rounded-lg shadow-sm self-start sm:self-auto shrink-0"
          >
            {isCashConfirming ? (
              <>
                <Loader2 className="h-3.5 w-3.5 mr-1.5 animate-spin" />
                <span>Confirming...</span>
              </>
            ) : (
              <>
                <CheckCircle2 className="h-3.5 w-3.5 mr-1.5" />
                <span>Confirm cash collected</span>
              </>
            )}
          </Button>
        </div>
      )}

      {/* Action Footer Strip */}
      <div className="pt-2 flex flex-wrap items-center justify-between gap-3 border-t border-stone-100 dark:border-stone-800">
        {/* Status hints & Scheduled Time Guard Alert */}
        <div className="text-xs">
          {isAccepted && !isScheduledTimePassed && (
            <div className="inline-flex max-w-full items-start gap-1.5 px-2.5 py-1 rounded-lg bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 text-amber-900 dark:text-amber-200 text-[11px]">
              <Info className="h-3.5 w-3.5 text-amber-700 shrink-0" />
              <span className="break-words text-left">Available after scheduled time ({booking.booking_date} {booking.booking_time ? booking.booking_time.slice(0, 5) : ""})</span>
            </div>
          )}
          {isAccepted && isScheduledTimePassed && (
            <span className="text-emerald-700 dark:text-emerald-400 font-medium text-xs inline-flex items-center gap-1">
              <CheckCircle2 className="h-3.5 w-3.5" /> Scheduled service window active
            </span>
          )}
          {isCompleted && booking.is_paid && (
            <span className="text-emerald-700 dark:text-emerald-400 font-medium text-xs inline-flex items-center gap-1">
              <ShieldCheck className="h-3.5 w-3.5" /> Completed & fully settled
            </span>
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2 ml-auto">
          {/* Pending Actions */}
          {isPending && (
            <>
              <Button
                size="sm"
                variant="outline"
                onClick={() => onReject(booking)}
                disabled={isAnyActionLoading}
                className="h-9 border-rose-200 text-rose-700 hover:bg-rose-50 text-xs rounded-lg"
              >
                {isRejecting ? (
                  <>
                    <Loader2 className="h-3.5 w-3.5 mr-1 animate-spin" />
                    <span>Declining...</span>
                  </>
                ) : (
                  <span>Decline</span>
                )}
              </Button>
              <Button
                size="sm"
                onClick={() => onAccept(booking)}
                disabled={isAnyActionLoading}
                className="h-9 bg-[#115E59] hover:bg-teal-800 text-white text-xs font-medium rounded-lg shadow-sm"
              >
                {isAccepting ? (
                  <>
                    <Loader2 className="h-3.5 w-3.5 mr-1 animate-spin" />
                    <span>Accepting...</span>
                  </>
                ) : (
                  <span>Accept job request</span>
                )}
              </Button>
            </>
          )}

          {/* Accepted Actions (Guarded by scheduled time) */}
          {isAccepted && (
            <Button
              size="sm"
              onClick={() => onComplete(booking)}
              disabled={isAnyActionLoading || !isScheduledTimePassed}
              title={
                !isScheduledTimePassed
                  ? `Cannot mark complete until scheduled time has passed (${booking.booking_date} ${booking.booking_time})`
                  : undefined
              }
              className={`h-9 text-xs font-medium rounded-lg transition-colors ${
                isScheduledTimePassed
                  ? "bg-[#EA580C] hover:bg-[#c2410c] text-white shadow-sm"
                  : "bg-stone-200 text-stone-400 cursor-not-allowed border border-stone-300 dark:bg-stone-800 dark:border-stone-700"
              }`}
            >
              {isCompleting ? (
                <>
                  <Loader2 className="h-3.5 w-3.5 mr-1.5 animate-spin" />
                  <span>Completing...</span>
                </>
              ) : (
                <span>Mark job completed</span>
              )}
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}