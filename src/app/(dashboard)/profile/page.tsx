"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import {
  User,
  Mail,
  Camera,
  Trash2,
  ShieldCheck,
  Loader2,
  Briefcase,
  AlertTriangle,
} from "lucide-react";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { profilesService, normalizeImageUrl } from "@/features/profiles/services/profiles.service";
import { authService } from "@/features/auth/services/auth.service";
import { tokenStorage } from "@/lib/api/token";
import { useAuthStore } from "@/store/useAuthStore";
import type { UserProfile } from "@/types/api";

export default function ProfilePage() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const { user, profile: storeProfile, setProfile, logout } = useAuthStore();

  const [deleteDialogOpen, setDeleteDialogOpen] = React.useState(false);

  // Form states
  const [gender, setGender] = React.useState<"MALE" | "FEMALE" | "OTHER">("MALE");
  const [city, setCity] = React.useState("");
  const [area, setArea] = React.useState("");
  const [phone, setPhone] = React.useState("");
  const [bio, setBio] = React.useState("");
  const [experience, setExperience] = React.useState<string>("");
  const [imageFile, setImageFile] = React.useState<File | null>(null);
  const [imagePreview, setImagePreview] = React.useState<string | null>(null);

  // Query own profile
  const { data: profileData, isLoading } = useQuery<UserProfile>({
    queryKey: ["auth", "profile"],
    queryFn: () => profilesService.getMyProfile(),
  });

  const activeProfile = profileData || storeProfile;

  // Resolved user display metadata with local storage email fallbacks
  const resolvedEmail =
    user?.email ||
    activeProfile?.email ||
    storeProfile?.email ||
    (typeof window !== "undefined" ? localStorage.getItem("user_email") || "" : "");

  const resolvedFirstName = activeProfile?.first_name || user?.first_name || "";
  const resolvedLastName = activeProfile?.last_name || user?.last_name || "";

  const displayName = React.useMemo(() => {
    const fullName = `${resolvedFirstName} ${resolvedLastName}`.trim();
    if (fullName) return fullName;
    if (resolvedEmail) return resolvedEmail.split("@")[0];
    return "User Account";
  }, [resolvedFirstName, resolvedLastName, resolvedEmail]);

  const initials = React.useMemo(() => {
    const first = resolvedFirstName?.[0] || "";
    const last = resolvedLastName?.[0] || "";
    if (first || last) return `${first}${last}`.toUpperCase();
    if (resolvedEmail) return resolvedEmail[0].toUpperCase();
    return "U";
  }, [resolvedFirstName, resolvedLastName, resolvedEmail]);

  // Initialize fields
  React.useEffect(() => {
    if (activeProfile) {
      if (activeProfile.gender) {
        const g = String(activeProfile.gender).toUpperCase();
        if (g === "FEMALE" || g === "OTHER") setGender(g as any);
        else setGender("MALE");
      }
      setCity(activeProfile.city || "");
      setArea(activeProfile.area || "");
      setPhone(activeProfile.phone || (activeProfile as any).phone_number || "");
      setBio(activeProfile.bio || "");
      setExperience(
        activeProfile.experience !== undefined && activeProfile.experience !== null
          ? String(activeProfile.experience)
          : ""
      );
      if (activeProfile.image) {
        setImagePreview(normalizeImageUrl(activeProfile.image));
      }
    }
  }, [activeProfile]);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageFile(file);
      setImagePreview(URL.createObjectURL(file));
    }
  };

  // Update Profile Mutation (multipart/form-data via buildFormData)
  const updateMutation = useMutation({
    mutationFn: async () => {
      return profilesService.updateMyProfile({
        gender,
        city: city.trim() || undefined,
        area: area.trim() || undefined,
        phone: phone.trim() || undefined,
        bio: bio.trim() || undefined,
        experience: experience !== "" ? Number(experience) : undefined,
        image: imageFile,
      });
    },
    onSuccess: (updated) => {
      toast.success("Profile updated successfully.");
      setProfile(updated);
      queryClient.invalidateQueries({ queryKey: ["auth", "profile"] });
    },
    onError: (err: any) => {
      toast.error(err?.message || "Failed to update profile.");
    },
  });

  // Delete Profile Mutation
  const deleteMutation = useMutation({
    mutationFn: () => profilesService.deleteMyProfile(),
    onSuccess: async () => {
      toast.info("Your profile and account have been deleted.");
      try {
        await authService.signout();
      } catch {
        useAuthStore.getState().logout();
        await tokenStorage.clearTokens();
      }
      if (typeof window !== "undefined") {
        window.location.replace("/");
      }
    },
    onError: (err: any) => {
      toast.error(err?.message || "Failed to delete profile.");
    },
  });

  const isProvider = user?.role === "SERVICE_PROVIDER";

  return (
    <ProtectedRoute allowedRoles={["CUSTOMER", "SERVICE_PROVIDER", "ADMIN"]}>
      <div className="max-w-3xl mx-auto space-y-6">
        {/* Header */}
        <div className="pb-4 border-b border-stone-200 dark:border-stone-800">
          <h1 className="text-xl sm:text-2xl font-semibold text-stone-900 dark:text-stone-100 tracking-tight">
            Account profile
          </h1>
          <p className="text-xs text-stone-500 dark:text-stone-400 mt-1">
            Manage your personal identification, contact details, operational area, and professional portfolio.
          </p>
        </div>

        <form
          onSubmit={(e) => {
            e.preventDefault();
            updateMutation.mutate();
          }}
          className="space-y-5"
        >
          {/* Identity Card */}
          <div className="p-5 sm:p-6 bg-white dark:bg-stone-900 rounded-xl border border-stone-200 dark:border-stone-800 shadow-sm space-y-5">
            <div className="flex flex-col sm:flex-row items-center gap-5 pb-5 border-b border-stone-100 dark:border-stone-800">
              {/* Avatar with upload preview */}
              <div className="relative group shrink-0">
                <div className="h-24 w-24 rounded-full overflow-hidden border border-stone-200 dark:border-stone-700 bg-stone-100 dark:bg-stone-800 flex items-center justify-center">
                  {imagePreview || activeProfile?.image || user?.image ? (
                    <img
                      src={imagePreview || normalizeImageUrl(activeProfile?.image || user?.image) || ""}
                      alt="Profile avatar"
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <span className="text-2xl font-semibold text-stone-600 dark:text-stone-300">
                      {initials}
                    </span>
                  )}
                </div>
                <label
                  htmlFor="avatar-file"
                  className="absolute bottom-0 right-0 p-1.5 rounded-full bg-[#115E59] text-white cursor-pointer shadow-sm hover:bg-teal-800 transition-colors"
                  title="Upload profile photo"
                >
                  <Camera className="h-3.5 w-3.5" />
                  <input
                    type="file"
                    id="avatar-file"
                    accept="image/*"
                    onChange={handleImageChange}
                    className="hidden"
                  />
                </label>
              </div>

              <div className="text-center sm:text-left space-y-1 flex-1">
                <div className="flex items-center justify-center sm:justify-start gap-2 flex-wrap">
                  <h2 className="text-lg font-semibold text-stone-900 dark:text-stone-100">
                    {displayName}
                  </h2>
                  <Badge variant="outline" className="text-[10px] font-medium tracking-wide">
                    {user?.role || activeProfile?.role || "CUSTOMER"}
                  </Badge>
                  {Boolean(activeProfile?.is_verified) && (
                    <Badge className="bg-emerald-50 text-emerald-800 border-emerald-200 text-[10px] font-medium flex items-center gap-1 dark:bg-emerald-950/50 dark:text-emerald-300 dark:border-emerald-800">
                      <ShieldCheck className="h-3 w-3 text-emerald-600" /> Verified
                    </Badge>
                  )}
                </div>
                <p className="text-xs text-stone-500 flex items-center justify-center sm:justify-start gap-1 font-mono">
                  <Mail className="h-3 w-3 text-stone-400" />
                  <span>{resolvedEmail || "No email on record"}</span>
                </p>
                <p className="text-[11px] text-stone-400">
                  Profile photos are optimized and served securely via CDN.
                </p>
              </div>
            </div>

            {/* Form Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              {/* Phone */}
              <div className="space-y-1.5">
                <Label htmlFor="prof-phone" className="text-xs font-medium text-stone-700 dark:text-stone-300">
                  Phone number (Max 15 digits)
                </Label>
                <Input
                  id="prof-phone"
                  placeholder="01712345678"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  maxLength={15}
                  className="h-10 rounded-xl border-stone-200 text-xs font-mono"
                />
              </div>

              {/* Gender */}
              <div className="space-y-1.5">
                <Label htmlFor="prof-gender" className="text-xs font-medium text-stone-700 dark:text-stone-300">
                  Gender
                </Label>
                <Select value={gender} onValueChange={(val: any) => setGender(val)}>
                  <SelectTrigger id="prof-gender" className="h-10 rounded-xl border-stone-200 text-xs">
                    <SelectValue placeholder="Select gender" />
                  </SelectTrigger>
                  <SelectContent className="rounded-xl border-stone-200">
                    <SelectItem value="MALE">Male</SelectItem>
                    <SelectItem value="FEMALE">Female</SelectItem>
                    <SelectItem value="OTHER">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* City */}
              <div className="space-y-1.5">
                <Label htmlFor="prof-city" className="text-xs font-medium text-stone-700 dark:text-stone-300">
                  City / Division
                </Label>
                <Input
                  id="prof-city"
                  placeholder="e.g. Dhaka"
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  maxLength={400}
                  className="h-10 rounded-xl border-stone-200 text-xs"
                />
              </div>

              {/* Area */}
              <div className="space-y-1.5">
                <Label htmlFor="prof-area" className="text-xs font-medium text-stone-700 dark:text-stone-300">
                  Local area / Upazila
                </Label>
                <Input
                  id="prof-area"
                  placeholder="e.g. Gulshan, Uttara, Mirpur"
                  value={area}
                  onChange={(e) => setArea(e.target.value)}
                  maxLength={400}
                  className="h-10 rounded-xl border-stone-200 text-xs"
                />
              </div>

              {/* Experience (Highlighted for Providers) */}
              {isProvider && (
                <div className="space-y-1.5 sm:col-span-2 p-3 rounded-xl bg-stone-50 dark:bg-stone-800/40 border border-stone-200 dark:border-stone-800">
                  <Label htmlFor="prof-exp" className="text-xs font-medium text-stone-800 dark:text-stone-200 flex items-center gap-1.5">
                    <Briefcase className="h-3.5 w-3.5 text-stone-600 dark:text-stone-400" />
                    <span>Years of trade experience (displayed on public cards)</span>
                  </Label>
                  <Input
                    id="prof-exp"
                    type="number"
                    placeholder="6"
                    min={0}
                    max={60}
                    value={experience}
                    onChange={(e) => setExperience(e.target.value)}
                    className="h-10 rounded-xl border-stone-200 bg-white dark:bg-stone-900 text-xs"
                  />
                </div>
              )}

              {/* Bio */}
              <div className="space-y-1.5 sm:col-span-2">
                <Label htmlFor="prof-bio" className="text-xs font-medium text-stone-700 dark:text-stone-300">
                  Professional overview & bio
                </Label>
                <Textarea
                  id="prof-bio"
                  rows={4}
                  placeholder="Tell clients about your trade background, certifications, and service focus..."
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  className="rounded-xl border-stone-200 text-xs focus-visible:border-stone-400 focus-visible:ring-stone-400/20"
                />
              </div>
            </div>

            {/* Save Button */}
            <div className="pt-3 border-t border-stone-100 dark:border-stone-800 flex justify-end">
              <Button
                type="submit"
                disabled={updateMutation.isPending}
                className="bg-[#EA580C] hover:bg-[#c2410c] text-white font-medium text-xs h-9 px-4 rounded-lg shadow-sm"
              >
                {updateMutation.isPending ? (
                  <>
                    <Loader2 className="h-3.5 w-3.5 mr-1.5 animate-spin" />
                    <span>Saving...</span>
                  </>
                ) : (
                  <span>Save changes</span>
                )}
              </Button>
            </div>
          </div>

          {/* Danger Zone */}
          <div className="p-4 sm:p-5 bg-white dark:bg-stone-900 rounded-xl border border-rose-200/80 dark:border-rose-900/40 shadow-sm space-y-3">
            <div className="flex items-center gap-1.5 text-rose-700 dark:text-rose-400 font-medium text-xs">
              <AlertTriangle className="h-4 w-4" />
              <span>Danger zone</span>
            </div>
            <p className="text-xs text-stone-500">
              Permanently delete your profile account and all associated marketplace records. This action cannot be reversed.
            </p>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setDeleteDialogOpen(true)}
              className="border-rose-200 text-rose-700 hover:bg-rose-50 text-xs rounded-lg font-medium h-9"
            >
              <Trash2 className="h-3.5 w-3.5 mr-1.5" />
              <span>Delete account profile</span>
            </Button>
          </div>
        </form>

        {/* Delete Dialog */}
        <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
          <DialogContent className="sm:max-w-md rounded-xl border-stone-200">
            <DialogHeader>
              <DialogTitle className="text-stone-900 dark:text-stone-100 flex items-center gap-2 text-base">
                <AlertTriangle className="h-4 w-4 text-rose-600" />
                <span>Confirm profile deletion</span>
              </DialogTitle>
              <DialogDescription className="text-xs text-stone-500">
                Are you sure you want to delete your profile? This will immediately terminate your session and remove your profile from the directory.
              </DialogDescription>
            </DialogHeader>

            <DialogFooter className="flex gap-2 sm:justify-end pt-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setDeleteDialogOpen(false)}
                className="rounded-lg text-xs h-9 border-stone-200"
              >
                Keep account
              </Button>
              <Button
                size="sm"
                onClick={() => deleteMutation.mutate()}
                disabled={deleteMutation.isPending}
                className="bg-rose-600 hover:bg-rose-700 text-white rounded-lg text-xs font-medium h-9"
              >
                {deleteMutation.isPending ? "Deleting..." : "Permanently delete"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </ProtectedRoute>
  );
}
