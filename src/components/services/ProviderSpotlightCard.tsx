"use client";

import * as React from "react";
import { useQuery } from "@tanstack/react-query";
import { ShieldCheck, MapPin, Briefcase, Award, CheckCircle2 } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { profilesService, normalizeImageUrl } from "@/features/profiles/services/profiles.service";
import type { UserProfile } from "@/types/api";

interface ProviderSpotlightCardProps {
  providerUserId?: string | number | null;
  providerName?: string;
  providerArea?: string;
}

export function ProviderSpotlightCard({
  providerUserId,
  providerName,
  providerArea,
}: ProviderSpotlightCardProps) {
  // Fetch all public profiles to find the matching provider
  const { data: profiles = [], isLoading } = useQuery({
    queryKey: ["profiles", "all_public"],
    queryFn: () => profilesService.getAllProfiles(),
    staleTime: 1000 * 60 * 15,
  });

  const matchedProfile = React.useMemo(() => {
    if (!providerUserId) return null;
    return profiles.find((p) => String(p.user) === String(providerUserId) || String(p.id) === String(providerUserId));
  }, [profiles, providerUserId]);

  const displayName = matchedProfile
    ? `${matchedProfile.first_name || ""} ${matchedProfile.last_name || ""}`.trim() || providerName || "Professional Service Provider"
    : providerName || "Professional Service Provider";

  const locationDisplay = [matchedProfile?.area || providerArea, matchedProfile?.city]
    .filter(Boolean)
    .join(", ") || "Bangladesh";

  const experience = matchedProfile?.experience ? `${matchedProfile.experience} years experience` : "Verified professional";

  return (
    <div className="p-6 rounded-3xl bg-white border border-stone-200 shadow-2xs space-y-5">
      <div className="flex items-center justify-between border-b border-stone-100 pb-4">
        <h3 className="font-extrabold text-base text-stone-900 font-heading">
          Service Provider Spotlight
        </h3>
        <span className="flex items-center gap-1.5 text-xs font-bold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200">
          <ShieldCheck className="h-3.5 w-3.5" />
          Verified Pro
        </span>
      </div>

      <div className="flex items-start gap-4">
        <Avatar className="h-16 w-16 rounded-2xl ring-2 ring-stone-200 shrink-0">
          <AvatarImage
            src={normalizeImageUrl(matchedProfile?.image) || ""}
            alt={displayName}
            className="object-cover"
          />
          <AvatarFallback className="bg-teal-800 text-white font-extrabold text-xl rounded-2xl">
            {displayName.charAt(0).toUpperCase()}
          </AvatarFallback>
        </Avatar>

        <div className="space-y-1.5 flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <h4 className="font-extrabold text-lg text-stone-900 truncate font-heading">
              {displayName}
            </h4>
            <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />
          </div>

          <div className="flex flex-wrap items-center gap-y-1 gap-x-3 text-xs text-stone-500 font-medium">
            <span className="flex items-center gap-1">
              <MapPin className="h-3.5 w-3.5 text-stone-400 shrink-0" />
              <span>{locationDisplay}</span>
            </span>
            <span>•</span>
            <span className="flex items-center gap-1">
              <Briefcase className="h-3.5 w-3.5 text-stone-400 shrink-0" />
              <span>{experience}</span>
            </span>
          </div>

          <div className="pt-1">
            <span className="inline-flex items-center gap-1.5 text-[11px] font-semibold text-teal-800 bg-teal-50 px-2 py-0.5 rounded-md border border-teal-200">
              <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
              <span>Available for Bookings</span>
            </span>
          </div>
        </div>
      </div>

      {matchedProfile?.bio && (
        <div className="pt-2 text-xs text-stone-600 leading-relaxed bg-stone-50 p-3.5 rounded-xl border border-stone-200/80">
          {matchedProfile.bio}
        </div>
      )}

      <div className="grid grid-cols-2 gap-3 pt-2 text-xs">
        <div className="p-3 rounded-xl bg-stone-50 border border-stone-200 text-stone-700">
          <div className="text-stone-400 text-[10px] uppercase font-bold tracking-wider">Quality Check</div>
          <div className="font-bold text-stone-900 mt-0.5">Background Verified</div>
        </div>
        <div className="p-3 rounded-xl bg-stone-50 border border-stone-200 text-stone-700">
          <div className="text-stone-400 text-[10px] uppercase font-bold tracking-wider">Guarantee</div>
          <div className="font-bold text-stone-900 mt-0.5">20% Escrow Protected</div>
        </div>
      </div>
    </div>
  );
}

export default ProviderSpotlightCard;
