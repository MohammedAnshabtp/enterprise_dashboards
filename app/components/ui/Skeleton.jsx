import { cn } from "../../lib/cn";

export function Skeleton({ className, ...props }) {
  return (
    <div
      className={cn(
        "rounded-lg bg-linear-to-r from-[#E2E8F0] via-[#F1F5F9] to-[#E2E8F0] bg-size-[200%_100%] animate-[shimmer_1.5s_infinite]",
        className
      )}
      aria-hidden="true"
      {...props}
    />
  );
}

export function StatCardSkeleton() {
  return (
    <div className="bg-white rounded-[0.875rem] border border-[#F1F5F9] p-5 space-y-3 shadow-sm">
      <Skeleton className="h-4 w-24" />
      <Skeleton className="h-8 w-32" />
      <Skeleton className="h-3 w-16" />
    </div>
  );
}

export function TableRowSkeleton({ cols = 5 }) {
  return (
    <tr>
      {Array.from({ length: cols }).map((_, i) => (
        <td key={i} className="px-4 py-3">
          <Skeleton className="h-4 w-4/5" />
        </td>
      ))}
    </tr>
  );
}

export function CardSkeleton() {
  return (
    <div className="bg-white rounded-[0.875rem] border border-[#F1F5F9] p-5 space-y-3 shadow-sm">
      <div className="flex items-center gap-3">
        <Skeleton className="w-10 h-10 rounded-full" />
        <div className="flex-1 space-y-2">
          <Skeleton className="h-4 w-3/4" />
          <Skeleton className="h-3 w-1/2" />
        </div>
      </div>
      <Skeleton className="h-3 w-full" />
      <Skeleton className="h-3 w-5/6" />
    </div>
  );
}
