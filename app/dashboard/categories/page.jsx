/* eslint-disable @next/next/no-img-element */
"use client";

import { useState, useEffect, useRef } from "react";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import {
  Plus, Search, Pencil, Trash2, ImagePlus, X,
  LayoutGrid, List, ChevronLeft, ChevronRight,
  Layers, Ruler, Palette, Grid3x3,
} from "lucide-react";
import {
  useSpaceCategories, useCreateSpaceCategory, useUpdateSpaceCategory, useDeleteSpaceCategory,
  useSizeCategories,  useCreateSizeCategory,  useUpdateSizeCategory,  useDeleteSizeCategory,
  useTileUsageCategories, useCreateTileUsageCategory, useUpdateTileUsageCategory, useDeleteTileUsageCategory,
} from "../../hooks/useCategories";
import {
  useProductStyle, useCreateProductStyle, useUpdateProductStyle, useDeleteProductStyle,
} from "../../hooks/useProductStyle";
import { Button }  from "../../components/ui/button";
import { Input }   from "../../components/ui/input";
import { Label }   from "../../components/ui/label";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle,
} from "../../components/ui/dialog";
import ButtonLoader from "../../components/ui/ButtonLoader";
import EmptyState   from "../../components/ui/EmptyState";

const LIMIT = 12;

/* ─── Schemas ─── */
const imageSchema = yup.object({
  name:        yup.string().required("Name is required"),
  description: yup.string().nullable(),
  alt:         yup.string().nullable(),
});

const textSchema = yup.object({
  name:        yup.string().required("Name is required"),
  description: yup.string().nullable(),
});

/* ─── Tab definitions ─── */
const TABS = [
  { id: "space",  label: "Space",      icon: Layers,  hasImage: true,  color: "#6366F1" },
  { id: "size",   label: "Size",       icon: Ruler,   hasImage: true,  color: "#8B5CF6" },
  { id: "style",  label: "Style",      icon: Palette, hasImage: false, color: "#EC4899" },
  { id: "usage",  label: "Tile Usage", icon: Grid3x3, hasImage: true,  color: "#10B981" },
];

/* ─── Palette for style initials ─── */
const PALETTE = [
  "#6366F1","#8B5CF6","#EC4899","#EF4444","#F59E0B",
  "#10B981","#3B82F6","#06B6D4","#84CC16","#64748B",
];
const colorFor = (name = "") => PALETTE[name.charCodeAt(0) % PALETTE.length];

/* ─── Reusable Pagination ─── */
function Pagination({ pagination, page, setPage, isFetching }) {
  if ((pagination.totalPages ?? 0) <= 1) return null;
  return (
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
  );
}

