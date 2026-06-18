"use client";

import { useEffect, useState } from "react";
import { useCouponStore } from "../../store/useCouponStore";

export default function AdminCouponsPage() {
  const { coupons, fetchCoupons, createCoupon, deleteCoupon } =
    useCouponStore();

  const [form, setForm] = useState({
    code: "",
    type: "percentage",
    value: "",
    minOrderAmount: "",
    maxDiscount: "",
    validFrom: "",
    validUntil: "",
    usageLimit: "",
  });

  useEffect(() => {
    fetchCoupons();
  }, []);

  // ✅ CREATE COUPON
  const handleCreate = async () => {
    try {
      // 🔥 Validation
      if (!form.code || !form.value) {
        return alert("Code & Value required");
      }

      if (
        form.validFrom &&
        form.validUntil &&
        new Date(form.validUntil) < new Date(form.validFrom)
      ) {
        return alert("Invalid date range");
      }

      const payload = {
        code: form.code,
        type: form.type,
        value: Number(form.value),
        minOrderAmount: Number(form.minOrderAmount) || 0,
        maxDiscount: Number(form.maxDiscount) || 0,
        usageLimit: Number(form.usageLimit) || 0,
      };

      // ✅ Correct backend fields
      if (form.validFrom) payload.startsAt = form.validFrom;
      if (form.validUntil) payload.expiresAt = form.validUntil;

      await createCoupon(payload);

      // ✅ Reset form
      setForm({
        code: "",
        type: "percentage",
        value: "",
        minOrderAmount: "",
        maxDiscount: "",
        validFrom: "",
        validUntil: "",
        usageLimit: "",
      });

      fetchCoupons();
      alert("Coupon created successfully");
    } catch (err) {
      console.log(err.response?.data);
      alert(err.response?.data?.message || "Failed");
    }
  };

  const handleDelete = async (id) => {
    try {
      await deleteCoupon(id);
      fetchCoupons(); // 🔥 IMPORTANT
    } catch (err) {
      console.log(err.response?.data);
      alert(err.response?.data?.message || "Delete failed");
    }
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
          className="bg-green-600 text-white px-4 py-2 rounded w-full"
        >
          Create Coupon
        </button>
      </div>

      {/* LIST */}
      <div className="bg-white border rounded-xl divide-y">
        {coupons.length === 0 ? (
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
                  {c.startsAt?.slice(0, 10)} → {c.expiresAt?.slice(0, 10)}
                </p>
              </div>

              <button
                onClick={() => handleDelete(c._id)}
                className="text-red-500"
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
