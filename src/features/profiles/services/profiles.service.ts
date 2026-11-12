import { api } from "@/lib/api/client";
import { tokenStorage } from "@/lib/api/token";
import type { UserProfile, UpdateProfileInput } from "@/types/api";

export const profilesService = {
  async getMyProfile(): Promise<UserProfile> {
    const profile = await api.get<UserProfile>("/profiles/get_profile/");
    tokenStorage.setUser(profile);
    return profile;
  },

  async getAllProfiles(): Promise<UserProfile[] | { results?: UserProfile[] }> {
    return api.get("/profiles/get_all_profile/", { requiresAuth: false });
  },

  async getProfileById(userId: number | string): Promise<UserProfile> {
    return api.get<UserProfile>(`/profiles/get_user_profile/${userId}/`, { requiresAuth: false });
  },

  async updateMyProfile(input: UpdateProfileInput): Promise<UserProfile> {
    const formData = new FormData();
    if (input.gender) {
      // Backend DRF ChoiceField expects uppercase 'MALE' | 'FEMALE' | 'OTHER'
      formData.append("gender", input.gender.toUpperCase());
    }
    if (input.phone) {
      // Backend enforces max_length=15. Strip internal whitespace and truncate to 15 chars.
      const cleanedPhone = input.phone.trim().replace(/\s+/g, "").slice(0, 15);
      formData.append("phone", cleanedPhone);
    }
    if (input.city) formData.append("city", input.city.trim());
    if (input.area) formData.append("area", input.area.trim());
    if (input.bio) formData.append("bio", input.bio);
    if (input.experience !== undefined && input.experience !== "") {
      formData.append("experience", String(input.experience));
    }
    if (input.image instanceof File) formData.append("image", input.image);

    const updated = await api.patch<UserProfile>("/profiles/modify_profile/", formData);
    tokenStorage.setUser(updated);
    return updated;
  },

  async deleteMyProfile(): Promise<{ message?: string }> {
    return api.delete("/profiles/modify_profile/");
  },

  async searchProfiles(search: string): Promise<UserProfile[] | { results?: UserProfile[] }> {
    return api.get(`/profiles/search/?search=${encodeURIComponent(search)}`, { requiresAuth: false });
  },
};

