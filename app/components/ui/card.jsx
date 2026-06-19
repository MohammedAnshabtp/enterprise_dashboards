import { cn } from "../../lib/cn";

export function Card({ className, children, ...props }) {
  return (
    <div
      className={cn(
        "bg-white rounded-[0.875rem] border border-[#F1F5F9] shadow-[0_2px_8px_0_rgb(99_102_241/0.06),0_1px_3px_0_rgb(0_0_0/0.08)]",
        "transition-shadow duration-200 hover:shadow-[0_4px_12px_0_rgb(0_0_0/0.1)]",
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}

export function CardHeader({ className, ...props }) {
  return <div className={cn("px-5 pt-5 pb-4 border-b border-[#F1F5F9]", className)} {...props} />;
}

export function CardTitle({ className, ...props }) {
  return (
    <h3
      className={cn("text-base font-semibold text-[#0F172A] tracking-tight", className)}
      {...props}
    />
  );
}

export function CardContent({ className, ...props }) {
  return <div className={cn("p-5", className)} {...props} />;
}

export function CardFooter({ className, ...props }) {
  return (
    <div
      className={cn("px-5 py-4 border-t border-[#F1F5F9] flex items-center gap-3", className)}
      {...props}
    />
  );
}
