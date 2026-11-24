"use client";

import * as React from "react";
import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { Star, MessageSquare, ShieldCheck, Lock, User, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { reviewsService } from "@/features/reviews/services/reviews.service";
import { normalizeImageUrl } from "@/features/profiles/services/profiles.service";
import { useAuthStore } from "@/store/useAuthStore";
import type { Review } from "@/types/api";

interface ServiceReviewsSectionProps {
  serviceId: string | number;
}

export function ServiceReviewsSection({ serviceId }: ServiceReviewsSectionProps) {
  const { user, profile, isAuthenticated, accessToken } = useAuthStore();
  const role = user?.role || profile?.role;
  const isCustomer = role === "CUSTOMER";
  const hasCustomerAuth = Boolean(isAuthenticated && accessToken && isCustomer);

  // 1. Public Average Rating (No Auth needed)
  const { data: ratingData } = useQuery({
    queryKey: ["service_rating", serviceId],
    queryFn: () => reviewsService.getAverageRating(serviceId),
    staleTime: 1000 * 60 * 10,
  });

  const avgRating = ratingData?.average_rating;

  // 2. Restricted Reviews List (Only fires if logged in as CUSTOMER with valid accessToken)
  const { data: reviews = [], isLoading: reviewsLoading } = useQuery({
    queryKey: ["service_reviews", serviceId],
    queryFn: () => reviewsService.getReviewsForService(serviceId),
    enabled: hasCustomerAuth,
    staleTime: 1000 * 60 * 5,
  });

  return (
    <div className="p-6 rounded-2xl bg-white border border-stone-200 shadow-sm space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-4 border-b border-stone-100 pb-4">
        <div>
          <h3 className="font-semibold text-base text-stone-900 font-heading">
            Customer Reviews & Ratings
          </h3>
          <p className="text-xs text-stone-500 mt-0.5">
            Verified feedback from customers who booked and completed this service.
          </p>
        </div>

        {/* Big Average Score Badge */}
        <div className="flex shrink-0 items-center gap-2 rounded-2xl border border-stone-200 bg-stone-50 px-3.5 py-1.5">
          <Star className="h-5 w-5 fill-amber-400 text-amber-500" />
          <span className="font-semibold text-lg text-stone-900 tabular-nums">
            {avgRating !== null && avgRating !== undefined ? Number(avgRating).toFixed(1) : "New"}
          </span>
          <span className="text-xs text-stone-400">/ 5.0</span>
        </div>
      </div>

      {/* Conditional Content based on Customer Auth */}
      {!isAuthenticated || !accessToken ? (
        <div className="p-6 rounded-2xl bg-stone-50 border border-stone-200 text-center space-y-3">
          <div className="w-10 h-10 rounded-xl bg-teal-50 border border-teal-200 flex items-center justify-center text-teal-800 mx-auto">
            <Lock className="h-5 w-5" />
          </div>
          <div className="space-y-1">
            <h4 className="font-semibold text-sm text-stone-900">Sign in to read verified reviews</h4>
            <p className="text-xs text-stone-500 max-w-sm mx-auto">
              Sign in as a Customer to read individual buyer reviews.
            </p>
          </div>
          <Button asChild size="sm" variant="outline" className="rounded-xl text-xs font-semibold border-stone-300">
            <Link href="/login">Sign in as Customer</Link>
          </Button>
        </div>
      ) : !isCustomer ? (
        <div className="p-4 rounded-xl bg-stone-50 border border-stone-200 text-xs text-stone-600 flex items-center gap-2.5">
          <AlertCircle className="h-4 w-4 text-stone-500 shrink-0" />
          <span>Detailed buyer reviews are restricted to Customer accounts.</span>
        </div>
      ) : reviewsLoading ? (
        <div className="space-y-3 animate-pulse">
          <div className="h-16 bg-stone-100 rounded-xl" />
          <div className="h-16 bg-stone-100 rounded-xl" />
        </div>
      ) : reviews.length === 0 ? (
        <div className="p-6 rounded-2xl bg-stone-50 border border-stone-200 text-center text-xs text-stone-500 space-y-1">
          <MessageSquare className="h-5 w-5 text-stone-400 mx-auto mb-1" />
          <p className="font-semibold text-stone-700">No written reviews yet</p>
          <p>Be the first customer to book and rate this service!</p>
        </div>
      ) : (
        <div className="space-y-4">
          {reviews.map((rev: Review) => (
            <div
              key={rev.id}
              className="p-4 rounded-2xl bg-stone-50 border border-stone-200/80 space-y-2.5 text-xs"
            >
              <div className="flex items-center justify-between gap-3">
                <div className="flex min-w-0 items-center gap-2.5">
                  <Avatar className="h-8 w-8 rounded-full">
                    <AvatarImage src={normalizeImageUrl(rev.customer_image) || ""} />
                    <AvatarFallback className="bg-teal-100 text-teal-800 font-semibold text-xs">
                      {rev.customer_name ? rev.customer_name.charAt(0).toUpperCase() : "C"}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <span className="block truncate font-semibold text-stone-900">
                      {rev.customer_name || "Verified Customer"}
                    </span>
                    <span className="text-[10px] text-stone-400">
                      {rev.created_at ? new Date(rev.created_at).toLocaleDateString() : "Verified Booking"}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-1 text-amber-500 font-semibold bg-white px-2 py-0.5 rounded-lg border border-stone-200">
                  <Star className="h-3 w-3 fill-amber-400" />
                  <span>{rev.rating}</span>
                </div>
              </div>

              <p className="break-words leading-relaxed text-stone-700">{rev.review}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default ServiceReviewsSection;
