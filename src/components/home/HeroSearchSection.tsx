"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import {
  Search,
  ShieldCheck,
  Star,
  CheckCircle2,
  Sparkles,
  Zap,
  Wrench,
  Flame,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { LocationSelector } from "@/components/locations/LocationSelector";
import { toast } from "sonner";

export function HeroSearchSection() {
  const router = useRouter();

  const [searchKeyword, setSearchKeyword] = React.useState("");
  const [selectedUpazilaId, setSelectedUpazilaId] = React.useState<number | null>(null);
  const [selectedUpazilaName, setSelectedUpazilaName] = React.useState<string>("");
  const [areaValue, setAreaValue] = React.useState("");

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();

    // If searching by location, upazila and search are required by backend
    if (selectedUpazilaId && !searchKeyword.trim()) {
      toast.error("Please enter a service keyword (e.g. Electrician) along with the location.");
      return;
    }

    const params = new URLSearchParams();
    if (searchKeyword.trim()) params.append("search", searchKeyword.trim());
    if (selectedUpazilaId) params.append("upazila", String(selectedUpazilaId));
    if (selectedUpazilaName) params.append("upazila_name", selectedUpazilaName);
    if (areaValue.trim()) params.append("area", areaValue.trim());

    router.push(`/services?${params.toString()}`);
  };

  return (
    <section className="relative overflow-hidden pt-12 pb-24 md:pt-16 md:pb-32 bg-[#FAF9F6] border-b border-stone-200">
      {/* Decorative Grid Texture */}
      <div
        className="absolute inset-0 opacity-[0.035] pointer-events-none"
        style={{
          backgroundImage: `radial-gradient(circle at 1px 1px, #115E59 1px, transparent 0)`,
          backgroundSize: "24px 24px",
        }}
      />

      <div className="container mx-auto px-4 sm:px-8 max-w-7xl relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center">
          {/* LEFT COLUMN: Editorial Copy & Metrics */}
          <div className="lg:col-span-7 space-y-6 text-left">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-bold bg-teal-100/80 text-teal-900 border border-teal-200/80 shadow-2xs">
              <ShieldCheck className="h-4 w-4 text-emerald-600" />
              <span>100% Verified Local Pros in Bangladesh</span>
            </div>

            <h1 className="text-4xl sm:text-5xl xl:text-6xl font-extrabold tracking-tight text-stone-900 leading-[1.1] font-heading">
              Book Trusted Local Experts for Every{" "}
              <span className="text-teal-800 underline decoration-orange-500/60 decoration-wavy decoration-2 underline-offset-4">
                Home & Office
              </span>{" "}
              Need
            </h1>

            <p className="text-base sm:text-lg text-stone-600 leading-relaxed max-w-xl">
              From emergency electrical and plumbing repairs to AC maintenance and deep cleaning. Connect instantly with vetted neighborhood craftsmen.
            </p>

            {/* Social Proof Strip */}
            <div className="pt-2 flex flex-wrap items-center gap-6 text-xs text-stone-600 font-medium">
              <div className="flex items-center gap-2">
                <div className="h-6 w-6 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold">
                  ✓
                </div>
                <span>500+ Background Checked Pros</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="h-6 w-6 rounded-full bg-orange-100 text-orange-700 flex items-center justify-center font-bold">
                  ৳
                </div>
                <span>20% Secure Advance Guarantee</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="h-6 w-6 rounded-full bg-teal-100 text-teal-800 flex items-center justify-center font-bold">
                  🛡️
                </div>
                <span>SSLCommerz Protected</span>
              </div>
            </div>
          </div>

          {/* RIGHT COLUMN: Tactile Bento Collage */}
          <div className="lg:col-span-5 relative">
            <div className="grid grid-cols-2 gap-3.5 max-w-md mx-auto">
              {/* Tile 1: Electrician */}
              <div className="p-4 rounded-3xl bg-white border border-stone-200 shadow-tactile relative overflow-hidden group hover:-translate-y-1 transition-all duration-200">
                <div className="w-10 h-10 rounded-2xl bg-amber-50 text-amber-700 flex items-center justify-center mb-3">
                  <Zap className="h-5 w-5" />
                </div>
                <h4 className="font-extrabold text-sm text-stone-900">Electrical Fixes</h4>
                <p className="text-xs text-stone-500 mt-0.5">Wiring, Switches, Meters</p>
                <div className="mt-3 flex items-center justify-between text-xs font-bold text-teal-800">
                  <span className="tabular-nums">From ৳400</span>
                  <div className="flex items-center gap-1 text-amber-500">
                    <Star className="h-3 w-3 fill-amber-400" />
                    <span>4.9</span>
                  </div>
                </div>
              </div>

              {/* Tile 2: Plumbing */}
              <div className="p-4 rounded-3xl bg-white border border-stone-200 shadow-tactile relative overflow-hidden group hover:-translate-y-1 transition-all duration-200 translate-y-3">
                <div className="w-10 h-10 rounded-2xl bg-teal-50 text-teal-700 flex items-center justify-center mb-3">
                  <Wrench className="h-5 w-5" />
                </div>
                <h4 className="font-extrabold text-sm text-stone-900">Plumbing Care</h4>
                <p className="text-xs text-stone-500 mt-0.5">Leaks, Pumps, Pipes</p>
                <div className="mt-3 flex items-center justify-between text-xs font-bold text-teal-800">
                  <span className="tabular-nums">From ৳500</span>
                  <div className="flex items-center gap-1 text-amber-500">
                    <Star className="h-3 w-3 fill-amber-400" />
                    <span>4.8</span>
                  </div>
                </div>
              </div>

              {/* Tile 3: AC Repair */}
              <div className="p-4 rounded-3xl bg-white border border-stone-200 shadow-tactile relative overflow-hidden group hover:-translate-y-1 transition-all duration-200">
                <div className="w-10 h-10 rounded-2xl bg-sky-50 text-sky-700 flex items-center justify-center mb-3">
                  <Sparkles className="h-5 w-5" />
                </div>
                <h4 className="font-extrabold text-sm text-stone-900">AC Servicing</h4>
                <p className="text-xs text-stone-500 mt-0.5">Gas Refill, Jet Clean</p>
                <div className="mt-3 flex items-center justify-between text-xs font-bold text-teal-800">
                  <span className="tabular-nums">From ৳800</span>
                  <div className="flex items-center gap-1 text-amber-500">
                    <Star className="h-3 w-3 fill-amber-400" />
                    <span>5.0</span>
                  </div>
                </div>
              </div>

              {/* Tile 4: Instant Booking Badge */}
              <div className="p-4 rounded-3xl bg-teal-900 text-white shadow-tactile flex flex-col justify-between translate-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 bg-orange-600 rounded-full text-white">
                    Verified
                  </span>
                  <ShieldCheck className="h-5 w-5 text-emerald-400" />
                </div>
                <div className="mt-4">
                  <p className="text-xs text-teal-200">Same-Day Service</p>
                  <p className="font-extrabold text-base text-white">Over 2,400+ Jobs Done</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* FLOATING PILL SEARCH DOCK (Overlapping Hero) */}
        <div className="mt-14 max-w-5xl mx-auto">
          <form
            onSubmit={handleSearch}
            className="p-3 sm:p-4 rounded-3xl bg-white shadow-[0_16px_40px_-8px_rgba(28,25,23,0.14)] border border-stone-200/90 flex flex-col lg:flex-row items-stretch lg:items-center gap-3 transition-all"
          >
            {/* Cascading Location Picker */}
            <div className="flex-1">
              <LocationSelector
                selectedUpazilaId={selectedUpazilaId}
                onUpazilaChange={(id, name) => {
                  setSelectedUpazilaId(id);
                  if (name) setSelectedUpazilaName(name);
                }}
                areaValue={areaValue}
                onAreaChange={setAreaValue}
              />
            </div>

            {/* Keyword Input */}
            <div className="relative lg:w-72">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-stone-400" />
              <input
                type="text"
                placeholder="What pro do you need? (e.g. Electrician)"
                value={searchKeyword}
                onChange={(e) => setSearchKeyword(e.target.value)}
                className="w-full h-11 pl-10 pr-3 rounded-xl bg-stone-50 border border-stone-200 text-xs font-semibold text-stone-800 placeholder:text-stone-400 focus:outline-none focus:ring-2 focus:ring-teal-700/20 focus:border-teal-700 transition-colors"
              />
            </div>

            {/* Terracotta CTA Button */}
            <Button
              type="submit"
              className="h-11 px-7 rounded-xl font-bold text-sm shadow-md gap-2 shrink-0 bg-orange-600 hover:bg-orange-700 text-white"
            >
              <Search className="h-4 w-4" />
              <span>Find Pros</span>
            </Button>
          </form>
        </div>
      </div>
    </section>
  );
}

export default HeroSearchSection;
