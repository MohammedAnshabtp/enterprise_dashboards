// store/useReviewStore.js

import { create } from "zustand";

import {
  getProductReviewsService,
  createReviewService,
  updateReviewService,
  deleteReviewService,
  getAdminReviewsService,
} from "../services/reviewService";

export const useReviewStore = create((set) => ({
  reviews: [],
  loading: false,

  fetchProductReviews: async (productId) => {
    const res = await getProductReviewsService(productId);

    set({
      reviews: res.data?.data || [],
    });
  },

  fetchAdminReviews: async () => {
    const res = await getAdminReviewsService();

    set({
      reviews: res.data?.data || [],
    });
  },

  createReview: async (productId, data) => {
    try {
      set({ loading: true });

      const res = await createReviewService(productId, data);

      return res.data;
    } catch (err) {
      throw err;
    } finally {
      set({ loading: false });
    }
  },

  updateReview: async (id, data) => {
    await updateReviewService(id, data);
  },

  deleteReview: async (id) => {
    await deleteReviewService(id);
  },
}));
