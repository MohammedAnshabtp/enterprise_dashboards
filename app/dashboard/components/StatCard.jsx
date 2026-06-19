"use client";

import { TrendingUp, TrendingDown, Users, Activity, DollarSign, IndianRupee, Package, ShoppingBag, Star, Eye, BarChart2 } from "lucide-react";
import { cn } from "../../lib/cn";

const iconMap = {
  Users, Activity, DollarSign, IndianRupee, Package, ShoppingBag, Star, Eye, BarChart2,
};

const colorSchemes = {
  indigo: {
    iconBg: "bg-[#EEF2FF]",
    iconColor: "text-[#6366F1]",
    changeBg: "bg-[#D1FAE5]",
    changeColor: "text-[#059669]",
    border: "border-[#E0E7FF]",
    accent: "bg-[#6366F1]",
  },
  amber: {
    iconBg: "bg-[#FFFBEB]",
    iconColor: "text-[#F59E0B]",
    changeBg: "bg-[#D1FAE5]",
    changeColor: "text-[#059669]",
    border: "border-[#FEF3C7]",
    accent: "bg-[#F59E0B]",
  },
  emerald: {
    iconBg: "bg-[#D1FAE5]",
    iconColor: "text-[#10B981]",
    changeBg: "bg-[#D1FAE5]",
    changeColor: "text-[#059669]",
    border: "border-[#A7F3D0]",
    accent: "bg-[#10B981]",
  },
  rose: {
    iconBg: "bg-[#FEE2E2]",
    iconColor: "text-[#EF4444]",
    changeBg: "bg-[#FEE2E2]",
    changeColor: "text-[#DC2626]",
    border: "border-[#FECACA]",
    accent: "bg-[#EF4444]",
  },
};

export default function StatCard({ label, value, change, iconKey, color = "indigo", subtitle }) {
  const scheme = colorSchemes[color] ?? colorSchemes.indigo;
  const isPositive = change?.startsWith("+");
  const TrendIcon = isPositive ? TrendingUp : TrendingDown;
  const Icon = iconMap[iconKey] ?? null;

  return (
    <div
      className={cn(
        "relative bg-white rounded-[0.875rem] border p-5 overflow-hidden",
        "transition-all duration-200 hover:shadow-[0_8px_24px_-4px_rgb(0_0_0/0.1)] hover:-translate-y-0.5",
        "shadow-[0_2px_8px_0_rgb(0_0_0/0.06)]",
        scheme.border
      )}
    >
      <div className={cn("absolute top-0 left-0 right-0 h-0.5", scheme.accent)} />

      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          <p className="text-xs font-medium text-[#64748B] uppercase tracking-wide mb-2">{label}</p>
          <p className="text-2xl font-bold text-[#0F172A] tracking-tight leading-none mb-2">{value}</p>
          {subtitle && <p className="text-xs text-[#94A3B8] truncate">{subtitle}</p>}
        </div>

        {Icon && (
          <div className={cn("w-10 h-10 rounded-xl flex items-center justify-center shrink-0", scheme.iconBg)}>
            <Icon size={18} className={scheme.iconColor} />
          </div>
        )}
      </div>

      {change && (
        <div className="mt-3 flex items-center gap-1.5">
          <span
            className={cn(
              "inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium",
              isPositive ? "bg-[#D1FAE5] text-[#059669]" : "bg-[#FEE2E2] text-[#DC2626]"
            )}
          >
            <TrendIcon size={11} />
            {change}
          </span>
          <span className="text-xs text-[#94A3B8]">vs last week</span>
        </div>
      )}
    </div>
  );
}
