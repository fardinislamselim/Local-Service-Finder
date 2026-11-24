"use client";

import * as React from "react";
import Link from "next/link";
import { useForm } from "@tanstack/react-form";
import { Loader2, UserPlus, ArrowRight, Wrench, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { FormInput, FieldWrapper, getFieldError } from "@/components/shared/form-field";
import { useAuth } from "../hooks/use-auth";
import { signupBaseSchema } from "../schemas/auth.schema";

export function RegisterForm() {
  const { signup, isSigningUp } = useAuth();

  const form = useForm({
    defaultValues: {
      first_name: "",
      last_name: "",
      email: "",
      password: "",
      confirm_password: "",
      role: "CUSTOMER" as "CUSTOMER" | "SERVICE_PROVIDER",
    },
    onSubmit: async ({ value }) => {
      await signup({
        first_name: value.first_name,
        last_name: value.last_name,
        email: value.email,
        password: value.password,
        role: value.role,
      });
    },
  });

  return (
    <Card className="w-full max-w-lg shadow-lg border-border/80 bg-card/95 backdrop-blur">
      <CardHeader className="space-y-2 text-center">
        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 text-primary mb-1">
          <UserPlus className="h-6 w-6" />
        </div>
        <CardTitle className="text-2xl font-semibold tracking-tight">Create your account</CardTitle>
        <CardDescription>
          Join Local Service Finder as a customer or verified service provider
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
                    ? "Service provider accounts require administrator approval before becoming active."
                    : undefined
                }
              >
                <div className="grid grid-cols-2 gap-3 pt-1">
                  <button
                    type="button"
                    onClick={() => field.handleChange("CUSTOMER")}
                    className={`flex flex-col items-center justify-center gap-1.5 p-3.5 rounded-xl border text-xs font-medium transition-all ${
                      field.state.value === "CUSTOMER"
                        ? "border-primary bg-primary/10 text-primary ring-1 ring-primary shadow-sm"
                        : "border-input hover:bg-accent text-muted-foreground"
                    }`}
                  >
                    <User className="h-5 w-5" />
                    <span className="font-semibold text-sm">Customer</span>
                    <span className="text-[11px] text-muted-foreground">Book services & hire experts</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => field.handleChange("SERVICE_PROVIDER")}
                    className={`flex flex-col items-center justify-center gap-1.5 p-3.5 rounded-xl border text-xs font-medium transition-all ${
                      field.state.value === "SERVICE_PROVIDER"
                        ? "border-primary bg-primary/10 text-primary ring-1 ring-primary shadow-sm"
                        : "border-input hover:bg-accent text-muted-foreground"
                    }`}
                  >
                    <Wrench className="h-5 w-5" />
                    <span className="font-semibold text-sm">Service Provider</span>
                    <span className="text-[11px] text-muted-foreground">Offer services & get booked</span>
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
                  const res = signupBaseSchema.shape.first_name.safeParse(value);
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
                  const res = signupBaseSchema.shape.last_name.safeParse(value);
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
                const res = signupBaseSchema.shape.email.safeParse(value);
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
                const res = signupBaseSchema.shape.password.safeParse(value);
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

          {/* Confirm Password */}
          <form.Field
            name="confirm_password"
            validators={{
              onChangeListenTo: ["password"],
              onChange: ({ value, fieldApi }) => {
                if (!value) return "Please confirm your password";
                if (value !== fieldApi.form.getFieldValue("password")) {
                  return "Passwords do not match";
                }
                return undefined;
              },
            }}
          >
            {(field) => (
              <FormInput
                label="Confirm Password"
                type="password"
                required
                placeholder="Re-enter password"
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
