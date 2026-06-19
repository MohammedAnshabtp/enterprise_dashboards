"use client";

import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva } from "class-variance-authority";
import { cn } from "../../lib/cn";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-[0.625rem] text-sm font-medium transition-all duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 active:scale-[0.97] cursor-pointer select-none",
  {
    variants: {
      variant: {
        default:
          "bg-[#6366F1] text-white shadow-[0_2px_8px_0_rgb(99_102_241/0.3)] hover:bg-[#4F46E5] hover:shadow-[0_4px_12px_0_rgb(99_102_241/0.4)] focus-visible:ring-[#6366F1]",
        accent:
          "bg-[#F59E0B] text-white shadow-[0_2px_8px_0_rgb(245_158_11/0.3)] hover:bg-[#D97706] focus-visible:ring-[#F59E0B]",
        outline:
          "border-[1.5px] border-[#6366F1] text-[#6366F1] bg-transparent hover:bg-[#EEF2FF] focus-visible:ring-[#6366F1]",
        ghost:
          "text-[#475569] bg-transparent hover:bg-[#F1F5F9] hover:text-[#0F172A] focus-visible:ring-[#94A3B8]",
        destructive:
          "bg-[#EF4444] text-white hover:bg-[#DC2626] shadow-[0_2px_8px_0_rgb(239_68_68/0.25)] focus-visible:ring-[#EF4444]",
        secondary:
          "bg-[#F1F5F9] text-[#475569] hover:bg-[#E2E8F0] hover:text-[#0F172A] focus-visible:ring-[#94A3B8]",
        link: "text-[#6366F1] underline-offset-4 hover:underline focus-visible:ring-[#6366F1] p-0 h-auto shadow-none",
      },
      size: {
        default: "h-9 px-4 py-2",
        sm: "h-8 rounded-[0.5rem] px-3 text-xs",
        lg: "h-11 rounded-[0.75rem] px-6 text-base",
        xl: "h-12 rounded-[0.875rem] px-8 text-base",
        icon: "h-9 w-9 p-0",
        "icon-sm": "h-8 w-8 p-0 rounded-[0.5rem]",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
);

const Button = React.forwardRef(function Button(
  { className, variant, size, asChild = false, children, ...props },
  ref
) {
  const Comp = asChild ? Slot : "button";
  return (
    <Comp
      ref={ref}
      className={cn(buttonVariants({ variant, size, className }))}
      {...props}
    >
      {children}
    </Comp>
  );
});
Button.displayName = "Button";

export { Button, buttonVariants };
