import { create } from "zustand";
import {
  getSizeCategoriesService,
  createSizeCategoryService,
  updateSizeCategoryService,
  deleteSizeCategoryService,
} from "../services/authServices";

export const useSizeCategoryStore = create((set) => ({
  categories: [],
  loading: false,

  // FETCH
  fetchCategories: async () => {
    set({ loading: true });

    try {
      const res = await getSizeCategoriesService();

      // 🔥 IMPORTANT FIX (same as space category)
      set({
        categories: res.data?.data?.data || [],
        loading: false,
      });
    } catch (err) {
      console.error(err);
      set({ loading: false });
    }
  },

  // CREATE
  createCategory: async (data) => {
    await createSizeCategoryService(data);
  },

  // UPDATE
  updateCategory: async (id, data) => {
    await updateSizeCategoryService(id, data);
  },

  // DELETE
  deleteCategory: async (id) => {
    await deleteSizeCategoryService(id);
  },
}));
