import type { Metadata } from "next";
import { RegisterForm } from "@/features/auth/components/register-form";

export const metadata: Metadata = {
  title: "Create Account",
  description: "Register for a customer, service provider, or administrator account.",
};

export default function RegisterPage() {
  return <RegisterForm />;
}

