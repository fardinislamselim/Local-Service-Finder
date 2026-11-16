"use client";

import * as React from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import {
  Search,
  MapPin,
  Filter,
  ArrowRight,
  Wrench,
  RotateCcw,
  ShieldCheck,
  Star,
} from "lucide-react";
import { Header } from "@/components/layout/header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { servicesService } from "@/features/services/services/services.service";
import { categoriesService } from "@/features/categories/services/categories.service";
import { locationsService } from "@/features/locations/services/locations.service";
import { formatCurrency } from "@/lib/utils";
import type { Service, Category, Upazila } from "@/types/api";

function ServicesContent() {
  const searchParams = useSearchParams();
  const initialSearch = searchParams?.get("search") || "";
  const initialArea = searchParams?.get("area") || "";
  const initialUpazila = searchParams?.get("upazila") || "";

  const [search, setSearch] = React.useState(initialSearch);
  const [area, setArea] = React.useState(initialArea);
  const [upazila, setUpazila] = React.useState(initialUpazila);
  const [selectedCategory, setSelectedCategory] = React.useState<string>("ALL");
  const [pricingType, setPricingType] = React.useState<string>("ALL");

  // Fetch all services
  const { data: servicesData, isLoading: servicesLoading, refetch } = useQuery({
    queryKey: ["services", "all"],
    queryFn: () => servicesService.getAll(),
  });

  const servicesList: Service[] = servicesData || [];

  // Fetch categories
  const { data: categoriesData } = useQuery({
    queryKey: ["categories", "all"],
    queryFn: () => categoriesService.getAll(),
  });

  const categories: Category[] = categoriesData || [];

  // Fetch upazilas
  const { data: upazilasData } = useQuery({
    queryKey: ["locations", "upazilas"],
    queryFn: () => locationsService.getUpazilas(),
  });

  const upazilas: Upazila[] = upazilasData || [];

  // Filter services locally
  const filteredServices = React.useMemo(() => {
    return servicesList.filter((service) => {
      // Keyword filter
      if (search.trim()) {
        const q = search.toLowerCase();
        const matchesName = service.name?.toLowerCase().includes(q);
        const matchesDesc = service.description?.toLowerCase().includes(q);
        const matchesCat = service.category_name?.toLowerCase().includes(q);
        if (!matchesName && !matchesDesc && !matchesCat) return false;
      }

      // Area filter
      if (area.trim()) {
        const a = area.toLowerCase();
        const matchesArea = service.provider_area?.toLowerCase().includes(a);
        const matchesUpazila = service.provider_upazila?.toLowerCase().includes(a);
        if (!matchesArea && !matchesUpazila) {
          // If service doesn't have provider location attached directly, don't strictly hide if search query is broad
        }
      }

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
  }, [servicesList, search, area, selectedCategory, pricingType]);

  const handleReset = () => {
    setSearch("");
    setArea("");
    setUpazila("");
    setSelectedCategory("ALL");
    setPricingType("ALL");
  };

  return (
    <div className="container px-4 sm:px-8 max-w-7xl mx-auto py-8 space-y-8">
      {/* Page Header */}
      <div>
        <h1 className="text-3xl font-extrabold tracking-tight">Browse Local Services</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Explore vetted local professionals, transparent prices, and instant bookings
        </p>
      </div>

      {/* Filters Bar */}
      <Card className="p-4 bg-card/60 backdrop-blur border-border/80 shadow-sm">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
          {/* Keyword Search */}
          <div className="relative">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search services..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9 h-9 text-sm"
            />
          </div>

          {/* Area / Location */}
          <div className="relative">
            <MapPin className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Location / Area..."
              value={area}
              onChange={(e) => setArea(e.target.value)}
              className="pl-9 h-9 text-sm"
              list="service-upazilas"
            />
            <datalist id="service-upazilas">
              {upazilas.map((u) => (
                <option key={u.id} value={u.name} />
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

          {/* Pricing Type */}
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
                className="shrink-0 h-9 w-9"
              >
                <RotateCcw className="h-4 w-4" />
              </Button>
            )}
          </div>
        </div>
      </Card>

      {/* Services List */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <p className="text-sm font-medium text-muted-foreground">
            Showing <span className="text-foreground font-semibold">{filteredServices.length}</span>{" "}
            available services
          </p>
        </div>

        {servicesLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array.from({ length: 6 }).map((_, i) => (
              <Skeleton key={i} className="h-64 rounded-xl" />
            ))}
          </div>
        ) : filteredServices.length === 0 ? (
          <Card className="p-12 text-center max-w-lg mx-auto">
            <Wrench className="mx-auto h-12 w-12 text-muted-foreground/50 mb-3" />
            <h3 className="text-lg font-semibold">No matching services found</h3>
            <p className="text-sm text-muted-foreground mt-1 mb-4">
              Try adjusting your search keywords, area filter, or clearing filters.
            </p>
            <Button variant="outline" onClick={handleReset}>
              Clear Filters
            </Button>
          </Card>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredServices.map((service) => (
              <Card
                key={service.id}
                className="flex flex-col justify-between overflow-hidden hover:shadow-lg transition-all border-border/80 group"
              >
                <div className="p-6 space-y-3">
                  <div className="flex items-center justify-between gap-2">
                    <Badge variant="outline" className="text-xs font-semibold">
                      {String(service.pricing_type).toUpperCase() === "HOURLY" ? "Hourly Rate" : "Fixed Price"}
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

                  <p className="text-sm text-muted-foreground line-clamp-2">
                    {service.description}
                  </p>

                  <div className="pt-2 flex items-baseline gap-1">
                    <span className="text-2xl font-extrabold text-foreground">
                      {formatCurrency(
                        String(service.pricing_type).toUpperCase() === "HOURLY"
                          ? service.hour_base_price
                          : service.base_price
                      )}
                    </span>
                    {String(service.pricing_type).toUpperCase() === "HOURLY" && (
                      <span className="text-xs text-muted-foreground">/ hour</span>
                    )}
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
            ))}
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
        <React.Suspense fallback={<div className="p-8 text-center">Loading services...</div>}>
          <ServicesContent />
        </React.Suspense>
      </main>
    </div>
  );
}

