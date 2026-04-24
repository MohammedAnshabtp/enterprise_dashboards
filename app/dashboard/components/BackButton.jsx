"use client";

import { useRouter } from "next/navigation";
import { CircleChevronLeft } from "lucide-react";

export default function BackButton({ label = "Back" }) {
  const router = useRouter();

  return (
    <button
      onClick={() => router.back()}
      className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-gray-100 transition text-gray-700"
    >
      <CircleChevronLeft size={22} />
      <span className="text-sm font-medium">{label}</span>
    </button>
  );
}
