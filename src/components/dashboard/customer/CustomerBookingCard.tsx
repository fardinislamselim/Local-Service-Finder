"use client";

import * as React from "react";
import Link from "next/link";
import {
  Calendar,
  Clock,
  CreditCard,
  Banknote,
  Star,
  Edit3,
  Trash2,
  ExternalLink,
  ShieldCheck,
  AlertCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { getBookingStatusInfo, getPaymentStatusInfo } from "@/lib/statusHelpers";
import { PaymentCheckoutModal } from "@/components/payments/PaymentCheckoutModal";
import type { Booking, Service } from "@/types/api";

interface CustomerBookingCardProps {
  booking: Booking;
  resolvedService?: Service | null;
  onEdit: (booking: Booking) => void;
  onCancel: (booking: Booking) => void;
  onReview: (booking: Booking) => void;
}

export function CustomerBookingCard({
  booking,
  resolvedService,
  onEdit,
  onCancel,
  onReview,
}: CustomerBookingCardProps) {
  const statusInfo = getBookingStatusInfo(booking.status);
  const paymentInfo = getPaymentStatusInfo(booking.payment_status);

  const isPending = booking.status?.toLowerCase() === "pending";
  const isAccepted = booking.status?.toLowerCase() === "accepted";
  const isCompleted = booking.status?.toLowerCase() === "completed";
  const isOnline = booking.final_payment_method?.toLowerCase() === "online";
  const isCash = booking.final_payment_method?.toLowerCase() === "cash";

  const paidAmount = Number(booking.paid_amount || 0);
  const advanceAmount = Number(booking.advance_amount || 0);
  const remainingAmount = Number(booking.remaining_amount || 0);
  const totalPrice = Number(booking.price_at_booking || booking.total_amount || 0);

  const needsAdvancePayment = isAccepted && paidAmount === 0;
  const needsOnlineBalancePayment = isCompleted && isOnline && remainingAmount > 0;

  const serviceId = typeof booking.service === "object" ? booking.service?.id : booking.service;

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
    return "Verified Local Service";
  }, [resolvedService, booking]);

  return (
    <div className="p-5 rounded-xl bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 shadow-sm hover:border-stone-300 dark:hover:border-stone-700 transition-colors space-y-4">
      {/* Top Header: Title, Reference & Status Badges */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-stone-100 dark:border-stone-800 pb-3">
        <div className="min-w-0 space-y-0.5">
          <div className="flex min-w-0 items-center gap-2">
            <h3 className="truncate font-semibold text-base text-stone-900 dark:text-stone-100 tracking-tight">
              {resolvedServiceName}
            </h3>
            {serviceId && (
              <Link
                href={`/services/${serviceId}`}
                className="text-stone-400 hover:text-stone-700 dark:hover:text-stone-300 transition-colors"
                title="View service details"
              >
                <ExternalLink className="h-3.5 w-3.5" />
              </Link>
            )}
          </div>
          <p className="truncate font-mono text-[11px] text-stone-400">
            #{String(booking.id).slice(0, 8)} • Booked {booking.created_at ? new Date(booking.created_at).toLocaleDateString() : ""}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-1.5">
          {/* Booking Lifecycle Badge */}
          <Badge variant={statusInfo.variant} className={statusInfo.className}>
            {statusInfo.label}
          </Badge>

          {/* Payment Status Badge */}
          <Badge variant={paymentInfo.variant} className={paymentInfo.className}>
            {paymentInfo.label}
          </Badge>

          {/* Payment Method Pill */}
          <span className="px-2 py-0.5 rounded-full text-[10px] font-medium bg-stone-100 dark:bg-stone-800 text-stone-600 dark:text-stone-300 border border-stone-200 dark:border-stone-700">
            {isOnline ? "Online pay" : "Cash pay"}
          </span>
        </div>
      </div>

      {/* Appointment Schedule & Details */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 text-xs text-stone-600 dark:text-stone-400">
        <div className="flex items-center gap-2">
          <Calendar className="h-4 w-4 text-stone-500 shrink-0" />
          <span>
            Date: <strong className="text-stone-900 dark:text-stone-100 tabular-nums">{booking.booking_date}</strong>
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

      {booking.note && (
        <div className="p-3 rounded-xl bg-stone-50 dark:bg-stone-800/40 border border-stone-200/80 dark:border-stone-800 text-xs text-stone-600 dark:text-stone-400">
          <strong className="text-stone-800 dark:text-stone-200 block text-[11px] mb-0.5">Instructions:</strong>
          {booking.note}
        </div>
      )}

      {/* Itemized Financial Strip */}
      <div className="p-3 rounded-xl bg-stone-50 dark:bg-stone-800/40 border border-stone-200 dark:border-stone-800 grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
        <div>
          <span className="text-stone-400 block text-[11px]">Total</span>
          <span className="font-semibold text-stone-900 dark:text-stone-100 text-sm tabular-nums">৳{totalPrice.toFixed(2)}</span>
        </div>

        <div>
          <span className="text-stone-400 block text-[11px]">20% Advance</span>
          <span className="font-medium text-amber-700 dark:text-amber-400 tabular-nums">৳{advanceAmount.toFixed(2)}</span>
        </div>

        <div>
          <span className="text-stone-400 block text-[11px]">Paid</span>
          <span className="font-medium text-emerald-700 dark:text-emerald-400 tabular-nums">৳{paidAmount.toFixed(2)}</span>
        </div>

        <div>
          <span className="text-stone-400 block text-[11px]">Remaining balance</span>
          <span className="font-semibold text-stone-900 dark:text-stone-100 text-sm tabular-nums">৳{remainingAmount.toFixed(2)}</span>
        </div>
      </div>

      {/* Context-Aware Reassurance Strips */}
      {needsAdvancePayment && (
        <div className="p-3 rounded-xl bg-orange-50/80 dark:bg-orange-950/40 border border-orange-200/80 dark:border-orange-800 text-xs text-orange-900 dark:text-orange-200 flex items-center gap-2">
          <AlertCircle className="h-4 w-4 text-[#EA580C] shrink-0" />
          <span>
            Provider accepted your booking. Pay the 20% advance (৳{advanceAmount.toFixed(2)}) to lock in the appointment.
          </span>
        </div>
      )}

      {isCompleted && isCash && !booking.is_paid && remainingAmount > 0 && (
        <div className="p-3 rounded-xl bg-emerald-50/80 dark:bg-emerald-950/40 border border-emerald-200/80 dark:border-emerald-800 text-xs text-emerald-900 dark:text-emerald-200 flex items-center gap-2">
          <Banknote className="h-4 w-4 text-emerald-700 shrink-0" />
          <span>
            Please pay the final balance of <strong>৳{remainingAmount.toFixed(2)} in cash</strong> directly to the service provider.
          </span>
        </div>
      )}

      {/* Action Buttons */}
      <div className="pt-2 flex flex-wrap items-center justify-end gap-2 border-t border-stone-100 dark:border-stone-800">
        {/* Pending Actions: Edit & Cancel */}
        {isPending && (
          <>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => onEdit(booking)}
              className="rounded-lg text-xs font-medium h-9 gap-1.5 border-stone-200 dark:border-stone-800"
            >
              <Edit3 className="h-3.5 w-3.5" />
              <span>Reschedule</span>
            </Button>

            <Button
              type="button"
              variant="destructive"
              size="sm"
              onClick={() => onCancel(booking)}
              className="rounded-lg text-xs font-medium h-9 gap-1.5"
            >
              <Trash2 className="h-3.5 w-3.5" />
              <span>Cancel</span>
            </Button>
          </>
        )}

        {/* 20% Advance Payment Launcher */}
        {needsAdvancePayment && (
          <PaymentCheckoutModal booking={booking} type="advance">
            <Button
              size="sm"
              className="rounded-lg text-xs font-medium h-9 gap-1.5 bg-[#EA580C] hover:bg-[#c2410c] text-white shadow-sm"
            >
              <CreditCard className="h-3.5 w-3.5" />
              <span>Pay 20% advance (৳{advanceAmount.toFixed(2)})</span>
            </Button>
          </PaymentCheckoutModal>
        )}

        {/* Final Online Balance Payment Launcher */}
        {needsOnlineBalancePayment && (
          <PaymentCheckoutModal booking={booking} type="final">
            <Button
              size="sm"
              className="rounded-lg text-xs font-medium h-9 gap-1.5 bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm"
            >
              <CreditCard className="h-3.5 w-3.5" />
              <span>Pay remaining balance (৳{remainingAmount.toFixed(2)})</span>
            </Button>
          </PaymentCheckoutModal>
        )}

        {/* Review Action on Completed Bookings */}
        {isCompleted && (
          <Button
            type="button"
            variant="teal"
            size="sm"
            onClick={() => onReview(booking)}
            className="rounded-lg text-xs font-medium h-9 gap-1.5"
          >
            <Star className="h-3.5 w-3.5 fill-current" />
            <span>Rate & review pro</span>
          </Button>
        )}
      </div>
    </div>
  );
}

export default CustomerBookingCard;
