"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useForm } from "@tanstack/react-form";
import { toast } from "sonner";
import { Mail, Lock, KeyRound, ArrowRight, ArrowLeft, Loader2, Clock, CheckCircle2, AlertCircle } from "lucide-react";
import { AuthSplitLayout } from "@/components/auth/AuthSplitLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { authService } from "@/features/auth/services/auth.service";

export default function ForgotPasswordPage() {
  const router = useRouter();

  const [step, setStep] = React.useState<1 | 2>(1);
  const [email, setEmail] = React.useState("");
  const [isLoading, setIsLoading] = React.useState(false);
  const [timeLeft, setTimeLeft] = React.useState(300); // 5 minutes in seconds
  const [timerActive, setTimerActive] = React.useState(false);
  const [errorMessage, setErrorMessage] = React.useState<string | null>(null);

  // Countdown timer for 5:00 minutes
  React.useEffect(() => {
    let interval: NodeJS.Timeout;
    if (timerActive && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft((prev) => prev - 1);
      }, 1000);
    } else if (timeLeft === 0) {
      setTimerActive(false);
    }
    return () => clearInterval(interval);
  }, [timerActive, timeLeft]);

  const formatTimer = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs < 10 ? "0" : ""}${secs}`;
  };

  // STEP 1 Form: Send OTP
  const stepOneForm = useForm({
    defaultValues: { email: "" },
    onSubmit: async ({ value }) => {
      setIsLoading(true);
      setErrorMessage(null);
      try {
        await authService.sendOtp({ email: value.email.trim() });
        setEmail(value.email.trim());
        setStep(2);
        setTimeLeft(300);
        setTimerActive(true);
        toast.success("6-digit verification OTP sent to your email!");
      } catch (err: any) {
        const msg = err?.message || err?.detail || "Could not send OTP. Please check your email.";
        setErrorMessage(msg);
        toast.error(msg);
      } finally {
        setIsLoading(false);
      }
    },
  });

  // STEP 2 Form: Verify OTP & Reset Password
  const stepTwoForm = useForm({
    defaultValues: {
      otp: "",
      new_password: "",
      confirm_password: "",
    },
    onSubmit: async ({ value }) => {
      if (value.new_password !== value.confirm_password) {
        toast.error("Passwords do not match");
        return;
      }

      setIsLoading(true);
      setErrorMessage(null);
      try {
        await authService.resetPassword({
          email,
          otp: value.otp.trim(),
          new_password: value.new_password,
        });

        toast.success("Password reset successful! You can now log in.");
        router.push("/login");
      } catch (err: any) {
        const msg = err?.message || err?.detail || "Password reset failed. Invalid or expired OTP.";
        setErrorMessage(msg);
        toast.error(msg);
      } finally {
        setIsLoading(false);
      }
    },
  });

  const handleResendOtp = async () => {
    if (!email) return;
    setIsLoading(true);
    setErrorMessage(null);
    try {
      await authService.sendOtp({ email });
      setTimeLeft(300);
      setTimerActive(true);
      toast.success("New OTP code has been sent!");
    } catch (err: any) {
      toast.error(err?.message || "Failed to resend OTP.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AuthSplitLayout
      title={step === 1 ? "Reset your password" : "Enter Verification OTP"}
      subtitle={
        step === 1
          ? "Enter your registered email and we will send a 6-digit OTP code."
          : `We sent a 6-digit code to ${email}. The code expires in 5 minutes.`
      }
    >
      {/* 2-Step Stepper Indicator */}
      <div className="flex items-center gap-2 mb-6">
        <div
          className={`flex-1 h-1.5 rounded-full transition-colors ${
            step >= 1 ? "bg-orange-600" : "bg-stone-200"
          }`}
        />
        <div
          className={`flex-1 h-1.5 rounded-full transition-colors ${
            step === 2 ? "bg-orange-600" : "bg-stone-200"
          }`}
        />
      </div>

      {errorMessage && (
        <div className="mb-5 p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-center gap-2">
          <AlertCircle className="h-4 w-4 shrink-0 text-rose-600" />
          <span>{errorMessage}</span>
        </div>
      )}

      {step === 1 ? (
        /* STEP 1: Send OTP */
        <form
          onSubmit={(e) => {
            e.preventDefault();
            e.stopPropagation();
            stepOneForm.handleSubmit();
          }}
          className="space-y-4"
        >
          <stepOneForm.Field
            name="email"
            validators={{
              onChange: ({ value }) => (!value ? "Email is required" : undefined),
            }}
          >
            {(field) => (
              <div className="space-y-1.5">
                <Label htmlFor={field.name} className="text-xs font-bold text-stone-700">
                  Registered Email Address
                </Label>
                <div className="relative">
                  <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-stone-400" />
                  <Input
                    id={field.name}
                    type="email"
                    placeholder="reza@example.com"
                    value={field.state.value}
                    onChange={(e) => field.handleChange(e.target.value)}
                    className="pl-10 h-11 rounded-xl bg-white border-stone-200 text-sm"
                  />
                </div>
                {field.state.meta.errors ? (
                  <p className="text-[11px] text-rose-600">{field.state.meta.errors.join(", ")}</p>
                ) : null}
              </div>
            )}
          </stepOneForm.Field>

          <Button type="submit" disabled={isLoading} className="w-full h-11 font-bold shadow-md gap-2">
            {isLoading ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                <span>Sending OTP Code...</span>
              </>
            ) : (
              <>
                <span>Send Verification OTP</span>
                <ArrowRight className="h-4 w-4" />
              </>
            )}
          </Button>

          <div className="pt-4 text-center">
            <Link
              href="/login"
              className="text-xs font-semibold text-stone-600 hover:text-stone-900 inline-flex items-center gap-1"
            >
              <ArrowLeft className="h-3.5 w-3.5" />
              <span>Back to Sign In</span>
            </Link>
          </div>
        </form>
      ) : (
        /* STEP 2: Verify OTP & Set New Password */
        <form
          onSubmit={(e) => {
            e.preventDefault();
            e.stopPropagation();
            stepTwoForm.handleSubmit();
          }}
          className="space-y-4"
        >
          {/* Live Timer Pill */}
          <div className="flex items-center justify-between p-3 rounded-xl bg-stone-100 border border-stone-200 text-xs">
            <div className="flex items-center gap-1.5 text-stone-700">
              <Clock className="h-4 w-4 text-orange-600" />
              <span>OTP Expiration:</span>
              <span className="font-bold text-stone-900 tabular-nums">
                {formatTimer(timeLeft)}
              </span>
            </div>
            <button
              type="button"
              onClick={handleResendOtp}
              disabled={timeLeft > 0 || isLoading}
              className={`font-bold transition-colors ${
                timeLeft === 0
                  ? "text-orange-600 hover:text-orange-700 cursor-pointer"
                  : "text-stone-400 cursor-not-allowed"
              }`}
            >
              Resend Code
            </button>
          </div>

          <stepTwoForm.Field
            name="otp"
            validators={{
              onChange: ({ value }) => (!value ? "OTP is required" : undefined),
            }}
          >
            {(field) => (
              <div className="space-y-1.5">
                <Label htmlFor={field.name} className="text-xs font-bold text-stone-700">
                  6-Digit OTP Code
                </Label>
                <div className="relative">
                  <KeyRound className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-stone-400" />
                  <Input
                    id={field.name}
                    placeholder="123456"
                    maxLength={6}
                    value={field.state.value}
                    onChange={(e) => field.handleChange(e.target.value)}
                    className="pl-10 h-11 rounded-xl bg-white border-stone-200 text-center tracking-widest font-mono text-base font-bold"
                  />
                </div>
                {field.state.meta.errors ? (
                  <p className="text-[11px] text-rose-600">{field.state.meta.errors.join(", ")}</p>
                ) : null}
              </div>
            )}
          </stepTwoForm.Field>

          <stepTwoForm.Field
            name="new_password"
            validators={{
              onChange: ({ value }) =>
                !value
                  ? "Password is required"
                  : value.length < 8
                  ? "Minimum 8 characters"
                  : undefined,
            }}
          >
            {(field) => (
              <div className="space-y-1.5">
                <Label htmlFor={field.name} className="text-xs font-bold text-stone-700">
                  New Password
                </Label>
                <div className="relative">
                  <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-stone-400" />
                  <Input
                    id={field.name}
                    type="password"
                    placeholder="Min 8 characters"
                    value={field.state.value}
                    onChange={(e) => field.handleChange(e.target.value)}
                    className="pl-10 h-11 rounded-xl bg-white border-stone-200 text-sm"
                  />
                </div>
                {field.state.meta.errors ? (
                  <p className="text-[11px] text-rose-600">{field.state.meta.errors.join(", ")}</p>
                ) : null}
              </div>
            )}
          </stepTwoForm.Field>

          <stepTwoForm.Field
            name="confirm_password"
            validators={{
              onChange: ({ value }) => (!value ? "Confirm password" : undefined),
            }}
          >
            {(field) => (
              <div className="space-y-1.5">
                <Label htmlFor={field.name} className="text-xs font-bold text-stone-700">
                  Confirm New Password
                </Label>
                <div className="relative">
                  <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-stone-400" />
                  <Input
                    id={field.name}
                    type="password"
                    placeholder="Re-enter password"
                    value={field.state.value}
                    onChange={(e) => field.handleChange(e.target.value)}
                    className="pl-10 h-11 rounded-xl bg-white border-stone-200 text-sm"
                  />
                </div>
                {field.state.meta.errors ? (
                  <p className="text-[11px] text-rose-600">{field.state.meta.errors.join(", ")}</p>
                ) : null}
              </div>
            )}
          </stepTwoForm.Field>

          <Button type="submit" disabled={isLoading} className="w-full h-11 font-bold shadow-md gap-2">
            {isLoading ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                <span>Resetting Password...</span>
              </>
            ) : (
              <>
                <span>Update Password</span>
                <ArrowRight className="h-4 w-4" />
              </>
            )}
          </Button>

          <div className="pt-2 text-center">
            <button
              type="button"
              onClick={() => setStep(1)}
              className="text-xs font-semibold text-stone-500 hover:text-stone-800 transition-colors"
            >
              Change email address
            </button>
          </div>
        </form>
      )}
    </AuthSplitLayout>
  );
}
