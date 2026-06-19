"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  History, FileSpreadsheet, CheckCircle2, FileX,
  Loader2, Clock, ChevronLeft,
} from "lucide-react";
import dayjs from "../../../lib/dayjs";
import { useBulkUploadHistory } from "../../../hooks/useProducts";
import { Button } from "../../../components/ui/button";

const STATUS_FILTERS = [
  { value: "",           label: "All" },
  { value: "completed",  label: "Done" },
  { value: "failed",     label: "Failed" },
  { value: "processing", label: "Processing" },
  { value: "queued",     label: "Pending" },
];

const STATUS_STYLES = {
  completed:  { color: "#10B981", bg: "#D1FAE5", label: "Done" },
  failed:     { color: "#EF4444", bg: "#FEE2E2", label: "Failed" },
  processing: { color: "#6366F1", bg: "#EEF2FF", label: "Processing" },
  queued:     { color: "#F59E0B", bg: "#FEF3C7", label: "Pending" },
};

export default function BulkUploadHistoryPage() {
  const router = useRouter();
  const [page, setPage] = useState(1);
  const [statusFilter, setStatusFilter] = useState("");

  const params = { page, limit: 15, ...(statusFilter && { status: statusFilter }) };
  const { data, isLoading, isFetching } = useBulkUploadHistory(params);
  const jobs = data?.data ?? [];
  const pagination = data?.pagination ?? {};
  const totalPages = pagination.totalPages ?? 1;

  const handleStatusChange = (val) => { setStatusFilter(val); setPage(1); };

  return (
    <div className="space-y-5">
      {/* Page header */}
      <div className="bg-white rounded-2xl border border-[#E2E8F0] shadow-sm px-6 py-4 flex items-center gap-4">
        <button
          type="button"
          onClick={() => router.push("/dashboard/product-catalogue")}
          className="w-8 h-8 rounded-xl bg-[#F1F5F9] hover:bg-[#E2E8F0] flex items-center justify-center transition-colors cursor-pointer shrink-0"
        >
          <ChevronLeft size={16} className="text-[#64748B]" />
        </button>
        <div className="flex-1 min-w-0">
          <h1 className="text-lg font-bold text-[#0F172A]">Bulk Upload History</h1>
          <p className="text-xs text-[#94A3B8]">All product import jobs</p>
        </div>
        <Button onClick={() => router.push("/dashboard/product-catalogue/add")} className="gap-2 shrink-0">
          <FileSpreadsheet size={14} />
          New Upload
        </Button>
      </div>

      {/* Table card */}
      <div className="bg-white rounded-2xl border border-[#E2E8F0] shadow-sm overflow-hidden">
        {/* Toolbar */}
        <div className="px-5 py-3.5 border-b border-[#F1F5F9] bg-[#F8FAFC] flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-2 flex-1 min-w-0">
            <History size={14} className="text-[#6366F1] shrink-0" />
            <span className="text-sm font-semibold text-[#0F172A]">All Jobs</span>
            {pagination.total != null && (
              <span className="text-xs text-[#94A3B8]">({pagination.total})</span>
            )}
            {isFetching && !isLoading && (
              <Loader2 size={12} className="animate-spin text-[#94A3B8]" />
            )}
          </div>
          <div className="flex items-center gap-1 p-0.5 bg-[#F1F5F9] rounded-lg">
            {STATUS_FILTERS.map((f) => (
              <button
                key={f.value}
                type="button"
                onClick={() => handleStatusChange(f.value)}
                className={`px-3 py-1 rounded-md text-xs font-medium transition-all cursor-pointer ${
                  statusFilter === f.value
                    ? "bg-white text-[#0F172A] shadow-sm"
                    : "text-[#64748B] hover:text-[#0F172A]"
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center py-16">
            <Loader2 size={24} className="animate-spin text-[#94A3B8]" />
          </div>
        ) : jobs.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 gap-3">
            <FileSpreadsheet size={32} className="text-[#CBD5E1]" />
            <p className="text-sm text-[#94A3B8]">No upload jobs found</p>
            <Button variant="ghost" onClick={() => router.push("/dashboard/product-catalogue/add")}>
              Start your first bulk upload
            </Button>
          </div>
        ) : (
          <>
            <div className="divide-y divide-[#F1F5F9]">
              {jobs.map((job) => {
                const cfg = STATUS_STYLES[job.status] ?? STATUS_STYLES.queued;
                const id = job._id ?? job.jobId;
                const pct = job.total
                  ? Math.round(((job.successCount ?? 0) + (job.failedCount ?? 0)) / job.total * 100)
                  : null;

                return (
                  <button
                    key={id}
                    type="button"
                    onClick={() => router.push(`/dashboard/product-catalogue/bulk-upload/${id}`)}
                    className="w-full flex items-center gap-4 px-5 py-4 hover:bg-[#F8FAFC] transition-colors text-left cursor-pointer"
                  >
                    <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0" style={{ backgroundColor: cfg.bg }}>
                      <FileSpreadsheet size={17} style={{ color: cfg.color }} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-[#0F172A] truncate">
                        {job.fileName ?? `Job ${id?.toString().slice(-8) ?? "—"}`}
                      </p>
                      <div className="flex items-center gap-2 mt-0.5">
                        <Clock size={10} className="text-[#94A3B8]" />
                        <p className="text-xs text-[#94A3B8]">
                          {job.createdAt ? dayjs.utc(job.createdAt).local().format("DD MMM YYYY, hh:mm A") : "—"}
                        </p>
                        {job.isStockOnly && (
                          <span className="text-xs text-[#6366F1] font-medium">· Stock only</span>
                        )}
                        {job.uploadedBy?.name && (
                          <span className="text-xs text-[#94A3B8]">· {job.uploadedBy.name}</span>
                        )}
                      </div>
                    </div>
                    <div className="hidden sm:flex items-center gap-4 shrink-0 text-xs text-[#64748B]">
                      {job.total != null && (
                        <div className="text-right">
                          <p className="font-semibold text-[#0F172A]">{job.total}</p>
                          <p className="text-[#94A3B8]">rows{pct != null ? ` · ${pct}%` : ""}</p>
                        </div>
                      )}
                      {job.successCount != null && (
                        <div className="text-right">
                          <p className="font-semibold text-[#10B981]">{job.successCount}</p>
                          <p className="text-[#94A3B8]">imported</p>
                        </div>
                      )}
                      {job.failedCount != null && (
                        <div className="text-right">
                          <p className={`font-semibold ${job.failedCount > 0 ? "text-[#EF4444]" : "text-[#94A3B8]"}`}>
                            {job.failedCount}
                          </p>
                          <p className="text-[#94A3B8]">failed</p>
                        </div>
                      )}
                    </div>
                    <span
                      className="text-xs font-semibold px-2.5 py-1 rounded-full shrink-0"
                      style={{ color: cfg.color, backgroundColor: cfg.bg }}
                    >
                      {cfg.label}
                    </span>
                  </button>
                );
              })}
            </div>

            {totalPages > 1 && (
              <div className="flex items-center justify-between px-5 py-3.5 border-t border-[#F1F5F9] bg-[#F8FAFC]">
                <p className="text-xs text-[#94A3B8]">
                  Page {page} of {totalPages}
                  {pagination.total != null && ` · ${pagination.total} jobs total`}
                </p>
                <div className="flex items-center gap-1">
                  <button
                    type="button"
                    disabled={page <= 1}
                    onClick={() => setPage((p) => p - 1)}
                    className="px-3 py-1.5 text-xs font-medium rounded-lg border border-[#E2E8F0] text-[#64748B] hover:bg-white hover:border-[#6366F1]/30 disabled:opacity-40 disabled:cursor-not-allowed transition-all cursor-pointer"
                  >
                    Previous
                  </button>
                  {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
                    const p = totalPages <= 5 ? i + 1 : Math.max(1, page - 2) + i;
                    if (p > totalPages) return null;
                    return (
                      <button
                        key={p}
                        type="button"
                        onClick={() => setPage(p)}
                        className={`w-8 h-8 text-xs font-medium rounded-lg transition-all cursor-pointer ${
                          p === page
                            ? "bg-[#6366F1] text-white shadow-sm"
                            : "border border-[#E2E8F0] text-[#64748B] hover:bg-white hover:border-[#6366F1]/30"
                        }`}
                      >
                        {p}
                      </button>
                    );
                  })}
                  <button
                    type="button"
                    disabled={page >= totalPages}
                    onClick={() => setPage((p) => p + 1)}
                    className="px-3 py-1.5 text-xs font-medium rounded-lg border border-[#E2E8F0] text-[#64748B] hover:bg-white hover:border-[#6366F1]/30 disabled:opacity-40 disabled:cursor-not-allowed transition-all cursor-pointer"
                  >
                    Next
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
