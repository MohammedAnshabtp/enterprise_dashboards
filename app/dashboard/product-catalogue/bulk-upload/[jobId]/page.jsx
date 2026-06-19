"use client";

import { useParams, useRouter } from "next/navigation";
import {
  ArrowLeft, FileSpreadsheet, CheckCircle2, FileX, Loader2,
  AlertTriangle, Clock, User, Calendar, Tag, RefreshCw,
} from "lucide-react";
import dayjs from "../../../../lib/dayjs";
import { useBulkUploadJob } from "../../../../hooks/useProducts";
import { Button } from "../../../../components/ui/button";

const STATUS_STYLES = {
  completed:  { color: "#10B981", bg: "#D1FAE5", label: "Import Successful" },
  failed:     { color: "#EF4444", bg: "#FEE2E2", label: "Import Failed" },
  processing: { color: "#6366F1", bg: "#EEF2FF", label: "Processing…" },
  queued:     { color: "#F59E0B", bg: "#FEF3C7", label: "Queued" },
};

const CATEGORY_TYPE_LABELS = {
  SIZE:          "Size",
  SPACE:         "Space",
  TILE_USAGE:    "Tile Usage",
  PRODUCT_STYLE: "Product Style",
};

function StatCard({ label, value, color, bg, icon: Icon }) {
  return (
    <div className="rounded-2xl p-4 flex items-center gap-4" style={{ backgroundColor: bg }}>
      <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0" style={{ backgroundColor: `${color}22` }}>
        <Icon size={18} style={{ color }} />
      </div>
      <div>
        <p className="text-2xl font-bold leading-none" style={{ color }}>{value ?? "—"}</p>
        <p className="text-xs font-medium mt-1" style={{ color }}>{label}</p>
      </div>
    </div>
  );
}

function InfoRow({ label, value }) {
  if (value == null || value === "") return null;
  return (
    <div className="flex items-start gap-3 py-2.5 border-b border-[#F1F5F9] last:border-0">
      <span className="text-xs text-[#94A3B8] w-36 shrink-0 pt-0.5">{label}</span>
      <span className="text-sm text-[#0F172A] font-medium break-all">{value}</span>
    </div>
  );
}

