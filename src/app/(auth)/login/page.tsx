"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useForm } from "@tanstack/react-form";
import { toast } from "sonner";
import { Mail, Lock, ArrowRight, Loader2, AlertCircle } from "lucide-react";
import { AuthSplitLayout } from "@/components/auth/AuthSplitLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { authService } from "@/features/auth/services/auth.service";
import { profilesService, normalizeImageUrl } from "@/features/profiles/services/profiles.service";
import { useAuthStore } from "@/store/useAuthStore";
import { decodeJwt } from "@/lib/jwt";

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectUrl = searchParams.get("redirect");

  const [isLoading, setIsLoading] = React.useState(false);
  const [errorMessage, setErrorMessage] = React.useState<string | null>(null);

  const form = useForm({
    defaultValues: {
      email: "",
      password: "",
    },
    onSubmit: async ({ value }) => {
      setIsLoading(true);
      setErrorMessage(null);
      try {
        const res = await authService.signin({
          email: value.email.trim(),
          password: value.password,
        });

        // Decode JWT for fallback claims (e.g. user_id, email, role)
        const jwtPayload = decodeJwt(res.access_token);

        // 1. Fetch profile to hydrate role, avatar, name & user data
        let profile = null;
        try {
          profile = await profilesService.getMyProfile();
        } catch {
          // ignore profile fetch failure fallback
        }

        const role = profile?.role || (jwtPayload?.role as any) || "CUSTOMER";
        const email = value.email.trim() || profile?.email || jwtPayload?.email || "";
        const firstName = profile?.first_name || (jwtPayload as any)?.first_name || email.split("@")[0] || "";
        const lastName = profile?.last_name || (jwtPayload as any)?.last_name || "";
        const avatarImage = profile?.image ? normalizeImageUrl(profile.image) : null;

        useAuthStore.getState().setAuth({
          accessToken: res.access_token,
          refreshToken: res.refresh_token,
          user: {
            id: profile?.user ? String(profile.user) : (res.user?.id ? String(res.user.id) : (jwtPayload?.user_id ? String(jwtPayload.user_id) : "")),
            email,
            first_name: firstName,
            last_name: lastName,
            image: avatarImage,
            role: role as any,
            is_approved: profile?.is_approved ?? true,
          },
          profile,
        });

        toast.success("Welcome back! Signed in successfully.");

        if (redirectUrl) {
          router.push(redirectUrl);
          return;
        }

        if (role === "ADMIN") {
          router.push("/dashboard/admin");
        } else if (role === "SERVICE_PROVIDER") {
          router.push("/dashboard/provider");
        } else {
          router.push("/dashboard/customer");
        }
      } catch (err: any) {
        const msg = err?.message || err?.detail || "Invalid Email OR Password.";
        setErrorMessage(msg);
        toast.error(msg);
      } finally {
        setIsLoading(false);
      }
    },
  });

  return (
    <>
      {errorMessage && (
        <div className="mb-5 p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-center gap-2">
          <AlertCircle className="h-4 w-4 shrink-0 text-rose-600" />
          <span>{errorMessage}</span>
        </div>
      )}

      <form
        onSubmit={(e) => {
          e.preventDefault();
          e.stopPropagation();
          form.handleSubmit();
        }}
        className="space-y-4.5"
      >
        <form.Field
          name="email"
          validators={{
            onChange: ({ value }) =>
              !value ? "Email address is required" : undefined,
          }}
        >
          {(field) => (
            <div className="space-y-1.5">
              <Label htmlFor={field.name} className="text-xs font-bold text-stone-700">
                Email Address
              </Label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-stone-400" />
                <Input
                  id={field.name}
                  type="email"
                  placeholder="reza@example.com"
                  value={field.state.value}
                  onChange={(e) => field.handleChange(e.target.value)}
                  className="pl-10 h-11 rounded-xl bg-white border-stone-200 focus:border-orange-500 focus:ring-orange-500/20 text-sm"
                />
              </div>
              {field.state.meta.errors ? (
                <p className="text-[11px] text-rose-600 font-medium">{field.state.meta.errors.join(", ")}</p>
              ) : null}
            </div>
          )}
        </form.Field>

        <form.Field
          name="password"
          validators={{
            onChange: ({ value }) =>
              !value ? "Password is required" : undefined,
          }}
        >
          {(field) => (
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <Label htmlFor={field.name} className="text-xs font-bold text-stone-700">
                  Password
                </Label>
                <Link
                  href="/forgot-password"
                  className="text-xs font-semibold text-orange-600 hover:text-orange-700 transition-colors"
                >
                  Forgot password?
                </Link>
              </div>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-stone-400" />
                <Input
                  id={field.name}
                  type="password"
                  placeholder="••••••••••••"
                  value={field.state.value}
                  onChange={(e) => field.handleChange(e.target.value)}
                  className="pl-10 h-11 rounded-xl bg-white border-stone-200 focus:border-orange-500 focus:ring-orange-500/20 text-sm"
                />
              </div>
              {field.state.meta.errors ? (
                <p className="text-[11px] text-rose-600 font-medium">{field.state.meta.errors.join(", ")}</p>
              ) : null}
            </div>
          )}
        </form.Field>

        <Button
          type="submit"
          disabled={isLoading}
          className="w-full h-11 mt-2 text-sm font-bold shadow-md gap-2"
        >
          {isLoading ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              <span>Signing in...</span>
            </>
          ) : (
            <>
              <span>Sign In</span>
              <ArrowRight className="h-4 w-4" />
            </>
          )}
        </Button>

        <div className="pt-4 text-center text-xs text-stone-600">
          Don&apos;t have an account?{" "}
          <Link
            href="/register"
            className="font-bold text-orange-600 hover:text-orange-700 transition-colors underline-offset-2 hover:underline"
          >
            Create an account
          </Link>
        </div>
      </form>
    </>
  );
}

export default function LoginPage() {
  return (
    <AuthSplitLayout
      title="Welcome back"
      subtitle="Sign in to your account to manage bookings, track requests, and hire pros."
    >
      <React.Suspense
        fallback={
          <div className="flex items-center justify-center p-8">
            <Loader2 className="h-6 w-6 animate-spin text-orange-600" />
          </div>
        }
      >
        <LoginForm />
      </React.Suspense>
    </AuthSplitLayout>
  );
}
