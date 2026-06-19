"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { AlertTriangle, RefreshCw, LayoutDashboard } from "lucide-react";

export default function DashboardError({ error, reset }) {
  const router = useRouter();

  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="flex flex-col items-center justify-center min-h-[70vh] px-6 text-center">
      {/* Icon */}
      <div className="relative mb-6">
        <div className="w-20 h-20 rounded-3xl bg-[#FEF2F2] flex items-center justify-center">
          <AlertTriangle size={36} className="text-[#EF4444]" />
        </div>
        <div className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-[#EF4444] border-2 border-white" />
      </div>

      {/* Text */}
      <h1 className="text-2xl font-bold text-[#0F172A] mb-2">Something went wrong</h1>
      <p className="text-sm text-[#64748B] max-w-sm mb-1">
        An unexpected error occurred while loading this page.
      </p>
      {error?.message && (
        <p className="text-xs text-[#94A3B8] font-mono bg-[#F8FAFC] border border-[#E2E8F0] rounded-lg px-3 py-2 mt-2 mb-2 max-w-md break-all">
          {error.message}
        </p>
      )}

      {/* Actions */}
      <div className="flex items-center gap-3 mt-6">
        <button
          onClick={reset}
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#6366F1] text-white text-sm font-semibold hover:bg-[#4F46E5] transition-colors"
        >
          <RefreshCw size={15} />
          Try again
        </button>
        <button
          onClick={() => router.push("/dashboard")}
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-white text-[#0F172A] text-sm font-semibold border border-[#E2E8F0] hover:bg-[#F8FAFC] transition-colors"
        >
          <LayoutDashboard size={15} />
          Dashboard
        </button>
      </div>
    </div>
  );
}
