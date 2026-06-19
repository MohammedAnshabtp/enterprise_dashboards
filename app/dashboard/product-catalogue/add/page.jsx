/* eslint-disable @next/next/no-img-element */
"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useForm, Controller } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import toast from "react-hot-toast";
import {
  ArrowLeft, ImagePlus, X, Package, Upload, Check,
  FileSpreadsheet, ClipboardList, AlertTriangle,
  CheckCircle2, Loader2, FileX, RotateCcw, LayoutList,
  Clock, ChevronDown,
} from "lucide-react";
import dayjs from "../../../lib/dayjs";

import {
  useCreateProduct,
  useBulkUploadProducts,
  useBulkUploadStatus,
  useBulkUploadHistory,
} from "../../../hooks/useProducts";
import { useSizeCategories, useSpaceCategories, useTileUsageCategories } from "../../../hooks/useCategories";
import { useProductStyle } from "../../../hooks/useProductStyle";
import { Button } from "../../../components/ui/button";
import { Input } from "../../../components/ui/input";
import { Label } from "../../../components/ui/label";
import {
  Select, SelectTrigger, SelectContent, SelectItem,
} from "../../../components/ui/select";
import ButtonLoader from "../../../components/ui/ButtonLoader";

// ─── Helpers ─────────────────────────────────────────────────────────────────

const emptyToNull = (val, orig) => (orig === "" || orig === undefined ? null : val);

const formatBytes = (bytes) => {
  if (!bytes) return "0 B";
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
};

const estimateTimeLabel = (bytes) => {
  if (!bytes) return null;
  if (bytes < 100 * 1024)      return "usually under 30 seconds";
  if (bytes < 512 * 1024)      return "usually 1–2 minutes";
  if (bytes < 2 * 1024 * 1024) return "may take 2–4 minutes";
  if (bytes < 10 * 1024 * 1024) return "large file — may take 5–10 minutes";
  return "very large file — may take 10+ minutes";
};

const formatElapsed = (secs) => {
  if (secs < 60) return `${secs}s`;
  const m = Math.floor(secs / 60);
  const s = secs % 60;
  return s > 0 ? `${m}m ${s}s` : `${m}m`;
};

// ─── Schemas ─────────────────────────────────────────────────────────────────

const manualSchema = yup.object({
  name: yup.string().required("Product name is required"),
  price: yup.number().typeError("Price must be a number").positive("Must be greater than 0").required("Price is required"),
  shortDescription: yup.string().nullable(),
  description: yup.string().nullable(),
  brand: yup.string().nullable(),
  finish: yup.string().nullable(),
  vendor: yup.string().nullable(),
  squareFeet: yup.string().nullable(),
  pricePerSqft: yup.number().typeError("Must be a number").positive("Must be > 0").nullable().transform(emptyToNull),
  salePrice: yup.number().typeError("Must be a number").positive("Must be > 0").nullable().transform(emptyToNull),
  purchasePrice: yup.number().typeError("Must be a number").positive("Must be > 0").nullable().transform(emptyToNull),
  discountPercent: yup.number().typeError("Must be a number").min(0, "Must be 0–100").max(100, "Must be 0–100").nullable().transform(emptyToNull),
  gst: yup.number().typeError("Must be a number").min(0, "Must be ≥ 0").nullable().transform(emptyToNull),
  weight: yup.number().typeError("Must be a number").positive("Must be > 0").nullable().transform(emptyToNull),
  stock: yup.number().typeError("Must be a number").min(0, "Must be 0 or more").integer("Must be a whole number").nullable().transform(emptyToNull),
  tileInBox: yup.number().typeError("Must be a number").positive("Must be > 0").integer("Must be a whole number").nullable().transform(emptyToNull),
  minOrderQuantity: yup.number().typeError("Must be a number").positive("Must be > 0").integer("Must be a whole number").nullable().transform(emptyToNull),
  maxOrderQuantity: yup.number().typeError("Must be a number").positive("Must be > 0").integer("Must be a whole number").nullable().transform(emptyToNull),
  hsnCode: yup.string().nullable(),
  batchNo: yup.string().nullable(),
  sku: yup.string().nullable(),
  barcode: yup.string().nullable(),
  isFreeDelivery: yup.boolean().default(false),
  deliveryFee: yup.number().typeError("Must be a number").min(0, "Must be ≥ 0").nullable().transform(emptyToNull),
  isFeatured: yup.boolean().default(false),
  status: yup.string().oneOf(["active", "inactive"], "Please select a status").default("active"),
  thumbnailAlt: yup.string().nullable(),
  dimensionsLength: yup.number().typeError("Must be a number").positive("Must be > 0").nullable().transform(emptyToNull),
  dimensionsWidth: yup.number().typeError("Must be a number").positive("Must be > 0").nullable().transform(emptyToNull),
  sizeCategory: yup.string().nullable(),
  spaceCategories: yup.array().of(yup.string()).default([]),
  productStyles: yup.array().of(yup.string()).default([]),
  tileUsageCategories: yup.array().of(yup.string()).default([]),
});

const bulkSchema = yup.object({
  stockOnly: yup.boolean().default(false),
});

// ─── Shared UI primitives ─────────────────────────────────────────────────────

function SectionCard({ title, children }) {
  return (
    <div className="bg-white rounded-2xl border border-[#E2E8F0] shadow-sm overflow-hidden">
      <div className="px-5 py-3.5 border-b border-[#F1F5F9] bg-[#F8FAFC]">
        <h2 className="text-sm font-semibold text-[#0F172A]">{title}</h2>
      </div>
      <div className="p-5 space-y-4">{children}</div>
    </div>
  );
}

