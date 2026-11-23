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
import type { Booking } from "@/types/api";

interface CustomerBookingCardProps {
  booking: Booking;
  onEdit: (booking: Booking) => void;
  onCancel: (booking: Booking) => void;
  onReview: (booking: Booking) => void;
}

export function CustomerBookingCard({
  booking,
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

  return (
    <div className="p-6 rounded-3xl bg-white border border-stone-200 shadow-2xs hover:shadow-tactile transition-all duration-200 space-y-4">
      {/* Top Header: Title, Reference & Status Badges */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-stone-100 pb-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <h3 className="font-extrabold text-base sm:text-lg text-stone-900 font-heading">
              {booking.service_name || booking.service_title || "Verified Local Service"}
            </h3>
            {serviceId && (
              <Link
                href={`/services/${serviceId}`}
                className="text-stone-400 hover:text-teal-800 transition-colors"
                title="View Service Details"
              >
                <ExternalLink className="h-4 w-4" />
              </Link>
            )}
          </div>
          <p className="font-mono text-[11px] text-stone-400">
            ID: {String(booking.id).slice(0, 8)}... • Created {booking.created_at ? new Date(booking.created_at).toLocaleDateString() : ""}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Booking Lifecycle Badge */}
          <Badge variant={statusInfo.variant} className={statusInfo.className}>
            {statusInfo.label}
          </Badge>

          {/* Payment Status Badge */}
          <Badge variant={paymentInfo.variant} className={paymentInfo.className}>
            {paymentInfo.label}
          </Badge>

          {/* Payment Method Pill */}
          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-stone-100 text-stone-600 border border-stone-200">
            {isOnline ? "Online Pay" : "Cash Pay"}
          </span>
        </div>
      </div>

      {/* Appointment Schedule & Provider Metadata */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 text-xs text-stone-600">
        <div className="flex items-center gap-2">
          <Calendar className="h-4 w-4 text-teal-800 shrink-0" />
          <span>
            Date: <strong className="text-stone-900 tabular-nums">{booking.booking_date}</strong>
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

      {booking.note && (
        <div className="p-3 rounded-xl bg-stone-50 border border-stone-200/80 text-xs text-stone-600">
          <strong className="text-stone-800 block text-[11px] mb-0.5">Instructions:</strong>
          {booking.note}
        </div>
      )}

      {/* Itemized Financial Strip */}
      <div className="p-3.5 rounded-2xl bg-stone-50 border border-stone-200 grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
        <div>
          <span className="text-stone-400 block text-[10px] uppercase font-bold tracking-wider">Total</span>
          <span className="font-extrabold text-stone-900 text-sm tabular-nums">৳{totalPrice.toFixed(2)}</span>
        </div>

        <div>
          <span className="text-stone-400 block text-[10px] uppercase font-bold tracking-wider">20% Advance</span>
          <span className="font-bold text-orange-700 tabular-nums">৳{advanceAmount.toFixed(2)}</span>
        </div>

        <div>
          <span className="text-stone-400 block text-[10px] uppercase font-bold tracking-wider">Paid</span>
          <span className="font-bold text-emerald-700 tabular-nums">৳{paidAmount.toFixed(2)}</span>
        </div>

        <div>
          <span className="text-stone-400 block text-[10px] uppercase font-bold tracking-wider">Balance</span>
          <span className="font-extrabold text-teal-900 text-sm tabular-nums">৳{remainingAmount.toFixed(2)}</span>
        </div>
      </div>

      {/* Context-Aware Reassurance Strips */}
      {needsAdvancePayment && (
        <div className="p-3 rounded-xl bg-orange-50 border border-orange-200 text-xs text-orange-950 flex items-center gap-2">
          <AlertCircle className="h-4 w-4 text-orange-600 shrink-0" />
          <span>
            Provider accepted your booking! Pay the 20% advance (৳{advanceAmount.toFixed(2)}) to lock in the appointment.
          </span>
        </div>
      )}

      {isCompleted && isCash && !booking.is_paid && remainingAmount > 0 && (
        <div className="p-3 rounded-xl bg-teal-50 border border-teal-200 text-xs text-teal-950 flex items-center gap-2">
          <Banknote className="h-4 w-4 text-teal-800 shrink-0" />
          <span>
            Please pay the final balance of <strong>৳{remainingAmount.toFixed(2)} in Cash</strong> directly to the service provider.
          </span>
        </div>
      )}

      {/* Action Buttons */}
      <div className="pt-2 flex flex-wrap items-center justify-end gap-2.5 border-t border-stone-100">
        {/* Pending Actions: Edit & Cancel */}
        {isPending && (
          <>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => onEdit(booking)}
              className="rounded-xl text-xs font-semibold gap-1.5"
            >
              <Edit3 className="h-3.5 w-3.5" />
              <span>Reschedule / Edit</span>
            </Button>

            <Button
              type="button"
              variant="destructive"
              size="sm"
              onClick={() => onCancel(booking)}
              className="rounded-xl text-xs font-semibold gap-1.5"
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
              className="rounded-xl text-xs font-bold gap-2 bg-orange-600 hover:bg-orange-700 text-white shadow-md"
            >
              <CreditCard className="h-4 w-4" />
              <span>Pay 20% Advance (৳{advanceAmount.toFixed(2)})</span>
            </Button>
          </PaymentCheckoutModal>
        )}

        {/* Final Online Balance Payment Launcher */}
        {needsOnlineBalancePayment && (
          <PaymentCheckoutModal booking={booking} type="final">
            <Button
              size="sm"
              className="rounded-xl text-xs font-bold gap-2 bg-emerald-600 hover:bg-emerald-700 text-white shadow-md"
            >
              <CreditCard className="h-4 w-4" />
              <span>Pay Remaining Balance (৳{remainingAmount.toFixed(2)})</span>
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
            className="rounded-xl text-xs font-bold gap-1.5"
          >
            <Star className="h-3.5 w-3.5 fill-current" />
            <span>Rate & Review Pro</span>
          </Button>
        )}
      </div>
    </div>
  );
}

export default CustomerBookingCard;
