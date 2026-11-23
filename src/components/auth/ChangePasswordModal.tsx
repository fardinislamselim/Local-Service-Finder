"use client";

import * as React from "react";
import { useForm } from "@tanstack/react-form";
import { toast } from "sonner";
import { Lock, KeyRound, Loader2 } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { authService } from "@/features/auth/services/auth.service";

interface ChangePasswordModalProps {
  children?: React.ReactNode;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}

export function ChangePasswordModal({
  children,
  open: controlledOpen,
  onOpenChange: setControlledOpen,
}: ChangePasswordModalProps) {
  const [internalOpen, setInternalOpen] = React.useState(false);
  const isControlled = controlledOpen !== undefined;
  const open = isControlled ? controlledOpen : internalOpen;
  const setOpen = isControlled ? setControlledOpen! : setInternalOpen;

  const [isLoading, setIsLoading] = React.useState(false);
  const [errorMsg, setErrorMsg] = React.useState<string | null>(null);

  const form = useForm({
    defaultValues: {
      old_password: "",
      new_password: "",
      confirm_password: "",
    },
    onSubmit: async ({ value }) => {
      if (value.new_password !== value.confirm_password) {
        toast.error("New passwords do not match");
        return;
      }

      setIsLoading(true);
      setErrorMsg(null);
      try {
        await authService.changePassword({
          old_password: value.old_password,
          new_password: value.new_password,
        });

        toast.success("Password changed successfully!");
        setOpen(false);
        form.reset();
      } catch (err: any) {
        const msg = err?.message || err?.detail || "Wrong Old Password.";
        setErrorMsg(msg);
        toast.error(msg);
      } finally {
        setIsLoading(false);
      }
    },
  });

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      {children && <DialogTrigger asChild>{children}</DialogTrigger>}
      <DialogContent className="sm:max-w-md rounded-2xl p-6 bg-white dark:bg-stone-900 border-stone-200">
        <DialogHeader className="space-y-1.5 text-left">
          <div className="w-10 h-10 rounded-xl bg-orange-50 border border-orange-200 flex items-center justify-center text-orange-600 mb-2">
            <KeyRound className="h-5 w-5" />
          </div>
          <DialogTitle className="text-xl font-bold font-heading">Change Password</DialogTitle>
          <DialogDescription className="text-xs text-stone-500">
            Enter your current password and pick a new secure password.
          </DialogDescription>
        </DialogHeader>

        {errorMsg && (
          <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs">
            {errorMsg}
          </div>
        )}

        <form
          onSubmit={(e) => {
            e.preventDefault();
            e.stopPropagation();
            form.handleSubmit();
          }}
          className="space-y-4 pt-2"
        >
          <form.Field
            name="old_password"
            validators={{
              onChange: ({ value }) => (!value ? "Old password required" : undefined),
            }}
          >
            {(field) => (
              <div className="space-y-1.5">
                <Label htmlFor={field.name} className="text-xs font-bold text-stone-700">
                  Current Password
                </Label>
                <div className="relative">
                  <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-stone-400" />
                  <Input
                    id={field.name}
                    type="password"
                    placeholder="Enter old password"
                    value={field.state.value}
                    onChange={(e) => field.handleChange(e.target.value)}
                    className="pl-10 h-10 rounded-xl bg-white border-stone-200 text-sm"
                  />
                </div>
                {field.state.meta.errors ? (
                  <p className="text-[11px] text-rose-600">{field.state.meta.errors.join(", ")}</p>
                ) : null}
              </div>
            )}
          </form.Field>

          <form.Field
            name="new_password"
            validators={{
              onChange: ({ value }) =>
                !value
                  ? "New password required"
                  : value.length < 8
                  ? "At least 8 characters required"
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
                    className="pl-10 h-10 rounded-xl bg-white border-stone-200 text-sm"
                  />
                </div>
                {field.state.meta.errors ? (
                  <p className="text-[11px] text-rose-600">{field.state.meta.errors.join(", ")}</p>
                ) : null}
              </div>
            )}
          </form.Field>

          <form.Field
            name="confirm_password"
            validators={{
              onChange: ({ value }) => (!value ? "Confirm new password" : undefined),
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
                    placeholder="Re-type new password"
                    value={field.state.value}
                    onChange={(e) => field.handleChange(e.target.value)}
                    className="pl-10 h-10 rounded-xl bg-white border-stone-200 text-sm"
                  />
                </div>
                {field.state.meta.errors ? (
                  <p className="text-[11px] text-rose-600">{field.state.meta.errors.join(", ")}</p>
                ) : null}
              </div>
            )}
          </form.Field>

          <div className="pt-2 flex items-center justify-end gap-2.5">
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
              className="rounded-xl h-10 px-4 text-xs font-medium"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isLoading}
              className="rounded-xl h-10 px-5 text-xs font-bold gap-1.5"
            >
              {isLoading && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
              <span>Update Password</span>
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}

export default ChangePasswordModal;
