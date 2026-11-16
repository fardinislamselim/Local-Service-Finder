"use client";

import * as React from "react";
import { Eye, EyeOff } from "lucide-react";
import { Label } from "@/components/ui/label";
import { Input, type InputProps } from "@/components/ui/input";
import { Textarea, type TextareaProps } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";

export function getFieldError(errors: unknown): string | undefined {
  if (!errors) return undefined;
  if (Array.isArray(errors)) {
    if (errors.length === 0) return undefined;
    const first = errors[0];
    if (typeof first === "string") return first;
    if (first && typeof first === "object" && "message" in first) {
      return String((first as any).message);
    }
    return String(first);
  }
  if (typeof errors === "string") return errors;
  if (typeof errors === "object" && "message" in errors) {
    return String((errors as any).message);
  }
  return undefined;
}

interface FieldWrapperProps {
  label?: string;
  required?: boolean;
  error?: string | null;
  description?: string;
  className?: string;
  children: React.ReactNode;
}

export function FieldWrapper({
  label,
  required,
  error,
  description,
  className,
  children,
}: FieldWrapperProps) {
  return (
    <div className={cn("space-y-1.5", className)}>
      {label && (
        <Label className="text-sm font-medium flex items-center gap-1">
          {label}
          {required && <span className="text-destructive">*</span>}
        </Label>
      )}
      {children}
      {description && !error && (
        <p className="text-xs text-muted-foreground">{description}</p>
      )}
      {error && (
        <p className="text-xs font-medium text-destructive animate-in fade-in-50 duration-150">
          {error}
        </p>
      )}
    </div>
  );
}

interface FormInputProps extends InputProps {
  label?: string;
  required?: boolean;
  error?: string | null;
  description?: string;
  containerClassName?: string;
  showPasswordToggle?: boolean;
}

export const FormInput = React.forwardRef<HTMLInputElement, FormInputProps>(
  (
    {
      label,
      required,
      error,
      description,
      containerClassName,
      className,
      type,
      showPasswordToggle,
      ...props
    },
    ref
  ) => {
    const isPassword = type === "password";
    const [showPassword, setShowPassword] = React.useState(false);
    const allowToggle = showPasswordToggle ?? isPassword;

    const inputType = isPassword && allowToggle ? (showPassword ? "text" : "password") : type;

    return (
      <FieldWrapper
        label={label}
        required={required}
        error={error}
        description={description}
        className={containerClassName}
      >
        <div className="relative">
          <Input
            ref={ref}
            type={inputType}
            className={cn(
              error && "border-destructive focus-visible:ring-destructive",
              isPassword && allowToggle && "pr-10",
              className
            )}
            {...props}
          />
          {isPassword && allowToggle && (
            <button
              type="button"
              tabIndex={-1}
              onClick={() => setShowPassword((prev) => !prev)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground focus:outline-none focus:text-foreground transition-colors p-1 rounded-sm"
              aria-label={showPassword ? "Hide password" : "Show password"}
            >
              {showPassword ? (
                <EyeOff className="h-4 w-4" />
              ) : (
                <Eye className="h-4 w-4" />
              )}
            </button>
          )}
        </div>
      </FieldWrapper>
    );
  }
);
FormInput.displayName = "FormInput";

interface FormTextareaProps extends TextareaProps {
  label?: string;
  required?: boolean;
  error?: string | null;
  description?: string;
  containerClassName?: string;
}

export const FormTextarea = React.forwardRef<HTMLTextAreaElement, FormTextareaProps>(
  ({ label, required, error, description, containerClassName, className, ...props }, ref) => {
    return (
      <FieldWrapper
        label={label}
        required={required}
        error={error}
        description={description}
        className={containerClassName}
      >
        <Textarea
          ref={ref}
          className={cn(error && "border-destructive focus-visible:ring-destructive", className)}
          {...props}
        />
      </FieldWrapper>
    );
  }
);
FormTextarea.displayName = "FormTextarea";
