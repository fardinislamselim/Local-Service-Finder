"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useForm } from "@tanstack/react-form";
import { toast } from "sonner";
import {
  User,
  Mail,
  Lock,
  ArrowRight,
  Loader2,
  Briefcase,
  Users,
  CheckCircle2,
  Clock,
  AlertCircle,
} from "lucide-react";
import { AuthSplitLayout } from "@/components/auth/AuthSplitLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { authService } from "@/features/auth/services/auth.service";
import { profilesService } from "@/features/profiles/services/profiles.service";
import { useAuthStore } from "@/store/useAuthStore";
import type { UserRole } from "@/types/api";

function RegisterForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialRoleParam = searchParams.get("role") === "SERVICE_PROVIDER" ? "SERVICE_PROVIDER" : "CUSTOMER";

  const [selectedRole, setSelectedRole] = React.useState<"CUSTOMER" | "SERVICE_PROVIDER">(initialRoleParam);
  const [isLoading, setIsLoading] = React.useState(false);
  const [isPendingApproval, setIsPendingApproval] = React.useState(false);
  const [errorMessage, setErrorMessage] = React.useState<string | null>(null);

  const form = useForm({
    defaultValues: {
      first_name: "",
      last_name: "",
      email: "",
      password: "",
    },
    onSubmit: async ({ value }) => {
      setIsLoading(true);
      setErrorMessage(null);

      try {
        const payload = {
          first_name: value.first_name.trim(),
          last_name: value.last_name.trim(),
          email: value.email.trim(),
          password: value.password,
          role: selectedRole as UserRole,
        };

        const res = await authService.signup(payload);

        // CASE 2: SERVICE_PROVIDER Response -> Pending Admin Approval
        if (selectedRole === "SERVICE_PROVIDER") {
          setIsPendingApproval(true);
          toast.success("Application submitted. Pending administrator verification.");
          return;
        }

        // CASE 1: CUSTOMER Response -> Check if direct token was returned
        const tokenObj = (res as any)?.token;
        const accessToken = tokenObj?.access || (res as any)?.access_token;
        const refreshToken = tokenObj?.refresh || (res as any)?.refresh_token;

        if (accessToken) {
          let profile = null;
          try {
            profile = await profilesService.getMyProfile();
          } catch {
            // profile fetch fallback
          }

          useAuthStore.getState().setAuth({
            accessToken,
            refreshToken,
            user: {
              id: (res as any)?.user?.id || "",
              email: value.email.trim(),
              first_name: value.first_name.trim(),
              last_name: value.last_name.trim(),
              role: "CUSTOMER",
              is_approved: true,
            },
            profile,
          });

          toast.success("Account created successfully.");
          router.push("/dashboard/customer");
        } else {
          toast.success("Account created successfully. Please sign in.");
          router.push("/login");
        }
      } catch (err: any) {
        const msg = err?.message || err?.detail || "Registration failed. Please check your details.";
        setErrorMessage(msg);
        toast.error(msg);
      } finally {
        setIsLoading(false);
      }
    },
  });

  // State: Provider Submitted
  if (isPendingApproval) {
    return (
      <div className="space-y-5 text-center py-4">
        <div className="mx-auto w-12 h-12 rounded-xl bg-amber-50 border border-amber-200/80 flex items-center justify-center text-amber-700">
          <Clock className="h-6 w-6" />
        </div>

        <div className="space-y-1">
          <h3 className="text-lg font-semibold text-stone-900 dark:text-stone-100">
            Pending administrator verification
          </h3>
          <p className="text-xs text-stone-500 leading-relaxed max-w-sm mx-auto">
            To ensure marketplace safety, we verify all service provider credentials before approving public listings.
          </p>
        </div>

        <div className="p-3.5 rounded-xl bg-stone-50 border border-stone-200 text-left text-xs text-stone-700 space-y-1">
          <div className="font-medium flex items-center gap-1.5 text-stone-900">
            <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" />
            <span>Review timeline</span>
          </div>
          <p className="text-[11px] text-stone-500 leading-relaxed">
            Submissions are typically reviewed within 24 business hours. You will receive access to publish services and accept bookings once confirmed.
          </p>
        </div>

        <Button asChild variant="outline" className="w-full text-xs h-10">
          <Link href="/login">Return to sign in</Link>
        </Button>
      </div>
    );
  }

  return (
    <>
      {errorMessage && (
        <div className="mb-5 p-3 rounded-xl bg-rose-50 border border-rose-200/80 text-rose-800 text-xs flex items-center gap-2">
          <AlertCircle className="h-4 w-4 shrink-0 text-rose-600" />
          <span>{errorMessage}</span>
        </div>
      )}

      {/* Role Selection Toggle */}
      <div className="mb-5 space-y-1.5">
        <Label className="text-xs font-medium text-stone-700 dark:text-stone-300">Account type</Label>
        <div className="grid grid-cols-2 gap-2.5">
          <button
            type="button"
            onClick={() => setSelectedRole("CUSTOMER")}
            className={`p-3 rounded-xl border text-left transition-colors cursor-pointer ${
              selectedRole === "CUSTOMER"
                ? "bg-[#FAF9F6] border-stone-900 dark:border-stone-100 ring-1 ring-stone-900 dark:ring-stone-100"
                : "bg-white border-stone-200 hover:border-stone-300 dark:bg-stone-900 dark:border-stone-800"
            }`}
          >
            <div className="flex items-center gap-2 mb-1">
              <div
                className={`p-1 rounded-md ${
                  selectedRole === "CUSTOMER"
                    ? "bg-stone-900 text-white dark:bg-stone-100 dark:text-stone-900"
                    : "bg-stone-100 text-stone-600 dark:bg-stone-800 dark:text-stone-400"
                }`}
              >
                <Users className="h-3.5 w-3.5" />
              </div>
              <span className="font-semibold text-xs text-stone-900 dark:text-stone-100">Customer</span>
            </div>
            <p className="text-[11px] text-stone-500">Hire verified pros</p>
          </button>

          <button
            type="button"
            onClick={() => setSelectedRole("SERVICE_PROVIDER")}
            className={`p-3 rounded-xl border text-left transition-colors cursor-pointer ${
              selectedRole === "SERVICE_PROVIDER"
                ? "bg-[#FAF9F6] border-stone-900 dark:border-stone-100 ring-1 ring-stone-900 dark:ring-stone-100"
                : "bg-white border-stone-200 hover:border-stone-300 dark:bg-stone-900 dark:border-stone-800"
            }`}
          >
            <div className="flex items-center gap-2 mb-1">
              <div
                className={`p-1 rounded-md ${
                  selectedRole === "SERVICE_PROVIDER"
                    ? "bg-stone-900 text-white dark:bg-stone-100 dark:text-stone-900"
                    : "bg-stone-100 text-stone-600 dark:bg-stone-800 dark:text-stone-400"
                }`}
              >
                <Briefcase className="h-3.5 w-3.5" />
              </div>
              <span className="font-semibold text-xs text-stone-900 dark:text-stone-100">Service Pro</span>
            </div>
            <p className="text-[11px] text-stone-500">List trade services</p>
          </button>
        </div>
      </div>

      <form
        onSubmit={(e) => {
          e.preventDefault();
          e.stopPropagation();
          form.handleSubmit();
        }}
        className="space-y-3.5"
      >
        <div className="grid grid-cols-2 gap-2.5">
          <form.Field
            name="first_name"
            validators={{
              onChange: ({ value }) => (!value ? "Required" : undefined),
            }}
          >
            {(field) => (
              <div className="space-y-1.5">
                <Label htmlFor={field.name} className="text-xs font-medium text-stone-700 dark:text-stone-300">
                  First name
                </Label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-stone-400" />
                  <Input
                    id={field.name}
                    placeholder="First name"
                    value={field.state.value}
                    onChange={(e) => field.handleChange(e.target.value)}
                    className="pl-9 h-10 rounded-xl bg-white border-stone-200 focus-visible:border-stone-400 focus-visible:ring-stone-400/20 text-xs"
                  />
                </div>
                {field.state.meta.errors ? (
                  <p className="text-[11px] text-rose-600">{field.state.meta.errors.join(", ")}</p>
                ) : null}
              </div>
            )}
          </form.Field>

          <form.Field
            name="last_name"
            validators={{
              onChange: ({ value }) => (!value ? "Required" : undefined),
            }}
          >
            {(field) => (
              <div className="space-y-1.5">
                <Label htmlFor={field.name} className="text-xs font-medium text-stone-700 dark:text-stone-300">
                  Last name
                </Label>
                <Input
                  id={field.name}
                  placeholder="Last name"
                  value={field.state.value}
                  onChange={(e) => field.handleChange(e.target.value)}
                  className="h-10 rounded-xl bg-white border-stone-200 focus-visible:border-stone-400 focus-visible:ring-stone-400/20 text-xs"
                />
                {field.state.meta.errors ? (
                  <p className="text-[11px] text-rose-600">{field.state.meta.errors.join(", ")}</p>
                ) : null}
              </div>
            )}
          </form.Field>
        </div>

        <form.Field
          name="email"
          validators={{
            onChange: ({ value }) =>
              !value ? "Email address is required" : undefined,
          }}
        >
          {(field) => (
            <div className="space-y-1.5">
              <Label htmlFor={field.name} className="text-xs font-medium text-stone-700 dark:text-stone-300">
                Email address
              </Label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-stone-400" />
                <Input
                  id={field.name}
                  type="email"
                  placeholder="name@example.com"
                  value={field.state.value}
                  onChange={(e) => field.handleChange(e.target.value)}
                  className="pl-10 h-10 rounded-xl bg-white border-stone-200 focus-visible:border-stone-400 focus-visible:ring-stone-400/20 text-xs"
                />
              </div>
              {field.state.meta.errors ? (
                <p className="text-[11px] text-rose-600">{field.state.meta.errors.join(", ")}</p>
              ) : null}
            </div>
          )}
        </form.Field>

        <form.Field
          name="password"
          validators={{
            onChange: ({ value }) =>
              !value
                ? "Password is required"
                : value.length < 8
                ? "Minimum 8 characters"
                : undefined,
          }}
        >
          {(field) => (
            <div className="space-y-1.5">
              <Label htmlFor={field.name} className="text-xs font-medium text-stone-700 dark:text-stone-300">
                Password
              </Label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-stone-400" />
                <Input
                  id={field.name}
                  type="password"
                  placeholder="At least 8 characters"
                  value={field.state.value}
                  onChange={(e) => field.handleChange(e.target.value)}
                  className="pl-10 h-10 rounded-xl bg-white border-stone-200 focus-visible:border-stone-400 focus-visible:ring-stone-400/20 text-xs"
                />
              </div>
              {field.state.meta.errors ? (
                <p className="text-[11px] text-rose-600">{field.state.meta.errors.join(", ")}</p>
              ) : null}
            </div>
          )}
        </form.Field>

        <Button
          type="submit"
          disabled={isLoading}
          className="w-full h-10 mt-2 text-xs font-medium bg-[#EA580C] hover:bg-[#c2410c] text-white shadow-sm gap-2"
        >
          {isLoading ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              <span>Creating account...</span>
            </>
          ) : (
            <>
              <span>
                {selectedRole === "SERVICE_PROVIDER" ? "Submit pro application" : "Create account"}
              </span>
              <ArrowRight className="h-4 w-4" />
            </>
          )}
        </Button>

        <div className="pt-3 text-center text-xs text-stone-500">
          Already registered?{" "}
          <Link
            href="/login"
            className="font-medium text-[#EA580C] hover:text-[#c2410c] transition-colors"
          >
            Sign in
          </Link>
        </div>
      </form>
    </>
  );
}

export default function RegisterPage() {
  return (
    <AuthSplitLayout
      title="Create an account"
      subtitle="Join thousands of customers and skilled professionals across Bangladesh."
    >
      <React.Suspense
        fallback={
          <div className="flex items-center justify-center p-8">
            <Loader2 className="h-6 w-6 animate-spin text-stone-400" />
          </div>
        }
      >
        <RegisterForm />
      </React.Suspense>
    </AuthSplitLayout>
  );
}
