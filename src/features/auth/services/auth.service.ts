import { api } from "@/lib/api";
import { tokenStorage } from "@/lib/api/token";
import { useAuthStore } from "@/store/useAuthStore";
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
      if (res.user) {
        useAuthStore.getState().setAuth({
          accessToken: res.access_token,
          refreshToken: res.refresh_token,
          user: res.user as any,
          profile: res.profile,
        });
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
