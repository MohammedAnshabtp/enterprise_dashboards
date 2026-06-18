import { cn } from "../../lib/cn";

export function Table({ className, ...props }) {
  return (
    <div className="w-full overflow-x-auto rounded-[0.875rem] border border-[#E2E8F0]">
      <table
        className={cn("w-full border-collapse text-sm", className)}
        {...props}
      />
    </div>
  );
}

export function TableHeader({ className, ...props }) {
  return (
    <thead
      className={cn("bg-[#F8FAFC] border-b border-[#E2E8F0]", className)}
      {...props}
    />
  );
}

export function TableBody({ className, ...props }) {
  return <tbody className={cn("divide-y divide-[#F1F5F9]", className)} {...props} />;
}

export function TableRow({ className, ...props }) {
  return (
    <tr
      className={cn("transition-colors duration-100 hover:bg-[#F8FAFC]", className)}
      {...props}
    />
  );
}

export function TableHead({ className, ...props }) {
  return (
    <th
      className={cn(
        "px-4 py-3 text-left text-xs font-semibold text-[#64748B] uppercase tracking-wide whitespace-nowrap",
        className
      )}
      {...props}
    />
  );
}

export function TableCell({ className, ...props }) {
  return (
    <td
      className={cn("px-4 py-3 text-[#0F172A] align-middle", className)}
      {...props}
    />
  );
}
