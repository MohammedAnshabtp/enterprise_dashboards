"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Users,
  UserCircle,
  Package,
  LayoutGrid,
  Ruler,
  Palette,
  Grid3x3,
  Star,
  Image,
  ShoppingBag,
  BookOpen,
  Heart,
  Tag,
  Megaphone,
  QrCode,
  Activity,
  ChevronLeft,
  ChevronRight,
  Layers,
} from "lucide-react";
import { useUIStore } from "../../store/uiStore";
import { cn } from "../../lib/cn";

const menu = [
  { label: "User Visit",        path: "/dashboard/user-visit",        icon: Users },
  { label: "User Profile",      path: "/dashboard/user-profile",      icon: UserCircle },
  { label: "Product Catalogue", path: "/dashboard/product-catalogue", icon: Package },
  { label: "Space Category",    path: "/dashboard/space-category",    icon: LayoutGrid },
  { label: "Size Category",     path: "/dashboard/size-category",     icon: Ruler },
  { label: "Product Style",     path: "/dashboard/product-style",     icon: Palette },
  { label: "Tile Usage",        path: "/dashboard/tile-usage",        icon: Grid3x3 },
  { label: "Admin Reviews",     path: "/dashboard/admin-reviews",     icon: Star },
  { label: "Banners",           path: "/dashboard/banners",           icon: Image },
  { label: "Products",          path: "/dashboard/products",          icon: ShoppingBag },
  { label: "Catalogue",         path: "/dashboard/catalogue",         icon: BookOpen },
  { label: "Wish List",         path: "/dashboard/wishlist-page",     icon: Heart },
  { label: "Admin Coupon",      path: "/dashboard/admin-coupons",     icon: Tag },
  { label: "Admin Banner",      path: "/dashboard/admin-banners",     icon: Megaphone },
  { label: "Coupon Validator",  path: "/dashboard/coupon-validator",  icon: QrCode },
  { label: "System Health",     path: "/dashboard/integrations",      icon: Activity },
];

export default function Sidebar() {
  const pathname = usePathname();
  const { sidebarCollapsed, setSidebarCollapsed } = useUIStore();

  return (
    <div
      className={cn(
        "h-full flex flex-col bg-[#0F172A] text-[#94A3B8] transition-all duration-300 ease-in-out",
        sidebarCollapsed ? "w-20" : "w-64"
      )}
      style={{ boxShadow: "4px 0 24px 0 rgb(0 0 0 / 0.15)" }}
    >
      {/* Logo */}
      <div className="flex items-center gap-3 px-4 py-5 border-b border-[#1E293B] shrink-0">
        <div className="w-9 h-9 rounded-xl bg-linear-to-br from-[#6366F1] to-[#4F46E5] flex items-center justify-center shrink-0 shadow-[0_4px_12px_rgb(99_102_241/0.4)]">
          <Layers size={18} className="text-white" />
        </div>
        {!sidebarCollapsed && (
          <div className="overflow-hidden animate-[slideInLeft_0.2s_ease_both]">
            <p className="text-sm font-bold text-white leading-tight truncate">Angle Enterprise</p>
            <p className="text-[10px] text-[#475569] truncate">Admin Dashboard</p>
          </div>
        )}
      </div>

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-0.5">
        {menu.map((item) => {
          const Icon = item.icon;
          const active = pathname === item.path;
          return (
            <Link
              key={item.path}
              href={item.path}
              title={sidebarCollapsed ? item.label : undefined}
              className={cn(
                "flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-150 group relative cursor-pointer",
                active
                  ? "bg-linear-to-r from-[#6366F1]/20 to-[#6366F1]/5 text-white border border-[#6366F1]/25"
                  : "text-[#64748B] hover:bg-[#1E293B] hover:text-[#CBD5E1]"
              )}
            >
              <Icon
                size={17}
                className={cn(
                  "shrink-0 transition-colors duration-150",
                  active ? "text-[#818CF8]" : "text-[#475569] group-hover:text-[#94A3B8]"
                )}
              />
              {!sidebarCollapsed && (
                <span className="truncate animate-[slideInLeft_0.15s_ease_both]">
                  {item.label}
                </span>
              )}
              {active && (
                <span className="absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-5 bg-[#6366F1] rounded-r-full" />
              )}
            </Link>
          );
        })}
      </nav>

      {/* Collapse toggle */}
      <div className="px-3 py-4 border-t border-[#1E293B] shrink-0">
        <button
          onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
          className="w-full flex items-center justify-center gap-2 px-3 py-2.5 rounded-xl text-[#475569] hover:bg-[#1E293B] hover:text-[#94A3B8] transition-all duration-150 text-sm font-medium cursor-pointer"
        >
          {sidebarCollapsed ? <ChevronRight size={16} /> : (
            <>
              <ChevronLeft size={16} />
              <span className="animate-[slideInLeft_0.15s_ease_both]">Collapse</span>
            </>
          )}
        </button>
      </div>
    </div>
  );
}
