"use client";

import React from "react";

/**
 * Safe, self-contained sparkline component.
 * - Accepts `data` (array of numbers) and `title`.
 * - Uses a default dataset if none provided.
 * - Safely handles empty arrays.
 */
export default function SimpleSparkline({
  title = "Sparkline",
  data = null, // intentionally null so we can detect missing prop
}) {
  // If user didn't pass data, fall back to a sensible default and warn in dev.
  const safeData =
    Array.isArray(data) && data.length > 0
      ? data
      : typeof window !== "undefined" && !data
      ? [12, 18, 14, 19, 22, 17, 20]
      : [];

  // Protect against empty array when computing max
  const max = safeData.length ? Math.max(...safeData) : 1;

  // If safeData is empty (SSR environment or truly empty), show a placeholder box
  const points =
    safeData.length > 0
      ? safeData
          .map((d, i) => {
            const x = (i / (safeData.length - 1 || 1)) * 100;
            const y = (1 - d / max) * 100; // invert y for svg coordinates
            return `${x},${y}`;
          })
          .join(" ")
      : "";

  // Helpful dev warning (won't spam production)
  if (
    process.env.NODE_ENV === "development" &&
    (!Array.isArray(data) || data.length === 0)
  ) {
    // eslint-disable-next-line no-console
    console.info(
      "[SimpleSparkline] Using fallback data because `data` prop was not provided or is empty."
    );
  }

  return (
    <div className="bg-white border border-gray-200 rounded-xl p-6 h-64">
      <p className="text-sm text-gray-600 mb-3">{title}</p>

      {points ? (
        <svg
          className="w-full h-full"
          viewBox="0 0 100 100"
          preserveAspectRatio="none"
          role="img"
          aria-label={title}
        >
          {/* subtle background polyline area (optional) */}
          <polyline
            fill="none"
            stroke="currentColor"
            strokeWidth="0.8"
            points={points}
            className="text-gray-400"
          />
        </svg>
      ) : (
        <div className="w-full h-full flex items-center justify-center text-gray-400 border border-dashed rounded">
          No data
        </div>
      )}
    </div>
  );
}
