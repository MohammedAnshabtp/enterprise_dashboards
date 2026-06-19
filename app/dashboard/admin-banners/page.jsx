/* eslint-disable @next/next/no-img-element */
"use client";

import { useState, useRef } from "react";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import {
  Plus, Search, Pencil, Trash2, ImagePlus, X,
  Megaphone, ExternalLink, LayoutGrid, List,
} from "lucide-react";
import {
  useAdminBanners, useCreateBanner, useUpdateBanner, useDeleteBanner,
} from "../../hooks/useBanners";
import { Button }  from "../../components/ui/button";
import { Input }   from "../../components/ui/input";
import { Label }   from "../../components/ui/label";
import { Badge }   from "../../components/ui/badge";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle,
} from "../../components/ui/dialog";
import ButtonLoader from "../../components/ui/ButtonLoader";
import EmptyState   from "../../components/ui/EmptyState";

const schema = yup.object({
  title:        yup.string().required("Title is required"),
  imageAlt:     yup.string().nullable(),
  link:         yup.string().url("Enter a valid URL").nullable().transform((v) => v || null),
  isActive:     yup.boolean(),
  displayOrder: yup
    .number()
    .integer()
    .min(0)
    .nullable()
    .transform((v, o) => (o === "" ? null : v)),
});

export default function AdminBannersPage() {
  const [search, setSearch]    = useState("");
  const [viewMode, setView]    = useState("grid");
  const [modalOpen, setModal]  = useState(false);
  const [editItem, setEdit]    = useState(null);
  const [deleteTarget, setDel] = useState(null);
  const [preview, setPreview]  = useState(null);
  const fileRef                = useRef(null);

  const { data: banners = [], isLoading } = useAdminBanners();
  const create = useCreateBanner();
  const update = useUpdateBanner();
  const del    = useDeleteBanner();

  const {
    register, handleSubmit, reset, watch, setValue,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: yupResolver(schema),
    defaultValues: { title: "", imageAlt: "", link: "", isActive: true, displayOrder: 0 },
  });

  const isActive = watch("isActive");

  const filtered = banners.filter(
    (b) => !search || b.title?.toLowerCase().includes(search.toLowerCase())
  );

  const openAdd = () => {
    setEdit(null);
    setPreview(null);
    if (fileRef.current) fileRef.current.value = "";
    reset({ title: "", imageAlt: "", link: "", isActive: true, displayOrder: 0 });
    setModal(true);
  };

  const openEdit = (item) => {
    setEdit(item);
    setPreview(item.image?.url ?? null);
    if (fileRef.current) fileRef.current.value = "";
    reset({
      title:        item.title ?? "",
      imageAlt:     item.image?.alt ?? "",
      link:         item.link ?? "",
      isActive:     item.isActive ?? true,
      displayOrder: item.displayOrder ?? 0,
    });
    setModal(true);
  };

  const onSubmit = async (data) => {
    const payload = {
      title:        data.title,
      imageAlt:     data.imageAlt || undefined,
      link:         data.link || undefined,
      isActive:     data.isActive,
      displayOrder: data.displayOrder ?? 0,
      image:        fileRef.current?.files?.[0] || undefined,
    };
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
              <Megaphone size={18} className="text-[#6366F1]" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-[#0F172A]">Banners</h1>
              <p className="text-xs text-[#94A3B8]">
                {banners.length > 0 ? `${banners.length} banners total` : "Manage homepage banners"}
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
              <Plus size={14} className="mr-1.5" /> Add Banner
            </Button>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className={`transition-opacity duration-150 ${isPending ? "opacity-60 pointer-events-none" : ""}`}>
        {isLoading ? (
          viewMode === "grid" ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="bg-white rounded-2xl border border-[#E2E8F0] overflow-hidden animate-pulse">
                  <div className="h-48 bg-[#F1F5F9]" />
                  <div className="p-4 space-y-2">
                    <div className="h-4 bg-[#F1F5F9] rounded w-1/2" />
                    <div className="h-3 bg-[#F1F5F9] rounded w-1/3" />
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="bg-white rounded-2xl border border-[#E2E8F0] overflow-hidden">
              {Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className={`flex gap-4 p-4 animate-pulse ${i > 0 ? "border-t border-[#F1F5F9]" : ""}`}>
                  <div className="w-20 h-14 bg-[#F1F5F9] rounded-xl shrink-0" />
                  <div className="flex-1 space-y-2">
                    <div className="h-4 bg-[#F1F5F9] rounded w-1/3" />
                    <div className="h-3 bg-[#F1F5F9] rounded w-1/4" />
                  </div>
                </div>
              ))}
            </div>
          )
        ) : filtered.length === 0 ? (
          <EmptyState icon={Megaphone} title="No banners found" />
        ) : viewMode === "grid" ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {filtered.map((item) => (
              <div
                key={item._id}
                className="bg-white rounded-2xl border border-[#E2E8F0] shadow-sm hover:shadow-md hover:border-[#6366F1]/30 transition-all duration-200 overflow-hidden group flex flex-col"
              >
                <div className="relative overflow-hidden h-48 bg-[#F1F5F9]">
                  <img
                    src={item.image?.url || "/placeholder.png"}
                    alt={item.image?.alt || item.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  {!item.isActive && (
                    <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                      <Badge className="bg-[#94A3B8] text-white text-xs">Inactive</Badge>
                    </div>
                  )}
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
                  <div className="absolute top-2 left-2">
                    <span className="text-xs bg-white/90 text-[#64748B] px-2 py-0.5 rounded-full">
                      #{item.displayOrder}
                    </span>
                  </div>
                </div>
                <div className="p-4 flex items-center justify-between gap-2">
                  <div className="min-w-0">
                    <h3 className="font-semibold text-[#0F172A] text-sm truncate">{item.title}</h3>
                    {item.link && (
                      <a
                        href={item.link}
                        target="_blank"
                        rel="noreferrer"
                        className="text-xs text-[#6366F1] hover:underline flex items-center gap-1 truncate mt-0.5"
                      >
                        <ExternalLink size={10} /> {item.link}
                      </a>
                    )}
                  </div>
                  <Badge
                    className={
                      item.isActive
                        ? "bg-[#DCFCE7] text-[#16A34A] shrink-0"
                        : "bg-[#F1F5F9] text-[#64748B] shrink-0"
                    }
                  >
                    {item.isActive ? "Active" : "Inactive"}
                  </Badge>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="bg-white rounded-2xl border border-[#E2E8F0] shadow-sm overflow-hidden">
            {filtered.map((item, i) => (
              <div
                key={item._id}
                className={`flex items-center gap-4 px-4 py-3 hover:bg-[#F8FAFC] transition-colors group ${
                  i > 0 ? "border-t border-[#F1F5F9]" : ""
                }`}
              >
                <div className="w-20 h-14 rounded-xl overflow-hidden border border-[#E2E8F0] shrink-0 bg-[#F1F5F9]">
                  <img
                    src={item.image?.url || "/placeholder.png"}
                    alt={item.title}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-sm text-[#0F172A] truncate">{item.title}</p>
                  {item.link && (
                    <a
                      href={item.link}
                      target="_blank"
                      rel="noreferrer"
                      className="text-xs text-[#6366F1] hover:underline flex items-center gap-1 truncate"
                    >
                      <ExternalLink size={10} /> {item.link}
                    </a>
                  )}
                </div>
                <span className="text-xs text-[#94A3B8] shrink-0">Order: {item.displayOrder}</span>
                <Badge
                  className={
                    item.isActive
                      ? "bg-[#DCFCE7] text-[#16A34A] shrink-0"
                      : "bg-[#F1F5F9] text-[#64748B] shrink-0"
                  }
                >
                  {item.isActive ? "Active" : "Inactive"}
                </Badge>
                <div className="flex gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
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

      {/* Add / Edit Dialog */}
      <Dialog open={modalOpen} onOpenChange={setModal}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>{editItem ? "Edit Banner" : "Add Banner"}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 mt-2">
            <div className="space-y-1.5">
              <Label>
                Title <span className="text-red-500">*</span>
              </Label>
              <Input placeholder="e.g. Summer Sale Banner" {...register("title")} />
              {errors.title && <p className="text-xs text-[#EF4444]">{errors.title.message}</p>}
            </div>

            <div className="space-y-1.5">
              <Label>Link URL</Label>
              <Input placeholder="https://example.com/sale" {...register("link")} />
              {errors.link && <p className="text-xs text-[#EF4444]">{errors.link.message}</p>}
            </div>

            <div className="space-y-1.5">
              <Label>Image Alt Text</Label>
              <Input placeholder="Describe the image" {...register("imageAlt")} />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label>Display Order</Label>
                <Input type="number" min="0" placeholder="0" {...register("displayOrder")} />
              </div>
              <div className="space-y-1.5">
                <Label>Status</Label>
                <button
                  type="button"
                  onClick={() => setValue("isActive", !isActive)}
                  className={`w-full h-10 rounded-lg border text-sm font-medium transition-colors cursor-pointer ${
                    isActive
                      ? "bg-[#DCFCE7] border-[#16A34A]/30 text-[#16A34A]"
                      : "bg-[#F1F5F9] border-[#E2E8F0] text-[#64748B]"
                  }`}
                >
                  {isActive ? "Active" : "Inactive"}
                </button>
              </div>
            </div>

            <div className="space-y-1.5">
              <Label>
                Banner Image{" "}
                {!editItem ? (
                  <span className="text-red-500">*</span>
                ) : (
                  <span className="text-xs text-[#94A3B8] ml-1">(leave empty to keep current)</span>
                )}
              </Label>
              {preview && (
                <div className="relative w-full h-32 rounded-xl overflow-hidden border border-[#E2E8F0] mb-2">
                  <img src={preview} alt="" className="w-full h-full object-cover" />
                  <button
                    type="button"
                    onClick={() => {
                      setPreview(null);
                      if (fileRef.current) fileRef.current.value = "";
                    }}
                    className="absolute top-1.5 right-1.5 w-6 h-6 bg-black/50 rounded-full flex items-center justify-center hover:bg-black/70 transition-colors"
                  >
                    <X size={11} className="text-white" />
                  </button>
                </div>
              )}
              <label className="flex items-center justify-center gap-2 w-full border-2 border-dashed border-[#E2E8F0] rounded-xl p-4 cursor-pointer hover:border-[#6366F1]/50 hover:bg-[#EEF2FF]/30 transition-colors">
                <ImagePlus size={16} className="text-[#94A3B8]" />
                <span className="text-sm text-[#94A3B8]">{preview ? "Change image" : "Click to upload"}</span>
                <input
                  ref={fileRef}
                  type="file"
                  accept="image/*"
                  hidden
                  onChange={(e) => {
                    const f = e.target.files?.[0];
                    if (f) setPreview(URL.createObjectURL(f));
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
                "Update Banner"
              ) : (
                "Add Banner"
              )}
            </Button>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <Dialog open={!!deleteTarget} onOpenChange={() => setDel(null)}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>Delete Banner</DialogTitle>
          </DialogHeader>
          <p className="text-sm text-[#64748B] mt-1">
            Are you sure you want to delete{" "}
            <span className="font-medium text-[#0F172A]">{deleteTarget?.title}</span>? This cannot be undone.
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
