import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center whitespace-nowrap rounded-xl text-sm font-semibold transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 select-none active:scale-[0.98]",
  {
    variants: {
      variant: {
        // Vibrant Terracotta Primary Conversion
        default:
          "bg-[#EA580C] hover:bg-[#C2410C] text-white shadow-[0_4px_14px_0_rgba(234,88,12,0.35)] hover:shadow-[0_6px_18px_0_rgba(234,88,12,0.45)] border border-orange-500/30",
        // Deep Forest Teal Secondary Brand
        teal:
          "bg-[#115E59] hover:bg-[#0F766E] text-white shadow-[0_4px_14px_0_rgba(17,94,89,0.3)] hover:shadow-[0_6px_18px_0_rgba(17,94,89,0.4)] border border-teal-700/30",
        destructive:
          "bg-rose-600 text-white shadow-sm hover:bg-rose-700 border border-rose-500/20",
        outline:
          "border border-stone-300 dark:border-stone-700 bg-white/80 dark:bg-stone-900/80 shadow-2xs hover:bg-stone-100 hover:text-stone-900 dark:hover:bg-stone-800 text-stone-700 dark:text-stone-200",
        secondary:
          "bg-stone-100 dark:bg-stone-800 text-stone-800 dark:text-stone-100 shadow-2xs hover:bg-stone-200 dark:hover:bg-stone-700 border border-stone-200 dark:border-stone-700",
        ghost:
          "hover:bg-stone-100 dark:hover:bg-stone-800/80 text-stone-700 dark:text-stone-300 hover:text-stone-900 dark:hover:text-stone-100",
        link:
          "text-[#EA580C] underline-offset-4 hover:underline",
      },
      size: {
        default: "h-11 px-5 py-2.5",
        sm: "h-9 rounded-lg px-3.5 text-xs",
        lg: "h-12 rounded-xl px-8 text-base",
        icon: "h-10 w-10 rounded-xl",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button";
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    );
  }
);
Button.displayName = "Button";

export { Button, buttonVariants };
