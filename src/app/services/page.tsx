"use client";

import * as React from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import {
  Search,
  MapPin,
  ArrowRight,
  Wrench,
  RotateCcw,
  ShieldCheck,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
} from "lucide-react";
import { Header } from "@/components/layout/header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { servicesService } from "@/features/services/services/services.service";
import { categoriesService } from "@/features/categories/services/categories.service";
import { locationsService } from "@/features/locations/services/locations.service";
import { useDebounce } from "@/lib/hooks/use-debounce";
import { formatCurrency } from "@/lib/utils";
import type { Service, Category, Upazila, PaginatedServicesResponse } from "@/types/api";

function ServicesContent() {
  const searchParams = useSearchParams();
  const initialSearch = searchParams?.get("search") || "";
  const initialArea = searchParams?.get("area") || "";
  const initialUpazila = searchParams?.get("upazila") || "";

  const [page, setPage] = React.useState<number>(1);
  const [search, setSearch] = React.useState<string>(initialSearch);
  const [area, setArea] = React.useState<string>(initialArea);
  const [upazila, setUpazila] = React.useState<string>(initialUpazila);
  const [selectedCategory, setSelectedCategory] = React.useState<string>("ALL");
  const [pricingType, setPricingType] = React.useState<string>("ALL");

  // Debounce search query by ~350ms to prevent hammering the API
  const debouncedSearch = useDebounce(search, 350);
  const debouncedArea = useDebounce(area, 350);

  // Reset to page 1 whenever search or filter inputs change
  React.useEffect(() => {
    setPage(1);
  }, [debouncedSearch, debouncedArea, upazila, selectedCategory, pricingType]);

  // Fetch paginated services from API
  const {
    data: paginatedData,
    isLoading: servicesLoading,
    isFetching,
  } = useQuery<PaginatedServicesResponse>({
    queryKey: [
      "services",
      "paginated",
      { page, search: debouncedSearch, area: debouncedArea, upazila },
    ],
    queryFn: () =>
      servicesService.getPaginated({
        page,
        search: debouncedSearch,
        area: debouncedArea,
        upazila,
      }),
    placeholderData: (previousData) => previousData,
    staleTime: 60 * 1000,
  });

  const rawServices: Service[] = paginatedData?.results || [];
  const meta = paginatedData?.meta || {
    page: 1,
    limit: 12,
    total: rawServices.length,
    total_pages: 1,
    next: null,
    previous: null,
  };

  // Fetch categories for filtering
  const { data: categoriesData } = useQuery<Category[]>({
    queryKey: ["categories", "all"],
    queryFn: () => categoriesService.getAll(),
    staleTime: 5 * 60 * 1000,
  });
  const categories: Category[] = categoriesData || [];

  // Fetch upazilas for location suggestions
  const { data: upazilasData } = useQuery<Upazila[]>({
    queryKey: ["locations", "upazilas"],
    queryFn: () => locationsService.getUpazilas(),
    staleTime: 5 * 60 * 1000,
  });
  const upazilas: Upazila[] = upazilasData || [];

  // Additional client-side filters for Category & Pricing Type on current paginated view
  const displayedServices = React.useMemo(() => {
    return rawServices.filter((service) => {
      // Category filter
      if (selectedCategory !== "ALL") {
        const catId = typeof service.category === "object" ? service.category?.id : service.category;
        if (String(catId) !== selectedCategory) return false;
      }

      // Pricing type
      if (pricingType !== "ALL") {
        if (String(service.pricing_type).toUpperCase() !== pricingType.toUpperCase()) return false;
      }

      return true;
    });
  }, [rawServices, selectedCategory, pricingType]);

  const handleReset = () => {
    setSearch("");
    setArea("");
    setUpazila("");
    setSelectedCategory("ALL");
    setPricingType("ALL");
    setPage(1);
  };

  const handlePageChange = (newPage: number) => {
    if (newPage === page || newPage < 1 || newPage > meta.total_pages) return;
    setPage(newPage);
    if (typeof window !== "undefined") {
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  // Helper for generating page numbers (with sliding window)
  const getPageNumbers = () => {
    const totalPages = meta.total_pages;
    const current = page;
    const delta = 2; // how many pages around current to show
    const range: number[] = [];

    for (let i = Math.max(2, current - delta); i <= Math.min(totalPages - 1, current + delta); i++) {
      range.push(i);
    }

    const items: (number | string)[] = [];

    if (totalPages > 0) items.push(1);
    if (range.length > 0 && range[0] > 2) items.push("...");
    items.push(...range);
    if (range.length > 0 && range[range.length - 1] < totalPages - 1) items.push("...");
    if (totalPages > 1 && !items.includes(totalPages)) items.push(totalPages);

    return items;
  };

  const startItem = meta.total === 0 ? 0 : (meta.page - 1) * meta.limit + 1;
  const endItem = Math.min(meta.page * meta.limit, meta.total);

  return (
    <div className="container px-4 sm:px-8 max-w-7xl mx-auto py-8 space-y-8">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight">Browse Local Services</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Explore verified local professionals, transparent prices, and instant bookings
          </p>
        </div>

        <div className="flex items-center gap-2">
          {meta.total > 0 && (
            <Badge variant="outline" className="px-3 py-1 font-semibold text-xs">
              Total {meta.total} Services Available
            </Badge>
          )}
        </div>
      </div>

      {/* Filters Bar */}
      <Card className="p-4 bg-card/60 backdrop-blur border-border/80 shadow-sm">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
          {/* Keyword Search */}
          <div className="relative">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search services or skills..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9 h-9 text-sm"
            />
          </div>

          {/* Area / Location */}
          <div className="relative">
            <MapPin className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Location, Thana, or Area..."
              value={area}
              onChange={(e) => setArea(e.target.value)}
              className="pl-9 h-9 text-sm"
              list="service-upazilas"
            />
            <datalist id="service-upazilas">
              {upazilas.map((u, i) => (
                <option key={u.id || u.name || i} value={u.name} />
              ))}
            </datalist>
          </div>

          {/* Category Dropdown */}
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm focus:outline-none focus:ring-1 focus:ring-ring"
          >
            <option value="ALL">All Categories</option>
            {categories.map((c) => (
              <option key={c.id} value={String(c.id)}>
                {c.name}
              </option>
            ))}
          </select>

          {/* Pricing Type & Reset */}
          <div className="flex gap-2">
            <select
              value={pricingType}
              onChange={(e) => setPricingType(e.target.value)}
              className="h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm focus:outline-none focus:ring-1 focus:ring-ring"
            >
              <option value="ALL">All Pricing Types</option>
              <option value="FIXED">Fixed Price</option>
              <option value="HOURLY">Hourly Rate</option>
            </select>

            {(search || area || selectedCategory !== "ALL" || pricingType !== "ALL") && (
              <Button
                variant="outline"
                size="icon"
                onClick={handleReset}
                title="Reset Filters"
                className="shrink-0 h-9 w-9 text-muted-foreground hover:text-foreground"
              >
                <RotateCcw className="h-4 w-4" />
              </Button>
            )}
          </div>
        </div>
      </Card>

      {/* Services Section */}
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <p className="text-sm font-medium text-muted-foreground">
            {meta.total > 0 ? (
              <>
                Showing <span className="text-foreground font-semibold">{startItem}</span> to{" "}
                <span className="text-foreground font-semibold">{endItem}</span> of{" "}
                <span className="text-foreground font-semibold">{meta.total}</span> services
                {meta.total_pages > 1 && ` (Page ${meta.page} of ${meta.total_pages})`}
              </>
            ) : (
              "No services found"
            )}
          </p>

          {isFetching && !servicesLoading && (
            <span className="text-xs text-muted-foreground animate-pulse flex items-center gap-1.5">
              <span className="h-2 w-2 rounded-full bg-primary animate-ping" />
              Updating list...
            </span>
          )}
        </div>

        {servicesLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array.from({ length: 6 }).map((_, i) => (
              <Skeleton key={i} className="h-64 rounded-xl" />
            ))}
          </div>
        ) : displayedServices.length === 0 ? (
          <Card className="p-12 text-center max-w-lg mx-auto">
            <Wrench className="mx-auto h-12 w-12 text-muted-foreground/50 mb-3" />
            <h3 className="text-lg font-semibold">No services found</h3>
            <p className="text-sm text-muted-foreground mt-1 mb-4">
              We couldn&apos;t find any active services matching your criteria. Try adjusting your
              search keywords or clear active filters.
            </p>
            <Button variant="outline" onClick={handleReset}>
              Clear All Filters
            </Button>
          </Card>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {displayedServices.map((service) => {
              const isHourly = String(service.pricing_type).toLowerCase() === "hourly";
              const price = isHourly ? service.hour_base_price : service.base_price;

              return (
                <Card
                  key={service.id}
                  className="flex flex-col justify-between overflow-hidden hover:shadow-lg transition-all border-border/80 group bg-card"
                >
                  <div className="p-6 space-y-3">
                    <div className="flex items-center justify-between gap-2">
                      <Badge variant="outline" className="text-xs font-semibold">
                        {isHourly ? "Hourly Rate" : "Fixed Price"}
                      </Badge>
                      {service.is_active ? (
                        <Badge variant="success" className="text-[11px]">
                          Available
                        </Badge>
                      ) : (
                        <Badge variant="secondary" className="text-[11px]">
                          Unavailable
                        </Badge>
                      )}
                    </div>

                    <h3 className="font-bold text-lg group-hover:text-primary transition-colors line-clamp-1">
                      {service.name}
                    </h3>

                    <p className="text-sm text-muted-foreground line-clamp-2 leading-relaxed">
                      {service.description}
                    </p>

                    <div className="pt-2 flex items-baseline gap-1">
                      <span className="text-2xl font-extrabold text-foreground">
                        {formatCurrency(price)}
                      </span>
                      {isHourly && <span className="text-xs text-muted-foreground">/ hour</span>}
                    </div>
                  </div>

                  <div className="p-6 pt-0 border-t border-border/50 mt-4 flex items-center justify-between">
                    <span className="text-xs text-muted-foreground flex items-center gap-1">
                      <ShieldCheck className="h-3.5 w-3.5 text-emerald-600" />
                      Verified Service
                    </span>
                    <Button size="sm" asChild className="gap-1.5 font-semibold">
                      <Link href={`/services/${service.id}`}>
                        Book Now
                        <ArrowRight className="h-3.5 w-3.5" />
                      </Link>
                    </Button>
                  </div>
                </Card>
              );
            })}
          </div>
        )}

        {/* API-Based Pagination Controls */}
        {meta.total_pages > 1 && (
          <div className="pt-6 border-t border-border flex flex-col sm:flex-row items-center justify-between gap-4">
            <p className="text-xs text-muted-foreground order-2 sm:order-1">
              Page <strong className="text-foreground">{page}</strong> of{" "}
              <strong className="text-foreground">{meta.total_pages}</strong>
            </p>

            <div className="flex items-center gap-1.5 order-1 sm:order-2 flex-wrap justify-center">
              {/* First Page */}
              <Button
                variant="outline"
                size="icon"
                className="h-8 w-8"
                onClick={() => handlePageChange(1)}
                disabled={page <= 1 || servicesLoading}
                title="First Page"
              >
                <ChevronsLeft className="h-4 w-4" />
              </Button>

              {/* Previous Page */}
              <Button
                variant="outline"
                size="sm"
                className="h-8 px-2.5 text-xs font-medium gap-1"
                onClick={() => handlePageChange(page - 1)}
                disabled={page <= 1 || servicesLoading}
              >
                <ChevronLeft className="h-4 w-4" />
                <span className="hidden sm:inline">Previous</span>
              </Button>

              {/* Numbered Page Buttons */}
              {getPageNumbers().map((item, idx) => {
                if (typeof item === "string") {
                  return (
                    <span
                      key={`ellipsis-${idx}`}
                      className="px-2 text-xs text-muted-foreground select-none"
                    >
                      ...
                    </span>
                  );
                }

                const isActive = item === page;
                return (
                  <Button
                    key={item}
                    variant={isActive ? "default" : "outline"}
                    size="sm"
                    className={`h-8 w-8 p-0 text-xs font-semibold ${
                      isActive ? "pointer-events-none" : ""
                    }`}
                    disabled={isActive || servicesLoading}
                    onClick={() => handlePageChange(item)}
                  >
                    {item}
                  </Button>
                );
              })}

              {/* Next Page */}
              <Button
                variant="outline"
                size="sm"
                className="h-8 px-2.5 text-xs font-medium gap-1"
                onClick={() => handlePageChange(page + 1)}
                disabled={page >= meta.total_pages || servicesLoading}
              >
                <span className="hidden sm:inline">Next</span>
                <ChevronRight className="h-4 w-4" />
              </Button>

              {/* Last Page */}
              <Button
                variant="outline"
                size="icon"
                className="h-8 w-8"
                onClick={() => handlePageChange(meta.total_pages)}
                disabled={page >= meta.total_pages || servicesLoading}
                title="Last Page"
              >
                <ChevronsRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default function ServicesPage() {
  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />
      <main className="flex-1">
        <React.Suspense fallback={<div className="p-8 text-center text-sm text-muted-foreground">Loading service catalog...</div>}>
          <ServicesContent />
        </React.Suspense>
      </main>
    </div>
  );
}
