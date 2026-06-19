"use client";

import { useState, useEffect, useRef } from "react";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import {
  Plus, Search, Pencil, Trash2, Tag,
  ChevronLeft, ChevronRight, Percent,
  Users, Calendar, AlertTriangle, Power,
  X, CheckCircle2,
} from "lucide-react";
import {
  useAdminCoupons, useCreateCoupon, useUpdateCoupon, useDeleteCoupon,
} from "../../hooks/useCoupons";
import dayjs from "../../lib/dayjs";
import { Button }  from "../../components/ui/button";
import { Input }   from "../../components/ui/input";
import { Label }   from "../../components/ui/label";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle,
} from "../../components/ui/dialog";
import ButtonLoader from "../../components/ui/ButtonLoader";
import EmptyState   from "../../components/ui/EmptyState";

// ─── Schema ──────────────────────────────────────────────────────────────────

const toNull = (v, o) => (o === "" || o == null ? null : v);

const schema = yup.object({
  code:           yup.string().trim().required("Coupon code is required"),
  type:           yup.string().oneOf(["percentage", "flat"]).required("Type is required"),
  value:          yup.number().typeError("Enter a number").positive("Must be > 0").required("Value is required"),
  maxDiscount:    yup.number().typeError("Enter a number").positive("Must be > 0").nullable().transform(toNull),
  minOrderAmount: yup.number().typeError("Enter a number").min(0).nullable().transform(toNull),
  usageLimit:     yup.number().typeError("Enter a number").integer().positive().nullable().transform(toNull),
  perUserLimit:   yup.number().typeError("Enter a number").integer().positive().nullable().transform(toNull),
  expiresAt:      yup.string().nullable().transform((v) => v || null),
  isActive:       yup.boolean().default(true),
});

// ─── Helpers ─────────────────────────────────────────────────────────────────

function getExpiryInfo(expiresAt, isActive = true) {
  if (!expiresAt) return { label: "Never expires", short: "No expiry", color: "#94A3B8", urgent: false, expired: false };
  const d   = dayjs(expiresAt);
  const now = dayjs();
  if (d.isBefore(now)) {
    // Date is in the past — only label as "Expired" if the coupon is also inactive
    if (!isActive) return { label: "Expired", short: "Expired", color: "#EF4444", urgent: true, expired: true };
    return { label: d.format("DD MMM YYYY"), short: d.format("DD MMM YY"), color: "#F59E0B", urgent: true, expired: false };
  }
  const days = d.diff(now, "day");
  if (days <= 3) return { label: `Expires in ${days}d`, short: `${days}d left`, color: "#EF4444", urgent: true, expired: false };
  if (days <= 7) return { label: `Expires in ${days}d`, short: `${days}d left`, color: "#F59E0B", urgent: true, expired: false };
  return { label: d.format("DD MMM YYYY"), short: d.format("DD MMM YY"), color: "#64748B", urgent: false, expired: false };
}

function getDiscountText(type, value, maxDiscount) {
  if (!type || value == null || value === "") return { main: "—", sub: null };
  if (type === "percentage") {
    return {
      main: `${value} off`,
      sub: maxDiscount ? `max ₹${maxDiscount}` : null,
      color: "#6366F1",
      bg: "#EEF2FF",
    };
  }
  return { main: `₹${value} off`, sub: "Fixed amount", color: "#D97706", bg: "#FEF3C7" };
}

// ─── Coupon Preview Card (shown in dialog) ────────────────────────────────────

