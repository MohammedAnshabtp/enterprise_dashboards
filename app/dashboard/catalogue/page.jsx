"use client";

import { useState, useEffect, useRef } from "react";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import {
  Plus, Search, Pencil, Trash2, FileText, ExternalLink,
  ChevronLeft, ChevronRight, BookOpen, LayoutGrid, List,
  Eye, X, AlertTriangle, Loader2,
} from "lucide-react";
import {
  useCatalogue, useCreateCatalogue, useUpdateCatalogue, useDeleteCatalogue,
} from "../../hooks/useCatalogue";
import dayjs from "../../lib/dayjs";
import { Button }  from "../../components/ui/button";
import { Input }   from "../../components/ui/input";
import { Label }   from "../../components/ui/label";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle,
} from "../../components/ui/dialog";
import ButtonLoader from "../../components/ui/ButtonLoader";
import EmptyState   from "../../components/ui/EmptyState";

// ─── Helpers ──────────────────────────────────────────────────────────────────

const schema = yup.object({
  name:        yup.string().required("Name is required"),
  description: yup.string().nullable(),
});

const formatBytes = (bytes) => {
  if (!bytes) return "—";
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
};

// ─── PDF Cover Fallback (CSS-only, shown while loading or on error) ──────────

function PdfCover({ name }) {
  const initials = name
    ? name.split(" ").slice(0, 2).map((w) => w[0]?.toUpperCase()).join("")
    : "PD";
  return (
    <div className="relative w-full h-full bg-linear-to-br from-[#6366F1] via-[#7C3AED] to-[#4F46E5] overflow-hidden flex items-end justify-center pb-2">
      <div
        className="absolute inset-0 opacity-[0.08]"
        style={{ backgroundImage: "radial-gradient(circle, white 1px, transparent 1px)", backgroundSize: "20px 20px" }}
      />
      <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[110px] h-1.5 bg-black/20 rounded-full blur-sm" />
      <div className="relative w-[100px] h-[130px] bg-white rounded-t-xl shadow-2xl flex flex-col overflow-hidden mb-0">
        <div className="h-1.5 w-full bg-linear-to-r from-[#6366F1] to-[#818CF8]" />
        <div className="flex items-center justify-center pt-4 pb-2">
          <span className="text-xl font-black text-[#6366F1]/20 tracking-tight leading-none select-none">{initials}</span>
        </div>
        <div className="px-3 space-y-1.5 flex-1">
          {[1, 0.7, 1, 0.5, 1, 0.8, 0.6].map((w, i) => (
            <div key={i} className="h-1 bg-[#E2E8F0] rounded-full" style={{ width: `${w * 100}%` }} />
          ))}
        </div>
        <div className="absolute top-2 right-2 bg-[#EF4444] text-white text-[8px] font-black px-1 py-0.5 rounded leading-none shadow">PDF</div>
      </div>
    </div>
  );
}

// ─── PDF Thumbnail — renders first page via pdfjs (no auth header = no CORS preflight) ──

function PdfThumbnail({ url, name }) {
  const canvasRef = useRef(null);
  const [done, setDone] = useState(false);

  useEffect(() => {
    if (!url) return;
    let cancelled = false;

    (async () => {
      try {
        const pdfjs = await import("pdfjs-dist");
        pdfjs.GlobalWorkerOptions.workerSrc =
          `https://unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`;

        const pdf = await pdfjs.getDocument({ url }).promise;
        if (cancelled) return;

        const page = await pdf.getPage(1);
        if (cancelled) return;

        const canvas = canvasRef.current;
        if (!canvas) return;

        const vp0 = page.getViewport({ scale: 1 });
        const scale = (canvas.parentElement?.clientWidth || 300) / vp0.width;
        const vp = page.getViewport({ scale });
        canvas.width  = vp.width;
        canvas.height = vp.height;

        await page.render({ canvasContext: canvas.getContext("2d"), viewport: vp }).promise;
        if (!cancelled) setDone(true);
      } catch {
        // leave done=false, CSS cover stays visible
      }
    })();

    return () => { cancelled = true; };
  }, [url]);

  return (
    <div className="relative w-full h-full overflow-hidden">
      {!done && <div className="absolute inset-0"><PdfCover name={name} /></div>}
      <canvas
        ref={canvasRef}
        className={`w-full h-full object-cover transition-opacity duration-300 ${done ? "opacity-100" : "opacity-0 absolute inset-0"}`}
      />
    </div>
  );
}

