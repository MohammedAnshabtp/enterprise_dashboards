"use client";

import { useState, useEffect, useRef } from "react";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import {
  Plus, Search, Pencil, Trash2, FileText, ExternalLink,
  ChevronLeft, ChevronRight, BookOpen, LayoutGrid, List,
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

const LIMIT = 12;

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

export default function CataloguePage() {
  const [page, setPage]        = useState(1);
  const [search, setSearch]    = useState("");
  const [debSearch, setDeb]    = useState("");
  const [viewMode, setView]    = useState("grid");
  const [modalOpen, setModal]  = useState(false);
  const [editItem, setEdit]    = useState(null);
  const [deleteTarget, setDel] = useState(null);
  const [fileName, setFileName]= useState("");
  const fileRef                = useRef(null);
  const debRef                 = useRef(null);

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
  } = useForm({
    resolver: yupResolver(schema),
    defaultValues: { name: "", description: "" },
  });

  const openAdd = () => {
    setEdit(null);
    setFileName("");
    if (fileRef.current) fileRef.current.value = "";
    reset({ name: "", description: "" });
    setModal(true);
  };

  const openEdit = (item) => {
    setEdit(item);
    setFileName("");
    if (fileRef.current) fileRef.current.value = "";
    reset({ name: item.name ?? "", description: item.description ?? "" });
    setModal(true);
  };

  const onSubmit = async (data) => {
    const file = fileRef.current?.files?.[0];
    const payload = { name: data.name, description: data.description || "", file };

    if (editItem) {
      await update.mutateAsync({ id: editItem._id, data: payload });
    } else {
      await create.mutateAsync(payload);
    }
    setModal(false);
  };

  const confirmDelete = () => {
    del.mutate(deleteTarget._id);
    setDel(null);
  };

  const isPending = create.isPending || update.isPending;

  return (
    <div className="space-y-6">
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
                  ? `${pagination.totalItems} catalogues total`
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
            <div className="flex items-center bg-[#F1F5F9] rounded-xl p-1 gap-0.5">
              {[["grid", LayoutGrid], ["list", List]].map(([mode, Icon]) => (
                <button
                  key={mode}
                  onClick={() => setView(mode)}
                  className={`w-7 h-7 rounded-lg flex items-center justify-center transition-colors cursor-pointer ${
                    viewMode === mode
                      ? "bg-white shadow-sm text-[#6366F1]"
                      : "text-[#94A3B8] hover:text-[#64748B]"
                  }`}
                >
                  <Icon size={14} />
                </button>
              ))}
            </div>
            <Button onClick={openAdd} size="sm">
              <Plus size={14} className="mr-1.5" /> Add Catalogue
            </Button>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className={`transition-opacity duration-150 ${isFetching && !isLoading ? "opacity-60" : ""}`}>
        {isLoading ? (
          viewMode === "grid" ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
              {Array.from({ length: LIMIT }).map((_, i) => (
                <div key={i} className="bg-white rounded-2xl border border-[#E2E8F0] overflow-hidden animate-pulse">
                  <div className="h-36 bg-[#F1F5F9]" />
                  <div className="p-4 space-y-2">
                    <div className="h-4 bg-[#F1F5F9] rounded w-2/3" />
                    <div className="h-3 bg-[#F1F5F9] rounded w-1/2" />
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="bg-white rounded-2xl border border-[#E2E8F0] overflow-hidden">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className={`flex gap-4 p-4 animate-pulse ${i > 0 ? "border-t border-[#F1F5F9]" : ""}`}>
                  <div className="w-12 h-12 bg-[#F1F5F9] rounded-xl shrink-0" />
                  <div className="flex-1 space-y-2">
                    <div className="h-4 bg-[#F1F5F9] rounded w-1/3" />
                    <div className="h-3 bg-[#F1F5F9] rounded w-1/2" />
                  </div>
                </div>
              ))}
            </div>
          )
        ) : items.length === 0 ? (
          <EmptyState icon={BookOpen} title="No catalogues found" />
        ) : viewMode === "grid" ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
            {items.map((item) => (
              <div
                key={item._id}
                className="bg-white rounded-2xl border border-[#E2E8F0] shadow-sm hover:shadow-md hover:border-[#6366F1]/30 transition-all duration-200 overflow-hidden group flex flex-col"
              >
                <div className="h-36 bg-linear-to-br from-[#EEF2FF] to-[#E0E7FF] flex items-center justify-center relative">
                  <FileText size={40} className="text-[#6366F1]/40" />
                  <div className="absolute top-2 right-2 flex gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                    <button
                      onClick={() => openEdit(item)}
                      className="w-8 h-8 bg-white rounded-full flex items-center justify-center shadow hover:bg-[#EEF2FF] transition-colors"
                    >
                      <Pencil size={13} className="text-[#6366F1]" />
                    </button>
                    <button
                      onClick={() => setDel(item)}
                      className="w-8 h-8 bg-white rounded-full flex items-center justify-center shadow hover:bg-red-50 transition-colors"
                    >
                      <Trash2 size={13} className="text-red-500" />
                    </button>
                  </div>
                </div>
                <div className="p-4 flex flex-col flex-1">
                  <h3 className="font-semibold text-[#0F172A] text-sm truncate">{item.name}</h3>
                  {item.description && (
                    <p className="text-xs text-[#94A3B8] mt-1 line-clamp-2">{item.description}</p>
                  )}
                  <div className="flex items-center justify-between mt-auto pt-3">
                    <span className="text-xs text-[#94A3B8]">{formatBytes(item.file?.size)}</span>
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-[#94A3B8]">
                        {dayjs(item.createdAt).format("DD MMM YYYY")}
                      </span>
                      {item.file?.url && (
                        <a
                          href={item.file.url}
                          target="_blank"
                          rel="noreferrer"
                          className="text-[#6366F1] hover:text-[#4F46E5] transition-colors"
                        >
                          <ExternalLink size={13} />
                        </a>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="bg-white rounded-2xl border border-[#E2E8F0] shadow-sm overflow-hidden">
            {items.map((item, i) => (
              <div
                key={item._id}
                className={`flex items-center gap-4 px-4 py-3 hover:bg-[#F8FAFC] transition-colors group ${
                  i > 0 ? "border-t border-[#F1F5F9]" : ""
                }`}
              >
                <div className="w-12 h-12 rounded-xl bg-[#EEF2FF] flex items-center justify-center shrink-0">
                  <FileText size={20} className="text-[#6366F1]" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-sm text-[#0F172A] truncate">{item.name}</p>
                  {item.description && (
                    <p className="text-xs text-[#94A3B8] truncate">{item.description}</p>
                  )}
                </div>
                <span className="text-xs text-[#94A3B8] shrink-0">{formatBytes(item.file?.size)}</span>
                <span className="text-xs text-[#94A3B8] shrink-0">
                  {dayjs(item.createdAt).format("DD MMM YYYY")}
                </span>
                <div className="flex gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
                  {item.file?.url && (
                    <a
                      href={item.file.url}
                      target="_blank"
                      rel="noreferrer"
                      className="w-7 h-7 rounded-lg flex items-center justify-center hover:bg-[#EEF2FF] transition-colors"
                    >
                      <ExternalLink size={13} className="text-[#6366F1]" />
                    </a>
                  )}
                  <button
                    onClick={() => openEdit(item)}
                    className="w-7 h-7 rounded-lg flex items-center justify-center hover:bg-[#EEF2FF] transition-colors"
                  >
                    <Pencil size={13} className="text-[#6366F1]" />
                  </button>
                  <button
                    onClick={() => setDel(item)}
                    className="w-7 h-7 rounded-lg flex items-center justify-center hover:bg-red-50 transition-colors"
                  >
                    <Trash2 size={13} className="text-red-500" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Pagination */}
      {pagination.totalPages > 1 && (
        <div className="flex items-center justify-between bg-white rounded-2xl border border-[#E2E8F0] shadow-sm px-4 py-3">
          <p className="text-sm text-[#94A3B8]">
            {(() => {
              const from = (pagination.currentPage - 1) * pagination.itemsPerPage + 1;
              const to   = Math.min(pagination.currentPage * pagination.itemsPerPage, pagination.totalItems);
              return `Showing ${from}–${to} of ${pagination.totalItems}`;
            })()}
          </p>
          <div className="flex items-center gap-1">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setPage((p) => p - 1)}
              disabled={!pagination.hasPrevPage || isFetching}
            >
              <ChevronLeft size={15} />
            </Button>
            {Array.from({ length: pagination.totalPages }, (_, i) => i + 1)
              .filter(
                (p) =>
                  p === 1 ||
                  p === pagination.totalPages ||
                  Math.abs(p - pagination.currentPage) <= 1
              )
              .reduce((acc, p, i, arr) => {
                if (i > 0 && p - arr[i - 1] > 1) acc.push("...");
                acc.push(p);
                return acc;
              }, [])
              .map((p, i) =>
                p === "..." ? (
                  <span key={`e${i}`} className="px-2 text-[#94A3B8] text-sm">…</span>
                ) : (
                  <Button
                    key={p}
                    variant={p === pagination.currentPage ? "default" : "ghost"}
                    size="sm"
                    onClick={() => setPage(p)}
                    disabled={isFetching}
                    className="w-8 h-8 p-0"
                  >
                    {p}
                  </Button>
                )
              )}
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setPage((p) => p + 1)}
              disabled={!pagination.hasNextPage || isFetching}
            >
              <ChevronRight size={15} />
            </Button>
          </div>
        </div>
      )}

      {/* Add / Edit Dialog */}
      <Dialog open={modalOpen} onOpenChange={setModal}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>{editItem ? "Edit Catalogue" : "Add Catalogue"}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 mt-2">
            <div className="space-y-1.5">
              <Label>
                Name <span className="text-red-500">*</span>
              </Label>
              <Input placeholder="e.g. Floor Tiles 2024" {...register("name")} />
              {errors.name && <p className="text-xs text-[#EF4444]">{errors.name.message}</p>}
            </div>

            <div className="space-y-1.5">
              <Label>Description</Label>
              <textarea
                rows={3}
                placeholder="Brief description of this catalogue…"
                {...register("description")}
                className="w-full rounded-lg border border-[#E2E8F0] bg-white px-3 py-2 text-sm placeholder:text-[#94A3B8] focus:outline-none focus:ring-2 focus:ring-[#6366F1]/30 resize-none"
              />
            </div>

            <div className="space-y-1.5">
              <Label>
                PDF File{" "}
                {!editItem ? (
                  <span className="text-red-500">*</span>
                ) : (
                  <span className="text-xs text-[#94A3B8] ml-1">(leave empty to keep current)</span>
                )}
              </Label>
              {editItem?.file?.url && !fileName && (
                <a
                  href={editItem.file.url}
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center gap-1.5 text-sm text-[#6366F1] hover:underline mb-1"
                >
                  <ExternalLink size={13} /> View current PDF
                </a>
              )}
              <label className="flex items-center justify-center gap-2 w-full border-2 border-dashed border-[#E2E8F0] rounded-xl p-4 cursor-pointer hover:border-[#6366F1]/50 hover:bg-[#EEF2FF]/30 transition-colors">
                <FileText size={16} className="text-[#94A3B8] shrink-0" />
                <span className="text-sm text-[#94A3B8] truncate">
                  {fileName || "Click to upload PDF"}
                </span>
                <input
                  ref={fileRef}
                  type="file"
                  accept="application/pdf"
                  hidden
                  onChange={(e) => {
                    const f = e.target.files?.[0];
                    if (f) setFileName(f.name);
                  }}
                />
              </label>
            </div>

            <Button
              type="submit"
              disabled={isPending || isSubmitting}
              className="w-full disabled:cursor-not-allowed"
            >
              {isPending || isSubmitting ? (
                <ButtonLoader text="Saving…" />
              ) : editItem ? (
                "Update Catalogue"
              ) : (
                "Add Catalogue"
              )}
            </Button>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <Dialog open={!!deleteTarget} onOpenChange={() => setDel(null)}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>Delete Catalogue</DialogTitle>
          </DialogHeader>
          <p className="text-sm text-[#64748B] mt-1">
            Are you sure you want to delete{" "}
            <span className="font-medium text-[#0F172A]">{deleteTarget?.name}</span>? The PDF file will
            also be permanently removed.
          </p>
          <div className="flex gap-3 mt-4">
            <Button variant="ghost" className="flex-1" onClick={() => setDel(null)}>
              Cancel
            </Button>
            <Button
              className="flex-1 bg-red-500 hover:bg-red-600 text-white disabled:cursor-not-allowed"
              onClick={confirmDelete}
              disabled={del.isPending}
            >
              {del.isPending ? <ButtonLoader text="Deleting…" /> : "Delete"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
