import type { Metadata } from "next";
import { RegisterForm } from "@/features/auth/components/register-form";

export const metadata: Metadata = {
  title: "Create Account",
  description: "Register for a customer or verified service provider account on Local Service Finder.",
};

export default function RegisterPage() {
  return <RegisterForm />;
}

