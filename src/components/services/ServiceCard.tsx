"use client";

import * as React from "react";
import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { Star, ShieldCheck, Wrench, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { reviewsService } from "@/features/reviews/services/reviews.service";
import type { Service } from "@/types/api";

interface ServiceCardProps {
  service: Service;
}

export function ServiceCard({ service }: ServiceCardProps) {
  // Fetch live average rating
  const { data: ratingData } = useQuery({
    queryKey: ["service_rating", service.id],
    queryFn: () => reviewsService.getAverageRating(service.id),
    staleTime: 1000 * 60 * 10,
  });

  const rating = ratingData?.average_rating;
  const isQuotation = service.pricing_type === "quotation";
  const isHourly = service.pricing_type === "hourly";

  const hasCloudinaryImg = Boolean(service.image && service.image.startsWith("http"));

  return (
    <div className="group rounded-3xl bg-white border border-stone-200 shadow-2xs hover:shadow-tactile hover:-translate-y-1 transition-all duration-200 overflow-hidden flex flex-col justify-between">
      {/* TOP MEDIA: 16:10 Container */}
      <div className="relative aspect-[16/10] bg-stone-100 overflow-hidden">
        {hasCloudinaryImg ? (
          <img
            src={service.image as string}
            alt={service.name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-teal-900/10 text-teal-800">
            <Wrench className="h-10 w-10 opacity-60" />
          </div>
        )}

        {/* Floating Pricing Type Pill */}
        <div className="absolute top-3 left-3">
          <span className="px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-white/95 dark:bg-stone-900/90 backdrop-blur-md shadow-xs border border-stone-200 text-stone-800">
            {isQuotation ? "On Quotation" : isHourly ? "Hourly Rate" : "Fixed Price"}
          </span>
        </div>

        {/* Floating Live Rating Badge */}
        <div className="absolute top-3 right-3">
          <div className="flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-white/95 backdrop-blur-md shadow-xs border border-stone-200 text-stone-800">
            <Star className="h-3 w-3 fill-amber-400 text-amber-500" />
            <span>{rating !== null && rating !== undefined ? Number(rating).toFixed(1) : "New"}</span>
          </div>
        </div>
      </div>

      {/* CARD BODY */}
      <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
        <div className="space-y-1.5">
          <div className="flex items-center gap-1.5 text-xs text-teal-800 font-semibold">
            <ShieldCheck className="h-3.5 w-3.5 text-emerald-600" />
            <span>Verified Local Pro</span>
          </div>
          <h3 className="font-extrabold text-base text-stone-900 line-clamp-1 group-hover:text-teal-900 transition-colors">
            {service.name}
          </h3>
          <p className="text-xs text-stone-500 line-clamp-2 leading-relaxed">
            {service.description ? service.description.replace(/<[^>]*>?/gm, "") : "Professional local service tailored for your home and business."}
          </p>
        </div>

        {/* PRICING DISPLAY */}
        <div className="pt-2 border-t border-stone-100 flex items-baseline justify-between">
          <div className="text-xs text-stone-400 font-medium">Pricing</div>
          <div className="text-base font-extrabold text-teal-900 tabular-nums">
            {isQuotation ? (
              <span className="text-sm font-bold text-stone-700">Custom Quote</span>
            ) : isHourly ? (
              <span>৳{service.hour_base_price || service.base_price}/hr</span>
            ) : (
              <span>৳{service.base_price} <span className="text-xs font-normal text-stone-500">Fixed</span></span>
            )}
          </div>
        </div>
      </div>

      {/* CARD FOOTER ACTIONS */}
      <div className="p-4 pt-0 grid grid-cols-2 gap-2">
        <Button variant="outline" size="sm" asChild className="rounded-xl h-10 text-xs font-semibold">
          <Link href={`/services/${service.id}`}>Details</Link>
        </Button>

        {isQuotation ? (
          <Button
            size="sm"
            disabled
            title="Requires custom quote from provider"
            className="rounded-xl h-10 text-xs font-semibold opacity-60 cursor-not-allowed"
          >
            Quote Only
          </Button>
        ) : (
          <Button size="sm" asChild className="rounded-xl h-10 text-xs font-bold shadow-xs">
            <Link href={`/services/${service.id}`}>Book Now</Link>
          </Button>
        )}
      </div>
    </div>
  );
}

export function ServiceCardSkeleton() {
  return (
    <div className="rounded-3xl bg-white border border-stone-200 p-4 space-y-4 animate-pulse">
      <div className="aspect-[16/10] bg-stone-200 rounded-2xl" />
      <div className="space-y-2">
        <div className="h-3 bg-stone-200 rounded w-1/3" />
        <div className="h-5 bg-stone-200 rounded w-3/4" />
        <div className="h-3 bg-stone-200 rounded w-full" />
      </div>
      <div className="pt-2 border-t border-stone-100 flex justify-between">
        <div className="h-4 bg-stone-200 rounded w-1/4" />
        <div className="h-5 bg-stone-200 rounded w-1/3" />
      </div>
      <div className="grid grid-cols-2 gap-2 pt-1">
        <div className="h-10 bg-stone-200 rounded-xl" />
        <div className="h-10 bg-stone-200 rounded-xl" />
      </div>
    </div>
  );
}

export default ServiceCard;
