import { create } from "zustand";
import {
  getWishlistService,
  toggleWishlistService,
  removeWishlistService,
  clearWishlistService,
} from "../services/wishlistService";

export const useWishlistStore = create((set) => ({
  wishlist: [],
  loading: false,

  // ✅ FETCH
  fetchWishlist: async () => {
    set({ loading: true });
    try {
      const res = await getWishlistService();

      set({
        wishlist: res.data.data || [],
      });
    } catch (err) {
      console.log("FETCH ERROR:", err.response?.data);
    } finally {
      set({ loading: false });
    }
  },

  // ✅ TOGGLE
  toggleWishlist: async (productId) => {
    try {
      const res = await toggleWishlistService(productId);

      // 🔥 If backend returns updated list
      if (res.data.data) {
        set({ wishlist: res.data.data });
      } else {
        // fallback (optional)
        set((state) => ({
          wishlist: state.wishlist.some((item) => item.productId === productId)
            ? state.wishlist.filter((item) => item.productId !== productId)
            : [...state.wishlist, { productId }],
        }));
      }
    } catch (err) {
      console.log("TOGGLE ERROR:", err.response?.data);
    }
  },

  // ✅ REMOVE
  removeFromWishlist: async (productId) => {
    try {
      await removeWishlistService(productId);

      set((state) => ({
        wishlist: state.wishlist.filter((item) => item.productId !== productId),
      }));
    } catch (err) {
      console.log("REMOVE ERROR:", err.response?.data);
    }
  },

  // ✅ CLEAR
  clearWishlist: async () => {
    try {
      await clearWishlistService();
      set({ wishlist: [] });
    } catch (err) {
      console.log("CLEAR ERROR:", err.response?.data);
    }
  },
}));
