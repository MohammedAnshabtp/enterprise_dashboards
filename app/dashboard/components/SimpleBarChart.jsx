"use client";
export default function SimpleBarChart({ data = [], title = "Bar Chart" }) {
  const safeData = Array.isArray(data) && data.length ? data : [10, 40, 20, 60];
  const max = Math.max(...safeData) || 1;

  return (
    <div className="bg-white border border-gray-200 rounded-xl p-6 h-64 flex flex-col">
      <p className="text-sm text-gray-600 mb-4">{title}</p>

      <div className="flex items-end gap-4 flex-1">
        {safeData.map((value, i) => (
          <div key={i} className="flex-1 flex flex-col items-center">
            {/* Value Above Bar */}
            <span className="text-xs text-gray-600 mb-1">{value}</span>

            {/* Bar */}
            <div
              className="w-full bg-indigo-500 rounded-md transition-all duration-300"
              style={{ height: `${(value / max) * 100}%` }}
            />
          </div>
        ))}
      </div>

      {!data.length && (
        <p className="text-xs text-gray-400 mt-3">Showing fallback data</p>
      )}
    </div>
  );
}
