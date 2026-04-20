"use client";
export default function StatCard({ label, value, change }) {
  return (
    <div className="p-4 bg-white rounded border">
      <div className="text-gray-600 text-sm">{label}</div>
      <div className="text-2xl font-semibold text-black">{value}</div>
      <div className="text-green-600 text-sm">{change}</div>
    </div>
  );
}
