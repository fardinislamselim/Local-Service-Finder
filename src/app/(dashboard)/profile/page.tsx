"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import {
  User,
  Mail,
  Phone,
  MapPin,
  Briefcase,
  Camera,
  Trash2,
  ShieldCheck,
  Loader2,
  Sparkles,
  Lock,
  AlertTriangle,
  X,
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
      toast.success("Profile updated successfully!");
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
    onSuccess: () => {
      toast.info("Your profile and account have been deleted.");
      logout();
      router.push("/");
    },
    onError: (err: any) => {
      toast.error(err?.message || "Failed to delete profile.");
    },
  });

  const isProvider = user?.role === "SERVICE_PROVIDER";

  return (
    <ProtectedRoute allowedRoles={["CUSTOMER", "SERVICE_PROVIDER", "ADMIN"]}>
      <main className="min-h-screen bg-[#FAF9F6] py-10 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto space-y-8">
          {/* Header */}
          <div className="pb-4 border-b border-stone-200">
            <h1 className="text-2xl sm:text-3xl font-extrabold text-stone-900 tracking-tight font-serif">
              Account Profile & Craft Credentials
            </h1>
            <p className="text-sm text-stone-600 mt-1">
              Manage your personal identification, contact details, operational area, and professional portfolio.
            </p>
          </div>

          <form
            onSubmit={(e) => {
              e.preventDefault();
              updateMutation.mutate();
            }}
            className="space-y-8"
          >
            {/* Identity Card */}
            <div className="p-6 bg-white rounded-3xl border border-stone-200 shadow-sm space-y-6">
              <div className="flex flex-col sm:flex-row items-center gap-6 pb-6 border-b border-stone-100">
                {/* Avatar with live upload preview */}
                <div className="relative group shrink-0">
                  <div className="h-28 w-28 rounded-full overflow-hidden border-2 border-teal-800/30 bg-stone-100 flex items-center justify-center shadow-md">
                    {imagePreview ? (
                      <img
                        src={imagePreview}
                        alt="Profile avatar"
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <User className="h-12 w-12 text-stone-400" />
                    )}
                  </div>
                  <label
                    htmlFor="avatar-file"
                    className="absolute bottom-0 right-0 p-2 rounded-full bg-teal-800 text-white cursor-pointer shadow-md hover:bg-teal-900 transition-colors"
                    title="Upload profile photo"
                  >
                    <Camera className="h-4 w-4" />
                    <input
                      type="file"
                      id="avatar-file"
                      accept="image/*"
                      onChange={handleImageChange}
                      className="hidden"
                    />
                  </label>
                </div>

                <div className="text-center sm:text-left space-y-1.5 flex-1">
                  <div className="flex items-center justify-center sm:justify-start gap-2 flex-wrap">
                    <h2 className="text-xl font-bold text-stone-900">
                      {activeProfile?.first_name || user?.first_name
                        ? `${activeProfile?.first_name || user?.first_name} ${activeProfile?.last_name || user?.last_name || ""}`.trim()
                        : user?.email?.split("@")[0] || "User Profile"}
                    </h2>
                    <Badge className="bg-teal-900 text-white text-[10px] font-semibold tracking-wider uppercase">
                      {user?.role || "CUSTOMER"}
                    </Badge>
                    {Boolean(activeProfile?.is_verified) && (
                      <Badge className="bg-emerald-100 text-emerald-800 border-emerald-200 text-[10px] font-semibold flex items-center gap-1">
                        <ShieldCheck className="h-3 w-3 text-emerald-700" /> Verified
                      </Badge>
                    )}
                  </div>
                  <p className="text-xs text-stone-500 flex items-center justify-center sm:justify-start gap-1.5 font-mono">
                    <Mail className="h-3.5 w-3.5 text-stone-400" />
                    {String(user?.email || activeProfile?.email || "No email on record")}
                  </p>
                  <p className="text-[11px] text-stone-400">
                    Photo uploads are safely optimized and delivered via Cloudinary CDN.
                  </p>
                </div>
              </div>

              {/* Form Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 text-xs">
                {/* Phone */}
                <div className="space-y-1.5">
                  <Label htmlFor="prof-phone" className="text-xs font-semibold text-stone-800">
                    Phone Number (Max 15 digits)
                  </Label>
                  <Input
                    id="prof-phone"
                    placeholder="e.g. 01712345678"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    maxLength={15}
                    className="rounded-xl border-stone-200 text-sm font-mono"
                  />
                </div>

                {/* Gender */}
                <div className="space-y-1.5">
                  <Label htmlFor="prof-gender" className="text-xs font-semibold text-stone-800">
                    Gender
                  </Label>
                  <Select value={gender} onValueChange={(val: any) => setGender(val)}>
                    <SelectTrigger id="prof-gender" className="rounded-xl border-stone-200 text-sm">
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
                  <Label htmlFor="prof-city" className="text-xs font-semibold text-stone-800">
                    City / Division
                  </Label>
                  <Input
                    id="prof-city"
                    placeholder="e.g. Dhaka"
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    maxLength={400}
                    className="rounded-xl border-stone-200 text-sm"
                  />
                </div>

                {/* Area */}
                <div className="space-y-1.5">
                  <Label htmlFor="prof-area" className="text-xs font-semibold text-stone-800">
                    Local Area / Upazila
                  </Label>
                  <Input
                    id="prof-area"
                    placeholder="e.g. Gulshan, Uttara, Mirpur"
                    value={area}
                    onChange={(e) => setArea(e.target.value)}
                    maxLength={400}
                    className="rounded-xl border-stone-200 text-sm"
                  />
                </div>

                {/* Experience (Highlighted for Providers) */}
                {isProvider && (
                  <div className="space-y-1.5 sm:col-span-2 p-3.5 rounded-2xl bg-amber-50/60 border border-amber-200/80">
                    <Label htmlFor="prof-exp" className="text-xs font-semibold text-amber-950 flex items-center gap-1.5">
                      <Briefcase className="h-3.5 w-3.5 text-amber-700" />
                      Years of Trade Experience (Shown on your public service cards)
                    </Label>
                    <Input
                      id="prof-exp"
                      type="number"
                      placeholder="e.g. 6"
                      min={0}
                      max={60}
                      value={experience}
                      onChange={(e) => setExperience(e.target.value)}
                      className="rounded-xl border-amber-200 bg-white text-sm"
                    />
                  </div>
                )}

                {/* Bio */}
                <div className="space-y-1.5 sm:col-span-2">
                  <Label htmlFor="prof-bio" className="text-xs font-semibold text-stone-800">
                    Professional Biography & Craft Overview
                  </Label>
                  <Textarea
                    id="prof-bio"
                    rows={4}
                    placeholder="Tell local clients about your qualifications, standard tools, and customer satisfaction record..."
                    value={bio}
                    onChange={(e) => setBio(e.target.value)}
                    className="rounded-xl border-stone-200 text-sm focus-visible:ring-teal-700"
                  />
                </div>
              </div>

              {/* Save Button */}
              <div className="pt-4 border-t border-stone-100 flex justify-end">
                <Button
                  type="submit"
                  disabled={updateMutation.isPending}
                  className="bg-[#EA580C] hover:bg-[#C2410C] text-white font-semibold text-xs rounded-xl shadow-tactile"
                >
                  {updateMutation.isPending ? (
                    <>
                      <Loader2 className="h-3.5 w-3.5 mr-1.5 animate-spin" />
                      Saving Profile...
                    </>
                  ) : (
                    "Save Profile Details"
                  )}
                </Button>
              </div>
            </div>

            {/* Danger Zone */}
            <div className="p-6 bg-white rounded-3xl border border-rose-200 shadow-sm space-y-4">
              <div className="flex items-center gap-2 text-rose-800 font-bold text-sm">
                <AlertTriangle className="h-4 w-4 text-rose-600" />
                Danger Zone
              </div>
              <p className="text-xs text-stone-600">
                Permanently delete your profile account and all associated marketplace records. This action cannot be reversed.
              </p>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setDeleteDialogOpen(true)}
                className="border-rose-300 text-rose-700 hover:bg-rose-50 text-xs rounded-xl font-semibold"
              >
                <Trash2 className="h-3.5 w-3.5 mr-1.5" />
                Delete My Profile
              </Button>
            </div>
          </form>

          {/* Delete Dialog */}
          <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
            <DialogContent className="sm:max-w-md rounded-2xl border-stone-200">
              <DialogHeader>
                <DialogTitle className="text-stone-900 flex items-center gap-2">
                  <AlertTriangle className="h-5 w-5 text-rose-600" />
                  Confirm Profile Deletion?
                </DialogTitle>
                <DialogDescription className="text-xs text-stone-600">
                  Are you absolutely certain? This will immediately terminate your session and remove your profile from the Local Service Finder directory.
                </DialogDescription>
              </DialogHeader>

              <DialogFooter className="flex gap-2 sm:justify-end">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setDeleteDialogOpen(false)}
                  className="rounded-xl text-xs"
                >
                  Keep Account
                </Button>
                <Button
                  size="sm"
                  onClick={() => deleteMutation.mutate()}
                  disabled={deleteMutation.isPending}
                  className="bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-semibold"
                >
                  {deleteMutation.isPending ? "Deleting..." : "Permanently Delete"}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </main>
    </ProtectedRoute>
  );
}
