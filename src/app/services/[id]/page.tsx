"use client";

import * as React from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import {
  ArrowLeft,
  ShieldCheck,
  Star,
  Clock,
  Wrench,
  CheckCircle2,
  Share2,
  Heart,
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
    return cat ? cat.name : "Local Service";
  }, [service, categories]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#FAF9F6] flex flex-col items-center justify-center p-8 space-y-4">
        <Loader2 className="h-8 w-8 animate-spin text-teal-800" />
        <p className="text-xs font-semibold text-stone-500">Loading service details & provider profile...</p>
      </div>
    );
  }

  if (error || !service) {
    return (
      <div className="min-h-screen bg-[#FAF9F6] flex flex-col items-center justify-center p-8 space-y-4 text-center">
        <div className="w-14 h-14 rounded-2xl bg-rose-50 border border-rose-200 text-rose-600 flex items-center justify-center">
          <Wrench className="h-6 w-6" />
        </div>
        <div className="space-y-1">
          <h2 className="text-2xl font-extrabold text-stone-900 font-heading">Service Not Found</h2>
          <p className="text-xs text-stone-500 max-w-sm">
            The requested service may have been deactivated or removed by the provider.
          </p>
        </div>
        <Button asChild className="rounded-xl">
          <Link href="/services">Browse All Services</Link>
        </Button>
      </div>
    );
  }

  const hasCloudinaryImg = Boolean(service.image && service.image.startsWith("http"));
  const isQuotation = service.pricing_type === "quotation";
  const isHourly = service.pricing_type === "hourly";

  return (
    <div className="min-h-screen bg-[#FAF9F6] pb-24">
      {/* Top Breadcrumb & Actions Bar */}
      <div className="bg-white border-b border-stone-200 py-4">
        <div className="container mx-auto px-4 sm:px-8 max-w-7xl flex items-center justify-between">
          <Link
            href="/services"
            className="inline-flex items-center gap-1.5 text-xs font-bold text-stone-600 hover:text-stone-900 transition-colors"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            <span>Back to Services</span>
          </Link>

          <div className="flex items-center gap-2">
            <Badge variant="outline" className="text-xs font-bold bg-teal-50 text-teal-800 border-teal-200">
              {categoryName}
            </Badge>
          </div>
        </div>
      </div>

      {/* Main 2-Column Layout */}
      <div className="container mx-auto px-4 sm:px-8 max-w-7xl pt-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
          {/* LEFT COLUMN (65% on desktop): Showcase, Provider & Reviews */}
          <div className="lg:col-span-8 space-y-8">
            {/* 1. Large Hero Media Gallery */}
            <div className="rounded-3xl bg-white border border-stone-200 overflow-hidden shadow-2xs">
              <div className="relative aspect-[16/9] w-full bg-stone-100 overflow-hidden">
                {hasCloudinaryImg ? (
                  <img
                    src={service.image as string}
                    alt={service.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-teal-900/10 text-teal-800">
                    <Wrench className="h-16 w-16 opacity-50" />
                  </div>
                )}

                {/* Floating Top Badges */}
                <div className="absolute top-4 left-4 flex items-center gap-2">
                  <span className="px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-white/95 backdrop-blur-md shadow-xs border border-stone-200 text-stone-900">
                    {isQuotation ? "Custom Quotation" : isHourly ? "Hourly Service" : "Fixed Pricing"}
                  </span>
                  <span className="px-3 py-1 rounded-full text-xs font-bold bg-teal-900/90 text-white backdrop-blur-md shadow-xs flex items-center gap-1">
                    <ShieldCheck className="h-3.5 w-3.5 text-emerald-400" />
                    Verified Provider
                  </span>
                </div>
              </div>

              {/* Title & Metadata */}
              <div className="p-6 sm:p-8 space-y-4">
                <div className="space-y-2">
                  <h1 className="text-3xl sm:text-4xl font-extrabold text-stone-900 tracking-tight font-heading">
                    {service.name}
                  </h1>

                  <div className="flex flex-wrap items-center gap-4 text-xs font-medium text-stone-500 pt-1">
                    <span className="text-teal-800 font-bold bg-teal-50 px-2.5 py-1 rounded-lg border border-teal-200">
                      Category: {categoryName}
                    </span>
                    <span>•</span>
                    <span className="tabular-nums">
                      Price:{" "}
                      <strong className="text-stone-900">
                        {isQuotation
                          ? "On Quotation"
                          : isHourly
                          ? `৳${service.hour_base_price}/hour`
                          : `৳${service.base_price} Fixed`}
                      </strong>
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* 2. Service Description Typographic Container */}
            <div className="p-6 sm:p-8 rounded-3xl bg-white border border-stone-200 shadow-2xs space-y-4">
              <h3 className="font-extrabold text-xl text-stone-900 font-heading">
                About This Service
              </h3>

              {service.description ? (
                /* Safely rendered sanitized HTML description */
                <div
                  className="prose prose-stone max-w-none text-xs sm:text-sm text-stone-600 leading-relaxed space-y-2"
                  dangerouslySetInnerHTML={{ __html: service.description }}
                />
              ) : (
                <p className="text-sm text-stone-500">
                  Professional home and trade service conducted by background-checked craftsmen.
                </p>
              )}

              {/* Trust Guarantees Strip */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-6 border-t border-stone-100">
                <div className="p-3.5 rounded-2xl bg-stone-50 border border-stone-200 flex items-start gap-2.5">
                  <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0 mt-0.5" />
                  <div>
                    <h5 className="font-bold text-xs text-stone-900">20% Advance Escrow</h5>
                    <p className="text-[11px] text-stone-500">Held safely until booking accepted.</p>
                  </div>
                </div>

                <div className="p-3.5 rounded-2xl bg-stone-50 border border-stone-200 flex items-start gap-2.5">
                  <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0 mt-0.5" />
                  <div>
                    <h5 className="font-bold text-xs text-stone-900">Background Checked</h5>
                    <p className="text-[11px] text-stone-500">Vetted identity & experience.</p>
                  </div>
                </div>

                <div className="p-3.5 rounded-2xl bg-stone-50 border border-stone-200 flex items-start gap-2.5">
                  <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0 mt-0.5" />
                  <div>
                    <h5 className="font-bold text-xs text-stone-900">SSLCommerz Protected</h5>
                    <p className="text-[11px] text-stone-500">Encrypted card & bKash checkout.</p>
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

          {/* RIGHT COLUMN (35% on desktop): Sticky Interactive Booking Dock */}
          <div className="lg:col-span-4">
            <BookingWidget service={service} />
          </div>
        </div>
      </div>
    </div>
  );
}
