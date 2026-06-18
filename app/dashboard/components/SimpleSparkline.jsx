"use client";

export default function SimpleSparkline({ data = [], title = "Trend" }) {
  const safeData = Array.isArray(data) && data.length >= 2 ? data : [30, 60, 40, 80, 55, 90, 75];
  const min = Math.min(...safeData);
  const max = Math.max(...safeData) || 1;
  const range = max - min || 1;
  const W = 300;
  const H = 80;
  const pad = 6;

  const points = safeData.map((v, i) => {
    const x = pad + (i / (safeData.length - 1)) * (W - pad * 2);
    const y = H - pad - ((v - min) / range) * (H - pad * 2);
    return [x, y];
  });

  const polyline = points.map((p) => p.join(",")).join(" ");
  const areaPath = [
    `M ${points[0][0]},${H}`,
    ...points.map(([x, y]) => `L ${x},${y}`),
    `L ${points[points.length - 1][0]},${H}`,
    "Z",
  ].join(" ");

  const lastVal = safeData[safeData.length - 1];
  const prevVal = safeData[safeData.length - 2];
  const diff = lastVal - prevVal;

  return (
    <div className="bg-white rounded-[0.875rem] border border-[#F1F5F9] shadow-[0_2px_8px_0_rgb(0_0_0/0.06)] p-5">
      <div className="flex items-center justify-between mb-4">
        <p className="text-sm font-semibold text-[#0F172A]">{title}</p>
        <span
          className={`text-xs font-medium px-2 py-0.5 rounded-full ${
            diff >= 0 ? "bg-[#D1FAE5] text-[#059669]" : "bg-[#FEE2E2] text-[#DC2626]"
          }`}
        >
          {diff >= 0 ? "+" : ""}{diff}
        </span>
      </div>

      <svg
        viewBox={`0 0 ${W} ${H}`}
        className="w-full"
        style={{ height: 90 }}
        preserveAspectRatio="none"
        role="img"
        aria-label={title}
      >
        <defs>
          <linearGradient id="sparkGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#6366F1" stopOpacity="0.2" />
            <stop offset="100%" stopColor="#6366F1" stopOpacity="0" />
          </linearGradient>
        </defs>
        <path d={areaPath} fill="url(#sparkGrad)" />
        <polyline
          points={polyline}
          fill="none"
          stroke="#6366F1"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <circle
          cx={points[points.length - 1][0]}
          cy={points[points.length - 1][1]}
          r="4"
          fill="#6366F1"
          stroke="white"
          strokeWidth="2"
        />
      </svg>

      <div className="flex justify-between mt-2">
        {safeData.map((v, i) => (
          <span key={i} className="text-[10px] text-[#94A3B8]">{v}</span>
        ))}
      </div>
    </div>
  );
}
