"use client";

const BAR_COLORS = ["#6366F1", "#818CF8", "#A5B4FC", "#C7D2FE", "#8B5CF6", "#7C3AED", "#6D28D9"];

export default function SimpleBarChart({ data = [], title = "Bar Chart" }) {
  const safeData = Array.isArray(data) && data.length ? data : [520, 680, 430, 900, 700, 750, 820];
  const max = Math.max(...safeData) || 1;
  const days = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

  return (
    <div className="bg-white rounded-[0.875rem] border border-[#F1F5F9] shadow-[0_2px_8px_0_rgb(0_0_0/0.06)] p-5">
      <div className="flex items-center justify-between mb-5">
        <p className="text-sm font-semibold text-[#0F172A]">{title}</p>
        <span className="text-xs text-[#94A3B8] bg-[#F8FAFC] px-2.5 py-1 rounded-lg border border-[#E2E8F0]">
          Last 7 days
        </span>
      </div>

      <div className="flex items-end gap-2.5" style={{ height: 100 }}>
        {safeData.map((value, i) => {
          const heightPct = (value / max) * 100;
          return (
            <div key={i} className="flex-1 flex flex-col items-center gap-1 group">
              <span className="text-[10px] font-medium text-[#6366F1] opacity-0 group-hover:opacity-100 transition-opacity duration-150">
                {value}
              </span>
              <div
                className="w-full rounded-t-md transition-all duration-500 ease-out cursor-pointer hover:opacity-80"
                style={{
                  height: `${heightPct}%`,
                  background: `linear-gradient(to top, ${BAR_COLORS[i % BAR_COLORS.length]}, ${BAR_COLORS[i % BAR_COLORS.length]}cc)`,
                  minHeight: 4,
                }}
              />
            </div>
          );
        })}
      </div>

      <div className="flex justify-between mt-2">
        {days.slice(0, safeData.length).map((day, i) => (
          <span key={i} className="flex-1 text-center text-[10px] text-[#94A3B8]">{day}</span>
        ))}
      </div>
    </div>
  );
}
