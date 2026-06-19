"use client";

import { useState, useEffect, useRef } from "react";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import {
  Plus, Search, Pencil, Trash2, Tag,
  ChevronLeft, ChevronRight, Percent, DollarSign,
} from "lucide-react";
import {
  useAdminCoupons, useCreateCoupon, useUpdateCoupon, useDeleteCoupon,
} from "../../hooks/useCoupons";
import dayjs from "../../lib/dayjs";
import { Button } from "../../components/ui/button";
import { Input }  from "../../components/ui/input";
import { Label }  from "../../components/ui/label";
import { Badge }  from "../../components/ui/badge";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle,
} from "../../components/ui/dialog";
import ButtonLoader from "../../components/ui/ButtonLoader";
import EmptyState   from "../../components/ui/EmptyState";

const LIMIT = 15;

const schema = yup.object({
  code:           yup.string().required("Coupon code is required"),
  type:           yup.string().oneOf(["percentage", "flat"], "Select a type").required("Type is required"),
  value:          yup.number().positive("Must be greater than 0").required("Value is required"),
  maxDiscount:    yup.number().positive().nullable().transform((v, o) => (o === "" ? null : v)),
  minOrderAmount: yup.number().min(0).nullable().transform((v, o) => (o === "" ? null : v)),
  usageLimit:     yup.number().integer().positive().nullable().transform((v, o) => (o === "" ? null : v)),
  perUserLimit:   yup.number().integer().positive().nullable().transform((v, o) => (o === "" ? null : v)),
  expiresAt:      yup.string().nullable().transform((v) => v || null),
  isActive:       yup.boolean(),
});

