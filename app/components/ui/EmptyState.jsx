import { cn } from "../../lib/cn";

export default function EmptyState({
  icon: Icon,
  title = "No data found",
  description = "There's nothing here yet.",
  action,
  className,
}) {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center py-16 px-6 text-center animate-[fadeIn_0.35s_ease_both]",
        className
      )}
    >
      {Icon && (
        <div className="w-14 h-14 rounded-full bg-[#EEF2FF] flex items-center justify-center mb-4">
          <Icon size={24} className="text-[#6366F1]" />
        </div>
      )}
      <h3 className="text-base font-semibold text-[#0F172A] mb-1">{title}</h3>
      <p className="text-sm text-[#64748B] max-w-xs mb-5">{description}</p>
      {action}
    </div>
  );
}
