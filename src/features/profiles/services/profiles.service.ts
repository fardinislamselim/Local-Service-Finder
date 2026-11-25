import { api } from "@/lib/api/client";
import { tokenStorage } from "@/lib/api/token";
import type { UserProfile, UpdateProfileInput, UserRole } from "@/types/api";
import { normalizeImageUrl } from "@/lib/image";

export { normalizeImageUrl };

interface ProfileResponseWrapper {
  profile?: UserProfile | UserProfile[];
  message?: string;
  results?: UserProfile[];
  [key: string]: unknown;
}

function unwrapProfile(res: unknown): UserProfile {
  let profileObj: UserProfile;
  if (res && typeof res === "object") {
    const wrapper = res as ProfileResponseWrapper;
    if (wrapper.profile && typeof wrapper.profile === "object" && !Array.isArray(wrapper.profile)) {
      profileObj = wrapper.profile;
    } else {
      profileObj = res as UserProfile;
    }
  } else {
    profileObj = res as UserProfile;
  }

  if (profileObj && profileObj.image) {
    profileObj.image = normalizeImageUrl(profileObj.image);
  }
  return profileObj;
}

function unwrapProfilesList(res: unknown): UserProfile[] {
  let list: UserProfile[] = [];
  if (Array.isArray(res)) {
    list = res;
  } else if (res && typeof res === "object") {
    const wrapper = res as ProfileResponseWrapper;
    if (Array.isArray(wrapper.profile)) list = wrapper.profile;
    else if (Array.isArray(wrapper.results)) list = wrapper.results;
  }

  return list.map((p) => {
    if (p && p.image) {
      p.image = normalizeImageUrl(p.image);
    }
    return p;
  });
}

export const profilesService = {
  /**
   * Detects the role by probing the most privileged dashboard endpoint first.
   * Probing customer first made ADMIN / SERVICE_PROVIDER accounts resolve as
   * CUSTOMER whenever the customer dashboard endpoint also returned 200.
   */
  async detectUserRole(): Promise<UserRole> {
    try {
      await api.get("/dashboard/admin/admin/", { silent: true });
      return "ADMIN";
    } catch {
      try {
        await api.get("/dashboard/service_provider/service_provide/", { silent: true });
        return "SERVICE_PROVIDER";
      } catch {
        try {
          await api.get("/dashboard/customer/customer/", { silent: true });
          return "CUSTOMER";
        } catch {
          // Only fall back to cached metadata when every probe failed.
          const cached = tokenStorage.getUser<UserProfile>();
          return cached?.role || "CUSTOMER";
        }
      }
    }
  },

  async getMyProfile(): Promise<UserProfile> {
    const res = await api.get<unknown>("/profiles/get_profile/");
    const profile = unwrapProfile(res);

    // Merge with any cached user metadata (first_name, last_name, email, role)
    const cached = tokenStorage.getUser<UserProfile>();
    const storedEmail = typeof window !== "undefined" ? localStorage.getItem("user_email") : null;
    if (storedEmail && !profile.email) {
      profile.email = storedEmail;
    }
    if (cached) {
      if (!profile.role && cached.role) profile.role = cached.role;
      if (!profile.first_name && cached.first_name) profile.first_name = cached.first_name;
      if (!profile.last_name && cached.last_name) profile.last_name = cached.last_name;
      if (!profile.email && cached.email) profile.email = cached.email;
    }

    if (!profile.role) {
      profile.role = await this.detectUserRole();
    }

    tokenStorage.setUser(profile);
    return profile;
  },

  async getAllProfiles(): Promise<UserProfile[]> {
    const res = await api.get<unknown>("/profiles/get_all_profile/", { requiresAuth: false });
    return unwrapProfilesList(res);
  },

  async getProfileById(userId: number | string): Promise<UserProfile> {
    const res = await api.get<unknown>(`/profiles/get_user_profile/${userId}/`, { requiresAuth: false });
    return unwrapProfile(res);
  },

  async updateMyProfile(input: UpdateProfileInput): Promise<UserProfile> {
    const formData = new FormData();
    if (input.gender) {
      // Backend DRF ChoiceField expects uppercase 'MALE' | 'FEMALE' | 'OTHER'
      formData.append("gender", input.gender.toUpperCase());
    }
    if (input.phone !== undefined) {
      // Backend enforces max_length=15. Strip internal whitespace and truncate to 15 chars.
      const cleanedPhone = input.phone.trim().replace(/\s+/g, "").slice(0, 15);
      formData.append("phone", cleanedPhone);
    }
    if (input.city !== undefined) formData.append("city", input.city.trim());
    if (input.area !== undefined) formData.append("area", input.area.trim());
    if (input.bio !== undefined) formData.append("bio", input.bio);
    if (input.experience !== undefined && input.experience !== "") {
      formData.append("experience", String(input.experience));
    }
    if (input.image instanceof File) formData.append("image", input.image);

    const res = await api.patch<unknown>("/profiles/modify_profile/", formData);
    const updated = unwrapProfile(res);

    // Preserve existing role, email, name, and ID from cache
    const cached = tokenStorage.getUser<UserProfile>();
    if (cached) {
      if (!updated.id && cached.id) updated.id = cached.id;
      if (!updated.user && cached.user) updated.user = cached.user;
      if (!updated.role && cached.role) updated.role = cached.role;
      if (!updated.first_name && cached.first_name) updated.first_name = cached.first_name;
      if (!updated.last_name && cached.last_name) updated.last_name = cached.last_name;
      if (!updated.email && cached.email) updated.email = cached.email;
    }

    tokenStorage.setUser(updated);
    return updated;
  },

  async deleteMyProfile(): Promise<{ message?: string }> {
    return api.delete("/profiles/modify_profile/");
  },

  async searchProfiles(search: string): Promise<UserProfile[]> {
    const res = await api.get<unknown>(`/profiles/search/?search=${encodeURIComponent(search)}`, {
      requiresAuth: false,
    });
    return unwrapProfilesList(res);
  },
};
