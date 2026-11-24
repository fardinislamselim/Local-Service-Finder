"use client";

import * as React from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import {
  User,
  MapPin,
  Briefcase,
  ShieldCheck,
  Calendar,
  Phone,
  ArrowLeft,
  CheckCircle2,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { profilesService, normalizeImageUrl } from "@/features/profiles/services/profiles.service";
import type { UserProfile } from "@/types/api";

export default function PublicProfilePage() {
  const params = useParams();
  const profileId = params?.id as string;

  // Endpoint: GET /api/v1/profiles/get_user_profile/{id}/
  const { data: profile, isLoading, isError } = useQuery<UserProfile>({
    queryKey: ["profiles", "public", profileId],
    queryFn: () => profilesService.getProfileById(profileId),
    enabled: !!profileId,
  });

  if (isLoading) {
    return (
      <main className="min-h-screen bg-[#FAF9F6] py-10 px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl mx-auto space-y-5">
          <Skeleton className="h-5 w-28 rounded" />
          <div className="p-6 bg-white rounded-2xl border border-stone-200 space-y-5">
            <div className="flex items-center gap-4">
              <Skeleton className="h-20 w-20 rounded-full" />
              <div className="space-y-1.5">
                <Skeleton className="h-5 w-40 rounded" />
                <Skeleton className="h-3.5 w-28 rounded" />
              </div>
            </div>
            <Skeleton className="h-16 w-full rounded-xl" />
          </div>
        </div>
      </main>
    );
  }

  if (isError || !profile) {
    return (
      <main className="min-h-screen bg-[#FAF9F6] py-14 px-4 flex items-center justify-center">
        <div className="text-center max-w-sm p-6 bg-white rounded-2xl border border-stone-200 space-y-3">
          <User className="h-10 w-10 text-stone-300 mx-auto" />
          <div className="space-y-1">
            <h2 className="text-base font-semibold text-stone-900">Profile not found</h2>
            <p className="text-xs text-stone-500">
              The requested provider profile is unavailable or inactive.
            </p>
          </div>
          <Button asChild size="sm" variant="outline" className="rounded-lg text-xs">
            <Link href="/services">Browse services</Link>
          </Button>
        </div>
      </main>
    );
  }

  const avatarUrl = normalizeImageUrl(profile.image);
  const fullName = String(
    profile.first_name
      ? `${profile.first_name} ${profile.last_name || ""}`.trim()
      : "Service Artisan"
  );

  return (
    <main className="min-h-screen bg-[#FAF9F6] py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto space-y-5">
        <Link
          href="/services"
          className="inline-flex items-center gap-1.5 text-xs font-medium text-stone-500 hover:text-stone-900 transition-colors"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          <span>Back to services</span>
        </Link>

        {/* Profile Card */}
        <div className="bg-white rounded-2xl border border-stone-200 p-6 sm:p-7 space-y-5">
          <div className="flex flex-col sm:flex-row items-center sm:items-start gap-5 pb-5 border-b border-stone-100">
            <div className="h-20 w-20 rounded-full overflow-hidden border border-stone-200 bg-stone-100 flex items-center justify-center shrink-0">
              {avatarUrl ? (
                <img src={avatarUrl} alt={fullName} className="h-full w-full object-cover" />
              ) : (
                <User className="h-8 w-8 text-stone-400" />
              )}
            </div>

            <div className="space-y-2 text-center sm:text-left flex-1 min-w-0">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div className="space-y-0.5">
                  <h1 className="text-xl font-semibold text-stone-900 font-heading">
                    {fullName}
                  </h1>
                  <p className="text-xs text-stone-500">
                    {typeof profile.profession === "string" ? profile.profession : "Independent trade contractor"}
                  </p>
                </div>

                <div className="flex items-center gap-1.5 justify-center sm:justify-start">
                  <Badge variant="outline" className="text-[10px] font-medium bg-stone-100 text-stone-700 border-stone-200">
                    {profile.role === "SERVICE_PROVIDER" ? "Verified provider" : String(profile.role || "Verified").toLowerCase()}
                  </Badge>
                </div>
              </div>

              <div className="flex flex-wrap items-center justify-center sm:justify-start gap-y-1 gap-x-3 text-xs text-stone-500 pt-1">
                {profile.area && (
                  <span className="flex items-center gap-1">
                    <MapPin className="h-3.5 w-3.5 text-stone-400 shrink-0" />
                    <span>{String(profile.area)}</span>
                  </span>
                )}
                {profile.experience && (
                  <>
                    <span>•</span>
                    <span className="flex items-center gap-1">
                      <Briefcase className="h-3.5 w-3.5 text-stone-400 shrink-0" />
                      <span>{String(profile.experience)} years experience</span>
                    </span>
                  </>
                )}
                {Boolean(profile.join_date || profile.created_at) && (
                  <>
                    <span>•</span>
                    <span className="flex items-center gap-1">
                      <Calendar className="h-3.5 w-3.5 text-stone-400 shrink-0" />
                      <span>Member since {String(profile.join_date || profile.created_at || "").slice(0, 10)}</span>
                    </span>
                  </>
                )}
              </div>
            </div>
          </div>

          {/* Bio / Work statement */}
          {Boolean(profile.bio) && (
            <div className="space-y-1.5 text-xs">
              <span className="font-medium text-stone-900">About the provider</span>
              <p className="break-words rounded-xl border border-stone-100 bg-stone-50 p-3.5 leading-relaxed text-stone-600">
                {String(profile.bio)}
              </p>
            </div>
          )}

          {/* Direct verification metrics */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 text-xs">
            <div className="p-3 rounded-xl bg-stone-50 border border-stone-100 flex items-start gap-2.5">
              <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0 mt-0.5" />
              <div>
                <span className="font-semibold text-stone-900 block">Verified identity</span>
                <span className="text-[11px] text-stone-500">Document checked by platform operations</span>
              </div>
            </div>

            <div className="p-3 rounded-xl bg-stone-50 border border-stone-100 flex items-start gap-2.5">
              <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0 mt-0.5" />
              <div>
                <span className="font-semibold text-stone-900 block">Protected booking</span>
                <span className="text-[11px] text-stone-500">20% advance held until job acceptance</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
