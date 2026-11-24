"use client";

import * as React from "react";
import Link from "next/link";
import { useForm } from "@tanstack/react-form";
import { Loader2, LogIn, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { FormInput, getFieldError } from "@/components/shared/form-field";
import { useAuth } from "../hooks/use-auth";
import { signinSchema } from "../schemas/auth.schema";

export function LoginForm() {
  const { signin, isSigningIn } = useAuth();

  const form = useForm({
    defaultValues: {
      email: "",
      password: "",
    },
    onSubmit: async ({ value }) => {
      await signin(value);
    },
  });

  return (
    <Card className="w-full max-w-md shadow-lg border-border/80 bg-card/95 backdrop-blur">
      <CardHeader className="space-y-2 text-center">
        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 text-primary mb-1">
          <LogIn className="h-6 w-6" />
        </div>
        <CardTitle className="text-2xl font-semibold tracking-tight">Sign in to your account</CardTitle>
        <CardDescription>
          Enter your email and password to access your dashboard and services
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
                const res = signinSchema.shape.email.safeParse(value);
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
            name="password"
            validators={{
              onChange: ({ value }) => {
                const res = signinSchema.shape.password.safeParse(value);
                return res.success ? undefined : res.error.errors[0]?.message;
              },
            }}
          >
            {(field) => (
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-sm font-medium flex items-center gap-1">
                    Password <span className="text-destructive">*</span>
                  </span>
                  <Link
                    href="/forgot-password"
                    className="text-xs text-primary hover:underline font-medium"
                  >
                    Forgot password?
                  </Link>
                </div>
                <FormInput
                  type="password"
                  placeholder="Enter your password"
                  value={field.state.value}
                  onBlur={field.handleBlur}
                  onChange={(e) => field.handleChange(e.target.value)}
                  error={getFieldError(field.state.meta.errors)}
                  autoComplete="current-password"
                />
              </div>
            )}
          </form.Field>
        </CardContent>

        <CardFooter className="flex flex-col gap-4">
          <Button
            type="submit"
            className="w-full gap-2 font-semibold shadow-sm"
            disabled={isSigningIn}
          >
            {isSigningIn ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Signing in...
              </>
            ) : (
              <>
                Sign in
                <ArrowRight className="h-4 w-4" />
              </>
            )}
          </Button>

          <div className="text-center text-sm text-muted-foreground">
            Don&apos;t have an account?{" "}
            <Link href="/register" className="text-primary font-semibold hover:underline">
              Create an account
            </Link>
          </div>
        </CardFooter>
      </form>
    </Card>
  );
}
