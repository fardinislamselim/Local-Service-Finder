import type { Metadata } from "next";
import { LoginForm } from "@/features/auth/components/login-form";

export const metadata: Metadata = {
  title: "Sign in",
  description: "Sign in to access your Local Service Finder account and bookings.",
};

export default function LoginPage() {
  return <LoginForm />;
}

