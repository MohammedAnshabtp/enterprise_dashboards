"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Users,
  UserCircle,
  Package,
  Star,
  Image,
  ShoppingBag,
  BookOpen,
  Tag,
  Megaphone,
  Activity,
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  Layers,
  Plus,
  History,
} from "lucide-react";
import { useUIStore } from "../../store/uiStore";
import { cn } from "../../lib/cn";

const menu = [
  { label: "Users",         path: "/dashboard/user-visit",        icon: Users },
  { label: "Account",        path: "/dashboard/user-profile",      icon: UserCircle },
  {
    label: "Products",
    path: "/dashboard/product-catalogue",
    icon: Package,
    children: [
      { label: "Add Product",         path: "/dashboard/product-catalogue/add",          icon: Plus },
      { label: "Bulk Upload History", path: "/dashboard/product-catalogue/bulk-upload",  icon: History },
    ],
  },
  { label: "Categories",    path: "/dashboard/categories",        icon: Layers },
  { label: "Reviews",       path: "/dashboard/admin-reviews",     icon: Star },
  { label: "Catalogue",     path: "/dashboard/catalogue",         icon: BookOpen },
  { label: "Banners",       path: "/dashboard/admin-banners",     icon: Megaphone },
  { label: "Coupons",       path: "/dashboard/admin-coupons",     icon: Tag },
  { label: "System Health", path: "/dashboard/integrations",      icon: Activity },
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
            <p className="text-sm font-bold text-white leading-tight truncate">AR Enterprise</p>
            <p className="text-[10px] text-[#475569] truncate">Admin Dashboard</p>
          </div>
        )}
      </div>

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-0.5">
        {menu.map((item) => {
          const Icon = item.icon;
          const isParentSection = item.children
            ? pathname.startsWith(item.path)
            : false;
          const active = item.children ? false : pathname === item.path;
          const childActive = item.children?.some((c) => pathname === c.path || pathname.startsWith(c.path + "/"));

          return (
            <div key={item.path}>
              <Link
                href={item.path}
                title={sidebarCollapsed ? item.label : undefined}
                className={cn(
                  "flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-150 group relative cursor-pointer",
                  active || isParentSection
                    ? "bg-linear-to-r from-[#6366F1]/20 to-[#6366F1]/5 text-white border border-[#6366F1]/25"
                    : "text-[#64748B] hover:bg-[#1E293B] hover:text-[#CBD5E1]"
                )}
              >
                <Icon
                  size={17}
                  className={cn(
                    "shrink-0 transition-colors duration-150",
                    active || isParentSection ? "text-[#818CF8]" : "text-[#475569] group-hover:text-[#94A3B8]"
                  )}
                />
                {!sidebarCollapsed && (
                  <span className="flex-1 truncate animate-[slideInLeft_0.15s_ease_both]">
                    {item.label}
                  </span>
                )}
                {!sidebarCollapsed && item.children && (
                  <ChevronDown
                    size={13}
                    className={cn(
                      "shrink-0 transition-transform duration-200 text-[#475569]",
                      isParentSection && "rotate-180 text-[#818CF8]"
                    )}
                  />
                )}
                {(active || isParentSection) && (
                  <span className="absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-5 bg-[#6366F1] rounded-r-full" />
                )}
              </Link>

              {/* Sub-items */}
              {item.children && !sidebarCollapsed && (
                <div
                  className={cn(
                    "grid transition-[grid-template-rows] duration-300 ease-in-out",
                    isParentSection ? "grid-rows-[1fr]" : "grid-rows-[0fr]"
                  )}
                >
                  <div className="overflow-hidden">
                    <div className="ml-4 mt-0.5 mb-0.5 pl-3 border-l border-[#1E293B] space-y-0.5">
                      {item.children.map((child) => {
                        const ChildIcon = child.icon;
                        const childIsActive = pathname === child.path || pathname.startsWith(child.path + "/");
                        return (
                          <Link
                            key={child.path}
                            href={child.path}
                            className={cn(
                              "flex items-center gap-2.5 px-2.5 py-2 rounded-lg text-xs font-medium transition-all duration-150 group cursor-pointer",
                              childIsActive
                                ? "bg-[#6366F1]/15 text-[#A5B4FC]"
                                : "text-[#475569] hover:bg-[#1E293B] hover:text-[#94A3B8]"
                            )}
                          >
                            <ChildIcon
                              size={13}
                              className={cn(
                                "shrink-0",
                                childIsActive ? "text-[#818CF8]" : "text-[#374155] group-hover:text-[#64748B]"
                              )}
                            />
                            <span className="truncate animate-[slideInLeft_0.15s_ease_both]">
                              {child.label}
                            </span>
                          </Link>
                        );
                      })}
                    </div>
                  </div>
                </div>
              )}
            </div>
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
