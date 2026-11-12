import type { Metadata } from "next";
import { Suspense } from "react";
import { ResetPasswordForm } from "@/features/auth/components/reset-password-form";
import { Skeleton } from "@/components/ui/skeleton";

export const metadata: Metadata = {
  title: "Reset Password",
  description: "Reset your password with OTP verification.",
};

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={<Skeleton className="w-full max-w-md h-96 rounded-xl" />}>
      <ResetPasswordForm />
    </Suspense>
  );
}

