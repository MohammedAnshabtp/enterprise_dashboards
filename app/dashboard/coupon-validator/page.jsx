"use client";

import { useState } from "react";
import { validateCoupon } from "../../services/couponService";

export default function CouponValidator() {
  const [code, setCode] = useState("");
  const [result, setResult] = useState(null);

  const handleValidate = async () => {
    try {
      const res = await validateCoupon({ code });
      setResult(res);
    } catch (err) {
      setResult({
        error: err.response?.data?.message || "Invalid coupon",
      });
    }
  };

  return (
    <div className="p-6 space-y-6 max-w-md m-auto">
      <h1 className="text-xl font-semibold text-black">Validate Coupon</h1>

      <input
        placeholder="Enter coupon code"
        value={code}
        onChange={(e) => setCode(e.target.value)}
        className="w-full border p-3 rounded text-black"
      />

      <button
        onClick={handleValidate}
        className="bg-indigo-600 text-white px-4 py-2 rounded w-full"
      >
        Validate
      </button>

      {result && (
        <div className="p-4 border rounded bg-gray-50">
          {result.error ? (
            <p className="text-red-500">{result.error}</p>
          ) : (
            <p className="text-green-600">
              Valid! Discount: {result.data?.discount}%
            </p>
          )}
        </div>
      )}
    </div>
  );
}
