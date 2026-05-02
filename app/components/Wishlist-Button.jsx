"use client";

import { Heart } from "lucide-react";
import { useWishlistStore } from "../store/wishlistStore";
import { useMemo } from "react";

export default function WishlistButton({ productId }) {
  const { wishlist, toggleWishlist } = useWishlistStore();

  // ✅ Robust check for multiple backend shapes
  const isWishlisted = useMemo(() => {
    return wishlist.some((item) => {
      return (
        item.productId === productId ||
        item._id === productId ||
        item.product?._id === productId
      );
    });
  }, [wishlist, productId]);

  const handleClick = async (e) => {
    e.stopPropagation();
    await toggleWishlist(productId);
  };

  return (
    <button
      onClick={handleClick}
      className={`p-2 rounded-full transition-all duration-200 ${
        isWishlisted
          ? "bg-red-500 text-white scale-105"
          : "bg-white text-gray-600 border"
      }`}
    >
      <Heart
        size={16}
        fill={isWishlisted ? "bg-red-500 text-red-500" : "none"}
        className="transition"
      />
    </button>
  );
}
