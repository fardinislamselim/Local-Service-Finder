"use client";

import * as React from "react";
import { useQuery } from "@tanstack/react-query";
import { MapPin, Navigation, ChevronDown, Check } from "lucide-react";
import { locationsService } from "@/features/locations/services/locations.service";
import type { Division, District, Upazila } from "@/types/api";

interface LocationSelectorProps {
  selectedUpazilaId: number | null;
  onUpazilaChange: (upazilaId: number | null, upazilaName?: string) => void;
  areaValue: string;
  onAreaChange: (area: string) => void;
}

export function LocationSelector({
  selectedUpazilaId,
  onUpazilaChange,
  areaValue,
  onAreaChange,
}: LocationSelectorProps) {
  const [selectedDivisionId, setSelectedDivisionId] = React.useState<number | null>(null);
  const [selectedDistrictId, setSelectedDistrictId] = React.useState<number | null>(null);

  // 1. Fetch Divisions
  const { data: divisions = [] } = useQuery({
    queryKey: ["locations", "divisions"],
    queryFn: () => locationsService.getDivisions(),
    staleTime: 1000 * 60 * 30, // 30 minutes
  });

  // 2. Fetch Districts
  const { data: allDistricts = [] } = useQuery({
    queryKey: ["locations", "districts"],
    queryFn: () => locationsService.getDistricts(),
    staleTime: 1000 * 60 * 30,
  });

  // 3. Fetch Upazilas
  const { data: allUpazilas = [] } = useQuery({
    queryKey: ["locations", "upazilas"],
    queryFn: () => locationsService.getUpazilas(),
    staleTime: 1000 * 60 * 30,
  });

  // Filter districts by selected division
  const filteredDistricts = React.useMemo(() => {
    if (!selectedDivisionId) return [];
    return allDistricts.filter((d) => {
      const divId = typeof d.division === "object" ? d.division.id : d.division;
      return Number(divId) === Number(selectedDivisionId);
    });
  }, [allDistricts, selectedDivisionId]);

  // Filter upazilas by selected district
  const filteredUpazilas = React.useMemo(() => {
    if (!selectedDistrictId) return [];
    return allUpazilas.filter((u) => {
      const distId = typeof u.district === "object" ? u.district.id : u.district;
      return Number(distId) === Number(selectedDistrictId);
    });
  }, [allUpazilas, selectedDistrictId]);

  return (
    <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 w-full">
      {/* Division Selector */}
      <div className="relative flex-1 min-w-[130px]">
        <select
          value={selectedDivisionId || ""}
          onChange={(e) => {
            const val = e.target.value ? Number(e.target.value) : null;
            setSelectedDivisionId(val);
            setSelectedDistrictId(null);
            onUpazilaChange(null);
          }}
          className="w-full h-11 pl-3 pr-8 rounded-xl bg-stone-50 border border-stone-200 text-xs font-semibold text-stone-800 focus:outline-none focus:ring-2 focus:ring-teal-700/20 focus:border-teal-700 appearance-none cursor-pointer transition-colors"
        >
          <option value="">1. Division</option>
          {divisions.map((d) => (
            <option key={d.id} value={d.id}>
              {d.name}
            </option>
          ))}
        </select>
        <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-stone-400 pointer-events-none" />
      </div>

      {/* District Selector */}
      <div className="relative flex-1 min-w-[130px]">
        <select
          disabled={!selectedDivisionId}
          value={selectedDistrictId || ""}
          onChange={(e) => {
            const val = e.target.value ? Number(e.target.value) : null;
            setSelectedDistrictId(val);
            onUpazilaChange(null);
          }}
          className="w-full h-11 pl-3 pr-8 rounded-xl bg-stone-50 border border-stone-200 text-xs font-semibold text-stone-800 disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-teal-700/20 focus:border-teal-700 appearance-none cursor-pointer transition-colors"
        >
          <option value="">2. District</option>
          {filteredDistricts.map((d) => (
            <option key={d.id} value={d.id}>
              {d.name}
            </option>
          ))}
        </select>
        <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-stone-400 pointer-events-none" />
      </div>

      {/* Upazila Selector (Required for location search) */}
      <div className="relative flex-1 min-w-[140px]">
        <select
          disabled={!selectedDistrictId}
          value={selectedUpazilaId || ""}
          onChange={(e) => {
            const val = e.target.value ? Number(e.target.value) : null;
            const item = filteredUpazilas.find((u) => u.id === val);
            onUpazilaChange(val, item?.name);
          }}
          className="w-full h-11 pl-3 pr-8 rounded-xl bg-stone-50 border border-stone-200 text-xs font-semibold text-stone-800 disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-teal-700/20 focus:border-teal-700 appearance-none cursor-pointer transition-colors"
        >
          <option value="">3. Upazila (Required)</option>
          {filteredUpazilas.map((u) => (
            <option key={u.id} value={u.id}>
              {u.name}
            </option>
          ))}
        </select>
        <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-stone-400 pointer-events-none" />
      </div>

      {/* Optional Area Text Input */}
      <div className="relative flex-1 min-w-[120px]">
        <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-stone-400" />
        <input
          type="text"
          placeholder="Area (e.g. Gulshan)"
          value={areaValue}
          onChange={(e) => onAreaChange(e.target.value)}
          className="w-full h-11 pl-8.5 pr-3 rounded-xl bg-stone-50 border border-stone-200 text-xs font-medium text-stone-800 placeholder:text-stone-400 focus:outline-none focus:ring-2 focus:ring-teal-700/20 focus:border-teal-700 transition-colors"
        />
      </div>
    </div>
  );
}

export default LocationSelector;
