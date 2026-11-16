"use client";

import * as React from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Trash2, Loader2, Save } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
import { FormInput, FormTextarea, FieldWrapper } from "@/components/shared/form-field";
import { ChangePasswordDialog } from "@/features/auth/components/change-password-dialog";
import { profilesService } from "@/features/profiles/services/profiles.service";
import { useAuth } from "@/features/auth/hooks/use-auth";
import type { UserProfile } from "@/types/api";

export default function ProfilePage() {
  const queryClient = useQueryClient();
  const { user: authUser, signout } = useAuth();
  const [imageFile, setImageFile] = React.useState<File | null>(null);

  const { data: profile, isLoading } = useQuery<UserProfile>({
    queryKey: ["auth", "profile"],
    queryFn: () => profilesService.getMyProfile(),
  });

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
    };
  }, [profile, authUser]);

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
    }
  }, [activeProfile]);

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

  return (
    <div className="max-w-3xl mx-auto space-y-8">
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">My Profile & Account</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Update your contact details, service coverage areas, technician bio, and credentials.
        </p>
      </div>

      {/* User Overview Card */}
      <Card className="border-border/80 shadow-sm">
        <CardContent className="p-6 flex flex-col sm:flex-row items-center sm:items-start gap-5">
          <Avatar className="h-20 w-20 ring-2 ring-primary/20">
            <AvatarImage src={activeProfile.image || ""} alt={displayName} />
            <AvatarFallback className="text-xl font-bold bg-primary/10 text-primary">
              {fallbackInitial}
            </AvatarFallback>
          </Avatar>

          <div className="space-y-1 text-center sm:text-left flex-1">
            <div className="flex flex-col sm:flex-row sm:items-center gap-2">
              <h2 className="text-xl font-bold">{displayName}</h2>
              <Badge variant="outline" className="text-xs uppercase font-bold w-fit mx-auto sm:mx-0">
                {activeProfile.role || "CUSTOMER"}
              </Badge>
            </div>
            <p className="text-sm text-muted-foreground">{activeProfile.email || "No email available"}</p>
            <p className="text-xs text-muted-foreground pt-1">
              Member ID: #{activeProfile.id || "N/A"} • Role: {activeProfile.role || "CUSTOMER"}
            </p>
          </div>

          <div className="flex sm:flex-col gap-2">
            <ChangePasswordDialog />
          </div>
        </CardContent>
      </Card>

      {/* Edit Profile Form */}
      <Card className="border-border/80 shadow-sm">
        <CardHeader>
          <CardTitle className="text-lg">Profile Details</CardTitle>
          <CardDescription>
            Keep your contact number and location up to date for booking confirmations.
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
                placeholder="e.g. Dhanmondi, Gulshan"
                value={area}
                onChange={(e) => setArea(e.target.value)}
              />
            </div>

            {/* Experience (Years) */}
            <FormInput
              label="Years of Experience (For Service Providers)"
              type="number"
              min="0"
              placeholder="e.g. 5"
              value={experience}
              onChange={(e) => setExperience(e.target.value)}
            />

            {/* Bio */}
            <FormTextarea
              label="Professional Bio / Notes"
              placeholder="Brief summary of skills, certifications, and background..."
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              rows={4}
            />

            {/* Avatar / Profile picture */}
            <FieldWrapper label="Update Profile Picture">
              <input
                type="file"
                accept="image/*"
                onChange={(e) => {
                  if (e.target.files?.[0]) setImageFile(e.target.files[0]);
                }}
                className="text-sm cursor-pointer file:mr-3 file:py-1 file:px-3 file:rounded-md file:border-0 file:bg-primary/10 file:text-primary file:font-medium"
              />
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

            <Button type="submit" disabled={updateMutation.isPending} className="gap-2 font-semibold">
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
