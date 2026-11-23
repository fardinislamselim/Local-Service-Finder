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
  Star,
  Sparkles,
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
      {/* 1. EDITORIAL HERO & LOCATION DOCK */}
      <HeroSearchSection />

      {/* 2. CATEGORY BENTO STRIP */}
      <CategoryShowcase />

      {/* 3. FEATURED LOCAL SERVICES */}
      <section className="py-16 sm:py-20 border-b border-stone-200">
        <div className="container mx-auto px-4 sm:px-8 max-w-7xl">
          <div className="flex flex-col sm:flex-row items-start sm:items-end justify-between mb-10 gap-4">
            <div className="space-y-1.5">
              <div className="inline-flex items-center gap-1.5 text-xs font-bold text-teal-800 uppercase tracking-wider">
                <Sparkles className="h-3.5 w-3.5 text-orange-600" />
                <span>Top Rated Near You</span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-stone-900 tracking-tight font-heading">
                Featured Verified Services
              </h2>
            </div>

            <Button variant="outline" asChild className="rounded-xl h-10 text-xs font-bold gap-1.5">
              <Link href="/services">
                <span>View All Services</span>
                <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </Button>
          </div>

          {servicesLoading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {Array.from({ length: 4 }).map((_, i) => (
                <ServiceCardSkeleton key={i} />
              ))}
            </div>
          ) : featuredServices.length === 0 ? (
            <div className="p-12 text-center rounded-3xl bg-white border border-stone-200 text-stone-500">
              No services currently available. Check back shortly.
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {featuredServices.slice(0, 8).map((service) => (
                <ServiceCard key={service.id} service={service} />
              ))}
            </div>
          )}
        </div>
      </section>

      {/* 4. "HOW IT WORKS" 3-STEP JOURNEY */}
      <section id="how-it-works" className="py-20 bg-stone-100/70 border-b border-stone-200">
        <div className="container mx-auto px-4 sm:px-8 max-w-7xl">
          <div className="text-center max-w-2xl mx-auto space-y-3 mb-14">
            <span className="text-xs font-bold uppercase tracking-wider text-orange-600">
              Simple 3-Step Process
            </span>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-stone-900 font-heading">
              How ProLagbe Works
            </h2>
            <p className="text-sm text-stone-600">
              A transparent, safe, and accountable way to hire home repair and professional trade services in Bangladesh.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Step 1 */}
            <div className="p-8 rounded-3xl bg-white border border-stone-200 shadow-tactile relative overflow-hidden space-y-4">
              <div className="w-12 h-12 rounded-2xl bg-teal-50 text-teal-800 flex items-center justify-center font-extrabold text-base">
                1
              </div>
              <h3 className="font-extrabold text-lg text-stone-900 font-heading">
                Search by Upazila & Need
              </h3>
              <p className="text-xs text-stone-500 leading-relaxed">
                Filter verified electricians, plumbers, and technicians based on your exact district and upazila location.
              </p>
            </div>

            {/* Step 2 */}
            <div className="p-8 rounded-3xl bg-white border border-stone-200 shadow-tactile relative overflow-hidden space-y-4">
              <div className="w-12 h-12 rounded-2xl bg-orange-50 text-orange-600 flex items-center justify-center font-extrabold text-base">
                2
              </div>
              <h3 className="font-extrabold text-lg text-stone-900 font-heading">
                Book & Pay 20% Advance
              </h3>
              <p className="text-xs text-stone-500 leading-relaxed">
                Once the provider accepts your booking date and time, pay a secure 20% advance via SSLCommerz to lock your slot.
              </p>
            </div>

            {/* Step 3 */}
            <div className="p-8 rounded-3xl bg-white border border-stone-200 shadow-tactile relative overflow-hidden space-y-4">
              <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-700 flex items-center justify-center font-extrabold text-base">
                3
              </div>
              <h3 className="font-extrabold text-lg text-stone-900 font-heading">
                Job Done & Settle Balance
              </h3>
              <p className="text-xs text-stone-500 leading-relaxed">
                Technician arrives at your doorstep. Once the job is completed to your satisfaction, pay the remaining 80% via cash or online.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 5. BECOME A PRO CONVERSION BANNER */}
      <section className="py-20 bg-[#042F2E] text-stone-100 relative overflow-hidden">
        {/* Glow */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-teal-600/20 rounded-full blur-3xl pointer-events-none" />

        <div className="container mx-auto px-4 sm:px-8 max-w-7xl relative z-10">
          <div className="p-10 sm:p-14 rounded-3xl bg-teal-950/80 border border-teal-800 shadow-2xl flex flex-col lg:flex-row items-center justify-between gap-8">
            <div className="space-y-3 text-left max-w-xl">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-orange-600/20 text-orange-400 border border-orange-500/30">
                <Briefcase className="h-3.5 w-3.5" />
                <span>For Skilled Professionals</span>
              </div>
              <h2 className="text-3xl sm:text-4xl font-extrabold text-white font-heading">
                Are you a skilled technician or artisan?
              </h2>
              <p className="text-sm text-teal-200/80 leading-relaxed">
                Join Bangladesh&apos;s fastest growing verified home services network. List your trade services, gain verified badges, and receive bookings daily.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row items-center gap-3 shrink-0">
              <Button
                asChild
                className="h-12 px-7 rounded-xl font-bold text-sm bg-orange-600 hover:bg-orange-700 text-white shadow-lg gap-2"
              >
                <Link href="/register?role=SERVICE_PROVIDER">
                  <span>Register as Service Pro</span>
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </Button>
              <Button
                variant="outline"
                asChild
                className="h-12 px-6 rounded-xl font-semibold text-sm border-teal-700 text-teal-200 hover:bg-teal-900/60"
              >
                <Link href="/login">Provider Login</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
