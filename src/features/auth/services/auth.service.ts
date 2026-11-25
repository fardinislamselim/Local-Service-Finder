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
  UserRole,
  Profile,
} from "@/types/api";

export type SigninResult = Omit<SigninResponse, "profile"> & {
  /** Role resolved from the sign-in payload, the JWT claims, or the backend. */
  role: UserRole;
  profile?: Profile | null;
};

const ROLE_CLAIM_KEYS = ["role", "user_role", "user_type", "account_type"] as const;

/**
 * Normalizes any backend role representation into the three canonical roles.
 */
export function normalizeUserRole(value: unknown): UserRole | null {
  if (typeof value !== "string") return null;
  const normalized = value.trim().toUpperCase().replace(/[\s-]+/g, "_");

  if (normalized === "ADMIN" || normalized === "SUPERADMIN" || normalized === "SUPER_ADMIN") {
    return "ADMIN";
  }
  if (
    normalized === "SERVICE_PROVIDER" ||
    normalized === "SERVICEPROVIDER" ||
    normalized === "SERVICE_PROVIDE" ||
    normalized === "PROVIDER"
  ) {
    return "SERVICE_PROVIDER";
  }
  if (normalized === "CUSTOMER" || normalized === "CLIENT" || normalized === "USER") {
    return "CUSTOMER";
  }
  return null;
}

/**
 * Reads the role from common Django SimpleJWT claim keys, never guessing.
 */
export function getRoleFromJwtPayload(payload: Record<string, unknown> | null): UserRole | null {
  if (!payload) return null;

  for (const key of ROLE_CLAIM_KEYS) {
    const role = normalizeUserRole(payload[key]);
    if (role) return role;
  }

  if (payload.is_superuser === true || payload.is_staff === true) {
    return "ADMIN";
  }

  return null;
}

/**
 * Probes the role-specific dashboard endpoints (most privileged first) until one
 * answers 200. Used when the sign-in response and JWT carry no role claim.
 */
async function resolveRoleFromBackend(): Promise<UserRole> {
  const probes: Array<[string, UserRole]> = [
    ["/dashboard/admin/admin/", "ADMIN"],
    ["/dashboard/service_provider/service_provide/", "SERVICE_PROVIDER"],
    ["/dashboard/customer/customer/", "CUSTOMER"],
  ];

  for (const [url, role] of probes) {
    try {
      await api.get(url, { silent: true });
      return role;
    } catch {
      // Not this role (or the endpoint is unavailable) - keep probing.
    }
  }

  return "CUSTOMER";
}

export const authService = {
  async signup(data: SignupRequest): Promise<SignupResponse> {
    return api.post<SignupResponse>("/accounts/signup/", data, { requiresAuth: false });
  },

  async signin(data: SigninRequest): Promise<SigninResult> {
    const res = await api.post<SigninResponse>("/accounts/signin/", data, { requiresAuth: false });
    const resRecord = res as Record<string, any>;

    if (!res.access_token) {
      // No session to inspect yet; let the caller surface the backend error.
      return {
        ...res,
        role: normalizeUserRole(resRecord.role) ?? "CUSTOMER",
      };
    }

    // 1. Persist the tokens first: the role probes below need Authorization.
    await tokenStorage.setTokens(res.access_token, res.refresh_token);

    const jwtPayload = decodeJwt(res.access_token) as Record<string, unknown> | null;

    // 2. Resolve the role: response payload -> JWT claims -> backend probe.
    let role: UserRole | null =
      normalizeUserRole(resRecord.role) ??
      normalizeUserRole(resRecord.user?.role) ??
      getRoleFromJwtPayload(jwtPayload);

    if (!role) {
      role = await resolveRoleFromBackend();
    }

    // 3. Hydrate the profile (name/email/avatar) for the store.
    let profile: Profile | null = null;
    try {
      profile = await profilesService.getMyProfile();
    } catch {
      // Profile hydration is best-effort; the resolved role is authoritative.
    }

    const email =
      (data.email || "").trim() ||
      profile?.email ||
      (typeof jwtPayload?.email === "string" ? jwtPayload.email : "") ||
      "";

    const firstName =
      profile?.first_name ||
      (typeof jwtPayload?.first_name === "string" ? jwtPayload.first_name : "") ||
      (email ? email.split("@")[0] : "");

    const lastName =
      profile?.last_name ||
      (typeof jwtPayload?.last_name === "string" ? jwtPayload.last_name : "");

    const avatarImage = profile?.image
      ? normalizeImageUrl(profile.image)
      : normalizeImageUrl(resRecord.user?.image ?? null);

    const userId = profile?.user
      ? String(profile.user)
      : resRecord.user?.id
      ? String(resRecord.user.id)
      : typeof jwtPayload?.user_id === "string"
      ? jwtPayload.user_id
      : "";

    const normalizedProfile = profile ? { ...profile, role, image: avatarImage } : null;

    useAuthStore.getState().setAuth({
      accessToken: res.access_token,
      refreshToken: res.refresh_token,
      user: {
        id: userId,
        email,
        first_name: firstName,
        last_name: lastName,
        image: avatarImage,
        role,
        is_approved: profile?.is_approved ?? true,
      },
      profile: normalizedProfile,
    });

    return {
      ...res,
      role,
      profile: normalizedProfile,
    };
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
