"use client";

import * as React from "react";
import { useQuery } from "@tanstack/react-query";
import { ShieldCheck, MapPin, Briefcase, CheckCircle2 } from "lucide-react";
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
    <div className="p-6 rounded-2xl bg-white border border-stone-200 space-y-4">
      <div className="flex items-center justify-between border-b border-stone-100 pb-3.5">
        <h3 className="font-semibold text-sm text-stone-900 font-heading">
          Service provider
        </h3>
        <span className="flex items-center gap-1.5 text-xs font-medium text-stone-600 bg-stone-50 px-2 py-0.5 rounded border border-stone-200">
          <ShieldCheck className="h-3.5 w-3.5 text-emerald-600" />
          Verified pro
        </span>
      </div>

      <div className="flex items-start gap-4">
        <Avatar className="h-14 w-14 rounded-full border border-stone-200 shrink-0">
          <AvatarImage
            src={normalizeImageUrl(matchedProfile?.image) || ""}
            alt={displayName}
            className="object-cover"
          />
          <AvatarFallback className="bg-stone-100 text-stone-700 font-semibold text-base rounded-full">
            {displayName.charAt(0).toUpperCase()}
          </AvatarFallback>
        </Avatar>

        <div className="space-y-1 flex-1 min-w-0">
          <div className="flex items-center gap-1.5">
            <h4 className="font-semibold text-base text-stone-900 truncate font-heading">
              {displayName}
            </h4>
            <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />
          </div>

          <div className="flex flex-wrap items-center gap-y-1 gap-x-2.5 text-xs text-stone-500">
            <span className="flex items-center gap-1">
              <MapPin className="h-3 w-3 text-stone-400 shrink-0" />
              <span>{locationDisplay}</span>
            </span>
            <span>•</span>
            <span className="flex items-center gap-1">
              <Briefcase className="h-3 w-3 text-stone-400 shrink-0" />
              <span>{experience}</span>
            </span>
          </div>

          <div className="pt-1">
            <span className="inline-flex items-center gap-1.5 text-[10px] font-medium text-stone-600 bg-stone-50 px-2 py-0.5 rounded border border-stone-100">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-600" />
              <span>Available for scheduling</span>
            </span>
          </div>
        </div>
      </div>

      {matchedProfile?.bio && (
        <div className="text-xs text-stone-600 leading-relaxed bg-stone-50 p-3 rounded-lg border border-stone-100">
          {matchedProfile.bio}
        </div>
      )}

      <div className="grid grid-cols-2 gap-3 pt-1 text-xs">
        <div className="p-3 rounded-xl bg-stone-50 border border-stone-100 text-stone-700">
          <div className="text-stone-400 text-[10px] font-medium">Quality check</div>
          <div className="font-semibold text-stone-900 mt-0.5">Background verified</div>
        </div>
        <div className="p-3 rounded-xl bg-stone-50 border border-stone-100 text-stone-700">
          <div className="text-stone-400 text-[10px] font-medium">Escrow</div>
          <div className="font-semibold text-stone-900 mt-0.5">20% advance held</div>
        </div>
      </div>
    </div>
  );
}

export default ProviderSpotlightCard;
