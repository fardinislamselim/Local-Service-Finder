import { api } from "@/lib/api/client";
import { tokenStorage } from "@/lib/api/token";
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
        // Backend accounts does not have a dedicated signout endpoint, but if one is added it would be /accounts/signout/
        // We attempt and catch silently so local tokens are always cleared cleanly.
        try {
          await api.post<SignoutRequest>("/accounts/signout/", { refresh });
        } catch {
          // Ignore if backend doesn't implement blacklist signout endpoint
        }
      }
    } finally {
      await tokenStorage.clearTokens();
    }
    return { message: "Signed out successfully" };
  },
};
