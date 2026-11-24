"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import {
  Search,
  RotateCcw,
  SlidersHorizontal,
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
      {/* Top Search & Filter Bar */}
      <div className="bg-white border-b border-stone-200 py-6">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 mb-5">
            <div>
              <h1 className="text-xl sm:text-2xl font-semibold text-stone-900 font-heading">
                All services
              </h1>
              <p className="text-xs text-stone-500 mt-0.5">
                Showing <strong className="text-stone-900 tabular-nums">{services.length}</strong> of{" "}
                <strong className="text-stone-900 tabular-nums">{totalCount}</strong> services
              </p>
            </div>

            {(searchTerm || selectedCategory || pricingType || upazilaId || area) && (
              <Button
                variant="outline"
                size="sm"
                onClick={handleResetFilters}
                className="rounded-lg text-xs h-8 border-stone-200 text-stone-700"
              >
                <RotateCcw className="h-3 w-3 mr-1.5" />
                <span>Reset filters</span>
              </Button>
            )}
          </div>

          {/* Integrated Location & Keyword Filter Header */}
          <div className="p-2.5 rounded-xl bg-stone-50 border border-stone-200">
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
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* LEFT FILTER SIDEBAR */}
          <div className="space-y-6">
            <div className="p-5 rounded-2xl bg-white border border-stone-200 space-y-5">
              <div className="flex items-center justify-between border-b border-stone-100 pb-3">
                <div className="flex items-center gap-2 text-xs font-semibold text-stone-900">
                  <SlidersHorizontal className="h-3.5 w-3.5 text-stone-500" />
                  <span>Filters</span>
                </div>
              </div>

              {/* Keyword Search Input */}
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-stone-700">Search</label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-stone-400" />
                  <input
                    type="text"
                    placeholder="Search title..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        setPage(1);
                        updateUrl({ search: searchTerm, page: 1 });
                      }
                    }}
                    className="w-full h-9 pl-9 pr-3 rounded-lg bg-stone-50 border border-stone-200 text-xs font-medium text-stone-800 focus:outline-none focus:ring-1 focus:ring-teal-700 focus:border-teal-700"
                  />
                </div>
              </div>

              {/* Pricing Type Filter */}
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-stone-700">Pricing model</label>
                <div className="space-y-1">
                  {[
                    { id: "", label: "All models" },
                    { id: "fixed", label: "Fixed price" },
                    { id: "hourly", label: "Hourly rate" },
                    { id: "quotation", label: "Custom quote" },
                  ].map((p) => (
                    <button
                      key={p.id}
                      type="button"
                      onClick={() => {
                        setPricingType(p.id as any);
                        setPage(1);
                        updateUrl({ pricing_type: p.id, page: 1 });
                      }}
                      className={`w-full text-left px-2.5 py-1.5 rounded-lg text-xs font-medium transition-colors flex items-center justify-between cursor-pointer ${
                        pricingType === p.id
                          ? "bg-stone-100 text-stone-900 font-semibold"
                          : "text-stone-600 hover:bg-stone-50"
                      }`}
                    >
                      <span>{p.label}</span>
                      {pricingType === p.id && <span className="h-1.5 w-1.5 rounded-full bg-[#115E59]" />}
                    </button>
                  ))}
                </div>
              </div>

              {/* Category Filter */}
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-stone-700">Category</label>
                <div className="space-y-1 max-h-60 overflow-y-auto pr-1">
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedCategory("");
                      setPage(1);
                      updateUrl({ category: "", page: 1 });
                    }}
                    className={`w-full text-left px-2.5 py-1.5 rounded-lg text-xs font-medium transition-colors flex items-center justify-between cursor-pointer ${
                      selectedCategory === ""
                        ? "bg-stone-100 text-stone-900 font-semibold"
                        : "text-stone-600 hover:bg-stone-50"
                    }`}
                  >
                    <span>All categories</span>
                    {selectedCategory === "" && <span className="h-1.5 w-1.5 rounded-full bg-[#115E59]" />}
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
                      className={`w-full text-left px-2.5 py-1.5 rounded-lg text-xs font-medium transition-colors flex items-center justify-between cursor-pointer ${
                        selectedCategory === String(cat.id)
                          ? "bg-stone-100 text-stone-900 font-semibold"
                          : "text-stone-600 hover:bg-stone-50"
                      }`}
                    >
                      <span className="line-clamp-1">{cat.name}</span>
                      {selectedCategory === String(cat.id) && (
                        <span className="h-1.5 w-1.5 rounded-full bg-[#115E59] shrink-0" />
                      )}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* RIGHT SERVICE CARDS GRID */}
          <div className="lg:col-span-3 space-y-6">
            {isLoading ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5">
                {Array.from({ length: 6 }).map((_, i) => (
                  <ServiceCardSkeleton key={i} />
                ))}
              </div>
            ) : services.length === 0 ? (
              <div className="p-10 text-center rounded-2xl bg-white border border-stone-200 space-y-3">
                <Search className="h-8 w-8 text-stone-400 mx-auto" />
                <div className="space-y-1">
                  <h3 className="font-semibold text-sm text-stone-900 font-heading">
                    No matching services
                  </h3>
                  <p className="text-xs text-stone-500 max-w-sm mx-auto">
                    Try adjusting your search terms or clearing the upazila location filter.
                  </p>
                </div>
                <Button onClick={handleResetFilters} variant="outline" size="sm" className="rounded-lg text-xs h-8">
                  Clear filters
                </Button>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5">
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
                  className="rounded-lg h-8 px-2.5 text-xs gap-1 cursor-pointer border-stone-200"
                >
                  <ChevronLeft className="h-3.5 w-3.5" />
                  <span>Previous</span>
                </Button>

                <div className="flex items-center gap-1 px-1">
                  {Array.from({ length: totalPages }).map((_, idx) => {
                    const pageNum = idx + 1;
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
                          className={`h-8 min-w-8 px-2 rounded-lg text-xs font-medium transition-colors tabular-nums cursor-pointer ${
                            isCurrent
                              ? "bg-stone-900 text-white"
                              : "text-stone-600 hover:bg-stone-100 bg-white border border-stone-200"
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
                  className="rounded-lg h-8 px-2.5 text-xs gap-1 cursor-pointer border-stone-200"
                >
                  <span>Next</span>
                  <ChevronRight className="h-3.5 w-3.5" />
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
        <div className="min-h-screen bg-[#FAF9F6] p-10 text-center">
          <div className="max-w-7xl mx-auto grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
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
