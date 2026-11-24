"use client";

import * as React from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import {
  ArrowLeft,
  ShieldCheck,
  Wrench,
  CheckCircle2,
  Loader2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ProviderSpotlightCard } from "@/components/services/ProviderSpotlightCard";
import { ServiceReviewsSection } from "@/components/services/ServiceReviewsSection";
import { BookingWidget } from "@/components/booking/BookingWidget";
import { servicesService } from "@/features/services/services/services.service";
import { categoriesService } from "@/features/categories/services/categories.service";
import type { Service, Category } from "@/types/api";

export default function ServiceDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const serviceId = params?.id as string;

  // 1. Fetch Service Data
  const { data: service, isLoading, error } = useQuery({
    queryKey: ["service_details", serviceId],
    queryFn: () => servicesService.getById(serviceId),
    enabled: !!serviceId,
    staleTime: 1000 * 60 * 5,
  });

  // 2. Fetch Category List to map Category Name
  const { data: categories = [] } = useQuery({
    queryKey: ["categories", "all"],
    queryFn: () => categoriesService.getAll(),
    staleTime: 1000 * 60 * 15,
  });

  const categoryName = React.useMemo(() => {
    if (!service) return "Services";
    if (typeof service.category === "object" && service.category?.name) {
      return service.category.name;
    }
    const cat = categories.find((c: Category) => String(c.id) === String(service.category));
    return cat ? cat.name : "Local service";
  }, [service, categories]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#FAF9F6] flex flex-col items-center justify-center p-8 space-y-3">
        <Loader2 className="h-6 w-6 animate-spin text-stone-600" />
        <p className="text-xs text-stone-500">Loading service details...</p>
      </div>
    );
  }

  if (error || !service) {
    return (
      <div className="min-h-screen bg-[#FAF9F6] flex flex-col items-center justify-center p-8 space-y-3 text-center">
        <div className="w-12 h-12 rounded-xl bg-stone-100 text-stone-500 flex items-center justify-center">
          <Wrench className="h-5 w-5" />
        </div>
        <div className="space-y-1">
          <h2 className="text-xl font-semibold text-stone-900 font-heading">Service not found</h2>
          <p className="text-xs text-stone-500 max-w-sm">
            This service may have been deactivated or removed by the provider.
          </p>
        </div>
        <Button asChild size="sm" variant="outline" className="rounded-lg text-xs">
          <Link href="/services">Browse services</Link>
        </Button>
      </div>
    );
  }

  const hasCloudinaryImg = Boolean(service.image && service.image.startsWith("http"));
  const isQuotation = service.pricing_type === "quotation";
  const isHourly = service.pricing_type === "hourly";

  return (
    <div className="min-h-screen bg-[#FAF9F6] pb-20">
      {/* Top Breadcrumb Bar */}
      <div className="bg-white border-b border-stone-200 py-3.5">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl flex items-center justify-between">
          <Link
            href="/services"
            className="inline-flex items-center gap-1.5 text-xs font-medium text-stone-500 hover:text-stone-900 transition-colors"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            <span>Back to services</span>
          </Link>

          <span className="text-xs font-medium text-stone-600 bg-stone-100 px-2 py-0.5 rounded">
            {categoryName}
          </span>
        </div>
      </div>

      {/* Main 2-Column Layout */}
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl pt-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* LEFT COLUMN: Service information */}
          <div className="lg:col-span-8 space-y-6">
            {/* 1. Hero Media Card */}
            <div className="rounded-2xl bg-white border border-stone-200 overflow-hidden">
              <div className="relative aspect-[16/9] w-full bg-stone-100 overflow-hidden">
                {hasCloudinaryImg ? (
                  <img
                    src={service.image as string}
                    alt={service.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-stone-100 text-stone-400">
                    <Wrench className="h-12 w-12 opacity-50" />
                  </div>
                )}

                {/* Floating Top Badges */}
                <div className="absolute top-3 left-3 flex items-center gap-2">
                  <span className="px-2.5 py-1 rounded-md text-[11px] font-medium bg-white/95 text-stone-800 border border-stone-200 shadow-xs">
                    {isQuotation ? "Custom quote" : isHourly ? "Hourly service" : "Fixed price"}
                  </span>
                  <span className="px-2.5 py-1 rounded-md text-[11px] font-medium bg-stone-900 text-stone-100 flex items-center gap-1 shadow-xs">
                    <ShieldCheck className="h-3 w-3 text-emerald-400" />
                    Verified provider
                  </span>
                </div>
              </div>

              {/* Title & Metadata */}
              <div className="p-6 sm:p-7 space-y-3">
                <div className="space-y-1.5">
                  <h1 className="text-2xl sm:text-3xl font-semibold text-stone-900 tracking-tight font-heading">
                    {service.name}
                  </h1>

                  <div className="flex flex-wrap items-center gap-3 text-xs text-stone-500 pt-1">
                    <span className="text-stone-700 font-medium">
                      Category: {categoryName}
                    </span>
                    <span>•</span>
                    <span className="tabular-nums">
                      Price:{" "}
                      <strong className="text-stone-900 font-semibold">
                        {isQuotation
                          ? "On quotation"
                          : isHourly
                          ? `৳${service.hour_base_price ?? service.base_price}/hr`
                          : `৳${service.base_price ?? service.hour_base_price}`}
                      </strong>
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* 2. Service Description */}
            <div className="p-6 rounded-2xl bg-white border border-stone-200 space-y-4">
              <h3 className="font-semibold text-base text-stone-900 font-heading">
                About this service
              </h3>

              {service.description ? (
                <div
                  className="prose prose-stone max-w-none text-xs sm:text-sm text-stone-600 leading-relaxed space-y-2"
                  dangerouslySetInnerHTML={{ __html: service.description }}
                />
              ) : (
                <p className="text-xs sm:text-sm text-stone-500">
                  Professional trade service conducted by verified neighborhood craftsmen.
                </p>
              )}

              {/* Trust Guarantees Strip */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-5 border-t border-stone-100">
                <div className="p-3 rounded-xl bg-stone-50 border border-stone-200/80 flex items-start gap-2.5">
                  <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0 mt-0.5" />
                  <div>
                    <h5 className="font-semibold text-xs text-stone-900">20% advance held</h5>
                    <p className="text-[11px] text-stone-500">Only charged after acceptance</p>
                  </div>
                </div>

                <div className="p-3 rounded-xl bg-stone-50 border border-stone-200/80 flex items-start gap-2.5">
                  <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0 mt-0.5" />
                  <div>
                    <h5 className="font-semibold text-xs text-stone-900">Vetted identity</h5>
                    <p className="text-[11px] text-stone-500">Document and area checked</p>
                  </div>
                </div>

                <div className="p-3 rounded-xl bg-stone-50 border border-stone-200/80 flex items-start gap-2.5">
                  <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0 mt-0.5" />
                  <div>
                    <h5 className="font-semibold text-xs text-stone-900">Payment safe</h5>
                    <p className="text-[11px] text-stone-500">SSLCommerz encrypted card/bKash</p>
                  </div>
                </div>
              </div>
            </div>

            {/* 3. Verified Provider Spotlight Card */}
            <ProviderSpotlightCard
              providerUserId={service.provider as any}
              providerName={service.provider_name}
              providerArea={service.provider_area}
            />

            {/* 4. Customer Reviews Section */}
            <ServiceReviewsSection serviceId={service.id} />
          </div>

          {/* RIGHT COLUMN: Sticky Booking Dock */}
          <div className="lg:col-span-4">
            <BookingWidget service={service} />
          </div>
        </div>
      </div>
    </div>
  );
}
