"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import {
  Search,
  ShieldCheck,
  Star,
  CheckCircle2,
  Wrench,
  Zap,
  Flame,
  ArrowRight,
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
    <section className="relative pt-10 pb-16 md:pt-14 md:pb-24 bg-[#FAF9F6] border-b border-stone-200">
      <div className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
          {/* LEFT: Calm, clear headline & specific facts */}
          <div className="lg:col-span-7 space-y-6 text-left">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-medium bg-stone-100 text-stone-700 border border-stone-200">
              <span className="h-2 w-2 rounded-full bg-emerald-600" />
              <span>Verified local craftsmen across 64 districts</span>
            </div>

            <div className="space-y-3">
              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-semibold tracking-tight text-stone-900 leading-[1.15] font-heading">
                Reliable local trade services for your home and workplace
              </h1>
              <p className="text-base text-stone-600 leading-relaxed max-w-xl">
                Find background-verified electricians, plumbers, appliance specialists, and cleaners. Pay 20% advance only when your booking is accepted.
              </p>
            </div>

            {/* Quiet feature metrics strip */}
            <div className="pt-2 grid grid-cols-3 gap-4 border-t border-stone-200/80 max-w-lg text-xs">
              <div>
                <span className="block font-semibold text-stone-900 tabular-nums">20% Escrow</span>
                <span className="text-stone-500">Advance on acceptance</span>
              </div>
              <div>
                <span className="block font-semibold text-stone-900 tabular-nums">2-Hour Buffer</span>
                <span className="text-stone-500">Conflict-free arrival</span>
              </div>
              <div>
                <span className="block font-semibold text-stone-900">Direct Contact</span>
                <span className="text-stone-500">Verified phone & area</span>
              </div>
            </div>
          </div>

          {/* RIGHT: Visual of real service cards without glossy glow */}
          <div className="lg:col-span-5">
            <div className="grid grid-cols-2 gap-3 max-w-md mx-auto">
              {/* Tile 1: Electrical */}
              <div className="p-4 rounded-2xl bg-white border border-stone-200 shadow-sm space-y-3">
                <div className="h-8 w-8 rounded-lg bg-stone-100 text-stone-700 flex items-center justify-center">
                  <Zap className="h-4 w-4" />
                </div>
                <div>
                  <h4 className="font-semibold text-xs text-stone-900">Electrical repair</h4>
                  <p className="text-[11px] text-stone-500">Wiring, distribution boards</p>
                </div>
                <div className="pt-2 border-t border-stone-100 flex items-center justify-between text-xs">
                  <span className="font-semibold text-stone-900 tabular-nums">Fixed rate</span>
                  <span className="text-stone-500 text-[11px]">Same day</span>
                </div>
              </div>

              {/* Tile 2: Plumbing */}
              <div className="p-4 rounded-2xl bg-white border border-stone-200 shadow-sm space-y-3">
                <div className="h-8 w-8 rounded-lg bg-stone-100 text-stone-700 flex items-center justify-center">
                  <Wrench className="h-4 w-4" />
                </div>
                <div>
                  <h4 className="font-semibold text-xs text-stone-900">Plumbing fixtures</h4>
                  <p className="text-[11px] text-stone-500">Pumps, piping, leaks</p>
                </div>
                <div className="pt-2 border-t border-stone-100 flex items-center justify-between text-xs">
                  <span className="font-semibold text-stone-900 tabular-nums">From ৳500</span>
                  <span className="text-stone-500 text-[11px]">Guaranteed</span>
                </div>
              </div>

              {/* Tile 3: AC Maintenance */}
              <div className="p-4 rounded-2xl bg-white border border-stone-200 shadow-sm space-y-3">
                <div className="h-8 w-8 rounded-lg bg-stone-100 text-stone-700 flex items-center justify-center">
                  <Flame className="h-4 w-4" />
                </div>
                <div>
                  <h4 className="font-semibold text-xs text-stone-900">AC servicing</h4>
                  <p className="text-[11px] text-stone-500">Master clean, gas charge</p>
                </div>
                <div className="pt-2 border-t border-stone-100 flex items-center justify-between text-xs">
                  <span className="font-semibold text-stone-900 tabular-nums">৳800 / unit</span>
                  <span className="text-stone-500 text-[11px]">Tested</span>
                </div>
              </div>

              {/* Tile 4: Quiet Trust Summary */}
              <div className="p-4 rounded-2xl bg-[#042F2E] text-stone-100 flex flex-col justify-between">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-medium text-teal-300">
                    Payment safe
                  </span>
                  <ShieldCheck className="h-4 w-4 text-emerald-400" />
                </div>
                <div className="pt-4 space-y-1">
                  <p className="text-xs text-stone-300">SSLCommerz protected</p>
                  <p className="font-semibold text-xs text-white">80% balance on completion</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* INTEGRATED SEARCH BAR (Crisp border, calm background) */}
        <div className="mt-12 max-w-4xl mx-auto">
          <form
            onSubmit={handleSearch}
            className="p-3 rounded-2xl bg-white border border-stone-200 shadow-sm flex flex-col md:flex-row items-stretch md:items-center gap-2.5"
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
            <div className="relative md:w-64">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-stone-400" />
              <input
                type="text"
                placeholder="Service or trade (e.g. AC)"
                value={searchKeyword}
                onChange={(e) => setSearchKeyword(e.target.value)}
                className="w-full h-10 pl-9 pr-3 rounded-xl bg-stone-50 border border-stone-200 text-xs font-medium text-stone-800 placeholder:text-stone-400 focus:outline-none focus:ring-1 focus:ring-teal-700 focus:border-teal-700"
              />
            </div>

            {/* Search Action */}
            <Button
              type="submit"
              className="h-10 px-5 rounded-xl font-medium text-xs bg-[#EA580C] hover:bg-[#c2410c] text-white shrink-0"
            >
              <Search className="h-3.5 w-3.5 mr-1.5" />
              <span>Search services</span>
            </Button>
          </form>
        </div>
      </div>
    </section>
  );
}

export default HeroSearchSection;
