"use client";

import * as React from "react";
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
}

export const FormInput = React.forwardRef<HTMLInputElement, FormInputProps>(
  ({ label, required, error, description, containerClassName, className, ...props }, ref) => {
    return (
      <FieldWrapper
        label={label}
        required={required}
        error={error}
        description={description}
        className={containerClassName}
      >
        <Input
          ref={ref}
          className={cn(error && "border-destructive focus-visible:ring-destructive", className)}
          {...props}
        />
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
