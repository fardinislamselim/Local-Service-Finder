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
        // authService resolves the real role (response -> JWT claims -> backend
        // probe), persists tokens and writes the authenticated user to the store.
        const result = await authService.signin({
          email: value.email.trim(),
          password: value.password,
        });

        const role = result.role;

        toast.success("Signed in successfully.");

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
        const msg = err?.message || err?.detail || "Invalid email or password.";
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
        <div className="mb-5 p-3 rounded-xl bg-rose-50 border border-rose-200/80 text-rose-800 text-xs flex items-center gap-2">
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
        className="space-y-4"
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
              <Label htmlFor={field.name} className="text-xs font-medium text-stone-700 dark:text-stone-300">
                Email address
              </Label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-stone-400" />
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
              !value ? "Password is required" : undefined,
          }}
        >
          {(field) => (
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <Label htmlFor={field.name} className="text-xs font-medium text-stone-700 dark:text-stone-300">
                  Password
                </Label>
                <Link
                  href="/forgot-password"
                  className="text-xs text-[#EA580C] hover:text-[#c2410c] transition-colors"
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
              <span>Signing in...</span>
            </>
          ) : (
            <>
              <span>Sign in</span>
              <ArrowRight className="h-4 w-4" />
            </>
          )}
        </Button>

        <div className="pt-3 text-center text-xs text-stone-500">
          Don&apos;t have an account?{" "}
          <Link
            href="/register"
            className="font-medium text-[#EA580C] hover:text-[#c2410c] transition-colors"
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
      title="Sign in to your account"
      subtitle="Access your bookings, active service requests, and dashboard."
    >
      <React.Suspense
        fallback={
          <div className="flex items-center justify-center p-8">
            <Loader2 className="h-6 w-6 animate-spin text-stone-400" />
          </div>
        }
      >
        <LoginForm />
      </React.Suspense>
    </AuthSplitLayout>
  );
}
