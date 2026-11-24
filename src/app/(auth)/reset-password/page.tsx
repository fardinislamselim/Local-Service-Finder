import type { Metadata } from "next";
import { Suspense } from "react";
import { ResetPasswordForm } from "@/features/auth/components/reset-password-form";
import { AuthSplitLayout } from "@/components/auth/AuthSplitLayout";
import { Loader2 } from "lucide-react";

export const metadata: Metadata = {
  title: "Reset Password",
  description: "Reset your password with OTP verification.",
};

export default function ResetPasswordPage() {
  return (
    <AuthSplitLayout
      title="Set a new password"
      subtitle="Enter the 6-digit code sent to your email, then choose a new password."
    >
      <Suspense
        fallback={
          <div className="flex items-center justify-center p-8">
            <Loader2 className="h-6 w-6 animate-spin text-stone-400" />
          </div>
        }
      >
        <ResetPasswordForm />
      </Suspense>
    </AuthSplitLayout>
  );
}