/* ─── Image-based category grid/list (Space, Size, TileUsage) ─── */
function ImageCategoryTab({ tabId, label, icon: Icon, accentColor }) {
  const [page, setPage]        = useState(1);
  const [search, setSearch]    = useState("");
  const [debSearch, setDeb]    = useState("");
  const [viewMode, setView]    = useState("grid");
  const [modalOpen, setModal]  = useState(false);
  const [editItem, setEdit]    = useState(null);
  const [deleteTarget, setDel] = useState(null);
  const [preview, setPreview]  = useState(null);
  const fileRef                = useRef(null);
  const debRef                 = useRef(null);

  useEffect(() => {
    clearTimeout(debRef.current);
    debRef.current = setTimeout(() => { setDeb(search); setPage(1); }, 400);
    return () => clearTimeout(debRef.current);
  }, [search]);

  const params = { page, limit: LIMIT, ...(debSearch && { search: debSearch }) };

  const spaceQuery = useSpaceCategories(tabId === "space" ? params : null);
  const sizeQuery  = useSizeCategories(tabId === "size"  ? params : null);
  const usageQuery = useTileUsageCategories(tabId === "usage" ? params : null);

  const { data: result, isLoading, isFetching } =
    tabId === "space" ? spaceQuery :
    tabId === "size"  ? sizeQuery  : usageQuery;

  const items      = result?.data       ?? [];
  const pagination = result?.pagination ?? {};

  const createSpace  = useCreateSpaceCategory();
  const updateSpace  = useUpdateSpaceCategory();
  const deleteSpace  = useDeleteSpaceCategory();
  const createSize   = useCreateSizeCategory();
  const updateSize   = useUpdateSizeCategory();
  const deleteSize   = useDeleteSizeCategory();
  const createUsage  = useCreateTileUsageCategory();
  const updateUsage  = useUpdateTileUsageCategory();
  const deleteUsage  = useDeleteTileUsageCategory();

  const createHook = tabId === "space" ? createSpace : tabId === "size" ? createSize : createUsage;
  const updateHook = tabId === "space" ? updateSpace : tabId === "size" ? updateSize : updateUsage;
  const deleteHook = tabId === "space" ? deleteSpace : tabId === "size" ? deleteSize : deleteUsage;

  const { register, handleSubmit, reset, formState: { errors, isSubmitting } } = useForm({
    resolver: yupResolver(imageSchema),
    defaultValues: { name: "", description: "", alt: "" },
  });

  const openAdd = () => {
    setEdit(null); setPreview(null);
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
    if (data.alt) fd.append("alt", data.alt);
    const file = fileRef.current?.files?.[0];
    if (file) fd.append("image", file);
    if (editItem) await updateHook.mutateAsync({ id: editItem._id, data: fd });
    else await createHook.mutateAsync(fd);
    setModal(false);
  };

  const confirmDelete = () => { deleteHook.mutate(deleteTarget._id); setDel(null); };
  const isPending = createHook.isPending || updateHook.isPending;

  return (
    <div className="space-y-5">
      {/* Controls */}
      <div className="flex items-center gap-2 flex-wrap">
        <div className="relative flex-1 min-w-[180px]">
          <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#94A3B8]" />
          <Input placeholder="Search…" value={search} onChange={(e) => setSearch(e.target.value)} className="pl-8 h-9 text-sm" />
        </div>
        <div className="flex items-center bg-[#F1F5F9] rounded-xl p-1 gap-0.5">
          {[["grid", LayoutGrid], ["list", List]].map(([mode, ModeIcon]) => (
            <button key={mode} onClick={() => setView(mode)}
              className={`w-7 h-7 rounded-lg flex items-center justify-center transition-colors cursor-pointer ${viewMode === mode ? "bg-white shadow-sm text-[#6366F1]" : "text-[#94A3B8] hover:text-[#64748B]"}`}>
              <ModeIcon size={14} />
            </button>
          ))}
        </div>
        <Button onClick={openAdd} size="sm">
          <Plus size={14} className="mr-1.5" /> Add {label}
        </Button>
      </div>

      {/* Content */}
      <div className={`transition-opacity duration-150 ${isFetching && !isLoading ? "opacity-60" : ""}`}>
        {isLoading ? (
          viewMode === "grid" ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {Array.from({ length: LIMIT }).map((_, i) => (
                <div key={i} className="bg-white rounded-2xl border border-[#E2E8F0] overflow-hidden animate-pulse">
                  <div className="h-44 bg-[#F1F5F9]" />
                  <div className="p-4 space-y-2"><div className="h-4 bg-[#F1F5F9] rounded w-1/2" /></div>
                </div>
              ))}
            </div>
          ) : (
            <div className="bg-white rounded-2xl border border-[#E2E8F0] overflow-hidden">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className={`flex gap-4 p-4 animate-pulse ${i > 0 ? "border-t border-[#F1F5F9]" : ""}`}>
                  <div className="w-12 h-12 bg-[#F1F5F9] rounded-xl shrink-0" />
                  <div className="flex-1 space-y-2"><div className="h-4 bg-[#F1F5F9] rounded w-1/3" /></div>
                </div>
              ))}
            </div>
          )
        ) : items.length === 0 ? (
          <EmptyState icon={Icon} title={`No ${label.toLowerCase()} categories found`} />
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
                  {item.description && <p className="text-xs text-[#94A3B8] mt-1 line-clamp-2">{item.description}</p>}
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

      <Pagination pagination={pagination} page={page} setPage={setPage} isFetching={isFetching} />

      {/* Add / Edit Dialog */}
      <Dialog open={modalOpen} onOpenChange={setModal}>
        <DialogContent className="max-w-md">
          <DialogHeader><DialogTitle>{editItem ? `Edit ${label}` : `Add ${label}`}</DialogTitle></DialogHeader>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 mt-2">
            <div className="space-y-1.5">
              <Label>Name <span className="text-red-500">*</span></Label>
              <Input placeholder={`e.g. ${label} name`} {...register("name")} />
              {errors.name && <p className="text-xs text-[#EF4444]">{errors.name.message}</p>}
            </div>
            <div className="space-y-1.5">
              <Label>Description</Label>
              <textarea rows={2} placeholder="Short description…" {...register("description")}
                className="w-full rounded-lg border border-[#E2E8F0] bg-white px-3 py-2 text-sm placeholder:text-[#94A3B8] focus:outline-none focus:ring-2 focus:ring-[#6366F1]/30 resize-none" />
            </div>
            <div className="space-y-1.5">
              <Label>Image Alt Text</Label>
              <Input placeholder="Describe the image" {...register("alt")} />
            </div>
            <div className="space-y-1.5">
              <Label>
                Image{" "}
                {!editItem && <span className="text-red-500">*</span>}
                {editItem && <span className="text-xs text-[#94A3B8] ml-1">(leave empty to keep current)</span>}
              </Label>
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
              {isPending || isSubmitting ? <ButtonLoader text="Saving…" /> : editItem ? `Update ${label}` : `Add ${label}`}
            </Button>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <Dialog open={!!deleteTarget} onOpenChange={() => setDel(null)}>
        <DialogContent className="max-w-sm">
          <DialogHeader><DialogTitle>Delete {label}</DialogTitle></DialogHeader>
          <p className="text-sm text-[#64748B] mt-1">
            Are you sure you want to delete <span className="font-medium text-[#0F172A]">{deleteTarget?.name}</span>? This cannot be undone.
          </p>
          <div className="flex gap-3 mt-4">
            <Button variant="ghost" className="flex-1" onClick={() => setDel(null)}>Cancel</Button>
            <Button className="flex-1 bg-red-500 hover:bg-red-600 text-white disabled:cursor-not-allowed"
              onClick={confirmDelete} disabled={deleteHook.isPending}>
              {deleteHook.isPending ? <ButtonLoader text="Deleting…" /> : "Delete"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

/* ─── Style tab (no image, uses color initials) ─── */
function StyleTab() {
  const [page, setPage]        = useState(1);
  const [search, setSearch]    = useState("");
  const [debSearch, setDeb]    = useState("");
  const [viewMode, setView]    = useState("grid");
  const [modalOpen, setModal]  = useState(false);
  const [editItem, setEdit]    = useState(null);
  const [deleteTarget, setDel] = useState(null);
  const debRef                 = useRef(null);

  useEffect(() => {
    clearTimeout(debRef.current);
    debRef.current = setTimeout(() => { setDeb(search); setPage(1); }, 400);
    return () => clearTimeout(debRef.current);
  }, [search]);

  const params = { page, limit: LIMIT, ...(debSearch && { search: debSearch }) };
  const { data: result, isLoading, isFetching } = useProductStyle(params);
  const items      = result?.data       ?? [];
  const pagination = result?.pagination ?? {};

  const create = useCreateProductStyle();
  const update = useUpdateProductStyle();
  const del    = useDeleteProductStyle();

  const { register, handleSubmit, reset, formState: { errors, isSubmitting } } = useForm({
    resolver: yupResolver(textSchema),
    defaultValues: { name: "", description: "" },
  });

  const openAdd  = () => { setEdit(null); reset({ name: "", description: "" }); setModal(true); };
  const openEdit = (item) => { setEdit(item); reset({ name: item.name ?? "", description: item.description ?? "" }); setModal(true); };

  const onSubmit = async (data) => {
    const payload = { name: data.name, ...(data.description && { description: data.description }) };
    if (editItem) await update.mutateAsync({ id: editItem._id, data: payload });
    else await create.mutateAsync(payload);
    setModal(false);
  };

  const confirmDelete = () => { del.mutate(deleteTarget._id); setDel(null); };
  const isPending = create.isPending || update.isPending;

  return (
    <div className="space-y-5">
      <div className="flex items-center gap-2 flex-wrap">
        <div className="relative flex-1 min-w-[180px]">
          <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#94A3B8]" />
          <Input placeholder="Search…" value={search} onChange={(e) => setSearch(e.target.value)} className="pl-8 h-9 text-sm" />
        </div>
        <div className="flex items-center bg-[#F1F5F9] rounded-xl p-1 gap-0.5">
          {[["grid", LayoutGrid], ["list", List]].map(([mode, ModeIcon]) => (
            <button key={mode} onClick={() => setView(mode)}
              className={`w-7 h-7 rounded-lg flex items-center justify-center transition-colors cursor-pointer ${viewMode === mode ? "bg-white shadow-sm text-[#6366F1]" : "text-[#94A3B8] hover:text-[#64748B]"}`}>
              <ModeIcon size={14} />
            </button>
          ))}
        </div>
        <Button onClick={openAdd} size="sm"><Plus size={14} className="mr-1.5" /> Add Style</Button>
      </div>

      <div className={`transition-opacity duration-150 ${isFetching && !isLoading ? "opacity-60" : ""}`}>
        {isLoading ? (
          viewMode === "grid" ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
              {Array.from({ length: LIMIT }).map((_, i) => (
                <div key={i} className="bg-white rounded-2xl border border-[#E2E8F0] p-5 animate-pulse">
                  <div className="w-10 h-10 bg-[#F1F5F9] rounded-xl mb-3" />
                  <div className="h-4 bg-[#F1F5F9] rounded w-2/3" />
                </div>
              ))}
            </div>
          ) : (
            <div className="bg-white rounded-2xl border border-[#E2E8F0] overflow-hidden">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className={`flex gap-4 p-4 animate-pulse ${i > 0 ? "border-t border-[#F1F5F9]" : ""}`}>
                  <div className="w-9 h-9 bg-[#F1F5F9] rounded-lg shrink-0" />
                  <div className="flex-1"><div className="h-4 bg-[#F1F5F9] rounded w-1/4" /></div>
                </div>
              ))}
            </div>
          )
        ) : items.length === 0 ? (
          <EmptyState icon={Palette} title="No styles found" />
        ) : viewMode === "grid" ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
            {items.map((item) => (
              <div key={item._id}
                className="bg-white rounded-2xl border border-[#E2E8F0] shadow-sm hover:shadow-md hover:border-[#6366F1]/30 transition-all duration-200 p-5 group flex flex-col">
                <div className="w-10 h-10 rounded-xl mb-3 flex items-center justify-center text-white text-sm font-bold shrink-0"
                  style={{ backgroundColor: colorFor(item.name) }}>
                  {item.name.charAt(0).toUpperCase()}
                </div>
                <h3 className="font-semibold text-[#0F172A] text-sm mb-1">{item.name}</h3>
                {item.description && <p className="text-xs text-[#94A3B8] line-clamp-2 flex-1">{item.description}</p>}
                <div className="flex gap-1.5 mt-3 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button onClick={() => openEdit(item)} className="w-7 h-7 rounded-lg flex items-center justify-center hover:bg-[#EEF2FF] transition-colors">
                    <Pencil size={12} className="text-[#6366F1]" />
                  </button>
                  <button onClick={() => setDel(item)} className="w-7 h-7 rounded-lg flex items-center justify-center hover:bg-red-50 transition-colors">
                    <Trash2 size={12} className="text-red-500" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="bg-white rounded-2xl border border-[#E2E8F0] shadow-sm overflow-hidden">
            {items.map((item, i) => (
              <div key={item._id}
                className={`flex items-center gap-4 px-4 py-3 hover:bg-[#F8FAFC] transition-colors group ${i > 0 ? "border-t border-[#F1F5F9]" : ""}`}>
                <div className="w-9 h-9 rounded-xl flex items-center justify-center text-white text-xs font-bold shrink-0"
                  style={{ backgroundColor: colorFor(item.name) }}>
                  {item.name.charAt(0).toUpperCase()}
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

      <Pagination pagination={pagination} page={page} setPage={setPage} isFetching={isFetching} />

      <Dialog open={modalOpen} onOpenChange={setModal}>
        <DialogContent className="max-w-sm">
          <DialogHeader><DialogTitle>{editItem ? "Edit Style" : "Add Style"}</DialogTitle></DialogHeader>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 mt-2">
            <div className="space-y-1.5">
              <Label>Style Name <span className="text-red-500">*</span></Label>
              <Input placeholder="e.g. Glossy, Matt, Rustic" {...register("name")} />
              {errors.name && <p className="text-xs text-[#EF4444]">{errors.name.message}</p>}
            </div>
            <div className="space-y-1.5">
              <Label>Description</Label>
              <textarea rows={3} placeholder="Describe this style…" {...register("description")}
                className="w-full rounded-lg border border-[#E2E8F0] bg-white px-3 py-2 text-sm placeholder:text-[#94A3B8] focus:outline-none focus:ring-2 focus:ring-[#6366F1]/30 resize-none" />
            </div>
            <Button type="submit" disabled={isPending || isSubmitting} className="w-full disabled:cursor-not-allowed">
              {isPending || isSubmitting ? <ButtonLoader text="Saving…" /> : editItem ? "Update Style" : "Add Style"}
            </Button>
          </form>
        </DialogContent>
      </Dialog>

      <Dialog open={!!deleteTarget} onOpenChange={() => setDel(null)}>
        <DialogContent className="max-w-sm">
          <DialogHeader><DialogTitle>Delete Style</DialogTitle></DialogHeader>
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

/* ─── Main Page ─── */
export default function CategoriesPage() {
  const [activeTab, setActiveTab] = useState("space");
  const tab = TABS.find((t) => t.id === activeTab);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-2xl border border-[#E2E8F0] shadow-sm px-6 py-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-[#EEF2FF] flex items-center justify-center shrink-0">
            <Layers size={18} className="text-[#6366F1]" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-[#0F172A]">Categories</h1>
            <p className="text-xs text-[#94A3B8]">Manage space, size, style and tile usage categories</p>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white rounded-2xl border border-[#E2E8F0] shadow-sm overflow-hidden">
        <div className="flex border-b border-[#E2E8F0] overflow-x-auto">
          {TABS.map((t) => {
            const Icon = t.icon;
            const isActive = activeTab === t.id;
            return (
              <button
                key={t.id}
                onClick={() => setActiveTab(t.id)}
                className={`flex items-center gap-2 px-5 py-3.5 text-sm font-medium whitespace-nowrap border-b-2 transition-colors cursor-pointer ${
                  isActive
                    ? "border-[#6366F1] text-[#6366F1] bg-[#EEF2FF]/40"
                    : "border-transparent text-[#64748B] hover:text-[#0F172A] hover:bg-[#F8FAFC]"
                }`}
              >
                <Icon size={15} />
                {t.label}
              </button>
            );
          })}
        </div>

        <div className="p-5">
          {activeTab === "style" ? (
            <StyleTab key="style" />
          ) : (
            <ImageCategoryTab
              key={activeTab}
              tabId={activeTab}
              label={tab.label}
              icon={tab.icon}
              accentColor={tab.color}
            />
          )}
        </div>
      </div>
    </div>
  );
}
