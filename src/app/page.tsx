"use client";

import * as React from "react";
import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import {
  ShieldCheck,
  Search,
  CreditCard,
  CheckCircle2,
  ArrowRight,
  Briefcase,
  Wrench,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { HeroSearchSection } from "@/components/home/HeroSearchSection";
import { CategoryShowcase } from "@/components/home/CategoryShowcase";
import { ServiceCard, ServiceCardSkeleton } from "@/components/services/ServiceCard";
import { servicesService } from "@/features/services/services/services.service";
import type { Service } from "@/types/api";

export default function HomePage() {
  // Fetch featured services
  const { data: servicesData, isLoading: servicesLoading } = useQuery({
    queryKey: ["services", "featured_feed"],
    queryFn: () => servicesService.getPaginated({ page: 1 }),
    staleTime: 1000 * 60 * 5,
  });

  const featuredServices: Service[] = servicesData?.results || [];

  return (
    <div className="min-h-screen bg-[#FAF9F6]">
      {/* 1. HERO SEARCH SECTION */}
      <HeroSearchSection />

      {/* 2. CATEGORY BROWSE SECTION */}
      <CategoryShowcase />

      {/* 3. FEATURED SERVICES */}
      <section className="py-14 sm:py-16 border-b border-stone-200">
        <div className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row items-start sm:items-end justify-between mb-8 gap-4">
            <div className="space-y-1">
              <h2 className="text-xl sm:text-2xl font-semibold text-stone-900 tracking-tight font-heading">
                Featured local services
              </h2>
              <p className="text-xs text-stone-500">
                Services ready for online scheduling across your district
              </p>
            </div>

            <Button variant="outline" asChild className="rounded-lg h-9 text-xs font-medium border-stone-200 text-stone-700">
              <Link href="/services" className="flex items-center gap-1.5">
                <span>View all</span>
                <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </Button>
          </div>

          {servicesLoading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
              {Array.from({ length: 4 }).map((_, i) => (
                <ServiceCardSkeleton key={i} />
              ))}
            </div>
          ) : featuredServices.length === 0 ? (
            <div className="p-10 text-center rounded-2xl bg-white border border-stone-200 text-xs text-stone-500">
              No services currently listed. Check back shortly.
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
              {featuredServices.slice(0, 8).map((service) => (
                <ServiceCard key={service.id} service={service} />
              ))}
            </div>
          )}
        </div>
      </section>

      {/* 4. THREE-STEP PROCESS */}
      <section id="how-it-works" className="py-16 bg-white border-b border-stone-200">
        <div className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-left max-w-xl mb-10 space-y-1">
            <h2 className="text-xl sm:text-2xl font-semibold text-stone-900 font-heading">
              How booking works
            </h2>
            <p className="text-xs text-stone-500 leading-relaxed">
              Straightforward reservation with payment security for both customers and providers
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Step 1 */}
            <div className="p-6 rounded-2xl bg-stone-50 border border-stone-200/80 space-y-3">
              <span className="inline-block text-xs font-semibold text-stone-400 tabular-nums">01</span>
              <h3 className="font-semibold text-sm text-stone-900">
                Choose service and time
              </h3>
              <p className="text-xs text-stone-500 leading-relaxed">
                Select your upazila and preferred service slot. A 2-hour buffer prevents scheduling conflicts.
              </p>
            </div>

            {/* Step 2 */}
            <div className="p-6 rounded-2xl bg-stone-50 border border-stone-200/80 space-y-3">
              <span className="inline-block text-xs font-semibold text-stone-400 tabular-nums">02</span>
              <h3 className="font-semibold text-sm text-stone-900">
                Provider accepts and advance paid
              </h3>
              <p className="text-xs text-stone-500 leading-relaxed">
                Once the professional reviews your request, pay a 20% advance via SSLCommerz to confirm your slot.
              </p>
            </div>

            {/* Step 3 */}
            <div className="p-6 rounded-2xl bg-stone-50 border border-stone-200/80 space-y-3">
              <span className="inline-block text-xs font-semibold text-stone-400 tabular-nums">03</span>
              <h3 className="font-semibold text-sm text-stone-900">
                Service completed and balance settled
              </h3>
              <p className="text-xs text-stone-500 leading-relaxed">
                The craftsman arrives at your location. Pay the remaining 80% balance in cash or online after the job is done.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 5. BECOME A PRO ACTION STRIP */}
      <section className="py-14 bg-[#042F2E] text-stone-100">
        <div className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="p-8 sm:p-10 rounded-2xl bg-[#083a37] border border-[#0f4e4a] flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
            <div className="space-y-2 max-w-xl text-left">
              <span className="text-[11px] font-medium text-teal-300">
                Service provider registration
              </span>
              <h2 className="text-xl sm:text-2xl font-semibold text-white font-heading">
                Offer your trade services in your area
              </h2>
              <p className="text-xs text-stone-300 leading-relaxed">
                List your services, receive bookings with guaranteed deposits, and build a verified client reputation.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2.5 shrink-0">
              <Button
                asChild
                className="h-10 px-5 rounded-lg font-medium text-xs bg-[#EA580C] hover:bg-[#c2410c] text-white"
              >
                <Link href="/register?role=SERVICE_PROVIDER" className="flex items-center gap-1.5">
                  <span>Register as provider</span>
                  <ArrowRight className="h-3.5 w-3.5" />
                </Link>
              </Button>
              <Button
                variant="outline"
                asChild
                className="h-10 px-4 rounded-lg font-medium text-xs border-teal-800 text-stone-200 hover:bg-teal-900/40"
              >
                <Link href="/login">Provider sign in</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
