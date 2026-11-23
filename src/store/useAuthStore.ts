import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import type { UserRole, UserProfile } from "@/types/api";

export interface AuthUser {
  id: string; // UUID string matching backend
  email: string;
  first_name?: string;
  last_name?: string;
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
        // Also sync raw tokens to localStorage / cookie keys for standard access
        if (typeof window !== "undefined") {
          localStorage.setItem("access_token", accessToken);
          if (refreshToken) {
            localStorage.setItem("refresh_token", refreshToken);
          }
        }
        set({
          accessToken,
          refreshToken: refreshToken ?? null,
          user,
          profile: profile ?? null,
          isAuthenticated: true,
        });
      },

      setProfile: (profile) => set({ profile }),

      logout: () => {
        if (typeof window !== "undefined") {
          localStorage.removeItem("access_token");
          localStorage.removeItem("refresh_token");
          localStorage.removeItem("user_data");
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