export default function AdminCouponsPage() {
  const [page, setPage]        = useState(1);
  const [search, setSearch]    = useState("");
  const [debSearch, setDeb]    = useState("");
  const [activeFilter, setAF]  = useState("all");
  const [modalOpen, setModal]  = useState(false);
  const [editItem, setEdit]    = useState(null);
  const [deleteTarget, setDel] = useState(null);
  const debRef                 = useRef(null);

  useEffect(() => {
    clearTimeout(debRef.current);
    debRef.current = setTimeout(() => { setDeb(search); setPage(1); }, 400);
    return () => clearTimeout(debRef.current);
  }, [search]);

  const params = {
    page,
    limit: LIMIT,
    ...(activeFilter !== "all" && { active: activeFilter === "active" }),
  };
  const { data: result, isLoading, isFetching } = useAdminCoupons(params);
  const items      = result?.data       ?? [];
  const pagination = result?.pagination ?? {};

  const filteredItems = debSearch
    ? items.filter((c) => c.code?.toLowerCase().includes(debSearch.toLowerCase()))
    : items;

  const create = useCreateCoupon();
  const update = useUpdateCoupon();
  const del    = useDeleteCoupon();

  const {
    register, handleSubmit, reset, watch, setValue,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: yupResolver(schema),
    defaultValues: {
      code: "", type: "percentage", value: "", maxDiscount: "",
      minOrderAmount: "", usageLimit: "", perUserLimit: "", expiresAt: "", isActive: true,
    },
  });

  const watchType     = watch("type");
  const watchIsActive = watch("isActive");

  const openAdd = () => {
    setEdit(null);
    reset({
      code: "", type: "percentage", value: "", maxDiscount: "",
      minOrderAmount: "", usageLimit: "", perUserLimit: "", expiresAt: "", isActive: true,
    });
    setModal(true);
  };

  const openEdit = (item) => {
    setEdit(item);
    reset({
      code:           item.code ?? "",
      type:           item.type ?? "percentage",
      value:          item.value ?? "",
      maxDiscount:    item.maxDiscount ?? "",
      minOrderAmount: item.minOrderAmount ?? "",
      usageLimit:     item.usageLimit ?? "",
      perUserLimit:   item.perUserLimit ?? "",
      expiresAt:      item.expiresAt ? dayjs(item.expiresAt).format("YYYY-MM-DD") : "",
      isActive:       item.isActive ?? true,
    });
    setModal(true);
  };

  const onSubmit = async (data) => {
    const payload = {
      code:           data.code.toUpperCase(),
      type:           data.type,
      value:          data.value,
      maxDiscount:    data.maxDiscount || undefined,
      minOrderAmount: data.minOrderAmount || undefined,
      usageLimit:     data.usageLimit || undefined,
      perUserLimit:   data.perUserLimit || undefined,
      expiresAt:      data.expiresAt || undefined,
      isActive:       data.isActive,
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
              <Tag size={18} className="text-[#6366F1]" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-[#0F172A]">Coupons</h1>
              <p className="text-xs text-[#94A3B8]">
                {pagination.total != null
                  ? `${pagination.total} coupons total`
                  : "Manage discount coupons"}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            <div className="relative">
              <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#94A3B8]" />
              <Input
                placeholder="Search code…"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-8 w-44 h-9 text-sm"
              />
            </div>
            <div className="flex items-center bg-[#F1F5F9] rounded-xl p-1 gap-0.5">
              {["all", "active", "inactive"].map((f) => (
                <button
                  key={f}
                  onClick={() => { setAF(f); setPage(1); }}
                  className={`px-3 h-7 rounded-lg text-xs font-medium transition-colors cursor-pointer ${
                    activeFilter === f
                      ? "bg-white shadow-sm text-[#6366F1]"
                      : "text-[#94A3B8] hover:text-[#64748B]"
                  }`}
                >
                  {f.charAt(0).toUpperCase() + f.slice(1)}
                </button>
              ))}
            </div>
            <Button onClick={openAdd} size="sm">
              <Plus size={14} className="mr-1.5" /> Add Coupon
            </Button>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className={`transition-opacity duration-150 ${isFetching && !isLoading ? "opacity-60" : ""}`}>
        {isLoading ? (
          <div className="bg-white rounded-2xl border border-[#E2E8F0] overflow-hidden">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className={`flex gap-4 p-4 animate-pulse ${i > 0 ? "border-t border-[#F1F5F9]" : ""}`}>
                <div className="w-24 h-5 bg-[#F1F5F9] rounded" />
                <div className="flex-1 space-y-2">
                  <div className="h-4 bg-[#F1F5F9] rounded w-1/4" />
                  <div className="h-3 bg-[#F1F5F9] rounded w-1/3" />
                </div>
              </div>
            ))}
          </div>
        ) : filteredItems.length === 0 ? (
          <EmptyState icon={Tag} title="No coupons found" />
        ) : (
          <div className="bg-white rounded-2xl border border-[#E2E8F0] shadow-sm overflow-hidden">
            {/* Table header */}
            <div className="hidden md:grid grid-cols-[1fr_auto_auto_auto_auto_auto_auto] gap-4 px-4 py-2.5 bg-[#F8FAFC] border-b border-[#E2E8F0]">
              <span className="text-xs font-semibold text-[#94A3B8] uppercase tracking-wide">Code</span>
              <span className="text-xs font-semibold text-[#94A3B8] uppercase tracking-wide">Type</span>
              <span className="text-xs font-semibold text-[#94A3B8] uppercase tracking-wide">Value</span>
              <span className="text-xs font-semibold text-[#94A3B8] uppercase tracking-wide">Used</span>
              <span className="text-xs font-semibold text-[#94A3B8] uppercase tracking-wide">Expires</span>
              <span className="text-xs font-semibold text-[#94A3B8] uppercase tracking-wide">Status</span>
              <span className="text-xs font-semibold text-[#94A3B8] uppercase tracking-wide">Actions</span>
            </div>
            {filteredItems.map((item, i) => (
              <div
                key={item._id}
                className={`flex flex-col md:grid md:grid-cols-[1fr_auto_auto_auto_auto_auto_auto] md:items-center gap-3 md:gap-4 px-4 py-3 hover:bg-[#F8FAFC] transition-colors group ${
                  i > 0 ? "border-t border-[#F1F5F9]" : ""
                }`}
              >
                <div>
                  <span className="font-mono font-semibold text-sm text-[#0F172A]">{item.code}</span>
                  {item.minOrderAmount > 0 && (
                    <p className="text-xs text-[#94A3B8]">
                      Min order: ₹{item.minOrderAmount.toLocaleString()}
                    </p>
                  )}
                </div>
                <Badge className={item.type === "percentage" ? "bg-[#EEF2FF] text-[#6366F1]" : "bg-[#FEF3C7] text-[#D97706]"}>
                  {item.type === "percentage" ? (
                    <span className="flex items-center gap-1"><Percent size={10} /> %</span>
                  ) : (
                    <span className="flex items-center gap-1"><DollarSign size={10} /> Flat</span>
                  )}
                </Badge>
                <span className="text-sm font-semibold text-[#0F172A]">
                  {item.type === "percentage" ? `${item.value}%` : `₹${item.value}`}
                  {item.maxDiscount && item.type === "percentage" && (
                    <span className="text-xs text-[#94A3B8] ml-1">(max ₹{item.maxDiscount})</span>
                  )}
                </span>
                <span className="text-sm text-[#64748B]">
                  {item.totalUsed ?? 0}
                  {item.usageLimit && <span className="text-[#94A3B8]">/{item.usageLimit}</span>}
                </span>
                <span className="text-sm text-[#64748B]">
                  {item.expiresAt ? dayjs(item.expiresAt).format("DD MMM YYYY") : "—"}
                </span>
                <Badge
                  className={
                    item.isActive
                      ? "bg-[#DCFCE7] text-[#16A34A]"
                      : "bg-[#F1F5F9] text-[#64748B]"
                  }
                >
                  {item.isActive ? "Active" : "Inactive"}
                </Badge>
                <div className="flex gap-1.5 md:opacity-0 md:group-hover:opacity-100 transition-opacity">
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
              const from = (pagination.page - 1) * pagination.limit + 1;
              const to   = Math.min(pagination.page * pagination.limit, pagination.total);
              return `Showing ${from}–${to} of ${pagination.total}`;
            })()}
          </p>
          <div className="flex items-center gap-1">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setPage((p) => p - 1)}
              disabled={pagination.page <= 1 || isFetching}
            >
              <ChevronLeft size={15} />
            </Button>
            {Array.from({ length: pagination.totalPages }, (_, i) => i + 1)
              .filter(
                (p) =>
                  p === 1 ||
                  p === pagination.totalPages ||
                  Math.abs(p - pagination.page) <= 1
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
                    variant={p === pagination.page ? "default" : "ghost"}
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
              disabled={pagination.page >= pagination.totalPages || isFetching}
            >
              <ChevronRight size={15} />
            </Button>
          </div>
        </div>
      )}

      {/* Add / Edit Dialog */}
      <Dialog open={modalOpen} onOpenChange={setModal}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>{editItem ? "Edit Coupon" : "Add Coupon"}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 mt-2">
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label>
                  Code <span className="text-red-500">*</span>
                </Label>
                <Input
                  placeholder="e.g. SAVE20"
                  {...register("code")}
                  className="uppercase"
                  style={{ textTransform: "uppercase" }}
                />
                {errors.code && <p className="text-xs text-[#EF4444]">{errors.code.message}</p>}
              </div>
              <div className="space-y-1.5">
                <Label>
                  Type <span className="text-red-500">*</span>
                </Label>
                <select
                  {...register("type")}
                  className="w-full h-10 rounded-lg border border-[#E2E8F0] bg-white px-3 text-sm text-[#0F172A] focus:outline-none focus:ring-2 focus:ring-[#6366F1]/30"
                >
                  <option value="percentage">Percentage (%)</option>
                  <option value="flat">Flat (₹)</option>
                </select>
                {errors.type && <p className="text-xs text-[#EF4444]">{errors.type.message}</p>}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label>
                  Value <span className="text-red-500">*</span>{" "}
                  <span className="text-[#94A3B8] text-xs">
                    ({watchType === "percentage" ? "%" : "₹"})
                  </span>
                </Label>
                <Input type="number" min="0" step="0.01" placeholder="20" {...register("value")} />
                {errors.value && <p className="text-xs text-[#EF4444]">{errors.value.message}</p>}
              </div>
              {watchType === "percentage" && (
                <div className="space-y-1.5">
                  <Label>Max Discount (₹)</Label>
                  <Input type="number" min="0" placeholder="Optional" {...register("maxDiscount")} />
                  {errors.maxDiscount && <p className="text-xs text-[#EF4444]">{errors.maxDiscount.message}</p>}
                </div>
              )}
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label>Min Order Amount (₹)</Label>
                <Input type="number" min="0" placeholder="Optional" {...register("minOrderAmount")} />
              </div>
              <div className="space-y-1.5">
                <Label>Expires At</Label>
                <Input type="date" {...register("expiresAt")} />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label>Total Usage Limit</Label>
                <Input type="number" min="1" placeholder="Unlimited" {...register("usageLimit")} />
              </div>
              <div className="space-y-1.5">
                <Label>Per User Limit</Label>
                <Input type="number" min="1" placeholder="Unlimited" {...register("perUserLimit")} />
              </div>
            </div>

            <div className="space-y-1.5">
              <Label>Status</Label>
              <button
                type="button"
                onClick={() => setValue("isActive", !watchIsActive)}
                className={`w-full h-10 rounded-lg border text-sm font-medium transition-colors cursor-pointer ${
                  watchIsActive
                    ? "bg-[#DCFCE7] border-[#16A34A]/30 text-[#16A34A]"
                    : "bg-[#F1F5F9] border-[#E2E8F0] text-[#64748B]"
                }`}
              >
                {watchIsActive ? "Active" : "Inactive"}
              </button>
            </div>

            <Button
              type="submit"
              disabled={isPending || isSubmitting}
              className="w-full disabled:cursor-not-allowed"
            >
              {isPending || isSubmitting ? (
                <ButtonLoader text="Saving…" />
              ) : editItem ? (
                "Update Coupon"
              ) : (
                "Add Coupon"
              )}
            </Button>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <Dialog open={!!deleteTarget} onOpenChange={() => setDel(null)}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>Delete Coupon</DialogTitle>
          </DialogHeader>
          <p className="text-sm text-[#64748B] mt-1">
            Are you sure you want to delete coupon{" "}
            <span className="font-mono font-semibold text-[#0F172A]">{deleteTarget?.code}</span>? This
            cannot be undone.
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