function FieldRow({ children }) {
  return <div className="grid grid-cols-2 gap-4">{children}</div>;
}

function Field({ label, required, error, children }) {
  return (
    <div className="space-y-1.5">
      <Label>
        {label}
        {required && <span className="text-red-500 ml-0.5">*</span>}
      </Label>
      {children}
      {error && <p className="text-xs text-[#EF4444]">{error}</p>}
    </div>
  );
}

function Toggle({ checked, onChange }) {
  return (
    <button
      type="button"
      onClick={() => onChange(!checked)}
      className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors duration-200 cursor-pointer ${
        checked ? "bg-[#6366F1]" : "bg-[#CBD5E1]"
      }`}
    >
      <span
        className={`inline-block h-3.5 w-3.5 transform rounded-full bg-white shadow transition-transform duration-200 ${
          checked ? "translate-x-4.5" : "translate-x-0.5"
        }`}
      />
    </button>
  );
}

function MultiSelect({ options, value = [], onChange, placeholder = "Select…" }) {
  const [open, setOpen] = useState(false);
  const toggle = (id) => {
    if (value.includes(id)) onChange(value.filter((v) => v !== id));
    else onChange([...value, id]);
  };
  const selectedOptions = options.filter((o) => value.includes(o._id));
  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="w-full min-h-[38px] px-3 py-2 rounded-lg border border-[#E2E8F0] bg-white text-sm text-left flex flex-wrap gap-1.5 items-center hover:border-[#6366F1]/50 focus:outline-none focus:ring-2 focus:ring-[#6366F1]/30 transition-colors"
      >
        {selectedOptions.length === 0 ? (
          <span className="text-[#94A3B8]">{placeholder}</span>
        ) : (
          selectedOptions.map((o) => (
            <span key={o._id} className="inline-flex items-center gap-1 bg-[#EEF2FF] text-[#6366F1] text-xs px-2 py-0.5 rounded-full font-medium">
              {o.name}
              <button type="button" onClick={(e) => { e.stopPropagation(); toggle(o._id); }} className="hover:text-[#4F46E5]">
                <X size={10} />
              </button>
            </span>
          ))
        )}
      </button>
      {open && (
        <div className="absolute z-20 mt-1 w-full bg-white border border-[#E2E8F0] rounded-xl shadow-lg max-h-52 overflow-y-auto">
          {options.length === 0 ? (
            <p className="px-3 py-2 text-sm text-[#94A3B8]">No options available</p>
          ) : (
            options.map((o) => (
              <button key={o._id} type="button" onClick={() => toggle(o._id)}
                className="w-full flex items-center gap-2 px-3 py-2.5 text-sm text-left hover:bg-[#F8FAFC] transition-colors">
                <span className={`w-4 h-4 rounded border flex items-center justify-center shrink-0 transition-colors ${value.includes(o._id) ? "bg-[#6366F1] border-[#6366F1]" : "border-[#CBD5E1]"}`}>
                  {value.includes(o._id) && <Check size={10} className="text-white" />}
                </span>
                {o.name}
              </button>
            ))
          )}
          <div className="sticky bottom-0 bg-white border-t border-[#F1F5F9] px-3 py-2">
            <button type="button" onClick={() => setOpen(false)} className="text-xs text-[#6366F1] font-medium hover:underline">Done</button>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Animated Tab Switcher ────────────────────────────────────────────────────

const TABS = [
  { id: "manual",  label: "Manual Entry", icon: ClipboardList,    desc: "Fill in product details manually" },
  { id: "bulk",    label: "Bulk Upload",  icon: FileSpreadsheet,  desc: "Import products from Excel sheet" },
];

function TabSwitcher({ active, onChange }) {
  return (
    <div className="bg-white rounded-2xl border border-[#E2E8F0] shadow-sm px-6 py-4">
      <div className="flex items-center gap-2 p-1 bg-[#F1F5F9] rounded-xl w-fit">
        {TABS.map((tab) => {
          const Icon = tab.icon;
          const isActive = active === tab.id;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => onChange(tab.id)}
              className={`flex items-center gap-2.5 px-5 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 cursor-pointer ${
                isActive
                  ? "bg-[#6366F1] text-white shadow-md shadow-[#6366F1]/25"
                  : "text-[#64748B] hover:text-[#0F172A] hover:bg-white/60"
              }`}
            >
              <Icon size={15} className={isActive ? "text-white" : "text-[#94A3B8]"} />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>
      <p className="mt-2 text-xs text-[#94A3B8] ml-1">
        {TABS.find((t) => t.id === active)?.desc}
      </p>
    </div>
  );
}

// ─── Bulk Upload Progress UI ──────────────────────────────────────────────────

const POLL_INTERVAL = 15; // seconds between auto-checks

function BulkUploadProgress({ jobId, file, onReset }) {
  const { data: job, refetch, isFetching } = useBulkUploadStatus(jobId);
  const router = useRouter();
  const [countdown, setCountdown] = useState(POLL_INTERVAL);
  const [elapsed, setElapsed] = useState(0);
  const [hintIdx, setHintIdx] = useState(0);

  const status = job?.status ?? "queued";
  const isDone = status === "completed" || status === "failed";
  const progress = job
    ? Math.round(((job.successCount ?? 0) + (job.failedCount ?? 0)) / (job.total || 1) * 100)
    : 0;

  // Countdown ticker
  useEffect(() => {
    if (isDone) return;
    setCountdown(POLL_INTERVAL);
    const tick = setInterval(() => {
      setCountdown((c) => (c <= 1 ? POLL_INTERVAL : c - 1));
    }, 1000);
    return () => clearInterval(tick);
  }, [isDone, isFetching]);

  // Live elapsed timer
  useEffect(() => {
    if (isDone) return;
    const timer = setInterval(() => setElapsed((e) => e + 1), 1000);
    return () => clearInterval(timer);
  }, [isDone]);

  // Rotating context hints
  const hints = [
    file ? `${formatBytes(file.size)} file · ${estimateTimeLabel(file.size)}` : null,
    job?.total ? `Your sheet has ${job.total} product rows` : "Reading rows in your spreadsheet…",
    "Products are matched by name, brand & dimensions",
    job?.successCount > 0
      ? `${job.successCount} product${job.successCount !== 1 ? "s" : ""} saved so far — keep this page open`
      : "Creating & updating product records in the database…",
    "Checking space, style & tile usage categories",
    "Product images are downloaded and stored automatically",
    "We check for duplicates so nothing gets created twice",
    `We refresh automatically every ${POLL_INTERVAL}s — or hit Refresh any time`,
  ].filter(Boolean);

  useEffect(() => {
    if (isDone || hints.length === 0) return;
    const rotator = setInterval(() => setHintIdx((i) => (i + 1) % hints.length), 4500);
    return () => clearInterval(rotator);
  }, [isDone, hints.length]);

  const statusConfig = {
    queued:     { color: "#F59E0B", bg: "#FEF3C7", badge: "Waiting",    icon: Loader2,      spin: true  },
    processing: { color: "#6366F1", bg: "#EEF2FF", badge: "Importing",  icon: Loader2,      spin: true  },
    completed:  { color: "#10B981", bg: "#D1FAE5", badge: "Done",       icon: CheckCircle2, spin: false },
    failed:     { color: "#EF4444", bg: "#FEE2E2", badge: "Failed",     icon: FileX,        spin: false },
  };

  const cfg = statusConfig[status] ?? statusConfig.queued;
  const StatusIcon = cfg.icon;

  const headings = {
    queued:     "File uploaded — waiting for a processing slot",
    processing: "Importing your products…",
    completed:  "All done! Your products are ready.",
    failed:     "Something went wrong with this import",
  };

  const subheadings = {
    queued:     "Your file is in the queue and will start processing shortly. No action needed.",
    completed:  "Import finished successfully.",
    failed:     "The import could not complete. See the error details below.",
  };

  return (
    <div className="space-y-5 animate-[fadeInScale_0.25s_ease_both]">
      {/* Status card */}
      <div className="bg-white rounded-2xl border border-[#E2E8F0] shadow-sm p-6">
        {/* Top row */}
        <div className="flex items-start gap-4 mb-5">
          <div className="w-12 h-12 rounded-xl flex items-center justify-center shrink-0 mt-0.5" style={{ backgroundColor: cfg.bg }}>
            <StatusIcon size={22} style={{ color: cfg.color }} className={cfg.spin ? "animate-spin" : ""} />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <h3 className="text-base font-bold text-[#0F172A]">{headings[status]}</h3>
              <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full shrink-0" style={{ color: cfg.color, backgroundColor: cfg.bg }}>
                {cfg.badge}
              </span>
            </div>

            {isDone ? (
              <p className="text-xs text-[#94A3B8] mt-1">{subheadings[status]}</p>
            ) : (
              <div className="mt-1.5 space-y-1">
                {/* Rotating hint — re-keyed to replay fadeIn */}
                <p key={hintIdx} className="text-xs text-[#64748B] animate-[fadeIn_0.5s_ease_both]">
                  {hints[hintIdx % hints.length]}
                </p>
                {/* Timers row */}
                <div className="flex items-center gap-3 text-[11px] text-[#94A3B8]">
                  <span className="flex items-center gap-1">
                    <Clock size={10} />
                    Running for <strong className="text-[#64748B] ml-0.5">{formatElapsed(elapsed)}</strong>
                  </span>
                  <span className="w-px h-3 bg-[#E2E8F0]" />
                  <span className="flex items-center gap-1">
                    <RotateCcw size={10} className={isFetching ? "animate-spin" : ""} />
                    {isFetching ? "Checking now…" : `Refreshing in ${countdown}s`}
                  </span>
                </div>
              </div>
            )}
          </div>
          {!isDone && (
            <button
              type="button"
              onClick={() => { refetch(); setCountdown(POLL_INTERVAL); }}
              disabled={isFetching}
              className="flex items-center gap-1.5 text-xs text-[#6366F1] font-medium px-3 py-1.5 rounded-lg border border-[#6366F1]/30 hover:bg-[#EEF2FF] transition-colors disabled:opacity-50 cursor-pointer disabled:cursor-not-allowed shrink-0"
            >
              <RotateCcw size={12} className={isFetching ? "animate-spin" : ""} />
              Refresh
            </button>
          )}
        </div>

        {/* Progress bar */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between">
            <span className="text-xs text-[#64748B]">
              {status === "queued" ? "Waiting to start" : "Progress"}
            </span>
            <span className="text-xs font-semibold text-[#0F172A]">
              {status === "queued" ? "—" : `${progress}%`}
            </span>
          </div>
          <div className="h-2.5 bg-[#F1F5F9] rounded-full overflow-hidden">
            <div
              className="h-full rounded-full transition-all duration-700 ease-out"
              style={{
                width: `${status === "queued" ? 0 : progress}%`,
                background: status === "failed"    ? "#EF4444"
                          : status === "completed" ? "#10B981"
                          : "linear-gradient(90deg, #6366F1, #818CF8)",
              }}
            />
          </div>
        </div>

        {/* Stats row */}
        {job && (
          <div className="grid grid-cols-3 gap-3 mt-5">
            {[
              { label: "Total Rows", val: job.total        ?? "—", color: "#6366F1", bg: "#EEF2FF" },
              { label: "Imported",   val: job.successCount ?? "—", color: "#10B981", bg: "#D1FAE5" },
              { label: "Failed",     val: job.failedCount  ?? "—", color: "#EF4444", bg: "#FEE2E2" },
            ].map(({ label, val, color, bg }) => (
              <div key={label} className="rounded-xl px-4 py-3 text-center" style={{ backgroundColor: bg }}>
                <p className="text-lg font-bold" style={{ color }}>{val}</p>
                <p className="text-xs font-medium mt-0.5" style={{ color }}>{label}</p>
              </div>
            ))}
          </div>
        )}

        {/* CTA buttons */}
        {isDone && (
          <div className="flex gap-3 mt-5">
            <Button variant="ghost" className="flex-1 gap-2" onClick={onReset}>
              <RotateCcw size={14} /> Upload Another File
            </Button>
            <Button className="flex-1 gap-2" onClick={() => router.push("/dashboard/product-catalogue")}>
              <LayoutList size={14} /> View Products
            </Button>
          </div>
        )}
      </div>

      {/* Error list */}
      {job?.errors?.length > 0 && (
        <div className="bg-white rounded-2xl border border-[#FCA5A5] shadow-sm overflow-hidden">
          <div className="px-5 py-3.5 border-b border-[#FEE2E2] bg-[#FFF5F5] flex items-center gap-2">
            <AlertTriangle size={15} className="text-[#EF4444]" />
            <h3 className="text-sm font-semibold text-[#EF4444]">
              {job.errors.length} row{job.errors.length > 1 ? "s" : ""} could not be imported
            </h3>
          </div>
          <div className="divide-y divide-[#F1F5F9] max-h-72 overflow-y-auto">
            {job.errors.map((err, i) => (
              <div key={i} className="px-5 py-3 flex items-start gap-3">
                <span className="shrink-0 w-7 h-7 bg-[#FEE2E2] text-[#EF4444] rounded-lg flex items-center justify-center text-xs font-bold">
                  {err.row ?? i + 1}
                </span>
                <div className="min-w-0">
                  {err.field && (
                    <span className="inline-block text-[10px] font-semibold bg-[#EEF2FF] text-[#6366F1] px-2 py-0.5 rounded-full mb-1">
                      {err.field}
                    </span>
                  )}
                  <p className="text-sm text-[#374151]">{err.message}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Bulk Upload Form ─────────────────────────────────────────────────────────

function BulkUploadForm() {
  const [file, setFile] = useState(null);
  const [dragOver, setDragOver] = useState(false);
  const [jobId, setJobId] = useState(null);
  const fileRef = useRef(null);
  const bulkUpload = useBulkUploadProducts();

  const { register, handleSubmit, control, watch } = useForm({
    resolver: yupResolver(bulkSchema),
    defaultValues: { stockOnly: false },
  });

  const stockOnly = watch("stockOnly");

  const XLSX_MIME = "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet";
  const handleFile = (f) => {
    if (!f) return;
    if (!f.name.toLowerCase().endsWith(".xlsx") || (f.type && f.type !== XLSX_MIME)) {
      toast.error("Only .xlsx Excel files are accepted");
      return;
    }
    setFile(f);
  };

  const onSubmit = async (data) => {
    if (!file) { toast.error("Please select an Excel file"); return; }
    const res = await bulkUpload.mutateAsync({ file, stockOnly: data.stockOnly });
    const id = res?.data?.jobId;
    if (id) setJobId(id);
    else toast.error("No job ID returned from server");
  };

  const resetJob = () => { setJobId(null); setFile(null); if (fileRef.current) fileRef.current.value = ""; };

  if (jobId) return <BulkUploadProgress jobId={jobId} file={file} onReset={resetJob} />;

  return (
    <div className="space-y-5 animate-[fadeInScale_0.2s_ease_both]">
      {/* Upload form */}
      <div className="bg-white rounded-2xl border border-[#E2E8F0] shadow-sm overflow-hidden">
        <div className="px-5 py-3.5 border-b border-[#F1F5F9] bg-[#F8FAFC]">
          <h2 className="text-sm font-semibold text-[#0F172A]">Upload Excel File</h2>
        </div>
        <div className="p-5">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            {/* Drop zone */}
            <div
              onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
              onDragLeave={() => setDragOver(false)}
              onDrop={(e) => { e.preventDefault(); setDragOver(false); handleFile(e.dataTransfer.files?.[0]); }}
              className={`relative border-2 border-dashed rounded-2xl transition-all duration-200 ${
                dragOver ? "border-[#6366F1] bg-[#EEF2FF]/60"
                : file   ? "border-[#10B981] bg-[#D1FAE5]/20"
                         : "border-[#E2E8F0] hover:border-[#6366F1]/50 hover:bg-[#EEF2FF]/20"
              }`}
            >
              {file ? (
                <div className="flex items-center gap-4 px-6 py-5">
                  <div className="w-12 h-12 bg-[#D1FAE5] rounded-xl flex items-center justify-center shrink-0">
                    <FileSpreadsheet size={22} className="text-[#10B981]" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-[#0F172A] truncate">{file.name}</p>
                    <p className="text-xs text-[#94A3B8]">{formatBytes(file.size)} · Excel Spreadsheet</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => { setFile(null); if (fileRef.current) fileRef.current.value = ""; }}
                    className="w-8 h-8 bg-[#F1F5F9] hover:bg-[#E2E8F0] rounded-lg flex items-center justify-center transition-colors cursor-pointer"
                  >
                    <X size={14} className="text-[#64748B]" />
                  </button>
                </div>
              ) : (
                <label className="flex flex-col items-center justify-center gap-3 py-12 cursor-pointer">
                  <div className={`w-14 h-14 rounded-2xl flex items-center justify-center transition-colors ${dragOver ? "bg-[#6366F1]" : "bg-[#EEF2FF]"}`}>
                    <Upload size={24} className={dragOver ? "text-white" : "text-[#6366F1]"} />
                  </div>
                  <div className="text-center">
                    <p className="text-sm font-semibold text-[#0F172A]">
                      {dragOver ? "Drop your file here" : "Drag & drop or click to browse"}
                    </p>
                    <p className="text-xs text-[#94A3B8] mt-0.5">Only .xlsx files · Max 50 MB</p>
                  </div>
                  <input
                    ref={fileRef}
                    type="file"
                    accept=".xlsx,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
                    hidden
                    onChange={(e) => handleFile(e.target.files?.[0])}
                  />
                </label>
              )}
            </div>

            {/* Stock Only toggle */}
            <div className="flex items-center justify-between p-4 bg-[#F8FAFC] rounded-xl border border-[#E2E8F0]">
              <div>
                <p className="text-sm font-medium text-[#0F172A]">Stock Only Mode</p>
                <p className="text-xs text-[#94A3B8] mt-0.5">
                  Only update stock quantities — all other fields are left unchanged
                </p>
              </div>
              <Controller
                name="stockOnly"
                control={control}
                render={({ field }) => <Toggle checked={field.value} onChange={field.onChange} />}
              />
            </div>

            <Button
              type="submit"
              disabled={!file || bulkUpload.isPending}
              className="w-full disabled:cursor-not-allowed disabled:opacity-60 gap-2"
            >
              {bulkUpload.isPending ? (
                <ButtonLoader text="Uploading…" />
              ) : (
                <>
                  <FileSpreadsheet size={15} />
                  Upload & Start Import
                </>
              )}
            </Button>
          </form>
        </div>
      </div>

      <BulkUploadHistory />
    </div>
  );
}

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

function BulkUploadHistory() {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(true);
  const [page, setPage] = useState(1);
  const [statusFilter, setStatusFilter] = useState("");

  const params = { page, limit: 10, ...(statusFilter && { status: statusFilter }) };
  const { data, isLoading, isFetching } = useBulkUploadHistory(params);
  const jobs = data?.data ?? [];
  const pagination = data?.pagination ?? {};
  const totalPages = pagination.totalPages ?? 1;

  const handleStatusChange = (val) => { setStatusFilter(val); setPage(1); };

  return (
    <div className="bg-white rounded-2xl border border-[#E2E8F0] shadow-sm overflow-hidden">
      {/* Header */}
      <div className="px-5 py-3.5 bg-[#F8FAFC] flex flex-wrap items-center gap-3" style={{ borderBottom: isOpen ? '1px solid #F1F5F9' : 'none' }}>
        <div className="flex items-center gap-2 flex-1 min-w-0">
          <Clock size={14} className="text-[#6366F1] shrink-0" />
          <h2 className="text-sm font-semibold text-[#0F172A]">Upload History</h2>
          {pagination.total != null && (
            <span className="text-xs text-[#94A3B8]">({pagination.total})</span>
          )}
          {isFetching && !isLoading && (
            <Loader2 size={12} className="animate-spin text-[#94A3B8]" />
          )}
        </div>
        {/* Status filter tabs — only when open */}
        {isOpen && (
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
        )}
        {/* Collapse toggle */}
        <button
          type="button"
          onClick={() => setIsOpen((v) => !v)}
          className="w-7 h-7 rounded-lg flex items-center justify-center text-[#94A3B8] hover:bg-[#E2E8F0] hover:text-[#0F172A] transition-all cursor-pointer shrink-0"
          aria-label={isOpen ? "Collapse" : "Expand"}
        >
          <ChevronDown size={14} className={`transition-transform duration-300 ${isOpen ? "rotate-0" : "-rotate-90"}`} />
        </button>
      </div>

      {/* Collapsible body */}
      <div className={`grid transition-[grid-template-rows] duration-300 ease-in-out ${isOpen ? "grid-rows-[1fr]" : "grid-rows-[0fr]"}`}>
      <div className="overflow-hidden">

      {isLoading ? (
        <div className="flex items-center justify-center py-10">
          <Loader2 size={20} className="animate-spin text-[#94A3B8]" />
        </div>
      ) : jobs.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-10 gap-2">
          <FileSpreadsheet size={28} className="text-[#CBD5E1]" />
          <p className="text-sm text-[#94A3B8]">No uploads yet</p>
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
                  className="w-full flex items-center gap-4 px-5 py-3.5 hover:bg-[#F8FAFC] transition-colors text-left cursor-pointer"
                >
                  <div className="w-9 h-9 rounded-xl bg-[#EEF2FF] flex items-center justify-center shrink-0">
                    <FileSpreadsheet size={16} className="text-[#6366F1]" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-[#0F172A] truncate">
                      {job.fileName ?? `Job ${id?.toString().slice(-8) ?? "—"}`}
                    </p>
                    <p className="text-xs text-[#94A3B8] mt-0.5">
                      {job.createdAt ? dayjs.utc(job.createdAt).local().format("DD MMM YYYY, hh:mm A") : "—"}
                      {job.isStockOnly && <span className="ml-2 text-[#6366F1]">· Stock only</span>}
                    </p>
                  </div>
                  <div className="flex items-center gap-3 shrink-0">
                    {job.total != null && (
                      <span className="hidden sm:block text-xs text-[#64748B]">
                        <span className="font-semibold text-[#0F172A]">{job.total}</span> rows
                        {pct != null && <span className="text-[#94A3B8]"> · {pct}%</span>}
                      </span>
                    )}
                    {job.successCount != null && (
                      <span className="hidden sm:flex items-center gap-1 text-xs text-[#10B981]">
                        <CheckCircle2 size={12} />
                        {job.successCount}
                      </span>
                    )}
                    {job.failedCount > 0 && (
                      <span className="flex items-center gap-1 text-xs text-[#EF4444]">
                        <FileX size={12} />
                        {job.failedCount}
                      </span>
                    )}
                    <span
                      className="text-xs font-semibold px-2.5 py-1 rounded-full shrink-0"
                      style={{ color: cfg.color, backgroundColor: cfg.bg }}
                    >
                      {cfg.label}
                    </span>
                  </div>
                </button>
              );
            })}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between px-5 py-3 border-t border-[#F1F5F9] bg-[#F8FAFC]">
              <p className="text-xs text-[#94A3B8]">
                Page {page} of {totalPages}
                {pagination.total != null && ` · ${pagination.total} total`}
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

      </div>{/* overflow-hidden */}
      </div>{/* collapsible grid */}
    </div>
  );
}

// ─── Manual Entry Form ────────────────────────────────────────────────────────

function ManualEntryForm() {
  const router = useRouter();
  const createProduct = useCreateProduct();

  const thumbRef = useRef(null);
  const imagesRef = useRef(null);
  const [thumbPreview, setThumbPreview] = useState(null);
  const [imagePreviews, setImagePreviews] = useState([]);

  const { data: sizeResult }  = useSizeCategories({ limit: 100 });
  const { data: spaceResult } = useSpaceCategories({ limit: 100 });
  const { data: styleResult } = useProductStyle({ limit: 100 });
  const { data: usageResult } = useTileUsageCategories({ limit: 100 });

  const sizeCategories      = sizeResult?.data  ?? [];
  const spaceCategories     = spaceResult?.data ?? [];
  const productStyles       = styleResult?.data ?? [];
  const tileUsageCategories = usageResult?.data ?? [];

  const {
    register, handleSubmit, control, watch,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: yupResolver(manualSchema),
    defaultValues: {
      status: "active",
      isFreeDelivery: false,
      isFeatured: false,
      spaceCategories: [],
      productStyles: [],
      tileUsageCategories: [],
    },
  });

  const isFreeDelivery = watch("isFreeDelivery");

  const onSubmit = async (data) => {
    const thumbFile = thumbRef.current?.files?.[0];
    if (!thumbFile) { toast.error("Thumbnail image is required"); return; }
    const imageFiles = Array.from(imagesRef.current?.files ?? []);
    await createProduct.mutateAsync({ ...data, thumbnail: thumbFile, images: imageFiles });
    router.push("/dashboard/product-catalogue");
  };

  const handleThumbChange = (e) => {
    const file = e.target.files?.[0];
    if (file) setThumbPreview(URL.createObjectURL(file));
  };

  const handleImagesChange = (e) => {
    const files = Array.from(e.target.files ?? []);
    setImagePreviews(files.map((f) => URL.createObjectURL(f)));
  };

  const removeGalleryImage = (idx) => {
    setImagePreviews((prev) => prev.filter((_, i) => i !== idx));
    if (imagesRef.current) imagesRef.current.value = "";
  };

  return (
    <form id="add-product-form" onSubmit={handleSubmit(onSubmit)} className="animate-[fadeInScale_0.2s_ease_both]">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* LEFT COLUMN */}
        <div className="lg:col-span-2 space-y-6">
          <SectionCard title="Basic Information">
            <Field label="Product Name" required error={errors.name?.message}>
              <Input placeholder="e.g. MOBON DOLCE CALCATTA" {...register("name")} />
            </Field>
            <Field label="Short Description" error={errors.shortDescription?.message}>
              <Input placeholder="One-line summary shown in listings" {...register("shortDescription")} />
            </Field>
            <Field label="Description" error={errors.description?.message}>
              <textarea
                placeholder="Full product description…"
                rows={4}
                {...register("description")}
                className="w-full rounded-lg border border-[#E2E8F0] bg-white px-3 py-2 text-sm text-[#0F172A] placeholder:text-[#94A3B8] focus:outline-none focus:ring-2 focus:ring-[#6366F1]/30 resize-none"
              />
            </Field>
          </SectionCard>

          <SectionCard title="Pricing">
            <FieldRow>
              <Field label="Price (₹)" required error={errors.price?.message}>
                <Input type="number" step="0.01" placeholder="e.g. 750" {...register("price")} />
              </Field>
              <Field label="Sale Price (₹)" error={errors.salePrice?.message}>
                <Input type="number" step="0.01" placeholder="e.g. 620" {...register("salePrice")} />
              </Field>
            </FieldRow>
            <FieldRow>
              <Field label="Discount (%)" error={errors.discountPercent?.message}>
                <Input type="number" step="0.01" placeholder="e.g. 10" {...register("discountPercent")} />
              </Field>
              <Field label="GST (%)" error={errors.gst?.message}>
                <Input type="number" step="0.01" placeholder="e.g. 18" {...register("gst")} />
              </Field>
            </FieldRow>
            <FieldRow>
              <Field label="Price per Sqft (₹)" error={errors.pricePerSqft?.message}>
                <Input type="number" step="0.01" placeholder="e.g. 75" {...register("pricePerSqft")} />
              </Field>
              <Field label="Purchase Price (₹)" error={errors.purchasePrice?.message}>
                <Input type="number" step="0.01" placeholder="e.g. 500" {...register("purchasePrice")} />
              </Field>
            </FieldRow>
          </SectionCard>

          <SectionCard title="Product Details">
            <FieldRow>
              <Field label="Brand" error={errors.brand?.message}>
                <Input placeholder="e.g. SOMANY" {...register("brand")} />
              </Field>
              <Field label="Finish" error={errors.finish?.message}>
                <Input placeholder="e.g. GLOSSY, MATT" {...register("finish")} />
              </Field>
            </FieldRow>
            <FieldRow>
              <Field label="Vendor" error={errors.vendor?.message}>
                <Input placeholder="e.g. ABC Distributors" {...register("vendor")} />
              </Field>
              <Field label="Square Feet" error={errors.squareFeet?.message}>
                <Input placeholder="e.g. 600×600" {...register("squareFeet")} />
              </Field>
            </FieldRow>
            <FieldRow>
              <Field label="Dimension — Length (mm)" error={errors.dimensionsLength?.message}>
                <Input type="number" step="0.1" placeholder="e.g. 600" {...register("dimensionsLength")} />
              </Field>
              <Field label="Dimension — Width (mm)" error={errors.dimensionsWidth?.message}>
                <Input type="number" step="0.1" placeholder="e.g. 600" {...register("dimensionsWidth")} />
              </Field>
            </FieldRow>
            <Field label="Weight (kg)" error={errors.weight?.message}>
              <Input type="number" step="0.01" placeholder="e.g. 2.5" {...register("weight")} className="max-w-xs" />
            </Field>
          </SectionCard>

          <SectionCard title="Identifiers & SKU">
            <FieldRow>
              <Field label="HSN Code" error={errors.hsnCode?.message}>
                <Input placeholder="e.g. 69072100" {...register("hsnCode")} />
              </Field>
              <Field label="Batch No." error={errors.batchNo?.message}>
                <Input placeholder="e.g. B2024001" {...register("batchNo")} />
              </Field>
            </FieldRow>
            <FieldRow>
              <Field label="SKU" error={errors.sku?.message}>
                <Input placeholder="e.g. TLE-600-GLS" {...register("sku")} />
              </Field>
              <Field label="Barcode" error={errors.barcode?.message}>
                <Input placeholder="e.g. 8901234567890" {...register("barcode")} />
              </Field>
            </FieldRow>
          </SectionCard>

          <SectionCard title="Inventory">
            <FieldRow>
              <Field label="Stock Quantity" error={errors.stock?.message}>
                <Input type="number" placeholder="e.g. 100" {...register("stock")} />
              </Field>
              <Field label="Tiles per Box" error={errors.tileInBox?.message}>
                <Input type="number" placeholder="e.g. 4" {...register("tileInBox")} />
              </Field>
            </FieldRow>
            <FieldRow>
              <Field label="Min. Order Quantity" error={errors.minOrderQuantity?.message}>
                <Input type="number" placeholder="e.g. 1" {...register("minOrderQuantity")} />
              </Field>
              <Field label="Max. Order Quantity" error={errors.maxOrderQuantity?.message}>
                <Input type="number" placeholder="e.g. 500" {...register("maxOrderQuantity")} />
              </Field>
            </FieldRow>
          </SectionCard>
        </div>

        {/* RIGHT COLUMN */}
        <div className="space-y-6">
          <SectionCard title="Thumbnail Image">
            {thumbPreview ? (
              <div className="relative rounded-xl overflow-hidden border border-[#E2E8F0]">
                <img src={thumbPreview} alt="" className="w-full h-48 object-cover" />
                <button
                  type="button"
                  onClick={() => { setThumbPreview(null); if (thumbRef.current) thumbRef.current.value = ""; }}
                  className="absolute top-2 right-2 w-7 h-7 bg-black/50 rounded-full flex items-center justify-center hover:bg-black/70 transition-colors"
                >
                  <X size={13} className="text-white" />
                </button>
              </div>
            ) : (
              <label className="flex flex-col items-center justify-center gap-2 w-full h-36 border-2 border-dashed border-[#E2E8F0] rounded-xl cursor-pointer hover:border-[#6366F1]/50 hover:bg-[#EEF2FF]/30 transition-colors">
                <ImagePlus size={22} className="text-[#94A3B8]" />
                <span className="text-sm text-[#94A3B8]">Click to upload thumbnail</span>
                <span className="text-xs text-[#CBD5E1]">PNG, JPG, WEBP</span>
                <input ref={thumbRef} type="file" accept="image/*" hidden onChange={handleThumbChange} />
              </label>
            )}
            <Field label="Thumbnail Alt Text" error={errors.thumbnailAlt?.message}>
              <Input placeholder="Describe the image for SEO" {...register("thumbnailAlt")} />
            </Field>
          </SectionCard>

          <SectionCard title="Gallery Images">
            <label className="flex flex-col items-center justify-center gap-2 w-full h-24 border-2 border-dashed border-[#E2E8F0] rounded-xl cursor-pointer hover:border-[#6366F1]/50 hover:bg-[#EEF2FF]/30 transition-colors">
              <Upload size={18} className="text-[#94A3B8]" />
              <span className="text-sm text-[#94A3B8]">Upload gallery images</span>
              <input ref={imagesRef} type="file" accept="image/*" multiple hidden onChange={handleImagesChange} />
            </label>
            {imagePreviews.length > 0 && (
              <div className="grid grid-cols-3 gap-2 mt-2">
                {imagePreviews.map((src, i) => (
                  <div key={i} className="relative rounded-lg overflow-hidden border border-[#E2E8F0]">
                    <img src={src} alt="" className="w-full h-20 object-cover" />
                    <button
                      type="button"
                      onClick={() => removeGalleryImage(i)}
                      className="absolute top-0.5 right-0.5 w-5 h-5 bg-black/50 rounded-full flex items-center justify-center hover:bg-black/70 transition-colors"
                    >
                      <X size={9} className="text-white" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </SectionCard>

          <SectionCard title="Settings">
            <div className="space-y-3">
              <div className="space-y-1.5">
                <Label>Status</Label>
                <Controller
                  name="status"
                  control={control}
                  render={({ field }) => (
                    <Select value={field.value} onValueChange={field.onChange}>
                      <SelectTrigger>
                        <span className="text-sm capitalize">{field.value || "active"}</span>
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="active">Active</SelectItem>
                        <SelectItem value="inactive">Inactive</SelectItem>
                      </SelectContent>
                    </Select>
                  )}
                />
              </div>
              <div className="flex items-center justify-between py-2 border-t border-[#F1F5F9]">
                <div>
                  <p className="text-sm font-medium text-[#0F172A]">Featured</p>
                  <p className="text-xs text-[#94A3B8]">Show on featured section</p>
                </div>
                <Controller
                  name="isFeatured"
                  control={control}
                  render={({ field }) => <Toggle checked={field.value} onChange={field.onChange} />}
                />
              </div>
              <div className="flex items-center justify-between py-2 border-t border-[#F1F5F9]">
                <div>
                  <p className="text-sm font-medium text-[#0F172A]">Free Delivery</p>
                  <p className="text-xs text-[#94A3B8]">Waive delivery charges</p>
                </div>
                <Controller
                  name="isFreeDelivery"
                  control={control}
                  render={({ field }) => <Toggle checked={field.value} onChange={field.onChange} />}
                />
              </div>
              {!isFreeDelivery && (
                <Field label="Delivery Fee (₹)" error={errors.deliveryFee?.message}>
                  <Input type="number" step="0.01" placeholder="e.g. 150" {...register("deliveryFee")} />
                </Field>
              )}
            </div>
          </SectionCard>

          <SectionCard title="Categories">
            <div className="space-y-3">
              <div className="space-y-1.5">
                <Label>Size Category</Label>
                <Controller
                  name="sizeCategory"
                  control={control}
                  render={({ field }) => (
                    <Select value={field.value ?? ""} onValueChange={field.onChange}>
                      <SelectTrigger>
                        <span className="text-sm">
                          {sizeCategories.find((c) => c._id === field.value)?.name ?? "Select size…"}
                        </span>
                      </SelectTrigger>
                      <SelectContent>
                        {sizeCategories.map((c) => (
                          <SelectItem key={c._id} value={c._id}>{c.name}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                />
              </div>
              <div className="space-y-1.5">
                <Label>Space Categories</Label>
                <Controller
                  name="spaceCategories"
                  control={control}
                  render={({ field }) => (
                    <MultiSelect options={spaceCategories} value={field.value} onChange={field.onChange} placeholder="Select spaces…" />
                  )}
                />
              </div>
              <div className="space-y-1.5">
                <Label>Product Styles</Label>
                <Controller
                  name="productStyles"
                  control={control}
                  render={({ field }) => (
                    <MultiSelect options={Array.isArray(productStyles) ? productStyles : []} value={field.value} onChange={field.onChange} placeholder="Select styles…" />
                  )}
                />
              </div>
              <div className="space-y-1.5">
                <Label>Tile Usage</Label>
                <Controller
                  name="tileUsageCategories"
                  control={control}
                  render={({ field }) => (
                    <MultiSelect options={Array.isArray(tileUsageCategories) ? tileUsageCategories : []} value={field.value} onChange={field.onChange} placeholder="Select usage types…" />
                  )}
                />
              </div>
            </div>
          </SectionCard>
        </div>
      </div>
    </form>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function AddProductPage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState("manual");

  return (
    <div className="space-y-5">
      {/* Page header */}
      <div className="bg-white rounded-2xl border border-[#E2E8F0] shadow-sm px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => router.push("/dashboard/product-catalogue")}
            className="w-8 h-8 rounded-xl bg-[#F1F5F9] hover:bg-[#E2E8F0] flex items-center justify-center transition-colors cursor-pointer"
          >
            <ArrowLeft size={16} className="text-[#64748B]" />
          </button>
          <div>
            <h1 className="text-lg font-bold text-[#0F172A]">Add Products</h1>
            <p className="text-xs text-[#94A3B8]">Create individually or import in bulk from Excel</p>
          </div>
        </div>
        {activeTab === "manual" && (
          <div className="flex items-center gap-3">
            <Button type="button" variant="ghost" onClick={() => router.push("/dashboard/product-catalogue")}>
              Cancel
            </Button>
            <Button type="submit" form="add-product-form" className="gap-1.5">
              <Package size={14} /> Add Product
            </Button>
          </div>
        )}
      </div>

      {/* Animated tab switcher */}
      <TabSwitcher active={activeTab} onChange={setActiveTab} />

      {/* Tab content */}
      {activeTab === "manual" ? (
        <ManualEntryForm key="manual" />
      ) : (
        <BulkUploadForm key="bulk" />
      )}
    </div>
  );
}
