"use client";

import * as React from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import {
  Search,
  Filter,
  SlidersHorizontal,
  X,
  RotateCcw,
  Sparkles,
  Layers,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { LocationSelector } from "@/components/locations/LocationSelector";
import { ServiceCard, ServiceCardSkeleton } from "@/components/services/ServiceCard";
import { servicesService } from "@/features/services/services/services.service";
import { categoriesService } from "@/features/categories/services/categories.service";
import type { Category, Service } from "@/types/api";

function ServicesDiscoveryContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  // URL state
  const initialSearch = searchParams.get("search") || "";
  const initialCategory = searchParams.get("category") || "";
  const initialPricingType = (searchParams.get("pricing_type") as any) || "";
  const initialUpazila = searchParams.get("upazila") ? Number(searchParams.get("upazila")) : null;
  const initialArea = searchParams.get("area") || "";
  const initialPage = searchParams.get("page") ? Number(searchParams.get("page")) : 1;

  // Local filter states
  const [searchTerm, setSearchTerm] = React.useState(initialSearch);
  const [selectedCategory, setSelectedCategory] = React.useState(initialCategory);
  const [pricingType, setPricingType] = React.useState<"fixed" | "hourly" | "quotation" | "">(initialPricingType);
  const [upazilaId, setUpazilaId] = React.useState<number | null>(initialUpazila);
  const [area, setArea] = React.useState(initialArea);
  const [page, setPage] = React.useState(initialPage);

  // Sync state with URL params
  const updateUrl = (newParams: Record<string, string | number | null | undefined>) => {
    const current = new URLSearchParams(searchParams.toString());
    Object.entries(newParams).forEach(([k, v]) => {
      if (v === null || v === undefined || v === "") {
        current.delete(k);
      } else {
        current.set(k, String(v));
      }
    });
    router.push(`/services?${current.toString()}`);
  };

  // Fetch Categories for Sidebar
  const { data: categories = [] } = useQuery({
    queryKey: ["categories", "all"],
    queryFn: () => categoriesService.getAll(),
    staleTime: 1000 * 60 * 15,
  });

  // Fetch Services with integrated query parameters
  const { data: paginatedData, isLoading } = useQuery({
    queryKey: [
      "services",
      "discovery",
      { page, search: searchTerm, category: selectedCategory, pricing_type: pricingType, upazila: upazilaId, area },
    ],
    queryFn: () =>
      servicesService.getPaginated({
        page,
        search: searchTerm,
        category: selectedCategory || undefined,
        pricing_type: (pricingType as any) || undefined,
        upazila: upazilaId || undefined,
        area: area || undefined,
      }),
    staleTime: 1000 * 60 * 2,
  });

  const services: Service[] = paginatedData?.results || [];
  const meta = paginatedData?.meta;
  const totalCount = meta?.total ?? (paginatedData?.count ?? services.length);
  const totalPages = meta?.total_pages ?? Math.max(1, Math.ceil(totalCount / 12));
  const currentPage = meta?.page ?? page;

  const handleResetFilters = () => {
    setSearchTerm("");
    setSelectedCategory("");
    setPricingType("");
    setUpazilaId(null);
    setArea("");
    setPage(1);
    router.push("/services");
  };

  return (
    <div className="min-h-screen bg-[#FAF9F6]">
      {/* Top Banner & Search Control Bar */}
      <div className="bg-white border-b border-stone-200 py-8">
        <div className="container mx-auto px-4 sm:px-8 max-w-7xl">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 mb-6">
            <div>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-stone-900 font-heading">
                Browse Verified Local Services
              </h1>
              <p className="text-xs sm:text-sm text-stone-500 mt-1">
                Showing <strong className="text-teal-900 tabular-nums">{services.length}</strong> of{" "}
                <strong className="text-teal-900 tabular-nums">{totalCount}</strong> Services
              </p>
            </div>

            {(searchTerm || selectedCategory || pricingType || upazilaId || area) && (
              <Button
                variant="outline"
                size="sm"
                onClick={handleResetFilters}
                className="rounded-xl text-xs gap-1.5 border-stone-300"
              >
                <RotateCcw className="h-3.5 w-3.5" />
                <span>Reset All Filters</span>
              </Button>
            )}
          </div>

          {/* Integrated Location & Keyword Filter Header */}
          <div className="p-3 rounded-2xl bg-stone-50 border border-stone-200 shadow-2xs space-y-3">
            <LocationSelector
              selectedUpazilaId={upazilaId}
              onUpazilaChange={(id) => {
                setUpazilaId(id);
                setPage(1);
                updateUrl({ upazila: id, page: 1 });
              }}
              areaValue={area}
              onAreaChange={(val) => {
                setArea(val);
                updateUrl({ area: val, page: 1 });
              }}
            />
          </div>
        </div>
      </div>

      {/* Main Content: Sidebar + Grid */}
      <div className="container mx-auto px-4 sm:px-8 max-w-7xl py-10">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* LEFT FILTER SIDEBAR */}
          <div className="space-y-6">
            <div className="p-6 rounded-3xl bg-white border border-stone-200 shadow-2xs space-y-6">
              <div className="flex items-center justify-between border-b border-stone-100 pb-4">
                <div className="flex items-center gap-2 font-extrabold text-sm text-stone-900 font-heading">
                  <SlidersHorizontal className="h-4 w-4 text-teal-800" />
                  <span>Filters</span>
                </div>
              </div>

              {/* Keyword Search Input */}
              <div className="space-y-2">
                <label className="text-xs font-bold text-stone-700">Search Keyword</label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-stone-400" />
                  <input
                    type="text"
                    placeholder="e.g. Electrician..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        setPage(1);
                        updateUrl({ search: searchTerm, page: 1 });
                      }
                    }}
                    className="w-full h-10 pl-9 pr-3 rounded-xl bg-stone-50 border border-stone-200 text-xs font-medium text-stone-800 focus:outline-none focus:ring-2 focus:ring-teal-700/20 focus:border-teal-700"
                  />
                </div>
              </div>

              {/* Pricing Type Filter */}
              <div className="space-y-2">
                <label className="text-xs font-bold text-stone-700">Pricing Model</label>
                <div className="space-y-1.5">
                  {[
                    { id: "", label: "All Pricing Types" },
                    { id: "fixed", label: "Fixed Price" },
                    { id: "hourly", label: "Hourly Rate" },
                    { id: "quotation", label: "Custom Quotation" },
                  ].map((p) => (
                    <button
                      key={p.id}
                      type="button"
                      onClick={() => {
                        setPricingType(p.id as any);
                        setPage(1);
                        updateUrl({ pricing_type: p.id, page: 1 });
                      }}
                      className={`w-full text-left px-3 py-2 rounded-xl text-xs font-semibold transition-colors flex items-center justify-between cursor-pointer ${
                        pricingType === p.id
                          ? "bg-teal-100/70 text-teal-900"
                          : "text-stone-600 hover:bg-stone-100"
                      }`}
                    >
                      <span>{p.label}</span>
                      {pricingType === p.id && <span className="h-2 w-2 rounded-full bg-teal-800" />}
                    </button>
                  ))}
                </div>
              </div>

              {/* Category Filter */}
              <div className="space-y-2">
                <label className="text-xs font-bold text-stone-700">Categories</label>
                <div className="space-y-1 max-h-64 overflow-y-auto pr-1">
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedCategory("");
                      setPage(1);
                      updateUrl({ category: "", page: 1 });
                    }}
                    className={`w-full text-left px-3 py-2 rounded-xl text-xs font-semibold transition-colors flex items-center justify-between cursor-pointer ${
                      selectedCategory === ""
                        ? "bg-teal-100/70 text-teal-900"
                        : "text-stone-600 hover:bg-stone-100"
                    }`}
                  >
                    <span>All Categories</span>
                    {selectedCategory === "" && <span className="h-2 w-2 rounded-full bg-teal-800" />}
                  </button>

                  {categories.map((cat: Category) => (
                    <button
                      key={cat.id}
                      type="button"
                      onClick={() => {
                        setSelectedCategory(String(cat.id));
                        setPage(1);
                        updateUrl({ category: cat.id, page: 1 });
                      }}
                      className={`w-full text-left px-3 py-2 rounded-xl text-xs font-semibold transition-colors flex items-center justify-between cursor-pointer ${
                        selectedCategory === String(cat.id)
                          ? "bg-teal-100/70 text-teal-900"
                          : "text-stone-600 hover:bg-stone-100"
                      }`}
                    >
                      <span className="line-clamp-1">{cat.name}</span>
                      {selectedCategory === String(cat.id) && (
                        <span className="h-2 w-2 rounded-full bg-teal-800 shrink-0" />
                      )}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* RIGHT SERVICE CARDS GRID */}
          <div className="lg:col-span-3 space-y-8">
            {isLoading ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
                {Array.from({ length: 6 }).map((_, i) => (
                  <ServiceCardSkeleton key={i} />
                ))}
              </div>
            ) : services.length === 0 ? (
              /* Custom Illustrated Empty State */
              <div className="p-12 text-center rounded-3xl bg-white border border-stone-200 shadow-2xs space-y-4">
                <div className="w-16 h-16 rounded-2xl bg-orange-50 border border-orange-200 flex items-center justify-center text-orange-600 mx-auto">
                  <Search className="h-8 w-8" />
                </div>
                <div className="space-y-1">
                  <h3 className="font-extrabold text-lg text-stone-900 font-heading">
                    No matching services found
                  </h3>
                  <p className="text-xs text-stone-500 max-w-sm mx-auto">
                    We could not find any active services matching your location or filter combination.
                  </p>
                </div>
                <Button onClick={handleResetFilters} variant="outline" className="rounded-xl text-xs">
                  Clear Filters
                </Button>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
                {services.map((service) => (
                  <ServiceCard key={service.id} service={service} />
                ))}
              </div>
            )}

            {/* Pagination Controls */}
            {totalPages > 1 && (
              <div className="flex flex-wrap items-center justify-center gap-2 pt-6 border-t border-stone-200">
                <Button
                  variant="outline"
                  size="sm"
                  disabled={!meta?.previous && currentPage <= 1}
                  onClick={() => {
                    const prev = Math.max(1, currentPage - 1);
                    setPage(prev);
                    updateUrl({ page: prev });
                    window.scrollTo({ top: 0, behavior: "smooth" });
                  }}
                  className="rounded-xl h-10 px-3 text-xs gap-1 cursor-pointer"
                >
                  <ChevronLeft className="h-4 w-4" />
                  <span>Previous</span>
                </Button>

                <div className="flex items-center gap-1 px-2">
                  {Array.from({ length: totalPages }).map((_, idx) => {
                    const pageNum = idx + 1;
                    // Show first, last, and pages close to currentPage
                    if (
                      pageNum === 1 ||
                      pageNum === totalPages ||
                      (pageNum >= currentPage - 1 && pageNum <= currentPage + 1)
                    ) {
                      const isCurrent = pageNum === currentPage;
                      return (
                        <button
                          key={pageNum}
                          type="button"
                          onClick={() => {
                            setPage(pageNum);
                            updateUrl({ page: pageNum });
                            window.scrollTo({ top: 0, behavior: "smooth" });
                          }}
                          className={`h-9 min-w-9 px-2 rounded-xl text-xs font-bold transition-all tabular-nums cursor-pointer ${
                            isCurrent
                              ? "bg-teal-900 text-white shadow-xs"
                              : "text-stone-600 hover:bg-stone-200/60 bg-stone-100"
                          }`}
                        >
                          {pageNum}
                        </button>
                      );
                    }
                    if (pageNum === currentPage - 2 || pageNum === currentPage + 2) {
                      return (
                        <span key={pageNum} className="text-stone-400 text-xs px-1">
                          …
                        </span>
                      );
                    }
                    return null;
                  })}
                </div>

                <Button
                  variant="outline"
                  size="sm"
                  disabled={!meta?.next && currentPage >= totalPages}
                  onClick={() => {
                    const next = Math.min(totalPages, currentPage + 1);
                    setPage(next);
                    updateUrl({ page: next });
                    window.scrollTo({ top: 0, behavior: "smooth" });
                  }}
                  className="rounded-xl h-10 px-3 text-xs gap-1 cursor-pointer"
                >
                  <span>Next</span>
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default function ServicesPage() {
  return (
    <React.Suspense
      fallback={
        <div className="min-h-screen bg-[#FAF9F6] p-12 text-center">
          <div className="max-w-7xl mx-auto grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array.from({ length: 6 }).map((_, i) => (
              <ServiceCardSkeleton key={i} />
            ))}
          </div>
        </div>
      }
    >
      <ServicesDiscoveryContent />
    </React.Suspense>
  );
}
