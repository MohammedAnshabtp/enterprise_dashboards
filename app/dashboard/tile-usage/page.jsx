/* eslint-disable @next/next/no-img-element */
"use client";

import { useState, useEffect, useRef } from "react";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import {
  Plus, Search, Pencil, Trash2, ImagePlus, X, LayoutGrid, List,
  ChevronLeft, ChevronRight, Grid3x3,
} from "lucide-react";
import {
  useTileUsageCategories, useCreateTileUsageCategory,
  useUpdateTileUsageCategory, useDeleteTileUsageCategory,
} from "../../hooks/useCategories";
import { Button }   from "../../components/ui/button";
import { Input }    from "../../components/ui/input";
import { Label }    from "../../components/ui/label";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle,
} from "../../components/ui/dialog";
import ButtonLoader  from "../../components/ui/ButtonLoader";
import EmptyState    from "../../components/ui/EmptyState";

const LIMIT = 9;

const schema = yup.object({
  name:        yup.string().required("Category name is required"),
  description: yup.string().nullable(),
  alt:         yup.string().nullable(),
});

export default function TileUsagePage() {
  const [page, setPage]       = useState(1);
  const [search, setSearch]   = useState("");
  const [debSearch, setDeb]   = useState("");
  const [viewMode, setView]   = useState("grid");

  const [modalOpen, setModal] = useState(false);
  const [editItem, setEdit]   = useState(null);
  const [deleteTarget, setDel]= useState(null);
  const [preview, setPreview] = useState(null);
  const fileRef               = useRef(null);
  const debRef                = useRef(null);

  useEffect(() => {
    clearTimeout(debRef.current);
    debRef.current = setTimeout(() => { setDeb(search); setPage(1); }, 400);
    return () => clearTimeout(debRef.current);
  }, [search]);

  const params = { page, limit: LIMIT, ...(debSearch && { search: debSearch }) };
  const { data: result, isLoading, isFetching } = useTileUsageCategories(params);
  const items      = result?.data       ?? [];
  const pagination = result?.pagination ?? {};

  const create = useCreateTileUsageCategory();
  const update = useUpdateTileUsageCategory();
  const del    = useDeleteTileUsageCategory();

  const { register, handleSubmit, reset, formState: { errors, isSubmitting } } = useForm({
    resolver: yupResolver(schema),
    defaultValues: { name: "", description: "", alt: "" },
  });

  const openAdd = () => {
    setEdit(null);
    setPreview(null);
    if (fileRef.current) fileRef.current.value = "";
    reset({ name: "", description: "", alt: "" });
    setModal(true);
  };

  const openEdit = (item) => {
    setEdit(item);
    setPreview(item.image?.url ?? null);
    if (fileRef.current) fileRef.current.value = "";
    reset({ name: item.name ?? "", description: item.description ?? "", alt: item.image?.alt ?? "" });
    setModal(true);
  };

  const onSubmit = async (data) => {
    const fd = new FormData();
    fd.append("name", data.name);
    if (data.description) fd.append("description", data.description);
    if (data.alt)         fd.append("alt", data.alt);
    const file = fileRef.current?.files?.[0];
    if (file) fd.append("image", file);

    if (editItem) {
      await update.mutateAsync({ id: editItem._id, data: fd });
    } else {
      await create.mutateAsync(fd);
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
              <Grid3x3 size={18} className="text-[#6366F1]" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-[#0F172A]">Tile Usage</h1>
              <p className="text-xs text-[#94A3B8]">
                {pagination.totalItems != null ? `${pagination.totalItems} categories total` : "Manage tile usage categories"}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            <div className="relative">
              <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#94A3B8]" />
              <Input placeholder="Search…" value={search} onChange={(e) => setSearch(e.target.value)}
                className="pl-8 w-44 h-9 text-sm" />
            </div>
            <div className="flex items-center bg-[#F1F5F9] rounded-xl p-1 gap-0.5">
              {[["grid", LayoutGrid], ["list", List]].map(([mode, Icon]) => (
                <button key={mode} onClick={() => setView(mode)}
                  className={`w-7 h-7 rounded-lg flex items-center justify-center transition-colors cursor-pointer ${viewMode === mode ? "bg-white shadow-sm text-[#6366F1]" : "text-[#94A3B8] hover:text-[#64748B]"}`}>
                  <Icon size={14} />
                </button>
              ))}
            </div>
            <Button onClick={openAdd} size="sm">
              <Plus size={14} className="mr-1.5" /> Add Category
            </Button>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className={`transition-opacity duration-150 ${isFetching && !isLoading ? "opacity-60" : ""}`}>
        {isLoading ? (
          viewMode === "grid" ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {Array.from({ length: LIMIT }).map((_, i) => (
                <div key={i} className="bg-white rounded-2xl border border-[#E2E8F0] overflow-hidden animate-pulse">
                  <div className="h-44 bg-[#F1F5F9]" />
                  <div className="p-4 space-y-2">
                    <div className="h-4 bg-[#F1F5F9] rounded w-1/2" />
                    <div className="h-3 bg-[#F1F5F9] rounded w-3/4" />
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
          <EmptyState icon={Grid3x3} title="No tile usage categories found" />
        ) : viewMode === "grid" ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {items.map((item) => (
              <div key={item._id}
                className="bg-white rounded-2xl border border-[#E2E8F0] shadow-sm hover:shadow-md hover:border-[#6366F1]/30 transition-all duration-200 overflow-hidden group flex flex-col">
                <div className="relative overflow-hidden h-44">
                  <img src={item.image?.url || "/placeholder.png"} alt={item.image?.alt || item.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                  <div className="absolute top-2 right-2 flex gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                    <button onClick={() => openEdit(item)}
                      className="w-8 h-8 bg-white rounded-full flex items-center justify-center shadow hover:bg-[#EEF2FF] transition-colors">
                      <Pencil size={13} className="text-[#6366F1]" />
                    </button>
                    <button onClick={() => setDel(item)}
                      className="w-8 h-8 bg-white rounded-full flex items-center justify-center shadow hover:bg-red-50 transition-colors">
                      <Trash2 size={13} className="text-red-500" />
                    </button>
                  </div>
                </div>
                <div className="p-4">
                  <h3 className="font-semibold text-[#0F172A] text-sm">{item.name}</h3>
                  {item.description && (
                    <p className="text-xs text-[#94A3B8] mt-1 line-clamp-2">{item.description}</p>
                  )}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="bg-white rounded-2xl border border-[#E2E8F0] shadow-sm overflow-hidden">
            {items.map((item, i) => (
              <div key={item._id}
                className={`flex items-center gap-4 px-4 py-3 hover:bg-[#F8FAFC] transition-colors group ${i > 0 ? "border-t border-[#F1F5F9]" : ""}`}>
                <div className="w-12 h-12 rounded-xl overflow-hidden border border-[#E2E8F0] shrink-0">
                  <img src={item.image?.url || "/placeholder.png"} alt={item.name} className="w-full h-full object-cover" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-sm text-[#0F172A] truncate">{item.name}</p>
                  {item.description && <p className="text-xs text-[#94A3B8] truncate">{item.description}</p>}
                </div>
                <div className="flex gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
                  <button onClick={() => openEdit(item)} className="w-7 h-7 rounded-lg flex items-center justify-center hover:bg-[#EEF2FF] transition-colors">
                    <Pencil size={13} className="text-[#6366F1]" />
                  </button>
                  <button onClick={() => setDel(item)} className="w-7 h-7 rounded-lg flex items-center justify-center hover:bg-red-50 transition-colors">
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
            <Button variant="ghost" size="sm" onClick={() => setPage((p) => p - 1)} disabled={!pagination.hasPrevPage || isFetching}>
              <ChevronLeft size={15} />
            </Button>
            {Array.from({ length: pagination.totalPages }, (_, i) => i + 1)
              .filter((p) => p === 1 || p === pagination.totalPages || Math.abs(p - pagination.currentPage) <= 1)
              .reduce((acc, p, i, arr) => { if (i > 0 && p - arr[i - 1] > 1) acc.push("..."); acc.push(p); return acc; }, [])
              .map((p, i) => p === "..." ? (
                <span key={`e${i}`} className="px-2 text-[#94A3B8] text-sm">…</span>
              ) : (
                <Button key={p} variant={p === pagination.currentPage ? "default" : "ghost"} size="sm"
                  onClick={() => setPage(p)} disabled={isFetching} className="w-8 h-8 p-0">{p}</Button>
              ))}
            <Button variant="ghost" size="sm" onClick={() => setPage((p) => p + 1)} disabled={!pagination.hasNextPage || isFetching}>
              <ChevronRight size={15} />
            </Button>
          </div>
        </div>
      )}

      {/* Add / Edit Dialog */}
      <Dialog open={modalOpen} onOpenChange={setModal}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>{editItem ? "Edit Tile Usage" : "Add Tile Usage"}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 mt-2">
            <div className="space-y-1.5">
              <Label>Category Name <span className="text-red-500">*</span></Label>
              <Input placeholder="e.g. Floor Tiles, Wall Tiles" {...register("name")} />
              {errors.name && <p className="text-xs text-[#EF4444]">{errors.name.message}</p>}
            </div>
            <div className="space-y-1.5">
              <Label>Description</Label>
              <textarea rows={2} placeholder="Short description…"
                {...register("description")}
                className="w-full rounded-lg border border-[#E2E8F0] bg-white px-3 py-2 text-sm placeholder:text-[#94A3B8] focus:outline-none focus:ring-2 focus:ring-[#6366F1]/30 resize-none" />
            </div>
            <div className="space-y-1.5">
              <Label>Image Alt Text</Label>
              <Input placeholder="Describe the image" {...register("alt")} />
            </div>
            <div className="space-y-1.5">
              <Label>Category Image</Label>
              {preview && (
                <div className="relative w-full h-28 rounded-xl overflow-hidden border border-[#E2E8F0] mb-2">
                  <img src={preview} alt="" className="w-full h-full object-cover" />
                  <button type="button" onClick={() => { setPreview(null); if (fileRef.current) fileRef.current.value = ""; }}
                    className="absolute top-1.5 right-1.5 w-6 h-6 bg-black/50 rounded-full flex items-center justify-center hover:bg-black/70 transition-colors">
                    <X size={11} className="text-white" />
                  </button>
                </div>
              )}
              <label className="flex items-center justify-center gap-2 w-full border-2 border-dashed border-[#E2E8F0] rounded-xl p-4 cursor-pointer hover:border-[#6366F1]/50 hover:bg-[#EEF2FF]/30 transition-colors">
                <ImagePlus size={16} className="text-[#94A3B8]" />
                <span className="text-sm text-[#94A3B8]">{preview ? "Change image" : "Click to upload"}</span>
                <input ref={fileRef} type="file" accept="image/*" hidden
                  onChange={(e) => { const f = e.target.files?.[0]; if (f) setPreview(URL.createObjectURL(f)); }} />
              </label>
            </div>
            <Button type="submit" disabled={isPending || isSubmitting} className="w-full disabled:cursor-not-allowed">
              {isPending || isSubmitting ? <ButtonLoader text="Saving…" /> : editItem ? "Update Category" : "Add Category"}
            </Button>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <Dialog open={!!deleteTarget} onOpenChange={() => setDel(null)}>
        <DialogContent className="max-w-sm">
          <DialogHeader><DialogTitle>Delete Category</DialogTitle></DialogHeader>
          <p className="text-sm text-[#64748B] mt-1">
            Are you sure you want to delete <span className="font-medium text-[#0F172A]">{deleteTarget?.name}</span>? This cannot be undone.
          </p>
          <div className="flex gap-3 mt-4">
            <Button variant="ghost" className="flex-1" onClick={() => setDel(null)}>Cancel</Button>
            <Button className="flex-1 bg-red-500 hover:bg-red-600 text-white disabled:cursor-not-allowed"
              onClick={confirmDelete} disabled={del.isPending}>
              {del.isPending ? <ButtonLoader text="Deleting…" /> : "Delete"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
