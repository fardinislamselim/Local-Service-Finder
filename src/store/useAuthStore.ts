import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import type { UserRole, UserProfile } from "@/types/api";
import { normalizeImageUrl } from "@/features/profiles/services/profiles.service";

export interface AuthUser {
  id: string; // UUID string matching backend
  email: string;
  first_name?: string;
  last_name?: string;
  image?: string | null;
  role: UserRole;
  is_approved?: boolean;
}

export interface AuthState {
  accessToken: string | null;
  refreshToken: string | null;
  user: AuthUser | null;
  profile: UserProfile | null;
  isAuthenticated: boolean;

  // Actions
  setAuth: (payload: {
    accessToken: string;
    refreshToken?: string | null;
    user: AuthUser;
    profile?: UserProfile | null;
  }) => void;
  setProfile: (profile: UserProfile | null) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      accessToken: null,
      refreshToken: null,
      user: null,
      profile: null,
      isAuthenticated: false,

      setAuth: ({ accessToken, refreshToken, user, profile }) => {
        const normalizedAvatar = profile?.image
          ? normalizeImageUrl(profile.image)
          : user.image
          ? normalizeImageUrl(user.image)
          : null;

        const normalizedUser: AuthUser = {
          ...user,
          image: normalizedAvatar,
        };

        if (profile && normalizedAvatar) {
          profile.image = normalizedAvatar;
        }

        // Sync tokens and user metadata to localStorage for cross-tab persistence
        if (typeof window !== "undefined") {
          localStorage.setItem("access_token", accessToken);
          if (refreshToken) {
            localStorage.setItem("refresh_token", refreshToken);
          }
          localStorage.setItem("user_data", JSON.stringify(normalizedUser));
          if (normalizedUser.email) {
            localStorage.setItem("user_email", normalizedUser.email);
          }
        }

        set({
          accessToken,
          refreshToken: refreshToken ?? null,
          user: normalizedUser,
          profile: profile ?? null,
          isAuthenticated: true,
        });
      },

      setProfile: (profile) =>
        set((state) => {
          const normalizedAvatar = profile?.image ? normalizeImageUrl(profile.image) : null;
          const updatedProfile = profile ? { ...profile, image: normalizedAvatar || profile.image } : null;

          const updatedUser: AuthUser | null = state.user
            ? {
                ...state.user,
                image: normalizedAvatar || state.user.image,
                first_name: profile?.first_name || state.user.first_name,
                last_name: profile?.last_name || state.user.last_name,
                email: profile?.email || state.user.email,
                role: profile?.role || state.user.role,
              }
            : updatedProfile
            ? {
                id: updatedProfile.user ? String(updatedProfile.user) : "",
                email: updatedProfile.email || (typeof window !== "undefined" ? localStorage.getItem("user_email") || "" : ""),
                first_name: updatedProfile.first_name || (updatedProfile.email ? updatedProfile.email.split("@")[0] : ""),
                last_name: updatedProfile.last_name || "",
                image: normalizedAvatar,
                role: updatedProfile.role || "CUSTOMER",
                is_approved: updatedProfile.is_approved ?? true,
              }
            : null;

          if (typeof window !== "undefined") {
            if (updatedUser) {
              localStorage.setItem("user_data", JSON.stringify(updatedUser));
              if (updatedUser.email) {
                localStorage.setItem("user_email", updatedUser.email);
              }
            }
          }

          return {
            profile: updatedProfile,
            user: updatedUser,
          };
        }),

      logout: () => {
        if (typeof window !== "undefined") {
          localStorage.removeItem("access_token");
          localStorage.removeItem("refresh_token");
          localStorage.removeItem("user_data");
          localStorage.removeItem("user_email");
        }
        set({
          accessToken: null,
          refreshToken: null,
          user: null,
          profile: null,
          isAuthenticated: false,
        });
      },
    }),
    {
      name: "lsf-auth-storage",
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        accessToken: state.accessToken,
        refreshToken: state.refreshToken,
        user: state.user,
        profile: state.profile,
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
);
