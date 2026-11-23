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
          toast.success("Application submitted! Pending admin verification.");
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

          toast.success("Welcome to ProLagbe! Your customer account is ready.");
          router.push("/dashboard/customer");
        } else {
          toast.success("Account created successfully! Please sign in.");
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
      <div className="space-y-6 text-center py-6">
        <div className="mx-auto w-16 h-16 rounded-2xl bg-amber-50 border border-amber-200 flex items-center justify-center text-amber-600 shadow-sm">
          <Clock className="h-8 w-8 animate-pulse" />
        </div>

        <div className="space-y-2">
          <h3 className="text-xl font-bold text-stone-900">
            Pending Administrator Approval
          </h3>
          <p className="text-sm text-stone-500 leading-relaxed max-w-sm mx-auto">
            To guarantee customer safety and trust, our operations team manually verifies all service provider credentials. We will notify you once approved.
          </p>
        </div>

        <div className="p-4 rounded-xl bg-teal-50/60 border border-teal-200/80 text-left text-xs text-teal-900 space-y-1.5">
          <div className="font-bold flex items-center gap-1.5 text-teal-800">
            <CheckCircle2 className="h-4 w-4 text-emerald-600" />
            <span>What happens next?</span>
          </div>
          <p className="text-stone-600">
            Our team reviews provider submissions within 24 hours. Once verified, you will be able to log in, list services, and receive customer bookings.
          </p>
        </div>

        <Button asChild className="w-full">
          <Link href="/login">Return to Sign In</Link>
        </Button>
      </div>
    );
  }

  return (
    <>
      {errorMessage && (
        <div className="mb-5 p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-center gap-2">
          <AlertCircle className="h-4 w-4 shrink-0 text-rose-600" />
          <span>{errorMessage}</span>
        </div>
      )}

      {/* Visual Role Cards */}
      <div className="mb-6 space-y-2">
        <Label className="text-xs font-bold text-stone-700">I want to:</Label>
        <div className="grid grid-cols-2 gap-3">
          <button
            type="button"
            onClick={() => setSelectedRole("CUSTOMER")}
            className={`p-3.5 rounded-xl border text-left transition-all duration-200 cursor-pointer ${
              selectedRole === "CUSTOMER"
                ? "bg-teal-50/80 border-teal-700 ring-2 ring-teal-700/20 shadow-xs"
                : "bg-white border-stone-200 hover:border-stone-300"
            }`}
          >
            <div className="flex items-center gap-2 mb-1">
              <div
                className={`p-1.5 rounded-lg ${
                  selectedRole === "CUSTOMER"
                    ? "bg-teal-700 text-white"
                    : "bg-stone-100 text-stone-600"
                }`}
              >
                <Users className="h-4 w-4" />
              </div>
              <span className="font-bold text-xs text-stone-900">Hire Services</span>
            </div>
            <p className="text-[11px] text-stone-500 line-clamp-1">
              Book verified local pros
            </p>
          </button>

          <button
            type="button"
            onClick={() => setSelectedRole("SERVICE_PROVIDER")}
            className={`p-3.5 rounded-xl border text-left transition-all duration-200 cursor-pointer ${
              selectedRole === "SERVICE_PROVIDER"
                ? "bg-orange-50/80 border-orange-600 ring-2 ring-orange-500/20 shadow-xs"
                : "bg-white border-stone-200 hover:border-stone-300"
            }`}
          >
            <div className="flex items-center gap-2 mb-1">
              <div
                className={`p-1.5 rounded-lg ${
                  selectedRole === "SERVICE_PROVIDER"
                    ? "bg-orange-600 text-white"
                    : "bg-stone-100 text-stone-600"
                }`}
              >
                <Briefcase className="h-4 w-4" />
              </div>
              <span className="font-bold text-xs text-stone-900">Provide Services</span>
            </div>
            <p className="text-[11px] text-stone-500 line-clamp-1">
              Grow your trade business
            </p>
          </button>
        </div>
      </div>

      <form
        onSubmit={(e) => {
          e.preventDefault();
          e.stopPropagation();
          form.handleSubmit();
        }}
        className="space-y-4"
      >
        <div className="grid grid-cols-2 gap-3">
          <form.Field
            name="first_name"
            validators={{
              onChange: ({ value }) => (!value ? "Required" : undefined),
            }}
          >
            {(field) => (
              <div className="space-y-1.5">
                <Label htmlFor={field.name} className="text-xs font-bold text-stone-700">
                  First Name
                </Label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-stone-400" />
                  <Input
                    id={field.name}
                    placeholder="Reza"
                    value={field.state.value}
                    onChange={(e) => field.handleChange(e.target.value)}
                    className="pl-9 h-10 rounded-xl bg-white border-stone-200 text-sm"
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
                <Label htmlFor={field.name} className="text-xs font-bold text-stone-700">
                  Last Name
                </Label>
                <Input
                  id={field.name}
                  placeholder="Ahmed"
                  value={field.state.value}
                  onChange={(e) => field.handleChange(e.target.value)}
                  className="h-10 rounded-xl bg-white border-stone-200 text-sm"
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
                  className="pl-10 h-10 rounded-xl bg-white border-stone-200 text-sm"
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
                ? "Password must be at least 8 characters"
                : undefined,
          }}
        >
          {(field) => (
            <div className="space-y-1.5">
              <Label htmlFor={field.name} className="text-xs font-bold text-stone-700">
                Create Password
              </Label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-stone-400" />
                <Input
                  id={field.name}
                  type="password"
                  placeholder="Min 8 characters"
                  value={field.state.value}
                  onChange={(e) => field.handleChange(e.target.value)}
                  className="pl-10 h-10 rounded-xl bg-white border-stone-200 text-sm"
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
          className="w-full h-11 mt-2 text-sm font-bold shadow-md gap-2"
        >
          {isLoading ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              <span>Submitting Registration...</span>
            </>
          ) : (
            <>
              <span>
                {selectedRole === "SERVICE_PROVIDER" ? "Submit Pro Application" : "Create Account"}
              </span>
              <ArrowRight className="h-4 w-4" />
            </>
          )}
        </Button>

        <div className="pt-4 text-center text-xs text-stone-600">
          Already registered?{" "}
          <Link
            href="/login"
            className="font-bold text-orange-600 hover:text-orange-700 transition-colors underline-offset-2 hover:underline"
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
      subtitle="Join thousands of customers and skilled professionals on ProLagbe."
    >
      <React.Suspense
        fallback={
          <div className="flex items-center justify-center p-8">
            <Loader2 className="h-6 w-6 animate-spin text-orange-600" />
          </div>
        }
      >
        <RegisterForm />
      </React.Suspense>
    </AuthSplitLayout>
  );
}
