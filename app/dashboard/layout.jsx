"use client";

import { useUIStore } from "../store/uiStore";
import Sidebar from "./components/Sidebar";
import Header from "./components/Header";
import { cn } from "../lib/cn";

export default function DashboardLayout({ children }) {
  const { sidebarCollapsed } = useUIStore();

  return (
    <div className="flex h-screen overflow-hidden bg-[#F8FAFC]">
      {/* Sidebar */}
      <aside
        className={cn(
          "fixed left-0 top-0 h-full z-50 transition-all duration-300 ease-in-out",
          sidebarCollapsed ? "w-20" : "w-64"
        )}
      >
        <Sidebar />
      </aside>

      {/* Main section */}
      <div
        className={cn(
          "flex flex-col flex-1 min-h-0 transition-all duration-300 ease-in-out",
          sidebarCollapsed ? "ml-20" : "ml-64"
        )}
      >
        {/* Fixed header */}
        <header
          className={cn(
            "fixed top-0 right-0 z-40 h-16 bg-white border-b border-[#F1F5F9] transition-all duration-300 ease-in-out",
            sidebarCollapsed ? "left-20" : "left-64"
          )}
        >
          <Header />
        </header>

        {/* Scrollable content */}
        <main className="mt-16 flex-1 overflow-y-auto p-6 animate-[fadeIn_0.3s_ease_both]">
          {children}
        </main>
      </div>
    </div>
  );
}