function CouponPreview({ values }) {
  const { code, type, value, maxDiscount, minOrderAmount, expiresAt } = values;
  const discount = getDiscountText(type, value, maxDiscount);
  const expiry   = getExpiryInfo(expiresAt);

  return (
    <div className="relative rounded-2xl border-2 border-dashed border-[#6366F1]/30 bg-linear-to-br from-[#EEF2FF] to-[#F5F3FF] p-5 overflow-hidden">
      {/* Decorative circles */}
      <div className="absolute -left-4 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-white border-2 border-dashed border-[#6366F1]/30" />
      <div className="absolute -right-4 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-white border-2 border-dashed border-[#6366F1]/30" />

      <div className="flex items-center gap-4">
        <div className="flex-1 min-w-0">
          <p className="font-mono text-xl font-bold tracking-widest text-[#6366F1] truncate">
            {code ? code.toUpperCase() : "PREVIEW"}
          </p>
          <p className="text-xs text-[#6366F1]/60 mt-0.5">
            {minOrderAmount > 0 ? `Min. order ₹${minOrderAmount}` : "No minimum order"}
            {" · "}
            {expiry.label}
          </p>
        </div>
        <div className="shrink-0 text-right">
          <p className="text-2xl font-bold" style={{ color: discount.color ?? "#6366F1" }}>
            {discount.main}
          </p>
          {discount.sub && (
            <p className="text-xs mt-0.5" style={{ color: discount.color ?? "#6366F1" }}>
              {discount.sub}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── Usage bar ────────────────────────────────────────────────────────────────

function UsageBar({ used, limit }) {
  if (!limit) {
    return (
      <div className="text-sm text-[#64748B]">
        <span className="font-semibold text-[#0F172A]">{used}</span>
        <span className="text-xs text-[#94A3B8] ml-1">/ ∞</span>
      </div>
    );
  }
  const pct = Math.min(Math.round((used / limit) * 100), 100);
  const color = pct >= 90 ? "#EF4444" : pct >= 70 ? "#F59E0B" : "#10B981";
  return (
    <div className="space-y-1 min-w-[80px]">
      <div className="flex items-baseline gap-0.5">
        <span className="text-sm font-semibold text-[#0F172A]">{used}</span>
        <span className="text-xs text-[#94A3B8]">/{limit}</span>
      </div>
      <div className="h-1.5 bg-[#F1F5F9] rounded-full overflow-hidden w-20">
        <div
          className="h-full rounded-full transition-all duration-500"
          style={{ width: `${pct}%`, backgroundColor: color }}
        />
      </div>
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

const LIMIT = 15;

const EMPTY_FORM = {
  code: "", type: "percentage", value: "", maxDiscount: "",
  minOrderAmount: "", usageLimit: "", perUserLimit: "1", expiresAt: "", isActive: true,
};

export default function AdminCouponsPage() {
  const [page, setPage]         = useState(1);
  const [search, setSearch]     = useState("");
  const [debSearch, setDeb]     = useState("");
  const [activeFilter, setAF]   = useState("all");
  const [modalOpen, setModal]   = useState(false);
  const [editItem, setEdit]     = useState(null);
  const [deleteTarget, setDel]  = useState(null);
  const [togglingId, setToggling] = useState(null);
  const debRef = useRef(null);

  useEffect(() => {
    clearTimeout(debRef.current);
    debRef.current = setTimeout(() => { setDeb(search); setPage(1); }, 400);
    return () => clearTimeout(debRef.current);
  }, [search]);

  const params = {
    page, limit: LIMIT,
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
  } = useForm({ resolver: yupResolver(schema), defaultValues: EMPTY_FORM });

  const formValues   = watch();
  const watchType    = formValues.type;
  const watchActive  = formValues.isActive;

  const openAdd = () => {
    setEdit(null);
    reset(EMPTY_FORM);
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
      perUserLimit:   item.perUserLimit ?? "1",
      expiresAt:      item.expiresAt ? dayjs(item.expiresAt).format("YYYY-MM-DD") : "",
      isActive:       item.isActive ?? true,
    });
    setModal(true);
  };

  const onSubmit = async (data) => {
    const payload = {
      code:           data.code.toUpperCase().trim(),
      type:           data.type,
      value:          data.value,
      maxDiscount:    data.maxDiscount ?? null,
      minOrderAmount: data.minOrderAmount ?? 0,
      usageLimit:     data.usageLimit ?? null,
      perUserLimit:   data.perUserLimit ?? 1,
      expiresAt:      data.expiresAt || null,
      isActive:       data.isActive,
    };
    if (editItem) await update.mutateAsync({ id: editItem._id, data: payload });
    else          await create.mutateAsync(payload);
    setModal(false);
  };

  const quickToggle = async (item) => {
    setToggling(item._id);
    try { await update.mutateAsync({ id: item._id, data: { isActive: !item.isActive } }); }
    finally { setToggling(null); }
  };

  const confirmDelete = () => { del.mutate(deleteTarget._id); setDel(null); };
  const isPending = create.isPending || update.isPending;

  return (
    <div className="space-y-5">
      {/* ── Header ── */}
      <div className="bg-white rounded-2xl border border-[#E2E8F0] shadow-sm px-6 py-4">
        <div className="flex flex-col sm:flex-row sm:items-center gap-4">
          <div className="flex items-center gap-3 flex-1">
            <div className="w-10 h-10 rounded-xl bg-[#EEF2FF] flex items-center justify-center shrink-0">
              <Tag size={18} className="text-[#6366F1]" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-[#0F172A]">Coupons</h1>
              <p className="text-xs text-[#94A3B8]">
                {pagination.total != null ? `${pagination.total} coupons total` : "Manage discount coupons"}
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
            <div className="flex items-center bg-[#F1F5F9] rounded-xl p-0.5 gap-0.5">
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
            <Button onClick={openAdd} size="sm" className="gap-1.5">
              <Plus size={14} /> Add Coupon
            </Button>
          </div>
        </div>
      </div>

      {/* ── Table ── */}
      <div className={`transition-opacity duration-150 ${isFetching && !isLoading ? "opacity-60" : ""}`}>
        {isLoading ? (
          <div className="bg-white rounded-2xl border border-[#E2E8F0] overflow-hidden">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className={`flex items-center gap-4 px-5 py-4 animate-pulse ${i > 0 ? "border-t border-[#F1F5F9]" : ""}`}>
                <div className="w-28 h-6 bg-[#F1F5F9] rounded-lg" />
                <div className="flex-1 h-4 bg-[#F1F5F9] rounded" />
                <div className="w-16 h-4 bg-[#F1F5F9] rounded" />
                <div className="w-20 h-4 bg-[#F1F5F9] rounded" />
                <div className="w-16 h-6 bg-[#F1F5F9] rounded-full" />
              </div>
            ))}
          </div>
        ) : filteredItems.length === 0 ? (
          <EmptyState icon={Tag} title="No coupons found" description="Add a coupon to offer discounts to your customers." action={{ label: "Add Coupon", onClick: openAdd }} />
        ) : (
          <div className="bg-white rounded-2xl border border-[#E2E8F0] shadow-sm overflow-hidden">
            {/* Column headers */}
            <div className="hidden lg:grid grid-cols-[minmax(0,1.5fr)_150px_110px_130px_110px_90px_72px] gap-4 px-5 py-2.5 bg-[#F8FAFC] border-b border-[#E2E8F0]">
              {["CODE", "DISCOUNT", "USAGE", "EXPIRY", "PER CUSTOMER", "STATUS", ""].map((h) => (
                <span key={h} className="text-[10px] font-bold text-[#94A3B8] uppercase tracking-widest">{h}</span>
              ))}
            </div>

            <div className="divide-y divide-[#F1F5F9]">
              {filteredItems.map((item) => {
                const discount = getDiscountText(item.type, item.value, item.maxDiscount);
                const expiry   = getExpiryInfo(item.expiresAt, item.isActive);
                const isToggling = togglingId === item._id;

                return (
                  <div
                    key={item._id}
                    className="group flex flex-col lg:grid lg:grid-cols-[minmax(0,1.5fr)_150px_110px_130px_110px_90px_72px] lg:items-center gap-3 lg:gap-4 px-5 py-4 hover:bg-[#FAFBFF] transition-colors"
                  >
                    {/* Code */}
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="font-mono font-bold text-sm text-[#0F172A] bg-[#F8FAFC] border border-[#E2E8F0] px-2.5 py-0.5 rounded-lg tracking-wider">
                          {item.code}
                        </span>
                        {item.isStockOnly && (
                          <span className="text-[10px] bg-[#EEF2FF] text-[#6366F1] px-1.5 py-0.5 rounded font-semibold">
                            STOCK
                          </span>
                        )}
                      </div>
                      {item.minOrderAmount > 0 && (
                        <p className="text-xs text-[#94A3B8] mt-1">
                          Min. order ₹{item.minOrderAmount.toLocaleString("en-IN")}
                        </p>
                      )}
                    </div>

                    {/* Discount */}
                    <div>
                      <span
                        className="inline-flex items-center gap-1.5 text-sm font-bold px-3 py-1 rounded-lg"
                        style={{ color: discount.color, backgroundColor: discount.bg }}
                      >
                        {item.type === "percentage" ? <Percent size={12} /> : <span className="text-xs font-bold">₹</span>}
                        {discount.main}
                      </span>
                      {discount.sub && (
                        <p className="text-xs text-[#94A3B8] mt-1">{discount.sub}</p>
                      )}
                    </div>

                    {/* Usage */}
                    <UsageBar used={item.totalUsed ?? 0} limit={item.usageLimit} />

                    {/* Expiry */}
                    <div className="flex items-center gap-1.5">
                      {expiry.urgent && <AlertTriangle size={12} style={{ color: expiry.color }} />}
                      <span
                        className="text-xs font-medium"
                        style={{ color: expiry.color }}
                      >
                        {expiry.label}
                      </span>
                    </div>

                    {/* Per customer */}
                    <div className="flex items-center gap-1.5">
                      <Users size={12} className="text-[#94A3B8]" />
                      <span className="text-sm text-[#64748B]">
                        {item.perUserLimit ?? 1}×
                      </span>
                    </div>

                    {/* Status toggle */}
                    <button
                      type="button"
                      onClick={() => quickToggle(item)}
                      disabled={isToggling}
                      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold transition-all cursor-pointer disabled:opacity-50 ${
                        item.isActive
                          ? "bg-[#DCFCE7] text-[#16A34A] hover:bg-[#BBF7D0]"
                          : "bg-[#F1F5F9] text-[#64748B] hover:bg-[#E2E8F0]"
                      }`}
                    >
                      <Power size={10} />
                      {item.isActive ? "Active" : "Inactive"}
                    </button>

                    {/* Actions */}
                    <div className="flex gap-1 lg:opacity-0 lg:group-hover:opacity-100 transition-opacity">
                      <button
                        onClick={() => openEdit(item)}
                        className="w-8 h-8 rounded-lg flex items-center justify-center hover:bg-[#EEF2FF] transition-colors cursor-pointer"
                        title="Edit"
                      >
                        <Pencil size={13} className="text-[#6366F1]" />
                      </button>
                      <button
                        onClick={() => setDel(item)}
                        className="w-8 h-8 rounded-lg flex items-center justify-center hover:bg-[#FEE2E2] transition-colors cursor-pointer"
                        title="Delete"
                      >
                        <Trash2 size={13} className="text-[#EF4444]" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* ── Pagination ── */}
      {pagination.totalPages > 1 && (
        <div className="flex items-center justify-between bg-white rounded-2xl border border-[#E2E8F0] shadow-sm px-5 py-3">
          <p className="text-xs text-[#94A3B8]">
            {(() => {
              const from = (pagination.page - 1) * pagination.limit + 1;
              const to   = Math.min(pagination.page * pagination.limit, pagination.total);
              return `${from}–${to} of ${pagination.total}`;
            })()}
          </p>
          <div className="flex items-center gap-1">
            <Button variant="ghost" size="sm" onClick={() => setPage((p) => p - 1)} disabled={pagination.page <= 1 || isFetching}>
              <ChevronLeft size={14} />
            </Button>
            {Array.from({ length: pagination.totalPages }, (_, i) => i + 1)
              .filter((p) => p === 1 || p === pagination.totalPages || Math.abs(p - pagination.page) <= 1)
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
                      p === pagination.page
                        ? "bg-[#6366F1] text-white shadow-sm"
                        : "text-[#64748B] hover:bg-[#F1F5F9]"
                    }`}
                  >
                    {p}
                  </button>
                )
              )}
            <Button variant="ghost" size="sm" onClick={() => setPage((p) => p + 1)} disabled={pagination.page >= pagination.totalPages || isFetching}>
              <ChevronRight size={14} />
            </Button>
          </div>
        </div>
      )}

      {/* ── Add / Edit Dialog ── */}
      <Dialog open={modalOpen} onOpenChange={setModal}>
        <DialogContent className="max-w-xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-[#EEF2FF] flex items-center justify-center">
                <Tag size={14} className="text-[#6366F1]" />
              </div>
              {editItem ? "Edit Coupon" : "New Coupon"}
            </DialogTitle>
          </DialogHeader>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5 mt-1">
            {/* Live preview */}
            <CouponPreview values={formValues} />

            {/* Discount section */}
            <div className="space-y-3">
              <p className="text-xs font-bold text-[#94A3B8] uppercase tracking-widest">Discount</p>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label>Code <span className="text-red-500">*</span></Label>
                  <Input
                    placeholder="e.g. SAVE20"
                    {...register("code")}
                    className="uppercase font-mono tracking-widest"
                    style={{ textTransform: "uppercase" }}
                    disabled={!!editItem}
                  />
                  {editItem && <p className="text-[10px] text-[#94A3B8]">Code cannot be changed after creation</p>}
                  {errors.code && <p className="text-xs text-[#EF4444]">{errors.code.message}</p>}
                </div>
                <div className="space-y-1.5">
                  <Label>Type <span className="text-red-500">*</span></Label>
                  <div className="flex gap-2">
                    {[
                      { value: "percentage", label: "% Off", icon: "%" },
                      { value: "flat",       label: "₹ Off", icon: "₹" },
                    ].map((opt) => (
                      <button
                        key={opt.value}
                        type="button"
                        onClick={() => { setValue("type", opt.value); if (opt.value === "flat") setValue("maxDiscount", ""); }}
                        className={`flex-1 flex items-center justify-center gap-1.5 h-10 rounded-lg border text-sm font-medium transition-all cursor-pointer ${
                          watchType === opt.value
                            ? "bg-[#EEF2FF] border-[#6366F1]/40 text-[#6366F1]"
                            : "bg-white border-[#E2E8F0] text-[#64748B] hover:border-[#6366F1]/30"
                        }`}
                      >
                        <span className="font-bold">{opt.icon}</span> {opt.label}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label>
                    Value <span className="text-red-500">*</span>
                    <span className="text-[#94A3B8] font-normal ml-1 text-xs">
                      ({watchType === "percentage" ? "0–100%" : "amount in ₹"})
                    </span>
                  </Label>
                  <Input type="number" min="0" step="0.01" placeholder={watchType === "percentage" ? "20" : "150"} {...register("value")} />
                  {errors.value && <p className="text-xs text-[#EF4444]">{errors.value.message}</p>}
                </div>
                {watchType === "percentage" && (
                  <div className="space-y-1.5">
                    <Label>Max Discount Cap <span className="text-[#94A3B8] font-normal text-xs">(₹, optional)</span></Label>
                    <Input type="number" min="0" placeholder="e.g. 200" {...register("maxDiscount")} />
                    <p className="text-[10px] text-[#94A3B8]">Limits max discount even if % is higher</p>
                    {errors.maxDiscount && <p className="text-xs text-[#EF4444]">{errors.maxDiscount.message}</p>}
                  </div>
                )}
              </div>
            </div>

            {/* Restrictions section */}
            <div className="space-y-3 pt-1 border-t border-[#F1F5F9]">
              <p className="text-xs font-bold text-[#94A3B8] uppercase tracking-widest">Restrictions</p>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label>Min. Order Amount <span className="text-[#94A3B8] font-normal text-xs">(₹)</span></Label>
                  <Input type="number" min="0" placeholder="0 (no minimum)" {...register("minOrderAmount")} />
                  {errors.minOrderAmount && <p className="text-xs text-[#EF4444]">{errors.minOrderAmount.message}</p>}
                </div>
                <div className="space-y-1.5">
                  <Label>Expires On <span className="text-[#94A3B8] font-normal text-xs">(optional)</span></Label>
                  <Input type="date" {...register("expiresAt")} />
                </div>
              </div>
            </div>

            {/* Limits section */}
            <div className="space-y-3 pt-1 border-t border-[#F1F5F9]">
              <p className="text-xs font-bold text-[#94A3B8] uppercase tracking-widest">Usage Limits</p>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label>Total Uses Allowed</Label>
                  <Input type="number" min="1" placeholder="Unlimited" {...register("usageLimit")} />
                  <p className="text-[10px] text-[#94A3B8]">Leave blank for unlimited</p>
                  {errors.usageLimit && <p className="text-xs text-[#EF4444]">{errors.usageLimit.message}</p>}
                </div>
                <div className="space-y-1.5">
                  <Label>Uses Per Customer</Label>
                  <Input type="number" min="1" placeholder="1" {...register("perUserLimit")} />
                  <p className="text-[10px] text-[#94A3B8]">Default: 1 use per customer</p>
                  {errors.perUserLimit && <p className="text-xs text-[#EF4444]">{errors.perUserLimit.message}</p>}
                </div>
              </div>
            </div>

            {/* Status */}
            <div className="pt-1 border-t border-[#F1F5F9]">
              <button
                type="button"
                onClick={() => setValue("isActive", !watchActive)}
                className={`w-full flex items-center justify-between px-4 h-12 rounded-xl border font-medium text-sm transition-all cursor-pointer ${
                  watchActive
                    ? "bg-[#F0FDF4] border-[#A7F3D0] text-[#065F46]"
                    : "bg-[#F8FAFC] border-[#E2E8F0] text-[#64748B]"
                }`}
              >
                <span>{watchActive ? "Coupon is active and visible to customers" : "Coupon is disabled"}</span>
                <span className={`w-5 h-5 rounded-full flex items-center justify-center ${watchActive ? "bg-[#10B981]" : "bg-[#CBD5E1]"}`}>
                  {watchActive && <CheckCircle2 size={12} className="text-white" />}
                </span>
              </button>
            </div>

            <Button type="submit" disabled={isPending || isSubmitting} className="w-full">
              {isPending || isSubmitting
                ? <ButtonLoader text="Saving…" />
                : editItem ? "Update Coupon" : "Create Coupon"}
            </Button>
          </form>
        </DialogContent>
      </Dialog>

      {/* ── Delete Confirm ── */}
      <Dialog open={!!deleteTarget} onOpenChange={() => setDel(null)}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-[#EF4444]">
              <Trash2 size={16} /> Delete Coupon
            </DialogTitle>
          </DialogHeader>
          <div className="mt-2 space-y-3">
            <p className="text-sm text-[#64748B]">
              Permanently delete coupon{" "}
              <span className="font-mono font-bold text-[#0F172A] bg-[#F8FAFC] border border-[#E2E8F0] px-2 py-0.5 rounded">
                {deleteTarget?.code}
              </span>
              ? This cannot be undone.
            </p>
            {(deleteTarget?.totalUsed ?? 0) > 0 && (
              <div className="flex items-start gap-2 bg-[#FFF8E1] rounded-xl px-3 py-2.5 border border-[#FDE68A]">
                <AlertTriangle size={13} className="text-[#D97706] shrink-0 mt-0.5" />
                <p className="text-xs text-[#92400E]">
                  This coupon has been used {deleteTarget.totalUsed} time{deleteTarget.totalUsed > 1 ? "s" : ""}. Deleting it will not affect past orders.
                </p>
              </div>
            )}
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
