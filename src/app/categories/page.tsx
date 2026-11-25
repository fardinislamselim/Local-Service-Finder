"use client";

import * as React from "react";
import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { ArrowRight, Layers, Search, ShieldCheck, Wrench } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { categoriesService } from "@/features/categories/services/categories.service";
import { servicesService } from "@/features/services/services/services.service";
import type { Category, Service } from "@/types/api";

function getCategoryId(category: Service["category"]): string {
  if (category && typeof category === "object") return String(category.id ?? "");
  return String(category ?? "");
}

export default function CategoriesPage() {
  const [searchTerm, setSearchTerm] = React.useState("");
  const [activeOnly, setActiveOnly] = React.useState(false);

  const { data: categories = [], isLoading: categoriesLoading } = useQuery<Category[]>({
    queryKey: ["categories", "all"],
    queryFn: () => categoriesService.getAll(),
    staleTime: 1000 * 60 * 15,
  });

  const { data: services = [] } = useQuery<Service[]>({
    queryKey: ["services", "all_service_lookup"],
    queryFn: () => servicesService.getAll(),
    staleTime: 1000 * 60 * 5,
  });

  // Count the active services listed under each category.
  const serviceCounts = React.useMemo(() => {
    const counts: Record<string, number> = {};
    for (const service of services) {
      if (service.is_active === false) continue;
      const key = getCategoryId(service.category);
      if (!key) continue;
      counts[key] = (counts[key] || 0) + 1;
    }
    return counts;
  }, [services]);

  const visibleCategories = React.useMemo(() => {
    const term = searchTerm.trim().toLowerCase();
    return categories.filter((category) => {
      if (activeOnly && category.is_active === false) return false;
      if (!term) return true;
      return category.name?.toLowerCase().includes(term);
    });
  }, [categories, searchTerm, activeOnly]);

  return (
    <div className="min-h-screen bg-[#FAF9F6]">
      {/* Hero header */}
      <section className="bg-white border-b border-stone-200">
        <div className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8 py-10 sm:py-14">
          <div className="max-w-2xl space-y-3">
            <span className="inline-flex items-center gap-1.5 text-[11px] font-medium text-[#115E59] bg-teal-50 border border-teal-200/80 px-2.5 py-1 rounded-full">
              <ShieldCheck className="h-3.5 w-3.5" />
              Verified local professionals
            </span>
            <h1 className="text-2xl sm:text-3xl font-semibold text-stone-900 tracking-tight font-heading">
              Browse All Service Categories
            </h1>
            <p className="text-xs sm:text-sm text-stone-500 leading-relaxed">
              Find the right trade for the job. Every category lists verified professionals
              available in your area.
            </p>
          </div>

          {/* Instant search + active toggle */}
          <div className="mt-7 flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-stone-400 pointer-events-none" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search categories..."
                aria-label="Search categories"
                className="w-full h-11 pl-10 pr-3 rounded-xl bg-stone-50 border border-stone-200 text-xs font-medium text-stone-800 placeholder:text-stone-400 focus:outline-none focus:ring-2 focus:ring-teal-700/20 focus:border-[#115E59] transition-colors"
              />
            </div>

            <button
              type="button"
              role="switch"
              aria-checked={activeOnly}
              onClick={() => setActiveOnly((value) => !value)}
              className={`h-11 shrink-0 px-4 rounded-xl border text-xs font-semibold flex items-center justify-center gap-2 transition-colors cursor-pointer ${
                activeOnly
                  ? "bg-[#115E59] border-[#115E59] text-white"
                  : "bg-stone-50 border-stone-200 text-stone-600 hover:bg-stone-100"
              }`}
            >
              <span
                className={`h-2 w-2 rounded-full ${activeOnly ? "bg-emerald-300" : "bg-stone-400"}`}
                aria-hidden="true"
              />
              Active only
            </button>
          </div>
        </div>
      </section>

      {/* Category grid */}
      <section className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8 py-10">
        <div className="flex items-center justify-between gap-3 pb-5">
          <p className="text-xs text-stone-500">
            Showing <strong className="text-stone-900 tabular-nums">{visibleCategories.length}</strong> of{" "}
            <strong className="text-stone-900 tabular-nums">{categories.length}</strong> categories
          </p>
          <Link
            href="/services"
            className="text-xs font-medium text-stone-600 hover:text-stone-900 inline-flex items-center gap-1 group"
          >
            <span>Browse all services</span>
            <ArrowRight className="h-3 w-3 transition-transform group-hover:translate-x-0.5" />
          </Link>
        </div>

        {categoriesLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {Array.from({ length: 8 }).map((_, index) => (
              <div
                key={index}
                className="h-64 rounded-2xl bg-stone-200/60 animate-pulse border border-stone-200"
              />
            ))}
          </div>
        ) : visibleCategories.length === 0 ? (
          <div className="p-10 text-center rounded-2xl bg-white border border-stone-200 space-y-3">
            <Layers className="h-8 w-8 text-stone-400 mx-auto" />
            <div className="space-y-1">
              <h2 className="font-semibold text-sm text-stone-900 font-heading">
                No categories found
              </h2>
              <p className="text-xs text-stone-500 max-w-sm mx-auto">
                Try a different search term or turn off the active-only filter.
              </p>
            </div>
            {(searchTerm || activeOnly) && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setSearchTerm("");
                  setActiveOnly(false);
                }}
                className="rounded-lg text-xs h-8"
              >
                Clear filters
              </Button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {visibleCategories.map((category) => {
              const count = serviceCounts[String(category.id)] || 0;
              const isActive = category.is_active !== false;

              return (
                <Link
                  key={category.id}
                  href={`/services?category=${category.id}`}
                  className="group flex flex-col rounded-2xl bg-white border border-stone-200 overflow-hidden shadow-tactile hover:shadow-tactile-hover hover:border-stone-300 transition-all"
                >
                  {/* Category image or teal fallback */}
                  <div className="relative aspect-[16/10] w-full bg-[#115E59] overflow-hidden">
                    {category.image ? (
                      <img
                        src={category.image}
                        alt={category.name}
                        className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-[#115E59] text-teal-100">
                        <Wrench className="h-10 w-10 opacity-80" />
                      </div>
                    )}

                    <div className="absolute top-2.5 left-2.5 flex flex-wrap items-center gap-1.5">
                      <Badge
                        variant="outline"
                        className={`text-[10px] font-medium border shadow-sm ${
                          isActive
                            ? "bg-emerald-50/95 text-emerald-800 border-emerald-200"
                            : "bg-stone-100/95 text-stone-600 border-stone-300"
                        }`}
                      >
                        {isActive ? "Active" : "Inactive"}
                      </Badge>
                    </div>
                  </div>

                  <div className="flex flex-1 flex-col gap-3 p-4">
                    <div className="space-y-1">
                      <h2 className="font-semibold text-sm text-stone-900 font-heading line-clamp-1 group-hover:text-[#115E59] transition-colors">
                        {category.name}
                      </h2>
                      <p className="text-[11px] text-stone-500 tabular-nums">
                        {count} {count === 1 ? "Service" : "Services"} Available
                      </p>
                    </div>

                    <span className="mt-auto inline-flex items-center justify-between gap-2 text-xs font-semibold text-[#EA580C] group-hover:text-[#c2410c] transition-colors">
                      <span>Browse Services</span>
                      <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
                    </span>
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </section>
    </div>
  );
}
