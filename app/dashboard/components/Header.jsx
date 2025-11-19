export default function Header() {
  return (
    <header className="flex justify-between items-center px-6 py-4 bg-white border-b border-gray-200">
      <h1 className="text-xl font-semibold">User visit</h1>

      <div className="flex items-center gap-4">
        <input
          type="text"
          placeholder="Search products, orders"
          className="border border-gray-300 rounded-lg px-4 py-2 w-64 text-sm"
        />

        <div className="text-right">
          <p className="text-sm font-medium">Admin</p>
          <p className="text-xs text-gray-500">ar@company.com</p>
        </div>

        <div className="h-9 w-9 bg-gray-200 rounded-full flex items-center justify-center text-gray-600">
          A
        </div>
      </div>
    </header>
  );
}
