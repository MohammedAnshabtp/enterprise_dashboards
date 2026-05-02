"use client";

import { useEffect } from "react";
import WishlistCard from "../components/Wishlist-Card";
import { useWishlistStore } from "../store/wishlistStore";
import { CircleChevronLeft } from "lucide-react";
import { useRouter } from "next/navigation";

export default function WishlistPage() {
  const { wishlist, fetchWishlist, removeFromWishlist, clearWishlist } =
    useWishlistStore();

  useEffect(() => {
    fetchWishlist();
  }, []);

  const router = useRouter();

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <div className="max-w-5xl mx-auto bg-white p-6 rounded-xl shadow">
        <div className="flex justify-between mb-4">
          <div className="flex items-center gap-3 px-6 py-4">
            <button
              onClick={() => router.back()}
              className="p-2 rounded-full hover:bg-gray-100 transition text-black"
            >
              <CircleChevronLeft size={26} />
            </button>
            <h1 className="text-2xl font-semibold text-gray-800">
              My Wishlist
            </h1>
          </div>

          {wishlist.length > 0 && (
            <button onClick={clearWishlist} className="text-red-500 text-sm">
              Clear All
            </button>
          )}
        </div>

        {wishlist.length === 0 ? (
          <p className="text-gray-500 text-center py-10">
            No items in wishlist
          </p>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {wishlist.map((item) => (
              <WishlistCard
                key={item._id}
                item={item}
                onRemove={removeFromWishlist}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
