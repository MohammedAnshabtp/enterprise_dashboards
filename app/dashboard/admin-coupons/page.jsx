"use client";

import { useState } from "react";
import toast from "react-hot-toast";
import {
  useAdminCoupons,
  useCreateCoupon,
  useDeleteCoupon,
} from "../../hooks/useCoupons";
import dayjs from "../../lib/dayjs";

const EMPTY_FORM = {
  code: "",
  type: "percentage",
  value: "",
  minOrderAmount: "",
  maxDiscount: "",
  validFrom: "",
  validUntil: "",
  usageLimit: "",
};

export default function AdminCouponsPage() {
  const { data: coupons = [], isLoading } = useAdminCoupons({ page: 1, limit: 50 });
  const createCoupon = useCreateCoupon();
  const deleteCoupon = useDeleteCoupon();

  const [form, setForm] = useState(EMPTY_FORM);

  const handleCreate = () => {
    if (!form.code || !form.value) {
      toast.error("Code and value are required");
      return;
    }

    if (
      form.validFrom &&
      form.validUntil &&
      dayjs(form.validUntil).isBefore(dayjs(form.validFrom))
    ) {
      toast.error("End date must be after start date");
      return;
    }

    const payload = {
      code: form.code,
      type: form.type,
      value: Number(form.value),
      minOrderAmount: Number(form.minOrderAmount) || 0,
      maxDiscount: Number(form.maxDiscount) || 0,
      usageLimit: Number(form.usageLimit) || 0,
    };

    if (form.validFrom) payload.startsAt = form.validFrom;
    if (form.validUntil) payload.expiresAt = form.validUntil;

    createCoupon.mutate(payload, {
      onSuccess: () => setForm(EMPTY_FORM),
    });
  };

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-xl font-semibold">Admin Coupons</h1>

      {/* CREATE FORM */}
      <div className="bg-white p-4 rounded-xl border space-y-3">
        <input
          className="w-full border p-2 rounded"
          placeholder="Coupon Code"
          value={form.code}
          onChange={(e) => setForm({ ...form, code: e.target.value })}
        />

        <select
          className="w-full border p-2 rounded"
          value={form.type}
          onChange={(e) => setForm({ ...form, type: e.target.value })}
        >
          <option value="percentage">Percentage</option>
          <option value="flat">Flat</option>
        </select>

        <input
          className="w-full border p-2 rounded"
          type="number"
          placeholder="Value"
          value={form.value}
          onChange={(e) => setForm({ ...form, value: e.target.value })}
        />

        <input
          className="w-full border p-2 rounded"
          type="number"
          placeholder="Min Order Amount"
          value={form.minOrderAmount}
          onChange={(e) => setForm({ ...form, minOrderAmount: e.target.value })}
        />

        {form.type === "percentage" && (
          <input
            className="w-full border p-2 rounded"
            type="number"
            placeholder="Max Discount"
            value={form.maxDiscount}
            onChange={(e) => setForm({ ...form, maxDiscount: e.target.value })}
          />
        )}

        <div className="flex gap-2">
          <input
            className="w-full border p-2 rounded"
            type="date"
            value={form.validFrom}
            onChange={(e) => setForm({ ...form, validFrom: e.target.value })}
          />
          <input
            className="w-full border p-2 rounded"
            type="date"
            value={form.validUntil}
            onChange={(e) => setForm({ ...form, validUntil: e.target.value })}
          />
        </div>

        <input
          className="w-full border p-2 rounded"
          type="number"
          placeholder="Usage Limit"
          value={form.usageLimit}
          onChange={(e) => setForm({ ...form, usageLimit: e.target.value })}
        />

        <button
          onClick={handleCreate}
          disabled={createCoupon.isPending}
          className="bg-green-600 text-white px-4 py-2 rounded w-full disabled:opacity-60"
        >
          {createCoupon.isPending ? "Creating..." : "Create Coupon"}
        </button>
      </div>

      {/* LIST */}
      <div className="bg-white border rounded-xl divide-y">
        {isLoading ? (
          <p className="p-4 text-center text-gray-500">Loading...</p>
        ) : coupons.length === 0 ? (
          <p className="p-4 text-center text-gray-500">No coupons found</p>
        ) : (
          coupons.map((c) => (
            <div key={c._id} className="p-4 flex justify-between items-center">
              <div>
                <p className="font-medium">{c.code}</p>
                <p className="text-sm text-gray-500">
                  {c.type === "percentage"
                    ? `${c.value}% OFF`
                    : `₹${c.value} OFF`}
                </p>
                <p className="text-xs text-gray-400">
                  {c.startsAt ? dayjs(c.startsAt).format("DD MMM YYYY") : "—"}{" "}
                  →{" "}
                  {c.expiresAt ? dayjs(c.expiresAt).format("DD MMM YYYY") : "—"}
                </p>
              </div>

              <button
                onClick={() => deleteCoupon.mutate(c._id)}
                disabled={deleteCoupon.isPending}
                className="text-red-500 disabled:opacity-60"
              >
                Delete
              </button>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
