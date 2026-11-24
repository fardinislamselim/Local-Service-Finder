import { api } from "@/lib/api";
import { tokenStorage } from "@/lib/api/token";
import { useAuthStore } from "@/store/useAuthStore";
import { decodeJwt } from "@/lib/jwt";
import { profilesService, normalizeImageUrl } from "@/features/profiles/services/profiles.service";
import type {
  SigninRequest,
  SigninResponse,
  SignupRequest,
  SignupResponse,
  ChangePasswordRequest,
  SendOtpRequest,
  ResetPasswordRequest,
  SignoutRequest,
} from "@/types/api";

export const authService = {
  async signup(data: SignupRequest): Promise<SignupResponse> {
    return api.post<SignupResponse>("/accounts/signup/", data, { requiresAuth: false });
  },

  async signin(data: SigninRequest): Promise<SigninResponse> {
    const res = await api.post<SigninResponse>("/accounts/signin/", data, { requiresAuth: false });
    if (res.access_token) {
      await tokenStorage.setTokens(res.access_token, res.refresh_token);
      const jwtPayload = decodeJwt(res.access_token);
      const userEmail = (data.email || "").trim() || jwtPayload?.email || "";
      const userRole = (jwtPayload?.role as any) || res.user?.role || "CUSTOMER";
      const userId = res.user?.id || (jwtPayload?.user_id ? String(jwtPayload.user_id) : "");
      const firstName =
        (jwtPayload as any)?.first_name ||
        res.user?.first_name ||
        (userEmail ? userEmail.split("@")[0] : "");
      const lastName = (jwtPayload as any)?.last_name || res.user?.last_name || "";
      const rawUser = res.user as any;
      const userImage = rawUser?.image
        ? normalizeImageUrl(rawUser.image)
        : res.profile?.image
        ? normalizeImageUrl(res.profile.image)
        : null;

      useAuthStore.getState().setAuth({
        accessToken: res.access_token,
        refreshToken: res.refresh_token,
        user: {
          id: userId,
          email: userEmail,
          first_name: firstName,
          last_name: lastName,
          image: userImage,
          role: userRole,
          is_approved: true,
        },
        profile: res.profile,
      });

      // Eagerly hydrate profile with avatar in background
      try {
        const freshProfile = await profilesService.getMyProfile();
        if (freshProfile) {
          useAuthStore.getState().setProfile(freshProfile);
        }
      } catch {
        // Eager profile fetch can fail or be handled by AuthHydration
      }
    }
    return res;
  },

  async changePassword(data: ChangePasswordRequest): Promise<{ message?: string; detail?: string }> {
    return api.post("/accounts/change_password/", data);
  },

  async sendOtp(data: SendOtpRequest): Promise<{ message?: string; detail?: string }> {
    return api.post("/accounts/send_otp/", data, { requiresAuth: false });
  },

  async resetPassword(data: ResetPasswordRequest): Promise<{ message?: string; detail?: string }> {
    return api.post("/accounts/reset_password/", data, { requiresAuth: false });
  },

  async signout(): Promise<{ message?: string }> {
    const refresh = tokenStorage.getRefreshToken() || "";
    try {
      if (refresh) {
        try {
          await api.post<SignoutRequest>("/accounts/signout/", { refresh });
        } catch {
          // Backend has no signout endpoint or blacklisting fails silently
        }
      }
    } finally {
      useAuthStore.getState().logout();
      await tokenStorage.clearTokens();
    }
    return { message: "Signed out successfully" };
  },
};
