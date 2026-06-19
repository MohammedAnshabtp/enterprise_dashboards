import { cn } from "../../lib/cn";

const variantMap = {
  default:     "bg-[#EEF2FF] text-[#4F46E5]",
  success:     "bg-[#D1FAE5] text-[#059669]",
  error:       "bg-[#FEE2E2] text-[#DC2626]",
  warning:     "bg-[#FEF3C7] text-[#D97706]",
  info:        "bg-[#DBEAFE] text-[#2563EB]",
  neutral:     "bg-[#F1F5F9] text-[#475569]",
  accent:      "bg-[#FFFBEB] text-[#D97706]",
};

export function Badge({ children, variant = "default", className, ...props }) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium",
        variantMap[variant] ?? variantMap.default,
        className
      )}
      {...props}
    >
      {children}
    </span>
  );
}
