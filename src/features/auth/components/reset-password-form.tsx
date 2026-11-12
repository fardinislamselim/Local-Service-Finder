"use client";

import * as React from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useForm } from "@tanstack/react-form";
import { Loader2, ShieldCheck, ArrowRight, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { FormInput, getFieldError } from "@/components/shared/form-field";
import { useAuth } from "../hooks/use-auth";
import { resetPasswordBaseSchema } from "../schemas/auth.schema";

export function ResetPasswordForm() {
  const searchParams = useSearchParams();
  const initialEmail = searchParams?.get("email") || "";
  const { resetPassword, isResettingPassword } = useAuth();

  const form = useForm({
    defaultValues: {
      email: initialEmail,
      otp: "",
      new_password: "",
      confirm_password: "",
    },
    onSubmit: async ({ value }) => {
      await resetPassword({
        email: value.email,
        otp: value.otp,
        new_password: value.new_password,
      });
    },
  });

  return (
    <Card className="w-full max-w-md shadow-xl border-border/80 bg-card/95 backdrop-blur">
      <CardHeader className="space-y-2 text-center">
        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 text-primary mb-1">
          <ShieldCheck className="h-6 w-6" />
        </div>
        <CardTitle className="text-2xl font-bold tracking-tight">Reset your password</CardTitle>
        <CardDescription>
          Enter the 6-digit OTP code sent to your email and set a new password.
        </CardDescription>
      </CardHeader>

      <form
        onSubmit={(e) => {
          e.preventDefault();
          e.stopPropagation();
          form.handleSubmit();
        }}
      >
        <CardContent className="space-y-4">
          <form.Field
            name="email"
            validators={{
              onChange: ({ value }) => {
                const res = resetPasswordBaseSchema.shape.email.safeParse(value);
                return res.success ? undefined : res.error.errors[0]?.message;
              },
            }}
          >
            {(field) => (
              <FormInput
                label="Email address"
                type="email"
                required
                placeholder="name@example.com"
                value={field.state.value}
                onBlur={field.handleBlur}
                onChange={(e) => field.handleChange(e.target.value)}
                error={getFieldError(field.state.meta.errors)}
                autoComplete="email"
              />
            )}
          </form.Field>

          <form.Field
            name="otp"
            validators={{
              onChange: ({ value }) => {
                const res = resetPasswordBaseSchema.shape.otp.safeParse(value);
                return res.success ? undefined : res.error.errors[0]?.message;
              },
            }}
          >
            {(field) => (
              <FormInput
                label="6-Digit OTP Code"
                required
                placeholder="e.g. 123456"
                value={field.state.value}
                onBlur={field.handleBlur}
                onChange={(e) => field.handleChange(e.target.value)}
                error={getFieldError(field.state.meta.errors)}
                className="tracking-widest font-mono text-center text-lg"
                maxLength={6}
              />
            )}
          </form.Field>

          <form.Field
            name="new_password"
            validators={{
              onChange: ({ value }) => {
                const res = resetPasswordBaseSchema.shape.new_password.safeParse(value);
                return res.success ? undefined : res.error.errors[0]?.message;
              },
            }}
          >
            {(field) => (
              <FormInput
                label="New Password"
                type="password"
                required
                placeholder="At least 6 characters"
                value={field.state.value}
                onBlur={field.handleBlur}
                onChange={(e) => field.handleChange(e.target.value)}
                error={getFieldError(field.state.meta.errors)}
                autoComplete="new-password"
              />
            )}
          </form.Field>

          <form.Field
            name="confirm_password"
            validators={{
              onChangeListenTo: ["new_password"],
              onChange: ({ value, fieldApi }) => {
                if (!value) return "Please confirm your password";
                if (value !== fieldApi.form.getFieldValue("new_password")) {
                  return "Passwords do not match";
                }
                return undefined;
              },
            }}
          >
            {(field) => (
              <FormInput
                label="Confirm New Password"
                type="password"
                required
                placeholder="Confirm password"
                value={field.state.value}
                onBlur={field.handleBlur}
                onChange={(e) => field.handleChange(e.target.value)}
                error={getFieldError(field.state.meta.errors)}
                autoComplete="new-password"
              />
            )}
          </form.Field>
        </CardContent>

        <CardFooter className="flex flex-col gap-4">
          <Button
            type="submit"
            className="w-full gap-2 font-semibold shadow-sm"
            disabled={isResettingPassword}
          >
            {isResettingPassword ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Resetting password...
              </>
            ) : (
              <>
                Reset password
                <ArrowRight className="h-4 w-4" />
              </>
            )}
          </Button>

          <div className="flex items-center justify-center">
            <Link
              href="/login"
              className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground font-medium transition-colors"
            >
              <ArrowLeft className="mr-1.5 h-4 w-4" />
              Back to sign in
            </Link>
          </div>
        </CardFooter>
      </form>
    </Card>
  );
}
