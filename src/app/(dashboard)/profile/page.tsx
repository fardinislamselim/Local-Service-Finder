"use client";

import * as React from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  Trash2,
  Loader2,
  Save,
  ShieldCheck,
  CheckCircle2,
  Clock,
  Calendar,
  User,
  Phone,
  MapPin,
  Sparkles,
  AlertCircle,
  Briefcase,
  Image as ImageIcon,
  X,
} from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
import { FormInput, FormTextarea, FieldWrapper } from "@/components/shared/form-field";
import { ChangePasswordDialog } from "@/features/auth/components/change-password-dialog";
import { profilesService } from "@/features/profiles/services/profiles.service";
import { locationsService } from "@/features/locations/services/locations.service";
import { useAuth } from "@/features/auth/hooks/use-auth";
import { formatDate } from "@/lib/utils";
import type { UserProfile, Division, District, Upazila } from "@/types/api";

export default function ProfilePage() {
  const queryClient = useQueryClient();
  const { user: authUser, signout } = useAuth();
  const [imageFile, setImageFile] = React.useState<File | null>(null);
  const [imagePreview, setImagePreview] = React.useState<string | null>(null);

  const { data: profile, isLoading } = useQuery<UserProfile>({
    queryKey: ["auth", "profile"],
    queryFn: () => profilesService.getMyProfile(),
  });

  const { data: divisionsData } = useQuery({
    queryKey: ["locations", "divisions"],
    queryFn: () => locationsService.getDivisions(),
  });

  const { data: districtsData } = useQuery({
    queryKey: ["locations", "districts"],
    queryFn: () => locationsService.getDistricts(),
  });

  const { data: upazilasData } = useQuery({
    queryKey: ["locations", "upazilas"],
    queryFn: () => locationsService.getUpazilas(),
  });

  const divisions: Division[] = divisionsData || [];
  const districts: District[] = districtsData || [];
  const upazilas: Upazila[] = upazilasData || [];

  // Merge auth user (name, email, role) with profile data (phone, location, bio, etc.)
  const activeProfile: UserProfile = React.useMemo(() => {
    const raw = profile || {};
    const unwrapped = (raw as any)?.profile ? (raw as any).profile : raw;
    return {
      ...authUser,
      ...unwrapped,
      role: authUser?.role || unwrapped?.role,
      email: authUser?.email || unwrapped?.email,
      first_name: authUser?.first_name || unwrapped?.first_name,
      last_name: authUser?.last_name || unwrapped?.last_name,
      is_approved: authUser?.is_approved ?? unwrapped?.is_approved,
      is_active: authUser?.is_active ?? unwrapped?.is_active,
      created_at: (authUser as any)?.create_at || authUser?.created_at || unwrapped?.create_at || unwrapped?.created_at,
    };
  }, [profile, authUser]);

  const isProvider = activeProfile.role === "SERVICE_PROVIDER";

  // Local state for profile editing
  const [gender, setGender] = React.useState<string>("MALE");
  const [phone, setPhone] = React.useState("");
  const [city, setCity] = React.useState("");
  const [area, setArea] = React.useState("");
  const [bio, setBio] = React.useState("");
  const [experience, setExperience] = React.useState("");

  React.useEffect(() => {
    if (activeProfile) {
      if (activeProfile.gender) {
        setGender(String(activeProfile.gender).toUpperCase());
      }
      if (activeProfile.phone) {
        setPhone(String(activeProfile.phone).trim().slice(0, 15));
      }
      if (activeProfile.city) setCity(activeProfile.city);
      if (activeProfile.area) setArea(activeProfile.area);
      if (activeProfile.bio) setBio(activeProfile.bio);
      if (activeProfile.experience !== undefined && activeProfile.experience !== null) {
        setExperience(String(activeProfile.experience));
      }
      if (activeProfile.image) {
        setImagePreview(activeProfile.image);
      }
    }
  }, [activeProfile]);

  // Profile completeness percentage calculation using actual fields
  const completeness = React.useMemo(() => {
    let score = 0;
    const checks = {
      name: Boolean(activeProfile.first_name && activeProfile.last_name),
      image: Boolean(activeProfile.image || imageFile),
      phone: Boolean(phone.trim()),
      gender: Boolean(gender),
      location: Boolean(city.trim() || area.trim() || activeProfile.area),
      bio: Boolean(bio.trim()),
      experience: isProvider ? Boolean(experience && Number(experience) >= 0) : true,
    };

    if (checks.name) score += 15;
    if (checks.image) score += 20;
    if (checks.phone) score += 15;
    if (checks.gender) score += 10;
    if (checks.location) score += 15;
    if (checks.bio) score += 15;
    if (checks.experience) score += 10;

    return { score, checks };
  }, [activeProfile, imageFile, phone, gender, city, area, bio, experience, isProvider]);

  const updateMutation = useMutation({
    mutationFn: () => {
      const cleanedPhone = phone.trim().replace(/\s+/g, "");
      if (cleanedPhone.length > 15) {
        throw new Error("Phone number must not exceed 15 characters");
      }
      return profilesService.updateMyProfile({
        gender: gender.toUpperCase(),
        phone: cleanedPhone,
        city: city.trim(),
        area: area.trim(),
        bio: bio.trim(),
        experience: experience !== "" ? experience : "0",
        image: imageFile,
      });
    },
    onSuccess: (updated) => {
      toast.success("Profile updated successfully!");
      queryClient.setQueryData(["auth", "profile"], updated);
      queryClient.invalidateQueries({ queryKey: ["auth", "profile"] });
      setImageFile(null);
    },
    onError: (err: any) => {
      toast.error(err?.message || "Failed to update profile.");
    },
  });

  const deleteMutation = useMutation({
    mutationFn: () => profilesService.deleteMyProfile(),
    onSuccess: () => {
      toast.info("Your profile has been removed.");
      signout();
    },
    onError: (err: any) => {
      toast.error(err?.message || "Failed to delete profile.");
    },
  });

  if (isLoading) {
    return (
      <div className="max-w-3xl mx-auto space-y-6">
        <Skeleton className="h-10 w-48" />
        <Skeleton className="h-96 rounded-xl" />
      </div>
    );
  }

  const displayName =
    activeProfile.first_name || activeProfile.last_name
      ? `${activeProfile.first_name || ""} ${activeProfile.last_name || ""}`.trim()
      : (activeProfile as any)?.name || "My Account";

  const fallbackInitial = (
    activeProfile.first_name?.charAt(0) ||
    displayName.charAt(0) ||
    "U"
  ).toUpperCase();

  const handleImageFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.[0]) {
      const file = e.target.files[0];
      setImageFile(file);
      setImagePreview(URL.createObjectURL(file));
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-8">
      {/* Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 rounded-2xl bg-gradient-to-r from-primary/10 via-primary/5 to-transparent border border-primary/20">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
            {isProvider ? "Provider Profile & Credentials" : "My Profile & Account"}
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            {isProvider
              ? "Keep your verified bio, contact number, service area, and technician experience up to date."
              : "Manage your contact information, service address, and account security."}
          </p>
        </div>

        <ChangePasswordDialog />
      </div>

      {/* User Overview Card */}
      <Card className="border-border/80 shadow-sm">
        <CardContent className="p-6 flex flex-col sm:flex-row items-center sm:items-start gap-6">
          <Avatar className="h-24 w-24 ring-2 ring-primary/20 shrink-0">
            <AvatarImage src={imagePreview || activeProfile.image || ""} alt={displayName} className="object-cover" />
            <AvatarFallback className="text-2xl font-bold bg-primary/10 text-primary">
              {fallbackInitial}
            </AvatarFallback>
          </Avatar>

          <div className="space-y-2 text-center sm:text-left flex-1">
            <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
              <h2 className="text-xl font-bold">{displayName}</h2>
              <Badge variant="outline" className="text-xs uppercase font-bold">
                {activeProfile.role || "CUSTOMER"}
              </Badge>

              {isProvider && (
                <>
                  {activeProfile.is_verified ? (
                    <Badge variant="success" className="text-[10px] gap-1">
                      <ShieldCheck className="h-3 w-3" />
                      Verified Specialist
                    </Badge>
                  ) : (
                    <Badge variant="secondary" className="text-[10px]">
                      Standard Specialist
                    </Badge>
                  )}

                  {activeProfile.is_approved !== false ? (
                    <Badge variant="info" className="text-[10px] gap-1">
                      <CheckCircle2 className="h-3 w-3" />
                      Admin Approved
                    </Badge>
                  ) : (
                    <Badge variant="warning" className="text-[10px] gap-1">
                      <Clock className="h-3 w-3" />
                      Pending Approval
                    </Badge>
                  )}
                </>
              )}
            </div>

            <p className="text-sm text-muted-foreground">{activeProfile.email || "No email registered"}</p>

            <div className="flex flex-wrap items-center justify-center sm:justify-start gap-x-4 gap-y-1 text-xs text-muted-foreground pt-1">
              <span>Member ID: #{activeProfile.id || "N/A"}</span>
              {activeProfile.created_at && (
                <>
                  <span>•</span>
                  <span>Joined: {formatDate(activeProfile.created_at)}</span>
                </>
              )}
              {isProvider && activeProfile.experience !== undefined && (
                <>
                  <span>•</span>
                  <span>Experience: {activeProfile.experience} years</span>
                </>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Profile Completeness Card */}
      <Card className="border-border/80 shadow-sm bg-card">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-primary" />
              <CardTitle className="text-base font-bold">Profile Completeness</CardTitle>
            </div>
            <span className="text-sm font-extrabold text-primary">{completeness.score}%</span>
          </div>
          <CardDescription>
            A complete profile improves trust, customer bookings, and technician verification.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          {/* Progress bar */}
          <div className="w-full bg-muted/60 h-2.5 rounded-full overflow-hidden">
            <div
              className="bg-primary h-full rounded-full transition-all duration-500"
              style={{ width: `${completeness.score}%` }}
            />
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1 text-xs">
            <span className={completeness.checks.name ? "text-emerald-600 dark:text-emerald-400 flex items-center gap-1" : "text-muted-foreground flex items-center gap-1"}>
              {completeness.checks.name ? <CheckCircle2 className="h-3.5 w-3.5" /> : <Clock className="h-3.5 w-3.5" />}
              Full Name
            </span>
            <span className={completeness.checks.image ? "text-emerald-600 dark:text-emerald-400 flex items-center gap-1" : "text-muted-foreground flex items-center gap-1"}>
              {completeness.checks.image ? <CheckCircle2 className="h-3.5 w-3.5" /> : <Clock className="h-3.5 w-3.5" />}
              Profile Photo
            </span>
            <span className={completeness.checks.phone ? "text-emerald-600 dark:text-emerald-400 flex items-center gap-1" : "text-muted-foreground flex items-center gap-1"}>
              {completeness.checks.phone ? <CheckCircle2 className="h-3.5 w-3.5" /> : <Clock className="h-3.5 w-3.5" />}
              Phone Number
            </span>
            <span className={completeness.checks.bio ? "text-emerald-600 dark:text-emerald-400 flex items-center gap-1" : "text-muted-foreground flex items-center gap-1"}>
              {completeness.checks.bio ? <CheckCircle2 className="h-3.5 w-3.5" /> : <Clock className="h-3.5 w-3.5" />}
              Professional Bio
            </span>
          </div>
        </CardContent>
      </Card>

      {/* Edit Profile Form */}
      <Card className="border-border/80 shadow-sm">
        <CardHeader>
          <CardTitle className="text-lg">Profile Details</CardTitle>
          <CardDescription>
            Keep your contact number, service neighborhood, and qualifications current.
          </CardDescription>
        </CardHeader>

        <form
          onSubmit={(e) => {
            e.preventDefault();
            updateMutation.mutate();
          }}
        >
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Phone */}
              <FormInput
                label="Contact Phone"
                placeholder="+8801700000000"
                value={phone}
                maxLength={15}
                description="Max 15 characters (e.g. +8801700000000)"
                error={phone.length > 15 ? "Phone number must not exceed 15 characters" : undefined}
                onChange={(e) => {
                  const cleaned = e.target.value.replace(/\s+/g, "");
                  if (cleaned.length <= 15) {
                    setPhone(cleaned);
                  }
                }}
              />

              {/* Gender */}
              <FieldWrapper label="Gender">
                <select
                  value={gender}
                  onChange={(e) => setGender(e.target.value)}
                  className="h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm focus:outline-none focus:ring-1 focus:ring-ring"
                >
                  <option value="MALE">Male</option>
                  <option value="FEMALE">Female</option>
                  <option value="OTHER">Other</option>
                </select>
              </FieldWrapper>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* City */}
              <FormInput
                label="City"
                placeholder="e.g. Dhaka"
                value={city}
                onChange={(e) => setCity(e.target.value)}
              />

              {/* Area */}
              <FormInput
                label="Area / Neighborhood"
                placeholder="e.g. Dhanmondi, Gulshan, Banani"
                value={area}
                onChange={(e) => setArea(e.target.value)}
              />
            </div>

            {/* Experience (Years) for Providers */}
            {isProvider && (
              <FormInput
                label="Years of Professional Experience"
                type="number"
                min="0"
                placeholder="e.g. 5"
                value={experience}
                onChange={(e) => setExperience(e.target.value)}
                description="Your track record as an independent technician or service company"
              />
            )}

            {/* Bio */}
            <FormTextarea
              label={isProvider ? "Professional Bio & Service Specialties" : "About You / Notes"}
              placeholder="Brief summary of certifications, equipment, standard warranty, and experience..."
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              rows={4}
            />

            {/* Avatar / Profile picture */}
            <FieldWrapper label="Update Profile Picture">
              <div className="space-y-3">
                {imagePreview && (
                  <div className="flex items-center gap-3 p-3 rounded-lg border border-border/80 bg-muted/20">
                    <Avatar className="h-14 w-14 ring-1 ring-border">
                      <AvatarImage src={imagePreview} alt="Preview" className="object-cover" />
                      <AvatarFallback className="bg-primary/10 text-primary">
                        {fallbackInitial}
                      </AvatarFallback>
                    </Avatar>
                    <div className="text-xs">
                      <p className="font-semibold text-foreground">
                        {imageFile ? "New image selected" : "Current profile picture"}
                      </p>
                      <p className="text-muted-foreground text-[11px]">
                        {imageFile ? imageFile.name : "Stored in Cloudinary"}
                      </p>
                    </div>
                  </div>
                )}

                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageFileChange}
                  className="text-xs cursor-pointer file:mr-3 file:py-1.5 file:px-3 file:rounded-md file:border-0 file:bg-primary/10 file:text-primary file:font-semibold"
                />
              </div>
            </FieldWrapper>
          </CardContent>

          <CardFooter className="flex justify-between items-center border-t border-border pt-4">
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="text-destructive hover:bg-destructive/10"
              disabled={deleteMutation.isPending}
              onClick={() => {
                if (confirm("Are you sure you want to delete your profile? This cannot be undone.")) {
                  deleteMutation.mutate();
                }
              }}
            >
              <Trash2 className="h-4 w-4 mr-1.5" />
              Delete Profile
            </Button>

            <Button type="submit" disabled={updateMutation.isPending} className="gap-2 font-semibold shadow">
              {updateMutation.isPending ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Save className="h-4 w-4" />
                  Save Changes
                </>
              )}
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}
