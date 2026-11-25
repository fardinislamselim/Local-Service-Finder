import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import type { UserRole, UserProfile } from "@/types/api";
import { normalizeImageUrl } from "@/lib/image";

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
  /** True once the persisted state has been read from localStorage. */
  hasHydrated: boolean;

  // Actions
  setHasHydrated: (hasHydrated: boolean) => void;
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
      hasHydrated: false,

      setHasHydrated: (hasHydrated) => set({ hasHydrated }),

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
          localStorage.removeItem("lsf_access_token");
          localStorage.removeItem("lsf_refresh_token");
          localStorage.removeItem("user_data");
          localStorage.removeItem("lsf_user");
          localStorage.removeItem("user_email");
          localStorage.removeItem("lsf-auth-storage");

          try {
            sessionStorage.clear();
          } catch {
            // ignore
          }

          // Delete all auth cookies immediately from document
          try {
            const cookieNames = [
              "access_token",
              "refresh_token",
              "lsf_access_token",
              "lsf_refresh_token",
              "user_data",
              "lsf_user",
            ];
            const hostname = window.location.hostname;
            cookieNames.forEach((name) => {
              document.cookie = `${name}=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT; max-age=0; SameSite=Lax`;
              document.cookie = `${name}=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT; max-age=0; SameSite=Lax; Secure`;
              document.cookie = `${name}=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT; max-age=0`;
              if (hostname && hostname !== "localhost") {
                document.cookie = `${name}=; path=/; domain=${hostname}; expires=Thu, 01 Jan 1970 00:00:00 GMT; max-age=0; SameSite=Lax`;
                document.cookie = `${name}=; path=/; domain=.${hostname}; expires=Thu, 01 Jan 1970 00:00:00 GMT; max-age=0; SameSite=Lax`;
              }
            });
            // Asynchronously notify server route
            fetch("/api/auth/cookies", { method: "DELETE" }).catch(() => {});
          } catch {
            // ignore
          }
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
      onRehydrateStorage: () => (state) => {
        // Runs after the persisted state is restored; role guards must wait for it.
        state?.setHasHydrated(true);
      },
    }
  )
);
