"use client";

import * as React from "react";
import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { Star, ShieldCheck, Wrench, Tag } from "lucide-react";
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
    if (isQuotation) return "Custom quote";

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
    return "Professional local trade service with verified craftsman arrival.";
  }, [service.shot_description, service.description]);

  return (
    <div className="group rounded-2xl bg-white border border-stone-200 hover:border-stone-300 transition-colors flex flex-col justify-between overflow-hidden">
      {/* Media: 16:10 Container */}
      <div className="relative aspect-[16/10] bg-stone-100 overflow-hidden">
        {hasCloudinaryImg ? (
          <img
            src={service.image as string}
            alt={service.name}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-stone-100 text-stone-400">
            <Wrench className="h-8 w-8 opacity-60" />
          </div>
        )}

        {/* Pricing Type Badge (Top Left) */}
        <div className="absolute top-2.5 left-2.5">
          <span className="px-2 py-0.5 rounded-md text-[10px] font-medium bg-white/95 text-stone-700 shadow-xs border border-stone-200">
            {isQuotation ? "Quote" : isHourly ? "Hourly" : "Fixed price"}
          </span>
        </div>

        {/* Status Pill (Top Right) */}
        <div className="absolute top-2.5 right-2.5">
          {isActive ? (
            <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md text-[10px] font-medium bg-white/95 text-stone-700 shadow-xs border border-stone-200">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-600" />
              <span>Available</span>
            </span>
          ) : (
            <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md text-[10px] font-medium bg-stone-100 text-stone-500 shadow-xs border border-stone-200">
              <span className="h-1.5 w-1.5 rounded-full bg-stone-400" />
              <span>Unavailable</span>
            </span>
          )}
        </div>

        {/* Rating Score (Bottom Right) */}
        <div className="absolute bottom-2.5 right-2.5">
          <div className="flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-semibold bg-white/95 shadow-xs border border-stone-200 text-stone-800 tabular-nums">
            <Star className="h-3 w-3 fill-amber-400 text-amber-500" />
            <span>{rating !== null && rating !== undefined ? Number(rating).toFixed(1) : "New"}</span>
          </div>
        </div>
      </div>

      {/* Body */}
      <div className="p-4 flex-1 flex flex-col justify-between space-y-3">
        <div className="space-y-1.5">
          {/* Category Tag & Pro Badge */}
          <div className="flex items-center justify-between gap-2 text-xs">
            {resolvedCategoryName ? (
              <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-medium bg-stone-100 text-stone-600 truncate max-w-[150px]">
                <Tag className="h-2.5 w-2.5 text-stone-400 shrink-0" />
                <span className="truncate">{resolvedCategoryName}</span>
              </span>
            ) : (
              <span />
            )}
            <div className="flex items-center gap-1 text-[11px] text-stone-500 shrink-0">
              <ShieldCheck className="h-3 w-3 text-emerald-600" />
              <span>Verified</span>
            </div>
          </div>

          {/* Service Title */}
          <h3 className="font-semibold text-sm text-stone-900 line-clamp-1 group-hover:text-[#115E59] transition-colors">
            {service.name}
          </h3>

          {/* Description */}
          <p className="text-xs text-stone-500 line-clamp-2 leading-relaxed">
            {overviewText}
          </p>
        </div>

        {/* Pricing display */}
        <div className="pt-2.5 border-t border-stone-100 flex items-baseline justify-between">
          <span className="text-[11px] text-stone-400">Pricing</span>
          <span className="text-sm font-semibold text-stone-900 tabular-nums">
            {displayPrice}
          </span>
        </div>
      </div>

      {/* Footer Actions */}
      <div className="p-3.5 pt-0 grid grid-cols-2 gap-2">
        <Button variant="outline" size="sm" asChild className="rounded-lg h-8 text-xs font-medium border-stone-200">
          <Link href={`/services/${service.id}`}>Details</Link>
        </Button>

        {!isActive ? (
          <Button
            size="sm"
            disabled
            className="rounded-lg h-8 text-xs font-medium bg-stone-100 text-stone-400 cursor-not-allowed"
          >
            Unavailable
          </Button>
        ) : isQuotation ? (
          <Button
            size="sm"
            disabled
            className="rounded-lg h-8 text-xs font-medium bg-stone-100 text-stone-500 cursor-not-allowed"
          >
            Quote only
          </Button>
        ) : (
          <Button
            size="sm"
            asChild
            className="rounded-lg h-8 text-xs font-medium bg-[#EA580C] hover:bg-[#c2410c] text-white"
          >
            <Link href={`/services/${service.id}`}>Book now</Link>
          </Button>
        )}
      </div>
    </div>
  );
}

export function ServiceCardSkeleton() {
  return (
    <div className="rounded-2xl bg-white border border-stone-200 p-3.5 space-y-3 animate-pulse">
      <div className="aspect-[16/10] bg-stone-100 rounded-xl" />
      <div className="space-y-1.5">
        <div className="h-3 bg-stone-100 rounded w-1/3" />
        <div className="h-4 bg-stone-100 rounded w-3/4" />
        <div className="h-3 bg-stone-100 rounded w-full" />
      </div>
      <div className="pt-2 border-t border-stone-100 flex justify-between">
        <div className="h-3 bg-stone-100 rounded w-1/4" />
        <div className="h-4 bg-stone-100 rounded w-1/3" />
      </div>
      <div className="grid grid-cols-2 gap-2 pt-1">
        <div className="h-8 bg-stone-100 rounded-lg" />
        <div className="h-8 bg-stone-100 rounded-lg" />
      </div>
    </div>
  );
}

export default ServiceCard;
