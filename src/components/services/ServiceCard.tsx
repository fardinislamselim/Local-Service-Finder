"use client";

import * as React from "react";
import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { Star, ShieldCheck, Wrench, ArrowRight, Tag } from "lucide-react";
import { Button } from "@/components/ui/button";
import { reviewsService } from "@/features/reviews/services/reviews.service";
import { categoriesService } from "@/features/categories/services/categories.service";
import type { Service, Category } from "@/types/api";

interface ServiceCardProps {
  service: Service;
  categoryName?: string;
}

export function ServiceCard({ service, categoryName }: ServiceCardProps) {
  // Fetch live average rating
  const { data: ratingData } = useQuery({
    queryKey: ["service_rating", service.id],
    queryFn: () => reviewsService.getAverageRating(service.id),
    staleTime: 1000 * 60 * 10,
  });

  // Fetch categories if category name is not already resolved
  const shouldFetchCategories = !categoryName && Boolean(service.category);
  const { data: categories = [] } = useQuery<Category[]>({
    queryKey: ["categories", "all"],
    queryFn: () => categoriesService.getAll(),
    staleTime: 1000 * 60 * 15,
    enabled: shouldFetchCategories,
  });

  // Resolve human-readable category name
  const resolvedCategoryName = React.useMemo(() => {
    if (categoryName) return categoryName;
    if (service.category_name) return service.category_name;
    if (typeof service.category === "object" && service.category !== null && "name" in service.category) {
      return (service.category as Category).name;
    }
    const catId = String(service.category);
    const found = categories.find((c) => String(c.id) === catId);
    return found?.name || null;
  }, [categoryName, service.category_name, service.category, categories]);

  const rating = ratingData?.average_rating;
  const isQuotation = service.pricing_type === "quotation";
  const isHourly = service.pricing_type === "hourly";
  const isActive = service.is_active !== false;

  const hasCloudinaryImg = Boolean(service.image && service.image.startsWith("http"));

  // Smart Safe Price Calculation
  const displayPrice = React.useMemo(() => {
    if (isQuotation) return "Custom Quote";

    if (isHourly) {
      const price = service.hour_base_price ?? service.base_price;
      return price !== null && price !== undefined ? `৳${price} / hr` : "Rate on request";
    }

    const price = service.base_price ?? service.hour_base_price;
    return price !== null && price !== undefined ? `৳${price}` : "Price on request";
  }, [isQuotation, isHourly, service.base_price, service.hour_base_price]);

  // Overview / shot_description with fallback
  const overviewText = React.useMemo(() => {
    if (service.shot_description && service.shot_description.trim()) {
      return service.shot_description.replace(/<[^>]*>?/gm, "").trim();
    }
    if (service.description && service.description.trim()) {
      return service.description.replace(/<[^>]*>?/gm, "").trim();
    }
    return "No overview provided";
  }, [service.shot_description, service.description]);

  return (
    <div className="group rounded-3xl bg-white border border-stone-200/90 shadow-2xs hover:shadow-tactile hover:-translate-y-1 transition-all duration-200 overflow-hidden flex flex-col justify-between">
      {/* TOP MEDIA: 16:10 Container */}
      <div className="relative aspect-[16/10] bg-stone-100 overflow-hidden">
        {hasCloudinaryImg ? (
          <img
            src={service.image as string}
            alt={service.name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-teal-950/5 text-teal-800">
            <Wrench className="h-10 w-10 opacity-60" />
          </div>
        )}

        {/* Floating Pricing Type Pill (Top Left) */}
        <div className="absolute top-3 left-3">
          <span
            className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider backdrop-blur-md shadow-xs border ${
              isQuotation
                ? "bg-stone-900/80 text-stone-100 border-stone-700/50"
                : isHourly
                ? "bg-amber-500/90 text-stone-950 border-amber-400/40"
                : "bg-teal-900/90 text-white border-teal-700/50"
            }`}
          >
            {isQuotation ? "On Quotation" : isHourly ? "Hourly Rate" : "Fixed Price"}
          </span>
        </div>

        {/* Floating Active Status Pill (Top Right) */}
        <div className="absolute top-3 right-3 flex items-center gap-1.5">
          {isActive ? (
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold bg-white/95 text-emerald-800 backdrop-blur-md shadow-xs border border-emerald-200">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
              <span>Available</span>
            </span>
          ) : (
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold bg-rose-50/95 text-rose-700 backdrop-blur-md shadow-xs border border-rose-200">
              <span className="h-1.5 w-1.5 rounded-full bg-rose-400" />
              <span>Unavailable</span>
            </span>
          )}
        </div>

        {/* Floating Live Rating Badge (Bottom Right over Image) */}
        <div className="absolute bottom-2.5 right-3">
          <div className="flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-white/90 backdrop-blur-md shadow-xs border border-stone-200 text-stone-800">
            <Star className="h-3 w-3 fill-amber-400 text-amber-500" />
            <span className="tabular-nums">
              {rating !== null && rating !== undefined ? Number(rating).toFixed(1) : "New"}
            </span>
          </div>
        </div>
      </div>

      {/* CARD BODY */}
      <div className="p-5 flex-1 flex flex-col justify-between space-y-3.5">
        <div className="space-y-1.5">
          {/* Category Tag & Pro Badge */}
          <div className="flex items-center justify-between gap-2 text-xs">
            {resolvedCategoryName ? (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-stone-100 text-stone-600 font-medium text-[11px] line-clamp-1 max-w-[160px]">
                <Tag className="h-3 w-3 text-stone-400 shrink-0" />
                <span className="truncate">{resolvedCategoryName}</span>
              </span>
            ) : (
              <span />
            )}
            <div className="flex items-center gap-1 text-[11px] text-teal-800 font-semibold shrink-0">
              <ShieldCheck className="h-3.5 w-3.5 text-emerald-600" />
              <span>Verified Pro</span>
            </div>
          </div>

          {/* Service Name */}
          <h3 className="font-extrabold text-base text-stone-900 line-clamp-1 group-hover:text-teal-900 transition-colors">
            {service.name}
          </h3>

          {/* Short Description */}
          <p className="text-xs text-stone-500 line-clamp-2 leading-relaxed">
            {overviewText}
          </p>
        </div>

        {/* PRICING DISPLAY */}
        <div className="pt-2.5 border-t border-stone-100 flex items-baseline justify-between">
          <div className="text-xs text-stone-400 font-medium">Pricing</div>
          <div className="text-base font-extrabold text-teal-900 tabular-nums">
            {isQuotation ? (
              <span className="text-sm font-bold text-stone-700">{displayPrice}</span>
            ) : (
              <span>
                {displayPrice}{" "}
                {!isHourly && (
                  <span className="text-xs font-normal text-stone-500">Fixed</span>
                )}
              </span>
            )}
          </div>
        </div>
      </div>

      {/* CARD FOOTER ACTIONS */}
      <div className="p-4 pt-0 grid grid-cols-2 gap-2">
        <Button variant="outline" size="sm" asChild className="rounded-xl h-10 text-xs font-semibold">
          <Link href={`/services/${service.id}`}>View Details</Link>
        </Button>

        {!isActive ? (
          <Button
            size="sm"
            disabled
            title="This service is currently unavailable"
            className="rounded-xl h-10 text-xs font-semibold opacity-50 cursor-not-allowed bg-stone-200 text-stone-500"
          >
            Unavailable
          </Button>
        ) : isQuotation ? (
          <Button
            size="sm"
            disabled
            title="Requires custom quotation from provider"
            className="rounded-xl h-10 text-xs font-semibold opacity-60 cursor-not-allowed bg-stone-200 text-stone-600"
          >
            Quote Only
          </Button>
        ) : (
          <Button
            size="sm"
            asChild
            className="rounded-xl h-10 text-xs font-bold shadow-xs bg-[#EA580C] hover:bg-[#C2410C] text-white"
          >
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