export default function BulkUploadJobPage() {
  const { jobId } = useParams();
  const router = useRouter();
  const { data: job, isLoading, refetch, isFetching } = useBulkUploadJob(jobId);

  const isActive = job?.status === "queued" || job?.status === "processing";
  const cfg = STATUS_STYLES[job?.status] ?? STATUS_STYLES.queued;
  const progress = job?.total
    ? Math.round(((job.successCount ?? 0) + (job.failedCount ?? 0)) / job.total * 100)
    : 0;
  const duration = job?.startedAt && job?.completedAt
    ? (() => {
        const ms = dayjs(job.completedAt).diff(dayjs(job.startedAt));
        if (ms < 1000) return `${ms}ms`;
        if (ms < 60000) return `${(ms / 1000).toFixed(1)}s`;
        return `${Math.floor(ms / 60000)}m ${Math.floor((ms % 60000) / 1000)}s`;
      })()
    : null;

  return (
    <div className="space-y-5 animate-[fadeInScale_0.2s_ease_both]">
      {/* Page header */}
      <div className="bg-white rounded-2xl border border-[#E2E8F0] shadow-sm px-6 py-4 flex items-center gap-4">
        <button
          type="button"
          onClick={() => router.push("/dashboard/product-catalogue/add")}
          className="w-8 h-8 rounded-xl bg-[#F1F5F9] hover:bg-[#E2E8F0] flex items-center justify-center transition-colors cursor-pointer shrink-0"
        >
          <ArrowLeft size={16} className="text-[#64748B]" />
        </button>
        <div className="flex-1 min-w-0">
          <h1 className="text-lg font-bold text-[#0F172A] truncate">
            {isLoading ? "Loading…" : (job?.fileName ?? `Job ${jobId?.toString().slice(-8)}`)}
          </h1>
          <p className="text-xs text-[#94A3B8]">Bulk import job details</p>
        </div>
        {job && isActive && (
          <Button
            variant="ghost"
            className="gap-2 shrink-0"
            onClick={() => refetch()}
            disabled={isFetching}
          >
            <RefreshCw size={14} className={isFetching ? "animate-spin" : ""} />
            Refresh
          </Button>
        )}
      </div>

      {isLoading ? (
        <div className="bg-white rounded-2xl border border-[#E2E8F0] shadow-sm flex items-center justify-center py-20">
          <Loader2 size={24} className="animate-spin text-[#94A3B8]" />
        </div>
      ) : !job ? (
        <div className="bg-white rounded-2xl border border-[#E2E8F0] shadow-sm flex flex-col items-center justify-center py-20 gap-3">
          <FileX size={32} className="text-[#CBD5E1]" />
          <p className="text-sm text-[#94A3B8]">Job not found</p>
          <Button variant="ghost" onClick={() => router.push("/dashboard/product-catalogue/add")}>
            Go back
          </Button>
        </div>
      ) : (
        <>
          {/* Status banner */}
          <div className="bg-white rounded-2xl border border-[#E2E8F0] shadow-sm p-6">
            <div className="flex items-center gap-4 mb-5">
              <div className="w-12 h-12 rounded-xl flex items-center justify-center shrink-0" style={{ backgroundColor: cfg.bg }}>
                {isActive
                  ? <Loader2 size={22} style={{ color: cfg.color }} className="animate-spin" />
                  : job.status === "completed"
                    ? <CheckCircle2 size={22} style={{ color: cfg.color }} />
                    : <FileX size={22} style={{ color: cfg.color }} />
                }
              </div>
              <div className="flex-1 min-w-0">
                <h2 className="text-base font-bold text-[#0F172A]">{cfg.label}</h2>
                <p className="text-xs text-[#94A3B8] mt-0.5">
                  {job.createdAt
                    ? `Started ${dayjs.utc(job.createdAt).local().format("DD MMM YYYY, hh:mm A")}`
                    : "No start time"}
                  {duration && ` · took ${duration}`}
                </p>
              </div>
              <span
                className="text-sm font-bold px-4 py-1.5 rounded-full shrink-0"
                style={{ color: cfg.color, backgroundColor: cfg.bg }}
              >
                {progress}%
              </span>
            </div>

            {/* Progress bar */}
            <div className="space-y-1.5">
              <div className="h-2.5 bg-[#F1F5F9] rounded-full overflow-hidden">
                <div
                  className="h-full rounded-full transition-all duration-700 ease-out"
                  style={{
                    width: `${job.status === "queued" ? 0 : progress}%`,
                    background: job.status === "failed"    ? "#EF4444"
                              : job.status === "completed" ? "#10B981"
                              : "linear-gradient(90deg, #6366F1, #818CF8)",
                  }}
                />
              </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-3 mt-5">
              <StatCard label="Total Rows"  value={job.total}        color="#6366F1" bg="#EEF2FF" icon={FileSpreadsheet} />
              <StatCard label="Imported"    value={job.successCount} color="#10B981" bg="#D1FAE5" icon={CheckCircle2} />
              <StatCard label="Failed"      value={job.failedCount}  color="#EF4444" bg="#FEE2E2" icon={FileX} />
            </div>

            {/* Top-level error reason */}
            {job.errorMessage && (
              <div className="mt-4 flex items-start gap-2 bg-[#FEF2F2] border border-[#FCA5A5] rounded-xl px-4 py-3">
                <AlertTriangle size={14} className="text-[#EF4444] shrink-0 mt-0.5" />
                <p className="text-sm text-[#991B1B]">{job.errorMessage}</p>
              </div>
            )}
          </div>

          {/* Job metadata */}
          <div className="bg-white rounded-2xl border border-[#E2E8F0] shadow-sm overflow-hidden">
            <div className="px-5 py-3.5 border-b border-[#F1F5F9] bg-[#F8FAFC] flex items-center gap-2">
              <Tag size={13} className="text-[#6366F1]" />
              <h3 className="text-sm font-semibold text-[#0F172A]">Job Info</h3>
            </div>
            <div className="px-5 py-1">
              <InfoRow label="Job ID"        value={job.jobId ?? jobId} />
              <InfoRow label="File Name"     value={job.fileName} />
              <InfoRow label="Mode"          value={job.isStockOnly ? "Stock update only" : "Full import (create + update)"} />
              <InfoRow label="Uploaded by"   value={job.uploadedBy?.name ?? job.uploadedBy?.email} />
              <InfoRow label="Queued at"     value={job.createdAt ? dayjs.utc(job.createdAt).local().format("DD MMM YYYY, hh:mm A") : null} />
              <InfoRow label="Started at"    value={job.startedAt ? dayjs.utc(job.startedAt).local().format("DD MMM YYYY, hh:mm A") : null} />
              <InfoRow label="Completed at"  value={job.completedAt ? dayjs.utc(job.completedAt).local().format("DD MMM YYYY, hh:mm A") : null} />
              {duration && <InfoRow label="Duration" value={duration} />}
            </div>
          </div>

          {/* Category resolution errors */}
          {job.categoryResolutionErrors?.length > 0 && (
            <div className="bg-white rounded-2xl border border-[#FCD34D] shadow-sm overflow-hidden">
              <div className="px-5 py-3.5 border-b border-[#FEF3C7] bg-[#FFFBEB] flex items-center gap-2">
                <AlertTriangle size={14} className="text-[#D97706]" />
                <h3 className="text-sm font-semibold text-[#92400E]">
                  {job.categoryResolutionErrors.length} Category{job.categoryResolutionErrors.length > 1 ? " Warnings" : " Warning"}
                </h3>
                <span className="ml-auto text-xs text-[#D97706]">Products were imported but category tags were skipped</span>
              </div>
              <div className="divide-y divide-[#FEF3C7] max-h-64 overflow-y-auto">
                {job.categoryResolutionErrors.map((err, i) => (
                  <div key={i} className="px-5 py-3 flex items-start gap-3">
                    <span className="shrink-0 text-xs font-semibold px-2 py-0.5 rounded-full bg-[#FEF3C7] text-[#D97706]">
                      {CATEGORY_TYPE_LABELS[err.type] ?? err.type}
                    </span>
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-[#0F172A] truncate">{err.name}</p>
                      <p className="text-xs text-[#92400E] mt-0.5">{err.message}</p>
                      {err.row != null && <p className="text-xs text-[#94A3B8]">Row {err.row}</p>}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Row-level errors */}
          {job.errors?.length > 0 && (
            <div className="bg-white rounded-2xl border border-[#FCA5A5] shadow-sm overflow-hidden">
              <div className="px-5 py-3.5 border-b border-[#FEE2E2] bg-[#FFF5F5] flex items-center gap-2">
                <FileX size={14} className="text-[#EF4444]" />
                <h3 className="text-sm font-semibold text-[#EF4444]">
                  {job.errors.length} Row Error{job.errors.length > 1 ? "s" : ""}
                </h3>
                {job.errors.length === 500 && (
                  <span className="ml-auto text-xs text-[#94A3B8]">Showing first 500</span>
                )}
              </div>
              <div className="divide-y divide-[#F1F5F9] max-h-96 overflow-y-auto">
                {job.errors.map((err, i) => (
                  <div key={i} className="px-5 py-3 flex items-start gap-3">
                    <span className="shrink-0 w-8 h-8 bg-[#FEE2E2] text-[#EF4444] rounded-lg flex items-center justify-center text-xs font-bold">
                      {err.row ?? i + 1}
                    </span>
                    <p className="text-sm text-[#374151] pt-1">{err.message}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* All done CTA */}
          {job.status === "completed" && job.errors?.length === 0 && job.categoryResolutionErrors?.length === 0 && (
            <div className="bg-[#F0FDF4] rounded-2xl border border-[#A7F3D0] px-6 py-5 flex items-center gap-4">
              <CheckCircle2 size={24} className="text-[#10B981] shrink-0" />
              <div className="flex-1">
                <p className="text-sm font-semibold text-[#065F46]">Perfect import — no errors</p>
                <p className="text-xs text-[#6EE7B7] mt-0.5">All {job.total} rows were imported successfully.</p>
              </div>
              <Button onClick={() => router.push("/dashboard/product-catalogue")} className="shrink-0 gap-2">
                View Products
              </Button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
