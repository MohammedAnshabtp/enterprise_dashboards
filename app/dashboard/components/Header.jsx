"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import { LogOut, UserRound, Search, Bell, ChevronDown } from "lucide-react";
import { getProfile } from "../../services/authServices";
import { cn } from "../../lib/cn";
import toast from "react-hot-toast";

const routeLabels = {
  "/user-visit":        "User Visit",
  "/user-profile":      "User Profile",
  "/product-catalogue": "Product Catalogue",
  "/space-category":    "Space Category",
  "/size-category":     "Size Category",
  "/product-style":     "Product Style",
  "/tile-usage":        "Tile Usage",
  "/admin-reviews":     "Admin Reviews",
  "/banners":           "Banners",
  "/products":          "Products",
  "/catalogue":         "Catalogue",
  "/wishlist-page":     "Wish List",
  "/admin-coupons":     "Admin Coupon",
  "/admin-banners":     "Admin Banner",
  "/coupon-validator":  "Coupon Validator",
  "/integrations":      "System Health",
  "/dashboard":         "Dashboard",
};

function getInitials(name) {
  if (!name) return "A";
  return name.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2);
}

export default function Header() {
  const [open, setOpen] = useState(false);
  const [profile, setProfile] = useState(null);
  const dropdownRef = useRef(null);
  const router = useRouter();
  const pathname = usePathname();
  const pageTitle = routeLabels[pathname] ?? "Dashboard";

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    getProfile()
      .then((res) => setProfile(res?.data?.data))
      .catch(() => {});
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("accessToken");
    toast.success("Logged out successfully");
    router.push("/auth/login");
  };

  const initials = getInitials(profile?.name);

  return (
    <header className="flex items-center justify-between h-16 px-6 bg-white border-b border-[#F1F5F9]">
      {/* Page title */}
      <div>
        <h1 className="text-base font-semibold text-[#0F172A] leading-tight">{pageTitle}</h1>
        <p className="text-xs text-[#94A3B8]">Angle Enterprise Admin</p>
      </div>

      {/* Right section */}
      <div className="flex items-center gap-3">
        {/* Search */}
        <div className="relative hidden sm:block">
          <Search
            size={15}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-[#94A3B8] pointer-events-none"
          />
          <input
            type="text"
            placeholder="Search anything..."
            className="h-9 w-56 pl-9 pr-3 text-sm bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl text-[#0F172A] placeholder:text-[#94A3B8] outline-none focus:border-[#6366F1] focus:ring-2 focus:ring-[#6366F1]/10 transition-all duration-150"
          />
        </div>

        {/* Notification bell */}
        <button className="relative h-9 w-9 flex items-center justify-center rounded-xl bg-[#F8FAFC] border border-[#E2E8F0] text-[#64748B] hover:bg-[#EEF2FF] hover:text-[#6366F1] hover:border-[#6366F1]/20 transition-all duration-150">
          <Bell size={16} />
          <span className="absolute top-2 right-2 w-2 h-2 rounded-full bg-[#EF4444] border-2 border-white" />
        </button>

        {/* Profile dropdown */}
        <div className="relative" ref={dropdownRef}>
          <button
            onClick={() => setOpen(!open)}
            className="flex items-center gap-2.5 h-9 pl-1 pr-2.5 rounded-xl bg-[#F8FAFC] border border-[#E2E8F0] hover:bg-[#EEF2FF] hover:border-[#6366F1]/20 transition-all duration-150"
          >
            {/* Avatar */}
            <div className="w-7 h-7 rounded-lg bg-linear-to-br from-[#6366F1] to-[#4F46E5] flex items-center justify-center text-white text-xs font-bold shrink-0 shadow-[0_2px_6px_rgb(99_102_241/0.3)]">
              {initials}
            </div>
            <div className="hidden sm:block text-left leading-tight">
              <p className="text-xs font-semibold text-[#0F172A] truncate max-w-[80px]">
                {profile?.name ?? "Admin"}
              </p>
              <p className="text-[10px] text-[#94A3B8] truncate max-w-[80px]">
                {profile?.role ?? "Admin"}
              </p>
            </div>
            <ChevronDown
              size={13}
              className={cn("text-[#94A3B8] transition-transform duration-200", open && "rotate-180")}
            />
          </button>

          {open && (
            <div className="absolute right-0 top-11 w-44 bg-white border border-[#E2E8F0] rounded-xl shadow-[0_10px_25px_-5px_rgb(0_0_0/0.12)] py-1.5 z-50 animate-[fadeInScale_0.15s_ease_both]">
              {/* Profile info */}
              <div className="px-3 py-2 border-b border-[#F1F5F9] mb-1">
                <p className="text-xs font-semibold text-[#0F172A] truncate">{profile?.name ?? "Admin"}</p>
                <p className="text-[10px] text-[#94A3B8] truncate">{profile?.email ?? ""}</p>
              </div>

              <button
                onClick={() => { setOpen(false); router.push("/user-profile"); }}
                className="w-full flex items-center gap-2 px-3 py-2 text-xs text-[#475569] hover:bg-[#F8FAFC] hover:text-[#0F172A] transition-colors"
              >
                <UserRound size={13} />
                My Profile
              </button>

              <button
                onClick={handleLogout}
                className="w-full flex items-center gap-2 px-3 py-2 text-xs text-[#EF4444] hover:bg-[#FEE2E2] transition-colors rounded-b-xl"
              >
                <LogOut size={13} />
                Log out
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
