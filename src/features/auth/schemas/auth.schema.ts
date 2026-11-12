import { z } from "zod";

export const signinSchema = z.object({
  email: z.string().min(1, "Email is required").email("Please enter a valid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

export type SigninFormValues = z.infer<typeof signinSchema>;

export const signupSchema = z.object({
  first_name: z.string().min(1, "First name is required").max(50),
  last_name: z.string().min(1, "Last name is required").max(50),
  email: z.string().min(1, "Email is required").email("Please enter a valid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  role: z.enum(["CUSTOMER", "SERVICE_PROVIDER", "ADMIN"], {
    required_error: "Please select an account type",
  }),
});

export type SignupFormValues = z.infer<typeof signupSchema>;

export const sendOtpSchema = z.object({
  email: z.string().min(1, "Email is required").email("Please enter a valid email address"),
});

export type SendOtpFormValues = z.infer<typeof sendOtpSchema>;

export const resetPasswordBaseSchema = z.object({
  email: z.string().min(1, "Email is required").email("Please enter a valid email address"),
  otp: z.string().min(4, "OTP is required").max(10, "Invalid OTP format"),
  new_password: z.string().min(6, "Password must be at least 6 characters"),
  confirm_password: z.string().min(6, "Please confirm your password"),
});

export const resetPasswordSchema = resetPasswordBaseSchema.refine(
  (data) => data.new_password === data.confirm_password,
  {
    message: "Passwords do not match",
    path: ["confirm_password"],
  }
);

export type ResetPasswordFormValues = z.infer<typeof resetPasswordSchema>;

export const changePasswordBaseSchema = z.object({
  old_password: z.string().min(1, "Current password is required"),
  new_password: z.string().min(6, "New password must be at least 6 characters"),
  confirm_password: z.string().min(6, "Please confirm your new password"),
});

export const changePasswordSchema = changePasswordBaseSchema.refine(
  (data) => data.new_password === data.confirm_password,
  {
    message: "New passwords do not match",
    path: ["confirm_password"],
  }
);

export type ChangePasswordFormValues = z.infer<typeof changePasswordSchema>;