// ─── PDF Preview Modal — direct iframe, no fetch/CORS issues ─────────────────

function PdfPreviewModal({ item, onClose }) {
  const [iframeLoaded, setIframeLoaded] = useState(false);

  // reset loading state when item changes
  useEffect(() => { setIframeLoaded(false); }, [item?._id]);

  return (
    <Dialog open={!!item} onOpenChange={onClose}>
      <DialogContent
        showClose={false}
        className="max-w-5xl p-0 overflow-hidden rounded-2xl"
        style={{ height: "88vh", display: "flex", flexDirection: "column" }}
      >
        {/* Header */}
        <div className="flex items-center gap-3 px-5 py-3.5 border-b border-[#E2E8F0] bg-[#F8FAFC] shrink-0">
          <div className="w-8 h-8 rounded-lg bg-[#EEF2FF] flex items-center justify-center shrink-0">
            <FileText size={15} className="text-[#6366F1]" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-[#0F172A] truncate">{item?.name}</p>
            <p className="text-xs text-[#94A3B8]">{formatBytes(item?.file?.size)}</p>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            {item?.file?.url && (
              <a
                href={item.file.url}
                target="_blank"
                rel="noreferrer"
                className="flex items-center gap-1.5 text-xs font-medium text-[#6366F1] px-3 py-1.5 rounded-lg border border-[#6366F1]/30 hover:bg-[#EEF2FF] transition-colors"
              >
                <ExternalLink size={12} /> Open in tab
              </a>
            )}
            <button
              onClick={onClose}
              className="w-8 h-8 rounded-lg flex items-center justify-center text-[#94A3B8] hover:bg-[#E2E8F0] hover:text-[#0F172A] transition-colors cursor-pointer"
            >
              <X size={16} />
            </button>
          </div>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-hidden bg-[#475569] relative">
          {/* Loading overlay — shown until iframe fires onLoad */}
          {!iframeLoaded && (
            <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 text-white/70 z-10">
              <Loader2 size={28} className="animate-spin" />
              <p className="text-sm">Loading PDF…</p>
            </div>
          )}
          {item?.file?.url ? (
            <iframe
              key={item._id}
              src={item.file.url}
              className="w-full h-full border-0"
              title={item.name}
              onLoad={() => setIframeLoaded(true)}
            />
          ) : (
            <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 text-white/50">
              <FileText size={40} />
              <p className="text-sm">No file available</p>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}

// ─── Grid Card ────────────────────────────────────────────────────────────────

function CatalogueCard({ item, onEdit, onDelete, onPreview }) {
  return (
    <div className="bg-white rounded-2xl border border-[#E2E8F0] shadow-sm hover:shadow-lg hover:border-[#6366F1]/25 transition-all duration-200 overflow-hidden group flex flex-col animate-[fadeInScale_0.2s_ease_both]">
      {/* Thumbnail */}
      <div className="relative h-44 overflow-hidden">
        <PdfThumbnail url={item.file?.url} name={item.name} />
        {/* Edit / Delete on hover */}
        <div className="absolute top-2.5 right-2.5 flex gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity duration-150">
          <button
            onClick={onEdit}
            className="w-7 h-7 bg-white/90 backdrop-blur-sm rounded-lg flex items-center justify-center shadow-sm hover:bg-white transition-colors cursor-pointer"
            title="Edit"
          >
            <Pencil size={12} className="text-[#6366F1]" />
          </button>
          <button
            onClick={onDelete}
            className="w-7 h-7 bg-white/90 backdrop-blur-sm rounded-lg flex items-center justify-center shadow-sm hover:bg-red-50 transition-colors cursor-pointer"
            title="Delete"
          >
            <Trash2 size={12} className="text-[#EF4444]" />
          </button>
        </div>
      </div>

      {/* Info */}
      <div className="p-4 flex flex-col flex-1">
        <h3 className="font-bold text-[#0F172A] text-sm leading-snug line-clamp-1">{item.name}</h3>
        {item.description ? (
          <p className="text-xs text-[#94A3B8] mt-1 line-clamp-2 leading-relaxed">{item.description}</p>
        ) : (
          <p className="text-xs text-[#CBD5E1] mt-1 italic">No description</p>
        )}

        <div className="flex items-center justify-between mt-3 pt-3 border-t border-[#F1F5F9] text-[11px] text-[#94A3B8]">
          <span className="font-medium">{formatBytes(item.file?.size)}</span>
          <span>{dayjs(item.createdAt).format("DD MMM YYYY")}</span>
        </div>

        {/* Always-visible action buttons */}
        {item.file?.url && (
          <div className="flex gap-2 mt-3">
            <button
              onClick={onPreview}
              className="flex-1 flex items-center justify-center gap-1.5 h-8 rounded-lg bg-[#EEF2FF] text-[#6366F1] text-xs font-semibold hover:bg-[#E0E7FF] transition-colors cursor-pointer"
            >
              <Eye size={13} /> Preview
            </button>
            <a
              href={item.file.url}
              target="_blank"
              rel="noreferrer"
              className="flex-1 flex items-center justify-center gap-1.5 h-8 rounded-lg bg-[#6366F1] text-white text-xs font-semibold hover:bg-[#4F46E5] transition-colors"
            >
              <ExternalLink size={13} /> Open PDF
            </a>
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

const LIMIT = 12;

export default function CataloguePage() {
  const [page, setPage]           = useState(1);
  const [search, setSearch]       = useState("");
  const [debSearch, setDeb]       = useState("");
  const [viewMode, setView]       = useState("grid");
  const [modalOpen, setModal]     = useState(false);
  const [editItem, setEdit]       = useState(null);
  const [deleteTarget, setDel]    = useState(null);
  const [previewItem, setPreview] = useState(null);
  const [fileName, setFileName]   = useState("");
  const fileRef  = useRef(null);
  const debRef   = useRef(null);

  useEffect(() => {
    clearTimeout(debRef.current);
    debRef.current = setTimeout(() => { setDeb(search); setPage(1); }, 400);
    return () => clearTimeout(debRef.current);
  }, [search]);

  const params = { page, limit: LIMIT, ...(debSearch && { search: debSearch }) };
  const { data: result, isLoading, isFetching } = useCatalogue(params);
  const items      = result?.data       ?? [];
  const pagination = result?.pagination ?? {};

  const create = useCreateCatalogue();
  const update = useUpdateCatalogue();
  const del    = useDeleteCatalogue();

  const {
    register, handleSubmit, reset,
    formState: { errors, isSubmitting },
  } = useForm({ resolver: yupResolver(schema), defaultValues: { name: "", description: "" } });

  const openAdd = () => {
    setEdit(null); setFileName("");
    if (fileRef.current) fileRef.current.value = "";
    reset({ name: "", description: "" });
    setModal(true);
  };

  const openEdit = (item) => {
    setEdit(item); setFileName("");
    if (fileRef.current) fileRef.current.value = "";
    reset({ name: item.name ?? "", description: item.description ?? "" });
    setModal(true);
  };

  const onSubmit = async (data) => {
    const file = fileRef.current?.files?.[0];
    if (editItem) await update.mutateAsync({ id: editItem._id, data: { name: data.name, description: data.description || "", file } });
    else          await create.mutateAsync({ name: data.name, description: data.description || "", file });
    setModal(false);
  };

  const confirmDelete = () => { del.mutate(deleteTarget._id); setDel(null); };
  const isPending = create.isPending || update.isPending;

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="bg-white rounded-2xl border border-[#E2E8F0] shadow-sm px-6 py-4">
        <div className="flex flex-col sm:flex-row sm:items-center gap-4">
          <div className="flex items-center gap-3 flex-1">
            <div className="w-10 h-10 rounded-xl bg-[#EEF2FF] flex items-center justify-center shrink-0">
              <BookOpen size={18} className="text-[#6366F1]" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-[#0F172A]">Catalogue</h1>
              <p className="text-xs text-[#94A3B8]">
                {pagination.totalItems != null
                  ? `${pagination.totalItems} catalogue${pagination.totalItems !== 1 ? "s" : ""}`
                  : "Manage product catalogues"}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            <div className="relative">
              <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#94A3B8]" />
              <Input
                placeholder="Search…"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-8 w-44 h-9 text-sm"
              />
            </div>
            <div className="flex items-center bg-[#F1F5F9] rounded-xl p-0.5 gap-0.5">
              {[["grid", LayoutGrid], ["list", List]].map(([mode, Icon]) => (
                <button
                  key={mode}
                  onClick={() => setView(mode)}
                  className={`w-7 h-7 rounded-lg flex items-center justify-center transition-colors cursor-pointer ${
                    viewMode === mode ? "bg-white shadow-sm text-[#6366F1]" : "text-[#94A3B8] hover:text-[#64748B]"
                  }`}
                >
                  <Icon size={14} />
                </button>
              ))}
            </div>
            <Button onClick={openAdd} size="sm" className="gap-1.5">
              <Plus size={14} /> Add Catalogue
            </Button>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className={`transition-opacity duration-150 ${isFetching && !isLoading ? "opacity-60" : ""}`}>
        {isLoading ? (
          viewMode === "grid" ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
              {Array.from({ length: 8 }).map((_, i) => (
                <div key={i} className="bg-white rounded-2xl border border-[#E2E8F0] overflow-hidden animate-pulse">
                  <div className="h-44 bg-linear-to-br from-[#E0E7FF] to-[#EEF2FF]" />
                  <div className="p-4 space-y-2.5">
                    <div className="h-4 bg-[#F1F5F9] rounded w-3/4" />
                    <div className="h-3 bg-[#F1F5F9] rounded w-1/2" />
                    <div className="h-8 bg-[#F1F5F9] rounded-lg mt-3" />
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="bg-white rounded-2xl border border-[#E2E8F0] overflow-hidden">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className={`flex gap-4 p-4 animate-pulse ${i > 0 ? "border-t border-[#F1F5F9]" : ""}`}>
                  <div className="w-12 h-14 bg-[#F1F5F9] rounded-xl shrink-0" />
                  <div className="flex-1 space-y-2">
                    <div className="h-4 bg-[#F1F5F9] rounded w-1/3" />
                    <div className="h-3 bg-[#F1F5F9] rounded w-1/2" />
                  </div>
                  <div className="w-20 h-7 bg-[#F1F5F9] rounded-lg shrink-0" />
                </div>
              ))}
            </div>
          )
        ) : items.length === 0 ? (
          <EmptyState icon={BookOpen} title="No catalogues yet" description="Upload your first product catalogue PDF." />
        ) : viewMode === "grid" ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
            {items.map((item) => (
              <CatalogueCard
                key={item._id}
                item={item}
                onEdit={() => openEdit(item)}
                onDelete={() => setDel(item)}
                onPreview={() => setPreview(item)}
              />
            ))}
          </div>
        ) : (
          /* List view */
          <div className="bg-white rounded-2xl border border-[#E2E8F0] shadow-sm overflow-hidden">
            <div className="hidden md:grid grid-cols-[minmax(0,1fr)_100px_110px_200px_72px] gap-4 px-5 py-2.5 bg-[#F8FAFC] border-b border-[#E2E8F0]">
              {["CATALOGUE", "SIZE", "UPLOADED", "ACTIONS", ""].map((h) => (
                <span key={h} className="text-[10px] font-bold text-[#94A3B8] uppercase tracking-widest">{h}</span>
              ))}
            </div>
            <div className="divide-y divide-[#F1F5F9]">
              {items.map((item) => (
                <div
                  key={item._id}
                  className="group flex flex-col md:grid md:grid-cols-[minmax(0,1fr)_100px_110px_200px_72px] md:items-center gap-3 md:gap-4 px-5 py-4 hover:bg-[#FAFBFF] transition-colors"
                >
                  {/* Name + desc */}
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-10 h-12 rounded-xl bg-linear-to-br from-[#6366F1] to-[#818CF8] flex items-center justify-center shrink-0 shadow-sm">
                      <FileText size={16} className="text-white" />
                    </div>
                    <div className="min-w-0">
                      <p className="font-semibold text-sm text-[#0F172A] truncate">{item.name}</p>
                      {item.description && (
                        <p className="text-xs text-[#94A3B8] truncate">{item.description}</p>
                      )}
                    </div>
                  </div>

                  <span className="text-sm text-[#64748B]">{formatBytes(item.file?.size)}</span>
                  <span className="text-sm text-[#64748B]">{dayjs(item.createdAt).format("DD MMM YYYY")}</span>

                  {/* Action buttons — always visible in list */}
                  <div className="flex items-center gap-2">
                    {item.file?.url && (
                      <>
                        <button
                          onClick={() => setPreview(item)}
                          className="flex items-center gap-1.5 px-3 h-8 rounded-lg bg-[#EEF2FF] text-[#6366F1] text-xs font-semibold hover:bg-[#E0E7FF] transition-colors cursor-pointer"
                        >
                          <Eye size={12} /> Preview
                        </button>
                        <a
                          href={item.file.url}
                          target="_blank"
                          rel="noreferrer"
                          className="flex items-center gap-1.5 px-3 h-8 rounded-lg bg-[#6366F1] text-white text-xs font-semibold hover:bg-[#4F46E5] transition-colors"
                        >
                          <ExternalLink size={12} /> Open
                        </a>
                      </>
                    )}
                  </div>

                  <div className="flex gap-1 md:opacity-0 md:group-hover:opacity-100 transition-opacity">
                    <button onClick={() => openEdit(item)} className="w-8 h-8 rounded-lg flex items-center justify-center hover:bg-[#EEF2FF] transition-colors cursor-pointer">
                      <Pencil size={13} className="text-[#6366F1]" />
                    </button>
                    <button onClick={() => setDel(item)} className="w-8 h-8 rounded-lg flex items-center justify-center hover:bg-[#FEE2E2] transition-colors cursor-pointer">
                      <Trash2 size={13} className="text-[#EF4444]" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Pagination */}
      {pagination.totalPages > 1 && (
        <div className="flex items-center justify-between bg-white rounded-2xl border border-[#E2E8F0] shadow-sm px-5 py-3">
          <p className="text-xs text-[#94A3B8]">
            {(() => {
              const from = (pagination.currentPage - 1) * pagination.itemsPerPage + 1;
              const to   = Math.min(pagination.currentPage * pagination.itemsPerPage, pagination.totalItems);
              return `${from}–${to} of ${pagination.totalItems}`;
            })()}
          </p>
          <div className="flex items-center gap-1">
            <Button variant="ghost" size="sm" onClick={() => setPage((p) => p - 1)} disabled={!pagination.hasPrevPage || isFetching}>
              <ChevronLeft size={14} />
            </Button>
            {Array.from({ length: pagination.totalPages }, (_, i) => i + 1)
              .filter((p) => p === 1 || p === pagination.totalPages || Math.abs(p - pagination.currentPage) <= 1)
              .reduce((acc, p, i, arr) => { if (i > 0 && p - arr[i - 1] > 1) acc.push("…"); acc.push(p); return acc; }, [])
              .map((p, i) =>
                p === "…" ? (
                  <span key={`e${i}`} className="w-8 text-center text-sm text-[#94A3B8]">…</span>
                ) : (
                  <button
                    key={p}
                    onClick={() => setPage(p)}
                    disabled={isFetching}
                    className={`w-8 h-8 rounded-lg text-xs font-medium transition-all cursor-pointer ${
                      p === pagination.currentPage
                        ? "bg-[#6366F1] text-white shadow-sm"
                        : "text-[#64748B] hover:bg-[#F1F5F9]"
                    }`}
                  >
                    {p}
                  </button>
                )
              )}
            <Button variant="ghost" size="sm" onClick={() => setPage((p) => p + 1)} disabled={!pagination.hasNextPage || isFetching}>
              <ChevronRight size={14} />
            </Button>
          </div>
        </div>
      )}

      {/* PDF Preview Modal */}
      <PdfPreviewModal item={previewItem} onClose={() => setPreview(null)} />

      {/* Add / Edit Dialog */}
      <Dialog open={modalOpen} onOpenChange={setModal}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-[#EEF2FF] flex items-center justify-center">
                <BookOpen size={14} className="text-[#6366F1]" />
              </div>
              {editItem ? "Edit Catalogue" : "New Catalogue"}
            </DialogTitle>
          </DialogHeader>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 mt-1">
            <div className="space-y-1.5">
              <Label>Name <span className="text-red-500">*</span></Label>
              <Input placeholder="e.g. Floor Tiles Collection 2025" {...register("name")} />
              {errors.name && <p className="text-xs text-[#EF4444]">{errors.name.message}</p>}
            </div>

            <div className="space-y-1.5">
              <Label>Description <span className="text-[#94A3B8] font-normal text-xs">(optional)</span></Label>
              <textarea
                rows={3}
                placeholder="Brief description shown below the catalogue name…"
                {...register("description")}
                className="w-full rounded-xl border border-[#E2E8F0] bg-white px-3 py-2.5 text-sm placeholder:text-[#94A3B8] focus:outline-none focus:ring-2 focus:ring-[#6366F1]/30 resize-none"
              />
            </div>

            <div className="space-y-1.5">
              <Label>
                PDF File{" "}
                {!editItem
                  ? <span className="text-red-500">*</span>
                  : <span className="text-xs text-[#94A3B8] font-normal">(leave empty to keep current)</span>
                }
              </Label>
              {editItem?.file?.url && !fileName && (
                <div className="flex items-center gap-2 p-3 bg-[#F8FAFC] rounded-xl border border-[#E2E8F0]">
                  <div className="w-8 h-9 rounded-lg bg-linear-to-br from-[#6366F1] to-[#818CF8] flex items-center justify-center shrink-0">
                    <FileText size={13} className="text-white" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-medium text-[#0F172A] truncate">Current PDF</p>
                    <p className="text-[11px] text-[#94A3B8]">{formatBytes(editItem.file?.size)}</p>
                  </div>
                  <a
                    href={editItem.file.url}
                    target="_blank"
                    rel="noreferrer"
                    className="flex items-center gap-1 text-xs text-[#6366F1] font-medium hover:underline shrink-0"
                  >
                    <Eye size={12} /> View
                  </a>
                </div>
              )}
              <label className={`flex flex-col items-center justify-center gap-2 w-full border-2 border-dashed rounded-xl p-5 cursor-pointer transition-colors ${
                fileName
                  ? "border-[#10B981] bg-[#F0FDF4]"
                  : "border-[#E2E8F0] hover:border-[#6366F1]/50 hover:bg-[#EEF2FF]/20"
              }`}>
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${fileName ? "bg-[#D1FAE5]" : "bg-[#F1F5F9]"}`}>
                  <FileText size={18} className={fileName ? "text-[#10B981]" : "text-[#94A3B8]"} />
                </div>
                <div className="text-center">
                  <p className={`text-sm font-medium ${fileName ? "text-[#065F46]" : "text-[#64748B]"}`}>
                    {fileName || "Click to upload PDF"}
                  </p>
                  {!fileName && <p className="text-xs text-[#94A3B8] mt-0.5">PDF files only · Max 50 MB</p>}
                </div>
                <input
                  ref={fileRef}
                  type="file"
                  accept="application/pdf"
                  hidden
                  onChange={(e) => { const f = e.target.files?.[0]; if (f) setFileName(f.name); }}
                />
              </label>
            </div>

            <Button type="submit" disabled={isPending || isSubmitting} className="w-full">
              {isPending || isSubmitting
                ? <ButtonLoader text="Saving…" />
                : editItem ? "Update Catalogue" : "Add Catalogue"}
            </Button>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <Dialog open={!!deleteTarget} onOpenChange={() => setDel(null)}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-[#EF4444]">
              <Trash2 size={16} /> Delete Catalogue
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-3 mt-2">
            <p className="text-sm text-[#64748B]">
              Permanently delete{" "}
              <span className="font-semibold text-[#0F172A]">{deleteTarget?.name}</span>?
              The PDF file will also be removed.
            </p>
            <div className="flex items-start gap-2 bg-[#FFF8E1] rounded-xl px-3 py-2.5 border border-[#FDE68A]">
              <AlertTriangle size={13} className="text-[#D97706] shrink-0 mt-0.5" />
              <p className="text-xs text-[#92400E]">This cannot be undone. Customers who bookmarked this catalogue will lose access.</p>
            </div>
            <div className="flex gap-3 pt-1">
              <Button variant="ghost" className="flex-1" onClick={() => setDel(null)}>Cancel</Button>
              <Button
                className="flex-1 bg-[#EF4444] hover:bg-[#DC2626] text-white"
                onClick={confirmDelete}
                disabled={del.isPending}
              >
                {del.isPending ? <ButtonLoader text="Deleting…" /> : "Delete"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
