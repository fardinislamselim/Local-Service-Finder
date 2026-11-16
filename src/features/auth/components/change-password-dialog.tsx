"use client";

import * as React from "react";
import { useForm } from "@tanstack/react-form";
import { Loader2, KeyRound } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { FormInput, getFieldError } from "@/components/shared/form-field";
import { useAuth } from "../hooks/use-auth";
import { changePasswordBaseSchema } from "../schemas/auth.schema";

interface ChangePasswordDialogProps {
  children?: React.ReactNode;
}

export function ChangePasswordDialog({ children }: ChangePasswordDialogProps) {
  const [open, setOpen] = React.useState(false);
  const { changePassword, isChangingPassword } = useAuth();

  const form = useForm({
    defaultValues: {
      old_password: "",
      new_password: "",
      confirm_password: "",
    },
    onSubmit: async ({ value }) => {
      await changePassword({
        old_password: value.old_password,
        new_password: value.new_password,
      });
      form.reset();
      setOpen(false);
    },
  });

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {children || (
          <Button variant="outline" size="sm" className="gap-2">
            <KeyRound className="h-4 w-4" />
            Change Password
          </Button>
        )}
      </DialogTrigger>

      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <KeyRound className="h-5 w-5 text-primary" />
            Change Password
          </DialogTitle>
          <DialogDescription>
            Enter your current password and choose a new secure password.
          </DialogDescription>
        </DialogHeader>

        <form
          onSubmit={(e) => {
            e.preventDefault();
            e.stopPropagation();
            form.handleSubmit();
          }}
          className="space-y-4 py-2"
        >
          <form.Field
            name="old_password"
            validators={{
              onChange: ({ value }) => {
                const res = changePasswordBaseSchema.shape.old_password.safeParse(value);
                return res.success ? undefined : res.error.errors[0]?.message;
              },
            }}
          >
            {(field) => (
              <FormInput
                label="Current Password"
                type="password"
                required
                placeholder="Enter current password"
                value={field.state.value}
                onBlur={field.handleBlur}
                onChange={(e) => field.handleChange(e.target.value)}
                error={getFieldError(field.state.meta.errors)}
              />
            )}
          </form.Field>

          <form.Field
            name="new_password"
            validators={{
              onChange: ({ value }) => {
                const res = changePasswordBaseSchema.shape.new_password.safeParse(value);
                return res.success ? undefined : res.error.errors[0]?.message;
              },
            }}
          >
            {(field) => (
              <FormInput
                label="New Password"
                type="password"
                required
                placeholder="At least 6 characters"
                value={field.state.value}
                onBlur={field.handleBlur}
                onChange={(e) => field.handleChange(e.target.value)}
                error={getFieldError(field.state.meta.errors)}
                description="Must contain at least 6 characters"
              />
            )}
          </form.Field>

          <form.Field
            name="confirm_password"
            validators={{
              onChangeListenTo: ["new_password"],
              onChange: ({ value, fieldApi }) => {
                if (!value) return "Please confirm your new password";
                if (value !== fieldApi.form.getFieldValue("new_password")) {
                  return "New passwords do not match";
                }
                return undefined;
              },
            }}
          >
            {(field) => (
              <FormInput
                label="Confirm New Password"
                type="password"
                required
                placeholder="Re-enter new password"
                value={field.state.value}
                onBlur={field.handleBlur}
                onChange={(e) => field.handleChange(e.target.value)}
                error={getFieldError(field.state.meta.errors)}
              />
            )}
          </form.Field>

          <DialogFooter className="pt-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
              disabled={isChangingPassword}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isChangingPassword} className="gap-2">
              {isChangingPassword ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Updating...
                </>
              ) : (
                "Update Password"
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
