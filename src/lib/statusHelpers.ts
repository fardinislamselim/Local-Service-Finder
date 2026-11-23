import type { BookingStatus, PaymentStatus } from "@/types/api";

export interface StatusBadgeConfig {
  label: string;
  variant: "default" | "secondary" | "destructive" | "outline";
  className: string;
}

/**
 * Returns Shadcn badge variant, custom Tailwind CSS classes, and clean display label for BookingStatus.
 * Stylized for the tactile Deep Teal & Terracotta marketplace aesthetic.
 */
export function getBookingStatusInfo(status: BookingStatus | string | undefined | null): StatusBadgeConfig {
  if (!status) {
    return {
      label: "Unknown",
      variant: "secondary",
      className: "bg-stone-100 text-stone-700 border-stone-200",
    };
  }

  const normalized = status.toLowerCase();

  switch (normalized) {
    case "pending":
      return {
        label: "Pending",
        variant: "outline",
        className: "bg-amber-50 text-amber-800 border-amber-300 font-medium",
      };
    case "accepted":
      return {
        label: "Accepted",
        variant: "secondary",
        className: "bg-sky-50 text-sky-800 border-sky-300 font-medium",
      };
    case "in_progress":
      return {
        label: "In Progress",
        variant: "secondary",
        className: "bg-teal-50 text-teal-800 border-teal-300 font-medium",
      };
    case "completed":
      return {
        label: "Completed",
        variant: "default",
        className: "bg-emerald-50 text-emerald-800 border-emerald-300 font-medium",
      };
    case "rejected":
      return {
        label: "Rejected",
        variant: "destructive",
        className: "bg-rose-50 text-rose-800 border-rose-300 font-medium",
      };
    case "cancelled":
      return {
        label: "Cancelled",
        variant: "destructive",
        className: "bg-stone-100 text-stone-600 border-stone-300 font-medium",
      };
    default:
      return {
        label: status.replace(/_/g, " "),
        variant: "secondary",
        className: "bg-stone-100 text-stone-700 border-stone-200",
      };
  }
}

/**
 * Returns Shadcn badge variant, custom Tailwind CSS classes, and clean display label for PaymentStatus.
 */
export function getPaymentStatusInfo(status: PaymentStatus | string | undefined | null): StatusBadgeConfig {
  if (!status) {
    return {
      label: "Unpaid",
      variant: "outline",
      className: "bg-stone-100 text-stone-700 border-stone-300",
    };
  }

  const normalized = status.toLowerCase();

  switch (normalized) {
    case "paid":
    case "success":
      return {
        label: "Paid",
        variant: "default",
        className: "bg-emerald-50 text-emerald-800 border-emerald-300 font-medium",
      };
    case "partially_paid":
      return {
        label: "Partially Paid",
        variant: "secondary",
        className: "bg-teal-50 text-teal-800 border-teal-300 font-medium",
      };
    case "pending":
      return {
        label: "Pending",
        variant: "outline",
        className: "bg-amber-50 text-amber-800 border-amber-300 font-medium",
      };
    case "unpaid":
      return {
        label: "Unpaid",
        variant: "outline",
        className: "bg-stone-50 text-stone-600 border-stone-300 font-medium",
      };
    case "failed":
      return {
        label: "Failed",
        variant: "destructive",
        className: "bg-rose-50 text-rose-800 border-rose-300 font-medium",
      };
    case "refunded":
      return {
        label: "Refunded",
        variant: "outline",
        className: "bg-purple-50 text-purple-800 border-purple-300 font-medium",
      };
    case "cancelled":
      return {
        label: "Cancelled",
        variant: "destructive",
        className: "bg-stone-100 text-stone-600 border-stone-300 font-medium",
      };
    default:
      return {
        label: status.replace(/_/g, " "),
        variant: "secondary",
        className: "bg-stone-100 text-stone-700 border-stone-200",
      };
  }
}
