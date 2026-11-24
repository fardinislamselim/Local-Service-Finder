"use client";

import * as React from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useForm } from "@tanstack/react-form";
import {
  Loader2,
  ArrowRight,
  ArrowLeft,
  Mail,
  KeyRound,
  Lock,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { getFieldError } from "@/components/shared/form-field";
import { useAuth } from "../hooks/use-auth";
import { resetPasswordBaseSchema } from "../schemas/auth.schema";

const inputClass =
  "h-10 rounded-xl bg-white border-stone-200 text-xs focus-visible:border-stone-400 focus-visible:ring-stone-400/20";
const iconClass =
  "absolute left-3.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-stone-400";

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
          onChange: ({ value }) => {
            const res = resetPasswordBaseSchema.shape.email.safeParse(value);
            return res.success ? undefined : res.error.errors[0]?.message;
          },
        }}
      >
        {(field) => {
          const error = getFieldError(field.state.meta.errors);
          return (
            <div className="space-y-1.5">
              <Label htmlFor="reset-email" className="text-xs font-semibold text-stone-700">
                Email address <span className="text-orange-600">*</span>
              </Label>
              <div className="relative">
                <Mail className={iconClass} />
                <Input
                  id="reset-email"
                  type="email"
                  required
                  placeholder="name@example.com"
                  value={field.state.value}
                  onBlur={field.handleBlur}
                  onChange={(e) => field.handleChange(e.target.value)}
                  autoComplete="email"
                  className={`pl-10 ${inputClass}`}
                />
              </div>
              {error && <p className="text-[11px] font-medium text-rose-600">{error}</p>}
            </div>
          );
        }}
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
        {(field) => {
          const error = getFieldError(field.state.meta.errors);
          return (
            <div className="space-y-1.5">
              <Label htmlFor="reset-otp" className="text-xs font-semibold text-stone-700">
                6-digit OTP code <span className="text-orange-600">*</span>
              </Label>
              <div className="relative">
                <KeyRound className={iconClass} />
                <Input
                  id="reset-otp"
                  required
                  placeholder="e.g. 123456"
                  value={field.state.value}
                  onBlur={field.handleBlur}
                  onChange={(e) => field.handleChange(e.target.value)}
                  maxLength={6}
                  inputMode="numeric"
                  className={`pl-10 text-center font-mono tracking-[0.4em] ${inputClass}`}
                />
              </div>
              {error && <p className="text-[11px] font-medium text-rose-600">{error}</p>}
            </div>
          );
        }}
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
        {(field) => {
          const error = getFieldError(field.state.meta.errors);
          return (
            <div className="space-y-1.5">
              <Label htmlFor="reset-new-password" className="text-xs font-semibold text-stone-700">
                New password <span className="text-orange-600">*</span>
              </Label>
              <div className="relative">
                <Lock className={iconClass} />
                <Input
                  id="reset-new-password"
                  type="password"
                  required
                  placeholder="At least 6 characters"
                  value={field.state.value}
                  onBlur={field.handleBlur}
                  onChange={(e) => field.handleChange(e.target.value)}
                  autoComplete="new-password"
                  className={`pl-10 ${inputClass}`}
                />
              </div>
              {error ? (
                <p className="text-[11px] font-medium text-rose-600">{error}</p>
              ) : (
                <p className="text-[11px] text-stone-500">Must contain at least 6 characters.</p>
              )}
            </div>
          );
        }}
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
        {(field) => {
          const error = getFieldError(field.state.meta.errors);
          return (
            <div className="space-y-1.5">
              <Label htmlFor="reset-confirm-password" className="text-xs font-semibold text-stone-700">
                Confirm new password <span className="text-orange-600">*</span>
              </Label>
              <div className="relative">
                <Lock className={iconClass} />
                <Input
                  id="reset-confirm-password"
                  type="password"
                  required
                  placeholder="Confirm password"
                  value={field.state.value}
                  onBlur={field.handleBlur}
                  onChange={(e) => field.handleChange(e.target.value)}
                  autoComplete="new-password"
                  className={`pl-10 ${inputClass}`}
                />
              </div>
              {error && <p className="text-[11px] font-medium text-rose-600">{error}</p>}
            </div>
          );
        }}
      </form.Field>

      <Button
        type="submit"
        className="mt-2 h-10 w-full gap-2 bg-[#EA580C] text-xs font-medium text-white hover:bg-[#c2410c]"
        disabled={isResettingPassword}
      >
        {isResettingPassword ? (
          <>
            <Loader2 className="h-4 w-4 animate-spin" />
            <span>Resetting password...</span>
          </>
        ) : (
          <>
            <span>Reset password</span>
            <ArrowRight className="h-4 w-4" />
          </>
        )}
      </Button>

      <div className="pt-1 text-center">
        <Link
          href="/login"
          className="inline-flex items-center text-xs font-medium text-stone-500 transition-colors hover:text-stone-900"
        >
          <ArrowLeft className="mr-1.5 h-3.5 w-3.5" />
          Back to sign in
        </Link>
      </div>
    </form>
  );
}
