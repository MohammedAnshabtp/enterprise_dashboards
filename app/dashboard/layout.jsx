// app/(dashboard)/layout.jsx
import Header from "../dashboard/components/Header"; // Adjust paths if needed
import Sidebar from "../dashboard/components/Sidebar";

export default function DashboardLayout({ children }) {
  return (
    <div className="flex h-screen overflow-hidden">
      <aside className="w-64 bg-white border-r border-gray-200 fixed left-0 top-0 h-full z-50">
        <Sidebar />
      </aside>
      <div className="flex flex-col flex-1 ml-64">
        <header className="fixed top-0 left-64 right-0 z-40 bg-white border-b border-gray-200 h-16">
          <Header />
        </header>
        <main className="mt-16 p-6 overflow-y-auto h-[calc(100vh-4rem)] bg-gray-50">
          {children}
        </main>
      </div>
    </div>
  );
}
