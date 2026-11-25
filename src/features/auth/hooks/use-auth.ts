"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { authService } from "../services/auth.service";
import { profilesService } from "@/features/profiles/services/profiles.service";
import { tokenStorage } from "@/lib/api/token";
import { useAuthStore } from "@/store/useAuthStore";
import type {
  SigninRequest,
  SignupRequest,
  ChangePasswordRequest,
  SendOtpRequest,
  ResetPasswordRequest,
  UserProfile,
  UserRole,
} from "@/types/api";

export const AUTH_QUERY_KEYS = {
  profile: ["auth", "profile"] as const,
};

export function useAuth() {
  const router = useRouter();
  const queryClient = useQueryClient();

  const token = typeof window !== "undefined" ? tokenStorage.getAccessToken() : null;

  const {
    data: user,
    isLoading,
    error,
    refetch,
  } = useQuery<UserProfile | null>({
    queryKey: AUTH_QUERY_KEYS.profile,
    queryFn: async () => {
      const currentToken = tokenStorage.getAccessToken();
      if (!currentToken) return null;
      try {
        return await profilesService.getMyProfile();
      } catch (err: any) {
        if (err?.statusCode === 401) {
          tokenStorage.clearTokens();
          return null;
        }
        // fallback to cached user object if profile endpoint temporarily fails
        return tokenStorage.getUser<UserProfile>() || null;
      }
    },
    enabled: typeof window !== "undefined" && !!token,
    staleTime: 1000 * 60 * 5,
  });

  const signinMutation = useMutation({
    mutationFn: (data: SigninRequest) => authService.signin(data),
    onSuccess: () => {
      toast.success("Welcome back! Signed in successfully.");

      // authService.signin already resolved the role and hydrated the profile,
      // so route from the store instead of re-deriving (and downgrading) the role.
      const { user, profile } = useAuthStore.getState();
      queryClient.setQueryData(AUTH_QUERY_KEYS.profile, profile ?? null);
      const role = user?.role || profile?.role;

      if (role === "ADMIN") {
        router.push("/dashboard/admin");
      } else if (role === "SERVICE_PROVIDER") {
        router.push("/dashboard/provider");
      } else {
        router.push("/dashboard/customer");
      }
    },
    onError: (err: any) => {
      toast.error(err?.message || "Invalid credentials. Please try again.");
    },
  });

  const signupMutation = useMutation({
    mutationFn: (data: SignupRequest) => authService.signup(data),
    onSuccess: (res, variables) => {
      if (variables.role === "SERVICE_PROVIDER") {
        toast.success(
          "Account registered successfully! Note that service provider accounts require administrator approval before login.",
          { duration: 6000 }
        );
      } else {
        toast.success("Account created successfully! You can now sign in.");
      }
      router.push("/login");
    },
    onError: (err: any) => {
      toast.error(err?.message || "Signup failed. Please check the details.");
    },
  });

  const signoutMutation = useMutation({
    mutationFn: () => authService.signout(),
    onSettled: () => {
      queryClient.setQueryData(AUTH_QUERY_KEYS.profile, null);
      queryClient.clear();
      toast.success("You have been signed out.");
      if (typeof window !== "undefined") {
        window.location.replace("/login");
      }
    },
  });

  const changePasswordMutation = useMutation({
    mutationFn: (data: ChangePasswordRequest) => authService.changePassword(data),
    onSuccess: () => {
      toast.success("Password changed successfully.");
    },
    onError: (err: any) => {
      toast.error(err?.message || "Failed to change password.");
    },
  });

  const sendOtpMutation = useMutation({
    mutationFn: (data: SendOtpRequest) => authService.sendOtp(data),
    onSuccess: () => {
      toast.success("Verification OTP has been sent to your email.");
    },
    onError: (err: any) => {
      toast.error(err?.message || "Failed to send reset OTP.");
    },
  });

  const resetPasswordMutation = useMutation({
    mutationFn: (data: ResetPasswordRequest) => authService.resetPassword(data),
    onSuccess: () => {
      toast.success("Password has been reset successfully. Please sign in with your new password.");
      router.push("/login");
    },
    onError: (err: any) => {
      toast.error(err?.message || "Password reset failed. Please check the OTP.");
    },
  });

  return {
    user: user || null,
    role: (user?.role as UserRole) || null,
    isAuthenticated: !!token && !!user,
    isLoading,
    error,
    refetchUser: refetch,
    signin: signinMutation.mutateAsync,
    isSigningIn: signinMutation.isPending,
    signup: signupMutation.mutateAsync,
    isSigningUp: signupMutation.isPending,
    signout: signoutMutation.mutate,
    isSigningOut: signoutMutation.isPending,
    changePassword: changePasswordMutation.mutateAsync,
    isChangingPassword: changePasswordMutation.isPending,
    sendOtp: sendOtpMutation.mutateAsync,
    isSendingOtp: sendOtpMutation.isPending,
    resetPassword: resetPasswordMutation.mutateAsync,
    isResettingPassword: resetPasswordMutation.isPending,
  };
}

