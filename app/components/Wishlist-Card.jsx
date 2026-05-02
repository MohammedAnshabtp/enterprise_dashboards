/* eslint-disable @next/next/no-img-element */
"use client";

import { Trash2 } from "lucide-react";
import { useWishlistStore } from "../store/wishlistStore";

export default function WishlistCard({ item }) {
  const { removeFromWishlist } = useWishlistStore();

  // 🔥 Handle different backend shapes safely
  const product = item.product || item;

  const handleRemove = async () => {
    await removeFromWishlist(product._id);
  };

  return (
    <div className="border rounded-xl p-3 relative bg-white hover:shadow transition">
      {/* ❌ Remove button */}
      <button
        onClick={handleRemove}
        className="absolute top-2 right-2 text-red-500 hover:scale-110 transition"
      >
        <Trash2 size={16} />
      </button>

      {/* 🖼️ Product Image */}
      <img
        src={
          product?.image || "https://via.placeholder.com/300x200?text=No+Image"
        }
        alt={product?.name}
        className="w-full h-32 object-cover rounded-lg"
        onError={(e) => {
          e.target.src = "https://via.placeholder.com/300x200?text=No+Image";
        }}
      />

      {/* 📦 Product Info */}
      <div className="mt-2 space-y-1">
        <h3 className="text-sm font-medium text-gray-800 line-clamp-2">
          {product?.name || "Unnamed Product"}
        </h3>

        {product?.price && (
          <p className="text-sm font-semibold text-indigo-600">
            ₹{product.price}
          </p>
        )}
      </div>
    </div>
  );
}
