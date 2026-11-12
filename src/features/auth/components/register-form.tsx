"use client";

import * as React from "react";
import Link from "next/link";
import { useForm } from "@tanstack/react-form";
import { Loader2, UserPlus, ArrowRight, Shield, Wrench, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { FormInput, FieldWrapper, getFieldError } from "@/components/shared/form-field";
import { useAuth } from "../hooks/use-auth";
import { signupSchema } from "../schemas/auth.schema";
import type { UserRole } from "@/types/api";

export function RegisterForm() {
  const { signup, isSigningUp } = useAuth();

  const form = useForm({
    defaultValues: {
      first_name: "",
      last_name: "",
      email: "",
      password: "",
      role: "CUSTOMER" as UserRole,
    },
    onSubmit: async ({ value }) => {
      await signup(value);
    },
  });

  return (
    <Card className="w-full max-w-lg shadow-xl border-border/80 bg-card/95 backdrop-blur">
      <CardHeader className="space-y-2 text-center">
        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 text-primary mb-1">
          <UserPlus className="h-6 w-6" />
        </div>
        <CardTitle className="text-2xl font-bold tracking-tight">Create your account</CardTitle>
        <CardDescription>
          Join Local Service Finder as a customer, service provider, or administrator
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
          {/* Account Role Selector */}
          <form.Field name="role">
            {(field) => (
              <FieldWrapper
                label="Select Account Type"
                required
                error={getFieldError(field.state.meta.errors)}
                description={
                  field.state.value === "SERVICE_PROVIDER"
                    ? "Service provider accounts require admin approval before becoming active."
                    : undefined
                }
              >
                <div className="grid grid-cols-3 gap-2.5 pt-1">
                  <button
                    type="button"
                    onClick={() => field.handleChange("CUSTOMER")}
                    className={`flex flex-col items-center justify-center gap-1.5 p-3 rounded-lg border text-xs font-medium transition-all ${
                      field.state.value === "CUSTOMER"
                        ? "border-primary bg-primary/10 text-primary ring-1 ring-primary"
                        : "border-input hover:bg-accent text-muted-foreground"
                    }`}
                  >
                    <User className="h-4 w-4" />
                    <span>Customer</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => field.handleChange("SERVICE_PROVIDER")}
                    className={`flex flex-col items-center justify-center gap-1.5 p-3 rounded-lg border text-xs font-medium transition-all ${
                      field.state.value === "SERVICE_PROVIDER"
                        ? "border-primary bg-primary/10 text-primary ring-1 ring-primary"
                        : "border-input hover:bg-accent text-muted-foreground"
                    }`}
                  >
                    <Wrench className="h-4 w-4" />
                    <span>Provider</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => field.handleChange("ADMIN")}
                    className={`flex flex-col items-center justify-center gap-1.5 p-3 rounded-lg border text-xs font-medium transition-all ${
                      field.state.value === "ADMIN"
                        ? "border-primary bg-primary/10 text-primary ring-1 ring-primary"
                        : "border-input hover:bg-accent text-muted-foreground"
                    }`}
                  >
                    <Shield className="h-4 w-4" />
                    <span>Admin</span>
                  </button>
                </div>
              </FieldWrapper>
            )}
          </form.Field>

          {/* First & Last Name */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <form.Field
              name="first_name"
              validators={{
                onChange: ({ value }) => {
                  const res = signupSchema.shape.first_name.safeParse(value);
                  return res.success ? undefined : res.error.errors[0]?.message;
                },
              }}
            >
              {(field) => (
                <FormInput
                  label="First Name"
                  required
                  placeholder="e.g. Salim"
                  value={field.state.value}
                  onBlur={field.handleBlur}
                  onChange={(e) => field.handleChange(e.target.value)}
                  error={getFieldError(field.state.meta.errors)}
                />
              )}
            </form.Field>

            <form.Field
              name="last_name"
              validators={{
                onChange: ({ value }) => {
                  const res = signupSchema.shape.last_name.safeParse(value);
                  return res.success ? undefined : res.error.errors[0]?.message;
                },
              }}
            >
              {(field) => (
                <FormInput
                  label="Last Name"
                  required
                  placeholder="e.g. Raza"
                  value={field.state.value}
                  onBlur={field.handleBlur}
                  onChange={(e) => field.handleChange(e.target.value)}
                  error={getFieldError(field.state.meta.errors)}
                />
              )}
            </form.Field>
          </div>

          {/* Email */}
          <form.Field
            name="email"
            validators={{
              onChange: ({ value }) => {
                const res = signupSchema.shape.email.safeParse(value);
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

          {/* Password */}
          <form.Field
            name="password"
            validators={{
              onChange: ({ value }) => {
                const res = signupSchema.shape.password.safeParse(value);
                return res.success ? undefined : res.error.errors[0]?.message;
              },
            }}
          >
            {(field) => (
              <FormInput
                label="Password"
                type="password"
                required
                placeholder="At least 6 characters"
                value={field.state.value}
                onBlur={field.handleBlur}
                onChange={(e) => field.handleChange(e.target.value)}
                error={getFieldError(field.state.meta.errors)}
                autoComplete="new-password"
                description="Must contain at least 6 characters"
              />
            )}
          </form.Field>
        </CardContent>

        <CardFooter className="flex flex-col gap-4">
          <Button
            type="submit"
            className="w-full gap-2 font-semibold shadow-sm"
            disabled={isSigningUp}
          >
            {isSigningUp ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Creating account...
              </>
            ) : (
              <>
                Create account
                <ArrowRight className="h-4 w-4" />
              </>
            )}
          </Button>

          <div className="text-center text-sm text-muted-foreground">
            Already have an account?{" "}
            <Link href="/login" className="text-primary font-semibold hover:underline">
              Sign in
            </Link>
          </div>
        </CardFooter>
      </form>
    </Card>
  );
}
