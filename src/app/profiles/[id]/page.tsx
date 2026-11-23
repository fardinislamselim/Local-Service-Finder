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
  Sparkles,
  ArrowLeft,
  Layers,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { profilesService, normalizeImageUrl } from "@/features/profiles/services/profiles.service";
import type { UserProfile } from "@/types/api";

export default function PublicProfilePage() {
  const params = useParams();
  const profileId = params?.id as string;

  // Endpoint: GET /api/v1/profiles/get_user_profile/{id}/ (id is integer Profile id)
  const { data: profile, isLoading, isError } = useQuery<UserProfile>({
    queryKey: ["profiles", "public", profileId],
    queryFn: () => profilesService.getProfileById(profileId),
    enabled: !!profileId,
  });

  if (isLoading) {
    return (
      <main className="min-h-screen bg-[#FAF9F6] py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl mx-auto space-y-6">
          <Skeleton className="h-6 w-32 rounded" />
          <div className="p-8 bg-white rounded-3xl border border-stone-200 space-y-6">
            <div className="flex items-center gap-6">
              <Skeleton className="h-24 w-24 rounded-full" />
              <div className="space-y-2">
                <Skeleton className="h-6 w-48 rounded" />
                <Skeleton className="h-4 w-32 rounded" />
              </div>
            </div>
            <Skeleton className="h-20 w-full rounded-2xl" />
          </div>
        </div>
      </main>
    );
  }

  if (isError || !profile) {
    return (
      <main className="min-h-screen bg-[#FAF9F6] py-16 px-4 flex items-center justify-center">
        <div className="text-center max-w-md p-8 bg-white rounded-3xl border border-stone-200">
          <User className="h-12 w-12 text-stone-300 mx-auto mb-3" />
          <h2 className="text-lg font-bold text-stone-900 mb-1">Profile Not Found</h2>
          <p className="text-xs text-stone-500 mb-6">
            The requested artisan or provider profile could not be retrieved from the directory.
          </p>
          <Button asChild className="bg-[#EA580C] hover:bg-[#C2410C] text-white rounded-xl shadow-tactile text-xs">
            <Link href="/services">Browse Marketplace Services</Link>
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
    <main className="min-h-screen bg-[#FAF9F6] py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto space-y-6">
        <Link
          href="/services"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-stone-500 hover:text-teal-900 transition-colors"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          Back to Services
        </Link>

        {/* Profile Card */}
        <div className="bg-white rounded-3xl border border-stone-200 p-6 sm:p-8 shadow-sm space-y-6">
          <div className="flex flex-col sm:flex-row items-center gap-6 pb-6 border-b border-stone-100">
            <div className="h-28 w-28 rounded-full overflow-hidden border-2 border-teal-800/30 bg-stone-100 flex items-center justify-center shadow-md shrink-0">
              {avatarUrl ? (
                <img src={avatarUrl} alt={fullName} className="h-full w-full object-cover" />
              ) : (
                <User className="h-12 w-12 text-stone-400" />
              )}
            </div>

            <div className="text-center sm:text-left space-y-2 flex-1">
              <div className="flex items-center justify-center sm:justify-start gap-2 flex-wrap">
                <h1 className="text-2xl font-extrabold text-stone-900 tracking-tight font-serif">
                  {fullName}
                </h1>
                {Boolean(profile.is_verified) && (
                  <Badge className="bg-emerald-100 text-emerald-800 border-emerald-200 text-xs font-semibold flex items-center gap-1">
                    <ShieldCheck className="h-3.5 w-3.5 text-emerald-700" /> Verified Pro
                  </Badge>
                )}
              </div>

              {(profile.city || profile.area) && (
                <p className="text-xs text-stone-600 flex items-center justify-center sm:justify-start gap-1">
                  <MapPin className="h-3.5 w-3.5 text-teal-800" />
                  {[profile.area, profile.city].filter(Boolean).join(", ")}
                </p>
              )}

              {profile.experience !== undefined && profile.experience !== null && (
                <p className="text-xs text-stone-600 flex items-center justify-center sm:justify-start gap-1">
                  <Briefcase className="h-3.5 w-3.5 text-orange-600" />
                  <strong>{profile.experience} years</strong> professional craft experience
                </p>
              )}
            </div>
          </div>

          {/* Bio */}
          {profile.bio && (
            <div className="space-y-2">
              <h2 className="text-xs font-bold uppercase tracking-wider text-stone-400">
                Craftsmanship & Background
              </h2>
              <p className="text-sm text-stone-700 leading-relaxed whitespace-pre-line bg-[#FAF9F6] p-4 rounded-2xl border border-stone-200/70">
                {profile.bio}
              </p>
            </div>
          )}

          {/* Action strip */}
          <div className="pt-2 flex justify-end">
            <Button asChild className="bg-[#EA580C] hover:bg-[#C2410C] text-white shadow-tactile text-xs rounded-xl">
              <Link href="/services">
                <Sparkles className="h-3.5 w-3.5 mr-1.5" />
                Find Available Services
              </Link>
            </Button>
          </div>
        </div>
      </div>
    </main>
  );
}
