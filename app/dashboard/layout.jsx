"use client";

import { useUIStore } from "../store/uiStore"; // adjust path
import Sidebar from "./components/Sidebar";
import Header from "./components/Header";

export default function DashboardLayout({ children }) {
  const { sidebarCollapsed } = useUIStore();

  return (
    <div className="flex h-screen overflow-hidden">
      {/* Sidebar */}
      <aside
        className={`bg-white border-r border-gray-200 fixed left-0 top-0 h-full z-50 transition-all duration-300 ${
          sidebarCollapsed ? "w-20" : "w-64"
        }`}
      >
        <Sidebar />
      </aside>

      {/* Main Section */}
      <div
        className={`flex flex-col flex-1 transition-all duration-300 ${
          sidebarCollapsed ? "ml-20" : "ml-64"
        }`}
      >
        {/* Header */}
        <header
          className={`fixed top-0 right-0 z-40 bg-white border-b border-gray-200 h-16 transition-all duration-300 ${
            sidebarCollapsed ? "left-20" : "left-64"
          }`}
        >
          <Header />
        </header>

        {/* Content */}
        <main className="mt-16 p-6 overflow-y-auto h-[calc(100vh-4rem)] bg-gray-50">
          {children}
        </main>
      </div>
    </div>
  );
}
