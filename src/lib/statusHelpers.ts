import type { BookingStatus, PaymentStatus } from "@/types/api";

export interface StatusBadgeConfig {
  label: string;
  variant: "default" | "secondary" | "destructive" | "outline";
  className: string;
}

/**
 * Returns Shadcn badge variant, custom Tailwind CSS classes, and clean display label for BookingStatus.
 */
export function getBookingStatusInfo(status: BookingStatus | string | undefined | null): StatusBadgeConfig {
  if (!status) {
    return {
      label: "Unknown",
      variant: "secondary",
      className: "bg-slate-100 text-slate-700 border-slate-200",
    };
  }

  const normalized = status.toLowerCase();

  switch (normalized) {
    case "pending":
      return {
        label: "Pending",
        variant: "outline",
        className: "bg-amber-50 text-amber-700 border-amber-300 font-medium",
      };
    case "accepted":
      return {
        label: "Accepted",
        variant: "secondary",
        className: "bg-blue-50 text-blue-700 border-blue-200 font-medium",
      };
    case "in_progress":
      return {
        label: "In Progress",
        variant: "secondary",
        className: "bg-indigo-50 text-indigo-700 border-indigo-200 font-medium",
      };
    case "completed":
      return {
        label: "Completed",
        variant: "default",
        className: "bg-emerald-50 text-emerald-700 border-emerald-300 font-medium",
      };
    case "rejected":
      return {
        label: "Rejected",
        variant: "destructive",
        className: "bg-rose-50 text-rose-700 border-rose-300 font-medium",
      };
    case "cancelled":
      return {
        label: "Cancelled",
        variant: "destructive",
        className: "bg-red-50 text-red-600 border-red-200 font-medium",
      };
    default:
      return {
        label: status.replace(/_/g, " "),
        variant: "secondary",
        className: "bg-slate-100 text-slate-700 border-slate-200",
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
      className: "bg-slate-100 text-slate-700 border-slate-200",
    };
  }

  const normalized = status.toLowerCase();

  switch (normalized) {
    case "paid":
    case "success":
      return {
        label: "Paid",
        variant: "default",
        className: "bg-emerald-50 text-emerald-700 border-emerald-300 font-medium",
      };
    case "partially_paid":
      return {
        label: "Partially Paid",
        variant: "secondary",
        className: "bg-cyan-50 text-cyan-700 border-cyan-300 font-medium",
      };
    case "pending":
      return {
        label: "Pending",
        variant: "outline",
        className: "bg-amber-50 text-amber-700 border-amber-300 font-medium",
      };
    case "unpaid":
      return {
        label: "Unpaid",
        variant: "outline",
        className: "bg-slate-50 text-slate-600 border-slate-300 font-medium",
      };
    case "failed":
      return {
        label: "Failed",
        variant: "destructive",
        className: "bg-rose-50 text-rose-700 border-rose-300 font-medium",
      };
    case "refunded":
      return {
        label: "Refunded",
        variant: "outline",
        className: "bg-purple-50 text-purple-700 border-purple-200 font-medium",
      };
    case "cancelled":
      return {
        label: "Cancelled",
        variant: "destructive",
        className: "bg-red-50 text-red-600 border-red-200 font-medium",
      };
    default:
      return {
        label: status.replace(/_/g, " "),
        variant: "secondary",
        className: "bg-slate-100 text-slate-700 border-slate-200",
      };
  }
}
