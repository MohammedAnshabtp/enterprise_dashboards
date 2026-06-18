import * as React from "react";
import { cn } from "../../lib/cn";

const Input = React.forwardRef(function Input(
  { className, type = "text", ...props },
  ref
) {
  return (
    <input
      ref={ref}
      type={type}
      className={cn(
        "flex h-9 w-full rounded-[0.625rem] border border-[#E2E8F0] bg-white px-3 py-2 text-sm text-[#0F172A] placeholder:text-[#94A3B8]",
        "transition-colors duration-150 outline-none",
        "focus:border-[#6366F1] focus:ring-2 focus:ring-[#6366F1]/15",
        "disabled:cursor-not-allowed disabled:bg-[#F8FAFC] disabled:opacity-60",
        "file:border-0 file:bg-transparent file:text-sm file:font-medium",
        className
      )}
      {...props}
    />
  );
});
Input.displayName = "Input";

export { Input };
