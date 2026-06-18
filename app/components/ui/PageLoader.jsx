"use client";

export default function PageLoader({ message = "Loading..." }) {
  return (
    <div className="fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-white/80 backdrop-blur-sm">
      <div className="flex flex-col items-center gap-4">
        <div className="relative w-12 h-12">
          <div className="absolute inset-0 rounded-full border-[3px] border-[#E0E7FF]" />
          <div className="absolute inset-0 rounded-full border-[3px] border-transparent border-t-[#6366F1] animate-spin" />
          <div
            className="absolute inset-1.5 rounded-full border-[3px] border-transparent border-t-[#F59E0B] animate-spin"
            style={{ animationDuration: "0.7s", animationDirection: "reverse" }}
          />
        </div>
        <p className="text-sm font-medium text-[#475569] animate-pulse">{message}</p>
      </div>
    </div>
  );
}
