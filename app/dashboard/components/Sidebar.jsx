"use client";
import { useUIStore } from "../../store/uiStore";
export default function Sidebar() {
  const { activeMenu, setActiveMenu, sidebarCollapsed } = useUIStore();
  const menu = [
    { label: "User visit", link: "/user-visit" },
    { label: "Product catalog", link: "/product-catalog" },
    { label: "Price list", link: "/price-list" },
    { label: "Product adding / updating / deleting", link: "/product-crud" },
    { label: "Sale report", link: "/sale-report" },
    { label: "Staff reports", link: "/staff-reports" },
    { label: "Quotations", link: "/quotations" },
    { label: "Customer reviews", link: "/customer-reviews" },
  ];

  return (
    <div
      className={`h-full border-r border-gray-200 transition-all duration-300 ${
        sidebarCollapsed ? "w-20" : "w-64"
      }`}
    >
      <div className="mb-8 px-4 py-3">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-full bg-purple-600 text-white flex items-center justify-center">
            A
          </div>
          <div>
            <h2 className="font-semibold">Angle Enterprise</h2>
            <p className="text-sm text-gray-500">Admin dashboard</p>
          </div>
        </div>
      </div>
      <nav className="p-4 space-y-2">
        {menu.map((item) => (
          <a
            key={item.label}
            href={item.path}
            onClick={() => setActiveMenu(item.path)}
            className={`block px-4 py-2 rounded-lg ${
              activeMenu === item.path
                ? "bg-gray-200 text-gray-900 font-medium"
                : "text-gray-600 hover:bg-gray-100 hover:text-gray-800"
            }`}
          >
            {sidebarCollapsed ? item.label.charAt(0) : item.label}
          </a>
        ))}
      </nav>
    </div>
  );
}
