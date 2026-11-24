"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useForm } from "@tanstack/react-form";
import { Loader2, KeyRound, ArrowRight, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { FormInput, getFieldError } from "@/components/shared/form-field";
import { useAuth } from "../hooks/use-auth";
import { sendOtpSchema } from "../schemas/auth.schema";

export function ForgotPasswordForm() {
  const router = useRouter();
  const { sendOtp, isSendingOtp } = useAuth();

  const form = useForm({
    defaultValues: {
      email: "",
    },
    onSubmit: async ({ value }) => {
      await sendOtp(value);
      router.push(`/reset-password?email=${encodeURIComponent(value.email)}`);
    },
  });

  return (
    <Card className="w-full max-w-md shadow-lg border-border/80 bg-card/95 backdrop-blur">
      <CardHeader className="space-y-2 text-center">
        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 text-primary mb-1">
          <KeyRound className="h-6 w-6" />
        </div>
        <CardTitle className="text-2xl font-semibold tracking-tight">Forgot password</CardTitle>
        <CardDescription>
          Enter your registered email address and we will send you a 6-digit verification OTP.
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
                const res = sendOtpSchema.shape.email.safeParse(value);
                return res.success ? undefined : res.error.errors[0]?.message;
              },
            }}
          >
            {(field) => (
              <FormInput
                label="Registered email"
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
        </CardContent>

        <CardFooter className="flex flex-col gap-4">
          <Button
            type="submit"
            className="w-full gap-2 font-semibold shadow-sm"
            disabled={isSendingOtp}
          >
            {isSendingOtp ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Sending OTP...
              </>
            ) : (
              <>
                Send verification OTP
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
