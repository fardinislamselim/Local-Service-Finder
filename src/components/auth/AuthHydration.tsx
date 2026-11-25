"use client";

import * as React from "react";
import { useAuthStore } from "@/store/useAuthStore";
import { profilesService, normalizeImageUrl } from "@/features/profiles/services/profiles.service";
import { decodeJwt } from "@/lib/jwt";
import { tokenStorage } from "@/lib/api/token";

export function AuthHydration() {
  const accessToken = useAuthStore((state) => state.accessToken);
  const hydratedTokenRef = React.useRef<string | null>(null);

  React.useEffect(() => {
    const token = accessToken || tokenStorage.getAccessToken();
    if (!token) return;

    // Only hydrate once per token; setAuth() updates the store and would
    // otherwise retrigger this effect (and refetch) indefinitely for users
    // without an avatar.
    if (hydratedTokenRef.current === token) return;
    hydratedTokenRef.current = token;

    const { user, profile, setAuth, refreshToken } = useAuthStore.getState();

    const storedEmail = typeof window !== "undefined" ? localStorage.getItem("user_email") || "" : "";
    const jwtPayload = decodeJwt(token);

    // Check if user has missing name/email/avatar
    const hasMissingInfo =
      !user?.email ||
      !user?.first_name ||
      !profile?.image ||
      !user?.image;

    if (!hasMissingInfo) return;

    profilesService
      .getMyProfile()
      .then((freshProfile) => {
        if (!freshProfile) return;

        const email =
          freshProfile.email ||
          user?.email ||
          jwtPayload?.email ||
          storedEmail ||
          tokenStorage.getUser<{ email?: string }>()?.email ||
          "";

        const firstName =
          freshProfile.first_name ||
          user?.first_name ||
          (jwtPayload as { first_name?: string })?.first_name ||
          (email ? email.split("@")[0] : "");

        const lastName =
          freshProfile.last_name ||
          user?.last_name ||
          (jwtPayload as { last_name?: string })?.last_name ||
          "";

        const avatarImage = freshProfile.image
          ? normalizeImageUrl(freshProfile.image)
          : user?.image
          ? normalizeImageUrl(user.image)
          : null;

        // Never downgrade a role that was already resolved at sign-in.
        const role =
          user?.role ||
          freshProfile.role ||
          ((jwtPayload?.role as never) || "CUSTOMER");

        setAuth({
          accessToken: token,
          refreshToken: refreshToken || tokenStorage.getRefreshToken(),
          user: {
            id: freshProfile.user
              ? String(freshProfile.user)
              : user?.id || (jwtPayload?.user_id ? String(jwtPayload.user_id) : ""),
            email,
            first_name: firstName,
            last_name: lastName,
            image: avatarImage,
            role: role as never,
            is_approved: freshProfile.is_approved ?? true,
          },
          profile: freshProfile,
        });
      })
      .catch(() => {
        // ignore background profile fetch failure
      });
  }, [accessToken]);

  return null;
}
