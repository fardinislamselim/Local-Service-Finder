"use client";

import * as React from "react";
import { useAuthStore } from "@/store/useAuthStore";
import { profilesService, normalizeImageUrl } from "@/features/profiles/services/profiles.service";
import { decodeJwt } from "@/lib/jwt";
import { tokenStorage } from "@/lib/api/token";

export function AuthHydration() {
  const { accessToken, user, profile, setAuth } = useAuthStore();

  React.useEffect(() => {
    const token = accessToken || tokenStorage.getAccessToken();
    if (!token) return;

    // Check if user has missing name/email/avatar
    const hasMissingInfo =
      !user?.email ||
      !user?.first_name ||
      !profile?.image ||
      !user?.image;

    if (hasMissingInfo) {
      profilesService
        .getMyProfile()
        .then((freshProfile) => {
          if (!freshProfile) return;
          const jwtPayload = decodeJwt(token);

          const email =
            freshProfile.email ||
            user?.email ||
            jwtPayload?.email ||
            tokenStorage.getUser<any>()?.email ||
            "";

          const firstName =
            freshProfile.first_name ||
            user?.first_name ||
            (jwtPayload as any)?.first_name ||
            (email ? email.split("@")[0] : "");

          const lastName =
            freshProfile.last_name ||
            user?.last_name ||
            (jwtPayload as any)?.last_name ||
            "";

          const avatarImage = freshProfile.image
            ? normalizeImageUrl(freshProfile.image)
            : user?.image || null;

          const role = freshProfile.role || user?.role || (jwtPayload?.role as any) || "CUSTOMER";

          setAuth({
            accessToken: token,
            refreshToken: useAuthStore.getState().refreshToken || tokenStorage.getRefreshToken(),
            user: {
              id: freshProfile.user ? String(freshProfile.user) : (user?.id || (jwtPayload?.user_id ? String(jwtPayload.user_id) : "")),
              email,
              first_name: firstName,
              last_name: lastName,
              image: avatarImage,
              role: role as any,
              is_approved: freshProfile.is_approved ?? true,
            },
            profile: freshProfile,
          });
        })
        .catch(() => {
          // ignore background profile fetch failure
        });
    }
  }, [accessToken, user, profile, setAuth]);

  return null;
}
