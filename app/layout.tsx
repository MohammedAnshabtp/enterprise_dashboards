import "./styles/globals.css";
import Header from "../app/dashboard/components/Header";
import Sidebar from "../app/dashboard/components/Sidebar";
import type { ReactNode } from "react";

export const metadata = {
  title: "Enterprise Dashboard",
  description: "Next.js Dashboard Application",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body className="flex h-screen overflow-hidden">
        {/* FIXED SIDEBAR */}
        <aside className="w-64 bg-white border-r border-gray-200 fixed left-0 top-0 h-full z-50">
          <Sidebar />
        </aside>

        {/* MAIN AREA (with header and page content) */}
        <div className="flex flex-col flex-1 ml-64">
          {/* FIXED HEADER */}
          <header className="fixed top-0 left-64 right-0 z-40 bg-white border-b border-gray-200 h-16">
            <Header />
          </header>

          {/* PAGE CONTENT (scrollable) */}
          <main className="mt-16 p-6 overflow-y-auto h-[calc(100vh-4rem)] bg-gray-50">
            {children}
          </main>
        </div>
      </body>
    </html>
  );
}
