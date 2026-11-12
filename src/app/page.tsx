"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import {
  Search,
  MapPin,
  ShieldCheck,
  Star,
  Clock,
  ArrowRight,
  Wrench,
  CheckCircle2,
  Sparkles,
} from "lucide-react";
import { Header } from "@/components/layout/header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { categoriesService } from "@/features/categories/services/categories.service";
import { servicesService } from "@/features/services/services/services.service";
import { locationsService } from "@/features/locations/services/locations.service";
import { formatCurrency } from "@/lib/utils";
import type { Category, Service, Upazila } from "@/types/api";

export default function HomePage() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = React.useState("");
  const [selectedArea, setSelectedArea] = React.useState("");

  // Categories query
  const { data: categoriesData, isLoading: categoriesLoading } = useQuery({
    queryKey: ["categories", "all"],
    queryFn: () => categoriesService.getAll(),
  });

  const categories: Category[] = Array.isArray(categoriesData)
    ? categoriesData
    : categoriesData?.results || [];

  // Services query
  const { data: servicesData, isLoading: servicesLoading } = useQuery({
    queryKey: ["services", "all"],
    queryFn: () => servicesService.getAll(),
  });

  const services: Service[] = Array.isArray(servicesData)
    ? servicesData
    : servicesData?.results || [];

  // Upazilas / locations query
  const { data: upazilasData } = useQuery({
    queryKey: ["locations", "upazilas"],
    queryFn: () => locationsService.getUpazilas(),
  });

  const upazilas: Upazila[] = Array.isArray(upazilasData)
    ? upazilasData
    : upazilasData?.results || [];

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const params = new URLSearchParams();
    if (searchQuery) params.append("search", searchQuery);
    if (selectedArea) {
      params.append("area", selectedArea);
      params.append("upazila", selectedArea);
    }
    router.push(`/services?${params.toString()}`);
  };

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />

      {/* Hero Section */}
      <section className="relative overflow-hidden border-b border-border bg-gradient-to-b from-primary/5 via-background to-background py-16 sm:py-24">
        <div className="container px-4 sm:px-8 max-w-6xl mx-auto text-center space-y-8">
          <Badge variant="secondary" className="px-3.5 py-1 text-xs gap-1.5 shadow-sm">
            <Sparkles className="h-3.5 w-3.5 text-primary" />
            Verified Local Experts At Your Doorstep
          </Badge>

          <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight text-foreground max-w-4xl mx-auto leading-tight sm:leading-none">
            Find & Book Trusted Local Services in{" "}
            <span className="bg-gradient-to-r from-primary to-blue-600 bg-clip-text text-transparent">
              Minutes
            </span>
          </h1>

          <p className="text-lg sm:text-xl text-muted-foreground max-w-2xl mx-auto">
            From home appliance repairs to deep cleaning and electrical work. Connect with vetted, top-rated professionals near you.
          </p>

          {/* Search Box */}
          <form
            onSubmit={handleSearchSubmit}
            className="max-w-3xl mx-auto bg-card p-2 sm:p-3 rounded-2xl shadow-xl border border-border flex flex-col sm:flex-row gap-2"
          >
            <div className="relative flex-1 flex items-center">
              <Search className="absolute left-3.5 h-4 w-4 text-muted-foreground" />
              <Input
                type="text"
                placeholder="What service do you need? (e.g. AC Repair, Cleaning)"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 h-12 border-0 bg-transparent focus-visible:ring-0 text-base"
              />
            </div>

            <div className="relative sm:w-56 flex items-center border-t sm:border-t-0 sm:border-l border-border pt-2 sm:pt-0 sm:pl-2">
              <MapPin className="absolute left-3.5 h-4 w-4 text-muted-foreground" />
              <Input
                type="text"
                placeholder="Area (e.g. Dhanmondi)"
                value={selectedArea}
                onChange={(e) => setSelectedArea(e.target.value)}
                className="pl-10 h-12 border-0 bg-transparent focus-visible:ring-0 text-base"
                list="location-suggestions"
              />
              <datalist id="location-suggestions">
                {upazilas.map((u) => (
                  <option key={u.id} value={u.name} />
                ))}
              </datalist>
            </div>

            <Button type="submit" size="lg" className="h-12 px-8 font-semibold gap-2 shadow">
              <Search className="h-4 w-4" />
              Search
            </Button>
          </form>

          {/* Quick tags */}
          <div className="flex flex-wrap items-center justify-center gap-2 pt-2 text-xs text-muted-foreground">
            <span className="font-semibold">Popular:</span>
            {["Air Conditioner", "Electrical", "Appliance Repair", "Plumbing", "Cleaning"].map((tag) => (
              <button
                key={tag}
                type="button"
                onClick={() => {
                  setSearchQuery(tag);
                  router.push(`/services?search=${encodeURIComponent(tag)}`);
                }}
                className="rounded-full bg-muted/80 px-3 py-1 hover:bg-muted hover:text-foreground transition-colors"
              >
                {tag}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Categories Grid */}
      <section className="py-16 bg-muted/20 border-b border-border">
        <div className="container px-4 sm:px-8 max-w-6xl mx-auto space-y-8">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
            <div>
              <h2 className="text-2xl sm:text-3xl font-bold tracking-tight">Explore Categories</h2>
              <p className="text-muted-foreground mt-1 text-sm">
                Browse services grouped by industry and expertise
              </p>
            </div>
            <Button variant="ghost" asChild className="gap-1.5 font-semibold text-primary">
              <Link href="/categories">
                View All Categories <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
          </div>

          {categoriesLoading ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
              {Array.from({ length: 8 }).map((_, i) => (
                <Skeleton key={i} className="h-28 rounded-xl" />
              ))}
            </div>
          ) : categories.length === 0 ? (
            <Card className="p-8 text-center text-muted-foreground">
              No categories found. Check backend connection.
            </Card>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
              {categories.slice(0, 8).map((cat) => (
                <Link
                  key={cat.id}
                  href={`/services?search=${encodeURIComponent(cat.name)}`}
                  className="group relative p-5 rounded-xl border border-border bg-card hover:bg-accent/40 transition-all hover:shadow-md hover:border-primary/50 flex flex-col items-start justify-between min-h-[110px]"
                >
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary group-hover:scale-105 transition-transform">
                    <Wrench className="h-5 w-5" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-sm group-hover:text-primary transition-colors">
                      {cat.name}
                    </h3>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Featured Services */}
      <section className="py-16">
        <div className="container px-4 sm:px-8 max-w-6xl mx-auto space-y-8">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
            <div>
              <h2 className="text-2xl sm:text-3xl font-bold tracking-tight">Available Services</h2>
              <p className="text-muted-foreground mt-1 text-sm">
                Book top-rated services with upfront pricing and verified professionals
              </p>
            </div>
            <Button variant="ghost" asChild className="gap-1.5 font-semibold text-primary">
              <Link href="/services">
                Browse All Services <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
          </div>

          {servicesLoading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {Array.from({ length: 6 }).map((_, i) => (
                <Skeleton key={i} className="h-64 rounded-xl" />
              ))}
            </div>
          ) : services.length === 0 ? (
            <Card className="p-12 text-center">
              <Wrench className="mx-auto h-12 w-12 text-muted-foreground/60 mb-3" />
              <h3 className="text-lg font-semibold">No services listed yet</h3>
              <p className="text-sm text-muted-foreground mt-1 mb-4">
                Service providers can sign up and publish their services to start receiving bookings.
              </p>
              <Button asChild>
                <Link href="/register">Become a Service Provider</Link>
              </Button>
            </Card>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {services.slice(0, 6).map((service) => (
                <Card
                  key={service.id}
                  className="flex flex-col justify-between overflow-hidden hover:shadow-lg transition-all border-border/80 group"
                >
                  <div className="p-6 space-y-3">
                    <div className="flex items-center justify-between gap-2">
                      <Badge variant="outline" className="text-xs font-semibold">
                        {service.pricing_type === "HOURLY" ? "Hourly Rate" : "Fixed Price"}
                      </Badge>
                      {service.is_active && (
                        <Badge variant="success" className="text-[11px]">
                          Available
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
                          service.pricing_type === "HOURLY"
                            ? service.hour_base_price
                            : service.base_price
                        )}
                      </span>
                      {service.pricing_type === "HOURLY" && (
                        <span className="text-xs text-muted-foreground">/ hour</span>
                      )}
                    </div>
                  </div>

                  <div className="p-6 pt-0 border-t border-border/50 mt-4 flex items-center justify-between">
                    <span className="text-xs text-muted-foreground flex items-center gap-1">
                      <ShieldCheck className="h-3.5 w-3.5 text-emerald-600" />
                      Verified Provider
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
      </section>

      {/* How it works */}
      <section className="py-16 bg-muted/30 border-y border-border">
        <div className="container px-4 sm:px-8 max-w-6xl mx-auto text-center space-y-12">
          <div className="space-y-2">
            <h2 className="text-3xl font-bold tracking-tight">How Local Service Finder Works</h2>
            <p className="text-muted-foreground max-w-xl mx-auto text-sm">
              Simple, transparent booking with automated 20% advance protection and verified service execution.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 text-left">
            {[
              {
                step: "01",
                title: "Search & Choose",
                desc: "Explore top-rated services by category, keywords, and local area filters.",
              },
              {
                step: "02",
                title: "Schedule Booking",
                desc: "Pick your preferred date and time, and select online or cash final payment.",
              },
              {
                step: "03",
                title: "Provider Accepts & Pay Advance",
                desc: "Provider confirms availability. Securely pay the 20% advance via SSLCommerz.",
              },
              {
                step: "04",
                title: "Job Done & Final Settle",
                desc: "Service completed professionally. Pay the remaining balance and leave a review.",
              },
            ].map((st) => (
              <div
                key={st.step}
                className="p-6 rounded-xl bg-card border border-border shadow-sm flex flex-col justify-between"
              >
                <div>
                  <span className="text-3xl font-extrabold text-primary/40 mb-2 block font-mono">
                    {st.step}
                  </span>
                  <h3 className="font-bold text-base mb-1.5">{st.title}</h3>
                  <p className="text-xs text-muted-foreground leading-relaxed">{st.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="mt-auto border-t border-border bg-card py-10">
        <div className="container px-4 sm:px-8 max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-muted-foreground">
          <div className="flex items-center gap-2">
            <div className="flex h-6 w-6 items-center justify-center rounded bg-primary text-primary-foreground font-bold text-xs">
              LSF
            </div>
            <span>© {new Date().getFullYear()} Local Service Finder. All rights reserved.</span>
          </div>

          <div className="flex items-center gap-6">
            <Link href="/services" className="hover:text-foreground">
              Services
            </Link>
            <Link href="/categories" className="hover:text-foreground">
              Categories
            </Link>
            <Link href="/locations" className="hover:text-foreground">
              Locations
            </Link>
            <Link href="/login" className="hover:text-foreground">
              Sign In
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}

