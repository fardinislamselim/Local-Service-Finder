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
    <div className="bg-white rounded-2xl border border-stone-200 p-5 sm:p-6 shadow-sm hover:shadow-md transition-all flex flex-col justify-between gap-5">
      {/* Top Header Strip */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-stone-100 pb-4">
        <div>
          <div className="flex items-center gap-2 flex-wrap mb-1">
            <span className="text-[11px] font-mono font-semibold uppercase text-stone-500 bg-stone-100 px-2 py-0.5 rounded">
              #{String(booking.id).slice(0, 8)}
            </span>
            <Badge className={`${statusInfo.className} border text-xs font-semibold`}>
              {statusInfo.label}
            </Badge>
            <Badge className={`${paymentInfo.className} border text-xs font-semibold`}>
              {paymentInfo.label}
            </Badge>
            <span className="inline-flex items-center gap-1 text-xs font-medium text-stone-600 bg-stone-50 px-2 py-0.5 rounded-full border border-stone-200">
              {isCash ? <Banknote className="h-3 w-3 text-emerald-700" /> : <CreditCard className="h-3 w-3 text-teal-700" />}
              {isCash ? "Final via Cash" : "Final via SSLCommerz"}
            </span>
          </div>

          <div className="flex items-center gap-2">
            {resolvedServiceName === null ? (
              <Skeleton className="h-6 w-56 rounded-md" />
            ) : (
              <h3 className="text-lg font-bold text-stone-900 tracking-tight">
                {resolvedServiceName}
              </h3>
            )}
            {serviceId && (
              <Link
                href={`/services/${serviceId}`}
                target="_blank"
                className="text-stone-400 hover:text-teal-800 transition-colors"
                title="View Public Service Page"
              >
                <ExternalLink className="h-3.5 w-3.5" />
              </Link>
            )}
          </div>
        </div>

        {/* Customer Quick Info */}
        <div className="text-xs text-stone-600 space-y-0.5 sm:text-right">
          <p className="font-semibold text-stone-800 flex items-center gap-1 sm:justify-end">
            <User className="h-3.5 w-3.5 text-teal-800" />
            {customerName}
          </p>
          {customerPhone && (
            <p className="flex items-center gap-1 sm:justify-end font-mono">
              <Phone className="h-3 w-3 text-stone-400" />
              {customerPhone}
            </p>
          )}
        </div>
      </div>

      {/* Middle Specs & Timing */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 text-xs text-stone-600">
        <div className="flex items-center gap-2">
          <Calendar className="h-4 w-4 text-teal-800 shrink-0" />
          <span>
            Scheduled: <strong className="text-stone-900">{booking.booking_date}</strong>
          </span>
        </div>

        <div className="flex items-center gap-2">
          <Clock className="h-4 w-4 text-teal-800 shrink-0" />
          <span>
            Time: <strong className="text-stone-900 tabular-nums">{booking.booking_time ? booking.booking_time.slice(0, 5) : ""}</strong>
          </span>
        </div>

        {booking.duration ? (
          <div className="flex items-center gap-2">
            <Clock className="h-4 w-4 text-orange-600 shrink-0" />
            <span>
              Duration: <strong className="text-stone-900">{booking.duration.replace("PT", "").toLowerCase()}</strong>
            </span>
          </div>
        ) : null}
      </div>

      {/* Customer Instruction / Note */}
      {booking.note && (
        <div className="p-3 rounded-xl bg-[#FAF9F6] border border-stone-200 text-xs text-stone-700">
          <span className="font-semibold text-stone-900 block text-[11px] mb-0.5 uppercase tracking-wide">
            Customer Instructions:
          </span>
          {booking.note}
        </div>
      )}

      {/* Itemized Financial Strip */}
      <div className="p-3.5 rounded-xl bg-stone-50 border border-stone-200/90 flex flex-wrap items-center justify-between gap-4 text-xs">
        <div>
          <span className="text-stone-500 block text-[11px]">Agreed Total</span>
          <span className="font-bold text-stone-900 text-sm tabular-nums">৳{totalPrice.toLocaleString()}</span>
        </div>

        <div>
          <span className="text-stone-500 block text-[11px]">20% Advance Status</span>
          <span className={`font-semibold tabular-nums ${paidAmount > 0 ? "text-emerald-700" : "text-amber-800"}`}>
            {paidAmount > 0 ? `৳${paidAmount.toLocaleString()} Paid` : "Awaiting Advance"}
          </span>
        </div>

        <div>
          <span className="text-stone-500 block text-[11px]">Final Balance Due</span>
          <span className="font-bold text-teal-900 text-sm tabular-nums">৳{remainingAmount.toLocaleString()}</span>
        </div>
      </div>

      {/* Highlighted Cash Collection Banner */}
      {isCompleted && isCash && !booking.is_paid && remainingAmount > 0 && (
        <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2 text-xs text-emerald-900">
            <Banknote className="h-5 w-5 text-emerald-700 shrink-0" />
            <div>
              <span className="font-bold block text-sm">Remaining Cash Due: ৳{remainingAmount.toLocaleString()}</span>
              <span>Please collect from customer upon finishing service and confirm below.</span>
            </div>
          </div>

          <Button
            size="sm"
            onClick={() => onConfirmCash(booking)}
            disabled={isAnyActionLoading}
            className="bg-[#0F5132] hover:bg-[#0B3D26] text-white font-semibold text-xs rounded-xl shadow-tactile self-start sm:self-auto shrink-0"
          >
            {isCashConfirming ? (
              <>
                <Loader2 className="h-3.5 w-3.5 mr-1.5 animate-spin" />
                Confirming Cash...
              </>
            ) : (
              <>
                <CheckCircle2 className="h-3.5 w-3.5 mr-1.5" />
                Confirm Cash Received
              </>
            )}
          </Button>
        </div>
      )}

      {/* Action Footer Strip */}
      <div className="pt-2 flex flex-wrap items-center justify-between gap-3">
        {/* Status hints & Scheduled Time Guard Alert */}
        <div className="text-xs">
          {isAccepted && !isScheduledTimePassed && (
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-amber-50 border border-amber-200 text-amber-900 text-[11px]">
              <Info className="h-3.5 w-3.5 text-amber-700 shrink-0" />
              <span>Available after scheduled time ({booking.booking_date} {booking.booking_time ? booking.booking_time.slice(0, 5) : ""})</span>
            </div>
          )}
          {isAccepted && isScheduledTimePassed && (
            <span className="text-emerald-700 font-medium inline-flex items-center gap-1">
              <CheckCircle2 className="h-3.5 w-3.5" /> Scheduled service window active
            </span>
          )}
          {isCompleted && booking.is_paid && (
            <span className="text-emerald-700 font-semibold inline-flex items-center gap-1">
              <ShieldCheck className="h-4 w-4" /> Service Finished & Fully Settled
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
                className="border-rose-200 text-rose-700 hover:bg-rose-50 text-xs rounded-xl"
              >
                {isRejecting ? (
                  <>
                    <Loader2 className="h-3.5 w-3.5 mr-1 animate-spin" />
                    Rejecting...
                  </>
                ) : (
                  <>
                    <XCircle className="h-3.5 w-3.5 mr-1" />
                    Reject
                  </>
                )}
              </Button>
              <Button
                size="sm"
                onClick={() => onAccept(booking)}
                disabled={isAnyActionLoading}
                className="bg-[#115E59] hover:bg-[#0F766E] text-white text-xs font-semibold rounded-xl shadow-tactile"
              >
                {isAccepting ? (
                  <>
                    <Loader2 className="h-3.5 w-3.5 mr-1 animate-spin" />
                    Accepting...
                  </>
                ) : (
                  <>
                    <CheckCircle2 className="h-3.5 w-3.5 mr-1" />
                    Accept Job
                  </>
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
              className={`text-xs font-semibold rounded-xl transition-all ${
                isScheduledTimePassed
                  ? "bg-[#EA580C] hover:bg-[#C2410C] text-white shadow-tactile"
                  : "bg-stone-200 text-stone-400 cursor-not-allowed border border-stone-300"
              }`}
            >
              {isCompleting ? (
                <>
                  <Loader2 className="h-3.5 w-3.5 mr-1.5 animate-spin" />
                  Completing...
                </>
              ) : (
                <>
                  <CheckCircle2 className="h-3.5 w-3.5 mr-1.5" />
                  Mark Job Completed
                </>
              )}
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
