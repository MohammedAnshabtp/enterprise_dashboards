"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useUIStore } from "../../store/uiStore";

export default function Sidebar() {
  const pathname = usePathname();
  const { sidebarCollapsed, setSidebarCollapsed } = useUIStore();

  const menu = [
    { label: "User visit", path: "/user-visit" },
    { label: "User profile", path: "/user-profile" },
    { label: "Product catalogue", path: "/product-catalogue" },
    { label: "Space category", path: "/space-category" },
    { label: "Size category", path: "/size-category" },
    { label: "Product Style", path: "/product-style" },

    { label: "Catalogue", path: "/catalogue" },
    { label: "Wish List", path: "/wishlist-page" },
    { label: "Staff reports", path: "/staff-reports" },
    { label: "Quotations", path: "/quotations" },
    { label: "Customer reviews", path: "/customer-reviews" },
  ];

  const handleClick = () => {
    setSidebarCollapsed(true);
  };

  return (
    <div
      className={`h-full border-r border-gray-200 transition-all duration-300 ${
        sidebarCollapsed ? "w-20" : "w-64"
      }`}
    >
      {/* Header */}
      <div className="mb-8 px-4 py-3">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-full bg-purple-600 text-white flex items-center justify-center">
            A
          </div>
          {!sidebarCollapsed && (
            <div>
              <h2 className="font-semibold text-black">Angle Enterprise</h2>
              <p className="text-sm text-gray-500">Admin dashboard</p>
            </div>
          )}
        </div>
      </div>

      {/* Menu */}
      <nav className="p-4 space-y-2">
        {menu.map((item) => (
          <Link
            key={item.label}
            href={item.path}
            onClick={handleClick} // ✅ THIS CALLS THE FUNCTION
            className={`block px-4 py-2 rounded-lg ${
              pathname === item.path
                ? "bg-gray-200 text-gray-900 font-medium"
                : "text-gray-600 hover:bg-gray-100 hover:text-gray-800"
            }`}
          >
            {sidebarCollapsed ? item.label.charAt(0) : item.label}
          </Link>
        ))}
      </nav>
    </div>
  );
}
