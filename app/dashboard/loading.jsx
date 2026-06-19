export default function DashboardLoading() {
  return (
    <div className="flex items-center justify-center h-full min-h-[60vh]">
      <div className="flex flex-col items-center gap-4">
        <div className="relative w-10 h-10">
          <div className="absolute inset-0 rounded-full border-4 border-[#1E293B]" />
          <div className="absolute inset-0 rounded-full border-4 border-t-[#6366F1] animate-spin" />
        </div>
        <p className="text-sm text-[#475569] font-medium">Loading…</p>
      </div>
    </div>
  );
}
