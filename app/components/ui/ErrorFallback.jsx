"use client";

import { AlertTriangle, RefreshCw } from "lucide-react";
import { Button } from "./button";

export default function ErrorFallback({
  title = "Something went wrong",
  message = "An unexpected error occurred. Please try again.",
  onRetry,
}) {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-6 text-center animate-[fadeIn_0.35s_ease_both]">
      <div className="w-14 h-14 rounded-full bg-[#FEE2E2] flex items-center justify-center mb-4">
        <AlertTriangle size={24} className="text-[#EF4444]" />
      </div>
      <h3 className="text-base font-semibold text-[#0F172A] mb-1">{title}</h3>
      <p className="text-sm text-[#64748B] max-w-xs mb-5">{message}</p>
      {onRetry && (
        <Button variant="outline" size="sm" onClick={onRetry}>
          <RefreshCw size={14} />
          Try again
        </Button>
      )}
    </div>
  );
}
